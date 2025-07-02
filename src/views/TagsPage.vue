<template>
  <div class="full-container orders-history">
    <div class="text-h6 text-center text-uppercase text-weight-bolder q-mb-md">
      Tags Management
    </div>

    <!-- Generate Tag Section -->
    <div class="row q-mb-md q-gutter-x-sm items-center">
      <q-select
        v-model="selectedDriver"
        :options="transactionStore.driverOptions"
        option-label="name"
        option-value="id"
        label="Select Driver"
        outlined
        dense
        class="col"
      />
      <q-input
        v-model="formattedSelectedDate"
        outlined
        dense
        label="Select Date"
        readonly
        class="bg-white col"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy>
              <q-date v-model="selectedDate" mask="YYYY-MM-DD" />
            </q-popup-proxy>
          </q-icon>
          <q-icon
            name="close"
            class="cursor-pointer q-ml-sm"
            @click="selectedDate = null"
          />
        </template>
      </q-input>
      <q-btn label="Generate Tag" color="primary" @click="generateTag" />
    </div>
    <!-- Search & Date Filters -->
    <div class="row justify-end q-mb-sm q-gutter-x-sm">
      <!-- Collection Start Date -->
      <div class="col">
        <q-input
          v-model="formattedCollectionStartDate"
          outlined
          dense
          label="Collection Start Date"
          readonly
          class="bg-white"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="collectionStartDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
            <q-icon
              name="close"
              class="cursor-pointer q-ml-sm"
              @click="clearDate('collectionStartDate')"
            />
          </template>
        </q-input>
      </div>

      <!-- Collection End Date -->
      <div class="col">
        <q-input
          v-model="formattedCollectionEndDate"
          outlined
          dense
          label="Collection End Date"
          readonly
          class="bg-white"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="collectionEndDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
            <q-icon
              name="close"
              class="cursor-pointer q-ml-sm"
              @click="clearDate('collectionEndDate')"
            />
          </template>
        </q-input>
      </div>

      <!-- Delivery Start Date -->
      <div class="col">
        <q-input
          v-model="formattedDeliveryStartDate"
          outlined
          dense
          label="Delivery Start Date"
          readonly
          class="bg-white"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="deliveryStartDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
            <q-icon
              name="close"
              class="cursor-pointer q-ml-sm"
              @click="clearDate('deliveryStartDate')"
            />
          </template>
        </q-input>
      </div>

      <!-- Delivery End Date -->
      <div class="col">
        <q-input
          v-model="formattedDeliveryEndDate"
          outlined
          dense
          label="Delivery End Date"
          readonly
          class="bg-white"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="deliveryEndDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
            <q-icon
              name="close"
              class="cursor-pointer q-ml-sm"
              @click="clearDate('deliveryEndDate')"
            />
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
        <div class="col text-weight-bolder q-py-sm">Order No</div>
        <div class="col text-weight-bolder q-py-sm">Collection Date</div>
        <div class="col text-weight-bolder q-py-sm">Delivery Date</div>
        <div class="col text-weight-bolder q-py-sm">Customer Name</div>
        <div class="col text-weight-bolder q-py-sm">Tag Timestamp</div>
        <div class="col text-weight-bolder q-py-sm">Changes</div>
        <div class="col text-weight-bolder q-py-sm">Status</div>
      </div>

      <!-- Table Rows -->
      <div
        v-if="paginatedOrders.length === 0"
        class="text-center text-grey q-pa-lg text-h6"
      >
        No orders found.
      </div>

      <div
        v-for="(logistics, index) in paginatedOrders"
        :key="index"
        class="row row-col-row q-px-md"
      >
        <div class="col bordered">
          <a
            @click="openOrderDialog(logistics)"
            class="text-weight-bold text-subtitle1"
          >
            {{ logistics.order?.order_no || "N/A" }}
          </a>
        </div>
        <div class="col bordered">
          <div>{{ getCollectionDate(logistics.collections) }}</div>
          <div>
            <span class="text-weight-bold q-mr-xs">Time:</span
            >{{ logistics.collections?.[0]?.collection_time || "N/A" }}
          </div>
          <div>
            <span class="text-weight-bold q-mr-xs">Driver:</span
            >{{ logistics.collections?.[0]?.driver_name || "N/A" }}
          </div>
        </div>
        <div class="col bordered">
          <div>{{ getDeliveryDate(logistics.deliveries) }}</div>
          <div>
            <span class="text-weight-bold q-mr-xs">Time:</span
            >{{ logistics.deliveries?.[0]?.delivery_time || "N/A" }}
          </div>
          <div>
            <span class="text-weight-bold q-mr-xs">Driver:</span
            >{{ logistics.deliveries?.[0]?.driver_name || "N/A" }}
          </div>
        </div>
              <div class="col bordered">
                <div class="text-weight-bold">
                  <a
                    @click.prevent="openCustomerTab(logistics.customer?.id)"
                    class="text-weight-bold text-subtitle1"
                  >
                    {{ logistics.customer?.name || "[NOT SELECTED]" }}
                  </a>
                </div>
                <div>{{ logistics.customer?.contact_no1 || "-" }}</div>
                <div v-if="logistics.customer?.contact_no2">
                  {{ logistics.customer?.contact_no2 || "-" }}
                </div>
                <q-separator class="q-my-sm" />
                <div class="mark-green">Contact Person</div>
                <div>{{ logistics.collections?.[0]?.contact_person?.name || "[NOT SET]" }}</div>
                <div>{{ logistics.collections?.[0]?.contact_person?.contact_no1 || "-" }}</div>
                <div v-if="logistics.collections?.[0]?.contact_person?.contact_no2">
                  {{ logistics.collections?.[0]?.contact_person?.contact_no2 || "-" }}
                </div>
              </div>
        <div class="col bordered text-uppercase">
          {{ logistics.order?.order_tags?.tag_timestamp || "-" }}
        </div>
        <div class="col bordered text-uppercase">
          {{ logistics.order?.order_tags?.tag_changes || "-" }}
        </div>
        <div
          class="col bordered text-uppercase text-subtitle1"
          :class="getStatusClass(logistics.order?.order_tags?.tag_status)"
        >
          <div class="text-weight-bolder">
            {{ logistics.order?.order_tags?.tag_status || "-" }}
          </div>
          <div>
            <q-btn
              label="View Tag"
              color="primary"
              dense
              class="q-px-sm q-my-sm"
              @click="viewTag(logistics.order?.order_no)"
            />
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
const orders = ref([]); // Stores fetched orders
const currentPage = ref(1); // Current page for pagination
const pageSize = ref(10); // Number of records per page

