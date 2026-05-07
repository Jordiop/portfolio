<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useSeoMeta } from '@unhead/vue'
import { createLines } from '@/composables/createLines'
import { useMusic, type Album } from '@/composables/useMusic'
import { useSiteMeta } from '@/composables/useSiteMeta'
import NowPlaying from '@/components/NowPlaying.vue'

interface Props {
  isCodeEditorVisible?: boolean
}
const props = withDefaults(defineProps<Props>(), { isCodeEditorVisible: true })

useSeoMeta(
  useSiteMeta({
    title: 'Music',
    description: 'Albums on rotation and what I am listening to right now via Spotify.',
    path: '/music',
  }),
)

const { albums } = useMusic()

interface CardState {
  rotateX: number
  rotateY: number
  glareX: number
  glareY: number
  isHovered: boolean
}

const cardStates = reactive<Record<number, CardState>>(
  Object.fromEntries(
    albums.map(a => [a.id, { rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, isHovered: false }])
  )
)

const selectedAlbum = ref<Album | null>(null)

function onMouseMove(event: MouseEvent, albumId: number) {
  const card = event.currentTarget as HTMLElement
  const rect = card.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  cardStates[albumId].rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -12
  cardStates[albumId].rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 12
  cardStates[albumId].glareX = (x / rect.width) * 100
  cardStates[albumId].glareY = (y / rect.height) * 100
  cardStates[albumId].isHovered = true
}

function onMouseLeave(albumId: number) {
  cardStates[albumId].rotateX = 0
  cardStates[albumId].rotateY = 0
  cardStates[albumId].glareX = 50
  cardStates[albumId].glareY = 50
  cardStates[albumId].isHovered = false
}

function getCardStyle(albumId: number) {
  const s = cardStates[albumId]
  return {
    transform: `perspective(800px) rotateX(${s.rotateX}deg) rotateY(${s.rotateY}deg) scale(${s.isHovered ? 1.05 : 1})`,
    transition: s.isHovered
      ? 'transform 0.05s linear'
      : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  }
}

function getGlareStyle(albumId: number) {
  const s = cardStates[albumId]
  return {
    background: `radial-gradient(circle at ${s.glareX}% ${s.glareY}%, rgba(255,255,255,0.22) 0%, transparent 65%)`,
    opacity: s.isHovered ? 1 : 0,
    transition: s.isHovered ? 'opacity 0.05s linear' : 'opacity 0.6s ease',
  }
}

function selectAlbum(album: Album) {
  selectedAlbum.value = selectedAlbum.value?.id === album.id ? null : album
}

const codeLines = createLines([
  { content: '<template>', class: 'keyword' },
  { content: '  <div class="music-view">', class: 'punctuation' },
  { content: '    <!-- vinyl record reveal on hover -->', class: 'keyword' },
  { content: '    <div class="album-grid">', class: 'punctuation' },
  { content: '      <div v-for="album in albums" :key="album.id"', class: '' },
  { content: '        @mousemove="onMouseMove($event, album.id)"', class: 'string' },
  { content: '        @mouseleave="onMouseLeave(album.id)"', class: 'string' },
  { content: '        @click="selectAlbum(album)"', class: 'string' },
  { content: '        :style="getCardStyle(album.id)">', class: 'string' },
  '',
  { content: '        <div class="album-glow"', class: '' },
  { content: "          :style=\"{ '--glow': album.color }\" />", class: 'string' },
  '',
  { content: '        <div class="album-scene">', class: 'punctuation' },
  { content: '          <div class="vinyl-wrapper"', class: '' },
  { content: "            :class=\"{ 'vinyl-out': isHovered }\"", class: 'string' },
  { content: "            :style=\"{ '--label': album.color }\">", class: 'string' },
  { content: '            <div class="vinyl" />', class: '' },
  { content: '          </div>', class: 'punctuation' },
  { content: '          <div class="album-cover-wrap">', class: 'punctuation' },
  { content: '            <img :src="album.coverUrl" />', class: '' },
  { content: '            <div class="glare" />', class: '' },
  { content: '          </div>', class: 'punctuation' },
  { content: '        </div>', class: 'punctuation' },
  '',
  { content: '        <div class="album-info">', class: 'punctuation' },
  { content: '          <span>{{ album.title }}</span>', class: '' },
  { content: '          <span>{{ album.artist }}</span>', class: 'string' },
  { content: '          <div class="eq-bars">', class: 'punctuation' },
  { content: '            <span v-for="n in 4" :key="n" />', class: '' },
  { content: '          </div>', class: 'punctuation' },
  { content: '        </div>', class: 'punctuation' },
  { content: '      </div>', class: 'punctuation' },
  { content: '    </div>', class: 'punctuation' },
  { content: '  </div>', class: 'punctuation' },
  { content: '</template>', class: 'keyword' },
])
</script>

