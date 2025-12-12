<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 980px; max-width: 95vw">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Select Invoices for SOA
        </div>
        <q-btn
          icon="close"
          flat
          dense
          round
          class="absolute-top-right q-ma-sm"
          @click="isOpen = false"
        />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-sm">
        <div class="row items-center q-gutter-sm q-mb-sm">
          <div class="col">
            <q-input
              v-model="search"
              dense
              outlined
              clearable
              debounce="200"
              placeholder="Search invoice no., order no., customer, status"
            >
              <template #prepend><q-icon name="search" /></template>
            </q-input>
          </div>
          <div class="col-auto">
            <q-checkbox
              v-model="selectAllChecked"
              :disable="!hasOrders"
              label="Select All"
              dense
            />
          </div>
          <!-- <div class="col-auto text-caption">
            <q-badge>{{ debug.totalInvoices }}</q-badge> invoices
          </div> -->
        </div>

        <div class="row-col-table">
          <!-- Header -->
          <div class="row row-col-header text-center items-center">
            <div class="col bordered q-py-sm text-weight-bolder">
              Invoice No.
            </div>
            <div class="col bordered q-py-sm text-weight-bolder">
              Order Details
            </div>
            <div class="col header-bordered flex flex-center">
              Payment Status
            </div>
            <div class="col-1 bordered q-py-sm text-weight-bolder">Select</div>
          </div>

          <!-- Loading -->
          <div v-if="isLoading" class="text-center q-pa-lg">
            <q-spinner />
            <div class="q-mt-sm">Loading invoices…</div>
          </div>

          <!-- Empty -->
          <div
            v-else-if="!hasOrders"
            class="text-center text-grey q-pa-lg text-h6"
          >
            No orders found.
          </div>

          <!-- Rows -->
          <template v-else>
            <div v-for="(row, i) in filteredRows" :key="row.key || i">
              <div class="row row-col-row line-height-1 bg-white">
                <!-- Invoice -->
                <div class="col bordered">
                  <div class="text-weight-bold text-subtitle1 text-uppercase">
                    {{ row.order.order_invoices?.invoice_no || "-" }}
                  </div>
                </div>

                <!-- Order details -->
                <div class="col bordered">
                  <div class="q-mb-xs">
                    <q-btn
                      outline
                      color="blue-8"
                      dense
                      @click="openOrderTab(row.order)"
                      class="text-weight-bold bg-blue-1 text-subtitle1 q-px-sm"
                    >
                      {{ row.order.order_no || "-" }}
                    </q-btn>
                  </div>
                  <div>
                    <span class="text-caption text-uppercase text-weight-bold"
                      >Date:</span
                    >
                    {{ getOrderDate(row.order) }}
                  </div>
                  <div>
                    <span class="text-caption text-uppercase text-weight-bold"
                      >Urgency:</span
                    >
                    <span :class="urgencyClass(row.urgency)">
                      {{ row.urgency || "default" }}
                    </span>
                  </div>
                </div>

                <!-- Payment -->
                <div class="col bordered">
                  <div
                    class="text-weight-bold text-subtitle1 text-center q-mb-sm line-height-1 text-uppercase"
                    style="border-style: solid; border-width: 1px"
                  >
                    {{ row.order.payment_status || "-" }}
                  </div>

                  <div>
                    <span
                      class="text-caption text-uppercase text-weight-bold q-mr-xs"
                      >Credits:</span
                    >
                    <span class="text-weight-bold">
                      {{ formatMoney(row.customerCreditsTotal) }}
                    </span>
                  </div>

                  <q-separator class="q-ma-sm" />

                  <div>
                    <span
                      class="text-caption text-uppercase text-weight-bold q-mr-xs"
                      >Paid:</span
                    >
                    <span class="text-weight-bold">
                      {{ formatMoney(row.order.paid_amount ?? 0) }}
                    </span>
                  </div>

                  <div>
                    <span
                      class="text-caption text-uppercase text-weight-bold q-mr-xs"
                      >Balance:</span
                    >
                    <span class="text-red text-weight-bold">
                      {{
                        formatMoney(
                          row.order.balance_amount ??
                            Math.max(
                              (row.order.total_amount ?? 0) -
                                (row.order.paid_amount ?? 0),
                              0
                            )
                        )
                      }}
                    </span>
                  </div>

                  <div>
                    <span
                      class="text-caption text-uppercase text-weight-bold q-mr-xs"
                      >Amount:</span
                    >
                    <span class="text-weight-bold">
                      {{ formatMoney(row.order.total_amount ?? 0) }}
                    </span>
                  </div>
                </div>
                <!-- Select -->
                <div class="col-1 bordered flex items-center justify-center">
                  <q-checkbox
                    :model-value="selectedIds.has(row.order.id)"
                    @update:model-value="toggle(row.order)"
                    dense
                  />
                </div>
              </div>
            </div>
          </template>
        </div>
      </q-card-section>

