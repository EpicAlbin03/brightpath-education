<script setup lang="ts">
import { computed } from 'vue';
import { MoonStar, Sun } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

const colorMode = useColorMode();

const isDark = computed(() => colorMode.value === 'dark');

function toggleMode() {
	colorMode.preference = isDark.value ? 'light' : 'dark';
}
</script>

<template>
	<Button
		variant="ghost"
		size="icon"
		class="relative cursor-pointer"
		type="button"
		aria-label="Toggle theme"
		@click="toggleMode"
	>
		<Sun
			class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
		/>
		<MoonStar
			class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
		/>
		<span class="sr-only">Toggle theme</span>
	</Button>
</template>
