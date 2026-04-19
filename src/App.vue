<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import IconMe from '@/components/icons/IconMe.vue'
import CommandPalette from '@/components/CommandPalette.vue'

const router = useRouter()
const route = useRoute()
const activeTab = ref('Home.vue')
const isDarkMode = ref(false)
const isLoading = ref(true)
const isCodeEditorVisible = ref(true)

const navigateTo = (path: string, tab: string) => {
  if (route.path !== path) {
    router.push(path)
    activeTab.value = tab
  } else {
    activeTab.value = tab
  }
}

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.body.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.body.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

const toggleCodeEditor = () => {
  isCodeEditorVisible.value = !isCodeEditorVisible.value
  localStorage.setItem('codeEditorVisible', isCodeEditorVisible.value.toString())
}

watch(() => route.path, (newPath) => {
  switch (newPath) {
    case '/':
      activeTab.value = 'Home.vue'
      break
    case '/projects':
      activeTab.value = 'Projects.vue'
      break
    case '/about':
      activeTab.value = 'About.vue'
      break
    case '/gallery':
      activeTab.value = 'Gallery.vue'
      break
  }
})

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  isDarkMode.value = savedTheme === 'dark'
  if (isDarkMode.value) document.body.classList.add('dark')
  else document.body.classList.remove('dark')

  const savedCodeEditorVisible = localStorage.getItem('codeEditorVisible')
  if (savedCodeEditorVisible !== null) {
    isCodeEditorVisible.value = savedCodeEditorVisible === 'true'
  }
  
  switch (route.path) {
    case '/':
      activeTab.value = 'Home.vue'
      break
    case '/projects':
      activeTab.value = 'Projects.vue'
      break
    case '/about':
      activeTab.value = 'About.vue'
      break
    case '/gallery':
      activeTab.value = 'Gallery.vue'
      break
  }

  const handleKeydown = (event: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const modifierKey = isMac ? event.metaKey : event.ctrlKey
    
    if (modifierKey && event.key === 'b') {
      event.preventDefault()
      toggleCodeEditor()
    }
  }
  
  document.addEventListener('keydown', handleKeydown)
  
  setTimeout(() => {
    isLoading.value = false
  }, 300)
})
</script>


<template>
  <div id="app">
    <CommandPalette />
    <div class="sidebar">
      <div class="sidebar-icon" @click="navigateTo('/', 'Home.vue')" :class="{ active: activeTab === 'Home.vue' }">
        <IconMe fill="currentColor" />
      </div>
      <div class="sidebar-icon" @click="navigateTo('/', 'Home.vue')" :class="{ active: activeTab === 'Home.vue' }">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
      </div>
      <div class="sidebar-icon" @click="navigateTo('/projects', 'Projects.vue')" :class="{ active: activeTab === 'Projects.vue' }">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>
      </div>
      <div class="sidebar-icon" @click="navigateTo('/about', 'About.vue')" :class="{ active: activeTab === 'About.vue' }">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>
      </div>
      <div class="sidebar-icon" @click="navigateTo('/gallery', 'Gallery.vue')" :class="{ active: activeTab === 'Gallery.vue' }">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
      </div>
      <div class="sidebar-icon" @click="toggleTheme">
        <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </div>
      <div class="sidebar-icon" @click="toggleCodeEditor" :class="{ 'active': !isCodeEditorVisible }" :title="isCodeEditorVisible ? 'Hide Code Editor (Cmd+B)' : 'Show Code Editor (Cmd+B)'">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      </div>
    </div>
    <div class="main-content">
      <div class="tab-bar">
        <div 
          class="tab" 
          :class="{ active: activeTab === 'Home.vue' }"
          @click="navigateTo('/', 'Home.vue')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Home.vue
        </div>
        <div 
          class="tab" 
          :class="{ active: activeTab === 'Projects.vue' }"
          @click="navigateTo('/projects', 'Projects.vue')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
          </svg>
          Projects.vue
        </div>
        <div
          class="tab"
          :class="{ active: activeTab === 'About.vue' }"
          @click="navigateTo('/about', 'About.vue')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="10" r="3"></circle>
            <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
          </svg>
          About.vue
        </div>
        <div
          class="tab"
          :class="{ active: activeTab === 'Gallery.vue' }"
          @click="navigateTo('/gallery', 'Gallery.vue')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          Gallery.vue
        </div>
      </div>
      <div class="content-area">
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-spinner">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </div>
        </div>
        <router-view v-slot="{ Component }">
            <component :is="Component" :key="route.path" :isCodeEditorVisible="isCodeEditorVisible" />
        </router-view>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(248, 248, 252, 0.8);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: opacity 0.3s ease;
}

.dark .loading-overlay {
  background: rgba(47, 45, 54, 0.8);
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
}

.loading-spinner svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab svg {
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.tab.active svg {
  opacity: 1;
}

@media (max-width: 768px) {
  .tab svg {
    display: none;
  }
}
</style>