<template>
  <div class="full-container collections-history">
    <div class="text-h6 text-center text-uppercase text-weight-bolder q-mb-md">
      Collections
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
          >
            <template v-slot:append>
              <q-icon
                name="clear"
                class="cursor-pointer"
                v-if="collectionStartDate"
                @click="collectionStartDate = null"
              />
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
          >
            <template v-slot:append>
              <q-icon
                name="clear"
                class="cursor-pointer"
                v-if="collectionEndDate"
                @click="collectionEndDate = null"
              />
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy>
                  <q-date v-model="collectionEndDate" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="col">
          <q-input
            class="search-collections search-input"
            v-model="searchQuery"
            outlined
            dense
            placeholder="Search by Status, Area, or Address"
            @input="filterCollections"
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
        <div class="col q-py-sm text-weight-bolder">Collection Date</div>
        <div class="col q-py-sm text-weight-bolder">Customer Name</div>
        <div class="col q-py-sm text-weight-bolder">Address</div>
        <div class="col q-py-sm text-weight-bolder">Status</div>
        <div class="col q-py-sm text-weight-bolder">Remarks</div>
        <div class="col q-py-sm text-weight-bolder">Driver Name</div>
        <div class="col q-py-sm text-weight-bolder text-center">Actions</div>
      </div>

      <!-- Table Rows -->
      <div
        v-if="filteredCollections.length === 0"
        class="text-center text-grey q-pa-lg text-h6"
      >
        No collections found.
      </div>
      <div
        v-else
        v-for="collection in filteredCollections"
        :key="collection.id"
        class="row row-col-row q-mx-md"
      >
        <div class="col">{{ formatDate(collection.collection_date) }}</div>
        <div class="col">{{ collection.customer?.name || "Unknown" }}</div>
        <div class="col">{{ collection.address }}</div>
        <div class="col">{{ collection.status }}</div>
        <div class="col">{{ collection.remarks }}</div>
        <div class="col">{{ collection.driver?.name || "Unassigned" }}</div> 
        <div class="col text-center">
          <q-btn
            label="View"
            color="primary"
            dense
            unelevated
            @click="viewCollection(collection)"
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
const collections = ref([]);
const searchQuery = ref("");
const collectionStartDate = ref(null);
const collectionEndDate = ref(null);

// Computed properties to format the date display
const formattedCollectionStartDate = computed(() =>
  formatDate(collectionStartDate.value)
);
const formattedCollectionEndDate = computed(() =>
  formatDate(collectionEndDate.value)
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
    const rawCollections = await transactionStore.fetchAllCollections();
    console.log("Fetched Collections:", rawCollections); // Debugging output

    collections.value = rawCollections;
  } catch (error) {
    console.error("Error initializing collections:", error);
  }
});

const filteredCollections = computed(() => {
  return collections.value.filter((collection) => {
    const customerName = collection.customer?.name
      ? collection.customer.name.toLowerCase()
      : "";
    const driverName = collection.driver?.name
      ? collection.driver.name.toLowerCase()
      : "";
    const status = collection.status ? collection.status.toLowerCase() : "";
    const address = collection.address ? collection.address.toLowerCase() : "";

    const query = searchQuery.value ? searchQuery.value.toLowerCase() : "";

    // Check if search query matches any field
    const matchesSearch =
      customerName.includes(query) ||
      driverName.includes(query) || // Allow filtering by driver name
      status.includes(query) ||
      address.includes(query);

    // Ensure valid dates
    const collectionDate = collection.collection_date
      ? new Date(collection.collection_date).setHours(0, 0, 0, 0)
      : null;

    const collectionStart = collectionStartDate.value
      ? new Date(collectionStartDate.value).setHours(0, 0, 0, 0)
      : null;
    const collectionEnd = collectionEndDate.value
      ? new Date(collectionEndDate.value).setHours(0, 0, 0, 0)
      : null;

    // Check if collection date is within the selected range
    const matchesCollectionDate =
      (!collectionStart ||
        (collectionDate && collectionDate >= collectionStart)) &&
      (!collectionEnd || (collectionDate && collectionDate <= collectionEnd));

    return matchesSearch && matchesCollectionDate;
  });
});

// View Collection Action
const viewCollection = (collection) => {
  const url = router.resolve({
    name: "LogisticsView",
    params: { id: collection.id },
  }).href;
  window.open(url, "_blank");
};
</script>
