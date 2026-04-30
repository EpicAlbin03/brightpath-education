<script setup lang="ts">
import CreateStudentForm from '~/components/CreateStudentForm.vue';
import PageTitle from '~/components/PageTitle.vue';
</script>

<template>
	<section class="space-y-6">
		<PageTitle title="Create Student" />
		<CreateStudentForm @created="(student) => console.log('Student created:', student)" />
	</section>
</template>
