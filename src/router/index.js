import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "@/../supabase/config.js";

import DashboardPage from "@/views/DashboardPage.vue";
import PosPage from "@/views/PosPage.vue";
import OrdersPage from "@/views/OrdersPage.vue";
import OrderView from "@/views/OrderView.vue";
import CustomersPage from "@/views/CustomersPage.vue";
import CustomerView from "@/views/CustomerView.vue";
import PaymentPage from "@/views/PaymentPage.vue";
import TagsPage from "@/views/TagsPage.vue";
import TagView from "@/views/TagView.vue";
import TagGroupView from "@/views/TagGroupView.vue";
import LogisticsPage from "@/views/LogisticsPage.vue";
import LogisticsView from "@/views/LogisticsView.vue";
import InvoicesPage from "@/views/InvoicesPage.vue";
import InvoiceView from "@/views/InvoiceView.vue";
import ItemsPage from "@/views/ItemsPage.vue";
import PaymentsPage from "@/views/PaymentsPage.vue";

// import CollectionsPage from "@/views/CollectionsPage.vue";
// import DeliveriesPage from "@/views/DeliveriesPage.vue";

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
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardPage,
    meta: {
      requiresAuth: true, // POS requires authentication
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
    path: "/orders",
    name: "OrdersPage",
    component: OrdersPage,
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
    name: "OrderView",
    component: OrderView,
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
    path: "/logistics",
    name: "LogisticsPage",
    component: LogisticsPage,
    meta: {
      requiresAuth: true, // Transactions require authentication
    },
  },
  {
    path: "/logistics/:id",
    name: "LogisticsView",
    component: LogisticsView,
    meta: {
      requiresAuth: true, // Transactions require authentication
    },
  },
  {
    path: "/tags/:order_no",
    name: "TagView",
    component: TagView,
    meta: {
      requiresAuth: true, // Transactions require authentication
    },
  },
  {
    path: "/tags/grp-:groupSlug",
    name: "TagGroupView",
    component: TagGroupView,
    meta: { requiresAuth: true },
  },
  {
    path: "/invoices",
    name: "Invoices",
    component: InvoicesPage,
    meta: {
      requiresAuth: true, // Transactions require authentication
    },
  },
  {
    path: "/invoice/:order_no",
    name: "InvoiceView",
    component: InvoiceView,
    meta: {
      requiresAuth: true, // Transactions require authentication
    },
  },
  {
    path: "/items",
    name: "Items",
    component: ItemsPage,
    meta: {
      requiresAuth: true, // Transactions require authentication
    },
  },
  
  {
    path: "/payments",
    name: "Payments",
    component: PaymentsPage,
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
    return next({ path: "/dashboard" });
  }

  next(); // Proceed to the route
});

export default router;
