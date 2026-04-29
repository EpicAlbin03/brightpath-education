<script setup lang="ts">
import type { ColumnDef, RowSelectionState, SortingFn, SortingState } from '@tanstack/vue-table';
import type { PropType } from 'vue';
import type { Student } from '@/lib/types';
import {
	FlexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useVueTable
} from '@tanstack/vue-table';
import {
	ArrowUpDown,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	Eye,
	MoreHorizontal,
	Pencil,
	Trash2
} from 'lucide-vue-next';
import { computed, defineComponent, h, ref } from 'vue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { valueUpdater } from '@/components/ui/table/utils';
import { students } from '@/lib/temp-data';

const router = useRouter();

const pageSizes = [5, 10, 25, 50];

const gradeRanks: Record<string, number> = {
	'A+': 12,
	A: 11,
	'A-': 10,
	'B+': 9,
	B: 8,
	'B-': 7,
	'C+': 6,
	C: 5,
	'C-': 4,
	'D+': 3,
	D: 2,
	F: 1,
	NA: 0
};

function getGradeRank(grade: string) {
	return gradeRanks[grade] ?? -1;
}

function formatDate(date: string | null) {
	if (!date) {
		return 'N/A';
	}

	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	}).format(new Date(date));
}

const RowActions = defineComponent({
	name: 'StudentRowActions',
	props: {
		itemLabel: {
			type: String,
			required: true
		},
		onView: {
			type: Function as PropType<() => void>,
			required: true
		},
		onEdit: {
			type: Function as PropType<() => void>,
			required: true
		},
		onDelete: {
			type: Function as PropType<() => void>,
			required: true
		}
	},
	setup(props) {
		return () =>
			h(DropdownMenu, () => [
				h(DropdownMenuTrigger, { asChild: true }, () =>
					h(Button, { variant: 'ghost', size: 'icon-sm', class: 'h-8 w-8 p-0' }, () => [
						h('span', { class: 'sr-only' }, `Open actions for ${props.itemLabel}`),
						h(MoreHorizontal, { class: 'h-4 w-4' })
					])
				),
				h(DropdownMenuContent, { align: 'end', class: 'w-40' }, () => [
					h(DropdownMenuItem, { onSelect: props.onView }, () => [
						h(Eye, { class: 'h-4 w-4' }),
						'View'
					]),
					h(DropdownMenuItem, { onSelect: props.onEdit }, () => [
						h(Pencil, { class: 'h-4 w-4' }),
						'Edit'
					]),
					h(DropdownMenuSeparator),
					h(DropdownMenuItem, { variant: 'destructive', onSelect: props.onDelete }, () => [
						h(Trash2, { class: 'h-4 w-4' }),
						'Delete'
					])
				])
			]);
	}
});

const sorting = ref<SortingState>([]);
const rowSelection = ref<RowSelectionState>({});

const gradeSortingFn: SortingFn<Student> = (rowA, rowB, columnId) => {
	return (
		getGradeRank(String(rowA.getValue(columnId))) - getGradeRank(String(rowB.getValue(columnId)))
	);
};

const columns: ColumnDef<Student>[] = [
	{
		id: 'select',
		header: ({ table }) =>
			h(Checkbox, {
				modelValue: table.getIsAllPageRowsSelected(),
				'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
					table.toggleAllPageRowsSelected(value === true),
				'aria-label': 'Select all students'
			}),
		cell: ({ row }) =>
			h(Checkbox, {
				modelValue: row.getIsSelected(),
				'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
					row.toggleSelected(value === true),
				'aria-label': `Select ${row.original.name}`
			}),
		enableSorting: false
	},
	{
		accessorKey: 'name',
		header: 'Student',
		cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.name)
	},
	{
		accessorKey: 'email',
		header: 'Email',
		cell: ({ row }) => h('div', { class: 'text-muted-foreground' }, row.original.email)
	},
	{
		accessorKey: 'date_of_birth',
		header: 'Date of birth',
		cell: ({ row }) => formatDate(row.original.date_of_birth)
	},
	{
		accessorKey: 'grade',
		sortingFn: gradeSortingFn,
		header: ({ column }) =>
			h(
				Button,
				{
					variant: 'ghost',
					size: 'sm',
					class: '-ml-3 h-8',
					onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
				},
				() => ['Grade', h(ArrowUpDown, { class: 'h-4 w-4' })]
			),
		cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.grade)
	},
	{
		id: 'courseCount',
		header: 'Courses',
		accessorFn: (row) => row.course_ids.length,
		cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.course_ids.length)
	},
	{
		accessorKey: 'is_active',
		header: 'Status',
		cell: ({ row }) =>
			h(
				Badge,
				{
					variant: 'outline',
					class: row.original.is_active
						? 'border-emerald-200 bg-emerald-50 text-emerald-700'
						: 'border-red-200 bg-red-50 text-red-700'
				},
				() => (row.original.is_active ? 'Active' : 'Inactive')
			)
	},
	{
		id: 'actions',
		header: () => h('span', { class: 'sr-only' }, 'Row actions'),
		cell: ({ row }) =>
			h('div', { class: 'flex justify-end' }, [
				h(RowActions, {
					itemLabel: row.original.name,
					onView: () => router.push(`/students/${row.original.id}`),
					onEdit: () => console.info('Edit student', row.original),
					onDelete: () => console.info('Delete student', row.original)
				})
			]),
		enableSorting: false
	}
];

