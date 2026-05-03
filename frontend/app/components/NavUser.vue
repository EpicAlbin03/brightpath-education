<script setup lang="ts">
import { ChevronsUpDown, LogOut, Settings, Users } from 'lucide-vue-next';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar
} from '@/components/ui/sidebar';

const { isMobile } = useSidebar();
const { user, logout, fetchMe } = useAuth();

onMounted(async () => {
	if (!user.value) await fetchMe();
});

const initials = computed(() => {
	if (!user.value) return '??';
	const name = user.value.username || user.value.email;
	return name.slice(0, 2).toUpperCase();
});
</script>

<template>
	<SidebarMenu>
		<SidebarMenuItem>
			<DropdownMenu>
				<DropdownMenuTrigger as-child>
					<SidebarMenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<Avatar class="h-8 w-8 rounded-lg">
							<AvatarFallback class="rounded-lg">{{ initials }}</AvatarFallback>
						</Avatar>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-medium">{{ user?.username }}</span>
							<span class="truncate text-xs">{{ user?.email }}</span>
						</div>
						<ChevronsUpDown class="ml-auto size-4" />
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-lg"
					:side="isMobile ? 'bottom' : 'right'"
					align="end"
					:side-offset="4"
				>
					<DropdownMenuLabel class="p-0 font-normal">
						<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
							<Avatar class="h-8 w-8 rounded-lg">
								<AvatarFallback class="rounded-lg">{{ initials }}</AvatarFallback>
							</Avatar>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">{{ user?.username }}</span>
								<span class="truncate text-xs">{{ user?.email }}</span>
							</div>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem @select="navigateTo('/settings')">
							<Settings />
							Settings
						</DropdownMenuItem>
						<DropdownMenuItem
							v-if="user?.role === 'superuser'"
							@select="navigateTo('/users')"
						>
							<Users />
							User Management
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem @click="logout">
						<LogOut />
						Log out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	</SidebarMenu>
</template>
