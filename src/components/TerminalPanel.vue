<script setup lang="ts">
/**
 * Terminal panel — a small but genuinely working shell.
 *
 * Commands operate on real data: `ls` lists the routes, `open` navigates to a
 * project, `theme` flips the workbench theme, `resume` downloads the PDF.
 * Supports history (↑/↓), tab completion, Ctrl+C and Ctrl+L.
 */
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkbench, files } from '@/composables/useWorkbench'
import { useProjects } from '@/composables/useProjects'

const router = useRouter()
const { isTerminalVisible, toggleTerminal, setTheme, isDarkMode, downloadResume, openExternal } =
  useWorkbench()
const { projects } = useProjects()

type Tone = 'default' | 'muted' | 'error' | 'success' | 'accent'

interface Line {
  id: number
  text: string
  tone: Tone
  href?: string
}

const lines = ref<Line[]>([])
const input = ref('')
const history = ref<string[]>([])
const historyIndex = ref(-1)
const cwd = ref('~/portfolio')
const inputRef = ref<HTMLInputElement | null>(null)
const bodyRef = ref<HTMLElement | null>(null)
const panelHeight = ref(260)

let lineId = 0

const print = (text: string, tone: Tone = 'default', href?: string) => {
  lines.value.push({ id: ++lineId, text, tone, href })
}

const printAll = (entries: string[], tone: Tone = 'default') =>
  entries.forEach((entry) => print(entry, tone))

const scrollToBottom = () =>
  nextTick(() => {
    if (bodyRef.value) bodyRef.value.scrollTop = bodyRef.value.scrollHeight
  })

/* ── Commands ───────────────────────────────────────────── */

const SOCIALS: Record<string, string> = {
  github: 'https://github.com/jordiop',
  linkedin: 'https://www.linkedin.com/in/jordiop/',
  twitter: 'https://twitter.com/jordiscript',
  x: 'https://twitter.com/jordiscript',
  source: 'https://github.com/jordiop/tab-portfolio',
}

const FILE_BLURBS: Record<string, string> = {
  'home.vue': "Landing page. Typewriter intro, social links, and the two buttons that matter.",
  'projects.vue': 'Every project I have shipped, with case studies behind each card.',
  'about.vue': 'Background, stack, and the GitHub stats pulled live from the API.',
  'gallery.vue': 'Photos I have taken, served from Cloudflare R2.',
  'music.vue': 'What is on repeat, wired to Spotify Now Playing.',
}

interface Command {
  name: string
  args?: string
  description: string
  run: (args: string[]) => void | Promise<void>
}

