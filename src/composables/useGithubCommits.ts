/**
 * useGithubCommits Composable
 *
 * Loads the latest commits for a repository, cached like the rest of the
 * GitHub layer. Powers the Source Control panel in the side bar.
 */

import { ref } from 'vue'
import type { GitHubCommit } from '@/types/github'
import { fetchRepoCommits } from '@/services/githubApi'
import { getCachedData, setCachedData } from '@/utils/cache'
import { CACHE_TTL_COMMITS, getCommitsCacheKey } from '@/config/github'

export interface CommitEntry {
  sha: string
  shortSha: string
  /** First line of the commit message */
  subject: string
  author: string
  url: string
  relativeDate: string
}

/** "3 hours ago" — good enough for a commit list, no dependency needed. */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`

  const days = Math.round(hours / 24)
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`

  const months = Math.round(days / 30)
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`

  const years = Math.round(months / 12)
  return `${years} year${years !== 1 ? 's' : ''} ago`
}

function toEntry(commit: GitHubCommit): CommitEntry {
  return {
    sha: commit.sha,
    shortSha: commit.sha.slice(0, 7),
    subject: commit.commit.message.split('\n')[0],
    author: commit.author?.login ?? commit.commit.author.name,
    url: commit.html_url,
    relativeDate: relativeTime(commit.commit.author.date),
  }
}

export function useGithubCommits() {
  const commits = ref<CommitEntry[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function loadCommits(owner: string, repo: string, perPage = 8): Promise<void> {
    const cacheKey = getCommitsCacheKey(owner, repo)

    // Cache the raw payload, not the mapped entries — relative dates must be
    // recomputed on every read or they'd freeze at "just now".
    const cached = getCachedData<GitHubCommit[]>(cacheKey)
    if (cached) {
      commits.value = cached.map(toEntry)
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetchRepoCommits(owner, repo, perPage)
      commits.value = response.data.map(toEntry)
      setCachedData(cacheKey, response.data, CACHE_TTL_COMMITS)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load commits'
    } finally {
      isLoading.value = false
    }
  }

  return { commits, isLoading, error, loadCommits }
}
