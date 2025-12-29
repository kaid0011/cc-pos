<template>
  <div class="row justify-center page-title-header text-uppercase">Onsite Jobs List</div>

  <div class="full-container logistics-management">
    <div class="row items-center q-mb-md">
      <q-input
        class="date-input"
        v-model="formattedFilterDate"
        outlined
        dense
        label="Search C/D Date Here"
        clearable
        readonly
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy>
              <q-date v-model="selectedFilterDate" mask="YYYY-MM-DD" />
            </q-popup-proxy>
          </q-icon>
          <q-icon name="close" class="cursor-pointer q-ml-sm" @click="selectedFilterDate = null" />
        </template>
      </q-input>

    </div>

    <!-- Driver filter removed: render one list -->
    <RITableComponent :rows="paginatedOrders" :selected-filter-date="selectedFilterDate" />

    <!-- Pagination Controls -->
    <div class="row justify-center q-mt-md">
      <q-pagination v-model="currentPage" :max="totalPages" :max-pages="10" boundary-numbers direction-links />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useQuasar } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";
import RITableComponent from "@/components/RITableComponent.vue";

const $q = useQuasar();
const transactionStore = useTransactionStore();

// STATE
const searchQuery = ref("");
const selectedFilterDate = ref(new Date().toISOString().split("T")[0]);

const currentPage = ref(1);
const pageSize = ref(10);

const allOrders = ref([]);
const deliveryExceptions = ref([]);

const exceptionsByLogisticsId = computed(() => {
  const m = new Map();
  for (const ex of deliveryExceptions.value || []) {
    const key = ex?.logistics_id;
    if (key == null) continue;
    const id = String(key);
    if (!m.has(id)) m.set(id, []);
    m.get(id).push(ex);
  }
  for (const arr of m.values()) {
    arr.sort((a, b) => {
      const da = new Date(a?.delivery_date || 0).getTime();
      const db = new Date(b?.delivery_date || 0).getTime();
      if (db !== da) return db - da;
      return String(b?.delivery_time || "").localeCompare(String(a?.delivery_time || ""));
    });
  }
  return m;
});

// HELPERS
const toISODate = (d) => {
  if (!d) return null;
  if (typeof d === "string") {
    const m = d.match(/^\d{4}-\d{2}-\d{2}/);
    if (m) return m[0];
  }
  const dt = new Date(d);
  if (isNaN(dt)) return null;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formattedFilterDate = computed(() => formatDate(selectedFilterDate.value));

const pickCollectionDateRaw = (t) =>
  t?.collections?.[0]?.collection_date ||
  t?.collection_date ||
  t?.logistics_collections?.[0]?.collection_date ||
  null;

const pickDeliveryDateRaw = (t) =>
  t?.deliveries?.[0]?.delivery_date ||
  t?.delivery_date ||
  t?.logistics_deliveries?.[0]?.delivery_date ||
  null;

const getEffectiveDateISO = (t) => {
  return {
    col: toISODate(pickCollectionDateRaw(t)),
    del: toISODate(pickDeliveryDateRaw(t)),
  };
};

// Is there any exception for this logistics on the selected date?
const exceptionDateMatchedFor = (log, targetISO) => {
  if (!targetISO) return false;
  const key = String(log?.logistics_id ?? log?.id ?? "");
  if (!key) return false;
  const list = exceptionsByLogisticsId.value.get(key) || [];
  return list.some((ex) => toISODate(ex?.delivery_date) === targetISO);
};

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
      "-",
    order_production: Array.isArray(order?.order_production) ? order.order_production[0] : order?.order_production ?? {},
    payment_status: op?.payment_status ?? order?.payment_status ?? "-",
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
      logistics.collections ?? r.collections ?? logistics.logistics_collections ?? r.logistics_collections ?? [];

    const deliveries =
      logistics.deliveries ?? r.deliveries ?? logistics.logistics_deliveries ?? r.logistics_deliveries ?? [];

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

onMounted(async () => {
  await transactionStore.loadDrivers?.();

  try {
    const raw = await transactionStore.fetchAllOrdersSimple();
    allOrders.value = normalizeOrders(raw);
  } catch (e) {
    console.error("Failed to fetch orders:", e);
    $q.notify({ type: "negative", message: "Failed to load orders" });
  }

  try {
    const ex = await transactionStore.fetchDeliveryExceptions();
    deliveryExceptions.value = Array.isArray(ex) ? ex : [];
  } catch (e) {
    console.error("Failed to fetch delivery exceptions:", e);
  }
});

const filteredOrders = computed(() => {
  const query = searchQuery.value?.toLowerCase?.() || "";
  const targetISO = selectedFilterDate.value ? toISODate(selectedFilterDate.value) : null;

  return (allOrders.value || [])
    .filter((log) => {
      const customerName = log.customer?.name?.toLowerCase?.() || "";
      const orderNo = log.order?.order_no?.toLowerCase?.() || "";
      const status = log.logistics_status?.toLowerCase?.() || "";

      const matchesSearch =
        !query || customerName.includes(query) || orderNo.includes(query) || status.includes(query);
      if (!matchesSearch) return false;

      if (!targetISO) return true;

      const txISO = getEffectiveDateISO(log);
      const exMatched = exceptionDateMatchedFor(log, targetISO);

      return txISO.col === targetISO || txISO.del === targetISO || exMatched;
    })
    .sort((a, b) => {
      const txA = getEffectiveDateISO(a);
      const txB = getEffectiveDateISO(b);
      const isoA = txA.col || txA.del || "";
      const isoB = txB.col || txB.del || "";
      if (!isoA && !isoB) return 0;
      if (!isoA) return 1;
      if (!isoB) return -1;
      return isoA.localeCompare(isoB);
    });
});

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredOrders.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / pageSize.value) || 1);

// WATCHERS
watch([selectedFilterDate, searchQuery], () => {
  currentPage.value = 1;
});
</script>
