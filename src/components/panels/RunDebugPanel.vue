<script setup lang="ts">
/**
 * Run and Debug panel — launch configurations that actually do something.
 * Each "config" maps onto a workbench action (open the terminal, download the
 * resume, jump to a route).
 */
import { useRouter } from 'vue-router'
import { useWorkbench } from '@/composables/useWorkbench'

const router = useRouter()
const { toggleTerminal, isTerminalVisible, downloadResume, openExternal, notify } = useWorkbench()

interface LaunchConfig {
  name: string
  type: string
  run: () => void
}

const configs: LaunchConfig[] = [
  {
    name: 'Launch Terminal',
    type: 'shell',
    run: () => {
      if (!isTerminalVisible.value) toggleTerminal()
    },
  },
  { name: 'Open resume.pdf', type: 'pdf', run: downloadResume },
  { name: 'Run Projects Showcase', type: 'vue', run: () => router.push('/projects') },
  { name: 'Attach to Photo Gallery', type: 'vue', run: () => router.push('/gallery') },
  {
    name: 'Debug: Send Me an Email',
    type: 'node',
    run: () => (window.location.href = 'mailto:jordiosarenkhoe@outlook.es'),
  },
  {
    name: 'Watch: GitHub Activity',
    type: 'node',
    run: () => openExternal('https://github.com/jordiop'),
  },
]

const runConfig = (config: LaunchConfig) => {
  notify(`Running "${config.name}"`, `Launch configuration · ${config.type}`)
  config.run()
}
</script>

<template>
  <div class="panel">
    <div class="panel-section-title">
      <span>RUN AND DEBUG</span>
    </div>

    <p class="panel-note">
      Pick a launch configuration to jump straight to the thing you came for.
    </p>

    <ul class="launch-list">
      <li v-for="config in configs" :key="config.name">
        <button class="launch" @click="runConfig(config)">
          <svg class="play" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="m8 5 12 7-12 7Z"/></svg>
          <span class="launch-name">{{ config.name }}</span>
          <span class="launch-type">{{ config.type }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.launch-list {
  list-style: none;
  margin: 0;
  padding: 0 0 12px;
  overflow-y: auto;
}

.launch {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 12px;
  background: transparent;
  border: none;
  border-left: 2px solid transparent;
  color: var(--explorer-fg);
  font-family: inherit;
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
}

.launch:hover {
  background: var(--list-hover-bg);
  border-left-color: var(--focus-blue);
}

.play {
  flex-shrink: 0;
  color: #89d185;
}

.launch-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.launch-type {
  font-size: 10.5px;
  font-family: var(--font-mono);
  color: var(--text-secondary);
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--list-hover-bg);
}
</style>
