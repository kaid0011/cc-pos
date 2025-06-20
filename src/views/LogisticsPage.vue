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
    <!-- Weekly Summary Section -->
    <q-card flat class="q-mb-lg q-pa-md">
      <div class="row justify-between">
        <div class="col-2 text-center">
          <div v-if="showWeeklySummary">
            <div class="mark-green line-height-1">1+ col/del</div>
            <div class="mark-yellow line-height-1">10+ col/del</div>
            <div class="mark-red line-height-1">20+ col/del</div>
          </div>
        </div>
        <div class="col row items-center justify-center q-mb-sm">
          <q-btn
            icon="fa-regular fa-circle-left"
            color="teal-6"
            flat
            @click="previousWeek"
          />
          <div class="text-center">
            <div
              class="text-h6 text-weight-bolder text-uppercase line-height-1"
            >
              Weekly Summary
            </div>
            <div class="text-subtitle1 text-weight-bold line-height-1">
              ({{ formattedStartOfWeek }} - {{ formattedEndOfWeek }})
            </div>
          </div>
          <q-btn
            icon="fa-regular fa-circle-right"
            color="teal-6"
            flat
            @click="nextWeek"
          />
        </div>
        <div class="col-2" align="right">
          <q-btn
            outline
            color="primary"
            @click="toggleWeeklySummary"
            class="text-weight-bolder text-subtitle1"
          >
            {{ showWeeklySummary ? "Hide Summary" : "Show Summary" }}
          </q-btn>
        </div>
      </div>

      <!-- Weekly Summary Table Using <div class="row"> -->
      <div v-if="showWeeklySummary" class="weekly-summary-container">
        <!-- Header Row: Weekdays with Dates -->
        <div
          class="row text-center text-weight-bold bg-primary text-white items-center all-border"
          style="padding: 0.5em"
        >
          <div class="col">Driver</div>
          <div
            v-for="(day, index) in daysOfWeek"
            :key="day"
            class="col line-height-1"
          >
            <div class="text-uppercase text-yellow">{{ day }}</div>
            <div class="text-caption line-height-1 text-weight-bold">
              {{ formattedWeekDates[index] }}
            </div>
          </div>
        </div>

        <!-- Driver-Based Rows -->
        <div
          v-for="driver in drivers"
          :key="driver"
          class="row text-center items-center bg-grey-3 q-pa-sm all-border"
          style="padding: 0.5em"
        >
          <div class="col text-weight-bold">{{ driver }}</div>
          <div
            v-for="(day, index) in daysOfWeek"
            :key="'cd' + index"
            class="col"
          >
            <template
              v-if="
                driverTransactionCounts[driver] &&
                driverTransactionCounts[driver][day]
              "
            >
              <span
                :class="
                  getTransactionClass(
                    driverTransactionCounts[driver][day].collections
                  )
                "
              >
                C: {{ driverTransactionCounts[driver][day].collections }}
              </span>
              |
              <span
                :class="
                  getTransactionClass(
                    driverTransactionCounts[driver][day].deliveries
                  )
                "
              >
                D: {{ driverTransactionCounts[driver][day].deliveries }}
              </span>
            </template>
            <template v-else> C: 0 | D: 0 </template>
          </div>
        </div>
      </div>
    </q-card>

    <q-card flat class="generate-card q-mb-lg">
      <div class="text-subtitle1 text-uppercase text-weight-bolder">
        Generate Driver Schedule
      </div>
      <div class="row q-col-gutter-x-lg">
        <div class="col">
          <q-input
            class="date-input"
            v-model="formattedGenerateDate"
            outlined
            dense
            label="Pick a Date Here"
            clearable
            readonly
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy>
                  <q-date v-model="selectedGenerateDate" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
              <q-icon
                name="close"
                class="cursor-pointer q-ml-sm"
                @click="selectedGenerateDate = null"
              />
            </template>
          </q-input>
        </div>
        <div class="col">
          <q-select
            v-model="transactionStore.selectedGenerateDriver"
            :options="transactionStore.driverOptions"
            option-label="name"
            option-value="id"
            label="Select Driver"
            outlined
            dense
            clearable
            class="bg-white"
          />
        </div>
        <div class="col-auto">
          <q-btn
            label="Generate Driver Schedule"
            color="primary"
            class="main-button float-right"
            icon="receipt"
            @click="generateDriverSchedule()"
          />
        </div>
      </div>
    </q-card>

    <div class="row justify-between items-center q-mb-md">
      <q-input
        class="date-input"
        v-model="formattedFilterDate"
        outlined
        dense
        label="Search Date Here"
        clearable
        readonly
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy>
              <q-date v-model="selectedFilterDate" mask="YYYY-MM-DD" />
            </q-popup-proxy>
          </q-icon>
          <q-icon
            name="close"
            class="cursor-pointer q-ml-sm"
            @click="selectedFilterDate = null"
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
      <q-scroll-area class="q-mb-sm" style="width: 100%; height: 3em;" :thumb-style="thumbStyle" :bar-style="barStyle">
        <div class="row no-wrap">
          <q-tabs
            v-model="activeDriverTab"
            align="left"
            dense
            narrow-indicator
            indicator-color="secondary"
            class="tab-header"
            visible
          >
            <q-tab
              v-for="driver in driverTabs"
              :key="driver"
              :name="driver"
              :class="{
                'active-tab': activeDriverTab === driver,
                'text-weight-bold text-subtitle1 tab-divider': true,
              }"
            >
              {{ driver }} ({{
                getTransactionsByDriver(driver).filter(
                  (t) => t.type === "collection"
                ).length
              }}
              :
              {{
                getTransactionsByDriver(driver).filter(
                  (t) => t.type === "delivery"
                ).length
              }})
            </q-tab>
          </q-tabs>
        </div>
      </q-scroll-area>

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
              <div class="col bordered q-py-sm text-weight-bolder">
                Customer
              </div>
              <div class="col bordered q-py-sm text-weight-bolder">Date</div>
              <div class="col bordered q-py-sm text-weight-bolder">
                Contact Person
              </div>
              <div class="col bordered q-py-sm text-weight-bolder">Address</div>
              <!-- <div class="col bordered q-py-sm text-weight-bolder">Driver Name</div> -->
              <div class="col bordered q-py-sm text-weight-bolder">
                No. of Bags
              </div>
              <div class="col q-py-sm text-weight-bolder">Remarks</div>
              <div class="col bordered q-py-sm text-weight-bolder">Status</div>
            </div>

            <!-- Table Rows -->
            <div
              v-if="getTransactionsByDriver(driver).length === 0"
              class="text-center text-grey q-pa-lg text-h6"
            >
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
                  <div>
                    {{ formatDate(transaction.collection_date) || "[NOT SET]" }}
                  </div>
                </div>
                <div v-if="transaction.type === 'delivery'">
                  <div class="text-weight-bolder text-uppercase">
                    <mark-blue>Delivery:</mark-blue>
                  </div>
                  <div>
                    {{ formatDate(transaction.delivery_date) || "[NOT SET]" }}
                  </div>
                </div>
                <div>
                  <span class="text-weight-bold">Time: </span>
                  {{
                    transaction.collection_time ||
                    transaction.delivery_time ||
                    "-"
                  }}
                </div>
                <div>
                  <span class="text-weight-bold">Driver: </span
                  >{{ transaction.driver_name || "[NOT SET]" }}
                </div>
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
              <div class="col bordered">{{ transaction.no_bags || "-" }}</div>
              <div class="col bordered">{{ transaction.remarks || "-" }}</div>
              <div
                class="col mark-bg-pink bordered text-uppercase text-weight-bold"
                v-if="transaction.type === 'collection'"
              >
                <div class="text-weight-bold">
                  <a
                    @click.prevent="
                      openUpdateLogisticsDialog(transaction.logistics_id)
                    "
                    class="text-weight-bold"
                  >
                    {{ transaction.logistics_status }}
                  </a>
                </div>
                <div v-if="transaction.order_no" class="q-mt-sm text-">
                  <q-btn
                    outline
                    color="blue-8"
                    dense
                    @click="openOrderTab(transaction)"
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
              <div
                class="col mark-bg-blue bordered text-uppercase text-weight-bold"
                v-if="transaction.type === 'delivery'"
              >
                <a
                  @click.prevent="
                    openUpdateLogisticsDialog(transaction.logistics_id)
                  "
                  class="text-weight-bold"
                >
                  {{ transaction.logistics_status }}
                </a>
                <div v-if="transaction.order_no" class="q-mt-sm text-">
                  <q-btn
                    outline
                    color="blue-8"
                    dense
                    @click="openOrderTab(transaction)"
                    class="text-weight-bold bg-blue-1"
                  >
                    {{ transaction.order_no }}
                  </q-btn>
                </div>
                <div v-else></div>
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
          <q-btn
            icon="close"
            flat
            dense
            round
            class="absolute-top-right q-ma-sm"
            @click="showCreateCollectionDialog = false"
          />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <CreateCollectionTab />
        </q-card-section>
        <q-card-actions align="right" style="background-color: #ffe0cd">
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
          <q-btn
            icon="close"
            flat
            dense
            round
            class="absolute-top-right q-ma-sm"
            @click="showCreateOrderDialog = false"
          />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <CreateOrderFromCollection />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="showUpdateLogisticsDialog"
      persistent
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card style="min-width: 90vw">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">
            Update Collection and Delivery
          </div>
          <q-btn
            icon="close"
            flat
            dense
            round
            class="absolute-top-right q-ma-sm"
            @click="showUpdateLogisticsDialog = false"
          />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <div class="full-container">
            <div class="text-subtitle1 text-weight-bold q-ma-md q-pl-md">
              Customer Name:
              <span
                class="text-subtitle1 text-uppercase text-weight-bold text-red-9"
              >
                {{ selectedTransaction?.customer?.name || "[NOT SELECTED]" }}
              </span>
            </div>
            <div class="row q-col-gutter-md q-px-lg q-pb-lg">
              <div class="col-6">
                <UpdateCollectionDialog />
              </div>
              <div class="col-6">
                <UpdateDeliveryDialog />
              </div>
            </div>
            <q-separator class="q-mt-md" />
            <div>
              <CollectionHistory />
            </div>
            <div>
              <DeliveryHistory />
            </div>
          </div>
        </q-card-section>
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
import CreateOrderFromCollection from "@/views/CreateOrderFromCollection.vue";
import UpdateCollectionDialog from "@/components/dialogs/UpdateCollectionDialog.vue";
import UpdateDeliveryDialog from "@/components/dialogs/UpdateDeliveryDialog.vue";
import CollectionHistory from "@/components/CollectionHistory.vue";
import DeliveryHistory from "@/components/DeliveryHistory.vue";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const $q = useQuasar();
const transactionStore = useTransactionStore();
const router = useRouter();
const allTransactions = ref([]);
const searchQuery = ref("");
const filteredTransactions = ref([]);
const activeDriverTab = ref("All");
const selectedFilterDate = ref(new Date().toISOString().split("T")[0]);
const selectedGenerateDate = ref(new Date().toISOString().split("T")[0]);
const selectedWeek = ref(new Date().toISOString().split("T")[0]); // Default: today

