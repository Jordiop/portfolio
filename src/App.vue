<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import CommandPalette from '@/components/CommandPalette.vue'
import MenuBar from '@/components/MenuBar.vue'
import TerminalPanel from '@/components/TerminalPanel.vue'
import NotificationToasts from '@/components/NotificationToasts.vue'
import ScmPanel from '@/components/panels/ScmPanel.vue'
import ExtensionsPanel from '@/components/panels/ExtensionsPanel.vue'
import RunDebugPanel from '@/components/panels/RunDebugPanel.vue'
import {
  useWorkbench,
  files,
  fileForPath,
  type EditorFile,
  type SideBarView,
} from '@/composables/useWorkbench'

const router = useRouter()
const route = useRoute()

const {
  isDarkMode,
  isExplorerVisible,
  isCodeEditorVisible,
  isTerminalVisible,
  activeView,
  toggleTheme,
  toggleExplorer,
  toggleCodeEditor,
  toggleTerminal,
  showSideBarView,
  notify,
  restoreWorkbench,
  openPalette,
} = useWorkbench()

// Open editor tabs (start with Home + whatever route we land on)
const openTabs = ref<EditorFile[]>([files[0]])

const isLoading = ref(true)
const portfolioExpanded = ref(true)
const menuBar = ref<InstanceType<typeof MenuBar> | null>(null)
const terminal = ref<InstanceType<typeof TerminalPanel> | null>(null)

const activeFile = computed(() => fileForPath(route.path))
const activeTab = computed(() => activeFile.value.name)

const sideBarTitle = computed(
  () =>
    ({
      explorer: 'Explorer',
      search: 'Search',
      scm: 'Source Control',
      run: 'Run and Debug',
      ext: 'Extensions',
    })[activeView.value],
)

const ensureTab = (file: EditorFile) => {
  if (!openTabs.value.some((t) => t.path === file.path)) {
    openTabs.value.push(file)
  }
}

const openFile = (file: EditorFile) => {
  ensureTab(file)
  if (route.path !== file.path) router.push(file.path)
}

const closeTab = (file: EditorFile, e?: Event) => {
  e?.stopPropagation()
  if (openTabs.value.length === 1) return // keep at least one open
  const idx = openTabs.value.findIndex((t) => t.path === file.path)
  if (idx === -1) return
  const wasActive = route.path === file.path
  openTabs.value.splice(idx, 1)
  if (wasActive) {
    const next = openTabs.value[Math.max(0, idx - 1)]
    router.push(next.path)
  }
}

const selectActivity = (view: SideBarView) => {
  if (view === 'search') {
    openPalette('files')
    return
  }
  if (activeView.value === view && isExplorerVisible.value) {
    isExplorerVisible.value = false
  } else {
    showSideBarView(view)
  }
}

/** Menu bar "Run Task: …" entries execute inside the terminal. */
const runInTerminal = (command: string) => terminal.value?.execute(command)

const windowTitle = computed(() => `${activeTab.value} — portfolio — Visual Studio Code`)

// Status bar — feels alive without faking interactivity
const cursorPos = ref({ ln: 1, col: 1 })

watch(
  () => route.path,
  () => {
    ensureTab(activeFile.value)
    cursorPos.value = {
      ln: 1 + Math.floor(Math.random() * 40),
      col: 1 + Math.floor(Math.random() * 20),
    }
    menuBar.value?.closeMenu()
  },
)

const handleKeydown = (event: KeyboardEvent) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const mod = isMac ? event.metaKey : event.ctrlKey
  if (!mod) return

  if (event.key.toLowerCase() === 'b') {
    event.preventDefault()
    toggleExplorer()
  }
  if (event.key === '\\') {
    event.preventDefault()
    toggleCodeEditor()
  }
  if (event.key === '`') {
    event.preventDefault()
    toggleTerminal()
  }
}

