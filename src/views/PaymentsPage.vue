<template>
  <div class="full-container orders-history">
    <div class="text-h6 text-center text-uppercase text-weight-bolder q-mb-md">
      Payments Management
    </div>

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
          <div class="col bordered">
            <a
              v-if="row.order?.order_no"
              @click="openOrderTab(row.order)"
              class="text-weight-bold text-subtitle1 cursor-pointer text-primary"
            >{{ row.order.order_no }}</a>
            <span v-else>N/A</span>
          </div>

          <div class="col bordered">
            <a
              v-if="row.customer?.id"
              @click.prevent="openCustomerTab(row.customer.id)"
              class="text-weight-bold text-subtitle1 line-height-1 cursor-pointer text-primary"
            >{{ row.customer?.name || 'Unknown' }}</a>
            <span v-else>N/A</span>
          </div>

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

          <div class="col bordered">
            <span class="text-weight-bold">{{ formatCurrency(getPaid(row.order)) }}</span>
          </div>

          <div class="col bordered">
            <span class="text-red-8 text-weight-bold">{{ formatCurrency(getUnpaid(row.order)) }}</span>
          </div>

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

    <div class="row justify-center q-mt-md">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="10"
        boundary-numbers
        direction-links
      />
    </div>

    <AddPaymentDialog
      v-model:show="showAddPaymentDialog"
      :order="selectedPaymentOrder"
      :customer="selectedPaymentCustomer"
      @saved="handlePaymentSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useQuasar } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";
import AddPaymentDialog from "@/components/dialogs/AddPaymentDialog.vue";

const $q = useQuasar();
const transactionStore = useTransactionStore();

/* ------------ Data fetch ------------ */
const rows = ref([]); 
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
  // 1. First, strictly filter only items that have an order_no
  let result = rows.value.filter(r => r.order && r.order.order_no);

  // 2. Then apply search query if exists
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    result = result.filter((r) => {
      const orderNo = r.order.order_no.toLowerCase();
      const cust = r.customer?.name?.toLowerCase() || "";
      const status = getPaymentStatus(r.order).toLowerCase();
      return orderNo.includes(q) || cust.includes(q) || status.includes(q);
    });
  }

  return result;
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

function openAddPaymentDialog(order, customer) {
  if (!order?.id) {
    $q.notify({ type: "warning", message: "No order attached. Create an order first." });
    return;
  }
  selectedPaymentOrder.value = order;
  selectedPaymentCustomer.value = customer || null;
  showAddPaymentDialog.value = true;
}

function handlePaymentSaved({ patch }) {
  const targetRow = rows.value.find(r => r.order?.id === selectedPaymentOrder.value?.id);
  
  if (targetRow && targetRow.order) {
    Object.assign(targetRow.order, patch);
    if (!targetRow.order.order_payment) {
      targetRow.order.order_payment = {};
    }
    Object.assign(targetRow.order.order_payment, patch.order_payment);
  }
  
  showAddPaymentDialog.value = false;
}
</script>