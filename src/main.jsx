import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { ClerkProvider } from "@clerk/clerk-react"
import "./index.css"

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

// Prevent double-tap zoom globally
if (typeof window !== 'undefined') {
  let lastTouchEnd = 0
  document.addEventListener('touchend', function (event) {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) {
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
