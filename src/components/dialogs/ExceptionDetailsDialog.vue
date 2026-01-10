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
              <div class="col-2 bordered text-center">{{ it.displayProcess }}</div>
              <div class="col bordered text-center">{{ it.displayPrice }}</div>
              <div class="col bordered text-center">
                {{ it.pieces }} <span class="unit-dim">pcs</span>
              </div>
              <div class="col bordered text-center">
                {{ formatNumber(it.qty) }} {{ it.unitLabel }}
              </div>
              <div class="col bordered flex items-center justify-center pos-rel">
                <span>${{ formatMoney(it.subtotal) }}</span>
                <q-icon name="help_outline" size="14px" class="calc-help" tabindex="0">
                  <q-tooltip anchor="bottom right" self="top right" max-width="260px">
                    {{ subtotalBreakdown(it) }}
                  </q-tooltip>
                </q-icon>
              </div>
            </div>
          </div>
        </div>

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
              <div class="col-2 bordered text-center">{{ it.displayProcess }}</div>
              <div class="col bordered text-center">{{ it.displayPrice }}</div>
              <div class="col bordered text-center">
                {{ it.pieces }} <span class="unit-dim">pcs</span>
              </div>
              <div class="col bordered text-center">
                {{ formatNumber(it.qty) }} kg
              </div>
              <div class="col bordered flex items-center justify-center pos-rel">
                <span>${{ formatMoney(it.subtotal) }}</span>
                <q-icon name="help_outline" size="14px" class="calc-help" tabindex="0">
                  <q-tooltip anchor="bottom right" self="top right" max-width="260px">
                    {{ subtotalBreakdown(it) }}
                  </q-tooltip>
                </q-icon>
              </div>
            </div>
          </div>
        </div>

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
              <div class="col-2 bordered text-center">{{ it.displayProcess }}</div>
              <div class="col bordered text-center">{{ it.displayPrice }}</div>
              <div class="col bordered text-center">
                {{ it.pieces }} <span class="unit-dim">pcs</span>
              </div>
              <div class="col bordered text-center">
                {{ formatNumber(it.qty) }} sqft
              </div>
              <div class="col bordered flex items-center justify-center pos-rel">
                <span>${{ formatMoney(it.subtotal) }}</span>
                <q-icon name="help_outline" size="14px" class="calc-help" tabindex="0">
                  <q-tooltip anchor="bottom right" self="top right" max-width="260px">
                    {{ subtotalBreakdown(it) }}
                  </q-tooltip>
                </q-icon>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!groupItems.length" class="text-center text-grey q-my-md">
          No items in this exception.
        </div>

        <div class="text-right q-mt-sm text-weight-bold">
          Total Exception Amount: ${{ formatMoney(totalExceptionAmount) }}
        </div>
      </q-card-section>

      <q-card-actions align="between">
        <q-btn 
          outline 
          color="red" 
          icon="undo" 
          class="q-ml-sm" 
          label="Mark as Undelivered" 
          @click="markUndelivered" 
        />
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
          <q-btn 
            unelevated 
            color="positive" 
            icon="done_all" 
            label="Mark as Delivered" 
            @click="markDelivered" 
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useQuasar, Notify } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  logisticsId: { type: [Number, String], required: true }, 
  group: { type: Object, required: true }, // { id, date, time, driverName, items: [...], remarks }
  transactions: { type: Array, default: () => [] }, 
  prefilledDeliveredDate: { type: String, default: null }, 
});

const emit = defineEmits(["update:modelValue", "updated", "close"]);

const $q = useQuasar();
const transactionStore = useTransactionStore();

/* --- State --- */
const model = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const deliveredDateLocal = ref(props.prefilledDeliveredDate);
watch(() => props.prefilledDeliveredDate, (v) => (deliveredDateLocal.value = v));

/* --- Data Mapping Logic --- */
const txById = (id) => (props.transactions || []).find(t => String(t.id) === String(id)) || null;

const formatProcessLabel = (process) => {
  if (!process) return "-";
  const map = {
    laundry: "Laundry",
    dryclean: "Dry Clean",
    pressing: "Pressing Only",
    others: "Others",
  };
  return map[process.toLowerCase()] || process;
};

