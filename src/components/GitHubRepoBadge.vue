<script setup lang="ts">
import { computed } from "vue";

interface Props {
    stars: number;
    forks: number;
    updatedAt: string;
    isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
});

function getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) {
        const mins = Math.floor(diffInSeconds / 60);
        return `${mins} ${mins === 1 ? "minute" : "minutes"} ago`;
    }
    if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }
    if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
    if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months} ${months === 1 ? "month" : "months"} ago`;
    }
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
}

const relativeTime = computed(() => getRelativeTime(props.updatedAt));
</script>

<template>
    <div v-if="!isLoading" class="github-badge">
        <div class="badge-item">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <polygon
                    points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                ></polygon>
            </svg>
            <span>{{ stars }}</span>
        </div>

        <div class="badge-separator">|</div>

        <div class="badge-item">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <circle cx="12" cy="18" r="3"></circle>
                <circle cx="6" cy="6" r="3"></circle>
                <circle cx="18" cy="6" r="3"></circle>
                <path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9"></path>
                <path d="M12 12v3"></path>
            </svg>
            <span>{{ forks }}</span>
        </div>

        <div class="badge-separator">|</div>

        <div class="badge-item updated">
            <span>Updated {{ relativeTime }}</span>
        </div>
    </div>

    <div v-else class="github-badge skeleton">
        <div class="skeleton-badge"></div>
    </div>
</template>

<style scoped>
.github-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 0.75rem;
    flex-wrap: wrap;
}

.badge-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.badge-item svg {
    flex-shrink: 0;
}

.badge-separator {
    opacity: 0.3;
}

.badge-item.updated {
    font-style: italic;
}

.github-badge.skeleton {
    height: 20px;
}

.skeleton-badge {
    width: 200px;
    height: 16px;
    background: linear-gradient(
        90deg,
        var(--bg-secondary) 25%,
        var(--border-color) 50%,
        var(--bg-secondary) 75%
    );
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
    .github-badge {
        font-size: 0.7rem;
    }

    .badge-item svg {
        width: 12px;
        height: 12px;
    }
}
</style>
