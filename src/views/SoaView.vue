<!-- src/views/SoaView.vue -->
<template>
  <div class="row justify-center page-title-header text-uppercase">
    SOA Details
  </div>
  <div class="full-container">
    <div class="q-ma-md">
      <q-linear-progress v-if="loading" indeterminate class="q-mb-md" />

      <q-banner v-else-if="error" class="bg-red-1 text-negative q-mb-md" rounded dense>
        {{ error }}
      </q-banner>

      <template v-else>
        <q-card class="q-pa-md q-mb-md text-subtitle1">
          <div class="q-mb-xs">
            {{ customerLabel }}
            <span class="text-weight-bold">{{ customer?.name ?? "—" }}</span>
          </div>
          <div class="q-mb-xs" v-if="hasBillingAddress">
            Billing Address:
            <span class="text-weight-bold">{{ customer?.billing_address }}</span>
          </div>
          <div class="q-mb-xs">
            SOA No:
            <span class="text-weight-bold">{{ soa?.soa_no ?? routeSoaNo }}</span>
          </div>
          <div class="q-mb-xs">
            Date Created:
            <span class="text-weight-bold">{{ formatDate(soa?.created_at) }}</span>
          </div>
          <div class="q-mb-xs">
            Payment Terms:
            <span class="text-weight-bold">{{ customer?.payment_terms ?? "—" }}</span>
          </div>
        </q-card>

        <div class="row justify-between q-mb-sm">
          <q-btn
            unelevated
            dense
            label="Download SOA"
            color="primary"
            class="q-pa-sm"
            @click="downloadSOAPdf()"
          />
          <q-btn
            unelevated
            dense
            color="primary"
            class="q-pa-sm"
            @click="openAddPaymentDialog(order || logistics?.order, logistics?.customer)"
          >
            <span><q-icon name="add" size="xs" /></span>
            Add Payment
          </q-btn>
        </div>

        <div class="row-col-table">
          <div class="row row-col-header text-center text-weight-bolder">
            <div class="col-1 bordered">No.</div>
            <div class="col bordered">Order No.</div>
            <div class="col bordered">Invoice No.</div>
            <div class="col bordered">Invoice Date</div>
            <div class="col bordered">Logistics Status</div>
            <div class="col bordered">Payment Status</div>
            <div class="col bordered">Order Balance ($)</div>
          </div>

          <template v-if="(lines || []).length">
            <div
              v-for="(line, i) in lines"
              :key="line.id || i"
              class="row row-col-row line-height-1 text-center"
            >
              <div class="col-1 bordered">{{ i + 1 }}</div>
              <div class="col bordered">{{ line.order_no || "—" }}</div>
              <div class="col bordered">{{ line.invoice_no || "—" }}</div>
              <div class="col bordered">{{ formatDate(line.invoice_date) }}</div>
              <div class="col bordered">
                {{ formatStatus(line.logistics_status) || "—" }}
              </div>
<div class="col bordered" :class="paymentStatusClass(line.payment_status)">
  {{ statusWithAmount(line) }}
