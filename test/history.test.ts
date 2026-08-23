import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'

import { makeSyntheticStockData } from './fixtures/syntheticSnapshots'
import { buildAnalysis } from '../src/utils/analysis'
import {
  deleteHistorySnapshot,
  loadHistory,
  saveHistorySnapshot,
  updateHistorySnapshot,
} from '../src/utils/history'

const HISTORY_STORAGE_KEY = 'sahamlens:parsing-history:v1'

const createLocalStorage = (): Storage => {
  const entries = new Map<string, string>()

  return {
    get length() {
      return entries.size
    },
    clear: () => entries.clear(),
    getItem: (key) => entries.get(key) ?? null,
    key: (index) => [...entries.keys()][index] ?? null,
    removeItem: (key) => {
      entries.delete(key)
    },
    setItem: (key, value) => {
      entries.set(key, value)
    },
  } as Storage
}

const makeHistoryStockData = (price = 1250, ticker = 'ZZZZ') =>
  makeSyntheticStockData({
    stock_identity: { ticker, company_name: 'Perusahaan Contoh Tbk.' },
    market_quote: {
      snapshots: [
        {
          price,
          price_change: 0,
          price_change_percent: 0,
          session: 'Today',
          date: 'Fri',
          time: '09:30',
          timezone: 'WIB',
          volume: 3,
          volume_unit: 'juta',
          average_volume: 1.2,
          average_volume_unit: 'juta',
        },
      ],
    },
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

const saveSyntheticSnapshot = (
  stockData = makeHistoryStockData(),
  date = '2026-01-01',
  rawText = ''
) => saveHistorySnapshot(stockData, buildAnalysis(stockData), date, rawText)

const dateAt = (offset: number): string => {
  const date = new Date(Date.UTC(2026, 0, 1 + offset))
  return date.toISOString().slice(0, 10)
}

let previousWindow: Window | undefined

beforeEach(() => {
  previousWindow = Reflect.get(globalThis, 'window') as Window | undefined
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { localStorage: createLocalStorage() } as unknown as Window,
  })
})

afterEach(() => {
  if (previousWindow === undefined) {
    Reflect.deleteProperty(globalThis, 'window')
  } else {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: previousWindow,
    })
  }
})

test('history ignores invalid stored JSON and reports storage failures', () => {
  globalThis.window.localStorage.setItem(HISTORY_STORAGE_KEY, '{invalid json')
  assert.deepEqual(loadHistory(), [])

  globalThis.window.localStorage.setItem(
    HISTORY_STORAGE_KEY,
    JSON.stringify([
      { id: 'invalid-date', date: '2026-1-1', score: 80, verdict: 'valid-looking' },
      { id: 'valid', date: '2026-01-02', score: 80, verdict: 'valid' },
    ])
  )
  const loaded = loadHistory()
  assert.equal(loaded.length, 1)
  assert.equal(loaded[0]?.id, 'valid')
  assert.equal(loaded[0]?.rawText, null)

  Object.defineProperty(globalThis.window, 'localStorage', {
    configurable: true,
    get: () => {
      throw new Error('synthetic storage unavailable')
    },
  })
  assert.deepEqual(loadHistory(), [])
  const failedWrite = saveSyntheticSnapshot()
  assert.equal(failedWrite.persisted, false)
  assert.equal(failedWrite.failure, 'storage')
})

test('history enforces a limit of 100 snapshots', () => {
  const stockData = makeHistoryStockData()

  for (let index = 0; index < 100; index += 1) {
    const result = saveSyntheticSnapshot(stockData, dateAt(index))
    assert.equal(result.failure, null)
    assert.equal(result.persisted, true)
  }

  const overflow = saveSyntheticSnapshot(stockData, dateAt(100))
  assert.equal(overflow.snapshots.length, 100)
  assert.equal(overflow.persisted, false)
  assert.equal(overflow.failure, 'limit')
})

test('history replaces same-stock duplicate dates but keeps other stocks', () => {
  const date = dateAt(0)
  saveSyntheticSnapshot(makeHistoryStockData(1000), date, 'first')
  const replacement = saveSyntheticSnapshot(makeHistoryStockData(2000), date, 'replacement')
  const otherStock = saveSyntheticSnapshot(makeHistoryStockData(3000, 'YYYY'), date, 'other stock')

  assert.equal(replacement.snapshots.length, 1)
  assert.equal(otherStock.snapshots.length, 2)
  const loaded = loadHistory()
  assert.equal(loaded.length, 2)
  assert.equal(loaded.find((snapshot) => snapshot.ticker === 'ZZZZ')?.price, 2000)
  assert.equal(loaded.find((snapshot) => snapshot.ticker === 'ZZZZ')?.rawText, 'replacement')
})

test('history deletes a snapshot and edits its date-derived id', () => {
  const saved = saveSyntheticSnapshot(makeHistoryStockData(), dateAt(0), 'synthetic source')
  const id = saved.snapshots[0]?.id ?? ''
  const deleted = deleteHistorySnapshot(id)

  assert.equal(deleted.persisted, true)
  assert.equal(deleted.failure, null)
  assert.deepEqual(loadHistory(), [])

  const savedAgain = saveSyntheticSnapshot(makeHistoryStockData(), dateAt(1), 'synthetic source')
  const original = savedAgain.snapshots[0]
  assert.ok(original)
  const edited = updateHistorySnapshot(original.id, { date: dateAt(3) })

  assert.equal(edited.snapshots.length, 1)
  assert.equal(edited.snapshots[0]?.id, `zzzz-${dateAt(3)}`)
  assert.equal(edited.snapshots[0]?.date, dateAt(3))
  assert.equal(edited.snapshots[0]?.rawText, 'synthetic source')
  assert.equal(
    updateHistorySnapshot(edited.snapshots[0]?.id ?? '', { date: 'not-a-date' }).failure,
    null
  )
})

test('history stores non-empty rawText and drops whitespace-only rawText', () => {
  saveSyntheticSnapshot(makeHistoryStockData(), dateAt(0), ' \n\t')
  saveSyntheticSnapshot(makeHistoryStockData(), dateAt(1), '  synthetic source  ')

  const loaded = loadHistory()
  assert.equal(loaded[0]?.rawText, null)
  assert.equal(loaded[1]?.rawText, '  synthetic source  ')
})
