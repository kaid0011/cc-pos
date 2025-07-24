<template>
  <div class="full-container">
    <div class="q-pa-md">
      <q-card flat class="order-banner bg-blue-grey text-white q-pa-md">
        <div class="flex justify-between items-center">
          <div class="text-left">
            <div class="text-caption">
              <div class="text-h6 text-uppercase text-weight-bolder order-box">
                Order Details
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-slip-row">
              Order No:
              <span class="text-summary">{{ order?.order_no || "N/A" }}</span>
            </div>
            <div class="text-slip-row">
              Order Date:
              <span class="text-summary">{{
                formatDate(order?.created_at)
              }}</span>
            </div>
          </div>
        </div>
      </q-card>
    </div>

    <!-- Collection and Delivery Details -->
    <div class="row text-p q-col-gutter-md q-px-md line-height-1">
      <div class="col-4 q-pt-md" style="min-height: 100%">
        <q-card class="preview-card order-container" ref="orderContainer">
          <!-- Customer and Order Details -->
          <div class="text-subtitle1 text-uppercase text-weight-bolder">
            Customer Details
          </div>
          <q-separator class="q-my-xs" />
            <div class="row text-slip-row row-col-row" style="height: 100%">
              <div class="col-6">
                <span v-if="customer?.type == 'Contract'">Company Name:</span>
                <span v-else>Customer Name:</span>
              </div>
              <div class="col-6">
                <a
                  class="text-weight-bold"
                  @click.prevent="openCustomerTab(customer.id)"
                  >{{ customer.name }}</a
                >
              </div>
            </div>
            <div class="row text-slip-row row-col-row">
              <div class="col-6">
                <div>Customer Type:</div>
              </div>
              <div class="col-6">
                {{ customer?.type || "N/A"
                }}<span v-if="customer.sub_type && customer.sub_type != '-'">
                  - {{ customer.sub_type }}</span
                >
              </div>
            </div>
            <div class="row text-slip-row row-col-row">
              <div class="col-6">
                <div>Contact No/s:</div>
              </div>
              <div class="col-6">
                {{ customer?.contact_no1 || "-"
                }}<span v-if="customer.contact_no2">
                  / {{ customer?.contact_no2 || "-" }}</span
                >
              </div>
            </div>
            <div class="row text-slip-row row-col-row">
              <div class="col-6">
                <div>Email Address:</div>
              </div>
              <div class="col-6">
                {{ customer?.email || "N/A" }}
              </div>
            </div>
        </q-card>
      </div>
      <div class="col-4 q-pt-md" style="min-height: 100%">
        <q-card class="slip-card">
          <div class="text-subtitle1 text-uppercase text-weight-bolder">
            Collection Details
          </div>
          <q-separator class="q-my-xs" />
          <div class="row text-slip-row row-col-row">
            <div class="col-6">Contact Person:</div>
            <div class="col-6">
              {{ collection.customer_contact_persons?.name || "-" }}
            </div>
          </div>
          <div class="row text-slip-row row-col-row">
            <div class="col-6">Contact Nos:</div>
            <div class="col-6">
              {{ formattedCollectionContactNos || "-" }}
            </div>
          </div>
          <div class="row text-slip-row row-col-row">
            <div class="col-6">Address:</div>
            <div class="col-6">
              {{ collection.address || "-" }}
            </div>
          </div>

          <div class="row text-slip-row row-col-row">
            <div class="col-6">Collection Date:</div>
            <div class="col-6">
              {{ formattedCollectionDate }}
            </div>
          </div>
          <div class="row text-slip-row row-col-row">
            <div class="col-6">Collection Time:</div>
            <div class="col-6">
              {{ collection.collection_time || "-" }}
            </div>
          </div>
          <div class="row text-slip-row row-col-row">
            <div class="col-6">Collection Driver:</div>
            <div class="col-6">
              {{ collection.driver_name || "-" }}
            </div>
          </div>
          <div class="row text-slip-row row-col-row">
            <div class="col-6">No. of Bags:</div>
            <div class="col-6">
              {{ collection.no_bags || "-" }}
            </div>
          </div>
          <div class="row text-slip-row row-col-row">
            <div class="col-6">Remarks:</div>
            <div class="col-6">
              {{ collection.remarks || "-" }}
            </div>
          </div>
        </q-card>
      </div>
      <div class="col-4 q-pt-md" style="min-height: 100%">
        <q-card class="slip-card">
          <div class="text-subtitle1 text-uppercase text-weight-bolder">
            Delivery Details
          </div>
          <q-separator class="q-my-xs" />
          <div class="row text-slip-row row-col-row">
            <div class="col-6">Contact Person:</div>
            <div class="col-6">
              {{ delivery.customer_contact_persons?.name || "-" }}
            </div>
          </div>
          <div class="row text-slip-row row-col-row">
            <div class="col-6">Contact Nos:</div>
            <div class="col-6">
              {{ formattedDeliveryContactNos || "-" }}
            </div>
          </div>
          <div class="row text-slip-row row-col-row">
            <div class="col-6">Address:</div>
            <div class="col-6">
              {{ delivery.address || "-" }}
            </div>
          </div>

          <div class="row text-slip-row row-col-row">
            <div class="col-6">Delivery Date:</div>
            <div class="col-6">
              {{ formattedDeliveryDate }}
            </div>
          </div>

          <div class="row text-slip-row row-col-row">
            <div class="col-6">Delivery Time:</div>
            <div class="col-6">
              {{ delivery.delivery_time || "-" }}
            </div>
          </div>
          <div class="row text-slip-row row-col-row">
            <div class="col-6">Delivery Driver:</div>
            <div class="col-6">
              {{ delivery.driver_name || "-" }}
            </div>
          </div>
          <div class="row text-slip-row row-col-row">
            <div class="col-6">Remarks:</div>
            <div class="col-6">
              {{ delivery.remarks || "-" }}
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <div class="row text-p q-col-gutter-md q-pa-md line-height-1">
      <div class="col-4 q-pt-md" style="min-height: 100%">
        <q-card class="preview-card">
          <div class="row justify-start items-center">
            <div class="text-subtitle1 text-uppercase text-weight-bolder">
              Logistics Details
            </div>
          </div>
          <q-separator class="q-mt-xs" />
          <q-card-section class="q-pb-sm">
            <div class="row q-mb-xs items-center">
              <div class="col-4 text-right q-mr-sm">
                <div>Logistics Status:</div>
              </div>
              <div class="col text-uppercase text-summary">
                {{ logistics.logistics_status }}
              </div>
            </div>
            <div class="row q-mb-xs items-center">
              <div class="col-4 text-right q-mr-sm">
                <div>Job Type:</div>
              </div>
              <div class="col text-uppercase text-summary">
                {{ logistics.job_type }}
              </div>
            </div>
            <div class="row q-mb-xs items-center">
              <div class="col-4 text-right q-mr-sm">
                <div>Urgency:</div>
              </div>
              <div class="col text-uppercase text-summary">
                {{ logistics.urgency }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-4 q-pt-md" style="min-height: 100%">
        <q-card class="slip-card">
          <div class="row justify-start items-center">
            <div class="text-subtitle1 text-uppercase text-weight-bolder">
              Production Details
            </div>
          </div>
          <q-separator class="q-mt-xs" />
          <q-card-section class="q-pb-sm">
            <div class="row q-mb-xs items-center">
              <div class="col-4 text-right q-mr-sm">
                <div>Goods Status:</div>
              </div>
              <div class="col text-uppercase text-summary">
                {{ goodsStatus }}
              </div>
            </div>
            <div class="row q-mb-xs items-center">
              <div class="col-4 text-right q-mr-sm">
                <div>No. of Packets:</div>
              </div>
              <div class="col text-uppercase text-summary">
                {{ noPackets }}
              </div>
            </div>
            <div class="row q-mb-xs items-center">
              <div class="col-4 text-right q-mr-sm">
                <div>No. of Hangers:</div>
              </div>
              <div class="col text-uppercase text-summary">
                {{ noHangers }}
              </div>
            </div>
            <div class="row q-mb-xs items-center">
              <div class="col-4 text-right q-mr-sm">
                <div>No. of Rolls:</div>
              </div>
              <div class="col text-uppercase text-summary">
                {{ noRolls }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-4 q-pt-md" style="min-height: 100%">
        <q-card class="slip-card">
          <div class="row items-center">
            <div class="text-subtitle1 text-uppercase text-weight-bolder">
              Packing Details
            </div>
          </div>
          <q-separator class="q-my-xs" />
          <q-card-section class="q-pb-sm">
           <div class="row q-mb-xs items-center">
  <div class="col-4 text-right q-mr-sm">
    <div>Hang:</div>
  </div>
  <div class="col">
    <q-input v-model="hang" dense outlined/>
  </div>
</div>
<div class="row q-mb-xs items-center">
  <div class="col-4 text-right q-mr-sm">
    <div>Pack:</div>
  </div>
  <div class="col">
    <q-input v-model="pack" dense outlined/>
  </div>
</div>
<div class="row q-mb-xs items-center">
  <div class="col-4 text-right q-mr-sm">
    <div>Roll:</div>
  </div>
  <div class="col">
    <q-input v-model="roll" dense outlined/>
  </div>
</div>
<div class="row q-mb-xs items-center">
  <div class="col-4 text-right q-mr-sm">
    <div>Return:</div>
  </div>
  <div class="col">
    <q-input v-model="ret" dense outlined/>
  </div>
</div>
          </q-card-section>
           <q-card-actions align="right" class="q-pa-none">
        <q-btn
          label="Save Details"
          color="primary"
          unelevated
          @click="updatePackDetails"
        />
      </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-card class="transactions-list preview-card q-ma-md">
      <!-- Add Instruction Button -->
      <div class="row items-center">
        <div class="text-subtitle1 text-uppercase text-weight-bolder">
          Transaction Items
        </div>
      </div>
      <q-separator class="q-mt-xs" />

      <q-card-section class="q-px-none">
        <!-- Transaction Table -->
        <div class="transaction-summary line-height-1">
          <div class="row row-col-header order-header text-center">
            <div class="col col-2 text-weight-bold bordered">Item</div>
            <div class="col col-2 text-weight-bold bordered">Category</div>
            <div class="col col-1 text-weight-bold bordered">Pack Type</div>
            <div class="col col-2 text-weight-bold bordered">Process</div>
            <div class="col col-1 text-weight-bold bordered">Price</div>
            <div class="col col-1 text-weight-bold bordered">Pcs</div>
            <div class="col col-1 text-weight-bold bordered">Qty</div>
            <div class="col col-1 text-weight-bold bordered">Subtotal</div>
            <div class="col col-1 text-weight-bold bordered">Ready?</div>
          </div>

          <div v-if="transactions.length > 0">
            <div
              v-for="(item, index) in transactions"
              :key="index"
              class="row row-col-row order-row"
            >
              <div class="col col-2 bordered">
                {{ transactions[index].item_name }}
              </div>
              <div class="col col-2 bordered text-center text-uppercase">
                {{ transactions[index].category }}
              </div>
              <div class="col col-1 bordered text-center">
                {{ transactions[index].pack_type }}
              </div>
              <div class="col col-2 bordered text-center">
                {{ transactions[index].process }}
              </div>
              <div class="col col-1 bordered text-center">
                ${{ transactions[index].price.toFixed(2) }}
              </div>
              <div class="col col-1 bordered text-center">
                {{ computedPcs(transactions[index]) }}
              </div>
              <div class="col col-1 bordered text-center">
                {{ transactions[index].quantity }}
              </div>
              <div class="col col-1 bordered text-center">
                ${{ transactions[index].subtotal.toFixed(2) }}
              </div>
              <div class="col col-1 bordered text-center">
                <q-checkbox v-model="item.ready_status" size="md" dense />
              </div>
            </div>
          </div>

          <div v-else class="text-center text-grey q-my-md">
            No items added to the list.
          </div>

          <div class="row row-col-footer order-footer">
            <div class="col col-6 text-weight-bold text-uppercase"></div>
            <div class="col col-2 text-weight-bold text-uppercase bordered">
              Total
            </div>
            <div class="col col-1 text-weight-bold bordered text-center">
              {{ totalPcs }}
            </div>
            <div class="col col-1 text-weight-bold bordered text-center">
              {{ totalQty }}
            </div>
            <div class="col col-1 text-weight-bold bordered text-center">
              ${{ totalSubtotal }}
            </div>
            <div class="col col-1 text-weight-bold bordered text-center"></div>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-pa-none">
        <q-btn
          label="Save Update"
          color="primary"
          unelevated
          @click="updateReadyStatus"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch, nextTick } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { useRoute } from "vue-router";
import { Notify } from "quasar";
import { useQuasar } from "quasar";

const $q = useQuasar();
const transactionStore = useTransactionStore();
const route = useRoute();

// Initialize objects to prevent null errors
const order = ref({}); // Changed from null to an empty object
const customer = ref({});
const logistics = ref({});
const collection = ref({});
const delivery = ref({});
const transactions = ref([]);
const instructions = ref([]);
const reports = ref([]);

const driverOptions = ref([]); // Initialize as a reactive array
const timeOptions = ref([]); // Initialize as a reactive array

// Load driverOptions when component is mounted
onMounted(async () => {
  try {
    // Load drivers first
    await transactionStore.loadDrivers();
    await transactionStore.loadTimeOptions();

    // Now set the dropdown options to the driverOptions from the store
    driverOptions.value = transactionStore.driverOptions;
    timeOptions.value = transactionStore.timeOptions;

    console.log("Driver Options Set:", driverOptions.value);
  } catch (error) {
    console.error("Error loading driver options:", error);
    driverOptions.value = []; // Fallback to an empty array
  }
});

onMounted(async () => {
  try {
    const orderNo = route.params.order_no;
    const orderDetails = await transactionStore.fetchWholeOrderByOrderNo(
      orderNo
    );

    if (!orderDetails) {
      console.warn("No order details found for:", orderNo);
      return;
    }

    logistics.value = orderDetails || {};
    order.value = orderDetails.order || {};
    customer.value = orderDetails.customer || {};
    collection.value = orderDetails.collection || {};
    delivery.value = orderDetails.delivery || {};
    transactions.value = [];

    (orderDetails.transactions || []).forEach((tx, i) => {
      if (Array.isArray(tx.order_transaction_items)) {
        tx.order_transaction_items.forEach((item) => {
          transactions.value.push({
            ...item,
            ready: item.ready ?? false,
          });
        });
      } else {
        console.warn(`⚠️ No items in transaction ${i}`);
      }
    });

    reports.value = orderDetails.error_reports || [];

    console.log("Assigned reports to reactive var:", reports.value);

    instructions.value = [
      ...(orderDetails.instructions_onetime || []).map((instruction) => ({
        ...instruction,
        type: "onetime",
        to: [
          ...(instruction.admin ? ["admin"] : []),
          ...(instruction.cleaning ? ["cleaning"] : []),
          ...(instruction.packing ? ["packing"] : []),
          ...(instruction.picking_sending ? ["pickingsending"] : []),
        ],
      })),
      ...(orderDetails.instructions_recurring || []).map((instruction) => ({
        ...instruction,
        type: "recurring",
        to: [
          ...(instruction.admin ? ["admin"] : []),
          ...(instruction.cleaning ? ["cleaning"] : []),
          ...(instruction.packing ? ["packing"] : []),
          ...(instruction.picking_sending ? ["pickingsending"] : []),
        ],
      })),
    ];

    console.log("Final instructions list:", instructions.value);
  } catch (error) {
    console.error("❌ Error loading order details:", error);
  }
});

// Watcher for transactions to dynamically calculate subtotals
watch(
  transactions,
  (newTransactions) => {
    newTransactions.forEach((transaction) => {
      transaction.subtotal =
        (transaction.price || 0) * (transaction.quantity || 1); // Exclude pieces
      // transaction.subtotal = (transaction.price || 0) * (transaction.quantity || 0) * (transaction.pieces || 1);
    });
  },
  { deep: true }
);

const paymentStatus = computed({
  get() {
    return order.value.order_payment?.payment_status || "";
  },
  set(val) {
    if (!order.value.order_payment) {
      order.value.order_payment = {}; // init fallback object
    }
    order.value.order_payment.payment_status = val;
  },
});

const goodsStatus = computed({
  get() {
    return order.value.order_production?.goods_status || "";
  },
  set(val) {
    if (!order.value.order_production) {
      order.value.order_production = {};
    }
    order.value.order_production.goods_status = val;
  },
});

const paymentType = computed({
  get() {
    return order.value.order_payment?.payment_type || "";
  },
  set(val) {
    if (!order.value.order_payment) {
      order.value.order_payment = {}; // init fallback object
    }
    order.value.order_payment.payment_type = val;
  },
});

const noPackets = computed({
  get() {
    return order.value.order_production?.no_packets || "";
  },
  set(val) {
    if (!order.value.order_production) {
      order.value.order_production = {};
    }
    order.value.order_production.no_packets = val;
  },
});

const noHangers = computed({
  get() {
    return order.value.order_production?.no_hangers || "";
  },
  set(val) {
    if (!order.value.order_production) {
      order.value.order_production = {};
    }
    order.value.order_production.no_hangers = val;
  },
});

const noRolls = computed({
  get() {
    return order.value.order_production?.no_rolls || "";
  },
  set(val) {
    if (!order.value.order_production) {
      order.value.order_production = {};
    }
    order.value.order_production.no_rolls = val;
  },
});

// Computed properties for totals
const totalPcs = computed(() =>
  transactions.value.reduce((acc, item) => acc + computedPcs(item), 0)
);

const totalQty = computed(() => {
  return transactions.value.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0; // Ensure a numeric value
    return acc + qty;
  }, 0);
});

