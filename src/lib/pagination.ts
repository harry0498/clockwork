export const PAGE_SIZE = 25;

export function parseSort<T extends string>(
  params: { sort?: string; dir?: string },
  allowed: readonly T[],
  defaultSort: T,
  defaultDir: "asc" | "desc" = "desc",
): { sort: T; dir: "asc" | "desc" } {
  const sort = allowed.includes(params.sort as T)
    ? (params.sort as T)
    : defaultSort;
  const dir =
    params.dir === "asc" || params.dir === "desc" ? params.dir : defaultDir;
  return { sort, dir };
}

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
