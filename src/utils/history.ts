import type { StockAnalysis } from './analysis'
import type { StockData } from './types'

export const SAVE_SCORE_THRESHOLD = 65
export const MAX_HISTORY_SNAPSHOTS = 100
const HISTORY_STORAGE_KEY = 'sahamlens:parsing-history:v1'

export interface HistorySnapshot {
  readonly id: string
  readonly date: string
  readonly ticker: string | null
  readonly companyName: string | null
  readonly rawText: string | null
  readonly score: number
  readonly verdict: string
  readonly price: number | null
  readonly peTtm: number | null
  readonly revenueTtm: number | null
  readonly netIncomeTtm: number | null
  readonly freeCashflowTtm: number | null
}

export type HistoryMetricKey =
  'score' | 'price' | 'peTtm' | 'revenueTtm' | 'netIncomeTtm' | 'freeCashflowTtm'

export interface HistoryMetricDefinition {
  readonly key: HistoryMetricKey
  readonly label: string
  readonly unit: string
}

export interface HistorySnapshotUpdate {
  readonly date: string
}

export type HistoryWriteFailure = 'limit' | 'storage'

export interface HistoryWriteResult {
  readonly snapshots: readonly HistorySnapshot[]
  readonly persisted: boolean
  readonly failure: HistoryWriteFailure | null
}

export const HISTORY_METRICS: readonly HistoryMetricDefinition[] = [
  { key: 'score', label: 'Skor analisis', unit: '/100' },
  { key: 'price', label: 'Harga saham', unit: 'IDR' },
  { key: 'peTtm', label: 'PE TTM', unit: 'x' },
  { key: 'revenueTtm', label: 'Pendapatan TTM', unit: 'IDR miliar' },
  { key: 'netIncomeTtm', label: 'Laba bersih TTM', unit: 'IDR miliar' },
  { key: 'freeCashflowTtm', label: 'Arus kas bebas TTM', unit: 'IDR miliar' },
]

const localDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const todayIso = (): string => localDate(new Date())

const sortHistory = (snapshots: readonly HistorySnapshot[]): HistorySnapshot[] =>
  [...snapshots].sort(
    (left, right) => left.date.localeCompare(right.date) || left.id.localeCompare(right.id)
  )

const isIsoDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value)

const nullableNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const toHistorySnapshot = (value: unknown): HistorySnapshot | null => {
  if (!value || typeof value !== 'object') return null
  const snapshot = value as Partial<HistorySnapshot>
  const id = snapshot.id
  const date = snapshot.date
  const score = snapshot.score
  const verdict = snapshot.verdict
  if (
    typeof id !== 'string' ||
    typeof date !== 'string' ||
    !isIsoDate(date) ||
    typeof score !== 'number' ||
    !Number.isFinite(score) ||
    typeof verdict !== 'string'
  ) {
    return null
  }

  return {
    id,
    date,
    ticker: typeof snapshot.ticker === 'string' ? snapshot.ticker : null,
    companyName: typeof snapshot.companyName === 'string' ? snapshot.companyName : null,
    rawText: typeof snapshot.rawText === 'string' ? snapshot.rawText : null,
    score,
    verdict,
    price: nullableNumber(snapshot.price),
    peTtm: nullableNumber(snapshot.peTtm),
    revenueTtm: nullableNumber(snapshot.revenueTtm),
    netIncomeTtm: nullableNumber(snapshot.netIncomeTtm),
    freeCashflowTtm: nullableNumber(snapshot.freeCashflowTtm),
  }
}

const writeHistory = (snapshots: readonly HistorySnapshot[]): HistoryWriteResult => {
  if (typeof window === 'undefined') return { snapshots, persisted: false, failure: 'storage' }
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(snapshots))
    return { snapshots, persisted: true, failure: null }
  } catch {
    return { snapshots, persisted: false, failure: 'storage' }
  }
}

export const loadHistory = (): readonly HistorySnapshot[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = window.localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed)
      ? sortHistory(
          parsed.flatMap((value) => {
            const snapshot = toHistorySnapshot(value)
            return snapshot ? [snapshot] : []
          })
        )
      : []
  } catch {
    return []
  }
}

