import type { HistorySnapshot } from './history'
import type { StockData } from './types'

import { getHistoryStockKey, todayIso } from './history'

const historyNumberFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 })
const historyDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export const formatHistoryValue = (value: number | null, unit: string): string => {
  if (value === null) return '-'
  if (unit === '/100') return `${historyNumberFormatter.format(value)}/100`
  if (unit === 'IDR') return `IDR ${historyNumberFormatter.format(value)}`
  if (unit === 'x') return `${historyNumberFormatter.format(value)}x`
  return `${historyNumberFormatter.format(value)} ${unit}`
}

export const formatHistoryDate = (date: string): string => {
  const parsedDate = new Date(`${date}T00:00:00`)
  return Number.isNaN(parsedDate.getTime()) ? date : historyDateFormatter.format(parsedDate)
}

const weekdayIndexes: Readonly<Record<string, number>> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
}

const localIsoDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const resolveHistoryDate = (stockData: StockData): string => {
  const quoteDate = stockData.market_quote.snapshots[0]?.date?.trim() ?? ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(quoteDate)) return quoteDate

  const weekday = weekdayIndexes[quoteDate.slice(0, 3).toLowerCase()]
  if (weekday === undefined) return todayIso()

  const currentDate = new Date()
  const daysSinceQuote = (currentDate.getDay() - weekday + 7) % 7
  currentDate.setDate(currentDate.getDate() - daysSinceQuote)
  return localIsoDate(currentDate)
}

export const formatHistoryStock = (snapshot: HistorySnapshot): string =>
  [snapshot.ticker, snapshot.companyName].filter(Boolean).join(' / ') || 'Saham tidak dikenal'

export const historyUrlParams = (snapshot: HistorySnapshot): URLSearchParams => {
  const params = new URLSearchParams()
  params.set('history', '1')
  params.set('code', getHistoryStockKey(snapshot))
  params.set('date', snapshot.date)
  return params
}

export const readHistoryParams = (search: string): { code: string | null; date: string | null } => {
  const params = new URLSearchParams(search)
  if (params.get('history') === null) return { code: null, date: null }
  return { code: params.get('code'), date: params.get('date') }
}

export const latestSnapshotsByStock = (
  snapshots: readonly HistorySnapshot[]
): readonly HistorySnapshot[] =>
  Array.from(
    snapshots
      .reduce((latest, snapshot) => {
        const stockKey = getHistoryStockKey(snapshot)
        const current = latest.get(stockKey)
        if (
          !current ||
          snapshot.date > current.date ||
          (snapshot.date === current.date && snapshot.id > current.id)
        ) {
          latest.set(stockKey, snapshot)
        }
        return latest
      }, new Map<string, HistorySnapshot>())
      .values()
  ).sort((left, right) => getHistoryStockKey(left).localeCompare(getHistoryStockKey(right)))
