<script setup lang="ts">
/**
 * Title bar menus. Every entry runs a real workbench action — no decorative
 * dead ends. Hovering while a menu is open switches menus, like the real thing.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkbench, key, files } from '@/composables/useWorkbench'

const router = useRouter()
const {
  isDarkMode,
  isExplorerVisible,
  isCodeEditorVisible,
  isTerminalVisible,
  toggleTheme,
  toggleExplorer,
  toggleCodeEditor,
  toggleTerminal,
  showSideBarView,
  openPalette,
  copyEmail,
  downloadResume,
  openExternal,
} = useWorkbench()

interface MenuEntry {
  label?: string
  keybinding?: string
  /** Renders a horizontal rule instead of an item */
  separator?: boolean
  /** Shows a checkmark gutter when true/false, omitted for plain items */
  checked?: boolean
  run?: () => void
}

interface Menu {
  name: string
  entries: MenuEntry[]
}

const menus = computed<Menu[]>(() => [
  {
    name: 'File',
    entries: [
      { label: 'Open File…', keybinding: key('Ctrl+P'), run: () => openPalette('files') },
      { separator: true },
      ...files.map((f) => ({ label: f.name, run: () => router.push(f.path) })),
      { separator: true },
      { label: 'Download Resume (PDF)', run: downloadResume },
    ],
  },
  {
    name: 'Edit',
    entries: [
      { label: 'Copy Email Address', run: copyEmail },
      { label: 'Copy Link to This Page', run: copyPageLink },
      { separator: true },
      { label: 'Find in Files…', keybinding: key('Ctrl+P'), run: () => openPalette('files') },
    ],
  },
  {
    name: 'Selection',
    entries: [
      { label: 'Select All Projects', run: () => router.push('/projects') },
      { label: 'Select Photos', run: () => router.push('/gallery') },
      { label: 'Select Playlist', run: () => router.push('/music') },
    ],
  },
  {
    name: 'View',
    entries: [
      // F1, not Ctrl+Shift+P — Chrome reserves that one for incognito windows.
      { label: 'Command Palette…', keybinding: 'F1', run: () => openPalette('commands') },
      { separator: true },
      { label: 'Explorer', run: () => showSideBarView('explorer') },
      { label: 'Source Control', run: () => showSideBarView('scm') },
      { label: 'Run and Debug', run: () => showSideBarView('run') },
      { label: 'Extensions', run: () => showSideBarView('ext') },
      { separator: true },
      {
        label: 'Primary Side Bar',
        keybinding: key('Ctrl+B'),
        checked: isExplorerVisible.value,
        run: toggleExplorer,
      },
      {
        label: 'Source Pane',
        keybinding: key('Ctrl+\\'),
        checked: isCodeEditorVisible.value,
        run: toggleCodeEditor,
      },
      {
        label: 'Terminal',
        keybinding: key('Ctrl+`'),
        checked: isTerminalVisible.value,
        run: toggleTerminal,
      },
      { separator: true },
      { label: isDarkMode.value ? 'Light+ Theme' : 'Dark+ Theme', run: toggleTheme },
    ],
  },
  {
    name: 'Go',
    entries: [
      { label: 'Go to File…', keybinding: key('Ctrl+P'), run: () => openPalette('files') },
      { separator: true },
      ...files.map((f) => ({ label: f.name, run: () => router.push(f.path) })),
      { separator: true },
      { label: 'Back', run: () => router.back() },
      { label: 'Forward', run: () => router.forward() },
    ],
  },
  {
    name: 'Run',
    entries: [
      { label: 'Start Debugging', keybinding: 'F5', run: () => showSideBarView('run') },
      { label: 'Open Run and Debug', run: () => showSideBarView('run') },
      { separator: true },
      { label: 'Run Task: Hire Me', run: () => (window.location.href = 'mailto:jordiosarenkhoe@outlook.es') },
    ],
  },
  {
    name: 'Terminal',
    entries: [
      { label: 'New Terminal', keybinding: key('Ctrl+`'), run: openTerminal },
      { label: 'Toggle Terminal', keybinding: key('Ctrl+`'), checked: isTerminalVisible.value, run: toggleTerminal },
      { separator: true },
      { label: 'Run Task: whoami', run: () => runInTerminal('whoami') },
      { label: 'Run Task: neofetch', run: () => runInTerminal('neofetch') },
    ],
  },
  {
    name: 'Help',
    entries: [
      { label: 'Welcome', run: () => router.push('/') },
      { label: 'About Me', run: () => router.push('/about') },
      { separator: true },
      { label: 'View Source on GitHub', run: () => openExternal('https://github.com/jordiop/tab-portfolio') },
      { label: 'GitHub Profile', run: () => openExternal('https://github.com/jordiop') },
      { label: 'LinkedIn', run: () => openExternal('https://www.linkedin.com/in/jordiop/') },
      { separator: true },
      { label: 'Keyboard Shortcuts', run: () => openPalette('commands') },
    ],
  },
])

