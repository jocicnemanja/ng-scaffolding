import { Observable } from "rxjs";
import { PageResponse } from "../models/page-response.models";

export interface GridState<T extends { id: string }> {
  entities: T[];
  query: QueryState;
  pagination: PaginationState;
  loadingCounter: number;
  errors: GridError[];
  selectedIds: ReadonlySet<string>;
  activeId: string | null;
}

export type GridError = {
  id: string;
  message: string;
  code: string;
  timestamp: number;
  context?: unknown;
};
export type QueryState = {
  sort: { field: string; direction: 'asc' | 'desc' }[];
  filters: Record<string, string>;
};

export type PaginationState = {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

// @example
// const query = {
//   sort: [
//     { field: 'price', direction: 'asc' },
//     { field: 'date', direction: 'desc' },
//   ],
//   filters: { category: 'electronics' },
// };

export interface GridDataSource<T, Q extends QueryState> {
  create?(entity: Partial<T>): Observable<T>;
  read(query: Q, pagination: PaginationState): Observable<PageResponse<T>>;
  update?(entity: T): Observable<T>;
  delete?(id: string | number): Observable<void>;
}
