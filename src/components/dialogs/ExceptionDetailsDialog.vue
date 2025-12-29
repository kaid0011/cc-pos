<template>
  <q-dialog v-model="model" persistent>
    <q-card style="min-width: 720px; max-width: 90vw">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Exception Details
        </div>
        <q-btn icon="close" flat dense round class="absolute-top-right q-ma-sm" @click="close" />
      </q-card-section>

      <q-card-section>
        <div v-if="groupRemarks" class="text-subtitle1 text-weight-bold text-blue-9 bg-blue-1 q-mb-md text-center q-pa-sm">
          {{ groupRemarks }}
        </div>

        <q-card flat bordered class="rounded-borders q-pa-sm q-mb-md">
          <div class="row items-center no-wrap q-mb-xs">
            <q-icon name="event" size="16px" class="q-mr-sm text-blue-9" />
            <span class="text-weight-bold q-mr-xs">Delivery Date:</span>
            <span>{{ formatDateLine(group?.date) || "[No date]" }}</span>
          </div>
          <div class="row items-center no-wrap q-mb-xs">
            <q-icon name="schedule" size="16px" class="q-mr-sm text-blue-9" />
            <span class="text-weight-bold q-mr-xs">Delivery Time:</span>
            <span>{{ group?.time || "[No time]" }}</span>
          </div>
          <div class="row items-center no-wrap">
            <q-icon name="person" size="16px" class="q-mr-sm text-blue-9" />
            <span class="text-weight-bold q-mr-xs">Delivery Driver:</span>
            <span>{{ group?.driverName || "[No driver]" }}</span>
          </div>
        </q-card>

        <!-- PC -->
        <div v-if="pcRows.length" class="q-mb-md">
          <div class="text-subtitle1 text-weight-bold q-mb-xs text-uppercase">Pieces</div>
          <div class="transaction-summary">
            <div class="row row-col-header order-header text-center">
              <div class="col-4 text-weight-bold bordered">Item</div>
              <div class="col-2 text-weight-bold bordered">Process</div>
              <div class="col text-weight-bold bordered">Price</div>
              <div class="col text-weight-bold bordered">Pieces</div>
              <div class="col text-weight-bold bordered">Qty</div>
              <div class="col text-weight-bold bordered">Subtotal</div>
            </div>
            <div v-for="it in pcRows" :key="`pc-${it.id}`" class="row row-col-row order-row">
              <div class="col-4 bordered">{{ it.name }}</div>
              <div class="col-2 bordered text-center">{{ processLabelForTxId(it.id) }}</div>
              <div class="col bordered text-center">{{ priceDisplayForTxId(it.id) }}</div>
              <div class="col bordered text-center">
                {{ piecesForTxId(it.id) }} <span class="unit-dim">pcs</span>
              </div>
              <div class="col bordered text-center">
                {{ formatNumber(it.qty) }} {{ rowQtySuffix(it) }}
              </div>
              <div class="col bordered flex items-center justify-center pos-rel">
                <span>${{ formatMoney(excSubtotalForItem(it)) }}</span>
                <q-icon name="help_outline" size="14px" class="calc-help" tabindex="0">
                  <q-tooltip anchor="bottom right" self="top right" max-width="260px">
                    {{ excSubtotalBreakdown(it) }}
                  </q-tooltip>
                </q-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- KG -->
        <div v-if="kgRows.length" class="q-mb-md">
          <div class="text-subtitle1 text-weight-bold q-mb-xs text-uppercase">Weight</div>
          <div class="transaction-summary">
            <div class="row row-col-header order-header text-center">
              <div class="col-4 text-weight-bold bordered">Item</div>
              <div class="col-2 text-weight-bold bordered">Process</div>
              <div class="col text-weight-bold bordered">Price</div>
              <div class="col text-weight-bold bordered">Pieces</div>
              <div class="col text-weight-bold bordered">Weight</div>
              <div class="col text-weight-bold bordered">Subtotal</div>
            </div>
            <div v-for="it in kgRows" :key="`kg-${it.id}`" class="row row-col-row order-row">
              <div class="col-4 bordered">{{ it.name }}</div>
              <div class="col-2 bordered text-center">{{ processLabelForTxId(it.id) }}</div>
              <div class="col bordered text-center">{{ priceDisplayForTxId(it.id) }}</div>
              <div class="col bordered text-center">
                {{ piecesForTxId(it.id) }} <span class="unit-dim">pcs</span>
              </div>
              <div class="col bordered text-center">
                {{ formatNumber(it.qty) }} kg
              </div>
              <div class="col bordered flex items-center justify-center pos-rel">
                <span>${{ formatMoney(excSubtotalForItem(it)) }}</span>
                <q-icon name="help_outline" size="14px" class="calc-help" tabindex="0">
                  <q-tooltip anchor="bottom right" self="top right" max-width="260px">
                    {{ excSubtotalBreakdown(it) }}
                  </q-tooltip>
                </q-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- SQFT -->
        <div v-if="sqftRows.length" class="q-mb-md">
          <div class="text-subtitle1 text-weight-bold q-mb-xs text-uppercase">Size</div>
          <div class="transaction-summary">
            <div class="row row-col-header order-header text-center">
              <div class="col-4 text-weight-bold bordered">Item</div>
              <div class="col-2 text-weight-bold bordered">Process</div>
              <div class="col text-weight-bold bordered">Price</div>
              <div class="col text-weight-bold bordered">Pieces</div>
              <div class="col text-weight-bold bordered">Size</div>
              <div class="col text-weight-bold bordered">Subtotal</div>
            </div>
            <div v-for="it in sqftRows" :key="`sqft-${it.id}`" class="row row-col-row order-row">
              <div class="col-4 bordered">{{ it.name }}</div>
              <div class="col-2 bordered text-center">{{ processLabelForTxId(it.id) }}</div>
              <div class="col bordered text-center">{{ priceDisplayForTxId(it.id) }}</div>
              <div class="col bordered text-center">
                {{ piecesForTxId(it.id) }} <span class="unit-dim">pcs</span>
              </div>
              <div class="col bordered text-center">
                {{ formatNumber(it.qty) }} sqft
              </div>
              <div class="col bordered flex items-center justify-center pos-rel">
                <span>${{ formatMoney(excSubtotalForItem(it)) }}</span>
                <q-icon name="help_outline" size="14px" class="calc-help" tabindex="0">
                  <q-tooltip anchor="bottom right" self="top right" max-width="260px">
                    {{ excSubtotalBreakdown(it) }}
                  </q-tooltip>
                </q-icon>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!pcRows.length && !kgRows.length && !sqftRows.length" class="text-center text-grey q-my-md">
          No items in this exception.
        </div>

        <div class="text-right q-mt-sm text-weight-bold">
          Total Exception Amount: ${{ formatMoney(totalExceptionAmount) }}
        </div>
      </q-card-section>

      <q-card-actions align="between">
        <q-btn outline color="red" icon="undo" class="q-ml-sm" label="Mark as Undelivered" @click="markUndelivered" />
        <div class="flex">
          <q-input
            v-model="deliveredDateLocal"
            type="date"
            dense
            outlined
            clearable
            class="dialog-inputs q-mr-sm"
            style="max-width: 220px"
            @clear="deliveredDateLocal = null"
          >
            <template v-slot:prepend>
              <q-icon name="event_available" />
            </template>
          </q-input>
          <q-btn unelevated color="positive" icon="done_all" label="Mark as Delivered" @click="markDelivered" />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";

