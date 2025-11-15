import { useState, useEffect } from "react"
import { CalendarIcon } from "lucide-react"
import { format, subDays, subMonths, startOfYear } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function DateFilter({ onDateRangeChange }) {
  const [dateRange, setDateRange] = useState(null)
  const [selectedPreset, setSelectedPreset] = useState("all")

  useEffect(() => {
    onDateRangeChange(dateRange)
  }, [dateRange, onDateRangeChange])

  const presets = [
    {
      label: "All Data",
      value: "all",
      getRange: () => null
    },
    {
      label: "Last 7 days",
      value: "last7",
      getRange: () => ({
        from: subDays(new Date(), 7),
        to: new Date()
      })
    },
    {
      label: "Last 30 days",
      value: "last30",
      getRange: () => ({
        from: subDays(new Date(), 30),
        to: new Date()
      })
    },
    {
      label: "Last 3 months",
      value: "last3months",
      getRange: () => ({
        from: subMonths(new Date(), 3),
        to: new Date()
      })
    },
    {
      label: "Year to date",
      value: "ytd",
      getRange: () => ({
        from: startOfYear(new Date()),
        to: new Date()
      })
    },
    {
      label: "Last 2 years",
      value: "last2years",
      getRange: () => ({
        from: subMonths(new Date(), 24),
        to: new Date()
      })
    }
  ]

  const handlePresetClick = (preset) => {
    const range = preset.getRange()
    setDateRange(range)
    setSelectedPreset(preset.value)
  }

  const handleCalendarSelect = (range) => {
    if (range?.from) {
      setDateRange({
        from: range.from,
        to: range.to || range.from
      })
      setSelectedPreset(null)
    }
  }

  const handleClearDates = () => {
    setDateRange(null)
    setSelectedPreset("all")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Quick Select</h3>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {presets.map((preset) => (
            <Button
              key={preset.value}
              variant={selectedPreset === preset.value ? "default" : "outline"}
              size="sm"
              className="justify-start"
              onClick={() => handlePresetClick(preset)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Custom Range</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                    {format(dateRange.to, "MMM dd, yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "MMM dd, yyyy")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleCalendarSelect}
              numberOfMonths={2}
              disabled={(date) => date > new Date()}
            />
          </PopoverContent>
        </Popover>
        
        {dateRange && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearDates}
            className="w-full"
          >
            Clear Dates
          </Button>
        )}
      </div>

      {dateRange?.from ? (
        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="font-medium">Selected Range</p>
          <p className="text-muted-foreground">
            {format(dateRange.from, "MMM dd, yyyy")} to{" "}
            {format(dateRange.to, "MMM dd, yyyy")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {Math.ceil((dateRange.to - dateRange.from) / (1000 * 60 * 60 * 24)) + 1} days
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="font-medium">All Data</p>
          <p className="text-muted-foreground">
            Showing all available data
          </p>
        </div>
      )}
    </div>
  )
}
