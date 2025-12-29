<template>
  <q-dialog v-model="internalShow">
    <q-card style="min-width: 400px">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Update Goods Status
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
          v-model="goodsForm.status"
          :options="goodsStatusOptions"
          label="Select goods status"
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
  order: { type: Object, default: () => null },
});
const emit = defineEmits(["update:show", "saved"]);

const transactionStore = useTransactionStore();

const internalShow = ref(false);
const saving = ref(false);
const goodsForm = ref({ status: null });

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
    if (v) {
      goodsForm.value.status =
        props.order?.goods_status ||
        props.order?.order_production?.goods_status ||
        null;
    }
  },
  { immediate: true }
);

watch(internalShow, (v) => emit("update:show", v));

const currentStatus = computed(
  () =>
    props.order?.goods_status ||
    props.order?.order_production?.goods_status ||
    null
);

const disableSave = computed(
  () => !goodsForm.value.status || goodsForm.value.status === currentStatus.value
);

async function save() {
  if (!props.order?.order_production?.id) return;
  const productionId = props.order.order_production.id;
  const newStatus = (goodsForm.value.status || "").toString();
  if (!newStatus) return;

  try {
    saving.value = true;
    await transactionStore.updateProduction(productionId, {
      goods_status: newStatus,
    });

    // Build a patch for parent to apply immutably to its local order copy
    const patch = {
      goods_status: newStatus,
      order_production: {
        ...(props.order?.order_production || {}),
        goods_status: newStatus,
      },
    };

    emit("saved", {
      patch,
      orderNo: props.order?.order_no || props.order?.id || null,
    });

    internalShow.value = false;
  } finally {
    saving.value = false;
  }
}
</script>