<template>
  <div v-if="props.isCodeEditorVisible" class="code-editor hidden md:block overflow-hidden md:overflow-auto">
    <div class="code-content">
      <div class="code-line" v-for="line in codeLines" :key="line.num">
        <div class="line-numbers">{{ line.num }}</div>
        <div class="code-text" :class="line.class">{{ line.content }}</div>
      </div>
    </div>
  </div>

  <div class="preview" :class="{ 'full-width': !props.isCodeEditorVisible }">
    <div class="music-view">
      <div class="music-header">
        <h2>Favourite Albums</h2>
        <p class="music-subtitle">Records that live rent-free in my head</p>
      </div>

      <NowPlaying />

      <div class="album-grid">
        <div
          v-for="album in albums"
          :key="album.id"
          class="album-card"
          :class="{ selected: selectedAlbum?.id === album.id }"
          @mousemove="onMouseMove($event, album.id)"
          @mouseleave="onMouseLeave(album.id)"
          @click="selectAlbum(album)"
          :style="getCardStyle(album.id)"
        >
          <div
            class="album-glow"
            :style="{
              '--glow': album.color,
              opacity: cardStates[album.id].isHovered || selectedAlbum?.id === album.id ? 1 : 0,
            }"
          />

          <div class="album-scene">
            <div
              class="vinyl-wrapper"
              :class="{ 'vinyl-out': cardStates[album.id].isHovered }"
              :style="{ '--label': album.color }"
            >
              <div class="vinyl" :class="{ spinning: cardStates[album.id].isHovered }" />
            </div>

            <div class="album-cover-wrap">
              <img :src="album.coverUrl" :alt="album.title" class="album-cover" />
              <div class="glare" :style="getGlareStyle(album.id)" />
            </div>
          </div>

          <div class="album-info" :style="{ '--accent': album.color }">
            <div class="info-main">
              <span class="album-title">{{ album.title }}</span>
              <span class="album-artist">{{ album.artist }}</span>
              <span class="album-meta">{{ album.year }} · {{ album.genre }}</span>
            </div>
            <div class="eq-bars" :class="{ active: cardStates[album.id].isHovered }">
              <span v-for="n in 4" :key="n" />
            </div>
          </div>
        </div>
      </div>

      <Transition name="slide-up">
        <div
          v-if="selectedAlbum"
          class="album-detail"
          :style="{ '--accent': selectedAlbum.color }"
        >
          <div class="detail-cover-wrap">
            <div class="detail-vinyl-bg">
              <div class="vinyl spinning" :style="{ '--label': selectedAlbum.color }" />
            </div>
            <img :src="selectedAlbum.coverUrl" :alt="selectedAlbum.title" class="detail-cover" />
          </div>

          <div class="detail-info">
            <h3 class="detail-title">{{ selectedAlbum.title }}</h3>
            <p class="detail-artist">{{ selectedAlbum.artist }}</p>
            <p class="detail-meta">{{ selectedAlbum.year }} · {{ selectedAlbum.genre }}</p>
            <div class="detail-actions">
              <a
                v-if="selectedAlbum.spotifyUrl"
                :href="selectedAlbum.spotifyUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="listen-btn spotify"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Spotify
              </a>
              <a
                v-if="selectedAlbum.appleMusicUrl"
                :href="selectedAlbum.appleMusicUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="listen-btn apple"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple Music
              </a>
            </div>
          </div>

          <button class="detail-close" @click.stop="selectedAlbum = null" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.music-view {
  min-height: 100%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: fadeInUp 0.6s ease;
}

.music-header {
  margin-bottom: 0.5rem;
}

.music-header h2 {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 700;
  color: var(--accent-color);
  margin: 0 0 0.5rem;
}

.music-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

/* ── Grid ── */
.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 2rem 1.75rem;
}

/* ── Card ── */
.album-card {
  position: relative;
  cursor: pointer;
  will-change: transform;
  border-radius: 12px;
}

/* ── Glow halo (behind card) ── */
.album-glow {
  position: absolute;
  inset: -2px;
  border-radius: 14px;
  z-index: 0;
  pointer-events: none;
  box-shadow: 0 0 30px 6px var(--glow, transparent);
  transition: opacity 0.4s ease;
}

/* ── Scene: vinyl + cover ── */
.album-scene {
  position: relative;
  aspect-ratio: 1;
  border-radius: 10px 10px 0 0;
  z-index: 1;
}

