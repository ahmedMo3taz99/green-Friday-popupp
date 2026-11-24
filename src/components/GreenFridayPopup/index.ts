/**
 * GreenFridayPopup — drop-in promo popup (React + GSAP)
 *
 * HOW TO ADD IT TO YOUR WEBSITE
 * 1. npm i gsap @gsap/react
 * 2. Copy this whole folder (GreenFridayPopup/) into your project's src/components/
 * 3. Render it ONCE at the root (App.tsx or your main layout):
 *
 *      import GreenFridayPopup from './components/GreenFridayPopup'
 *      <GreenFridayPopup delay={0.8} showOnce="session" ctaHref="/pricing" />
 *
 * Next.js: already has 'use client' at the top of GreenFridayPopup.tsx.
 */
export { default } from './GreenFridayPopup'
export type { GreenFridayPopupProps, ShowOnce } from './GreenFridayPopup'
