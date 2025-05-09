<template>
    <div class="full-container orders-history">
      <div class="text-h6 text-center text-uppercase text-weight-bolder q-mb-md">
        Order Management
      </div>
  
      <!-- Search Filters -->
      <div class="row justify-end q-mb-sm q-gutter-x-sm">
        <!-- Search Input -->
        <div class="col-4">
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
          <div class="col bordered q-py-sm text-weight-bolder">Customer Name</div>
          <div class="col bordered q-py-sm text-weight-bolder">
            Payment Status
          </div>
          <div class="col bordered q-py-sm text-weight-bolder">
            Paid Amount
          </div>
          <div class="col bordered q-py-sm text-weight-bolder">Unpaid Amount</div>
          <div class="col bordered q-py-sm text-weight-bolder"></div>
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
              <a
                v-if="order.customer?.id"
                @click.prevent="openCustomerTab(order.customer.id)"
                class="text-weight-bold text-subtitle1"
              >
                {{ order.customer?.name || "Unknown" }}
              </a>
              <span v-else>N/A</span>
            </div>
            <div class="col bordered text-uppercase">
              {{ order.payment_status || "N/A" }}
            </div>
            <div class="col bordered">
              
            </div>
            <div class="col bordered">
              
            </div>
            <div class="col bordered">
              <q-btn unelevated color="primary">Pay Order</q-btn>
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
  
  
  // Fetch orders on mount
  onMounted(async () => {
    try {
      orders.value = await transactionStore.fetchAllOrdersSimple();
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  });
  
  // Format date display
  const formattedCollectionStartDate = computed(() => formatDate(collectionStartDate.value));
  const formattedCollectionEndDate = computed(() => formatDate(collectionEndDate.value));
  const formattedDeliveryStartDate = computed(() => formatDate(deliveryStartDate.value));
  const formattedDeliveryEndDate = computed(() => formatDate(deliveryEndDate.value));
  
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
  
    return orders.value.map(logistics => ({
      ...logistics,
      orders: logistics.orders?.filter(order => {
        const collectionDate = logistics.collections?.[0]?.collection_date || null;
        const deliveryDate = logistics.deliveries?.[0]?.delivery_date || null;
  
        const collectionMatch =
          (!collectionStartDate.value || collectionDate >= collectionStartDate.value) &&
          (!collectionEndDate.value || collectionDate <= collectionEndDate.value);
  
        const deliveryMatch =
          (!deliveryStartDate.value || deliveryDate >= deliveryStartDate.value) &&
          (!deliveryEndDate.value || deliveryDate <= deliveryEndDate.value);
  
        const searchMatch =
          (order.order_no && order.order_no.toLowerCase().includes(query)) ||
          (order.customer?.name && order.customer.name.toLowerCase().includes(query)) ||
          (order.goods_status && order.goods_status.toLowerCase().includes(query)) ||
          (order.payment_status && order.payment_status.toLowerCase().includes(query)) ||
          (logistics.logistics_status && logistics.logistics_status.toLowerCase().includes(query));
  
        return collectionMatch && deliveryMatch && searchMatch;
      }) || []
    })).filter(logistics => logistics.orders.length > 0);
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
  const openOrderDialog = async (order) => {
    try {
      if (!order) return;
  
      // Pre-fill the transaction store with customer details
      transactionStore.setSelectedCustomer({
        id: order.customer_id,
      });
  
      // Set order number
      transactionStore.setOrderNo(order.order_no);
  
      // Reset previous transaction items
      transactionStore.resetTransactionItems();
  
      // Open order details in a new tab
      window.open(`/orders/${order.order_no}`, "_blank");
    } catch (error) {
      console.error("Error opening order dialog:", error);
    }
  };
  </script>
  