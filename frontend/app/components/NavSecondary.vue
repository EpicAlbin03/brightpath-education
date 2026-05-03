<script setup lang="ts">
import type { LucideIcon } from 'lucide-vue-next';

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem
} from '@/components/ui/sidebar';

const props = defineProps<{
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
		<SidebarGroupContent>
			<SidebarMenu>
				<SidebarMenuItem v-for="item in items" :key="item.title">
					<SidebarMenuButton
						as-child
						size="sm"
						:is-active="isActive(item.url)"
						class="hover:bg-primary/5 hover:text-primary active:bg-primary/5 active:text-primary data-[active=true]:bg-primary/5 data-[active=true]:text-primary"
					>
						<NuxtLink :to="item.url">
							<component :is="item.icon" />
							<span>{{ item.title }}</span>
						</NuxtLink>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroupContent>
	</SidebarGroup>
</template>