</div>
              <div class="col bordered">
                {{ formatCurrency(line.order_balance) }}
              </div>
            </div>

            <!-- FINAL SUMMARY ROW: Total Unpaid Balance -->
            <div class="row row-col-row line-height-1 text-center text-weight-bolder">
              <div class="col-1 bordered">&nbsp;</div>
              <div class="col bordered">&nbsp;</div>
              <div class="col bordered">&nbsp;</div>
              <div class="col bordered">&nbsp;</div>
              <div class="col bordered">TOTALS</div>
  <div class="col bordered text-green-9">{{ formatCurrency(totalPaidAmount) }}</div>
              <div class="col bordered text-red-9">{{ formatCurrency(totalUnpaid) }}</div>
            </div>
          </template>

          <div v-else class="text-grey q-mt-sm">No lines found.</div>
        </div>
      </template>
    </div>
  </div>

  <!-- Add Payment -->
  <q-dialog v-model="showAddPaymentDialog">
    <q-card style="min-width: 1000px">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">Add Payment</div>
        <q-btn
          icon="close"
          flat
          dense
          round
          class="absolute-top-right q-ma-sm"
          @click="showAddPaymentDialog = false"
        />
      </q-card-section>

      <q-card-section class="dialog-body text-subtitle1">
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

        <q-banner
          class="bg-yellow-1 q-my-sm"
          rounded
        >
          <q-icon name="account_balance_wallet" class="q-mr-sm" />
          Customer Credit Available:
          <span class="text-weight-bolder text-subtitle1 q-ml-xs">
            ${{ (totalCredits || 0).toFixed(2) }}
          </span>
        </q-banner>

        <div class="row q-col-gutter-x-md">
          <div class="col-6">
            <div class="dialog-label">Payment Type<span class="dialog-asterisk">*</span></div>
            <q-select
              v-model="selectedPaymentType"
              :options="paymentTypes"
              outlined dense class="dialog-inputs"
              :rules="[(val) => !!val || 'Payment Type is required']"
            />
          </div>
          <div class="col-6">
            <div class="dialog-label">Payment Amount<span class="dialog-asterisk">*</span></div>
            <q-input
              v-model.number="paymentAmount"
              type="number"
              outlined dense class="dialog-inputs q-pb-xs"
              :rules="[
                (val) => !!val || 'Payment Amount is required',
                (val) => val > 0 || 'Must be greater than 0',
              ]"
            />
            <div v-if="selectedPaymentType === 'Bank Transfer' || selectedPaymentType === 'Cheque'">
              <div class="dialog-label q-mb-xs">Reference No.<span class="dialog-asterisk">*</span></div>
              <q-input
                v-model="referenceNo"
                type="text"
                outlined dense class="dialog-inputs"
                placeholder="Enter bank transfer reference number"
                :rules="[(val) => !!val || 'Reference number is required']"
              />
            </div>
          </div>
        </div>

        <!-- PREVIEW: Auto-allocation across invoices -->
        <q-separator class="q-my-md" />
        <div class="text-subtitle2 text-weight-bold q-mb-sm">Allocation Preview (Oldest → Newest)</div>

        <q-markup-table flat bordered dense class="full-width">
          <thead>
            <tr class="text-center">
              <th>No.</th>
              <th>Invoice No.</th>
              <th>Order No.</th>
              <th>Current Balance ($)</th>
              <th>Allocated ($)</th>
              <th>New Balance ($)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in allocationPreview" :key="row.key" class="text-center">
              <td>{{ i + 1 }}</td>
              <td>{{ row.invoice_no || '—' }}</td>
              <td>{{ row.order_no || '—' }}</td>
              <td>{{ formatCurrency(row.current_balance) }}</td>
              <td class="text-weight-bold">{{ formatCurrency(row.allocated) }}</td>
              <td>{{ formatCurrency(row.new_balance) }}</td>
  <td :class="paymentStatusClass(row.result_status)">
  {{ row.result_status || "—" }}
</td>
            </tr>
            <tr v-if="!allocationPreview.length">
              <td colspan="7" class="text-center text-grey">Nothing to allocate.</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="text-center">
              <td colspan="3" class="text-weight-bolder">Totals</td>
              <td class="text-weight-bolder">{{ formatCurrency(currentTotalUnpaid) }}</td>
              <td class="text-weight-bolder">{{ formatCurrency(allocationSummary.allocatedTotal) }}</td>
              <td class="text-weight-bolder">{{ formatCurrency(Math.max(currentTotalUnpaid - allocationSummary.allocatedTotal, 0)) }}</td>
              <td>
                <span v-if="allocationSummary.overpay > 0" class="text-orange">
                  Overpay: ${{ formatCurrency(allocationSummary.overpay) }}
                </span>
                <span v-else-if="allocationSummary.unallocated > 0" class="text-grey">
                  Unallocated: ${{ formatCurrency(allocationSummary.unallocated) }}
                </span>
                <span v-else class="text-positive">Fully Allocated</span>
              </td>
            </tr>
          </tfoot>
        </q-markup-table>

        <q-btn
          unelevated color="primary" label="Add Payment"
          class="full-width q-my-sm"
          @click="addPayment"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useTransactionStore } from "@/stores/transactionStore";
import { useQuasar } from 'quasar';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const $q = useQuasar();
const route = useRoute();
const transactionStore = useTransactionStore();

const routeSoaNo = computed(() => route.params.soaNo || route.params.soa_no);

