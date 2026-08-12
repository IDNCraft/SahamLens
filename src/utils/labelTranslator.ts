const SECTION_LABELS: Readonly<Record<string, string>> = {
  'Current Valuation': 'Valuasi saat ini',
  'Per Share': 'Per saham',
  'Solvency': 'Kesehatan keuangan',
  'Management Effectiveness': 'Efektivitas bisnis',
  'Profitability': 'Profitabilitas',
  'Growth': 'Pertumbuhan',
  'Dividend': 'Dividen',
  'Market Rank': 'Peringkat pasar',
  'Income Statement': 'Laporan laba rugi',
  'Balance Sheet': 'Neraca',
  'Cash Flow Statement': 'Laporan arus kas',
  'Price Performance': 'Pergerakan harga',
}

const METRIC_LABELS: Readonly<Record<string, string>> = {
  'Current PE Ratio (Annualised)': 'Rasio harga dibanding laba tahunan',
  'Current PE Ratio (TTM)': 'Rasio harga dibanding laba 12 bulan',
  'Forward PE Ratio': 'Rasio harga dibanding laba proyeksi',
  'IHSG PE Ratio TTM (Median)': 'Median rasio harga/laba IHSG 12 bulan',
  'Earnings Yield (TTM)': 'Imbal hasil laba 12 bulan',
  'Current Price to Sales (TTM)': 'Harga dibanding penjualan 12 bulan',
  'Current Price to Book Value': 'Harga dibanding nilai buku',
  'Current Price To Cashflow (TTM)': 'Harga dibanding arus kas 12 bulan',
  'Current Price To Free Cashflow (TTM)': 'Harga dibanding arus kas bebas 12 bulan',
  'EV to EBIT (TTM)': 'Nilai perusahaan dibanding EBIT 12 bulan',
  'EV to EBITDA (TTM)': 'Nilai perusahaan dibanding EBITDA 12 bulan',
  'PEG Ratio': 'Rasio harga/laba terhadap pertumbuhan',
  'PEG Ratio (3yr)': 'Rasio harga/laba terhadap pertumbuhan 3 tahun',
  'PEG (Forward)': 'Rasio harga/laba terhadap pertumbuhan proyeksi',
  'Current EPS (TTM)': 'Laba per saham 12 bulan',
  'Current EPS (Annualised)': 'Laba per saham tahunan',
  'Revenue Per Share (TTM)': 'Pendapatan per saham 12 bulan',
  'Cash Per Share (Quarter)': 'Kas per saham kuartal terakhir',
  'Current Book Value Per Share': 'Nilai buku per saham',
  'Free Cashflow Per Share (TTM)': 'Arus kas bebas per saham 12 bulan',
  'Free cash flow (Quarter)': 'Arus kas bebas kuartal terakhir',
  'Free cash flow (TTM)': 'Arus kas bebas 12 bulan',
  'Current Ratio (Quarter)': 'Kemampuan bayar kewajiban jangka pendek',
  'Quick Ratio (Quarter)': 'Kemampuan bayar tanpa menghitung persediaan',
  'Debt to Equity Ratio (Quarter)': 'Utang dibanding modal',
  'LT Debt/Equity (Quarter)': 'Utang jangka panjang dibanding modal',
  'Total Liabilities/Equity (Quarter)': 'Total kewajiban dibanding modal',
  'Total Debt/Total Assets (Quarter)': 'Total utang dibanding aset',
  'Financial Leverage (Quarter)': 'Pengungkit keuangan',
  'Interest Coverage (TTM)': 'Kemampuan bayar bunga 12 bulan',
  'Altman Z-Score (Modified)': 'Skor kesehatan finansial Altman',
  'Return on Assets (TTM)': 'Hasil atas aset 12 bulan',
  'Return on Equity (TTM)': 'Hasil atas modal 12 bulan',
  'Return on Capital Employed (TTM)': 'Hasil atas modal kerja 12 bulan',
  'Return On Invested Capital (TTM)': 'Hasil atas modal investasi 12 bulan',
  'Days Sales Outstanding (Quarter)': 'Rata-rata hari penagihan',
  'Days Inventory (Quarter)': 'Rata-rata hari persediaan',
  'Days Payables Outstanding (Quarter)': 'Rata-rata hari pembayaran utang',
  'Cash Conversion Cycle (Quarter)': 'Siklus perputaran kas',
  'Receivables Turnover (Quarter)': 'Perputaran piutang',
  'Asset Turnover (TTM)': 'Perputaran aset 12 bulan',
  'Inventory Turnover (TTM)': 'Perputaran persediaan 12 bulan',
  'Gross Profit Margin (Quarter)': 'Margin laba kotor kuartal',
  'Operating Profit Margin (Quarter)': 'Margin laba operasi kuartal',
  'Net Profit Margin (Quarter)': 'Margin laba bersih kuartal',
  'Revenue (Quarter YoY Growth)': 'Pertumbuhan pendapatan tahunan',
  'Gross Profit (Quarter YoY Growth)': 'Pertumbuhan laba kotor tahunan',
  'Net Income (Quarter YoY Growth)': 'Pertumbuhan laba bersih tahunan',
  'Market Cap': 'Nilai seluruh saham',
  'Enterprise Value': 'Nilai perusahaan',
  'Current Share Outstanding': 'Jumlah saham beredar',
  'Free Float': 'Saham yang beredar di publik',
  'Dividend (TTM)': 'Dividen 12 bulan',
  'Dividend Yield': 'Imbal hasil dividen',
  'Latest Dividend Ex-Date': 'Tanggal terakhir tanpa hak dividen',
  'Piotroski F-Score': 'Skor kesehatan bisnis Piotroski',
  'Relative Strength Rating': 'Kekuatan harga relatif',
  'Rank (Market Cap)': 'Peringkat berdasarkan nilai saham',
  'Rank (Current PE Ratio TTM)': 'Peringkat berdasarkan rasio harga/laba',
  'Rank (Earnings Yield)': 'Peringkat berdasarkan imbal hasil laba',
  'Rank (P/S)': 'Peringkat berdasarkan harga/penjualan',
  'Rank (P/B)': 'Peringkat berdasarkan harga/nilai buku',
  'Rank (Near 52 Weeks High)': 'Peringkat dekat harga tertinggi setahun',
  'Revenue (TTM)': 'Pendapatan 12 bulan',
  'Gross Profit (TTM)': 'Laba kotor 12 bulan',
  'EBITDA (TTM)': 'EBITDA 12 bulan',
  'Net Income (TTM)': 'Laba bersih 12 bulan',
  'Cash (Quarter)': 'Kas kuartal terakhir',
  'Total Assets (Quarter)': 'Total aset kuartal terakhir',
  'Total Liabilities (Quarter)': 'Total kewajiban kuartal terakhir',
  'Working Capital (Quarter)': 'Modal kerja kuartal terakhir',
  'Common Equity': 'Modal saham biasa',
  'Long-term Debt (Quarter)': 'Utang jangka panjang',
  'Short-term Debt (Quarter)': 'Utang jangka pendek',
  'Total Debt (Quarter)': 'Total utang kuartal terakhir',
  'Net Debt (Quarter)': 'Utang bersih kuartal terakhir',
  'Total Equity': 'Total modal',
  'Cash From Operations (TTM)': 'Kas dari kegiatan operasi 12 bulan',
  'Cash From Investing (TTM)': 'Kas dari kegiatan investasi 12 bulan',
  'Cash From Financing (TTM)': 'Kas dari kegiatan pendanaan 12 bulan',
  'Capital expenditure (TTM)': 'Belanja modal 12 bulan',
}

