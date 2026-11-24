// Scalloped "flower" sticker — path generated once at module load.
const BADGE_PATH = (() => {
  const lobes = 10
  const R = 44
  const amp = 4
  const steps = 200
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const r = R + amp * Math.cos(lobes * t)
    d += `${i ? 'L' : 'M'}${(50 + r * Math.cos(t)).toFixed(2)},${(50 + r * Math.sin(t)).toFixed(2)} `
  }
  return d + 'Z'
})()

export default function Badge() {
  return (
    <div className="gfp-badge" aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <path d={BADGE_PATH} />
      </svg>
      <div className="gfp-badge__txt">
        <b>50%</b>
        <span>OFF</span>
      </div>
    </div>
  )
}