onMounted(() => {
  restoreWorkbench()
  ensureTab(activeFile.value)

  document.addEventListener('keydown', handleKeydown)
  setTimeout(() => (isLoading.value = false), 300)

  // The greeting VS Code shows once an extension host finishes booting.
  setTimeout(
    () =>
      notify(
        'Vue Language Features activated',
        'Press F1 for commands, Ctrl+` for a terminal.',
      ),
    1400,
  )
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div id="app">
    <CommandPalette />
    <NotificationToasts />

    <!-- ════════ Title Bar ════════ -->
    <div class="title-bar" @click="menuBar?.closeMenu()">
      <div class="title-left">
        <div class="vscode-logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path
              fill="#0098ff"
              d="M17.5 2.5 8 11l-4-3.2-1.6.8 3.5 3.4-3.5 3.4 1.6.8 4-3.2 9.5 8.5 2.5-1.1V3.6L17.5 2.5ZM17 7.6v8.8L11.2 12 17 7.6Z"
            />
          </svg>
        </div>
        <MenuBar ref="menuBar" @run-command="runInTerminal" />
      </div>

      <div class="title-center">{{ windowTitle }}</div>

      <div class="window-controls" @click.stop>
        <button class="win-btn" aria-label="Minimize">
          <svg width="11" height="11" viewBox="0 0 11 11"><rect x="0" y="5" width="11" height="1" fill="currentColor" /></svg>
        </button>
        <button class="win-btn" aria-label="Maximize">
          <svg width="11" height="11" viewBox="0 0 11 11"><rect x="0.5" y="0.5" width="10" height="10" fill="none" stroke="currentColor" /></svg>
        </button>
        <button class="win-btn win-close" aria-label="Close">
          <svg width="11" height="11" viewBox="0 0 11 11"><path d="M1 1l9 9M10 1l-9 9" stroke="currentColor" stroke-width="1" /></svg>
        </button>
      </div>
    </div>

    <!-- ════════ Workbench ════════ -->
    <div class="workbench">
      <!-- Activity Bar -->
      <div class="activity-bar">
        <div class="activity-top">
          <button
            class="activity-icon"
            :class="{ active: activeView === 'explorer' && isExplorerVisible }"
            title="Explorer (Ctrl+B)"
            @click="selectActivity('explorer')"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7h-7L11 5H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1Z"/></svg>
          </button>
          <button class="activity-icon" title="Search (Ctrl+P)" @click="selectActivity('search')">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
          <button
            class="activity-icon"
            :class="{ active: activeView === 'scm' && isExplorerVisible }"
            title="Source Control"
            @click="selectActivity('scm')"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="9" r="2.5"/><path d="M6 8.5v7M18 11.5c0 4-6 1.5-6 6"/></svg>
          </button>
          <button
            class="activity-icon"
            :class="{ active: activeView === 'run' && isExplorerVisible }"
            title="Run and Debug"
            @click="selectActivity('run')"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="m10 8 5 4-5 4Z" fill="currentColor" stroke="none"/></svg>
          </button>
          <button
            class="activity-icon"
            :class="{ active: activeView === 'ext' && isExplorerVisible }"
            title="Extensions"
            @click="selectActivity('ext')"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 17.5h7M17.5 14v7"/></svg>
          </button>
        </div>
        <div class="activity-bottom">
          <button class="activity-icon" title="Accounts">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
          </button>
          <button class="activity-icon" :title="isDarkMode ? 'Switch to Light theme' : 'Switch to Dark theme'" @click="toggleTheme">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.5M12 19v2.5M21.5 12H19M5 12H2.5m15.6-6.1-1.8 1.8M7.2 16.8l-1.8 1.8m12.7 0-1.8-1.8M7.2 7.2 5.4 5.4"/></svg>
          </button>
        </div>
      </div>

      <!-- Side Bar — content follows the activity bar selection -->
      <aside v-show="isExplorerVisible" class="explorer">
        <div class="explorer-header">
          <span>{{ sideBarTitle }}</span>
          <span class="explorer-dots">⋯</span>
        </div>

        <ScmPanel v-if="activeView === 'scm'" />
        <RunDebugPanel v-else-if="activeView === 'run'" />
        <ExtensionsPanel v-else-if="activeView === 'ext'" />

        <div v-else class="explorer-section">
          <button class="section-title" @click="portfolioExpanded = !portfolioExpanded">
            <svg class="chevron" :class="{ collapsed: !portfolioExpanded }" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6 4l4 4-4 4V4z"/></svg>
            <span>PORTFOLIO</span>
          </button>
          <ul v-show="portfolioExpanded" class="file-tree">
            <li class="tree-folder">
              <svg class="chevron" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6 4l4 4-4 4V4z" transform="rotate(90 8 8)"/></svg>
              <svg class="folder-icon" width="16" height="16" viewBox="0 0 24 24" fill="#dcb67a"><path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2Z"/></svg>
              <span>src</span>
            </li>
            <li
              v-for="file in files"
              :key="file.path"
              class="tree-file"
              :class="{ active: route.path === file.path }"
              @click="openFile(file)"
            >
              <svg class="file-icon" viewBox="0 0 256 221" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path fill="#41B883" d="M204.8 0H256L128 220.8 0 0h97.92L128 51.2 157.44 0z" />
                <path fill="#35495E" d="M0 0l128 220.8L256 0h-51.2L128 132.48 50.56 0z" />
              </svg>
              <span>{{ file.name }}</span>
            </li>
          </ul>
        </div>
      </aside>

      <!-- Editor Region -->
      <div class="editor-region">
        <!-- Tab Bar -->
        <div class="tab-bar">
          <div class="tabs">
            <div
              v-for="file in openTabs"
              :key="file.path"
              class="tab"
              :class="{ active: route.path === file.path }"
              @click="openFile(file)"
            >
              <svg class="file-icon" viewBox="0 0 256 221" width="15" height="15" xmlns="http://www.w3.org/2000/svg">
                <path fill="#41B883" d="M204.8 0H256L128 220.8 0 0h97.92L128 51.2 157.44 0z" />
                <path fill="#35495E" d="M0 0l128 220.8L256 0h-51.2L128 132.48 50.56 0z" />
              </svg>
              <span class="tab-name">{{ file.name }}</span>
              <button class="tab-close" :class="{ locked: openTabs.length === 1 }" @click="closeTab(file, $event)" aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M4 4l8 8M12 4l-8 8"/></svg>
              </button>
            </div>
          </div>
          <div class="editor-actions">
            <button class="editor-action" :class="{ active: isCodeEditorVisible }" title="Toggle source pane (Ctrl+\)" @click="toggleCodeEditor">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M12 4v16"/></svg>
            </button>
          </div>
        </div>

        <!-- Breadcrumbs -->
        <div class="breadcrumbs">
          <span class="crumb">portfolio</span>
          <span class="crumb-sep">›</span>
          <span class="crumb">src</span>
          <span class="crumb-sep">›</span>
          <svg class="file-icon" viewBox="0 0 256 221" width="13" height="13" xmlns="http://www.w3.org/2000/svg">
            <path fill="#41B883" d="M204.8 0H256L128 220.8 0 0h97.92L128 51.2 157.44 0z" />
            <path fill="#35495E" d="M0 0l128 220.8L256 0h-51.2L128 132.48 50.56 0z" />
          </svg>
          <span class="crumb file">{{ activeTab }}</span>
        </div>

        <!-- Editor Content -->
        <div class="content-area">
          <div v-if="isLoading" class="loading-overlay">
            <div class="loading-spinner">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            </div>
          </div>
          <router-view v-slot="{ Component }">
            <component :is="Component" :key="route.path" :isCodeEditorVisible="isCodeEditorVisible" />
          </router-view>
        </div>

        <!-- Terminal Panel -->
        <TerminalPanel ref="terminal" />
      </div>
    </div>

    <!-- ════════ Status Bar ════════ -->
    <footer class="status-bar">
      <div class="status-left">
        <button class="status-item remote" title="Open a Remote Window">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18-6-6 6-6M15 6l6 6-6 6"/></svg>
        </button>
        <button class="status-item" title="Open Source Control" @click="selectActivity('scm')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="9" r="2.5"/><path d="M6 8.5v7M18 11.5c0 4-6 1.5-6 6"/></svg>
          <span>main</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
        <button
          class="status-item"
          title="No problems — open the terminal instead"
          @click="toggleTerminal()"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
          <span>0</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4M12 17h.01"/></svg>
          <span>0</span>
        </button>
        <button
          class="status-item"
          :class="{ 'is-on': isTerminalVisible }"
          title="Toggle Terminal (Ctrl+`)"
          @click="toggleTerminal()"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 17 6-5-6-5M12 19h8"/></svg>
          <span>Terminal</span>
        </button>
      </div>
      <div class="status-right">
        <button class="status-item">Ln {{ cursorPos.ln }}, Col {{ cursorPos.col }}</button>
        <button class="status-item">Spaces: 2</button>
        <button class="status-item">UTF-8</button>
        <button class="status-item">LF</button>
        <button class="status-item lang">
          <svg class="file-icon" viewBox="0 0 256 221" width="13" height="13" xmlns="http://www.w3.org/2000/svg">
            <path fill="#41B883" d="M204.8 0H256L128 220.8 0 0h97.92L128 51.2 157.44 0z" />
            <path fill="#35495E" d="M0 0l128 220.8L256 0h-51.2L128 132.48 50.56 0z" />
          </svg>
          <span>Vue</span>
        </button>
        <button
          class="status-item"
          title="Show notification"
          @click="notify('You found the bell', 'F1 opens the command palette. Ctrl+P jumps to a file.')"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </button>
      </div>
    </footer>

    <!-- ════════ Mobile Nav ════════ -->
    <nav class="mobile-nav">
      <button
        v-for="file in files"
        :key="file.path"
        class="mobile-nav-item"
        :class="{ active: route.path === file.path }"
        @click="openFile(file)"
      >
        <span class="mobile-nav-label">{{ file.name.replace('.vue', '') }}</span>
      </button>
      <span class="mobile-nav-divider"></span>
      <button
        class="mobile-nav-item"
        :class="{ active: isTerminalVisible }"
        aria-label="Toggle terminal"
        @click="toggleTerminal()"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 17 6-5-6-5M12 19h8"/></svg>
      </button>
      <button class="mobile-nav-item" aria-label="Toggle theme" @click="toggleTheme">
        <svg v-if="isDarkMode" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2m20 0h-2"/></svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>
    </nav>
  </div>
</template>

<style scoped>
/* ════════ Title Bar ════════ */
.title-bar {
  height: 30px;
  min-height: 30px;
  background: var(--titlebar-bg);
  color: var(--titlebar-fg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-ui);
  font-size: 12px;
  user-select: none;
  position: relative;
  z-index: 30;
}

.title-left {
  display: flex;
  align-items: center;
  height: 100%;
}

.vscode-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 100%;
}

/* Menu styling lives in MenuBar.vue */

.title-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: var(--titlebar-inactive-fg);
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
}

