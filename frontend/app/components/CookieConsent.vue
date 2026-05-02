<!-- https://github.com/r2hu1/shadcn-cookie-consent -->

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { Cookie } from 'lucide-vue-next';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type CookieConsentVariant = 'default' | 'small' | 'mini';

const props = withDefaults(
	defineProps<{
		variant?: CookieConsentVariant;
		description?: string;
		learnMoreHref?: string;
		class?: HTMLAttributes['class'];
		onAcceptCallback?: () => void;
		onDeclineCallback?: () => void;
	}>(),
	{
		variant: 'default',
		description:
			'We use cookies to ensure you get the best experience on our website. For more information on how we use cookies, please see our cookie policy.',
		learnMoreHref: '#'
	}
);

const emit = defineEmits<{
	accept: [];
	decline: [];
}>();

const isOpen = ref(false);
const hide = ref(false);

let hideTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleHide() {
	if (hideTimer) {
		clearTimeout(hideTimer);
	}

	hideTimer = setTimeout(() => {
		hide.value = true;
	}, 700);
}

function handleAccept() {
	isOpen.value = false;
	scheduleHide();
	props.onAcceptCallback?.();
	emit('accept');
}

function handleDecline() {
	isOpen.value = false;
	scheduleHide();
	props.onDeclineCallback?.();
	emit('decline');
}

const wrapperClass = computed(() =>
	cn(
		'fixed z-50 transition-all duration-700',
		isOpen.value ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
		props.variant === 'mini'
			? 'left-0 right-0 bottom-4 w-full sm:left-auto sm:right-4 sm:max-w-3xl'
			: 'bottom-0 left-0 right-0 w-full sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-md',
		props.class
	)
);

onMounted(() => {
	isOpen.value = true;
});

onBeforeUnmount(() => {
	if (hideTimer) {
		clearTimeout(hideTimer);
	}
});
</script>

<template>
	<div v-if="!hide" :class="wrapperClass">
		<Card v-if="props.variant === 'default'" class="m-3 shadow-lg">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-lg">We use cookies</CardTitle>
				<Cookie class="h-5 w-5" />
			</CardHeader>

			<CardContent class="space-y-2">
				<CardDescription class="text-sm">
					{{ props.description }}
				</CardDescription>

				<p class="text-xs text-muted-foreground">
					By clicking <span class="font-medium">"Accept"</span>, you agree to our use of cookies.
				</p>

				<a
					:href="props.learnMoreHref"
					class="text-xs text-primary underline underline-offset-4 hover:no-underline"
				>
					Learn more
				</a>
			</CardContent>

			<CardFooter class="flex gap-2 pt-2">
				<Button variant="outline" class="flex-1" @click="handleDecline"> Decline </Button>
				<Button class="flex-1" @click="handleAccept">Accept</Button>
			</CardFooter>
		</Card>

		<Card v-else-if="props.variant === 'small'" class="m-3 shadow-lg">
			<CardHeader class="flex h-0 flex-row items-center justify-between space-y-0 px-4 pb-2">
				<CardTitle class="text-base">We use cookies</CardTitle>
				<Cookie class="h-4 w-4" />
			</CardHeader>

			<CardContent class="px-4 pt-0 pb-2">
				<CardDescription class="text-sm">
					{{ props.description }}
				</CardDescription>
			</CardContent>

			<CardFooter class="flex h-0 gap-2 px-4 py-2">
				<Button variant="outline" size="sm" class="flex-1 rounded-full" @click="handleDecline">
					Decline
				</Button>
				<Button size="sm" class="flex-1 rounded-full" @click="handleAccept"> Accept </Button>
			</CardFooter>
		</Card>

		<Card v-else class="mx-3 p-0 py-3 shadow-lg">
			<CardContent class="grid gap-4 p-0 px-3.5 sm:flex">
				<CardDescription class="flex-1 text-xs sm:text-sm">
					{{ props.description }}
				</CardDescription>

				<div class="flex items-center justify-end gap-2 sm:gap-3">
					<Button size="sm" variant="outline" class="h-7 text-xs" @click="handleDecline">
						Decline
						<span class="sr-only sm:hidden">Decline</span>
					</Button>

					<Button size="sm" class="h-7 text-xs" @click="handleAccept">
						Accept
						<span class="sr-only sm:hidden">Accept</span>
					</Button>
				</div>
			</CardContent>
		</Card>
	</div>
</template>
