<!-- src/components/AddPaymentDialog.vue -->
<template>
  <q-dialog v-model="internalShow">
    <q-card style="min-width: 1000px">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">Add Payment</div>
        <q-btn
          icon="close"
          flat
          dense
          round
          class="absolute-top-right q-ma-sm"
          @click="internalShow = false"
        />
      </q-card-section>

      <q-card-section class="dialog-body text-subtitle1">
        <!-- Summary -->
        <div class="row text-center">
          <div class="col all-border text-uppercase">
            <div>Paid</div>
            <div class="text-weight-bolder text-uppercase text-h6 text-green-9">
              ${{ displayPaid.toFixed(2) }}
            </div>
          </div>
          <div class="col all-border text-uppercase">
            <div>Unpaid</div>
            <div class="text-weight-bolder text-uppercase text-h6 text-red-9">
              ${{ displayUnpaid.toFixed(2) }}
            </div>
          </div>
          <div class="col all-border text-uppercase">
            <div>Total Amount</div>
            <div class="text-weight-bolder text-uppercase text-h6">
              ${{ displayTotal.toFixed(2) }}
            </div>
          </div>
        </div>

        <q-separator class="q-my-sm" />

        <!-- Credits -->
        <q-banner class="bg-yellow-1 q-my-sm" rounded>
          <q-icon name="account_balance_wallet" class="q-mr-sm" />
          Customer Credit Available:
          <span class="text-weight-bolder text-subtitle1 q-ml-xs">
            ${{ displayCredits.toFixed(2) }}
          </span>
        </q-banner>

        <!-- Form -->
        <div class="row q-col-gutter-x-md">
          <div class="col-6">
            <div class="dialog-label">
              Payment Type<span class="dialog-asterisk">*</span>
            </div>
            <q-select
              v-model="selectedPaymentType"
              :options="paymentTypes"
              outlined
              dense
              class="dialog-inputs"
              :rules="[(val) => !!val || 'Payment Type is required']"
            />
          </div>

          <div class="col-6">
            <div class="dialog-label">
              Payment Amount<span class="dialog-asterisk">*</span>
            </div>

            <q-input
              v-model="paymentAmountStr"
              outlined
              dense
              inputmode="decimal"
              class="dialog-inputs q-pb-xs"
              :rules="[
                (v) => !!v || 'Payment Amount is required',
                () => paymentAmountNum > 0 || 'Must be greater than 0',
              ]"
              :error="isCreditTooHigh"
              :error-message="creditErrorMsg"
              @keydown="onAmountKeydown"
              @update:model-value="sanitizeAmount"
              @blur="formatPaymentAmount"
            >
              <template #prepend>$</template>
            </q-input>

            <div v-if="selectedPaymentType === 'Bank Transfer' || selectedPaymentType === 'Cheque'">
              <div class="dialog-label q-mb-xs">
                Reference No.<span class="dialog-asterisk">*</span>
              </div>
              <q-input
                v-model="referenceNo"
                type="text"
                outlined
                dense
                class="dialog-inputs"
                placeholder="Enter bank transfer reference number"
                :rules="[(val) => !!val || 'Reference number is required']"
              />
            </div>
          </div>
        </div>

        <div class="q-mb-sm">
          <div class="dialog-label q-mb-xs">Remarks</div>
          <q-input v-model="creditRemarks" type="textarea" outlined dense class="dialog-inputs" />
        </div>

        <q-btn
          unelevated
          color="primary"
          label="Add Payment"
          class="full-width q-my-sm"
          :loading="saving"
          @click="addPayment"
        />

        <!-- ✅ Payment History (ONLY requested columns) -->
        <q-separator class="q-my-md" />

        <q-table
          title="Payment History"
          :rows="historyDisplayRows"
          :columns="historyColumns"
          row-key="id"
          flat
          dense
          bordered
          :loading="historyLoading"
          :pagination="{ rowsPerPage: 8 }"
          no-data-label="No payment history found for this order."
        >
          <template #top>
            <!-- <div class="row items-center full-width q-col-gutter-sm">
              <div class="col"> -->
                <div class="text-subtitle1 text-uppercase text-weight-bold">Payment History</div>
              <!-- </div>
              <div class="col-auto">
                <q-btn
               dense
                outline
                  icon="refresh"
                  label="Refresh"
                  :loading="historyLoading"
                  @click="loadPaymentHistory"
                />
              </div>
            </div> -->
          </template>

          <template #body-cell-amount="p">
            <q-td :props="p">${{ Number(p.row.amount || 0).toFixed(2) }}</q-td>
          </template>

          <template #body-cell-created_at="p">
            <q-td :props="p">{{ formatDateTime(p.row.created_at) }}</q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useQuasar } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";

const props = defineProps({
  show: { type: Boolean, default: false },
  order: { type: Object, default: () => null },
  customer: { type: Object, default: () => null },
});
const emit = defineEmits(["update:show", "saved"]);

const $q = useQuasar();
const transactionStore = useTransactionStore();

/* ---------------- dialog state ---------------- */
const internalShow = ref(false);