const loading = ref(true);
const error = ref("");
const soa = ref(null);
const customer = ref(null);
const lines = ref([]);

// === Add Payment dialog state (assumed existing) ===
const showAddPaymentDialog = ref(false);
const selectedPaymentOrder = ref(null);
const selectedPaymentCustomer = ref(null);
const selectedPaymentType = ref("Cash");
const paymentTypes = ["Cash","Bank Transfer","Cheque","Credit Card","Online Package Credits"];
const paymentAmount = ref(0);
const referenceNo = ref("");
const creditRemarks = ref("");
const totalCredits = ref(0);

// Example totals used by your header tiles (keep your own logic if present)
const displayTotal = computed(() => (lines.value || []).reduce((s, l) => s + Number(l?.order_balance || 0) + Number(l?.paid_amount || 0), 0));
const displayPaid  = computed(() => (lines.value || []).reduce((s, l) => s + (Number(l?.paid_amount || 0)), 0));
const displayUnpaid = computed(() => Math.max(displayTotal.value - displayPaid.value, 0));

// UI label rule
const customerLabel = computed(() => {
  const t = customer?.value?.type ? String(customer.value.type).trim().toLowerCase() : "";
  return t === "contract" ? "Company:" : "Customer Name:";
});

// Hide billing address if blank
const hasBillingAddress = computed(() => {
  const addr = customer.value?.billing_address;
  if (addr == null) return false;
  return String(addr).trim().length > 0;
});

// Total unpaid for the on-screen table summary
const totalUnpaid = computed(() => (lines.value || []).reduce((sum, l) => sum + Number(l?.order_balance || 0), 0));
const currentTotalUnpaid = totalUnpaid;

// ------- Shared formatters -------
function formatDate(date) {
  if (!date) return "—";
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" });
}
function formatCurrency(n) {
  const num = Number(n);
  return Number.isFinite(num) ? num.toFixed(2) : "0.00";
}
function formatStatus(val) {
  if (val == null || val === "") return "—";
  return String(val).replace(/_/g, " ").trim().toLowerCase().replace(/\s+/g, " ").replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

// ------- PDF helpers (already in your file) -------
const fmtMoney = (n) => Number(n || 0).toFixed(2);
const fmtDateISO = (d) => {
  const x = d ? new Date(d) : null;
  if (!x || Number.isNaN(x.getTime())) return "";
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const safeFileName = (s, fb = "SOA") => String(s || fb).replace(/[\/\\?%*:|"<>]/g, "-").replace(/\s+/g, "_").trim() || fb;

function ageBucket(invDate, settlement) {
  const d = invDate ? new Date(invDate) : null;
  if (!d || Number.isNaN(d.getTime())) return "Current";
  const days = Math.floor((settlement - d) / (1000 * 60 * 60 * 24));
  if (days > 120) return "120 Days";
  if (days > 90) return "90 Days";
  if (days > 60) return "60 Days";
  if (days > 30) return "30 Days";
  return "Current";
}

// ------- Auto-allocation helpers -------
function parseAmount(n) {
  const v = Number(n);
  return Number.isFinite(v) ? Math.max(v, 0) : 0;
}
function effectiveDateForLine(l) {
  return l?.invoice_date || soa.value?.created_at || null;
}
function allocateAcrossInvoices(amount) {
  let remaining = parseAmount(amount);
  if (remaining <= 0) return [];

  const candidates = (lines.value || [])
    .map((l, idx) => ({
      idx,
      key: `${l.invoice_no || 'inv'}-${idx}`,
      order_id: l.order_id ?? l.orderId ?? null,
      invoice_no: l.invoice_no,
      order_no: l.order_no,
      date: effectiveDateForLine(l),
      balance: parseAmount(l.order_balance),
      current_status: l.payment_status || null,
    }))
    .filter((c) => c.balance > 0);

  candidates.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : Infinity;
    const db = b.date ? new Date(b.date).getTime() : Infinity;
    return da - db;
  });

  const allocations = [];
  for (const c of candidates) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, c.balance);
    if (take > 0) {
      allocations.push({
        idx: c.idx,
        key: c.key,
        order_id: c.order_id,
        invoice_no: c.invoice_no,
        order_no: c.order_no,
        current_balance: c.balance,
        allocated: Number(take.toFixed(2)),
        new_balance: Number((c.balance - take).toFixed(2)),
        result_status:
          Number((c.balance - take).toFixed(2)) === 0
            ? "Paid"
            : take > 0
            ? "Partial Paid"
            : c.current_status || "Unpaid",
      });
      remaining -= take;
    }
  }
  return allocations;
}

