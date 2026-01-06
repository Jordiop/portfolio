<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { createLines } from '@/composables/createLines'
import IconVue from '@/components/icons/IconVue.vue'
import IconTypeScript from '@/components/icons/IconTypeScript.vue'
import IconNuxt from '@/components/icons/IconNuxt.vue'
import IconTailwind from '@/components/icons/IconTailwind.vue'
import IconNode from '@/components/icons/IconNode.vue'
import IconPostgreSQL from '@/components/icons/IconPostgreSQL.vue'
import IconGit from '@/components/icons/IconGit.vue'
import IconDocker from '@/components/icons/IconDocker.vue'
import IconPython from '@/components/icons/IconPython.vue'

interface Props {
  isCodeEditorVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isCodeEditorVisible: true
})

const codeLines = createLines([
  { content: '<script setup lang="ts">', class: 'keyword' },
  { content: 'const skills = [', class: 'variable' },
  { content: '  { name: "Vue.js", icon: IconVue },', class: 'string' },
  { content: '  { name: "TypeScript", icon: IconTS },', class: 'string' },
  { content: '  { name: "Nuxt.js", icon: IconNuxt },', class: 'string' },
  { content: '  { name: "Tailwind CSS", icon: IconTailwind },', class: 'string' },
  { content: '  { name: "Node.js", icon: IconNode },', class: 'string' },
  { content: '  { name: "PostgreSQL", icon: IconPostgreSQL },', class: 'string' },
  { content: ']', class: 'punctuation' },
  '',
  { content: 'const experience = [', class: 'variable' },
  { content: '  {', class: 'punctuation' },
  { content: '    company: "Omniaccess",', class: 'string' },
  { content: '    role: "Full Stack Developer",', class: 'string' },
  { content: '    duration: "January 2025 - Present",', class: 'string' },
  { content: '    description: "Working on projects using Nuxt and Vuetify"', class: 'string' },
  { content: '  },', class: 'punctuation' },
  { content: '  {', class: 'punctuation' },
  { content: '    company: "Omniaccess",', class: 'string' },
  { content: '    role: "Junior Full Stack Developer",', class: 'string' },
  { content: '    duration: "June 2023 - December 2024",', class: 'string' },
  { content: '    description: "Maintain and improve web applications"', class: 'string' },
  { content: '  }', class: 'punctuation' },
  { content: ']', class: 'punctuation' },
  { content: '</.script>', class: 'keyword' },
  '',
  { content: '<template>', class: 'keyword' },
  { content: '  <div class="about-section">', class: 'punctuation' },
  { content: '    <h1>About Me</h1>', class: 'string' },
  { content: '    <p>{{ bio }}</p>', class: 'string' },
  { content: '    <SkillsChart :skills="skills" />', class: 'string' },
  { content: '    <ExperienceTimeline :experience="experience" />', class: 'string' },
  { content: '  </div>', class: 'punctuation' },
  { content: '</template>', class: 'keyword' },
])

const skills = [
  { name: "Vue.js", icon: IconVue, color: "#42b883" },
  { name: "TypeScript", icon: IconTypeScript, color: "#3178c6" },
  { name: "Nuxt.js", icon: IconNuxt, color: "#00dc82" },
  { name: "Tailwind", icon: IconTailwind, color: "#06b6d4" },
  { name: "Node.js", icon: IconNode, color: "#339933" },
  { name: "Python", icon: IconPython },
  { name: "PostgreSQL", icon: IconPostgreSQL, color: "#336791" },
  { name: "Git", icon: IconGit, color: "#f05032" },
  { name: "Docker", icon: IconDocker, color: "#2496ed" },
];

const experience = [
  {
    company: "Omniaccess",
    role: "Full Stack Developer",
    duration: "January 2025 - Present",
    description: "Following my previous experience, I'm working on projects using Nuxt and Vuetify and collaborating with the design team to deliver high-quality products.",
    technologies: ["Nuxt.js", "Vuetify", "TypeScript", "Node.js", "PostgreSQL", "Docker", "Python"]
  },
  {
    company: "Omniaccess",
    role: "Junior Full Stack Developer",
    duration: "June 2023 - December 2024",
    description: "Maintain and improve existing web applications using Vue.js, and Tailwind CSS. Developed a customer portal for a company client.",
    technologies: ["Vue.js", "Nuxt.js", "Tailwind CSS", "JavaScript"]
  }
];

