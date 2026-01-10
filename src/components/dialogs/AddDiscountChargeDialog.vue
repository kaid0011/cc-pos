<template>
  <q-dialog v-model="internalShow">
    <q-card style="min-width: 450px">
      <q-card-section class="row items-center">
        <div class="text-h6">Add Order Discount/Charge</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="submitAddDiscount">
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-xs">Type</div>
            <q-btn-toggle
              v-model="newDiscount.dc_type"
              spread
              no-caps
              unelevated
              toggle-color="primary"
              color="white"
              text-color="black"
              class="plain-border"
              :options="[
                { label: 'Discount', value: 'discount' },
                { label: 'Charge', value: 'charge' },
              ]"
            />
          </div>

          <q-input
            v-model="newDiscount.description"
            label="Description"
            outlined
            dense
            :rules="[(val) => !!val || 'Description is required']"
            class="q-mb-sm"
          />

          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-select
                v-model="newDiscount.value_type"
                :options="['percent', 'amount']"
                label="Method"
                outlined
                dense
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="newDiscount.value"
                type="number"
                :label="
                  newDiscount.value_type === 'percent'
                    ? 'Percentage (%)'
                    : 'Amount ($)'
                "
                outlined
                dense
                :rules="[(val) => val > 0 || 'Value must be positive']"
              />
            </div>
          </div>

          <div v-if="newDiscount.value_type === 'amount'" class="q-mb-md">
            <div class="q-mb-sm bg-grey-1 q-pa-sm rounded-borders">
              <q-checkbox
                v-model="applyPerItem"
                dense
                label="Apply this amount to EACH item"
                color="primary"
              />

              <div class="text-caption q-mt-xs q-pl-md text-grey-8">
                <span v-if="applyPerItem">
                  Result: ${{ (newDiscount.value || 0).toFixed(2) }} per item ×
                  {{ selectedDiscountItemIds.length }} items =
                  <span class="text-weight-bold text-primary"
                    >${{
                      (
                        (newDiscount.value || 0) *
                        selectedDiscountItemIds.length
                      ).toFixed(2)
                    }}
                    Total</span
                  >
                </span>
                <span v-else>
                  Result: ${{ (newDiscount.value || 0).toFixed(2) }} total split
                  across {{ selectedDiscountItemIds.length }} items (${{
                    selectedDiscountItemIds.length
                      ? (
                          (newDiscount.value || 0) /
                          selectedDiscountItemIds.length
                        ).toFixed(2)
                      : 0
                  }}
                  each).
                </span>
              </div>
            </div>

            <q-separator class="q-mb-sm" />

            <div class="text-subtitle2 q-mb-xs">
              Select Items:
              <span class="text-caption text-grey"
                >({{ selectedDiscountItemIds.length }} selected)</span
              >
            </div>

            <div
              class="bg-grey-1 rounded-borders q-pa-sm scroll"
              style="max-height: 200px; border: 1px solid #ddd"
            >
              <div
                v-if="transactions.length === 0"
                class="text-grey text-center q-pa-sm"
              >
                No items in transaction.
              </div>

              <q-option-group
                v-else
                v-model="selectedDiscountItemIds"
                :options="discountItemOptions"
                type="checkbox"
                dense
                color="primary"
              />
            </div>
          </div>

          <div v-else class="text-caption text-grey q-mb-md">
            Percentage will be applied to
            <b>all {{ transactions.length }} items</b> in the order.
          </div>

          <div class="row justify-end">
            <q-btn label="Cancel" flat color="grey" v-close-popup />
            <q-btn
              label="Apply"
              color="primary"
              type="submit"
              unelevated
              :loading="saving"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useQuasar } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";

const props = defineProps({
  show: { type: Boolean, default: false },
  orderId: { type: [Number, String], required: true },
  transactions: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:show", "saved"]);

const $q = useQuasar();
const transactionStore = useTransactionStore();

const internalShow = computed({
  get: () => props.show,
  set: (val) => emit("update:show", val),
});

// State
const saving = ref(false);
const newDiscount = ref({
  dc_type: "discount",
  value_type: "percent",
  description: "",
  value: 0,
});
const selectedDiscountItemIds = ref([]);
const applyPerItem = ref(false);

// Reset state when dialog opens
watch(
  () => props.show,
  (val) => {
    if (val) {
      resetForm();
    }
  }
);

function resetForm() {
  newDiscount.value = {
    dc_type: "discount",
    value_type: "percent", // Default
    description: "",
    value: 0,
  };
  applyPerItem.value = false;
  // Default: Select ALL items (IDs only)
  selectedDiscountItemIds.value = props.transactions
    .map((t) => t.id)
    .filter((id) => id != null);
}

// Compute options for checkbox group
const discountItemOptions = computed(() => {
  return props.transactions.map((t) => ({
    label: t.process ? `${t.item_name} (${t.process})` : t.item_name,
    value: t.id,
  }));
});

async function submitAddDiscount() {
  if (props.transactions.length === 0) {
    $q.notify({ type: "warning", message: "No items in order." });
    return;
  }

  // 1. Determine Target Item IDs
  let targetItemIds = [];

  if (newDiscount.value.value_type === "percent") {
    // Percent applies to ALL
    targetItemIds = props.transactions
      .map((t) => t.id)
      .filter((id) => id != null);
  } else {
    // Amount applies to selection
    if (selectedDiscountItemIds.value.length === 0) {
      $q.notify({
        type: "warning",
        message: "Please select at least one item.",
      });
      return;
    }
    targetItemIds = selectedDiscountItemIds.value;
  }

  try {
    saving.value = true;

    // 2. Add Discount Rows (Store fetches items from DB)
    await transactionStore.addOrderDiscountCharge(
      props.orderId,
      newDiscount.value,
      targetItemIds,
      applyPerItem.value
    );

    // 3. Recalculate & Sync Total
    await transactionStore.syncTotalAmountwithDc(props.orderId);

    $q.notify({
      type: "positive",
      message: `${newDiscount.value.dc_type} applied successfully!`,
    });

    // Notify parent to refresh data
    emit("saved");
    internalShow.value = false;
  } catch (error) {
    console.error(error);
    $q.notify({
      type: "negative",
      message: error.message || "Failed to add discount/charge.",
    });
  } finally {
    saving.value = false;
  }
}
</script>