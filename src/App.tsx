import { useState } from 'react'
import GreenFridayPopup from './components/GreenFridayPopup'

// Demo page only — a fake website behind the popup.
export default function App() {
  const [run, setRun] = useState(0)

  return (
    <>
      <nav className="demo-nav">
        <span className="demo-logo">BRAND</span>
        <div className="demo-links">
          <span>Home</span><span>Plans</span><span>About</span><span>Contact</span>
        </div>
      </nav>
      <section className="demo-hero">
        <h1>Your website content lives here</h1>
        <p>This is a fake page to show how the popup sits on top of a real site with the blurred overlay.</p>
      </section>
      <section className="demo-grid"><div /><div /><div /></section>

      <button className="demo-replay" onClick={() => setRun((n) => n + 1)}>Show offer again</button>

      {/* demo uses showOnce="always" so it shows on every reload — use "session" on the real site */}
      <GreenFridayPopup key={run} delay={run ? 0.2 : 0.8} showOnce="always" />
    </>
  )
}
