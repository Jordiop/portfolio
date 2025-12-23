/**
 * Project data interface
 * I like composables :)
 */
export interface Project {
  id: number
  title: string
  description: string
  tech: string[]
  image: string
  github?: string
  demo?: string
  featured: boolean,
  finished?: boolean
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
      finished: true
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
      github: "https://github.com/Jordiop/weather-app",
      featured: false,
      finished: false
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

