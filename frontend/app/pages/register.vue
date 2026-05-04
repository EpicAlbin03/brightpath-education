<script setup lang="ts">
import { Mail, Lock, User } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const config = useRuntimeConfig();

useSeoMeta({
	title: 'Create Account | BrightPath Education',
	description:
		'Create a BrightPath Education account to access the platform and start managing students and courses.'
});

const username = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const success = ref(false);

async function handleRegister() {
	error.value = '';
	loading.value = true;
	try {
		await $fetch(`${config.public.apiBase}/auth/register/`, {
			method: 'POST',
			body: { username: username.value, email: email.value, password: password.value }
		});
		success.value = true;
		await navigateTo('/login');
	} catch (e: unknown) {
		const err = e as { data?: Record<string, string[]> };
		const first = Object.values(err?.data ?? {})?.[0];
		error.value = Array.isArray(first)
			? (first[0] ?? 'Registration failed. Please try again.')
			: 'Registration failed. Please try again.';
	} finally {
		loading.value = false;
	}
}
</script>

<template>
	<div class="flex min-h-screen items-center justify-center bg-background px-4 py-24">
		<div class="relative w-full max-w-sm">
			<NuxtImg
				src="/logo.jpg"
				alt="logo"
				class="absolute bottom-full left-1/2 mb-8 -translate-x-1/2 rounded-lg"
			/>

			<Card>
				<CardHeader class="space-y-1 pb-4">
					<CardTitle class="text-lg">Create account</CardTitle>
					<CardDescription>Fill in the details below to get started</CardDescription>
				</CardHeader>

				<CardContent class="space-y-4">
					<form class="space-y-3" @submit.prevent="handleRegister">
						<div class="space-y-1.5">
							<Label for="username">Username</Label>
							<div class="relative">
								<User
									class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
								/>
								<Input
									id="username"
									v-model="username"
									type="text"
									placeholder="johndoe"
									class="pl-9"
									autocomplete="username"
									required
								/>
							</div>
						</div>

						<div class="space-y-1.5">
							<Label for="email">Email</Label>
							<div class="relative">
								<Mail
									class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
								/>
								<Input
									id="email"
									v-model="email"
									type="email"
									placeholder="you@example.com"
									class="pl-9"
									autocomplete="email"
									required
								/>
							</div>
						</div>

						<div class="space-y-1.5">
							<Label for="password">Password</Label>
							<div class="relative">
								<Lock
									class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
								/>
								<Input
									id="password"
									v-model="password"
									type="password"
									placeholder="••••••••"
									class="pl-9"
									autocomplete="new-password"
									minlength="8"
									required
								/>
							</div>
						</div>

						<p v-if="error" class="text-sm text-destructive">{{ error }}</p>

						<Button type="submit" class="w-full" :disabled="loading">
							<span v-if="loading">Creating account…</span>
							<span v-else>Create account</span>
						</Button>
					</form>
				</CardContent>

				<CardFooter class="pt-0">
					<p class="w-full text-center text-sm text-muted-foreground">
						Already have an account?
						<NuxtLink
							to="/login"
							class="text-foreground underline underline-offset-4 hover:text-primary"
						>
							Sign in
						</NuxtLink>
					</p>
				</CardFooter>
			</Card>
		</div>
	</div>
</template>
