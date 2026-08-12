import type { StockData } from './types'

export type AnalysisStatus = 'positive' | 'neutral' | 'negative' | 'missing'
export type ValuationSignal = 'cheap' | 'fair' | 'expensive' | 'missing'
export type HorizonSignal = 'short' | 'long' | 'mixed' | 'missing'

export interface AnalysisRule {
  readonly id: string
  readonly label: string
  readonly formula: string
  readonly value: number | null
  readonly valueLabel: string
  readonly status: AnalysisStatus
  readonly points: -1 | 0 | 1
  readonly weight: number
  readonly reason: string
}

export interface StockAnalysis {
  readonly score: number | null
  readonly verdict: string
  readonly verdictTone: 'positive' | 'neutral' | 'negative'
  readonly valuationSignal: ValuationSignal
  readonly valuationLabel: string
  readonly valuationSummary: string
  readonly horizonSignal: HorizonSignal
  readonly horizonLabel: string
  readonly horizonSummary: string
  readonly summary: string
  readonly testedVariables: number
  readonly totalVariables: number
  readonly positiveRules: readonly AnalysisRule[]
  readonly negativeRules: readonly AnalysisRule[]
  readonly rules: readonly AnalysisRule[]
}

type Evaluation = {
  readonly points: -1 | 0 | 1
  readonly status: Exclude<AnalysisStatus, 'missing'>
  readonly reason: string
}

type RuleConfig = {
  readonly id: string
  readonly label: string
  readonly formula: string
  readonly value: number | null
  readonly unit: string
  readonly weight: number
  readonly missingReason: string
  readonly evaluate: (value: number) => Evaluation
}

const numberFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 })

const formatNumber = (value: number): string => numberFormatter.format(value)

const formatValue = (value: number | null, unit: string): string => {
  if (value === null) return '-'
  if (unit === '%') return `${formatNumber(value)}%`
  if (unit === 'x') return `${formatNumber(value)}x`
  if (unit === '/9') return `${formatNumber(value)}/9`
  return `${formatNumber(value)} ${unit}`
}

const createRule = (config: RuleConfig): AnalysisRule => {
  if (config.value === null || config.value === undefined) {
    return {
      id: config.id,
      label: config.label,
      formula: config.formula,
      value: null,
      valueLabel: '-',
      status: 'missing',
      points: 0,
      weight: config.weight,
      reason: config.missingReason,
    }
  }

  const evaluation = config.evaluate(config.value)
  return {
    id: config.id,
    label: config.label,
    formula: config.formula,
    value: config.value,
    valueLabel: formatValue(config.value, config.unit),
    status: evaluation.status,
    points: evaluation.points,
    weight: config.weight,
    reason: evaluation.reason,
  }
}

