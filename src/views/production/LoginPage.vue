<template>
    <div class="production-login">
      <h1>PRODUCTION</h1>
      <div class="q-gutter-xl">
        <q-btn push @click="goToProduction" class="home-buttons q-pa-none bg-primary">
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
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  const goToProduction = () => {
    router.push({ name: 'Production' })
  }
  </script>
  
  <style scoped>
  .home-buttons {
    width: 350px;
    height: 180px;
  }
  .home-card {
    background-color: rgba(0, 0, 0, 0);
  }
  </style>
  