/// <reference types="node" />

import * as assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseStockText } from './parser'

const growthBlock = ['Growth', 'Revenue (Quarter YoY Growth)', '8%'].join('\n')

const denseSnapshot = [
  'Current Valuation',
  'Current PE Ratio (TTM)',
  '12',
  'Per Share',
  'Current EPS (TTM)',
  '5',
  'Solvency',
  'Current Ratio (Quarter)',
  '1.5',
  'Management Effectiveness',
  'Return on Equity (TTM)',
  '12%',
  'Profitability',
  'Gross Profit Margin (Quarter)',
  '25%',
  growthBlock,
  'Dividend',
  'Dividend Yield',
  '2%',
  'Market Rank',
  'EPS Rating',
  '85',
  'Income Statement',
  'Period',
  '2023',
  '2024',
  'Q1',
  '100',
  '110',
  'Balance Sheet',
  'Total Assets (Quarter)',
  '1B',
  'Cash Flow Statement',
  'Free cash flow (TTM)',
  '100M',
  'Price Performance',
  '1D',
  '+1%',
  '100',
  '110',
].join('\n')

describe('parseStockText warnings', () => {
  it('warns for empty input', () => {
    const result = parseStockText('')

    assert.equal(result.isPartial, true)
    assert.equal(result.warnings[0]?.type, 'empty-input')
  })

  it('marks minimal input as partial while preserving parsed fields', () => {
    const result = parseStockText(
      ['Current Valuation', 'Current PE Ratio (TTM)', '12.5'].join('\n')
    )

    assert.equal(result.isPartial, true)
    assert.equal(result.stockData.current_valuation.current_pe_ratio_ttm, 12.5)
    assert.equal(
      result.warnings.some((warning) => warning.type === 'missing-section'),
      true
    )
  })

  it('reports a known field whose value is missing', () => {
    const result = parseStockText(['Current Valuation', 'Current PE Ratio (TTM)'].join('\n'))

    assert.equal(
      result.warnings.some((warning) => warning.type === 'missing-field'),
      true
    )
    assert.equal(
      result.warnings.some((warning) => warning.evidence.includes('Current PE Ratio')),
      true
    )
  })

  it('does not warn for a dense snapshot with every supported section', () => {
    const result = parseStockText(denseSnapshot)

    assert.equal(result.isPartial, false)
    assert.equal(result.warnings.length, 0)
    assert.equal(result.sections.length, 12)
    assert.equal(result.stockData.current_valuation.current_pe_ratio_ttm, 12)
  })

  it('identifies a missing section and keeps the other sections', () => {
    const result = parseStockText(denseSnapshot.replace(`${growthBlock}\n`, ''))

    assert.equal(result.isPartial, true)
    assert.equal(
      result.sections.some((section) => section.title === 'Current Valuation'),
      true
    )
    assert.equal(
      result.warnings.some(
        (warning) => warning.type === 'missing-section' && warning.evidence.includes('Growth')
      ),
      true
    )
  })

  it('reports an unknown label without blocking known fields', () => {
    const result = parseStockText(
      ['Current Valuation', 'Current PE Ratio (TTM)', '12.5', 'Mystery Metric', '42'].join('\n')
    )

    assert.equal(result.stockData.current_valuation.current_pe_ratio_ttm, 12.5)
    assert.deepEqual(result.sections[0]?.metrics, [
      { label: 'Current PE Ratio (TTM)', value: '12.5' },
    ])
    assert.equal(
      result.warnings.some(
        (warning) =>
          warning.type === 'unknown-label' &&
          warning.message.includes('Mystery Metric') &&
          warning.evidence.includes('42')
      ),
      true
    )
  })
})
