<template>
  <q-dialog v-model="innerShow" persistent>
    <q-card style="min-width: 900px; max-width: 95vw">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Make Delivery Exception
        </div>
        <q-btn
          icon="close"
          flat
          dense
          round
          class="absolute-top-right q-ma-sm"
          @click="close"
        />
      </q-card-section>

      <q-card-section class="dialog-body">
        <q-banner v-if="error" class="bg-red-1 text-red q-mb-md" rounded>
          <q-icon name="error" class="q-mr-sm" />{{ error }}
        </q-banner>

        <q-skeleton v-if="loading" type="rect" height="200px" />

        <template v-else>
          <q-banner class="bg-blue-1 text-blue-10 q-mb-md" rounded>
            <q-icon name="info" class="q-mr-sm" />
            PC: enter <i>sets</i> (if multi-piece) or <i>pcs</i>. KG: enter
            <i>pcs & weight</i>. SQFT: enter <i>pcs</i> only (size is fixed).
          </q-banner>

          <!-- Defaults -->
          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            Exception Delivery Details
          </div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-4">
              <div class="dialog-label q-mb-xs">Delivery Date</div>
              <q-input
                v-model="form.delivery_date"
                type="date"
                outlined
                dense
                class="dialog-inputs"
              />
            </div>
            <div class="col-4">
              <div class="dialog-label q-mb-xs">Delivery Time</div>
              <q-select
                v-model="form.delivery_time"
                :options="timeOptions"
                outlined
                dense
                class="dialog-inputs"
                emit-value
                :map-options="false"
              />
            </div>
            <div class="col-4">
              <div class="dialog-label q-mb-xs">Driver</div>
              <q-select
                v-model="form.driver_id"
                :options="driverOptions"
                option-label="name"
                option-value="id"
                outlined
                dense
                emit-value
                map-options
                class="dialog-inputs"
              />
            </div>
          </div>

          <div class="q-mb-md">
            <div class="dialog-label q-mb-xs">Remarks</div>
            <q-input
              v-model="form.remarks"
              type="textarea"
              outlined
              dense
              autogrow
              placeholder="Optional remarks…"
            />
          </div>

          <!-- PC TABLE -->
          <div v-if="pcItems.length" class="q-mt-lg">
            <div class="text-subtitle2 text-weight-bold q-mb-xs">
              Items (unit: PC)
            </div>
            <div class="transaction-summary">
              <div class="row row-col-header order-header text-center">
                <div class="col text-weight-bold bordered flex flex-center">
                  <div>Item</div>
                </div>
                <div class="col-3 text-weight-bold bordered flex flex-center">
                  <div>Available</div>
                </div>
                <div class="col-2 text-weight-bold bordered flex flex-center">
                  <div>QTY</div>
                </div>
                <div class="col-1 text-weight-bold bordered flex flex-center">
                  <div>Select</div>
                </div>
              </div>

              <div
                v-for="ex in pcItems"
                :key="ex.item_id"
                class="row row-col-row order-row items-center"
                :class="{ 'disable-row': ex.availableQty <= 0 }"
              >
                <div class="col bordered">
                  <div class="text-body2">{{ ex.item_name }}</div>
                  <div class="text-caption text-grey">
                    {{ ex.processLabel }} • PC
                  </div>
                </div>

                <div class="col-3 bordered text-center">
                  <template v-if="ex.multiplier > 1">
                    <div class="text-weight-bold text-body2">
                      {{ ex.availableQty }}
                      {{ ex.availableQty === 1 ? "set" : "sets" }}
                    </div>
                    <div class="text-caption text-grey-8">
                      {{ ex.availablePcs }} pcs per set
                    </div>
                  </template>

                  <template v-else>
                    <div class="text-weight-bold">
                      {{ ex.availablePcs }} pcs
                    </div>
                  </template>
                </div>
                <div class="col-2 bordered">
                  <q-input
                    v-model="ex.exceptionQty"
                    type="text"
                    inputmode="numeric"
                    dense
                    outlined
                    hide-bottom-space
                    :disable="ex.availableQty <= 0"
                    :suffix="ex.isSet ? 'set' : 'pcs'"
                    :error="ex.showError"
                    error-message="Exceeds available quantity"
                    no-error-icon
                    @keypress="allowOnlyNumberDot($event, ex.exceptionQty)"
                    @paste="onPasteNumberOnly"
                    @update:model-value="onQtyChange(ex)"
                    @blur="formatToTwoDecimals(ex)"
                  />
                </div>

                <div class="col-1 bordered flex flex-center">
                  <q-checkbox v-model="ex.selected" dense />
                </div>
              </div>
            </div>
          </div>

          <!-- KG TABLE -->
          <div v-if="kgItems.length" class="q-mt-xl">
            <div class="text-subtitle2 text-weight-bold q-mb-xs">
              Items (unit: KG)
            </div>
            <div class="transaction-summary">
              <div class="row row-col-header order-header text-center">
                <div class="col text-weight-bold bordered flex flex-center">
                  <div>Item</div>
                </div>
                <div class="col-3 text-weight-bold bordered flex flex-center">
                  <div>Available</div>
                </div>
                <div class="col-3 text-weight-bold bordered">
                  <div>Exception</div>
                  <q-separator class="" />
                  <div class="row">
                    <div class="col bordered">PCS</div>
                    <div class="col bordered">WEIGHT</div>
                  </div>
                </div>
                <div class="col-1 text-weight-bold bordered flex flex-center">
                  <div>Select</div>
                </div>
              </div>

              <div
                v-for="ex in kgItems"
                :key="ex.item_id"
                class="row row-col-row order-row items-center"
                :class="{ 'disable-row': ex.availablePcs <= 0 }"
              >
                <div class="col bordered">
                  <div class="text-body2">{{ ex.item_name }}</div>
                  <div class="text-caption text-grey">
                    {{ ex.processLabel }} • KG
                  </div>
                </div>

                <div class="col-3 bordered text-center">
                  <div class="text-weight-bold text-body2">
                    {{ ex.availablePcs }} pcs available
                  </div>
                  <div class="text-caption">
                    Available weight:
                    {{ Number(ex.availableQty).toFixed(2) }} kg
                  </div>
                </div>

                <div class="col-3 bordered" style="padding: 0">
                  <div class="row">
                    <div class="col bordered">
                      <q-input
                        v-model.number="ex.exceptionPieces"
                        type="text"
                        inputmode="numeric"
                        dense
                        outlined
                        hide-bottom-space
                        suffix="pcs"
                        :disable="ex.availablePcs <= 0"
                        :error="ex.showError"
                        error-message="Exceeds available pieces"
                        no-error-icon
                        @keypress="allowOnlyInteger($event)"
                        @paste="onPasteNumberOnly"
                        @update:model-value="onPiecesChange(ex)"
                      />
                    </div>
                    <div class="col bordered">
                      <div class="col bordered">
                        <q-input
                          v-model="ex.exceptionQty"
                          type="text"
                          inputmode="decimal"
                          dense
                          outlined
                          suffix="kg"
                          hide-bottom-space
                          placeholder="0.00"
                          :disable="ex.availablePcs <= 0"
                          :error="ex.showError"
                          error-message="Exceeds available weight"
                          no-error-icon
                          @keypress="
                            allowOnlyNumberDot($event, ex.exceptionQty)
                          "
                          @paste="onPasteNumberOnly"
                          @update:model-value="onQtyChange(ex)"
                          @blur="formatToTwoDecimals(ex)"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-1 bordered flex flex-center">
                  <q-checkbox v-model="ex.selected" dense />
                </div>
              </div>
            </div>
          </div>

          <!-- SQFT TABLE -->
          <div v-if="sqftItems.length" class="q-mt-xl">
            <div class="text-subtitle2 text-weight-bold q-mb-xs">
              Items (unit: SQFT)
            </div>
            <div class="transaction-summary">
              <div class="row row-col-header order-header text-center">
                <div class="col text-weight-bold bordered flex flex-center">
                  <div>Item</div>
                </div>
                <div class="col-3 text-weight-bold bordered flex flex-center">
                  <div>Available</div>
                </div>
                <div class="col-2 text-weight-bold bordered flex flex-center">
                  <div>PCS</div>
                </div>
                <div class="col-1 text-weight-bold bordered flex flex-center">
                  <div>Select</div>
                </div>
              </div>

              <div
                v-for="ex in sqftItems"
                :key="ex.item_id"
                class="row row-col-row order-row items-center"
                :class="{ 'disable-row': ex.availablePcs <= 0 }"
              >
                <div class="col bordered">
                  <div class="text-body2">{{ ex.item_name }}</div>
                  <div class="text-caption text-grey">
                    {{ ex.processLabel }} • SQFT
                  </div>
                </div>

                <div class="col-3 bordered text-center">
                  <div class="text-weight-bold text-body2">
                    {{ ex.availablePcs }} pcs available
                  </div>
                  <div class="text-caption text-grey-8">
                    Size per item: {{ Number(ex.availableQty).toFixed(2) }} sqft
                  </div>
                </div>
                <div class="col-2 bordered">
                  <q-input
                    v-model.number="ex.exceptionPieces"
                    type="text"
                    inputmode="numeric"
                    dense
                    outlined
                    hide-bottom-space
                    suffix="pcs"
                    :disable="ex.availablePcs <= 0"
                    :error="ex.showError"
                    error-message="Exceeds available pieces"
                    no-error-icon
                    @keypress="allowOnlyInteger($event)"
                    @paste="onPasteNumberOnly"
                    @update:model-value="onPiecesChange(ex)"
                  />
                </div>

                <div class="col-1 bordered flex flex-center">
                  <q-checkbox v-model="ex.selected" dense />
                </div>
              </div>
            </div>
          </div>
        </template>

        <div class="row justify-between q-mt-md">
          <q-btn outline label="Cancel" color="negative" @click="close" />
          <q-btn
            :disable="loading"
            unelevated
            label="Create Exception"
            color="primary"
            icon="save"
            @click="save"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { Notify } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  deliveryId: { type: [Number, String], required: true },
});
const emit = defineEmits(["update:modelValue", "saved"]);
const transactionStore = useTransactionStore();

