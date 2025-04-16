"use client";

import React from "react";
import {
	RiSearchLine,
	RiFilterLine,
	RiCloseLine,
	RiSortAsc,
	RiSortDesc,
} from "react-icons/ri";

import {
	type DataTableColumn,
	SortDirection,
	type SortState,
	type FilterState,
} from "./types";
import kitchn, {
	Badge,
	Button,
	Checkbox,
	convertRGBToRGBA,
	Icon,
	Input,
	Spinner,
	Text,
	withDecorator,
	type KitchnComponent,
} from "kitchn";

// Props for the DataTable component
type Props<T = any> = {
	/**
	 * Data to be displayed in the table
	 */
	data: T[];

	/**
	 * Column definitions
	 */
	columns: DataTableColumn<T>[];

	/**
	 * Loading state
	 */
	loading?: boolean;

	/**
	 * Whether to enable search
	 */
	searchable?: boolean;

	/**
	 * Whether to enable row selection
	 */
	selectable?: boolean;

	/**
	 * Initial sort state
	 */
	initialSort?: SortState;

	/**
	 * Initial filter state
	 */
	initialFilter?: FilterState;

	/**
	 * Items per page
	 */
	itemsPerPage?: number;

	/**
	 * Whether to show pagination
	 */
	pagination?: boolean;

	/**
	 * Callback for when selection changes
	 */
	onSelectionChange?: (selectedRows: T[]) => void;

	/**
	 * Callback for when sort changes
	 */
	onSortChange?: (sortState: SortState) => void;

	/**
	 * Callback for when filter changes
	 */
	onFilterChange?: (filterState: FilterState) => void;

	/**
	 * Callback for when page changes
	 */
	onPageChange?: (page: number) => void;

	/**
	 * Empty state message
	 */
	emptyMessage?: React.ReactNode;

	/**
	 * Placeholder for the search input
	 */
	searchPlaceholder?: string;

	/**
	 * Whether to make the table dense
	 */
	dense?: boolean;

	/**
	 * Whether to make the table fullWidth
	 */
	fullWidth?: boolean;

	/**
	 * Custom row styling function
	 */
	rowClassName?: (row: T, index: number) => string;

	/**
	 * Custom cell styling function
	 */
	cellClassName?: (
		value: any,
		row: T,
		columnKey: string,
		index: number,
	) => string;
};

export type DataTableProps<T = any> = KitchnComponent<Props<T>>;

const DataTableComponent = <
	T extends Record<string, any> = Record<string, any>,
