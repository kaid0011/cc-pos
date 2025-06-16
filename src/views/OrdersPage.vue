<template>
  <div class="full-container orders-history">
    <div class="text-h6 text-center text-uppercase text-weight-bolder q-mb-md">
      Order Management
    </div>

    <!-- Search & Date Filters -->
    <div class="row justify-end q-mb-sm q-gutter-x-sm">
      <!-- Collection Start Date -->
      <div class="col">
        <q-input v-model="formattedCollectionStartDate" outlined dense label="Collection Start Date" readonly class="bg-white">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="collectionStartDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
            <q-icon name="close" class="cursor-pointer q-ml-sm" @click="clearDate('collectionStartDate')" />
          </template>
        </q-input>
      </div>

      <!-- Collection End Date -->
      <div class="col">
        <q-input v-model="formattedCollectionEndDate" outlined dense label="Collection End Date" readonly class="bg-white">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="collectionEndDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
            <q-icon name="close" class="cursor-pointer q-ml-sm" @click="clearDate('collectionEndDate')" />
          </template>
        </q-input>
      </div>

      <!-- Delivery Start Date -->
      <div class="col">
        <q-input v-model="formattedDeliveryStartDate" outlined dense label="Delivery Start Date" readonly class="bg-white">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="deliveryStartDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
            <q-icon name="close" class="cursor-pointer q-ml-sm" @click="clearDate('deliveryStartDate')" />
          </template>
        </q-input>
      </div>

      <!-- Delivery End Date -->
      <div class="col">
        <q-input v-model="formattedDeliveryEndDate" outlined dense label="Delivery End Date" readonly class="bg-white">
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="deliveryEndDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
            <q-icon name="close" class="cursor-pointer q-ml-sm" @click="clearDate('deliveryEndDate')" />
          </template>
        </q-input>
      </div>

      <!-- Search Input -->
      <div class="col">
        <q-input
          class="search-transactions search-input"
          v-model="searchQuery"
          outlined
          dense
          placeholder="Search Order No, Customer Name, Goods Status, Logistics Status, or Payment Status"
          debounce="300"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Table Display -->
    <div class="row-col-table">
      <!-- Table Header -->
      <div class="row row-col-header q-px-md">
        <div class="col bordered q-py-sm text-weight-bolder">Order No</div>
        <div class="col bordered q-py-sm text-weight-bolder">
          Collection Date
        </div>
        <div class="col bordered q-py-sm text-weight-bolder">Delivery Date</div>
        <div class="col bordered q-py-sm text-weight-bolder">Goods Status</div>
        <div class="col bordered q-py-sm text-weight-bolder">
          Logistic Status
        </div>
        <div class="col bordered q-py-sm text-weight-bolder">
          Payment Status
        </div>
        <div class="col bordered q-py-sm text-weight-bolder">Customer Name</div>
      </div>

      <!-- Table Rows -->
      <div
        v-if="paginatedOrders.length === 0"
        class="text-center text-grey q-pa-lg text-h6"
      >
        No orders found.
      </div>

      <div v-else v-for="(logistics, index) in paginatedOrders" :key="index">
        <div
          v-for="(order, idx) in logistics.orders"
          :key="idx"
          class="row row-col-row q-px-md"
        >
          <div class="col bordered">
            <a
              @click="openOrderDialog(order)"
              class="text-weight-bold text-subtitle1"
            >
              {{ order.order_no }}
            </a>
          </div>
          <div class="col bordered">
            <div>{{ getCollectionDate(logistics.collections) }}</div>
            <div><span class="text-weight-bold q-mr-xs">Time:</span>{{ logistics.collections?.[0]?.collection_time || 'N/A' }}</div>
          </div>
          <div class="col bordered">
            <div>{{ getDeliveryDate(logistics.deliveries) }}</div>
            <div><span class="text-weight-bold q-mr-xs">Time:</span>{{ logistics.collections?.[0]?.collection_time || 'N/A' }}</div>
          </div>
          <div class="col bordered text-uppercase">
            <div class="text-weight-bold text-subtitle1 text-center q-mb-sm" style="border-style: solid; border-width: 1px;">{{ order.goods_status }}</div>
            <div><span class="text-weight-bold q-mr-xs">Bags:</span> {{ logistics.collections?.[0]?.no_bags || '-' }}</div>
            <div><span class="text-weight-bold q-mr-xs">Hang:</span> {{ order.order_production?.no_hangers || '-' }}</div>
            <div><span class="text-weight-bold q-mr-xs">Pack:</span> {{ order.order_production?.no_packets || '-' }}</div>
          </div>
          <div class="col bordered text-uppercase">
            <div class="text-weight-bold text-subtitle1 text-center q-mb-sm" style="border-style: solid; border-width: 1px;">{{ logistics.logistics_status }}</div>
          </div>
          <div class="col bordered text-uppercase">
            <div class="text-weight-bold text-subtitle1 text-center q-mb-sm" style="border-style: solid; border-width: 1px;">{{ order.payment_status }}</div>
            <div>Paid: <span class="q-ml-xs text-weight-bold">{{ order.paid_amount }}</span></div>
            <div>Balance: <span class="q-ml-xs text-red text-weight-bold">{{ order.total_amount - order.paid_amount }}</span></div>
            <div>Amount: <span class="q-ml-xs text-weight-bold">{{ order.total_amount }}</span></div>
          </div>
          <div class="col bordered">
            <a
              v-if="order.customer?.id"
              @click.prevent="openCustomerTab(order.customer.id)"
              class="text-weight-bold text-subtitle1"
            >
              {{ order.customer?.name || "Unknown" }}
            </a>
            <span v-else>N/A</span>
          </div>
        </div>
      </div>
    </div>
    <!-- Pagination Controls -->
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