const commands: Command[] = [
  {
    name: 'help',
    description: 'List every available command',
    run: () => {
      print('Available commands:', 'accent')
      commands.forEach((c) => {
        const usage = c.args ? `${c.name} ${c.args}` : c.name
        print(`  ${usage.padEnd(20)} ${c.description}`, 'muted')
      })
      print('')
      print('Tip: ↑/↓ for history, Tab to complete, Ctrl+L to clear.', 'muted')
    },
  },
  {
    name: 'whoami',
    description: 'Who is behind this portfolio',
    run: () => {
      printAll([
        'Jordi Osarenkhoe — frontend developer.',
        'I build, optimize and fix Nuxt.js & Vue.js apps.',
        '',
        'Currently: shipping Vue 3 + TypeScript in production.',
        "Type 'social' for links, 'resume' for the PDF, 'contact' to reach me.",
      ])
    },
  },
  {
    name: 'ls',
    description: 'List the files in the current directory',
    run: () => {
      print('projects/', 'accent')
      files.forEach((f) => print(f.name, 'success'))
      print('resume.pdf', 'muted')
      print('README.md', 'muted')
    },
  },
  {
    name: 'cd',
    args: '<dir>',
    description: 'Navigate to a section (cd projects, cd ..)',
    run: ([target]) => {
      if (!target || target === '~' || target === '..' || target === '/') {
        cwd.value = '~/portfolio'
        router.push('/')
        return
      }
      const name = target.replace(/\/$/, '').toLowerCase()
      const match = files.find(
        (f) => f.name.toLowerCase().replace('.vue', '') === name || f.path === `/${name}`,
      )
      if (!match) {
        print(`cd: no such directory: ${target}`, 'error')
        return
      }
      cwd.value = match.path === '/' ? '~/portfolio' : `~/portfolio${match.path}`
      router.push(match.path)
    },
  },
  {
    name: 'pwd',
    description: 'Print the current directory',
    run: () => print(cwd.value.replace('~', '/home/jordi')),
  },
  {
    name: 'cat',
    args: '<file>',
    description: 'Print what a file is for',
    run: ([target]) => {
      if (!target) {
        print('cat: missing file operand', 'error')
        return
      }
      const blurb = FILE_BLURBS[target.toLowerCase()]
      if (blurb) print(blurb)
      else print(`cat: ${target}: No such file or directory`, 'error')
    },
  },
  {
    name: 'projects',
    description: 'List every project',
    run: () => {
      projects.forEach((p) => {
        print(`[${p.id}] ${p.title}${p.featured ? '  ★' : ''}`, 'success')
        print(`     ${p.tech.join(' · ')}`, 'muted')
      })
      print('')
      print("Run 'open <name or id>' to read the case study.", 'muted')
    },
  },
  {
    name: 'open',
    args: '<project|link>',
    description: 'Open a project case study or an external link',
    run: ([target]) => {
      if (!target) {
        print('open: what should I open? Try `open portfolio` or `open github`.', 'error')
        return
      }
      const key = target.toLowerCase()

      if (SOCIALS[key]) {
        print(`Opening ${SOCIALS[key]}`, 'accent', SOCIALS[key])
        openExternal(SOCIALS[key])
        return
      }

      const project =
        projects.find((p) => String(p.id) === key) ??
        projects.find((p) => p.title.toLowerCase().includes(key))

      if (!project) {
        print(`open: no project matching "${target}"`, 'error')
        print("Run 'projects' to see the list.", 'muted')
        return
      }

      print(`Opening ${project.title}…`, 'success')
      router.push(`/projects/${project.id}`)
    },
  },
  {
    name: 'social',
    description: 'Show my links',
    run: () => {
      print('github     https://github.com/jordiop', 'accent', SOCIALS.github)
      print('linkedin   https://www.linkedin.com/in/jordiop/', 'accent', SOCIALS.linkedin)
      print('twitter    https://twitter.com/jordiscript', 'accent', SOCIALS.twitter)
      print('')
      print("Run 'open github' to launch one.", 'muted')
    },
  },
  {
    name: 'contact',
    description: 'How to reach me',
    run: () => {
      print('jordiosarenkhoe@outlook.es', 'accent')
      print('Opening your mail client…', 'muted')
      window.location.href = 'mailto:jordiosarenkhoe@outlook.es'
    },
  },
  {
    name: 'resume',
    description: 'Download my resume as a PDF',
    run: () => {
      print('Downloading resume.pdf…', 'success')
      downloadResume()
    },
  },
  {
    name: 'theme',
    args: '[dark|light]',
    description: 'Switch the color theme',
    run: ([mode]) => {
      if (!mode) {
        print(`Current theme: ${isDarkMode.value ? 'Dark+' : 'Light+'}`)
        print('Usage: theme dark | theme light', 'muted')
        return
      }
      if (mode !== 'dark' && mode !== 'light') {
        print(`theme: unknown theme "${mode}" — expected dark or light`, 'error')
        return
      }
      setTheme(mode === 'dark')
      print(`Theme set to ${mode === 'dark' ? 'Dark+' : 'Light+'}`, 'success')
    },
  },
  {
    name: 'neofetch',
    description: 'System information, obviously',
    run: () => {
      const stack = [
        'jordi@portfolio',
        '-----------------',
        'OS: Vue 3 (Composition API)',
        'Host: Vite 6 · Vercel',
        'Kernel: TypeScript 5.7',
        'Shell: tab-portfolio',
        'DE: VS Code (Dark+)',
        `Theme: ${isDarkMode.value ? 'Dark+' : 'Light+'}`,
        'Styling: Tailwind CSS v4',
        `Uptime: ${Math.round(performance.now() / 1000)}s this session`,
        `Resolution: ${window.innerWidth}x${window.innerHeight}`,
      ]
      const logo = [
        '      ▄█▄      ',
        '    ▄█████▄    ',
        '  ▄███▀ ▀███▄  ',
        ' ████     ████ ',
        '  ▀███▄ ▄███▀  ',
        '    ▀█████▀    ',
        '      ▀█▀      ',
      ]
      const rows = Math.max(stack.length, logo.length)
      for (let i = 0; i < rows; i++) {
        const left = (logo[i] ?? '').padEnd(16)
        print(`${left}${stack[i] ?? ''}`, i < 2 ? 'accent' : 'default')
      }
    },
  },
  {
    name: 'date',
    description: 'Print the current date and time',
    run: () => print(new Date().toString()),
  },
  {
    name: 'echo',
    args: '<text>',
    description: 'Print text back at you',
    run: (args) => print(args.join(' ')),
  },
  {
    name: 'history',
    description: 'Show the commands you have run',
    run: () => history.value.forEach((cmd, i) => print(`  ${String(i + 1).padStart(3)}  ${cmd}`, 'muted')),
  },
  {
    name: 'sudo',
    args: '<command>',
    description: 'Nice try',
    run: () => {
      print('jordi is not in the sudoers file. This incident has been reported.', 'error')
    },
  },
  {
    name: 'clear',
    description: 'Clear the terminal',
    run: () => (lines.value = []),
  },
  {
    name: 'exit',
    description: 'Close the terminal panel',
    run: () => {
      print('Bye 👋', 'muted')
      setTimeout(() => toggleTerminal(), 220)
    },
  },
]

