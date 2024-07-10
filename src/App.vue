<template>
  <q-layout view="hHh lpR fFf">
    <div v-if="!isProductionRoute">
      <MenuLayout />
    </div>
    <q-page-container class="app-page">
      <q-page>
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import MenuLayout from "@/components/MenuLayout.vue";
// import { supabase } from "@/../supabase/config.js";

const route = useRoute();
const isProductionRoute = computed(() => route.name === 'Production' || route.name === 'Production Login' || route.name === 'Admin Login' || route.name === 'Home');

const session = ref();

// Uncomment if you need session-based logic
// onMounted(() => {
//   supabase.auth.getSession().then(({ data }) => {
//     session.value = data.session;
//   });

//   supabase.auth.onAuthStateChange((_, _session) => {
//     session.value = _session;
//   });
// });
</script>

<style scoped>
.app-page {
  margin: 0;
  padding: 0;
  position: relative;
  overflow: auto;
  width: 100vw;
  height: 100vh;
}

.app-page::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  z-index: -1; /* Place the pseudo-element behind the content */
}
</style>
