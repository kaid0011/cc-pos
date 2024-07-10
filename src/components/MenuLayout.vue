<template>
  <q-header elevated class="bg-white text-grey-8 q-py-xs" height-hint="58">
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        @click="toggleLeftDrawer"
        aria-label="Menu"
        icon="menu"
      />
      <q-btn flat no-caps no-wrap v-if="$q.screen.gt.xs">
        <img
          src="@/assets/images/orange_logo.png"
          alt="Logo"
          style="height: 40px; width: auto"
        />
        <q-toolbar-title shrink class="text-weight-bold">
          Cotton Care Management System
        </q-toolbar-title>
      </q-btn>
<!-- 
      <q-space />

      <q-space />
      <div class="q-gutter-sm row items-center no-wrap">
        <q-btn round flat>
          <q-avatar size="26px">
            <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
          </q-avatar>
          <q-tooltip>Account</q-tooltip>
        </q-btn>
      </div> -->
    </q-toolbar>
  </q-header>
  <q-drawer
    v-model="leftDrawerOpen"
    show-if-above
    bordered
    class="bg-grey-2"
    :width="240"
  >
    <q-scroll-area class="fit">
      <q-list padding>
        <q-item
          v-for="link in links1"
          :key="link.text"
          v-ripple
          clickable
          @click="navigate(link.path)"
        >
          <q-item-section avatar>
            <q-icon color="grey" :name="link.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-left">{{ link.text }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator class="q-my-md" />
      </q-list>
      <q-list padding>
        <q-item
          v-for="link in links2"
          :key="link.text"
          v-ripple
          clickable
          @click="navigate(link.path)"
        >
          <q-item-section avatar>
            <q-icon color="grey" :name="link.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-left">{{ link.text }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator class="q-my-md" />
      </q-list>
    </q-scroll-area>
  </q-drawer>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { fabYoutube } from "@quasar/extras/fontawesome-v6";

const leftDrawerOpen = ref(false);
const search = ref("");
const router = useRouter();

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function navigate(path) {
  router.push(path);
}

const links1 = [
  { icon: "dashboard", text: "POS", path: "/production" },
  { icon: "whatshot", text: "Item Management", path: "/admin/items" },
  { icon: "subscriptions", text: "Invoice Management", path: "/admin/invoices" },
];

const links2 = [
  { icon: "logout", text: "Log Out", path: "/" }
];
</script>
