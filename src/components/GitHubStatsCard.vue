<script setup lang="ts">
interface Props {
    label: string
    value: number | string
    icon?: string
    isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
})

// Format large numbers with commas
function formatNumber(num: number | string): string {
    if (typeof num === 'string') return num
    return num.toLocaleString()
}
</script>

<template>
    <div class="github-stat-card">
        <div v-if="isLoading" class="skeleton-loader">
            <div class="skeleton-icon"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-label"></div>
        </div>

        <div v-else class="stat-content">
            <div v-if="icon" class="stat-icon">
                {{ icon }}
            </div>

            <div class="stat-value">
                {{ formatNumber(value) }}
            </div>

            <div class="stat-label">
                {{ label }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.github-stat-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    min-height: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.github-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-light);
    border-color: var(--accent-color);
}

.stat-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.stat-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.stat-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--accent-color);
    line-height: 1;
}

.stat-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Skeleton loader */
.skeleton-loader {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
}

.skeleton-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(90deg, var(--bg-primary) 25%, var(--border-color) 50%, var(--bg-primary) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 50%;
}

.skeleton-text {
    width: 80px;
    height: 36px;
    background: linear-gradient(90deg, var(--bg-primary) 25%, var(--border-color) 50%, var(--bg-primary) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 6px;
}

.skeleton-label {
    width: 100px;
    height: 16px;
    background: linear-gradient(90deg, var(--bg-primary) 25%, var(--border-color) 50%, var(--bg-primary) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
}

@keyframes shimmer {
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
}

@media (max-width: 768px) {
    .github-stat-card {
        min-height: 120px;
        padding: 1.25rem;
    }

    .stat-value {
        font-size: 2rem;
    }

    .stat-label {
        font-size: 0.75rem;
    }
}
</style>
