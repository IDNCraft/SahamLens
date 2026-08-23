/// <reference types="node" />

import { deepEqual, equal, notEqual, ok } from 'node:assert/strict'
import { test } from 'node:test'
import type { StockData } from './types'
import { createElement, useMemo, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { buildAnalysis } from './analysis'
import { buildStockData } from './stockData'

type ScoringMethod = 'discrete' | 'continuous'
type StockAnalysis = ReturnType<typeof buildAnalysis>

const createStockData = (): StockData => {
  const emptyStockData = buildStockData('', [])

  return {
    ...emptyStockData,
    current_valuation: {
      ...emptyStockData.current_valuation,
      current_pe_ratio_annualised: 11,
      current_pe_ratio_ttm: 10,
      forward_pe_ratio: 12,
      current_price_to_book_value: 1.5,
      ev_to_ebitda_ttm: 8,
    },
    management_effectiveness: {
      ...emptyStockData.management_effectiveness,
      return_on_equity_ttm_percent: 15,
    },
    growth: {
      ...emptyStockData.growth,
      revenue_quarter_yoy_growth_percent: 10,
      net_income_quarter_yoy_growth_percent: 12,
    },
    solvency: {
      ...emptyStockData.solvency,
      current_ratio_quarter: 1.8,
      debt_to_equity_ratio_quarter: 0.6,
      interest_coverage_ttm: 5,
      altman_z_score_modified: 3,
    },
    cash_flow_statement: {
      ...emptyStockData.cash_flow_statement,
      cash_from_operations_ttm_idr_billion: 100,
      free_cashflow_ttm_idr_billion: 80,
    },
    dividend: {
      ...emptyStockData.dividend,
      dividend_yield: 4,
      payout_ratio: 50,
    },
    market_rank: {
      ...emptyStockData.market_rank,
      piotroski_f_score: 7,
      relative_strength_rating_percent: 75,
    },
    price_performance: {
      ...emptyStockData.price_performance,
      periods: {
        ...emptyStockData.price_performance.periods,
        '1M': { return_percent: 5, low: null, high: null },
        '3M': { return_percent: 8, low: null, high: null },
        '1Y': { return_percent: 20, low: null, high: null },
        '3Y': { return_percent: 35, low: null, high: null },
      },
    },
  }
}

const createChangedStockData = (stockData: StockData): StockData => ({
  ...stockData,
  current_valuation: {
    ...stockData.current_valuation,
    current_pe_ratio_ttm: 40,
    current_price_to_book_value: 4,
    ev_to_ebitda_ttm: 30,
  },
})

type MemoizedAnalysisProbeProps = {
  readonly stockData: StockData
  readonly scoringMethod: ScoringMethod
  readonly nonScoringUpdates: number
  readonly onCompute: () => void
}

const MemoizedAnalysisProbe = ({
  stockData,
  scoringMethod,
  nonScoringUpdates,
  onCompute,
}: MemoizedAnalysisProbeProps) => {
  const [updateCount, setUpdateCount] = useState(0)
  const analysis = useMemo(() => {
    onCompute()
    return buildAnalysis(stockData, scoringMethod)
  }, [onCompute, scoringMethod, stockData])

  if (updateCount < nonScoringUpdates) {
    setUpdateCount(updateCount + 1)
  }

  return createElement('output', null, `${analysis.score}:${analysis.verdict}`)
}

type AnalysisTransitionProbeProps = {
  readonly initialStockData: StockData
  readonly nextStockData: StockData
  readonly initialScoringMethod: ScoringMethod
  readonly nextScoringMethod: ScoringMethod
  readonly renderedAnalyses: StockAnalysis[]
  readonly onCompute: () => void
}

const AnalysisTransitionProbe = ({
  initialStockData,
  nextStockData,
  initialScoringMethod,
  nextScoringMethod,
  renderedAnalyses,
  onCompute,
}: AnalysisTransitionProbeProps) => {
  const [phase, setPhase] = useState(0)
  const stockData = phase === 0 ? initialStockData : nextStockData
  const scoringMethod = phase === 0 ? initialScoringMethod : nextScoringMethod
  const analysis = useMemo(() => {
    onCompute()
    return buildAnalysis(stockData, scoringMethod)
  }, [onCompute, scoringMethod, stockData])

  renderedAnalyses.push(analysis)

  if (phase === 0) {
    setPhase(1)
  }

  return createElement('output', null, `${analysis.score}:${analysis.verdict}`)
}

test('keeps score, verdict, and rules identical for the same input', () => {
  const stockData = createStockData()
  const firstAnalysis = buildAnalysis(stockData, 'discrete')
  const secondAnalysis = buildAnalysis(stockData, 'discrete')

  equal(firstAnalysis.score, secondAnalysis.score)
  equal(firstAnalysis.verdict, secondAnalysis.verdict)
  deepEqual(firstAnalysis.rules, secondAnalysis.rules)
})

test('recomputes when parsed data or scoring method changes', () => {
  const initialStockData = createStockData()
  const nextStockData = createChangedStockData(initialStockData)
  const renderedAnalyses: StockAnalysis[] = []
  let analysisComputations = 0

  renderToStaticMarkup(
    createElement(AnalysisTransitionProbe, {
      initialStockData,
      nextStockData,
      initialScoringMethod: 'discrete',
      nextScoringMethod: 'continuous',
      renderedAnalyses,
      onCompute: () => {
        analysisComputations += 1
      },
    })
  )

  const expectedNextAnalysis = buildAnalysis(nextStockData, 'continuous')

  equal(analysisComputations, 2)
  equal(renderedAnalyses.length, 2)
  equal(renderedAnalyses.at(-1)?.score, expectedNextAnalysis.score)
  equal(renderedAnalyses.at(-1)?.verdict, expectedNextAnalysis.verdict)
  deepEqual(renderedAnalyses.at(-1)?.rules, expectedNextAnalysis.rules)
})

test('benchmark: skips analysis recomputation for non-scoring state updates', () => {
  const stockData = createStockData()
  const nonScoringUpdates = 25
  const naiveComputations = nonScoringUpdates + 1
  let analysisComputations = 0

  renderToStaticMarkup(
    createElement(MemoizedAnalysisProbe, {
      stockData,
      scoringMethod: 'discrete',
      nonScoringUpdates,
      onCompute: () => {
        analysisComputations += 1
      },
    })
  )

  equal(analysisComputations, 1)
  ok(analysisComputations < naiveComputations)
})

test('produces different analysis when scoring method changes', () => {
  const stockData = createStockData()
  const discreteAnalysis = buildAnalysis(stockData, 'discrete')
  const continuousAnalysis = buildAnalysis(stockData, 'continuous')

  notEqual(discreteAnalysis.score, continuousAnalysis.score)
})
