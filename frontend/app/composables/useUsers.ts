import type { AppUser } from '~~/shared/types';
import type { UserEditSchema } from '~~/shared/schemas';

export function useUsers() {
  const users = useState<AppUser[]>('users:list', () => [])
  const loading = useState<boolean>('users:loading', () => false)
  const error = useState<string | null>('users:error', () => null)

  async function fetchUsers() {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<AppUser[]>('/api/users/')
      users.value = response
      return users.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getUser(id: number) {
    loading.value = true
    error.value = null

    try {
      return await $fetch<AppUser>(`/api/users/${id}`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch user.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id: number, data: UserEditSchema) {
    loading.value = true
    error.value = null

    try {
      const updated = await $fetch<AppUser>(`/api/users/${id}`, {
        method: 'PATCH',
        body: data
      })
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) users.value[index] = updated
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update user.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(id: number) {
    loading.value = true
    error.value = null

    try {
      await $fetch(`/api/users/${id}`, { method: 'DELETE' })
      users.value = users.value.filter((u) => u.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete user.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deactivateUser(id: number) {
    loading.value = true
    error.value = null

    try {
      const updated = await $fetch<AppUser>(`/api/users/${id}/deactivate`, { method: 'POST' })
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) users.value[index] = updated
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to deactivate user.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function activateUser(id: number) {
    loading.value = true
    error.value = null

    try {
      const updated = await $fetch<AppUser>(`/api/users/${id}/activate`, { method: 'POST' })
      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) users.value[index] = updated
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to activate user.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    getUser,
    updateUser,
    deleteUser,
    deactivateUser,
    activateUser
  }
}
