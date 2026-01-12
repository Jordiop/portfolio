<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { createLines } from "@/composables/createLines";
import { useProjects } from "@/composables/useProjects";
import { useGithubRepo } from "@/composables/useGithubRepo";
import { parseGithubUrl } from "@/config/github";
import GitHubRepoBadge from "@/components/GitHubRepoBadge.vue";

interface Props {
    isCodeEditorVisible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isCodeEditorVisible: true,
});

const router = useRouter();
const { getAllProjects } = useProjects();
const projects = getAllProjects();

const codeLines = createLines([
    { content: "<template>", class: "keyword" },
    { content: '  <div class="projects-preview">', class: "punctuation" },
    { content: '    <div class="projects-header">', class: "punctuation" },
    { content: "      <h2>", class: "" },
    { content: "         My Projects", class: "string" },
    { content: "      </h2>", class: "" },
    { content: "      <p>", class: "" },
    {
        content: "        A collection of my latest work and experiments",
        class: "string",
    },
    { content: "      </p>", class: "" },
    { content: "    </div>", class: "punctuation" },
    "",
    { content: '    <div class="projects-grid">', class: "punctuation" },
    { content: '      <div v-for="project in projects"', class: "" },
    { content: '           class="project-card">', class: "" },
    { content: '        <div class="project-image">', class: "punctuation" },
    { content: '          <img :src="project.image" />', class: "" },
    { content: "        </div>", class: "punctuation" },
    { content: "        <h3>{{ project.title }}</h3>", class: "" },
    { content: "        <p>{{ project.description }}</p>", class: "" },
    { content: '        <div class="tech-tags">', class: "punctuation" },
    { content: '          <span v-for="tech in project.tech">', class: "" },
    { content: "            {{ tech }}", class: "" },
    { content: "          </span>", class: "punctuation" },
    { content: "        </div>", class: "punctuation" },
    { content: '        <a :href="project.github">Code</a>', class: "" },
    { content: '        <a :href="project.demo">Live Demo</a>', class: "" },
    { content: "      </div>", class: "punctuation" },
    { content: "    </div>", class: "punctuation" },
    { content: "  </div>", class: "punctuation" },
    { content: "</template>", class: "keyword" },
]);

const openProject = (projectId: number) => {
    router.push(`/projects/${projectId}`);
};

// GitHub repository stats
const { getRepoStats, isRepoLoading, fetchMultipleReposFromUrls } = useGithubRepo();

// Fetch GitHub stats for all projects on mount
onMounted(() => {
    const githubUrls = projects
        .filter(project => project.github)
        .map(project => project.github as string);

    if (githubUrls.length > 0) {
        fetchMultipleReposFromUrls(githubUrls);
    }
});

// Get repo stats for a specific project
function getProjectRepoStats(githubUrl: string | undefined) {
    if (!githubUrl) return null;
    const parsed = parseGithubUrl(githubUrl);
    if (!parsed) return null;
    return getRepoStats(parsed.owner, parsed.repo);
}

// Check if repo is loading
function isProjectRepoLoading(githubUrl: string | undefined): boolean {
    if (!githubUrl) return false;
    const parsed = parseGithubUrl(githubUrl);
    if (!parsed) return false;
    return isRepoLoading(parsed.owner, parsed.repo);
}
</script>

