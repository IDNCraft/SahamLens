import type {
  CorporateActionRecord,
  DividendHistoryRecord,
  ManagementRecord,
  MarketQuoteSnapshot,
  NumberMap,
  ParsedSection,
  ParsedTable,
  PricePerformancePeriod,
  ShareholderCompositionRecord,
  StockData,
  SubsidiaryRecord,
} from './types'

import { normalizeStockbitLines } from './stockbitText'

const PRICE_PERIODS = ['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '3Y', '5Y', '10Y'] as const
const AVAILABLE_TABS = [
  'Stream',
  'Key Stats',
  'Analysis',
  'Financials',
  'Fundachart',
  'Seasonality',
  'Chartbit',
  'Comparison',
  'Corp. Action',
  'Insider',
  'Profile',
  'EPS Estimate',
] as const
const DATA_SCOPES = ['1D', '1W', '1M', '3M', 'YTD', '1Y', '3Y', '5Y'] as const
const AMOUNT_UNIT_LABEL = 'miliar'
const VOLUME_UNIT_LABEL = 'juta'

const toNullableNumber = (value: string | null | undefined): number | null => {
  if (!value || value === '-' || value.toUpperCase() === 'N/A') return null
  const isAccountingNegative = /^\(.*\)$/.test(value.trim())
  const numericValue = Number(value.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/)?.[0])
  if (!Number.isFinite(numericValue)) return null
  return isAccountingNegative ? -Math.abs(numericValue) : numericValue
}

const toAmountInMiliar = (value: string | null | undefined): number | null => {
  const numericValue = toNullableNumber(value)
  if (numericValue === null || !value) return numericValue
  const unit = value.trim().slice(-1).toUpperCase()
  if (unit === 'M') return numericValue / 1000
  if (unit === 'K') return numericValue / 1_000_000
  return numericValue
}

const toNullableText = (value: string | null | undefined): string | null => {
  if (!value || value === '-' || value.toUpperCase() === 'N/A') return null
  return value.trim()
}

const metricLookup = (sections: readonly ParsedSection[]): Map<string, string> => {
  const lookup = new Map<string, string>()
  sections.forEach((section) =>
    section.metrics.forEach((metric) => lookup.set(metric.label, metric.value))
  )
  return lookup
}

const metricValue = (metrics: ReadonlyMap<string, string>, label: string): number | null =>
  toNullableNumber(metrics.get(label))

const findTable = (sections: readonly ParsedSection[], title: string): ParsedTable | null =>
  sections.flatMap((section) => section.tables).find((table) => table.title === title) ?? null

const mapTableRow = (table: ParsedTable | null, label: string): NumberMap => {
  const row = table?.rows.find((item) => item.label === label)
  const result: NumberMap = {}
  table?.headers.slice(1).forEach((header, index) => {
    result[header] = toNullableNumber(row?.values[index])
  })
  return result
}

const matchText = (rawText: string, pattern: RegExp): string | null =>
  rawText.match(pattern)?.[1]?.trim() ?? null

