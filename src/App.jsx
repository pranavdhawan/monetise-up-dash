import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react"
import Dashboard from "./pages/dashboard/Dashboard"
import "./App.css"

function App() {
  return (
    <div className="app-container">
      <SignedOut>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="w-full max-w-md p-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-3xl">M</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-2">MonetiseUp</h1>
              <p className="text-muted-foreground">Analytics Dashboard</p>
            </div>
            <SignIn
              routing="hash"
              signUpUrl="#"
              forceRedirectUrl="/"
              fallbackRedirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-lg",
                },
              }}
            />
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <Dashboard />
      </SignedIn>
    </div>
  )
}

export default App
