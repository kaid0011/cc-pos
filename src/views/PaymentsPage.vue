<!-- /src/views/PaymentsPage.vue -->
<template>
  <div class="full-container orders-history">
    <div class="text-h6 text-center text-uppercase text-weight-bolder q-mb-md">
      Payments Management
    </div>

    <!-- Search -->
    <div class="row justify-end q-mb-sm q-gutter-x-sm">
      <div class="col-4">
        <q-input
          class="search-transactions search-input"
          v-model="searchQuery"
          outlined
          dense
          placeholder="Search Order No, Customer Name, or Payment Status"
          debounce="300"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </div>
    </div>

    <!-- Table -->
    <div class="row-col-table">
      <div class="row row-col-header q-px-md">
        <div class="col bordered q-py-sm text-weight-bolder">Order No</div>
        <div class="col bordered q-py-sm text-weight-bolder">Customer Name</div>
        <div class="col bordered q-py-sm text-weight-bolder">Payment Status</div>
        <div class="col bordered q-py-sm text-weight-bolder">Paid Amount</div>
        <div class="col bordered q-py-sm text-weight-bolder">Unpaid Amount</div>
        <div class="col bordered q-py-sm text-weight-bolder"></div>
      </div>

      <div v-if="paginatedRows.length === 0" class="text-center text-grey q-pa-lg text-h6">
        No orders found.
      </div>

      <div v-else v-for="(row, idx) in paginatedRows" :key="row.logistics_id || idx">
        <div class="row row-col-row">
          <!-- Order No -->
          <div class="col bordered">
            <a
              v-if="row.order?.order_no"
              @click="openOrderTab(row.order)"
              class="text-weight-bold text-subtitle1"
            >{{ row.order.order_no }}</a>
            <span v-else>N/A</span>
          </div>

          <!-- Customer -->
          <div class="col bordered">
            <a
              v-if="row.customer?.id"
              @click.prevent="openCustomerTab(row.customer.id)"
              class="text-weight-bold text-subtitle1 line-height-1"
            >{{ row.customer?.name || 'Unknown' }}</a>
            <span v-else>N/A</span>
          </div>

          <!-- Payment Status -->
          <div class="col bordered text-uppercase">
            <q-badge
              :class="[
                'text-uppercase',
                'q-py-xs',
                'text-weight-bold',
                isPaid(row.order) ? 'bg-green-7'
                  : isUnpaid(row.order) ? 'bg-red-7'
                  : isPartial(row.order) ? 'bg-orange-7'
                  : 'bg-grey-7'
              ]"
              align="middle"
            >
              {{ getPaymentStatus(row.order) || 'N/A' }}
            </q-badge>
          </div>

          <!-- Paid -->
          <div class="col bordered">
            <span class="text-weight-bold">{{ formatCurrency(getPaid(row.order)) }}</span>
          </div>

          <!-- Unpaid -->
          <div class="col bordered">
            <span class="text-red-8 text-weight-bold">{{ formatCurrency(getUnpaid(row.order)) }}</span>
          </div>

          <!-- Action -->
          <div class="col bordered">
            <q-btn
              unelevated
              color="primary"
              label="Pay Order"
              :disable="!row.order?.id"
              @click="openAddPaymentDialog(row.order, row.customer)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="row justify-center q-mt-md">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="10"
        boundary-numbers
        direction-links
      />
    </div>

    <!-- Add Payment Dialog -->
    <q-dialog v-model="showAddPaymentDialog">
      <q-card style="min-width: 1000px">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">Add Payment</div>
          <q-btn icon="close" flat dense round class="absolute-top-right q-ma-sm" @click="showAddPaymentDialog = false" />
        </q-card-section>

        <q-card-section class="dialog-body text-subtitle1">
          <div class="row text-center">
            <div class="col all-border text-uppercase">
              <div>Paid</div>
              <div class="text-weight-bolder text-uppercase text-h6 text-green-9">
                {{ formatCurrency(displayPaid) }}
              </div>
            </div>
            <div class="col all-border text-uppercase">
              <div>Unpaid</div>
              <div class="text-weight-bolder text-uppercase text-h6 text-red-9">
                {{ formatCurrency(displayUnpaid) }}
              </div>
            </div>
            <div class="col all-border text-uppercase">
              <div>Total Amount</div>
              <div class="text-weight-bolder text-uppercase text-h6">
                {{ formatCurrency(displayTotal) }}
              </div>
            </div>
          </div>

          <q-separator class="q-my-sm" />

          <q-banner
            v-if="selectedPaymentType === 'Online Package Credits'"
            class="bg-yellow-1 q-my-sm"
            rounded
          >
            <q-icon name="account_balance_wallet" class="q-mr-sm" />
            Customer Credit Available:
            <span class="text-weight-bolder text-subtitle1 q-ml-xs">{{ formatCurrency(totalCredits) }}</span>
          </q-banner>

          <div class="row q-col-gutter-x-md">
            <div class="col-6">
              <div class="dialog-label">Payment Type<span class="dialog-asterisk">*</span></div>
              <q-select
                v-model="selectedPaymentType"
                :options="paymentTypes"
                outlined dense class="dialog-inputs"
                :rules="[(v)=>!!v || 'Payment Type is required']"
              />
            </div>
            <div class="col-6">
              <div class="dialog-label">Payment Amount<span class="dialog-asterisk">*</span></div>
              <q-input
                v-model.number="paymentAmount"
                type="number"
                outlined dense class="dialog-inputs q-pb-xs"
                :rules="[(v)=>!!v || 'Payment Amount is required', (v)=>v>0 || 'Must be greater than 0']"
              />
              <div v-if="selectedPaymentType === 'Bank Transfer' || selectedPaymentType === 'Cheque'">
                <div class="dialog-label q-mb-xs">Reference No.<span class="dialog-asterisk">*</span></div>
                <q-input
                  v-model="referenceNo"
                  type="text"
                  outlined dense class="dialog-inputs"
                  placeholder="Enter reference number"
                  :rules="[(v)=>!!v || 'Reference number is required']"
                />
              </div>
            </div>
          </div>

          <div class="q-mb-sm">
            <div class="dialog-label q-mb-xs">Remarks</div>
            <q-input v-model="creditRemarks" type="textarea" outlined dense class="dialog-inputs" />
          </div>

          <q-btn unelevated color="primary" label="Add Payment" class="full-width q-my-sm" @click="addPayment" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useQuasar } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";