const buildRules = (stockData: StockData): readonly AnalysisRule[] => {
  const valuation = stockData.current_valuation
  const management = stockData.management_effectiveness
  const solvency = stockData.solvency
  const growth = stockData.growth
  const marketRank = stockData.market_rank
  const cashFlow = stockData.cash_flow_statement

  return [
    createRule({
      id: 'pe-ttm',
      label: 'PE TTM',
      formula: '<= 15x baik; 15-25x netral; > 25x mahal',
      value: valuation.current_pe_ratio_ttm,
      unit: 'x',
      weight: 2,
      missingReason: 'PE TTM tidak tersedia; valuasi belum bisa diuji.',
      evaluate: (value) =>
        value <= 15
          ? { points: 1, status: 'positive', reason: 'Harga relatif terhadap laba terlihat wajar.' }
          : value <= 25
            ? {
                points: 0,
                status: 'neutral',
                reason:
                  'Harga terhadap laba berada di area tengah; perlu dibandingkan dengan sektor.',
              }
            : {
                points: -1,
                status: 'negative',
                reason: 'Harga relatif terhadap laba cukup mahal.',
              },
    }),
    createRule({
      id: 'price-book',
      label: 'Harga dibanding nilai buku',
      formula: '<= 1,5x baik; 1,5-3x netral; > 3x mahal',
      value: valuation.current_price_to_book_value,
      unit: 'x',
      weight: 1,
      missingReason: 'Rasio harga/nilai buku tidak tersedia.',
      evaluate: (value) =>
        value <= 1.5
          ? {
              points: 1,
              status: 'positive',
              reason: 'Harga tidak terlalu jauh dari nilai bukunya.',
            }
          : value <= 3
            ? {
                points: 0,
                status: 'neutral',
                reason: 'Harga di atas nilai buku, tetapi belum ekstrem.',
              }
            : { points: -1, status: 'negative', reason: 'Harga jauh di atas nilai buku.' },
    }),
    createRule({
      id: 'roe',
      label: 'ROE TTM',
      formula: '>= 15% baik; 8-15% netral; < 8% lemah',
      value: management.return_on_equity_ttm_percent,
      unit: '%',
      weight: 1,
      missingReason: 'ROE tidak tersedia; efisiensi modal belum bisa diuji.',
      evaluate: (value) =>
        value >= 15
          ? { points: 1, status: 'positive', reason: 'Modal menghasilkan laba dengan cukup baik.' }
          : value >= 8
            ? {
                points: 0,
                status: 'neutral',
                reason: 'Pengembalian modal cukup, tetapi belum kuat.',
              }
            : { points: -1, status: 'negative', reason: 'Pengembalian modal masih rendah.' },
    }),
    createRule({
      id: 'revenue-growth',
      label: 'Pertumbuhan pendapatan',
      formula: '>= 10% baik; 0-10% netral; < 0% turun',
      value: growth.revenue_quarter_yoy_growth_percent,
      unit: '%',
      weight: 1,
      missingReason: 'Pertumbuhan pendapatan tidak tersedia.',
      evaluate: (value) =>
        value >= 10
          ? {
              points: 1,
              status: 'positive',
              reason: 'Pendapatan tumbuh kuat dibanding periode sebelumnya.',
            }
          : value >= 0
            ? {
                points: 0,
                status: 'neutral',
                reason: 'Pendapatan masih tumbuh, tetapi belum cepat.',
              }
            : { points: -1, status: 'negative', reason: 'Pendapatan sedang menurun.' },
    }),
    createRule({
      id: 'net-income-growth',
      label: 'Pertumbuhan laba bersih',
      formula: '>= 10% baik; 0-10% netral; < 0% turun',
      value: growth.net_income_quarter_yoy_growth_percent,
      unit: '%',
      weight: 1,
      missingReason: 'Pertumbuhan laba bersih tidak tersedia.',
      evaluate: (value) =>
        value >= 10
          ? { points: 1, status: 'positive', reason: 'Laba bersih tumbuh kuat.' }
          : value >= 0
            ? { points: 0, status: 'neutral', reason: 'Laba bersih masih tumbuh, tetapi tipis.' }
            : { points: -1, status: 'negative', reason: 'Laba bersih sedang menurun.' },
    }),
    createRule({
      id: 'current-ratio',
      label: 'Current ratio',
      formula: '>= 1,5x baik; 1-1,5x netral; < 1x berisiko',
      value: solvency.current_ratio_quarter,
      unit: 'x',
      weight: 1,
      missingReason: 'Current ratio tidak tersedia; likuiditas belum bisa diuji.',
      evaluate: (value) =>
        value >= 1.5
          ? {
              points: 1,
              status: 'positive',
              reason: 'Aset lancar cukup untuk menutup kewajiban jangka pendek.',
            }
          : value >= 1
            ? {
                points: 0,
                status: 'neutral',
                reason: 'Likuiditas masih cukup, tetapi ruang amannya terbatas.',
              }
            : {
                points: -1,
                status: 'negative',
                reason: 'Kewajiban jangka pendek lebih besar dari aset lancar.',
              },
    }),
    createRule({
      id: 'debt-equity',
      label: 'Utang dibanding modal',
      formula: '<= 0,5x baik; 0,5-1x netral; > 1x berisiko',
      value: solvency.debt_to_equity_ratio_quarter,
      unit: 'x',
      weight: 1,
      missingReason: 'Rasio utang/modal tidak tersedia.',
      evaluate: (value) =>
        value <= 0.5
          ? { points: 1, status: 'positive', reason: 'Beban utang relatif rendah terhadap modal.' }
          : value <= 1
            ? {
                points: 0,
                status: 'neutral',
                reason: 'Utang masih terkendali, tetapi perlu dipantau.',
              }
            : { points: -1, status: 'negative', reason: 'Utang relatif tinggi terhadap modal.' },
    }),
    createRule({
      id: 'free-cash-flow',
      label: 'Arus kas bebas TTM',
      formula: '> 0 miliar baik; <= 0 miliar negatif',
      value: cashFlow.free_cashflow_ttm_idr_billion,
      unit: 'IDR miliar',
      weight: 2,
      missingReason: 'Arus kas bebas TTM tidak tersedia.',
      evaluate: (value) =>
        value > 0
          ? {
              points: 1,
              status: 'positive',
              reason: 'Bisnis menghasilkan kas bebas setelah belanja modal.',
            }
          : {
              points: -1,
              status: 'negative',
              reason: 'Kas bebas negatif; kualitas laba perlu diperiksa lebih lanjut.',
            },
    }),
    createRule({
      id: 'piotroski',
      label: 'Piotroski F-Score',
      formula: '>= 7 baik; 4-6 netral; < 4 lemah',
      value: marketRank.piotroski_f_score,
      unit: '/9',
      weight: 1,
      missingReason: 'Piotroski F-Score tidak tersedia.',
      evaluate: (value) =>
        value >= 7
          ? { points: 1, status: 'positive', reason: 'Sinyal kualitas fundamental tergolong kuat.' }
          : value >= 4
            ? {
                points: 0,
                status: 'neutral',
                reason: 'Kualitas fundamental berada di area tengah.',
              }
            : {
                points: -1,
                status: 'negative',
                reason: 'Sinyal kualitas fundamental tergolong lemah.',
              },
    }),
    createRule({
      id: 'interest-coverage',
      label: 'Interest coverage',
      formula: '>= 5x baik; 2-5x netral; < 2x berisiko',
      value: solvency.interest_coverage_ttm,
      unit: 'x',
      weight: 1,
      missingReason: 'Interest coverage tidak tersedia.',
      evaluate: (value) =>
        value >= 5
          ? {
              points: 1,
              status: 'positive',
              reason: 'Laba operasional cukup untuk membayar bunga.',
            }
          : value >= 2
            ? {
                points: 0,
                status: 'neutral',
                reason: 'Bunga masih terbayar, tetapi bantalan keamanan belum besar.',
              }
            : {
                points: -1,
                status: 'negative',
                reason: 'Kemampuan membayar bunga tergolong rendah.',
              },
    }),
    createRule({
      id: 'altman-z-score',
      label: 'Altman Z-Score',
      formula: '>= 3 baik; 1,8-3 netral; < 1,8 berisiko',
      value: solvency.altman_z_score_modified,
      unit: 'x',
      weight: 1,
      missingReason: 'Altman Z-Score tidak tersedia.',
      evaluate: (value) =>
        value >= 3
          ? {
              points: 1,
              status: 'positive',
              reason: 'Risiko tekanan finansial terlihat rendah dari skor ini.',
            }
          : value >= 1.8
            ? { points: 0, status: 'neutral', reason: 'Skor berada di area abu-abu.' }
            : {
                points: -1,
                status: 'negative',
                reason: 'Skor menunjukkan risiko tekanan finansial lebih tinggi.',
              },
    }),
    createRule({
      id: 'ev-ebitda',
      label: 'EV dibanding EBITDA',
      formula: '<= 10x baik; 10-20x netral; > 20x mahal',
      value: valuation.ev_to_ebitda_ttm,
      unit: 'x',
      weight: 1,
      missingReason: 'EV/EBITDA tidak tersedia.',
      evaluate: (value) =>
        value <= 10
          ? {
              points: 1,
              status: 'positive',
              reason: 'Nilai perusahaan relatif wajar terhadap EBITDA.',
            }
          : value <= 20
            ? {
                points: 0,
                status: 'neutral',
                reason: 'Nilai perusahaan belum murah, tetapi belum ekstrem.',
              }
            : {
                points: -1,
                status: 'negative',
                reason: 'Nilai perusahaan relatif mahal terhadap EBITDA.',
              },
    }),
  ]
}

