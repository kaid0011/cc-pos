<!-- <template>
<div class="full-container">
    <CollectionsPage/>
    <DeliveriesPage/>
</div>
</template>

<script setup>
import CollectionsPage from '@/views/CollectionsPage.vue'
import DeliveriesPage from '@/views/DeliveriesPage.vue'
</script> -->

<template>
  <div class="full-container logistics-history">
    <q-btn
      dense
      label="Create Collection"
      color="primary"
      class="main-button q-ma-xs q-px-sm float-right"
      @click="openCollectionDialog()"
    />
    <div class="text-h6 text-center text-uppercase text-weight-bolder q-mb-md">
      Collections and Deliveries
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
              <q-icon
                name="close"
                class="cursor-pointer q-ml-sm"
                @click="clearDate('collectionStartDate')"
              />
            </template>
          </q-input>
          <q-input
            class="date-input q-mt-xs"
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
              <q-icon
                name="close"
                class="cursor-pointer q-ml-sm"
                @click="clearDate('collectionEndDate')"
              />
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
              <q-icon
                name="close"
                class="cursor-pointer q-ml-sm"
                @click="clearDate('deliveryStartDate')"
              />
            </template>
          </q-input>
          <q-input
            class="date-input q-mt-xs"
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
              <q-icon
                name="close"
                class="cursor-pointer q-ml-sm"
                @click="clearDate('deliveryEndDate')"
              />
            </template>
          </q-input>
        </div>

        <div class="col">
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
      </div>
    </div>

    <div class="row-col-table">
      <!-- Table Header -->
      <div class="row row-col-header q-px-md">
        <div class="col bordered q-py-sm text-weight-bolder">Customer</div>
        <div class="col bordered q-py-sm text-weight-bolder">Dates</div>
        <div class="col bordered q-py-sm text-weight-bolder">
          Contact Person
        </div>
        <div class="col bordered q-py-sm text-weight-bolder">Address</div>
        <div class="col bordered q-py-sm text-weight-bolder">Driver Name</div>
        <div class="col q-py-sm text-weight-bolder">Remarks</div>
        <div class="col bordered q-py-sm text-weight-bolder">Status</div>
      </div>

      <!-- Table Rows -->
      <div
        v-if="filteredCollections && filteredCollections.length === 0"
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
        <div class="col bordered">
          <div class="text-weight-bold">
            <a @click.prevent="openCustomerTab(collection.customer?.id)" class="text-weight-bold text-subtitle1">{{ collection.customer?.name || "[NOT SELECTED]" }}</a>
            
          </div>
          <div>
            {{ collection.customer?.contact_no1 || "-" }}<span v-if="collection.customer?.contact_no2"> / {{ collection.customer?.contact_no2 || "-" }}</span>
          </div>
        </div>
        <div class="col bordered">
          <div>
            <div class="text-weight-bolder text-uppercase">
              <mark-pink>Collection:</mark-pink>
            </div>
            <div>
              <div>
                {{ formatDate(collection.collection_date) || "[NOT SET]" }}
              </div>
              <div>
                <span class="text-weight-bold q-mr-sm">Time:</span
                >{{ collection.collection_time || "-" }}
              </div>
            </div>
          </div>
          <div class="q-mt-sm">
            <div class="text-weight-bolder text-uppercase">
              <mark-blue>Delivery:</mark-blue>
            </div>
            <div>
              <div>
                {{
                  formatDate(collection.delivery?.delivery_date) || "[NOT SET]"
                }}
              </div>
              <div>
                <span class="text-weight-bold q-mr-sm">Time:</span
                >{{ collection.delivery?.delivery_time || "-" }}
              </div>
            </div>
          </div>
        </div>
        <div class="col bordered">
          <div>
            <div class="text-weight-bolder text-uppercase">
              <mark-pink>Collection:</mark-pink>
            </div>
            <div>
              {{ collection?.contact_person?.name || "[NOT SET]" }}
            </div>
            <div v-if="collection.contact_person">
              {{ collection.contact_person?.contact_no1
              }}<span v-if="collection.contact_person?.contact_no2">
                / {{ collection.contact_person?.contact_no2 }}</span
              >
            </div>
          </div>
          <div class="q-mt-sm">
            <div class="text-weight-bolder text-uppercase">
              <mark-blue>Delivery:</mark-blue>
            </div>
            <div>
              {{ collection?.delivery?.contact_person?.name || "[NOT SET]" }}
            </div>
            <div v-if="collection.delivery?.contact_person">
              {{ collection.delivery?.contact_person?.contact_no1
              }}<span v-if="collection.delivery?.contact_person?.contact_no2">
                / {{ collection.delivery?.contact_person?.contact_no2 }}</span
              >
            </div>
          </div>
        </div>
        <div class="col bordered">
          <div>
            <div class="text-weight-bolder text-uppercase">
              <mark-pink>Collection:</mark-pink>
            </div>
            <div>
              {{ collection?.address || "-" }}
            </div>
          </div>
          <div class="q-mt-sm">
            <div class="text-weight-bolder text-uppercase">
              <mark-blue>Delivery:</mark-blue>
            </div>
            <div>
              {{ collection.delivery?.address || "-" }}
            </div>
          </div>
        </div>
        <div class="col bordered">
          <div>
            <div class="text-weight-bolder text-uppercase">
              <mark-pink>Collection:</mark-pink>
            </div>
            <div>
              {{ collection.driver?.name || "[UNASSIGNED]" }}
            </div>
          </div>
          <div class="q-mt-sm">
            <div class="text-weight-bolder text-uppercase">
              <mark-blue>Delivery:</mark-blue>
            </div>
            <div>
              {{ collection.delivery?.driver?.name || "[UNASSIGNED]" }}
            </div>
          </div>
        </div>
        <div class="col bordered">
          <div>
            <div class="text-weight-bolder text-uppercase">
              <mark-pink>Collection:</mark-pink>
            </div>
            <div>
              {{ collection?.remarks || "-" }}
            </div>
          </div>
          <div class="q-mt-sm">
            <div class="text-weight-bolder text-uppercase">
              <mark-blue>Delivery:</mark-blue>
            </div>
            <div>
              {{ collection.delivery?.remarks || "-" }}
            </div>
          </div>
        </div>
        <div class="col bordered">
          <div class="text-uppercase">{{ collection.status }}</div>
          <div v-if="collection.order_no" class="q-mt-sm text-">
            <q-btn outline color="blue-8" dense @click="openOrderDialog(collection)" class="text-weight-bold bg-blue-1">{{
              collection.order_no
            }}</q-btn>
          </div>
          <div v-else>
            <q-btn
              label="Create Order"
              color="primary"
              unelevated
              class="q-mt-sm"
              @click="createOrder(collection)"
            />
          </div>
          <!-- <div>
            <q-btn
              label="View Details"
              color="primary"
              unelevated
              class="q-mt-sm"
              @click="viewCollection(collection)"
            />
          </div> -->
        </div>
      </div>
    </div>
    <q-dialog
      v-model="showCreateCollectionDialog"
      persistent
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card style="min-width: 90vw">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">
            Create Collection
          </div>
        </q-card-section>
        <q-card-section>
          <!-- Inject the CreateCollectionTab Component Here -->
          <CreateCollectionTab />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            class="negative-button"
            @click="showCreateCollectionDialog = false"
            label="Close"
          />
          <q-btn
            flat
            class=""
            @click="createCollection()"
            label="Create Collection"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- Create Order Dialog -->
    <q-dialog
      v-model="showCreateOrderDialog"
      persistent
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card style="min-width: 90vw">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">
            Create Order
          </div>
        </q-card-section>
        <q-card-section>
          <!-- Inject CreateOrder Component Here -->
          <CreateOrder :collectionData="selectedCollection" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            class="negative-button"
            @click="handleClose"
            label="Close"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";