const education = [
  {
    degree: "Big data and artificial intelligence",
    institution: "IEDIB",
    duration: "2024 - 2025",
    description: "Focused on learning the basics of big data and artificial intelligence."
  },
  {
    degree: "Web Development and Programming",
    institution: "CIFP Borja Moll",
    duration: "2021 - 2023",
    description: "Focused on learning the basics of web development and programming."
  }
];

const isVisible = ref(false);

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true;
  }, 100);
});
</script>

<template>
  <div v-if="props.isCodeEditorVisible" class="code-editor hidden md:block overflow-hidden md:overflow-auto">
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
    <div class="about-content" :class="{ 'visible': isVisible }">
      <div class="about-header">
        <h1>About Me</h1>
        <p class="bio">
          I'm a passionate Full Stack Developer with over 3 years of experience building modern web applications. 
          I specialize in Vue.js, TypeScript, and Node.js, creating efficient and scalable solutions that deliver 
          exceptional user experiences.
        </p>
        <p class="bio">
          When I'm not coding, you can find me exploring new technologies, reading books, or watching videos.
          One non related passion of mine is car mechanics and I'm learning myself how to restore classic cars.
        </p>
      </div>

      <div class="skills-section">
        <h2>Skills & Technologies</h2>
        <div class="skills-grid">
          <div v-for="skill in skills" :key="skill.name" class="skill-item">
            <component :is="skill.icon" :fill="skill.color" :size="48" />
            <span class="skill-name">{{ skill.name }}</span>
          </div>
        </div>
      </div>

      <div class="experience-section">
        <h2>Experience</h2>
        <div class="timeline">
          <div v-for="(exp, index) in experience" :key="index" class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <h3>{{ exp.role }}</h3>
                <span class="company">{{ exp.company }}</span>
                <span class="duration">{{ exp.duration }}</span>
              </div>
              <p class="timeline-description">{{ exp.description }}</p>
              <div class="technologies">
                <span v-for="tech in exp.technologies" :key="tech" class="tech-badge">
                  {{ tech }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="education-section">
        <h2>Education & Certifications</h2>
        <div v-for="edu in education" :key="edu.degree" class="education-item">
          <div class="education-header">
            <h3>{{ edu.degree }}</h3>
            <span class="institution">{{ edu.institution }}</span>
            <span class="duration">{{ edu.duration }}</span>
          </div>
          <p>{{ edu.description }}</p>
        </div>
      </div>

      <div class="interests-section">
        <h2>Interests & Hobbies</h2>
        <div class="interests-grid">
          <div class="interest-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            <span>Open Source</span>
          </div>
          <div class="interest-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span>Learning New Tech</span>
          </div>
          <div class="interest-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Community</span>
          </div>
          <div class="interest-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"></polygon>
            </svg>
            <span>Problem Solving</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-content {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease;
}

.about-content.visible {
  opacity: 1;
  transform: translateY(0);
}

.about-header {
  margin-bottom: 3rem;
}

.bio {
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

.skills-section,
.experience-section,
.education-section,
.interests-section {
  margin-bottom: 3rem;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.skill-item {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.skill-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-light);
  border-color: var(--accent-color);
}

.skill-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 0.75rem;
  font-size: 0.875rem;
}

.timeline {
  position: relative;
  margin-top: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border-color);
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
  padding-left: 60px;
}

.timeline-marker {
  position: absolute;
  left: 11px;
  top: 0;
  width: 20px;
  height: 20px;
  background: var(--accent-color);
  border-radius: 50%;
  border: 4px solid var(--bg-primary);
}

.timeline-content {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.timeline-header {
  margin-bottom: 1rem;
}

.timeline-header h3 {
  color: var(--accent-color);
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.company {
  color: var(--text-primary);
  font-weight: 600;
  margin-right: 1rem;
}

.duration {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.timeline-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.technologies {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-badge {
  background: var(--bg-primary);
  color: var(--accent-secondary);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  border: 1px solid var(--border-color);
}

.education-item {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin-top: 1.5rem;
}

.education-header {
  margin-bottom: 1rem;
}

.education-header h3 {
  color: var(--accent-color);
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.institution {
  color: var(--text-primary);
  font-weight: 600;
  margin-right: 1rem;
}

.interests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.interest-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.interest-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-light);
  border-color: var(--accent-color);
}

.interest-item svg {
  color: var(--accent-color);
}

.preview.full-width {
  width: 100%;
  margin-left: 0;
}

@media (max-width: 768px) {
  .timeline::before {
    left: 15px;
  }
  
  .timeline-item {
    padding-left: 50px;
  }
  
  .timeline-marker {
    left: 6px;
    width: 18px;
    height: 18px;
  }
  
  .interests-grid {
    grid-template-columns: 1fr;
  }
}
</style>