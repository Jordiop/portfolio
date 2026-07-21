<script setup lang="ts">
/**
 * Quick Open (Ctrl+P) and the Command Palette (Ctrl+Shift+P) — the same widget,
 * switched by a leading ">" in the input, exactly like VS Code.
 */
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkbench, type WorkbenchAction } from '@/composables/useWorkbench'

const router = useRouter()
const { actions, paletteOpener } = useWorkbench()

const isOpen = ref(false)
const searchQuery = ref('')
const selectedIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const resultsRef = ref<HTMLElement | null>(null)

interface RouteOption {
  name: string
  path: string
  description: string
  icon: string
}

const routes: RouteOption[] = [
  { name: 'Home.vue', path: '/', description: 'Landing page', icon: '📄' },
  { name: 'Projects.vue', path: '/projects', description: 'View all projects', icon: '📄' },
  { name: 'About.vue', path: '/about', description: 'About me', icon: '📄' },
  { name: 'Gallery.vue', path: '/gallery', description: 'Photo gallery', icon: '📄' },
  { name: 'Music.vue', path: '/music', description: 'What I listen to', icon: '📄' },
]

/** Command mode is driven purely by the leading ">" so users can switch mid-search. */
const isCommandMode = computed(() => searchQuery.value.startsWith('>'))
const term = computed(() =>
  (isCommandMode.value ? searchQuery.value.slice(1) : searchQuery.value).trim().toLowerCase(),
)

const filteredRoutes = computed(() => {
  if (!term.value) return routes
  return routes.filter(
    (route) =>
      route.name.toLowerCase().includes(term.value) ||
      route.path.toLowerCase().includes(term.value) ||
      route.description.toLowerCase().includes(term.value),
  )
})

const filteredActions = computed(() => {
  const visible = actions.value.filter((a) => !a.internal)
  if (!term.value) return visible
  return visible.filter((a) => a.label.toLowerCase().includes(term.value))
})

const resultCount = computed(() =>
  isCommandMode.value ? filteredActions.value.length : filteredRoutes.value.length,
)

const placeholder = computed(() =>
  isCommandMode.value
    ? 'Type a command name…'
    : 'Search files by name (append > for commands)…',
)

// Any change to the query invalidates the current highlight.
watch(searchQuery, () => (selectedIndex.value = 0))

const openPalette = (mode: 'files' | 'commands' = 'files') => {
  isOpen.value = true
  searchQuery.value = mode === 'commands' ? '>' : ''
  selectedIndex.value = 0
  nextTick(() => inputRef.value?.focus())
}

const closePalette = () => {
  isOpen.value = false
  searchQuery.value = ''
  selectedIndex.value = 0
}

const handleKeyDown = (e: KeyboardEvent) => {
  // F1 is the escape hatch for browsers that swallow Ctrl+Shift+P.
  if (e.key === 'F1') {
    e.preventDefault()
    openPalette('commands')
    return
  }

  const mod = e.ctrlKey || e.metaKey
  if (!mod) return

  if (e.key.toLowerCase() === 'p') {
    e.preventDefault()
    openPalette(e.shiftKey ? 'commands' : 'files')
  }
}

const move = (delta: number) => {
  const count = resultCount.value
  if (count === 0) return
  selectedIndex.value = Math.min(Math.max(selectedIndex.value + delta, 0), count - 1)
  scrollSelectedIntoView()
}

const scrollSelectedIntoView = () =>
  nextTick(() => {
    resultsRef.value
      ?.querySelector('.result-item.selected')
      ?.scrollIntoView({ block: 'nearest' })
  })

const handlePaletteKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closePalette()
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    move(1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    move(-1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    acceptSelected()
  }
}

const acceptSelected = () => {
  if (isCommandMode.value) {
    const action = filteredActions.value[selectedIndex.value]
    if (action) runAction(action)
    return
  }
  const route = filteredRoutes.value[selectedIndex.value]
  if (route) navigateToRoute(route.path)
}

const runAction = (action: WorkbenchAction) => {
  closePalette()
  action.run()
}

const navigateToRoute = (path: string) => {
  router.push(path)
  closePalette()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  // Let the activity bar and menus open this widget without prop drilling.
  paletteOpener.value = openPalette
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (paletteOpener.value === openPalette) paletteOpener.value = null
})

defineExpose({ openPalette, closePalette })
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="command-palette-overlay" @click="closePalette">
      <div class="command-palette" @click.stop @keydown="handlePaletteKeyDown">
        <div class="palette-header">
          <input
            ref="inputRef"
            v-model="searchQuery"
            type="text"
            :placeholder="placeholder"
            class="palette-input"
            aria-label="Quick open"
          />
        </div>

        <div ref="resultsRef" class="palette-results">
          <!-- Command mode -->
          <template v-if="isCommandMode">
            <div
              v-for="(action, index) in filteredActions"
              :key="action.id"
              :class="['result-item', { selected: index === selectedIndex }]"
              @click="runAction(action)"
              @mouseenter="selectedIndex = index"
            >
              <span class="route-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 17 6-6-6-6M12 19h8"/></svg>
              </span>
              <div class="route-info">
                <div class="route-name">{{ action.label }}</div>
              </div>
              <kbd v-if="action.keybinding" class="route-key">{{ action.keybinding }}</kbd>
            </div>

            <div v-if="filteredActions.length === 0" class="no-results">No matching commands</div>
          </template>

          <!-- File mode -->
          <template v-else>
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

            <div v-if="filteredRoutes.length === 0" class="no-results">No routes found</div>
          </template>
        </div>

        <div class="palette-footer">
          <span class="hint">
            <kbd>↑</kbd> <kbd>↓</kbd> to navigate
            <kbd>↵</kbd> to select
            <kbd>&gt;</kbd> for commands
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
  background: transparent;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 32px;
  z-index: 9999;
}

.command-palette {
  background: var(--widget-bg);
  border: 1px solid var(--widget-border);
  border-radius: 6px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  font-family: var(--font-ui);
}

.palette-header {
  padding: 8px;
}

.palette-input {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--focus-blue);
  border-radius: 2px;
  outline: none;
  font-size: 13px;
  padding: 5px 8px;
  color: var(--input-fg);
  font-family: var(--font-ui);
}

.palette-input::placeholder {
  color: var(--text-secondary);
}

.palette-results {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 4px 4px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 4px;
}

.result-item:hover,
.result-item.selected {
  background: var(--list-active-bg);
  color: var(--list-active-fg);
}

.result-item.selected .route-description,
.result-item.selected .route-path {
  color: rgba(255, 255, 255, 0.75);
}

.result-item.selected .route-key {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.route-icon {
  font-size: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.route-info {
  flex: 1;
  min-width: 0;
}

.route-name {
  font-weight: 500;
  font-size: 13px;
  color: inherit;
  margin-bottom: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.route-description {
  font-size: 12px;
  color: var(--text-secondary);
}

.route-path {
  font-size: 12px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  flex-shrink: 0;
}

.route-key {
  flex-shrink: 0;
}

.no-results {
  padding: 24px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
}

.palette-footer {
  padding: 6px 10px;
  border-top: 1px solid var(--widget-border);
  background: var(--widget-bg);
}

.hint {
  font-size: 11px;
  color: var(--text-secondary);
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

kbd {
  background: var(--input-bg);
  border: 1px solid var(--widget-border);
  border-radius: 3px;
  padding: 1px 5px;
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--text-primary);
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

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .fade-enter-active .command-palette,
  .fade-leave-active .command-palette {
    transition: none;
  }
}
</style>
