/**
 * Project data interface
 * I like composables :)
 */
export interface ProjectScreenshot {
  src: string
  alt: string
  caption?: string
}

export interface ProjectMetric {
  label: string
  value: string
}

export interface Project {
  id: number
  title: string
  description: string
  tech: string[]
  image: string
  github?: string
  demo?: string
  featured: boolean
  finished?: boolean

  // Optional case-study fields — render only if present
  role?: string
  durationLabel?: string
  year?: number
  problem?: string
  approach?: string
  outcome?: string
  learnings?: string[]
  screenshots?: ProjectScreenshot[]
  metrics?: ProjectMetric[]
}

/**
 * Composable to manage and share project data across views
 * Really like composables :)
 */
export function useProjects() {
  const projects: Project[] = [
    {
      id: 1,
      title: "Portfolio",
      description: "A modern portfolio featuring an original design based on a code editor theme. Built with Vue 3, TypeScript, and Tailwind CSS for a seamless developer experience.",
      tech: ["Vue 3", "TypeScript", "Tailwind CSS", "Vite"],
      image: "https://placehold.co/600x400/5e4c7f/e0def4?text=Portfolio",
      github: "https://github.com/jordiop/tab-portfolio",
      demo: "https://jordiop.com",
      featured: true,
      finished: true,
      role: "Solo build",
      durationLabel: "Ongoing",
      year: 2025,
      problem: "Most developer portfolios look the same: a hero, a project grid, a contact form. I wanted a portfolio that signaled what I actually do all day — write Vue and TypeScript inside a code editor — without sacrificing legibility for visitors who aren't developers.",
      approach: "I framed the entire UI as a fake code editor: a sidebar of icons, a tabbed file bar, and a split pane where the left side renders the page's source as syntax-highlighted text and the right side renders the actual preview. Every page is a real Vue route, but the code shown next to it is generated from the same data that drives the preview, so they can never drift. Cmd/Ctrl+B hides the code pane for visitors who'd rather just read.",
      outcome: "A portfolio that doubles as a tech demo. Visitors see live Vue 3 + Tailwind v4 + Vite working in front of them, with a command palette, dark mode, mobile liquid-glass nav, a Spotify Now Playing widget, and a Cloudflare R2-backed photo gallery. All routes render in under 200ms on dev hardware.",
      learnings: [
        "Generating syntax-highlighted code from structured data beats maintaining two parallel sources of truth.",
        "A command palette pays for itself the first time you demo the site to someone — keyboard-driven nav is genuinely faster.",
        "Tailwind v4's CSS-variable-driven theming made the dark mode toggle a 5-line change instead of a refactor.",
      ],
      metrics: [
        { label: "Lighthouse Performance", value: "98" },
        { label: "Routes", value: "6" },
        { label: "First contentful paint", value: "<300ms" },
      ],
    },
    {
      id: 2,
      title: "Newtab Extension",
      description: "A minimalist Chrome new tab extension that provides a clean, customizable interface for productivity and quick access to frequently used tools.",
      tech: ["HTML", "CSS", "JavaScript", "Chrome API"],
      image: "https://placehold.co/600x400/5e4c7f/e0def4?text=New+Tab",
      github: "https://github.com/Jordiop/newtab",
      featured: false,
      finished: true
    },
    {
      id: 3,
      title: "Multiplatform Weather App",
      description: "A cross-platform weather application that delivers accurate forecasts and real-time updates, built using Flutter for a seamless experience on both iOS and Android devices.",
      tech: ["Flutter", "Dart", "OpenWeatherMap API"],
      image: "https://placehold.co/600x400/5e4c7f/e0def4?text=Weather+App",
      github: "",
      featured: false,
      finished: false
    },
    {
      id: 4,
      title: "Mood Tracker",
      description: "A simple and intuitive mood tracking app that helps users monitor their emotional well-being over time, featuring daily logs and insightful analytics.",
      tech: ["Vue.JS", "Laravel", "Supabase"],
      image: "https://placehold.co/600x400/5e4c7f/e0def4?text=Mood+Tracker",
      github: "https://github.com/Jordiop/mood-tracker",
      featured: true,
      finished: true,
      demo: "https://mood.jordiop.es",
      role: "Solo build",
      durationLabel: "3 weeks",
      year: 2024,
      problem: "Off-the-shelf mood tracking apps either drown the user in features or lock the data behind a paywall. I wanted something that took ten seconds a day to use, kept the data in a Postgres I controlled, and turned a month of logs into something I could actually look at.",
      approach: "Vue on the front for the daily log UI, Laravel as the API layer (auth, validation, aggregation queries), and Supabase for managed Postgres + auth. The daily log is a single screen — emoji picker, optional note, save. The analytics view rolls 30 days of entries into a heatmap and a trend line so patterns show up without scrolling.",
      outcome: "Used it daily for several months. The 10-second log target held — I never skipped a day because of friction. The monthly heatmap surfaced a sleep-mood correlation that wouldn't have been obvious from individual entries.",
      learnings: [
        "Splitting auth (Supabase) from business logic (Laravel) was overkill for a solo app — one of them could have done both.",
        "The hardest part wasn't the tracking, it was designing the analytics view so a glance gave you something useful.",
        "Daily-streak gamification was tempting but I left it out. Tracking should serve the user, not retain them.",
      ],
      metrics: [
        { label: "Time per log", value: "<10s" },
        { label: "Stack", value: "Vue + Laravel + Supabase" },
        { label: "Daily users", value: "1 (me)" },
      ],
    }
  ]

  /**
   * Get all projects
   */
  const getAllProjects = (): Project[] => {
    return projects
  }

  /**
   * Get a project by ID
   */
  const getProjectById = (id: number): Project | undefined => {
    return projects.find(project => project.id === id)
  }

  /**
   * Get featured projects
   */
  const getFeaturedProjects = (): Project[] => {
    return projects.filter(project => project.featured)
  }

  return {
    projects,
    getAllProjects,
    getProjectById,
    getFeaturedProjects
  }
}