const data = computed(() => students);

const table = useVueTable({
	get data() {
		return data.value;
	},
	get columns() {
		return columns;
	},
	getCoreRowModel: getCoreRowModel(),
	getFilteredRowModel: getFilteredRowModel(),
	getPaginationRowModel: getPaginationRowModel(),
	getSortedRowModel: getSortedRowModel(),
	onRowSelectionChange: (updaterOrValue) => valueUpdater(updaterOrValue, rowSelection),
	onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
	state: {
		get rowSelection() {
			return rowSelection.value;
		},
		get sorting() {
			return sorting.value;
		}
	},
	initialState: {
		pagination: {
			pageSize: 5
		}
	}
});

function handlePageSizeUpdate(value: unknown) {
	if (value === null || value === undefined) {
		return;
	}

	table.setPageSize(Number(value));
}
</script>

<template>
	<div class="space-y-4">
		<div class="rounded-xl border bg-background">
			<Table>
				<TableHeader>
					<TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
						<TableHead v-for="header in headerGroup.headers" :key="header.id">
							<FlexRender
								v-if="!header.isPlaceholder"
								:render="header.column.columnDef.header"
								:props="header.getContext()"
							/>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<template v-if="table.getRowModel().rows.length">
						<TableRow
							v-for="row in table.getRowModel().rows"
							:key="row.id"
							:data-state="row.getIsSelected() ? 'selected' : undefined"
						>
							<TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
								<FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
							</TableCell>
						</TableRow>
					</template>
					<template v-else>
						<TableRow>
							<TableCell :colspan="columns.length" class="h-24 text-center text-muted-foreground">
								No students found.
							</TableCell>
						</TableRow>
					</template>
				</TableBody>
			</Table>
		</div>

		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
				<div class="flex items-center gap-2 text-sm font-medium text-foreground">
					<span>Rows per page</span>
					<Select
						:model-value="String(table.getState().pagination.pageSize)"
						@update:model-value="handlePageSizeUpdate"
					>
						<SelectTrigger size="sm" class="w-18">
							<SelectValue :placeholder="String(table.getState().pagination.pageSize)" />
						</SelectTrigger>
						<SelectContent align="end">
							<SelectItem v-for="pageSize in pageSizes" :key="pageSize" :value="String(pageSize)">
								{{ pageSize }}
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<p class="text-sm text-muted-foreground">
					{{ table.getSelectedRowModel().rows.length }} of {{ data.length }} row(s) selected.
				</p>
			</div>

			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
				<div class="text-sm font-medium">
					Page {{ table.getState().pagination.pageIndex + 1 }} of {{ table.getPageCount() || 1 }}
				</div>

				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon-sm"
						:disabled="!table.getCanPreviousPage()"
						@click="table.setPageIndex(0)"
					>
						<span class="sr-only">First page</span>
						<ChevronsLeft class="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon-sm"
						:disabled="!table.getCanPreviousPage()"
						@click="table.previousPage()"
					>
						<span class="sr-only">Previous page</span>
						<ChevronLeft class="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon-sm"
						:disabled="!table.getCanNextPage()"
						@click="table.nextPage()"
					>
						<span class="sr-only">Next page</span>
						<ChevronRight class="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon-sm"
						:disabled="!table.getCanNextPage()"
						@click="table.setPageIndex(table.getPageCount() - 1)"
					>
						<span class="sr-only">Last page</span>
						<ChevronsRight class="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	</div>
</template>
