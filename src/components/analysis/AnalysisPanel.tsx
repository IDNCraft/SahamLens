import type { AnalysisRule, StockAnalysis } from '../../utils/analysis'
import type { StockData } from '../../utils/types'

import { MAX_HISTORY_SNAPSHOTS, SAVE_SCORE_THRESHOLD } from '../../utils/history'

const analysisStatusLabel: Readonly<Record<AnalysisRule['status'], string>> = {
  positive: 'Mendukung',
  neutral: 'Netral',
  negative: 'Menekan',
  missing: 'Belum ada data',
}

function AnalysisReasonList({
  title,
  rules,
  emptyLabel,
}: {
  title: string
  rules: readonly AnalysisRule[]
  emptyLabel: string
}) {
  return (
    <section className="analysis-reason-list">
      <div className="analysis-subheading">
        <h3>{title}</h3>
        <span>{rules.length}</span>
      </div>
      {rules.length > 0 ? (
        <ul>
          {rules.map((rule) => (
            <li key={rule.id}>
              <div>
                <strong>{rule.label}</strong>
                <span>{rule.valueLabel}</span>
              </div>
              <p>{rule.reason}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="analysis-empty">{emptyLabel}</p>
      )}
    </section>
  )
}

export function AnalysisPanel({
  analysis,
  stockData,
  historyDate,
  canSave,
  saveMessage,
  onHistoryDateChange,
  onSaveHistory,
  scoringMethod,
  onScoringMethodChange,
}: {
  analysis: StockAnalysis
  stockData: StockData
  historyDate: string
  canSave: boolean
  saveMessage: string
  onHistoryDateChange: (value: string) => void
  onSaveHistory: () => void
  scoringMethod: 'discrete' | 'continuous'
  onScoringMethodChange: (method: 'discrete' | 'continuous') => void
}) {
  const identity = stockData.stock_identity
  const stockLabel =
    [identity.ticker, identity.company_name].filter(Boolean).join(' / ') || 'Saham ini'

  return (
    <div className="analysis-view">
      <div className="analysis-hero">
        <div>
          <span className="panel-kicker">Penyaringan berbasis aturan</span>
          <h3>{stockLabel}</h3>
          <p>{analysis.summary}</p>
          <div className="scoring-toggle" role="group" aria-label="Metode perhitungan skor">
            <button
              type="button"
              className={`scoring-toggle-btn ${scoringMethod === 'discrete' ? 'is-active' : ''}`}
              onClick={() => onScoringMethodChange('discrete')}
            >
              Skor diskrit (+1/0/-1)
            </button>
            <button
              type="button"
              className={`scoring-toggle-btn ${scoringMethod === 'continuous' ? 'is-active' : ''}`}
              onClick={() => onScoringMethodChange('continuous')}
            >
              Skor kontinu (0-100)
            </button>
          </div>
        </div>
        <div className="analysis-hero-metrics">
          <div className={`analysis-valuation analysis-valuation-${analysis.valuationSignal}`}>
            <span className="panel-kicker">Indikator valuasi</span>
            <strong>{analysis.valuationLabel}</strong>
            <small>{analysis.valuationSummary}</small>
          </div>
          <div className={`analysis-score analysis-score-${analysis.verdictTone}`}>
            <strong>{analysis.score ?? '-'}</strong>
            <span>/100</span>
            <small>{analysis.verdict}</small>
          </div>
        </div>
      </div>

      <div className={`analysis-horizon analysis-horizon-${analysis.horizonSignal}`}>
        <div>
          <span className="panel-kicker">Pola periode</span>
          <strong>{analysis.horizonLabel}</strong>
        </div>
        <small>{analysis.horizonSummary}</small>
      </div>

      <div className="analysis-disclaimer">
        Skor ini adalah penyaring awal dari data yang ditempel. Skor bukan prediksi keuntungan dan
        bukan ajakan membeli.
      </div>

      <div className="analysis-formula">
        <span className="panel-kicker">Cara kerja skor</span>
        {scoringMethod === 'continuous' ? (
          <>
            <code>Skor = jumlah(skor_kualitas x bobot) / jumlah(bobot)</code>
            <p>
              Setiap metrik mendapat nilai 0 sampai 100 berdasarkan kualitas angkanya. Data kosong
              dilewati.
            </p>
          </>
        ) : (
          <>
            <code>Skor = 50 + 50 x jumlah(poin x bobot) / jumlah(bobot)</code>
            <p>
              Setiap metrik mendapat poin +1, 0, atau -1. Data kosong dilewati, bukan dianggap
              buruk.
            </p>
          </>
        )}
      </div>

      <div className="analysis-save-bar">
        <div>
          <span className="panel-kicker">Simpan snapshot</span>
          <p>
            Skor minimal {SAVE_SCORE_THRESHOLD}/100. Maksimal {MAX_HISTORY_SNAPSHOTS} snapshot.
          </p>
        </div>
        <div className="analysis-save-actions">
          <label>
            Tanggal data
            <input
              type="date"
              value={historyDate}
              onChange={(event) => onHistoryDateChange(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="button button-primary"
            disabled={!canSave}
            onClick={onSaveHistory}
          >
            Simpan ke riwayat
          </button>
        </div>
        <small role={saveMessage ? 'alert' : undefined}>
          {saveMessage ||
            (canSave
              ? 'Data ini siap disimpan.'
              : `Skor saat ini belum mencapai ${SAVE_SCORE_THRESHOLD}/100.`)}
        </small>
      </div>

      <div className="analysis-columns">
        <AnalysisReasonList
          title="Faktor pendukung"
          rules={analysis.positiveRules}
          emptyLabel="Belum ada faktor pendukung."
        />
        <AnalysisReasonList
          title="Faktor penekan"
          rules={analysis.negativeRules}
          emptyLabel="Belum ada faktor penekan."
        />
      </div>

      <section className="analysis-checks">
        <div className="analysis-subheading">
          <div>
            <span className="panel-kicker">Rincian penilaian</span>
            <h3>Semua variabel yang diuji</h3>
          </div>
          <span>
            {analysis.testedVariables}/{analysis.totalVariables} teruji
          </span>
        </div>
        <div className="analysis-rule-list">
          {analysis.rules.map((rule) => (
            <article className={`analysis-rule analysis-rule-${rule.status}`} key={rule.id}>
              <div className="analysis-rule-topline">
                <strong>{rule.label}</strong>
                <b>{rule.valueLabel}</b>
              </div>
              <div className="analysis-rule-meta">
                <span>{rule.formula}</span>
                <span>{analysisStatusLabel[rule.status]}</span>
              </div>
              <p>{rule.reason}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