const showCreateCollectionDialog = ref(false);
const showCreateOrderDialog = ref(false);
const showUpdateLogisticsDialog = ref(false);
const showWeeklySummary = ref(false);
const selectedTransaction = ref(null);

const toggleWeeklySummary = () => {
  showWeeklySummary.value = !showWeeklySummary.value;
};

const collectionCount = computed(() => {
  return filteredTransactions.value.filter((t) => t.type === "collection")
    .length;
});

const deliveryCount = computed(() => {
  return filteredTransactions.value.filter((t) => t.type === "delivery").length;
});

onMounted(async () => {
  await transactionStore.loadDrivers();
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
  const driverNames = transactionStore.driverOptions.map(
    (driver) => driver.name?.trim().toLowerCase() || "[not set]"
  );
  return ["All", "[NOT SET]", ...new Set(driverNames)];
});

onMounted(async () => {
  try {
    await transactionStore.loadDrivers();
    if (driverTabs.value.length > 0) {
      activeDriverTab.value = driverTabs.value[0];
    }

    const rawCollections = await transactionStore.fetchAllCollections();
    const rawDeliveries = await transactionStore.fetchAllDeliveries();

    allTransactions.value = [
      ...rawCollections.map((item) => ({ ...item, type: "collection" })),
      ...rawDeliveries.map((item) => ({ ...item, type: "delivery" })),
    ];

    console.log("Loaded Transactions: ", allTransactions.value); // Debugging log
    filterTransactions();
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
      (transaction) =>
        !transaction.driver_name ||
        transaction.driver_name.trim().toLowerCase() === "[not set]"
    );
  }

  return filteredTransactions.value.filter((transaction) => {
    const normalizedDriver =
      transaction.driver_name?.trim().toLowerCase() || "[not set]";
    return normalizedDriver === driverName.toLowerCase();
  });
};