.window-controls {
  display: flex;
  height: 100%;
}

.win-btn {
  width: 46px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--titlebar-fg);
  cursor: pointer;
}

.win-btn:hover {
  background: rgba(128, 128, 128, 0.25);
}

.win-close:hover {
  background: #e81123;
  color: #fff;
}

/* ════════ Activity Bar ════════ */
.activity-bar {
  width: 48px;
  min-width: 48px;
  background: var(--activitybar-bg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  z-index: 20;
}

.activity-top,
.activity-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.activity-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--activitybar-fg);
  cursor: pointer;
  position: relative;
  transition: color 0.12s ease;
}

.activity-icon:hover {
  color: var(--activitybar-active);
}

.activity-icon.active {
  color: var(--activitybar-active);
}

.activity-icon.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--activitybar-active-border);
}

/* ════════ Explorer ════════ */
.explorer {
  width: 240px;
  min-width: 240px;
  background: var(--explorer-bg);
  color: var(--explorer-fg);
  font-family: var(--font-ui);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid var(--chrome-border);
}

.explorer-header {
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 0 20px;
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--explorer-header-fg);
}

.explorer-dots {
  cursor: pointer;
  font-size: 14px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 2px;
  width: 100%;
  background: transparent;
  border: none;
  color: var(--explorer-fg);
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 4px 16px 4px 6px;
  cursor: pointer;
  text-transform: uppercase;
}