const FALLBACK_REPLACEMENTS: readonly [RegExp, string][] = [
  [/\(TTM\)/gi, '(12 bulan terakhir)'],
  [/\(Quarter\)/gi, '(kuartal terakhir)'],
  [/\(Annualised\)/gi, '(tahunan)'],
  [/\(3yr\)/gi, '(3 tahun)'],
  [/\bCurrent\b/gi, 'Saat ini'],
  [/\bRevenue\b/gi, 'Pendapatan'],
  [/\bGross Profit\b/gi, 'Laba kotor'],
  [/\bNet Income\b/gi, 'Laba bersih'],
  [/\bProfit\b/gi, 'Laba'],
  [/\bMargin\b/gi, 'Margin'],
  [/\bReturn on\b/gi, 'Hasil atas'],
  [/\bCashflow\b/gi, 'arus kas'],
  [/\bCash flow\b/gi, 'Arus kas'],
  [/\bDebt\b/gi, 'Utang'],
  [/\bEquity\b/gi, 'Modal'],
  [/\bRatio\b/gi, 'Rasio'],
  [/\bGrowth\b/gi, 'Pertumbuhan'],
]

const fallbackLabel = (label: string): string =>
  FALLBACK_REPLACEMENTS.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    label
  )

const formatDisplayNumber = (value: number): string =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value)

export const formatDisplayValue = (value: string, easyLabels: boolean): string => {
  if (!easyLabels) return value
  const amountMatch = value.match(
    /^(\()?([+-]?[\d.,]+)\s*(B|M|K|T|billion|million|thousand|trillion)\)?$/i
  )
  if (!amountMatch) return value

  const numericValue = Number(amountMatch[2].replace(/,/g, ''))
  if (!Number.isFinite(numericValue)) return value

  const absoluteValue = Math.abs(numericValue)
  const isNegative = Boolean(amountMatch[1]) || numericValue < 0
  const sign = isNegative ? '-' : ''
  const unit = amountMatch[3].toUpperCase()

  if ((unit === 'B' || unit === 'BILLION') && absoluteValue >= 1000) {
    return `${sign}${formatDisplayNumber(absoluteValue / 1000)} triliun`
  }
  if (unit === 'B' || unit === 'BILLION')
    return `${sign}${formatDisplayNumber(absoluteValue)} miliar`
  if (unit === 'T' || unit === 'TRILLION')
    return `${sign}${formatDisplayNumber(absoluteValue)} triliun`
  if (unit === 'M' || unit === 'MILLION') return `${sign}${formatDisplayNumber(absoluteValue)} juta`
  return `${sign}${formatDisplayNumber(absoluteValue)} ribu`
}

export const translateSectionLabel = (label: string, easyLabels: boolean): string =>
  easyLabels ? (SECTION_LABELS[label] ?? fallbackLabel(label)) : label

export const translateMetricLabel = (label: string, easyLabels: boolean): string =>
  easyLabels ? (METRIC_LABELS[label] ?? fallbackLabel(label)) : label

export const translateTableLabel = (label: string, easyLabels: boolean): string => {
  if (!easyLabels) return label
  const tableLabels: Readonly<Record<string, string>> = {
    'Period': 'Periode',
    'Window': 'Rentang',
    'Change': 'Perubahan',
    'Low': 'Terendah',
    'High': 'Tertinggi',
    'Price windows': 'Rentang harga',
    'Net Income / EPS / Revenue': 'Laba bersih / laba per saham / pendapatan',
    'Dividend History': 'Riwayat dividen',
    'Q1': 'Kuartal 1',
    'Q2': 'Kuartal 2',
    'Q3': 'Kuartal 3',
    'Q4': 'Kuartal 4',
    'Annualised': 'Tahunan',
    'TTM (Q1)': '12 bulan terakhir (Q1)',
    'TTM (Q2)': '12 bulan terakhir (Q2)',
    'TTM (Q3)': '12 bulan terakhir (Q3)',
    'TTM (Q4)': '12 bulan terakhir (Q4)',
    'TTM': '12 bulan terakhir',
    'Div (TTM)': 'Dividen 12 bulan',
    'Payout Ratio': 'Rasio pembagian laba',
    'Payout Rasio': 'Rasio pembagian laba',
    'Div Yield': 'Imbal hasil dividen',
    'Yield Dividen': 'Imbal hasil dividen',
    'Div. Yield': 'Imbal hasil dividen',
  }
  return tableLabels[label] ?? fallbackLabel(label)
}

