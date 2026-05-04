<script setup lang="ts">
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import PageTitle from '~/components/PageTitle.vue';
import type { CourseIncludeStudents } from '~~/shared/types';

const route = useRoute();

const { data, pending, status, error } = await useFetch<CourseIncludeStudents>(
	`/api/courses/${route.params.id}?include=students`
);

const course = computed<CourseIncludeStudents | null>(() => data.value ?? null);
const students = computed(() => course.value?.students ?? []);
const isLoading = computed(() => status.value === 'idle' || pending.value);
const { user } = useAuth();
const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'superuser');

useSeoMeta({
	title: () =>
		course.value
			? `${course.value.name} | Course Details | BrightPath Education`
			: 'Course Details | BrightPath Education',
	description: () =>
		course.value
			? `View details for ${course.value.name}, including course information and enrolled students.`
			: 'View course details, descriptions, and enrolled students in BrightPath Education.'
});

function getCourseInitials(name?: string) {
	if (!name) return 'C';

	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join('');
}
</script>

<template>
	<section class="space-y-6">
		<PageTitle
			:title="course ? course.name : 'Course detail'"
			description="Overview, description, and enrolled students"
		/>

		<div v-if="isLoading" class="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
			<Card class="min-h-64 animate-pulse">
				<CardContent class="space-y-4 p-6">
					<div class="h-16 w-16 rounded-full bg-muted" />
					<div class="space-y-2">
						<div class="h-5 w-40 rounded bg-muted" />
						<div class="h-4 w-56 rounded bg-muted" />
					</div>
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="h-20 rounded-xl bg-muted" />
						<div class="h-20 rounded-xl bg-muted" />
						<div class="h-20 rounded-xl bg-muted" />
						<div class="h-20 rounded-xl bg-muted" />
					</div>
				</CardContent>
			</Card>
			<Card class="min-h-64 animate-pulse">
				<CardContent class="space-y-3 p-6">
					<div class="h-5 w-28 rounded bg-muted" />
					<div class="h-4 w-44 rounded bg-muted" />
					<div class="space-y-3 pt-4">
						<div class="h-16 rounded-xl bg-muted" />
						<div class="h-16 rounded-xl bg-muted" />
					</div>
				</CardContent>
			</Card>
		</div>

		<p v-else-if="error" class="text-sm text-destructive">Failed to load course.</p>

		<div v-else-if="course" class="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
			<Card class="overflow-hidden border-border/70 bg-card/90 shadow-sm backdrop-blur">
				<CardHeader class="relative overflow-hidden border-b border-border/60 bg-background p-6">
					<div class="absolute inset-0 bg-background/90" />
					<div class="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
						<div class="flex items-center gap-4">
							<div
								class="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-muted text-lg font-semibold text-foreground shadow-sm"
							>
								{{ getCourseInitials(course.name) }}
							</div>
							<div class="space-y-1">
								<CardTitle class="text-2xl">{{ course.name }}</CardTitle>
								<CardDescription class="text-base">{{ course.code }}</CardDescription>
							</div>
						</div>

					<Button v-if="isAdmin" as-child variant="outline" class="w-fit">
							<NuxtLink :to="`/courses/${course.id}/edit`">Edit course</NuxtLink>
						</Button>
					</div>
				</CardHeader>

				<CardContent class="p-6">
					<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<div class="rounded-2xl border border-border/60 bg-muted/35 p-4 sm:col-span-2">
							<p class="text-xs tracking-wide text-muted-foreground uppercase">Description</p>
							<p class="mt-2 text-sm leading-6 font-medium">
								{{ course.description || 'No description provided.' }}
							</p>
						</div>
						<div class="rounded-2xl border border-border/60 bg-muted/35 p-4">
							<p class="text-xs tracking-wide text-muted-foreground uppercase">Students</p>
							<p class="mt-2 text-sm font-medium">{{ students.length }}</p>
						</div>
						<div class="rounded-2xl border border-border/60 bg-muted/35 p-4">
							<p class="text-xs tracking-wide text-muted-foreground uppercase">Code</p>
							<p class="mt-2 text-sm font-medium">{{ course.code }}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card class="border-border/70 bg-card/90 shadow-sm backdrop-blur">
				<CardHeader>
					<CardTitle class="text-lg">Enrolled students</CardTitle>
					<CardDescription
						>{{ students.length }} student{{ students.length === 1 ? '' : 's' }} linked to this
						course</CardDescription
					>
				</CardHeader>

				<CardContent class="space-y-3">
					<div v-if="students.length" class="grid gap-3">
						<Card
							v-for="student in students"
							:key="student.id"
							class="border-border/60 bg-muted/20 py-0 shadow-none transition-colors hover:border-primary/40 hover:bg-primary/5"
						>
							<CardContent class="flex items-start justify-between gap-4 p-4">
								<div class="space-y-1">
									<NuxtLink :to="`/students/${student.id}`" class="font-medium leading-tight hover:underline">
										{{ student.name }}
									</NuxtLink>
									<p class="text-sm text-muted-foreground">{{ student.email }}</p>
									<p class="text-sm text-muted-foreground/90">Grade {{ student.grade }}</p>
								</div>
								<Badge :variant="student.is_active ? 'default' : 'secondary'" class="shrink-0">
									{{ student.is_active ? 'Active' : 'Inactive' }}
								</Badge>
							</CardContent>
						</Card>
					</div>

					<div v-else class="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
						No students found for this course.
					</div>
				</CardContent>
			</Card>
		</div>
	</section>
</template>