.section-title:hover {
  color: var(--icon-active);
}

.chevron {
  transition: transform 0.12s ease;
  flex-shrink: 0;
}

.chevron.collapsed {
  transform: rotate(-90deg);
}

.file-tree {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tree-folder,
.tree-file {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  height: 22px;
  cursor: pointer;
  white-space: nowrap;
  color: var(--explorer-fg);
  position: relative;
}

.tree-folder {
  padding-left: 12px;
}

.tree-file {
  padding-left: 36px;
}

.tree-file:hover,
.tree-folder:hover {
  background: var(--list-hover-bg);
}

.tree-file.active {
  background: var(--list-inactive-bg);
}

.tree-file.active::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid var(--focus-blue);
  pointer-events: none;
  opacity: 0.5;
}

.folder-icon,
.file-icon {
  flex-shrink: 0;
}

/* ════════ Tab Bar ════════ */
.tab-bar {
  height: 35px;
  min-height: 35px;
  background: var(--tabbar-bg);
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  overflow: hidden;
}

.tabs {
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  scrollbar-width: none;
}

.tabs::-webkit-scrollbar {
  display: none;
}

.tab {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 10px 0 12px;
  height: 100%;
  min-width: 120px;
  max-width: 200px;
  font-family: var(--font-ui);
  font-size: 13px;
  color: var(--tab-inactive-fg);
  background: var(--tab-inactive-bg);
  border-right: 1px solid var(--tab-border);
  cursor: pointer;
  position: relative;
  white-space: nowrap;
}