const averagePerformance = (stockData: StockData, windows: readonly string[]): number | null => {
  const returns = windows
    .map((window) => stockData.price_performance.periods[window]?.return_percent ?? null)
    .filter((value): value is number => value !== null)
  return returns.length > 0
    ? returns.reduce((total, value) => total + value, 0) / returns.length
    : null
}

export const buildAnalysis = (
  stockData: StockData,
  scoringMethod: 'discrete' | 'continuous' = 'discrete'
): StockAnalysis => {
  const rules = buildRules(stockData)
  const testedRules = rules.filter((rule) => rule.status !== 'missing')
  const valuationRules = rules.filter((rule) =>
    ['pe-ttm', 'price-book', 'ev-ebitda'].includes(rule.id)
  )
  const testedValuationRules = valuationRules.filter((rule) => rule.status !== 'missing')
  const cheapValuationCount = testedValuationRules.filter(
    (rule) => rule.status === 'positive'
  ).length
  const expensiveValuationCount = testedValuationRules.filter(
    (rule) => rule.status === 'negative'
  ).length
  const valuationSignal: ValuationSignal =
    testedValuationRules.length === 0
      ? 'missing'
      : cheapValuationCount > expensiveValuationCount
        ? 'cheap'
        : expensiveValuationCount > cheapValuationCount
          ? 'expensive'
          : 'fair'
  const valuationLabel =
    valuationSignal === 'cheap'
      ? 'Cenderung murah'
      : valuationSignal === 'expensive'
        ? 'Terlalu mahal'
        : valuationSignal === 'fair'
          ? 'Valuasi wajar'
          : 'Belum cukup data'
  const valuationSummary =
    valuationSignal === 'cheap'
      ? `${cheapValuationCount} indikator valuasi mendukung harga relatif murah.`
      : valuationSignal === 'expensive'
        ? `${expensiveValuationCount} indikator valuasi menunjukkan harga relatif mahal.`
        : valuationSignal === 'fair'
          ? 'Indikator valuasi masih campuran atau berada di area tengah.'
          : 'PE, PBV, dan EV/EBITDA belum tersedia.'
  const shortTermReturn = averagePerformance(stockData, ['1M', '3M'])
  const longTermReturn = averagePerformance(stockData, ['1Y', '3Y', '5Y'])
  const longTermRuleIds = new Set([
    'roe',
    'revenue-growth',
    'net-income-growth',
    'free-cash-flow',
    'piotroski',
  ])
  const longTermRules = rules.filter(
    (rule) => longTermRuleIds.has(rule.id) && rule.status !== 'missing'
  )
  const longTermPositiveCount = longTermRules.filter((rule) => rule.status === 'positive').length
  const longTermNegativeCount = longTermRules.filter((rule) => rule.status === 'negative').length
  const shortTermSignal = shortTermReturn !== null && shortTermReturn >= 5
  const longTermSignal =
    longTermRules.length >= 3 &&
    longTermPositiveCount > longTermNegativeCount &&
    (longTermReturn === null || longTermReturn >= 0)
  const horizonSignal: HorizonSignal =
    shortTermSignal && longTermSignal
      ? 'mixed'
      : shortTermSignal
        ? 'short'
        : longTermSignal
          ? 'long'
          : shortTermReturn !== null || longTermReturn !== null || longTermRules.length > 0
            ? 'mixed'
            : 'missing'
  const horizonLabel =
    horizonSignal === 'short'
      ? 'Jangka pendek'
      : horizonSignal === 'long'
        ? 'Jangka panjang'
        : horizonSignal === 'mixed'
          ? 'Campuran'
          : 'Belum cukup data'
  const horizonSummary =
    horizonSignal === 'short'
      ? 'Momentum 1M/3M lebih menonjol daripada sinyal fundamental.'
      : horizonSignal === 'long'
        ? 'Fundamental dan tren periode panjang lebih mendukung.'
        : horizonSignal === 'mixed'
          ? 'Sinyal momentum dan fundamental belum searah.'
          : 'Data performa dan fundamental belum cukup dibaca.'

  const totalWeight = testedRules.reduce((total, rule) => total + rule.weight, 0)

  let score: number | null = null
  if (testedRules.length >= 4 && totalWeight > 0) {
    if (scoringMethod === 'continuous') {
      const valuation = stockData.current_valuation
      const management = stockData.management_effectiveness
      const solvency = stockData.solvency
      const growth = stockData.growth
      const marketRank = stockData.market_rank
      const cashFlow = stockData.cash_flow_statement
      const divObj = stockData.dividend

      // 1. Valuation (Weight: 20)
      const valScores: number[] = []
      const addValScore = (v: number | null | undefined, getScore: (val: number) => number) => {
        if (v !== null && v !== undefined) valScores.push(getScore(v))
      }
      addValScore(valuation.current_pe_ratio_ttm, (v) =>
        v < 0
          ? 0
          : v <= 5
            ? 100
            : v <= 15
              ? 100 - (v - 5) * 2
              : v <= 25
                ? 80 - (v - 15) * 3
                : Math.max(0, 50 - (v - 25) * 1.2)
      )
      addValScore(valuation.current_pe_ratio_annualised, (v) =>
        v < 0
          ? 0
          : v <= 5
            ? 100
            : v <= 15
              ? 100 - (v - 5) * 2
              : v <= 25
                ? 80 - (v - 15) * 3
                : Math.max(0, 50 - (v - 25) * 1.2)
      )
      addValScore(valuation.forward_pe_ratio, (v) =>
        v < 0
          ? 0
          : v <= 5
            ? 100
            : v <= 15
              ? 100 - (v - 5) * 2
              : v <= 25
                ? 80 - (v - 15) * 3
                : Math.max(0, 50 - (v - 25) * 1.2)
      )
      addValScore(valuation.current_price_to_book_value, (v) =>
        v < 0
          ? 0
          : v <= 1.0
            ? 100
            : v <= 2.0
              ? 100 - (v - 1.0) * 20
              : v <= 3.0
                ? 80 - (v - 2.0) * 30
                : Math.max(0, 50 - (v - 3.0) * 5.7)
      )
      addValScore(valuation.ev_to_ebitda_ttm, (v) =>
        v < 0
          ? 0
          : v <= 5
            ? 100
            : v <= 10
              ? 100 - (v - 5) * 4
              : v <= 15
                ? 80 - (v - 10) * 6
                : Math.max(0, 50 - (v - 15) * 2)
      )
      addValScore(valuation.peg_ratio, (v) => (v < 0 ? 10 : v <= 1.0 ? 100 : v <= 1.5 ? 70 : 30))
      addValScore(valuation.peg_ratio_3yr, (v) =>
        v < 0 ? 10 : v <= 1.0 ? 100 : v <= 1.5 ? 70 : 30
      )
      addValScore(valuation.current_price_to_sales_ttm, (v) =>
        v < 0 ? 0 : v <= 1.5 ? 100 : v <= 5.0 ? 100 - (v - 1.5) * 15 : 10
      )
      addValScore(valuation.current_price_to_cashflow_ttm, (v) =>
        v < 0 ? 0 : v <= 10 ? 100 : v <= 20 ? 100 - (v - 10) * 5 : 10
      )
      addValScore(valuation.current_price_to_free_cashflow_ttm, (v) =>
        v < 0 ? 0 : v <= 10 ? 100 : v <= 20 ? 100 - (v - 10) * 5 : 10
      )

      const valCatScore =
        valScores.length > 0 ? valScores.reduce((a, b) => a + b, 0) / valScores.length : 50

      // 2. Profitability (Weight: 15)
      const profScores: number[] = []
      const addProfScore = (v: number | null | undefined, getScore: (val: number) => number) => {
        if (v !== null && v !== undefined) profScores.push(getScore(v))
      }
      addProfScore(management.return_on_equity_ttm_percent, (v) =>
        v <= 0 ? 0 : v < 8 ? 10 + v * 3.75 : v < 15 ? 40 + (v - 8) * 5.71 : 100
      )
      addProfScore(management.return_on_assets_ttm_percent, (v) =>
        v <= 0 ? 0 : v < 5 ? 40 + v * 8 : 100
      )
      addProfScore(management.return_on_capital_employed_ttm_percent, (v) =>
        v <= 0 ? 0 : v < 10 ? 40 + v * 4 : 100
      )
      addProfScore(stockData.profitability.net_profit_margin_quarter_percent, (v) =>
        v <= 0 ? 0 : v < 5 ? 30 + v * 6 : v < 15 ? 60 + (v - 5) * 4 : 100
      )
      addProfScore(stockData.profitability.operating_profit_margin_quarter_percent, (v) =>
        v <= 0 ? 0 : v < 5 ? 30 + v * 6 : v < 15 ? 60 + (v - 5) * 4 : 100
      )
      addProfScore(stockData.profitability.gross_profit_margin_quarter_percent, (v) =>
        v <= 0 ? 0 : v < 20 ? 40 + v * 2 : 100
      )

      const profCatScore =
        profScores.length > 0 ? profScores.reduce((a, b) => a + b, 0) / profScores.length : 50

      // 3. Growth (Weight: 20)
      const growthScores: number[] = []
      const addGrowthScore = (v: number | null | undefined) => {
        if (v !== null && v !== undefined) {
          growthScores.push(
            v <= -20
              ? 0
              : v < 0
                ? 40 + v * 2
                : v < 10
                  ? 40 + v * 3
                  : v < 25
                    ? 70 + (v - 10) * 1.33
                    : 100
          )
        }
      }
      addGrowthScore(growth.revenue_quarter_yoy_growth_percent)
      addGrowthScore(growth.net_income_quarter_yoy_growth_percent)

      const growthCatScore =
        growthScores.length > 0 ? growthScores.reduce((a, b) => a + b, 0) / growthScores.length : 50

      // 4. Solvency (Weight: 15)
      const solvScores: number[] = []
      const addSolvScore = (v: number | null | undefined, getScore: (val: number) => number) => {
        if (v !== null && v !== undefined) solvScores.push(getScore(v))
      }
      addSolvScore(solvency.debt_to_equity_ratio_quarter, (v) =>
        v <= 0
          ? 100
          : v <= 0.5
            ? 100 - v * 20
            : v <= 1.0
              ? 90 - (v - 0.5) * 30
              : v <= 2.0
                ? 75 - (v - 1.0) * 35
                : Math.max(0, 40 - (v - 2.0) * 10)
      )
      addSolvScore(solvency.current_ratio_quarter, (v) =>
        v < 0.5
          ? 0
          : v < 1.0
            ? 20 + (v - 0.5) * 60
            : v < 1.5
              ? 50 + (v - 1.0) * 60
              : v < 3.0
                ? 80 + (v - 1.5) * 13.33
                : 100
      )
      addSolvScore(solvency.interest_coverage_ttm, (v) =>
        v <= 0 ? 0 : v < 1.5 ? 10 + v * 13.33 : v < 5.0 ? 30 + (v - 1.5) * 14.28 : 100
      )

      const solvCatScore =
        solvScores.length > 0 ? solvScores.reduce((a, b) => a + b, 0) / solvScores.length : 50

      // 5. Cash Flow (Weight: 15)
      const cfScores: number[] = []
      if (cashFlow.cash_from_operations_ttm_idr_billion !== null)
        cfScores.push(cashFlow.cash_from_operations_ttm_idr_billion > 0 ? 100 : 20)
      if (cashFlow.free_cashflow_ttm_idr_billion !== null)
        cfScores.push(cashFlow.free_cashflow_ttm_idr_billion > 0 ? 100 : 10)

      const cfCatScore =
        cfScores.length > 0 ? cfScores.reduce((a, b) => a + b, 0) / cfScores.length : 50

      // 6. Dividend (Weight: 10)
      const divScores: number[] = []
      const yieldVal = divObj.dividend_yield ?? valuation.earnings_yield_ttm_percent
      if (yieldVal !== null) {
        divScores.push(yieldVal <= 0 ? 0 : yieldVal < 2 ? 40 : yieldVal < 5 ? 80 : 100)
      }
      if (divObj.payout_ratio !== null) {
        const po = divObj.payout_ratio
        divScores.push(po <= 0 ? 0 : po <= 70 ? 100 : po <= 100 ? 70 : 30)
      }

      const divCatScore =
        divScores.length > 0 ? divScores.reduce((a, b) => a + b, 0) / divScores.length : 0

      // 7. Risk & Other (Weight: 5)
      const riskScores: number[] = []
      const addRiskScore = (v: number | null | undefined, getScore: (val: number) => number) => {
        if (v !== null && v !== undefined) riskScores.push(getScore(v))
      }
      addRiskScore(solvency.altman_z_score_modified, (v) => (v >= 3.0 ? 100 : v >= 1.8 ? 60 : 20))
      addRiskScore(marketRank.piotroski_f_score, (v) => Math.min(100, Math.max(0, v * (100 / 9))))
      addRiskScore(management.days_sales_outstanding_quarter, (v) =>
        v <= 30 ? 100 : v <= 90 ? 70 : 30
      )
      addRiskScore(management.days_inventory_quarter, (v) => (v <= 30 ? 100 : v <= 90 ? 70 : 30))
      addRiskScore(management.cash_conversion_cycle_quarter, (v) =>
        v <= 60 ? 100 : v <= 120 ? 70 : 30
      )
      addRiskScore(marketRank.relative_strength_rating_percent, (v) =>
        v >= 70 ? 100 : v >= 30 ? 60 : 20
      )

      const riskCatScore =
        riskScores.length > 0 ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length : 50

      const weights = [20, 15, 20, 15, 15, 10, 5]
      const categoryScores = [
        valCatScore,
        profCatScore,
        growthCatScore,
        solvCatScore,
        cfCatScore,
        divCatScore,
        riskCatScore,
      ]

      let weightedSum = 0
      let totalCatWeight = 0

      for (let i = 0; i < weights.length; i++) {
        weightedSum += categoryScores[i] * weights[i]
        totalCatWeight += weights[i]
      }

      score = totalCatWeight > 0 ? Math.round(weightedSum / totalCatWeight) : null

      const verdictTone =
        score === null ? 'neutral' : score >= 65 ? 'positive' : score >= 45 ? 'neutral' : 'negative'
      const verdict =
        score === null
          ? 'Data belum cukup'
          : score >= 65
            ? 'Sinyal fundamental positif'
            : score >= 45
              ? 'Sinyal fundamental campuran'
              : 'Sinyal fundamental negatif'
      const positiveRules = testedRules.filter((rule) => rule.status === 'positive')
      const negativeRules = testedRules.filter((rule) => rule.status === 'negative')
      const summary =
        score === null
          ? 'Minimal empat variabel teruji diperlukan agar skor tidak menyesatkan.'
          : `Skor ${score}/100 dari ${testedRules.length} variabel teruji. Hasil ini adalah penyaring awal, bukan kepastian harga akan naik.`

      return {
        score,
        verdict,
        verdictTone,
        valuationSignal,
        valuationLabel,
        valuationSummary,
        horizonSignal,
        horizonLabel,
        horizonSummary,
        summary,
        testedVariables: testedRules.length,
        totalVariables: rules.length,
        positiveRules,
        negativeRules,
        rules,
      }
    }

    // Discrete (rule-based screener): weighted points -> 0-100
    const weightedPoints = testedRules.reduce((total, rule) => total + rule.points * rule.weight, 0)
    score = Math.round(50 + 50 * (weightedPoints / totalWeight))
  }

  const verdictTone =
    score === null ? 'neutral' : score >= 65 ? 'positive' : score >= 45 ? 'neutral' : 'negative'
  const verdict =
    score === null
      ? 'Data belum cukup'
      : score >= 65
        ? 'Sinyal fundamental positif'
        : score >= 45
          ? 'Sinyal fundamental campuran'
          : 'Sinyal fundamental negatif'
  const positiveRules = testedRules.filter((rule) => rule.status === 'positive')
  const negativeRules = testedRules.filter((rule) => rule.status === 'negative')
  const summary =
    score === null
      ? 'Minimal empat variabel teruji diperlukan agar skor tidak menyesatkan.'
      : `Skor ${score}/100 dari ${testedRules.length} variabel teruji. Hasil ini adalah penyaring awal, bukan kepastian harga akan naik.`

  return {
    score,
    verdict,
    verdictTone,
    valuationSignal,
    valuationLabel,
    valuationSummary,
    horizonSignal,
    horizonLabel,
    horizonSummary,
    summary,
    testedVariables: testedRules.length,
    totalVariables: rules.length,
    positiveRules,
    negativeRules,
    rules,
  }
}
