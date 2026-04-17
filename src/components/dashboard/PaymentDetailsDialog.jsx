import React, { useState } from "react"
import emailjs from "@emailjs/browser"
import { useUser } from "@clerk/clerk-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const PaymentDetailsDialog = ({ open, setOpen }) => {
  const [individualName, setIndividualName] = useState("")
  const [bankAccountName, setBankAccountName] = useState("")
  const [bankAccountNumber, setBankAccountNumber] = useState("")
  const [swiftCode, setSwiftCode] = useState("")
  const [bankAddress, setBankAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useUser()
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await emailjs.send(
        "service_2bt68ja",     // 🔥 replace
        "template_9vmc5xb",    // 🔥 replace
        {
          user_email: user?.emailAddresses?.[0]?.emailAddress,
          individualName,
          bankAccountName,
          bankAccountNumber,
          swiftCode,
          bankAddress,
        },
        "V-IH53NJw2Bg3Vd4U"      // 🔥 replace
      )

      // reset form
      setIndividualName("")
      setBankAccountName("")
      setBankAccountNumber("")
      setSwiftCode("")
      setBankAddress("")

      setOpen(false)
    } catch (err) {
      console.error("Email failed:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            Enter your bank details for payouts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <Label>Individual/Company Name</Label>
            <Input value={individualName} onChange={(e) => setIndividualName(e.target.value)} required />
          </div>

          <div>
            <Label>Bank Account Name</Label>
            <Input value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} required />
          </div>

          <div>
            <Label>Bank Account Number</Label>
            <Input value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} required />
          </div>

          <div>
            <Label>SWIFT Code</Label>
            <Input value={swiftCode} onChange={(e) => setSwiftCode(e.target.value)} required />
          </div>

          <div>
            <Label>Bank Address</Label>
            <Input value={bankAddress} onChange={(e) => setBankAddress(e.target.value)} required />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentDetailsDialog