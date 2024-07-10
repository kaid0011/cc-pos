<template>
  <div class="home">
    <h1>Cotton Care POS</h1>
    <div class="q-gutter-xl">
      <q-btn push @click="goToAdmin" class="home-buttons q-pa-none bg-primary">
        <q-card flat class="home-card">
          <q-card-section>
            <div class="text-h4 text-white">Admin</div>
          </q-card-section>
        </q-card>
      </q-btn>
      <q-btn
        push
        @click="goToProduction"
        class="home-buttons q-pa-none bg-primary"
      >
        <q-card flat class="home-card">
          <q-card-section>
            <div class="text-h4 text-white">Production</div>
          </q-card-section>
        </q-card>
      </q-btn>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goToProduction = () => {
  router.push({ name: "Production Login" });
};

const goToAdmin = () => {
  router.push({ name: "Admin Login" });
};
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.home-buttons {
  width: 350px;
  height: 180px;
}
.home-card {
  background-color: rgba(0, 0, 0, 0);
}
</style>
