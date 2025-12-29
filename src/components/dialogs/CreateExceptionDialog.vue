<!-- FILE: src/components/dialogs/CreateExceptionDialog.vue -->
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
                class="row row-col-row order-row"
              >
                <div class="col bordered">
                  <div class="text-body2">{{ ex.item_name }}</div>
                  <div class="text-caption text-grey">
                    {{ ex.processLabel }} • PC
                  </div>
                </div>

                <div class="col-3 bordered text-center">
                  <template v-if="ex.isSet">
                    <div class="text-weight-bold">
                      {{ ex.availableSets }}
                      {{ ex.availableSets === 1 ? "set" : "sets" }}
                    </div>
                    <div class="text-caption">
                      {{ ex.piecesPerSet }} pcs/set •
                      {{ ex.availablePieces }} pcs total
                    </div>
                  </template>
                  <template v-else>
                    <div class="text-weight-bold">
                      {{ ex.availablePieces }} pcs
                    </div>
                  </template>
                </div>

                <div class="col-2 bordered">
                  <q-input
                    v-model.number="ex.exceptionQty"
                    type="number"
                    dense
                    outlined
                    :min="0"
                    :max="ex.maxQty"
                    :step="1"
                    :suffix="ex.isSet ? 'set' : 'pcs'"
                    @update:model-value="onQtyChange(ex)"
                    @blur="normalizeQty(ex)"
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
                  <q-separator class="q-mt-sm" />
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
                class="row row-col-row order-row"
              >
                <div class="col bordered">
                  <div class="text-body2">{{ ex.item_name }}</div>
                  <div class="text-caption text-grey">
                    {{ ex.processLabel }} • KG
                  </div>
                </div>

              <div class="col-3 bordered text-center">
  <div class="text-weight-bold">{{ ex.availablePieces }} pcs</div>
  <div class="text-caption">
    Remaining weight: {{ displayNumber(ex.remainingQty ?? ex.originalQty) }} kg
  </div>
</div>

                <div class="col-3 bordered" style="padding: 0">
                  <div class="row">
                    <div class="col bordered">
                      <q-input
                        v-model.number="ex.exceptionPieces"
                        type="number"
                        dense
                        outlined
                        :min="0"
                        :max="ex.availablePieces"
                        :step="1"
                        suffix="pcs"
                        @update:model-value="onPiecesChange(ex)"
                        @blur="normalizePieces(ex)"
                      />
                    </div>
                    <div class="col bordered">
                      <q-input
                        v-model.number="ex.exceptionQty"
                        type="text"
                        dense
                        outlined
                        :min="0"
                        :max="ex.maxQty"
                        :step="0.01"
                        suffix="kg"
                        @update:model-value="onQtyChange(ex)"
                        @blur="normalizeQty(ex)"
                      />
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
                class="row row-col-row order-row"
              >
                <div class="col bordered">
                  <div class="text-body2">{{ ex.item_name }}</div>
                  <div class="text-caption text-grey">
                    {{ ex.processLabel }} • SQFT
                  </div>
                </div>

                <div class="col-3 bordered text-center">
                  <div class="text-weight-bold">
                    {{ ex.availablePieces }} pcs
                  </div>
                  <div class="text-caption">
                    Size per item: {{ displayNumber(ex.originalQty) }} sqft
                  </div>
                </div>

                <div class="col-2 bordered">
                  <q-input
                    v-model.number="ex.exceptionPieces"
                    type="number"
                    dense
                    outlined
                    :min="0"
                    :max="ex.availablePieces"
                    :step="1"
                    suffix="pcs"
                    @update:model-value="onPiecesChange(ex)"
                    @blur="normalizePieces(ex)"
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
import { ref, watch, nextTick, computed } from "vue";
import { Notify } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  deliveryId: { type: [Number, String], required: true },
});
const emit = defineEmits(["update:modelValue", "saved"]);
const transactionStore = useTransactionStore();

const innerShow = ref(false);
watch(
  () => props.modelValue,
  async (v) => {
    innerShow.value = v;
    if (v) {
      await nextTick();
      await initLoad();
    }
  },
  { immediate: true }
);
watch(innerShow, (v) => emit("update:modelValue", v));

