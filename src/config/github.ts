/**
 * GitHub API Configuration
 *
 * Central configuration for GitHub integration including API endpoints,
 * cache TTL values, and utility functions
 */

import type { ParsedGitHubUrl } from '@/types/github'

// GitHub API Configuration
export const GITHUB_USERNAME = 'jordiop'
export const GITHUB_API_BASE = 'https://api.github.com'
export const API_REQUEST_TIMEOUT = 10000 // 10 seconds

// Cache TTL (Time To Live) in milliseconds
export const CACHE_TTL_USER_PROFILE = 60 * 60 * 1000 // 1 hour
export const CACHE_TTL_USER_STATS = 15 * 60 * 1000 // 15 minutes
export const CACHE_TTL_REPO = 30 * 60 * 1000 // 30 minutes
export const CACHE_TTL_COMMITS = 10 * 60 * 1000 // 10 minutes

// Cache key prefixes
export const CACHE_KEY_PREFIX = 'github_cache'
export const CACHE_KEY_USER_PROFILE = `${CACHE_KEY_PREFIX}_user`
export const CACHE_KEY_USER_STATS = `${CACHE_KEY_PREFIX}_stats`
export const CACHE_KEY_REPO = `${CACHE_KEY_PREFIX}_repo`
export const CACHE_KEY_COMMITS = `${CACHE_KEY_PREFIX}_commits`

// API Endpoints
export const API_ENDPOINTS = {
  user: (username: string) => `${GITHUB_API_BASE}/users/${username}`,
  userRepos: (username: string) => `${GITHUB_API_BASE}/users/${username}/repos?per_page=100&sort=updated`,
  repo: (owner: string, repo: string) => `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
  repoCommits: (owner: string, repo: string, perPage = 8) =>
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=${perPage}`
}

// Rate limit thresholds
export const RATE_LIMIT_WARNING_THRESHOLD = 10 // Warn when remaining < 10
export const RATE_LIMIT_CRITICAL_THRESHOLD = 5 // Stop requests when remaining < 5

/**
 * Parse GitHub URL to extract owner and repo name
 * Supports various GitHub URL formats
 */
export function parseGithubUrl(url: string): ParsedGitHubUrl | null {
  if (!url) return null

  try {
    // Remove trailing slash
    url = url.replace(/\/$/, '')

    // Match various GitHub URL patterns
    const patterns = [
      // https://github.com/owner/repo
      /github\.com\/([^\/]+)\/([^\/]+)/,
      // git@github.com:owner/repo.git
      /github\.com:([^\/]+)\/(.+?)(?:\.git)?$/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace(/\.git$/, '')
        }
      }
    }

    return null
  } catch (error) {
    console.warn('Failed to parse GitHub URL:', url, error)
    return null
  }
}

/**
 * Check if rate limit headers indicate we're being rate limited
 */
export function isRateLimited(remaining: number): boolean {
  return remaining < RATE_LIMIT_CRITICAL_THRESHOLD
}

/**
 * Check if we should show a rate limit warning
 */
export function shouldWarnRateLimit(remaining: number): boolean {
  return remaining < RATE_LIMIT_WARNING_THRESHOLD && remaining >= RATE_LIMIT_CRITICAL_THRESHOLD
}

/**
 * Format rate limit reset time
 */
export function formatResetTime(resetTimestamp: number): string {
  const now = Date.now()
  const reset = resetTimestamp * 1000 // Convert to milliseconds
  const diff = reset - now

  if (diff <= 0) return 'now'

  const minutes = Math.ceil(diff / (60 * 1000))
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`

  const hours = Math.ceil(minutes / 60)
  return `${hours} hour${hours !== 1 ? 's' : ''}`
}

/**
 * Get cache key for user profile
 */
export function getUserProfileCacheKey(username: string): string {
  return `${CACHE_KEY_USER_PROFILE}_${username}`
}

/**
 * Get cache key for user stats
 */
export function getUserStatsCacheKey(username: string): string {
  return `${CACHE_KEY_USER_STATS}_${username}`
}

/**
 * Get cache key for a repository's commit list
 */
export function getCommitsCacheKey(owner: string, repo: string): string {
  return `${CACHE_KEY_COMMITS}_${owner}_${repo}`
}

/**
 * Get cache key for repository
 */
export function getRepoCacheKey(owner: string, repo: string): string {
  return `${CACHE_KEY_REPO}_${owner}_${repo}`
}
