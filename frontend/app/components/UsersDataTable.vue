<script setup lang="ts">
import type { ColumnDef, SortingState } from '@tanstack/vue-table';
import type { PropType } from 'vue';
import type { AppUser } from '~~/shared/types';
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
	MoreHorizontal,
	Pencil,
	ShieldOff,
	ShieldCheck,
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
	users: AppUser[];
}>();

const emit = defineEmits<{
	deactivate: [id: number];
	activate: [id: number];
	delete: [id: number];
}>();

const router = useRouter();

const pageSizes = [5, 10, 25, 50];
const searchQuery = ref('');
const statusFilter = ref<'all' | 'active' | 'inactive'>('all');
const roleFilter = ref('all');

const userRows = ref<AppUser[]>(props.users);

watch(
	() => props.users,
	(val) => {
		userRows.value = val;
	}
);

function getRoleBadgeClass(role: AppUser['role']) {
	if (role === 'superuser') return 'border-purple-200 bg-purple-50 text-purple-700';
	if (role === 'admin') return 'border-blue-200 bg-blue-50 text-blue-700';
	return 'border-gray-200 bg-gray-50 text-gray-600';
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
	name: 'UserRowActions',
	props: {
		user: {
			type: Object as PropType<AppUser>,
			required: true
		},
		onEdit: {
			type: Function as PropType<() => void>,
			required: true
		},
		onDeactivate: {
			type: Function as PropType<() => void>,
			required: true
		},
		onActivate: {
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
		const isDeactivateDialogOpen = ref(false);

		return () =>
			h(DropdownMenu, () => [
				h(DropdownMenuTrigger, { asChild: true }, () =>
					h(Button, { variant: 'ghost', size: 'icon-sm', class: 'h-8 w-8 p-0' }, () => [
						h('span', { class: 'sr-only' }, `Open actions for ${props.user.username}`),
						h(MoreHorizontal, { class: 'h-4 w-4' })
					])
				),
				h(DropdownMenuContent, { align: 'end', class: 'w-44' }, () => [
					h(DropdownMenuItem, { onSelect: props.onEdit }, () => [
						h(Pencil, { class: 'h-4 w-4' }),
						'Edit'
					]),
					h(DropdownMenuSeparator),
					props.user.is_active
						? h(
								DropdownMenuItem,
								{
									variant: 'destructive',
									onSelect: () => {
										isDeactivateDialogOpen.value = true;
									}
								},
								() => [h(ShieldOff, { class: 'h-4 w-4' }), 'Deactivate']
							)
						: h(
								DropdownMenuItem,
								{ onSelect: props.onActivate },
								() => [h(ShieldCheck, { class: 'h-4 w-4' }), 'Activate user']
							),
					h(DropdownMenuSeparator),
					h(
						DropdownMenuItem,
						{
							variant: 'destructive',
							onSelect: () => {
								isDeleteDialogOpen.value = true;
							}
						},
						() => [h(Trash2, { class: 'h-4 w-4' }), 'Remove account']
					)
				]),
				h(DeleteAlertDialog, {
					open: isDeactivateDialogOpen.value,
					'onUpdate:open': (value: boolean) => {
						isDeactivateDialogOpen.value = value;
					},
					title: `Deactivate ${props.user.username}?`,
					description:
						'This will disable the account and make the password unusable. The user will not be able to log in.',
					action: props.onDeactivate
				}),
				h(DeleteAlertDialog, {
					open: isDeleteDialogOpen.value,
					'onUpdate:open': (value: boolean) => {
						isDeleteDialogOpen.value = value;
					},
					title: `Remove ${props.user.username}?`,
					description:
						'This action cannot be undone. The user account will be permanently deleted.',
					action: props.onDelete
				})
			]);
	}
});

const sorting = ref<SortingState>([]);

const roleOptions = computed(() =>
	Array.from(new Set(userRows.value.map((u) => u.role))).sort()
);

const columns: ColumnDef<AppUser>[] = [
	{
		accessorKey: 'id',
		header: ({ column }) => h('div', { class: 'pl-3' }, sortableHeader('ID', column)),
		cell: ({ row }) => h('div', { class: 'pl-3 font-medium tabular-nums' }, row.original.id)
	},
	{
		accessorKey: 'username',
		header: ({ column }) => sortableHeader('Username', column),
		cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.username)
	},
	{
		accessorKey: 'email',
		header: ({ column }) => sortableHeader('Email', column),
		cell: ({ row }) => h('div', { class: 'text-muted-foreground' }, row.original.email)
	},
	{
		accessorKey: 'role',
		header: 'Role',
		cell: ({ row }) =>
			h(
				Badge,
				{ variant: 'outline', class: getRoleBadgeClass(row.original.role) },
				() => row.original.role
			)
	},
	{
		accessorKey: 'is_active',
		header: 'Status',
		cell: ({ row }) =>
			h(
				Badge,
				{ variant: 'outline', class: getStatusBadgeClass(row.original.is_active) },
				() => (row.original.is_active ? 'Active' : 'Deactivated')
			)
	},
	{
		accessorKey: 'date_joined',
		header: 'Joined',
		cell: ({ row }) =>
			h(
				'div',
				{ class: 'text-muted-foreground text-sm' },
				new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
					new Date(row.original.date_joined)
				)
			)
	},
	{
		id: 'actions',
		header: () => h('span', { class: 'sr-only' }, 'Row actions'),
		cell: ({ row }) =>
			h('div', { class: 'flex justify-end' }, [
				h(RowActions, {
					user: row.original,
					onEdit: () => router.push(`/users/${row.original.id}/edit`),
					onDeactivate: () => emit('deactivate', row.original.id),
					onActivate: () => emit('activate', row.original.id),
					onDelete: () => emit('delete', row.original.id)
				})
			]),
		enableSorting: false
	}
];