// Live preview based on paymentAmount
const allocationPreview = computed(() => allocateAcrossInvoices(paymentAmount.value));

// Summary for footer line
const allocationSummary = computed(() => {
  const allocatedTotal = (allocationPreview.value || []).reduce((s, a) => s + Number(a.allocated || 0), 0);
  const entered = parseAmount(paymentAmount.value);
  const unpaid = currentTotalUnpaid.value;
  const overpay = Math.max(entered - unpaid, 0);
  const unallocated = Math.max(entered - allocatedTotal, 0);
  return { allocatedTotal, entered, unpaid, overpay, unallocated };
});

// Prefill with unpaid when dialog opens
function prefillPaymentAmountWithUnpaid() {
  const computedUnpaid = (lines.value || []).reduce((s, l) => s + parseAmount(l.order_balance), 0);
  if (!paymentAmount.value || paymentAmount.value <= 0) {
    paymentAmount.value = Number(computedUnpaid.toFixed(2));
  }
}
// replace activeCustomerId / refreshCredits / watch with this:

const activeCustomerId = computed(
  () => selectedPaymentCustomer.value?.id || customer.value?.id || null
);

// always fetch when dialog is open + we have a customer
async function refreshCredits() {
  if (!showAddPaymentDialog.value || !activeCustomerId.value) {
    // keep seed value if dialog closed; do not force to 0
    return;
  }
  try {
    const creditData = await transactionStore.fetchCustomerCreditsById(activeCustomerId.value);
    const op = Number(creditData?.online_package || 0);
    const oc = Number(creditData?.other_credits || 0);
    totalCredits.value = op + oc;
  } catch (err) {
    console.error("Failed to fetch customer credits:", err);
    $q.notify({ type: "negative", message: "Failed to load credits. Try again." });
  }
}

watch([showAddPaymentDialog, activeCustomerId], refreshCredits, { immediate: true });

// ensure an extra pull right after opening
function openAddPaymentDialog(order, customerObj) {
  selectedPaymentOrder.value = order || null;
  selectedPaymentCustomer.value = customerObj || null;
  showAddPaymentDialog.value = true;
  prefillPaymentAmountWithUnpaid();
  refreshCredits();
}