<q-card-actions class="q-pa-md items-center" align="between">
  <q-btn
    unelevated
    label="Cancel"
    color="red-7"
    @click="isOpen = false"
  />

  <div class="row items-center q-gutter-x-md">
    <div class="text-subtitle1">
      Selected:
      <q-badge class="text-weight-bold text-subtitle1 text-blue-9" color="blue-2">
        {{ selectedIds.size }}
      </q-badge>
    </div>
    <div class="text-subtitle1">
      Selected Unpaid Total:
      <q-badge class="text-weight-bold text-subtitle1 text-red-9" color="red-2">
        {{ formatMoney(selectedUnpaid) }}
      </q-badge>
    </div>
    <q-btn
      unelevated
      color="primary"
      :disable="selectedIds.size === 0"
      :loading="isGenerating"
      label="Generate SOA"
      @click="confirmGenerate"
    />
  </div>
</q-card-actions>

    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useQuasar } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  customerId: { type: [String, Number], required: true },
  currency: { type: String, default: "USD" },
});
const emit = defineEmits(["update:modelValue", "generated"]);

const $q = useQuasar();
const transactionStore = useTransactionStore();

/* v-model */
const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

/* state */
const isLoading = ref(false);
const isGenerating = ref(false);
const invoices = ref([]); // raw rows from fetchInvoicesByCustomer
const selectedIds = ref(new Set());
const search = ref("");

watch(
  () => isOpen.value,
  async (open) => {
    if (!open) {
      selectedIds.value = new Set();
      search.value = "";
      return;
    }
    await loadInvoices();
  }
);

/* fetch via the new store action */
async function loadInvoices() {
  isLoading.value = true;
  try {
    invoices.value = await transactionStore.fetchInvoicesByCustomer(
      props.customerId
    );
  } catch (e) {
    console.error("fetchInvoicesByCustomer failed:", e);
    $q.notify({ type: "negative", message: "Failed to load invoices." });
    isOpen.value = false;
  } finally {
    isLoading.value = false;
  }
}
const rows = computed(() =>
  (invoices.value || []).map((log) => {
    const ord = log?.orders || {};
    const op = Array.isArray(ord?.order_payments) && ord.order_payments.length
      ? ord.order_payments[0]
      : (ord?.order_payments ?? null);
    const oi = Array.isArray(ord?.order_invoices) && ord.order_invoices.length
      ? ord.order_invoices[0]
      : (ord?.order_invoices ?? null);

    const total = Number(op?.total_amount ?? 0);
    const paid = Number(op?.paid_amount ?? 0);
    const balance = Math.max(total - paid, 0);
    const status = (op?.payment_status ?? "").trim() || null;

    const order = {
      id: ord?.id,
      order_no: ord?.order_no ?? null,
      created_at: ord?.created_at ?? null,
      payment_status: status,
      total_amount: total,
      paid_amount: paid,
      balance_amount: balance,
      order_invoices: {
        id: oi?.id ?? null,            // <-- needed for insert into customer_soa_invoices
        invoice_no: oi?.invoice_no ?? null
      },
      order_payment: op || null
    };

    return {
      key: `${log?.id ?? 'log'}-${order.id ?? 'ord'}`,
      urgency: log?.urgency ?? null,
      customerCreditsTotal: 0,
      order
    };
  })
);
const selectableIds = computed(() =>
  filteredRows.value
    .map((r) => r.order?.id)
    .filter((id) => id !== null && id !== undefined)
);
const selectAllChecked = computed({
  get: () =>
    hasOrders.value &&
    selectedIds.value.size > 0 &&
    selectedIds.value.size === selectableIds.value.length,
  set: (val) => {
    if (val) {
      selectedIds.value = new Set(selectableIds.value);
    } else {
      selectedIds.value.clear();
    }
  },
});

