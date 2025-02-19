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

          <!-- Transaction History Page -->
          <q-item
            clickable
            @click="goToTransactionHistory"
            :active="isTransactionHistoryActive"
            class="q-pa-md"
          >
            <q-item-section avatar>
              <q-icon name="receipt_long" />
            </q-item-section>
            <q-item-section> Transaction History </q-item-section>
          </q-item>

          <!-- Customers Page -->
          <q-item
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
const isTransactionHistoryActive = computed(() => route.path === "/transactions");

// Check if the current route is Customers Page
const isCustomersPageActive = computed(() => route.path === "/customers");

// Check if the current route is Tags Page
const isTagsPageActive = computed(() => route.path === "/tags");

// Check if the current route requires authentication
const requiresAuth = computed(() => {
  // Define routes that require authentication
  const authRequiredRoutes = ["/dashboard", "/pos", "/transactions", "/customers", "/tags"];
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

const goToTransactionHistory = () => {
  router.push("/transactions");
};

const goToTagsPage = () => {
  router.push("/tags");
};
const goToCustomersPage = () => {
  router.push("/customers");
};
</script>
