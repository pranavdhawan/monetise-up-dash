import { useState, useEffect, useCallback } from "react"
import { CalendarIcon } from "lucide-react"
import { format, subDays, subMonths, startOfYear, startOfDay, endOfDay } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useMobileClick } from "@/hooks/use-mobile-click"

export function DateFilter({ onDateRangeChange }) {
  // Initialize with yesterday's date range
  const getYesterdayRange = () => ({
    from: startOfDay(subDays(new Date(), 1)),
    to: endOfDay(subDays(new Date(), 1))
  })
  
  const [dateRange, setDateRange] = useState(getYesterdayRange())
  const [selectedPreset, setSelectedPreset] = useState("yesterday")

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
      label: "Yesterday",
      value: "yesterday",
      getRange: () => ({
        from: startOfDay(subDays(new Date(), 1)),
        to: endOfDay(subDays(new Date(), 1))
      })
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

  const handlePresetClick = useCallback((preset) => {
    // Prevent double-trigger
    if (selectedPreset === preset.value) return
    
    // Immediate visual feedback
    setSelectedPreset(preset.value)
    // Defer heavy computation
    requestAnimationFrame(() => {
      const range = preset.getRange()
      setDateRange(range)
    })
  }, [selectedPreset])

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
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-xs sm:text-sm font-semibold">Quick Select</h3>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 lg:grid-cols-1">
          {presets.map((preset) => (
            <Button
              key={preset.value}
              variant={selectedPreset === preset.value ? "default" : "outline"}
              size="sm"
              className="justify-start text-xs sm:text-sm min-h-[44px] touch-manipulation"
              onClick={(e) => {
                e?.preventDefault()
                e?.stopPropagation()
                handlePresetClick(preset)
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs sm:text-sm font-semibold">Custom Range</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal text-xs sm:text-sm h-9",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
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
              numberOfMonths={window.innerWidth >= 640 ? 2 : 1}
              disabled={(date) => date > new Date()}
            />
          </PopoverContent>
        </Popover>
        
        {dateRange && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearDates}
            className="w-full text-xs sm:text-sm min-h-[44px] touch-manipulation"
          >
            Clear Dates
          </Button>
        )}
      </div>

      {dateRange?.from ? (
        <div className="rounded-lg bg-muted p-2.5 sm:p-3 text-xs sm:text-sm">
          <p className="font-medium text-xs sm:text-sm">
            {selectedPreset === "yesterday" ? "Yesterday" : "Selected Range"}
          </p>
          <p className="text-muted-foreground text-[10px] sm:text-xs">
            {format(dateRange.from, "MMM dd, yyyy")}
            {dateRange.to && format(dateRange.from, "MMM dd, yyyy") !== format(dateRange.to, "MMM dd, yyyy") && (
              <> to {format(dateRange.to, "MMM dd, yyyy")}</>
            )}
          </p>
          <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
            {Math.ceil((dateRange.to - dateRange.from) / (1000 * 60 * 60 * 24)) + 1} days
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-muted p-2.5 sm:p-3 text-xs sm:text-sm">
          <p className="font-medium text-xs sm:text-sm">All Data</p>
          <p className="text-muted-foreground text-[10px] sm:text-xs">
            Showing all available data
          </p>
        </div>
      )}
    </div>
  )
}
