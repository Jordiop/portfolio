<script setup lang="ts">
/**
 * Source Control panel — shows the real commit history of this portfolio,
 * pulled from the GitHub API and cached for 10 minutes.
 */
import { onMounted } from 'vue'
import { useGithubCommits } from '@/composables/useGithubCommits'
import { GITHUB_USERNAME } from '@/config/github'

const REPO = 'tab-portfolio'

const { commits, isLoading, error, loadCommits } = useGithubCommits()

onMounted(() => loadCommits(GITHUB_USERNAME, REPO))
</script>

<template>
  <div class="panel">
    <div class="panel-section-title">
      <span>SOURCE CONTROL</span>
      <a
        class="panel-link"
        :href="`https://github.com/${GITHUB_USERNAME}/${REPO}`"
        target="_blank"
        rel="noopener"
        title="Open repository on GitHub"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/></svg>
      </a>
    </div>

    <div class="repo-row">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="9" r="2.5"/><path d="M6 8.5v7M18 11.5c0 4-6 1.5-6 6"/></svg>
      <span class="repo-name">{{ GITHUB_USERNAME }}/{{ REPO }}</span>
      <span class="branch">main</span>
    </div>

    <p v-if="isLoading" class="panel-note">Loading commits…</p>
    <p v-else-if="error" class="panel-note error">{{ error }}</p>

    <ul v-else class="commit-list">
      <li v-for="commit in commits" :key="commit.sha">
        <a class="commit" :href="commit.url" target="_blank" rel="noopener">
          <span class="commit-subject">{{ commit.subject }}</span>
          <span class="commit-meta">
            <code>{{ commit.shortSha }}</code>
            <span>{{ commit.author }}</span>
            <span>·</span>
            <span>{{ commit.relativeDate }}</span>
          </span>
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.repo-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px 10px;
  font-size: 12px;
  color: var(--explorer-fg);
}

.repo-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.branch {
  margin-left: auto;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 9px;
  background: var(--list-hover-bg);
  color: var(--text-secondary);
}

.commit-list {
  list-style: none;
  margin: 0;
  padding: 0 0 12px;
  overflow-y: auto;
}

.commit {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 12px;
  text-decoration: none;
  color: var(--explorer-fg);
  border-left: 2px solid transparent;
}

.commit:hover {
  background: var(--list-hover-bg);
  border-left-color: var(--focus-blue);
}

.commit-subject {
  font-size: 12.5px;
  line-height: 1.35;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.commit-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--text-secondary);
}

.commit-meta code {
  font-family: var(--font-mono);
  color: var(--accent-color);
}
</style>
