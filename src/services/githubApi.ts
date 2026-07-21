/**
 * GitHub API Service
 *
 * Low-level service for making requests to GitHub REST API
 * Handles rate limiting, errors, and response parsing
 */

import type {
  GitHubUser,
  GitHubRepo,
  GitHubCommit,
  GitHubAPIResponse,
  RateLimitInfo,
  GitHubError
} from '@/types/github'
import { API_ENDPOINTS, API_REQUEST_TIMEOUT } from '@/config/github'

/**
 * Parse rate limit information from response headers
 */
function parseRateLimitHeaders(headers: Headers): RateLimitInfo | undefined {
  const limit = headers.get('x-ratelimit-limit')
  const remaining = headers.get('x-ratelimit-remaining')
  const reset = headers.get('x-ratelimit-reset')
  const used = headers.get('x-ratelimit-used')

  if (!limit || !remaining || !reset) return undefined

  return {
    limit: parseInt(limit, 10),
    remaining: parseInt(remaining, 10),
    reset: parseInt(reset, 10),
    used: parseInt(used || '0', 10)
  }
}

/**
 * Make a request to GitHub API with timeout and error handling
 */
async function fetchWithTimeout<T>(
  url: string,
  timeout: number = API_REQUEST_TIMEOUT
): Promise<GitHubAPIResponse<T>> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json'
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    const rateLimit = parseRateLimitHeaders(response.headers)

    if (!response.ok) {
      const error: GitHubError = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status
      }))

      throw new Error(error.message || `HTTP ${response.status}`)
    }

    const data: T = await response.json()

    return {
      data,
      rateLimit
    }
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - GitHub API is not responding')
      }
      throw error
    }

    throw new Error('Failed to fetch from GitHub API')
  }
}

/**
 * Fetch user profile from GitHub
 */
export async function fetchUserProfile(
  username: string
): Promise<GitHubAPIResponse<GitHubUser>> {
  const url = API_ENDPOINTS.user(username)
  return fetchWithTimeout<GitHubUser>(url)
}

/**
 * Fetch user's public repositories
 */
export async function fetchUserRepos(
  username: string
): Promise<GitHubAPIResponse<GitHubRepo[]>> {
  const url = API_ENDPOINTS.userRepos(username)
  return fetchWithTimeout<GitHubRepo[]>(url)
}

/**
 * Fetch specific repository details
 */
export async function fetchRepo(
  owner: string,
  repo: string
): Promise<GitHubAPIResponse<GitHubRepo>> {
  const url = API_ENDPOINTS.repo(owner, repo)
  return fetchWithTimeout<GitHubRepo>(url)
}

/**
 * Fetch the most recent commits for a repository
 */
export async function fetchRepoCommits(
  owner: string,
  repo: string,
  perPage = 8
): Promise<GitHubAPIResponse<GitHubCommit[]>> {
  const url = API_ENDPOINTS.repoCommits(owner, repo, perPage)
  return fetchWithTimeout<GitHubCommit[]>(url)
}

/**
 * Fetch multiple repositories in parallel
 * Returns an array of results with successful and failed fetches
 */
export async function fetchMultipleRepos(
  repos: Array<{ owner: string; repo: string }>
): Promise<Array<{ data: GitHubRepo | null; error: string | null; identifier: string }>> {
  const promises = repos.map(async ({ owner, repo }) => {
    const identifier = `${owner}/${repo}`
    try {
      const response = await fetchRepo(owner, repo)
      return {
        data: response.data,
        error: null,
        identifier
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        identifier
      }
    }
  })

  return Promise.allSettled(promises).then(results =>
    results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value
      }
      return {
        data: null,
        error: 'Request failed',
        identifier: 'unknown'
      }
    })
  )
}

/**
 * Calculate total stars across all repositories
 */
export function calculateTotalStars(repos: GitHubRepo[]): number {
  return repos.reduce((total, repo) => {
    // Don't count stars from forked repos
    if (repo.fork) return total
    return total + repo.stargazers_count
  }, 0)
}

/**
 * Calculate total forks across all repositories
 */
export function calculateTotalForks(repos: GitHubRepo[]): number {
  return repos.reduce((total, repo) => {
    if (repo.fork) return total
    return total + repo.forks_count
  }, 0)
}

/**
 * Get only non-forked repositories
 */
export function getOriginalRepos(repos: GitHubRepo[]): GitHubRepo[] {
  return repos.filter(repo => !repo.fork)
}

/**
 * Sort repositories by stars (descending)
 */
export function sortReposByStars(repos: GitHubRepo[]): GitHubRepo[] {
  return [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count)
}

/**
 * Sort repositories by last update (most recent first)
 */
export function sortReposByUpdate(repos: GitHubRepo[]): GitHubRepo[] {
  return [...repos].sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })
}