// DROP-IN: replace your existing addPayment() in <script setup>
async function addPayment() {
  // --- tiny helpers kept local for self-containment ---
  const toNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const effDate = (l) => l?.invoice_date || soa.value?.created_at || null;
  function allocateOldestFirst(amount) {
    let remaining = Math.max(toNum(amount), 0);
    if (remaining <= 0) return [];
    const items = (lines.value || [])
      .map((l, idx) => ({
        idx,
        order_id: l.order_id ?? l.orderId ?? null,
        invoice_no: l.invoice_no,
        order_no: l.order_no,
        date: effDate(l),
        balance: Math.max(toNum(l.order_balance), 0),
        curStatus: l.payment_status || null,
      }))
      .filter((x) => x.balance > 0)
      .sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : Infinity;
        const db = b.date ? new Date(b.date).getTime() : Infinity;
        return da - db;
      });

    const out = [];
    for (const it of items) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, it.balance);
      if (take > 0) {
        const newBal = Number((it.balance - take).toFixed(2));
        out.push({
          idx: it.idx,
          order_id: it.order_id,
          invoice_no: it.invoice_no,
          order_no: it.order_no,
          allocated: Number(take.toFixed(2)),
          new_balance: newBal,
          result_status: newBal === 0 ? "Paid" : "Partial Paid",
        });
        remaining -= take;
      }
    }
    return out;
  }

  // --- validations ---
  if (!selectedPaymentType.value || toNum(paymentAmount.value) <= 0) {
    $q.notify({ type: "negative", message: "Select a type and enter a valid amount." });
    return;
  }
  if (
    (selectedPaymentType.value === "Bank Transfer" || selectedPaymentType.value === "Cheque") &&
    !referenceNo.value
  ) {
    $q.notify({ type: "negative", message: "Reference number is required." });
    return;
  }

  // --- single-order mode stays as-is (non-credits) ---
  if (selectedPaymentOrder.value?.id && selectedPaymentType.value !== "Online Package Credits") {
    try {
      await transactionStore.addPayment({
        order_id: selectedPaymentOrder.value.id,
        type: selectedPaymentType.value,
        amount: toNum(paymentAmount.value),
        reference_no: referenceNo.value || undefined,
        remarks: creditRemarks.value || undefined,
      });
      $q.notify({ type: "positive", message: "Payment added successfully." });
      showAddPaymentDialog.value = false;
    } catch (error) {
      console.error("Error adding payment:", error);
      $q.notify({ type: "negative", message: "Failed to add payment. Please try again." });
    }
    return;
  }

  // --- SOA-level flow ---
  let amountToAllocate = toNum(paymentAmount.value);

  // Credits path: deduct from customer_credits (online_package -> other_credits)
  if (selectedPaymentType.value === "Online Package Credits") {
    const cid = selectedPaymentCustomer.value?.id || customer.value?.id;
    if (!cid) {
      $q.notify({ type: "negative", message: "Missing customer for credits deduction." });
      return;
    }
    const credits = await transactionStore.applyCredits({
      customerId: cid,
      amount: amountToAllocate,
      remarks: `SOA ${soa.value?.soa_no || ""} auto-allocation`,
    });
    if (!credits) {
      $q.notify({ type: "negative", message: "Failed to deduct credits." });
      return;
    }
    amountToAllocate = credits.totalApplied;
    if (amountToAllocate <= 0) {
      $q.notify({ type: "warning", message: "No available credits to apply." });
      return;
    }
    if (credits.remaining > 0) {
      $q.notify({
        type: "warning",
        message: `Credits insufficient. Applied $${credits.totalApplied.toFixed(
          2
        )} (Online: $${credits.appliedOnline.toFixed(2)}, Other: $${credits.appliedOther.toFixed(
          2
        )}). Remaining due: $${credits.remaining.toFixed(2)}.`,
      });
    }
  }

  // Allocate oldest -> newest
  const allocations = allocateOldestFirst(amountToAllocate);
  if (!allocations.length) {
    $q.notify({ type: "warning", message: "Nothing to allocate. All invoices may be fully paid." });
    return;
  }

  // Group by order_id
  const missingOrderIds = allocations.filter((a) => !a.order_id).length;
  const grouped = allocations.reduce((m, a) => {
    if (!a.order_id) return m;
    const k = String(a.order_id);
    m.set(k, (m.get(k) || 0) + a.allocated);
    return m;
  }, new Map());

  if (missingOrderIds > 0) {
    $q.notify({
      type: "warning",
      message: `Skipped ${missingOrderIds} allocation(s) because order IDs were missing.`,
    });
  }
  if (grouped.size === 0) {
    $q.notify({
      type: "negative",
      message: "Cannot allocate payments because order IDs are missing.",
    });
    return;
  }

  // Persist payments per order
  try {
    for (const [orderId, amt] of grouped.entries()) {
      await transactionStore.addPayment({
        order_id: Number(orderId),
        type: selectedPaymentType.value,
        amount: Number(amt.toFixed(2)),
        reference_no: referenceNo.value || undefined,
        remarks:
          creditRemarks.value ||
          `SOA ${soa.value?.soa_no || ""} auto-allocation (${selectedPaymentType.value})`,
      });
    }

    // Optimistic UI patch
    allocations.forEach((a) => {
      const L = lines.value[a.idx];
      if (!L) return;
      L.order_balance = a.new_balance;
      L.payment_status = a.result_status;
    });

    $q.notify({
      type: "positive",
      message: `${
        selectedPaymentType.value === "Online Package Credits" ? "Credits applied" : "Payment added"
      }: $${amountToAllocate.toFixed(2)} allocated across invoices.`,
    });

    // Reset dialog
    showAddPaymentDialog.value = false;
    selectedPaymentType.value = "Cash";
    paymentAmount.value = 0;
    referenceNo.value = "";
    creditRemarks.value = "";
  } catch (error) {
    console.error("Error adding/allocating payment:", error);
    $q.notify({ type: "negative", message: "Failed to add payment(s). Please try again." });
  }
}