export interface MetricHint {
  readonly text: string
  readonly tone: 'positive' | 'neutral' | 'negative' | 'info'
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

export const getMetricContextHint = (label: string, valueStr: string): MetricHint | null => {
  const value = parseVal(valueStr)
  if (value === null) return null

  const labelUpper = label.toUpperCase()

  // 1. PE Ratio (Price to Earnings)
  if (
    labelUpper.includes('PE RATIO') ||
    labelUpper.includes('P/E') ||
    labelUpper === 'FORWARD PE RATIO'
  ) {
    if (value < 0) return { text: 'Negatif / Rugi', tone: 'negative' }
    if (value <= 10) return { text: 'Rendah / Murah', tone: 'positive' }
    if (value <= 15) return { text: 'Wajar / Murah', tone: 'positive' }
    if (value <= 25) return { text: 'Moderat / Wajar', tone: 'neutral' }
    return { text: 'Tinggi / Mahal', tone: 'negative' }
  }

  // 2. PBV (Price to Book Value)
  if (
    labelUpper.includes('PRICE TO BOOK') ||
    labelUpper === 'P/B' ||
    labelUpper.includes('PRICE TO BOOK VALUE')
  ) {
    if (value < 0) return { text: 'Negatif / Di Bawah Modal', tone: 'negative' }
    if (value <= 1.0) return { text: 'Rendah / Murah', tone: 'positive' }
    if (value <= 2.0) return { text: 'Wajar', tone: 'positive' }
    if (value <= 3.0) return { text: 'Moderat', tone: 'neutral' }
    return { text: 'Tinggi / Mahal', tone: 'negative' }
  }

  // 3. EV/EBITDA, EV/EBIT
  if (labelUpper.includes('EV TO EBITDA') || labelUpper.includes('EV TO EBIT')) {
    if (value < 0) return { text: 'Negatif / Rugi', tone: 'negative' }
    if (value <= 10) return { text: 'Rendah / Murah', tone: 'positive' }
    if (value <= 20) return { text: 'Wajar / Moderat', tone: 'neutral' }
    return { text: 'Tinggi / Mahal', tone: 'negative' }
  }

  // 4. PEG Ratio
  if (labelUpper.includes('PEG RATIO') || labelUpper.startsWith('PEG ')) {
    if (value < 0) return { text: 'Negatif / Risiko', tone: 'negative' }
    if (value <= 1.0) return { text: 'Sangat Menarik', tone: 'positive' }
    if (value <= 1.5) return { text: 'Wajar', tone: 'neutral' }
    return { text: 'Tinggi / Overvalued', tone: 'negative' }
  }

  // 5. Price to Sales (P/S)
  if (labelUpper.includes('PRICE TO SALES') || labelUpper === 'P/S') {
    if (value < 0) return { text: 'Negatif', tone: 'negative' }
    if (value <= 1.0) return { text: 'Rendah / Murah', tone: 'positive' }
    if (value <= 3.0) return { text: 'Wajar / Moderat', tone: 'neutral' }
    return { text: 'Tinggi / Mahal', tone: 'negative' }
  }

  // 6. Return on Equity (ROE)
  if (labelUpper.includes('RETURN ON EQUITY') || labelUpper === 'ROE') {
    if (value < 0) return { text: 'Rugi / Negatif', tone: 'negative' }
    if (value < 8) return { text: 'Rendah / Kurang Efektif', tone: 'negative' }
    if (value < 15) return { text: 'Moderat / Cukup', tone: 'neutral' }
    return { text: 'Tinggi / Sangat Baik', tone: 'positive' }
  }

  // 7. Return on Assets (ROA), ROCE, ROIC
  if (
    labelUpper.includes('RETURN ON ASSETS') ||
    labelUpper.includes('RETURN ON CAPITAL EMPLOYED') ||
    labelUpper.includes('RETURN ON INVESTED CAPITAL') ||
    labelUpper === 'ROA' ||
    labelUpper === 'ROIC' ||
    labelUpper === 'ROCE'
  ) {
    if (value < 0) return { text: 'Negatif / Rugi', tone: 'negative' }
    if (value < 5) return { text: 'Rendah / Kurang Efektif', tone: 'negative' }
    if (value < 10) return { text: 'Moderat / Cukup', tone: 'neutral' }
    return { text: 'Tinggi / Sangat Baik', tone: 'positive' }
  }

  // 8. Debt to Equity (DER), LT Debt/Equity, Liabilities/Equity
  if (
    labelUpper.includes('DEBT TO EQUITY') ||
    labelUpper.includes('DEBT/EQUITY') ||
    labelUpper.includes('LIABILITIES/EQUITY')
  ) {
    if (value <= 0) return { text: 'Sangat Sehat / Tanpa Utang', tone: 'positive' }
    if (value <= 0.5) return { text: 'Sangat Rendah / Sehat', tone: 'positive' }
    if (value <= 1.0) return { text: 'Rendah / Sehat', tone: 'positive' }
    if (value <= 2.0) return { text: 'Wajar / Moderat', tone: 'neutral' }
    return { text: 'Tinggi / Berisiko', tone: 'negative' }
  }

  // 9. Current Ratio, Quick Ratio
  if (labelUpper.includes('CURRENT RATIO') || labelUpper.includes('QUICK RATIO')) {
    if (value < 1.0) return { text: 'Rendah / Berisiko', tone: 'negative' }
    if (value < 1.5) return { text: 'Cukup / Ketat', tone: 'neutral' }
    return { text: 'Tinggi / Aman', tone: 'positive' }
  }

  // 10. Interest Coverage
  if (labelUpper.includes('INTEREST COVERAGE')) {
    if (value < 1.5) return { text: 'Sangat Berisiko / Tidak Cukup', tone: 'negative' }
    if (value < 3.0) return { text: 'Rendah / Waspada', tone: 'neutral' }
    return { text: 'Tinggi / Aman', tone: 'positive' }
  }

  // 11. Margins: Gross Profit Margin, Operating Profit Margin, Net Profit Margin
  if (labelUpper.includes('MARGIN')) {
    if (value <= 0) return { text: 'Rugi / Negatif', tone: 'negative' }
    if (value < 5) return { text: 'Tipis / Rendah', tone: 'negative' }
    if (value < 15) return { text: 'Sedang / Wajar', tone: 'neutral' }
    return { text: 'Tinggi / Sangat Sehat', tone: 'positive' }
  }

  // 12. Growth %: Revenue, Gross Profit, Net Income Growth
  if (labelUpper.includes('YOY GROWTH') || labelUpper.includes('GROWTH')) {
    if (value < 0) return { text: 'Negatif / Turun', tone: 'negative' }
    if (value < 10) return { text: 'Lambat', tone: 'neutral' }
    if (value < 25) return { text: 'Cepat / Menarik', tone: 'positive' }
    return { text: 'Sangat Cepat', tone: 'positive' }
  }

  // 13. Dividend Yield / Div Yield
  if (labelUpper.includes('DIVIDEND YIELD') || labelUpper.includes('DIV YIELD')) {
    if (value <= 0) return { text: 'Tidak Ada / Sangat Kecil', tone: 'neutral' }
    if (value < 2) return { text: 'Rendah', tone: 'neutral' }
    if (value < 5) return { text: 'Menarik / Cukup', tone: 'positive' }
    return { text: 'Sangat Menarik / Tinggi', tone: 'positive' }
  }

  // 14. Piotroski F-Score
  if (labelUpper.includes('PIOTROSKI')) {
    if (value < 4) return { text: 'Lemah / Kurang Sehat', tone: 'negative' }
    if (value < 7) return { text: 'Moderat / Cukup', tone: 'neutral' }
    return { text: 'Kuat / Sangat Sehat', tone: 'positive' }
  }

  // 15. Altman Z-Score
  if (labelUpper.includes('ALTMAN Z-SCORE') || labelUpper.includes('ALTMAN')) {
    if (value < 1.8) return { text: 'Berisiko Tinggi / Tekanan Finansial', tone: 'negative' }
    if (value < 3.0) return { text: 'Moderat / Abu-abu', tone: 'neutral' }
    return { text: 'Tinggi / Sangat Sehat', tone: 'positive' }
  }

  // 16. Relative Strength Rating
  if (labelUpper.includes('RELATIVE STRENGTH')) {
    if (value < 30) return { text: 'Lemah / Tren Turun', tone: 'negative' }
    if (value < 70) return { text: 'Moderat / Konsolidasi', tone: 'neutral' }
    return { text: 'Kuat / Tren Naik', tone: 'positive' }
  }

  // 17. Payout Ratio (in table rows)
  if (labelUpper.includes('PAYOUT RATIO')) {
    if (value <= 0) return { text: 'Negatif / Tidak Ada', tone: 'negative' }
    if (value <= 30) return { text: 'Rendah / Sehat', tone: 'positive' }
    if (value <= 70) return { text: 'Sehat / Moderat', tone: 'positive' }
    if (value <= 100) return { text: 'Tinggi', tone: 'neutral' }
    return { text: 'Sangat Tinggi / Berisiko', tone: 'negative' }
  }

  // 18. Change % in historical/table headers or rows
  if (labelUpper === 'CHANGE') {
    if (value < 0) return { text: 'Turun', tone: 'negative' }
    if (value > 0) return { text: 'Naik', tone: 'positive' }
    return { text: 'Tetap', tone: 'neutral' }
  }

  // 19. Price to Cashflow & Price to Free Cashflow
  if (labelUpper.includes('PRICE TO CASHFLOW') || labelUpper.includes('PRICE TO FREE CASHFLOW')) {
    if (value < 0) return { text: 'Negatif / Aliran Kas Keluar', tone: 'negative' }
    if (value <= 10) return { text: 'Rendah / Menarik', tone: 'positive' }
    if (value <= 20) return { text: 'Wajar / Moderat', tone: 'neutral' }
    return { text: 'Tinggi / Mahal', tone: 'negative' }
  }

  // 20. Earnings Yield
  if (labelUpper.includes('EARNINGS YIELD')) {
    if (value < 0) return { text: 'Rugi / Negatif', tone: 'negative' }
    if (value < 5) return { text: 'Rendah (Obligasi)', tone: 'negative' }
    if (value < 10) return { text: 'Menengah / Cukup', tone: 'neutral' }
    return { text: 'Tinggi / Menarik', tone: 'positive' }
  }

  // 21. Market Cap / Enterprise Value
  if (labelUpper.includes('MARKET CAP') || labelUpper.includes('ENTERPRISE VALUE')) {
    const valUpper = valueStr.toUpperCase()
    if (
      valUpper.includes('T') ||
      valUpper.includes('TRILLION') ||
      (value >= 1000 && !valUpper.includes('B') && !valUpper.includes('BILLION'))
    ) {
      return { text: 'Sangat Besar (Big Cap)', tone: 'positive' }
    }
    if (valUpper.includes('B') || valUpper.includes('BILLION') || value >= 10) {
      if (value >= 10) return { text: 'Menengah (Mid Cap)', tone: 'info' }
      return { text: 'Kecil (Small Cap)', tone: 'info' }
    }
    return { text: 'Sangat Kecil (Micro Cap)', tone: 'neutral' }
  }

  // 22. Free Float
  if (labelUpper.includes('FREE FLOAT')) {
    if (value < 7.5) return { text: 'Sangat Rendah (Batas BEI)', tone: 'negative' }
    if (value <= 15) return { text: 'Rendah', tone: 'neutral' }
    if (value <= 40) return { text: 'Sedang / Sehat', tone: 'positive' }
    if (value <= 70) return { text: 'Tinggi', tone: 'neutral' }
    return { text: 'Sangat Tinggi', tone: 'negative' }
  }

  // 23. Days Sales Outstanding / Days Inventory
  if (labelUpper.includes('DAYS SALES OUTSTANDING') || labelUpper.includes('DAYS INVENTORY')) {
    if (value < 30) return { text: 'Sangat Cepat', tone: 'positive' }
    if (value < 60) return { text: 'Wajar', tone: 'neutral' }
    return { text: 'Lama / Menumpuk', tone: 'negative' }
  }

  // 24. Days Payables Outstanding
  if (labelUpper.includes('DAYS PAYABLES OUTSTANDING')) {
    if (value < 30) return { text: 'Cepat Bayar', tone: 'neutral' }
    if (value < 90) return { text: 'Wajar', tone: 'neutral' }
    return { text: 'Lama (Memanfaatkan Utang)', tone: 'positive' }
  }

  // 25. Cash Conversion Cycle
  if (labelUpper.includes('CASH CONVERSION CYCLE')) {
    if (value < 0) return { text: 'Sangat Cepat / Efisien', tone: 'positive' }
    if (value < 60) return { text: 'Cepat', tone: 'positive' }
    if (value < 120) return { text: 'Wajar', tone: 'neutral' }
    return { text: 'Lambat / Kas Mandek', tone: 'negative' }
  }

  // 26. Turnover (Asset, Inventory, Receivables)
  if (labelUpper.includes('TURNOVER')) {
    if (value < 1.0) return { text: 'Lambat', tone: 'negative' }
    if (value <= 2.0) return { text: 'Wajar', tone: 'neutral' }
    return { text: 'Cepat / Efisien', tone: 'positive' }
  }

  // 27. Financial Leverage
  if (labelUpper.includes('FINANCIAL LEVERAGE')) {
    if (value <= 1.0) return { text: 'Sangat Aman (Tanpa Leverage)', tone: 'positive' }
    if (value <= 2.0) return { text: 'Wajar', tone: 'neutral' }
    return { text: 'Tinggi', tone: 'negative' }
  }

  // 28. EPS (TTM) / (Annualised)
  if (labelUpper.includes('EPS')) {
    if (value < 0) return { text: 'Rugi per Saham', tone: 'negative' }
    if (value > 0) return { text: 'Laba per Saham', tone: 'positive' }
    return { text: 'Nihil', tone: 'neutral' }
  }

  // 29. Rank (PE, Yield, P/S, etc.) - percentile scale, higher = better
  if (labelUpper.startsWith('RANK')) {
    if (value >= 90) return { text: 'Peringkat Teratas', tone: 'positive' }
    if (value >= 50) return { text: 'Peringkat Menengah', tone: 'neutral' }
    return { text: 'Peringkat Bawah', tone: 'neutral' }
  }

  // 30. Debts: Short-term, Long-term, Total, Net
  if (
    labelUpper.includes('DEBT') &&
    (labelUpper.includes('SHORT-TERM') ||
      labelUpper.includes('LONG-TERM') ||
      labelUpper.includes('TOTAL') ||
      labelUpper.includes('NET'))
  ) {
    if (value < 0) return { text: 'Surplus (Kas > Utang)', tone: 'positive' }
    if (value > 0) return { text: 'Utang Positif', tone: 'neutral' }
    return { text: 'Tanpa Utang', tone: 'positive' }
  }

  // 31. Free Cash Flow
  if (labelUpper.includes('FREE CASH FLOW') || labelUpper.includes('FREE CASHFLOW')) {
    if (value < 0) return { text: 'Defisit Kas Bebas', tone: 'negative' }
    if (value > 0) return { text: 'Surplus Kas Bebas', tone: 'positive' }
    return { text: 'Nihil', tone: 'neutral' }
  }

  // 32. Common Equity, Total Equity
  if (labelUpper.includes('COMMON EQUITY') || labelUpper.includes('TOTAL EQUITY')) {
    if (value < 0) return { text: 'Defisit Modal (Negatif)', tone: 'negative' }
    return { text: 'Modal Positif', tone: 'positive' }
  }

  // 33. Revenue, Gross Profit, EBITDA, Net Income, Cash, Assets, Liabilities, Working Capital
  if (
    labelUpper.includes('REVENUE') ||
    labelUpper.includes('GROFIT') || // typo safety
    labelUpper.includes('PROFIT') ||
    labelUpper.includes('EBITDA') ||
    labelUpper.includes('NET INCOME') ||
    labelUpper.includes('CASH') ||
    labelUpper.includes('ASSET') ||
    labelUpper.includes('LIABILIT') ||
    labelUpper.includes('WORKING CAPITAL')
  ) {
    if (value < 0) return { text: 'Negatif / Defisit', tone: 'negative' }
    if (value > 0) return { text: 'Positif', tone: 'positive' }
    return { text: 'Nol / Nihil', tone: 'neutral' }
  }

  // Generic Fallback
  if (
    valueStr.includes('%') ||
    labelUpper.includes('PERCENT') ||
    labelUpper.includes('YIELD') ||
    labelUpper.includes('GROWTH')
  ) {
    if (value < 0) return { text: 'Negatif / Turun', tone: 'negative' }
    if (value > 0) return { text: 'Positif / Naik', tone: 'positive' }
    return { text: 'Nihil / Tetap', tone: 'neutral' }
  }

  if (value < 0) return { text: 'Negatif', tone: 'negative' }
  if (value > 0) return { text: 'Positif', tone: 'info' }
  return { text: 'Nihil / Nol', tone: 'neutral' }
}

const METRIC_GUIDES: Readonly<Record<string, string>> = {
  'Current PE Ratio (Annualised)':
    'Mengukur kelipatan harga saham dibanding laba disetahunkan. Semakin rendah semakin baik (murah), hindari PE negatif karena rugi.',
  'Current PE Ratio (TTM)':
    'Mengukur kelipatan harga saham dibanding laba 12 bulan terakhir. Semakin rendah semakin baik (murah), hindari PE negatif karena rugi.',
  'Forward PE Ratio':
    'Mengukur kelipatan harga dibanding proyeksi laba masa depan. Semakin rendah semakin baik (murah).',
  'IHSG PE Ratio TTM (Median)':
    'Rata-rata tengah PE rasio seluruh saham di IHSG. Sebagai acuan murah/mahal relatif bursa.',
  'Earnings Yield (TTM)':
    'Persentase laba bersih dibanding harga saham (kebalikan PE). Semakin tinggi semakin menarik.',
  'Current Price to Sales (TTM)':
    'Harga saham dibanding pendapatan per saham. Semakin rendah semakin baik.',
  'Current Price to Book Value':
    'Harga saham dibanding nilai modal bersihnya. Semakin rendah semakin baik (di bawah 1x dinilai sangat murah, di atas 3x dinilai mahal).',
  'Current Price To Cashflow (TTM)':
    'Harga saham dibanding arus kas operasional. Semakin rendah semakin baik.',
  'Current Price To Free Cashflow (TTM)':
    'Harga dibanding arus kas bersih sisa setelah belanja modal. Semakin rendah semakin baik.',
  'EV to EBIT (TTM)':
    'Nilai total perusahaan dibanding laba usaha sebelum bunga & pajak. Semakin rendah semakin baik.',
  'EV to EBITDA (TTM)':
    'Nilai total perusahaan dibanding laba kotor sebelum depresiasi. Semakin rendah semakin baik.',
  'PEG Ratio':
    'Rasio PE dibagi persentase pertumbuhan laba. Semakin rendah semakin baik (di bawah 1x dianggap undervalued dibanding pertumbuhannya).',
  'PEG Ratio (3yr)':
    'Rasio PE dibagi rata-rata pertumbuhan laba 3 tahun terakhir. Semakin rendah semakin baik.',
  'PEG (Forward)':
    'Rasio PE dibagi proyeksi pertumbuhan laba masa depan. Semakin rendah semakin baik.',
  // Per Share
  'Current EPS (TTM)':
    'Laba bersih yang dihasilkan untuk setiap lembar saham dalam 12 bulan terakhir. Semakin tinggi semakin baik.',
  'Current EPS (Annualised)':
    'Proyeksi laba bersih per lembar saham jika disetahunkan. Semakin tinggi semakin baik.',
  'Revenue Per Share (TTM)':
    'Pendapatan kotor per lembar saham. Menunjukkan kapasitas jualan perusahaan. Semakin tinggi semakin baik.',
  'Cash Per Share (Quarter)':
    'Jumlah kas dan setara kas yang dimiliki perusahaan untuk setiap lembar saham. Semakin tinggi semakin baik.',
  'Current Book Value Per Share':
    'Nilai modal bersih untuk setiap lembar saham. Acuan nilai intrinsik aset bersih. Semakin tinggi semakin baik.',
  'Free Cashflow Per Share (TTM)':
    'Sisa arus kas bersih per lembar saham yang bebas dibagikan sebagai dividen atau ekspansi. Semakin tinggi semakin baik.',
  // Solvency
  'Current Ratio (Quarter)':
    'Aset lancar dibanding kewajiban jangka pendek. Semakin tinggi semakin aman (minimal di atas 1.0x, ideal di atas 1.5x).',
  'Quick Ratio (Quarter)':
    'Aset lancar (tanpa persediaan) dibanding kewajiban jangka pendek. Semakin tinggi semakin aman.',
  'Debt to Equity Ratio (Quarter)':
    'Jumlah utang berbunga dibanding modal bersih. Semakin rendah semakin aman (di bawah 1.0x atau 100% dinilai aman).',
  'LT Debt/Equity (Quarter)':
    'Utang jangka panjang dibanding modal bersih. Semakin rendah semakin aman.',
  'Total Liabilities/Equity (Quarter)':
    'Total kewajiban (termasuk utang usaha) dibanding modal. Semakin rendah semakin aman.',
  'Total Debt/Total Assets (Quarter)':
    'Persentase aset yang dibiayai oleh utang berbunga. Semakin rendah semakin aman.',
  'Financial Leverage (Quarter)':
    'Rasio total aset dibanding modal bersih. Semakin rendah semakin aman (ketergantungan utang rendah).',
  'Interest Coverage (TTM)':
    'Kemampuan laba operasi membayar beban bunga utang. Semakin tinggi semakin baik (ideal di atas 3x).',
  'Altman Z-Score (Modified)':
    'Skor prediksi kebangkrutan. Semakin tinggi semakin baik (di atas 3.0 dinilai aman, di bawah 1.8 rawan).',
  // Profitability & Management
  'Return on Assets (TTM)':
    'Kemampuan aset menghasilkan laba bersih. Semakin tinggi semakin baik (ROA > 5% dinilai cukup baik).',
  'Return on Equity (TTM)':
    'Efisiensi modal bersih menghasilkan laba. Semakin tinggi semakin baik (ROE > 15% dinilai sangat menguntungkan).',
  'Return on Capital Employed (TTM)':
    'Pengembalian atas total modal kerja yang digunakan. Semakin tinggi semakin baik.',
  'Return On Invested Capital (TTM)':
    'Hasil atas modal investasi riil bisnis. Semakin tinggi semakin baik.',
  // Efficiency
  'Days Sales Outstanding (Quarter)':
    'Jumlah hari rata-rata penagihan piutang dari pelanggan. Semakin rendah semakin baik (penagihan cepat).',
  'Days Inventory (Quarter)':
    'Rata-rata hari persediaan barang mengendap di gudang sebelum terjual. Semakin rendah semakin baik.',
  'Days Payables Outstanding (Quarter)':
    'Rata-rata hari pembayaran utang ke pemasok. Semakin tinggi semakin baik bagi arus kas.',
  'Cash Conversion Cycle (Quarter)':
    'Siklus waktu (hari) dari beli barang hingga terima kas penjualan. Semakin rendah semakin baik (makin cepat kas berputar).',
  'Receivables Turnover (Quarter)':
    'Frekuensi perputaran piutang menjadi kas dalam satu periode. Semakin tinggi semakin baik.',
  'Asset Turnover (TTM)':
    'Rasio penjualan dibanding total aset. Semakin tinggi semakin baik (efisiensi aset menghasilkan omset).',
  'Inventory Turnover (TTM)':
    'Frekuensi persediaan barang terjual habis dalam setahun. Semakin tinggi semakin baik.',
  // Margins
  'Gross Profit Margin (Quarter)':
    'Persentase laba kotor dibanding pendapatan. Semakin tinggi semakin baik.',
  'Operating Profit Margin (Quarter)':
    'Persentase laba operasi dibanding pendapatan. Semakin tinggi semakin baik.',
  'Net Profit Margin (Quarter)':
    'Persentase laba bersih dibanding pendapatan. Semakin tinggi semakin baik (ideal > 15%).',
  // Growth
  'Revenue (Quarter YoY Growth)':
    'Pertumbuhan pendapatan kotor kuartal ini dibanding kuartal tahun lalu. Semakin tinggi semakin baik.',
  'Gross Profit (Quarter YoY Growth)':
    'Pertumbuhan laba kotor kuartal ini dibanding kuartal tahun lalu. Semakin tinggi semakin baik.',
  'Net Income (Quarter YoY Growth)':
    'Pertumbuhan laba bersih kuartal ini dibanding kuartal tahun lalu. Semakin tinggi semakin baik.',
  // Dividend
  'Dividend Yield':
    'Persentase dividen tahunan dibanding harga saham saat ini. Semakin tinggi semakin menarik bagi pemburu dividen.',
  'Dividend (TTM)':
    'Total nilai dividen tunai per saham yang dibagikan dalam 12 bulan terakhir. Semakin tinggi semakin baik.',
  'Latest Dividend Ex-Date':
    'Hari perdagangan pertama di bursa di mana pembeli baru tidak berhak mendapat dividen.',
  // Ranks & Scores
  'Piotroski F-Score':
    'Skor kesehatan keuangan (skala 0-9) dari 9 kriteria. Semakin tinggi semakin sehat (skor >= 7 dinilai fundamental kuat).',
  'Relative Strength Rating':
    'Kinerja harga saham dibanding seluruh saham di bursa. Semakin tinggi semakin kuat (skor > 70 dinilai uptrend kuat).',
  'EPS Rating':
    'Skor kualitas pertumbuhan laba per saham (skala 0-99). Semakin tinggi semakin kuat.',
  'Rank (Market Cap)':
    'Posisi persentil kapitalisasi pasar di bursa (0-100). Angka tinggi berarti berada di peringkat atas (kapitalisasi besar).',
  'Rank (Current PE Ratio TTM)':
    'Posisi persentil rasio harga/laba di bursa (0-100). Angka tinggi berarti PE relatif mahal dibanding bursa.',
  'Rank (Earnings Yield)':
    'Posisi persentil imbal hasil laba di bursa (0-100). Angka tinggi berarti imbal hasil menarik dibanding bursa.',
  'Rank (P/S)':
    'Posisi persentil rasio harga/penjualan di bursa (0-100). Angka tinggi berarti valuasi relatif mahal.',
  'Rank (P/B)':
    'Posisi persentil rasio harga/nilai buku di bursa (0-100). Angka tinggi berarti valuasi relatif mahal.',
  'Rank (Near 52 Weeks High)':
    'Posisi persentil harga terhadap titik tertinggi 52 minggu (0-100). Angka tinggi berarti harga mendekati puncaknya.',
  // Market data
  'Market Cap':
    'Total nilai pasar seluruh saham beredar (harga x jumlah saham). Semakin besar semakin besar skala perusahaannya.',
  'Enterprise Value':
    'Nilai perusahaan total termasuk utang (kapitalisasi pasar + utang bersih). Dipakai untuk membandingkan valuasi yang lebih adil.',
  'Current Share Outstanding': 'Jumlah seluruh lembar saham yang beredar saat ini.',
  'Free Float':
    'Persentase saham yang bebas diperdagangkan publik (tidak dikunci pemegang utama). Semakin tinggi semakin likuid.',
  // Income statement
  'Revenue (TTM)':
    'Total pendapatan kotor 12 bulan terakhir. Semakin tinggi semakin besar skala bisnis.',
  'Gross Profit (TTM)':
    'Pendapatan dikurangi harga pokok penjualan 12 bulan. Semakin tinggi semakin baik.',
  'EBITDA (TTM)':
    'Laba usaha sebelum bunga, pajak, depresiasi & amortisasi 12 bulan. Mengukur profitabilitas operasional murni.',
  'Net Income (TTM)':
    'Laba bersih setelah semua biaya dan pajak 12 bulan. Semakin tinggi semakin baik.',
  // Balance sheet
  'Cash (Quarter)':
    'Kas dan setara kas yang dimiliki perusahaan kuartal terakhir. Semakin tinggi semakin likuid.',
  'Total Assets (Quarter)':
    'Total seluruh aset perusahaan kuartal terakhir. Menunjukkan ukuran perusahaan.',
  'Total Liabilities (Quarter)':
    'Total seluruh kewajiban perusahaan kuartal terakhir. Semakin rendah semakin aman.',
  'Working Capital (Quarter)':
    'Aset lancar dikurangi kewajiban lancar. Positif berarti mampu membayar kewajiban jangka pendek.',
  'Common Equity':
    'Nilai modal bersih milik pemegang saham biasa. Positif berarti modal tidak defisit.',
  'Long-term Debt (Quarter)':
    'Total utang jatuh tempo lebih dari 1 tahun. Semakin rendah semakin aman.',
  'Short-term Debt (Quarter)': 'Total utang jatuh tempo di bawah 1 tahun.',
  'Total Debt (Quarter)': 'Total seluruh utang berbunga perusahaan. Semakin rendah semakin aman.',
  'Net Debt (Quarter)':
    'Total utang dikurangi kas. Negatif berarti kas lebih besar dari utang (sehat).',
  'Total Equity': 'Total seluruh modal dan laba ditahan perusahaan.',
  // Cash flow
  'Cash From Operations (TTM)':
    'Kas yang dihasilkan dari kegiatan operasional utama 12 bulan. Positif dan stabil menandakan bisnis sehat.',
  'Cash From Investing (TTM)':
    'Kas untuk belanja investasi aset 12 bulan. Biasanya negatif karena ekspansi.',
  'Cash From Financing (TTM)': 'Kas dari pendanaan (utang baru, dividen, buyback) 12 bulan.',
  'Capital expenditure (TTM)':
    'Belanja modal untuk aset tetap 12 bulan. Semakin tinggi semakin besar investasi perusahaan.',
  'Free cash flow (TTM)':
    'Kas operasional dikurangi belanja modal 12 bulan. Positif berarti ada kas tersisa untuk dividen/ekspansi.',
  'Free cash flow (Quarter)':
    'Kas operasional dikurangi belanja modal kuartal terakhir. Positif berarti ada kas tersisa.',
  // Dividend section
  'Payout Ratio':
    'Persentase laba yang dibagikan sebagai dividen. Di bawah 70% dinilai aman, di atas 100% kurang berkelanjutan.',
  'Dividend':
    'Nilai dividen tunai per saham yang dibagikan. Semakin tinggi semakin baik bagi pemegang saham.',
}

export const getMetricGuide = (label: string): string | null => {
  return METRIC_GUIDES[label] ?? null
}

export interface MetricGuideDetail {
  readonly description: string
  readonly direction: string | null
  readonly thresholds: string | null
}

export const getMetricGuideDetail = (label: string): MetricGuideDetail | null => {
  const rawDesc = METRIC_GUIDES[label]
  if (!rawDesc) return null

  const description = rawDesc
    .replace(
      /\s*Semakin (?:tinggi|rendah) semakin (?:baik|menarik|aman|sehat|menunjukkan|menarik bagi).*/gi,
      ''
    )
    .trim()

  const labelUpper = label.toUpperCase()
  let direction: string | null = null

  if (
    labelUpper.includes('PE RATIO') ||
    labelUpper.includes('P/E') ||
    labelUpper === 'FORWARD PE RATIO' ||
    labelUpper.includes('PRICE TO BOOK') ||
    labelUpper === 'P/B' ||
    labelUpper.includes('EV TO EBITDA') ||
    labelUpper.includes('EV TO EBIT') ||
    labelUpper.includes('PEG RATIO') ||
    labelUpper.startsWith('PEG ') ||
    labelUpper.includes('PRICE TO SALES') ||
    labelUpper === 'P/S' ||
    labelUpper.includes('DEBT TO EQUITY') ||
    labelUpper.includes('DEBT/EQUITY') ||
    labelUpper.includes('LIABILITIES/EQUITY') ||
    labelUpper.includes('DEBT/TOTAL ASSETS') ||
    labelUpper.includes('DAYS SALES OUTSTANDING') ||
    labelUpper.includes('DAYS INVENTORY') ||
    labelUpper.includes('CASH CONVERSION CYCLE') ||
    labelUpper.includes('FINANCIAL LEVERAGE') ||
    labelUpper.includes('SHORT-TERM DEBT') ||
    labelUpper.includes('LONG-TERM DEBT') ||
    labelUpper.includes('TOTAL DEBT') ||
    labelUpper.includes('NET DEBT') ||
    labelUpper.includes('PRICE TO CASHFLOW') ||
    labelUpper.includes('PRICE TO FREE CASHFLOW')
  ) {
    direction = 'Semakin rendah semakin baik'
  } else if (
    labelUpper.includes('EARNINGS YIELD') ||
    labelUpper.includes('EPS') ||
    labelUpper.includes('REVENUE PER SHARE') ||
    labelUpper.includes('CASH PER SHARE') ||
    labelUpper.includes('BOOK VALUE PER SHARE') ||
    labelUpper.includes('FREE CASHFLOW PER SHARE') ||
    labelUpper.includes('CURRENT RATIO') ||
    labelUpper.includes('QUICK RATIO') ||
    labelUpper.includes('INTEREST COVERAGE') ||
    labelUpper.includes('ALTMAN') ||
    labelUpper.includes('RETURN ON') ||
    labelUpper === 'ROE' ||
    labelUpper === 'ROA' ||
    labelUpper === 'ROIC' ||
    labelUpper === 'ROCE' ||
    labelUpper.includes('DAYS PAYABLES OUTSTANDING') ||
    labelUpper.includes('MARGIN') ||
    labelUpper.includes('GROWTH') ||
    labelUpper.includes('DIVIDEND YIELD') ||
    labelUpper.includes('DIV YIELD') ||
    labelUpper.includes('DIVIDEND (TTM)') ||
    labelUpper.includes('PIOTROSKI') ||
    labelUpper.includes('RELATIVE STRENGTH') ||
    labelUpper.includes('REVENUE') ||
    labelUpper.includes('NET INCOME') ||
    labelUpper.includes('EBITDA') ||
    labelUpper.includes('GROSS PROFIT') ||
    labelUpper.includes('CASH FROM OPERATIONS') ||
    labelUpper.includes('FREE CASH FLOW') ||
    labelUpper.includes('WORKING CAPITAL') ||
    labelUpper.includes('FREE FLOAT') ||
    labelUpper.includes('TOTAL ASSETS') ||
    labelUpper.includes('COMMON EQUITY') ||
    labelUpper.includes('TOTAL EQUITY') ||
    labelUpper.includes('CASH (QUARTER)') ||
    labelUpper === 'DIVIDEND' ||
    labelUpper === 'MARKET CAP' ||
    labelUpper === 'ENTERPRISE VALUE' ||
    labelUpper.startsWith('RANK (MARKET CAP)') ||
    labelUpper.startsWith('RANK (EARNINGS YIELD)') ||
    labelUpper.startsWith('RANK (NEAR 52')
  ) {
    direction = 'Semakin tinggi semakin baik'
  } else if (
    labelUpper.includes('TOTAL LIABILITIES') ||
    labelUpper.includes('NET DEBT') ||
    labelUpper === 'PAYOUT RATIO' ||
    labelUpper.startsWith('RANK (CURRENT PE') ||
    labelUpper.startsWith('RANK (P/S)') ||
    labelUpper.startsWith('RANK (P/B)')
  ) {
    direction = 'Semakin rendah semakin baik'
  }

  if (labelUpper.includes('TURNOVER')) {
    direction = 'Semakin tinggi semakin baik'
  }

  let thresholds: string | null = null

  if (labelUpper.startsWith('RANK')) {
    thresholds = 'Teratas: >= 90 | Menengah: 50-89 | Bawah: < 50'
  } else if (
    labelUpper.includes('PE RATIO') ||
    labelUpper.includes('P/E') ||
    labelUpper === 'FORWARD PE RATIO'
  ) {
    thresholds = 'Murah: <= 15x | Mahal: > 25x'
  } else if (labelUpper.includes('PRICE TO BOOK') || labelUpper === 'P/B') {
    thresholds = 'Murah: <= 1.5x | Mahal: > 3x'
  } else if (labelUpper.includes('EV TO EBITDA') || labelUpper.includes('EV TO EBIT')) {
    thresholds = 'Murah: <= 10x | Mahal: > 15x'
  } else if (labelUpper.includes('PEG RATIO') || labelUpper.startsWith('PEG ')) {
    thresholds = 'Menarik: <= 1.0 | Mahal: > 1.5'
  } else if (labelUpper.includes('PRICE TO SALES') || labelUpper === 'P/S') {
    thresholds = 'Murah: <= 1.5x | Mahal: > 5x'
  } else if (
    labelUpper.includes('PRICE TO CASHFLOW') ||
    labelUpper.includes('PRICE TO FREE CASHFLOW')
  ) {
    thresholds = 'Murah: <= 10x | Mahal: > 20x'
  } else if (labelUpper.includes('EARNINGS YIELD')) {
    thresholds = 'Menarik: >= 10% | Rendah: < 5%'
  } else if (labelUpper.includes('RETURN ON EQUITY') || labelUpper === 'ROE') {
    thresholds = 'Bagus: >= 15% | Lemah: < 8%'
  } else if (
    labelUpper.includes('RETURN ON ASSETS') ||
    labelUpper.includes('RETURN ON CAPITAL EMPLOYED') ||
    labelUpper.includes('RETURN ON INVESTED CAPITAL') ||
    labelUpper === 'ROA' ||
    labelUpper === 'ROIC' ||
    labelUpper === 'ROCE'
  ) {
    thresholds = 'Bagus: >= 10% | Lemah: < 5%'
  } else if (labelUpper.includes('MARGIN')) {
    thresholds = 'Tebal: >= 15% | Tipis: < 5%'
  } else if (
    labelUpper.includes('DEBT TO EQUITY') ||
    labelUpper.includes('DEBT/EQUITY') ||
    labelUpper.includes('LIABILITIES/EQUITY') ||
    labelUpper.includes('DEBT/TOTAL ASSETS')
  ) {
    thresholds = 'Aman: <= 1.0x | Berisiko: > 2.0x'
  } else if (labelUpper.includes('CURRENT RATIO') || labelUpper.includes('QUICK RATIO')) {
    thresholds = 'Aman: >= 1.5x | Berisiko: < 1.0x'
  } else if (labelUpper.includes('INTEREST COVERAGE')) {
    thresholds = 'Aman: >= 5x | Berisiko: < 3x'
  } else if (labelUpper.includes('ALTMAN')) {
    thresholds = 'Aman: >= 3.0 | Berisiko: < 1.8'
  } else if (
    labelUpper.includes('DAYS SALES OUTSTANDING') ||
    labelUpper.includes('DAYS INVENTORY')
  ) {
    thresholds = 'Cepat: < 30 hari | Lama: > 90 hari'
  } else if (labelUpper.includes('DAYS PAYABLES OUTSTANDING')) {
    thresholds = 'Lama: >= 90 hari | Cepat: < 30 hari'
  } else if (labelUpper.includes('CASH CONVERSION CYCLE')) {
    thresholds = 'Cepat: <= 60 hari | Lambat: > 120 hari'
  } else if (labelUpper.includes('TURNOVER')) {
    thresholds = 'Cepat: > 2.0 | Lambat: < 1.0'
  } else if (labelUpper.includes('FINANCIAL LEVERAGE')) {
    thresholds = 'Aman: <= 2.0 | Tinggi: > 2.0'
  } else if (labelUpper.includes('YOY GROWTH') || labelUpper.includes('GROWTH')) {
    thresholds = 'Cepat: >= 15% | Turun: < 0%'
  } else if (labelUpper.includes('DIVIDEND YIELD') || labelUpper.includes('DIV YIELD')) {
    thresholds = 'Tinggi: >= 5%'
  } else if (labelUpper.includes('PAYOUT RATIO')) {
    thresholds = 'Aman: <= 70% | Berisiko: > 100%'
  } else if (labelUpper.includes('PIOTROSKI')) {
    thresholds = 'Kuat: >= 7 | Lemah: < 4'
  } else if (labelUpper.includes('RELATIVE STRENGTH')) {
    thresholds = 'Kuat: >= 70% | Lemah: < 30%'
  } else if (labelUpper.includes('FREE FLOAT')) {
    thresholds = 'Rendah: < 15% | Sehat: 15-40% | Tinggi: > 40%'
  } else if (labelUpper === 'MARKET CAP') {
    thresholds = 'Mikro: < 1 T | Kecil: 1-10 T | Menengah: 10-50 T | Besar: > 50 T'
  } else if (labelUpper.includes('NET DEBT') || labelUpper.includes('TOTAL LIABILITIES')) {
    thresholds = 'Surplus (kas > utang): negatif | Utang: positif'
  } else if (
    labelUpper.includes('CASH FROM OPERATIONS') ||
    labelUpper.includes('WORKING CAPITAL') ||
    labelUpper === 'DIVIDEND'
  ) {
    thresholds = 'Positif: sehat | Negatif: berisiko'
  } else if (labelUpper.includes('FREE CASH FLOW')) {
    thresholds = 'Surplus: > 0 | Defisit: < 0'
  }

  return { description, direction, thresholds }
}

export const getMetricTooltipContent = (label: string): string | null => {
  const detail = getMetricGuideDetail(label)
  if (!detail) return null

  let content = detail.description
  if (detail.direction) {
    content += `\n\n${detail.direction}`
    if (detail.thresholds) {
      content += `\n(${detail.thresholds})`
    }
  }
  return content
}