/* --- 1. STATE --- */
const innerShow = ref(false);
const loading = ref(false);
const error = ref("");
const items = ref([]);
const driverOptions = ref([]);
const timeOptions = computed(() => {
  // support both array and { time: [...] }
  const raw = Array.isArray(transactionStore.timeOptions)
    ? transactionStore.timeOptions
    : Array.isArray(transactionStore.timeOptions?.time)
      ? transactionStore.timeOptions.time
      : [];

  return raw.map((t) => {
    if (typeof t === "string") {
      return { label: t, value: t };
    }
    // object case: accept common keys and fallbacks
    const label = t.label ?? t.value ?? t.time ?? "";
    const value = t.value ?? t.time ?? t.label ?? "";
    return { label, value };
  });
});

const form = ref({
  delivery_date: null,
  delivery_time: null,
  driver_id: null,
  remarks: "",
  logistics_id: null,
});

/* --- 2. COMPUTED TABLES --- */
const pcItems = computed(() => items.value.filter((i) => i.unit === "pc"));
const kgItems = computed(() => items.value.filter((i) => i.unit === "kg"));
const sqftItems = computed(() => items.value.filter((i) => i.unit === "sqft"));

function mapToUiItem(t) {
  const unit = (t.unit || "pc").toLowerCase();
  const qty = Number(t.quantity || 0);
  const multiplier = Math.max(Number(t.pieces || 1), 1);

  // Mapping logic for user-friendly labels
  const processMap = {
    laundry: "Laundry",
    dryclean: "Dry Clean",
    pressing: "Pressing Only",
    others: "Others",
  };

  // Fallback to the original value if not found in map
  const rawProcess = (t.process || "").toLowerCase();
  const cleanProcessLabel = processMap[rawProcess] || t.process || "-";

  const totalPcs = unit === "pc" ? qty * multiplier : multiplier;

  return {
    item_id: t.id,
    item_name: t.item_name,
    processLabel: cleanProcessLabel,
    unit,
    multiplier,
    originalQty: qty,
    originalPcs: totalPcs,
    availableQty: qty,
    availablePcs: totalPcs,
    selected: false,
    exceptionQty: unit === "kg" ? "0.00" : 0,
    exceptionPieces: 0,
    showError: false,
  };
}
function getConsumedMap(exceptionHeaders) {
  const map = new Map();
  exceptionHeaders.forEach((header) => {
    (header.logistics_delivery_exception_items || []).forEach((si) => {
      const prior = map.get(si.order_transaction_item_id) || { qty: 0, pcs: 0 };
      map.set(si.order_transaction_item_id, {
        qty: prior.qty + Number(si.quantity || 0),
        pcs: prior.pcs + Number(si.pieces || 0),
      });
    });
  });
  return map;
}