import CreateCollectionTab from "@/components/CustomerTab.vue";
import CreateOrder from "@/views/CreateOrder.vue";

const $q = useQuasar();
const transactionStore = useTransactionStore();
const router = useRouter();
const collections = ref([]);
const searchQuery = ref("");
const filteredCollections = ref([]);

const showCreateCollectionDialog = ref(false);

// Date Filters
const collectionStartDate = ref(null);
const collectionEndDate = ref(null);
const deliveryStartDate = ref(null);
const deliveryEndDate = ref(null);

const showCreateOrderDialog = ref(false);
const selectedCollection = ref(null);

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

// Watchers for date changes
watch(
  [collectionStartDate, collectionEndDate, deliveryStartDate, deliveryEndDate],
  () => {
    filterCollections();
  }
);

// Watcher for search query to trigger filtering
watch(searchQuery, () => {
  filterCollections();
});

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
    const rawCollections = await transactionStore.fetchCollectionsDeliveries();
    console.log("Fetched Collections with Delivery Date:", rawCollections);
    collections.value = rawCollections;
    filterCollections(); // Initial filter
  } catch (error) {
    console.error("Error initializing collections:", error);
  }
});

const filterCollections = () => {
  const query = searchQuery.value ? searchQuery.value.toLowerCase() : "";

  filteredCollections.value = collections.value.filter((collection) => {
    // Prepare fields to search
    const customerName = collection.customer?.name
      ? collection.customer.name.toLowerCase()
      : "";
    const driverName = collection.driver?.name
      ? collection.driver.name.toLowerCase()
      : "";
    const deliveryDriverName = collection.delivery?.driver?.name
      ? collection.delivery.driver.name.toLowerCase()
      : "";
    const status = collection.status ? collection.status.toLowerCase() : "";

    // Search Logic
    const matchesSearch =
      customerName.includes(query) ||
      driverName.includes(query) ||
      deliveryDriverName.includes(query) ||
      status.includes(query);

    // Date Parsing and Validation
    const collectionDate = collection.collection_date
      ? new Date(collection.collection_date).setHours(0, 0, 0, 0)
      : null;

    const deliveryDate = collection.delivery?.delivery_date
      ? new Date(collection.delivery.delivery_date).setHours(0, 0, 0, 0)
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

    // Combine all conditions
    return matchesSearch && matchesCollectionDate && matchesDeliveryDate;
  });
};

