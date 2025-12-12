<template>
  <div class="main-container">
    <div class="review-tab">
      <!-- Order Summary Header -->
      <div class="row summary-header text-p">
        <div class="col summary-card-header justify-between text-p">
          <div class="text-h6 text-center text-weight-bold text-uppercase">
            Order Details
          </div>
          <q-separator class="q-my-sm" />
          <div class="text-summary-row">
            Order No:
            <span class="text-summary">{{
              transactionStore?.orderNo || "-"
            }}</span>
          </div>
<div class="text-summary-row">
  Order Date:
  <span class="text-summary">{{ orderDateToday }}</span>
</div>
          <div class="text-summary-row">
  Handler:
  <span class="text-summary">{{ handlerDisplay }}</span>
</div>
          <div class="text-summary-row">
            Customer Name:
            <span class="text-summary">{{
              transactionStore.selectedCustomer?.name || "-"
            }}</span>
          </div>
          <div class="text-summary-row">
            Contact Nos:
            <span class="text-summary"
              >{{ transactionStore.selectedCustomer?.contact_no1 || "N/A"
              }}<span v-if="transactionStore.selectedCustomer?.contact_no2">
                /
                {{
                  transactionStore.selectedCustomer?.contact_no2 || "-"
                }}</span
              ></span
            >
          </div>
          <div class="text-summary-row">
            Email:
            <span class="text-summary">{{
              transactionStore.selectedCustomer?.email || "-"
            }}</span>
          </div>
        </div>
        <!-- Collection Details -->
        <div class="col summary-card-header">
          <div class="text-h6 text-center text-weight-bold text-uppercase">
            Collection Details
          </div>
          <q-separator class="q-my-sm" />
          <div class="text-summary-row">
            Contact Person:
            <span class="text-summary">{{
              collectionContact?.name || "-"
            }}</span>
          </div>
          <div class="text-summary-row">
            Contact Nos:
            <span class="text-summary"
              >{{ collectionContact?.contact_no1 || "N/A"
              }}<span v-if="collectionContact?.contact_no2">
                / {{ collectionContact?.contact_no2 || "-" }}</span
              ></span
            >
          </div>
          <div class="text-summary-row">
            Address:
            <span class="text-summary">{{ collectionAddress || "-" }} </span>
          </div>
          <div class="text-summary-row">
            Collection Date:
            <span class="text-summary">{{ formattedCollectionDate }}</span>
          </div>
          <div class="text-summary-row">
            Collection Time:
            <span class="text-summary">{{
              transactionStore.collectionTime || "-"
            }}</span>
          </div>
          <div class="text-summary-row">
            Collection Driver:
            <span class="text-summary">{{ collectionDriverName }}</span>
          </div>
        </div>

        <!-- Delivery Details -->
        <div class="col summary-card-header">
          <div class="text-h6 text-center text-weight-bold text-uppercase">
            Delivery Details
          </div>
          <q-separator class="q-my-sm" />
          <div class="text-summary-row">
            Contact Person:
            <span class="text-summary">{{ deliveryContact?.name || "-" }}</span>
          </div>
          <div class="text-summary-row">
            Contact Nos:
            <span class="text-summary"
              >{{ deliveryContact?.contact_no1 || "N/A"
              }}<span v-if="deliveryContact?.contact_no2">
                / {{ deliveryContact?.contact_no2 || "-" }}</span
              ></span
            >
          </div>
          <div class="text-summary-row">
            Address:
            <span class="text-summary">{{ deliveryAddress || "-" }}</span>
          </div>
          <div class="text-summary-row">
            Delivery Date:
            <span class="text-summary">{{ formattedDeliveryDate }}</span>
          </div>
          <div class="text-summary-row">
            Delivery Time:
            <span class="text-summary">{{
              transactionStore.deliveryTime || "-"
            }}</span>
          </div>
          <div class="text-summary-row">
            Delivery Driver:
            <span class="text-summary">{{ deliveryDriverName }}</span>
          </div>
        </div>
      </div>

      <!-- Transaction Summary -->
      <div class="transaction-summary q-ma-md">
        <div class="row row-col-header">
          <div class="col-5 text-weight-bold bordered">Item</div>
          <div class="col text-weight-bold bordered">Process</div>
          <div class="col text-weight-bold bordered">Price</div>
          <div class="col text-weight-bold bordered">Qty</div>
          <div class="col text-weight-bold bordered">Subtotal</div>
        </div>

        <div v-if="rows.length > 0">
          <div
            v-for="item in rows"
            :key="`${item.name}|${item.process}|${item.unit}|${item.price}|${
              item.company ?? ''
            }`"
            class="row row-col-row summary-row"
          >
            <div class="col-5 bordered">{{ displayItemName(item) }}</div>
            <div class="col bordered">
              {{ formatProcessText(item.process) }}
            </div>
            <div class="col bordered">
              {{ formatPriceWithUnit(item.price, item.unit) }}
            </div>
            <div class="col bordered">
              {{ formatQuantity(getDisplayQty(item)) }}
              <span class="text-caption">{{ unitLabel(item.unit) }}</span>
              <span v-if="item.unit === 'sqft' && Number(item.pieces ?? 0) > 0">
                × {{ Math.trunc(item.pieces) }} pcs
              </span>

              <span
                v-else-if="
                  (item.unit === 'kg' || item.unit === 'lbs') &&
                  Number(item.pieces ?? 0) > 0
                "
              >
                ({{ Math.trunc(item.pieces) }} pcs)
              </span>
            </div>
            <div class="col bordered">
              ${{ item.subtotal.toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- No Items Message -->
        <div v-else class="text-center text-grey q-my-md">
          No items added to the list.
        </div>
        <div class="row row-col-footer text-weight-bold text-subtitle1 justify-end">
            TOTAL AMOUNT : <span class="text-red-8 q-ml-sm q-mr-md">{{ totalSubtotal }}</span>
        </div>
      </div>

      <!-- Instructions and Error Reporting Summaries -->
      <div class="row">
        <!-- Instructions Summary -->
        <div class="col-6">
          <q-card flat class="summary-card q-mt-md">
            <div class="text-h6 text-center text-weight-bold text-uppercase">
              Instructions
            </div>
            <q-separator class="q-my-sm" />
            <div v-if="transactionStore.displayInstructions.length > 0">
              <div
                v-for="displayInstruction in transactionStore.displayInstructions"
                :key="displayInstruction.id"
                class="row justify-between per-instruction q-mb-sm"
              >
                <div>
                  <div class="text-p">
                    <span>
                      <q-icon
                        name="circle"
                        color="primary"
                        size="8px"
                        class="q-mr-sm q-ml-md"
                      />
                    </span>
                    {{ displayInstruction.description }}
                  </div>
                  <div class="instruction-chips q-ml-lg">
                    <q-chip
                      square
                      :color="
                        displayInstruction.type === 'onetime'
                          ? 'purple-10'
                          : 'pink-10'
                      "
                      text-color="white"
                      class="instructions-type"
                    >
                      {{
                        displayInstruction.type === "onetime"
                          ? "One-time"
                          : "Recurring"
                      }}
                    </q-chip>
                    <span> | </span>
                    <q-chip
                      v-for="section in displayInstruction.to"
                      :key="section"
                      :color="getSectionColor(section)"
                      text-color="white"
                      class="instructions-to"
                    >
                      {{ formatSectionLabel(section) }}
                    </q-chip>
                  </div>
                </div>
              </div>
            </div>
            <q-separator class="q-mb-lg" />
            <div v-if="instructions.length > 0">
              <div
                v-for="instruction in instructions"
                :key="instruction.id"
                class="per-instruction q-mb-sm"
              >
                <div class="text-p">
                  <span>
                    <q-icon
                      name="circle"
                      color="primary"
                      size="8px"
                      class="q-mr-sm q-ml-md"
                    />
                  </span>
                  {{ instruction.description }}
                </div>
                <div class="instruction-chips q-ml-lg">
                  <q-chip
                    square
                    :color="
                      instruction.type === 'onetime' ? 'purple-10' : 'pink-10'
                    "
                    text-color="white"
                    class="instructions-type"
                  >
                    {{
                      instruction.type === "onetime" ? "One-time" : "Recurring"
                    }}
                  </q-chip>
                  <span> | </span>
                  <q-chip
                    v-for="section in instruction.to"
                    :key="section"
                    :color="getSectionColor(section)"
                    text-color="white"
                    class="instructions-to"
                  >
                    {{ formatSectionLabel(section) }}
                  </q-chip>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-grey">
              No instructions listed.
            </div>
          </q-card>
        </div>

        <!-- Error Reporting Summary -->
        <div class="col-6">
          <q-card flat class="summary-card q-mt-md">
            <div class="text-h6 text-center text-weight-bold text-uppercase">
              Error Reporting
            </div>
            <q-separator class="q-my-sm" />
            <!-- Display error reports or a fallback message -->
            <div v-if="reports.length > 0">
              <div
                v-for="report in reports"
                :key="report.id"
                class="per-report q-mb-sm"
              >
                <!-- Error Description -->
                <div class="text-p">
                  <span>
                    <q-icon
                      name="circle"
                      color="primary"
                      size="8px"
                      class="q-mr-sm q-ml-md"
                    />
                  </span>
                  {{ report.description }}
                </div>

                <!-- Error Category and Sub-category -->
                <div class="q-ml-lg text-weight-bold text-red">
                  {{ report.category }} - {{ report.sub_category }}
                </div>

                <!-- Error Photo Preview (if available) -->
                <q-img
                  v-if="report.image"
                  :src="report.image"
                  class="q-mt-sm q-ml-lg"
                  style="max-width: 200px; height: auto"
                />
              </div>
            </div>
            <div v-else class="text-center text-grey">
              No error reports listed.
            </div>
          </q-card>
        </div>
      </div>

      <!-- Success/Failure Dialog -->
      <q-dialog v-model="isDialogOpen">
        <q-card>
          <q-card-section class="text-h6 text-center">
            {{ dialogMessage }}
          </q-card-section>
          <q-card-actions align="center" class="q-pt-md">
            <q-btn
              v-if="transactionSuccess"
              label="Generate Invoice"
              color="primary"
              @click="handleGenerateInvoice"
            />
            <q-btn
              label="Close"
              color="secondary"
              @click="isDialogOpen = false"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Stepper Navigation -->
      <q-stepper-navigation>
        <div class="row justify-end q-mx-md q-my-sm"></div>
      </q-stepper-navigation>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";

const transactionStore = useTransactionStore();

// Computed properties to access data from the store
const rows = computed(() => transactionStore.transactionItems); // Transaction items for the table
const instructions = computed(() => transactionStore.instructions); // Instructions
const reports = computed(() => transactionStore.reports); // Instructions

// Access selected delivery and collection contacts from the store
const deliveryContact = computed(
  () => transactionStore.selectedDeliveryContact || "-"
);
const collectionContact = computed(
  () => transactionStore.selectedCollectionContact || "-"
);

const collectionAddress = computed(() =>
  formatAddress(transactionStore.selectedCollectionAddress)
);
const deliveryAddress = computed(() =>
  formatAddress(transactionStore.selectedDeliveryAddress)
);

// Helper functions for instruction chip colors and labels
function getSectionColor(section) {
  const colors = {
    cleaning: "teal",
    packing: "orange",
    pickingsending: "red",
    admin: "cyan",
  };
  return colors[section] || "grey";
}

function formatSectionLabel(section) {
  const labels = {
    cleaning: "Cleaning",
    packing: "Packing",
    pickingsending: "Picking/Sending",
    admin: "Admin",
  };
  return labels[section] || section;
}

// Dialog state and message for feedback
const isDialogOpen = ref(false);
const dialogMessage = ref("");

const totalQty = computed(() =>
  rows.value.reduce((acc, item) => acc + (item.quantity || 0), 0)
);

const totalSubtotal = computed(() => {
  const total = rows.value.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(total);
});

const formattedCollectionDate = computed(() => {
  return transactionStore.collectionDate
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(transactionStore.collectionDate))
    : "--/--/----";
});

const formattedDeliveryDate = computed(() => {
  return transactionStore.deliveryDate
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(transactionStore.deliveryDate))
    : "--/--/----";
});

const formatAddress = (a) => {
  if (!a || typeof a !== "object") return "-";
  const parts = [a.block_no, a.road_name, a.unit_no, a.building_name]
    .map((v) => (v ?? "") + "")
    .map((s) => s.trim())
    .filter(Boolean);

  const main = parts.join(" ");
  const postal = (a.postal_code ?? "").toString().trim();

  const combined = [main, postal].filter(Boolean).join(", ");
  return combined || "-";
};

const collectionDriverName = computed(() =>
  typeof transactionStore.selectedCollectionDriver === "string"
    ? transactionStore.selectedCollectionDriver || "-"
    : transactionStore.selectedCollectionDriver?.name || "-"
);

const deliveryDriverName = computed(() =>
  typeof transactionStore.selectedDeliveryDriver === "string"
    ? transactionStore.selectedDeliveryDriver || "-"
    : transactionStore.selectedDeliveryDriver?.name || "-"
);
function getDisplayQty(item) {
  if (item.unit === "kg" || item.unit === "lbs")
    return item.weight ?? item.quantity ?? 0;
  if (item.unit === "sqft") return item.area ?? item.quantity ?? 0;
  return item.quantity ?? 0;
}
function formatQuantity(val) {
  const n = Number(val ?? 0);
  if (!Number.isFinite(n)) return "0";
  // why: keep whole numbers tidy, decimals to 2 dp for readability
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return n.toFixed(2);
}

function displayItemName(item) {
  // Only show pieces when the unit is strictly 'pc'
  if (String(item.unit || "").toLowerCase() !== "pc") {
    return item.name || "";
  }

  const perUnit = Number(item.pieces_per_unit ?? item.pieces ?? 0);
  if (!Number.isFinite(perUnit) || perUnit <= 0) {
    return item.name || "";
  }

  const label = perUnit === 1 ? "pc" : "pcs";
  return `${item.name} (${perUnit}${label})`;
}

function unitLabel(unit) {
  if (!unit) return "";
  const u = String(unit).toLowerCase();
  if (u === "pc") return "pcs";
  return unit;
}

function formatPriceWithUnit(price, unit) {
  if (price === "TBA") {
    return "TBA";
  }
  if (typeof price === "number") {
    return `$${price.toFixed(2)} / ${unit}`;
  }
  return `$0.00 / ${unit}`;
}

function formatProcessText(process) {
  switch (process) {
    case "laundry":
      return "Laundry";
    case "dryclean":
      return "Dry Clean";
    case "pressing":
      return "Pressing Only";
    case "others":
      return "Others";
    default:
      return process;
  }
}

const handlerDisplay = computed(() => {
  const norm = (v) => (v ?? '').toString().trim().toLowerCase();
  const labels = { cc: 'Cotton Care', dc: 'DryCleaners' };

  const set = new Set(rows.value.map(r => norm(r.company)).filter(Boolean));
  if (set.size === 0) return '-';

  // Keep CC before DC when both exist
  const order = ['cc', 'dc'];
  const sorted = Array.from(set).sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.localeCompare(b);
  });

  // Map known codes, fallback to uppercased value for unknowns
  return sorted.map(k => labels[k] ?? k.toUpperCase()).join('/');
});

const orderDateToday = computed(() =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Singapore", // keep consistent with other screens
  }).format(new Date())
);

</script>
