<template>
  <div class="full-container orders-history">
    <div class="text-h6 text-center text-uppercase text-weight-bolder q-mb-md">
      Tags Management
    </div>

    <q-card class="row preview-card q-mb-md">
      <!-- Generate Tag Section -->
      <div class="col-5 q-pa-md">
        <q-select
          v-model="selectedDriver"
          :options="sortedDriverOptions"
          option-label="name"
          option-value="id"
          label="Select Collection Driver"
          outlined
          dense
          class="q-pb-sm"
        />
        <q-input
          v-model="formattedSelectedDate"
          outlined
          dense
          label="Select Collection Date"
          readonly
          class="q-pb-sm"
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
              @click="selectedDate = null"
            />
          </template>
        </q-input>
        <div class="row q-col-gutter-sm">
          <div class="col">
            <q-btn
              unelevated
              label="Generate Tag"
              color="primary full-width"
              :disable="!selectedMatchedOrders.length"
              @click="generateTag"
              class="q-mt-sm"
            />
          </div>
          <div class="col">
            <q-btn
              unelevated
              label="Generate Invoice"
              color="secondary full-width"
              :disable="!selectedMatchedOrders.length"
              @click="generateInvoice"
              class="q-mt-sm"
            />
          </div>
        </div>
        <q-btn
          outline
          label="Customize Tag"
          color="primary full-width"
          @click="openCustomizeDialog"
          class="q-mt-sm"
        />
      </div>

      <div class="col-7 q-pa-md">
        <q-card
          bordered
          flat
          class="q-pa-sm"
          style="
            border-width: 1.5px;
            border-color: #c09f8b;
            height: 13.5em;
            display: flex;
            flex-direction: column;
          "
        >
          <!-- Header -->
          <div class="row items-center justify-between text-uppercase q-ml-xs">
            <div class="text-weight-bold">
              Matched Orders ({{ matchedOrdersList.length }}):
            </div>
            <q-checkbox
              class="text-caption"
              v-model="selectAll"
              label="Select All"
              dense
            />
          </div>

          <q-separator class="q-my-xs" />

          <!-- Scrollable List -->
          <div
            v-if="matchedOrdersList.length"
            style="overflow-y: auto; flex-grow: 1"
            class="q-pr-sm"
          >
            <div
              v-for="(logistics, index) in matchedOrdersList"
              :key="index"
              class="q-mb-sm"
            >
              <div class="row items-center justify-between q-mx-md">
                <div class="row">
                  <q-checkbox
                    v-model="selectedMatchedOrders"
                    :val="logistics"
                    dense
                  />
                  <div class="row items-center q-ml-sm">
                    <div>
                      <span class="text-weight-bold q-mr-xs">
                        {{ logistics.order?.order_no || "N/A" }}
                      </span>
                      - {{ logistics.customer?.name || "Unknown" }}
                    </div>
                  </div>
                </div>
                <q-btn
                  flat
                  dense
                  icon="open_in_new"
                  size="10px"
                  @click="openOrderDialog(logistics)"
                />
              </div>
            </div>
          </div>

          <div v-else class="text-grey">No matching orders found.</div>
        </q-card>
      </div>
    </q-card>

    <!-- Search & Date Filters -->
    <!-- <div class="row justify-end q-mb-sm q-gutter-x-sm">
      <div class="col">
        <q-input
          v-model="formattedCollectionStartDate"
          outlined
          dense
          label="Collection Start Date"
          readonly
          class="bg-white"
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
      </div>

      <div class="col">
        <q-input
          v-model="formattedCollectionEndDate"
          outlined
          dense
          label="Collection End Date"
          readonly
          class="bg-white"
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

      <div class="col">
        <q-input
          v-model="formattedDeliveryStartDate"
          outlined
          dense
          label="Delivery Start Date"
          readonly
          class="bg-white"
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
      </div>

      <div class="col">
        <q-input
          v-model="formattedDeliveryEndDate"
          outlined
          dense
          label="Delivery End Date"
          readonly
          class="bg-white"
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
          placeholder="Search Order No, Customer Name, Goods Status, Logistics Status, or Payment Status"
          debounce="300"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div> -->
    <div class="row justify-end q-mb-sm q-gutter-x-sm">
      <div class="col-2">
        <q-select
          v-model="tagStatusFilter"
          :options="tagStatusOptions"
          label="Tag Status"
          outlined
          dense
          emit-value
          map-options
          class="bg-white"
        />
      </div>

      <div class="col-2">
        <q-select
          v-model="collectionDriverFilter"
          :options="sortedDriverOptions"
          option-label="name"
          option-value="name"
          label="Collection Driver"
          outlined
          dense
          emit-value
          map-options
          class="bg-white"
        />
      </div>

      <div class="col-3">
        <q-input
          v-model="formattedCollectionStartDate"
          outlined
          dense
          label="Collection Date"
          readonly
          class="bg-white"
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
      </div>

      <div class="col-3">
        <q-input
          class="search-transactions search-input"
          v-model="searchQuery"
          outlined
          dense
          placeholder="Search here..."
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
        <div class="col text-weight-bolder q-py-sm">Order No</div>
        <div class="col text-weight-bolder q-py-sm">Collection Details</div>
        <div class="col text-weight-bolder q-py-sm">Delivery Details</div>
        <div class="col text-weight-bolder q-py-sm">Customer Name</div>
        <div class="col text-weight-bolder q-py-sm">Tag Details</div>
      </div>

      <!-- Table Rows -->
      <div
        v-if="paginatedOrders.length === 0"
        class="text-center text-grey q-pa-lg text-h6"
      >
        No orders found.
      </div>

      <div
        v-for="(logistics, index) in paginatedOrders"
        :key="index"
        class="row row-col-row q-px-md"
      >
        <div class="col bordered">
          <div>
            <a
              @click="openOrderDialog(logistics)"
              class="text-weight-bold text-subtitle1"
            >
              {{ logistics.order?.order_no || "N/A" }}
            </a>
          </div>
          <div>
            <span class="text-caption text-uppercase text-weight-bold">
              Date:
            </span>
            {{ getOrderDate(logistics) }}
          </div>
        </div>
        <div class="col bordered">
          <div>
            <span class="text-caption text-uppercase text-weight-bold">
              Date: </span
            >{{ getCollectionDate(logistics.collections) }}
          </div>
          <div>
            <span class="text-caption text-uppercase text-weight-bold">
              Time:
            </span>
            {{ logistics.collections?.[0]?.collection_time || "N/A" }}
          </div>
          <div>
            <span class="text-caption text-uppercase text-weight-bold">
              Driver: </span
            >{{ logistics.collections?.[0]?.driver_name || "N/A" }}
          </div>
        </div>
        <div class="col bordered">
          <div>
            <span class="text-caption text-uppercase text-weight-bold">
              Date: </span
            >{{ getDeliveryDate(logistics.deliveries) }}
          </div>
          <div>
            <span class="text-caption text-uppercase text-weight-bold">
              Time: </span
            >{{ logistics.deliveries?.[0]?.delivery_time || "N/A" }}
          </div>
          <div>
            <span class="text-caption text-uppercase text-weight-bold">
              Driver: </span
            >{{ logistics.deliveries?.[0]?.driver_name || "N/A" }}
          </div>
        </div>
        <div class="col bordered">
          <div class="text-weight-bold">
            <a
              @click.prevent="openCustomerTab(logistics.customer?.id)"
              class="text-weight-bold text-subtitle1 line-height-1"
            >
              {{ logistics.customer?.name || "[NOT SELECTED]" }}
            </a>
          </div>
          <div>
            {{ logistics.customer?.contact_no1 || "-"
            }}<span v-if="logistics.customer?.contact_no2">
              / {{ logistics.customer?.contact_no2 || "-" }}
            </span>
          </div>

          <q-separator class="q-my-sm" />
          <div class="mark-green text-caption text-uppercase">
            Contact Person
          </div>
          <div>
            {{
              logistics.collections?.[0]?.contact_person?.name || "[NOT SET]"
            }}
          </div>
          <div>
            {{ logistics.collections?.[0]?.contact_person?.contact_no1 || "-"
            }}<span
              v-if="logistics.collections?.[0]?.contact_person?.contact_no2"
            >
              /
              {{
                logistics.collections?.[0]?.contact_person?.contact_no2 || "-"
              }}
            </span>
          </div>
        </div>
        <div class="col bordered text-uppercase">
          <div>
            <q-btn
              label="View Tag"
              color="primary"
              unelevated
              dense
              class="q-px-sm full-width"
              @click="viewTag(logistics.order?.order_no)"
            />
          </div>
          <div
            class="text-weight-bold text-subtitle1 text-center q-my-sm q-py-xs line-height-1 text-uppercase"
            style="border-style: solid; border-width: 1px"
          >
            <span
              :class="getStatusClass(logistics.order?.order_tags?.tag_status)"
              >{{ logistics.order?.order_tags?.tag_status || "-" }}</span
            >
          </div>
          <div>
            <span class="text-caption text-uppercase text-weight-bold">
              Timestamp: </span
            >{{ logistics.order?.order_tags?.tag_timestamp || "-" }}
          </div>
          <div>
            <span class="text-caption text-uppercase text-weight-bold">
              Tag Changes: </span
            >{{ logistics.order?.order_tags?.tag_changes || "-" }}
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
  
  <q-dialog v-model="showCustomizeDialog" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Customize Tag</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input
          v-model="customDescription"
          label="Description"
          outlined
          dense
        />

        <q-input
          v-model.number="customPcs"
          type="number"
          label="PCS"
          outlined
          dense
          min="1"
        />

        <!-- Additional Inputs for A-G -->
        <q-input v-model="customA" label="A" outlined dense />
        <q-input v-model="customB" label="B" outlined dense />
        <q-input v-model="customC" label="C" outlined dense />
        <q-input v-model="customD" label="D" outlined dense />
        <q-input v-model="customE" label="E" outlined dense />
        <q-input v-model="customF" label="F" outlined dense />
        <q-input v-model="customG" label="G" outlined dense />

        <q-card flat style="border: solid; border-width: 1px; border-radius: 0">
          <q-card flat class="tags" style="max-height: 46px">
            <div class="text-center row q-pa-xs">
              <div class="col">
                <div>{{ customA || "0" }}</div>
                <div>A</div>
              </div>
              <div class="col">
                <div>{{ customB || "0" }}</div>
                <div>B</div>
              </div>
              <div class="col">
                <div>{{ customC || "0" }}</div>
                <div>C</div>
              </div>
              <div class="col">
                <div>{{ customD || "0" }}</div>
                <div>D</div>
              </div>
              <div class="col">
                <div>{{ customE || "0" }}</div>
                <div>E</div>
              </div>
              <div class="col">
                <div>{{ customF || "0" }}</div>
                <div>F</div>
              </div>
              <div class="col q-mr-sm">
                <div>{{ customG || "0" }}</div>
                <div>G</div>
              </div>
              <div class="col-6 tag-details">
                {{ customDescription || "-" }}
              </div>
            </div>
          </q-card>
        </q-card>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn label="Submit" color="primary" @click="printCustomTag" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import html2pdf from "html2pdf.js";

