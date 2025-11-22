import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { ClerkProvider } from "@clerk/clerk-react"
import "./index.css"

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

// Global mobile touch fix - completely removed to avoid conflicts
// Component-level handlers now manage all touch events
if (typeof window !== 'undefined') {
  // Only prevent double-tap zoom on non-interactive elements
  let lastTouchEnd = 0
  document.addEventListener('touchend', function (event) {
    // Only prevent on non-interactive elements (body, divs without handlers)
    const target = event.target
    const isInteractive = target.closest('button, a, [role="button"], [onclick], input, select, textarea')
    
    if (!isInteractive) {
      const now = Date.now()
      // Only prevent if it's a very rapid double-tap (within 100ms)
      if (now - lastTouchEnd <= 100) {
        event.preventDefault()
      }
      lastTouchEnd = now
    }
  }, { passive: false })
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
)
