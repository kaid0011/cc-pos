<!-- src/components/SoaTableByCustomer.vue -->
<template>
  <div>
    <div class="row items-center justify-between q-mb-sm">
      <q-input
        v-model="filterDateDisplay"
        outlined
        dense
        label="Filter by Date (Created At)"
        readonly
      >
        <template #append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy>
              <q-date v-model="filterDateISO" mask="YYYY-MM-DD" />
            </q-popup-proxy>
          </q-icon>
          <q-icon
            v-if="filterDateISO"
            name="close"
            class="cursor-pointer q-ml-sm"
            @click="filterDateISO = null"
          />
        </template>
      </q-input>

      <q-input
        v-model="searchQuery"
        outlined
        dense
        debounce="200"
        placeholder="Search SOA no / customer / contact / email"
        style="max-width: 300px"
      >
        <template #prepend><q-icon name="search" /></template>
        <template #append>
          <q-icon
            v-if="searchQuery"
            name="close"
            class="cursor-pointer"
            @click="searchQuery = ''"
          />
        </template>
      </q-input>
    </div>

    <SoaTableComponent
      :rows="paginatedOrders"
      :selected-filter-date="filterDateISO"
    />

    <div class="row justify-center q-mt-md">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="10"
        boundary-numbers
        direction-links
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useTransactionStore } from '@/stores/transactionStore'
import SoaTableComponent from '@/components/SoaTableComponent.vue'

const props = defineProps({
  customerId: { type: [String, Number], required: true }
})

const $q = useQuasar()
const transactionStore = useTransactionStore()

// State
const allOrders = ref([])
const searchQuery = ref('')
const filterDateISO = ref(null) // 'YYYY-MM-DD'
const currentPage = ref(1)
const PAGE_SIZE = 10

onMounted(async () => {
  try {
    const raw = await transactionStore.fetchAllSoa()
    allOrders.value = (raw || []).filter(
      (s) => String(s?.customers?.id ?? '') === String(props.customerId)
    )
  } catch (e) {
    console.error('Failed to fetch SOAs:', e)
    $q.notify({ type: 'negative', message: 'Failed to load customer SOAs' })
  }
})

// Reset pagination on filters
watch([searchQuery, filterDateISO], () => { currentPage.value = 1 })

const filterDateDisplay = computed(() => {
  if (!filterDateISO.value) return ''
  const d = new Date(filterDateISO.value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' })
})

const filteredOrders = computed(() => {
  const q = (searchQuery.value || '').trim().toLowerCase()
  let rows = allOrders.value

  if (q) {
    rows = rows.filter((s) => {
      const fields = [
        s?.soa_no,
        s?.customers?.name,
        s?.customers?.email,
        s?.customers?.contact_no1,
        s?.customers?.contact_no2
      ]
      return fields.some((f) => (String(f || '').toLowerCase().includes(q)))
    })
  }

  if (filterDateISO.value) {
    rows = rows.filter((s) => {
      const day = (s?.created_at ? new Date(s.created_at) : null)
      if (!day || Number.isNaN(day.getTime())) return false
      const yyyy = day.getFullYear()
      const mm = String(day.getMonth() + 1).padStart(2, '0')
      const dd = String(day.getDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}` === filterDateISO.value
    })
  }

  return rows
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE
  return filteredOrders.value.slice(start, end)
})

const totalPages = computed(() =>
  Math.max(Math.ceil(filteredOrders.value.length / PAGE_SIZE), 1)
)
</script>
