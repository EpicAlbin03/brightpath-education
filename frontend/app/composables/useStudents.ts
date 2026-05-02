import type { Student } from '@/lib/types'

type BackendCourse = {
  id: number
  name: string
  code: string
  description: string
}

type BackendStudent = {
  id: number
  name: string
  email: string
  date_of_birth: string | null
  grade: string
  is_active: boolean
  courses?: BackendCourse[]
}

type StudentPayload = {
  name: string
  email: string
  date_of_birth?: string | null
  grade?: string
  is_active?: boolean
  course_ids?: number[]
}

function mapBackendStudent(student: BackendStudent): Student {
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    date_of_birth: student.date_of_birth,
    grade: student.grade,
    is_active: student.is_active,
    course_ids: (student.courses ?? []).map((course) => course.id),
    profile_photo: ''
  }
}

function getAuthHeaders() {
  if (import.meta.client) {
    return { Accept: 'application/json' }
  }

  return undefined
}

export function useStudents() {
  const students = useState<Student[]>('students:list', () => [])
  const loading = useState<boolean>('students:loading', () => false)
  const error = useState<string | null>('students:error', () => null)

  async function fetchStudents() {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<BackendStudent[]>('/api/students/', {
        headers: getAuthHeaders()
      })
      students.value = response.map(mapBackendStudent)
      return students.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch students.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getStudent(id: number) {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<BackendStudent>(`/api/students/${id}`, {
        headers: getAuthHeaders()
      })
      return mapBackendStudent(response)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch student.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createStudent(payload: StudentPayload) {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<BackendStudent>('/api/students/', {
        method: 'POST',
        body: payload,
        headers: getAuthHeaders()
      })

      const created = mapBackendStudent(response)
      students.value = [created, ...students.value]
      return created
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create student.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateStudent(id: number, payload: StudentPayload) {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<BackendStudent>(`/api/students/${id}`, {
        method: 'PUT',
        body: payload,
        headers: getAuthHeaders()
      })

      const updated = mapBackendStudent(response)
      students.value = students.value.map((student) => (student.id === id ? updated : student))
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update student.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteStudent(id: number) {
    loading.value = true
    error.value = null

    try {
      await $fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      students.value = students.value.filter((student) => student.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete student.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function enrollInCourses(studentId: number, courseIds: number[]) {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<BackendStudent>(`/api/students/${studentId}/courses`, {
        method: 'POST',
        body: { course_ids: courseIds },
        headers: getAuthHeaders()
      })

      const updated = mapBackendStudent(response)
      students.value = students.value.map((student) =>
        student.id === studentId ? updated : student
      )
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to enroll student in courses.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function unenrollFromCourse(studentId: number, courseId: number) {
    loading.value = true
    error.value = null

    try {
      await $fetch(`/api/students/${studentId}/courses/${courseId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      const current = students.value.find((student) => student.id === studentId)
      if (current) {
        current.course_ids = current.course_ids.filter((id) => id !== courseId)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to unenroll student from course.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    students,
    loading,
    error,
    fetchStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    enrollInCourses,
    unenrollFromCourse
  }
}