const totalSubtotal = computed(() => {
  return transactions.value
    .reduce((acc, item) => {
      const subtotal = parseFloat(item.subtotal) || 0; // Ensure a numeric value
      return acc + subtotal;
    }, 0)
    .toFixed(2); // Format as a fixed two-decimal string
});

// Computed properties for formatted display
const formattedCollectionDate = computed(() =>
  formatDate(collection.value.collection_date)
);
const formattedDeliveryDate = computed(() =>
  formatDate(delivery.value.delivery_date)
);

// Function to format dates as "Thu, 30/01/2025"
const formatDate = (dateString) => {
  if (!dateString) return "N/A"; // If the date is missing or null, return "N/A"

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A"; // If the date is invalid, return "N/A"

  return date.toLocaleDateString("en-GB", {
    weekday: "short", // "Thu"
    day: "2-digit", // "30"
    month: "2-digit", // "01"
    year: "numeric", // "2025"
  });
};

const formattedCollectionContactNos = computed({
  get() {
    const contact1 =
      collection.value.customer_contact_persons?.contact_no1 || "-";
    const contact2 = collection.value.customer_contact_persons?.contact_no2;

    // If contact2 exists, show "contact1 / contact2", otherwise just show contact1
    return contact2 ? `${contact1} / ${contact2}` : contact1;
  },
  set(value) {
    const [contact1, contact2] = value.split(" / ").map((num) => num.trim());
    collection.value.customer_contact_persons.contact_no1 = contact1 || "";

    // Only set contact_no2 if it was provided
    collection.value.customer_contact_persons.contact_no2 = contact2 || null;
  },
});

