import assert from 'node:assert/strict'
import { test } from 'node:test'

import { DENSE_SYNTHETIC_SNAPSHOT, SYNTHETIC_SNAPSHOT } from './fixtures/syntheticSnapshots'
import { parseStockText } from '../src/utils/parser'

test('parser recognizes synthetic sections, metrics, identity, units, and missing values', () => {
  const result = parseStockText(SYNTHETIC_SNAPSHOT)
  const sectionTitles = result.sections.map((section) => section.title)

  assert.deepEqual(sectionTitles, [
    'Current Valuation',
    'Per Share',
    'Solvency',
    'Management Effectiveness',
    'Profitability',
    'Growth',
    'Market Rank',
    'Income Statement',
    'Balance Sheet',
    'Cash Flow Statement',
    'Dividend',
    'Price Performance',
  ])

  const metrics = new Map(
    result.sections.flatMap((section) =>
      section.metrics.map((metric) => [metric.label, metric.value])
    )
  )
  assert.equal(metrics.get('Current PE Ratio (TTM)'), '10.5x')
  assert.equal(metrics.get('Current EPS (TTM)'), '25.5')
  assert.equal(metrics.get('Net Income (Quarter YoY Growth)'), '-')
  assert.equal(result.stockData.current_valuation.current_pe_ratio_ttm, 10.5)
  assert.equal(result.stockData.current_valuation.forward_pe_ratio, null)
  assert.equal(result.stockData.stock_identity.ticker, 'ZZZZ')
  assert.equal(result.stockData.stock_identity.company_name, 'Perusahaan Contoh Tbk.')
  assert.equal(result.stockData.stock_identity.followers, 42)
  assert.equal(result.stockData.market_quote.snapshots[0]?.price, 1250)
  assert.equal(result.stockData.market_quote.snapshots[0]?.volume_unit, 'juta')
  assert.equal(result.stockData.market_quote.snapshots[0]?.average_volume, 1.2)
  assert.equal(result.stockData.metadata.amount_unit, 'miliar')
  assert.equal(result.stockData.metadata.percentage_unit, 'percent')
  assert.ok(result.rawLines > result.recognizedLines)
  assert.equal(
    result.sections
      .flatMap((section) => section.metrics)
      .some(({ label }) => label === 'Unknown Format'),
    false
  )
})

test('parser keeps financial, dividend, and performance tables deterministic', () => {
  const result = parseStockText(SYNTHETIC_SNAPSHOT)
  const financialTable = result.sections.find((section) => section.title === 'Income Statement')
    ?.tables[0]
  const dividendTable = result.sections.find((section) => section.title === 'Dividend')?.tables[0]
  const performanceTable = result.sections.find((section) => section.title === 'Price Performance')
    ?.tables[0]

  assert.deepEqual(financialTable, {
    title: 'Net Income / EPS / Revenue',
    headers: ['Period', '2022', '2023'],
    rows: [
      { label: 'Q1', values: ['(10)', '20'] },
      { label: 'Annualised', values: ['40', '50'] },
    ],
  })
  assert.deepEqual(result.stockData.historical_net_income.quarterly.q1, {
    '2022': -10,
    '2023': 20,
  })
  assert.deepEqual(result.stockData.historical_net_income.annualised, { '2022': 40, '2023': 50 })
  assert.deepEqual(dividendTable, {
    title: 'Dividend History',
    headers: ['Period', 'Dividend', 'Ex Date', 'Pay Date'],
    rows: [{ label: 'Fiscal 2023', values: ['0.5', '01 Jan 24', '15 Jan 24'] }],
  })
  assert.deepEqual(result.stockData.dividend.dividend_history, [
    { period: 'Fiscal 2023', dividend: 0.5, ex_date: '01 Jan 24', pay_date: '15 Jan 24' },
  ])
  assert.deepEqual(performanceTable, {
    title: 'Price windows',
    headers: ['Window', 'Change', 'Low', 'High'],
    rows: [
      { label: '1M', values: ['6%', '1,000', '1,300'] },
      { label: '1Y', values: ['12%', '900', '1,400'] },
    ],
  })
  assert.deepEqual(result.stockData.price_performance.periods['1M'], {
    return_percent: 6,
    low: 1000,
    high: 1300,
  })
})

test('parser expands dense text without relying on line breaks', () => {
  const result = parseStockText(DENSE_SYNTHETIC_SNAPSHOT)

  assert.deepEqual(
    result.sections.map((section) => section.title),
    ['Current Valuation', 'Per Share']
  )
  assert.deepEqual(result.sections[0]?.metrics, [
    { label: 'Current PE Ratio (TTM)', value: '10.5x' },
  ])
  assert.deepEqual(result.sections[1]?.metrics, [{ label: 'Current EPS (TTM)', value: '25.5' }])
})
