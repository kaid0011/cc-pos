import { createRouter, createWebHistory } from 'vue-router'

// import AuthenticationPage from '@/views/authentication/AuthenticationPage.vue'

const routes = [
  {path: '/', name: 'Production Login', component: () => import('@/views/LoginPage.vue')},
    // {path: '/authentication', name: 'Authentication', component: AuthenticationPage},
    // {path: '/clients', name: 'Clients Management', component: () => import('@/views/clients_management/ClientsManagement.vue')},
    {path: '/dashboard', name: 'Dashboard', component: () => import('@/views/Dashboard.vue')},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // linkActiveClass: 'active-navigation'
})

export default router