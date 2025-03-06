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
  <div class="full-container logistics-management">
<div class="row justify-between items-center q-mb-md">
  <q-input
  class="date-input"
  v-model="formattedDate"
  outlined
  dense
  label="Search Date Here"
  clearable
  readonly
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
      @click="selectedDate = null;"
    />
  </template>
  </q-input>
  <div class="text-h6 text-center text-uppercase text-weight-bolder">
    Collections & Deliveries
    <!-- Collections & Deliveries ({{ collectionCount }} : {{ deliveryCount }}) -->
  </div>
  <q-btn
  label="Create Collection"
  color="primary"
  class="main-button float-right"
  icon="add"
  @click="openCreateCollectionDialog()"
/>
</div>

    <div>

      <!-- Tab Panels -->
      <q-tabs v-model="activeDriverTab" align="justify" class="tab-header">
        <!-- Dynamic Driver Tabs -->
        <q-tab v-for="driver in driverTabs" :key="driver" :name="driver" :class="{'active-tab': activeDriverTab === driver, 'text-weight-bold text-subtitle1 tab-divider': true}">
          {{ driver }} ({{ getTransactionsByDriver(driver).filter(t => t.type === 'collection').length }} : {{ getTransactionsByDriver(driver).filter(t => t.type === 'delivery').length }})
        </q-tab>
      </q-tabs>
      

      <q-tab-panels v-model="activeDriverTab" animated>
        <!-- Dynamic Driver Panels -->
        <q-tab-panel
          v-for="driver in driverTabs"
          :key="driver"
          :name="driver"
          class="q-pa-none"
        >
          <div class="row-col-table">
            <!-- Table Header -->
            <div class="row row-col-header q-px-md">
              <div class="col bordered q-py-sm text-weight-bolder">Customer</div>
              <div class="col bordered q-py-sm text-weight-bolder">Date</div>
              <div class="col bordered q-py-sm text-weight-bolder">Contact Person</div>
              <div class="col bordered q-py-sm text-weight-bolder">Address</div>
              <!-- <div class="col bordered q-py-sm text-weight-bolder">Driver Name</div> -->
              <div class="col bordered q-py-sm text-weight-bolder">Pack Type</div>
              <div class="col q-py-sm text-weight-bolder">Remarks</div>
              <div class="col bordered q-py-sm text-weight-bolder">Status</div>
            </div>

            <!-- Table Rows -->
            <div v-if="getTransactionsByDriver(driver).length === 0" class="text-center text-grey q-pa-lg text-h6">
              No transactions found for this driver.
            </div>

            <div
              v-else
              v-for="transaction in getTransactionsByDriver(driver)"
              :key="transaction.id"
              class="row row-col-row q-mx-md"
            >
              <div class="col bordered">
                <div class="text-weight-bold">
                  <a
                    @click.prevent="openCustomerTab(transaction.customer?.id)"
                    class="text-weight-bold text-subtitle1"
                  >
                    {{ transaction.customer?.name || "[NOT SELECTED]" }}
                  </a>
                </div>
                <div>{{ transaction.customer?.contact_no1 || "-" }}</div>
                <div v-if="transaction.customer?.contact_no2">
                  {{ transaction.customer?.contact_no2 || "-" }}
                </div>
              </div>
              <div class="col bordered">
                <div v-if="transaction.type === 'collection'">
                  <div class="text-weight-bolder text-uppercase">
                    <mark-pink>Collection:</mark-pink>
                  </div>
                  <div>{{ formatDate(transaction.collection_date) || "[NOT SET]" }}</div>
                </div>
                <div v-if="transaction.type === 'delivery'">
                  <div class="text-weight-bolder text-uppercase">
                    <mark-blue>Delivery:</mark-blue>
                  </div>
                  <div>{{ formatDate(transaction.delivery_date) || "[NOT SET]" }}</div>
                </div>
                <div>
                  <span class="text-weight-bold">Time: </span>
                  {{ transaction.collection_time || transaction.delivery_time || "-" }}
                </div>
                <div>
                  <span class="text-weight-bold">Driver: </span>{{ transaction.driver?.name || "[NOT SET]" }}</div>
                <!-- <div v-if="transaction.driver">
                  {{ transaction.driver?.contact_no1 }}
                </div> -->
              </div>
              <div class="col bordered">
                <div>{{ transaction.contact_person?.name || "[NOT SET]" }}</div>
                <div>{{ transaction.contact_person?.contact_no1 || "-" }}</div>
                <div v-if="transaction.contact_person?.contact_no2">
                  {{ transaction.contact_person?.contact_no2 || "-" }}
                </div>
              </div>
              <div class="col bordered">
                {{ transaction.address || "[NOT SET]" }}
              </div>
              <!-- <div class="col bordered">
                <div>{{ transaction.driver?.name || "[NOT SET]" }}</div>
                <div v-if="transaction.driver">
                  {{ transaction.driver?.contact_no1 }}
                </div>
              </div> -->
              <div class="col bordered">{{ transaction.pack_type || "-" }}</div>
              <div class="col bordered">{{ transaction.remarks || "-" }}</div>
              <div class="col mark-bg-pink bordered text-uppercase text-weight-bold" v-if="transaction.type === 'collection'">
                <div class="text-uppercase">{{ transaction.status }}</div>
                <div v-if="transaction.order_no" class="q-mt-sm text-">
                  <q-btn
                    outline
                    color="blue-8"
                    dense
                    @click="openOrderDialog(transaction)"
                    class="text-weight-bold bg-blue-1"
                  >
                    {{ transaction.order_no }}
                  </q-btn>
                </div>
                <div v-else>
                  <q-btn
                    dense
                    label="Create Order"
                    color="primary"
                    unelevated
                    class="q-mt-sm"
                    @click="createOrder(transaction)"
                  />
                </div>
              </div>
              <div class="col mark-bg-blue bordered text-uppercase text-weight-bold" v-if="transaction.type === 'delivery'">
                <div class="text-uppercase">{{ transaction.status }}</div>
                <div v-if="transaction.order_no" class="q-mt-sm text-">
                  <q-btn
                    outline
                    color="blue-8"
                    dense
                    @click="openOrderDialog(transaction)"
                    class="text-weight-bold bg-blue-1"
                  >
                    {{ transaction.order_no }}
                  </q-btn>
                </div>
                <div v-else>
    
                </div>
                </div>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- dialogs -->
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
        <q-card-section class="q-pa-none">
          <!-- Inject the CreateCollectionTab Component Here -->
          <CreateCollectionTab />
        </q-card-section>
        <q-card-actions align="right" class="bg-grey-5">
          <q-btn
            color="negative"
            @click="showCreateCollectionDialog = false"
            label="Close"
          />
          <q-btn
            color="primary"
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
          <CreateOrder />
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
const allTransactions = ref([]);
const searchQuery = ref("");
const filteredTransactions = ref([]);
const activeDriverTab = ref("All");
const selectedDate = ref(new Date().toISOString().split("T")[0]);

