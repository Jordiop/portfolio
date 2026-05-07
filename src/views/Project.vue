<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useHead } from "@unhead/vue";
import { useProjects, type Project } from "@/composables/useProjects";
import { useSiteMeta } from "@/composables/useSiteMeta";
import { createLines } from "@/composables/createLines";

interface Props {
    isCodeEditorVisible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isCodeEditorVisible: true,
});

const route = useRoute();
const router = useRouter();
const { getProjectById } = useProjects();

const projectId = computed(() => parseInt(route.params.id as string));
const project = computed<Project | undefined>(() =>
    getProjectById(projectId.value),
);

useHead(() => {
    const meta = useSiteMeta(
        project.value
            ? {
                  title: project.value.title,
                  description: project.value.description,
                  image: project.value.image,
                  path: `/projects/${project.value.id}`,
              }
            : {},
    );
    return {
        title: meta.title,
        meta: [
            { name: "description", content: meta.description },
            { property: "og:title", content: meta.ogTitle },
            { property: "og:description", content: meta.ogDescription },
            { property: "og:image", content: meta.ogImage },
            { property: "og:url", content: meta.ogUrl },
            { property: "og:type", content: meta.ogType },
            { name: "twitter:card", content: meta.twitterCard },
            { name: "twitter:title", content: meta.twitterTitle },
            { name: "twitter:description", content: meta.twitterDescription },
            { name: "twitter:image", content: meta.twitterImage },
        ],
    };
});

const codeLines = computed(() => {
    if (!project.value) {
        return createLines([
            { content: "// Project not found", class: "comment" },
        ]);
    }

    const p = project.value;
    return createLines([
        { content: '<' + 'script setup lang="ts">', class: "keyword" },
        { content: "import { useRoute } from 'vue-router'", class: "keyword" },
        {
            content: "import { useProjects } from '@/composables/useProjects'",
            class: "keyword",
        },
        "",
        { content: "const route = useRoute()", class: "variable" },
        {
            content: "const { getProjectById } = useProjects()",
            class: "variable",
        },
        {
            content: `const project = getProjectById(${p.id})`,
            class: "variable",
        },
        "",
        { content: "const projectDetails = {", class: "variable" },
        { content: `  title: "${p.title}",`, class: "string" },
        { content: `  description: "${p.description}",`, class: "string" },
        { content: "  tech: [", class: "punctuation" },
        ...p.tech.map((tech) => ({
            content: `    "${tech}",`,
            class: "string",
        })),
        { content: "  ],", class: "punctuation" },
        { content: `  github: "${p.github || "N/A"}",`, class: "string" },
        { content: `  demo: "${p.demo || "N/A"}",`, class: "string" },
        { content: `  featured: ${p.featured},`, class: "boolean" },
        { content: "}", class: "punctuation" },
        { content: "</" + "script>", class: "keyword" },
        "",
        { content: "<template>", class: "keyword" },
        { content: '  <div class="project-details-page">', class: "punctuation" },
        { content: '    <button @click="router.push(\'/projects\')"', class: "punctuation" },
        { content: '      class="back-button-floating">', class: "" },
        { content: "      Back to Projects", class: "string" },
        { content: "    </button>", class: "punctuation" },
        { content: '    <div class="project-header">', class: "punctuation" },
        { content: '      <span v-if="project.featured"', class: "" },
        { content: '        class="featured-badge-large">Featured Project</span>', class: "string" },
        { content: '      <h1 class="project-title">{{ project.title }}</h1>', class: "" },
        { content: '      <p class="project-description">{{ project.description }}</p>', class: "" },
        { content: "    </div>", class: "punctuation" },
        { content: '    <div class="project-image-container">', class: "punctuation" },
        { content: '      <img :src="project.image" :alt="project.title"', class: "" },
        { content: '        class="project-main-image" />', class: "" },
        { content: "    </div>", class: "punctuation" },
        { content: '    <div class="tech-section">', class: "punctuation" },
        { content: "      <h2>Technologies</h2>", class: "" },
        { content: '      <div class="tech-grid">', class: "punctuation" },
        { content: '        <span v-for="(tech, index) in project.tech"', class: "" },
        { content: '          :key="index" class="tech-badge-large">{{ tech }}</span>', class: "" },
        { content: "      </div>", class: "punctuation" },
        { content: "    </div>", class: "punctuation" },
        { content: '    <div class="project-actions">', class: "punctuation" },
        { content: '      <a v-if="project.github" :href="project.github"', class: "" },
        { content: '        target="_blank" class="btn btn-primary">', class: "" },
        { content: "        View on GitHub", class: "string" },
        { content: "      </a>", class: "punctuation" },
        { content: '      <a v-if="project.demo" :href="project.demo"', class: "" },
        { content: '        target="_blank" class="btn btn-secondary">', class: "" },
        { content: "        Live Demo", class: "string" },
        { content: "      </a>", class: "punctuation" },
        { content: "    </div>", class: "punctuation" },
        { content: "  </div>", class: "punctuation" },
        { content: "</template>", class: "keyword" },
    ]);
});

