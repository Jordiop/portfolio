/**
 * LocalStorage Caching Utility
 *
 * Provides functions to cache data in localStorage with TTL (Time To Live)
 * Automatically handles serialization, expiration, and cleanup
 */

import type { CacheEntry } from '@/types/github'
import { CACHE_KEY_PREFIX } from '@/config/github'

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * Get cached data from localStorage
 * Returns null if cache doesn't exist, is expired, or is invalid
 */
export function getCachedData<T>(key: string): T | null {
  if (!isLocalStorageAvailable()) return null

  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null

    const entry: CacheEntry<T> = JSON.parse(cached)
    const now = Date.now()

    // Check if cache is expired
    if (entry.expiresAt < now) {
      localStorage.removeItem(key)
      return null
    }

    return entry.data
  } catch (error) {
    console.warn(`Failed to get cached data for key "${key}":`, error)
    return null
  }
}

/**
 * Set cached data in localStorage with TTL
 * @param key - Cache key
 * @param data - Data to cache
 * @param ttl - Time to live in milliseconds
 */
export function setCachedData<T>(key: string, data: T, ttl: number): void {
  if (!isLocalStorageAvailable()) return

  try {
    const now = Date.now()
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl
    }

    localStorage.setItem(key, JSON.stringify(entry))
  } catch (error) {
    console.warn(`Failed to set cached data for key "${key}":`, error)

    // Try to clear some space if localStorage is full
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      clearExpiredCache()
      // Try one more time after cleanup
      try {
        const now = Date.now()
        const entry: CacheEntry<T> = {
          data,
          timestamp: now,
          expiresAt: now + ttl
        }
        localStorage.setItem(key, JSON.stringify(entry))
      } catch {
        // Silently fail if still can't save
      }
    }
  }
}

/**
 * Remove a specific cache entry
 */
export function removeCachedData(key: string): void {
  if (!isLocalStorageAvailable()) return

  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`Failed to remove cached data for key "${key}":`, error)
  }
}

/**
 * Clear all expired cache entries
 * Scans all localStorage keys with the GitHub cache prefix
 */
export function clearExpiredCache(): void {
  if (!isLocalStorageAvailable()) return

  try {
    const now = Date.now()
    const keysToRemove: string[] = []

    // Find all expired cache keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(CACHE_KEY_PREFIX)) continue

      try {
        const cached = localStorage.getItem(key)
        if (!cached) continue

        const entry: CacheEntry<unknown> = JSON.parse(cached)
        if (entry.expiresAt < now) {
          keysToRemove.push(key)
        }
      } catch {
        // If we can't parse it, remove it
        keysToRemove.push(key)
      }
    }

    // Remove expired keys
    keysToRemove.forEach(key => localStorage.removeItem(key))

    if (keysToRemove.length > 0) {
      console.log(`Cleared ${keysToRemove.length} expired cache entries`)
    }
  } catch (error) {
    console.warn('Failed to clear expired cache:', error)
  }
}

/**
 * Clear all GitHub cache entries (expired or not)
 */
export function clearAllGitHubCache(): void {
  if (!isLocalStorageAvailable()) return

  try {
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key))
    console.log(`Cleared ${keysToRemove.length} GitHub cache entries`)
  } catch (error) {
    console.warn('Failed to clear GitHub cache:', error)
  }
}

/**
 * Check if cache entry exists and is valid
 */
export function isCacheValid(key: string): boolean {
  if (!isLocalStorageAvailable()) return false

  try {
    const cached = localStorage.getItem(key)
    if (!cached) return false

    const entry: CacheEntry<unknown> = JSON.parse(cached)
    return entry.expiresAt > Date.now()
  } catch {
    return false
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  total: number
  valid: number
  expired: number
  totalSize: number
} {
  if (!isLocalStorageAvailable()) {
    return { total: 0, valid: 0, expired: 0, totalSize: 0 }
  }

  const now = Date.now()
  let total = 0
  let valid = 0
  let expired = 0
  let totalSize = 0

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(CACHE_KEY_PREFIX)) continue

    total++
    const value = localStorage.getItem(key)
    if (value) {
      totalSize += value.length

      try {
        const entry: CacheEntry<unknown> = JSON.parse(value)
        if (entry.expiresAt > now) {
          valid++
        } else {
          expired++
        }
      } catch {
        expired++
      }
    }
  }

  return { total, valid, expired, totalSize }
}

// Automatically clear expired cache on module load
if (typeof window !== 'undefined') {
  clearExpiredCache()
}
