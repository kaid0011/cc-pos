<template>
  <q-layout view="hhh lpR lFf">
    <template v-if="userRole">
      <q-header reveal>
        <q-toolbar>
          <q-btn flat round dense icon="menu" @click="toggleLeftDrawer" />
          <q-toolbar-title>CC Systems</q-toolbar-title>
        </q-toolbar>
      </q-header>

      <q-drawer v-model="leftDrawerOpen" side="left" overlay width="250">
        <q-list>
          <q-item
            v-for="item in filteredMenu"
            :key="item.route"
            clickable
            @click="navigateTo(item.route)"
            :active="route.path === item.route"
            class="q-pa-md"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section> {{ item.label }} </q-item-section>
          </q-item>

          <q-item clickable @click="logout" class="q-pa-md">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section> Log Out </q-item-section>
          </q-item>
        </q-list>
      </q-drawer>
    </template>

    <q-page-container>
      <q-page>
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/../supabase/api/auth';
import { supabase } from '@/../supabase/config.js';
import { useTransactionStore } from '@/stores/transactionStore';

const router = useRouter();
const route = useRoute();
const { logoutUser } = useAuth();
const leftDrawerOpen = ref(false);
const userRole = ref(null);

const fullMenu = [
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['driver', 'csr', 'admin', 'production'] },
  { label: 'POS', icon: 'point_of_sale', route: '/pos', roles: ['csr', 'admin', 'production'] },
  { label: 'Items Management', icon: 'receipt_long', route: '/items', roles: ['csr', 'admin'] },
  { label: 'Customer Management', icon: 'groups', route: '/customers', roles: ['csr', 'admin'] },
  { label: 'Logistics Management', icon: 'local_shipping', route: '/logistics', roles: ['driver', 'csr', 'admin'] },
  { label: 'Order Management', icon: 'list_alt', route: '/orders', roles: ['csr', 'admin'] },
  { label: 'Tag Management', icon: 'sell', route: '/tags', roles: ['production', 'admin'] },
  { label: 'Pack Management', icon: 'local_mall', route: '/packs', roles: ['production', 'admin'] },
];

const filteredMenu = computed(() => {
  if (!userRole.value) return [];
  const normalizedRole = userRole.value.trim().toLowerCase();
  return fullMenu.filter(item => item.roles.map(r => r.toLowerCase()).includes(normalizedRole));
});

const requiresAuth = computed(() => {
  return filteredMenu.value.some(item => item.route === route.path);
});

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const navigateTo = (path) => {
  router.push(path);
};

const logout = async () => {
  const { error } = await logoutUser();
  if (!error) router.push('/login');
};

onMounted(async () => {
  const transactionStore = useTransactionStore();
  const position = await transactionStore.getUserPosition();
  if (position) {
    userRole.value = position.trim().toLowerCase();
    console.log('User position (normalized):', userRole.value);
  } else {
    console.warn('No position found in user profile.');
  }
});
</script>

<style scoped>
</style>
