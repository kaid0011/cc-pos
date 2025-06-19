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
            Customer Name:
            <span class="text-summary">{{
              transactionStore.selectedCustomer?.name || "-"
            }}</span>
          </div>
          <div class="text-summary-row">
            Contact Nos:
            <span class="text-summary"
              >{{ transactionStore.selectedCustomer?.contact_no1 || "N/A" }}<span v-if="transactionStore.selectedCustomer?.contact_no2"> / {{ transactionStore.selectedCustomer?.contact_no2 || "-" }}</span></span
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
            <span class="text-summary">{{ collectionContact?.name || "-" }}</span>
          </div>
          <div class="text-summary-row">
            Contact Nos:
            <span class="text-summary"
              >{{ collectionContact?.contact_no1 || "N/A" }}<span v-if="collectionContact?.contact_no2"> / {{ collectionContact?.contact_no2 || "-" }}</span></span>
          </div>
          <div class="text-summary-row">
            Address: 
            <span class="text-summary">{{ collectionAddress || '-'}} </span>
          </div>
          <div class="text-summary-row">
            Collection Date:
            <span class="text-summary">{{ formattedCollectionDate }}</span>
          </div>
          <div class="text-summary-row">
            Collection Time:
            <span class="text-summary">{{ transactionStore.collectionTime || "-" }}</span>
          </div>
          <div class="text-summary-row">
            Collection Driver:
            <span class="text-summary">{{ transactionStore.selectedCollectionDriver || "-" }}</span>
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
            <span class="text-summary">{{
              deliveryContact?.name || "-"
            }}</span>
          </div>
          <div class="text-summary-row">
            Contact Nos:
            <span class="text-summary"
              >{{ deliveryContact?.contact_no1 || "N/A" }}<span v-if="deliveryContact?.contact_no2"> / {{ deliveryContact?.contact_no2 || "-" }}</span></span
            >
          </div>
          <div class="text-summary-row">
            Address:
            <span class="text-summary">{{ deliveryAddress || '-' }}</span>
          </div>
          <div class="text-summary-row">
            Delivery Date:
            <span class="text-summary">{{ formattedDeliveryDate }}</span>
          </div>
          <div class="text-summary-row">
            Delivery Time:
            <span class="text-summary">{{ transactionStore.deliveryTime || "-" }}</span>
          </div>
          <div class="text-summary-row">
            Delivery Driver:
            <span class="text-summary">{{ transactionStore.selectedDeliveryDriver || "-" }}</span>
          </div>
        </div>
      </div>

      <!-- Transaction Summary -->
      <div class="transaction-summary">
        <!-- Table Header -->
        <div class="row row-col-header">
          <div class="col col-4 text-weight-bold bordered">Item</div>
          <div class="col col-2 text-weight-bold bordered">Process</div>
          <div class="col col-2 text-weight-bold bordered">Price</div>
          <div class="col col-1 text-weight-bold bordered">Pcs</div>
          <div class="col col-1 text-weight-bold bordered">Qty</div>
          <div class="col col-2 text-weight-bold bordered">Subtotal</div>
        </div>

        <!-- Transactions or Fallback Message -->
        <div v-if="rows.length > 0">
          <div
            v-for="item in rows"
            :key="item.name"
            class="row row-col-row summary-row"
          >
            <div class="col col-4 bordered">{{ item.name }}</div>
            <div class="col col-2 bordered">{{ item.process }}</div>
            <div class="col col-2 bordered">{{ item.price }}</div>
            <div class="col col-1 bordered">{{ computedPcs(item) }}</div>
            <div class="col col-1 bordered">{{ item.quantity }}</div>
            <div class="col col-2 bordered">{{ item.subtotal }}</div>
          </div>
        </div>

        <!-- No Items Message -->
        <div v-else class="text-center text-grey q-my-md">
          No items added to the list.
        </div>

        <div class="row row-col-footer">
          <div class="col col-6 text-weight-bolder text-uppercase"></div>
          <div class="col col-2 text-weight-bolder text-uppercase bordered">
            Total
          </div>
          <div class="col col-1 text-weight-bolder bordered">
            {{ totalPcs }}
          </div>
          <div class="col col-1 text-weight-bolder bordered">
            {{ totalQty }}
          </div>
          <div class="col col-2 text-weight-bolder bordered text-red-9">
            {{ totalSubtotal }}
          </div>
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
        <div class="row justify-end q-mx-md q-my-sm">

        </div>
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

const collectionAddress = computed(
  () => transactionStore.selectedCollectionAddress || "-"
);
const deliveryAddress = computed(
  () => transactionStore.selectedDeliveryAddress || "-"
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

const totalPcs = computed(() =>
  rows.value.reduce((acc, item) => acc + computedPcs(item), 0)
);

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
      })
        .format(new Date(transactionStore.collectionDate))

    : "--/--/----";
});

const formattedDeliveryDate = computed(() => {
  return transactionStore.deliveryDate
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
        .format(new Date(transactionStore.deliveryDate))

    : "--/--/----";
});

const computedPcs = (item) => {
  return (item.pieces || 1) * (item.quantity || 1);
};
</script>
