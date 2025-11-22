import { useUser, useClerk } from "@clerk/clerk-react"
import { LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import logo from "@/assets/logoo.png"
import { useMobileClick } from "@/hooks/use-mobile-click"
import { useCallback } from "react"

export function DashboardHeader() {
  const { user } = useUser()
  const { signOut } = useClerk()

  const getInitials = (email) => {
    if (!email) return "U"
    const parts = email.split("@")[0].split(".")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  const handleLogout = useCallback(() => {
    signOut()
  }, [signOut])
  
  const handleLogoutClick = useMobileClick(handleLogout, 300)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
              <img src={logo} alt="MonetiseUp Logo" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-base sm:text-xl font-bold leading-none truncate">MonetiseUp</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden xs:block">Analytics Dashboard</p>
            </div>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden lg:flex items-center gap-2 text-sm max-w-[200px]">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground truncate">{user?.emailAddresses?.[0]?.emailAddress}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarImage src={user?.imageUrl} alt={user?.emailAddresses?.[0]?.emailAddress} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                    {getInitials(user?.emailAddresses?.[0]?.emailAddress)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.fullName || user?.firstName || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.emailAddresses?.[0]?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogoutClick} className="cursor-pointer text-destructive touch-manipulation">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

