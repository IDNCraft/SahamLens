import { Braces } from 'lucide-react'

import { GettingStartedGuide } from './GettingStartedGuide'

export function InputPanel({
  rawText,
  hasParsedData,
  onTextChange,
}: {
  rawText: string
  hasParsedData: boolean
  onTextChange: (value: string) => void
}) {
  return (
    <div className="input-panel panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">
            <Braces size={17} aria-hidden="true" />
          </span>
          <div>
            <span className="panel-kicker">Input</span>
            <h2>Data mentah</h2>
          </div>
        </div>
        <span className="panel-status">{rawText.length.toLocaleString('id-ID')} karakter</span>
      </div>
      <GettingStartedGuide hasParsedData={hasParsedData} />
      <label className="sr-only" htmlFor="stock-text">
        Tempel teks snapshot saham
      </label>
      <textarea
        id="stock-text"
        value={rawText}
        onChange={(event) => onTextChange(event.target.value)}
        spellCheck="false"
        placeholder="Tempel teks snapshot saham di sini..."
      />
      <div className="input-footer">
        <span>
          <span className="status-dot" /> Teks sumber tersimpan
        </span>
        <span>{rawText.split(/\r?\n/).filter(Boolean).length} baris terisi</span>
      </div>
    </div>
  )
}
