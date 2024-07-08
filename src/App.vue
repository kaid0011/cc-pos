<template>
  <!-- <div v-if="session" :session="session"> -->
  <q-layout view="hHh lpR fFf">
    <!-- <TheNavigation /> -->
    <MenuLayout></MenuLayout>
    <q-page-container class="app-page">
      <q-page>
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
  <!-- </div> -->
  <!-- <AuthenticationPage v-else /> -->
</template>

<script setup>
// import TheNavigation from "@/components/TheNavigation.vue";
// import AuthenticationPage from "@/views/authentication/AuthenticationPage.vue";
import MenuLayout from "@/components/MenuLayout.vue";
import { onMounted, ref } from "vue";
import { supabase } from "@/../supabase/config.js";

const session = ref();

// onMounted(() => {
//   supabase.auth.getSession().then(({ data }) => {
//     session.value = data.session
//   })

//   supabase.auth.onAuthStateChange((_, _session) => {
//     session.value = _session
//   })
// })
</script>
<style scoped>
.app-page {
  margin: 0;
  padding: 0;
  position: relative;
  overflow: auto;
  /* background-color: rgba(0, 0, 0, 0.5); */
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
  /* background: url("@/assets/images/auth_bg.jpg") no-repeat center center; */
  background-size: cover;
  z-index: -1; /* Place the pseudo-element behind the content */
}
</style>
