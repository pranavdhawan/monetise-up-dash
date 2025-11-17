import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { ClerkProvider } from "@clerk/clerk-react"
import "./index.css"

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

// Global mobile touch fix - prevent double-tap zoom and double-click
if (typeof window !== 'undefined') {
  let lastTouchEnd = 0
  document.addEventListener('touchend', function (event) {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }, { passive: false })

  // Prevent double-click on buttons
  document.addEventListener('click', function (e) {
    const target = e.target.closest('button, [role="button"], a, [onclick]')
    if (target && target.dataset.lastClick) {
      const lastClick = parseInt(target.dataset.lastClick)
      const now = Date.now()
      if (now - lastClick < 300) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        return false
      }
    }
    if (target) {
      target.dataset.lastClick = Date.now().toString()
    }
  }, true)
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
)
