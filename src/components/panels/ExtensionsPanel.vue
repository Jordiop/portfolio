<script setup lang="ts">
/**
 * Extensions panel — my stack, rendered as the list of "installed extensions".
 * Reuses the same icon components the About page uses for its tech grid.
 */
import { type Component } from 'vue'
import IconVue from '@/components/icons/IconVue.vue'
import IconTypeScript from '@/components/icons/IconTypeScript.vue'
import IconNuxt from '@/components/icons/IconNuxt.vue'
import IconTailwind from '@/components/icons/IconTailwind.vue'
import IconNode from '@/components/icons/IconNode.vue'
import IconPython from '@/components/icons/IconPython.vue'
import IconPostgreSQL from '@/components/icons/IconPostgreSQL.vue'
import IconGit from '@/components/icons/IconGit.vue'
import IconDocker from '@/components/icons/IconDocker.vue'

interface Extension {
  name: string
  publisher: string
  description: string
  icon: Component
  color?: string
  /** Years of use, shown where VS Code shows the version */
  version: string
}

const installed: Extension[] = [
  { name: 'Vue.js', publisher: 'jordiop', description: 'Daily driver. Composition API, Pinia, SFCs.', icon: IconVue, color: '#42b883', version: 'v5y' },
  { name: 'Nuxt.js', publisher: 'jordiop', description: 'SSR, Nitro, hybrid rendering.', icon: IconNuxt, color: '#00dc82', version: 'v4y' },
  { name: 'TypeScript', publisher: 'jordiop', description: 'Strict mode, generics, type-safe APIs.', icon: IconTypeScript, color: '#3178c6', version: 'v4y' },
  { name: 'Tailwind CSS', publisher: 'jordiop', description: 'Utility-first styling, v4 config.', icon: IconTailwind, color: '#06b6d4', version: 'v3y' },
  { name: 'Node.js', publisher: 'jordiop', description: 'REST APIs, tooling, scripts.', icon: IconNode, color: '#339933', version: 'v4y' },
  { name: 'Python', publisher: 'jordiop', description: 'Automation, data wrangling, scripting.', icon: IconPython, version: 'v3y' },
  { name: 'PostgreSQL', publisher: 'jordiop', description: 'Schema design, query tuning.', icon: IconPostgreSQL, color: '#336791', version: 'v3y' },
  { name: 'Git', publisher: 'jordiop', description: 'Rebase-first workflow, clean history.', icon: IconGit, color: '#f05032', version: 'v5y' },
  { name: 'Docker', publisher: 'jordiop', description: 'Containerised dev + deploy pipelines.', icon: IconDocker, color: '#2496ed', version: 'v3y' },
]
</script>

<template>
  <div class="panel">
    <div class="panel-section-title">
      <span>INSTALLED — {{ installed.length }}</span>
    </div>

    <ul class="ext-list">
      <li v-for="ext in installed" :key="ext.name" class="ext">
        <component :is="ext.icon" :size="30" v-bind="ext.color ? { fill: ext.color } : {}" class="ext-icon" />
        <div class="ext-body">
          <div class="ext-row">
            <span class="ext-name">{{ ext.name }}</span>
            <span class="ext-version">{{ ext.version }}</span>
          </div>
          <div class="ext-desc">{{ ext.description }}</div>
          <div class="ext-publisher">{{ ext.publisher }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.ext-list {
  list-style: none;
  margin: 0;
  padding: 0 0 12px;
  overflow-y: auto;
}

.ext {
  display: flex;
  gap: 10px;
  padding: 8px 12px;
  cursor: default;
}

.ext:hover {
  background: var(--list-hover-bg);
}

.ext-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.ext-body {
  min-width: 0;
  flex: 1;
}

.ext-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.ext-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--explorer-fg);
}

.ext-version {
  margin-left: auto;
  font-size: 11px;
  color: var(--text-secondary);
}

.ext-desc {
  font-size: 11.5px;
  line-height: 1.35;
  color: var(--text-secondary);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.ext-publisher {
  font-size: 11px;
  color: var(--text-secondary);
  opacity: 0.8;
}
</style>
