<template>
  <q-layout view="hhh lpR lFf">
    <!-- Conditionally render Header and Drawer only if the route requires authentication -->
    <template v-if="requiresAuth">
      <!-- Top Toolbar with Menu Icon -->
      <q-header reveal>
        <q-toolbar>
          <q-btn flat round dense icon="menu" @click="toggleLeftDrawer" />
          <q-toolbar-title>POS</q-toolbar-title>
        </q-toolbar>
      </q-header>

      <!-- Sidebar Menu -->
      <q-drawer v-model="leftDrawerOpen" side="left" overlay width="250">
        <q-list>
          <!-- Dashboard Tab -->
          <q-item
            clickable
            @click="goToDashboard"
            :active="isDashboardActive"
            class="q-pa-md"
          >
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section> Dashboard </q-item-section>
          </q-item>

          <!-- POS Tab -->
          <q-item
            clickable
            @click="goToPOS"
            :active="isPOSActive"
            class="q-pa-md"
          >
            <q-item-section avatar>
              <q-icon name="point_of_sale" />
            </q-item-section>
            <q-item-section> POS </q-item-section>
          </q-item>
          
          <!-- Items Management -->
          <q-item
            clickable
            @click="goToItemsPage"
            :active="isItemsPageActive"
            class="q-pa-md"
          >
            <q-item-section avatar>
              <q-icon name="receipt_long" />
            </q-item-section>
            <q-item-section> Items Management </q-item-section>
          </q-item>


          <!-- Customers Page -->
          <q-item
            clickable
            @click="goToCustomersPage"
            :active="isCustomersPageActive"
            class="q-pa-md"
          >
            <q-item-section avatar>
              <q-icon name="groups" />
            </q-item-section>
            <q-item-section> Customer Management </q-item-section>
          </q-item>

          <!-- Logistics Management -->
          <q-item
          disable
            clickable
            @click="goToLogisticsPage"
            :active="isLogisticsPageActive"
            class="q-pa-md"
          >
            <q-item-section avatar>
              <q-icon name="local_shipping" />
            </q-item-section>
            <q-item-section> Logistics Management </q-item-section>
          </q-item>

          <!-- Logistics Management -->

          <!-- <q-expansion-item
          expand-separator
          icon="local_shipping"
          label="Logistics Management"
          header-class="q-pa-md"
          default-closed
        >
          <q-item
            clickable
            @click="goToCollections"
            :active="isCollectionsActive"
            class="q-pl-lg q-pa-sm"
          >
            <q-item-section avatar>
              <q-icon name="inventory_2" />
            </q-item-section>
            <q-item-section> Collections </q-item-section>
          </q-item>

          <q-item
            clickable
            @click="goToDeliveries"
            :active="isDeliveriesActive"
            class="q-pl-lg q-pa-sm"
          >
            <q-item-section avatar>
              <q-icon name="local_shipping" />
            </q-item-section>
            <q-item-section> Deliveries </q-item-section>
          </q-item>
        </q-expansion-item> -->

        

          <!-- Orders Page -->
          <q-item
          disable
            clickable
            @click="goToOrdersPage"
            :active="isOrdersPageActive"
            class="q-pa-md"
          >
            <q-item-section avatar>
              <q-icon name="list_alt" />
            </q-item-section>
            <q-item-section> Order Management </q-item-section>
          </q-item>

          <!-- Tags Page -->
          <q-item
          disable
            clickable
            @click="goToTagsPage"
            :active="isTagsPageActive"
            class="q-pa-md"
          >
            <q-item-section avatar>
              <q-icon name="sell" />
            </q-item-section>
            <q-item-section> Tag Management </q-item-section>
          </q-item>

          <!-- Invoices Management -->
          <q-item
          disable
            clickable
            @click="goToInvoicesPage"
            :active="isInvoicesPageActive"
            class="q-pa-md"
          >
            <q-item-section avatar>
              <q-icon name="receipt_long" />
            </q-item-section>
            <q-item-section> Invoice Management </q-item-section>
          </q-item>

          <!-- Payments Management -->
          <q-item
          disable
            clickable
            @click="goToPaymentsPage"
            :active="isPaymentsPageActive"
            class="q-pa-md"
          >
            <q-item-section avatar>
              <q-icon name="receipt_long" />
            </q-item-section>
            <q-item-section> Payments Management </q-item-section>
          </q-item>

          <!-- Log Out Tab -->
          <q-item clickable @click="logout" class="q-pa-md">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section> Log Out </q-item-section>
          </q-item>
        </q-list>
      </q-drawer>
    </template>

    <!-- Main Content -->
    <q-page-container>
      <q-page>
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "@/../supabase/api/auth";

const router = useRouter();
const route = useRoute();
const { logoutUser } = useAuth();

const leftDrawerOpen = ref(false);

// Check if the current route is Dashboard
const isDashboardActive = computed(() => route.path === "/dashboard");

// Check if the current route is POS
const isPOSActive = computed(() => route.path === "/pos");

// Check if the current route is Transaction History
const isOrdersPageActive = computed(() => route.path === "/orders");

// Check if the current route is Customers Page
const isCustomersPageActive = computed(() => route.path === "/customers");

// Check if the current route is Tags Page
const isTagsPageActive = computed(() => route.path === "/tags");

// Check if the current route is Logistics Page
const isLogisticsPageActive = computed(() => route.path === "/logistics");

// Check if the current route is Invoices Page
const isInvoicesPageActive = computed(() => route.path === "/invoices");

// Check if the current route is Items Page
const isItemsPageActive = computed(() => route.path === "/items");

// Check if the current route is Items Page
const isPaymentsPageActive = computed(() => route.path === "/payments");

// Check if the current route is Collections
// const isCollectionsActive = computed(() => route.path === "/collections");

// Check if the current route is Deliveries
// const isDeliveriesActive = computed(() => route.path === "/deliveries");

// Check if the current route requires authentication
const requiresAuth = computed(() => {
  // Define routes that require authentication
  const authRequiredRoutes = [
    "/dashboard",
    "/pos",
    "/orders",
    "/customers",
    "/tags",
    "/logistics",
    "/invoices",
    "/items",
    "/payments",
    // "/collections",
    // "/deliveries",
  ];
  return authRequiredRoutes.includes(route.path);
});

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const logout = async () => {
  const { error } = await logoutUser();

  if (!error) {
    router.push("/login"); // Redirect to login after logout
  }
};

const goToDashboard = () => {
  router.push("/dashboard");
};

const goToPOS = () => {
  router.push("/pos");
};

const goToOrdersPage = () => {
  router.push("/orders");
};

const goToTagsPage = () => {
  router.push("/tags");
};

const goToCustomersPage = () => {
  router.push("/customers");
};

const goToLogisticsPage = () => {
  router.push("/logistics");
};

// const goToCollections = () => {
//   router.push("/collections");
// };

// const goToDeliveries = () => {
//   router.push("/deliveries");
// };

const goToInvoicesPage = () => {
  router.push("/invoices");
};

const goToItemsPage = () => {
  router.push("/items");
};

const goToPaymentsPage = () => {
  router.push("/payments");
};
</script>
