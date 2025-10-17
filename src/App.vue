<template>
  <q-layout view="hhh lpR lFf">
    <!-- Only render when role is loaded -->
    <template v-if="userRole">
      <!-- Header -->
      <q-header reveal>
        <q-toolbar>
          <q-btn flat round dense icon="menu" @click="toggleDrawer" />
          <q-toolbar-title class="q-py-sm"
            >CC Management System</q-toolbar-title
          >
        </q-toolbar>
      </q-header>

      <!-- Drawer (desktop = persistent with mini/full; mobile = overlay with open/close) -->
      <q-drawer
        :model-value="isMobile ? leftDrawerOpen : true"
        @update:model-value="handleDrawerModel"
        side="left"
        :behavior="isMobile ? 'mobile' : 'desktop'"
        :mini="!isMobile && miniState"
        :mini-width="64"
        bordered
        class="hover-drawer"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
      >
        <q-list>
          <!-- Loop over menu sections -->
          <div v-for="section in filteredMenu" :key="section.label">
            <!-- Section header: show only icon in desktop-mini -->
            <!-- Section header -->
            <q-item dense class="menu-header">
              <!-- Avatar only when drawer is mini -->
              <q-item-section avatar v-show="!showLabels">
                <q-avatar size="sm" color="grey" text-color="white">
                  {{ section.label.charAt(0) }}
                </q-avatar>
              </q-item-section>

              <!-- Label only when drawer is expanded -->
              <q-item-section v-if="showLabels">
                <div class="row items-center">
                  <span>{{ section.label }}</span>
                </div>
              </q-item-section>
            </q-item>

            <!-- Submenus -->
<q-item
  v-for="sub in section.submenus"
  :key="sub.route"
  clickable
  :disable="sub.disabled"
  @click="!sub.disabled && navigateTo(sub.route)"
  :active="route.path === sub.route"
  active-class="submenu-active"
  class="submenu-item"
  :class="{ 'submenu-disabled': sub.disabled }"
  dense
>
  <q-item-section avatar>
    <q-icon :name="sub.icon" />
  </q-item-section>
  <q-item-section v-if="showLabels">
    {{ sub.label }}
    <span v-if="sub.disabled" class="under-dev">(Under development)</span>
  </q-item-section>
</q-item>

          </div>

          <!-- Logout -->
          <q-separator spaced />
          <q-item clickable @click="logout" class="q-pa-md">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section v-if="showLabels">Log Out</q-item-section>
          </q-item>
        </q-list>
      </q-drawer>
    </template>

    <!-- Main Page -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "@/../supabase/api/auth";
import { useTransactionStore } from "@/stores/transactionStore";
import { useQuasar } from "quasar";

const router = useRouter();
const route = useRoute();
const { logoutUser } = useAuth();
const $q = useQuasar();

const leftDrawerOpen = ref(false); // used only on mobile
const miniState = ref(true); // used only on desktop
const userRole = ref(null);

const isMobile = computed(() => $q.screen.lt.md);

/**
 * Labels are hidden only when we're on desktop AND in mini mode.
 * On mobile, we always show labels (since it overlays full drawer).
 */
const showLabels = computed(() => !(!isMobile.value && miniState.value));

