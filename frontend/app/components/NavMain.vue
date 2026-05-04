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
					:is-active="isActive(item.url)"
					class="hover:bg-primary/5 hover:text-primary active:bg-primary/5 active:text-primary data-[active=true]:bg-primary/5 data-[active=true]:text-primary"
				>
					<NuxtLink :to="item.url">
						<component :is="item.icon" class="size-4" />
						{{ item.title }}
					</NuxtLink>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	</SidebarGroup>
</template>