const commandNames = commands.map((c) => c.name)

/* ── Execution ──────────────────────────────────────────── */

const runCommand = async (raw: string) => {
  const trimmed = raw.trim()
  print(`${cwd.value} $ ${trimmed}`, 'muted')

  if (!trimmed) return

  history.value.push(trimmed)
  historyIndex.value = -1

  const [name, ...args] = trimmed.split(/\s+/)
  const command = commands.find((c) => c.name === name.toLowerCase())

  if (!command) {
    print(`${name}: command not found`, 'error')
    print("Type 'help' to see what this shell can do.", 'muted')
    return
  }

  await command.run(args)
}

const submit = async () => {
  const raw = input.value
  input.value = ''
  await runCommand(raw)
  scrollToBottom()
}

/** Tab completion: command names first, then arguments for known commands. */
const complete = () => {
  const parts = input.value.split(/\s+/)
  const isFirstWord = parts.length === 1

  const candidates = isFirstWord
    ? commandNames
    : buildArgCandidates(parts[0].toLowerCase())

  const prefix = (parts[parts.length - 1] ?? '').toLowerCase()
  const matches = candidates.filter((c) => c.toLowerCase().startsWith(prefix))

  if (matches.length === 0) return

  if (matches.length === 1) {
    parts[parts.length - 1] = matches[0]
    input.value = parts.join(' ')
    return
  }

  print(`${cwd.value} $ ${input.value}`, 'muted')
  print(matches.join('   '), 'muted')
  scrollToBottom()
}

const buildArgCandidates = (command: string): string[] => {
  switch (command) {
    case 'cd':
      return files.map((f) => f.name.replace('.vue', '').toLowerCase())
    case 'cat':
      return files.map((f) => f.name)
    case 'open':
      return [...projects.map((p) => p.title.toLowerCase().split(' ')[0]), ...Object.keys(SOCIALS)]
    case 'theme':
      return ['dark', 'light']
    default:
      return []
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    e.preventDefault()
    complete()
    return
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (history.value.length === 0) return
    historyIndex.value =
      historyIndex.value === -1
        ? history.value.length - 1
        : Math.max(0, historyIndex.value - 1)
    input.value = history.value[historyIndex.value]
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (historyIndex.value === -1) return
    const next = historyIndex.value + 1
    if (next >= history.value.length) {
      historyIndex.value = -1
      input.value = ''
    } else {
      historyIndex.value = next
      input.value = history.value[next]
    }
    return
  }

  if (e.ctrlKey && e.key.toLowerCase() === 'c') {
    e.preventDefault()
    print(`${cwd.value} $ ${input.value}^C`, 'muted')
    input.value = ''
    scrollToBottom()
    return
  }

  if (e.ctrlKey && e.key.toLowerCase() === 'l') {
    e.preventDefault()
    lines.value = []
  }
}

/* ── Resizing ───────────────────────────────────────────── */

