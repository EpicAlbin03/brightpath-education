import { Student } from '~~/shared/types';
import { getToken, validateIdParams, requireAdminOrSuperuser } from '../../utils';
import { studentFormSchema } from '~~/shared/schemas';

export default defineEventHandler(async (event) => {
	await requireAdminOrSuperuser(event);
	const id = await validateIdParams(event);

	const formData = await readValidatedBody(event, studentFormSchema.safeParse);
	if (!formData.success) {
		throw createError({ statusCode: 422, message: 'Invalid form data' });
	}

	const config = useRuntimeConfig();
	const token = getToken(event);

	try {
		const student = await $fetch<Student>(`${config.public.apiBase}/students/${id}/`, {
			method: 'PUT',
			body: formData.data,
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json'
			}
		});

		return student;
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		throw createError({ statusCode: 500, message: `Failed to edit student ${id}` });
	}
});
