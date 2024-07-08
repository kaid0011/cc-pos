<template>
    <div class="admin-login">
      <h1>ADMIN</h1>
      <div class="q-gutter-xl">
        <q-btn push @click="goToAdmin" class="home-buttons q-pa-none bg-primary">
          <q-card flat class="home-card">
            <q-card-section>
              <div class="text-h4 text-white">ADMIN</div>
            </q-card-section>
          </q-card>
        </q-btn>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  const goToAdmin = () => {
    router.push({ name: 'Admin' })
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
  