/**
 * useWorkbench Composable
 *
 * Single source of truth for the IDE chrome: which panes are open, which theme
 * is active, and the registry of every command the workbench can run.
 *
 * State lives at module scope so the title bar, command palette, terminal and
 * side bar panels all read and mutate the same refs without prop drilling.
 */

import { ref, computed, readonly } from 'vue'
import router from '@/router'

export interface EditorFile {
  name: string
  path: string
  lang: string
}

export type SideBarView = 'explorer' | 'search' | 'scm' | 'run' | 'ext'

export interface WorkbenchAction {
  id: string
  /** Shown in the palette, e.g. "View: Toggle Primary Side Bar" */
  label: string
  keybinding?: string
  /** Hidden from the command palette (menu-only entries) */
  internal?: boolean
  run: () => void
}

export interface Notification {
  id: number
  message: string
  detail?: string
  severity: 'info' | 'warning'
}

/** The routes that appear as files in the explorer, tabs, palette and terminal. */
export const files: EditorFile[] = [
  { name: 'Home.vue', path: '/', lang: 'Vue' },
  { name: 'Projects.vue', path: '/projects', lang: 'Vue' },
  { name: 'About.vue', path: '/about', lang: 'Vue' },
  { name: 'Gallery.vue', path: '/gallery', lang: 'Vue' },
  { name: 'Music.vue', path: '/music', lang: 'Vue' },
]

export const fileForPath = (path: string): EditorFile =>
  files.find((f) => f.path === path) ??
  (path.startsWith('/projects/')
    ? { name: 'Project.vue', path, lang: 'Vue' }
    : { name: '404.vue', path, lang: 'Vue' })

/* ── State ──────────────────────────────────────────────── */

const isDarkMode = ref(true)
const isExplorerVisible = ref(true)
const isCodeEditorVisible = ref(true)
const isTerminalVisible = ref(false)
const activeView = ref<SideBarView>('explorer')
const notifications = ref<Notification[]>([])

/** Set by App.vue so `search` on the activity bar and Ctrl+P can open the palette. */
const paletteOpener = ref<((mode?: 'files' | 'commands') => void) | null>(null)

let notificationId = 0

/* ── Persistence ────────────────────────────────────────── */

const STORAGE = {
  theme: 'theme',
  codeEditor: 'codeEditorVisible',
} as const

const applyTheme = () => {
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  document.body.classList.toggle('dark', isDarkMode.value)
}

/* ── Mutations ──────────────────────────────────────────── */

const setTheme = (dark: boolean) => {
  isDarkMode.value = dark
  applyTheme()
  localStorage.setItem(STORAGE.theme, dark ? 'dark' : 'light')
}

const toggleTheme = () => setTheme(!isDarkMode.value)

const toggleExplorer = () => {
  isExplorerVisible.value = !isExplorerVisible.value
}

const toggleCodeEditor = () => {
  isCodeEditorVisible.value = !isCodeEditorVisible.value
  localStorage.setItem(STORAGE.codeEditor, String(isCodeEditorVisible.value))
}

const toggleTerminal = () => {
  isTerminalVisible.value = !isTerminalVisible.value
}

const showSideBarView = (view: SideBarView) => {
  activeView.value = view
  isExplorerVisible.value = true
}

const notify = (message: string, detail?: string, severity: Notification['severity'] = 'info') => {
  const id = ++notificationId
  notifications.value.push({ id, message, detail, severity })
  setTimeout(() => dismissNotification(id), 6000)
  return id
}

const dismissNotification = (id: number) => {
  notifications.value = notifications.value.filter((n) => n.id !== id)
}

const restoreWorkbench = () => {
  const savedTheme = localStorage.getItem(STORAGE.theme)
  isDarkMode.value = savedTheme ? savedTheme === 'dark' : true // Dark+ default
  applyTheme()

  const savedEditor = localStorage.getItem(STORAGE.codeEditor)
  if (savedEditor !== null) isCodeEditorVisible.value = savedEditor === 'true'
}

/* ── Side effects shared by palette / menus / terminal ──── */

const copyEmail = async () => {
  const email = 'jordiosarenkhoe@outlook.es'
  try {
    await navigator.clipboard.writeText(email)
    notify('Copied to clipboard', email)
  } catch {
    notify('Could not copy', email, 'warning')
  }
}

