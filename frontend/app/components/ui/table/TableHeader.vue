<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
	class?: HTMLAttributes['class'];
}>();
</script>

<template>
	<thead
		data-slot="table-header"
		:class="
			cn(
				'[&_tr]:border-b [&_tr:first-child_th:first-child]:rounded-tl-xl [&_tr:first-child_th:last-child]:rounded-tr-xl',
				props.class
			)
		"
	>
		<slot />
	</thead>
</template>
