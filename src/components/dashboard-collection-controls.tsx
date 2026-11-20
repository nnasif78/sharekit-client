"use client";

import { useMemo, useState, type ReactNode } from "react";

export type DashboardSortOption<T> = {
  value: string;
  label: string;
  compare: (left: T, right: T) => number;
};

type UseDashboardCollectionOptions<T> = {
  items: readonly T[];
  getSearchText: (item: T) => string;
  sortOptions: readonly DashboardSortOption<T>[];
  initialSort: string;
  initialPageSize?: number;
};

export function useDashboardCollection<T>({
  items,
  getSearchText,
  sortOptions,
  initialSort,
  initialPageSize = 9,
}: UseDashboardCollectionOptions<T>) {
  const [searchValue, setSearchValue] = useState("");
  const [sortValue, setSortValue] = useState(initialSort);
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const filteredItems = useMemo(() => {
    const query = searchValue.trim().toLocaleLowerCase();
    const results = items.filter((item) =>
      !query || getSearchText(item).toLocaleLowerCase().includes(query)
    );
    const comparator = sortOptions.find((option) => option.value === sortValue)?.compare;
    return comparator ? results.sort(comparator) : results;
  }, [getSearchText, items, searchValue, sortOptions, sortValue]);

  const pageCount = Math.ceil(filteredItems.length / pageSize);
  const currentPage = Math.min(page, Math.max(pageCount, 1));
  const visibleItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const setSearch = (value: string) => {
    setSearchValue(value);
    setPageState(1);
  };
  const setSort = (value: string) => {
    setSortValue(value);
    setPageState(1);
  };
  const setPage = (value: number) => {
    setPageState(Math.min(Math.max(value, 1), Math.max(pageCount, 1)));
  };
  const setPageSize = (value: number) => {
    setPageSizeState(value);
    setPageState(1);
  };

  return {
    search: searchValue,
    setSearch,
    sort: sortValue,
    setSort,
    page: currentPage,
    setPage,
    pageSize,
    setPageSize,
    pageCount,
    totalItems: filteredItems.length,
    visibleItems,
  };
}

type DashboardCollectionToolbarProps<T> = {
  search: string;
  onSearchChange: (value: string) => void;
  searchLabel: string;
  searchPlaceholder: string;
  sort: string;
  onSortChange: (value: string) => void;
  sortOptions: readonly DashboardSortOption<T>[];
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  children?: ReactNode;
};

export function DashboardCollectionToolbar<T>({
  search,
  onSearchChange,
  searchLabel,
  searchPlaceholder,
  sort,
  onSortChange,
  sortOptions,
  pageSize,
  onPageSizeChange,
  children,
}: DashboardCollectionToolbarProps<T>) {
  return (
    <div className="flex flex-col gap-3 border border-stone-200/90 bg-white p-4 dark:border-zinc-800/90 dark:bg-zinc-900/60 lg:flex-row lg:items-center">
      <input
        type="search"
        aria-label={searchLabel}
        placeholder={searchPlaceholder}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="w-full border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-amber-300 lg:min-w-48 lg:flex-1"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <span>Sort</span>
          <select
            aria-label="Sort results"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="min-w-36 border border-stone-300 bg-white px-3 py-2 font-mono text-xs uppercase tracking-wider text-zinc-900 focus:border-zinc-950 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-amber-300"
          >
            {sortOptions.map((option) => (
              <option value={option.value} key={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <span>Per page</span>
          <select
            aria-label="Results per page"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="border border-stone-300 bg-white px-3 py-2 font-mono text-xs text-zinc-900 focus:border-zinc-950 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-amber-300"
          >
            {[6, 9, 12, 24].map((size) => <option value={size} key={size}>{size}</option>)}
          </select>
        </label>
        {children}
      </div>
    </div>
  );
}

type DashboardCollectionPaginationProps = {
  page: number;
  pageCount: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

export function DashboardCollectionPagination({
  page,
  pageCount,
  pageSize,
  totalItems,
  onPageChange,
}: DashboardCollectionPaginationProps) {
  if (!totalItems) return null;

  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-stone-200/90 pt-4 dark:border-zinc-800/90 sm:flex-row sm:items-center sm:justify-between">
      <p aria-live="polite" className="font-mono text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Showing {firstItem}–{lastItem} of {totalItems}
      </p>
      {pageCount > 1 && (
        <nav aria-label="Results pagination" className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="border border-stone-300 px-3 py-2 font-mono text-xs uppercase tracking-wider text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-100"
          >
            Previous
          </button>
          <span className="min-w-24 text-center font-mono text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Page {page} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page === pageCount}
            className="border border-stone-300 px-3 py-2 font-mono text-xs uppercase tracking-wider text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-100"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}

export const compareDate = (left?: string, right?: string) => {
  const leftTime = left ? Date.parse(left) : 0;
  const rightTime = right ? Date.parse(right) : 0;
  return (Number.isFinite(leftTime) ? leftTime : 0) - (Number.isFinite(rightTime) ? rightTime : 0);
};
