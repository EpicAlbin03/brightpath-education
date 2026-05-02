<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar';
import { Book, Shield, Users, type LucideIcon } from 'lucide-vue-next';
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
import NavSecondary from './NavSecondary.vue';

const props = defineProps<SidebarProps>();

type Item = {
	title: string;
	url: string;
	icon: LucideIcon;
};

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

const secondaryItems: Item[] = [
	{
		title: 'Privacy Policy',
		url: '/privacy',
		icon: Shield
	}
];

const { open } = useSidebar();
</script>

<template>
	<Sidebar v-bind="props" collapsible="icon">
		<SidebarHeader>
			<SidebarMenu>
				<SidebarMenuItem>
					<NuxtLink to="/" class="cursor-pointer">
						<NuxtImg src="/logo.jpg" alt="logo" class="mx-auto h-16 rounded-lg" v-if="open" />
						<NuxtImg src="/favicon.jpg" alt="logo" class="mx-auto mt-2 h-8 rounded-lg" v-else />
					</NuxtLink>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarHeader>
		<SidebarContent>
			<NavMain :items="items" />
			<NavSecondary :items="secondaryItems" class="mt-auto" />
		</SidebarContent>
		<SidebarFooter>
			<NavUser />
		</SidebarFooter>
		<SidebarRail />
	</Sidebar>
</template>
