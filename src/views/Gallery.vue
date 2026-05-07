<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSeoMeta } from '@unhead/vue'
import { createLines } from '@/composables/createLines'
import { useGallery, type ExifData } from '@/composables/useGallery'
import { useSiteMeta } from '@/composables/useSiteMeta'

interface Props {
    isCodeEditorVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isCodeEditorVisible: true,
})

useSeoMeta(
    useSiteMeta({
        title: 'Gallery',
        description: 'A selection of photos from places I have been, with EXIF metadata.',
        path: '/gallery',
    }),
)

const { photos, isLoading, error, fetchPhotos, fetchExif, getExif } = useGallery()

const selectedIndex = ref<number | null>(null)
const imgLoaded = ref<Record<number, boolean>>({})
const currentExif = ref<ExifData | null>(null)
const exifFetching = ref(false)

const selectedPhoto = computed(() =>
    selectedIndex.value !== null ? photos.value[selectedIndex.value] : null,
)

const hasAnyExif = (e: ExifData) => Object.values(e).some(v => v !== null)

const loadExif = async (index: number) => {
    const photo = photos.value[index]
    if (!photo) return
    currentExif.value = null
    exifFetching.value = true
    await fetchExif(photo.key)
    currentExif.value = getExif(photo.key)
    exifFetching.value = false
}

const openLightbox = async (index: number) => {
    selectedIndex.value = index
    document.body.style.overflow = 'hidden'
    await loadExif(index)
}

const closeLightbox = () => {
    selectedIndex.value = null
    currentExif.value = null
    document.body.style.overflow = ''
}

const prev = async () => {
    if (selectedIndex.value !== null && selectedIndex.value > 0) {
        selectedIndex.value--
        await loadExif(selectedIndex.value)
    }
}

const next = async () => {
    if (selectedIndex.value !== null && selectedIndex.value < photos.value.length - 1) {
        selectedIndex.value++
        await loadExif(selectedIndex.value)
    }
}

const onKey = (e: KeyboardEvent) => {
    if (selectedIndex.value === null) return
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
}

onMounted(() => {
    fetchPhotos()
    document.addEventListener('keydown', onKey)
})

onUnmounted(() => {
    document.removeEventListener('keydown', onKey)
    document.body.style.overflow = ''
})

const codeLines = createLines([
    { content: '<' + 'script setup lang="ts">', class: 'keyword' },
    { content: "import { ref } from 'vue'", class: 'keyword' },
    { content: "import { useGallery } from '@/composables/useGallery'", class: 'keyword' },
    '',
    { content: 'const R2_BASE_URL = import.meta.env.VITE_R2_PUBLIC_URL', class: 'variable' },
    { content: 'const R2_LIST_URL = import.meta.env.VITE_R2_LIST_ENDPOINT', class: 'variable' },
    '',
    { content: 'const { photos, isLoading, error, fetchPhotos } = useGallery()', class: 'variable' },
    { content: 'const selectedIndex = ref(null)', class: 'variable' },
    '',
    { content: 'const fetchPhotos = async () => {', class: 'function' },
    { content: "  const res = await fetch(R2_LIST_URL)", class: '' },
    { content: "  const { objects } = await res.json()", class: '' },
    { content: '  photos.value = objects', class: '' },
    { content: "    .filter(o => /\\.(jpe?g|png|webp)$/i.test(o.key))", class: 'string' },
    { content: '    .map(o => ({ key: o.key, url: `${R2_BASE_URL}/${o.key}` }))', class: 'string' },
    { content: '}', class: '' },
    '',
    { content: 'const openLightbox = (index) => {', class: 'function' },
    { content: '  selectedIndex.value = index', class: '' },
    { content: "  document.body.style.overflow = 'hidden'", class: 'string' },
    { content: '}', class: '' },
    '',
    { content: 'onMounted(() => fetchPhotos())', class: 'variable' },
    { content: '</' + 'script>', class: 'keyword' },
    '',
    { content: '<template>', class: 'keyword' },
    { content: '  <div class="gallery-header">', class: 'punctuation' },
    { content: '    <h2>Gallery</h2>', class: '' },
    { content: '    <p>Photos that I like</p>', class: 'string' },
    { content: '  </div>', class: 'punctuation' },
    { content: '  <div class="gallery-grid">', class: 'punctuation' },
    { content: '    <div v-for="(photo, i) in photos" :key="photo.key"', class: '' },
    { content: '      class="gallery-item" @click="openLightbox(i)">', class: '' },
    { content: '      <img :src="photo.url" :alt="photo.caption"', class: '' },
    { content: '        loading="lazy" />', class: 'string' },
    { content: '    </div>', class: 'punctuation' },
    { content: '  </div>', class: 'punctuation' },
    '',
    { content: '  <Teleport to="body">', class: 'keyword' },
    { content: '    <div v-if="selectedPhoto" class="lightbox"', class: '' },
    { content: '      @click.self="closeLightbox">', class: '' },
    { content: '      <img :src="selectedPhoto.url" />', class: 'string' },
    { content: '      <p class="lightbox-caption">{{ selectedPhoto.caption }}</p>', class: '' },
    { content: '    </div>', class: 'punctuation' },
    { content: '  </Teleport>', class: 'keyword' },
    { content: '</template>', class: 'keyword' },
])
</script>

