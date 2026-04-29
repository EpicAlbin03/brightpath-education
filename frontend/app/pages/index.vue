<script setup lang="ts">
definePageMeta({
	middleware: [
		function (to, from) {
			if (to.path === '/') {
				return navigateTo('/courses');
			}
		}
	]
});
</script>