<template>
    <div
        v-if="props.isCodeEditorVisible"
        class="code-editor hidden md:block overflow-hidden md:overflow-auto"
    >
        <div class="code-content">
            <div class="code-line" v-for="line in codeLines" :key="line.num">
                <div class="line-numbers">{{ line.num }}</div>
                <div class="code-text" :class="line.class">
                    {{ line.content }}
                </div>
            </div>
        </div>
    </div>
    <div class="preview" :class="{ 'full-width': !props.isCodeEditorVisible }">
        <div class="projects-preview">
            <div class="projects-header">
                <h2>My Projects</h2>
                <p class="projects-subtitle">
                    A collection of my latest work and experiments
                </p>
            </div>

            <div class="projects-grid">
                <div
                    v-for="project in projects"
                    :key="project.id"
                    class="project-card"
                    :class="{ featured: project.featured }"
                    @click="openProject(project.id)"
                    role="button"
                    tabindex="0"
                    @keyup.enter="openProject(project.id)"
                    @keyup.space="openProject(project.id)"
                >
                    <div class="project-image">
                        <img :src="project.image" :alt="project.title" />
                        <div class="project-overlay">
                            <div class="overlay-content">
                                <button class="view-project-btn">
                                    View Project
                                </button>
                            </div>
                        </div>
                        <div v-if="project.featured" class="featured-badge">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <polygon
                                    points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                                ></polygon>
                            </svg>
                            Featured
                        </div>
                    </div>

                    <div class="project-content">
                        <h3>{{ project.title }}</h3>
                        <p>{{ project.description }}</p>

                        <!-- GitHub Stats Badge -->
                        <GitHubRepoBadge
                            v-if="project.github && getProjectRepoStats(project.github)"
                            :stars="getProjectRepoStats(project.github)!.stars"
                            :forks="getProjectRepoStats(project.github)!.forks"
                            :updatedAt="getProjectRepoStats(project.github)!.updatedAt"
                            :isLoading="isProjectRepoLoading(project.github)"
                        />

                        <div class="tech-tags">
                            <span
                                v-for="(tech, index) in project.tech"
                                :key="index"
                                class="tech-tag"
                            >
                                {{ tech }}
                            </span>
                        </div>

                        <div class="project-links">
                            <a
                                v-if="project.github"
                                :href="project.github"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="project-link github-link"
                                @click.stop
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
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
                                Code
                            </a>
                            <a
                                v-if="project.demo"
                                :href="project.demo"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="project-link demo-link"
                                @click.stop
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
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
                                    <polyline
                                        points="15,3 21,3 21,9"
                                    ></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                                Live Demo
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="projects-footer">
                <p>
                    Want to see more? Check out my
                    <a
                        href="https://github.com/jordiop"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="github-link"
                        >GitHub</a
                    >
                    for additional projects and contributions.
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.preview.full-width {
    width: 100%;
    margin-left: 0;
}

.projects-header {
    text-align: center;
    margin-bottom: 3rem;
}

.projects-subtitle {
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin-top: 0.5rem;
}

.project-card {
    cursor: pointer;
    position: relative;
}

.project-card.featured {
    border: 2px solid var(--accent-color);
    transform: scale(1.02);
}

.project-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.project-card:hover .project-overlay {
    opacity: 1;
}

.view-project-btn {
    background: var(--accent-color);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.view-project-btn:hover {
    background: var(--accent-secondary);
    transform: translateY(-2px);
}

.featured-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: var(--accent-color);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
}

.project-links {
    display: flex;
    gap: 12px;
    margin-top: 1rem;
}

.project-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 6px;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.3s ease;
    border: 1px solid var(--border-color);
}

.github-link {
    color: var(--text-primary);
    background: var(--bg-primary);
}

.github-link:hover {
    background: var(--bg-secondary);
    border-color: var(--accent-color);
}

.demo-link {
    color: var(--btn-primary-text);
    background: var(--accent-color);
}

.demo-link:hover {
    background: var(--accent-secondary);
    transform: translateY(-1px);
}

.projects-footer {
    text-align: center;
    margin-top: 3rem;
    padding: 2rem;
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 1px solid var(--border-color);
}

.projects-footer p {
    color: var(--text-secondary);
    margin: 0;
}

.projects-footer .github-link {
    color: var(--accent-color);
    text-decoration: none;
    font-weight: 600;
}

.projects-footer .github-link:hover {
    text-decoration: underline;
}

@media (max-width: 768px) {
    .project-links {
        flex-direction: column;
    }

    .project-link {
        justify-content: center;
    }
}
</style>
