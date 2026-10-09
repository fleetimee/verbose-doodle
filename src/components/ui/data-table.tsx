import type {
	ColumnDef,
	ColumnFiltersState,
	ColumnVisibilityState,
	RowData,
	SortingState,
} from "@tanstack/react-table";
import {
	columnFilteringFeature,
	columnVisibilityFeature,
	createFilteredRowModel,
	createPaginatedRowModel,
	createSortedRowModel,
	filterFn_arrIncludes,
	filterFn_equals,
	filterFn_inDateRange,
	filterFn_inNumberRange,
	filterFn_includesString,
	filterFn_weakEquals,
	flexRender,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_datetime,
	sortFn_text,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { useI18n } from "@/components/i18n-provider";
import { formatMessage } from "@/lib/i18n";

export const dataTableFeatures = tableFeatures({
	columnFilteringFeature,
	columnVisibilityFeature,
	rowPaginationFeature,
	rowSelectionFeature,
	rowSortingFeature,
	filteredRowModel: createFilteredRowModel(),
	paginatedRowModel: createPaginatedRowModel(),
	sortedRowModel: createSortedRowModel(),
	filterFns: {
		arrIncludes: filterFn_arrIncludes,
		equals: filterFn_equals,
		inDateRange: filterFn_inDateRange,
		inNumberRange: filterFn_inNumberRange,
		includesString: filterFn_includesString,
		weakEquals: filterFn_weakEquals,
	},
	sortFns: {
		alphanumeric: sortFn_alphanumeric,
		datetime: sortFn_datetime,
		text: sortFn_text,
	},
});

type DataTableProps<TData extends RowData> = {
	columns: ColumnDef<typeof dataTableFeatures, TData>[];
	data: TData[];
	filterColumn?: string;
	filterPlaceholder?: string;
};

export function DataTable<TData extends RowData>({
	columns,
	data,
	filterColumn,
	filterPlaceholder,
}: DataTableProps<TData>) {
	const { messages } = useI18n();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(
		{},
	);
	const [rowSelection, setRowSelection] = useState({});

	const table = useTable({
		features: dataTableFeatures,
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	});

	return (
		<div className="space-y-4">
			{/* Filters and Controls */}
			<div className="flex flex-wrap items-center justify-between gap-2">
				{filterColumn && (
					<Input
						className="min-w-[180px] flex-1 sm:max-w-sm"
						onChange={(event) =>
							table.getColumn(filterColumn)?.setFilterValue(event.target.value)
						}
						placeholder={filterPlaceholder}
						value={
							// SAFETY: The filter column stores string values for this text input.
							(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
						}
					/>
				)}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className="ml-auto shrink-0" variant="outline">
							{messages.common.columns}{" "}
							<HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => (
								<DropdownMenuCheckboxItem
									checked={column.getIsVisible()}
									className="capitalize"
									key={column.id}
									onCheckedChange={(value) =>
										column.toggleVisibility(!!value)
									}
								>
									{column.id}
								</DropdownMenuCheckboxItem>
							))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Data Table */}
			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									data-state={row.getIsSelected() && "selected"}
									key={row.id}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									className="h-24 text-center"
									colSpan={columns.length}
								>
									{messages.common.noResults}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="text-muted-foreground text-sm">
					{formatMessage(messages.common.rowsSelected, {
						selected: table.getFilteredSelectedRowModel().rows.length,
						total: table.getFilteredRowModel().rows.length,
					})}
				</div>
				<div className="flex items-center justify-end space-x-2">
					<Button
						disabled={!table.getCanPreviousPage()}
						onClick={() => table.previousPage()}
						size="sm"
						variant="outline"
					>
						{messages.common.previous}
					</Button>
					<Button
						disabled={!table.getCanNextPage()}
						onClick={() => table.nextPage()}
						size="sm"
						variant="outline"
					>
						{messages.common.next}
					</Button>
				</div>
			</div>
		</div>
	);
}
