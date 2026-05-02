<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
	class?: HTMLAttributes['class'];
}>();
</script>

<template>
	<tr
		data-slot="table-row"
		:class="
			cn(
				'border-b [&>td]:transition-colors hover:[&>td]:bg-muted/50 data-[state=selected]:[&>td]:bg-muted last:[&>td:first-child]:rounded-bl-xl last:[&>td:last-child]:rounded-br-xl [&>th]:transition-colors hover:[&>th]:bg-muted/50 data-[state=selected]:[&>th]:bg-muted',
				props.class
			)
		"
	>
		<slot />
	</tr>
</template>