watch(
  () => props.show,
  async (v) => {
    internalShow.value = v;
    if (v) {
      initForm();
      await loadPaymentHistory();
    }
  },
  { immediate: true }
);
watch(internalShow, (v) => emit("update:show", v));

/* ---------------- amounts / display ---------------- */
const displayPaid = computed(() => {
  const o = props.order;
  const op = o?.order_payment || {};
  const paidRaw = Number(op.paid_amount ?? o?.paid_amount ?? 0);
  return isNaN(paidRaw) ? 0 : paidRaw;
});

const displayTotal = computed(() => {
  const o = props.order;
  const op = o?.order_payment || {};
  const totalRaw = Number(op.total_amount ?? o?.total_amount ?? 0);
  return isNaN(totalRaw) ? 0 : totalRaw;
});

const displayUnpaid = computed(() => Math.max(displayTotal.value - displayPaid.value, 0));

const displayCredits = computed(() => {
  const credits = Array.isArray(props.customer?.customer_credits)
    ? props.customer.customer_credits[0]
    : props.customer?.customer_credits || {};
  const online = Number(credits?.online_package || 0);
  const other = Number(credits?.other_credits || 0);
  return online + other;
});

/* ---------------- form state ---------------- */
const paymentTypes = ref(["Cash", "Bank Transfer", "Cheque", "Online Package Credits"]);
const selectedPaymentType = ref("Cash");
const paymentAmountStr = ref("");
const referenceNo = ref("");
const creditRemarks = ref("");
const totalCredits = ref(0);
const saving = ref(false);

const paymentAmountNum = computed(() => {
  const n = parseFloat(String(paymentAmountStr.value));
  return isNaN(n) ? 0 : n;
});

const isCreditPayment = computed(() => selectedPaymentType.value === "Online Package Credits");
const isCreditTooHigh = computed(
  () => isCreditPayment.value && paymentAmountNum.value > displayCredits.value
);

const creditErrorMsg = computed(() =>
  isCreditTooHigh.value ? `Amount exceeds credits ($${displayCredits.value.toFixed(2)})` : ""
);

function onAmountKeydown(e) {
  const allowedNav = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
    "Tab",
    "Escape",
    "Enter",
  ];
  if (e.ctrlKey || e.metaKey) return;
  if (allowedNav.includes(e.key)) return;

  if (e.key === ".") {
    if (paymentAmountStr.value.includes(".")) e.preventDefault();
    return;
  }
  if (e.key < "0" || e.key > "9") e.preventDefault();
}

function sanitizeAmount(val) {
  let s = String(val || "");
  s = s.replace(/[^0-9.]/g, "");
  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
  }
  if (s.startsWith(".")) s = "0" + s;
  paymentAmountStr.value = s;
}

function formatPaymentAmount() {
  const n = paymentAmountNum.value;
  paymentAmountStr.value = n > 0 ? n.toFixed(2) : "0.00";
}

/* ---- credits fetch on type select ---- */
watch(selectedPaymentType, async (t) => {
  if (t === "Online Package Credits" && props.customer?.id) {
    try {
      const creditData = await transactionStore.fetchCustomerCreditsById(props.customer.id);
      totalCredits.value =
        (Number(creditData?.online_package) || 0) + (Number(creditData?.other_credits) || 0);
    } catch (err) {
      console.error("Failed to fetch customer credits:", err);
      $q.notify({ type: "negative", message: "Failed to load credits. Try again." });
    }
  }
});

function initForm() {
  selectedPaymentType.value = "Cash";
  paymentAmountStr.value = (displayUnpaid.value || 0).toFixed(2);
  referenceNo.value = "";
  creditRemarks.value = "";
}

/* =========================
   ✅ Payment History
   ========================= */
const historyRows = ref([]);
const historyLoading = ref(false);

/**
 * Cache profile names so we don’t spam Supabase for repeated userIds.
 * Key: userId -> name
 */
const profileNameCache = ref({});

const historyColumns = [
  { name: "description", label: "Description", field: "description", align: "left", sortable: true },
  { name: "amount", label: "Amount", field: "amount", align: "left", sortable: true },
  { name: "payment_type", label: "Payment Type", field: "payment_type", align: "left", sortable: true },
  { name: "reference_no", label: "Reference No", field: "reference_no", align: "left", sortable: true },
  { name: "created_at", label: "Created At", field: "created_at", align: "left", sortable: true },
  { name: "created_by", label: "Created By", field: "created_by", align: "left", sortable: true },
];

function formatDateTime(val) {
  if (!val) return "-";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return String(val);
  return d.toLocaleString();
}

function getCreatedById(row) {
  // Adjust these if your history table uses different field names
  return row?.created_by ?? row?.created_by_id ?? row?.user_id ?? row?.created_user_id ?? null;
}