const filterTransactions = () => {
  const query = searchQuery.value ? searchQuery.value.toLowerCase() : "";
  const selectedFilterDateFormatted = selectedFilterDate.value
    ? formatDate(selectedFilterDate.value)
    : null;

  filteredTransactions.value = allTransactions.value
    .filter((transaction) => {
      const customerName = transaction.customer?.name?.toLowerCase() || "";
      const driverName = transaction.driver_name?.toLowerCase() || "";
      const logisticsStatus = transaction.logistics_status?.toLowerCase() || "";
      const transactionDate = formatDate(
        transaction.collection_date || transaction.delivery_date
      );

      // if (transaction.type === "delivery" && !transaction.delivery_date) {
      //   return false;
      // }

      const matchesSearch =
        customerName.includes(query) ||
        driverName.includes(query) ||
        logisticsStatus.includes(query);

      const matchesDate = selectedFilterDateFormatted
        ? transactionDate === selectedFilterDateFormatted
        : true;

      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.collection_date || a.delivery_date).getTime();
      const dateB = new Date(b.collection_date || b.delivery_date).getTime();
      return dateA - dateB;
    });
};

watch(selectedFilterDate, filterTransactions);

const formattedFilterDate = computed(() =>
  formatDate(selectedFilterDate.value)
);

