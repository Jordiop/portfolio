/**
 * GitHub API Type Definitions
 *
 * TypeScript interfaces for GitHub API responses and application data structures
 */

// GitHub User Profile
export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  name: string | null
  company: string | null
  blog: string
  location: string | null
  email: string | null
  bio: string | null
  twitter_username: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
}

// GitHub Repository
export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  stargazers_count: number
  watchers_count: number
  forks_count: number
  open_issues_count: number
  language: string | null
  topics: string[]
  created_at: string
  updated_at: string
  pushed_at: string
  size: number
  default_branch: string
  private: boolean
  fork: boolean
  archived: boolean
}

// Aggregated User Statistics
export interface GitHubStats {
  totalRepos: number
  totalStars: number
  totalForks: number
  followers: number
  following: number
}

// Rate Limit Information
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number // Unix timestamp
  used: number
}

// API Response wrapper with rate limit info
export interface GitHubAPIResponse<T> {
  data: T
  rateLimit?: RateLimitInfo
}

// Cache Entry with TTL
export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

// Error Response
export interface GitHubError {
  message: string
  documentation_url?: string
  status?: number
}

// Parsed GitHub URL
export interface ParsedGitHubUrl {
  owner: string
  repo: string
}

// Fetch State for UI
export type FetchState = 'idle' | 'loading' | 'success' | 'error'

// Simplified repo data for badges
export interface RepoStats {
  stars: number
  forks: number
  language: string | null
  updatedAt: string
}
