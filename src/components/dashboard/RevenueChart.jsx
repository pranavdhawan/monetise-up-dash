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

  const filteredData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return chartData

    return chartData.filter((item) => {
      const itemDate = new Date(item.Date.split('/').reverse().join('/'))
      return itemDate >= dateRange.from && itemDate <= dateRange.to
    })
  }, [chartData, dateRange])

  // Stats showing ONLY yesterday's data
  const yesterdayStats = useMemo(() => {
    if (chartData.length === 0) return null

    // Get yesterday's date in the format used in the data (DD/MM/YYYY)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toLocaleDateString('en-GB') // DD/MM/YYYY format

    // Find yesterday's data row
    const yesterdayData = chartData.find(item => item.Date === yesterdayStr)
    
    if (!yesterdayData) return null

    const result = {}
    
    // Get all metrics
    const allMetrics = [...metrics.revenue, ...metrics.rates, ...metrics.volumes, ...metrics.others]
    
    allMetrics.forEach(metric => {
      result[metric] = yesterdayData[metric] || 0
    })

    return result
  }, [chartData, metrics])

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
      <CardContent className="space-y-6">
        {/* Stats Summary - Always showing YESTERDAY's data */}
        {yesterdayStats && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Yesterday's Performance</h3>
              <Badge variant="secondary">
                {new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...metrics.revenue, ...metrics.volumes, ...metrics.rates].slice(0, 8).map((metric, idx) => (
                <div key={metric} className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium text-muted-foreground truncate">{metric}</p>
                  <p className="text-2xl font-bold truncate" style={{ color: colors[idx % colors.length] }}>
                    {metrics.rates.includes(metric) || metrics.revenue.includes(metric)
                      ? `$${yesterdayStats[metric].toFixed(2)}`
                      : yesterdayStats[metric].toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!yesterdayStats && (
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground">No data available for yesterday</p>
          </div>
        )}

        {/* Revenue Chart */}
        {metrics.revenue.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
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
        )}

        {/* Rate Metrics (CPM, eCPM, etc.) */}
        {metrics.rates.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Rate Metrics</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
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
        )}

        {/* Volume Metrics (Impressions, Views, etc.) */}
        {metrics.volumes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Volume Metrics</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={filteredData} margin={{ top: 20, right: 30, left: 70, bottom: 60 }}>
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
        )}

        {/* Other Metrics */}
        {metrics.others.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Other Metrics</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
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
        )}
      </CardContent>
    </Card>
  )
}
