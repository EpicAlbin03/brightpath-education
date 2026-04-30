<script setup lang="ts">
import CreateCourseForm from '~/components/CreateCourseForm.vue';
import PageTitle from '~/components/PageTitle.vue';
</script>

<template>
	<section class="space-y-6">
		<PageTitle title="Create Course" />
		<CreateCourseForm @created="(course) => console.log('Course created:', course)" />
	</section>
</template>