/**
 * Enhanced Items Mapper
 * Consolodates data from logistics_delivery_exception_items 
 * and order_transaction_items
 */
const groupItems = computed(() => {
  const items = props.group?.items || [];
  
  return items.map((it) => {
    const tx = txById(it.id);
    const unit = it.unit || "pc";
    const priceNum = (tx?.price && String(tx.price).toUpperCase() !== 'TBA') ? parseFloat(tx.price) : 0;
    const isTBA = tx?.price && String(tx.price).toUpperCase() === 'TBA';

    // Calculate Subtotal based on specific item unit rules
    let subtotal = 0;
    if (!isTBA) {
      if (unit === 'sqft') {
        // Size * Pieces * Price
        subtotal = priceNum * (parseFloat(it.qty) || 0) * (parseFloat(it.pieces) || 0);
      } else {
        // Quantity (or weight) * Price
        subtotal = priceNum * (parseFloat(it.qty) || 0);
      }
    }

    return {
      ...it,
      displayProcess: formatProcessLabel(tx?.process),
      displayPrice: isTBA ? "TBA" : `$${priceNum.toFixed(2)}`,
      unitLabel: unit === "pc" ? (it.pieces > 1 ? "sets" : "pcs") : unit,
      subtotal: +subtotal.toFixed(2)
    };
  });
});

/* --- Filtered Rows for Tables --- */
const pcRows = computed(() => groupItems.value.filter(it => it.unit === "pc"));
const kgRows = computed(() => groupItems.value.filter(it => it.unit === "kg"));
const sqftRows = computed(() => groupItems.value.filter(it => it.unit === "sqft"));

const groupRemarks = computed(() => props.group?.remarks || null);

const totalExceptionAmount = computed(() =>
  groupItems.value.reduce((sum, r) => sum + r.subtotal, 0)
);

/* --- Formatting Utils --- */
const formatMoney = (v) => (isNaN(v) ? "0.00" : parseFloat(v).toFixed(2));
const formatNumber = (v) => {
  const n = Number(v);
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};
const formatDateLine = (dateStr) => {
  if (!dateStr) return "[No date]";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "[Invalid date]" : d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
};

const subtotalBreakdown = (it) => {
  const tx = txById(it.id);
  const price = (tx?.price && String(tx.price).toUpperCase() !== 'TBA') ? parseFloat(tx.price) : 0;
  if (it.unit === "sqft") {
    return `$${price.toFixed(2)} × ${it.qty} sqft × ${it.pieces} pcs = $${it.subtotal.toFixed(2)}`;
  }
  return `$${price.toFixed(2)} × ${it.qty} ${it.unitLabel} = $${it.subtotal.toFixed(2)}`;
};

/* --- Database Actions --- */
const toDateOnly = (v) => {
  if (!v) return null;
  const iso = new Date(v);
  return isNaN(iso.getTime()) ? null : iso.toISOString().slice(0, 10);
};

async function markDelivered() {
  try {
    if (!props.group?.id) return;
    await transactionStore.markDeliveryExceptionsDelivered(
      [props.group.id], 
      toDateOnly(deliveredDateLocal.value)
    );
    Notify.create({ type: "positive", message: "Status updated." });
    emit("updated");
    close();
  } catch (err) {
    console.error(err);
    Notify.create({ type: "negative", message: "Failed to update." });
  }
}

async function markUndelivered() {
  try {
    if (!props.group?.id) return;
    await transactionStore.clearDeliveryExceptionsDelivered([props.group.id]);
    Notify.create({ type: "positive", message: "Delivered date cleared." });
    emit("updated");
    close();
  } catch (err) {
    console.error(err);
    Notify.create({ type: "negative", message: "Failed to update." });
  }
}

function close() {
  model.value = false;
  emit("close");
}
</script>

<style scoped>
.pos-rel { position: relative; }
.calc-help { position: absolute; right: 4px; bottom: 4px; opacity: .7; cursor: help; }
.calc-help:hover, .calc-help:focus { opacity: 1; }
.unit-dim { opacity: .7; }
</style>