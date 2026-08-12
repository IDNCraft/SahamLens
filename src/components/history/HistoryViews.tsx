import type { HistoryMetricKey, HistorySnapshot } from '../../utils/history'
import { Check, FileCheck2, Pencil, Trash2, X } from 'lucide-react'
import { useState } from 'react'

import {
  findPreviousHistorySnapshot,
  getHistoryMetricValue,
  getHistoryStockKey,
  HISTORY_METRICS,
  MAX_HISTORY_SNAPSHOTS,
  SAVE_SCORE_THRESHOLD,
} from '../../utils/history'
import {
  formatHistoryDate,
  formatHistoryStock,
  formatHistoryValue,
  latestSnapshotsByStock,
} from '../../utils/historyHelpers'

const MAX_COMPARE_STOCKS = 4

export function ComparisonPanel({ snapshots }: { snapshots: readonly HistorySnapshot[] }) {
  const stockSnapshots = latestSnapshotsByStock(snapshots)
  const stockOptions = stockSnapshots.map((snapshot) => ({
    key: getHistoryStockKey(snapshot),
    snapshot,
  }))
  const [selectedStockKeys, setSelectedStockKeys] = useState<readonly string[]>(() =>
    stockOptions.slice(0, 2).map((option) => option.key)
  )
  const selectedSnapshots = stockOptions
    .filter((option) => selectedStockKeys.includes(option.key))
    .map((option) => option.snapshot)

  const toggleStock = (stockKey: string) => {
    setSelectedStockKeys((current) =>
      current.includes(stockKey)
        ? current.filter((key) => key !== stockKey)
        : current.length < MAX_COMPARE_STOCKS
          ? [...current, stockKey]
          : current
    )
  }

  return (
    <div className="comparison-view">
      <div className="comparison-header">
        <div>
          <span className="panel-kicker">Perbandingan saham tersimpan</span>
          <h3>Bandingkan saham tersimpan</h3>
          <p>Pilih saham untuk membandingkan data terbaru masing-masing.</p>
        </div>
        <strong>
          {selectedSnapshots.length}/{MAX_COMPARE_STOCKS} terpilih
        </strong>
      </div>

      {stockOptions.length > 0 ? (
        <>
          <div className="comparison-selection">
            <div className="comparison-selection-heading">
              <span>Pilih saham</span>
              <small>Maksimal {MAX_COMPARE_STOCKS} saham</small>
            </div>
            <div className="comparison-options">
              {stockOptions.map(({ key, snapshot }) => {
                const isSelected = selectedStockKeys.includes(key)
                return (
                  <label
                    className={`comparison-option ${isSelected ? 'is-selected' : ''}`}
                    key={key}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={!isSelected && selectedSnapshots.length >= MAX_COMPARE_STOCKS}
                      onChange={() => toggleStock(key)}
                    />
                    <span>
                      <strong>{snapshot.ticker || formatHistoryStock(snapshot)}</strong>
                      <small>{snapshot.companyName || 'Nama perusahaan belum ada'}</small>
                    </span>
                    <em>{formatHistoryDate(snapshot.date)}</em>
                  </label>
                )
              })}
            </div>
          </div>

          {selectedSnapshots.length >= 2 ? (
            <div className="comparison-table-wrap">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Metrik</th>
                    {selectedSnapshots.map((snapshot) => (
                      <th key={snapshot.id}>{snapshot.ticker || formatHistoryStock(snapshot)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HISTORY_METRICS.map((metric) => (
                    <tr key={metric.key}>
                      <th scope="row">
                        <strong>{metric.label}</strong>
                        <small>{metric.unit}</small>
                      </th>
                      {selectedSnapshots.map((snapshot) => (
                        <td key={`${snapshot.id}-${metric.key}`}>
                          {formatHistoryValue(
                            getHistoryMetricValue(snapshot, metric.key),
                            metric.unit
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="comparison-verdict-row">
                    <th scope="row">
                      <strong>Kesimpulan</strong>
                      <small>Analisis</small>
                    </th>
                    {selectedSnapshots.map((snapshot) => (
                      <td key={`${snapshot.id}-verdict`}>{snapshot.verdict}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="comparison-empty">
              <strong>Pilih minimal 2 saham.</strong>
              <span>Perbandingan muncul setelah dua snapshot dipilih.</span>
            </div>
          )}
        </>
      ) : (
        <div className="comparison-empty">
          <strong>Belum ada saham tersimpan.</strong>
          <span>
            Simpan data dari tab Analisis saham saat skor mencapai {SAVE_SCORE_THRESHOLD}/100.
          </span>
        </div>
      )}
    </div>
  )
}

type ChartPoint = {
  readonly x: number
  readonly y: number
  readonly value: number
  readonly snapshot: HistorySnapshot
}

export function HistoryChart({
  snapshots,
  metric,
}: {
  snapshots: readonly HistorySnapshot[]
  metric: HistoryMetricKey
}) {
  const definition = HISTORY_METRICS.find((item) => item.key === metric) ?? HISTORY_METRICS[0]
  const chartWidth = 720
  const chartHeight = 250
  const padding = { top: 20, right: 18, bottom: 30, left: 18 }
  const values = snapshots
    .map((snapshot) => getHistoryMetricValue(snapshot, metric))
    .filter((value): value is number => value !== null)

  if (values.length === 0) {
    return (
      <div className="history-empty">Metrik ini belum punya nilai di snapshot yang dipilih.</div>
    )
  }

  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  const range = maximum === minimum ? Math.max(Math.abs(maximum) * 0.1, 1) : maximum - minimum
  const lowerBound = maximum === minimum ? minimum - range : minimum
  const upperBound = maximum === minimum ? maximum + range : maximum
  const plotWidth = chartWidth - padding.left - padding.right
  const plotHeight = chartHeight - padding.top - padding.bottom
  const points = snapshots
    .map((snapshot, index): ChartPoint | null => {
      const value = getHistoryMetricValue(snapshot, metric)
      if (value === null) return null
      const x = padding.left + (index / Math.max(snapshots.length - 1, 1)) * plotWidth
      const y = padding.top + ((upperBound - value) / (upperBound - lowerBound)) * plotHeight
      return { x, y, value, snapshot }
    })
    .filter((point): point is ChartPoint => point !== null)
  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]
  const change = firstPoint && lastPoint ? lastPoint.value - firstPoint.value : 0
  const changeTone = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(' ')

  return (
    <div className="history-chart-wrap">
      <div className="history-chart-summary">
        <div>
          <span className="panel-kicker">Perubahan periode</span>
          <strong className={`history-change history-change-${changeTone}`}>
            {change > 0 ? '+' : ''}
            {formatHistoryValue(change, definition.unit)}
          </strong>
        </div>
        <span>{points.length} titik data</span>
      </div>
      <svg
        className="history-chart"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        role="img"
        aria-label={`Grafik ${definition.label} berdasarkan tanggal`}
      >
        <line
          x1={padding.left}
          x2={chartWidth - padding.right}
          y1={padding.top}
          y2={padding.top}
          className="chart-grid-line"
        />
        <line
          x1={padding.left}
          x2={chartWidth - padding.right}
          y1={chartHeight - padding.bottom}
          y2={chartHeight - padding.bottom}
          className="chart-grid-line"
        />
        {points.length > 1 && (
          <polyline
            points={linePoints}
            className={`history-line history-line-${changeTone}`}
            fill="none"
          />
        )}
        {points.map((point) => (
          <circle
            key={point.snapshot.id}
            cx={point.x}
            cy={point.y}
            r="4"
            className={`history-point history-point-${changeTone}`}
          />
        ))}
      </svg>
      <div className="history-axis">
        <span>{formatHistoryDate(firstPoint.snapshot.date)}</span>
        <span>{formatHistoryDate(lastPoint.snapshot.date)}</span>
      </div>
    </div>
  )
}

export function HistoryPanel({
  snapshots,
  metric,
  fromDate,
  toDate,
  onMetricChange,
  onFromDateChange,
  onToDateChange,
  onDeleteSnapshot,
  onEditSnapshot,
  onOpenSnapshot,
}: {
  snapshots: readonly HistorySnapshot[]
  metric: HistoryMetricKey
  fromDate: string
  toDate: string
  onMetricChange: (value: HistoryMetricKey) => void
  onFromDateChange: (value: string) => void
  onToDateChange: (value: string) => void
  onDeleteSnapshot: (id: string) => void
  onEditSnapshot: (id: string, date: string) => void
  onOpenSnapshot: (snapshot: HistorySnapshot) => void
}) {
  const [editingSnapshotId, setEditingSnapshotId] = useState<string | null>(null)
  const [editingDate, setEditingDate] = useState('')
  const [selectedStockKey, setSelectedStockKey] = useState('')
  const stockOptions = Array.from(
    new Map(
      snapshots.map((snapshot) => [getHistoryStockKey(snapshot), formatHistoryStock(snapshot)])
    ).entries()
  )
  const activeStockKey = stockOptions.some(([key]) => key === selectedStockKey)
    ? selectedStockKey
    : 'all'
  const filteredSnapshots = snapshots.filter(
    (snapshot) =>
      (activeStockKey === 'all' || getHistoryStockKey(snapshot) === activeStockKey) &&
      (!fromDate || snapshot.date >= fromDate) &&
      (!toDate || snapshot.date <= toDate)
  )
  const definition = HISTORY_METRICS.find((item) => item.key === metric) ?? HISTORY_METRICS[0]

  const startEditing = (snapshot: HistorySnapshot) => {
    setEditingSnapshotId(snapshot.id)
    setEditingDate(snapshot.date)
  }

  const saveEditing = () => {
    if (!editingSnapshotId || !editingDate) return
    onEditSnapshot(editingSnapshotId, editingDate)
    setEditingSnapshotId(null)
  }

  return (
    <div className="history-view">
      <div className="history-header">
        <div>
          <span className="panel-kicker">Snapshot tersimpan</span>
          <h3>Riwayat analisis</h3>
          <p>Pantau skor dan perubahan metrik dari waktu ke waktu.</p>
        </div>
        <strong>
          {snapshots.length}/{MAX_HISTORY_SNAPSHOTS} snapshot
        </strong>
      </div>

      <div className="history-controls">
        <label>
          Dari
          <input
            type="date"
            value={fromDate}
            onChange={(event) => onFromDateChange(event.target.value)}
          />
        </label>
        <label>
          Sampai
          <input
            type="date"
            value={toDate}
            onChange={(event) => onToDateChange(event.target.value)}
          />
        </label>
        <label className="history-metric-control">
          Metrik grafik
          <select
            value={metric}
            onChange={(event) => onMetricChange(event.target.value as HistoryMetricKey)}
          >
            {HISTORY_METRICS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="history-stock-filter">
        <label>
          Filter saham
          <select
            value={activeStockKey}
            onChange={(event) => setSelectedStockKey(event.target.value)}
          >
            <option value="all">Semua saham</option>
            {stockOptions.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <span>
          {activeStockKey === 'all'
            ? `${snapshots.length} snapshot tersimpan`
            : `${filteredSnapshots.length} snapshot terpilih`}
        </span>
      </div>

      {filteredSnapshots.length > 0 ? (
        <>
          <div className="history-chart-heading">
            <span>
              {activeStockKey === 'all' ? 'Semua saham' : formatHistoryStock(filteredSnapshots[0])}{' '}
              / {definition.label} / {definition.unit}
            </span>
            <span>{filteredSnapshots.length} snapshot terpilih</span>
          </div>
          {activeStockKey === 'all' ? (
            <div className="history-empty">
              <strong>Pilih satu saham untuk melihat grafik.</strong>
            </div>
          ) : (
            <HistoryChart snapshots={filteredSnapshots} metric={metric} />
          )}
          <div className="history-records">
            <div className="history-records-heading">
              <span>Tanggal / saham</span>
              <span>Skor / nilai</span>
              <span>Status</span>
              <span>Aksi</span>
            </div>
            {filteredSnapshots
              .map((snapshot) => {
                const value = getHistoryMetricValue(snapshot, metric)
                const previousSnapshot = findPreviousHistorySnapshot(filteredSnapshots, snapshot)
                const previousValue = previousSnapshot
                  ? getHistoryMetricValue(previousSnapshot, metric)
                  : null
                const delta =
                  value !== null && previousValue !== null ? value - previousValue : null
                const deltaTone =
                  delta === null
                    ? 'neutral'
                    : delta > 0
                      ? 'positive'
                      : delta < 0
                        ? 'negative'
                        : 'neutral'
                return (
                  <div className="history-record" key={snapshot.id}>
                    <div className="history-record-stock">
                      <strong>{formatHistoryDate(snapshot.date)}</strong>
                      <small>{formatHistoryStock(snapshot)}</small>
                    </div>
                    <span className="history-record-value">
                      <strong>{formatHistoryValue(value, definition.unit)}</strong>
                      <small className={`history-delta history-delta-${deltaTone}`}>
                        {delta === null
                          ? 'Titik awal'
                          : `${delta > 0 ? 'Naik' : delta < 0 ? 'Turun' : 'Tetap'} ${formatHistoryValue(Math.abs(delta), definition.unit)}`}
                      </small>
                    </span>
                    <span className="history-record-verdict">{snapshot.verdict}</span>
                    <span className="history-record-actions">
                      {editingSnapshotId === snapshot.id ? (
                        <>
                          <input
                            aria-label="Tanggal snapshot"
                            type="date"
                            value={editingDate}
                            onChange={(event) => setEditingDate(event.target.value)}
                          />
                          <button
                            type="button"
                            className="history-icon-button"
                            title="Simpan perubahan tanggal"
                            aria-label="Simpan perubahan tanggal"
                            onClick={saveEditing}
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            className="history-icon-button"
                            title="Batal edit"
                            aria-label="Batal edit"
                            onClick={() => setEditingSnapshotId(null)}
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          {snapshot.rawText && (
                            <button
                              type="button"
                              className="history-icon-button"
                              title="Buka output saham"
                              aria-label="Buka output saham"
                              onClick={() => onOpenSnapshot(snapshot)}
                            >
                              <FileCheck2 size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="history-icon-button"
                            title="Edit tanggal snapshot"
                            aria-label="Edit tanggal snapshot"
                            onClick={() => startEditing(snapshot)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className="history-icon-button history-icon-button-danger"
                            title="Hapus snapshot"
                            aria-label="Hapus snapshot"
                            onClick={() => onDeleteSnapshot(snapshot.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </span>
                  </div>
                )
              })
              .reverse()}
          </div>
        </>
      ) : (
        <div className="history-empty">
          <strong>Belum ada snapshot di rentang ini.</strong>
          <span>Simpan hanya tersedia saat score mencapai {SAVE_SCORE_THRESHOLD}/100.</span>
        </div>
      )}
    </div>
  )
}