// Full structured menu with headers + submenus
const fullMenu = [
  {
    label: "Dashboard",
    icon: "dashboard",
    roles: ["driver", "csr", "admin", "production", "accounts", "owner"],
    submenus: [
      {
        label: "My Dashboard",
        icon: "dashboard",
        route: "/dashboard",
        // disabled: true,
      },
    ],
  },
  {
    label: "Order Management",
    icon: "list_alt",
    roles: ["csr", "admin", "owner"],
    submenus: [{ label: "All Orders", icon: "assignment", route: "/orders" }],
  },
  {
    label: "Customer Management",
    icon: "groups",
    roles: ["csr", "admin", "owner"],
    submenus: [
      { label: "Customers List", icon: "person", route: "/customers" },
    ],
  },
  {
    label: "Logistics Management",
    icon: "local_shipping",
    roles: ["driver", "csr", "admin", "owner"],
    submenus: [
      { label: "Logistics List", icon: "schedule", route: "/logistics" },
      {
        label: "Onsite Services",
        icon: "room_service",
        route: "/logistics/onsite",
        // disabled: true,

      },
    ],
  },
  {
    label: "Item Management",
    icon: "receipt_long",
    roles: ["csr", "admin", "owner"],
    submenus: [
      { label: "Item List", icon: "inventory", route: "/items" },
      {
        label: "Item Requests",
        icon: "playlist_add",
        route: "/items/requests",
        // disabled: true,

      },
    ],
  },
  {
    label: "Tagging",
    icon: "sell",
    roles: ["production", "admin", "owner"],
    submenus: [{ label: "Manage Tags", icon: "sell", route: "/tags" }],
  },
  {
    label: "Packing",
    icon: "local_mall",
    roles: ["production", "admin", "owner"],
    submenus: [{ label: "Manage Packs", icon: "inventory_2", route: "/packs" }],
  },
  {
    label: "Finance & Accounting",
    icon: "account_balance",
    roles: ["accounts", "admin", "owner"],
    submenus: [
      { label: "Payments", icon: "payments", route: "/finance/payments" },
      {
        label: "Settlements",
        icon: "fact_check",
        route: "/finance/settlements",
      },
      {
        label: "Discounts",
        icon: "percent",
        route: "/finance/discounts",
        // disabled: true,

      },
      {
        label: "Accounting",
        icon: "calculate",
        route: "/finance/accounting",
        // disabled: true,

      },
    ],
  },
  {
    label: "Reports",
    icon: "analytics",
    roles: ["admin", "owner"],
    submenus: [
      {
        label: "Financial Dashboard",
        icon: "bar_chart",
        route: "/reports/financial",
        // disabled: true,

      },
      {
        label: "Operations Dashboard",
        icon: "work",
        route: "/reports/operations",
        // disabled: true,

      },
      {
        label: "Customer Dashboard",
        icon: "people",
        route: "/reports/customers",
        // disabled: true,

      },
      {
        label: "Staff & Driver Dashboard",
        icon: "badge",
        route: "/reports/staff",
        // disabled: true,

      },
    ],
  },
  {
    label: "Settings",
    icon: "settings",
    roles: ["admin"],
    submenus: [
      {
        label: "Staff & Roles",
        icon: "supervisor_account",
        route: "/settings/staff",
        // disabled: true,

      },
      {
        label: "Holiday Calendar",
        icon: "event",
        route: "/settings/holidays",
        // disabled: true,

      },
      {
        label: "Announcements",
        icon: "campaign",
        route: "/settings/announcements",
        // disabled: true,

      },
      {
        label: "Audit Logs",
        icon: "rule_folder",
        route: "/settings/audit",
        // disabled: true,

      },
    ],
  },
  {
    label: "Error Reporting",
    icon: "report_problem",
    roles: ["csr", "production", "driver", "admin", "owner"],
    submenus: [
      {
        label: "Error Logs",
        icon: "bug_report",
        route: "/errors/logs",
        // disabled: true,

      },
      {
        label: "Error Dashboard",
        icon: "query_stats",
        route: "/errors/dashboard",
        // disabled: true,

      },
    ],
  },
  {
    label: "POS",
    icon: "point_of_sale",
    roles: ["csr", "admin", "accounts", "owner"],
    submenus: [
      { label: "New POS Order", icon: "add_shopping_cart", route: "/pos" },
      {
        label: "POS Transactions",
        icon: "receipt",
        route: "/pos/transactions",
        // disabled: true,

      },
    ],
  },
];

// Filter menu by role
const filteredMenu = computed(() => {
  if (!userRole.value) return [];
  return fullMenu.filter((section) =>
    section.roles.map((r) => r.toLowerCase()).includes(userRole.value)
  );
});

/** Toggle behavior:
 * - Desktop: toggle mini <-> full (drawer stays visible, icons always visible)
 * - Mobile: open/close overlay
 */
const toggleDrawer = () => {
  if (isMobile.value) {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  } else {
    miniState.value = !miniState.value;
  }
};

/** Keep model in sync when user clicks outside mobile overlay, etc. */
const handleDrawerModel = (val) => {
  if (isMobile.value) {
    leftDrawerOpen.value = val;
  }
};

const navigateTo = (path) => {
  if (route.path !== path) {
    router.push(path);
    // On mobile, close after navigation
    if (isMobile.value) leftDrawerOpen.value = false;
  }
};

const logout = async () => {
  const { error } = await logoutUser();
  if (!error) router.push("/login");
};

// On mount, get role
onMounted(async () => {
  const transactionStore = useTransactionStore();
  const position = await transactionStore.getUserPosition();
  if (position) {
    userRole.value = position.trim().toLowerCase();
    console.log("User role:", userRole.value);
  } else {
    console.warn("No user role found in profile.");
  }
});

// Expand on hover (desktop only)
const onMouseEnter = () => {
  if (!isMobile.value) miniState.value = false;
};
const onMouseLeave = () => {
  if (!isMobile.value) miniState.value = true;
};
</script>