const $q = useQuasar();
const transactionStore = useTransactionStore();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  logisticsId: { type: [Number, String], required: true }, // which logistics to load exceptions for
  group: { type: Object, required: true }, // { date, time, driverId, driverName, items?, remarks? }
  transactions: { type: Array, default: () => [] }, // to read unit/price/pieces/process
  prefilledDeliveredDate: { type: String, default: null }, // if you want to prefill
});

const emit = defineEmits(["update:modelValue", "updated", "close"]);

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const deliveredDateLocal = ref(props.prefilledDeliveredDate);
watch(() => props.prefilledDeliveredDate, v => deliveredDateLocal.value = v);

const deliveryExceptions = ref([]); // raw exceptions for logisticsId

async function loadExceptions() {
  try {
    const rows = await transactionStore.fetchDeliveryExceptionsByLogisticsId(props.logisticsId);
    deliveryExceptions.value = Array.isArray(rows) ? rows : [];
  } catch (e) {
    console.error("[ExceptionDetailsDialog] loadExceptions failed", e);
    deliveryExceptions.value = [];
  }
}

onMounted(loadExceptions);
watch(() => props.logisticsId, loadExceptions);

// ---- helpers copied from your parent (trimmed) ----
function formatMoney(v) { const n = parseFloat(v); return isNaN(n) ? "0.00" : n.toFixed(2); }
function formatDateLine(dateStr) {
  if (!dateStr) return "[No date]";
  const d = new Date(dateStr); if (isNaN(d.getTime())) return "[Invalid date]";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
}
const getUnitForItem = (item) => {
  const u = (item.unit || "").toLowerCase().trim();
  if (u) return u;
  const s = (item.item_name || "").toLowerCase();
  if (s.includes("sqft")) return "sqft";
  if (s.includes("kg")) return "kg";
  return "pc";
};
const txById = (id) => (props.transactions || []).find(t => String(t.id) === String(id)) || null;
function perUnitPieces(item) { const n = Number(item.pieces_per_unit ?? item.pieces ?? 0); return Number.isFinite(n) ? n : 0; }
const computedPcs = (tx) => { const pcs = parseFloat(tx?.pieces); return isNaN(pcs) ? 0 : pcs; };
function priceUnitLabel(item) { const u = getUnitForItem(item); return u === "pc" && perUnitPieces(item) > 1 ? "set" : (u === "pc" ? "pcs" : u); }
function unitLabel(u) { return u === "pc" ? "pcs" : u; }
function processLabelForTxId(id) {
  const tx = txById(id); if (!tx) return "-";
  const p = (tx.process || "").toLowerCase();
  if (p === "laundry") return "Laundry";
  if (p === "dryclean") return "Dry Clean";
  if (p === "pressing") return "Pressing Only";
  if (p === "others") return "Others";
  return tx.process || "-";
}
function priceDisplayForTxId(id) {
  const tx = txById(id);
  if (!tx) return "$0.00";
  const isTBA = tx.price == null || (typeof tx.price === "string" && tx.price.toUpperCase() === "TBA");
  if (isTBA) return "TBA";
  const num = parseFloat(tx.price) || 0;
  return `$${num.toFixed(2)} / ${priceUnitLabel(tx)}`;
}
function piecesForTxId(id) { const tx = txById(id); return tx ? computedPcs(tx) : 0; }
function formatNumber(v) { const n = Number(v); if (!Number.isFinite(n)) return "0"; return Number.isInteger(n) ? String(n) : n.toFixed(2); }
function rowQtySuffix(excItem) {
  const tx = txById(excItem.id); if (!tx) return "";
  const u = getUnitForItem(tx); if (u === "pc") return perUnitPieces(tx) > 1 ? "set" : "pcs";
  return u;
}
function excSubtotalForItem(excItem) {
  const tx = txById(excItem.id); if (!tx) return 0;
  const unit = getUnitForItem(tx);
  const isTBA = tx.price == null || (typeof tx.price === "string" && tx.price.toUpperCase() === "TBA");
  const price = isTBA ? 0 : parseFloat(tx.price) || 0;
  const qty = Number(excItem.qty) || 0;
  const pcs = Math.max(Number(tx.pieces ?? 0) || 1, 1);
  const val = (unit === "sqft" || unit === "sqm") ? price * qty * pcs : price * qty;
  return +val.toFixed(2);
}
function excSubtotalBreakdown(excItem) {
  const tx = txById(excItem.id); if (!tx) return "Item not found.";
  const unit = getUnitForItem(tx);
  const priceNum = parseFloat(tx.price);
  const isTBA = tx.price == null || (typeof tx.price === "string" && tx.price.toUpperCase() === "TBA") || !Number.isFinite(priceNum);
  const qty = Number(excItem.qty) || 0;
  const pcs = Math.max(Number(tx.pieces ?? 0) || 1, 1);
  if (isTBA) return "Price is TBA → subtotal treated as $0.00";
  if (unit === "sqft" || unit === "sqm") {
    const subtotal = (priceNum * qty * pcs).toFixed(2);
    return `$${priceNum.toFixed(2)} / ${unit} × ${qty} ${unit}${pcs > 1 ? ` × ${pcs} pcs` : ""} = $${subtotal}`;
  }
  const priceUnit = priceUnitLabel(tx);
  const qtyUnit = unitLabel(unit);
  const subtotal = (priceNum * qty).toFixed(2);
  let line = `$${priceNum.toFixed(2)} / ${priceUnit} × ${qty} ${qtyUnit} = $${subtotal}`;
  if (unit === "pc" && perUnitPieces(tx) > 1) line += `\n(${perUnitPieces(tx)} pcs per set)`;
  if ((unit === "kg" || unit === "lbs") && tx.pieces > 0) line += `\nNote: Pieces are recorded for reference and do not change the price.`;
  return line;
}
function toDateOnly(v) {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0,10);
  const iso = new Date(v); if (!isNaN(iso.getTime())) return iso.toISOString().slice(0,10);
  const s = String(v).slice(0,10); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}
