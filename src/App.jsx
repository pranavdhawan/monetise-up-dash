import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react"
import Dashboard from "./pages/dashboard/Dashboard"
import bgImage from "./assets/bg.png"
import "./App.css"

function App() {
  return (
    <div className="app-container">
      <SignedOut>
        <div 
          className="flex items-center justify-center min-h-screen bg-background relative"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Overlay for better readability */}
          <div className="absolute inset-0 bg-black/50"></div>
          
          {/* Content */}
          <div className="w-full max-w-md p-6 relative z-10">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-3xl"></span>
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg"></h1>
              <p className="text-gray-200 drop-shadow"></p>
            </div>
            <SignIn
              routing="hash"
              signUpUrl="#"
              forceRedirectUrl="/"
              fallbackRedirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-2xl",
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
