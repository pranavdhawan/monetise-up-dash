import { useState, useEffect, useMemo } from "react"
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
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  const key = import.meta.env.VITE_CLIENT_KEY

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
    let data = [...tableData]

    // Apply date range filter
    if (dateRange?.from && dateRange?.to) {
      data = data.filter((item) => {
        const itemDate = new Date(item.Date.split('/').reverse().join('/'))
        return itemDate >= dateRange.from && itemDate <= dateRange.to
      })
    }

    // Apply search filter
    if (searchQuery) {
      data = data.filter((row) =>
        Object.values(row).some((value) =>
          value.toString().toLowerCase().includes(searchQuery.toLowerCase())
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
  }, [tableData, dateRange, searchQuery, sortConfig])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredAndSortedData.slice(startIndex, endIndex)
  }, [filteredAndSortedData, currentPage, pageSize])

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize)

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1)
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
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>{websiteName} - Detailed Data</CardTitle>
            <CardDescription>
              View and export detailed analytics data
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {filteredAndSortedData.length} rows
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search all columns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-[120px]">
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
                <Button variant="outline" className="gap-2">
                  <Settings2 className="h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {columns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column}
                    checked={columnVisibility[column]}
                    onCheckedChange={(checked) =>
                      setColumnVisibility((prev) => ({ ...prev, [column]: checked }))
                    }
                  >
                    {column}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={exportToCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.map((column) => (
                  <TableHead key={column}>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column)}
                      className="hover:bg-transparent font-semibold"
                    >
                      {column}
                      {getSortIcon(column)}
                    </Button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} className="text-center py-8">
                    <p className="text-muted-foreground">No data available</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => (
                  <TableRow key={index}>
                    {visibleColumns.map((column) => (
                      <TableCell key={column}>
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
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length} rows
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
