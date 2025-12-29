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

        <q-banner class="bg-yellow-1 q-my-sm" rounded>
          <q-icon name="account_balance_wallet" class="q-mr-sm" />
          Customer Credit Available:
          <span class="text-weight-bolder text-subtitle1 q-ml-xs">
            ${{ (totalCredits || 0).toFixed(2) }}
          </span>
        </q-banner>

        <q-banner class="bg-grey-2 q-my-sm" rounded>
          <div class="row items-center full-width">
            <div class="col">
              <div class="text-body2 text-weight-bold">Reversal / Add back to bill (-)</div>
              <div class="text-caption text-grey-7">
                Turn on to add a negative payment (reduces Paid / increases Balance).
              </div>
            </div>
            <div class="col-auto">
              <q-toggle v-model="isReversal" />
            </div>
          </div>
        </q-banner>

        <div class="row q-col-gutter-x-md">
          <div class="col-6">
            <div class="dialog-label">Payment Type<span class="dialog-asterisk">*</span></div>
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
            <div class="dialog-label">Payment Amount<span class="dialog-asterisk">*</span></div>
            <q-input
              v-model.number="paymentAmount"
              type="number"
              outlined
              dense
              class="dialog-inputs q-pb-xs"
              :rules="[
                (val) => !!val || 'Payment Amount is required',
                (val) => Number(val) > 0 || 'Must be greater than 0',
                () =>
                  !isReversal || Number(paymentAmount || 0) <= Number(selectedPaidTotal || 0) ||
                  `Cannot reverse more than selected paid ($${formatCurrency(selectedPaidTotal)})`,
              ]"
            />
            <div v-if="selectedPaymentType === 'Bank Transfer' || selectedPaymentType === 'Cheque'">
              <div class="dialog-label q-mb-xs">Reference No.<span class="dialog-asterisk">*</span></div>
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

        <!-- ✅ Invoice picker -->
        <q-separator class="q-my-md" />
        <div class="row items-center q-col-gutter-sm q-mb-sm">
          <div class="col">
            <div class="text-subtitle2 text-weight-bold">Select Invoices to Apply This Payment</div>
            <div class="text-caption text-grey-7">
              Only selected invoices will be used for allocation.
            </div>
          </div>

          <div class="col-auto">
            <q-btn outline dense label="Select All" @click="selectAllInvoices" />
          </div>
          <div class="col-auto">
            <q-btn
              outline
              dense
              :label="isReversal ? 'Select Paid' : 'Select Unpaid'"
              @click="selectSmartInvoices"
            />
          </div>
          <div class="col-auto">
            <q-btn outline dense label="Clear" @click="clearInvoiceSelection" />
          </div>
        </div>

        <q-table
          :rows="invoiceRows"
          :columns="invoiceColumns"
          row-key="key"
          selection="multiple"
          v-model:selected="selectedInvoices"
          flat
          bordered
          dense
          :pagination="{ rowsPerPage: 6 }"
          no-data-label="No invoices in this SOA."
        >
          <template #body-cell-balance="p">
            <q-td :props="p">{{ formatCurrency(p.row.balance) }}</q-td>
          </template>
          <template #body-cell-paid="p">
            <q-td :props="p">{{ formatCurrency(p.row.paid) }}</q-td>
          </template>
          <template #body-cell-status="p">
            <q-td :props="p" :class="paymentStatusClass(p.row.status)">
              {{ p.row.status || "—" }}
            </q-td>
          </template>
        </q-table>

        <q-banner class="bg-grey-1 q-mt-sm" rounded>
          <div class="row items-center">
            <div class="col">
              Selected:
              <span class="text-weight-bold">{{ selectedInvoices.length }}</span>
              invoices —
              <span v-if="!isReversal">
                Selected Unpaid Total:
                <span class="text-weight-bold">${{ formatCurrency(selectedUnpaidTotal) }}</span>
              </span>
              <span v-else>
                Selected Paid Total:
                <span class="text-weight-bold">${{ formatCurrency(selectedPaidTotal) }}</span>
              </span>
            </div>
          </div>
        </q-banner>

        <!-- Allocation Preview -->
        <q-separator class="q-my-md" />
        <div class="text-subtitle2 text-weight-bold q-mb-sm">
          Allocation Preview ({{ isReversal ? "Newest → Oldest (Paid)" : "Oldest → Newest (Balance)" }})
        </div>

        <q-markup-table flat bordered dense class="full-width">
          <thead>
            <tr class="text-center">
              <th>No.</th>
              <th>Invoice No.</th>
              <th>Order No.</th>
              <th>{{ isReversal ? "Paid on Invoice ($)" : "Current Balance ($)" }}</th>
              <th>{{ isReversal ? "Reversed ($)" : "Allocated ($)" }}</th>
              <th>New Balance ($)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in allocationPreview" :key="row.key" class="text-center">
              <td>{{ i + 1 }}</td>
              <td>{{ row.invoice_no || "—" }}</td>
              <td>{{ row.order_no || "—" }}</td>
              <td>{{ formatCurrency(row.current_base) }}</td>
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
              <td class="text-weight-bolder">
                {{ formatCurrency(isReversal ? selectedPaidTotal : selectedUnpaidTotal) }}
              </td>
              <td class="text-weight-bolder">{{ formatCurrency(allocationSummary.allocatedTotal) }}</td>
              <td class="text-weight-bolder">
                {{
                  formatCurrency(
                    isReversal
                      ? Math.max(selectedUnpaidTotal + allocationSummary.allocatedTotal, 0)
                      : Math.max(selectedUnpaidTotal - allocationSummary.allocatedTotal, 0)
                  )
                }}
              </td>
              <td>
                <span v-if="!isReversal && allocationSummary.overpay > 0" class="text-orange">
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
          unelevated
          color="primary"
          :label="isReversal ? 'Add Reversal (-)' : 'Add Payment'"
          class="full-width q-my-sm"
          @click="addPayment"
        />

        <!-- Payment History -->
        <q-separator class="q-my-md" />

        <q-table
          title="Payment History"
          :rows="historyDisplayRows"
          :columns="historyColumns"
          row-key="id"
          flat
          bordered
          :loading="historyLoading"
          :pagination="{ rowsPerPage: 8 }"
          no-data-label="No payment history found for this SOA."
        >
          <template #top>
            <div class="row items-center full-width q-col-gutter-sm">
              <div class="col">
                <div class="text-subtitle2 text-weight-bold">Payment History</div>
              </div>
              <div class="col-auto">
                <q-btn
                  outline
                  icon="refresh"
                  label="Refresh"
                  :loading="historyLoading"
                  @click="loadSoaPaymentHistory"
                />
              </div>
            </div>
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
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useTransactionStore } from "@/stores/transactionStore";
import { useQuasar } from "quasar";
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