watchEffect(() => {
    if (!Number.isFinite(projectId.value) || !project.value) {
        router.replace({ name: "not-found" });
    }
});
</script>

<template>
    <template v-if="project">
        <div
            v-if="props.isCodeEditorVisible"
            class="code-editor hidden md:block overflow-hidden md:overflow-auto"
        >
            <div class="code-content">
                <div
                    class="code-line"
                    v-for="line in codeLines"
                    :key="line.num"
                >
                    <div class="line-numbers">{{ line.num }}</div>
                    <div class="code-text" :class="line.class">
                        {{ line.content }}
                    </div>
                </div>
            </div>
        </div>
        <div
            class="preview"
            :class="{ 'full-width': !props.isCodeEditorVisible }"
        >
            <button
                @click="router.push('/projects')"
                class="back-button-floating"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span class="back-button-text">Back to Projects</span>
            </button>

            <div class="project-details-page">
                <div class="project-header">
                    <div class="project-badge-container">
                        <span
                            v-if="project.featured"
                            class="featured-badge-large"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <polygon
                                    points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                                ></polygon>
                            </svg>
                            Featured Project
                        </span>
                    </div>
                    <h1 class="project-title">{{ project.title }}</h1>
                    <p class="project-description">{{ project.description }}</p>
                    <div
                        v-if="project.role || project.durationLabel || project.year"
                        class="project-meta-strip"
                    >
                        <span v-if="project.role" class="meta-chip">
                            <span class="meta-label">Role</span>
                            {{ project.role }}
                        </span>
                        <span v-if="project.durationLabel" class="meta-chip">
                            <span class="meta-label">Duration</span>
                            {{ project.durationLabel }}
                        </span>
                        <span v-if="project.year" class="meta-chip">
                            <span class="meta-label">Year</span>
                            {{ project.year }}
                        </span>
                    </div>
                </div>

                <div class="project-image-container">
                    <img
                        :src="project.image"
                        :alt="project.title"
                        class="project-main-image"
                    />
                </div>

                <div class="tech-section">
                    <h2 class="section-title">Technologies</h2>
                    <div class="tech-grid">
                        <span
                            v-for="(tech, index) in project.tech"
                            :key="index"
                            class="tech-badge-large"
                        >
                            {{ tech }}
                        </span>
                    </div>
                </div>

                <div
                    v-if="project.metrics && project.metrics.length"
                    class="metrics-section"
                >
                    <div class="metrics-grid">
                        <div
                            v-for="(metric, index) in project.metrics"
                            :key="index"
                            class="metric-card"
                        >
                            <div class="metric-value">{{ metric.value }}</div>
                            <div class="metric-label">{{ metric.label }}</div>
                        </div>
                    </div>
                </div>

                <section v-if="project.problem" class="case-section">
                    <h2 class="section-title">The problem</h2>
                    <p class="case-prose">{{ project.problem }}</p>
                </section>

                <section v-if="project.approach" class="case-section">
                    <h2 class="section-title">My approach</h2>
                    <p class="case-prose">{{ project.approach }}</p>
                </section>

                <section v-if="project.outcome" class="case-section">
                    <h2 class="section-title">Outcome</h2>
                    <p class="case-prose">{{ project.outcome }}</p>
                </section>

                <section
                    v-if="project.screenshots && project.screenshots.length"
                    class="case-section"
                >
                    <h2 class="section-title">Screenshots</h2>
                    <figure
                        v-for="(shot, index) in project.screenshots"
                        :key="index"
                        class="screenshot-figure"
                    >
                        <img
                            :src="shot.src"
                            :alt="shot.alt"
                            class="screenshot-image"
                            loading="lazy"
                        />
                        <figcaption v-if="shot.caption" class="screenshot-caption">
                            {{ shot.caption }}
                        </figcaption>
                    </figure>
                </section>

                <section
                    v-if="project.learnings && project.learnings.length"
                    class="case-section"
                >
                    <h2 class="section-title">What I learned</h2>
                    <ul class="learnings-list">
                        <li
                            v-for="(item, index) in project.learnings"
                            :key="index"
                        >
                            {{ item }}
                        </li>
                    </ul>
                </section>

                <div class="project-actions">
                    <a
                        v-if="project.github"
                        :href="project.github"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn btn-primary"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path
                                d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                            ></path>
                        </svg>
                        View on GitHub
                    </a>
                    <a
                        v-if="project.demo"
                        :href="project.demo"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn btn-secondary"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path
                                d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                            ></path>
                            <polyline points="15,3 21,3 21,9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        Live Demo
                    </a>
                </div>
            </div>
        </div>
    </template>