const transactionStore = useTransactionStore();
const orders = ref([]); // Stores fetched orders
const currentPage = ref(1); // Current page for pagination
const pageSize = ref(10); // Number of records per page

const searchQuery = ref(""); // Search input
// Date Filters
const collectionStartDate = ref(null);

const selectedDriver = ref(null);
const selectedDate = ref(null);

const formattedSelectedDate = computed(() => formatDate(selectedDate.value));
const selectedMatchedOrders = ref([]);

const customDescription = ref("");
const customA = ref("");
const customB = ref("");
const customC = ref("");
const customD = ref("");
const customE = ref("");
const customF = ref("");
const customG = ref("");

const collectionDriverFilter = ref(null);

const tagStatusFilter = ref(null);
const tagStatusOptions = [
  { label: "Printed", value: "printed" },
  { label: "To Print", value: "to print" },
];

const sortedDriverOptions = computed(() => {
  return [...transactionStore.driverOptions].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
});

const selectAll = ref(false);

watch(selectAll, (val) => {
  if (val) {
    selectedMatchedOrders.value = [...matchedOrdersList.value];
  } else {
    selectedMatchedOrders.value = [];
  }
});

watch(selectedMatchedOrders, (val) => {
  selectAll.value =
    val.length === matchedOrdersList.value.length &&
    matchedOrdersList.value.length > 0;
});

