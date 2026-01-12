/**
 * useGithubRepo Composable
 *
 * Manages fetching and caching of individual repository data
 * Used on Projects page to display repo statistics for each project
 */

import { ref, type Ref } from "vue";
import type { GitHubRepo, RepoStats } from "@/types/github";
import { fetchRepo, fetchMultipleRepos } from "@/services/githubApi";
import { getCachedData, setCachedData } from "@/utils/cache";
import {
  CACHE_TTL_REPO,
  getRepoCacheKey,
  parseGithubUrl,
} from "@/config/github";

export function useGithubRepo() {
  const repoData = ref(new Map<string, GitHubRepo>()) as Ref<
    Map<string, GitHubRepo>
  >;
  const loadingRepos = ref(new Set<string>()) as Ref<Set<string>>;
  const errors = ref(new Map<string, string>()) as Ref<Map<string, string>>;

  /**
   * Get identifier for a repo
   */
  function getRepoIdentifier(owner: string, repo: string): string {
    return `${owner}/${repo}`;
  }

  /**
   * Check if repo is currently loading
   */
  function isRepoLoading(owner: string, repo: string): boolean {
    const identifier = getRepoIdentifier(owner, repo);
    return loadingRepos.value.has(identifier);
  }

  /**
   * Get repo data from state
   */
  function getRepo(owner: string, repo: string): GitHubRepo | null {
    const identifier = getRepoIdentifier(owner, repo);
    return repoData.value.get(identifier) || null;
  }

  /**
   * Get simplified repo stats
   */
  function getRepoStats(owner: string, repo: string): RepoStats | null {
    const repoDataItem = getRepo(owner, repo);
    if (!repoDataItem) return null;

    return {
      stars: repoDataItem.stargazers_count,
      forks: repoDataItem.forks_count,
      language: repoDataItem.language,
      updatedAt: repoDataItem.updated_at,
    };
  }

  /**
   * Fetch a single repository with caching
   */
  async function fetchRepoData(owner: string, repo: string): Promise<void> {
    const identifier = getRepoIdentifier(owner, repo);
    const cacheKey = getRepoCacheKey(owner, repo);

    if (loadingRepos.value.has(identifier)) return;

    const cached = getCachedData<GitHubRepo>(cacheKey);
    if (cached) {
      repoData.value.set(identifier, cached);
      return;
    }

    loadingRepos.value.add(identifier);
    errors.value.delete(identifier);

    try {
      const response = await fetchRepo(owner, repo);
      repoData.value.set(identifier, response.data);
      setCachedData(cacheKey, response.data, CACHE_TTL_REPO);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load repository";
      errors.value.set(identifier, message);
      console.warn(`Failed to fetch repo ${identifier}:`, err);
    } finally {
      loadingRepos.value.delete(identifier);
    }
  }

  /**
   * Fetch repository from GitHub URL
   */
  async function fetchRepoFromUrl(githubUrl: string): Promise<void> {
    const parsed = parseGithubUrl(githubUrl);
    if (!parsed) {
      console.warn("Invalid GitHub URL:", githubUrl);
      return;
    }

    await fetchRepoData(parsed.owner, parsed.repo);
  }

  /**
   * Fetch multiple repositories in parallel
   * Useful for Projects page with multiple project cards
   */
  async function fetchMultipleRepoData(
    repos: Array<{ owner: string; repo: string }>,
  ): Promise<void> {
    // Filter out already loading or loaded repos
    const reposToFetch = repos.filter(({ owner, repo }) => {
      const identifier = getRepoIdentifier(owner, repo);
      const cacheKey = getRepoCacheKey(owner, repo);

      // Skip if loading
      if (loadingRepos.value.has(identifier)) return false;

      // Skip if in state
      if (repoData.value.has(identifier)) return false;

      // Skip if cached
      const cached = getCachedData<GitHubRepo>(cacheKey);
      if (cached) {
        repoData.value.set(identifier, cached);
        return false;
      }

      return true;
    });

    if (reposToFetch.length === 0) return;

    reposToFetch.forEach(({ owner, repo }) => {
      const identifier = getRepoIdentifier(owner, repo);
      loadingRepos.value.add(identifier);
      errors.value.delete(identifier);
    });

    try {
      const results = await fetchMultipleRepos(reposToFetch);

      results.forEach(({ data, error, identifier }) => {
        loadingRepos.value.delete(identifier);

        if (data) {
          repoData.value.set(identifier, data);
          // Cache the result
          const [owner, repo] = identifier.split("/");
          const cacheKey = getRepoCacheKey(owner, repo);
          setCachedData(cacheKey, data, CACHE_TTL_REPO);
        } else if (error) {
          errors.value.set(identifier, error);
          console.warn(`Failed to fetch repo ${identifier}:`, error);
        }
      });
    } catch (err) {
      reposToFetch.forEach(({ owner, repo }) => {
        const identifier = getRepoIdentifier(owner, repo);
        loadingRepos.value.delete(identifier);
      });
      console.error("Failed to fetch multiple repos:", err);
    }
  }

  /**
   * Fetch multiple repositories from GitHub URLs
   */
  async function fetchMultipleReposFromUrls(
    githubUrls: string[],
  ): Promise<void> {
    const parsed = githubUrls
      .map((url) => parseGithubUrl(url))
      .filter((p): p is { owner: string; repo: string } => p !== null);

    if (parsed.length === 0) return;

    await fetchMultipleRepoData(parsed);
  }

  /**
   * Clear all cached repo data
   */
  function clearRepoCache(): void {
    repoData.value.clear();
    loadingRepos.value.clear();
    errors.value.clear();
  }

  return {
    repoData,
    loadingRepos,
    errors,
    fetchRepoData,
    fetchRepoFromUrl,
    fetchMultipleRepoData,
    fetchMultipleReposFromUrls,
    isRepoLoading,
    getRepo,
    getRepoStats,
    clearRepoCache,
  };
}
