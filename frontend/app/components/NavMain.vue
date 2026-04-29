<script setup lang="ts">
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem
} from '@/components/ui/sidebar';
import type { LucideIcon } from 'lucide-vue-next';

defineProps<{
	items: {
		title: string;
		url: string;
		icon: LucideIcon;
	}[];
}>();

const route = useRoute();

function isActive(url: string) {
	return route.path.startsWith(url);
}
</script>

<template>
	<SidebarGroup>
		<SidebarMenu>
			<SidebarMenuItem v-for="item in items" :key="item.title">
				<SidebarMenuButton
					as-child
					:data-active="isActive(item.url)"
					class="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground"
				>
					<a :href="item.url">
						<component :is="item.icon" class="size-4" />
						{{ item.title }}
					</a>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	</SidebarGroup>
</template>
