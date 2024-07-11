<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container class="app-page">
      <q-page>
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
// import { ref } from 'vue';
// import { supabase } from "@/../supabase/config.js";

// const session = ref();

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