const $q = useQuasar();
const transactionStore = useTransactionStore();

/* ------------ Data fetch (uses fetchOrderPayments) ------------ */
const rows = ref([]);       // [{ logistics_id, order, customer }]
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref("");

onMounted(async () => {
  try {
    rows.value = await transactionStore.fetchOrderPayments();
  } catch (e) {
    console.error("Error fetching payments:", e);
    rows.value = [];
  }
});

/* --------------------- Formatters / helpers ------------------- */
const formatCurrency = (n) => `$${Number(n || 0).toFixed(2)}`;
const getPaymentStatus = (order) =>
  order?.payment_status || order?.order_payment?.payment_status || "";

const getPaid = (order) => Number(order?.order_payment?.paid_amount ?? order?.paid_amount ?? 0) || 0;
const getTotal = (order) => Number(order?.order_payment?.total_amount ?? order?.total_amount ?? 0) || 0;
const getUnpaid = (order) => Math.max(getTotal(order) - getPaid(order), 0);

const isPaid = (order) => String(getPaymentStatus(order)).toLowerCase() === "paid";
const isUnpaid = (order) => String(getPaymentStatus(order)).toLowerCase() === "unpaid";
const isPartial = (order) => String(getPaymentStatus(order)).toLowerCase() === "partial";

/* --------------------- Filter + paginate ---------------------- */
const filteredRows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return rows.value;
  return rows.value.filter((r) => {
    const orderNo = r.order?.order_no?.toLowerCase() || "";
    const cust = r.customer?.name?.toLowerCase() || "";
    const status = getPaymentStatus(r.order).toLowerCase();
    return orderNo.includes(q) || cust.includes(q) || status.includes(q);
  });
});

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredRows.value.slice(start, end);
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value))
);

/* ----------------------- Navigation --------------------------- */
const openCustomerTab = (customerId) => customerId && window.open(`/customers/${customerId}`, "_blank");
const openOrderTab = (order) => order?.order_no && window.open(`/orders/${order.order_no}`, "_blank");