/* state */
const loading = ref(false);
const error = ref("");
const driverOptions = ref([]);
const timeOptions = ref([]);
const form = ref({
  delivery_date: null,
  delivery_time: null,
  driver_id: null,
  remarks: "",
  logistics_id: null,
  order_id: null,
});
const items = ref([]);

/* derived tables */
const pcItems = computed(() => items.value.filter((i) => i.unit === "pc"));
const kgItems = computed(() => items.value.filter((i) => i.unit === "kg"));
const sqftItems = computed(() => items.value.filter((i) => i.unit === "sqft"));

/* init */
async function initLoad() {
  loading.value = true;
  error.value = "";
  items.value = [];
  try {
    await transactionStore.loadDrivers();
    await transactionStore.loadTimeOptions();
    driverOptions.value = transactionStore.driverOptions || [];
    timeOptions.value = transactionStore.timeOptions || [];

    const deliveryRow = await safeFetchDeliveryById(props.deliveryId);
    if (!deliveryRow) throw new Error("Delivery not found.");

    const logisticsId =
      deliveryRow.logistics_id ?? deliveryRow.logisticsId ?? null;
    const orderId =
      deliveryRow?.logistics?.order_id ??
      deliveryRow?.logistics?.orderId ??
      null;

    form.value.logistics_id = logisticsId;
    form.value.order_id = orderId;
    form.value.delivery_date = toIsoDateOnly(
      deliveryRow.delivery_date || new Date()
    );
    form.value.delivery_time = deliveryRow.delivery_time || null;
    form.value.driver_id = deliveryRow.driver_id || null;
    form.value.remarks = `DELIVERY EXCEPTION for Order #${
      deliveryRow?.logistics?.orders?.order_no || ""
    }`;

    if (!form.value.order_id)
      throw new Error(
        "Missing order_id. Ensure fetchDeliveryById selects logistics(order_id)."
      );

    // 1) base items
    const txRaw = await safeFetchTransactionsByOrderId(form.value.order_id);
    const txItems = flattenTxItems(txRaw);
    const baseItems = txItems.map(toUiItem);

    // 2) existing exceptions -> aggregate per item
    const excRows = await safeFetchExceptionsByLogisticsId(
      form.value.logistics_id
    );
    const excMap = aggregateExceptions(excRows);

    // 3) reduce availability by existing exceptions
    items.value = baseItems.map((i) => applyExceptionReductions(i, excMap));
  } catch (e) {
    console.error("[CreateExceptionDialog.initLoad]", e);
    error.value = e?.message || "Failed to load delivery details.";
  } finally {
    loading.value = false;
  }
}

/* --- exceptions helpers --- */
function aggregateExceptions(rows) {
  const map = new Map();
  if (!Array.isArray(rows)) return map;
  for (const r of rows) {
    const key = r.order_transaction_item_id ?? r.order_transaction_item?.id;
    if (!key) continue;
    const q = Number(r.quantity) || 0;
    const p = Number(r.pieces) || 0;
    const prior = map.get(key) || { qty: 0, pcs: 0 };
    prior.qty += q;
    prior.pcs += p;
    map.set(key, prior);
  }
  return map;
}

