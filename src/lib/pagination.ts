export const PAGE_SIZE = 25;

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageCount: number;
}

export function parsePage(searchParams: { page?: string }): {
  page: number;
  offset: number;
  limit: number;
} {
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);
  return { page, offset: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE };
}
