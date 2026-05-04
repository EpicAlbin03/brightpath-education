<script setup lang="ts">
import type { ColumnDef, RowSelectionState, SortingState } from '@tanstack/vue-table';
import type { PropType } from 'vue';
import type { Course } from '~~/shared/types';
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
import { computed, defineComponent, h, ref, watch } from 'vue';
import DeleteAlertDialog from '@/components/DeleteAlertDialog.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const props = defineProps<{
	courses: Course[];
}>();

const router = useRouter();
const { user } = useAuth();
const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'superuser');
const searchQuery = ref('');
const courseRows = ref<Course[]>(props.courses);

const pageSizes = [5, 10, 25, 50];

function sortableHeader(
	title: string,
	column: { getIsSorted: () => false | 'asc' | 'desc'; toggleSorting: (desc?: boolean) => void }
) {
	return h(
		Button,
		{
			variant: 'ghost',
			size: 'sm',
			class: '-ml-3 h-8',
			onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
		},
		() => [title, h(ArrowUpDown, { class: 'h-4 w-4' })]
	);
}

const RowActions = defineComponent({
	name: 'CourseRowActions',
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
		},
		isAdmin: {
			type: Boolean,
			default: false
		}
	},
	setup(props) {
		const isDeleteDialogOpen = ref(false);

		function handleDeleteSelect() {
			isDeleteDialogOpen.value = true;
		}

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
					...(props.isAdmin
						? [
								h(DropdownMenuItem, { onSelect: props.onEdit }, () => [
									h(Pencil, { class: 'h-4 w-4' }),
									'Edit'
								]),
								h(DropdownMenuSeparator),
								h(
									DropdownMenuItem,
									{ variant: 'destructive', onSelect: handleDeleteSelect },
									() => [h(Trash2, { class: 'h-4 w-4' }), 'Delete']
								)
							]
						: [])
				]),
				h(DeleteAlertDialog, {
					open: isDeleteDialogOpen.value,
					'onUpdate:open': (value: boolean) => {
						isDeleteDialogOpen.value = value;
					},
					title: `Delete ${props.itemLabel}?`,
					description:
						'This action cannot be undone. This will permanently remove the course record.',
					action: props.onDelete
				})
			]);
	}
});

const sorting = ref<SortingState>([]);
const rowSelection = ref<RowSelectionState>({});

const data = computed<Course[]>(() => {
	const query = searchQuery.value.trim().toLowerCase();

	return courseRows.value.filter((course) => {
		return (
			query.length === 0 ||
			String(course.id).includes(query) ||
			course.name.toLowerCase().includes(query) ||
			course.code.toLowerCase().includes(query)
		);
	});
});

const columns: ColumnDef<Course>[] = [
	// {
	// 	id: 'select',
	// 	header: ({ table }) =>
	// 		h('div', { class: '' }, [
	// 			h(Checkbox, {
	// 				modelValue: table.getIsAllPageRowsSelected(),
	// 				'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
	// 					table.toggleAllPageRowsSelected(value === true),
	// 				'aria-label': 'Select all courses'
	// 			})
	// 		]),
	// 	cell: ({ row }) =>
	// 		h('div', { class: '' }, [
	// 			h(Checkbox, {
	// 				modelValue: row.getIsSelected(),
	// 				'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
	// 					row.toggleSelected(value === true),
	// 				'aria-label': `Select ${row.original.name}`
	// 			})
	// 		]),
	// 	enableSorting: false
	// },
	{
		accessorKey: 'id',
		header: ({ column }) => h('div', { class: 'pl-3' }, sortableHeader('ID', column)),
		cell: ({ row }) => h('div', { class: 'pl-3 font-medium tabular-nums' }, row.original.id)
	},
	{
		accessorKey: 'name',
		header: ({ column }) => sortableHeader('Course', column),
		cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.name)
	},
	{
		accessorKey: 'code',
		header: ({ column }) => sortableHeader('Code', column)
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
		accessorKey: 'student_count',
		header: ({ column }) => sortableHeader('Students', column),
		cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.student_count)
	},
	{
		id: 'actions',
		header: () => h('span', { class: 'sr-only' }, 'Row actions'),
		cell: ({ row }) =>
			h('div', { class: 'flex justify-end' }, [
				h(RowActions, {
					itemLabel: row.original.name,
					isAdmin: isAdmin.value,
					onView: () => router.push(`/courses/${row.original.id}`),
					onEdit: () => router.push(`/courses/${row.original.id}/edit`),
					onDelete: async () => {
						await $fetch(`/api/courses/${row.original.id}`, {
							method: 'DELETE'
						});

						courseRows.value = courseRows.value.filter((course) => course.id !== row.original.id);
					}
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

watch(searchQuery, () => {
	table.setPageIndex(0);
});
</script>

<template>
	<div class="space-y-4">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
			<Input
				v-model="searchQuery"
				class="w-full sm:max-w-xs"
				placeholder="Search by ID, course, or code..."
			/>

			<Button v-if="isAdmin" @click="router.push('/courses/create')">New Course</Button>
		</div>

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

		<div class="flex items-start justify-between gap-3">
			<div class="flex min-w-0 items-center gap-4">
				<div
					class="flex min-w-0 flex-wrap-reverse items-center gap-x-2 gap-y-2 text-sm font-medium text-foreground"
				>
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

				<!-- <p class="text-sm text-muted-foreground">
					{{ table.getSelectedRowModel().rows.length }} of {{ data.length }} row(s) selected.
				</p> -->
			</div>

			<div class="flex min-w-0 flex-wrap-reverse items-center justify-end gap-x-4 gap-y-2">
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
