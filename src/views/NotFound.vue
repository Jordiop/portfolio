<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { useSeoMeta } from "@unhead/vue";
import { useSiteMeta } from "@/composables/useSiteMeta";

interface Props {
    isCodeEditorVisible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isCodeEditorVisible: true,
});

const router = useRouter();
const route = useRoute();

useSeoMeta(
    useSiteMeta({
        title: "Page not found",
        description: "The page you were looking for does not exist.",
        path: route.fullPath,
    }),
);

const goHome = () => router.push("/");
const goProjects = () => router.push("/projects");
</script>

<template>
    <div
        v-if="props.isCodeEditorVisible"
        class="code-editor hidden md:block overflow-hidden md:overflow-auto"
    >
        <div class="code-content">
            <div class="code-line">
                <div class="line-numbers">1</div>
                <div class="code-text comment">// 404</div>
            </div>
            <div class="code-line">
                <div class="line-numbers">2</div>
                <div class="code-text keyword">throw new Error(</div>
            </div>
            <div class="code-line">
                <div class="line-numbers">3</div>
                <div class="code-text string">
                    &nbsp;&nbsp;"Route not found: {{ route.fullPath }}"
                </div>
            </div>
            <div class="code-line">
                <div class="line-numbers">4</div>
                <div class="code-text keyword">)</div>
            </div>
        </div>
    </div>
    <div class="preview" :class="{ 'full-width': !props.isCodeEditorVisible }">
        <div class="not-found-page">
            <div class="not-found-code">404</div>
            <h1 class="not-found-title">This page doesn't exist</h1>
            <p class="not-found-message">
                The page <code>{{ route.fullPath }}</code> couldn't be found.
                It may have been moved, renamed, or never existed at all.
            </p>
            <div class="not-found-actions">
                <button class="btn btn-primary" @click="goHome">
                    Back to home
                </button>
                <button class="btn btn-secondary" @click="goProjects">
                    Browse projects
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.preview.full-width {
    width: 100%;
    margin-left: 0;
}

.not-found-page {
    max-width: 640px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem;
    padding-top: 5rem;
    text-align: center;
    box-sizing: border-box;
    animation: fadeInUp 0.6s ease;
}

.not-found-code {
    font-size: clamp(4rem, 12vw, 8rem);
    font-weight: 700;
    line-height: 1;
    margin-bottom: 1rem;
    background: linear-gradient(
        135deg,
        var(--accent-color),
        var(--accent-secondary)
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.04em;
}

.not-found-title {
    font-size: clamp(1.5rem, 4vw, 2.25rem);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 1rem;
}

.not-found-message {
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.6;
    margin: 0 auto 2rem;
    max-width: 480px;
}

.not-found-message code {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 2px 6px;
    font-family: inherit;
    font-size: 0.9em;
    color: var(--text-primary);
}

.not-found-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.btn {
    border: none;
    padding: 14px 28px;
    border-radius: 8px;
    font-family: inherit;
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 10px;
}

.btn-primary {
    background: var(--btn-primary-bg);
    color: var(--btn-primary-text);
    box-shadow: var(--shadow-medium);
}

.btn-primary:hover {
    background: var(--accent-secondary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-heavy);
}

.btn-secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.btn-secondary:hover {
    background: var(--bg-code-editor);
    border-color: var(--accent-color);
    transform: translateY(-2px);
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .not-found-page {
        padding: 1rem;
        padding-top: 4rem;
    }

    .not-found-actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }
}
</style>
