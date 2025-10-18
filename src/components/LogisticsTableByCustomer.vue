// src/components/LogisticsTableByCustomer.vue
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


   <LogisticsTableComponent
  :rows="paginatedOrders"
  :active-driver-tab="activeDriverTab"
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
import { useQuasar, openURL, copyToClipboard } from 'quasar';
import { useTransactionStore } from '@/stores/transactionStore';
import LogisticsTableComponent from '@/components/LogisticsTableComponent.vue';

const props = defineProps({
  customerId: { type: [String, Number], required: true },
});

const $q = useQuasar();
const transactionStore = useTransactionStore();

/** ---- State ---- */
const allOrders = ref([]);              // normalized list
const searchQuery = ref('');
const filterDateISO = ref(null);
const currentPage = ref(1);
const pageSize = ref(10);

// drivers
const DRIVER_NOT_SET = '[NOT SET]';
const activeDriverTab = ref(''); // optional, we don't show tabs here but highlight logic still uses this

/** ---- Lifecycle ---- */
onMounted(async () => {
  await transactionStore.loadDrivers();
  try {
    const raw = await transactionStore.fetchAllOrdersSimple();
    allOrders.value = normalizeOrders(raw).filter(
      (r) => String(r?.customer?.id ?? '') === String(props.customerId)
    );
    if (driverTabs.value.length > 0) activeDriverTab.value = driverTabs.value[0];
  } catch (e) {
    console.error('Failed to fetch orders:', e);
    $q.notify({ type: 'negative', message: 'Failed to load customer logistics' });
  }
});

/** ---- Utilities (same behavior as in LogisticsPage) ---- */
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

const getOrderDate = (t) => formatDate(t?.created_at);

function decorateOrder(order) {
  const op = order?.order_payment || order?.payment || order?.order_payments?.[0] || {};
  const total = Number(op.total_amount ?? order?.total_amount ?? 0);
  const paid = Number(op.paid_amount ?? order?.paid_amount ?? 0);
  const balance = total - paid;
  return {
    ...order,
    goods_status:
      order?.order_production?.[0]?.goods_status ??
      order?.order_production?.goods_status ??
      order?.goods_status ??
      '-',
    order_production: Array.isArray(order?.order_production)
      ? order.order_production[0]
      : order?.order_production ?? {},
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

    const collections =
      logistics.collections ??
      r.collections ??
      logistics.logistics_collections ??
      r.logistics_collections ??
      [];

    const deliveries =
      logistics.deliveries ??
      r.deliveries ??
      logistics.logistics_deliveries ??
      r.logistics_deliveries ??
      [];

    return {
      ...logistics,
      logistics_id: logistics.logistics_id ?? logistics.id,
      orders,
      order: orders?.[0] || null,
      customer,
      collections,
      deliveries,
    };
  });
}

// driver helpers
const driverMapById = computed(() => {
  const map = new Map();
  (transactionStore.driverOptions || []).forEach((d) => {
    if (d?.id != null) map.set(String(d.id), (d.name || '').trim() || DRIVER_NOT_SET);
  });
  return map;
});
const getDriverName = (id) => driverMapById.value.get(String(id)) || DRIVER_NOT_SET;
const displayDriver = (driverIdOrNotSet) =>
  driverIdOrNotSet === DRIVER_NOT_SET ? DRIVER_NOT_SET : getDriverName(driverIdOrNotSet);

const getCollectionDate = (t) => {
  let d = null;
  if (Array.isArray(t)) d = t?.[0]?.collection_date;
  else d = t?.collections?.[0]?.collection_date || t?.collection_date || t?.logistics_collections?.[0]?.collection_date;
  return d ? formatDate(d) : '-';
};
const getDeliveryDate = (t) => {
  let d = null;
  if (Array.isArray(t)) d = t?.[0]?.delivery_date;
  else d = t?.deliveries?.[0]?.delivery_date || t?.delivery_date || t?.logistics_deliveries?.[0]?.delivery_date;
  return d ? formatDate(d) : '-';
};

const COLLECTION_STATUSES = new Set([
  'collection arranged',
  'collection completed',
  'collection rescheduled',
  'collection cancelled',
]);
const DELIVERY_STATUSES = new Set([
  'delivery arranged',
  'delivery completed',
  'delivery postponed',
  'delivery partial',
]);

function logisticsBadgeClass(status) {
  const s = String(status || '').trim().toLowerCase();
  if (COLLECTION_STATUSES.has(s)) return 'mark-bg-pink';
  if (DELIVERY_STATUSES.has(s)) return 'mark-bg-blue';
  return '';
}

const isDeliveryFirst = (status) => {
  const s = String(status || '').trim().toLowerCase();
  if (DELIVERY_STATUSES.has(s) || s.startsWith('delivery')) return true;
  return false;
};

function formatAddress(addr) {
  if (!addr) return '-';
  const main = [addr.block_no, addr.road_name, addr.unit_no, addr.building_name]
    .map((v) => (v ?? '').toString().trim())
    .filter(Boolean)
    .join(' ');
  const postal = (addr.postal_code ?? '').toString().trim();
  const line = [main, postal].filter(Boolean).join(', ');
  const extra = [addr.additional_info, addr.remarks]
    .map((v) => (v ?? '').toString().trim())
    .filter(Boolean)
    .join(' — ');
  return extra ? `${line} (${extra})` : line || '-';
}

