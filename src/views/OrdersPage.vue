<!-- src/pages/OrdersPage.vue -->
<template>
  <div class="row justify-center page-title-header text-uppercase">
    List of Orders
  </div>

  <div class="full-container orders-history">
    <!-- Search & Date Filters -->
    <div class="row justify-end q-mb-md q-gutter-x-sm">
      <!-- Collection Date -->
      <div class="col">
        <div class="dialog-label">
          <div class="text-weight-bold text-subtitle2">Collection Date</div>
        </div>
        <q-input v-model="formattedCollectionDate" outlined dense readonly class="bg-white">
          <template #append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="collectionDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
            <q-icon name="close" class="cursor-pointer q-ml-sm" @click="clearDate('collectionDate')" />
          </template>
        </q-input>
      </div>

      <!-- Delivery Date -->
      <div class="col">
        <div class="dialog-label">
          <div class="text-weight-bold text-subtitle2">Delivery Date</div>
        </div>
        <q-input v-model="formattedDeliveryDate" outlined dense readonly class="bg-white">
          <template #append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="deliveryDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
            <q-icon name="close" class="cursor-pointer q-ml-sm" @click="clearDate('deliveryDate')" />
          </template>
        </q-input>
      </div>

      <!-- Search -->
      <div class="col">
        <div class="dialog-label">
          <div class="text-weight-bold text-subtitle2">Search Here...</div>
        </div>
        <q-input
          class="search-transactions search-input"
          v-model="searchQuery"
          outlined
          dense
          debounce="300"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </div>
    </div>

    <!-- Table Component -->
    <LogisticsTableComponent
      :rows="paginatedOrders"
      :selected-filter-date="selectedFilterDateForHighlight"
      :delivery-exceptions="deliveryExceptions"
    />

    <!-- Pagination -->
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
import { ref, onMounted, computed } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import LogisticsTableComponent from "@/components/LogisticsTableComponent.vue";

const transactionStore = useTransactionStore();

const rawOrders = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref("");

// single-date filters
const collectionDate = ref(null);
const deliveryDate = ref(null);

// delivery exceptions (included in Delivery Date filtering and passed to child)
const deliveryExceptions = ref([]);

onMounted(async () => {
  try {
    rawOrders.value = await transactionStore.fetchAllOrdersSimple();
    if (typeof transactionStore.fetchDeliveryExceptions === "function") {
      deliveryExceptions.value =
        (await transactionStore.fetchDeliveryExceptions()) || [];
    }
  } catch (error) {
    console.error("Error during mount:", error);
  }
});

const formattedCollectionDate = computed(() => formatDate(collectionDate.value));
const formattedDeliveryDate = computed(() => formatDate(deliveryDate.value));

const clearDate = (type) => {
  if (type === "collectionDate") collectionDate.value = null;
  if (type === "deliveryDate") deliveryDate.value = null;
};

// highlight preference
const selectedFilterDateForHighlight = computed(
  () => deliveryDate.value || collectionDate.value || null
);

/* ---------------- utils ---------------- */
const toDateOnly = (s) => {
  if (!s) return null;
  const t = String(s);
  return t.includes("T") ? t.split("T")[0] : t;
};
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const dOnly = toDateOnly(dateString);
  const date = new Date(dOnly);
  if (isNaN(date)) return "-";
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
const s = (v) => String(v ?? "").toLowerCase();
const digits = (v) => String(v ?? "").replace(/\D/g, "");

/* -------- exceptions map for fast lookup -------- */
const exceptionsByLogisticsId = computed(() => {
  const m = new Map();
  for (const ex of deliveryExceptions.value || []) {
    const id = ex?.logistics_id;
    if (id == null) continue;
    const key = String(id);
    if (!m.has(key)) m.set(key, []);
    m.get(key).push(ex);
  }
  return m;
});

const hasExceptionDeliveryOnDate = (logistics, isoDate) => {
  if (!isoDate) return false;
  const key = String(logistics?.logistics_id ?? logistics?.id ?? "");
  if (!key) return false;
  const list = exceptionsByLogisticsId.value.get(key) || [];
  return list.some((ex) => toDateOnly(ex?.delivery_date) === isoDate);
};

/* -------- search field collector -------- */
function collectSearchFields(logistics, order) {
  const cust = logistics.customer || {};
  const coll = logistics.collections?.[0] || {};
  const delv = logistics.deliveries?.[0] || {};

  // contact person can come from either contact_person or customer_contact_persons
  const collCP = coll.contact_person || coll.customer_contact_persons || {};
  const delvCP = delv.contact_person || delv.customer_contact_persons || {};

  const fields = [
    order?.order_no,
    // customer
    cust?.name,
    cust?.contact_no1,
    cust?.contact_no2,
    cust?.email,
    // collection contact person
    collCP?.name,
    collCP?.contact_no1,
    collCP?.contact_no2,
    collCP?.email,
    // delivery contact person
    delvCP?.name,
    delvCP?.contact_no1,
    delvCP?.contact_no2,
    delvCP?.email,
  ];

  return fields
    .map((v) => String(v ?? "").trim())
    .filter((v) => v.length > 0)
    .map((v) => ({ raw: v.toLowerCase(), num: digits(v) }));
}

/* ---------------- filtering ---------------- */
const filteredOrders = computed(() => {
  const q = s(searchQuery.value || "");
  const qNum = digits(searchQuery.value || "");
  const selectedCollection = toDateOnly(collectionDate.value);
  const selectedDelivery = toDateOnly(deliveryDate.value);

  return rawOrders.value
    .map((logistics) => {
      const order = logistics.order || {};

      const recordCollection = toDateOnly(logistics.collections?.[0]?.collection_date || null);
      const recordDelivery = toDateOnly(logistics.deliveries?.[0]?.delivery_date || null);

      const collectionMatch =
        !selectedCollection || recordCollection === selectedCollection;

      const deliveryMatch =
        !selectedDelivery ||
        recordDelivery === selectedDelivery ||
        hasExceptionDeliveryOnDate(logistics, selectedDelivery);

      // ✅ updated search coverage
      const fields = collectSearchFields(logistics, order);
      const searchMatch =
        q === "" ||
        fields.some(
          (f) =>
            f.raw.includes(q) ||
            (qNum.length >= 3 && f.num && f.num.includes(qNum)) // Why: helps phone number search ignoring formatting
        );

      const normalizedOrder =
        collectionMatch && deliveryMatch && searchMatch && order.order_no
          ? [
              {
                ...order,
                customer: logistics.customer || null,
                customer_id: logistics.customer?.id || null,
                goods_status: order?.order_production?.goods_status || "-",
                payment_status: order?.order_payment?.payment_status || "-",
                total_amount: parseFloat(order?.order_payment?.total_amount || 0).toFixed(2),
                paid_amount: parseFloat(order?.order_payment?.paid_amount || 0).toFixed(2),
                balance_amount: parseFloat(
                  (order?.order_payment?.total_amount || 0) -
                    (order?.order_payment?.paid_amount || 0)
                ).toFixed(2),
              },
            ]
          : [];

      return { ...logistics, orders: normalizedOrder };
    })
    .filter((l) => l.orders.length > 0);
});

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredOrders.value.slice(start, end);
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredOrders.value.length / pageSize.value))
);
</script>