const startResize = (event: PointerEvent) => {
  event.preventDefault()
  const startY = event.clientY
  const startHeight = panelHeight.value

  const onMove = (e: PointerEvent) => {
    const next = startHeight + (startY - e.clientY)
    panelHeight.value = Math.min(Math.max(next, 120), window.innerHeight - 160)
  }

  const onUp = () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

/* ── Lifecycle ──────────────────────────────────────────── */

const greet = () => {
  print('tab-portfolio shell — Jordi Osarenkhoe', 'accent')
  print("Type 'help' for commands, or try 'whoami', 'projects', 'neofetch'.", 'muted')
  print('')
}

watch(isTerminalVisible, (visible) => {
  if (!visible) return
  if (lines.value.length === 0) greet()
  nextTick(() => inputRef.value?.focus())
})

onMounted(() => {
  if (isTerminalVisible.value && lines.value.length === 0) greet()
})

onUnmounted(() => {
  /* pointer listeners are torn down in onUp; nothing else to clean up */
})

defineExpose({
  /** Lets the menu bar run a task in the terminal. */
  execute: async (command: string) => {
    input.value = ''
    await runCommand(command)
    scrollToBottom()
    nextTick(() => inputRef.value?.focus())
  },
})
</script>

<template>
  <section
    v-show="isTerminalVisible"
    class="terminal"
    :style="{ height: `${panelHeight}px` }"
    @click="inputRef?.focus()"
  >
    <div class="resize-handle" @pointerdown="startResize"></div>

    <header class="terminal-header">
      <div class="terminal-tabs">
        <button class="terminal-tab active">TERMINAL</button>
        <button class="terminal-tab" @click.stop>OUTPUT</button>
        <button class="terminal-tab" @click.stop>PORTS</button>
      </div>
      <div class="terminal-actions">
        <span class="shell-name">bash</span>
        <button class="terminal-btn" title="Clear terminal" @click.stop="lines = []">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
        </button>
        <button class="terminal-btn" title="Close panel (Ctrl+`)" @click.stop="toggleTerminal">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 4l8 8M12 4l-8 8"/></svg>
        </button>
      </div>
    </header>

    <div ref="bodyRef" class="terminal-body">
      <div v-for="line in lines" :key="line.id" class="terminal-line" :class="line.tone">
        <a v-if="line.href" :href="line.href" target="_blank" rel="noopener" @click.stop>{{ line.text }}</a>
        <template v-else>{{ line.text || ' ' }}</template>
      </div>

      <div class="terminal-input-row">
        <span class="prompt">{{ cwd }}</span>
        <span class="prompt-sign">$</span>
        <input
          ref="inputRef"
          v-model="input"
          class="terminal-input"
          type="text"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          aria-label="Terminal input"
          @keydown="onKeydown"
          @keydown.enter="submit"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.terminal {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border-top: 1px solid var(--chrome-border);
  font-family: var(--font-mono);
  flex-shrink: 0;
  min-height: 120px;
}

.resize-handle {
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  height: 5px;
  cursor: ns-resize;
  z-index: 5;
}

.resize-handle:hover {
  background: var(--focus-blue);
}

.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  padding: 0 8px 0 12px;
  flex-shrink: 0;
}

.terminal-tabs {
  display: flex;
  gap: 14px;
}

.terminal-tab {
  background: transparent;
  border: none;
  border-bottom: 1px solid transparent;
  color: var(--text-secondary);
  font-family: var(--font-ui);
  font-size: 11px;
  letter-spacing: 0.04em;
  padding: 6px 0;
  cursor: pointer;
}

.terminal-tab:hover {
  color: var(--text-primary);
}

.terminal-tab.active {
  color: var(--text-primary);
  border-bottom-color: var(--focus-blue);
}

.terminal-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.shell-name {
  font-family: var(--font-ui);
  font-size: 11px;
  color: var(--text-secondary);
  margin-right: 4px;
}

.terminal-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--icon-color);
  cursor: pointer;
}

.terminal-btn:hover {
  background: var(--list-hover-bg);
  color: var(--icon-active);
}

.terminal-body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 12px 12px;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--text-primary);
}

.terminal-line {
  white-space: pre-wrap;
  word-break: break-word;
}

.terminal-line.muted {
  color: var(--text-secondary);
}

.terminal-line.error {
  color: #f14c4c;
}

.terminal-line.success {
  color: #89d185;
}

.terminal-line.accent {
  color: var(--accent-color);
}

.terminal-line a {
  color: inherit;
  text-decoration: underline;
}

.terminal-input-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.prompt {
  color: #89d185;
  flex-shrink: 0;
}

.prompt-sign {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.terminal-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: inherit;
  font-size: inherit;
  padding: 0;
  caret-color: var(--accent-color);
}

@media (max-width: 768px) {
  .terminal {
    font-size: 12px;
  }

  .terminal-tab:not(.active) {
    display: none;
  }
}
</style>
