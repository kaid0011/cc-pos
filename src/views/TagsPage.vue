<template>
  <div class="full-container transactions-history">
    <div class="text-h6 text-center text-uppercase text-weight-bold q-mb-md">
      Tags Management
    </div>
    <!-- Search Bar -->
    <div class="row justify-end q-mb-sm q-gutter-x-sm">
      <!-- Date Range Filters -->
      <!-- <div class="date-filter-container row q-gutter-x-sm">
        <q-input
          class="date-input"
          v-model="startDate"
          type="date"
          outlined
          dense
          label="Start Date"
          clearable
        />
        <q-input
          class="date-input"
          v-model="endDate"
          type="date"
          outlined
          dense
          label="End Date"
          clearable
        />
      </div> -->
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
        <div class="col">Order No</div>
        <div class="col">Collection Date</div>
        <div class="col">Delivery Date</div>
        <div class="col">Driver</div>
        <div class="col">Customer Name</div>
        <div class="col">Tag Timestamp</div>
        <div class="col">Changes</div>
        <div class="col">Status</div>
        <div class="col">Actions</div>
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
          <div class="col">
            <a @click.prevent="openCustomerTab(order.customer_id)">{{
              order.customer_name
            }}</a>
          </div>
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

  <!-- Customer Dialog -->
  <q-dialog v-model="customerDialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          Customer Details (ID: {{ selectedCustomer?.id }})
        </div>
        <div class="customer-details text-p">
          <div>
            <span class="text-weight-bold">Created At:</span>
            {{ selectedCustomer?.created_at }}
          </div>
          <div>
            <span class="text-weight-bold">Name:</span>
            {{ selectedCustomer?.name }}
          </div>
          <div>
            <span class="text-weight-bold">Contact No 1:</span>
            {{ selectedCustomer?.contact_no1 }}
          </div>
          <div>
            <span class="text-weight-bold">Contact No 2:</span>
            {{ selectedCustomer?.contact_no2 }}
          </div>
          <div>
            <span class="text-weight-bold">Email:</span>
            {{ selectedCustomer?.email }}
          </div>
          <div>
            <span class="text-weight-bold">Address:</span>
            {{ selectedCustomer?.address }}
          </div>
          <div>
            <span class="text-weight-bold">Remarks:</span>
            {{ selectedCustomer?.remarks }}
          </div>
          <div>
            <span class="text-weight-bold">Postal:</span>
            {{ selectedCustomer?.postal }}
          </div>
          <div>
            <span class="text-weight-bold">Recommended By:</span>
            {{ selectedCustomer?.recommended_by }}
          </div>
          <div>
            <span class="text-weight-bold">Type:</span>
            {{ selectedCustomer?.type }}
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Close"
          color="primary"
          @click="customerDialog = false"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { fetchAllOrders } from "@/../supabase/api/orders";
import { useRouter } from "vue-router";
const transactionStore = useTransactionStore();
const orders = ref([]);
const orderDialog = ref(false);
const collectionDialog = ref(false);
const deliveryDialog = ref(false);
const customerDialog = ref(false);
const selectedOrder = ref(null);
const selectedCollection = ref(null);
const selectedDelivery = ref(null);
const selectedCustomer = ref(null);
const contactPerson = ref(null);
const transactionItems = ref([]);
const searchQuery = ref("");
const startDate = ref(null);
const endDate = ref(null);

const router = useRouter();
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
          collection_date: collection?.date_collected || "N/A",
          delivery_date: delivery?.date_delivered || "N/A",
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
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString();
};

const openCustomerTab = (customerId) => {
  const url = `/customers/${customerId}`;
  window.open(url, "_blank"); // Open in a new tab
};

const createTransaction = async (order) => {
  try {
    // Pre-fill the transaction store with customer details
    transactionStore.setSelectedCustomer({
      id: order.customer_id,
      name: order.customer_name,
      contact_no1: order.contact_no1,

      contact_no2: order?.contact_no2,
      email: order?.email,
      remarks: order?.remarks,
      type: order?.type,
    });

    // Adjust the order number
    const newOrderNo = `${order.order_no}-1`;
    transactionStore.setOrderNo(newOrderNo);

    // Reset other transaction details except items
    transactionStore.resetItems();
    transactionStore.setReadyBy("");

    // Navigate to PosPage.vue
    router.push({ name: "Pos" });
  } catch (error) {
    console.error("Error creating transaction:", error);
  }
};

// Open Order Dialog and fetch transaction items
const openOrderDialog = async (order) => {
  try {
    // Pre-fill the transaction store with customer details
    transactionStore.setSelectedCustomer({
      id: order.customer_id,
      name: order.customer_name,
      contact_no1: order.contact_no1,
      contact_no2: order?.contact_no2,
      email: order?.email,
      remarks: order?.remarks,
      type: order?.type,
    });

    // Set order number
    transactionStore.setOrderNo(order.order_no);

    // Set other transaction details
    transactionStore.resetItems(); // Reset previous transaction items
    transactionStore.setReadyBy(order.ready_by);

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

</script>