// present in your template; keep as placeholders to avoid runtime errors
const order = ref(null);
const logistics = ref(null);

// Dialog state
const showAddPaymentDialog = ref(false);
const selectedPaymentOrder = ref(null);
const selectedPaymentCustomer = ref(null);
const selectedPaymentType = ref("Cash");
const paymentTypes = ["Cash", "Bank Transfer", "Cheque", "Credit Card", "Online Package Credits"];
const paymentAmount = ref(0);
const referenceNo = ref("");
const creditRemarks = ref("");
const totalCredits = ref(0);
const isReversal = ref(false);

/* ---------------- amounts / display ---------------- */
const displayTotal = computed(() =>
  (lines.value || []).reduce(
    (s, l) => s + Number(l?.order_balance || 0) + Number(l?.paid_amount || 0),
    0
  )
);
const displayPaid = computed(() => (lines.value || []).reduce((s, l) => s + Number(l?.paid_amount || 0), 0));
const displayUnpaid = computed(() => Math.max(displayTotal.value - displayPaid.value, 0));

const customerLabel = computed(() => {
  const t = customer?.value?.type ? String(customer.value.type).trim().toLowerCase() : "";
  return t === "contract" ? "Company:" : "Customer Name:";
});
const hasBillingAddress = computed(() => {
  const addr = customer.value?.billing_address;
  if (addr == null) return false;
  return String(addr).trim().length > 0;
});

const totalUnpaid = computed(() => (lines.value || []).reduce((sum, l) => sum + Number(l?.order_balance || 0), 0));
const currentTotalUnpaid = computed(() => totalUnpaid.value);

