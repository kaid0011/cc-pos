<!-- FILE: src/components/dialogs/UpdateProductionDialog.vue -->
<template>
  <q-dialog v-model="internalShow">
    <q-card style="min-width: 480px; max-width: 95vw">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Update Production
        </div>
        <q-btn
          icon="close"
          flat dense round
          class="absolute-top-right q-ma-sm"
          @click="internalShow = false"
        />
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-select
          v-model="form.goods_status"
          :options="goodsStatusOptions"
          label="Goods status"
          outlined dense emit-value map-options
          option-label="label" option-value="value"
          :disable="saving"
        />

        <div class="row q-col-gutter-md">
          <div class="col-4">
            <q-input
              v-model.number="form.no_packets"
              type="number" outlined dense
              label="No. of Packets"
              :disable="saving"
              min="0"
            />
          </div>
          <div class="col-4">
            <q-input
              v-model.number="form.no_hangers"
              type="number" outlined dense
              label="No. of Hangers"
              :disable="saving"
              min="0"
            />
          </div>
          <div class="col-4">
            <q-input
              v-model.number="form.no_rolls"
              type="number" outlined dense
              label="No. of Rolls"
              :disable="saving"
              min="0"
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
  order: { type: Object, default: () => null },
});
const emit = defineEmits(["update:show", "saved"]);

const transactionStore = useTransactionStore();

const internalShow = ref(false);
const saving = ref(false);
const form = ref({
  goods_status: null,
  no_packets: null,
  no_hangers: null,
  no_rolls: null,
});

const goodsStatusOptions = [
  { label: "None", value: "none" },
  { label: "For Collection", value: "for collection" },
  { label: "Under Process", value: "under process" },
  { label: "Ready for Delivery", value: "ready for delivery" },
  { label: "Ongoing Issue/s", value: "ongoing issue/s" },
  { label: "Items Delivered", value: "Items Delivered" },
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
  const prod = props.order?.order_production || {};
  form.value = {
    goods_status: prod.goods_status || props.order?.goods_status || null,
    no_packets: toInt(prod.no_packets),
    no_hangers: toInt(prod.no_hangers),
    no_rolls: toInt(prod.no_rolls),
  };
}

function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const currentSnapshot = computed(() => {
  const prod = props.order?.order_production || {};
  return JSON.stringify({
    goods_status: prod.goods_status || props.order?.goods_status || null,
    no_packets: toInt(prod.no_packets),
    no_hangers: toInt(prod.no_hangers),
    no_rolls: toInt(prod.no_rolls),
  });
});

const nextSnapshot = computed(() => JSON.stringify(form.value));
const disableSave = computed(() => nextSnapshot.value === currentSnapshot.value);

async function save() {
  // prefer production id; fallback to order id
  const targetId = props.order?.order_production?.id ?? props.order?.id;
  if (!targetId) return;

  const payload = {
    goods_status: (form.value.goods_status || "none").toString(),
    no_packets: form.value.no_packets ?? 0,
    no_hangers: form.value.no_hangers ?? 0,
    no_rolls: form.value.no_rolls ?? 0,
  };

  try {
    saving.value = true;
    await transactionStore.updateProduction(targetId, payload);

    const patch = {
      goods_status: payload.goods_status,
      order_production: {
        ...(props.order?.order_production || {}),
        ...payload,
      },
    };

    emit("saved", { patch, orderNo: props.order?.order_no || null });
    internalShow.value = false;
  } finally {
    saving.value = false;
  }
}
</script>