const transactionStore = useTransactionStore();
const rawOrders = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref("");

const collectionStartDate = ref(null);
const collectionEndDate = ref(null);
const deliveryStartDate = ref(null);
const deliveryEndDate = ref(null);

onMounted(async () => {
  try {
    rawOrders.value = await transactionStore.fetchAllOrdersSimple();
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
});

const formattedCollectionStartDate = computed(() => formatDate(collectionStartDate.value));
const formattedCollectionEndDate = computed(() => formatDate(collectionEndDate.value));
const formattedDeliveryStartDate = computed(() => formatDate(deliveryStartDate.value));
const formattedDeliveryEndDate = computed(() => formatDate(deliveryEndDate.value));

const clearDate = (type) => {
  if (type === "collectionStartDate") collectionStartDate.value = null;
  if (type === "collectionEndDate") collectionEndDate.value = null;
  if (type === "deliveryStartDate") deliveryStartDate.value = null;
  if (type === "deliveryEndDate") deliveryEndDate.value = null;
};

const filteredOrders = computed(() => {
  const query = searchQuery.value.toLowerCase();

  return rawOrders.value.map((logistics) => {
    const order = logistics.order || {};

    const collectionDate = logistics.collections?.[0]?.collection_date || null;
    const deliveryDate = logistics.deliveries?.[0]?.delivery_date || null;

    const collectionMatch =
      (!collectionStartDate.value || collectionDate >= collectionStartDate.value) &&
      (!collectionEndDate.value || collectionDate <= collectionEndDate.value);

    const deliveryMatch =
      (!deliveryStartDate.value || deliveryDate >= deliveryStartDate.value) &&
      (!deliveryEndDate.value || deliveryDate <= deliveryEndDate.value);

    const searchMatch =
      (order.order_no.toLowerCase().includes(query)) ||
      (logistics.customer?.name.toLowerCase().includes(query)) ||
      (order.goods_status?.toLowerCase().includes(query)) ||
      (order.order_payment?.payment_status.toLowerCase().includes(query)) ||
      (logistics.logistics_status.toLowerCase().includes(query));

    return {
      ...logistics,
      orders: collectionMatch && deliveryMatch && searchMatch && order.order_no
  ? [{
      ...order,
      customer: logistics.customer || null,
      customer_id: logistics.customer?.id || null,
      goods_status: order.order_production?.goods_status || "N/A",
      payment_status: order.order_payment?.payment_status || "N/A",
      total_amount: order.order_payment?.total_amount || "N/A",
      paid_amount: order.order_payment?.paid_amount || "0"
    }]
  : [],

    };
  }).filter((l) => l.orders.length > 0);
});

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredOrders.value.slice(start, end);
});

const totalPages = computed(() =>
  Math.ceil(filteredOrders.value.length / pageSize.value)
);

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getCollectionDate = (collections) => {
  if (!collections || collections.length === 0) return "N/A";
  return formatDate(collections[0]?.collection_date);
};

const getDeliveryDate = (deliveries) => {
  if (!deliveries || deliveries.length === 0) return "N/A";
  return formatDate(deliveries[0]?.delivery_date);
};

const openCustomerTab = (customerId) => {
  if (!customerId) return;
  window.open(`/customers/${customerId}`, "_blank");
};

const openOrderDialog = async (order) => {
  try {
    if (!order) return;

    transactionStore.setSelectedCustomer({ id: order.customer_id });
    transactionStore.setOrderNo(order.order_no);
    transactionStore.resetTransactionItems();

    window.open(`/orders/${order.order_no}`, "_blank");
  } catch (error) {
    console.error("Error opening order dialog:", error);
  }
};
</script>