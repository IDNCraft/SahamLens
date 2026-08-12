import type { ParsedSection, ParsedTable, StockData } from '../../utils/types'
import { Info, Table2 } from 'lucide-react'

import {
  formatDisplayValue,
  getMetricContextHint,
  getMetricTooltipContent,
  translateMetricLabel,
  translateSectionLabel,
  translateTableLabel,
} from '../../utils/labelTranslator'

const slugify = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, '-')

const valueTone = (value: string): string => {
  if (value === '-') return 'metric-value metric-placeholder'
  if (/^\(\s*\+|^\+/.test(value)) return 'metric-value metric-positive'
  if (/^\(|^-|^\(-/.test(value)) return 'metric-value metric-negative'
  return 'metric-value'
}

const parseVal = (valueStr: string): number | null => {
  if (!valueStr || valueStr === '-' || valueStr.toUpperCase() === 'N/A') return null
  const trimVal = valueStr.trim()
  const isNegative = /^\(.*\)$/.test(trimVal) || trimVal.startsWith('-')
  const clean = trimVal
    .replace(/,/g, '')
    .replace(/[()%\sxy]/gi, '')
    .replace(/Rp/g, '')
  const num = parseFloat(clean)
  if (isNaN(num)) return null
  return isNegative ? -Math.abs(num) : num
}

const getSectionStatus = (
  section: ParsedSection
): { text: string; tone: 'positive' | 'neutral' | 'negative' } | null => {
  const metrics = new Map<string, string>()
  section.metrics.forEach((metric) => metrics.set(metric.label.toUpperCase(), metric.value))

  const getVal = (labels: string[]): number | null => {
    for (const label of labels) {
      const value = metrics.get(label.toUpperCase())
      if (value !== undefined) return parseVal(value)
    }
    return null
  }

  const titleUpper = section.title.toUpperCase()

  if (titleUpper.includes('VALUATION')) {
    const peTtm = getVal(['Current PE Ratio (TTM)'])
    const peAnn = getVal(['Current PE Ratio (Annualised)'])
    const forwardPe = getVal(['Forward PE Ratio'])
    const pbv = getVal(['Current Price to Book Value'])
    const priceSales = getVal(['Current Price to Sales (TTM)'])
    const priceCf = getVal(['Current Price To Cashflow (TTM)'])
    const priceFcf = getVal(['Current Price To Free Cashflow (TTM)'])
    const evEbit = getVal(['EV to EBIT (TTM)'])
    const evEbitda = getVal(['EV to EBITDA (TTM)'])
    const peg = getVal(['PEG Ratio', 'PEG Ratio (3yr)'])

    let score = 0
    let count = 0

    const checkPe = (value: number | null) => {
      if (value !== null) {
        count++
        if (value < 0 || value > 25) score -= 2.0
        else if (value <= 15) score += 1.5
      }
    }

    checkPe(peTtm)
    checkPe(peAnn)
    checkPe(forwardPe)

    if (pbv !== null) {
      count++
      if (pbv < 0 || pbv > 3.0) score -= 1.5
      else if (pbv <= 1.5) score += 1.0
    }
    if (priceSales !== null) {
      count++
      if (priceSales < 0 || priceSales > 5.0) score -= 1.5
      else if (priceSales <= 1.5) score += 1.0
    }
    if (priceCf !== null) {
      count++
      if (priceCf < 0 || priceCf > 20) score -= 1.5
      else if (priceCf <= 10) score += 1.0
    }
    if (priceFcf !== null) {
      count++
      if (priceFcf < 0 || priceFcf > 20) score -= 1.5
      else if (priceFcf <= 10) score += 1.0
    }
    if (evEbit !== null) {
      count++
      if (evEbit < 0 || evEbit > 15) score -= 1.5
      else if (evEbit <= 10) score += 1.0
    }
    if (evEbitda !== null) {
      count++
      if (evEbitda < 0 || evEbitda > 15) score -= 1.5
      else if (evEbitda <= 10) score += 1.0
    }
    if (peg !== null) {
      count++
      if (peg < 0 || peg > 1.5) score -= 1.0
      else if (peg <= 1.0) score += 1.0
    }

    if (count === 0) return null
    if (score < -0.5) return { text: 'Valuasi Mahal', tone: 'negative' }
    if (score > 0.5) return { text: 'Valuasi Murah', tone: 'positive' }
    return { text: 'Valuasi Wajar', tone: 'neutral' }
  }

  if (titleUpper.includes('PER SHARE') || titleUpper === 'PER SAHAM') {
    const eps = getVal(['Current EPS (TTM)', 'Current EPS (Annualised)'])
    const fcfps = getVal(['Free Cashflow Per Share (TTM)'])

    if (eps === null && fcfps === null) return null
    if (eps !== null && eps < 0) return { text: 'Kinerja Rugi', tone: 'negative' }
    if (eps !== null && eps > 0) {
      if (fcfps !== null && fcfps > 0)
        return { text: 'Laba & Arus Kas Bersih Positif', tone: 'positive' }
      return { text: 'Laba Positif', tone: 'positive' }
    }
    return { text: 'Cukup', tone: 'neutral' }
  }

  if (
    titleUpper.includes('SOLVENCY') ||
    titleUpper.includes('KESEHATAN KEUANGAN') ||
    titleUpper.includes('UTANG')
  ) {
    const der = getVal(['Debt to Equity Ratio (Quarter)'])
    const cr = getVal(['Current Ratio (Quarter)'])
    const ic = getVal(['Interest Coverage (TTM)'])
    const altman = getVal(['Altman Z-Score (Modified)'])

    let score = 0
    let count = 0

    if (der !== null) {
      count++
      if (der <= 0.5) score += 1.0
      else if (der <= 1.0) score += 0.5
      else if (der > 2.0) score -= 1.5
    }
    if (cr !== null) {
      count++
      if (cr >= 1.5) score += 1.0
      else if (cr < 1.0) score -= 1.5
    }
    if (ic !== null) {
      count++
      if (ic >= 5) score += 1.0
      else if (ic < 3.0) score -= 1.0
    }
    if (altman !== null) {
      count++
      if (altman >= 3.0) score += 0.5
      else if (altman < 1.8) score -= 1.0
    }

    if (count === 0) return null
    if (score >= 2.0) return { text: 'Keuangan Sangat Sehat', tone: 'positive' }
    if (score >= 0.5) return { text: 'Keuangan Sehat / Aman', tone: 'positive' }
    if (score >= -0.5) return { text: 'Waspada / Utang Moderat', tone: 'neutral' }
    return { text: 'Keuangan Berisiko / Lemah', tone: 'negative' }
  }

  if (titleUpper.includes('PROFITABILITY') || titleUpper.includes('PROFITABILITAS')) {
    const npm = getVal(['Net Profit Margin (Quarter)'])
    const gpm = getVal(['Gross Profit Margin (Quarter)'])
    const opm = getVal(['Operating Profit Margin (Quarter)'])

    if (npm !== null && npm < 0) return { text: 'Margin Rugi', tone: 'negative' }

    let score = 0
    let count = 0

    if (npm !== null) {
      count++
      if (npm >= 15) score += 1.0
      else if (npm < 5) score -= 1.0
    }
    if (gpm !== null) {
      count++
      if (gpm >= 30) score += 0.5
      else if (gpm < 15) score -= 0.5
    }
    if (opm !== null) {
      count++
      if (opm >= 15) score += 0.5
      else if (opm < 5) score -= 0.5
    }

    if (count === 0) return null
    if (score >= 1.5) return { text: 'Margin Sangat Tebal', tone: 'positive' }
    if (score >= 0.5) return { text: 'Margin Sehat', tone: 'positive' }
    if (score >= -0.5) return { text: 'Margin Wajar / Sedang', tone: 'neutral' }
    return { text: 'Margin Tipis / Rendah', tone: 'negative' }
  }

  if (titleUpper.includes('MANAGEMENT EFFECTIVENESS') || titleUpper.includes('EFEKTIVITAS')) {
    const roe = getVal(['Return on Equity (TTM)'])
    const roa = getVal(['Return on Assets (TTM)'])
    const roce = getVal(['Return on Capital Employed (TTM)'])
    const ccc = getVal(['Cash Conversion Cycle (Quarter)'])
    const dso = getVal(['Days Sales Outstanding (Quarter)'])

    if (roe !== null && roe < 0) return { text: 'Modal Defisit / Rugi', tone: 'negative' }

    let score = 0
    let count = 0

    if (roe !== null) {
      count++
      if (roe >= 15) score += 1.0
      else if (roe < 8) score -= 1.0
    }
    if (roa !== null) {
      count++
      if (roa >= 10) score += 1.0
      else if (roa >= 5) score += 0.5
      else score -= 0.5
    }
    if (roce !== null) {
      count++
      if (roce >= 15) score += 0.5
    }
    if (ccc !== null) {
      count++
      if (ccc > 120) score -= 1.0
      else if (ccc <= 60) score += 0.5
    }
    if (dso !== null) {
      count++
      if (dso > 90) score -= 1.0
    }

    if (count === 0) return null
    if (score >= 1.5) return { text: 'Sangat Efektif', tone: 'positive' }
    if (score >= 0.5) return { text: 'Efektif / Sehat', tone: 'positive' }
    if (score >= -0.5) return { text: 'Efektivitas Wajar', tone: 'neutral' }
    return { text: 'Kurang Efektif / Lambat', tone: 'negative' }
  }

  if (titleUpper.includes('GROWTH') || titleUpper.includes('PERTUMBUHAN')) {
    const revGrow = getVal(['Revenue (Quarter YoY Growth)'])
    const netGrow = getVal(['Net Income (Quarter YoY Growth)'])

    let score = 0
    let count = 0

    if (revGrow !== null) {
      count++
      if (revGrow >= 15) score += 1.0
      else if (revGrow >= 0) score += 0.5
      else score -= 1.0
    }
    if (netGrow !== null) {
      count++
      if (netGrow >= 15) score += 1.0
      else if (netGrow >= 0) score += 0.5
      else score -= 1.0
    }

    if (count === 0) return null
    if (score >= 1.5) return { text: 'Tumbuh Cepat', tone: 'positive' }
    if (score >= 0.5) return { text: 'Tumbuh Stabil', tone: 'positive' }
    if (score === 0) return { text: 'Melambat', tone: 'neutral' }
    return { text: 'Menurun / Kontraksi', tone: 'negative' }
  }

  if (titleUpper.includes('DIVIDEND') || titleUpper.includes('DIVIDEN')) {
    const yieldVal = getVal(['Dividend Yield'])
    if (yieldVal === null || yieldVal <= 0) return { text: 'Tidak Ada Dividen', tone: 'neutral' }
    if (yieldVal >= 5) return { text: 'Yield Tinggi / Menarik', tone: 'positive' }
    return { text: 'Yield Cukup', tone: 'neutral' }
  }

  if (titleUpper.includes('RANK') || titleUpper.includes('PERINGKAT')) {
    const fscore = getVal(['Piotroski F-Score'])
    if (fscore === null) return null
    if (fscore >= 7) return { text: 'Fundamental Sangat Kuat', tone: 'positive' }
    if (fscore >= 4) return { text: 'Fundamental Cukup', tone: 'neutral' }
    return { text: 'Fundamental Lemah', tone: 'negative' }
  }

  if (titleUpper.includes('INCOME STATEMENT') || titleUpper.includes('LABA RUGI')) {
    const netIncome = getVal(['Net Income (TTM)'])
    if (netIncome === null) return null
    if (netIncome > 0) return { text: 'Laba Bersih Surplus', tone: 'positive' }
    return { text: 'Rugi Bersih', tone: 'negative' }
  }

  if (titleUpper.includes('BALANCE SHEET') || titleUpper.includes('NERACA')) {
    const equity = getVal(['Total Equity'])
    if (equity === null) return null
    if (equity > 0) return { text: 'Modal Bersih Positif', tone: 'positive' }
    return { text: 'Defisit Modal (Ekuitas Negatif)', tone: 'negative' }
  }

  if (titleUpper.includes('CASH FLOW') || titleUpper.includes('ARUS KAS')) {
    const cfo = getVal(['Cash From Operations (TTM)'])
    const fcf = getVal(['Free cash flow (TTM)'])

    if (cfo === null && fcf === null) return null
    if (cfo !== null && cfo < 0) return { text: 'Defisit Kas Operasional', tone: 'negative' }
    if (cfo !== null && cfo > 0) {
      if (fcf !== null && fcf > 0) return { text: 'Kas Bebas Surplus', tone: 'positive' }
      return { text: 'Kas Operasional Positif', tone: 'positive' }
    }
    return { text: 'Netral', tone: 'neutral' }
  }

  if (titleUpper.includes('PRICE PERFORMANCE') || titleUpper.includes('HARGA')) {
    const rsr = getVal(['Relative Strength Rating'])
    if (rsr === null) return null
    if (rsr >= 70) return { text: 'Kondisi Bullish / Kuat', tone: 'positive' }
    if (rsr >= 30) return { text: 'Kondisi Konsolidasi', tone: 'neutral' }
    return { text: 'Kondisi Bearish / Lemah', tone: 'negative' }
  }

  return null
}

const MANDATORY_FUNDAMENTAL_SECTIONS = new Set([
  'Current Valuation',
  'Per Share',
  'Solvency',
  'Profitability',
  'Growth',
  'Income Statement',
  'Balance Sheet',
  'Cash Flow Statement',
])

export function DataTable({ table, easyLabels }: { table: ParsedTable; easyLabels: boolean }) {
  return (
    <div className="table-block">
      <div className="table-heading">
        <div>
          <span className="table-kicker">Tabel terstruktur</span>
          <h3>{translateTableLabel(table.title, easyLabels)}</h3>
        </div>
        <Table2 size={17} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {table.headers.map((header) => (
                <th key={header}>{translateTableLabel(header, easyLabels)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{translateTableLabel(row.label, easyLabels)}</th>
                {row.values.map((value, index) => (
                  <td key={`${row.label}-${index}`} className={valueTone(value)}>
                    {formatDisplayValue(value, easyLabels)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function DataSection({
  section,
  index,
  easyLabels,
}: {
  section: ParsedSection
  index: number
  easyLabels: boolean
}) {
  const isMandatoryFundamental = MANDATORY_FUNDAMENTAL_SECTIONS.has(section.title)
  const status = getSectionStatus(section)

  return (
    <article className="data-section" id={`section-${slugify(section.title)}`}>
      <header className="section-heading">
        <span className="section-number">{String(index + 1).padStart(2, '0')}</span>
        <div>
          <h2>{translateSectionLabel(section.title, easyLabels)}</h2>
          <div className="section-heading-meta">
            <p>
              {section.metrics.length} metrik
              {section.tables.length > 0 ? ` / ${section.tables.length} tabel` : ''}
            </p>
            {isMandatoryFundamental && <span className="section-required">Fundamental inti</span>}
            {status && (
              <span className={`section-status-badge status-${status.tone}`}>{status.text}</span>
            )}
          </div>
        </div>
      </header>
      {section.metrics.length > 0 && (
        <div className="metric-grid">
          {section.metrics.map((metric) => {
            const tooltipContent = getMetricTooltipContent(metric.label)
            const hint = getMetricContextHint(metric.label, metric.value)
            return (
              <div className="metric-row" key={metric.label}>
                <div className="metric-label-title">
                  <span className="metric-label">
                    {translateMetricLabel(metric.label, easyLabels)}
                  </span>
                  {tooltipContent && (
                    <span
                      className="metric-tooltip-trigger"
                      data-tooltip={tooltipContent}
                      aria-label="Penjelasan metrik"
                    >
                      <Info size={12} strokeWidth={2.5} aria-hidden="true" />
                    </span>
                  )}
                </div>
                <div className="metric-value-container">
                  <span className={valueTone(metric.value)}>
                    {formatDisplayValue(metric.value, easyLabels)}
                  </span>
                  {hint && (
                    <span className={`metric-context-hint hint-${hint.tone}`}>{hint.text}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {section.tables.map((table) => (
        <DataTable key={table.title} table={table} easyLabels={easyLabels} />
      ))}
    </article>
  )
}

const FUNDAMENTAL_GUIDE_ITEMS = [
  {
    title: 'Valuasi',
    metrics: 'PE / PBV / EV/EBITDA',
    body: 'Angka lebih rendah sering lebih menarik, tetapi bandingkan dengan sektor, historis, dan kualitas laba.',
  },
  {
    title: 'Profitabilitas',
    metrics: 'ROE / ROA / margin',
    body: 'Cari profit yang positif dan stabil. Satu angka tinggi belum cukup tanpa melihat trennya.',
  },
  {
    title: 'Pertumbuhan',
    metrics: 'Revenue / laba YoY',
    body: 'Pertumbuhan yang konsisten lebih sehat. Laba naik tanpa arus kas ikut naik perlu dicermati.',
  },
  {
    title: 'Utang & solvabilitas',
    metrics: 'DER / interest coverage',
    body: 'DER lebih rendah biasanya memberi ruang aman. Interest coverage di atas 3x umumnya lebih lega.',
  },
  {
    title: 'Arus kas',
    metrics: 'CFO / FCF',
    body: 'CFO positif berarti operasi menghasilkan kas. FCF positif berarti masih ada kas setelah belanja modal.',
  },
  {
    title: 'Per saham',
    metrics: 'EPS / BVPS / FCFPS',
    body: 'Pakai metrik ini untuk melihat nilai yang melekat pada tiap saham dan cek tren dilusinya.',
  },
  {
    title: 'Dividen',
    metrics: 'Yield / payout',
    body: 'Yield tinggi bukan otomatis sehat. Periksa payout, arus kas, dan konsistensi pembayaran.',
  },
  {
    title: 'Konteks pasar',
    metrics: 'Rank / performance',
    body: 'Rank dan price performance membantu membaca sentimen, bukan pengganti fundamental.',
  },
] as const

export function FundamentalGuide() {
  return (
    <details className="fundamental-guide">
      <summary>
        <span className="fundamental-guide-title">
          <Info size={16} aria-hidden="true" />
          <strong>Cara baca angka fundamental</strong>
        </span>
        <span className="fundamental-guide-toggle">Buka/tutup</span>
      </summary>
      <div className="fundamental-guide-units" aria-label="Panduan satuan">
        <span>
          <strong>x</strong> kelipatan
        </span>
        <span>
          <strong>%</strong> persentase
        </span>
        <span>
          <strong>M</strong> juta
        </span>
        <span>
          <strong>B</strong> miliar
        </span>
        <span>
          <strong>T</strong> triliun
        </span>
      </div>
      <div className="fundamental-guide-grid">
        {FUNDAMENTAL_GUIDE_ITEMS.map((item) => (
          <div className="fundamental-guide-item" key={item.title}>
            <div>
              <strong>{item.title}</strong>
              <span>{item.metrics}</span>
            </div>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
      <p className="fundamental-guide-note">
        Rule of thumb, bukan batas mutlak. Bandingkan dengan sektor, tren beberapa periode, dan
        kondisi bisnis saham.
      </p>
    </details>
  )
}

const stockNumberFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 })

const formatQuoteValue = (value: number | null | undefined, unit: string): string =>
  value === null || value === undefined ? '-' : `${stockNumberFormatter.format(value)} ${unit}`

export function StockIdentityCard({ stockData }: { stockData: StockData }) {
  const identity = stockData.stock_identity
  const quote = stockData.market_quote.snapshots[0]
  const quoteChange = quote?.price_change_percent ?? null
  const quoteTone = quoteChange === null ? 'neutral' : quoteChange >= 0 ? 'positive' : 'negative'
  const companyName = identity.company_name || 'Nama saham belum terdeteksi'

  return (
    <section className="stock-identity-card" aria-label="Informasi saham">
      <div className="stock-identity-main">
        <span className="panel-kicker">Saham terdeteksi</span>
        <strong className="stock-identity-code">
          {identity.ticker || 'Kode belum terdeteksi'}
        </strong>
        <h3>{companyName}</h3>
        <div className="stock-identity-tags">
          {[identity.sector, identity.sharia_status, identity.listing_board, identity.exchange]
            .filter(Boolean)
            .map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
        </div>
      </div>
      <div className="stock-quote">
        <span className="panel-kicker">Harga terbaru</span>
        <strong className="stock-quote-price">
          {quote?.price === null || quote?.price === undefined
            ? '-'
            : `IDR ${stockNumberFormatter.format(quote.price)}`}
        </strong>
        <span className={`stock-quote-change stock-quote-change-${quoteTone}`}>
          {quoteChange === null
            ? 'Perubahan belum ada'
            : `${quoteChange >= 0 ? '+' : ''}${stockNumberFormatter.format(quoteChange)}%`}
        </span>
        <span className="stock-quote-session">
          {[quote?.session, quote?.date, quote?.time, quote?.timezone].filter(Boolean).join(' ') ||
            'Waktu belum ada'}
        </span>
        <div className="stock-quote-stats">
          <div>
            <span>Volume</span>
            <strong>{formatQuoteValue(quote?.volume, quote?.volume_unit ?? 'juta')}</strong>
          </div>
          <div>
            <span>Rata-rata</span>
            <strong>
              {formatQuoteValue(quote?.average_volume, quote?.average_volume_unit ?? 'juta')}
            </strong>
          </div>
        </div>
      </div>
    </section>
  )
}