/* ---------------- formatters ---------------- */
function formatDate(date) {
  if (!date) return "—";
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" });
}
function formatDateTime(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return String(val);
  return d.toLocaleString();
}
function formatCurrency(n) {
  const num = Number(n);
  return Number.isFinite(num) ? num.toFixed(2) : "0.00";
}
function formatStatus(val) {
  if (val == null || val === "") return "—";
  return String(val)
    .replace(/_/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\b([a-z])/g, (m) => m.toUpperCase());
}
function paymentStatusClass(status) {
  if (!status) return "text-grey";
  const s = String(status).trim().toLowerCase();
  if (s === "paid") return "text-green-9";
  if (s.includes("partial")) return "text-orange-9";
  if (s === "unpaid" || s === "pending" || s === "due") return "text-red-9";
  return "text-grey-8";
}

/* ---------------- paid helpers ---------------- */
function linePaidAmount(line) {
  const explicit = Number(line?.paid_amount);
  if (Number.isFinite(explicit) && explicit >= 0) return explicit;

  const total = Number(line?.total_amount);
  const bal = Number(line?.order_balance);
  if (Number.isFinite(total) && Number.isFinite(bal)) return Math.max(total - bal, 0);
  return 0;
}
const totalPaidAmount = computed(() => (lines.value || []).reduce((sum, l) => sum + linePaidAmount(l), 0));

function statusWithAmount(line) {
  const raw = String(line?.payment_status || "").trim().toLowerCase();
  const label = formatStatus(raw);
  if (raw === "paid") return `${label} ($${formatCurrency(linePaidAmount(line))})`;
  if (raw.includes("partial")) return `${label} ($${formatCurrency(linePaidAmount(line))})`;
  return label || "—";
}

function effectiveDateForLine(l) {
  return l?.invoice_date || soa.value?.created_at || null;
}
function parseAmount(n) {
  const v = Number(n);
  return Number.isFinite(v) ? Math.max(v, 0) : 0;
}

/* =========================
   ✅ Invoice selection
   ========================= */
const invoiceRows = computed(() =>
  (lines.value || []).map((l, idx) => ({
    key: `${l.id ?? l.order_id ?? "x"}-${idx}`,
    idx,
    order_id: l.order_id ?? l.orderId ?? null,
    invoice_no: l.invoice_no ?? "—",
    order_no: l.order_no ?? "—",
    invoice_date: effectiveDateForLine(l),
    balance: parseAmount(l.order_balance),
    paid: linePaidAmount(l),
    status: l.payment_status || "—",
  }))
);

const invoiceColumns = [
  { name: "invoice_no", label: "Invoice No.", field: "invoice_no", align: "left", sortable: true },
  { name: "order_no", label: "Order No.", field: "order_no", align: "left", sortable: true },
  { name: "invoice_date", label: "Invoice Date", field: (r) => formatDate(r.invoice_date), align: "left", sortable: true },
  { name: "paid", label: "Paid ($)", field: "paid", align: "right", sortable: true },
  { name: "balance", label: "Balance ($)", field: "balance", align: "right", sortable: true },
  { name: "status", label: "Status", field: "status", align: "left", sortable: true },
];

const selectedInvoices = ref([]); // rows selected from invoiceRows

const selectedIdxSet = computed(() => new Set((selectedInvoices.value || []).map((r) => r.idx)));

const selectedUnpaidTotal = computed(() =>
  (selectedInvoices.value || []).reduce((s, r) => s + parseAmount(r.balance), 0)
);

const selectedPaidTotal = computed(() =>
  (selectedInvoices.value || []).reduce((s, r) => s + parseAmount(r.paid), 0)
);

function selectAllInvoices() {
  selectedInvoices.value = [...invoiceRows.value];
}
function clearInvoiceSelection() {
  selectedInvoices.value = [];
}
function selectSmartInvoices() {
  if (isReversal.value) {
    selectedInvoices.value = invoiceRows.value.filter((r) => parseAmount(r.paid) > 0);
  } else {
    selectedInvoices.value = invoiceRows.value.filter((r) => parseAmount(r.balance) > 0);
  }
}

/* =========================
   ✅ Allocation (filtered by selected invoices)
   ========================= */
