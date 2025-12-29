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
            <div class="col bordered">${{ item.subtotal.toFixed(2) }}</div>
          </div>
        </div>

        <!-- No Items Message -->
        <div v-else class="text-center text-grey q-my-md">
          No items added to the list.
        </div>
        <div
          class="row row-col-footer text-weight-bold text-subtitle1 justify-end"
        >
          TOTAL AMOUNT :
          <span class="text-red-8 q-ml-sm q-mr-md">{{ totalSubtotal }}</span>
        </div>
      </div>

      <div class="row justify-end q-mx-md q-col-gutter-x-xl text-right">
        <div class="col-auto">
          <div class="">Total Amount:</div>
        </div>
        <div class="col-2 text-weight-bold">
          <div class="">{{ totalSubtotal }}</div>
        </div>
      </div>

      <div class="row justify-end q-mx-md q-col-gutter-x-xl text-right">
        <div class="col-auto">
          <div v-for="line in dcTextLines" :key="line.key">
            <div class="">{{ line.label }}:</div>
          </div>
        </div>
        <div class="col-2 text-weight-bold">
          <div v-for="line in dcTextLines" :key="line.key">
            <div
              class=""
              :class="line.delta >= 0 ? 'text-red-8' : 'text-green-8'"
            >
              {{ line.deltaDisplay }}
            </div>
          </div>
        </div>
      </div>
      <div class="row justify-end">
        <div class="col-3 q-my-sm q-mx-md">
          <q-separator />
        </div>
      </div>
      <div class="row justify-end q-mx-md q-mb-md q-col-gutter-x-xl text-right">
        <div class="col-auto">
          <div class="text-subtitle1">Total:</div>
        </div>
        <div class="col-2 text-weight-bold">
          <div class="text-subtitle1 text-weight-bold">
            {{ formatMoney(estimatedTotal) }}
          </div>
        </div>
      </div>

      <div class="row justify-end">
        <q-btn
          label="Add/Update DC"
          color="primary"
          dense
          outline
          align="right"
          @click="dcManageOpen = true"
        />
      </div>
      <!-- ✅ Manage DC Dialog (contains table + add form) -->
      <q-dialog v-model="dcManageOpen">
        <q-card style="min-width: 720px; max-width: 92vw">
          <q-card-section class="row items-center justify-between">
            <div class="text-h6 text-weight-bold">
              Discounts & Charges (Overall)
            </div>
            <q-btn icon="close" flat dense v-close-popup />
          </q-card-section>

          <q-separator />

          <!-- Add / Update form -->
          <q-card-section class="q-gutter-md">
            <div class="text-subtitle2 text-grey-8">
              Add an overall Discount/Charge (customer rules are not removable).
            </div>

            <q-input
              v-model="dcDraft.description"
              label="Description"
              dense
              outlined
            />
            <div class="row q-col-gutter-md">
              <div class="col-4">
                <q-select
                  v-model="dcDraft.dc_type"
                  :options="['discount', 'charge']"
                  label="Type"
                  dense
                  outlined
                />
              </div>
              <div class="col-4">
                <q-select
                  v-model="dcDraft.value_type"
                  :options="['percent', 'amount']"
                  label="Value Type"
                  dense
                  outlined
                />
              </div>
              <div class="col-4">
                <q-input
                  v-model="dcDraft.value"
                  :label="
                    dcDraft.value_type === 'percent'
                      ? 'Percent (e.g. 10, 12.5)'
                      : 'Amount (e.g. 8.00)'
                  "
                  dense
                  outlined
                />
              </div>
            </div>

            <div class="row justify-end">
              <q-btn
                label="Apply"
                color="primary"
                :disable="!canApplyDraft"
                @click="applyOverallAdjustment"
              />
            </div>
          </q-card-section>

          <q-separator />

          <!-- Div-table (presentation + removable order rows only) -->
          <q-card-section>
            <div class="row-col-table">
              <div class="row row-col-header line-height-1 text-center">
                <div class="col-5 header-bordered">Description</div>
                <div class="col header-bordered">Type</div>
                <div class="col header-bordered">Amount</div>
                <div class="col header-bordered">Amount After Applied</div>
              </div>

              <div v-if="dcPreviewRows.length">
                <div
                  v-for="r in dcPreviewRows"
                  :key="r.rowKey"
                  class="row row-col-row line-height-1 items-center text-center"
                >
                  <div class="col-5 bordered text-left">
                    {{ r.description }}
                    <q-btn
                      v-if="r.removable"
                      class="text-caption float-right remove-button text-weight-bold"
                      dense
                      flat
                      color="negative"
                      size="sm"
                      @click="removeOverallAdjustment(r.adjustmentId)"
                    >
                      (Remove)
                    </q-btn>
                  </div>

                  <div class="col bordered">{{ r.dcTypeLabel }}</div>
                  <div class="col bordered">{{ r.amountDisplay }}</div>
                  <div class="col bordered">{{ r.afterDisplay }}</div>
                </div>
              </div>

              <div v-else class="text-center text-grey q-my-md">
                No discounts/charges applied.
              </div>
            </div>

            <div class="row justify-end q-mt-sm text-subtitle2">
              <div class="q-mr-lg">
                Subtotal: <b>{{ totalSubtotal }}</b>
              </div>
              <div class="q-mr-lg">
                Est. Adj:
                <b
                  :class="
                    estimatedOverallAdj >= 0 ? 'text-red-8' : 'text-green-8'
                  "
                >
                  {{ formatMoney(estimatedOverallAdj) }}
                </b>
              </div>
              <div>
                Est. Total:
                <b>{{ formatMoney(estimatedTotal) }}</b>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
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
import { computed, ref, onMounted, watch } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";

