import { useMemo, useState } from "react";

export const PAGE_SIZE_OPTIONS = [25, 50, 100, 500] as const;

export function usePagination<T>(items: T[], initialPageSize: number = 25) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page_ = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (page_ - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page_, pageSize]);

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(1);
  };

  return {
    pageItems,
    page: page_,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
  };
}