function allocateAcrossSelectedInvoices(amountAbs) {
  const remainingInit = parseAmount(amountAbs);
  if (remainingInit <= 0) return [];

  const allowed = selectedIdxSet.value;
  if (allowed.size === 0) return [];

  let remaining = remainingInit;

  const candidates = (lines.value || [])
    .map((l, idx) => ({
      idx,
      key: `${l.invoice_no || "inv"}-${idx}`,
      order_id: l.order_id ?? l.orderId ?? null,
      invoice_no: l.invoice_no,
      order_no: l.order_no,
      date: effectiveDateForLine(l),
      balance: parseAmount(l.order_balance),
      total_amount: Number(l?.total_amount ?? 0),
      current_status: l.payment_status || null,
    }))
    .filter((c) => allowed.has(c.idx) && c.balance > 0);

  candidates.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : Infinity;
    const db = b.date ? new Date(b.date).getTime() : Infinity;
    return da - db;
  });

  const out = [];
  for (const c of candidates) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, c.balance);
    if (take > 0) {
      const newBal = Number((c.balance - take).toFixed(2));
      out.push({
        idx: c.idx,
        key: c.key,
        order_id: c.order_id,
        invoice_no: c.invoice_no,
        order_no: c.order_no,
        current_base: c.balance,
        allocated: Number(take.toFixed(2)),
        new_balance: newBal,
        result_status: newBal === 0 ? "Paid" : "Partial Paid",
      });
      remaining -= take;
    }
  }
  return out;
}

function allocateReversalAcrossSelectedInvoices(amountAbs) {
  const remainingInit = parseAmount(amountAbs);
  if (remainingInit <= 0) return [];

  const allowed = selectedIdxSet.value;
  if (allowed.size === 0) return [];

  let remaining = remainingInit;

  const candidates = (lines.value || [])
    .map((l, idx) => {
      const paid = linePaidAmount(l);
      const bal = parseAmount(l.order_balance);
      const total = Number(l?.total_amount ?? (paid + bal));
      return {
        idx,
        key: `${l.invoice_no || "inv"}-${idx}`,
        order_id: l.order_id ?? l.orderId ?? null,
        invoice_no: l.invoice_no,
        order_no: l.order_no,
        date: effectiveDateForLine(l),
        paid: parseAmount(paid),
        balance: bal,
        total_amount: Number.isFinite(total) ? total : paid + bal,
      };
    })
    .filter((c) => allowed.has(c.idx) && c.paid > 0);

  candidates.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : -Infinity;
    const db = b.date ? new Date(b.date).getTime() : -Infinity;
    return db - da;
  });

  const out = [];
  for (const c of candidates) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, c.paid);
    if (take > 0) {
      const newBal = Number((c.balance + take).toFixed(2));
      const newStatus =
        newBal === 0 ? "Paid" : newBal < c.total_amount ? "Partial Paid" : "Unpaid";

      out.push({
        idx: c.idx,
        key: c.key,
        order_id: c.order_id,
        invoice_no: c.invoice_no,
        order_no: c.order_no,
        current_base: c.paid,
        allocated: Number(take.toFixed(2)),
        new_balance: newBal,
        result_status: newStatus,
      });

      remaining -= take;
    }
  }
  return out;
}

const allocationPreview = computed(() => {
  const amt = parseAmount(paymentAmount.value);
  if (amt <= 0) return [];
  if (selectedIdxSet.value.size === 0) return [];
  return isReversal.value
    ? allocateReversalAcrossSelectedInvoices(amt)
    : allocateAcrossSelectedInvoices(amt);
});

const allocationSummary = computed(() => {
  const allocatedTotal = (allocationPreview.value || []).reduce((s, a) => s + Number(a.allocated || 0), 0);
  const entered = parseAmount(paymentAmount.value);

  const poolTotal = isReversal.value ? selectedPaidTotal.value : selectedUnpaidTotal.value;
  const overpay = !isReversal.value ? Math.max(entered - poolTotal, 0) : 0;
  const unallocated = Math.max(entered - allocatedTotal, 0);

  return { allocatedTotal, entered, poolTotal, overpay, unallocated };
});

