<!-- File: src/components/PacksListComponent.vue -->
<template>
  <div class="row-col-table">
    <!-- Table Header -->
    <div class="row row-col-header">
      <div class="col header-bordered">Order Details</div>
      <div class="col header-bordered">Delivery Details</div>
      <div class="col header-bordered">Customer Details</div>
      <div class="col header-bordered">Pack Details</div>
    </div>

    <!-- Empty State -->
    <div v-if="paginatedOrders.length === 0" class="text-center text-grey q-pa-lg text-h6">
      No orders found.
    </div>

<div
  v-for="(row, index) in paginatedDisplayRows"
  :key="row.key || index"
  class="row row-col-row"
>
  <!-- Order Details -->
  <div class="col bordered">
    <q-btn
      outline
      color="blue-8"
      dense
      @click="openOrderDialog(row.base)"
      class="text-weight-bold bg-blue-1 text-subtitle1 q-px-sm q-mb-xs"
    >
      {{ row.base.order?.order_no || "N/A" }}
    </q-btn>

    <div>
      <span class="text-caption text-uppercase text-weight-bold">Date:</span>
      {{ getOrderDate(row.base) }}
    </div>

    <div>
      <span class="text-caption text-uppercase text-weight-bold">Urgency: </span>
      <span
        :class="[
          'text-uppercase',
          'text-weight-bolder',
          row.base.urgency?.toLowerCase?.() === 'urgent'
            ? 'text-purple'
            : row.base.urgency?.toLowerCase?.() === 'express'
            ? 'text-red'
            : 'text-caption',
        ]"
      >
        {{ row.base.urgency || "default" }}
      </span>
    </div>
  </div>

  <!-- Delivery Details -->
  <div class="col bordered">

    <div
      :class="[
        'text-weight-bold',
        'text-subtitle1',
        'text-center',
        'line-height-1',
        'text-uppercase',
        logisticsBadgeClass(row.base.logistics_status),
      ]"
      style="border-style: solid; border-width: 1px"
      class="q-mt-xs"
    >
      {{ row.base.logistics_status || '-' }}
    </div>

    <q-badge
      v-if="row.kind === 'exception'"
      color="red"
      flat
      class="float-right text-weight-bold"
    >
      Exception
    </q-badge>

    <div class="row" style="min-height: auto">
      <div class="col">
        <div class="q-pa-sm">
          <div>
            <span class="text-caption text-uppercase text-weight-bold">Date: </span>
            {{ deliveryDateForRow(row) }}
          </div>
          <div>
            <span class="text-caption text-uppercase text-weight-bold">Time: </span>
            {{ deliveryTimeForRow(row) || "N/A" }}
          </div>
          <div>
            <span class="text-caption text-uppercase text-weight-bold">Driver: </span>
            {{ deliveryDriverNameForRow(row) || "N/A" }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Customer Details -->
  <div class="col bordered">
    <div class="text-weight-bold">
      <a
        @click.prevent="openCustomerTab(row.base.customer?.id)"
        class="text-weight-bold text-subtitle1 line-height-1"
      >
        {{ row.base.customer?.name || "[NOT SELECTED]" }}
      </a>
    </div>

    <div>
      <template v-if="row.base.customer?.contact_no1 || row.base.customer?.contact_no2">
        <span
          v-if="row.base.customer?.contact_no1"
          class="phone-link"
          @click.stop
        >
          {{ row.base.customer?.contact_no1 }}
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-list style="min-width: 220px">
              <q-item clickable v-ripple @click="callViaPhone(row.base.customer?.contact_no1)">
                <q-item-section avatar><q-icon name="call" /></q-item-section>
                <q-item-section>Call via phone</q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="callViaWhatsApp(row.base.customer?.contact_no1)">
                <q-item-section avatar><q-icon name="chat" /></q-item-section>
                <q-item-section>Call via WhatsApp</q-item-section>
              </q-item>
            </q-list>
          </q-popup-proxy>
        </span>

        <span v-if="row.base.customer?.contact_no2"> / </span>

        <span
          v-if="row.base.customer?.contact_no2"
          class="phone-link"
          @click.stop
        >
          {{ row.base.customer?.contact_no2 }}
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-list style="min-width: 220px">
              <q-item clickable v-ripple @click="callViaPhone(row.base.customer?.contact_no2)">
                <q-item-section avatar><q-icon name="call" /></q-item-section>
                <q-item-section>Call via phone</q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="callViaWhatsApp(row.base.customer?.contact_no2)">
                <q-item-section avatar><q-icon name="chat" /></q-item-section>
                <q-item-section>Call via WhatsApp</q-item-section>
              </q-item>
            </q-list>
          </q-popup-proxy>
        </span>
      </template>
    </div>

    <q-separator class="q-mt-sm" />
    <div class="mark-yellow text-center text-uppercase">Contact Person</div>
    <q-separator />

    <div>
      {{ row.base.deliveries?.[0]?.contact_person?.name || "[NOT SET]" }}
    </div>

    <div>
      <template
        v-if="
          row.base.deliveries?.[0]?.contact_person?.contact_no1 ||
          row.base.deliveries?.[0]?.contact_person?.contact_no2
        "
      >
        <span
          v-if="row.base.deliveries?.[0]?.contact_person?.contact_no1"
          @click.stop
        >
          {{ row.base.deliveries?.[0]?.contact_person?.contact_no1 }}
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-list style="min-width: 220px">
              <q-item clickable v-ripple @click="callViaPhone(row.base.deliveries?.[0]?.contact_person?.contact_no1)">
                <q-item-section avatar><q-icon name="call" /></q-item-section>
                <q-item-section>Call via phone</q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="callViaWhatsApp(row.base.deliveries?.[0]?.contact_person?.contact_no1)">
                <q-item-section avatar><q-icon name="chat" /></q-item-section>
                <q-item-section>Call via WhatsApp</q-item-section>
              </q-item>
            </q-list>
          </q-popup-proxy>
        </span>

        <span v-if="row.base.deliveries?.[0]?.contact_person?.contact_no2">
          /
        </span>

        <span
          v-if="row.base.deliveries?.[0]?.contact_person?.contact_no2"
          class="phone-link"
          @click.stop
        >
          {{ row.base.deliveries?.[0]?.contact_person?.contact_no2 }}
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-list style="min-width: 220px">
              <q-item clickable v-ripple @click="callViaPhone(row.base.deliveries?.[0]?.contact_person?.contact_no2)">
                <q-item-section avatar><q-icon name="call" /></q-item-section>
                <q-item-section>Call via phone</q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="callViaWhatsApp(row.base.deliveries?.[0]?.contact_person?.contact_no2)">
                <q-item-section avatar><q-icon name="chat" /></q-item-section>
                <q-item-section>Call via WhatsApp</q-item-section>
              </q-item>
            </q-list>
          </q-popup-proxy>
        </span>
      </template>
    </div>
  </div>

  <!-- Pack Details -->
  <div class="col bordered text-uppercase">
    <div>
      <q-btn
        label="View Pack"
        color="primary"
        unelevated
        dense
        class="q-px-sm full-width"
        @click="viewPack(row.base.order?.order_no)"
      />
    </div>

    <div
      class="text-weight-bolder text-subtitle1 text-center q-my-sm q-py-xs line-height-1 text-uppercase"
      style="border-style: solid; border-width: 1px"
    >
      {{ row.base.order?.order_production?.goods_status || '-' }}
    </div>

    <div class="row items-center justify-between no-wrap text-center q-mt-sm">
      <div class="col-auto q-px-xs" v-if="row.base.order?.order_production?.no_hangers">
        <div class="text-weight-bold">{{ row.base.order?.order_production?.no_hangers }}</div>
        <div class="text-caption">Hang</div>
      </div>
      <div class="col-auto q-px-xs" v-if="row.base.order?.order_production?.no_packets">
        <div class="text-weight-bold">{{ row.base.order?.order_production?.no_packets }}</div>
        <div class="text-caption">Pack</div>
      </div>
      <div class="col-auto q-px-xs" v-if="row.base.order?.order_production?.no_rolls">
        <div class="text-weight-bold">{{ row.base.order?.order_production?.no_rolls }}</div>
        <div class="text-caption">Rolls</div>
      </div>
    </div>
  </div>
</div>

  </div>

  <!-- Pagination (internal like TagsListComponent) -->
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

<script setup>
import { ref, computed, watch } from 'vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { openURL } from 'quasar';

const props = defineProps({
  orders: { type: Array, required: true },
  pageSize: { type: Number, default: 10 },
});

const transactionStore = useTransactionStore();
const currentPage = ref(1);

watch(
  () => props.orders,
  () => { currentPage.value = 1; },
  { deep: false }
);

// DRIVER MAP
const driverMapById = computed(() => {
  const m = new Map();
  (transactionStore.driverOptions || []).forEach((d) => {
    if (d?.id != null) m.set(String(d.id), (d.name || '').trim());
  });
  return m;
});
const getDriverName = (id) => (id != null ? (driverMapById.value.get(String(id)) || '') : '');
const deliveryDriverName = (src) => {
  const d = Array.isArray(src?.deliveries) ? src.deliveries?.[0] : src;
  if (!d) return '';
  return (getDriverName(d?.driver_id) || d?.driver?.name || d?.driver_name || '').trim();
};

// STATUS BADGES (reuse colors)
const COLLECTION_STATUSES = [
  'collection arranged',
  'items with driver',
  'collection completed',
  'collection rescheduled',
  'collection cancelled',
  'ongoing collection issue/s',
];
const DELIVERY_STATUSES = [
  'processing items',
  'delivery arranged',
  'delivery partial',
  'delivery completed',
  'delivery postponed',
  'ongoing delivery issue/s',
];
function logisticsBadgeClass(status) {
  const s = String(status || '').trim().toLowerCase();
  if (COLLECTION_STATUSES.includes(s)) return 'mark-bg-pink';
  if (DELIVERY_STATUSES.includes(s)) return 'mark-bg-blue';
  return '';
}

// EXCEPTION FLAG
const isExceptionRow = (logistics) => {
  const d = Array.isArray(logistics?.deliveries) ? logistics.deliveries?.[0] : logistics?.delivery || null;
  if (!d) return Boolean(logistics?.is_exception);
  if (Array.isArray(d?.delivery_exceptions) && d.delivery_exceptions.length > 0) return true;
  return Boolean(d?.is_exception || logistics?.is_exception);
};

// DATES + NAV
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
  });
};
const getOrderDate = (logistics) => formatDate(logistics.order?.created_at);
const getDeliveryDate = (deliveries) =>
  !deliveries || deliveries.length === 0 ? 'N/A' : formatDate(deliveries[0]?.delivery_date);