.vinyl-wrapper {
  position: absolute;
  inset: 4%;
  z-index: 0;
  transform: translateX(0);
  transition: transform 0.55s cubic-bezier(0.23, 1, 0.32, 1);
}

.vinyl-wrapper.vinyl-out {
  transform: translateX(54%);
}

/* ── Vinyl disc (CSS drawn) ── */
.vinyl {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  background: radial-gradient(circle at center,
    var(--label, #8b1a1a) 0% 14%,
    #0a0a0a 14% 15.5%,
    #1e1e1e 15.5% 22%,
    #111    22%  23.5%,
    #1e1e1e 23.5% 30%,
    #111    30%  31.5%,
    #1e1e1e 31.5% 38%,
    #111    38%  39.5%,
    #1e1e1e 39.5% 46%,
    #111    46%  47.5%,
    #1e1e1e 47.5% 54%,
    #111    54%  55.5%,
    #1e1e1e 55.5% 62%,
    #111    62%  63.5%,
    #1e1e1e 63.5% 70%,
    #111    70%  71.5%,
    #1e1e1e 71.5% 78%,
    #111    78%  79.5%,
    #1e1e1e 79.5% 86%,
    #111    86%  87.5%,
    #1e1e1e 87.5% 100%
  );
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.7);
}

.vinyl::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6.5%;
  height: 6.5%;
  background: #060606;
  border-radius: 50%;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.vinyl.spinning {
  animation: spin 3s linear infinite;
}

/* ── Cover ── */
.album-cover-wrap {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: 10px 10px 0 0;
  overflow: hidden;
}

.album-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.glare {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  border-radius: inherit;
}

/* ── Info bar ── */
.album-info {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 0.85rem 0.8rem;
  background: var(--bg-secondary);
  border-top: 2px solid var(--accent, #9075c9);
  border-radius: 0 0 12px 12px;
  transition: background 0.3s ease;
}

.album-card.selected .album-info {
  background: var(--bg-primary);
}

.info-main {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.album-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-artist {
  font-size: 0.78rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-meta {
  font-size: 0.7rem;
  color: var(--accent, #9075c9);
  opacity: 0.85;
  margin-top: 0.05rem;
}

/* ── EQ bars ── */
.eq-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
  flex-shrink: 0;
  padding-left: 0.5rem;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.eq-bars.active {
  opacity: 1;
}

.eq-bars span {
  display: block;
  width: 3px;
  border-radius: 2px 2px 0 0;
  background: var(--accent, #9075c9);
  height: 3px;
  animation: eq-bounce 0.6s ease-in-out infinite alternate;
}

.eq-bars span:nth-child(1) { animation-duration: 0.50s; animation-delay: 0.00s; }
.eq-bars span:nth-child(2) { animation-duration: 0.70s; animation-delay: 0.10s; }
.eq-bars span:nth-child(3) { animation-duration: 0.40s; animation-delay: 0.20s; }
.eq-bars span:nth-child(4) { animation-duration: 0.65s; animation-delay: 0.05s; }

@keyframes eq-bounce {
  from { height: 3px; }
  to   { height: 14px; }
}

/* ── Detail panel ── */
.album-detail {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem 1.25rem 1.25rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-left: 3px solid var(--accent, #9075c9);
  border-radius: 12px;
  position: relative;
}

.detail-cover-wrap {
  position: relative;
  flex-shrink: 0;
  width: 110px;
  height: 80px;
}

.detail-vinyl-bg {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 72px;
  height: 72px;
  z-index: 0;
}

.detail-cover {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  z-index: 1;
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.5);
}

.detail-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.detail-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-artist {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.detail-meta {
  font-size: 0.775rem;
  color: var(--accent, #9075c9);
  margin: 0 0 0.6rem;
}

.detail-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.listen-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.listen-btn:hover {
  opacity: 0.85;
  transform: scale(1.04);
}

.listen-btn.spotify {
  background: #1db954;
  color: #000;
}

.listen-btn.apple {
  background: linear-gradient(135deg, #fc3c44, #ff6b6b);
  color: #fff;
}

.detail-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: var(--icon-color);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  line-height: 0;
}

.detail-close:hover {
  color: var(--text-primary);
}

/* ── Transition ── */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.35s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(14px);
  opacity: 0;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .music-view {
    padding: 20px;
  }

  .album-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1.25rem;
  }

  .album-detail {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .detail-cover-wrap {
    width: 90px;
    height: 66px;
  }

  .detail-cover {
    width: 66px;
    height: 66px;
  }

  .detail-vinyl-bg {
    width: 58px;
    height: 58px;
  }
}
</style>
