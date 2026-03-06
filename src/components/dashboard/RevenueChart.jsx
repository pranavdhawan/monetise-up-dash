import { useState, useEffect, useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

const convertToNumber = (value) => {
  if (!value) return 0
  const cleanedValue = value.toString().replace(/,/g, "").replace(/\$/g, "")
  return parseFloat(cleanedValue) || 0
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md max-w-xs">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground truncate">{entry.name}:</span>
            <span className="font-medium">
              {entry.name.toLowerCase().includes("revenue") || entry.name.toLowerCase().includes("cpm")
                ? `$${entry.value.toFixed(2)}`
                : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function RevenueChart({ sheetID, websiteName, dateRange }) {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState({
    revenue: [],
    rates: [],
    volumes: [],
    others: []
  })

  const key = import.meta.env.VITE_CLIENT_KEY

  // Debug: Log date range and filtered data
  useEffect(() => {
    if (dateRange) {
      console.log('RevenueChart - Date Range:', {
        from: dateRange.from?.toLocaleDateString(),
        to: dateRange.to?.toLocaleDateString(),
        raw: dateRange
      })
    }
  }, [dateRange])

  useEffect(() => {
    const getData = async () => {
      if (!sheetID || !websiteName || !key) {
        return
      }

      setLoading(true)
      try {
        const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values:batchGet?ranges=${websiteName}&majorDimension=ROWS&key=${key}`
        const response = await fetch(endpoint)
        const result = await response.json()

        if (result.error) {
          setError(result.error.message)
          setLoading(false)
          return
        }

        const headers = result.valueRanges[0].values[0]
        const dateIndex = headers.indexOf("Date")

        // Categorize metrics automatically
        const revenueMetrics = []
        const rateMetrics = []
        const volumeMetrics = []
        const otherMetrics = []

        headers.forEach((header) => {
          const lower = header.toLowerCase()
          if (header === "Date" || header === "Website") return
          
          if (lower.includes("revenue") || lower.includes("earnings")) {
            revenueMetrics.push(header)
          } else if (lower.includes("cpm") || lower.includes("ecpm") || lower.includes("rate")) {
            rateMetrics.push(header)
          } else if (lower.includes("impression") || lower.includes("views") || lower.includes("clicks") || lower.includes("requests")) {
            volumeMetrics.push(header)
          } else {
            otherMetrics.push(header)
          }
        })

        setMetrics({
          revenue: revenueMetrics,
          rates: rateMetrics,
          volumes: volumeMetrics,
          others: otherMetrics
        })

        const data = result.valueRanges[0].values
          .slice(1)
          .map((row) => {
            const rowData = { Date: row[dateIndex] }
            headers.forEach((header, index) => {
              if (index !== dateIndex && row[index]) {
                rowData[header] = convertToNumber(row[index])
              }
            })
            return rowData
          })
          .filter(row => {
            // Filter out rows with no data
            const hasData = row.Date && Object.keys(row).length > 1
            if (!hasData) return false
            
            // Check if any revenue metric has value
            const hasRevenue = revenueMetrics.some(metric => (row[metric] || 0) > 0)
            return hasRevenue || Object.keys(row).length > 1
          })

        setChartData(data)
        setError(null)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    getData()
  }, [sheetID, websiteName, key])

  // Optimize date parsing - cache parsed dates and handle multiple formats
  const chartDataWithParsedDates = useMemo(() => {
    return chartData.map(item => {
      if (!item.Date) return { ...item, parsedDate: null }
      
      let parsedDate = null
      const dateStr = String(item.Date).trim()
      
      // Try different date formats
      // Format 1: DD/MM/YYYY or DD-MM-YYYY (most common from Google Sheets)
      if (dateStr.includes('/') || dateStr.includes('-')) {
        const parts = dateStr.split(/[\/\-]/)
        if (parts.length === 3) {
          // Assume DD/MM/YYYY format
          const day = parseInt(parts[0], 10)
          const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed
          const year = parseInt(parts[2], 10)
          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            parsedDate = new Date(year, month, day)
          }
        }
      }
      
      // Format 2: Try direct Date parsing
      if (!parsedDate || isNaN(parsedDate.getTime())) {
        parsedDate = new Date(dateStr)
      }
      
      // If still invalid, try ISO format conversion
      if (isNaN(parsedDate.getTime()) && dateStr.includes('/')) {
        const isoStr = dateStr.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')
        parsedDate = new Date(isoStr)
      }
      
      return { ...item, parsedDate: (parsedDate && !isNaN(parsedDate.getTime())) ? parsedDate : null }
    })
  }, [chartData])

  const filteredData = useMemo(() => {
    // If no date range, return all data
    if (!dateRange || !dateRange.from || !dateRange.to) {
      console.log('RevenueChart - No date range, showing all data:', chartDataWithParsedDates.length, 'items')
      return chartDataWithParsedDates
    }

    // Create date objects and normalize to start/end of day
    const rangeStart = new Date(dateRange.from)
    rangeStart.setHours(0, 0, 0, 0)
    const rangeStartTime = rangeStart.getTime()
    
    const rangeEnd = new Date(dateRange.to)
    rangeEnd.setHours(23, 59, 59, 999)
    const rangeEndTime = rangeEnd.getTime()

    console.log('RevenueChart - Filtering with range:', {
      start: rangeStart.toLocaleDateString(),
      end: rangeEnd.toLocaleDateString(),
      totalItems: chartDataWithParsedDates.length
    })

    const filtered = chartDataWithParsedDates.filter((item) => {
      if (!item.parsedDate || isNaN(item.parsedDate.getTime())) return false
      
      // Get timestamp for comparison
      const itemTime = item.parsedDate.getTime()
      
      // Check if item date falls within range
      return itemTime >= rangeStartTime && itemTime <= rangeEndTime
    })

    console.log('RevenueChart - Filtered result:', filtered.length, 'items')
    return filtered
  }, [chartDataWithParsedDates, dateRange])

  // Sample data for mobile to improve performance (show max 50 points on mobile)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const displayData = useMemo(() => {
    if (!isMobile || filteredData.length <= 50) return filteredData
    
    // Sample data: take every nth item to get ~50 points
    const sampleRate = Math.ceil(filteredData.length / 50)
    return filteredData.filter((_, index) => index % sampleRate === 0)
  }, [filteredData, isMobile])

  // Stats summary - dynamic based on selected date range
  const summaryStats = useMemo(() => {
    const allMetrics = [...metrics.revenue, ...metrics.rates, ...metrics.volumes, ...metrics.others]
    if (allMetrics.length === 0 || filteredData.length === 0) return null

    let label = "Selected Range Performance"
    let badge = ""
    let mode = "range" // "single" | "range" | "all"

    if (!dateRange || !dateRange.from || !dateRange.to) {
      mode = "all"
      label = "All Time Performance"
      badge = "All data"
    } else {
      const from = new Date(dateRange.from)
      const to = new Date(dateRange.to)

      const sameDay = from.toDateString() === to.toDateString()

      if (sameDay) {
        mode = "single"

        const today = new Date()
        const yesterday = new Date()
        yesterday.setDate(today.getDate() - 1)

        if (from.toDateString() === today.toDateString()) {
          label = "Today's Performance"
        } else if (from.toDateString() === yesterday.toDateString()) {
          label = "Yesterday's Performance"
        } else {
          label = "Daily Performance"
        }

        badge = from.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      } else {
        mode = "range"
        const fromStr = from.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
        const toStr = to.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
        badge = `${fromStr} - ${toStr}`
      }
    }

    const totals = {}
    allMetrics.forEach((metric) => {
      totals[metric] = 0
    })

    filteredData.forEach((item) => {
      allMetrics.forEach((metric) => {
        const value = item[metric]
        if (typeof value === "number" && !isNaN(value)) {
          totals[metric] += value
        }
      })
    })

    return { totals, label, badge, mode }
  }, [metrics, filteredData, dateRange])

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{websiteName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available for the selected date range</p>
        </CardContent>
      </Card>
    )
  }

  const hasMultipleRevenueMetrics = metrics.revenue.length > 1

  return (
    <Card>
      <CardHeader>
        <CardTitle>{websiteName} - Analytics</CardTitle>
        <CardDescription>
          Complete performance metrics overview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Dynamic Stats Summary based on selected date range */}
        {summaryStats && (
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-sm font-semibold">{summaryStats.label}</h3>
              <Badge variant="secondary" className="w-fit">
                {summaryStats.badge}
              </Badge>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...metrics.revenue, ...metrics.volumes, ...metrics.rates].slice(0, 8).map((metric, idx) => (
                <div key={metric} className="rounded-lg bg-muted p-3 sm:p-4 will-change-contents">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{metric}</p>
                  <p
                    className="text-lg sm:text-2xl font-bold truncate"
                    style={{ color: colors[idx % colors.length] }}
                  >
                    {metrics.rates.includes(metric) || metrics.revenue.includes(metric)
                      ? `$${(summaryStats.totals[metric] || 0).toFixed(2)}`
                      : (summaryStats.totals[metric] || 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!summaryStats && (
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">No data available for the selected range</p>
          </div>
        )}

        {/* Revenue Chart */}
        {metrics.revenue.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Revenue</h3>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={300} minWidth={300}>
                <BarChart data={displayData} margin={{ top: 20, right: 10, left: 60, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="Date"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 10 }}
                  />
                <YAxis
                  tick={{ fill: "hsl(var(--foreground))" }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                
                {metrics.revenue.map((metric, idx) => (
                  <Bar 
                    key={metric}
                    dataKey={metric} 
                    stackId={hasMultipleRevenueMetrics ? "revenue" : undefined}
                    fill={colors[idx % colors.length]} 
                    name={metric}
                  />
                ))}
              </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Rate Metrics (CPM, eCPM, etc.) */}
        {metrics.rates.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Rate Metrics</h3>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={250} minWidth={300}>
                <LineChart data={displayData} margin={{ top: 20, right: 10, left: 60, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="Date"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--foreground))" }}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                
                {metrics.rates.map((metric, idx) => (
                  <Line 
                    key={metric}
                    type="monotone" 
                    dataKey={metric} 
                    stroke={colors[(idx + 2) % colors.length]} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name={metric}
                  />
                ))}
              </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Volume Metrics (Impressions, Views, etc.) */}
        {metrics.volumes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Volume Metrics</h3>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={250} minWidth={300}>
                <AreaChart data={displayData} margin={{ top: 20, right: 10, left: 70, bottom: 60 }}>
                <defs>
                  {metrics.volumes.map((metric, idx) => (
                    <linearGradient key={`gradient-${metric}`} id={`color-${metric}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors[(idx + 4) % colors.length]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={colors[(idx + 4) % colors.length]} stopOpacity={0.1}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="Date"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--foreground))" }}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                
                {metrics.volumes.map((metric, idx) => (
                  <Area
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={colors[(idx + 4) % colors.length]}
                    fillOpacity={1}
                    fill={`url(#color-${metric})`}
                    name={metric}
                  />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Other Metrics */}
        {metrics.others.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Other Metrics</h3>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={250} minWidth={300}>
                <LineChart data={displayData} margin={{ top: 20, right: 10, left: 60, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="Date"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                />
                <YAxis tick={{ fill: "hsl(var(--foreground))" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                
                {metrics.others.map((metric, idx) => (
                  <Line 
                    key={metric}
                    type="monotone" 
                    dataKey={metric} 
                    stroke={colors[(idx + 6) % colors.length]} 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name={metric}
                  />
                ))}
              </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
