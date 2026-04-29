<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar';
import { Book, Users, type LucideIcon } from 'lucide-vue-next';
import NavMain from '@/components/NavMain.vue';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarRail,
	useSidebar
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

const { open } = useSidebar();
</script>

<template>
	<Sidebar v-bind="props" collapsible="icon">
		<SidebarHeader>
			<SidebarMenu>
				<SidebarMenuItem>
					<a href="/" class="cursor-pointer">
						<NuxtImg src="/logo.jpg" alt="logo" class="mx-auto h-16 rounded-lg" v-if="open" />
						<NuxtImg src="/favicon.jpg" alt="logo" class="mx-auto mt-2 h-8 rounded-lg" v-else />
					</a>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarHeader>
		<SidebarContent>
			<NavMain :items="items" />
		</SidebarContent>
		<SidebarFooter>
			<NavUser :user="user" />
		</SidebarFooter>
		<SidebarRail />
	</Sidebar>
</template>