</template>

<style scoped>
/* Use global preview styles for proper 50/50 flex layout */

.preview.full-width {
    width: 100%;
    margin-left: 0;
}

.project-details-page {
    max-width: 900px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem;
    padding-top: 5rem;
    box-sizing: border-box;
    animation: fadeInUp 0.6s ease;
}

.back-button-floating {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    color: var(--text-primary);
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-medium);
    backdrop-filter: blur(10px);
}

.back-button-floating:hover {
    background: var(--bg-code-editor);
    border-color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-heavy);
}

.back-button-text {
    display: inline;
}

@media (max-width: 768px) {
    .back-button-floating {
        top: 10px;
        right: 10px;
        padding: 10px 16px;
    }

    .back-button-text {
        display: none;
    }

    .project-details-page {
        padding-top: 4rem;
    }
}

.project-header {
    margin-bottom: 3rem;
    text-align: center;
}

.project-badge-container {
    margin-bottom: 1rem;
}

.featured-badge-large {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(
        135deg,
        var(--accent-color),
        var(--accent-secondary)
    );
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: var(--shadow-medium);
}

.project-title {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: bold;
    margin: 1rem 0;
    background: linear-gradient(
        135deg,
        var(--accent-color),
        var(--accent-secondary)
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.project-description {
    font-size: 1.2rem;
    line-height: 1.8;
    color: var(--text-secondary);
    max-width: 400px;
    margin: 0 auto;
}

.project-meta-strip {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    margin-top: 1.5rem;
}

.meta-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 999px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    font-size: 0.875rem;
    font-weight: 500;
}

.meta-chip .meta-label {
    color: var(--text-secondary);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.metrics-section {
    margin: 3rem 0;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
}

.metric-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.25rem 1rem;
    text-align: center;
    transition: all 0.3s ease;
}

.metric-card:hover {
    border-color: var(--accent-color);
    transform: translateY(-2px);
}

.metric-value {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(
        135deg,
        var(--accent-color),
        var(--accent-secondary)
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
}

.metric-label {
    color: var(--text-secondary);
    font-size: 0.8rem;
    margin-top: 4px;
    font-weight: 500;
}

.case-section {
    margin: 3rem 0;
}

.case-prose {
    color: var(--text-primary);
    font-size: 1.05rem;
    line-height: 1.8;
    max-width: 65ch;
    margin: 0;
    white-space: pre-line;
}

.screenshot-figure {
    margin: 1.5rem 0 0;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow-medium);
    background: var(--bg-secondary);
}

.screenshot-image {
    width: 100%;
    height: auto;
    display: block;
}

.screenshot-caption {
    padding: 12px 16px;
    color: var(--text-secondary);
    font-size: 0.9rem;
    border-top: 1px solid var(--border-color);
}

.learnings-list {
    color: var(--text-primary);
    font-size: 1.05rem;
    line-height: 1.7;
    padding-left: 1.25rem;
    margin: 0;
    max-width: 65ch;
}

.learnings-list li {
    margin-bottom: 0.75rem;
}

.project-image-container {
    margin: 3rem 0;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--shadow-heavy);
    transition: transform 0.3s ease;
}

.project-image-container:hover {
    transform: translateY(-4px);
}

.project-main-image {
    width: 100%;
    height: auto;
    display: block;
}

.tech-section {
    margin: 3rem 0;
}

.section-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
}

.tech-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.tech-badge-large {
    background: var(--bg-secondary);
    color: var(--text-primary);
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 500;
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
}

.tech-badge-large:hover {
    background: var(--bg-code-editor);
    border-color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-light);
}

.project-actions {
    display: flex;
    gap: 1rem;
    margin-top: 3rem;
    justify-content: center;
    flex-wrap: wrap;
}

.btn-primary {
    background: var(--btn-primary-bg);
    color: var(--btn-primary-text);
    border: none;
    padding: 14px 28px;
    border-radius: 8px;
    font-family: inherit;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s ease;
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
    padding: 14px 28px;
    border-radius: 8px;
    font-family: inherit;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s ease;
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
    .project-details-page {
        padding: 1rem;
        padding-top: 4rem;
    }

    .project-title {
        font-size: 2rem;
    }

    .project-description {
        font-size: 1rem;
    }

    .project-actions {
        flex-direction: column;
    }

    .btn-primary,
    .btn-secondary {
        width: 100%;
        justify-content: center;
    }
}
</style>
