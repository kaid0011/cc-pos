<template>
  <div class="full-container tags-management">
    <div class="text-h6 text-center text-uppercase text-weight-bolder q-mb-md">
      Tags Management
    </div>
    <!-- Search Bar -->
    <div class="row justify-end q-mb-sm q-gutter-x-sm">
      <q-input
        class="search-transactions search-input"
        v-model="searchQuery"
        outlined
        dense
        placeholder="Search Here..."
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
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
        v-if="filteredOrders.length === 0"
        class="text-center text-grey q-pa-lg text-h6"
      >
        No existing transactions.
      </div>
      <div
        v-else
        v-for="order in filteredOrders"
        :key="order.id"
        class="row row-col-row q-mx-md"
      >
        <div class="col">
          <a
            @click="openOrderDialog(order)"
            class="text-subtitle1 text-weight-bold"
            >{{ order.order_no }}</a
          >
        </div>
        <div class="col">
          <div>
            {{ formatDate(order.collection?.collection_date) || "[NOT SET]" }}
          </div>
          <!-- <div>
                <span class="text-weight-bold q-mr-sm">Time:</span
                >{{ order.collection?.collection_time || "-" }}
              </div> -->
          <div>
            <span class="text-weight-bold q-mr-sm">Driver:</span
            >{{ order.collection?.driver?.name || "-" }}
          </div>
        </div>
        <div class="col">
          <div>
            {{ formatDate(order.delivery?.delivery_date) || "[NOT SET]" }}
          </div>
          <!-- <div>
                <span class="text-weight-bold q-mr-sm">Time:</span
                >{{ order.delivery?.delivery_time || "-" }}
              </div> -->
          <div>
            <span class="text-weight-bold q-mr-sm">Driver:</span
            >{{ order.delivery?.driver?.name || "-" }}
          </div>
        </div>
        <div class="col">
          <div>
            <a
              @click.prevent="openCustomerTab(order.customer.customer_id)"
              class="text-subtitle1 text-weight-bold"
              >{{ order.customer.name }}</a
            >
          </div>
          <div>
            {{ order.customer.contact_no1 }}
          </div>
          <div v-if="order.customer.contact_no2">
            {{ order.customer.contact_no2 }}
          </div>
        </div>
        <div class="col">{{ formatTimestamp(order.tag_timestamp) }}</div>
        <div class="col">{{ order.tag_changes }}</div>
        <div class="col" :class="getStatusClass(order.tag_status)">
          
          <div class="text-h6 text-weight-bolder">{{ order.tag_status }}</div>
          <div>
            <q-btn
              label="View Tag"
              color="primary"
              dense
              class="q-px-sm q-my-sm"
              @click="viewTag(order.order_no)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";

const transactionStore = useTransactionStore();
const orders = ref([]);
const searchQuery = ref("");

// Fetch all orders on mount
onMounted(async () => {
  try {
    orders.value = await transactionStore.fetchAllOrders();
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
});

// Computed property for filtered orders
const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    return (
      order.order_no?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      order.customer_name
        ?.toLowerCase()
        .includes(searchQuery.value.toLowerCase())
    );
  });
});

// Helper function to format dates
const formatDate = (date) => {
  if (!date) return "N/A"; // Handle empty or null dates

  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A"; // Handle invalid dates

  return d.toLocaleDateString("en-GB", {
    weekday: "short", // "Fri"
    day: "2-digit", // "31"
    month: "2-digit", // "01"
    year: "numeric", // "2025"
  });
};

// Open Order Dialog
const openOrderDialog = (order) => {
  window.open(`/orders/${order.order_no}`, "_blank");
};

// Helper function to format tag timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  const options = {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return date.toLocaleString("en-US", options);
};

// Helper method to get status classes
const getStatusClass = (status) => {
  if (!status) return "";
  const formattedStatus = status.toLowerCase();
  if (formattedStatus === "done") return "status-done";
  if (formattedStatus === "to print") return "status-to-print";
  return "";
};

const viewTag = (order_no) => {
  const url = `/tags/${order_no}`;
  window.open(url, "_blank");
};

const openCustomerTab = (customer_id) => {
  const url = `/customers/${customer_id}`;
  window.open(url, "_blank");
};
</script>
