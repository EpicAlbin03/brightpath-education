import type { Student } from './useStudents'

export type Course = {
  id: number;
  name: string;
  code: string;
  description: string;
  student_count: number;
  student_ids?: number[];
  students?: Student[];
};

type BackendCourse = {
  id: number
  name: string
  code: string
  description: string
}

export function useCourses() {
  const courses = useState<Course[]>('courses:list', () => [])
  const loading = useState<boolean>('courses:loading', () => false)
  const error = useState<string | null>('courses:error', () => null)

  async function fetchCourses() {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<BackendCourse[]>(`/api/courses/`)
      courses.value = response.map((c) => ({ id: c.id, name: c.name, code: c.code, description: c.description }))
      return courses.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch courses.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getCourse(id: number) {
    loading.value = true
    error.value = null
    try {
      const c = await $fetch<BackendCourse>(`/api/courses/${id}`)
      return { id: c.id, name: c.name, code: c.code, description: c.description }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch course.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createCourse(payload: { name: string; code: string; description?: string }) {
    loading.value = true
    error.value = null
    try {
      const c = await $fetch<BackendCourse>(`/api/courses/`, {
        method: 'POST',
        body: payload
      })
      const created = { id: c.id, name: c.name, code: c.code, description: c.description }
      courses.value = [created, ...courses.value]
      return created
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create course.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCourse(id: number, payload: { name?: string; code?: string; description?: string }) {
    loading.value = true
    error.value = null
    try {
      const c = await $fetch<BackendCourse>(`/api/courses/${id}`, {
        method: 'PUT',
        body: payload
      })
      const updated = { id: c.id, name: c.name, code: c.code, description: c.description }
      courses.value = courses.value.map((x) => (x.id === id ? updated : x))
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update course.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteCourse(id: number) {
    loading.value = true
    error.value = null
    try {
      await $fetch(`/api/courses/${id}`, {
        method: 'DELETE'
      })
      courses.value = courses.value.filter((c) => c.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete course.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { courses, loading, error, fetchCourses, getCourse, createCourse, updateCourse, deleteCourse }
}