<template>
    <div
        v-if="props.isCodeEditorVisible"
        class="code-editor hidden md:block overflow-hidden md:overflow-auto"
    >
        <div class="code-content">
            <div class="code-line" v-for="line in codeLines" :key="line.num">
                <div class="line-numbers">{{ line.num }}</div>
                <div class="code-text" :class="line.class">{{ line.content }}</div>
            </div>
        </div>
    </div>

    <div class="preview" :class="{ 'full-width': !props.isCodeEditorVisible }">
        <div class="gallery-wrapper">
            <div class="gallery-header">
                <h2>Gallery</h2>
                <p class="gallery-subtitle">Photos that I like</p>
            </div>

            <div v-if="isLoading" class="gallery-grid">
                <div v-for="n in 12" :key="n" class="gallery-skeleton" />
            </div>

            <div v-else-if="error" class="gallery-error">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>{{ error }}</p>
                <button class="btn btn-primary" @click="fetchPhotos">Retry</button>
            </div>

            <div v-else-if="photos.length === 0" class="gallery-empty">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <p>No photos found in your R2 bucket.</p>
            </div>

            <div v-else class="gallery-grid">
                <div
                    v-for="(photo, i) in photos"
                    :key="photo.key"
                    class="gallery-item"
                    :class="{ 'img-loading': !imgLoaded[i] }"
                    @click="openLightbox(i)"
                    role="button"
                    tabindex="0"
                    @keyup.enter="openLightbox(i)"
                >
                    <img
                        :src="photo.url"
                        :alt="photo.caption"
                        loading="lazy"
                        class="gallery-img"
                        :class="{ loaded: imgLoaded[i] }"
                        @load="imgLoaded[i] = true"
                    />
                    <div class="gallery-item-overlay">
                        <span class="gallery-caption">{{ photo.caption }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Teleport to="body">
        <Transition name="lightbox">
            <div v-if="selectedPhoto" class="lightbox" @click.self="closeLightbox">
                <button class="lightbox-close" @click="closeLightbox" aria-label="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <button
                    class="lightbox-nav lightbox-prev"
                    @click="prev"
                    :disabled="selectedIndex === 0"
                    aria-label="Previous"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>

                <div class="lightbox-content">
                    <img :src="selectedPhoto.url" :alt="selectedPhoto.caption" class="lightbox-img" />
                    <p class="lightbox-caption">{{ selectedPhoto.caption }}</p>
                    <span class="lightbox-counter">{{ (selectedIndex ?? 0) + 1 }} / {{ photos.length }}</span>

                    <div v-if="exifFetching" class="exif-strip exif-skeleton">
                        <span class="exif-pill" v-for="n in 4" :key="n" />
                    </div>
                    <div v-else-if="currentExif && hasAnyExif(currentExif)" class="exif-strip">
                        <span v-if="currentExif.camera" class="exif-pill">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                            {{ currentExif.camera }}
                        </span>
                        <span v-if="currentExif.focalLength" class="exif-pill">{{ currentExif.focalLength }}</span>
                        <span v-if="currentExif.aperture" class="exif-pill">{{ currentExif.aperture }}</span>
                        <span v-if="currentExif.exposureTime" class="exif-pill">{{ currentExif.exposureTime }}</span>
                        <span v-if="currentExif.iso" class="exif-pill">{{ currentExif.iso }}</span>
                        <span v-if="currentExif.dateTaken" class="exif-pill">{{ currentExif.dateTaken }}</span>
                    </div>
                </div>

                <button
                    class="lightbox-nav lightbox-next"
                    @click="next"
                    :disabled="selectedIndex === photos.length - 1"
                    aria-label="Next"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.preview.full-width {
    width: 100%;
    margin-left: 0;
}

.gallery-wrapper {
    padding: 40px;
    animation: fadeInUp 0.6s ease;
}

.gallery-header {
    margin-bottom: 2.5rem;
}

.gallery-header h2 {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    color: var(--accent-color);
    margin: 0 0 0.5rem 0;
}

.gallery-subtitle {
    color: var(--text-secondary);
    font-size: 1rem;
    margin: 0;
}

/* Masonry grid via CSS columns */
.gallery-grid {
    columns: 3 220px;
    column-gap: 1rem;
}

.gallery-item {
    position: relative;
    break-inside: avoid;
    margin-bottom: 1rem;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.gallery-item:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-heavy);
}

