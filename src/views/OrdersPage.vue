<template>
  <div class="full-container transactions-history">
    <div class="text-h6 text-center text-uppercase text-weight-bolder q-mb-md">
Order Management
    </div>
    <!-- Search Bar -->
    <div class="row justify-end q-mb-sm q-gutter-x-sm">
      <!-- Collection Date Filters -->
      <div class="row q-gutter-x-sm">
        <div class="col">
          <q-input
            class="date-input"
            v-model="formattedCollectionStartDate"
            outlined
            dense
            label="Collection Start Date"
            clearable
            readonly
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy>
                  <q-date v-model="collectionStartDate" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="col">
          <q-input
            class="date-input"
            v-model="formattedCollectionEndDate"
            outlined
            dense
            label="Collection End Date"
            clearable
            readonly
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy>
                  <q-date v-model="collectionEndDate" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <!-- Delivery Date Filters -->
        <div class="col">
          <q-input
            class="date-input"
            v-model="formattedDeliveryStartDate"
            outlined
            dense
            label="Delivery Start Date"
            clearable
            readonly
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy>
                  <q-date v-model="deliveryStartDate" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="col">
          <q-input
            class="date-input"
            v-model="formattedDeliveryEndDate"
            outlined
            dense
            label="Delivery End Date"
            clearable
            readonly
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy>
                  <q-date v-model="deliveryEndDate" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="col">
          <q-input
            class="search-transactions search-input"
            v-model="searchQuery"
            outlined
            dense
            placeholder="Search by Order No, Customer Name, or Status"
            @input="filterOrders"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </div>
    </div>

    <div class="row-col-table">
      <!-- Table Header -->
      <div class="row row-col-header q-px-md">
        <div class="col q-py-sm text-weight-bolder">Order No</div>
        <div class="col q-py-sm text-weight-bolder">Collection Date</div>
        <div class="col q-py-sm text-weight-bolder">Delivery Date</div>
        <div class="col q-py-sm text-weight-bolder">Goods Status</div>
        <div class="col q-py-sm text-weight-bolder">Logistic Status</div>
        <div class="col q-py-sm text-weight-bolder">Payment Status</div>
        <div class="col q-py-sm text-weight-bolder">Customer Name</div>
        <!-- <div class="col">Actions</div> -->
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
        <div class="col">{{ order.goods_status }}</div>
        <div class="col">{{ order.logistics_status }}</div>
        <div class="col">{{ order.payment_status }}</div>
          <div class="col">
            <a @click.prevent="openCustomerTab(order.customer_id)">{{
              order.customer_name
            }}</a>
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
const collectionStartDate = ref(null);
const collectionEndDate = ref(null);
const deliveryStartDate = ref(null);
const deliveryEndDate = ref(null);

// Computed properties to format the date display
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

// Function to format dates in "Thu, 30/01/2025" format
const formatDate = (dateString) => {
  if (!dateString) return ""; // Show empty input if no date is selected

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ""; // Prevent invalid date errors

  return date.toLocaleDateString("en-GB", {
    weekday: "short", // "Thu"
    day: "2-digit", // "30"
    month: "2-digit", // "01"
    year: "numeric", // "2025"
  });
};

onMounted(async () => {
  try {
    const rawOrders = await fetchAllOrders();
    console.log("Fetched Orders:", rawOrders); // Debug orders

    orders.value = await Promise.all(
      rawOrders.map(async (order) => {
        const customerDetails = await transactionStore.fetchCustomerDetailsById(
          order.customer_id
        );

        // Fetch collection and delivery dates
        const { collectionDate, deliveryDate } =
          await transactionStore.fetchDatesByOrderId(order.id);

        console.log("Fetched Dates:", {
          orderId: order.id,
          collectionDate,
          deliveryDate,
        });

        return {
          ...order,
          customer_name: customerDetails?.name || "Unknown",
          collection_date: collectionDate,
          delivery_date: deliveryDate,
        };
      })
    );

    console.log("Orders with Customer Details & Dates:", orders.value);
  } catch (error) {
    console.error("Error initializing orders:", error);
  }
});

const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    // Ensure all fields exist before applying `.toLowerCase()`
    const orderNo = order.order_no ? order.order_no.toLowerCase() : "";
    const customerName = order.customer_name
      ? order.customer_name.toLowerCase()
      : "";
    const goodsStatus = order.goods_status
      ? order.goods_status.toLowerCase()
      : "";
    const logisticsStatus = order.logistics_status
      ? order.logistics_status.toLowerCase()
      : "";
    const paymentStatus = order.payment_status
      ? order.payment_status.toLowerCase()
      : "";

    // Convert search query to lowercase
    const query = searchQuery.value ? searchQuery.value.toLowerCase() : "";

    // Check if search query matches any field
    const matchesSearch =
      orderNo.includes(query) ||
      customerName.includes(query) ||
      goodsStatus.includes(query) ||
      logisticsStatus.includes(query) ||
      paymentStatus.includes(query);

    // Ensure valid dates
    const collectionDate = order.collection_date
      ? new Date(order.collection_date).setHours(0, 0, 0, 0)
      : null;
    const deliveryDate = order.delivery_date
      ? new Date(order.delivery_date).setHours(0, 0, 0, 0)
      : null;

    const collectionStart = collectionStartDate.value
      ? new Date(collectionStartDate.value).setHours(0, 0, 0, 0)
      : null;
    const collectionEnd = collectionEndDate.value
      ? new Date(collectionEndDate.value).setHours(0, 0, 0, 0)
      : null;

    const deliveryStart = deliveryStartDate.value
      ? new Date(deliveryStartDate.value).setHours(0, 0, 0, 0)
      : null;
    const deliveryEnd = deliveryEndDate.value
      ? new Date(deliveryEndDate.value).setHours(0, 0, 0, 0)
      : null;

    // Check if collection date is within the selected range
    const matchesCollectionDate =
      (!collectionStart ||
        (collectionDate && collectionDate >= collectionStart)) &&
      (!collectionEnd || (collectionDate && collectionDate <= collectionEnd));

    // Check if delivery date is within the selected range
    const matchesDeliveryDate =
      (!deliveryStart || (deliveryDate && deliveryDate >= deliveryStart)) &&
      (!deliveryEnd || (deliveryDate && deliveryDate <= deliveryEnd));

    return matchesSearch && matchesCollectionDate && matchesDeliveryDate;
  });
});

const openCustomerTab = (customerId) => {
  const url = `/customers/${customerId}`;
  window.open(url, "_blank"); // Open in a new tab
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
</script>