const pickCollectionContact = (logistics) => {
  const src =
    logistics?.collections?.[0]?.contact_person ||
    logistics?.collections?.[0]?.customer_contact_persons ||
    {};
  return { phone1: src.contact_no1 || '', phone2: src.contact_no2 || '', email: src.email || '' };
};

const pickDeliveryContact = (logistics) => {
  const src =
    logistics?.deliveries?.[0]?.contact_person ||
    logistics?.deliveries?.[0]?.customer_contact_persons ||
    {};
  return { phone1: src.contact_no1 || '', phone2: src.contact_no2 || '', email: src.email || '' };
};

// required by child but local to this page
const openOrderTab = (order) => {
  try {
    transactionStore.setOrderNo(order?.order_no);
    window.open(`/orders/${order?.order_no}`, '_blank');
  } catch (e) { console.error(e); }
};
const createOrder = () => {
  $q.notify({ type: 'warning', message: 'Create Order is not available from customer view.' });
};
const openCustomerTab = (customerId) => window.open(`/customers/${customerId}`, '_blank');
const openUpdateStatusDialog = (row) => transactionStore.$patch({ selectedLogisticsRow: row }); // no-op holder
const openUpdateLogistics = (logistics) => transactionStore.$patch({ logisticsId: logistics?.logistics_id || logistics?.id || null });
const openUpdateGoodsDialog = (order) => transactionStore.$patch({ selectedGoodsOrder: order });
const openAddPaymentDialog = (order, customer) => transactionStore.$patch({ selectedPaymentOrder: order, selectedPaymentCustomer: customer });

const sanitizeForTel = (raw) => String(raw || '').replace(/[^\d+]/g, '');
const sanitizeForWhatsApp = (raw) => String(raw || '').replace(/\D/g, '');
const sanitizeEmail = (raw) => String(raw || '').trim();

const callViaPhone = (raw) => { const tel = sanitizeForTel(raw); if (tel) openURL(`tel:${tel}`); };
const callViaWhatsApp = (raw) => { const wa = sanitizeForWhatsApp(raw); if (wa) openURL(`https://wa.me/${wa}`); };
const composeEmail = (raw) => { const email = sanitizeEmail(raw); if (email) openURL(`mailto:${email}`); };
const copyEmail = async (raw) => {
  const email = sanitizeEmail(raw);
  if (!email) return;
  try { await copyToClipboard(email); $q.notify({ type: 'positive', message: 'Email copied' }); }
  catch { $q.notify({ type: 'negative', message: 'Copy failed' }); }
};

const getCustomerCredits = (customer) => {
  const credits = Array.isArray(customer?.customer_credits)
    ? customer?.customer_credits?.[0]
    : customer?.customer_credits;
  const online = parseFloat(credits?.online_package ?? '0') || 0;
  const other = parseFloat(credits?.other_credits ?? '0') || 0;
  return `$${(online + other).toFixed(2)}`;
};

// filters/pagination
const filterDateDisplay = computed(() => (filterDateISO.value ? formatDate(filterDateISO.value) : ''));

const getEffectiveDateISO = (t) => ({
  col: toISODate(t?.collections?.[0]?.collection_date),
  del: toISODate(t?.deliveries?.[0]?.delivery_date),
});

const filteredOrders = computed(() => {
  const q = (searchQuery.value || '').toLowerCase();
  const targetISO = filterDateISO.value ? toISODate(filterDateISO.value) : null;

  return (allOrders.value || [])
    .filter((log) => {
      const customerName = log.customer?.name?.toLowerCase?.() || '';
      const orderNo = log.order?.order_no?.toLowerCase?.() || '';
      const status = log.logistics_status?.toLowerCase?.() || '';
      const colDriverId = log.collections?.[0]?.driver_id;
      const delDriverId = log.deliveries?.[0]?.driver_id;

      const matchesSearch =
        !q ||
        customerName.includes(q) ||
        orderNo.includes(q) ||
        status.includes(q) ||
        getDriverName(colDriverId).toLowerCase().includes(q) ||
        getDriverName(delDriverId).toLowerCase().includes(q);

      const txISO = getEffectiveDateISO(log);
      const matchesDate = targetISO ? txISO.col === targetISO || txISO.del === targetISO : true;

      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      const aISO = getEffectiveDateISO(a).col || getEffectiveDateISO(a).del || '';
      const bISO = getEffectiveDateISO(b).col || getEffectiveDateISO(b).del || '';
      if (!aISO && !bISO) return 0;
      if (!aISO) return 1;
      if (!bISO) return -1;
      return aISO.localeCompare(bISO);
    });
});

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredOrders.value.slice(start, end);
});
const totalPages = computed(() => Math.max(Math.ceil(filteredOrders.value.length / pageSize.value), 1));

const driverTabs = computed(() => {
  const ids = (transactionStore.driverOptions || []).filter(d => d?.id != null).map(d => String(d.id));
  const unique = [...new Set(ids)];
  unique.sort((a,b) => displayDriver(a).localeCompare(displayDriver(b)));
  return [...unique, DRIVER_NOT_SET];
});

// required by child signature
const getTransactionsByDriver = () => []; // not used in this view
const ordersOrPlaceholder = (logistics) =>
  Array.isArray(logistics?.orders) && logistics.orders.length > 0 ? logistics.orders : [null];
</script>