const openCustomerTab = (customerId) => { if (customerId) window.open(`/customers/${customerId}`, '_blank'); };
const openOrderDialog = async (logistics) => {
  if (!logistics || !logistics.order) return;
  transactionStore.setSelectedCustomer({ id: logistics.customer?.id });
  transactionStore.setOrderNo(logistics.order.order_no);
  transactionStore.resetTransactionItems();
  window.open(`/orders/read-${logistics.order.order_no}`, '_blank');
};
const viewPack = (order_no) => { if (order_no) window.open(`/packs/${order_no}`, '_blank'); };

// CALL HELPERS
const sanitizeForTel = (raw) => String(raw || '').replace(/[^\d+]/g, '');
const sanitizeForWhatsApp = (raw) => String(raw || '').replace(/\D/g, '');
const callViaPhone = (raw) => { const tel = sanitizeForTel(raw); if (tel) openURL(`tel:${tel}`); };
const callViaWhatsApp = (raw) => { const wa = sanitizeForWhatsApp(raw); if (wa) openURL(`https://wa.me/${wa}`); };

// PAGINATION (internal)
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize;
  const end = start + props.pageSize;
  return (props.orders || []).slice(start, end);
});
const totalPages = computed(() =>
  Math.max(1, Math.ceil(((props.orders || []).length || 0) / props.pageSize))
);

