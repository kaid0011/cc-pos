<template>
  <q-dialog v-model="internalShow">
    <q-card style="min-width: 400px">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Update Logistics Status
        </div>
        <q-btn
          icon="close"
          flat dense round
          class="absolute-top-right q-ma-sm"
          @click="internalShow = false"
        />
      </q-card-section>

      <q-card-section>
        <q-select
          v-model="statusForm.status"
          :options="dialogStatusOptions"
          label="Select logistics status"
          outlined dense
          emit-value map-options
          option-label="label"
          option-value="value"
          clearable
          :disable="saving"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" :disable="saving" @click="internalShow = false" />
        <q-btn
          color="primary" label="Save"
          :loading="saving"
          :disable="disableSave"
          @click="save"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";

const props = defineProps({
  show: { type: Boolean, default: false },
  logistics: { type: Object, default: () => null },
});
const emit = defineEmits(["update:show", "saved"]);

const transactionStore = useTransactionStore();

const internalShow = ref(false);
const saving = ref(false);
const statusForm = ref({ status: null });

/* Local status sets (kept here so the dialog is self-contained) */
const COLLECTION_STATUSES = new Set([
  "collection arranged",
  "items with driver",
  "collection completed",
  "collection rescheduled",
  "collection cancelled",
  "ongoing collection issue/s",
]);
const DELIVERY_STATUSES = new Set([
  "processing items",
  "delivery arranged",
  "delivery partial",
  "delivery completed",
  "delivery postponed",
  "ongoing delivery issue/s",
]);

const baseOptions = computed(() => {
  const all = Array.from(new Set([...COLLECTION_STATUSES, ...DELIVERY_STATUSES]));
  all.sort();
  return all;
});

const toTitleCase = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/([A-Za-zÀ-ÖØ-öø-ÿ])([A-Za-zÀ-ÖØ-öø-ÿ]*)/g, (_, f, r) => f.toUpperCase() + r);

const dialogStatusOptions = computed(() => {
  const current = String(props.logistics?.logistics_status || "").trim().toLowerCase();
  const base = baseOptions.value.map((v) => ({ label: toTitleCase(v), value: v }));
  if (current && !base.some((o) => o.value === current)) {
    base.unshift({ label: toTitleCase(current), value: current });
  }
  return base;
});

watch(
  () => props.show,
  (v) => {
    internalShow.value = v;
    if (v) {
      statusForm.value.status = props.logistics?.logistics_status || null;
    }
  },
  { immediate: true }
);
watch(internalShow, (v) => emit("update:show", v));

const currentStatus = computed(() => props.logistics?.logistics_status || null);
const disableSave = computed(
  () => !statusForm.value.status || statusForm.value.status === currentStatus.value
);

async function save() {
  if (!props.logistics) return;
  const id = props.logistics.logistics_id || props.logistics.id;
  const newStatus = (statusForm.value.status || "").toString();
  if (!id || !newStatus) return;

  try {
    saving.value = true;
    await transactionStore.updateLogistics(id, { logistics_status: newStatus });
    emit("saved", { newStatus });
    internalShow.value = false;
  } finally {
    saving.value = false;
  }
}
</script>
