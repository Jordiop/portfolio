<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isOpen = ref(false)
const searchQuery = ref('')
const selectedIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

interface RouteOption {
  name: string
  path: string
  description: string
  icon: string
}

const routes: RouteOption[] = [
  { name: 'Home', path: '/', description: 'Landing page', icon: '🏠' },
  { name: 'Projects', path: '/projects', description: 'View all projects', icon: '📁' },
  { name: 'About', path: '/about', description: 'About me', icon: '👤' },
]

const filteredRoutes = computed(() => {
  if (!searchQuery.value) return routes

  const query = searchQuery.value.toLowerCase()
  return routes.filter(route =>
    route.name.toLowerCase().includes(query) ||
    route.path.toLowerCase().includes(query) ||
    route.description.toLowerCase().includes(query)
  )
})

const openPalette = () => {
  isOpen.value = true
  searchQuery.value = ''
  selectedIndex.value = 0
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const closePalette = () => {
  isOpen.value = false
  searchQuery.value = ''
  selectedIndex.value = 0
}

const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
    e.preventDefault()
    openPalette()
  }
}

const handlePaletteKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closePalette()
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedIndex.value = Math.min(selectedIndex.value + 1, filteredRoutes.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    navigateToSelected()
  }
}

const navigateToSelected = () => {
  const route = filteredRoutes.value[selectedIndex.value]
  if (route) {
    router.push(route.path)
    closePalette()
  }
}

const navigateToRoute = (path: string) => {
  router.push(path)
  closePalette()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

defineExpose({ openPalette, closePalette })
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="command-palette-overlay"
      @click="closePalette"
    >
      <div
        class="command-palette"
        @click.stop
        @keydown="handlePaletteKeyDown"
      >
        <div class="palette-header">
          <input
            ref="inputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Search routes..."
            class="palette-input"
          />
        </div>

        <div class="palette-results">
          <div
            v-for="(route, index) in filteredRoutes"
            :key="route.path"
            :class="['result-item', { selected: index === selectedIndex }]"
            @click="navigateToRoute(route.path)"
            @mouseenter="selectedIndex = index"
          >
            <span class="route-icon">{{ route.icon }}</span>
            <div class="route-info">
              <div class="route-name">{{ route.name }}</div>
              <div class="route-description">{{ route.description }}</div>
            </div>
            <div class="route-path">{{ route.path }}</div>
          </div>

          <div v-if="filteredRoutes.length === 0" class="no-results">
            No routes found
          </div>
        </div>

        <div class="palette-footer">
          <span class="hint">
            <kbd>↑</kbd> <kbd>↓</kbd> to navigate
            <kbd>↵</kbd> to select
            <kbd>Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.command-palette-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.command-palette {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.palette-header {
  padding: 12px;
  border-bottom: 1px solid var(--border);
}

.palette-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-size: 16px;
  color: var(--foreground);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.palette-input::placeholder {
  color: var(--muted-foreground);
}

.palette-results {
  max-height: 400px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.1s;
  border-bottom: 1px solid var(--border);
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover,
.result-item.selected {
  background: rgb(240, 240, 245, 0.6);
}

.route-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.route-info {
  flex: 1;
  min-width: 0;
}

.route-name {
  font-weight: 500;
  color: var(--foreground);
  margin-bottom: 2px;
}

.route-description {
  font-size: 12px;
  color: var(--muted-foreground);
}

.route-path {
  font-size: 12px;
  color: var(--muted-foreground);
  font-family: 'Courier New', monospace;
  flex-shrink: 0;
}

.no-results {
  padding: 32px;
  text-align: center;
  color: var(--muted-foreground);
}

.palette-footer {
  padding: 8px 12px;
  border-top: 1px solid var(--border);
  background: var(--muted);
}

.hint {
  font-size: 11px;
  color: var(--muted-foreground);
  display: flex;
  gap: 8px;
  align-items: center;
}

kbd {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 10px;
  font-family: monospace;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .command-palette,
.fade-leave-active .command-palette {
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.fade-enter-from .command-palette {
  transform: translateY(-10px);
  opacity: 0;
}

.fade-leave-to .command-palette {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
