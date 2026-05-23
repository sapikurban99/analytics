"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  searchFields?: (keyof T)[];
  searchPlaceholder?: string;
  defaultSort?: { key: string; direction: "asc" | "desc" };
  onFilteredDataChange?: (filteredData: T[]) => void;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchFields = [],
  searchPlaceholder = "Cari data...",
  defaultSort,
  onFilteredDataChange,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(defaultSort || null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);



  // Regex and normal searching
  const filteredData = useMemo(() => {
    if (!searchQuery || searchFields.length === 0) return data;

    let regex: RegExp | null = null;
    try {
      // Treat searchQuery as a potential regular expression
      regex = new RegExp(searchQuery, "i");
    } catch {
      // Fail silently if not a valid regex syntax
      regex = null;
    }

    return data.filter((item) => {
      return searchFields.some((field) => {
        const val = item[field];
        if (val === null || val === undefined) return false;
        const strVal = String(val);

        if (regex) {
          return regex.test(strVal);
        } else {
          return strVal.toLowerCase().includes(searchQuery.toLowerCase());
        }
      });
    });
  }, [data, searchQuery, searchFields]);

  // Sorting
  const sortedData = useMemo(() => {
    const sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle case-insensitive string comparison
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle numbers/booleans comparison
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // Compute active page safely capped at totalPages to handle dynamic list sizing declaratively
  const totalEntries = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  // Notify parent of data change for exporting CSV
  useEffect(() => {
    if (onFilteredDataChange) {
      onFilteredDataChange(sortedData);
    }
  }, [sortedData, onFilteredDataChange]);

  // Pagination bounds
  const paginatedData = useMemo(() => {
    const start = (activePage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, activePage, pageSize]);

  const startIndex = totalEntries === 0 ? 0 : (activePage - 1) * pageSize + 1;
  const endIndex = Math.min(totalEntries, activePage * pageSize);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronsUpDown className="ml-1 h-3.5 w-3.5 opacity-40 group-hover:opacity-80" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="ml-1 h-3.5 w-3.5 text-rose-500" />
    ) : (
      <ChevronDown className="ml-1 h-3.5 w-3.5 text-rose-500" />
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and page size block */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {searchFields.length > 0 && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-xl border border-border bg-background pl-10 pr-8 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-[#3D4BFF]/50 text-foreground focus:ring-1 focus:ring-[#3D4BFF]/50"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-2.5 rounded-full p-0.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs font-medium text-muted-foreground">
            Show
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-xl border border-border bg-card px-2 py-1.5 text-xs font-semibold text-foreground outline-none cursor-pointer"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-xs font-medium text-muted-foreground">
            entries
          </span>
        </div>
      </div>

      {/* Main Table component */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader className="bg-[#3D4BFF]/5 dark:bg-[#3D4BFF]/10">
            <TableRow className="border-b border-border hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "h-12 px-4 text-xs font-bold tracking-wider text-muted-foreground uppercase",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right"
                  )}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => requestSort(col.key)}
                      className={cn(
                        "group inline-flex items-center hover:text-foreground cursor-pointer",
                        col.align === "center" && "mx-auto justify-center",
                        col.align === "right" && "ml-auto justify-end"
                      )}
                    >
                      {col.header}
                      {getSortIcon(col.key)}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  Tidak ada data yang cocok dengan kriteria pencarian.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, rowIdx) => (
                <TableRow
                  key={rowIdx}
                  className="border-b border-border transition-colors hover:bg-muted/20"
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        "px-4 py-3.5 text-sm text-foreground",
                        col.align === "center" && "text-center",
                        col.align === "right" && "text-right font-medium"
                      )}
                    >
                      {col.render ? col.render(item) : item[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination control block */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2">
        <span className="text-xs font-semibold text-muted-foreground">
          Showing <span className="text-foreground">{startIndex}</span> to{" "}
          <span className="text-foreground">{endIndex}</span> of{" "}
          <span className="text-foreground">{totalEntries}</span> entries
        </span>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={activePage === 1}
            className="h-8 w-8 rounded-lg border-border p-0 text-muted-foreground hover:bg-muted/40 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Dynamic pagination page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - activePage) <= 1)
            .map((p, idx, arr) => {
              const prev = arr[idx - 1];
              const showEllipsis = prev && p - prev > 1;

              return (
                <React.Fragment key={p}>
                  {showEllipsis && (
                    <span className="text-xs text-muted-foreground px-1 select-none">...</span>
                  )}
                  <Button
                    variant={activePage === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(p)}
                    className={cn(
                      "h-8 min-w-[32px] rounded-lg text-xs font-bold cursor-pointer",
                      activePage === p
                        ? "bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/10"
                        : "border-border text-foreground hover:bg-muted/40"
                    )}
                  >
                    {p}
                  </Button>
                </React.Fragment>
              );
            })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={activePage === totalPages}
            className="h-8 w-8 rounded-lg border-border p-0 text-muted-foreground hover:bg-muted/40 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
