import { ChevronDown, Info } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'

export function GettingStartedGuide({ hasParsedData }: { hasParsedData: boolean }) {
  const guideRef = useRef<HTMLDetailsElement>(null)
  const hasMounted = useRef(false)

  useLayoutEffect(() => {
    const guide = guideRef.current
    if (!guide) return
    if (!hasMounted.current) {
      guide.open = !hasParsedData
      hasMounted.current = true
      return
    }
    if (hasParsedData) guide.open = false
  }, [hasParsedData])

  return (
    <details ref={guideRef} className="getting-started-guide">
      <summary>
        <span className="getting-started-title">
          <Info size={15} aria-hidden="true" />
          <strong>Cara mulai</strong>
        </span>
        <span className="getting-started-toggle">
          Buka/tutup{' '}
          <ChevronDown className="getting-started-chevron" size={14} aria-hidden="true" />
        </span>
      </summary>
      <ol className="getting-started-steps">
        <li>
          <strong>Siapkan snapshot</strong>
          <span>Login ke Stockbit, cari saham, lalu masuk ke tab Key Stats.</span>
        </li>
        <li>
          <strong>Salin seluruh teks</strong>
          <span>Gunakan Copy all text, atau tekan Ctrl/Cmd+A lalu Ctrl/Cmd+C.</span>
        </li>
        <li>
          <strong>Proses di sini</strong>
          <span>Tempel teks ke Data mentah, lalu klik Rapikan data.</span>
        </li>
      </ol>
    </details>
  )
}
