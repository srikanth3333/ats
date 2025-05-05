"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import React from "react";

interface ColumnData {
  label: string;
  name: string;
  type?: string;
}

interface TableComponentProps {
  jsonData: Record<string, any>[];
  customHeaders?: string[];
  arrayData?: ColumnData[];
  loading?: boolean;
  paginate?: boolean;
  pageSize?: number;
  onchangePageSize?: (value: number) => void;
  pageSizeOptions?: string[];
  pageSizeSelected?: number;
  totalItems?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: Record<string, any>) => void;
}

const DataTable: React.FC<TableComponentProps> = ({
  jsonData,
  customHeaders,
  onRowClick,
  arrayData,
  loading = false,
  paginate = false,
  pageSize,
  onchangePageSize,
  pageSizeOptions = ["10", "20", "50", "100"],
  pageSizeSelected = 10,
  totalItems = 0,
  currentPage = 1,
  onPageChange,
}) => {
  const columns =
    jsonData.length > 0
      ? Object.keys(jsonData[0]).map((key) => ({
          title: key.charAt(0).toUpperCase() + key.slice(1),
          dataIndex: key,
          sorter: (a: any, b: any) => a[key] - b[key],
          key,
        }))
      : [];

  let finalColumns = !arrayData
    ? columns
    : arrayData.map((data, i) => {
        if (data.type === "date") {
          return {
            title: `${data.label}`,
            dataIndex: `${data.name}`,
            key: i,
            width: 150,
            textWrap: "word-break",
            ellipsis: true,
            fixed: i < 1 ? "left" : null,
            sorter: (a: any, b: any) => a[data.name] - b[data.name],
            render: (val: any) => {
              if (data.name.includes("date") || data.name.includes("_at")) {
                try {
                  const utcDate = parseISO(val);
                  const formattedDate = format(utcDate, "dd/MM/yyyy, hh:mm a");
                  return formattedDate;
                } catch (e) {
                  return val;
                }
              }
              return `${val} custom val data added`;
            },
          };
        }

        if (data.type === "link") {
          return {
            title: `${data.label}`,
            dataIndex: `${data.name}`,
            key: i,
            width: 150,
            textWrap: "word-break",
            ellipsis: true,
            fixed: i < 1 ? "left" : null,
            sorter: (a: any, b: any) => a[data.name] - b[data.name],
            render: (val: any) => {
              return (
                <span className="text-blue-400 underline cursor-pointer">
                  {val}
                </span>
              );
            },
          };
        }

        return {
          title: `${data.label}`,
          dataIndex: `${data.name}`,
          key: i,
          width: 150,
          textWrap: "word-break",
          ellipsis: true,
          fixed: i < 1 ? "left" : null,
          sorter: (a: any, b: any) => a[data.name] - b[data.name],
          render: (val: any) => val,
        };
      });

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  const totalPages = Math.ceil(totalItems / pageSizeSelected);
  const startItem =
    totalItems === 0 ? 0 : (currentPage - 1) * pageSizeSelected + 1;
  const endItem = Math.min(currentPage * pageSizeSelected, totalItems);

  return (
    <div className="w-full">
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150">
              {finalColumns.map((column: any, index: number) => (
                <TableHead
                  key={column.key}
                  className={`
                    ${column.fixed === "left" ? "sticky left-0 z-10" : ""}
                    py-4 px-6 font-semibold text-gray-700 dark:text-gray-200
                    border border-gray-200 dark:border-gray-700
                  `}
                >
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={finalColumns.length}
                  className="h-24 text-center"
                >
                  <div className="space-y-2">
                    {Array.from({ length: pageSizeSelected || 10 }).map(
                      (_, index) => (
                        <Skeleton
                          key={index}
                          className="h-8 w-full rounded-md bg-gray-200 dark:bg-gray-700"
                        />
                      )
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : jsonData.length > 0 ? (
              jsonData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                  {finalColumns.map((column: any, colIndex: number) => (
                    <TableCell
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        ${
                          column.fixed === "left"
                            ? "sticky left-0 z-10 bg-white dark:bg-gray-800"
                            : ""
                        }
                        ${column.textWrap === "word-break" ? "break-words" : ""}
                        ${column.ellipsis ? "truncate" : ""}
                        py-3 px-6 text-gray-600 dark:text-gray-300
                        border border-gray-200 dark:border-gray-700
                      `}
                    >
                      {column.render
                        ? column.render(row[column.dataIndex])
                        : row[column.dataIndex]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={finalColumns.length}
                  className="h-24 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {totalItems > 0 ? (
            <>
              Showing {startItem} to {endItem} of {totalItems} entries
            </>
          ) : (
            <>No entries found</>
          )}
        </div>
        <div className="flex gap-5">
          {paginate && (
            <div className="flex items-center space-x-3">
              <span className="text-sm flex text-gray-600 dark:text-gray-400">
                Rows per page:
              </span>
              <div>
                <Select
                  value={pageSizeSelected.toString()}
                  onValueChange={(value) =>
                    onchangePageSize && onchangePageSize(parseInt(value))
                  }
                >
                  <SelectTrigger className="w-20 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200">
                    <SelectValue placeholder={pageSizeSelected.toString()} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">
                    {pageSizeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-6">
            {totalPages > 0 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        currentPage > 1 && handlePageChange(currentPage - 1)
                      }
                      className={`
                      ${
                        currentPage <= 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                      text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                      transition-colors duration-150 rounded-md
                    `}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;

                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={pageNum === currentPage}
                          className={`
                          ${
                            pageNum === currentPage
                              ? "bg-blue-500 text-white dark:bg-blue-600"
                              : "text-gray-600 dark:text-gray-300"
                          }
                          hover:bg-gray-100 dark:hover:bg-gray-700
                          transition-colors duration-150 rounded-md
                        `}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis className="text-gray-600 dark:text-gray-300" />
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        currentPage < totalPages &&
                        handlePageChange(currentPage + 1)
                      }
                      className={`
                      ${
                        currentPage >= totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                      text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                      transition-colors duration-150 rounded-md
                    `}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
