import { PostgrestError } from "@supabase/supabase-js";

  export type TableData<T> = T;
  export interface CrudResponse<T> {
    data: T | null;
    success: boolean;
    error: PostgrestError | null;
  }
  export interface PaginatedResponse<T> {
    data: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
  
  export interface FetchTableDataParams {
    tableName: string;
    page: number;
    pageSize: number;
    columnToSort?: string;
    sortDirection?: "asc" | "desc";
    filters?: Record<string, string | number | boolean | null | { operator: string; value: string | number | boolean | null }>;
    searchTerm?: string;
    searchColumns?: string[];
    foreignKeys?: Record<string, string[]>;
    applyUserIdFilter?: boolean,
  }