/* -------------------- Add Payment Flow ------------------------ */
const showAddPaymentDialog = ref(false);
const selectedPaymentOrder = ref(null);
const selectedPaymentCustomer = ref(null);

const selectedPaymentType = ref("Cash");
const paymentTypes = ref(["Cash", "Bank Transfer", "Cheque", "Online Package Credits"]);
const paymentAmount = ref(0);
const creditRemarks = ref("");
const referenceNo = ref("");
const totalCredits = ref(0);

const displayPaid = computed(() => getPaid(selectedPaymentOrder.value || {}));
const displayTotal = computed(() => getTotal(selectedPaymentOrder.value || {}));
const displayUnpaid = computed(() => Math.max(displayTotal.value - displayPaid.value, 0));

function openAddPaymentDialog(order, customer) {
  if (!order?.id) {
    $q.notify({ type: "warning", message: "No order attached. Create an order first." });
    return;
  }
  selectedPaymentOrder.value = order;
  selectedPaymentCustomer.value = customer || null;

  selectedPaymentType.value = "Cash";
  paymentAmount.value = displayUnpaid.value || 0;
  referenceNo.value = "";
  creditRemarks.value = "";
  totalCredits.value = 0;

  showAddPaymentDialog.value = true;
}

watch(
  () => selectedPaymentType.value,
  async (t) => {
    if (t === "Online Package Credits" && selectedPaymentCustomer.value?.id) {
      try {
        const c = await transactionStore.fetchCustomerCreditsById(selectedPaymentCustomer.value.id);
        totalCredits.value = (Number(c?.online_package) || 0) + (Number(c?.other_credits) || 0);
      } catch (err) {
        console.error("Failed to fetch credits:", err);
        $q.notify({ type: "negative", message: "Failed to load credits. Try again." });
      }
    }
  }
);

async function addPayment() {
  const order = selectedPaymentOrder.value;
  if (!order?.id) {
    $q.notify({ type: "negative", message: "Order ID is missing." });
    return;
  }
  if (!selectedPaymentType.value || Number(paymentAmount.value) <= 0) {
    $q.notify({ type: "negative", message: "Select a type and enter a valid amount." });
    return;
  }
  if ((selectedPaymentType.value === "Bank Transfer" || selectedPaymentType.value === "Cheque") && !referenceNo.value) {
    $q.notify({ type: "negative", message: "Reference number is required." });
    return;
  }

  const paymentData = {
    order_id: order.id,
    type: selectedPaymentType.value,
    amount: Number(paymentAmount.value),
    reference_no: referenceNo.value || undefined,
    remarks: creditRemarks.value || undefined,
  };

  try {
    await transactionStore.addPayment(paymentData);

    // overpayment → credit
    const totalAmount = getTotal(order);
    const alreadyPaid = getPaid(order);
    const unpaid = Math.max(totalAmount - alreadyPaid, 0);
    const overpay = Math.max(Number(paymentAmount.value) - unpaid, 0);

    if (overpay > 0 && selectedPaymentCustomer.value?.id) {
      await transactionStore.topUpCredits({
        customerId: selectedPaymentCustomer.value.id,
        type: "Over Payment",
        amount: overpay,
        remarks: `Auto-credited from invoice #${order.id}`,
      });
      $q.notify({ type: "info", message: `Overpayment of ${formatCurrency(overpay)} credited to customer.` });
    }

    // optimistic patch
    const newPaid = alreadyPaid + Number(paymentAmount.value);
    const newStatus = newPaid >= totalAmount ? "Paid" : "Unpaid";
    order.order_payment = {
      ...(order.order_payment || {}),
      total_amount: totalAmount,
      paid_amount: newPaid,
      payment_status: newStatus,
    };
    order.paid_amount = newPaid.toFixed(2);
    order.balance_amount = Math.max(totalAmount - newPaid, 0).toFixed(2);
    order.payment_status = newStatus;

    showAddPaymentDialog.value = false;
    selectedPaymentType.value = "Cash";
    paymentAmount.value = 0;
    referenceNo.value = "";
    creditRemarks.value = "";
    $q.notify({ type: "positive", message: "Payment added successfully." });
  } catch (error) {
    console.error("Error adding payment:", error);
    $q.notify({ type: "negative", message: "Failed to add payment. Please try again." });
  }
}
</script>
