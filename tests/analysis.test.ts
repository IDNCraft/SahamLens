import type { StockData } from '../src/utils/types'
import { afterEach, describe, expect, it } from 'bun:test'

import { buildAnalysis } from '../src/utils/analysis'
import { SAVE_SCORE_THRESHOLD, saveHistorySnapshot } from '../src/utils/history'
import { parseStockText } from '../src/utils/parser'

type StockDataOverrides = {
  readonly current_valuation?: Partial<StockData['current_valuation']>
  readonly management_effectiveness?: Partial<StockData['management_effectiveness']>
  readonly growth?: Partial<StockData['growth']>
  readonly solvency?: Partial<StockData['solvency']>
  readonly cash_flow_statement?: Partial<StockData['cash_flow_statement']>
  readonly market_rank?: Partial<StockData['market_rank']>
}

const emptyStockData = parseStockText('').stockData

const makeStockData = (overrides: StockDataOverrides = {}): StockData => ({
  ...emptyStockData,
  current_valuation: { ...emptyStockData.current_valuation, ...overrides.current_valuation },
  management_effectiveness: {
    ...emptyStockData.management_effectiveness,
    ...overrides.management_effectiveness,
  },
  growth: { ...emptyStockData.growth, ...overrides.growth },
  solvency: { ...emptyStockData.solvency, ...overrides.solvency },
  cash_flow_statement: {
    ...emptyStockData.cash_flow_statement,
    ...overrides.cash_flow_statement,
  },
  market_rank: { ...emptyStockData.market_rank, ...overrides.market_rank },
})

const positiveDataWithoutDividend = makeStockData({
  current_valuation: {
    current_pe_ratio_ttm: 10,
    current_price_to_book_value: 1,
  },
  management_effectiveness: { return_on_equity_ttm_percent: 15 },
  growth: {
    revenue_quarter_yoy_growth_percent: 20,
    net_income_quarter_yoy_growth_percent: 20,
  },
  solvency: {
    current_ratio_quarter: 2,
    debt_to_equity_ratio_quarter: 0.5,
  },
  cash_flow_statement: { free_cashflow_ttm_idr_billion: 100 },
  market_rank: { piotroski_f_score: 8 },
})

describe('continuous scoring', () => {
  it('does not penalize nine positive rules when dividend data is missing', () => {
    const discreteAnalysis = buildAnalysis(positiveDataWithoutDividend, 'discrete')
    const continuousAnalysis = buildAnalysis(positiveDataWithoutDividend, 'continuous')

    expect(discreteAnalysis.testedVariables).toBe(9)
    expect(discreteAnalysis.score).toBe(100)
    expect(positiveDataWithoutDividend.dividend.dividend_yield).toBeNull()
    expect(continuousAnalysis.score).toBe(93)
  })

  it('returns no score when all categories are empty', () => {
    const analysis = buildAnalysis(makeStockData(), 'continuous')

    expect(analysis.testedVariables).toBe(0)
    expect(analysis.score).toBeNull()
    expect(analysis.rules.every((rule) => rule.status === 'missing')).toBe(true)
  })

  it('renormalizes category weights for partial data', () => {
    const partialData = makeStockData({
      current_valuation: { current_pe_ratio_ttm: 5 },
      management_effectiveness: { return_on_equity_ttm_percent: 15 },
      growth: { revenue_quarter_yoy_growth_percent: 25 },
      cash_flow_statement: { free_cashflow_ttm_idr_billion: 100 },
    })

    const analysis = buildAnalysis(partialData, 'continuous')

    expect(analysis.testedVariables).toBe(4)
    expect(analysis.score).toBe(100)
  })
})

describe('history save threshold', () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'window')
  })

  it('keeps the save boundary at 65', () => {
    const stored = new Map<string, string>()
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        localStorage: {
          getItem: (key: string) => stored.get(key) ?? null,
          setItem: (key: string, value: string) => {
            stored.set(key, value)
          },
        },
      },
    })

    const stockData = makeStockData()
    const baseAnalysis = buildAnalysis(stockData, 'discrete')
    const belowThreshold = saveHistorySnapshot(
      stockData,
      { ...baseAnalysis, score: SAVE_SCORE_THRESHOLD - 1 },
      '2026-08-23'
    )
    const atThreshold = saveHistorySnapshot(
      stockData,
      { ...baseAnalysis, score: SAVE_SCORE_THRESHOLD },
      '2026-08-24'
    )

    expect(SAVE_SCORE_THRESHOLD).toBe(65)
    expect(belowThreshold.snapshots).toHaveLength(0)
    expect(atThreshold.persisted).toBe(true)
    expect(atThreshold.snapshots).toHaveLength(1)
    expect(atThreshold.snapshots[0]?.score).toBe(65)
  })
})
