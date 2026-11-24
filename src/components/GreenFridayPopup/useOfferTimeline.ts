import { useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

type Options = {
  delay: number
  onStart?: () => void
  onClosed: () => void
}

/**
 * All GSAP for the popup: intro → idle loops → close.
 * useGSAP with `scope` auto-reverts every tween on unmount (StrictMode safe).
 */
export function useOfferTimeline(rootRef: RefObject<HTMLDivElement>, { delay, onStart, onClosed }: Options) {
  const intro = useRef<gsap.core.Timeline | null>(null)
  const idle = useRef<gsap.core.Tween[]>([])
  const closing = useRef(false)

  const { contextSafe } = useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return
      const q = gsap.utils.selector(root)
      const num = q('.gfp-num')[0] as HTMLElement
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      gsap.set('.gfp-env__flap', { rotateX: 0, zIndex: 5 })
      gsap.set('.gfp-voucher', { yPercent: 15, autoAlpha: 0 })

      // ---------- reduced motion: show final state instantly ----------
      if (reduce) {
        gsap.set(root, { autoAlpha: 1 })
        gsap.set('.gfp-env__flap', { rotateX: 180, zIndex: 1 })
        gsap.set('.gfp-voucher', { yPercent: -45, autoAlpha: 1 })
        onStart?.()
        return
      }

      const startIdle = () => {
        idle.current.push(
          gsap.to('.gfp-voucher', { y: -6, duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
          gsap.to('.gfp-badge svg', { rotate: '+=360', duration: 18, repeat: -1, ease: 'none' }),
          gsap.fromTo('.gfp-cta__shine', { xPercent: -120 },
            { xPercent: 320, duration: 0.9, repeat: -1, repeatDelay: 4, ease: 'power2.inOut' }),
        )
      }

      // ---------- intro ----------
      const counter = { val: 50 }
      intro.current = gsap
        .timeline({ delay, defaults: { ease: 'expo.out' } })
        .set(root, { autoAlpha: 1 })
        .call(() => onStart?.()) // focus only after it's visible (hidden elements can't take focus)
        .fromTo('.gfp-overlay', { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' })
        .fromTo('.gfp-card', { y: 60, scale: 0.92, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.9 }, '-=0.3')
        .from('.gfp-eyebrow .gfp-char', { yPercent: 110, opacity: 0, stagger: 0.03, duration: 0.6 }, '-=0.5')
        .from('.gfp-headline .gfp-word', { yPercent: 105, duration: 0.8, stagger: 0.08 }, '-=0.4')
        .from(counter, {
          val: 0, duration: 1.1, ease: 'power3.out',
          onUpdate: () => { num.textContent = String(Math.round(counter.val)) },
        }, '<')
        // envelope drops in CLOSED, then a little "knock" wiggle
        .from('.gfp-env', { y: -80, rotate: -6, opacity: 0, duration: 0.9, ease: 'back.out(1.6)' }, '-=0.6')
        .to('.gfp-env', { keyframes: { rotate: [0, -3, 3, -2, 2, 0] }, duration: 0.6, ease: 'none' })
        // flap opens — z-index swap at the midpoint
        .set('.gfp-voucher', { autoAlpha: 1 })
        .to('.gfp-env__flap', { rotateX: 180, duration: 0.7, ease: 'power3.inOut' }, '+=0.1')
        .set('.gfp-env__flap', { zIndex: 1 }, '-=0.35')
        // voucher rises → "+1 Month FREE"
        .to('.gfp-voucher', { yPercent: -45, duration: 1 }, '-=0.15')
        .from('.gfp-voucher__label, .gfp-voucher__main, .gfp-voucher__free, .gfp-voucher__fine',
          { y: 20, opacity: 0, stagger: 0.1, duration: 0.6 }, '-=0.7')
        .from('.gfp-badge', { scale: 0, rotate: -180, duration: 0.9, ease: 'back.out(2)' }, '-=0.5')
        .from('.gfp-cta, .gfp-note', { y: 16, opacity: 0, stagger: 0.08, duration: 0.6 }, '-=0.5')
        .call(startIdle)

      // ---------- desktop mouse tilt ----------
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
      const env = q('.gfp-env')[0] as HTMLElement
      const rx = gsap.quickTo(env, 'rotateX', { duration: 0.6, ease: 'power3' })
      const ry = gsap.quickTo(env, 'rotateY', { duration: 0.6, ease: 'power3' })
      const move = (e: MouseEvent) => {
        const b = env.getBoundingClientRect()
        ry(((e.clientX - b.left) / b.width - 0.5) * 16)
        rx(-((e.clientY - b.top) / b.height - 0.5) * 16)
      }
      const leave = () => { rx(0); ry(0) }
      env.addEventListener('mousemove', move)
      env.addEventListener('mouseleave', leave)
      return () => {
        env.removeEventListener('mousemove', move)
        env.removeEventListener('mouseleave', leave)
      }
    },
    { scope: rootRef },
  )

  const close = contextSafe(() => {
    if (closing.current) return
    closing.current = true
    intro.current?.progress(1).kill()
    idle.current.forEach((tw) => tw.kill())
    idle.current = []
    gsap
      .timeline({ onComplete: onClosed })
      .to('.gfp-card', { y: 40, scale: 0.94, opacity: 0, duration: 0.4, ease: 'power3.in' })
      .to('.gfp-overlay', { opacity: 0, duration: 0.3 }, '-=0.15')
  })

  return { close }
}