watch(isReversal, () => {
  if (!showAddPaymentDialog.value) return;
  selectSmartInvoices();
});

/* =========================
   ✅ credits refresh
   ========================= */
const activeCustomerId = computed(() => selectedPaymentCustomer.value?.id || customer.value?.id || null);

async function refreshCredits() {
  if (!showAddPaymentDialog.value || !activeCustomerId.value) return;

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

async function openAddPaymentDialog(orderArg, customerObj) {
  selectedPaymentOrder.value = orderArg || null;
  selectedPaymentCustomer.value = customerObj || null;

  selectedPaymentType.value = "Cash";
  isReversal.value = false;
  referenceNo.value = "";
  creditRemarks.value = "";

  showAddPaymentDialog.value = true;

  // default amount
  paymentAmount.value = Number((currentTotalUnpaid.value || 0).toFixed(2));

  // default selection (unpaid invoices)
  selectSmartInvoices();

  await refreshCredits();
  await loadSoaPaymentHistory();
}

/* =========================
   ✅ Payment History (SOA-wide)
   ========================= */
const historyRows = ref([]);
const historyLoading = ref(false);
const profileNameCache = ref({});

const historyColumns = [
  { name: "description", label: "Description", field: "description", align: "left", sortable: true },
  { name: "amount", label: "Amount", field: "amount", align: "left", sortable: true },
  { name: "payment_type", label: "Payment Type", field: "payment_type", align: "left", sortable: true },
  { name: "reference_no", label: "Reference No", field: "reference_no", align: "left", sortable: true },
  { name: "created_at", label: "Created At", field: "created_at", align: "left", sortable: true },
  { name: "created_by", label: "Created By", field: "created_by", align: "left", sortable: true },
];

function getCreatedById(row) {
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

async function loadSoaPaymentHistory() {
  const orderIds = Array.from(
    new Set(
      (lines.value || [])
        .map((l) => l?.order_id ?? l?.orderId ?? null)
        .filter((v) => v !== null && v !== undefined)
        .map((v) => Number(v))
        .filter((v) => Number.isFinite(v))
    )
  );

  if (orderIds.length === 0) {
    historyRows.value = [];
    return;
  }

  try {
    historyLoading.value = true;

    const perOrder = await Promise.all(
      orderIds.map(async (oid) => {
        try {
          return await transactionStore.fetchPaymentHistoryByOrderId(oid);
        } catch (e) {
          console.error("fetchPaymentHistoryByOrderId failed", oid, e);
          return [];
        }
      })
    );

    const merged = perOrder.flat().filter(Boolean);
    merged.sort((a, b) => {
      const da = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return db - da;
    });

    await hydrateCreatedByNames(merged);
    historyRows.value = merged;
  } catch (err) {
    console.error("Failed to load SOA payment history:", err);
    historyRows.value = [];
    $q.notify({ type: "negative", message: "Failed to load payment history." });
  } finally {
    historyLoading.value = false;
  }
}

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

/* =========================
   ✅ Add payment (supports selection + reversal)
   ========================= */
async function addPayment() {
  const toNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

  if (!selectedPaymentType.value || toNum(paymentAmount.value) <= 0) {
    $q.notify({ type: "negative", message: "Select a type and enter a valid amount." });
    return;
  }

  if (!selectedInvoices.value.length) {
    $q.notify({ type: "negative", message: "Please select at least 1 invoice." });
    return;
  }

  if (
    (selectedPaymentType.value === "Bank Transfer" || selectedPaymentType.value === "Cheque") &&
    !referenceNo.value
  ) {
    $q.notify({ type: "negative", message: "Reference number is required." });
    return;
  }

  if (isReversal.value && selectedPaymentType.value === "Online Package Credits") {
    $q.notify({ type: "negative", message: "Reversal is not supported for credits payments." });
    return;
  }

  const enteredAbs = toNum(paymentAmount.value);

  if (isReversal.value && enteredAbs > selectedPaidTotal.value) {
    $q.notify({
      type: "negative",
      message: `Cannot reverse more than selected paid ($${formatCurrency(selectedPaidTotal.value)}).`,
    });
    return;
  }

  // credits path only for normal payments
  let amountToAllocate = enteredAbs;

  if (!isReversal.value && selectedPaymentType.value === "Online Package Credits") {
    const cid = selectedPaymentCustomer.value?.id || customer.value?.id;
    if (!cid) {
      $q.notify({ type: "negative", message: "Missing customer for credits deduction." });
      return;
    }

    const credits = await transactionStore.applyCredits({
      customerId: cid,
      amount: amountToAllocate,
      remarks: `SOA ${soa.value?.soa_no || ""} allocation (selected invoices)`,
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
  }

  const allocations = isReversal.value
    ? allocateReversalAcrossSelectedInvoices(amountToAllocate)
    : allocateAcrossSelectedInvoices(amountToAllocate);

  if (!allocations.length) {
    $q.notify({
      type: "warning",
      message: isReversal.value
        ? "Nothing to reverse in the selected invoices."
        : "Nothing to allocate in the selected invoices.",
    });
    return;
  }

  const grouped = allocations.reduce((m, a) => {
    if (!a.order_id) return m;
    const k = String(a.order_id);
    const signedAmt = isReversal.value ? -a.allocated : a.allocated;
    m.set(k, (m.get(k) || 0) + signedAmt);
    return m;
  }, new Map());

  if (grouped.size === 0) {
    $q.notify({ type: "negative", message: "Cannot allocate because order IDs are missing." });
    return;
  }

  try {
    for (const [orderId, amtSigned] of grouped.entries()) {
      await transactionStore.addPayment({
        order_id: Number(orderId),
        type: selectedPaymentType.value,
        amount: Number(Number(amtSigned).toFixed(2)),
        reference_no: referenceNo.value || undefined,
        remarks:
          creditRemarks.value ||
          `SOA ${soa.value?.soa_no || ""} allocation (${isReversal.value ? "Reversal" : "Payment"})`,
      });
    }

    allocations.forEach((a) => {
      const L = lines.value[a.idx];
      if (!L) return;
      L.order_balance = a.new_balance;
      L.payment_status = a.result_status;
    });

    $q.notify({
      type: "positive",
      message: isReversal.value
        ? `Reversal added: $${amountToAllocate.toFixed(2)} applied to selected invoices.`
        : `Payment added: $${amountToAllocate.toFixed(2)} applied to selected invoices.`,
    });

    await loadSoaPaymentHistory();

    showAddPaymentDialog.value = false;
    selectedPaymentType.value = "Cash";
    isReversal.value = false;
    paymentAmount.value = 0;
    referenceNo.value = "";
    creditRemarks.value = "";
    selectedInvoices.value = [];
  } catch (error) {
    console.error("Error adding/allocating payment:", error);
    $q.notify({ type: "negative", message: "Failed to add payment(s). Please try again." });
  }
}

/* =========================
   ✅ Load SOA
   ========================= */
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

    const credits = details.customer_credits || { online_package: 0, other_credits: 0 };
    totalCredits.value = Number(credits.online_package || 0) + Number(credits.other_credits || 0);

    await loadSoaPaymentHistory();
  } catch (e) {
    error.value = e?.message || "Failed to load SOA.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadSoa);

/* =========================
   ✅ PDF (unchanged)
   ========================= */
const fmtMoney = (n) => Number(n || 0).toFixed(2);
const fmtDateISO = (d) => {
  const x = d ? new Date(d) : null;
  if (!x || Number.isNaN(x.getTime())) return "";
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const safeFileName = (s, fb = "SOA") =>
  String(s || fb).replace(/[\/\\?%*:|"<>]/g, "-").replace(/\s+/g, "_").trim() || fb;

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

function downloadSOAPdf() {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 36;
    const pageWidth = doc.internal.pageSize.getWidth();
    const BOX_X = margin;
    const BOX_W = pageWidth - 2 * margin;

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Statement of Account", pageWidth / 2, margin, { align: "center" });

    const boxY = margin + 16;
    doc.setLineWidth(1);
    doc.rect(BOX_X, boxY, BOX_W, 110);

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
      const addr = doc.splitTextToSize(customer.value.billing_address, colLeftW - 90);
      doc.text(addr, BOX_X + 80, y);
      y += addr.length * 14;
    }

    let ry = boxY + 18;
    const settlement = new Date();
    doc.setFont(undefined, "bold");
    doc.text("SOA No:", colRightX + 8, ry);
    doc.setFont(undefined, "normal");
    doc.text(String(soa?.value?.soa_no ?? routeSoaNo.value ?? "—"), colRightX + 110, ry);
    ry += 16;

    doc.setFont(undefined, "bold");
    doc.text("Settlement Date:", colRightX + 8, ry);
    doc.setFont(undefined, "normal");
    doc.text(fmtDateISO(settlement), colRightX + 110, ry);
    ry += 16;

    doc.setFont(undefined, "bold");
    doc.text("Payment Terms:", colRightX + 8, ry);
    doc.setFont(undefined, "normal");
    doc.text(String(customer?.value?.payment_terms ?? "—"), colRightX + 110, ry);

    const tableStartY = boxY + 110 + 18;

    const rows = (lines.value || []).map((l) => ({
      inv_no: l?.invoice_no ?? "",
      order_no: l?.order_no ?? "",
      date: fmtDateISO(l?.invoice_date) || fmtDateISO(soa?.value?.created_at) || "",
      amount: Number(l?.order_balance || 0),
    }));
    const total = rows.reduce((a, r) => a + (Number.isFinite(r.amount) ? r.amount : 0), 0);

    const INV_W = 120;
    const DATE_W = 120;
    const AMT_W = 120;
    const ORDER_W = Math.max(120, BOX_W - (INV_W + DATE_W + AMT_W));

    autoTable(doc, {
      startY: tableStartY,
      margin: { left: BOX_X, right: BOX_X },
      tableWidth: BOX_W,
      head: [["Inv No.", "Order No.", "Date", "Amount (SGD)"]],
      body: rows.map((r) => [r.inv_no, r.order_no, r.date, r.amount.toFixed(2)]),
      styles: { fontSize: 11, cellPadding: 6, lineWidth: 0.6, overflow: "linebreak" },
      headStyles: { halign: "center", fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: "bold" },
      bodyStyles: { halign: "center" },
      columnStyles: {
        0: { cellWidth: INV_W, halign: "center" },
        1: { cellWidth: ORDER_W, halign: "center" },
        2: { cellWidth: DATE_W, halign: "center" },
        3: { cellWidth: AMT_W, halign: "center" },
      },
      theme: "grid",
      foot: [["", "", "Total", total.toFixed(2)]],
      footStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: "bold", halign: "center" },
    });

    const afterTableY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 24 : tableStartY + 120;
    doc.setFont(undefined, "bold");
    doc.text("Ageing Analysis", BOX_X, afterTableY);

    const buckets = { "120 Days": 0, "90 Days": 0, "60 Days": 0, "30 Days": 0, Current: 0 };
    rows.forEach((r) => {
      const b = ageBucket(r.date, settlement);
      buckets[b] += r.amount || 0;
    });

    autoTable(doc, {
      startY: afterTableY + 8,
      margin: { left: BOX_X, right: BOX_X },
      tableWidth: BOX_W,
      head: [["120 Days", "90 Days", "60 Days", "30 Days", "Current"]],
      body: [[fmtMoney(buckets["120 Days"]), fmtMoney(buckets["90 Days"]), fmtMoney(buckets["60 Days"]), fmtMoney(buckets["30 Days"]), fmtMoney(buckets["Current"])]],
      styles: { fontSize: 11, cellPadding: 8, lineWidth: 0.6, halign: "center" },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: "bold" },
      bodyStyles: { halign: "center" },
      theme: "grid",
    });

    const notesY = doc.lastAutoTable.finalY + 18;
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.text(`For cheque payments please issue in favour of "Cotton Care Drycleaners Pte Ltd."`, BOX_X, notesY);
    doc.text("Thank you.", BOX_X, notesY + 20);
    doc.setFontSize(8);
    doc.text(
      "Please verify the entries and balance upon receiving this statement and notify us within 7 days if there are any discrepancies.",
      BOX_X,
      notesY + 36
    );

    const fname = `SOA-${safeFileName(soa?.value?.soa_no ?? routeSoaNo.value)}.pdf`;
    doc.save(fname);
  } catch (e) {
    console.error("Failed to generate SOA PDF:", e);
  }
}
</script>
