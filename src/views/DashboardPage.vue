<template>
  <div class="q-pa-md flex flex-center column welcome-wrapper">
    <q-card class="q-pa-xl welcome-card shadow-10">
      <!-- Welcome Info -->
      <div class="text-center">
        <h4 class="text-weight-medium q-ma-none q-mt-lg">
          Good {{ timeOfDay }}, {{ userProfile?.name || 'Guest' }}!
        </h4>
        <div class="text-subtitle1 text-uppercase text-grey-7 q-ma-none" v-if="userProfile?.position">
          Position: {{ userProfile.position }}
        </div>
        <h3 class="text-h4 text-primary text-weight-bold q-mb-sm">
          Welcome to Cotton Care Systems
        </h3>
        <p class="text-subtitle1 text-grey-8">
          Your complete solution for Laundry, Dry Cleaning & Upholstery Services
        </p>
        <p class="text-caption text-blue-grey-7 q-mt-sm">
          Empowering operational excellence, one fabric at a time.
        </p>
      </div>

      <!-- Equal Grid Buttons -->
      <q-separator class="q-my-md" />

      <div class="text-center text-subtitle2 text-uppercase q-mb-md">Your Quick Access Menu</div>
      <div class="row q-col-gutter-md q-row-gutter-md justify-center">
        <div
          v-for="item in filteredMenu"
          :key="item.route"
          class="col-6 col-sm-4 col-md-3"
        >
          <q-card class="menu-card flex flex-center column" flat bordered>
            <q-btn
              class="full-width full-height q-pa-md text-center"
              @click="navigateTo(item.route)"
              color="primary"
              text-color="white"
              :label="item.label"
              :icon="item.icon"
              glossy
              no-caps
              unelevated
            />
          </q-card>
        </div>
      </div>

      <!-- Go to Dashboard -->
      <div class="text-center q-mt-lg">
        <!-- <q-btn color="secondary" label="Go to Dashboard" @click="goToDashboard" /> -->
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTransactionStore } from '@/stores/transactionStore'

const router = useRouter()
const transactionStore = useTransactionStore()

const userProfile = ref(null)
const userRole = ref(null)

const hour = new Date().getHours()
const timeOfDay = computed(() => {
  if (hour < 12) return 'morning'
  else if (hour < 18) return 'afternoon'
  else return 'evening'
})

const fullMenu = [
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['driver', 'csr', 'admin', 'production'] },
  { label: 'POS', icon: 'point_of_sale', route: '/pos', roles: ['csr', 'admin', 'production'] },
  { label: 'Items Management', icon: 'receipt_long', route: '/items', roles: ['csr', 'admin'] },
  { label: 'Customer Management', icon: 'groups', route: '/customers', roles: ['csr', 'admin'] },
  { label: 'Logistics Management', icon: 'local_shipping', route: '/logistics', roles: ['driver', 'csr', 'admin'] },
  { label: 'Order Management', icon: 'list_alt', route: '/orders', roles: ['csr', 'admin'] },
  { label: 'Tag Management', icon: 'sell', route: '/tags', roles: ['production', 'admin'] },
  { label: 'Pack Management', icon: 'local_mall', route: '/packs', roles: ['production', 'admin'] },
]

const filteredMenu = computed(() => {
  if (!userRole.value) return []
  const role = userRole.value.trim().toLowerCase()
  return fullMenu.filter(item =>
    item.roles.map(r => r.toLowerCase()).includes(role)
  )
})

const navigateTo = (path) => {
  router.push(path)
}

const goToDashboard = () => {
  router.push('/dashboard')
}

onMounted(async () => {
  userProfile.value = await transactionStore.getUserProfile()
  userRole.value = userProfile.value?.position || ''
})
</script>

<style scoped>
.welcome-wrapper {
  min-height: 100vh;
  background: linear-gradient(to bottom right, #f0f4f8, #e8eff5);
}
.welcome-card {
  max-width: 700px;
  width: 100%;
  border-radius: 20px;
}
.menu-card {
  height: 120px;
  border-radius: 12px;
}
.q-btn.full-height {
  height: 100%;
  font-weight: 600;
  font-size: 0.95rem;
}
</style>
