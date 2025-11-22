import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { ClerkProvider } from "@clerk/clerk-react"
import "./index.css"

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

// Global mobile touch fix - simplified to avoid conflicts
if (typeof window !== 'undefined') {
  // Only prevent double-tap zoom, let component handlers manage clicks
  let lastTouchEnd = 0
  document.addEventListener('touchend', function (event) {
    const now = Date.now()
    // Only prevent if it's a very rapid double-tap (within 100ms)
    if (now - lastTouchEnd <= 100) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }, { passive: false })
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
)