watch([selectedDriver, selectedDate], () => {
  if (!selectedDriver.value || !selectedDate.value) {
    matchedOrdersList.value = [];
    return;
  }

  const driverName = selectedDriver.value.name;
  const selectedRawDate = selectedDate.value;

  matchedOrdersList.value = filteredOrders.value.filter((logistics) =>
    logistics.collections?.some(
      (c) =>
        c?.driver_name === driverName && c?.collection_date === selectedRawDate
    )
  );
});

const getStatusClass = (status) => {
  if (!status) return "";
  const formattedStatus = status.toLowerCase();
  if (formattedStatus === "done") return "status-done";
  if (formattedStatus === "to print") return "status-to-print";
  return "";
};

// Fetch orders on mount
onMounted(async () => {
  try {
    const result = await transactionStore.fetchAllOrdersSimple();
    orders.value = result;
    await transactionStore.loadDrivers();
  } catch (error) {
    console.error("Error on load:", error);
  }
});

// Format date display
const formattedCollectionStartDate = computed(() =>
  formatDate(collectionStartDate.value)
);

// Clear Date Input
const clearDate = (type) => {
  if (type === "collectionStartDate") collectionStartDate.value = null;
};

// Filter Orders Based on Search & Date Range
const filteredOrders = computed(() => {
  const query = searchQuery.value.toLowerCase();
  const selectedCollectionDate = collectionStartDate.value;

  return orders.value
    .filter((logistics) => {
      const orderNo = logistics.order?.order_no?.toLowerCase() || "";
      const customerName = logistics.customer?.name?.toLowerCase() || "";
      const collectionDate = logistics.collections?.[0]?.collection_date || null;
      const collectionDriver = logistics.collections?.[0]?.driver_name || "";

      const collectionMatch = !selectedCollectionDate || collectionDate === selectedCollectionDate;
      const searchMatch = orderNo.includes(query) || customerName.includes(query);
      const driverMatch =
        !collectionDriverFilter.value ||
        collectionDriver === collectionDriverFilter.value;

      return collectionMatch && searchMatch && driverMatch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.collections?.[0]?.collection_date || 0);
      const dateB = new Date(b.collections?.[0]?.collection_date || 0);
      return dateB - dateA;
    });
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

const getOrderDate = (logistics) => {
  return formatDate(logistics.order?.created_at);
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
const openOrderDialog = async (logistics) => {
  try {
    if (!logistics || !logistics.order) return;

    transactionStore.setSelectedCustomer({
      id: logistics.customer?.id,
    });

    transactionStore.setOrderNo(logistics.order.order_no);
    transactionStore.resetTransactionItems();

    window.open(`/orders/read-${logistics.order.order_no}`, "_blank");
  } catch (error) {
    console.error("Error opening order dialog:", error);
  }
};

const viewTag = (order_no) => {
  const url = `/tags/${order_no}`;
  window.open(url, "_blank");
};

const DRIVER_CODES = {
  Ass: "Ass",
  Ken: "Ken",
  Ang: "Ang",
  Pea: "Pea",
  You: "You",
  "Self-collect": "Sfc",
  "Ng Soo Chong": "Nsc",
  Chia: "Cha",
  Des: "Des",
  Cue: "Cue",
  Are: "Are",
  Ting: "Tin",
};

const matchedOrdersList = ref([]);

const generateTag = () => {
  const driverName = selectedDriver.value?.name;
  const selectedRawDate = selectedDate.value;

  if (!driverName || !selectedRawDate) {
    console.warn("Driver or Date not selected");
    return;
  }

  if (!selectedMatchedOrders.value.length) {
    console.warn("No orders selected to generate tag.");
    return;
  }

  const driverCode = DRIVER_CODES[driverName] || driverName;
  const groupSlug = `${driverCode}-${selectedRawDate}`;

  const selectedOrderNos = selectedMatchedOrders.value
    .map((logistics) => logistics.order?.order_no)
    .filter(Boolean);

  const query = encodeURIComponent(selectedOrderNos.join(","));
  const url = `/tags/grp-${groupSlug}?orders=${query}`;

  window.open(url, "_blank");
};

const generateInvoice = () => {
  const driverName = selectedDriver.value?.name;
  const selectedRawDate = selectedDate.value;

  if (!driverName || !selectedRawDate) {
    console.warn("Driver or Date not selected");
    return;
  }

  if (!selectedMatchedOrders.value.length) {
    console.warn("No orders selected to generate invoice.");
    return;
  }

  const driverCode = DRIVER_CODES[driverName] || driverName;
  const groupSlug = `${driverCode}-${selectedRawDate}`;

  const selectedOrderNos = selectedMatchedOrders.value
    .map((logistics) => logistics.order?.order_no)
    .filter(Boolean);

  const query = encodeURIComponent(selectedOrderNos.join(","));
  const url = `/invoice/grp-${groupSlug}?orders=${query}`;

  window.open(url, "_blank");
};

const showCustomizeDialog = ref(false);
const customPcs = ref(null);

const openCustomizeDialog = () => {
  showCustomizeDialog.value = true;
};

const printCustomTag = () => {
  const tag = document.querySelector(".tags");
  if (!tag) {
    console.warn("No .tags element found.");
    return;
  }

  const pcsCount = parseInt(customPcs.value, 10) || 1;
  if (pcsCount <= 0) {
    console.warn("pcsCount is 0 or less. Nothing to print.");
    return;
  }

  const container = document.createElement("div");
  container.style.display = "block";
  container.style.margin = "0";
  container.style.padding = "0";

  for (let i = 0; i < pcsCount; i++) {
    const clone = tag.cloneNode(true);
    if (i > 0) {
      clone.style.pageBreakBefore = "always";
    }
    container.appendChild(clone);
  }

  const options = {
    margin: 0,
    filename: `Custom_Tag_Print.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: null },
    jsPDF: { unit: "mm", format: [100, 12.7], orientation: "landscape" },
    pagebreak: { mode: ["css", "legacy"] }, // key to support .html2pdf__page-break
  };

  html2pdf()
    .set(options)
    .from(container)
    .toPdf()
    .output("blob")
    .then((blob) => {
      const pdfUrl = URL.createObjectURL(blob);
      const newWindow = window.open(pdfUrl, "_blank");
      if (newWindow) {
        setTimeout(() => {
          newWindow.print();
          newWindow.onafterprint = () => newWindow.close();
        }, 500);
      }
    })
    .catch(console.error);
};
</script>
