import assert from 'node:assert/strict'
import { test } from 'node:test'

import { makeSyntheticStockData } from './fixtures/syntheticSnapshots'
import { buildAnalysis } from '../src/utils/analysis'

const makePositiveStockData = () =>
  makeSyntheticStockData({
    current_valuation: {
      current_pe_ratio_ttm: 10,
      current_price_to_book_value: 1,
      ev_to_ebitda_ttm: 8,
    },
    management_effectiveness: { return_on_equity_ttm_percent: 20 },
    growth: {
      revenue_quarter_yoy_growth_percent: 12,
      net_income_quarter_yoy_growth_percent: 12,
    },
    solvency: {
      current_ratio_quarter: 2,
      debt_to_equity_ratio_quarter: 0.3,
      interest_coverage_ttm: 6,
      altman_z_score_modified: 4,
    },
    cash_flow_statement: { free_cashflow_ttm_idr_billion: 100 },
    market_rank: { piotroski_f_score: 8 },
  })

const ruleStatus = (id: string, stockData = makeSyntheticStockData()) =>
  buildAnalysis(stockData).rules.find((rule) => rule.id === id)?.status

test('discrete scoring returns a positive verdict for consistently positive rules', () => {
  const analysis = buildAnalysis(makePositiveStockData(), 'discrete')

  assert.equal(analysis.score, 100)
  assert.equal(analysis.verdict, 'Sinyal fundamental positif')
  assert.equal(analysis.verdictTone, 'positive')
  assert.equal(analysis.testedVariables, 12)
  assert.equal(analysis.positiveRules.length, 12)
  assert.equal(analysis.negativeRules.length, 0)
})

test('continuous scoring evaluates partially populated categories instead of dropping the score', () => {
  const stockData = makeSyntheticStockData({
    current_valuation: { current_pe_ratio_ttm: 20 },
    management_effectiveness: { return_on_equity_ttm_percent: 10 },
    growth: { revenue_quarter_yoy_growth_percent: 5 },
    solvency: { current_ratio_quarter: 1.2 },
  })
  const discrete = buildAnalysis(stockData, 'discrete')
  const continuous = buildAnalysis(stockData, 'continuous')

  assert.equal(discrete.score, 50)
  assert.equal(continuous.score, 51)
  assert.equal(continuous.testedVariables, 4)
  assert.equal(continuous.rules.filter((rule) => rule.status === 'missing').length, 8)
  assert.equal(continuous.verdict, 'Sinyal fundamental campuran')
  assert.equal(continuous.verdictTone, 'neutral')
})

test('rule boundaries keep inclusive thresholds and zero cash flow negative', () => {
  assert.equal(
    ruleStatus(
      'pe-ttm',
      makeSyntheticStockData({ current_valuation: { current_pe_ratio_ttm: 15 } })
    ),
    'positive'
  )
  assert.equal(
    ruleStatus(
      'pe-ttm',
      makeSyntheticStockData({ current_valuation: { current_pe_ratio_ttm: 15.01 } })
    ),
    'neutral'
  )
  assert.equal(
    ruleStatus(
      'pe-ttm',
      makeSyntheticStockData({ current_valuation: { current_pe_ratio_ttm: 25 } })
    ),
    'neutral'
  )
  assert.equal(
    ruleStatus(
      'pe-ttm',
      makeSyntheticStockData({ current_valuation: { current_pe_ratio_ttm: 25.01 } })
    ),
    'negative'
  )
  assert.equal(
    ruleStatus(
      'roe',
      makeSyntheticStockData({ management_effectiveness: { return_on_equity_ttm_percent: 15 } })
    ),
    'positive'
  )
  assert.equal(
    ruleStatus(
      'roe',
      makeSyntheticStockData({ management_effectiveness: { return_on_equity_ttm_percent: 8 } })
    ),
    'neutral'
  )
  assert.equal(
    ruleStatus(
      'roe',
      makeSyntheticStockData({ management_effectiveness: { return_on_equity_ttm_percent: 7.99 } })
    ),
    'negative'
  )
  assert.equal(
    ruleStatus(
      'free-cash-flow',
      makeSyntheticStockData({ cash_flow_statement: { free_cashflow_ttm_idr_billion: 0 } })
    ),
    'negative'
  )
})

test('verdict labels cover positive, neutral, negative, and insufficient data', () => {
  const positive = buildAnalysis(
    makeSyntheticStockData({
      current_valuation: { current_pe_ratio_ttm: 10, current_price_to_book_value: 1 },
      management_effectiveness: { return_on_equity_ttm_percent: 15 },
      growth: { revenue_quarter_yoy_growth_percent: 10 },
    })
  )
  const neutral = buildAnalysis(
    makeSyntheticStockData({
      current_valuation: { current_pe_ratio_ttm: 20, current_price_to_book_value: 2 },
      management_effectiveness: { return_on_equity_ttm_percent: 10 },
      growth: { revenue_quarter_yoy_growth_percent: 5 },
    })
  )
  const negative = buildAnalysis(
    makeSyntheticStockData({
      current_valuation: { current_pe_ratio_ttm: 30, current_price_to_book_value: 4 },
      management_effectiveness: { return_on_equity_ttm_percent: 5 },
      growth: { revenue_quarter_yoy_growth_percent: -1 },
    })
  )
  const insufficient = buildAnalysis(makeSyntheticStockData())

  assert.deepEqual(
    [positive.score, positive.verdict, positive.verdictTone],
    [100, 'Sinyal fundamental positif', 'positive']
  )
  assert.deepEqual(
    [neutral.score, neutral.verdict, neutral.verdictTone],
    [50, 'Sinyal fundamental campuran', 'neutral']
  )
  assert.deepEqual(
    [negative.score, negative.verdict, negative.verdictTone],
    [0, 'Sinyal fundamental negatif', 'negative']
  )
  assert.deepEqual(
    [insufficient.score, insufficient.verdict, insufficient.verdictTone],
    [null, 'Data belum cukup', 'neutral']
  )
  assert.equal(insufficient.testedVariables, 0)
  assert.equal(
    insufficient.rules.every((rule) => rule.status === 'missing'),
    true
  )
})