const parseIdentity = (rawText: string): StockData['stock_identity'] => {
  const lines = normalizeStockbitLines(rawText)
  const denseCompanyMatch = rawText.match(
    /(?:START\s*TRADING|TRADING)\s*([A-Z]{2,6}?)(?:TL|HSC)?\s*(?:[A-Z]{2,6}\s+)?([A-Z][a-z]+(?:\s+[A-Z][A-Za-z.&'-]*)*\s+Tbk\.)/
  )
  const compactCompanyMatch = rawText.match(
    /([A-Z]{2,6})([A-Z][a-z]+(?:\s+[A-Z][A-Za-z.&'-]*)*\s+Tbk\.)/
  )
  const companyIndex = lines.findIndex((line) => / Tbk\.?$/i.test(line))
  const companyName =
    companyIndex >= 0
      ? lines[companyIndex]
      : (denseCompanyMatch?.[2] ?? compactCompanyMatch?.[2] ?? null)
  const identityTail = companyIndex >= 0 ? lines.slice(companyIndex + 1, companyIndex + 6) : []
  const tickerFromLines =
    companyIndex >= 0
      ? (lines
          .slice(Math.max(0, companyIndex - 8), companyIndex)
          .reverse()
          .find((line) => /^[A-Z]{2,6}$/.test(line) && !['TL', 'HSC'].includes(line)) ?? null)
      : null
  const companyStart = companyName ? rawText.indexOf(companyName) : -1
  const denseTickerMatch =
    companyStart >= 0
      ? rawText.slice(0, companyStart).match(/(?:START\s*TRADING|TRADING)([A-Z]{2,6})(?:TL|HSC)?$/i)
      : null
  const ticker =
    tickerFromLines ??
    denseCompanyMatch?.[1]?.toUpperCase() ??
    compactCompanyMatch?.[1]?.toUpperCase() ??
    denseTickerMatch?.[1]?.toUpperCase() ??
    null
  const companyEnd = companyStart >= 0 && companyName ? companyStart + companyName.length : -1
  const denseIdentityTail = companyEnd > 0 ? rawText.slice(companyEnd) : ''
  const sectorEnd = denseIdentityTail.search(/(?:Syariah|Konvensional|Papan\s)/i)
  const denseSector =
    sectorEnd > 0 ? denseIdentityTail.slice(0, sectorEnd).replace(/&amp;/g, '&').trim() : null
  const denseTradingStatus =
    denseIdentityTail.match(/(TRADING|SUSPEND|HALT|CLOSED)(?=LIMIT|IDX|VESTA|\b)/i)?.[1] ?? null
  const denseTradingLimit =
    denseIdentityTail.match(/(NO LIMIT|LIMIT)(?=IDX|VESTA|\b)/i)?.[1] ?? null
  const followersLine = lines.find((line) => /followers/i.test(line))
  const followers =
    rawText.match(/([\d,.]+)\s*followers/i)?.[1] ?? followersLine?.match(/[\d,.]+/)?.[0]

  return {
    ticker,
    company_name: companyName,
    sector: identityTail[0] ?? denseSector,
    sharia_status:
      identityTail[1] ?? denseIdentityTail.match(/(Syariah|Konvensional)/i)?.[1] ?? null,
    listing_board:
      identityTail[2] ??
      denseIdentityTail.match(/(Papan\s+(?:Utama|Pengembangan|Ekonomi Baru))/i)?.[1] ??
      null,
    exchange: lines.find((line) => line === 'IDX') ?? (rawText.includes('IDX') ? 'IDX' : null),
    trading_status: identityTail[3] ?? denseTradingStatus,
    trading_limit_status: identityTail[4] ?? denseTradingLimit,
    followers: toNullableNumber(followers),
  }
}

const parseQuoteSnapshots = (rawText: string): readonly MarketQuoteSnapshot[] => {
  const pattern =
    /(\d{1,3}(?:,\d{3})*)\s*([+-]?[\d,.]+)\s*\(([+-]?[\d,.]+)%\)\s*(Today)\s*([A-Za-z]{2,8})\s*(\d{1,2}:\d{2})\s*(WIB)\s*([\d,.]+)\s*(M\s*)?Volume\s*([\d,.]+)\s*(M\s*)?Avg\s*volume/gi
  const snapshots: MarketQuoteSnapshot[] = []
  const normalizedText = normalizeStockbitLines(rawText).join('\n')
  for (const match of normalizedText.matchAll(pattern)) {
    snapshots.push({
      price: toNullableNumber(match[1]),
      price_change: toNullableNumber(match[2]),
      price_change_percent: toNullableNumber(match[3]),
      session: match[4] ?? null,
      date: match[5] ?? null,
      time: match[6] ?? null,
      timezone: match[7] ?? null,
      volume: toNullableNumber(match[8]),
      volume_unit: match[9] ? VOLUME_UNIT_LABEL : 'saham',
      average_volume: toNullableNumber(match[10]),
      average_volume_unit: match[11] ? VOLUME_UNIT_LABEL : 'saham',
    })
  }
  return snapshots
}

const parsePricePerformance = (
  table: ParsedTable | null
): Record<string, PricePerformancePeriod> => {
  const periods: Record<string, PricePerformancePeriod> = {}
  PRICE_PERIODS.forEach((period) => {
    const row = table?.rows.find((item) => item.label === period)
    periods[period] = {
      return_percent: toNullableNumber(row?.values[0]),
      low: toNullableNumber(row?.values[1]),
      high: toNullableNumber(row?.values[2]),
    }
  })
  return periods
}

const parseDividendHistory = (table: ParsedTable | null): readonly DividendHistoryRecord[] =>
  table?.rows.map((row) => ({
    period: toNullableText(row.label),
    dividend: toNullableNumber(row.values[0]),
    ex_date: toNullableText(row.values[1]),
    pay_date: toNullableText(row.values[2]),
  })) ?? []

const parseCorporateActions = (rawText: string): readonly CorporateActionRecord[] => {
  const pattern =
    /(\d{1,2}\s+[A-Za-z]{3}\s+\d{2})([A-Z][A-Z .&'-]*?)([+-]?[\d,.]+%)([\d,]+)([+-]?[\d,.]+%)([\d,]+)([+-]?[\d,.]+%)([\d,]+)(-|[\d,]+)([A-Z]+)(BUY|SELL)([A-Z]+)/g
  const records: CorporateActionRecord[] = []
  for (const match of rawText.matchAll(pattern)) {
    records.push({
      date: match[1] ?? null,
      name: match[2] ?? null,
      change_percent: toNullableNumber(match[3]),
      change_shares: toNullableNumber(match[4]),
      previous_percentage: toNullableNumber(match[5]),
      previous_shares: toNullableNumber(match[6]),
      current_percentage: toNullableNumber(match[7]),
      current_shares: toNullableNumber(match[8]),
      price: toNullableNumber(match[9]),
      broker: toNullableText(match[10]),
      action_type: toNullableText(match[11]),
      action_source: toNullableText(match[12]),
    })
  }
  return records
}

const parseCompanyProfile = (
  rawText: string,
  identity: StockData['stock_identity']
): StockData['company_profile'] => {
  const profileStart = rawText.indexOf('Company Background')
  const profileText =
    profileStart >= 0 ? rawText.slice(profileStart + 'Company Background'.length) : ''
  const profileEndings = [identity.sector, identity.sharia_status, 'Shareholder', 'Company History']
    .filter((marker): marker is string => Boolean(marker))
    .map((marker) => profileText.indexOf(marker))
    .filter((index) => index >= 0)
  const background =
    profileText && profileEndings.length > 0
      ? profileText.slice(0, Math.min(...profileEndings)).trim()
      : profileText || null
  const activityText = matchText(
    background ?? '',
    /kegiatan usaha utama di bidang ([\s\S]*?)(?: di Indonesia|$)/i
  )
  const activities = activityText
    ? activityText
        .replace(/\s+serta\s+/i, ', ')
        .split(/,\s*/)
        .map((activity) => activity.trim())
        .filter(Boolean)
    : []
  const indices = ['IDX', 'ENERGY', 'ISSI', 'MBX', 'IHSG'].filter((index) =>
    rawText.includes(index)
  )

  return {
    background,
    business_activities: activities,
    sector: identity.sector,
    sub_sector: null,
    sharia_status: identity.sharia_status,
    listing_board: identity.listing_board,
    indices,
    updated_at: matchText(rawText, /Updated\s*:?[ ]?(\d{1,2}\s+[A-Za-z]{3}\s+\d{2,4})/i),
  }
}

const parseShareholderComposition = (
  rawText: string
): StockData['ownership']['shareholder_composition'] => {
  const startIndex = rawText.indexOf('Shareholder Composition')
  const compositionText = startIndex >= 0 ? rawText.slice(startIndex) : ''
  const totalSharesMatch = compositionText.match(/Total Shares\s*([\d,.]+)B/)
  const holdersText = totalSharesMatch
    ? compositionText.slice((totalSharesMatch.index ?? 0) + totalSharesMatch[0].length)
    : ''
  const holderPattern = /([A-Za-z][A-Za-z .&/'-]*?)([\d,.]+)([BMK])([\d,.]+)%/g
  const holders: ShareholderCompositionRecord[] = []
  for (const match of holdersText.matchAll(holderPattern)) {
    holders.push({
      category: toNullableText(match[1]),
      shares: toAmountInMiliar(`${match[2]}${match[3]}`),
      percentage: toNullableNumber(match[4]),
      is_controller: null,
    })
  }

  return {
    period: matchText(compositionText, /Shareholder Composition\s*([A-Z][a-z]{2}\s+\d{4})/),
    total_shares: toNullableNumber(totalSharesMatch?.[1]),
    share_unit: AMOUNT_UNIT_LABEL,
    holders,
  }
}

const parseManagementBlock = (block: string): readonly ManagementRecord[] => {
  const pattern =
    /(President Director|Vice President Director|Director|President Commissioner|Independent Commissioner|Commissioner)([A-Z][A-Z .,-]*?)(?=President Director|Vice President Director|Director|President Commissioner|Independent Commissioner|Commissioner|$)/g
  const records: ManagementRecord[] = []
  for (const match of block.matchAll(pattern)) {
    records.push({ title: match[1]?.trim() ?? null, name: match[2]?.trim() ?? null })
  }
  return records
}

const parseCompanyHistory = (
  rawText: string,
  metrics: ReadonlyMap<string, string>
): StockData['company_history'] => ({
  listing_date: matchText(rawText, /Listing Date(\d{1,2}\s+[A-Z][a-z]{2}\s+\d{4})/),
  ipo_price: toNullableNumber(matchText(rawText, /IPO Price([\d,.]+)/)),
  ipo_amount_idr_billion: toNullableNumber(matchText(rawText, /IPO Amount([\d,.]+)B/)),
  ipo_shares: toNullableNumber(matchText(rawText, /IPO Shares([\d,]+)/)),
  free_float_percent:
    metricValue(metrics, 'Free Float') ??
    toNullableNumber(matchText(rawText, /Free Float([\d,.]+)%/)),
  underwriters:
    extractBetween(rawText, 'Underwriters', 'Administration Bureau')
      .match(/(?:PT\.?\s+)?[A-Z][A-Za-z .&'-]+?(?=(?:PT\.?\s+)|$)/g)
      ?.map((name) => name.trim())
      .filter(Boolean) ?? [],
  administration_bureau: matchText(
    rawText,
    /Administration Bureau([\s\S]*?)(?=Listing Board|Number of Shareholders)/
  ),
  listing_board: matchText(rawText, /Listing Board([\s\S]*?)(?=Number of Shareholders)/),
})

const parseContact = (rawText: string): StockData['contact'] => ({
  address: matchText(rawText, /Address(.*?)(?=Phone:)/),
  phone: matchText(rawText, /Phone:[ ]?([\d-]+)/),
  fax: matchText(rawText, /Fax:[ ]?([\d-]+)/),
  tax_id: matchText(rawText, /NPWP:[ ]?([\d.-]+)/),
  email: matchText(rawText, /Email:[ ]?([^\s]+)/),
  website: matchText(rawText, /Website:[ ]?([^\s]+)/),
})

const extractBetween = (rawText: string, start: string, end: string): string => {
  const startIndex = rawText.indexOf(start)
  if (startIndex < 0) return ''
  const contentStart = startIndex + start.length
  const endIndex = rawText.indexOf(end, contentStart)
  return rawText.slice(contentStart, endIndex >= 0 ? endIndex : undefined)
}

const parseOwnership = (rawText: string): StockData['ownership'] => {
  const holdingUpdatedAt = matchText(rawText, /Last Updated:\s*([\d]{1,2}\s+[A-Za-z]{3}\s+\d{2})/)
  const holdingCompositionText = extractBetween(rawText, 'Holding Composition', 'Company History')
  const dataPoints = ['Jul 25', 'Okt 25', 'Jan 26', 'Apr 26', 'Jul 26'].filter((point) =>
    holdingCompositionText.includes(point)
  )

  return {
    updated_at: matchText(rawText, /Updated\s+(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})/),
    shareholders: [],
    shareholder_composition: parseShareholderComposition(rawText),
    holding_composition: {
      period: null,
      local_percent: null,
      foreign_percent: null,
      data_points: dataPoints.length > 0 ? dataPoints : holdingUpdatedAt ? [holdingUpdatedAt] : [],
    },
    ultimate_beneficial_owner: matchText(
      rawText,
      /Ultimate Beneficiary Owner([A-Z .]+)(?=Company History)/
    ),
  }
}

const parseSubsidiaries = (
  rawText: string
): { updated_at: string | null; companies: readonly SubsidiaryRecord[] } => ({
  updated_at: matchText(rawText, /Subsidiary CompaniesUpdated\s*([^C]+?)(?=CompanyBusiness)/),
  companies: [],
})

export const buildStockData = (rawText: string, sections: readonly ParsedSection[]): StockData => {
  const metrics = metricLookup(sections)
  const historicalTable = findTable(sections, 'Net Income / EPS / Revenue')
  const performanceTable = findTable(sections, 'Price windows')
  const identity = parseIdentity(rawText)
  const quoteSnapshots = parseQuoteSnapshots(rawText)
  const directorsBlock = extractBetween(rawText, 'Board of Directors', 'Board of Commissioners')
  const commissionersBlock = extractBetween(rawText, 'Board of Commissioners', 'Address')
  const historicalYears =
    historicalTable?.headers.slice(1).map(Number).filter(Number.isFinite) ?? []

  return {
    metadata: {
      currency: 'IDR',
      amount_unit: AMOUNT_UNIT_LABEL,
      percentage_unit: 'percent',
      null_represents: '-',
    },
    stock_identity: identity,
    market_quote: {
      currency: 'IDR',
      snapshots: quoteSnapshots,
    },
    platform_data: {
      selected_tab: rawText.includes('Key Stats') ? 'Key Stats' : null,
      available_tabs: AVAILABLE_TABS.filter((tab) => rawText.includes(tab)),
      eps_estimate: {},
      data_scopes: DATA_SCOPES.filter((scope) => rawText.includes(scope)),
    },
    current_valuation: {
      current_pe_ratio_annualised: metricValue(metrics, 'Current PE Ratio (Annualised)'),
      current_pe_ratio_ttm: metricValue(metrics, 'Current PE Ratio (TTM)'),
      forward_pe_ratio: metricValue(metrics, 'Forward PE Ratio'),
      ihsg_pe_ratio_ttm_median: metricValue(metrics, 'IHSG PE Ratio TTM (Median)'),
      earnings_yield_ttm_percent: metricValue(metrics, 'Earnings Yield (TTM)'),
      current_price_to_sales_ttm: metricValue(metrics, 'Current Price to Sales (TTM)'),
      current_price_to_book_value: metricValue(metrics, 'Current Price to Book Value'),
      current_price_to_cashflow_ttm: metricValue(metrics, 'Current Price To Cashflow (TTM)'),
      current_price_to_free_cashflow_ttm: metricValue(
        metrics,
        'Current Price To Free Cashflow (TTM)'
      ),
      ev_to_ebit_ttm: metricValue(metrics, 'EV to EBIT (TTM)'),
      ev_to_ebitda_ttm: metricValue(metrics, 'EV to EBITDA (TTM)'),
      peg_ratio: metricValue(metrics, 'PEG Ratio'),
      peg_ratio_3yr: metricValue(metrics, 'PEG Ratio (3yr)'),
      peg_forward: metricValue(metrics, 'PEG (Forward)'),
    },
    per_share: {
      current_eps_ttm: metricValue(metrics, 'Current EPS (TTM)'),
      current_eps_annualised: metricValue(metrics, 'Current EPS (Annualised)'),
      revenue_per_share_ttm: metricValue(metrics, 'Revenue Per Share (TTM)'),
      cash_per_share_quarter: metricValue(metrics, 'Cash Per Share (Quarter)'),
      current_book_value_per_share: metricValue(metrics, 'Current Book Value Per Share'),
      free_cashflow_per_share_ttm: metricValue(metrics, 'Free Cashflow Per Share (TTM)'),
    },
    solvency: {
      current_ratio_quarter: metricValue(metrics, 'Current Ratio (Quarter)'),
      quick_ratio_quarter: metricValue(metrics, 'Quick Ratio (Quarter)'),
      debt_to_equity_ratio_quarter: metricValue(metrics, 'Debt to Equity Ratio (Quarter)'),
      long_term_debt_to_equity_quarter: metricValue(metrics, 'LT Debt/Equity (Quarter)'),
      total_liabilities_to_equity_quarter: metricValue(
        metrics,
        'Total Liabilities/Equity (Quarter)'
      ),
      total_debt_to_total_assets_quarter: metricValue(metrics, 'Total Debt/Total Assets (Quarter)'),
      financial_leverage_quarter: metricValue(metrics, 'Financial Leverage (Quarter)'),
      interest_coverage_ttm: metricValue(metrics, 'Interest Coverage (TTM)'),
      free_cashflow_quarter_idr_billion: metricValue(metrics, 'Free cash flow (Quarter)'),
      altman_z_score_modified: metricValue(metrics, 'Altman Z-Score (Modified)'),
    },
    management_effectiveness: {
      return_on_assets_ttm_percent: metricValue(metrics, 'Return on Assets (TTM)'),
      return_on_equity_ttm_percent: metricValue(metrics, 'Return on Equity (TTM)'),
      return_on_capital_employed_ttm_percent: metricValue(
        metrics,
        'Return on Capital Employed (TTM)'
      ),
      return_on_invested_capital_ttm_percent: metricValue(
        metrics,
        'Return On Invested Capital (TTM)'
      ),
      days_sales_outstanding_quarter: metricValue(metrics, 'Days Sales Outstanding (Quarter)'),
      days_inventory_quarter: metricValue(metrics, 'Days Inventory (Quarter)'),
      days_payables_outstanding_quarter: metricValue(
        metrics,
        'Days Payables Outstanding (Quarter)'
      ),
      cash_conversion_cycle_quarter: metricValue(metrics, 'Cash Conversion Cycle (Quarter)'),
      receivables_turnover_quarter: metricValue(metrics, 'Receivables Turnover (Quarter)'),
      asset_turnover_ttm: metricValue(metrics, 'Asset Turnover (TTM)'),
      inventory_turnover_ttm: metricValue(metrics, 'Inventory Turnover (TTM)'),
    },
    historical_net_income: {
      unit: `IDR ${AMOUNT_UNIT_LABEL}`,
      years: historicalYears,
      quarterly: {
        q1: mapTableRow(historicalTable, 'Q1'),
        q2: mapTableRow(historicalTable, 'Q2'),
        q3: mapTableRow(historicalTable, 'Q3'),
        q4: mapTableRow(historicalTable, 'Q4'),
      },
      annualised: mapTableRow(historicalTable, 'Annualised'),
      ttm_q1: mapTableRow(historicalTable, 'TTM (Q1)'),
      dividend_ttm: mapTableRow(historicalTable, 'Div (TTM)'),
      payout_ratio: mapTableRow(historicalTable, 'Payout Ratio'),
      dividend_yield: mapTableRow(historicalTable, 'Div Yield'),
    },
    market_data: {
      market_cap_idr_billion: metricValue(metrics, 'Market Cap'),
      enterprise_value_idr_billion: metricValue(metrics, 'Enterprise Value'),
      current_share_outstanding_billion: metricValue(metrics, 'Current Share Outstanding'),
      free_float_percent: metricValue(metrics, 'Free Float'),
    },
    profitability: {
      gross_profit_margin_quarter_percent: metricValue(metrics, 'Gross Profit Margin (Quarter)'),
      operating_profit_margin_quarter_percent: metricValue(
        metrics,
        'Operating Profit Margin (Quarter)'
      ),
      net_profit_margin_quarter_percent: metricValue(metrics, 'Net Profit Margin (Quarter)'),
    },
    growth: {
      revenue_quarter_yoy_growth_percent: metricValue(metrics, 'Revenue (Quarter YoY Growth)'),
      gross_profit_quarter_yoy_growth_percent: metricValue(
        metrics,
        'Gross Profit (Quarter YoY Growth)'
      ),
      net_income_quarter_yoy_growth_percent: metricValue(
        metrics,
        'Net Income (Quarter YoY Growth)'
      ),
    },
    dividend: {
      dividend: metricValue(metrics, 'Dividend'),
      dividend_ttm: metricValue(metrics, 'Dividend (TTM)'),
      payout_ratio: metricValue(metrics, 'Payout Ratio'),
      dividend_yield: metricValue(metrics, 'Dividend Yield'),
      latest_dividend_ex_date: toNullableText(metrics.get('Latest Dividend Ex-Date')),
      dividend_history: parseDividendHistory(findTable(sections, 'Dividend History')),
    },
    market_rank: {
      piotroski_f_score: metricValue(metrics, 'Piotroski F-Score'),
      eps_rating: metricValue(metrics, 'EPS Rating'),
      relative_strength_rating_percent: metricValue(metrics, 'Relative Strength Rating'),
      rank_market_cap_percent: metricValue(metrics, 'Rank (Market Cap)'),
      rank_current_pe_ratio_ttm_percent: metricValue(metrics, 'Rank (Current PE Ratio TTM)'),
      rank_earnings_yield_percent: metricValue(metrics, 'Rank (Earnings Yield)'),
      rank_price_to_sales_percent: metricValue(metrics, 'Rank (P/S)'),
      rank_price_to_book_percent: metricValue(metrics, 'Rank (P/B)'),
      rank_near_52_weeks_high_percent: metricValue(metrics, 'Rank (Near 52 Weeks High)'),
    },
    income_statement: {
      revenue_ttm_idr_billion: metricValue(metrics, 'Revenue (TTM)'),
      gross_profit_ttm_idr_billion: metricValue(metrics, 'Gross Profit (TTM)'),
      ebitda_ttm_idr_billion: metricValue(metrics, 'EBITDA (TTM)'),
      net_income_ttm_idr_billion: metricValue(metrics, 'Net Income (TTM)'),
    },
    balance_sheet: {
      cash_quarter_idr_billion: metricValue(metrics, 'Cash (Quarter)'),
      total_assets_quarter_idr_billion: metricValue(metrics, 'Total Assets (Quarter)'),
      total_liabilities_quarter_idr_billion: metricValue(metrics, 'Total Liabilities (Quarter)'),
      working_capital_quarter_idr_billion: metricValue(metrics, 'Working Capital (Quarter)'),
      common_equity_idr_billion: metricValue(metrics, 'Common Equity'),
      long_term_debt_quarter_idr_billion: metricValue(metrics, 'Long-term Debt (Quarter)'),
      short_term_debt_quarter_idr_billion: metricValue(metrics, 'Short-term Debt (Quarter)'),
      total_debt_quarter_idr_billion: metricValue(metrics, 'Total Debt (Quarter)'),
      net_debt_quarter_idr_billion: metricValue(metrics, 'Net Debt (Quarter)'),
      total_equity_idr_billion: metricValue(metrics, 'Total Equity'),
    },
    cash_flow_statement: {
      cash_from_operations_ttm_idr_billion: metricValue(metrics, 'Cash From Operations (TTM)'),
      cash_from_investing_ttm_idr_billion: metricValue(metrics, 'Cash From Investing (TTM)'),
      cash_from_financing_ttm_idr_billion: metricValue(metrics, 'Cash From Financing (TTM)'),
      capital_expenditure_ttm_idr_billion: metricValue(metrics, 'Capital expenditure (TTM)'),
      free_cashflow_ttm_idr_billion: metricValue(metrics, 'Free cash flow (TTM)'),
    },
    price_performance: {
      currency: 'IDR',
      periods: parsePricePerformance(performanceTable),
    },
    corporate_actions: {
      scope: rawText.includes('All Action') ? 'All Action' : null,
      source: rawText.includes('KSEI') ? 'KSEI' : null,
      records: parseCorporateActions(rawText),
    },
    company_profile: parseCompanyProfile(rawText, identity),
    ownership: parseOwnership(rawText),
    company_history: parseCompanyHistory(rawText, metrics),
    management: {
      directors: parseManagementBlock(directorsBlock),
      commissioners: parseManagementBlock(commissionersBlock),
    },
    contact: parseContact(rawText),
    subsidiaries: parseSubsidiaries(rawText),
  }
}
