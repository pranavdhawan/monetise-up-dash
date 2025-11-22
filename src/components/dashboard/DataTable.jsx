import { useState, useEffect, useMemo, useTransition } from "react"
import { Download, Search, Settings2, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

const convertToNumber = (value) => {
  if (!value) return 0
  const cleanedValue = value.toString().replace(/,/g, "").replace(/\$/g, "")
  return parseFloat(cleanedValue) || 0
}

export function DataTable({ sheetID, websiteName, dateRange }) {
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })
  const [columnVisibility, setColumnVisibility] = useState({})
  // Smaller default page size on mobile for better performance
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 25
    }
    return 50
  })
  const [isPending, startTransition] = useTransition()
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  
  // Cache parsed dates to avoid repeated parsing and handle multiple formats
  const tableDataWithParsedDates = useMemo(() => {
    return tableData.map(item => {
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
  }, [tableData])

  const key = import.meta.env.VITE_CLIENT_KEY

  // Debounce search query for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    const fetchData = async () => {
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
        const rows = result.valueRanges[0].values.slice(1)

        const formattedData = rows.map((row) => {
          return headers.reduce((obj, header, index) => {
            obj[header] = row[index] || ""
            return obj
          }, {})
        })

        setTableData(formattedData)
        
        // Initialize column visibility
        const initialVisibility = {}
        headers.forEach(header => {
          initialVisibility[header] = true
        })
        setColumnVisibility(initialVisibility)
        
        setError(null)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sheetID, websiteName, key])

  const filteredAndSortedData = useMemo(() => {
    let data = [...tableDataWithParsedDates]

    // Apply date range filter (using cached parsed dates)
    if (dateRange && dateRange.from && dateRange.to) {
      // Create date objects and normalize to start/end of day
      const rangeStart = new Date(dateRange.from)
      rangeStart.setHours(0, 0, 0, 0)
      const rangeStartTime = rangeStart.getTime()
      
      const rangeEnd = new Date(dateRange.to)
      rangeEnd.setHours(23, 59, 59, 999)
      const rangeEndTime = rangeEnd.getTime()
      
      data = data.filter((item) => {
        if (!item.parsedDate || isNaN(item.parsedDate.getTime())) return false
        
        // Get timestamp for comparison
        const itemTime = item.parsedDate.getTime()
        
        // Check if item date falls within range
        return itemTime >= rangeStartTime && itemTime <= rangeEndTime
      })
    }

    // Apply search filter (using debounced query)
    if (debouncedSearchQuery) {
      data = data.filter((row) =>
        Object.values(row).some((value) =>
          value.toString().toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        )
      )
    }

    // Apply sorting
    if (sortConfig.key) {
      data.sort((a, b) => {
        const aValue = convertToNumber(a[sortConfig.key])
        const bValue = convertToNumber(b[sortConfig.key])
        
        // Try numeric comparison first
        if (!isNaN(aValue) && !isNaN(bValue)) {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
        }
        
        // Fall back to string comparison
        const aStr = String(a[sortConfig.key])
        const bStr = String(b[sortConfig.key])
        
        if (sortConfig.direction === "asc") {
          return aStr.localeCompare(bStr)
        }
        return bStr.localeCompare(aStr)
      })
    }

    return data
  }, [tableDataWithParsedDates, dateRange, debouncedSearchQuery, sortConfig])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredAndSortedData.slice(startIndex, endIndex)
  }, [filteredAndSortedData, currentPage, pageSize])

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize)

  useEffect(() => {
    // Reset to page 1 when filters change (non-blocking)
    startTransition(() => {
      setCurrentPage(1)
    })
  }, [searchQuery, dateRange, sortConfig, pageSize])

  const columns = useMemo(() => {
    if (tableData.length === 0) return []
    return Object.keys(tableData[0])
  }, [tableData])

  const visibleColumns = useMemo(() => {
    return columns.filter(col => columnVisibility[col])
  }, [columns, columnVisibility])

  const handleSort = (key) => {
    setSortConfig((current) => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc"
        }
      }
      return { key, direction: "asc" }
    })
  }

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    )
  }

  const exportToCSV = () => {
    const headers = visibleColumns.join(",")
    const rows = filteredAndSortedData.map((row) =>
      visibleColumns.map((col) => `"${row[col]}"`).join(",")
    )
    const csv = [headers, ...rows].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${websiteName}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatCellValue = (value, header) => {
    const numValue = convertToNumber(value)
    const nondollarValues = ["Impressions", "Ad Requests", "Ad Impressions", "Date", "Website"]
    
    if (header === "Fill Rate") {
      return `${numValue.toFixed(2)}%`
    }
    
    if (!nondollarValues.includes(header) && numValue > 0) {
      return `$${numValue.toFixed(2)}`
    }
    
    if (["Impressions", "Ad Requests", "Ad Impressions"].includes(header)) {
      return numValue.toLocaleString()
    }
    
    return value
  }

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

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <CardTitle className="text-lg sm:text-xl truncate">{websiteName} - Detailed Data</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              View and export detailed analytics data
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="text-xs">
              {filteredAndSortedData.length} rows
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2 sm:left-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 sm:pl-9 text-sm h-9"
            />
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap sm:flex-nowrap">
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-[90px] sm:w-[110px] h-9 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="25">25 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
                <SelectItem value="100">100 rows</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1 sm:gap-2 h-9 px-2 sm:px-4 text-xs sm:text-sm">
                  <Settings2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Columns</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px] sm:w-[200px]">
                {columns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column}
                    checked={columnVisibility[column]}
                    onCheckedChange={(checked) =>
                      setColumnVisibility((prev) => ({ ...prev, [column]: checked }))
                    }
                    className="text-xs sm:text-sm"
                  >
                    {column}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={exportToCSV} className="gap-1 sm:gap-2 h-9 px-2 sm:px-4 text-xs sm:text-sm">
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.map((column) => (
                  <TableHead key={column} className="whitespace-nowrap">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column)}
                      className="hover:bg-transparent font-semibold text-xs sm:text-sm h-8 sm:h-auto px-2 sm:px-4"
                    >
                      <span className="truncate">{column}</span>
                      {getSortIcon(column)}
                    </Button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} className="text-center py-6 sm:py-8">
                    <p className="text-xs sm:text-sm text-muted-foreground">No data available</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => (
                  <TableRow key={index}>
                    {visibleColumns.map((column) => (
                      <TableCell key={column} className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4 py-2 sm:py-3">
                        {formatCellValue(row[column], column)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredAndSortedData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 sm:mt-4 gap-3">
            <div className="text-xs sm:text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length} rows
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 px-2 sm:px-3 text-xs"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <div className="text-xs sm:text-sm px-2">
                {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-2 sm:px-3 text-xs"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
