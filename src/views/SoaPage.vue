<!-- src/pages/SoaPage.vue -->
<template>
  <div class="row justify-center page-title-header text-uppercase">
    List of SOA
  </div>

  <div class="full-container orders-history">
    <div v-if="isLoading" class="text-center q-pa-lg">
      <q-spinner />
      <div class="q-mt-sm">Loading SOAs…</div>
    </div>

    <template v-else>
      <SoaTableComponent :rows="paginatedOrders" />

      <div class="row justify-center q-mt-md">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="10"
          boundary-numbers
          direction-links
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTransactionStore } from '@/stores/transactionStore'
import SoaTableComponent from '@/components/SoaTableComponent.vue'

const transactionStore = useTransactionStore()

const isLoading = ref(false)
const allSoas = ref([])

const currentPage = ref(1)
const pageSize = ref(10)

onMounted(async () => {
  isLoading.value = true
  try {
    const data = await transactionStore.fetchAllSoa()
    allSoas.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Failed to load SOAs:', err)
  } finally {
    isLoading.value = false
  }
})

// No filters for now; show all
const filteredOrders = computed(() => allSoas.value)

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

const totalPages = computed(() =>
  Math.max(Math.ceil(filteredOrders.value.length / pageSize.value), 1)
)
</script>