const activeMenu = ref<string | null>(null)

const emit = defineEmits<{ (e: 'run-command', command: string): void }>()

function openTerminal() {
  if (!isTerminalVisible.value) toggleTerminal()
}

function runInTerminal(command: string) {
  openTerminal()
  emit('run-command', command)
}

async function copyPageLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
  } catch {
    /* clipboard unavailable — nothing useful to do */
  }
}

const toggleMenu = (name: string) => {
  activeMenu.value = activeMenu.value === name ? null : name
}

/** Once a menu is open, hovering a sibling switches to it. */
const hoverMenu = (name: string) => {
  if (activeMenu.value) activeMenu.value = name
}

const select = (entry: MenuEntry) => {
  activeMenu.value = null
  entry.run?.()
}

const closeMenu = () => (activeMenu.value = null)

const onDocumentKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeMenu()
}

onMounted(() => document.addEventListener('keydown', onDocumentKeydown))
onUnmounted(() => document.removeEventListener('keydown', onDocumentKeydown))

defineExpose({ closeMenu })
</script>

<template>
  <nav class="menu-bar" @click.stop>
    <div v-for="menu in menus" :key="menu.name" class="menu-root">
      <button
        class="menu-item"
        :class="{ open: activeMenu === menu.name }"
        :aria-expanded="activeMenu === menu.name"
        aria-haspopup="true"
        @click="toggleMenu(menu.name)"
        @mouseenter="hoverMenu(menu.name)"
      >
        {{ menu.name }}
      </button>

      <div v-if="activeMenu === menu.name" class="menu-dropdown" role="menu">
        <template v-for="(entry, i) in menu.entries" :key="i">
          <div v-if="entry.separator" class="menu-separator" role="separator"></div>
          <button v-else class="menu-entry" role="menuitem" @click="select(entry)">
            <span class="menu-check">
              <svg v-if="entry.checked" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 8.5 3.2 3.2L13 5"/></svg>
            </span>
            <span class="menu-label">{{ entry.label }}</span>
            <span v-if="entry.keybinding" class="menu-key">{{ entry.keybinding }}</span>
          </button>
        </template>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.menu-bar {
  display: flex;
  align-items: center;
  height: 100%;
}

.menu-root {
  position: relative;
  height: 100%;
}

.menu-item {
  background: transparent;
  border: none;
  color: var(--titlebar-fg);
  font-family: inherit;
  font-size: 12px;
  padding: 0 8px;
  height: 100%;
  cursor: pointer;
  border-radius: 4px;
}

.menu-item:hover,
.menu-item.open {
  background: rgba(128, 128, 128, 0.25);
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 240px;
  padding: 4px;
  background: var(--widget-bg);
  border: 1px solid var(--widget-border);
  border-radius: 5px;
  box-shadow: var(--shadow-heavy);
  z-index: 40;
  animation: menu-in 0.09s ease-out;
}

@keyframes menu-in {
  from {
    opacity: 0;
    transform: translateY(-3px);
  }
}

.menu-entry {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 4px 8px 4px 4px;
  background: transparent;
  border: none;
  border-radius: 3px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
}

.menu-entry:hover {
  background: var(--list-active-bg);
  color: var(--list-active-fg);
}

.menu-check {
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-label {
  flex: 1;
}

.menu-key {
  font-size: 11px;
  opacity: 0.75;
  margin-left: 20px;
  font-family: var(--font-mono);
}

.menu-separator {
  height: 1px;
  margin: 4px 6px;
  background: var(--widget-border);
}

@media (max-width: 768px) {
  .menu-bar {
    display: none;
  }
}
</style>
