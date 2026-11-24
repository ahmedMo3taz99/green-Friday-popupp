'use client' // harmless in Vite; required if the host site is Next.js (App Router)

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Envelope from './Envelope'
import { useOfferTimeline } from './useOfferTimeline'
import './greenFridayPopup.css'

export type ShowOnce = 'always' | 'session' | 'forever'

export type GreenFridayPopupProps = {
  /** seconds after page load before the popup appears */
  delay?: number
  /** 'session' = once per visit, 'forever' = once per browser, 'always' = every load */
  showOnce?: ShowOnce
  storageKey?: string
  /** optional link for the CTA (renders an <a>) */
  ctaHref?: string
  onClaim?: () => void
  onClose?: () => void
}

function getStore(mode: ShowOnce): Storage | null {
  try {
    if (mode === 'session') return window.sessionStorage
    if (mode === 'forever') return window.localStorage
  } catch {
    /* storage blocked (private mode) */
  }
  return null
}

const EYEBROW = 'Green Friday'

export default function GreenFridayPopup({
  delay = 0.8,
  showOnce = 'session',
  storageKey = 'gfp-green-friday-2026',
  ctaHref,
  onClaim,
  onClose,
}: GreenFridayPopupProps) {
  const [open, setOpen] = useState(false)

  // decide on the client only (SSR-safe)
  useEffect(() => {
    const store = getStore(showOnce)
    try {
      if (store?.getItem(storageKey) === '1') return
      store?.setItem(storageKey, '1')
    } catch {
      /* ignore */
    }
    setOpen(true)
  }, [showOnce, storageKey])

  if (!open) return null

  return createPortal(
    <OfferDialog
      delay={delay}
      ctaHref={ctaHref}
      onClaim={onClaim}
      onClosed={() => {
        setOpen(false)
        onClose?.()
      }}
    />,
    document.body,
  )
}

type DialogProps = Pick<GreenFridayPopupProps, 'delay' | 'ctaHref' | 'onClaim'> & { onClosed: () => void }

function OfferDialog({ delay = 0.8, ctaHref, onClaim, onClosed }: DialogProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  const { close } = useOfferTimeline(rootRef, {
    delay,
    onStart: () => closeBtnRef.current?.focus({ preventScroll: true }),
    onClosed,
  })

  // keep latest close() in a ref so the effect below runs once only
  const closeRef = useRef(close)
  closeRef.current = close

  // scroll lock + Escape + focus restore
  useEffect(() => {
    const lastFocus = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      lastFocus?.focus?.({ preventScroll: true })
    }
  }, [])

  const claim = () => {
    onClaim?.()
    close()
  }

  return (
    <div ref={rootRef} className="gfp-root" role="dialog" aria-modal="true" aria-labelledby="gfp-title">
      <div className="gfp-overlay" onClick={close} />

      <div className="gfp-card">
        <div className="gfp-inner">
          <button ref={closeBtnRef} type="button" className="gfp-close" aria-label="Close offer" onClick={close}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <p className="gfp-eyebrow" aria-label={EYEBROW}>
            {EYEBROW.split('').map((c, i) => (
              <span key={i} className="gfp-char" aria-hidden="true">{c}</span>
            ))}
          </p>

          <h2 className="gfp-headline" id="gfp-title">
            <span className="gfp-mask"><span className="gfp-word">Discount</span></span>{' '}
            <span className="gfp-mask"><span className="gfp-word"><span className="gfp-num">50</span>%</span></span>
          </h2>

          <Envelope />

          {ctaHref ? (
            <a className="gfp-cta" href={ctaHref} onClick={claim}>
              Claim My Offer<span className="gfp-cta__shine" />
            </a>
          ) : (
            <button type="button" className="gfp-cta" onClick={claim}>
              Claim My Offer<span className="gfp-cta__shine" />
            </button>
          )}

          <p className="gfp-note">Limited time offer. Ends Sunday at midnight.</p>
        </div>
      </div>
    </div>
  )
}
