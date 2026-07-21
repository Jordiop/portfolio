<script setup lang="ts">
/**
 * Toast stack anchored above the status bar, matching VS Code's notifications.
 */
import { useWorkbench } from '@/composables/useWorkbench'

const { notifications, dismissNotification } = useWorkbench()
</script>

<template>
  <TransitionGroup tag="div" name="toast" class="toasts">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="toast"
      :class="notification.severity"
      role="status"
    >
      <span class="toast-icon">
        <svg v-if="notification.severity === 'warning'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4M12 17h.01"/></svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
      </span>
      <div class="toast-body">
        <div class="toast-message">{{ notification.message }}</div>
        <div v-if="notification.detail" class="toast-detail">{{ notification.detail }}</div>
      </div>
      <button class="toast-close" aria-label="Dismiss" @click="dismissNotification(notification.id)">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 4l8 8M12 4l-8 8"/></svg>
      </button>
    </div>
  </TransitionGroup>
</template>

<style scoped>
.toasts {
  position: fixed;
  right: 16px;
  bottom: 34px;
  z-index: 9000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: min(380px, calc(100vw - 32px));
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 10px 10px 10px 12px;
  background: var(--widget-bg);
  border: 1px solid var(--widget-border);
  border-radius: 5px;
  box-shadow: var(--shadow-heavy);
  font-family: var(--font-ui);
  pointer-events: auto;
}

.toast-icon {
  color: var(--focus-blue);
  flex-shrink: 0;
  margin-top: 1px;
}

.toast.warning .toast-icon {
  color: #cca700;
}

.toast-body {
  flex: 1;
  min-width: 0;
}

.toast-message {
  font-size: 12.5px;
  color: var(--text-primary);
}

.toast-detail {
  font-size: 11.5px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  margin-top: 2px;
  word-break: break-all;
}

.toast-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--icon-color);
  cursor: pointer;
  flex-shrink: 0;
}

.toast-close:hover {
  background: var(--list-hover-bg);
  color: var(--icon-active);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(12px);
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: none;
  }
}

@media (max-width: 768px) {
  .toasts {
    bottom: 92px;
    left: 16px;
    right: 16px;
    max-width: none;
  }
}
</style>