const transactionStore = useTransactionStore();
const dbDates = ref({ collection_date: null, delivery_date: null });


onMounted(loadDbDates);
watch(() => transactionStore.logisticsId, loadDbDates);

/* =========================
 * Base data (safe defaults)
 * ========================= */
const rows = computed(() => transactionStore.transactionItems ?? []);
const instructions = computed(() => transactionStore.instructions ?? []);
const reports = computed(() => transactionStore.reports ?? []);
const displayInstructions = computed(
  () => transactionStore.displayInstructions ?? []
);

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

async function loadDbDates() {
  // use store.logisticsId or pass it in
  dbDates.value = await transactionStore.fetchDbCollectionAndDeliveryDates();
}
function parseDateOnly(v) {
  if (!v) return null;
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00`);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysBetweenDateOnly(a, b) {
  if (!a || !b) return null;
  const da = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const db = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  const MS_DAY = 24 * 60 * 60 * 1000;
  return Math.floor((db.getTime() - da.getTime()) / MS_DAY);
}

function getExpressPct(collectionDate, deliveryDate) {
  const c = parseDateOnly(collectionDate);
  const d = parseDateOnly(deliveryDate);
  const days = daysBetweenDateOnly(c, d);

  if (days == null || days < 0) return 0;
  if (days <= 1) return 50;
  if (days <= 3) return 30;
  if (days <= 4) return 20;
  return 0;
}

const expressDcRow = computed(() => {
  const pct = getExpressPct(
    transactionStore.collectionDate,
    transactionStore.deliveryDate
  );

  if (!pct) return null;

  return {
    rowKey: `express_${pct}`,
    scope: "System",
    description: `Express Charge`,
    dc_type: "charge",
    value_type: "percent",
    value: pct,
    removable: false,
    adjustmentId: null,
  };
});


/* =========================
 * Fetch customer adjustments
 * ========================= */
onMounted(() => transactionStore.fetchCustomerDiscountCharges?.());

/* =========================
 * DC presentation + manage dialog
 * IMPORTANT: use dc_type + value_type everywhere (NO fallbacks)
 * ========================= */
const dcManageOpen = ref(false);

const dcDraft = ref({
  dc_type: "discount", // discount | charge
  value_type: "percent", // percent | amount
  value: "",
  description: "",
});

function parseNumeric(input) {
  if (input == null) return null;
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  const s = String(input).trim();
  if (!s) return null;
  const cleaned = s.replace(/[%$,]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

const canApplyDraft = computed(() => {
  const dc_type = String(dcDraft.value.dc_type ?? "").toLowerCase();
  const value_type = String(dcDraft.value.value_type ?? "").toLowerCase();
  const val = parseNumeric(dcDraft.value.value);

  if (dc_type !== "discount" && dc_type !== "charge") return false;
  if (value_type !== "percent" && value_type !== "amount") return false;
  if (val == null || val <= 0) return false;
  return true;
});

function ensureOrderOverallArray() {
  if (!Array.isArray(transactionStore.orderOverallDiscountCharges)) {
    transactionStore.orderOverallDiscountCharges = [];
  }
}

function applyOverallAdjustment() {
  if (!canApplyDraft.value) return;

  ensureOrderOverallArray();

  const id = `${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2)}`;

  const dc_type = String(dcDraft.value.dc_type ?? "").toLowerCase();
  const value_type = String(dcDraft.value.value_type ?? "").toLowerCase();
  const valueNum = parseNumeric(dcDraft.value.value);

  transactionStore.orderOverallDiscountCharges.push({
    id,
    dc_type, // ✅ matches DB column
    value_type, // ✅ matches DB column
    percentage: value_type === "percent" ? valueNum : null,
    amount: value_type === "amount" ? valueNum : null,
    description: (dcDraft.value.description || "").trim() || null,
  });

  dcDraft.value.value = "";
  dcDraft.value.description = "";
}

function removeOverallAdjustment(id) {
  ensureOrderOverallArray();
  transactionStore.orderOverallDiscountCharges =
    transactionStore.orderOverallDiscountCharges.filter((x) => x?.id !== id);
}

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function formatMoney(v) {
  const n = Number(v) || 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function formatPct(v) {
  const n = Number(v) || 0;
  return `${n.toFixed(2)}%`;
}

function formatSignedMoney(v) {
  const n = round2(v);
  const abs = formatMoney(Math.abs(n));
  return n >= 0 ? `+${abs}` : `-${abs}`;
}

const subtotalNumber = computed(() =>
  rows.value.reduce((acc, item) => acc + (Number(item?.subtotal) || 0), 0)
);

const totalSubtotal = computed(() => formatMoney(subtotalNumber.value));

const rawDcRows = computed(() => {
  const out = [];

  // 1) Customer-based (not removable)
  for (const r of transactionStore.customerDiscountCharges ?? []) {
    const dc_type = String(r?.dc_type ?? "").toLowerCase();
    const value_type = String(r?.value_type ?? "").toLowerCase();
    if ((dc_type !== "discount" && dc_type !== "charge") || (value_type !== "percent" && value_type !== "amount")) continue;

    const value = value_type === "percent" ? parseNumeric(r?.percentage) : parseNumeric(r?.amount);
    if (value == null || value === 0) continue;

    out.push({
      rowKey: `cust_${r.id}`,
      scope: "Customer",
      description: r?.description ?? r?.label ?? r?.code ?? "-",
      dc_type,
      value_type,
      value: Number(value),
      removable: false,
      adjustmentId: null,
    });
  }

  // 2) Express charge (derived from dates)
  if (expressDcRow.value) out.push(expressDcRow.value);

  // 3) Order-added (removable)
  for (const o of transactionStore.orderOverallDiscountCharges ?? []) {
    const dc_type = String(o?.dc_type ?? "").toLowerCase();
    const value_type = String(o?.value_type ?? "").toLowerCase();
    if ((dc_type !== "discount" && dc_type !== "charge") || (value_type !== "percent" && value_type !== "amount")) continue;

    const value = value_type === "percent" ? parseNumeric(o?.percentage) : parseNumeric(o?.amount);
    if (value == null || value === 0) continue;

    out.push({
      rowKey: `ord_${o.id}`,
      scope: "Order",
      description: o?.description ?? "-",
      dc_type,
      value_type,
      value: Number(value),
      removable: true,
      adjustmentId: o.id,
    });
  }

  return out;
});

const dcPreviewRows = computed(() => {
  const percentRows = [];
  const amountRows = [];

  for (const r of rawDcRows.value) {
    if (r.value_type === "percent") percentRows.push(r);
    else amountRows.push(r);
  }

  const ordered = [...percentRows, ...amountRows];

  let running = subtotalNumber.value;

  return ordered.map((r) => {
    const sign = r.dc_type === "discount" ? -1 : 1;

    let delta = 0;
    if (r.value_type === "percent") {
      delta = round2(running * (r.value / 100) * sign);
      running = round2(running + delta);
    } else {
      delta = round2(r.value * sign);
      running = round2(running + delta);
    }

    const dcTypeLabel =
      r.dc_type === "discount" ? "Discount (-)" : "Charge (+)";
    const amountDisplay =
      r.value_type === "percent" ? formatPct(r.value) : formatMoney(r.value);

    return {
      ...r,
      dcTypeLabel,
      amountDisplay,
      appliedDelta: delta,
      after: running,
      afterDisplay: formatMoney(running),
    };
  });
});

const estimatedTotal = computed(() => {
  const list = dcPreviewRows.value;
  if (!list.length) return subtotalNumber.value;
  return Number(list[list.length - 1]?.after) || subtotalNumber.value;
});

const estimatedOverallAdj = computed(() =>
  round2(estimatedTotal.value - subtotalNumber.value)
);

/* ✅ Text lines below transaction table */
const dcTextLines = computed(() => {
  return dcPreviewRows.value.map((r) => {
    const pctSuffix =
      r.value_type === "percent" ? ` (${formatPct(r.value)})` : "";
    const label = `${r.description ?? "-"}` + pctSuffix;

    return {
      key: r.rowKey,
      label,
      delta: Number(r.appliedDelta) || 0,
      deltaDisplay: formatSignedMoney(Number(r.appliedDelta) || 0),
    };
  });
});

/* =========================
 * Other existing page logic
 * ========================= */
const isDialogOpen = ref(false);
const dialogMessage = ref("");
const transactionSuccess = ref(false);

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

function formatAddress(a) {
  if (!a || typeof a !== "object") return "-";
  const parts = [a.block_no, a.road_name, a.unit_no, a.building_name]
    .map((v) => (v ?? "") + "")
    .map((s) => s.trim())
    .filter(Boolean);

  const main = parts.join(" ");
  const postal = (a.postal_code ?? "").toString().trim();
  const combined = [main, postal].filter(Boolean).join(", ");
  return combined || "-";
}

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
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return n.toFixed(2);
}

function displayItemName(item) {
  if (String(item.unit || "").toLowerCase() !== "pc") return item.name || "";
  const perUnit = Number(item.pieces_per_unit ?? item.pieces ?? 0);
  if (!Number.isFinite(perUnit) || perUnit <= 0) return item.name || "";
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
  if (price === "TBA") return "TBA";
  if (typeof price === "number") return `$${price.toFixed(2)} / ${unit}`;
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

const handlerDisplay = computed(() => {
  const norm = (v) => (v ?? "").toString().trim().toLowerCase();
  const labels = { cc: "Cotton Care", dc: "DryCleaners" };

  const set = new Set(rows.value.map((r) => norm(r.company)).filter(Boolean));
  if (set.size === 0) return "-";

  const order = ["cc", "dc"];
  const sorted = Array.from(set).sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia !== -1 || ib !== -1)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.localeCompare(b);
  });

  return sorted.map((k) => labels[k] ?? k.toUpperCase()).join("/");
});

const orderDateToday = computed(() =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Singapore",
  }).format(new Date())
);

async function handleGenerateInvoice() {}
watch(
  () => transactionStore.selectedCustomer?.id,
  () => transactionStore.fetchCustomerDiscountCharges?.()
);
watch(
  () => estimatedTotal.value,
  (v) => {
    transactionStore.totalAmount = Number(v || 0);
  },
  { immediate: true }
);
</script>


<style scoped>
.bordered {
  padding: 5px;
}
.remove-button {
  padding: 0;
}
</style>
