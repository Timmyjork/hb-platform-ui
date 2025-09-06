// no react import needed for tsx with React 17+ JSX runtime
import { BUILD } from '../version'

export default function BuildStamp() {
  const { vText, done, total, pct, gitShort, run, ts } = BUILD
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          margin: '6px auto',
          padding: '2px 10px',
          borderRadius: 6,
          background: 'rgba(0,0,0,0.06)',
          color: '#555',
          fontSize: 12,
          lineHeight: '16px',
          pointerEvents: 'auto',
        }}
        aria-label="build-stamp"
      >
        {vText} • {done}/{total} кроків ({pct}%) • {gitShort} {run} • {ts}
      </div>
    </div>
  )
}