function applyExceptionReductions(ex, excMap) {
  const prior = excMap.get(ex.item_id) || { qty: 0, pcs: 0 };
  const clone = { ...ex };

  if (clone.unit === "pc") {
    if (clone.isSet) {
      const remainingSets = Math.max(
        0,
        Math.floor(clone.originalQty - prior.qty)
      );
      clone.availableSets = remainingSets;
      clone.availablePieces = remainingSets * clone.piecesPerSet;
      clone.maxQty = remainingSets;
      // default exception to remaining (or 0)
      clone.exceptionQty = Math.min(clone.exceptionQty, remainingSets);
    } else {
      const remainingPcs = Math.max(
        0,
        Math.floor(clone.originalQty - prior.qty)
      );
      clone.availablePieces = remainingPcs;
      clone.maxQty = remainingPcs;
      clone.exceptionQty = Math.min(clone.exceptionQty, remainingPcs);
    }
  } else if (clone.unit === "kg") {
    const remainingPcs = Math.max(
      0,
      Math.floor((clone.availablePieces ?? 0) - prior.pcs)
    );
    const remainingWeight = Math.max(0, (clone.originalQty ?? 0) - prior.qty);

    clone.availablePieces = remainingPcs;
    clone.remainingQty = remainingWeight; // <-- add this
    clone.maxQty = remainingWeight; // cap weight to remaining

    // clamp current inputs to remaining
    clone.exceptionPieces = Math.min(clone.exceptionPieces ?? 0, remainingPcs);
    clone.exceptionQty = Math.min(clone.exceptionQty ?? 0, remainingWeight);
  } else if (clone.unit === "sqft") {
    const remainingPcs = Math.max(
      0,
      Math.floor((clone.availablePieces ?? 0) - prior.pcs)
    );
    clone.availablePieces = remainingPcs;
    // qty/size remains informational; input is only pieces
    clone.exceptionPieces = Math.min(clone.exceptionPieces ?? 0, remainingPcs);
  }

  return clone;
}

/* flatten */
function flattenTxItems(raw) {
  if (!Array.isArray(raw)) return [];
  if (raw.length && raw[0]?.item_name !== undefined) return raw;
  const out = [];
  for (const tx of raw)
    (tx?.order_transaction_items || []).forEach((it) => out.push(it));
  return out;
}

/* store helpers */
async function safeFetchDeliveryById(id) {
  if (typeof transactionStore.fetchDeliveryById === "function") {
    const row = await transactionStore.fetchDeliveryById(id);
    return Array.isArray(row) ? row[0] : row;
  }
  throw new Error("Store is missing fetchDeliveryById(deliveryId).");
}
async function safeFetchTransactionsByOrderId(orderId) {
  if (!orderId) return [];
  if (typeof transactionStore.fetchTransactionsByOrderId === "function") {
    return await transactionStore.fetchTransactionsByOrderId(orderId);
  }
  return [];
}
async function safeFetchExceptionsByLogisticsId(logisticsId) {
  if (!logisticsId) return [];
  // Expected store method name; adjust if yours differs
  if (
    typeof transactionStore.fetchDeliveryExceptionsByLogisticsId === "function"
  ) {
    return await transactionStore.fetchDeliveryExceptionsByLogisticsId(
      logisticsId
    );
  }
  // graceful fallback: no exceptions known
  return [];
}

/* item mapping (base) */
function toUiItem(t) {
  const unit = unitOf(t);
  const qty = num(t.quantity); // pc: sets/pcs; kg: weight; sqft: size (readonly)
  const perUnitPieces = Math.max(num(t.pieces) || 1, 1);
  const totalPieces = unit === "pc" ? perUnitPieces * qty : num(t.pieces);

  if (unit === "pc") {
    const isSet = perUnitPieces > 1;
    return {
      item_id: t.id,
      item_name: t.item_name,
      process: t.process,
      processLabel: niceProcess(t.process),
      unit,
      isSet,
      piecesPerSet: perUnitPieces,
      availableSets: qty,
      availablePieces: totalPieces,
      exceptionQty: 0, // will be clamped after reductions
      originalQty: qty,
      maxQty: isSet ? qty : totalPieces,
      selected: false,
    };
  }

  if (unit === "sqft") {
    return {
      item_id: t.id,
      item_name: t.item_name,
      process: t.process,
      processLabel: niceProcess(t.process),
      unit,
      isSet: false,
      piecesPerSet: 1,
      availableSets: 0,
      availablePieces: num(t.pieces),
      exceptionQty: qty, // informational only
      exceptionPieces: 0,
      originalQty: qty, // size info
      maxQty: qty,
      selected: false,
    };
  }
  // kg
  if (unit === "kg") {
    return {
      item_id: t.id,
      item_name: t.item_name,
      process: t.process,
      processLabel: niceProcess(t.process),
      unit,
      isSet: false,
      piecesPerSet: 1,
      availableSets: 0,
      availablePieces: num(t.pieces),
      exceptionQty: 0, // weight to enter
      exceptionPieces: 0, // pcs to enter
      originalQty: qty,
      remainingQty: qty, // <-- add this
      maxQty: qty,
      selected: false,
    };
  }
}

