<script setup lang="ts">
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import PageTitle from '~/components/PageTitle.vue'
import type { Student } from '~/lib/types'

const route = useRoute()
const requestHeaders = import.meta.server ? useRequestHeaders(['cookie']) : undefined

const { data: student, pending, error } = await useFetch<Student>(
	() => `/api/students/${route.params.id}?include=courses`,
	{
		headers: requestHeaders
	}
)

const isActive = computed(() => Boolean(student.value?.is_active))
const courses = computed(() => student.value?.courses ?? [])

function getStudentInitials(name?: string) {
	if (!name) return 'S'
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join('')
}
</script>

<template>
	<section class="space-y-6">
		<PageTitle :title="student ? student.name : 'Student detail'" description="Profile, status, and enrolled courses" />

		<div v-if="pending" class="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
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

		<p v-else-if="error" class="text-sm text-destructive">Failed to load student.</p>

		<div v-else-if="student" class="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
			<Card class="overflow-hidden border-border/70 bg-card/90 shadow-sm backdrop-blur">
				<CardHeader class="relative overflow-hidden border-b border-border/60 bg-gradient-to-r from-slate-50 via-blue-50 to-cyan-50 p-6 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
					<div class="absolute inset-0 bg-background/90" />
					<div class="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
						<div class="flex items-center gap-4">
							<div class="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-muted text-lg font-semibold text-foreground shadow-sm">
								{{ getStudentInitials(student.name) }}
							</div>
							<div class="space-y-1">
								<CardTitle class="text-2xl">{{ student.name }}</CardTitle>
								<CardDescription class="text-base">{{ student.email }}</CardDescription>
							</div>
						</div>

						<Button as-child variant="outline" class="w-fit">
							<NuxtLink :to="`/students/${student.id}/edit`">Edit student</NuxtLink>
						</Button>
					</div>
				</CardHeader>

				<CardContent class="p-6">
					<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<div class="rounded-2xl border border-border/60 bg-muted/35 p-4">
							<p class="text-xs uppercase tracking-wide text-muted-foreground">Date of birth</p>
							<p class="mt-2 text-sm font-medium">{{ student.date_of_birth ?? 'Not provided' }}</p>
						</div>
						<div class="rounded-2xl border border-border/60 bg-muted/35 p-4">
							<p class="text-xs uppercase tracking-wide text-muted-foreground">Grade</p>
							<p class="mt-2 text-sm font-medium">{{ student.grade }}</p>
						</div>
						<div class="rounded-2xl border border-border/60 bg-muted/35 p-4">
							<p class="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
							<p class="mt-2 text-sm font-medium">{{ student.is_active ? 'Active' : 'Inactive' }}</p>
						</div>
						<div class="rounded-2xl border border-border/60 bg-muted/35 p-4">
							<p class="text-xs uppercase tracking-wide text-muted-foreground">Courses</p>
							<p class="mt-2 text-sm font-medium">{{ courses.length }}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card class="border-border/70 bg-card/90 shadow-sm backdrop-blur">
				<CardHeader>
					<CardTitle class="text-lg">Enrolled courses</CardTitle>
					<CardDescription>{{ courses.length }} course{{ courses.length === 1 ? '' : 's' }} linked to this student</CardDescription>
				</CardHeader>

				<CardContent class="space-y-3">
					<div v-if="courses.length" class="grid gap-3">
						<Card
							v-for="course in courses"
							:key="course.id"
							class="border-border/60 bg-muted/20 py-0 shadow-none transition-colors hover:border-primary/40 hover:bg-primary/5"
						>
							<CardContent class="flex items-start justify-between gap-4 p-4">
								<div class="space-y-1">
									<NuxtLink :to="`/courses/${course.id}`" class="font-medium leading-tight hover:underline">
										{{ course.name }}
									</NuxtLink>
									<p class="text-sm text-muted-foreground">{{ course.code }}</p>
									<p class="line-clamp-2 text-sm text-muted-foreground/90">
										{{ course.description || 'No description available.' }}
									</p>
								</div>
							</CardContent>
						</Card>
					</div>

					<div v-else class="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
						No courses found for this student.
					</div>
				</CardContent>
			</Card>
		</div>
	</section>
</template>
