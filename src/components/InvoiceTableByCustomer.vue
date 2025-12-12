<template>
  <div>
    <div class="row items-center justify-between q-mb-sm">
      <q-input
        v-model="filterDateDisplay"
        outlined dense
        label="Filter by Date (Collection or Delivery)"
        readonly
      >
        <template #append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy>
              <q-date v-model="filterDateISO" mask="YYYY-MM-DD" />
            </q-popup-proxy>
          </q-icon>
          <q-icon v-if="filterDateISO" name="close" class="cursor-pointer q-ml-sm" @click="filterDateISO=null" />
        </template>
      </q-input>

      <q-input
        v-model="searchQuery"
        outlined dense debounce="200"
        placeholder="Search order no / status / driver..."
        style="max-width: 300px"
      >
        <template #prepend><q-icon name="search" /></template>
        <template #append>
          <q-icon v-if="searchQuery" name="close" class="cursor-pointer" @click="searchQuery=''" />
        </template>
      </q-input>
    </div>

    <InvoiceTableComponent
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
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useTransactionStore } from '@/stores/transactionStore';
import InvoiceTableComponent from '@/components/InvoiceTableComponent.vue';

const props = defineProps({
  customerId: { type: [String, Number], required: true },
});

const $q = useQuasar();
const transactionStore = useTransactionStore();

/** ---- State ---- */
const allOrders = ref([]);
const searchQuery = ref('');
const filterDateISO = ref(null);
const currentPage = ref(1);
const PAGE_SIZE = 10;

/** ---- Lifecycle ---- */
onMounted(async () => {
  await transactionStore.loadDrivers();
  try {
    const raw = await transactionStore.fetchAllOrdersSimple();
    allOrders.value = normalizeOrders(raw).filter(
      (r) => String(r?.customer?.id ?? '') === String(props.customerId)
    );
    // No driverTabs defaulting; remove if not needed by child.
  } catch (e) {
    console.error('Failed to fetch orders:', e);
    $q.notify({ type: 'negative', message: 'Failed to load customer logistics' });
  }
});

/** ---- Utilities ---- */
const toISODate = (d) => {
  if (!d) return null;
  if (typeof d === 'string') {
    const m = d.match(/^\d{4}-\d{2}-\d{2}/);
    if (m) return m[0];
  }
  const dt = new Date(d);
  if (isNaN(dt)) return null;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

function decorateOrder(order) {
  const op = order?.order_payment || order?.payment || order?.order_payments?.[0] || {};
  const total = Number(op.total_amount ?? order?.total_amount ?? 0);
  const paid = Number(op.paid_amount ?? order?.paid_amount ?? 0);
  const balance = total - paid;
  return {
    ...order,
    payment_status: op?.payment_status ?? order?.payment_status ?? '-',
    total_amount: total.toFixed(2),
    paid_amount: paid.toFixed(2),
    balance_amount: balance.toFixed(2),
  };
}

function normalizeOrders(rows) {
  const list = Array.isArray(rows) ? rows : [];
  return list.map((r) => {
    const logistics = r.logistics ?? r;
    let ordersRaw = logistics.orders ?? r.orders ?? (r.order ? [r.order] : []);
    if (!Array.isArray(ordersRaw)) ordersRaw = ordersRaw ? [ordersRaw] : [];
    const orders = ordersRaw.map((o) => decorateOrder(o));
    const customer = logistics.customer ?? r.customer ?? logistics.customers ?? r.customers ?? null;

    return {
      orders,
      order: orders?.[0] || null,
      customer,
    };
  });
}

/** ---- Filters & pagination ---- */
const filterDateDisplay = computed(() => (filterDateISO.value ? formatDate(filterDateISO.value) : ''));

const getEffectiveDateISO = (t) => ({
  col: toISODate(t?.collections?.[0]?.collection_date),
  del: toISODate(t?.deliveries?.[0]?.delivery_date),
});
const getPrimaryDateISO = (t) => {
  const d = getEffectiveDateISO(t);
  return d.col || d.del || '';
};

const filteredOrders = computed(() => {
  const q = (searchQuery.value || '').toLowerCase();
  const targetISO = filterDateISO.value ? toISODate(filterDateISO.value) : null;

  return (allOrders.value || [])
    .filter((log) => {
      const customerName = log.customer?.name?.toLowerCase?.() || '';
      const orderNo = log.order?.order_no?.toLowerCase?.() || '';

      const matchesSearch =
        !q ||
        customerName.includes(q) ||
        orderNo.includes(q) ||
        getDriverName(colDriverId).toLowerCase().includes(q) ||
        getDriverName(delDriverId).toLowerCase().includes(q);

      const txISO = getEffectiveDateISO(log);
      const matchesDate = targetISO ? txISO.col === targetISO || txISO.del === targetISO : true;

      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      const aISO = getPrimaryDateISO(a);
      const bISO = getPrimaryDateISO(b);
      if (!aISO && !bISO) return 0;
      if (!aISO) return 1;
      if (!bISO) return -1;
      return aISO.localeCompare(bISO);
    });
});

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  return filteredOrders.value.slice(start, end);
});
const totalPages = computed(() => Math.max(Math.ceil(filteredOrders.value.length / PAGE_SIZE), 1));
</script>
