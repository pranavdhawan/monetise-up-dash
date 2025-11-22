import { useState, useEffect, useCallback, useMemo } from "react"
import { format, subDays, subMonths, startOfYear, startOfDay, endOfDay } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useMobileClick } from "@/hooks/use-mobile-click"

// Preset button component to properly use hooks
function PresetButton({ preset, selectedPreset, onPresetClick }) {
  const handleClick = useMobileClick(() => onPresetClick(preset), 300)
  
  return (
    <Button
      variant={selectedPreset === preset.value ? "default" : "outline"}
      size="sm"
      className="justify-start text-xs sm:text-sm min-h-[44px] touch-manipulation"
      onClick={handleClick}
    >
      {preset.label}
    </Button>
  )
}

export function DateFilter({ onDateRangeChange }) {
  // Initialize with yesterday's date range
  const getYesterdayRange = () => ({
    from: startOfDay(subDays(new Date(), 1)),
    to: endOfDay(subDays(new Date(), 1))
  })
  
  const [dateRange, setDateRange] = useState(getYesterdayRange())
  const [selectedPreset, setSelectedPreset] = useState("yesterday")

  // Update parent when dateRange changes
  useEffect(() => {
    onDateRangeChange(dateRange)
  }, [dateRange]) // Only depend on dateRange, not onDateRangeChange

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
        from: startOfDay(subDays(new Date(), 7)),
        to: endOfDay(new Date())
      })
    },
    {
      label: "Last 30 days",
      value: "last30",
      getRange: () => ({
        from: startOfDay(subDays(new Date(), 30)),
        to: endOfDay(new Date())
      })
    },
    {
      label: "Last 3 months",
      value: "last3months",
      getRange: () => ({
        from: startOfDay(subMonths(new Date(), 3)),
        to: endOfDay(new Date())
      })
    },
    {
      label: "Year to date",
      value: "ytd",
      getRange: () => ({
        from: startOfDay(startOfYear(new Date())),
        to: endOfDay(new Date())
      })
    },
    {
      label: "Last 2 years",
      value: "last2years",
      getRange: () => ({
        from: startOfDay(subMonths(new Date(), 24)),
        to: endOfDay(new Date())
      })
    }
  ]

  const handlePresetClick = useCallback((preset) => {
    // Prevent double-trigger
    if (selectedPreset === preset.value) return
    
    // Immediate visual feedback
    setSelectedPreset(preset.value)
    
    // Get the range and set it immediately
    const range = preset.getRange()
    if (range) {
      // Ensure dates are proper Date objects with start/end of day
      const normalizedRange = {
        from: startOfDay(range.from),
        to: endOfDay(range.to)
      }
      setDateRange(normalizedRange)
    } else {
      // "All Data" preset
      setDateRange(null)
    }
  }, [selectedPreset])

  const handleStartDateChange = (e) => {
    const dateStr = e.target.value
    if (dateStr) {
      const date = new Date(dateStr)
      const newRange = {
        from: startOfDay(date),
        to: dateRange?.to || endOfDay(date)
      }
      setDateRange(newRange)
      setSelectedPreset(null)
    }
  }

  const handleEndDateChange = (e) => {
    const dateStr = e.target.value
    if (dateStr) {
      const date = new Date(dateStr)
      const newRange = {
        from: dateRange?.from || startOfDay(date),
        to: endOfDay(date)
      }
      setDateRange(newRange)
      setSelectedPreset(null)
    }
  }

  const handleClearDates = useCallback(() => {
    setDateRange(null)
    setSelectedPreset("all")
  }, [])
  
  const handleClearDatesClick = useMobileClick(handleClearDates, 300)

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    if (!date) return ""
    return format(date, "yyyy-MM-dd")
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-xs sm:text-sm font-semibold">Quick Select</h3>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 lg:grid-cols-1">
          {presets.map((preset) => (
            <PresetButton
              key={preset.value}
              preset={preset}
              selectedPreset={selectedPreset}
              onPresetClick={handlePresetClick}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs sm:text-sm font-semibold">Custom Range</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label htmlFor="start-date" className="text-xs text-muted-foreground block">
              Start Date
            </label>
            <Input
              id="start-date"
              type="date"
              value={formatDateForInput(dateRange?.from)}
              onChange={handleStartDateChange}
              max={formatDateForInput(new Date())}
              className="text-xs sm:text-sm h-9 touch-manipulation"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="end-date" className="text-xs text-muted-foreground block">
              End Date
            </label>
            <Input
              id="end-date"
              type="date"
              value={formatDateForInput(dateRange?.to)}
              onChange={handleEndDateChange}
              max={formatDateForInput(new Date())}
              min={formatDateForInput(dateRange?.from)}
              className="text-xs sm:text-sm h-9 touch-manipulation"
            />
          </div>
        </div>
        
        {dateRange && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearDatesClick}
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