const downloadResume = () => {
  const a = document.createElement('a')
  a.href = '/resume.pdf'
  a.download = 'jordi-osarenkhoe-resume.pdf'
  a.click()
  notify('Downloading resume.pdf')
}

const openExternal = (url: string) => window.open(url, '_blank', 'noopener')

/* ── Command registry ───────────────────────────────────── */

const isMac = () => {
  if (typeof navigator === 'undefined') return false
  const uaPlatform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
    ?.platform
  return /mac/i.test(uaPlatform || navigator.platform)
}

/** "Ctrl+B" on Windows/Linux, "⌘B" on macOS. */
export const key = (combo: string) =>
  isMac() ? combo.replace('Ctrl+', '⌘').replace('Shift+', '⇧').replace('Alt+', '⌥') : combo

const go = (path: string) => () => {
  if (router.currentRoute.value.path !== path) router.push(path)
}

const actions = computed<WorkbenchAction[]>(() => [
  // Navigation
  ...files.map((f) => ({
    id: `go.${f.path}`,
    label: `Go to File: ${f.name}`,
    run: go(f.path),
  })),

  // View
  {
    id: 'view.toggleSideBar',
    label: 'View: Toggle Primary Side Bar',
    keybinding: key('Ctrl+B'),
    run: toggleExplorer,
  },
  {
    id: 'view.toggleSource',
    label: 'View: Toggle Source Pane',
    keybinding: key('Ctrl+\\'),
    run: toggleCodeEditor,
  },
  {
    id: 'view.toggleTerminal',
    label: 'View: Toggle Terminal',
    keybinding: key('Ctrl+`'),
    run: toggleTerminal,
  },
  { id: 'view.explorer', label: 'View: Show Explorer', run: () => showSideBarView('explorer') },
  { id: 'view.scm', label: 'View: Show Source Control', run: () => showSideBarView('scm') },
  { id: 'view.run', label: 'View: Show Run and Debug', run: () => showSideBarView('run') },
  { id: 'view.ext', label: 'View: Show Extensions', run: () => showSideBarView('ext') },

  // Theme
  {
    id: 'theme.toggle',
    label: `Preferences: Switch to ${isDarkMode.value ? 'Light+' : 'Dark+'} Theme`,
    run: toggleTheme,
  },

  // Contact / links
  { id: 'contact.email', label: 'Contact: Copy Email Address', run: copyEmail },
  {
    id: 'contact.mail',
    label: 'Contact: Send Me an Email',
    run: () => (window.location.href = 'mailto:jordiosarenkhoe@outlook.es'),
  },
  { id: 'contact.resume', label: 'Contact: Download Resume (PDF)', run: downloadResume },
  {
    id: 'link.github',
    label: 'Open: GitHub Profile',
    run: () => openExternal('https://github.com/jordiop'),
  },
  {
    id: 'link.linkedin',
    label: 'Open: LinkedIn Profile',
    run: () => openExternal('https://www.linkedin.com/in/jordiop/'),
  },
  {
    id: 'link.twitter',
    label: 'Open: Twitter / X Profile',
    run: () => openExternal('https://twitter.com/jordiscript'),
  },
  {
    id: 'link.source',
    label: 'Open: Source Code for This Site',
    run: () => openExternal('https://github.com/jordiop/tab-portfolio'),
  },
])

export function useWorkbench() {
  return {
    // state
    isDarkMode: readonly(isDarkMode),
    isExplorerVisible,
    isCodeEditorVisible,
    isTerminalVisible,
    activeView,
    notifications: readonly(notifications),
    actions,

    // mutations
    setTheme,
    toggleTheme,
    toggleExplorer,
    toggleCodeEditor,
    toggleTerminal,
    showSideBarView,
    notify,
    dismissNotification,
    restoreWorkbench,

    // side effects
    copyEmail,
    downloadResume,
    openExternal,

    // palette wiring
    paletteOpener,
    openPalette: (mode: 'files' | 'commands' = 'files') => paletteOpener.value?.(mode),

    // helpers
    files,
    fileForPath,
    key,
  }
}