// Data load
async function loadSoa() {
  loading.value = true;
  error.value = "";
  try {
    const key = String(routeSoaNo.value || "");
    if (!key) throw new Error("Missing SOA number in URL.");
    const details = await transactionStore.fetchSoaDetails(key);
    if (!details) throw new Error(`SOA "${key}" not found.`);
    soa.value = details.soa || null;
    customer.value = details.customer || null;
    lines.value = Array.isArray(details.lines) ? details.lines : [];
    // inside loadSoa() after setting soa/customer/lines:
const credits = details.customer_credits || { online_package: 0, other_credits: 0 };
totalCredits.value = Number(credits.online_package || 0) + Number(credits.other_credits || 0);

  } catch (e) {
    error.value = e?.message || "Failed to load SOA.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadSoa);

function downloadSOAPdf() {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    // Shared geometry so all sections align
    const margin = 36;
    const pageWidth = doc.internal.pageSize.getWidth();
    const BOX_X = margin;
    const BOX_W = pageWidth - 2 * margin;

    // Title
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Statement of Account", pageWidth / 2, margin, {
      align: "center",
    });

    // Header box
    const boxY = margin + 16;
    doc.setLineWidth(1);
    doc.rect(BOX_X, boxY, BOX_W, 110);

    // Header content (left/right)
    let y = boxY + 18;
    const colGap = 18;
    const colLeftW = Math.floor((BOX_W - colGap) / 2);
    const colRightX = BOX_X + colLeftW + colGap;

    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    const label = customerLabel.value.replace(":", "");
    doc.text(`${label}:`, BOX_X + 8, y);
    doc.setFont(undefined, "normal");
    doc.text(String(customer?.value?.name ?? "—"), BOX_X + 80, y);
    y += 16;

    if (hasBillingAddress.value) {
      doc.setFont(undefined, "bold");
      doc.text("Address:", BOX_X + 8, y);
      doc.setFont(undefined, "normal");
      const addr = doc.splitTextToSize(
        customer.value.billing_address,
        colLeftW - 90
      );
      doc.text(addr, BOX_X + 80, y);
      y += addr.length * 14;
    }

    // Right column
    let ry = boxY + 18;
    const settlement = new Date();
    doc.setFont(undefined, "bold");
    doc.text("SOA No:", colRightX + 8, ry);
    doc.setFont(undefined, "normal");
    doc.text(
      String(soa?.value?.soa_no ?? routeSoaNo.value ?? "—"),
      colRightX + 110,
      ry
    );
    ry += 16;

    doc.setFont(undefined, "bold");
    doc.text("Settlement Date:", colRightX + 8, ry);
    doc.setFont(undefined, "normal");
    doc.text(fmtDateISO(settlement), colRightX + 110, ry);
    ry += 16;

    doc.setFont(undefined, "bold");
    doc.text("Payment Terms:", colRightX + 8, ry);
    doc.setFont(undefined, "normal");
    doc.text(
      String(customer?.value?.payment_terms ?? "—"),
      colRightX + 110,
      ry
    );

    // Invoices table (same width as header & ageing)
    const tableStartY = boxY + 110 + 18;

    const rows = (lines.value || []).map((l) => ({
      inv_no: l?.invoice_no ?? "",
      order_no: l?.order_no ?? "",
      date:
        fmtDateISO(l?.invoice_date) || fmtDateISO(soa?.value?.created_at) || "",
      amount: Number(l?.order_balance || 0),
    }));
    const total = rows.reduce(
      (a, r) => a + (Number.isFinite(r.amount) ? r.amount : 0),
      0
    );

    // Column widths: exact sum equals BOX_W
    const INV_W = 120;
    const DATE_W = 120;
    const AMT_W = 120;
    const ORDER_W = Math.max(120, BOX_W - (INV_W + DATE_W + AMT_W));

    autoTable(doc, {
      startY: tableStartY,
      margin: { left: BOX_X, right: BOX_X },
      tableWidth: BOX_W,
      head: [["Inv No.", "Order No.", "Date", "Amount (SGD)"]],
      body: rows.map((r) => [
        r.inv_no,
        r.order_no,
        r.date,
        r.amount.toFixed(2),
      ]),
      styles: {
        fontSize: 11,
        cellPadding: 6,
        lineWidth: 0.6,
        overflow: "linebreak",
      },
      headStyles: {
        halign: "center",
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      bodyStyles: { halign: "center" }, // center ALL body cells
      columnStyles: {
        0: { cellWidth: INV_W, halign: "center" },
        1: { cellWidth: ORDER_W, halign: "center" }, // Order No.
        2: { cellWidth: DATE_W, halign: "center" },
        3: { cellWidth: AMT_W, halign: "center" }, // amount centered per request
      },
      theme: "grid",
      foot: [["", "", "Total", total.toFixed(2)]],
      footStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        halign: "center",
      },
    });

    // Ageing Analysis (same width)
    const afterTableY = doc.lastAutoTable
      ? doc.lastAutoTable.finalY + 24
      : tableStartY + 120;
    doc.setFont(undefined, "bold");
    doc.text("Ageing Analysis", BOX_X, afterTableY);

    const buckets = {
      "120 Days": 0,
      "90 Days": 0,
      "60 Days": 0,
      "30 Days": 0,
      Current: 0,
    };
    rows.forEach((r) => {
      const b = ageBucket(r.date, settlement);
      buckets[b] += r.amount || 0;
    });

    autoTable(doc, {
      startY: afterTableY + 8,
      margin: { left: BOX_X, right: BOX_X },
      tableWidth: BOX_W,
      head: [["120 Days", "90 Days", "60 Days", "30 Days", "Current"]],
      body: [
        [
          fmtMoney(buckets["120 Days"]),
          fmtMoney(buckets["90 Days"]),
          fmtMoney(buckets["60 Days"]),
          fmtMoney(buckets["30 Days"]),
          fmtMoney(buckets["Current"]),
        ],
      ],
      styles: {
        fontSize: 11,
        cellPadding: 8,
        lineWidth: 0.6,
        halign: "center",
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      bodyStyles: { halign: "center" }, // center ageing grid cells
      theme: "grid",
    });

    // Notes
    const notesY = doc.lastAutoTable.finalY + 18;
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.text(
      `For cheque payments please issue in favour of "Cotton Care Drycleaners Pte Ltd."`,
      BOX_X,
      notesY
    );
    doc.text("Thank you.", BOX_X, notesY + 20);
    doc.setFontSize(8);
    doc.text(
      "Please verify the entries and balance upon receiving this statement and notify us within 7 days if there are any discrepancies.",
      BOX_X,
      notesY + 36
    );

    const fname = `SOA-${safeFileName(
      soa?.value?.soa_no ?? routeSoaNo.value
    )}.pdf`;
    doc.save(fname);
  } catch (e) {
    console.error("Failed to generate SOA PDF:", e);
  }
}

