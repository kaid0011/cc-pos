<template>
  <div class="full-container deliveries-history">
    <div class="text-h6 text-center text-uppercase text-weight-bolder q-mb-md">
      Deliveries
    </div>
    <!-- Search Bar -->
    <div class="row justify-end q-mb-sm q-gutter-x-sm">
      <!-- Delivery Date Filters -->
      <div class="row q-gutter-x-sm">
        <div class="col">
          <q-input
            class="date-input"
            v-model="formattedDeliveryStartDate"
            outlined
            dense
            label="Delivery Start Date"
          >
            <template v-slot:append>
              <q-icon
                name="clear"
                class="cursor-pointer"
                v-if="deliveryStartDate"
                @click="deliveryStartDate = null"
              />
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
          >
            <template v-slot:append>
              <q-icon
                name="clear"
                class="cursor-pointer"
                v-if="deliveryEndDate"
                @click="deliveryEndDate = null"
              />
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
            class="search-deliveries search-input"
            v-model="searchQuery"
            outlined
            dense
            placeholder="Search by Status, Area, or Address"
            @input="filterDeliveries"
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
        <div class="col q-py-sm text-weight-bolder">Delivery Date</div>
        <div class="col q-py-sm text-weight-bolder">Customer Name</div>
        <div class="col q-py-sm text-weight-bolder">Address</div>
        <div class="col q-py-sm text-weight-bolder">Status</div>
        <div class="col q-py-sm text-weight-bolder">Remarks</div>
        <div class="col q-py-sm text-weight-bolder">Driver Name</div>
        <div class="col q-py-sm text-weight-bolder text-center">Actions</div>
      </div>

      <!-- Table Rows -->
      <div
        v-if="filteredDeliveries.length === 0"
        class="text-center text-grey q-pa-lg text-h6"
      >
        No deliveries found.
      </div>
      <div
        v-else
        v-for="delivery in filteredDeliveries"
        :key="delivery.id"
        class="row row-col-row q-mx-md"
      >
        <div class="col">{{ formatDate(delivery.delivery_date) }}</div>
        <div class="col">{{ delivery.customer?.name || "Unknown" }}</div>
        <div class="col">{{ delivery.address }}</div>
        <div class="col">{{ delivery.status }}</div>
        <div class="col">{{ delivery.remarks }}</div>
        <div class="col">{{ delivery.driver?.name || "Unassigned" }}</div> 
        <div class="col text-center">
          <q-btn
            label="View"
            color="primary"
            dense
            unelevated
            @click="viewDelivery(delivery)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useTransactionStore } from "@/stores/transactionStore";

const transactionStore = useTransactionStore();
const router = useRouter();
const deliveries = ref([]);
const searchQuery = ref("");
const deliveryStartDate = ref(null);
const deliveryEndDate = ref(null);

// Computed properties to format the date display
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
    const rawDeliveries = await transactionStore.fetchAllDeliveries();
    console.log("Fetched Deliveries:", rawDeliveries); // Debugging output

    deliveries.value = rawDeliveries;
  } catch (error) {
    console.error("Error initializing deliveries:", error);
  }
});

const filteredDeliveries = computed(() => {
  return deliveries.value.filter((delivery) => {
    const customerName = delivery.customer?.name
      ? delivery.customer.name.toLowerCase()
      : "";
    const driverName = delivery.driver?.name
      ? delivery.driver.name.toLowerCase()
      : "";
    const status = delivery.status ? delivery.status.toLowerCase() : "";
    const address = delivery.address ? delivery.address.toLowerCase() : "";

    const query = searchQuery.value ? searchQuery.value.toLowerCase() : "";

    // Check if search query matches any field
    const matchesSearch =
      customerName.includes(query) ||
      driverName.includes(query) || // Allow filtering by driver name
      status.includes(query) ||
      address.includes(query);

    // Ensure valid dates
    const deliveryDate = delivery.delivery_date
      ? new Date(delivery.delivery_date).setHours(0, 0, 0, 0)
      : null;

    const deliveryStart = deliveryStartDate.value
      ? new Date(deliveryStartDate.value).setHours(0, 0, 0, 0)
      : null;
    const deliveryEnd = deliveryEndDate.value
      ? new Date(deliveryEndDate.value).setHours(0, 0, 0, 0)
      : null;

    // Check if delivery date is within the selected range
    const matchesDeliveryDate =
      (!deliveryStart ||
        (deliveryDate && deliveryDate >= deliveryStart)) &&
      (!deliveryEnd || (deliveryDate && deliveryDate <= deliveryEnd));

    return matchesSearch && matchesDeliveryDate;
  });
});

// View Delivery Action
const viewDelivery = (delivery) => {
  const url = router.resolve({
    name: "CollectionsDeliveriesView",
    params: { id: delivery.collection_id },
  }).href;
  window.open(url, "_blank");
};
</script>