const selectedRows = computed(() =>
  rows.value.filter(
    (r) => r.order?.id != null && selectedIds.value.has(r.order.id)
  )
);
const selectedUnpaid = computed(() =>
  selectedRows.value.reduce((sum, r) => {
    const total = Number(r.order?.total_amount ?? 0);
    const paid = Number(r.order?.paid_amount ?? 0);
    const bal = Number(r.order?.balance_amount ?? Math.max(total - paid, 0));
    return sum + (isFinite(bal) ? bal : 0);
  }, 0)
);

/* derived flags/filter */
const hasOrders = computed(() => (rows.value || []).length > 0);

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return rows.value;
  const match = (r) => {
    const invoiceNo = r.order?.order_invoices?.invoice_no ?? "";
    const orderNo = r.order?.order_no ?? "";
    const custName = r.customer?.name ?? "";
    const status =
      r.order?.payment_status ?? r.order?.order_payment?.payment_status ?? "";
    return [invoiceNo, orderNo, custName, status].some((s) =>
      String(s || "")
        .toLowerCase()
        .includes(q)
    );
  };
  return rows.value.filter(match);
});

/* helpers */
const formatDate = (d) => {
  if (!d) return "";
  const x = new Date(d);
  return isNaN(x.getTime())
    ? ""
    : x.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
};
const getOrderDate = (o) => formatDate(o?.created_at);
const formatMoney = (n) => {
  const num = Number(n ?? 0);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: props.currency,
    }).format(num);
  } catch {
    return num.toFixed(2);
  }
};
const urgencyClass = (u) => {
  const v = String(u || "").toLowerCase();
  return [
    "text-uppercase",
    "text-weight-bolder",
    v === "urgent"
      ? "text-purple"
      : v === "express"
      ? "text-red"
      : "text-caption",
  ];
};

/* selection */
function toggle(order) {
  if (!order?.id) return;
  const s = new Set(selectedIds.value);
  s.has(order.id) ? s.delete(order.id) : s.add(order.id);
  selectedIds.value = s;
}
async function confirmGenerate() {
  const orderIds = Array.from(selectedIds.value);
  if (orderIds.length === 0) {
    $q.notify({ type: "warning", message: "Select at least one invoice." });
    return;
  }

  const invoiceIds = selectedRows.value
    .map((r) => r?.order?.order_invoices?.id)
    .filter((v) => v !== null && v !== undefined);

  if (invoiceIds.length === 0) {
    $q.notify({ type: "warning", message: "Selected rows have no invoice IDs." });
    return;
  }

  isGenerating.value = true;
  try {
    const result = await transactionStore.createCustomerSoa({
      customerId: props.customerId,
      invoiceIds
      // soaNo: 'SOA-2025-...' // pass if you prefer custom numbering
    });

    $q.notify({ type: "positive", message: `SOA ${result?.soa_no || ""} created.` });
    emit("generated", result);
    isOpen.value = false;
  } catch (e) {
    console.error("Create SOA error:", e);
    $q.notify({ type: "negative", message: "Failed to create SOA." });
  } finally {
    isGenerating.value = false;
  }
}

/* navigation */
function openOrderTab(order) {
  try {
    // optional: transactionStore.setOrderNo?.(order?.order_no);
    window.open(`/orders/${order?.order_no}`, "_blank");
  } catch (e) {
    console.error(e);
  }
}
function openCustomerTab(customerId) {
  if (!customerId) return;
  window.open(`/customers/${customerId}`, "_blank");
}

</script>