function rowsForGroup(group) {
  const rows = deliveryExceptions.value || [];
  const day = group?.date ? new Date(group.date).toISOString().slice(0,10) : null;
  const time = (group?.time || "").toString();
  const driverId = group?.driverId ?? group?.driver_id ?? null;
  return rows.filter(r => {
    const rDate = r.delivery_date ? new Date(r.delivery_date).toISOString().slice(0,10) : null;
    const rTime = (r.delivery_time || "").toString();
    const rDriverId = r.driver_id ?? null;
    return rDate === day && rTime === time && String(rDriverId ?? "") === String(driverId ?? "");
  });
}
// remarks if any row has it
const groupRemarks = computed(() => {
  const rows = rowsForGroup(props.group);
  return rows.find(r => r.remarks)?.remarks || null;
});

// slice the group’s items by unit
const pcRows = computed(() => {
  const rows = props.group?.items || [];
  return rows.filter(it => { const tx = txById(it.id); return tx && getUnitForItem(tx) === "pc"; });
});
const kgRows = computed(() => {
  const rows = props.group?.items || [];
  return rows.filter(it => { const tx = txById(it.id); return tx && getUnitForItem(tx) === "kg"; });
});
const sqftRows = computed(() => {
  const rows = props.group?.items || [];
  return rows.filter(it => { const tx = txById(it.id); return tx && getUnitForItem(tx) === "sqft"; });
});

