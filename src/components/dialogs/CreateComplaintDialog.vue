<!-- src/components/CreateComplaintDialog.vue -->
<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="width: 600px">
      <q-card-section class="dialog-header">
        <q-btn
          icon="close"
          flat
          dense
          round
          class="absolute-top-right q-ma-sm"
          @click="closeDialog"
        />
        <div class="text-body1 text-uppercase text-weight-bold">
          Create Complaint
        </div>
      </q-card-section>

      <q-card-section class="dialog-body">
        <q-form @submit.prevent="handleCreateComplaint">
          <!-- Customer -->
          <div class="q-mb-md">
            <div class="dialog-label">
              Customer:<span class="dialog-asterisk">*</span>
            </div>

            <!-- Locked view: show name, keep ID in form -->
            <template v-if="lockCustomer">
              <q-input
                :model-value="lockedCustomerLabel"
                outlined
                dense
                class="dialog-inputs"
                readonly
              />
            </template>

            <!-- Selectable view -->
            <template v-else>
              <q-select
                v-model="form.customer_id"
                :options="customerOptions"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                outlined
                dense
                class="dialog-inputs"
                :loading="loadingCustomers"
                :disable="submitting || loadingCustomers"
                :rules="[(val) => !!val || 'Customer is required']"
              />
            </template>
          </div>

          <!-- Category -->
          <div class="q-mb-md">
            <div class="dialog-label">
              Category:<span class="dialog-asterisk">*</span>
            </div>
            <q-select
              v-model="form.category"
              :options="categoryOptions"
              emit-value
              map-options
              outlined
              dense
              class="dialog-inputs"
              :disable="submitting"
              :rules="[(val) => !!val || 'Category is required']"
            />
          </div>

          <!-- Description -->
          <div class="q-mb-md">
            <div class="dialog-label">
              Description:<span class="dialog-asterisk">*</span>
            </div>
            <q-input
              v-model="form.description"
              outlined
              dense
              type="textarea"
              class="dialog-inputs"
              :disable="submitting"
              :rules="[
                (val) => !!val && !!val.trim() || 'Description is required',
              ]"
            />
          </div>

          <q-card-actions align="right">
            <q-btn outline color="red-9" label="Cancel" @click="closeDialog" :disable="submitting" />
            <q-btn
              unelevated
              label="Create Complaint"
              color="primary"
              type="submit"
              :loading="submitting"
            />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useQuasar } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";

const $q = useQuasar();
const transactionStore = useTransactionStore();

/* v-model + props */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  defaultCustomerId: { type: [String, Number, null], default: null },
  lockCustomer: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue", "created"]);

const isOpen = ref(props.modelValue);
watch(() => props.modelValue, (v) => (isOpen.value = v));

const closeDialog = () => {
  emit("update:modelValue", false);
  resetForm();
};

/* Form state */
const submitting = ref(false);
const loadingCustomers = ref(false);

const form = ref({
  customer_id: props.defaultCustomerId ?? null,
  category: null, // 'customer service' | 'order' | 'others'
  description: "",
});

const resetForm = () => {
  form.value = {
    customer_id: props.defaultCustomerId ?? null,
    category: null,
    description: "",
  };
};

/* Options */
const categoryOptions = [
  { label: "Customer Service", value: "customer service" },
  { label: "Order", value: "order" },
  { label: "Others", value: "others" },
];

const customers = ref([]);
const customerOptions = computed(() =>
  (customers.value || []).map((c) => ({ label: c.name, value: c.id }))
);

/* For locked mode: resolve label for readonly field */
const lockedCustomerLabel = computed(() => {
  const id = props.defaultCustomerId;
  if (!id) return "";
  const found = (customers.value || []).find((c) => String(c.id) === String(id));
  return found?.name || `Customer #${id}`;
});

/* Load customers when opened (for both modes to resolve name) */
const loadCustomers = async () => {
  loadingCustomers.value = true;
  try {
    if (typeof transactionStore.loadCustomers === "function") {
      await transactionStore.loadCustomers();
      customers.value = transactionStore.customers || [];
    } else if (typeof transactionStore.fetchAllCustomers === "function") {
      customers.value = await transactionStore.fetchAllCustomers();
    } else if (typeof transactionStore.fetchCustomersLite === "function") {
      customers.value = await transactionStore.fetchCustomersLite(); // [{id,name}]
    } else {
      customers.value = [];
    }
  } catch (e) {
    $q.notify({ type: "negative", message: e?.message || "Failed to load customers." });
  } finally {
    loadingCustomers.value = false;
  }
};

watch(isOpen, (open) => {
  if (open) {
    resetForm();
    loadCustomers();
  }
});

/* Submit */
const handleCreateComplaint = async () => {
  // Enforce locked customer
  if (props.lockCustomer) {
    form.value.customer_id = props.defaultCustomerId;
  }
  if (!form.value.customer_id || !form.value.category || !form.value.description?.trim()) {
    $q.notify({ type: "warning", message: "Please fill all required fields." });
    return;
  }

  submitting.value = true;
  try {
    if (typeof transactionStore.createCustomerComplaint !== "function") {
      throw new Error("transactionStore.createCustomerComplaint is not implemented.");
    }
    await transactionStore.createCustomerComplaint({
      customer_id: form.value.customer_id,
      category: form.value.category, // lowercase values for DB
      description: form.value.description.trim(),
    });

    $q.notify({ type: "positive", message: "Complaint created." });
    emit("created");
    closeDialog();
  } catch (e) {
    $q.notify({ type: "negative", message: e?.message || "Failed to create complaint." });
  } finally {
    submitting.value = false;
  }
};
</script>
