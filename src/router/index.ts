import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import AboutView from '../views/About.vue'
import ProjectsView from '../views/Projects.vue'
import ProjectView from '../views/Project.vue'
import GalleryView from '../views/Gallery.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/projects',
      name: 'projects',
      component: ProjectsView,
    },
    {
      path: '/projects/:id',
      name: 'project',
      component: ProjectView,
      props: true,
    },
    {
      path: '/gallery',
      name: 'gallery',
      component: GalleryView,
    },
  ],
})

export default router