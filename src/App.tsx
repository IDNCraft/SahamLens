import type { HistoryMetricKey, HistorySnapshot } from './utils/history'
import type { ParsedSection } from './utils/types'
import {
  ArrowUpRight,
  Braces,
  CheckCircle2,
  ChevronDown,
  ClipboardPaste,
  Copy,
  Database,
  FileCheck2,
  Languages,
  Scale,
  Sparkles,
  Star,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { AnalysisPanel } from './components/analysis/AnalysisPanel'
import { ComparisonPanel, HistoryPanel } from './components/history/HistoryViews'
import { InputPanel } from './components/input/InputPanel'
import { DataSection, FundamentalGuide, StockIdentityCard } from './components/stock/StockDataViews'
import { buildAnalysis } from './utils/analysis'
import {
  deleteHistorySnapshot,
  getHistoryStockKey,
  hasHistorySnapshot,
  loadHistory,
  MAX_HISTORY_SNAPSHOTS,
  SAVE_SCORE_THRESHOLD,
  saveHistorySnapshot,
  todayIso,
  updateHistorySnapshot,
} from './utils/history'
import {
  formatHistoryDate,
  formatHistoryStock,
  historyUrlParams,
  readHistoryParams,
  resolveHistoryDate,
} from './utils/historyHelpers'
import { translateSectionLabel } from './utils/labelTranslator'
import { parseStockText } from './utils/parser'
import packageJson from '../package.json'

import './index.css'

const countMetrics = (sections: readonly ParsedSection[]): number =>
  sections.reduce((total, section) => total + section.metrics.length, 0)

const countTables = (sections: readonly ParsedSection[]): number =>
  sections.reduce((total, section) => total + section.tables.length, 0)

function App() {
  const [rawText, setRawText] = useState('')
  const [parsed, setParsed] = useState(() => parseStockText(''))
  const [activeSection, setActiveSection] = useState('all')
  const [outputMode, setOutputMode] = useState<
    'structured' | 'json' | 'analysis' | 'history' | 'compare'
  >('structured')
  const [easyLabels, setEasyLabels] = useState(true)
  const [isDirty, setIsDirty] = useState(false)
  const [clipboardMessage, setClipboardMessage] = useState('')
  const [jsonCopied, setJsonCopied] = useState(false)
  const [history, setHistory] = useState<readonly HistorySnapshot[]>(() => loadHistory())
  const [historyDate, setHistoryDate] = useState(todayIso)
  const [historyMessage, setHistoryMessage] = useState('')
  const [historyMetric, setHistoryMetric] = useState<HistoryMetricKey>('score')
  const [historyFromDate, setHistoryFromDate] = useState('')
  const [historyToDate, setHistoryToDate] = useState('')
  const [scoringMethod, setScoringMethod] = useState<'discrete' | 'continuous'>('discrete')
  const [githubStars, setGithubStars] = useState<number | null>(null)

  const sectionCount = parsed.sections.length
  const metricCount = countMetrics(parsed.sections)
  const tableCount = countTables(parsed.sections)
  const hasParsedData = parsed.recognizedLines > 0
  const analysis = buildAnalysis(parsed.stockData, scoringMethod)
  const canSaveHistory = analysis.score !== null && analysis.score >= SAVE_SCORE_THRESHOLD
  const visibleSections =
    activeSection === 'all'
      ? parsed.sections
      : parsed.sections.filter((section) => section.title === activeSection)

  const handleTextChange = (value: string) => {
    setRawText(value)
    setIsDirty(true)
    setClipboardMessage('')
  }

  const handleParse = () => {
    const nextParsed = parseStockText(rawText)
    setParsed(nextParsed)
    setHistoryDate(resolveHistoryDate(nextParsed.stockData))
    setIsDirty(false)
    setActiveSection('all')
    setHistoryMessage('')
  }

  const handleSaveHistory = () => {
    if (!canSaveHistory) {
      setHistoryMessage(`Simpan hanya aktif saat score minimal ${SAVE_SCORE_THRESHOLD}/100.`)
      return
    }
    if (hasHistorySnapshot(parsed.stockData, historyDate)) {
      const stockLabel =
        parsed.stockData.stock_identity.ticker ||
        parsed.stockData.stock_identity.company_name ||
        'Saham ini'
      setHistoryMessage(`${stockLabel} pada ${formatHistoryDate(historyDate)} sudah tersimpan.`)
      return
    }
    const result = saveHistorySnapshot(parsed.stockData, analysis, historyDate, rawText)
    setHistory(result.snapshots)
    if (!result.persisted) {
      setHistoryMessage(
        result.failure === 'limit'
          ? `Riwayat penuh (${MAX_HISTORY_SNAPSHOTS} snapshot). Snapshot baru belum disimpan.`
          : 'Riwayat gagal disimpan. Penyimpanan browser mungkin penuh atau tidak tersedia.'
      )
      return
    }
    setHistoryMessage(`Snapshot tanggal ${formatHistoryDate(historyDate)} tersimpan.`)
    setOutputMode('history')
  }

  const handleDeleteHistory = (id: string) => {
    const result = deleteHistorySnapshot(id)
    setHistory(result.snapshots)
    setHistoryMessage(
      result.persisted
        ? 'Snapshot dihapus dari riwayat.'
        : 'Snapshot dihapus dari tampilan, tetapi gagal disimpan.'
    )
  }

  const handleEditHistory = (id: string, date: string) => {
    const result = updateHistorySnapshot(id, { date })
    setHistory(result.snapshots)
    setHistoryMessage(
      result.persisted
        ? `Tanggal snapshot diubah ke ${formatHistoryDate(date)}.`
        : 'Tanggal berubah di tampilan, tetapi gagal disimpan.'
    )
  }

  const handleOpenHistory = (snapshot: HistorySnapshot) => {
    if (!snapshot.rawText) return
    setRawText(snapshot.rawText)
    setParsed(parseStockText(snapshot.rawText))
    setIsDirty(false)
    setActiveSection('all')
    setOutputMode('structured')
    setHistoryMessage(`Output ${formatHistoryStock(snapshot)} dibuka.`)
    window.history.pushState(null, '', `?${historyUrlParams(snapshot).toString()}`)
  }

  useEffect(() => {
    const { code, date } = readHistoryParams(window.location.search)
    if (!code || !date) return
    const snapshot = history.find(
      (snapshot) =>
        snapshot.date === date && getHistoryStockKey(snapshot) === code && snapshot.rawText
    )
    const rawText = snapshot?.rawText
    if (!snapshot || !rawText) return
    setRawText(rawText)
    setParsed(parseStockText(rawText))
    setIsDirty(false)
    setActiveSection('all')
    setOutputMode('structured')
    setHistoryMessage(`Output ${formatHistoryStock(snapshot)} dibuka dari URL.`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let cancelled = false

    fetch('https://api.github.com/repos/IDNCraft/SahamLens', {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((response) => {
        if (!response.ok) throw new Error('GitHub API unavailable')
        return response.json() as Promise<{ stargazers_count: number }>
      })
      .then((repository) => {
        if (!cancelled) setGithubStars(repository.stargazers_count)
      })
      .catch(() => { })

    return () => {
      cancelled = true
    }
  }, [])

  const handleClipboardPaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      if (clipboardText.trim()) {
        handleTextChange(clipboardText)
        setClipboardMessage('Teks clipboard masuk, klik Rapikan data')
      }
    } catch {
      setClipboardMessage('Paste langsung ke textarea')
    }
  }

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(parsed.stockData, null, 2))
      setJsonCopied(true)
      setTimeout(() => setJsonCopied(false), 1800)
    } catch {
      setClipboardMessage('Copy JSON gagal, pilih teks manual')
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Beranda SahamLens">
          <span className="brand-mark">SL</span>
          <span>SahamLens</span>
        </a>
        <div className="topbar-meta">
          <span className="mode-dot" aria-hidden="true" />
          <a
            className="topbar-link"
            href="https://github.com/IDNCraft/SahamLens"
            target="_blank"
            rel="noreferrer"
            aria-label="SahamLens di GitHub"
            title="GitHub SahamLens"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 .297a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.26c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.48.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.28c0 .32.22.69.82.58A12 12 0 0 0 12 .297"
              />
            </svg>
          </a>
          <span
            className="github-stars"
            aria-label={`${githubStars === null ? 'Jumlah star belum tersedia' : `${githubStars} GitHub stars`}`}
            title="Total GitHub stars"
          >
            <Star size={13} fill="currentColor" aria-hidden="true" />
            <span>{githubStars === null ? '—' : githubStars.toLocaleString('en-US')}</span>
          </span>
          <span className="topbar-divider" aria-hidden="true" />
          <span>V {packageJson.version}</span>
        </div>
      </header>

      <main>
        <section className={hasParsedData ? 'masthead masthead-collapsed' : 'masthead'}>
          <div className="masthead-copy">
            <h1>
              Baca datanya.
              <br />
              <em>Pantau perubahannya.</em>
            </h1>
            <p className="lede">
              Tempel snapshot saham untuk membaca identitas emiten, metrik fundamental, skor
              berbasis aturan, dan perubahannya dari waktu ke waktu.
            </p>
          </div>
          <div className="signal-card">
            <div className="signal-topline">
              <Database size={17} aria-hidden="true" />
              <span>Status data</span>
            </div>
            <strong>
              {isDirty ? 'Perlu diproses' : hasParsedData ? 'Siap ditinjau' : 'Menunggu data'}
            </strong>
            <p>
              {isDirty
                ? 'Data baru belum diproses.'
                : hasParsedData
                  ? `${sectionCount} bagian siap diperiksa.`
                  : 'Tempel snapshot saham untuk memulai.'}
            </p>
            <div className="signal-bar">
              <span style={{ width: isDirty ? '42%' : hasParsedData ? '100%' : '0%' }} />
            </div>
          </div>
        </section>

        <section className="action-strip" aria-label="Aksi data">
          <button type="button" className="button button-primary" onClick={handleParse}>
            <Sparkles size={16} aria-hidden="true" />
            Rapikan data
            <ArrowUpRight size={16} aria-hidden="true" />
          </button>
          <button type="button" className="button button-secondary" onClick={handleClipboardPaste}>
            <ClipboardPaste size={16} aria-hidden="true" />
            Tempel dari clipboard
          </button>
          <button
            type="button"
            className={easyLabels ? 'button button-primary' : 'button button-secondary'}
            onClick={() => setEasyLabels((previous) => !previous)}
            title="Ganti bahasa label"
          >
            <Languages size={15} aria-hidden="true" />
            {easyLabels ? 'Lihat label asli' : 'Gunakan bahasa sederhana'}
          </button>
          <span className="action-note">
            {clipboardMessage || 'Hasil hanya memakai data yang berhasil dibaca.'}
          </span>
        </section>

        <section className="workspace" aria-label="Ruang kerja SahamLens">
          <InputPanel
            rawText={rawText}
            hasParsedData={hasParsedData}
            onTextChange={handleTextChange}
          />

          <div className="preview-panel panel">
            <div className="panel-header preview-header">
              <div className="panel-title">
                <span className="panel-icon panel-icon-teal">
                  <FileCheck2 size={17} aria-hidden="true" />
                </span>
                <div>
                  <span className="panel-kicker">Hasil</span>
                  <h2>Data terstruktur</h2>
                </div>
              </div>
              <div className="preview-header-actions">
                <div className="parse-status">
                  <CheckCircle2 size={15} aria-hidden="true" />{' '}
                  {isDirty ? 'Perlu diproses' : hasParsedData ? 'Siap ditinjau' : 'Menunggu data'}
                </div>
                <button
                  type="button"
                  className={`json-header-button ${outputMode === 'json' ? 'is-active' : ''}`}
                  onClick={() => setOutputMode(outputMode === 'json' ? 'structured' : 'json')}
                  title="Lihat data JSON"
                  aria-label="Lihat data JSON"
                >
                  <Braces size={14} aria-hidden="true" /> JSON
                </button>
              </div>
            </div>

            <div className="stats-row">
              <div>
                <strong>{sectionCount}</strong>
                <span>bagian</span>
              </div>
              <div>
                <strong>{metricCount}</strong>
                <span>metrik</span>
              </div>
              <div>
                <strong>{tableCount}</strong>
                <span>tabel</span>
              </div>
              <div>
                <strong>{parsed.recognizedLines}</strong>
                <span>baris terbaca</span>
              </div>
            </div>

            <StockIdentityCard stockData={parsed.stockData} />

            <div className="unit-strip" aria-label="Satuan nilai">
              <span>Satuan nilai</span>
              <strong>otomatis</strong>
              <small>miliar atau triliun sesuai nilai</small>
            </div>

            <div className="output-switcher" role="tablist" aria-label="Mode tampilan hasil">
              <button
                type="button"
                className={outputMode === 'structured' ? 'is-active' : ''}
                onClick={() => setOutputMode('structured')}
                role="tab"
                aria-selected={outputMode === 'structured'}
              >
                Data terstruktur
              </button>
              <button
                type="button"
                className={outputMode === 'analysis' ? 'is-active' : ''}
                onClick={() => setOutputMode('analysis')}
                role="tab"
                aria-selected={outputMode === 'analysis'}
              >
                Analisis saham
              </button>
              <button
                type="button"
                className={outputMode === 'history' ? 'is-active' : ''}
                onClick={() => setOutputMode('history')}
                role="tab"
                aria-selected={outputMode === 'history'}
              >
                Riwayat analisis
              </button>
              <button
                type="button"
                className={outputMode === 'compare' ? 'is-active' : ''}
                onClick={() => setOutputMode('compare')}
                role="tab"
                aria-selected={outputMode === 'compare'}
              >
                <Scale size={13} aria-hidden="true" /> Bandingkan
              </button>
            </div>

            {outputMode === 'structured' ? (
              <>
                <FundamentalGuide />
                <div className="filter-row">
                  <div className="select-wrap">
                    <select
                      id="section-filter"
                      aria-label="Pilih bagian"
                      value={activeSection}
                      onChange={(event) => setActiveSection(event.target.value)}
                    >
                      <option value="all">Semua bagian</option>
                      {parsed.sections.map((section) => (
                        <option key={section.title} value={section.title}>
                          {translateSectionLabel(section.title, easyLabels)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} aria-hidden="true" />
                  </div>
                </div>

                <div className="section-list">
                  {visibleSections.length > 0 ? (
                    visibleSections.map((section) => (
                      <DataSection
                        key={section.title}
                        section={section}
                        index={parsed.sections.indexOf(section)}
                        easyLabels={easyLabels}
                      />
                    ))
                  ) : (
                    <div className="empty-state">
                      <Database size={20} aria-hidden="true" />
                      <p>
                        Belum ada data yang bisa dibaca. Tempel teks snapshot saham ke Data mentah,
                        lalu klik Rapikan data.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : outputMode === 'json' ? (
              <div className="json-view">
                <div className="json-toolbar">
                  <div>
                    <span className="panel-kicker">Format data</span>
                    <strong>Satuan: {parsed.stockData.metadata.amount_unit}</strong>
                  </div>
                  <button type="button" className="json-copy" onClick={handleCopyJson}>
                    <Copy size={14} aria-hidden="true" />
                    {jsonCopied ? 'Tersalin' : 'Salin JSON'}
                  </button>
                </div>
                <pre>{JSON.stringify(parsed.stockData, null, 2)}</pre>
              </div>
            ) : outputMode === 'analysis' ? (
              <AnalysisPanel
                analysis={analysis}
                stockData={parsed.stockData}
                historyDate={historyDate}
                canSave={canSaveHistory}
                saveMessage={historyMessage}
                onHistoryDateChange={setHistoryDate}
                onSaveHistory={handleSaveHistory}
                scoringMethod={scoringMethod}
                onScoringMethodChange={setScoringMethod}
              />
            ) : outputMode === 'history' ? (
              <HistoryPanel
                snapshots={history}
                metric={historyMetric}
                fromDate={historyFromDate}
                toDate={historyToDate}
                onMetricChange={setHistoryMetric}
                onFromDateChange={setHistoryFromDate}
                onToDateChange={setHistoryToDate}
                onDeleteSnapshot={handleDeleteHistory}
                onEditSnapshot={handleEditHistory}
                onOpenSnapshot={handleOpenHistory}
              />
            ) : (
              <ComparisonPanel snapshots={history} />
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>SahamLens / pemrosesan data</span>
        <span>Data diproses di browser</span>
      </footer>
    </div>
  )
}

export default App