function paymentStatusClass(status) {
  if (!status) return "text-grey";
  const s = String(status).trim().toLowerCase();
  // normalize common variants
  if (s === "paid") return "text-green-9";
  if (s.includes("partial")) return "text-orange-9";
  if (s === "unpaid" || s === "pending" || s === "due") return "text-red-9";
  return "text-grey-8"; // default/unknown
}function linePaidAmount(line) {
  const explicit = Number(line?.paid_amount);
  if (Number.isFinite(explicit) && explicit >= 0) return explicit;

  // fallback if not provided: paid = total - balance
  const total = Number(line?.total_amount);
  const bal = Number(line?.order_balance);
  if (Number.isFinite(total) && Number.isFinite(bal)) {
    return Math.max(total - bal, 0);
  }
  return 0;
}

/** Label to show in the Payment Status cell, with amount for paid/partial. */
function statusWithAmount(line) {
  const raw = String(line?.payment_status || "").trim().toLowerCase();
  const label = formatStatus(raw);
  if (raw === "paid") {
    return `${label} ($${formatCurrency(linePaidAmount(line))})`;
  }
  if (raw.includes("partial")) {
    return `${label} ($${formatCurrency(linePaidAmount(line))})`;
  }
  return label || "—";
}

/** Total paid across invoices (for summary row). */
const totalPaidAmount = computed(() =>
  (lines.value || []).reduce((sum, l) => sum + linePaidAmount(l), 0)
);</script>