.tab.active {
  color: var(--tab-active-fg);
  background: var(--tab-active-bg);
}

.tab.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--tab-active-border-top);
}

.tab-name {
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.1s ease, background 0.1s ease;
  flex-shrink: 0;
}

.tab:hover .tab-close,
.tab.active .tab-close {
  opacity: 0.8;
}

.tab-close:hover {
  background: rgba(128, 128, 128, 0.3);
  opacity: 1;
}

.tab-close.locked {
  opacity: 0 !important;
  pointer-events: none;
}

.editor-actions {
  display: flex;
  align-items: center;
  padding: 0 8px;
}

.editor-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--icon-color);
  cursor: pointer;
  border-radius: 5px;
}

.editor-action:hover {
  background: var(--list-hover-bg);
  color: var(--icon-active);
}

.editor-action.active {
  color: var(--focus-blue);
}

/* ════════ Breadcrumbs ════════ */
.breadcrumbs {
  height: 22px;
  min-height: 22px;
  background: var(--breadcrumb-bg);
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 16px;
  font-family: var(--font-ui);
  font-size: 12px;
  color: var(--breadcrumb-fg);
  border-bottom: 1px solid var(--chrome-border);
}

.crumb {
  cursor: default;
}

.crumb.file {
  color: var(--breadcrumb-fg);
}

.crumb-sep {
  opacity: 0.6;
}

/* ════════ Loading ════════ */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-spinner {
  color: var(--focus-blue);
}

.loading-spinner svg {
  animation: spin 0.8s linear infinite;
}

/* ════════ Status Bar ════════ */
.status-bar {
  height: 22px;
  min-height: 22px;
  background: var(--statusbar-bg);
  color: var(--statusbar-fg);
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  font-family: var(--font-ui);
  font-size: 12px;
  z-index: 30;
}

.status-left,
.status-right {
  display: flex;
  align-items: stretch;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  background: transparent;
  border: none;
  color: var(--statusbar-fg);
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.status-item:hover {
  background: var(--statusbar-hover);
}

.status-item.remote {
  background: rgba(0, 0, 0, 0.18);
}

.status-item.remote:hover {
  background: rgba(0, 0, 0, 0.3);
}

.status-item.is-on {
  background: var(--statusbar-hover);
}

/* ════════ Mobile Nav ════════ */
.mobile-nav {
  display: none;
}

@media (max-width: 768px) {
  .title-center,
  .window-controls,
  .activity-bar,
  .explorer,
  .breadcrumbs {
    display: none;
  }

  .tab-bar {
    overflow-x: auto;
  }

  .editor-actions {
    display: none;
  }

  .mobile-nav {
    display: flex;
    align-items: center;
    gap: 2px;
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    padding: 6px 8px;
    border-radius: 12px;
    background: var(--titlebar-bg);
    border: 1px solid var(--chrome-border);
    box-shadow: var(--shadow-heavy);
    max-width: calc(100vw - 24px);
    overflow-x: auto;
    scrollbar-width: none;
  }

  .mobile-nav::-webkit-scrollbar {
    display: none;
  }

  .mobile-nav-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    border-radius: 8px;
    border: none;
    background: transparent;
    color: var(--titlebar-fg);
    font-family: var(--font-ui);
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
  }

  .mobile-nav-item.active {
    background: var(--btn-primary-bg);
    color: #fff;
  }

  .mobile-nav-divider {
    width: 1px;
    height: 18px;
    background: var(--chrome-border);
    margin: 0 2px;
  }

  :deep(.preview) {
    padding-bottom: 90px;
  }
}
</style>
