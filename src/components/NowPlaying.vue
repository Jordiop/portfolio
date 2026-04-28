<script setup lang="ts">
import { useSpotifyNowPlaying } from '@/composables/useSpotifyNowPlaying'

const { track, loading, configured } = useSpotifyNowPlaying()

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}
</script>

<template>
  <div v-if="configured" class="now-playing-wrap">
    <div v-if="loading" class="np-card np-skeleton">
      <div class="skeleton-art" />
      <div class="skeleton-lines">
        <div class="skeleton-line long" />
        <div class="skeleton-line medium" />
        <div class="skeleton-line short" />
      </div>
    </div>

    <div v-else-if="track" class="np-card" :class="{ paused: !track.isPlaying }">
      <div class="np-status">
        <span class="np-dot" :class="{ active: track.isPlaying }" />
        <span class="np-status-label">{{ track.isPlaying ? 'Now Playing' : 'Paused' }}</span>
        <a
          href="https://open.spotify.com"
          target="_blank"
          rel="noopener noreferrer"
          class="np-spotify-icon"
          aria-label="Open Spotify"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </a>
      </div>

      <div class="np-body">
        <a :href="track.spotifyUrl" target="_blank" rel="noopener noreferrer" class="np-art-link">
          <div class="np-art-wrap">
            <img :src="track.albumArt" :alt="track.album" class="np-art" />
            <div class="np-vinyl-bg">
              <div class="vinyl np-vinyl" :class="{ spinning: track.isPlaying }" />
            </div>
          </div>
        </a>

        <div class="np-info">
          <a :href="track.spotifyUrl" target="_blank" rel="noopener noreferrer" class="np-title">
            {{ track.title }}
          </a>
          <span class="np-artist">{{ track.artist }}</span>
          <span class="np-album">{{ track.album }}</span>

          <div class="np-progress-wrap">
            <div class="np-bar">
              <div class="np-fill" :style="{ width: track.progress + '%' }" />
            </div>
            <div class="np-times">
              <span>{{ formatMs(track.progressMs) }}</span>
              <span>{{ formatMs(track.durationMs) }}</span>
            </div>
          </div>
        </div>

        <div class="np-eq eq-bars" :class="{ active: track.isPlaying }">
          <span v-for="n in 4" :key="n" />
        </div>
      </div>
    </div>

    <div v-else class="np-card np-empty">
      <span class="np-dot" />
      <span class="np-status-label muted">Not listening to anything right now</span>
      <a
        href="https://open.spotify.com"
        target="_blank"
        rel="noopener noreferrer"
        class="np-spotify-icon"
        aria-label="Open Spotify"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      </a>
    </div>
  </div>
</template>

<style scoped>
.now-playing-wrap {
  width: 100%;
}

/* ── Base card ── */
.np-card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1rem 1.25rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-left: 3px solid #1db954;
  border-radius: 12px;
  position: relative;
}

.np-card.paused {
  border-left-color: var(--accent-color);
}

.np-card.np-empty {
  flex-direction: row;
  align-items: center;
  gap: 0.6rem;
  border-left-color: var(--border-color);
}

/* ── Status row ── */
.np-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.np-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted, var(--text-secondary));
  flex-shrink: 0;
}

.np-dot.active {
  background: #1db954;
  box-shadow: 0 0 6px #1db95480;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 6px #1db95480; }
  50%       { box-shadow: 0 0 12px #1db954cc; }
}

.np-status-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #1db954;
}

.np-card.paused .np-status-label {
  color: var(--text-secondary);
}

.np-status-label.muted {
  color: var(--text-secondary);
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
  font-size: 0.825rem;
}

.np-spotify-icon {
  margin-left: auto;
  color: #1db954;
  opacity: 0.7;
  display: flex;
  transition: opacity 0.2s ease;
}

.np-spotify-icon:hover {
  opacity: 1;
}

/* ── Body ── */
.np-body {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* ── Album art + mini vinyl ── */
.np-art-link {
  flex-shrink: 0;
  display: block;
  text-decoration: none;
}

.np-art-wrap {
  position: relative;
  width: 72px;
  height: 52px;
}

.np-art {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: 6px;
  z-index: 1;
  box-shadow: 3px 0 12px rgba(0,0,0,0.5);
  transition: transform 0.2s ease;
}

.np-art-link:hover .np-art {
  transform: translateY(-50%) scale(1.04);
}

.np-vinyl-bg {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 46px;
  height: 46px;
  z-index: 0;
}

.np-vinyl {
  width: 100%;
  height: 100%;
}

/* ── Track info ── */
.np-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.np-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.np-title:hover {
  color: #1db954;
}

.np-artist {
  font-size: 0.78rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.np-album {
  font-size: 0.7rem;
  color: var(--accent-color);
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
}

/* ── Progress bar ── */
.np-progress-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.np-bar {
  width: 100%;
  height: 3px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.np-fill {
  height: 100%;
  background: #1db954;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.np-card.paused .np-fill {
  background: var(--accent-color);
}

.np-times {
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  color: var(--text-secondary);
  opacity: 0.7;
}

/* ── EQ bars (reuse pattern from Music.vue) ── */
.np-eq {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
  flex-shrink: 0;
  padding-left: 0.25rem;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.np-eq.active {
  opacity: 1;
}

.np-eq span {
  display: block;
  width: 3px;
  border-radius: 2px 2px 0 0;
  background: #1db954;
  height: 3px;
  animation: eq-bounce 0.6s ease-in-out infinite alternate;
}

.np-eq span:nth-child(1) { animation-duration: 0.50s; animation-delay: 0.00s; }
.np-eq span:nth-child(2) { animation-duration: 0.70s; animation-delay: 0.10s; }
.np-eq span:nth-child(3) { animation-duration: 0.40s; animation-delay: 0.20s; }
.np-eq span:nth-child(4) { animation-duration: 0.65s; animation-delay: 0.05s; }

@keyframes eq-bounce {
  from { height: 3px; }
  to   { height: 14px; }
}

/* ── Skeleton ── */
.np-skeleton {
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  border-left-color: var(--border-color);
}

.skeleton-art {
  width: 52px;
  height: 52px;
  border-radius: 6px;
  background: var(--border-color);
  flex-shrink: 0;
  animation: shimmer 1.4s ease-in-out infinite;
}

.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-line {
  height: 10px;
  border-radius: 5px;
  background: var(--border-color);
  animation: shimmer 1.4s ease-in-out infinite;
}

.skeleton-line.long   { width: 75%; }
.skeleton-line.medium { width: 50%; animation-delay: 0.1s; }
.skeleton-line.short  { width: 35%; animation-delay: 0.2s; }

@keyframes shimmer {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .np-art-wrap {
    width: 58px;
    height: 42px;
  }

  .np-art {
    width: 42px;
    height: 42px;
  }

  .np-vinyl-bg {
    width: 36px;
    height: 36px;
  }

  .np-times {
    display: none;
  }
}
</style>
