<script setup lang="ts">
import type { ColumnDef, RowSelectionState, SortingState } from '@tanstack/vue-table';
import type { PropType } from 'vue';
import type { Course } from '@/lib/types';
import {
	FlexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useVueTable
} from '@tanstack/vue-table';
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	MoreHorizontal,
	Pencil,
	Trash2
} from 'lucide-vue-next';
import { computed, defineComponent, h, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
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
import { courses, students } from '@/lib/temp-data';

type CourseRow = Course & {
	studentCount: number;
};

const pageSizes = [5, 10, 25, 50];

const RowActions = defineComponent({
	name: 'CourseRowActions',
	props: {
		itemLabel: {
			type: String,
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
					h(DropdownMenuItem, { onSelect: props.onEdit }, () => [
						h(Pencil, { class: 'h-4 w-4' }),
						'Edit'
					]),
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

const data = computed<CourseRow[]>(() => {
	const studentCounts = students.reduce<Record<number, number>>((counts, student) => {
		for (const courseId of student.course_ids) {
			counts[courseId] = (counts[courseId] ?? 0) + 1;
		}
		return counts;
	}, {});

	return courses.map((course) => ({
		...course,
		studentCount: studentCounts[course.id] ?? 0
	}));
});

const columns: ColumnDef<CourseRow>[] = [
	{
		id: 'select',
		header: ({ table }) =>
			h(Checkbox, {
				modelValue: table.getIsAllPageRowsSelected(),
				'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
					table.toggleAllPageRowsSelected(value === true),
				'aria-label': 'Select all courses'
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
		header: 'Course',
		cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.name)
	},
	{
		accessorKey: 'code',
		header: 'Code'
	},
	{
		accessorKey: 'description',
		header: 'Description',
		cell: ({ row }) =>
			h(
				'div',
				{
					class: 'max-w-xl truncate text-sm text-muted-foreground',
					title: row.original.description
				},
				row.original.description
			)
	},
	{
		accessorKey: 'studentCount',
		header: 'Students',
		cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.studentCount)
	},
	{
		id: 'actions',
		header: () => h('span', { class: 'sr-only' }, 'Row actions'),
		cell: ({ row }) =>
			h('div', { class: 'flex justify-end' }, [
				h(RowActions, {
					itemLabel: row.original.name,
					onEdit: () => console.info('Edit course', row.original),
					onDelete: () => console.info('Delete course', row.original)
				})
			]),
		enableSorting: false
	}
];

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
								No courses found.
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