const totalExceptionAmount = computed(() =>
  (props.group?.items || []).reduce((sum, r) => sum + (excSubtotalForItem(r) || 0), 0)
);

// ---- actions live here (dialog owns side-effects) ----
async function markDelivered() {
  try {
    if (!props.group) {
      $q.notify({ type: "negative", message: "No exception group selected." });
      return;
    }
    const rows = rowsForGroup(props.group);
    if (!rows.length) {
      $q.notify({ type: "warning", message: "No exception rows found for the selected group." });
      return;
    }
    const ids = rows.map(r => r.id).filter(id => id != null);
    if (!ids.length) {
      $q.notify({ type: "warning", message: "No valid exception IDs found to update." });
      return;
    }
    await transactionStore.markDeliveryExceptionsDelivered(ids, toDateOnly(deliveredDateLocal.value));
    await loadExceptions();
    $q.notify({ type: "positive", message: "Exception group marked as delivered." });
    emit("updated");       // let parent recompute logistics status, etc.
    close();
  } catch (err) {
    console.error("[markDelivered] error", err);
    $q.notify({ type: "negative", message: "Failed to mark exception group as delivered." });
  }
}

async function markUndelivered() {
  try {
    if (!props.group) {
      $q.notify({ type: "negative", message: "No exception group selected." });
      return;
    }
    const rows = rowsForGroup(props.group);
    if (!rows.length) {
      $q.notify({ type: "warning", message: "No exception rows found for the selected group." });
      return;
    }
    const ids = rows.map(r => r.id).filter(id => id != null);
    if (!ids.length) {
      $q.notify({ type: "warning", message: "No valid exception IDs found to update." });
      return;
    }
    await transactionStore.clearDeliveryExceptionsDelivered(ids);
    await loadExceptions();
    $q.notify({ type: "positive", message: "Exception group marked as undelivered." });
    emit("updated");
    close();
  } catch (err) {
    console.error("[markUndelivered] error", err);
    $q.notify({ type: "negative", message: "Failed to mark exception group as undelivered." });
  }
}

function close() {
  emit("update:modelValue", false);
  emit("close");
}
</script>

<style scoped>
.pos-rel { position: relative; }
.calc-help { position: absolute; right: 4px; bottom: 4px; opacity: .7; cursor: help; }
.calc-help:hover, .calc-help:focus { opacity: 1; }
.unit-dim { opacity: .7; }
</style>