const searchQuery = ref(""); // Search input
// Date Filters
const collectionStartDate = ref(null);
const collectionEndDate = ref(null);
const deliveryStartDate = ref(null);
const deliveryEndDate = ref(null);

const selectedDriver = ref(null);
const selectedDate = ref(null);

const formattedSelectedDate = computed(() => formatDate(selectedDate.value));

const getStatusClass = (status) => {
  if (!status) return "";
  const formattedStatus = status.toLowerCase();
  if (formattedStatus === "done") return "status-done";
  if (formattedStatus === "to print") return "status-to-print";
  return "";
};

// Fetch orders on mount
onMounted(async () => {
  try {
    const result = await transactionStore.fetchAllOrdersSimple();
    orders.value = result;
    await transactionStore.loadDrivers();
  } catch (error) {
    console.error("Error on load:", error);
  }
});

// Format date display
const formattedCollectionStartDate = computed(() =>
  formatDate(collectionStartDate.value)
);
const formattedCollectionEndDate = computed(() =>
  formatDate(collectionEndDate.value)
);
const formattedDeliveryStartDate = computed(() =>
  formatDate(deliveryStartDate.value)
);
const formattedDeliveryEndDate = computed(() =>
  formatDate(deliveryEndDate.value)
);

// Clear Date Input
const clearDate = (type) => {
  if (type === "collectionStartDate") collectionStartDate.value = null;
  if (type === "collectionEndDate") collectionEndDate.value = null;
  if (type === "deliveryStartDate") deliveryStartDate.value = null;
  if (type === "deliveryEndDate") deliveryEndDate.value = null;
};