>({
	data = [],
	columns = [],
	loading = false,
	searchable = true,
	selectable = false,
	initialSort,
	initialFilter,
	itemsPerPage = 10,
	pagination = true,
	onSelectionChange,
	onSortChange,
	onFilterChange,
	onPageChange,
	emptyMessage = "No data available",
	searchPlaceholder = "Search...",
	dense = false,
	fullWidth = true,
	rowClassName,
	cellClassName,
	...props
}: DataTableProps<T>) => {
	// State for sorting
	const [sortState, setSortState] = React.useState<SortState>(
		initialSort || { key: "", direction: null },
	);

	// State for filtering
	const [filterState, setFilterState] = React.useState<FilterState>(
		initialFilter || {},
	);

	// State for pagination
	const [currentPage, setCurrentPage] = React.useState<number>(1);

	// State for search
	const [searchQuery, setSearchQuery] = React.useState<string>("");

	// State for selection
	const [selectedRows, setSelectedRows] = React.useState<T[]>([]);

	// State for showing filter panel
	const [showFilters, setShowFilters] = React.useState<boolean>(false);

	// Effect to call onSelectionChange when selection changes
	React.useEffect(() => {
		if (onSelectionChange) {
			onSelectionChange(selectedRows);
		}
	}, [selectedRows, onSelectionChange]);

	// Effect to call onSortChange when sort changes
	React.useEffect(() => {
		if (onSortChange) {
			onSortChange(sortState);
		}
	}, [sortState, onSortChange]);

	// Effect to call onFilterChange when filter changes
	React.useEffect(() => {
		if (onFilterChange) {
			onFilterChange(filterState);
		}
	}, [filterState, onFilterChange]);

	// Effect to call onPageChange when page changes
	React.useEffect(() => {
		if (onPageChange) {
			onPageChange(currentPage);
		}
	}, [currentPage, onPageChange]);

	// Reset pagination when data, filter, or search changes
	React.useEffect(() => {
		setCurrentPage(1);
	}, [data, filterState, searchQuery]);

	// Function to handle sort click
	const handleSort = (key: string) => {
		setSortState((prev) => {
			if (prev.key === key) {
				// Toggle direction
				if (prev.direction === "asc") return { key, direction: "desc" };
				if (prev.direction === "desc") return { key: "", direction: null };
				return { key, direction: "asc" };
			}
			// New sort
			return { key, direction: "asc" };
		});
	};

	// Function to handle filter change
	const handleFilterChange = (key: string, value: string) => {
		setFilterState((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	// Function to clear a filter
	const clearFilter = (key: string) => {
		setFilterState((prev) => {
			const newState = { ...prev };
			delete newState[key];
			return newState;
		});
	};

	// Function to clear all filters
	const clearAllFilters = () => {
		setFilterState({});
		setSearchQuery("");
	};

	// Function to handle row selection
	const handleRowSelect = (row: T) => {
		setSelectedRows((prev) => {
			const isSelected = prev.some((r) => r === row);
			if (isSelected) {
				return prev.filter((r) => r !== row);
			} else {
				return [...prev, row];
			}
		});
	};

	// Function to handle select all
	const handleSelectAll = () => {
		if (selectedRows.length === filteredData.length) {
			setSelectedRows([]);
		} else {
			setSelectedRows([...filteredData]);
		}
	};

	// Filter data based on filters and search
	const filteredData = React.useMemo(() => {
		let result = [...data];

		// Apply filters
		Object.entries(filterState).forEach(([key, value]) => {
			if (value) {
				result = result.filter((row) => {
					const rowValue = String(row[key] || "").toLowerCase();
					return rowValue.includes(value.toLowerCase());
				});
			}
		});

		// Apply search across all columns
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter((row) => {
				return columns.some((column) => {
					const value = String(row[column.key] || "").toLowerCase();
					return value.includes(query);
				});
			});
		}

		return result;
	}, [data, filterState, searchQuery, columns]);

	// Sort data
	const sortedData = React.useMemo(() => {
		if (!sortState.key || !sortState.direction) return filteredData;

		return [...filteredData].sort((a, b) => {
			const aValue = a[sortState.key];
			const bValue = b[sortState.key];

			if (aValue === bValue) return 0;

			// Handle null and undefined
			if (aValue == null) return sortState.direction === "asc" ? -1 : 1;
			if (bValue == null) return sortState.direction === "asc" ? 1 : -1;

			// Handle numbers
			if (typeof aValue === "number" && typeof bValue === "number") {
				return sortState.direction === "asc"
					? aValue - bValue
					: bValue - aValue;
			}

			// Handle strings and other values
			const aString = String(aValue).toLowerCase();
			const bString = String(bValue).toLowerCase();

			if (sortState.direction === "asc") {
				return aString.localeCompare(bString);
			} else {
				return bString.localeCompare(aString);
			}
		});
	}, [filteredData, sortState.key, sortState.direction]);

	// Paginate data
	const paginatedData = React.useMemo(() => {
		if (!pagination) return sortedData;
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		return sortedData.slice(start, end);
	}, [sortedData, pagination, currentPage, itemsPerPage]);

	// Calculate total pages
	const totalPages = React.useMemo(() => {
		return Math.ceil(sortedData.length / itemsPerPage);
	}, [sortedData.length, itemsPerPage]);

	// Check if all rows are selected
	const isAllSelected =
		selectedRows.length === filteredData.length && filteredData.length > 0;

	// Check if any row is selected
	const isAnySelected = selectedRows.length > 0;

	// Check if a row is selected
	const isRowSelected = (row: T) => selectedRows.includes(row);

	// Generate buttons for pagination
	const paginationButtons = React.useMemo(() => {
		if (!pagination || totalPages <= 1) return null;

		const buttons = [];
		const maxButtonsToShow = 5;
		let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
		const endPage = Math.min(startPage + maxButtonsToShow - 1, totalPages);

		if (endPage - startPage + 1 < maxButtonsToShow) {
			startPage = Math.max(1, endPage - maxButtonsToShow + 1);
		}

		// Previous button
		buttons.push(
			<PaginationButton
				key="prev"
				disabled={currentPage === 1}
				onClick={() => setCurrentPage(currentPage - 1)}
				size="small"
				variant="ghost"
			>
				Prev
			</PaginationButton>,
		);

		// First page
		if (startPage > 1) {
			buttons.push(
				<PaginationButton
					key="1"
					onClick={() => setCurrentPage(1)}
					size="small"
					variant="ghost"
				>
					1
				</PaginationButton>,
			);
			if (startPage > 2) {
				buttons.push(
					<PaginationEllipsis key="start-ellipsis">...</PaginationEllipsis>,
				);
			}
		}

		// Page buttons
		for (let i = startPage; i <= endPage; i++) {
			buttons.push(
				<PaginationButton
					key={i}
					active={i === currentPage}
					onClick={() => setCurrentPage(i)}
					size="small"
					variant={i === currentPage ? undefined : "ghost"}
				>
					{i}
				</PaginationButton>,
			);
		}

		// Last page
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				buttons.push(
					<PaginationEllipsis key="end-ellipsis">...</PaginationEllipsis>,
				);
			}
			buttons.push(
				<PaginationButton
					key={totalPages}
					onClick={() => setCurrentPage(totalPages)}
					size="small"
					variant="ghost"
				>
					{totalPages}
				</PaginationButton>,
			);
		}

		// Next button
		buttons.push(
			<PaginationButton
				key="next"
				disabled={currentPage === totalPages}
				onClick={() => setCurrentPage(currentPage + 1)}
				size="small"
				variant="ghost"
			>
				Next
			</PaginationButton>,
		);

		return buttons;
	}, [currentPage, totalPages, pagination]);

	// Calculate active filters count
	const activeFiltersCount = Object.keys(filterState).length;

	return (
		<TableContainer fullWidth={fullWidth} {...props}>
			{/* Table controls */}
			<TableControls>
				<TableControlsLeft>
					{searchable && (
						<Input
							placeholder={searchPlaceholder}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							prefix={<Icon icon={RiSearchLine} size={16} />}
							size="small"
							clearable
							onClearClick={() => setSearchQuery("")}
						/>
					)}

					<FilterButton
						size="small"
						variant="ghost"
						onClick={() => setShowFilters(!showFilters)}
						type={activeFiltersCount > 0 ? "primary" : "dark"}
					>
						<Icon icon={RiFilterLine} size={16} />
						{activeFiltersCount > 0 && (
							<FilterCount>
								<Badge size="small" type="primary">
									{activeFiltersCount}
								</Badge>
							</FilterCount>
						)}
					</FilterButton>

					{activeFiltersCount > 0 && (
						<ClearFiltersButton
							size="small"
							variant="ghost"
							onClick={clearAllFilters}
						>
							Clear filters
						</ClearFiltersButton>
					)}
				</TableControlsLeft>

				<TableControlsRight>
					{selectedRows.length > 0 && (
						<Badge size="small" type="primary">
							{selectedRows.length} selected
						</Badge>
					)}
				</TableControlsRight>
			</TableControls>

			{/* Filter panel */}
			{showFilters && (
				<FilterPanel>
					<FilterPanelHeader>
						<Text weight="semiBold">Filters</Text>
						<CloseFilterButton
							size="small"
							variant="ghost"
							onClick={() => setShowFilters(false)}
						>
							<Icon icon={RiCloseLine} size={16} />
						</CloseFilterButton>
					</FilterPanelHeader>
					<FilterPanelContent>
						{columns
							.filter((column) => column.filterable !== false)
							.map((column) => (
								<FilterItem key={column.key}>
									<FilterLabel>
										<Text size="small">{column.header}</Text>
									</FilterLabel>
									<Input
										size="small"
										placeholder={`Filter by ${column.header}`}
										value={filterState[column.key] || ""}
										onChange={(e) =>
											handleFilterChange(column.key, e.target.value)
										}
										clearable
										onClearClick={() => clearFilter(column.key)}
									/>
								</FilterItem>
							))}
					</FilterPanelContent>
				</FilterPanel>
			)}

			{/* Table */}
			<TableWrapper>
				<StyledTable dense={dense}>
					<TableHead>
						<TableRow header>
							{selectable && (
								<TableHeaderCell width="40px">
									<Checkbox
										checked={isAllSelected}
										indeterminate={isAnySelected && !isAllSelected}
										onChange={handleSelectAll}
									/>
								</TableHeaderCell>
							)}

							{columns.map((column) => (
								<TableHeaderCell
									key={column.key}
									sortable={column.sortable}
									width={column.width}
									align={column.align}
									onClick={
										column.sortable ? () => handleSort(column.key) : undefined
									}
									active={sortState.key === column.key}
								>
									<HeaderContent>
										{column.header}
										{column.sortable && (
											<SortIndicator>
												{sortState.key === column.key ? (
													sortState.direction === "asc" ? (
														<Icon icon={RiSortAsc} size={16} />
													) : (
														<Icon icon={RiSortDesc} size={16} />
													)
												) : (
													<DefaultSortIndicator />
												)}
											</SortIndicator>
										)}
									</HeaderContent>
								</TableHeaderCell>
							))}
						</TableRow>
					</TableHead>

					<TableBody>
						{loading ? (
							<TableLoadingRow
								colSpan={selectable ? columns.length + 1 : columns.length}
							>
								<Spinner size={24} />
								<Text ml="small">Loading...</Text>
							</TableLoadingRow>
						) : paginatedData.length === 0 ? (
							<TableEmptyRow
								colSpan={selectable ? columns.length + 1 : columns.length}
							>
								<Text>{emptyMessage}</Text>
							</TableEmptyRow>
						) : (
							paginatedData.map((row, rowIndex) => (
								<TableRow
									key={rowIndex}
									className={rowClassName ? rowClassName(row, rowIndex) : ""}
									selected={isRowSelected(row)}
									onClick={selectable ? () => handleRowSelect(row) : undefined}
									clickable={selectable}
								>
									{selectable && (
										<TableCell>
											<Checkbox
												checked={isRowSelected(row)}
												onChange={() => handleRowSelect(row)}
											/>
										</TableCell>
									)}

									{columns.map((column) => (
										<TableCell
											key={`${rowIndex}-${column.key}`}
											align={column.align}
											className={
												cellClassName
													? cellClassName(
															row[column.key],
															row,
															column.key,
															rowIndex,
														)
													: ""
											}
										>
											{column.render
												? column.render(row[column.key], row, rowIndex)
												: row[column.key] != null
													? String(row[column.key])
													: "-"}
										</TableCell>
									))}
								</TableRow>
							))
						)}
					</TableBody>
				</StyledTable>
			</TableWrapper>

			{/* Pagination */}
			{pagination && totalPages > 1 && (
				<PaginationContainer>
					<Text size="small">
						Showing {(currentPage - 1) * itemsPerPage + 1}-
						{Math.min(currentPage * itemsPerPage, sortedData.length)} of{" "}
						{sortedData.length}
					</Text>
					<PaginationButtons>{paginationButtons}</PaginationButtons>
				</PaginationContainer>
			)}
		</TableContainer>
	);
};

