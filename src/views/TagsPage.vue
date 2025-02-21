<template>
  <div class="full-container transactions-history">
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
        @input="filterOrders"
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
        <div class="col text-weight-bolder q-py-sm">Driver</div>
        <div class="col text-weight-bolder q-py-sm">Customer Name</div>
        <div class="col text-weight-bolder q-py-sm">Tag Timestamp</div>
        <div class="col text-weight-bolder q-py-sm">Changes</div>
        <div class="col text-weight-bolder q-py-sm">Status</div>
        <div class="col text-weight-bolder q-py-sm">Actions</div>
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
          <a @click="openOrderDialog(order)">{{ order.order_no }}</a>
        </div>
        <div class="col">{{ formatDate(order.collection_date) }}</div>
        <div class="col">{{ formatDate(order.delivery_date) }}</div>
        <div class="col">{{ order.driver || "N/A" }}</div>
        <div class="col">
          <a @click.prevent="openCustomerTab(order.customer_id)">{{
            order.customer_name
          }}</a>
        </div>
        <div class="col">{{ formatTimestamp(order.tag_timestamp) }}</div>
        <div class="col">{{ order.tag_changes }}</div>
        <div
        class="col"
        :class="getStatusClass(order.tag_status)"
      >
        {{ order.tag_status }}
      </div>
      <div class="col">
        <q-btn
          label="View Tag"
          color="primary"
          @click="viewTag(order.order_no)"
        />
      </div>

        <!-- <div class="col">
            <q-btn
              flat
              dense
              label="Create transa..."
              color="primary"
              @click="createTransaction(order)"
            />
          </div> -->
      </div>
    </div>
  </div>


</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { fetchAllOrders } from "@/../supabase/api/orders";
const transactionStore = useTransactionStore();
const orders = ref([]);
const searchQuery = ref("");
const startDate = ref(null);
const endDate = ref(null);

// Fetch data on mount
onMounted(async () => {
  try {
    const rawOrders = await fetchAllOrders();

    // Fetch related data for collections, deliveries, and customers
    orders.value = await Promise.all(
      rawOrders.map(async (order) => {
        const collection = await transactionStore.fetchCollectionDetailsById(
          order.collection_id
        );
        const delivery = await transactionStore.fetchDeliveriesDetailsById(
          order.delivery_id
        );
        const customer = await transactionStore.fetchCustomerDetailsById(
          order.customer_id
        );

        return {
          ...order,
          collection_date: collection?.collection_date || "",
          delivery_date: delivery?.delivery_date || "",
          driver: order.driver_name || "N/A",
          customer_name: customer?.name || "Unknown", // Map customer_name
        };
      })
    );

    filteredOrders.value = orders.value; // Initialize filteredOrders
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
});


// Filtered Orders Computed Property
const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const matchesSearch =
      order.order_no.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      order.customer_name
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      order.contact_no1.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesDateRange = (() => {
      // Parse dates and set time to midnight to ensure accurate date-only comparison
      const orderDate = new Date(order.order_date_time).setHours(0, 0, 0, 0);
      const start = startDate.value
        ? new Date(startDate.value).setHours(0, 0, 0, 0)
        : null;
      const end = endDate.value
        ? new Date(endDate.value).setHours(0, 0, 0, 0)
        : null;

      return (!start || orderDate >= start) && (!end || orderDate <= end);
    })();

    return matchesSearch && matchesDateRange;
  });
});

// Helper function to format dates
const formatDate = (date) => {
  if (!date) return "N/A"; // Handle empty or null dates

  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A"; // Handle invalid dates

  return d.toLocaleDateString("en-GB", {
    weekday: "short", // "Fri"
    day: "2-digit",   // "31"
    month: "2-digit", // "01"
    year: "numeric",  // "2025"
  });
};

// Open Order Dialog and fetch transaction items
const openOrderDialog = async (order) => {
  try {
    // Pre-fill the transaction store with customer details
    transactionStore.setSelectedCustomer({
      id: order.customer_id,
    });

    // Set order number
    transactionStore.setOrderNo(order.order_no);

    // Set other transaction details
    transactionStore.resetItems(); // Reset previous transaction items

    // Open a new tab for the ReviewTab with the order_no as a parameter
    window.open(`/orders/${order.order_no}`, "_blank");
  } catch (error) {
    console.error("Error creating transaction:", error);
  }
};
// Helper function to format tag timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  
  // Format: mm/dd/yy hh:mm AM/PM
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
  if (!status) return '';
  const formattedStatus = status.toLowerCase();
  if (formattedStatus === 'done') return 'status-done';
  if (formattedStatus === 'to print') return 'status-to-print';
  return '';
};

const viewTag = (orderNo) => {
  // Open /tags/:order_no in a new tab
  const url = `/tags/${orderNo}`;
  window.open(url, '_blank');
};

const openCustomerTab = (customerId) => {
  const url = `/customers/${customerId}`;
  window.open(url, "_blank"); // Open in a new tab
};
</script>