async function initLoad() {
  loading.value = true;
  error.value = "";
  try {
    await Promise.all([
      transactionStore.loadDrivers(),
      transactionStore.loadTimeOptions(),
    ]);
    driverOptions.value = transactionStore.driverOptions || [];
    timeOptions.value = transactionStore.timeOptions || [];

    const deliveryRow = await transactionStore.fetchDeliveryById(
      props.deliveryId
    );
    const logId = deliveryRow.logistics_id;
    const orderId = deliveryRow.logistics?.order_id;
const orderNo = deliveryRow.logistics?.orders?.order_no || "N/A";

    form.value.logistics_id = logId;
    form.value.delivery_date = deliveryRow.delivery_date;
    form.value.delivery_time = deliveryRow.delivery_time;
    form.value.driver_id = deliveryRow.driver_id;
form.value.remarks = `DELIVERY EXCEPTION for Order #${orderNo}`;

    const [rawTransactions, rawExceptions] = await Promise.all([
      transactionStore.fetchTransactionsByOrderId(orderId),
      transactionStore.fetchDeliveryExceptions(logId),
    ]);

    const consumedMap = getConsumedMap(rawExceptions);
    const baseItems = [];
    // Inside initLoad() loop:
    rawTransactions.forEach((tx) => {
      (tx.order_transaction_items || []).forEach((t) => {
        const uiItem = mapToUiItem(t);
        const consumed = consumedMap.get(t.id) || { qty: 0, pcs: 0 };

        if (uiItem.unit === "sqft") {
          // SQFT Rule: Size (Qty) stays the same, only Pieces are deducted
          uiItem.availableQty = uiItem.originalQty;
          uiItem.availablePcs = Math.max(0, uiItem.originalPcs - consumed.pcs);
        } else {
          // PC/KG Rule: Both Quantity and Pieces are deducted
          uiItem.availableQty = Math.max(0, uiItem.originalQty - consumed.qty);
          uiItem.availablePcs = Math.max(0, uiItem.originalPcs - consumed.pcs);
        }

        baseItems.push(uiItem);
      });
    });

    items.value = baseItems;
  } catch (e) {
    error.value = "Failed to load details.";
  } finally {
    loading.value = false;
  }
}

