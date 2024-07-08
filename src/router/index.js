import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Home.vue'
// import AuthenticationPage from '@/views/authentication/AuthenticationPage.vue'

const routes = [
    {path: '/', name: 'Home', component: Home},
    // {path: '/authentication', name: 'Authentication', component: AuthenticationPage},
    // {path: '/clients', name: 'Clients Management', component: () => import('@/views/clients_management/ClientsManagement.vue')},
    {path: '/admin/login', name: 'Admin Login', component: () => import('@/views/admin/LoginPage.vue')},
    {path: '/production/login', name: 'Production Login', component: () => import('@/views/production/LoginPage.vue')},
    {path: '/admin', name: 'Admin', component: () => import('@/views/admin/Dashboard.vue')},
    {path: '/production', name: 'Production', component: () => import('@/views/production/Dashboard.vue')},
    {path: '/admin/items', name: 'Item Management', component: () => import('@/views/admin/ItemManagement.vue')},
    {path: '/admin/invoices', name: 'Invoice Management', component: () => import('@/views/admin/InvoiceList.vue')},
    {path: '/admin/invoices/:invoice_no', name: 'View Invoice', component: () => import('@/views/admin/InvoiceView.vue')},
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // linkActiveClass: 'active-navigation'
})

export default router