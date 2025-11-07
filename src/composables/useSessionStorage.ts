import { ref, computed } from 'vue'
import type { Session, Statistics } from '../types'

const DB_NAME = 'emdr-bls'
const STORE_NAME = 'sessions'
const DB_VERSION = 1

let dbInstance: IDBDatabase | null = null

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

export function useSessionStorage() {
  const sessions = ref<Session[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadSessions = async () => {
    isLoading.value = true
    error.value = null
    try {
      const db = await openDB()
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      return new Promise<void>((resolve, reject) => {
        request.onsuccess = () => {
          sessions.value = request.result.sort((a, b) => b.timestamp - a.timestamp)
          resolve()
        }
        request.onerror = () => reject(request.error)
      })
    } catch (err) {
      const message = 'Failed to load sessions. Your data is safe, but we couldn\'t access it right now.'
      console.error('Failed to load sessions:', err)
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  const saveSession = async (session: Session) => {
    error.value = null
    try {
      const db = await openDB()
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      await new Promise<void>((resolve, reject) => {
        const request = store.add(session)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      await loadSessions()
    } catch (err) {
      const message = 'Failed to save session. Please try exporting your data as a backup.'
      console.error('Failed to save session:', err)
      error.value = message
      throw new Error(message)
    }
  }

  const deleteSession = async (id: string) => {
    error.value = null
    try {
      const db = await openDB()
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(id)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      await loadSessions()
    } catch (err) {
      const message = 'Failed to delete session. Please try again.'
      console.error('Failed to delete session:', err)
      error.value = message
      throw new Error(message)
    }
  }

  const clearAllSessions = async () => {
    error.value = null
    try {
      const db = await openDB()
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      await new Promise<void>((resolve, reject) => {
        const request = store.clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      sessions.value = []
    } catch (err) {
      const message = 'Failed to clear sessions. Please try again.'
      console.error('Failed to clear sessions:', err)
      error.value = message
      throw new Error(message)
    }
  }

  const statistics = computed<Statistics>(() => {
    const totalSessions = sessions.value.length
    const totalDuration = sessions.value.reduce((sum, s) => sum + s.duration, 0)

    const sessionsWithDistress = sessions.value.filter(s => s.distressReduction !== undefined)
    const averageDistressReduction = sessionsWithDistress.length > 0
      ? sessionsWithDistress.reduce((sum, s) => sum + (s.distressReduction || 0), 0) / sessionsWithDistress.length
      : 0

    const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0

    return {
      totalSessions,
      totalDuration,
      averageDistressReduction,
      averageDuration,
    }
  })

  const exportToJSON = () => {
    const dataStr = JSON.stringify(sessions.value, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `emdr-sessions-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Duration (s)', 'Pattern', 'Initial Distress', 'Final Distress', 'Distress Reduction', 'Notes']
    const rows = sessions.value.map(s => [
      new Date(s.timestamp).toISOString(),
      s.duration.toString(),
      s.settings.pattern,
      s.journal?.initialDistress?.toString() || '',
      s.journal?.currentDistress?.toString() || '',
      s.distressReduction?.toString() || '',
      (s.journal?.notes || '').replace(/"/g, '""'),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const dataBlob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `emdr-sessions-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return {
    sessions,
    isLoading,
    error,
    statistics,
    loadSessions,
    saveSession,
    deleteSession,
    clearAllSessions,
    exportToJSON,
    exportToCSV,
  }
}