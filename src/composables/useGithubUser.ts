/**
 * useGithubUser Composable
 *
 * Manages GitHub user profile and statistics with caching
 * Used primarily on the About page to display user stats
 */

import { ref, computed, type Ref } from "vue";
import type { GitHubUser, GitHubStats, RateLimitInfo } from "@/types/github";
import {
  fetchUserProfile,
  fetchUserRepos,
  calculateTotalStars,
  calculateTotalForks,
  getOriginalRepos,
} from "@/services/githubApi";
import { getCachedData, setCachedData } from "@/utils/cache";
import {
  CACHE_TTL_USER_PROFILE,
  CACHE_TTL_USER_STATS,
  getUserProfileCacheKey,
  getUserStatsCacheKey,
  isRateLimited,
  shouldWarnRateLimit,
  formatResetTime,
} from "@/config/github";

export function useGithubUser() {
  const userProfile = ref<GitHubUser | null>(null);
  const userStats = ref<GitHubStats | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const rateLimit = ref<RateLimitInfo | null>(null);
  const isRateLimitedState = computed(() => {
    if (!rateLimit.value) return false;
    return isRateLimited(rateLimit.value.remaining);
  });

  const shouldShowRateLimitWarning = computed(() => {
    if (!rateLimit.value) return false;
    return shouldWarnRateLimit(rateLimit.value.remaining);
  });

  const rateLimitResetTime = computed(() => {
    if (!rateLimit.value) return null;
    return formatResetTime(rateLimit.value.reset);
  });

  /**
   * Fetch user profile with caching
   */
  async function loadUserProfile(username: string): Promise<void> {
    const cacheKey = getUserProfileCacheKey(username);

    const cached = getCachedData<GitHubUser>(cacheKey);
    if (cached) {
      userProfile.value = cached;
      return;
    }

    if (isRateLimitedState.value) {
      error.value = `Rate limited. Please try again in ${rateLimitResetTime.value}.`;
      return;
    }

    try {
      const response = await fetchUserProfile(username);
      userProfile.value = response.data;

      if (response.rateLimit) {
        rateLimit.value = response.rateLimit;
      }

      setCachedData(cacheKey, response.data, CACHE_TTL_USER_PROFILE);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load user profile";
      error.value = message;
      throw err;
    }
  }

  /**
   * Fetch user statistics (repos, stars, etc) with caching
   */
  async function loadUserStats(username: string): Promise<void> {
    const cacheKey = getUserStatsCacheKey(username);

    const cached = getCachedData<GitHubStats>(cacheKey);
    if (cached) {
      userStats.value = cached;
      return;
    }

    if (isRateLimitedState.value) {
      error.value = `Rate limited. Please try again in ${rateLimitResetTime.value}.`;
      return;
    }

    try {
      const response = await fetchUserRepos(username);
      const repos = response.data;
      const originalRepos = getOriginalRepos(repos);

      const stats: GitHubStats = {
        totalRepos: originalRepos.length,
        totalStars: calculateTotalStars(originalRepos),
        totalForks: calculateTotalForks(originalRepos),
        followers: userProfile.value?.followers || 0,
        following: userProfile.value?.following || 0,
      };

      userStats.value = stats;

      if (response.rateLimit) {
        rateLimit.value = response.rateLimit;
      }

      setCachedData(cacheKey, stats, CACHE_TTL_USER_STATS);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load user stats";
      error.value = message;
      throw err;
    }
  }

  /**
   * Fetch both profile and stats together
   */
  async function fetchUserData(username: string): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      await loadUserProfile(username);
      await loadUserStats(username);
    } catch (err) {
      console.error("Failed to fetch GitHub user data:", err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Clear cached data and refetch
   */
  async function refreshUserData(username: string): Promise<void> {
    userProfile.value = null;
    userStats.value = null;
    await fetchUserData(username);
  }

  return {
    userProfile,
    userStats,
    isLoading,
    error,
    rateLimit,
    isRateLimitedState,
    shouldShowRateLimitWarning,
    rateLimitResetTime,
    fetchUserData,
    refreshUserData,
  };
}