// Styled components
const TableContainer = kitchn.div<{ fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? "100%" : "auto")};
  border: 1px solid ${({ theme }) => theme.colors.layout.dark};
  border-radius: ${({ theme }) => theme.radius.square};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.layout.darkest};
`;

const TableControls = kitchn.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.layout.dark};
`;

const TableControlsLeft = kitchn.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TableControlsRight = kitchn.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterButton = kitchn(Button)``;

const ClearFiltersButton = kitchn(Button)``;

const CloseFilterButton = kitchn(Button)``;

const FilterCount = kitchn.div`
  margin-left: 4px;
`;

const FilterPanel = kitchn.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.layout.dark};
  background-color: ${({ theme }) => theme.colors.layout.darker};
  padding: 12px 16px;
`;

const FilterPanelHeader = kitchn.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const FilterPanelContent = kitchn.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const FilterItem = kitchn.div`
  display: flex;
  flex-direction: column;
  min-width: 200px;
  flex: 1;
`;

const FilterLabel = kitchn.div`
  margin-bottom: 4px;
`;

const TableWrapper = kitchn.div`
  overflow-x: auto;
  max-width: 100%;
`;

const StyledTable = kitchn.table<{ dense: boolean }>`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  
  /* For fixed header */
  position: relative;
`;

const TableHead = kitchn.thead`
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: ${({ theme }) => theme.colors.layout.darkest};
`;

const TableBody = kitchn.tbody``;

const TableRow = kitchn.tr<{
	header?: boolean;
	selected?: boolean;
	clickable?: boolean;
}>`
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.layout.dark};
  }
  
  background-color: ${({ theme, selected }) =>
		selected
			? convertRGBToRGBA(theme.colors.accent.primary, 0.1)
			: "transparent"};
  
  &:hover {
    background-color: ${({ theme, header, selected }) =>
			header
				? "transparent"
				: selected
					? convertRGBToRGBA(theme.colors.accent.primary, 0.15)
					: theme.colors.layout.darker};
  }
  
  cursor: ${({ clickable }) => (clickable ? "pointer" : "default")};
  transition: background-color 0.2s;
