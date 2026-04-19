<script setup lang="ts">
import { ref, onMounted } from "vue";
import { createLines } from "@/composables/createLines";

interface Props {
    isCodeEditorVisible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isCodeEditorVisible: true,
});

const codeLines = createLines([
    { content: "<template>", class: "" },
    { content: '  <div class="hero-section">', class: "" },
    { content: '    <div class="greeting">', class: "" },
    { content: "      Hello 👋, I'm", class: "string" },
    { content: "    </div>", class: "" },
    { content: '    <h1 class="name">', class: "" },
    { content: '      <span v-if="isTyping">', class: "" },
    { content: "        {{ typedText }}<span class=\"cursor\">|</span>", class: "string" },
    { content: "      </span>", class: "" },
    { content: "      <span v-else>{{ fullText }}</span>", class: "" },
    { content: "    </h1>", class: "" },
    { content: '    <div class="tagline mb-4">', class: "" },
    { content: "      I build, optimize & fix", class: "string" },
    { content: '      <span class="highlight">Nuxt.js</span> &', class: "" },
    { content: '      <span class="highlight-tech">Vue.js</span> Apps', class: "" },
    { content: "    </div>", class: "" },
    "",
    { content: '    <div class="developer-image-container">', class: "" },
    { content: '      <img src="@/assets/images/meirl.jpg"', class: "" },
    { content: '        alt="Jordi Osarenkhoe"', class: "string" },
    { content: '        class="developer-img" />', class: "" },
    { content: "    </div>", class: "" },
    "",
    { content: '    <div class="social-links">', class: "" },
    { content: "      <h4>Connect with me</h4>", class: "" },
    { content: '      <a href="https://www.linkedin.com/in/jordiop/"', class: "" },
    { content: '        target="_blank">LinkedIn</a>', class: "" },
    { content: '      <a href="https://github.com/jordiop"', class: "" },
    { content: '        target="_blank">GitHub</a>', class: "" },
    { content: '      <a href="https://twitter.com/jordiscript"', class: "" },
    { content: '        target="_blank">Twitter</a>', class: "" },
    { content: "    </div>", class: "" },
    "",
    { content: '    <div class="buttons">', class: "" },
    { content: '      <button class="btn btn-primary"', class: "" },
    { content: "        @click=\"$router.push('/projects')\">", class: "" },
    { content: "        See My Work", class: "string" },
    { content: "      </button>", class: "" },
    { content: '      <a href="mailto:jordiosarenkhoe@outlook.es"', class: "" },
    { content: '        class="btn">Get In Touch</a>', class: "" },
    { content: "    </div>", class: "" },
    { content: "  </div>", class: "" },
    { content: "</template>", class: "" },
]);

const isTyping = ref(false);
const typedText = ref("");
const fullText = "Jordi Osarenkhoe";

onMounted(() => {
    setTimeout(() => {
        typeWriter();
    }, 1000);
});

const typeWriter = () => {
    isTyping.value = true;
    let i = 0;
    const speed = 100;

    const type = () => {
        if (i < fullText.length) {
            typedText.value += fullText.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            isTyping.value = false;
        }
    };
    type();
};
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
        <div class="hero-section">
            <div class="greeting">
                Hello <span class="hand-emoji">👋</span>, I'm
            </div>
            <h1 class="name">
                <span v-if="isTyping"
                    >{{ typedText }}<span class="cursor">|</span></span
                >
                <span v-else>{{ fullText }}</span>
            </h1>
            <div class="tagline mb-4">
                I build, optimize & fix
                <span class="highlight">Nuxt.js</span> &
                <span class="highlight-tech">Vue.js</span> Apps
            </div>

            <div class="developer-image-container">
                <img
                    src="@/assets/images/meirl.jpg"
                    alt="Jordi Osarenkhoe"
                    class="developer-img"
                />
                <div class="image-overlay">
                    <div class="overlay-content">
                        <span class="overlay-text">Yap, that's me</span>
                    </div>
                </div>
            </div>

            <div class="social-links">
                <h4>Connect with me</h4>
                <div class="social-icons">
                    <a
                        href="https://www.linkedin.com/in/jordiop/"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="social-icon"
                        aria-label="LinkedIn"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path
                                d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
                            ></path>
                            <rect x="2" y="9" width="4" height="12"></rect>
                            <circle cx="4" cy="4" r="2"></circle>
                        </svg>
                    </a>
                    <a
                        href="https://github.com/jordiop"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="social-icon"
                        aria-label="GitHub"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
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
                    </a>
                    <a
                        href="https://twitter.com/jordiscript"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="social-icon"
                        aria-label="Twitter"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path
                                d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5 0-.28-.03-.56-.08-.83A7.72 7.72 0 0 0 23 3z"
                            ></path>
                        </svg>
                    </a>
                </div>
            </div>

            <div class="buttons">
                <button
                    class="btn btn-primary"
                    @click="$router.push('/projects')"
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
                            d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"
                        ></path>
                    </svg>
                    See My Work
                </button>
                <a href="mailto:jordiosarenkhoe@outlook.es" class="btn">
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
                            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                        ></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Get In Touch
                </a>
            </div>
        </div>
    </div>
</template>

<style scoped>
.preview.full-width {
    width: 100%;
    margin-left: 0;
}

.cursor {
    animation: blink 1s infinite;
    color: var(--accent-color);
}

@keyframes blink {
    0%,
    50% {
        opacity: 1;
    }
    51%,
    100% {
        opacity: 0;
    }
}

.developer-image-container {
    position: relative;
    width: 250px;
    height: 250px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: var(--shadow-medium);
    transition: all 0.3s ease;
    margin-top: 1rem;
}

@media (max-width: 768px) {
    .developer-image-container {
        align-self: center;
    }
}

.developer-image-container:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-heavy);
}

.developer-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.developer-image-container:hover .developer-img {
    transform: scale(1.05);
}

.image-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    padding: 1rem;
    transform: translateY(100%);
    transition: transform 0.3s ease;
}

.developer-image-container:hover .image-overlay {
    transform: translateY(0);
}

.overlay-content {
    text-align: center;
}

.overlay-text {
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
}
</style>