// ============ EXCEPTIONS GROUPING (date + time + driver) ============

// reliable date-only
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

// Pull exceptions from the usual places for a logistics row
const extractExceptions = (logistics) => {
  const d = Array.isArray(logistics?.deliveries) ? logistics.deliveries?.[0] : logistics?.delivery;
  const fromDelivery = Array.isArray(d?.delivery_exceptions) ? d.delivery_exceptions : [];
  const fromLogistics = Array.isArray(logistics?.delivery_exceptions) ? logistics.delivery_exceptions : [];
  return [...fromDelivery, ...fromLogistics].filter(Boolean);
};

// key: YYYY-MM-DD__timeLabel__driverId
const exceptionGroupKey = (ex, fallbackDriverId) => {
  const day = toISODate(ex?.delivery_date) || '';
  const time = String(ex?.delivery_time || '');
  const driver = ex?.driver_id != null && ex.driver_id !== '' ? String(ex.driver_id) :
                 (fallbackDriverId != null && fallbackDriverId !== '' ? String(fallbackDriverId) : '[NOT SET]');
  return `${day}__${time}__${driver}`;
};

// Build "display rows" per logistics: 1 main + N exception-group rows
const buildRowsFor = (logistics) => {
  const rows = [];

  // MAIN row
  rows.push({
    kind: 'main',
    base: logistics,
    key: `main-${logistics?.logistics_id ?? logistics?.id ?? Math.random()}`,
  });

  // group exceptions
  const d = Array.isArray(logistics?.deliveries) ? logistics.deliveries?.[0] : logistics?.delivery || {};
  const fallbackDriverId = d?.driver_id ?? null;
  const groups = new Map();

  for (const ex of extractExceptions(logistics)) {
    const gk = exceptionGroupKey(ex, fallbackDriverId);
    if (!groups.has(gk)) {
      groups.set(gk, {
        delivery_date: toISODate(ex?.delivery_date) || null,
        delivery_time: String(ex?.delivery_time || ''),
        driver_id: ex?.driver_id != null && ex.driver_id !== '' ? ex.driver_id : fallbackDriverId,
        _rows: [],
      });
    }
    groups.get(gk)._rows.push(ex);
  }

  // to array (sort desc by date, then time desc)
  const grouped = Array.from(groups.values()).sort((a, b) => {
    const da = new Date(a.delivery_date || 0).getTime();
    const db = new Date(b.delivery_date || 0).getTime();
    if (db !== da) return db - da;
    return String(b.delivery_time || '').localeCompare(String(a.delivery_time || ''));
  });

  // push exception group rows
  grouped.forEach((g, i) => {
    rows.push({
      kind: 'exception',
      base: logistics,
      ex: g,
      key: `ex-${(logistics?.logistics_id ?? logistics?.id ?? 'x')}-${g.delivery_date}-${g.delivery_time}-${g.driver_id}-${i}`,
    });
  });

  return rows;
};

// Expanded list (all orders -> expanded rows)
const expandedRows = computed(() => {
  const src = props.orders || [];
  return src.flatMap(buildRowsFor);
});

// PAGINATION now applies to expanded rows
const paginatedDisplayRows = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize;
  const end = start + props.pageSize;
  return expandedRows.value.slice(start, end);
});
// ============ Per-row delivery field resolvers ============


// date shown for row (exception uses group date)
const deliveryDateForRow = (row) => {
  if (row.kind === 'exception') return formatDate(row.ex?.delivery_date);
  const deliveries = row.base?.deliveries || [];
  return !deliveries.length ? 'N/A' : formatDate(deliveries[0]?.delivery_date);
};

// time for row
const deliveryTimeForRow = (row) => {
  if (row.kind === 'exception') return row.ex?.delivery_time || '';
  return row.base?.deliveries?.[0]?.delivery_time || '';
};

// driver name for row
const deliveryDriverNameForRow = (row) => {
  if (row.kind === 'exception') return getDriverName(row.ex?.driver_id);
  return deliveryDriverName(row.base);
};

</script>
