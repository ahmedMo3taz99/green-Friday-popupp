import Badge from './Badge'

// Layers bottom → top: back (1) · voucher (2) · front pocket (3) · fold lines (4) · flap (5 closed / 1 open) · badge (6)
export default function Envelope() {
  return (
    <div className="gfp-env">
      <div className="gfp-env__back" />
      <div className="gfp-env__flap" />

      <div className="gfp-voucher">
        <span className="gfp-voucher__label">BONUS</span>
        <div className="gfp-voucher__row">
          <span className="gfp-voucher__main">
            <small>+</small>1 Month
          </span>
          <span className="gfp-voucher__free">FREE</span>
        </div>
        <span className="gfp-voucher__fine">With every subscription during Green Friday</span>
      </div>

      <div className="gfp-env__front" />
      <svg className="gfp-env__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0 L50 46 L100 0" />
        <path d="M0 100 L38 58" />
        <path d="M100 100 L62 58" />
      </svg>

      <Badge />
    </div>
  )
}
