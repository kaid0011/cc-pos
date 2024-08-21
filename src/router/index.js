import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '@/views/Dashboard.vue';
// import AuthenticationPage from '@/views/authentication/AuthenticationPage.vue'

const routes = [
  {path: '/', name: 'Production Login', component: () => import('@/views/LoginPage.vue')},
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard, // Static import for testing
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // linkActiveClass: 'active-navigation'
})

export default router