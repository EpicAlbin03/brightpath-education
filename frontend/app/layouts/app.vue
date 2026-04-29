<script setup lang="ts">
import { computed } from 'vue';
import AppSidebar from '@/components/AppSidebar.vue';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const route = useRoute();
const sidebarState = useCookie<boolean>('sidebar_state');

const breadcrumbSegments = computed(() => {
	const pathSegments = route.path.split('/').filter(Boolean);

	return pathSegments.map((segment, index) => ({
		href: `/${pathSegments.slice(0, index + 1).join('/')}`,
		label: decodeURIComponent(segment)
	}));
});
</script>

<template>
	<SidebarProvider :open="sidebarState" @update:open="sidebarState = $event">
		<AppSidebar />
		<SidebarInset>
			<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
				<SidebarTrigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
				<Breadcrumb>
					<BreadcrumbList>
						<template v-if="breadcrumbSegments.length">
							<template v-for="(segment, index) in breadcrumbSegments" :key="segment.href">
								<BreadcrumbItem>
									<BreadcrumbLink v-if="index < breadcrumbSegments.length - 1" as-child>
										<NuxtLink :to="segment.href">{{ segment.label }}</NuxtLink>
									</BreadcrumbLink>
									<BreadcrumbPage v-else>{{ segment.label }}</BreadcrumbPage>
								</BreadcrumbItem>
								<BreadcrumbSeparator v-if="index < breadcrumbSegments.length - 1" />
							</template>
						</template>
						<BreadcrumbItem v-else>
							<BreadcrumbPage>Home</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</header>
			<div class="flex flex-1 flex-col gap-4 p-4">
				<slot />
			</div>
		</SidebarInset>
	</SidebarProvider>
</template>