const showCreateCollectionDialog = ref(false);


const showCreateOrderDialog = ref(false);
const selectedTransaction = ref(null);

const collectionCount = computed(() => {
  return filteredTransactions.value.filter(t => t.type === "collection").length;
});

const deliveryCount = computed(() => {
  return filteredTransactions.value.filter(t => t.type === "delivery").length;
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

const driverTabs = computed(() => {
  const driverNames = transactionStore.driverOptions.map((driver) => driver.name);
  return ["All", "[NOT SET]", ...new Set(driverNames)];
});

onMounted(async () => {
  try {
    await transactionStore.loadDrivers(); // Load drivers from the database

    if (driverTabs.value.length > 0) {
      activeDriverTab.value = driverTabs.value[0]; // Set first tab as default
    }

    const rawCollections = await transactionStore.fetchAllCollections();
    const rawDeliveries = await transactionStore.fetchAllDeliveries();

    allTransactions.value = [
      ...rawCollections.map((item) => ({ ...item, type: "collection" })),
      ...rawDeliveries.map((item) => ({ ...item, type: "delivery" })),
    ];

    filterTransactions(); // Initial filter
  } catch (error) {
    console.error("Error initializing transactions:", error);
  }
});

const getTransactionsByDriver = (driverName) => {
  if (driverName === "All") {
    return filteredTransactions.value;
  }
  if (driverName === "[NOT SET]") {
    return filteredTransactions.value.filter(
      (transaction) => !transaction.driver || !transaction.driver.name
    );
  }
  return filteredTransactions.value.filter(
    (transaction) => transaction.driver?.name === driverName
  );
};

const filterTransactions = () => {
  const query = searchQuery.value ? searchQuery.value.toLowerCase() : "";
  const selectedDateFormatted = selectedDate.value ? formatDate(selectedDate.value) : null;

  filteredTransactions.value = allTransactions.value
    .filter((transaction) => {
      const customerName = transaction.customer?.name?.toLowerCase() || "";
      const driverName = transaction.driver?.name?.toLowerCase() || "";
      const status = transaction.status?.toLowerCase() || "";
      const transactionDate = formatDate(transaction.collection_date || transaction.delivery_date);

      if (transaction.type === "delivery" && !transaction.delivery_date) {
        return false;
      }

      const matchesSearch =
        customerName.includes(query) || driverName.includes(query) || status.includes(query);

      const matchesDate = selectedDateFormatted ? transactionDate === selectedDateFormatted : true;

      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.collection_date || a.delivery_date).getTime();
      const dateB = new Date(b.collection_date || b.delivery_date).getTime();
      return dateA - dateB;
    });
};

watch(selectedDate, filterTransactions);

const formattedDate = computed(() =>
  formatDate(selectedDate.value)
);

const openCreateCollectionDialog = () => {
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
  transactionStore.selectedDeliveryContact =
    collection.delivery?.contact_person || null;
  transactionStore.selectedCollectionContact =
    collection.contact_person || null;
  transactionStore.selectedDeliveryAddress =
    collection.delivery?.address || null;
  transactionStore.selectedCollectionAddress = collection.address || null;
  transactionStore.selectedCollectionDriver = collection.driver || null;
  transactionStore.selectedDeliveryDriver = collection.delivery?.driver || null;
  transactionStore.collectionDate = collection.collection_date || null;
  transactionStore.deliveryDate = collection.delivery?.delivery_date || null;
  transactionStore.collectionTime = collection.collection_time || null;
  transactionStore.deliveryTime = collection.delivery?.delivery_time || null;

  showCreateOrderDialog.value = true; // Open the order dialog
};

function handleClose() {
  transactionStore.resetTransactionItems();
  showCreateOrderDialog.value = false;
}
</script>
