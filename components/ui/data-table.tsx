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
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-xl border border-[#1F1F23] bg-[#0B0B0C] pl-10 pr-8 text-sm outline-none transition-all placeholder:text-[#8E8E95] focus:border-[#3D4BFF]/50 text-white focus:ring-1 focus:ring-[#3D4BFF]/50"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-2.5 rounded-full p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-850 dark:hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Show
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-xl border border-zinc-200 bg-white px-2 py-1.5 text-xs font-semibold text-zinc-700 outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            entries
          </span>
        </div>
      </div>

      {/* Main Table component */}
      <div className="overflow-hidden rounded-xl border border-[#1F1F23] bg-[#131316]">
        <Table>
          <TableHeader className="bg-[#11112B]">
            <TableRow className="border-b border-[#1F1F23] hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "h-12 px-4 text-xs font-bold tracking-wider text-[#8E8E95] uppercase",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right"
                  )}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => requestSort(col.key)}
                      className={cn(
                        "group inline-flex items-center hover:text-zinc-800 dark:hover:text-zinc-200",
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
                <TableCell colSpan={columns.length} className="h-32 text-center text-zinc-400">
                  Tidak ada data yang cocok dengan kriteria pencarian.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, rowIdx) => (
                <TableRow
                  key={rowIdx}
                  className="border-b border-[#1F1F23] transition-colors hover:bg-[#11112B]/50"
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        "px-4 py-3.5 text-sm text-white",
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
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          Showing <span className="text-zinc-800 dark:text-zinc-200">{startIndex}</span> to{" "}
          <span className="text-zinc-800 dark:text-zinc-200">{endIndex}</span> of{" "}
          <span className="text-zinc-800 dark:text-zinc-200">{totalEntries}</span> entries
        </span>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={activePage === 1}
            className="h-8 w-8 rounded-lg border-zinc-200 p-0 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
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
                    <span className="text-xs text-zinc-400 px-1 select-none">...</span>
                  )}
                  <Button
                    variant={activePage === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(p)}
                    className={cn(
                      "h-8 min-w-[32px] rounded-lg text-xs font-bold",
                      activePage === p
                        ? "bg-rose-500 text-white hover:bg-rose-600"
                        : "border-zinc-200 text-zinc-650 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400"
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
            className="h-8 w-8 rounded-lg border-zinc-200 p-0 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