.gallery-img {
    width: 100%;
    height: auto;
    display: block;
    opacity: 0;
    transition: opacity 0.4s ease;
}

.gallery-img.loaded {
    opacity: 1;
}

.gallery-item-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.75rem 1rem;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
    opacity: 0;
    transition: opacity 0.3s ease;
}

.gallery-item:hover .gallery-item-overlay {
    opacity: 1;
}

.gallery-caption {
    color: #fff;
    font-size: 0.8rem;
    text-transform: capitalize;
}

/* Shimmer */
@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

.gallery-item.img-loading {
    background: linear-gradient(
        90deg,
        var(--bg-secondary) 25%,
        color-mix(in srgb, var(--bg-secondary) 60%, var(--text-primary) 40%) 50%,
        var(--bg-secondary) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.6s linear infinite;
}

/* Skeleton */
.gallery-skeleton {
    break-inside: avoid;
    margin-bottom: 1rem;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    height: 180px;
    background: linear-gradient(
        90deg,
        var(--bg-secondary) 25%,
        color-mix(in srgb, var(--bg-secondary) 60%, var(--text-primary) 40%) 50%,
        var(--bg-secondary) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.6s linear infinite;
}

.gallery-skeleton:nth-child(odd) { height: 220px; }
.gallery-skeleton:nth-child(3n) { height: 160px; }

/* Error / Empty */
.gallery-error,
.gallery-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 4rem 2rem;
    color: var(--text-secondary);
    text-align: center;
}

.gallery-error svg,
.gallery-empty svg {
    color: var(--border-color);
}

/* Lightbox */
.lightbox {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.92);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
}

.lightbox-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    max-width: min(90vw, 1000px);
}

.lightbox-img {
    max-height: 80vh;
    max-width: 100%;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 8px 48px rgba(0, 0, 0, 0.5);
}

.lightbox-caption {
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.9rem;
    text-transform: capitalize;
    margin: 0;
}

.lightbox-counter {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8rem;
}

.lightbox-close {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 8px;
    color: #fff;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s ease;
}

.lightbox-close:hover {
    background: rgba(255, 255, 255, 0.2);
}

.lightbox-nav {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 8px;
    color: #fff;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s ease;
}

.lightbox-nav:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
}

.lightbox-nav:disabled {
    opacity: 0.25;
    cursor: default;
}

/* EXIF strip */
.exif-strip {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.4rem;
    margin-top: 0.25rem;
}

.exif-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.65rem;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.72rem;
    font-family: inherit;
    white-space: nowrap;
}

.exif-skeleton .exif-pill {
    width: 64px;
    height: 22px;
    background: rgba(255, 255, 255, 0.08);
    animation: skeleton-pulse 1.5s ease infinite;
}

/* Transition */
.lightbox-enter-active,
.lightbox-leave-active {
    transition: opacity 0.25s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
    opacity: 0;
}

@media (max-width: 768px) {
    .gallery-wrapper {
        padding: 20px;
    }

    .gallery-grid {
        columns: 2 150px;
    }

    .lightbox-nav {
        width: 36px;
        height: 36px;
    }
}

@media (max-width: 480px) {
    .gallery-grid {
        columns: 1;
    }
}
</style>
