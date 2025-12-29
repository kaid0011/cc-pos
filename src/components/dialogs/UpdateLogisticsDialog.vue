<!-- FILE: src/components/dialogs/UpdateLogisticsDialog.vue -->
<template>
  <q-dialog v-model="internalShow">
    <q-card style="min-width: 520px; max-width: 95vw">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Update Logistics
        </div>
        <q-btn
          icon="close" flat dense round
          class="absolute-top-right q-ma-sm"
          @click="internalShow = false"
        />
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <!-- Logistics Status (label/value) -->
        <q-select
          v-model="form.logistics_status"
          :options="statusOptionsFiltered"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          outlined dense
          label="Logistics Status"
          use-input
          fill-input
          hide-selected
          :disable="saving"
          @filter="filterStatus"
          clearable
        />

        <div class="row q-col-gutter-md">
          <!-- Job Type -->
          <div class="col-6">
            <q-select
              v-model="form.job_type"
              :options="jobOptions"
              option-label="label" option-value="value"
              emit-value map-options
              outlined dense
              label="Job Type"
              :disable="saving"
              clearable
            />
          </div>

          <!-- Urgency -->
          <div class="col-6">
            <q-select
              v-model="form.urgency"
              :options="urgencyOptions"
              option-label="label" option-value="value"
              emit-value map-options
              outlined dense
              label="Urgency"
              :disable="saving"
              clearable
            />
          </div>
        </div>
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
  logistics: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["update:show", "saved"]);
const transactionStore = useTransactionStore();

const internalShow = ref(false);
const saving = ref(false);
const form = ref({
  logistics_status: null, // stores value (lowercase)
  job_type: null,
  urgency: null,
});

/* --- Status option sets --- */
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

/* Build {label, value} options and expose filtered copy for typeahead */
const statusOptions = computed(() => {
  const all = Array.from(new Set([...COLLECTION_STATUSES, ...DELIVERY_STATUSES])).sort();
  return all.map((v) => ({ label: toTitle(v), value: v })); // label = Title Case; value = canonical lowercase
});
const statusOptionsFiltered = ref(statusOptions.value);
watch(statusOptions, (v) => (statusOptionsFiltered.value = v));

function filterStatus(val, update) {
  const s = (val || "").toLowerCase().trim();
  if (!s) return update(() => (statusOptionsFiltered.value = statusOptions.value));
  update(() => {
    statusOptionsFiltered.value = statusOptions.value.filter((o) =>
      o.label.toLowerCase().includes(s)
    );
  });
}

/* --- Job Type dropdown --- */
const jobOptions = [
  { label: "Laundry", value: "laundry" },
  { label: "R&I", value: "ri" },
  { label: "R&I Quotation", value: "ri_quotation" },
  { label: "Onsite Carpet Cleaning", value: "onsite_carpet_cleaning" },
  { label: "Onsite Quotation", value: "onsite_quotation" },
  { label: "Onsite Sofa Cleaning", value: "onsite_sofa_cleaning" },
  { label: "Others", value: "others" },
];

/* --- Urgency dropdown --- */
const urgencyOptions = [
  { label: "Default", value: "default" },
  { label: "Urgent", value: "urgent" },
  { label: "Express", value: "express" },
];

watch(
  () => props.show,
  (v) => {
    internalShow.value = v;
    if (v) hydrateForm();
  },
  { immediate: true }
);

watch(internalShow, (v) => emit("update:show", v));

function hydrateForm() {
  form.value = {
    logistics_status: toLowerOrNull(props.logistics?.logistics_status),
    job_type: props.logistics?.job_type ?? null,
    urgency: props.logistics?.urgency ?? null,
  };
}

function toLowerOrNull(v) {
  const s = (v ?? "").toString().trim();
  return s ? s.toLowerCase() : null;
}

function toTitle(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const currentSnapshot = computed(() =>
  JSON.stringify({
    logistics_status: toLowerOrNull(props.logistics?.logistics_status),
    job_type: props.logistics?.job_type ?? null,
    urgency: props.logistics?.urgency ?? null,
  })
);
const nextSnapshot = computed(() => JSON.stringify(form.value));
const disableSave = computed(() => nextSnapshot.value === currentSnapshot.value);

async function save() {
  const logisticsId =
    props.logistics?.logistics_id ?? props.logistics?.id ?? null;
  if (!logisticsId) return;

  const payload = {
    logistics_status: toLowerOrNull(form.value.logistics_status) || null, // store canonical value
    job_type: form.value.job_type ?? null,
    urgency: form.value.urgency ?? null,
  };

  try {
    saving.value = true;
    await transactionStore.updateLogistics(logisticsId, payload);
    emit("saved", { patch: payload });
    internalShow.value = false;
  } finally {
    saving.value = false;
  }
}
</script>
