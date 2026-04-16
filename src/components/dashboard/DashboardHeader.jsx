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
import { useCallback, useState } from "react"

// ✅ import dialog
import PaymentDetailsDialog from "@/components/dashboard/PaymentDetailsDialog"

export function DashboardHeader() {
  const { user } = useUser()
  const { signOut } = useClerk()

  // ✅ dialog state
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false)

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

  const logoutTouchHandlers = useMobileClick(handleLogout)

  // ✅ open dialog
  const handleEditPaymentDetails = useCallback(() => {
    setOpenPaymentDialog(true)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">

          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg overflow-hidden">
              <img src={logo} alt="MonetiseUp Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold truncate">MonetiseUp</h1>
              <p className="text-xs text-muted-foreground hidden xs:block">
                Analytics Dashboard
              </p>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-sm max-w-[200px]">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">
                {user?.emailAddresses?.[0]?.emailAddress}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                  <Avatar>
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback>
                      {getInitials(user?.emailAddresses?.[0]?.emailAddress)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user?.fullName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.emailAddresses?.[0]?.emailAddress}
                    </p>

                    {/* ✅ button opens dialog */}
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={handleEditPaymentDetails}
                    >
                      Add / Edit Payment Details
                    </Button>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  {...logoutTouchHandlers}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ✅ mount dialog OUTSIDE header */}
      <PaymentDetailsDialog
        open={openPaymentDialog}
        setOpen={setOpenPaymentDialog}
      />
    </>
  )
}