const snapshotId = (stockData: StockData, date: string): string => {
  const identity =
    stockData.stock_identity.ticker || stockData.stock_identity.company_name || 'unknown-stock'
  return `${identity.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${date}`
}

export const hasHistorySnapshot = (stockData: StockData, date: string): boolean =>
  loadHistory().some((snapshot) => snapshot.id === snapshotId(stockData, date))

export const saveHistorySnapshot = (
  stockData: StockData,
  analysis: StockAnalysis,
  date: string,
  rawText = ''
): HistoryWriteResult => {
  if (analysis.score === null || analysis.score < SAVE_SCORE_THRESHOLD)
    return { snapshots: loadHistory(), persisted: true, failure: null }

  const nextSnapshot: HistorySnapshot = {
    id: snapshotId(stockData, date),
    date,
    ticker: stockData.stock_identity.ticker,
    companyName: stockData.stock_identity.company_name,
    rawText: rawText.trim() ? rawText : null,
    score: analysis.score,
    verdict: analysis.verdict,
    price: stockData.market_quote.snapshots[0]?.price ?? null,
    peTtm: stockData.current_valuation.current_pe_ratio_ttm,
    revenueTtm: stockData.income_statement.revenue_ttm_idr_billion,
    netIncomeTtm: stockData.income_statement.net_income_ttm_idr_billion,
    freeCashflowTtm: stockData.cash_flow_statement.free_cashflow_ttm_idr_billion,
  }
  const currentHistory = loadHistory()
  const isExistingSnapshot = currentHistory.some((snapshot) => snapshot.id === nextSnapshot.id)
  if (!isExistingSnapshot && currentHistory.length >= MAX_HISTORY_SNAPSHOTS) {
    return { snapshots: currentHistory, persisted: false, failure: 'limit' }
  }

  const nextHistory = sortHistory([
    ...currentHistory.filter((snapshot) => snapshot.id !== nextSnapshot.id),
    nextSnapshot,
  ])
  return writeHistory(nextHistory)
}

export const deleteHistorySnapshot = (id: string): HistoryWriteResult => {
  const nextHistory = loadHistory().filter((snapshot) => snapshot.id !== id)
  return writeHistory(nextHistory)
}

export const updateHistorySnapshot = (
  id: string,
  update: HistorySnapshotUpdate
): HistoryWriteResult => {
  if (!isIsoDate(update.date)) return { snapshots: loadHistory(), persisted: true, failure: null }
  const currentHistory = loadHistory()
  const currentSnapshot = currentHistory.find((snapshot) => snapshot.id === id)
  if (!currentSnapshot) return { snapshots: currentHistory, persisted: true, failure: null }

  const identity = currentSnapshot.ticker || currentSnapshot.companyName || 'unknown-stock'
  const nextId = `${identity.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${update.date}`
  const nextHistory = sortHistory([
    ...currentHistory.filter((snapshot) => snapshot.id !== id && snapshot.id !== nextId),
    { ...currentSnapshot, id: nextId, date: update.date },
  ])
  return writeHistory(nextHistory)
}

export const getHistoryMetricValue = (
  snapshot: HistorySnapshot,
  metric: HistoryMetricKey
): number | null => nullableNumber(snapshot[metric])

export const getHistoryStockKey = (snapshot: HistorySnapshot): string =>
  snapshot.ticker?.trim().toUpperCase() || snapshot.companyName?.trim().toLowerCase() || snapshot.id

export const findPreviousHistorySnapshot = (
  snapshots: readonly HistorySnapshot[],
  currentSnapshot: HistorySnapshot
): HistorySnapshot | null => {
  const currentIndex = snapshots.findIndex((snapshot) => snapshot.id === currentSnapshot.id)
  if (currentIndex <= 0) return null
  const stockKey = getHistoryStockKey(currentSnapshot)
  return (
    [...snapshots.slice(0, currentIndex)]
      .reverse()
      .find((snapshot) => getHistoryStockKey(snapshot) === stockKey) ?? null
  )
}