/* utils */
function unitOf(item) {
  const u = String(item.unit || "")
    .toLowerCase()
    .trim();
  if (u) return u;
  const s = String(item.item_name || "").toLowerCase();
  if (s.includes("sqft")) return "sqft";
  if (s.includes("kg")) return "kg";
  return "pc";
}
function niceProcess(p) {
  const s = String(p || "").toLowerCase();
  if (s === "laundry") return "Laundry";
  if (s === "dryclean") return "Dry Clean";
  if (s === "pressing") return "Pressing Only";
  if (s === "others") return "Others";
  return p || "-";
}
function toIsoDateOnly(v) {
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}
function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function displayNumber(v) {
  const n = num(v);
  return Number.isInteger(n) ? String(n) : n.toFixed(3);
}

/* sync & normalization (same as before, but now clamped to reduced availability) */
function onQtyChange(ex) {
  if (ex.unit === "pc") {
    const clamped = clampInt(ex.exceptionQty, 0, ex.maxQty);
    ex.exceptionQty = clamped;
    ex.exceptionPieces = ex.isSet ? clamped * ex.piecesPerSet : clamped;
  } else if (ex.unit === "kg") {
    ex.exceptionQty = clampFloat(ex.exceptionQty, 0, ex.maxQty);
  } else if (ex.unit === "sqft") {
    ex.exceptionQty = ex.originalQty; // fixed
  }
}
function onPiecesChange(ex) {
  if (ex.unit === "kg" || ex.unit === "sqft") {
    ex.exceptionPieces = clampInt(ex.exceptionPieces, 0, ex.availablePieces);
  }
}
function normalizeQty(ex) {
  onQtyChange(ex);
}
function normalizePieces(ex) {
  onPiecesChange(ex);
}
function clampInt(val, min, max) {
  const n = Number.isFinite(+val) ? Math.floor(+val) : 0;
  return Math.min(Math.max(n, min), max);
}
function clampFloat(val, min, max) {
  const n = Number.isFinite(+val) ? +val : 0;
  return Math.min(Math.max(n, min), max);
}
function totalPieces(ex) {
  if (ex.unit === "pc")
    return ex.isSet ? ex.exceptionQty * ex.piecesPerSet : ex.exceptionQty;
  return ex.exceptionPieces;
}

/* actions */
function close() {
  innerShow.value = false;
}

async function save() {
  try {
    if (!form.value.logistics_id) {
      Notify.create({ type: "negative", message: "Missing logistics id." });
      return;
    }
    if (!form.value.delivery_date) {
      Notify.create({ type: "warning", message: "Delivery date is required." });
      return;
    }

    const selected = items.value
      .filter((i) => i.selected)
      .map((i) => ({ ...i }));
    if (!selected.length) {
      Notify.create({ type: "warning", message: "Select at least one item." });
      return;
    }

    const payloads = [];
    for (const it of selected) {
      onQtyChange(it);
      onPiecesChange(it);

      const q = it.unit === "sqft" ? it.originalQty : it.exceptionQty; // sqft size fixed per your rule
      const p = totalPieces(it);
      if ((+q || 0) <= 0 && (+p || 0) <= 0) continue;

      payloads.push({
        logistics_id: form.value.logistics_id,
        order_transaction_item_id: it.item_id,
        delivery_date: form.value.delivery_date,
        delivery_time: form.value.delivery_time,
        driver_id: form.value.driver_id,
        quantity: q,
        pieces: p ?? 0,
        remarks: form.value.remarks || null,
      });
    }

    if (!payloads.length) {
      Notify.create({
        type: "warning",
        message: "Nothing to create. Check amounts.",
      });
      return;
    }

    await Promise.all(
      payloads.map((p) => transactionStore.createDeliveryException(p))
    );
    Notify.create({
      type: "positive",
      message: "Delivery exception(s) created.",
    });
    emit("saved");
    close();
  } catch (e) {
    console.error("[CreateExceptionDialog.save]", e);
    Notify.create({
      type: "negative",
      message: "Failed to create delivery exceptions.",
    });
  }
}
</script>
