import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react"
import Dashboard from "./pages/dashboard/Dashboard"
import bgImage from "./assets/bg.png"
import "./App.css"

function App() {
  return (
    <div className="app-container">
      <SignedOut>
        <div 
          className="flex items-center justify-center min-h-screen bg-background relative p-4"
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
          <div className="w-full max-w-md px-4 sm:px-6 py-6 relative z-10">
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl sm:text-3xl"></span>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-white drop-shadow-lg"></h1>
              <p className="text-sm sm:text-base text-gray-200 drop-shadow"></p>
            </div>
            <SignIn
              routing="hash"
              signUpUrl="#"
              forceRedirectUrl="/"
              fallbackRedirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "mx-auto w-full",
                  card: "shadow-2xl w-full",
                  formButtonPrimary: "text-sm sm:text-base",
                  formFieldInput: "text-sm sm:text-base",
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
