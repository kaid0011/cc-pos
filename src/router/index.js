import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "@/../supabase/config.js";
import { useTransactionStore } from "@/stores/transactionStore";

// Import views
import DashboardPage from "@/views/DashboardPage.vue";
import PosPage from "@/views/PosPage.vue";
import ErrorReportsPage from "@/views/ErrorReportsPage.vue";
import OrdersPage from "@/views/OrdersPage.vue";
import OrderView from "@/views/OrderView.vue";
import OrderViewReadOnly from "@/views/OrderViewReadOnly.vue";
import CustomersPage from "@/views/CustomersPage.vue";
import CustomerView from "@/views/CustomerView.vue";
import TagsPage from "@/views/TagsPage.vue";
import TagView from "@/views/TagView.vue";
import TagGroupView from "@/views/TagGroupView.vue";
import PacksPage from "@/views/PacksPage.vue";
import PacksView from "@/views/PacksView.vue";
import PacksGroupView from "@/views/PacksGroupView.vue";
import LogisticsPage from "@/views/LogisticsPage.vue";
import LogisticsView from "@/views/LogisticsView.vue";
import InvoicesPage from "@/views/InvoicesPage.vue";
import InvoiceView from "@/views/InvoiceView.vue";
import InvoiceGroupView from "@/views/InvoiceGroupView.vue";
import ItemsPage from "@/views/ItemsPage.vue";
import ItemRequestPage from "@/views/ItemRequestPage.vue";
import PaymentsPage from "@/views/PaymentsPage.vue";
import SoaPage from "@/views/SoaPage.vue";
import SoaView from "@/views/SoaView.vue";
import CustomerComplaintsPage from "@/views/CustomerComplaintsPage.vue";
import OnSiteJobsPage from "@/views/OnSiteJobsPage.vue";
import SettlementsPage from "@/views/SettlementsPage.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/LoginPage.vue"),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/unauthorized",
    name: "Unauthorized",
    component: () => import("@/views/UnauthorizedPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardPage,
    meta: {
      requiresAuth: true,
      roles: ["driver", "csr", "admin", "production"],
    },
  },
  {
    path: "/pos",
    name: "Pos",
    component: PosPage,
    meta: {
      requiresAuth: true,
      roles: ["csr", "admin", "production"],
    },
  },
  {
    path: "/error_reports",
    name: "ErrorReportsPage",
    component: ErrorReportsPage,
    meta: {
      requiresAuth: true,
      roles: ["csr", "admin"],
    },
  },
  {
    path: "/orders",
    name: "OrdersPage",
    component: OrdersPage,
    meta: {
      requiresAuth: true,
      roles: ["csr", "admin"],
    },
  },
  {
    path: "/customers",
    name: "Customers",
    component: CustomersPage,
    meta: {
      requiresAuth: true,
      roles: ["csr", "admin"],
    },
  },
  {
    path: "/customers/:id",
    name: "CustomerView",
    component: CustomerView,
    meta: {
      requiresAuth: true,
      roles: ["csr", "admin"],
    },
  },
  {
    path: "/orders/:order_no",
    name: "OrderView",
    component: OrderView,
    meta: {
      requiresAuth: true,
      roles: ["csr", "admin"],
    },
  },
  {
    path: "/orders/read-:order_no",
    name: "OrderViewReadOnly",
    component: OrderViewReadOnly,
    meta: {
      requiresAuth: true,
      roles: ["csr", "admin", "production", "driver"],
    },
  },
  {
    path: "/tags",
    name: "Tags",
    component: TagsPage,
    meta: {
      requiresAuth: true,
      roles: ["production", "admin"],
    },
  },
  {
    path: "/packs",
    name: "Packs",
    component: PacksPage,
    meta: {
      requiresAuth: true,
      roles: ["production", "admin"],
    },
  },
  {
    path: "/packs/:order_no",
    name: "PacksView",
    component: PacksView,
    meta: {
      requiresAuth: true,
      roles: ["production", "admin"],
    },
  },
  {
    path: "/packs/grp-:groupSlug",
    name: "PacksGroupView",
    component: PacksGroupView,
    meta: {
      requiresAuth: true,
      roles: ["production", "admin"],
    },
  },
  {
    path: "/logistics",
    name: "LogisticsPage",
    component: LogisticsPage,
    meta: {
      requiresAuth: true,
      roles: ["driver", "csr", "admin"],
    },
  },
  {
    path: "/logistics/:id",
    name: "LogisticsView",
    component: LogisticsView,
    meta: {
      requiresAuth: true,
      roles: ["driver", "csr", "admin"],
    },
  },
  {
    path: "/tags/:order_no",
    name: "TagView",
    component: TagView,
    meta: {
      requiresAuth: true,
      roles: ["production", "admin"],
    },
  },
  {
    path: "/tags/grp-:groupSlug",
    name: "TagGroupView",
    component: TagGroupView,
    meta: {
      requiresAuth: true,
      roles: ["production", "admin"],
    },
  },
  {
    path: "/invoices",
    name: "Invoices",
    component: InvoicesPage,
    meta: {
      requiresAuth: true,
      roles: ["admin", "csr"],
    },
  },
  {
    path: "/invoice/:order_no/:invoice_no/:history_id",
    name: "InvoiceView",
    component: InvoiceView,
    meta: {
      requiresAuth: true,
      roles: ["admin", "csr"],
    },
    props: (route) => ({
      orderNo: route.params.order_no,
      invoiceNo: route.params.invoice_no,
      historyId: route.params.history_id,
    }),
  },
  {
    path: "/invoice/grp-:groupSlug",
    name: "InvoiceGroupView",
    component: InvoiceGroupView,
    meta: {
      requiresAuth: true,
      roles: ["admin", "csr", "production"],
    },
  },
  {
    path: "/items",
    name: "Items",
    component: ItemsPage,
    meta: {
      requiresAuth: true,
      roles: ["admin", "csr"],
    },
  },
  {
    path: "/items/requests",
    name: "ItemRequestPage",
    component: ItemRequestPage,
    meta: {
      requiresAuth: true,
      roles: ["admin", "csr"],
    },
  },
  {
    path: "/finance/payments",
    name: "Payments",
    component: PaymentsPage,
    meta: {
      requiresAuth: true,
      roles: ["admin"],
    },
  },
  {
    path: "/finance/soa",
    name: "SoaManagement",
    component: SoaPage,
    meta: {
      requiresAuth: true,
      roles: ["admin"],
    },
  },
  {
    path: "/finance/soa/:soa_no",
    name: "SoaView",
    component: SoaView,
    meta: {
      requiresAuth: true,
      roles: ["admin"],
    },
  },
  {
    path: "/finance/settlements",
    name: "SettlementsPage",
    component: SettlementsPage,
    meta: {
      requiresAuth: true,
      roles: ["admin"],
    },
  },
  {
    path: "/customers/complaints",
    name: "CustomerComplaintsPage",
    component: CustomerComplaintsPage,
    meta: {
      requiresAuth: true,
      roles: ["admin"],
    },
  },
  {
    path: "/logistics/onsite",
    name: "OnSiteJobsPage",
    component: OnSiteJobsPage,
    meta: {
      requiresAuth: true,
      roles: ["admin"],
    },
  },
  {
    path: "/:catchAll(.*)",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
    meta: {
      requiresAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (to.path === "/login" && user) {
    // Redirect logged-in user away from login
    return next("/dashboard");
  }

  if (to.meta.requiresAuth && !user) {
    // Block if no active user session
    return next("/login");
  }

  // Normalize user role
  const transactionStore = useTransactionStore();
  const position = await transactionStore.getUserPosition();
  const userRole = position?.trim().toLowerCase();

  // If route requires specific roles, enforce it
  if (to.meta?.roles?.length) {
    const allowedRoles = to.meta.roles.map((r) => r.toLowerCase());
    if (!allowedRoles.includes(userRole)) {
      return next("/unauthorized");
    }
  }

  next();
});

export default router;