`;

const TableHeaderCell = kitchn.th<{
	sortable?: boolean;
	width?: string | number;
	align?: "left" | "center" | "right";
	active?: boolean;
}>`
  padding: 12px 16px;
  text-align: ${({ align }) => align || "left"};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  white-space: nowrap;
  cursor: ${({ sortable }) => (sortable ? "pointer" : "default")};
  width: ${({ width }) => (width ? (typeof width === "number" ? `${width}px` : width) : "auto")};
  color: ${({ theme, active }) => (active ? theme.colors.accent.primary : theme.colors.text.lightest)};
  
  &:hover {
    ${({ sortable, theme }) =>
			sortable &&
			`
      color: ${theme.colors.accent.primary};
    `}
  }
`;

const TableCell = kitchn.td<{ align?: "left" | "center" | "right" }>`
  padding: 12px 16px;
  text-align: ${({ align }) => align || "left"};
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.text.lighter};
`;

const HeaderContent = kitchn.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SortIndicator = kitchn.div`
  display: flex;
  align-items: center;
  margin-left: 4px;
`;

const DefaultSortIndicator = kitchn.div`
  width: 16px;
  height: 16px;
  opacity: 0.3;
`;

const TableLoadingRow = kitchn.tr`
  td {
    padding: 32px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const TableEmptyRow = kitchn.tr`
  td {
    padding: 32px;
    text-align: center;
  }
`;

const PaginationContainer = kitchn.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.layout.dark};
`;

const PaginationButtons = kitchn.div`
  display: flex;
  align-items: center;
`;

const PaginationButton = kitchn(Button)<{ active?: boolean }>`
  min-width: 32px;
  margin: 0 2px;
  
  ${({ active, theme }) =>
		active &&
		`
    background-color: ${theme.colors.accent.primary};
    color: ${theme.colors.text.lightest};
    &:hover {
      background-color: ${theme.colors.accent.primary};
      filter: brightness(1.1);
    }
  `}
`;

const PaginationEllipsis = kitchn.span`
  margin: 0 4px;
  color: ${({ theme }) => theme.colors.text.light};
`;

DataTableComponent.displayName = "KitchnDataTable";
export const DataTable = withDecorator(DataTableComponent);
export default DataTable;
