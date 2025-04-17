import type React from "react";

export type DataTableColumn<T = unknown> = {
  /**
   * Unique key for the column
   */
  key: string;

  /**
   * Header content
   */
  header: React.ReactNode;

  /**
   * Optional custom render function
   */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  render?: (value: any, row: T, index: number) => React.ReactNode;

  /**
   * Whether the column is sortable
   */
  sortable?: boolean;

  /**
   * Column width
   */
  width?: string | number;

  /**
   * Column alignment
   */
  align?: "left" | "center" | "right";

  /**
   * Whether the column is filterable
   */
  filterable?: boolean;
};

export type SortDirection = "asc" | "desc" | null;

export type SortState = {
  key: string;
  direction: SortDirection;
};

export type FilterState = {
  [key: string]: string;
};
