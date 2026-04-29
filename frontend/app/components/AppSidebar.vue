<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar';
import { Book, School, Users, type LucideIcon } from 'lucide-vue-next';
import NavMain from '@/components/NavMain.vue';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail
} from '@/components/ui/sidebar';
import NavUser from './NavUser.vue';

const props = defineProps<SidebarProps>();

type Item = {
	title: string;
	url: string;
	icon: LucideIcon;
};

// This is sample data.
const items: Item[] = [
	{
		title: 'Courses',
		url: '/courses',
		icon: Book
	},
	{
		title: 'Students',
		url: '/students',
		icon: Users
	}
];

const user = {
	name: 'John Doe',
	email: 'john.doe@example.com',
	avatar: 'https://github.com/shadcn.png'
};
</script>

<template>
	<Sidebar v-bind="props" collapsible="icon">
		<SidebarHeader>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton size="lg" as-child>
						<a href="#">
							<div
								class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
							>
								<School class="size-4" />
							</div>
							<div class="flex flex-col gap-0.5 leading-none">
								<span class="font-medium">Studentplatform</span>
								<span class="">v1.0.0</span>
							</div>
						</a>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarHeader>
		<SidebarContent>
			<NavMain :items="items" />
		</SidebarContent>
		<SidebarFooter>
			<div class="p-1">
				<NavUser :user="user" />
			</div>
		</SidebarFooter>
		<SidebarRail />
	</Sidebar>
</template>
