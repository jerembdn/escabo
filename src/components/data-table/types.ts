// src/components/data-table/types.ts
import type React from "react";

// Column definition type
export type DataTableColumn<T = any> = {
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

// Sorting direction type
export type SortDirection = "asc" | "desc" | null;

// Sorting state type
export type SortState = {
	key: string;
	direction: SortDirection;
};

// Filter state type
export type FilterState = {
	[key: string]: string;
};
