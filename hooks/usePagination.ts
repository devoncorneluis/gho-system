import { useCallback, useMemo, useState } from "react";

export type UsePaginationResult = {
  page: number;
  pageSize: number;
  from: number;
  to: number;
  totalPages: number;
  setPage: (page: number) => void;
};

export function usePagination(total: number, pageSize = 25): UsePaginationResult {
  const [page, setPageState] = useState(1);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  const safePage = Math.min(Math.max(page, 1), totalPages);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  const setPage = useCallback((nextPage: number) => {
    setPageState(Math.max(1, nextPage));
  }, []);

  return {
    page: safePage,
    pageSize,
    from,
    to,
    totalPages,
    setPage,
  };
}