const formattedDeliveryContactNos = computed({
  get() {
    const contact1 =
      delivery.value.customer_contact_persons?.contact_no1 || "-";
    const contact2 = delivery.value.customer_contact_persons?.contact_no2;
    // If contact2 exists, show "contact1 / contact2", otherwise just show contact1
    return contact2 ? `${contact1} / ${contact2}` : contact1;
  },
  set(value) {
    const [contact1, contact2] = value.split(" / ").map((num) => num.trim());
    delivery.value.customer_contact_persons.contact_no1 = contact1 || "";
    delivery.value.customer_contact_persons.contact_no2 = contact2 || "";
  },
});

const openCustomerTab = (customerId) => {
  const url = `/customers/${customerId}`;
  window.open(url, "_blank"); // Open in a new tab
};

// Data Initialization
onMounted(async () => {
  await transactionStore.loadItems();
});

const computedPcs = (item) => {
  return (item.pieces || 1) * item.quantity;
};

const updateReadyStatus = async () => {
  try {
    const updates = transactions.value.map((item) => ({
      id: item.id,
      ready: item.ready_status || false,
    }));

    await Promise.all(
      updates.map((update) =>
        transactionStore.updateTransactionReady(update.id, update.ready)
      )
    );

    Notify.create({
      type: "positive",
      message: "Ready status updated successfully!",
      icon: "check_circle",
      timeout: 2500,
    });
  } catch (error) {
    console.error("❌ Error updating ready status:", error);
    Notify.create({
      type: "negative",
      message: "Failed to update ready status.",
      icon: "error",
      timeout: 3500,
    });
  }
};

const hang = computed({
  get: () => delivery.value?.hang || '',
  set: (val) => { delivery.value.hang = val }
});

const pack = computed({
  get: () => delivery.value?.pack || '',
  set: (val) => { delivery.value.pack = val }
});

const roll = computed({
  get: () => delivery.value?.roll || '',
  set: (val) => { delivery.value.roll = val }
});

const ret = ref(""); // 'return' field not defined; ref fallback

const updatePackDetails = async () => {
};

</script>
<style scoped>
.order-banner {
  margin-bottom: 0 !important;
}
.preview-card,
.slip-card {
  min-height: 100%;
}
</style>
