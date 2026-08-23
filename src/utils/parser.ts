import type { ParsedSection, ParsedTable, ParsedTableRow, ParseResult, ParseWarning } from './types'

import { normalizeStockbitLines } from './stockbitText'
import { buildStockData } from './stockData'

type MutableSection = {
  title: string
  metrics: ParsedSection['metrics'] extends readonly (infer Metric)[] ? Metric[] : never
  tables: ParsedTable[]
}

type TableParse = {
  table: ParsedTable
  nextIndex: number
  recognizedLines: number
}

const EXPECTED_SECTION_TITLES = [
  'Current Valuation',
  'Per Share',
  'Solvency',
  'Management Effectiveness',
  'Profitability',
  'Growth',
  'Dividend',
  'Market Rank',
  'Income Statement',
  'Balance Sheet',
  'Cash Flow Statement',
  'Price Performance',
] as const

const SECTION_TITLES = new Set<string>(EXPECTED_SECTION_TITLES)

const FINANCIAL_ROW_LABELS = new Set([
  'Q1',
  'Q2',
  'Q3',
  'Q4',
  'Annualised',
  'TTM (Q1)',
  'TTM (Q2)',
  'TTM (Q3)',
  'TTM (Q4)',
  'TTM',
  'Div (TTM)',
  'Payout Ratio',
  'Payout Rasio',
  'Div Yield',
  'Yield Dividen',
  'Div. Yield',
])

