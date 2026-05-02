<script setup lang="ts">
import type { ColumnDef, RowSelectionState, SortingFn, SortingState } from '@tanstack/vue-table';
import type { PropType } from 'vue';
import type { Student } from '~~/shared/types';
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
import { Badge } from '@/components/ui/badge';
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
	students: Student[];
}>();

const router = useRouter();

const pageSizes = [5, 10, 25, 50];
const searchQuery = ref('');
const statusFilter = ref<'all' | 'active' | 'inactive'>('all');
const gradeFilter = ref('all');

const studentRows = ref<Student[]>([]);

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

function getStatusBadgeClass(isActive: boolean) {
	return isActive
		? 'border-emerald-200 bg-emerald-50 text-emerald-700'
		: 'border-red-200 bg-red-50 text-red-700';
}

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
					h(DropdownMenuItem, { onSelect: props.onEdit }, () => [
						h(Pencil, { class: 'h-4 w-4' }),
						'Edit'
					]),
					h(DropdownMenuSeparator),
					h(DropdownMenuItem, { variant: 'destructive', onSelect: handleDeleteSelect }, () => [
						h(Trash2, { class: 'h-4 w-4' }),
						'Delete'
					])
				]),
				h(DeleteAlertDialog, {
					open: isDeleteDialogOpen.value,
					'onUpdate:open': (value: boolean) => {
						isDeleteDialogOpen.value = value;
					},
					title: `Delete ${props.itemLabel}?`,
					description:
						'This action cannot be undone. This will permanently remove the student record.',
					action: props.onDelete
				})
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

const gradeOptions = computed(() =>
	Array.from(new Set(studentRows.value.map((student) => student.grade))).sort(
		(a, b) => getGradeRank(b) - getGradeRank(a)
	)
);

const columns: ColumnDef<Student>[] = [
	// {
	// 	id: 'select',
	// 	header: ({ table }) =>
	// 		h('div', { class: '' }, [
	// 			h(Checkbox, {
	// 				modelValue: table.getIsAllPageRowsSelected(),
	// 				'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
	// 					table.toggleAllPageRowsSelected(value === true),
	// 				'aria-label': 'Select all students'
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
		header: ({ column }) => sortableHeader('Student', column),
		cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.name)
		// h('div', { class: 'flex items-center gap-3' }, [
		// h(Avatar, { class: 'size-8' }, () => [
		// 	h(AvatarImage, {
		// 		src: row.original.profile_photo || '',
		// 		alt: row.original.name
		// 	}),
		// 	h(AvatarFallback, () => row.original.name.slice(0, 2).toUpperCase())
		// ]),
		// h('div', { class: 'font-medium' }, row.original.name)
		// ])
	},
	{
		accessorKey: 'email',
		header: ({ column }) => sortableHeader('Email', column),
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
		header: ({ column }) => sortableHeader('Grade', column),
		cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.grade)
	},
	{
		id: 'course_count',
		header: ({ column }) => sortableHeader('Courses', column),
		accessorKey: 'course_count',
		cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.course_count)
	},
	{
		accessorKey: 'is_active',
		header: 'Status',
		cell: ({ row }) =>
			h(
				Badge,
				{
					variant: 'outline',
					class: getStatusBadgeClass(row.original.is_active)
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
					onEdit: () => router.push(`/students/${row.original.id}/edit`),
					onDelete: async () => {
						await $fetch(`/api/students/${row.original.id}/delete`, {
							method: 'DELETE'
						});

						studentRows.value = studentRows.value.filter(
							(student) => student.id !== row.original.id
						);
					}
				})
			]),
		enableSorting: false
	}
];

const data = computed(() => {
	const query = searchQuery.value.trim().toLowerCase();

	return studentRows.value.filter((student) => {
		const matchesQuery =
			query.length === 0 ||
			String(student.id).includes(query) ||
			student.name.toLowerCase().includes(query) ||
			student.email.toLowerCase().includes(query);

		const matchesStatus =
			statusFilter.value === 'all' ||
			(statusFilter.value === 'active' && student.is_active) ||
			(statusFilter.value === 'inactive' && !student.is_active);

		const matchesGrade = gradeFilter.value === 'all' || student.grade === gradeFilter.value;

		return matchesQuery && matchesStatus && matchesGrade;
	});
});

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

function handleStatusFilterUpdate(value: unknown) {
	statusFilter.value = typeof value === 'string' ? (value as 'all' | 'active' | 'inactive') : 'all';
}

function handleGradeFilterUpdate(value: unknown) {
	gradeFilter.value = typeof value === 'string' ? value : 'all';
}

watch([searchQuery, statusFilter, gradeFilter], () => {
	table.setPageIndex(0);
});
</script>

<template>
	<div class="space-y-4">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
			<div class="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
				<Input
					v-model="searchQuery"
					class="w-full sm:max-w-xs"
					placeholder="Search by ID, student, or email..."
				/>

				<div class="flex flex-col gap-3 sm:flex-row sm:gap-3">
					<Select :model-value="statusFilter" @update:model-value="handleStatusFilterUpdate">
						<SelectTrigger class="w-full sm:w-36">
							<SelectValue placeholder="Status">
								<Badge
									v-if="statusFilter === 'active'"
									variant="outline"
									:class="getStatusBadgeClass(true)"
								>
									Active
								</Badge>
								<Badge
									v-else-if="statusFilter === 'inactive'"
									variant="outline"
									:class="getStatusBadgeClass(false)"
								>
									Inactive
								</Badge>
								<span v-else>All statuses</span>
							</SelectValue>
						</SelectTrigger>
						<SelectContent align="start">
							<SelectItem value="all">All statuses</SelectItem>
							<SelectItem value="active">
								<Badge variant="outline" :class="getStatusBadgeClass(true)">Active</Badge>
							</SelectItem>
							<SelectItem value="inactive">
								<Badge variant="outline" :class="getStatusBadgeClass(false)">Inactive</Badge>
							</SelectItem>
						</SelectContent>
					</Select>

					<Select :model-value="gradeFilter" @update:model-value="handleGradeFilterUpdate">
						<SelectTrigger class="w-full sm:w-36">
							<SelectValue placeholder="Grade" />
						</SelectTrigger>
						<SelectContent align="start">
							<SelectItem value="all">All grades</SelectItem>
							<SelectItem v-for="grade in gradeOptions" :key="grade" :value="grade">
								{{ grade }}
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<Button class="sm:self-start" @click="router.push('/students/create')">New Student</Button>
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

				<!-- <p class="text-sm text-muted-foreground">
					{{ table.getSelectedRowModel().rows.length }} of {{ data.length }} row(s) selected.
				</p> -->
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