function onQtyChange(ex) {
  let numericVal = parseFloat(ex.exceptionQty) || 0;

  if (numericVal > ex.availableQty) {
    // Show error message
    ex.showError = true;

    // Snap to max
    numericVal = ex.availableQty;
    ex.exceptionQty = ex.unit === "kg" ? numericVal.toFixed(2) : numericVal;

    // Hide error message after 3 seconds
    setTimeout(() => {
      ex.showError = false;
    }, 3000);
  } else {
    ex.showError = false;
  }

  if (ex.unit === "pc") {
    ex.exceptionPieces = Math.floor(numericVal * ex.multiplier);
  }
}

function onPiecesChange(ex) {
  let val = Number(ex.exceptionPieces) || 0;

  if (val > ex.availablePcs) {
    ex.showError = true;
    ex.exceptionPieces = ex.availablePcs;
    setTimeout(() => {
      ex.showError = false;
    }, 3000);
  } else {
    ex.showError = false;
  }

  if (ex.unit === "sqft") {
    ex.exceptionQty = ex.availableQty;
  }
}

// Ensure 2 decimals when the user finishes typing
function formatToTwoDecimals(ex) {
  if (ex.unit === "kg") {
    const val = parseFloat(ex.exceptionQty) || 0;
    ex.exceptionQty = val.toFixed(2);
  }
}
async function save() {
  const selected = items.value.filter(
    (i) => i.selected && (i.exceptionQty > 0 || i.exceptionPieces > 0)
  );
  if (!selected.length) {
    Notify.create({
      type: "warning",
      message: "Please select items and enter quantities.",
    });
    return;
  }

  const payload = {
    logistics_id: form.value.logistics_id,
    delivery_date: form.value.delivery_date,
    delivery_time: form.value.delivery_time,
    driver_id: form.value.driver_id,
    remarks: form.value.remarks,
    items: selected.map((i) => ({
      order_transaction_item_id: i.item_id,
      quantity: i.exceptionQty,
      pieces: i.exceptionPieces,
    })),
  };

  try {
    loading.value = true;
    await transactionStore.createDeliveryException(payload);
    Notify.create({
      type: "positive",
      message: "Exception created successfully.",
    });
    emit("saved");
    close();
  } catch (e) {
    Notify.create({ type: "negative", message: "Failed to save." });
  } finally {
    loading.value = false;
  }
}

function close() {
  innerShow.value = false;
  emit("update:modelValue", false);
}

// For KG Weight / SQFT Size (Allows one decimal point)
function allowOnlyNumberDot(evt, currentValue) {
  const charCode = evt.which ? evt.which : evt.keyCode;
  const char = String.fromCharCode(charCode);

  // Allow digits
  if (/[0-9]/.test(char)) return true;

  // Allow decimal point only if it doesn't already exist
  if (char === "." && !String(currentValue || "").includes(".")) return true;

  evt.preventDefault();
  return false;
}

// For Pieces / PC Qty (Strictly no decimals)
function allowOnlyInteger(evt) {
  const charCode = evt.which ? evt.which : evt.keyCode;
  if (charCode < 48 || charCode > 57) {
    evt.preventDefault();
    return false;
  }
  return true;
}

function onPasteNumberOnly(evt) {
  const clipboardData = evt.clipboardData || window.clipboardData;
  const pastedData = clipboardData.getData("Text");
  if (!/^[0-9]*\.?[0-9]*$/.test(pastedData)) {
    evt.preventDefault();
  }
}

watch(
  () => props.modelValue,
  async (v) => {
    innerShow.value = v;
    if (v) await initLoad();
  }
);
</script>
<style scoped>
.bordered {
  padding: 3px;
}
.text-body2,
.text-caption {
  line-height: 1.25;
}
.disable-row {
  background-color: rgb(202, 201, 198) !important;
  color: rgb(122, 122, 122) !important;
}
</style>
