// no react import needed for tsx with React 17+ JSX runtime

// Read build data from env (CI) with local fallbacks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const git = (import.meta as any).env?.VITE_GIT_SHA || ''
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const run = (import.meta as any).env?.VITE_BUILD_NUM || ''
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const builtAt = (import.meta as any).env?.VITE_BUILD_AT || ''

const shortSha = git ? String(git).slice(0, 7) : 'local'
const v = run ? `v${run}` : 'v0'
const ts = builtAt || new Date().toISOString().replace('T', ' ').replace(/\..+/, ' UTC')

export default function BuildStamp() {
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
        build {v} • {shortSha} • {ts}
      </div>
    </div>
  )
}