// View Collection Action
const viewCollection = (collection) => {
  const url = router.resolve({
    name: "LogisticsView",
    params: { id: collection.id },
  }).href;
  window.open(url, "_blank");
};

// Function to Clear Date Input
const clearDate = (dateType) => {
  switch (dateType) {
    case "collectionStartDate":
      collectionStartDate.value = null;
      break;
    case "collectionEndDate":
      collectionEndDate.value = null;
      break;
    case "deliveryStartDate":
      deliveryStartDate.value = null;
      break;
    case "deliveryEndDate":
      deliveryEndDate.value = null;
      break;
  }
  filterCollections(); // Trigger filtering after clearing the date
};

const openCollectionDialog = () => {
  showCreateCollectionDialog.value = true;
};

async function createCollection() {
  try {
    // Call the store function to create the collection
    await transactionStore.createCollection();

    // Show success dialog
    $q.dialog({
      title: "Success",
      message: "Collection created successfully!",
      ok: "OK",
      color: "positive",
    });

    // Reset the fields
    transactionStore.resetTransactionItems();

    // Close the dialog
    showCreateCollectionDialog.value = false;
  } catch (error) {
    console.error("Error submitting collection:", error.message);

    // Show error dialog
    $q.dialog({
      title: "Error",
      message: "Failed to create collection. Please try again.",
      ok: "Close",
      color: "negative",
    });
  }
}

const openOrderDialog = async (collection) => {
  try {
    // Pre-fill the transaction store with customer details
    // transactionStore.setSelectedCustomer({
    //   id: collection.customer_id,
    // });

    // Set order number
    transactionStore.setOrderNo(collection.order_no);

    // Open a new tab for the ReviewTab with the order_no as a parameter
    window.open(`/orders/${collection.order_no}`, "_blank");
  } catch (error) {
    console.error("Error creating transaction:", error);
  }
};

const openCustomerTab = (customerId) => {
  const url = `/customers/${customerId}`;
  window.open(url, "_blank"); // Open in a new tab
};

const createOrder = (collection) => {
  if (!collection) return;

  transactionStore.resetTransactionItems(); 
 // Set the transaction store properties
 transactionStore.selectedCustomer = collection.customer;
  transactionStore.selectedDeliveryContact = collection.delivery?.contact_person || null;
  transactionStore.selectedCollectionContact = collection.contact_person || null;
  transactionStore.selectedDeliveryAddress = collection.delivery?.address || null;
  transactionStore.selectedCollectionAddress = collection.address || null;
  transactionStore.selectedCollectionDriver = collection.driver || null;
  transactionStore.selectedDeliveryDriver = collection.delivery?.driver || null;
  transactionStore.collectionDate = collection.collection_date || null;
  transactionStore.deliveryDate = collection.delivery?.delivery_date || null;
  transactionStore.collectionTime = collection.collection_time || null;
  transactionStore.deliveryTime = collection.delivery?.delivery_time || null;

  // Store selected collection data
  transactionStore.selectedCollection = collection;
  showCreateOrderDialog.value = true; // Open the order dialog
};


function handleClose() {
    transactionStore.resetTransactionItems(); 
    showCreateOrderDialog.value = false ;
}

</script>
