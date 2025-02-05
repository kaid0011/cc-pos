import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "@/../supabase/config.js";

import PosPage from "@/views/PosPage.vue";
import TransactionsPage from "@/views/TransactionsPage.vue";
import CustomersPage from "@/views/CustomersPage.vue";
import CustomerView from "@/views/CustomerView.vue";
import OrderPage from "@/views/OrderPage.vue";
import PaymentPage from "@/views/PaymentPage.vue";
import TagsPage from "@/views/TagsPage.vue";
import TagsView from "@/views/TagsView.vue";

const routes = [
  {
    path: "/",
    redirect: "/login", // Redirect from root (/) to /pos
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/LoginPage.vue"),
    meta: {
      requiresAuth: false, // Login does not require authentication
    },
  },
  {
    path: "/pos",
    name: "Pos",
    component: PosPage,
    meta: {
      requiresAuth: true, // POS requires authentication
    },
  },
  {
    path: "/transactions",
    name: "Transactions",
    component: TransactionsPage,
    meta: {
      requiresAuth: true, // Transactions require authentication
    },
  },
  {
    path: "/customers",
    name: "Customers",
    component: CustomersPage,
    meta: {
      requiresAuth: true, // Transactions require authentication
    },
  },
  {
    path: "/customers/:id",
    name: "CustomerView",
    component: CustomerView,
    meta: {
      requiresAuth: true, // Transactions require authentication
    },
  },
  {
    path: "/orders/:order_no",
    name: "OrderPage",
    component: OrderPage,
    meta: {
      requiresAuth: true,
    },
  },
  
  {
    path: "/payment/:order_no",
    name: "PaymentPage",
    component: PaymentPage,
    meta: { requiresAuth: true },
  },  
  {
    path: "/tags",
    name: "Tags",
    component: TagsPage,
    meta: {
      requiresAuth: true, // Transactions require authentication
    },
  },
  {
    path: "/tags/:order_no",
    name: "TagsView",
    component: TagsView,
    meta: {
      requiresAuth: true, // Transactions require authentication
    },
  },
  {
    path: "/:catchAll(.*)", // Catch-all route for 404 pages
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"), // Lazy-loaded 404 page
    meta: {
      requiresAuth: true, // Login does not require authentication
    },
  },
];

// Create the router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global navigation guard for authentication checks
router.beforeEach(async (to, from, next) => {
  const {
    data: { session },
  } = await supabase.auth.getSession(); // Get the current session

  // If trying to access a route that requires authentication
  if (to.meta.requiresAuth && !session) {
    // No active session, redirect to login
    return next({ path: "/login" });
  }

  // If trying to access login while authenticated, redirect to POS
  if (to.name === "Login" && session) {
    return next({ path: "/pos" });
  }

  next(); // Proceed to the route
});

export default router;