async function hydrateCreatedByNames(rows) {
  const ids = Array.from(
    new Set(
      (rows || [])
        .map(getCreatedById)
        .filter((v) => v !== null && v !== undefined && String(v).length > 0)
        .map(String)
    )
  );

  const missing = ids.filter((id) => !(id in profileNameCache.value));
  if (missing.length === 0) return;

  // Fetch names in parallel, but only for missing IDs
  const pairs = await Promise.all(
    missing.map(async (id) => {
      try {
        const name = await transactionStore.getProfileName(id);
        return [id, name || "[UNKNOWN]"];
      } catch (e) {
        console.error("getProfileName failed", id, e);
        return [id, "[UNKNOWN]"];
      }
    })
  );

  const next = { ...profileNameCache.value };
  for (const [id, name] of pairs) next[id] = name;
  profileNameCache.value = next;
}

async function loadPaymentHistory() {
  const orderId = props.order?.id;
  if (!orderId) {
    historyRows.value = [];
    return;
  }

  try {
    historyLoading.value = true;

    const rows = await transactionStore.fetchPaymentHistoryByOrderId(orderId);
    const safeRows = Array.isArray(rows) ? rows : [];

    await hydrateCreatedByNames(safeRows);

    historyRows.value = safeRows;
  } catch (err) {
    console.error("Failed to load payment history:", err);
    historyRows.value = [];
    $q.notify({ type: "negative", message: "Failed to load payment history." });
  } finally {
    historyLoading.value = false;
  }
}

/**
 * Map your history row -> ONLY the requested display columns
 * - created_by uses profiles.name via store.getProfileName(userId)
 */
const historyDisplayRows = computed(() =>
  (historyRows.value || []).map((r) => {
    const createdById = getCreatedById(r);
    const createdByName = createdById ? profileNameCache.value[String(createdById)] : null;

    return {
      id: r.id ?? `${r.order_payment_id ?? "x"}-${r.created_at ?? Math.random()}`,
      description: r.description ?? r.remarks ?? r.note ?? r.kind ?? "-",
      amount: Number(r.amount ?? r.delta_amount ?? r.payment_amount ?? 0) || 0,
      payment_type: r.payment_type ?? r.type ?? r.payment_method ?? "-",
      reference_no: r.reference_no ?? r.ref_no ?? r.reference ?? "-",
      created_at: r.created_at ?? null,
      created_by: createdByName || (createdById ? "[UNKNOWN]" : "-"),
    };
  })
);

/* ---------------- submit ---------------- */
async function addPayment() {
  if (!props.order?.id) {
    $q.notify({ type: "negative", message: "Order ID is missing." });
    return;
  }
  if (!selectedPaymentType.value || paymentAmountNum.value <= 0) {
    $q.notify({ type: "negative", message: "Select a type and enter a valid amount." });
    return;
  }
  if (isCreditTooHigh.value) {
    $q.notify({
      type: "negative",
      message: `Amount exceeds available credits ($${displayCredits.value.toFixed(2)}).`,
    });
    return;
  }
  if (
    (selectedPaymentType.value === "Bank Transfer" || selectedPaymentType.value === "Cheque") &&
    !referenceNo.value
  ) {
    $q.notify({ type: "negative", message: "Reference number is required." });
    return;
  }

  const orderId = props.order.id;
  const incoming = paymentAmountNum.value;
  const totalAmount = displayTotal.value;
  const alreadyPaid = displayPaid.value;
  const unpaidAmount = Math.max(totalAmount - alreadyPaid, 0);

  const appliedAmount = Math.min(incoming, unpaidAmount);
  const overpaidAmount = Math.max(incoming - appliedAmount, 0);

  const paymentData = {
    order_id: orderId,
    type: selectedPaymentType.value,
    amount: appliedAmount,
    reference_no: referenceNo.value || undefined,
    remarks: creditRemarks.value || undefined,
  };

  try {
    saving.value = true;

    if (appliedAmount > 0) {
      await transactionStore.addPayment(paymentData);
    }

    if (overpaidAmount > 0 && props.customer?.id) {
      await transactionStore.topUpCredits({
        customerId: props.customer.id,
        type: "Over Payment",
        amount: overpaidAmount,
        remarks: `Auto-credited from invoice #${orderId} due to overpayment`,
      });
      $q.notify({
        type: "info",
        message: `Overpayment of $${overpaidAmount.toFixed(2)} credited to customer.`,
      });
    }

    const newPaid = alreadyPaid + appliedAmount;
    const newStatus = newPaid >= totalAmount ? "Paid" : "Unpaid";

    const patch = {
      order_payment: {
        ...(props.order?.order_payment || {}),
        total_amount: totalAmount,
        paid_amount: newPaid,
        payment_status: newStatus,
      },
      paid_amount: newPaid.toFixed(2),
      balance_amount: Math.max(totalAmount - newPaid, 0).toFixed(2),
      payment_status: newStatus,
    };

    emit("saved", { patch, paidNow: incoming, orderNo: props.order?.order_no || orderId });

    await loadPaymentHistory();
    internalShow.value = false;
  } catch (error) {
    console.error("Error adding payment:", error);
    $q.notify({ type: "negative", message: "Failed to add payment. Please try again." });
  } finally {
    saving.value = false;
  }
}
</script>