// Filter Orders Based on Search & Date Range
const filteredOrders = computed(() => {
  const query = searchQuery.value.toLowerCase();

  return orders.value.filter((logistics) => {
    const orderNo = logistics.order?.order_no?.toLowerCase() || "";
    const customerName = logistics.customer?.name?.toLowerCase() || "";
    const tagStatus =
      logistics.order?.order_tags?.tag_status?.toLowerCase() || "";

    const collectionDate = logistics.collections?.[0]?.collection_date || null;
    const deliveryDate = logistics.deliveries?.[0]?.delivery_date || null;

    const collectionMatch =
      (!collectionStartDate.value ||
        collectionDate >= collectionStartDate.value) &&
      (!collectionEndDate.value || collectionDate <= collectionEndDate.value);

    const deliveryMatch =
      (!deliveryStartDate.value || deliveryDate >= deliveryStartDate.value) &&
      (!deliveryEndDate.value || deliveryDate <= deliveryEndDate.value);

    const searchMatch =
      orderNo.includes(query) ||
      customerName.includes(query) ||
      tagStatus.includes(query);

    return collectionMatch && deliveryMatch && searchMatch;
  });
});

// Pagination: Get the paginated slice of orders
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredOrders.value.slice(start, end);
});

// Total number of pages
const totalPages = computed(() =>
  Math.ceil(filteredOrders.value.length / pageSize.value)
);

// Function to format dates
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

// Get collection date from collections array
const getCollectionDate = (collections) => {
  if (!collections || collections.length === 0) return "N/A";
  return formatDate(collections[0]?.collection_date);
};

// Get delivery date from deliveries array
const getDeliveryDate = (deliveries) => {
  if (!deliveries || deliveries.length === 0) return "N/A";
  return formatDate(deliveries[0]?.delivery_date);
};

// Open Customer Tab
const openCustomerTab = (customerId) => {
  if (!customerId) return;
  window.open(`/customers/${customerId}`, "_blank");
};

// Open Order Dialog and fetch transaction items
const openOrderDialog = async (logistics) => {
  try {
    if (!logistics || !logistics.order) return;

    transactionStore.setSelectedCustomer({
      id: logistics.customer?.id,
    });

    transactionStore.setOrderNo(logistics.order.order_no);
    transactionStore.resetTransactionItems();

    window.open(`/orders/${logistics.order.order_no}`, "_blank");
  } catch (error) {
    console.error("Error opening order dialog:", error);
  }
};

const viewTag = (order_no) => {
  const url = `/tags/${order_no}`;
  window.open(url, "_blank");
};

const DRIVER_CODES = {
  "Ass": "Ass",
  "Ken": "Ken",
  "Ang": "Ang",
  "Pea": "Pea",
  "You": "You",
  "Self-collect": "Sfc",
  "Ng Soo Chong": "Nsc",
  "Chia": "Cha",
  "Des": "Des",
  "Cue": "Cue",
  "Are": "Are",
  "Ting": "Tin",
};

const generateTag = () => {
  const driverName = selectedDriver.value?.name;
  const selectedRawDate = selectedDate.value;

  if (!driverName || !selectedRawDate) {
    console.warn("Driver or Date not selected");
    return;
  }

  const matchedOrders = filteredOrders.value.filter((logistics) =>
    logistics.collections?.some(
      (c) =>
        c?.driver_name === driverName &&
        c?.collection_date === selectedRawDate
    )
  );

  console.log("Matched Orders:", matchedOrders.map(l => l.order?.order_no));
  if (!matchedOrders.length) {
    console.warn("No matching orders found for tag generation");
    return;
  }

  const driverCode = DRIVER_CODES[driverName] || driverName;
  const groupSlug = `${driverCode}-${selectedRawDate}`;
  const url = `/tags/group/${groupSlug}`;
  window.open(url, "_blank");
};

</script>