const PERFORMANCE_WINDOWS = new Set(['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '3Y', '5Y', '10Y'])

const NON_VALUE_LINES = new Set(['Period (IDR)', 'Dividend History', 'Period'])

const METRIC_LABELS = [
  'Current PE Ratio (Annualised)',
  'Current PE Ratio (TTM)',
  'Forward PE Ratio',
  'IHSG PE Ratio TTM (Median)',
  'Earnings Yield (TTM)',
  'Current Price to Sales (TTM)',
  'Current Price to Book Value',
  'Current Price To Cashflow (TTM)',
  'Current Price To Free Cashflow (TTM)',
  'EV to EBIT (TTM)',
  'EV to EBITDA (TTM)',
  'PEG Ratio',
  'PEG Ratio (3yr)',
  'PEG (Forward)',
  'Current EPS (TTM)',
  'Current EPS (Annualised)',
  'Revenue Per Share (TTM)',
  'Cash Per Share (Quarter)',
  'Current Book Value Per Share',
  'Free Cashflow Per Share (TTM)',
  'Current Ratio (Quarter)',
  'Quick Ratio (Quarter)',
  'Debt to Equity Ratio (Quarter)',
  'LT Debt/Equity (Quarter)',
  'Total Liabilities/Equity (Quarter)',
  'Total Debt/Total Assets (Quarter)',
  'Financial Leverage (Quarter)',
  'Interest Coverage (TTM)',
  'Free cash flow (Quarter)',
  'Altman Z-Score (Modified)',
  'Return on Assets (TTM)',
  'Return on Equity (TTM)',
  'Return on Capital Employed (TTM)',
  'Return On Invested Capital (TTM)',
  'Days Sales Outstanding (Quarter)',
  'Days Inventory (Quarter)',
  'Days Payables Outstanding (Quarter)',
  'Cash Conversion Cycle (Quarter)',
  'Receivables Turnover (Quarter)',
  'Asset Turnover (TTM)',
  'Inventory Turnover (TTM)',
  'Gross Profit Margin (Quarter)',
  'Operating Profit Margin (Quarter)',
  'Net Profit Margin (Quarter)',
  'Revenue (Quarter YoY Growth)',
  'Gross Profit (Quarter YoY Growth)',
  'Net Income (Quarter YoY Growth)',
  'Dividend (TTM)',
  'Payout Ratio',
  'Dividend Yield',
  'Latest Dividend Ex-Date',
  'Piotroski F-Score',
  'EPS Rating',
  'Relative Strength Rating',
  'Rank (Market Cap)',
  'Rank (Current PE Ratio TTM)',
  'Rank (Earnings Yield)',
  'Rank (P/S)',
  'Rank (P/B)',
  'Rank (Near 52 Weeks High)',
  'Market Cap',
  'Enterprise Value',
  'Current Share Outstanding',
  'Free Float',
  'Revenue (TTM)',
  'Gross Profit (TTM)',
  'EBITDA (TTM)',
  'Net Income (TTM)',
  'Cash (Quarter)',
  'Total Assets (Quarter)',
  'Total Liabilities (Quarter)',
  'Working Capital (Quarter)',
  'Common Equity',
  'Long-term Debt (Quarter)',
  'Short-term Debt (Quarter)',
  'Total Debt (Quarter)',
  'Net Debt (Quarter)',
  'Total Equity',
  'Cash From Operations (TTM)',
  'Cash From Investing (TTM)',
  'Cash From Financing (TTM)',
  'Capital expenditure (TTM)',
  'Free cash flow (TTM)',
  'Dividend',
]

const METRIC_LABEL_SET = new Set(METRIC_LABELS)

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const DENSE_BOUNDARY_PATTERN = new RegExp(
  [
    ...SECTION_TITLES,
    ...METRIC_LABELS,
    ...FINANCIAL_ROW_LABELS,
    ...PERFORMANCE_WINDOWS,
    ...NON_VALUE_LINES,
  ]
    .sort((left, right) => right.length - left.length)
    .map(escapeRegExp)
    .join('|'),
  'g'
)

const expandDenseText = (rawText: string): string =>
  rawText
    .replace(DENSE_BOUNDARY_PATTERN, (match) => `\n${match}\n`)
    .replace(/(\d{4})(?=\d{4})/g, '$1\n')
    .replace(/(?<=\s[BMK])(?=[(+-]?\d)/g, '\n')

const cleanLines = (rawText: string): string[] => normalizeStockbitLines(expandDenseText(rawText))

const isValueLine = (line: string): boolean =>
  !NON_VALUE_LINES.has(line) &&
  !METRIC_LABEL_SET.has(line) &&
  !FINANCIAL_ROW_LABELS.has(line) &&
  (line === '-' || /^(?:N\/A|NA)$/i.test(line) || /\d|%|\(|\)/.test(line))

const isUnknownLabelCandidate = (line: string, nextLine: string | undefined): boolean =>
  Boolean(nextLine) &&
  !SECTION_TITLES.has(line) &&
  !METRIC_LABEL_SET.has(line) &&
  !NON_VALUE_LINES.has(line) &&
  !FINANCIAL_ROW_LABELS.has(line) &&
  !PERFORMANCE_WINDOWS.has(line) &&
  line !== 'Dividend History' &&
  isValueLine(nextLine ?? '')

const finishSection = (sections: ParsedSection[], current: MutableSection | null): void => {
  if (current && (current.metrics.length > 0 || current.tables.length > 0)) {
    sections.push(current)
  }
}

const parseFinancialTable = (lines: readonly string[], startIndex: number): TableParse | null => {
  const years: string[] = []
  let cursor = startIndex + 1

  while (cursor < lines.length && /^\d{4}$/.test(lines[cursor])) {
    years.push(lines[cursor])
    cursor += 1
  }

  if (years.length === 0) {
    return null
  }

  const rows: ParsedTableRow[] = []
  while (cursor < lines.length && FINANCIAL_ROW_LABELS.has(lines[cursor])) {
    const label = lines[cursor]
    const values = lines.slice(cursor + 1, cursor + 1 + years.length)
    if (values.length < years.length) {
      break
    }

    rows.push({ label, values })
    cursor += years.length + 1
  }

  if (rows.length === 0) {
    return null
  }

  return {
    table: {
      title: 'Net Income / EPS / Revenue',
      headers: ['Period', ...years],
      rows,
    },
    nextIndex: cursor,
    recognizedLines:
      years.length + rows.reduce((count, row) => count + row.values.length + 1, 0) + 1,
  }
}

const parsePerformanceTable = (lines: readonly string[], startIndex: number): TableParse | null => {
  const rows: ParsedTableRow[] = []
  let cursor = startIndex

  while (cursor < lines.length && PERFORMANCE_WINDOWS.has(lines[cursor])) {
    const values = lines.slice(cursor + 1, cursor + 4)
    if (values.length < 3) {
      break
    }

    rows.push({ label: lines[cursor], values })
    cursor += 4
  }

  if (rows.length === 0) {
    return null
  }

  return {
    table: {
      title: 'Price windows',
      headers: ['Window', 'Change', 'Low', 'High'],
      rows,
    },
    nextIndex: cursor,
    recognizedLines: rows.reduce((count, row) => count + row.values.length + 1, 0),
  }
}

const parseDividendTable = (lines: readonly string[], startIndex: number): TableParse | null => {
  const headers = lines.slice(startIndex + 1, startIndex + 5)
  if (headers.length < 4) return null

  const rows: ParsedTableRow[] = []
  let cursor = startIndex + 5

  while (cursor < lines.length) {
    const label = lines[cursor]
    if (SECTION_TITLES.has(label) || label === 'Period' || label === 'Period (IDR)') {
      break
    }

    const values = lines.slice(cursor + 1, cursor + 4)
    if (values.length < 3) {
      break
    }

    rows.push({ label, values })
    cursor += 4
  }

  if (rows.length === 0) return null

  return {
    table: {
      title: 'Dividend History',
      headers,
      rows,
    },
    nextIndex: cursor,
    recognizedLines: cursor - startIndex,
  }
}

export const parseStockText = (rawText: string): ParseResult => {
  const lines = cleanLines(rawText)
  const sections: ParsedSection[] = []
  const seenSectionTitles: string[] = []
  const warnings: ParseWarning[] = []
  const unknownLabels = new Map<string, string>()
  const missingFields: string[] = []
  let current: MutableSection | null = null
  let recognizedLines = 0
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (SECTION_TITLES.has(line)) {
      finishSection(sections, current)
      current = { title: line, metrics: [], tables: [] }
      if (!seenSectionTitles.includes(line)) {
        seenSectionTitles.push(line)
      }
      recognizedLines += 1
      index += 1
      continue
    }

    const nextLine = lines[index + 1]
    if (!current) {
      if (isUnknownLabelCandidate(line, nextLine)) {
        unknownLabels.set(line, `Input, baris ${index + 1}: "${line}" → "${nextLine ?? ''}"`)
        index += 2
        continue
      }

      index += 1
      continue
    }

    const tableParser =
      current.title === 'Price Performance'
        ? parsePerformanceTable(lines, index)
        : line === 'Period (IDR)' || line === 'Period'
          ? parseFinancialTable(lines, index)
          : current.title === 'Dividend' && line === 'Dividend History'
            ? parseDividendTable(lines, index)
            : null

    if (tableParser) {
      current.tables.push(tableParser.table)
      recognizedLines += tableParser.recognizedLines
      index = tableParser.nextIndex
      if (current.title === 'Price Performance') {
        finishSection(sections, current)
        current = null
      }
      continue
    }

    if (METRIC_LABEL_SET.has(line)) {
      if (nextLine && !SECTION_TITLES.has(nextLine) && isValueLine(nextLine)) {
        current.metrics.push({ label: line, value: nextLine })
        recognizedLines += 2
        index += 2
        continue
      }

      missingFields.push(`${current.title}: ${line} (baris ${index + 1})`)
      index += 1
      continue
    }

    if (isUnknownLabelCandidate(line, nextLine)) {
      const evidence = `Bagian ${current.title}, baris ${index + 1}: "${line}" → "${nextLine}"`
      unknownLabels.set(line, evidence)
      index += 2
      continue
    }

    index += 1
  }

  finishSection(sections, current)
  const stockData = buildStockData(rawText, sections)
  const metadataRecognizedLines = [
    stockData.stock_identity.ticker,
    stockData.stock_identity.company_name,
    stockData.market_quote.snapshots.length > 0 ? 'quote' : null,
  ].filter(Boolean).length

  if (lines.length === 0) {
    warnings.push({
      type: 'empty-input',
      message: 'Input kosong: belum ada data snapshot yang dapat dibaca.',
      evidence: '0 baris setelah normalisasi input.',
    })
  }

  if (missingFields.length > 0) {
    warnings.push({
      type: 'missing-field',
      message: `${missingFields.length} field memiliki label yang dikenali tetapi nilainya belum lengkap.`,
      evidence: missingFields.join('; '),
    })
  }

  for (const [label, evidence] of unknownLabels) {
    warnings.push({
      type: 'unknown-label',
      message: `Label "${label}" tidak dikenali sehingga tidak dimasukkan ke hasil terstruktur.`,
      evidence,
    })
  }

  const missingSections = EXPECTED_SECTION_TITLES.filter(
    (title) => !seenSectionTitles.includes(title)
  )
  if (lines.length > 0 && missingSections.length > 0) {
    warnings.push({
      type: 'missing-section',
      message: `${missingSections.length} bagian snapshot belum ditemukan.`,
      evidence: `Belum ditemukan: ${missingSections.join(', ')}. Ditemukan: ${
        seenSectionTitles.length > 0 ? seenSectionTitles.join(', ') : 'tidak ada'
      }.`,
    })
  }

  return {
    sections,
    rawLines: lines.length,
    recognizedLines: recognizedLines + metadataRecognizedLines,
    warnings,
    isPartial: warnings.length > 0,
    stockData,
  }
}