const data = computed(() => {
	const query = searchQuery.value.trim().toLowerCase();

	return userRows.value.filter((user) => {
		const matchesQuery =
			query.length === 0 ||
			user.username.toLowerCase().includes(query) ||
			user.email.toLowerCase().includes(query);

		const matchesStatus =
			statusFilter.value === 'all' ||
			(statusFilter.value === 'active' && user.is_active) ||
			(statusFilter.value === 'inactive' && !user.is_active);

		const matchesRole = roleFilter.value === 'all' || user.role === roleFilter.value;

		return matchesQuery && matchesStatus && matchesRole;
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
	onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
	state: {
		get sorting() {
			return sorting.value;
		}
	},
	initialState: {
		pagination: { pageSize: 10 }
	}
});

function handlePageSizeUpdate(value: unknown) {
	if (value === null || value === undefined) return;
	table.setPageSize(Number(value));
}

function handleStatusFilterUpdate(value: unknown) {
	statusFilter.value = typeof value === 'string' ? (value as 'all' | 'active' | 'inactive') : 'all';
}

function handleRoleFilterUpdate(value: unknown) {
	roleFilter.value = typeof value === 'string' ? value : 'all';
}

watch([searchQuery, statusFilter, roleFilter], () => {
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
					placeholder="Search by username or email..."
				/>

				<div class="flex flex-col gap-3 sm:flex-row sm:gap-3">
					<Select :model-value="statusFilter" @update:model-value="handleStatusFilterUpdate">
						<SelectTrigger class="w-full sm:w-40">
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
									Deactivated
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
								<Badge variant="outline" :class="getStatusBadgeClass(false)">Deactivated</Badge>
							</SelectItem>
						</SelectContent>
					</Select>

					<Select :model-value="roleFilter" @update:model-value="handleRoleFilterUpdate">
						<SelectTrigger class="w-full sm:w-36">
							<SelectValue placeholder="Role">
								<Badge
									v-if="roleFilter !== 'all'"
									variant="outline"
									:class="getRoleBadgeClass(roleFilter as AppUser['role'])"
								>
									{{ roleFilter }}
								</Badge>
								<span v-else>All roles</span>
							</SelectValue>
						</SelectTrigger>
						<SelectContent align="start">
							<SelectItem value="all">All roles</SelectItem>
							<SelectItem v-for="role in roleOptions" :key="role" :value="role">
								<Badge variant="outline" :class="getRoleBadgeClass(role)">{{ role }}</Badge>
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
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
						>
							<TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
								<FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
							</TableCell>
						</TableRow>
					</template>
					<TableRow v-else>
						<TableCell :colspan="columns.length" class="h-24 text-center text-muted-foreground">
							No users found.
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</div>

		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-2 text-sm text-muted-foreground">
				<span>Rows per page</span>
				<Select
					:model-value="String(table.getState().pagination.pageSize)"
					@update:model-value="handlePageSizeUpdate"
				>
					<SelectTrigger class="h-8 w-16">
						<SelectValue />
					</SelectTrigger>
					<SelectContent align="start">
						<SelectItem v-for="size in pageSizes" :key="size" :value="String(size)">
							{{ size }}
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div class="flex items-center gap-1">
				<span class="text-sm text-muted-foreground">
					Page {{ table.getState().pagination.pageIndex + 1 }} of
					{{ table.getPageCount() }}
				</span>
				<Button
					variant="ghost"
					size="icon-sm"
					class="h-8 w-8"
					:disabled="!table.getCanPreviousPage()"
					@click="table.setPageIndex(0)"
				>
					<ChevronsLeft class="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					class="h-8 w-8"
					:disabled="!table.getCanPreviousPage()"
					@click="table.previousPage()"
				>
					<ChevronLeft class="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					class="h-8 w-8"
					:disabled="!table.getCanNextPage()"
					@click="table.nextPage()"
				>
					<ChevronRight class="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					class="h-8 w-8"
					:disabled="!table.getCanNextPage()"
					@click="table.setPageIndex(table.getPageCount() - 1)"
				>
					<ChevronsRight class="h-4 w-4" />
				</Button>
			</div>
		</div>
	</div>
</template>