const formattedGenerateDate = computed(() =>
  formatDate(selectedGenerateDate.value)
);

const openCreateCollectionDialog = () => {
  showCreateCollectionDialog.value = true;
};

async function createCollection() {
  try {
    // Call the store function to create the collection
    const logisticsId = await transactionStore.createLogistics();
    await transactionStore.createCollection(logisticsId);
    await transactionStore.createDelivery(logisticsId);

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

const openOrderTab = async (collection) => {
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
  transactionStore.selectedCollectionDriver = collection.driver_name || null;
  transactionStore.selectedDeliveryDriver =
    collection.delivery?.driver_name || null;
  transactionStore.collectionDate = collection.collection_date || null;
  transactionStore.deliveryDate = collection.delivery?.delivery_date || null;
  transactionStore.collectionTime = collection.collection_time || null;
  transactionStore.deliveryTime = collection.delivery?.delivery_time || null;
  transactionStore.logisticsId = collection.logistics_id | null;

  showCreateOrderDialog.value = true; // Open the order dialog
};

function handleClose() {
  transactionStore.resetTransactionItems();
  showCreateOrderDialog.value = false;
}

const generateDriverSchedule = () => {
  const doc = new jsPDF({ orientation: "landscape", format: "a4" });
  const selectedDriver = transactionStore.selectedGenerateDriver;
  const generatedDate = selectedGenerateDate.value;

  if (!selectedDriver) {
    alert("Please select a driver before generating the schedule.");
    return;
  }

  // Filter transactions based on selectedGenerateDate instead of selectedFilterDate
  const filteredTransactions = allTransactions.value.filter((transaction) => {
    const transactionDate =
      transaction.collection_date || transaction.delivery_date;
    return (
      transaction.driver_name === selectedDriver.name &&
      transactionDate === selectedGenerateDate.value
    );
  });

  const collectionCount = filteredTransactions.filter(
    (t) => t.type === "collection"
  ).length;
  const deliveryCount = filteredTransactions.filter(
    (t) => t.type === "delivery"
  ).length;

  const tableData = filteredTransactions.map((transaction) => {
    let customer = transaction.customer?.name || "[NOT SET]";
    if (transaction.customer?.contact_no1) {
      customer += `\n${transaction.customer.contact_no1}`;
    }
    if (transaction.customer?.contact_no2) {
      customer += `\n${transaction.customer.contact_no2}`;
    }

    let contactPerson = transaction.contact_person?.name || "[NOT SET]";
    if (transaction.contact_person?.contact_no1) {
      contactPerson += `\n${transaction.contact_person.contact_no1}`;
    }
    if (transaction.contact_person?.contact_no2) {
      contactPerson += `\n${transaction.contact_person.contact_no2}`;
    }
    const transactionDate =
      transaction.type === "collection"
        ? transaction.collection_date
        : transaction.delivery_date;
    const transactionTime =
      transaction.type === "collection"
        ? transaction.collection_time
        : transaction.delivery_time;

    return [
      `${
        transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)
      }\n${transactionTime || "[NOT SET]"}`,
      customer,
      contactPerson,
      transaction.address || "[NOT SET]",
      `No. of Bags:\n${transaction.no_bags || "-"}`,
      transaction.remarks || "-",
    ];
  });

  doc.setFontSize(14);
  doc.text(
    `Driver Schedule for ${selectedDriver.name} on ${formatDate(
      generatedDate
    )} (${collectionCount} Collections | ${deliveryCount} Deliveries)`,
    10,
    20
  );

  autoTable(doc, {
    startY: 25,
    head: [
      ["Type", "Customer", "Contact Person", "Address", "Details", "Remarks"],
    ],
    body: tableData,
    columnStyles: {
      0: { cellWidth: 30 }, // Type
      1: { cellWidth: 40 }, // Customer
      2: { cellWidth: 40 }, // Contact Person
      3: { cellWidth: 50 }, // Address
      4: { cellWidth: 50 }, // Details
      5: { cellWidth: 60 }, // Remarks
    },
    styles: {
      fontSize: 12,
      lineWidth: 0.3,
      cellPadding: 2,
      lineColor: [0, 0, 0],
    },
    headStyles: { halign: "center", valign: "middle" },
    theme: "striped", // Ensures borders for all rows and columns
  });

  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, "_blank");
};

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

const getEndOfWeek = (date) => {
  const d = new Date(getStartOfWeek(date));
  return new Date(d.setDate(d.getDate() + 6));
};

const startOfWeek = computed(() => getStartOfWeek(selectedWeek.value));
const endOfWeek = computed(() => getEndOfWeek(selectedWeek.value));

const formattedStartOfWeek = computed(() =>
  startOfWeek.value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
);
const formattedEndOfWeek = computed(() =>
  endOfWeek.value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
);

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const formattedWeekDates = computed(() => {
  return daysOfWeek.map((_, index) => {
    const dayDate = new Date(startOfWeek.value);
    dayDate.setDate(dayDate.getDate() + index);
    return dayDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  });
});

const drivers = computed(() => {
  const allDriverNames = transactionStore.driverOptions.map(
    (d) => d.name?.trim() || "[NOT SET]"
  );
  const uniqueNames = new Set(allDriverNames);
  uniqueNames.add("[NOT SET]"); // Ensure fallback always exists
  return Array.from(uniqueNames);
});

const driverTransactionCounts = computed(() => {
  const counts = {};
  drivers.value.forEach((driver) => {
    counts[driver] = {};
    daysOfWeek.forEach((day, index) => {
      const dayDate = new Date(startOfWeek.value);
      dayDate.setDate(dayDate.getDate() + index);

      const transactions = allTransactions.value.filter((transaction) => {
        const transactionDate = new Date(
          transaction.collection_date || transaction.delivery_date
        );
        const driverName = transaction.driver_name || "[NOT SET]";
        return (
          transactionDate.toDateString() === dayDate.toDateString() &&
          driverName === driver
        );
      });

      counts[driver][day] = {
        collections: transactions.filter((t) => t.type === "collection").length,
        deliveries: transactions.filter((t) => t.type === "delivery").length,
      };
    });
  });
  return counts;
});

// Move to the previous week
const previousWeek = () => {
  selectedWeek.value = new Date(
    new Date(selectedWeek.value).setDate(
      new Date(selectedWeek.value).getDate() - 7
    )
  );
};

// Move to the next week
const nextWeek = () => {
  selectedWeek.value = new Date(
    new Date(selectedWeek.value).setDate(
      new Date(selectedWeek.value).getDate() + 7
    )
  );
};

const getTransactionClass = (count) => {
  if (count >= 20) return "mark-red";
  else if (count >= 10) return "mark-yellow";
  else if (count >= 1) return "mark-green";
  else return "";
};

const openUpdateLogisticsDialog = async (logisticsId) => {
  try {
    const matched = allTransactions.value.find(
      (t) => t.logistics_id === logisticsId
    );
    selectedTransaction.value = matched || null;

    await updateCollection(logisticsId);
    await updateDelivery(logisticsId);

    transactionStore.selectedCustomer =
      selectedTransaction.value?.customer || null;

    showUpdateLogisticsDialog.value = true;
  } catch (error) {
    console.error("Error opening logistics update dialog:", error);
    $q.notify({
      type: "negative",
      message: "Failed to load logistics details",
    });
  }
};

const updateCollection = async (logisticsId) => {
  try {
    const collectionData = await transactionStore.fetchCollectionByLogisticsId(
      logisticsId
    );
    if (!collectionData || collectionData.length === 0) {
      throw new Error("No collection data found!");
    }
    const collection = collectionData[0];

    transactionStore.selectedCollectionId = collection.id || null;
    transactionStore.selectedCollectionContact =
      collection.customer_contact_persons || null;
    transactionStore.selectedCollectionAddress = collection.address || null;
    transactionStore.selectedCollectionDriver = collection.driver_name || null;
    transactionStore.collectionDate = collection.collection_date || null;
    transactionStore.collectionTime = collection.collection_time || null;
    transactionStore.collectionRemarks = collection.remarks || null;
    transactionStore.collectionNoBags = collection.no_bags || null;
    transactionStore.jobType = collection.job_type || null;
    transactionStore.readyBy = collection.ready_by || null;
    transactionStore.logisticsId = collection.logistics_id || null;
  } catch (error) {
    console.error("Error fetching collection details:", error);
    $q.notify({
      type: "negative",
      message: "Failed to load collection details",
    });
  }
};

const updateDelivery = async (logisticsId) => {
  try {
    const deliveryData = await transactionStore.fetchDeliveryByLogisticsId(
      logisticsId
    );
    if (!deliveryData || deliveryData.length === 0) {
      throw new Error("No delivery data found!");
    }
    const delivery = deliveryData[0];

    transactionStore.selectedDeliveryId = delivery.id || null;
    transactionStore.selectedDeliveryContact =
      delivery.customer_contact_persons || null;
    transactionStore.selectedDeliveryAddress = delivery.address || null;
    transactionStore.selectedDeliveryDriver = delivery.driver_name || null;
    transactionStore.deliveryDate = delivery.delivery_date || null;
    transactionStore.deliveryTime = delivery.delivery_time || null;
    transactionStore.deliveryRemarks = delivery.remarks || null;
    transactionStore.deliveryNoBags = delivery.no_bags || null;
    transactionStore.jobType = delivery.job_type || null;
    transactionStore.readyBy = delivery.ready_by || null;
    transactionStore.logisticsId = delivery.logistics_id || null;
  } catch (error) {
    console.error("Error fetching delivery details:", error);
    $q.notify({ type: "negative", message: "Failed to load delivery details" });
  }
};

const thumbStyle = {
  right: '4px',
  borderRadius: '5px',
  // backgroundColor: '#027be3',
  // opacity: 0.75,
  height: '7px'
}

const barStyle = {
  right: '2px',
  borderRadius: '9px',
  // backgroundColor: '#027be3',
  // opacity: 0.2,
  height: '7px'
}

</script>
