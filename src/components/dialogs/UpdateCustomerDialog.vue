<!-- src/components/UpdateCustomerDialog.vue -->
<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 70em">
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
          Update Customer
        </div>
      </q-card-section>

      <q-card-section class="dialog-body">
        <q-form @submit.prevent="handleUpdateCustomer">
          <div class="text-center text-h6 text-weight-bold text-uppercase q-mb-md">
            Customer Details
          </div>

          <div class="row q-col-gutter-x-sm">
            <div class="col">
              <div class="dialog-label">
                Name:<span class="dialog-asterisk">*</span>
              </div>
              <q-input
                v-model="customer.name"
                label="Name"
                outlined
                :rules="[(val) => !!val || 'Customer Name is required']"
                class="dialog-inputs"
              />
            </div>

            <div class="col-3">
              <div class="dialog-label">
                Customer Type:<span class="dialog-asterisk">*</span>
              </div>
              <q-select
                v-model="selectedType"
                :options="typeOptions"
                option-value="value"
                option-label="label"
                label="Select Customer Type"
                outlined
                :rules="[(val) => !!val || 'Customer Type is required']"
                class="dialog-inputs"
              />
            </div>

            <div class="col-3">
              <div class="dialog-label">
                Customer Sub-Type:<span class="dialog-asterisk">*</span>
              </div>
              <q-select
                v-model="selectedSubType"
                :options="filteredSubTypes"
                label="Select Customer Sub-Type"
                outlined
                :rules="[(val) => !!val || 'Customer Sub-Type is required']"
                class="dialog-inputs"
                :disable="!selectedType"
              />
            </div>
          </div>

          <div class="row q-col-gutter-x-sm">
            <div class="col">
              <div class="dialog-label">
                Contact No:<span class="dialog-asterisk">*</span>
              </div>
              <q-input
                :model-value="customer.contact_no1"
                @update:model-value="(v) => enforceDigits(v, 'contact_no1')"
                @keydown="onDigitsKeydown"
                outlined
                type="tel"
                inputmode="numeric"
                :rules="[
                  (val) => !!val || 'Contact No. is required',
                  (val) => /^\d+$/.test(val) || 'Numbers only',
                ]"
                class="dialog-inputs"
              />
            </div>

            <div class="col">
              <div class="dialog-label">
                Alternative Contact No:<span class="dialog-asterisk"></span>
              </div>
              <q-input
                :model-value="customer.contact_no2"
                @update:model-value="(v) => enforceDigits(v, 'contact_no2')"
                @keydown="onDigitsKeydown"
                outlined
                type="tel"
                inputmode="numeric"
                :rules="[
                  (val) => val === '' || /^\d+$/.test(val) || 'Numbers only',
                ]"
                class="dialog-inputs"
              />
            </div>

            <div class="col">
              <div class="dialog-label">
                E-mail Address:<span class="dialog-asterisk"></span>
              </div>
              <q-input v-model="customer.email" outlined class="dialog-inputs" />
            </div>

            <div class="col">
              <div class="dialog-label">
                Recommended By:<span class="dialog-asterisk"></span>
              </div>
              <q-input
                v-model="customer.recommended_by"
                label="Who recommended you?"
                outlined
                class="dialog-inputs"
              />
            </div>
          </div>

          <q-separator class="q-my-md" />
          <div class="text-center text-h6 text-weight-bold text-uppercase q-mb-sm">
            Remarks
          </div>

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col">
              <div class="dialog-label">Schedule Remarks:</div>
              <q-input
                v-model="customer.schedule_remarks"
                label="Schedule Remarks"
                outlined
                type="textarea"
                class="dialog-inputs"
              />
            </div>
            <div class="col">
              <div class="dialog-label">Price Remarks:</div>
              <q-input
                v-model="customer.price_remarks"
                label="Price Remarks"
                outlined
                type="textarea"
                class="dialog-inputs"
              />
            </div>
          </div>

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col">
              <div class="dialog-label">Accounting Remarks:</div>
              <q-input
                v-model="customer.accounting_remarks"
                label="Accounting Remarks"
                outlined
                type="textarea"
                class="dialog-inputs"
              />
            </div>
            <div class="col">
              <div class="dialog-label">Other Remarks:</div>
              <q-input
                v-model="customer.other_remarks"
                label="Other Remarks"
                outlined
                type="textarea"
                class="dialog-inputs"
              />
            </div>
          </div>

          <q-card-actions align="right">
            <q-btn
              unelevated
              class="dialog-button"
              label="Update Customer"
              color="primary"
              type="submit"
            />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { useQuasar } from "quasar";

const $q = useQuasar();

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(["update:modelValue", "customer-updated"]);

const transactionStore = useTransactionStore();
const isOpen = ref(props.modelValue);

// Selected dropdown values
const selectedType = ref(null);
const selectedSubType = ref(null);

// Dropdown Data
const typeOptions = ref([]);
const subTypeMapping = ref({});
const filteredSubTypes = ref([]);

// Customer data
const customer = ref({
  id: undefined,
  name: "",
  contact_no1: "",
  contact_no2: "",
  email: "",
  type: "",
  sub_type: "",
  recommended_by: "",
  schedule_remarks: "",
  price_remarks: "",
  accounting_remarks: "",
  other_remarks: "",
  created_at: "",
});

// --- DIGIT-ONLY HELPERS ---
// Why: ensure strict numeric-only input and sanitize pastes/IME.
const allowedControlKeys = new Set([
  "Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
  "Home", "End", "Tab"
]);

const onDigitsKeydown = (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return; // keep shortcuts
  if (allowedControlKeys.has(e.key)) return;
  if (e.key >= "0" && e.key <= "9") return;
  e.preventDefault();
};

const enforceDigits = (val, field) => {
  const digits = (val ?? "").toString().replace(/\D+/g, "");
  if (customer.value[field] !== digits) {
    customer.value[field] = digits;
  }
};

// Keep filtered sub-types in sync
watch(selectedType, (newType) => {
  if (newType) {
    filteredSubTypes.value = subTypeMapping.value[newType.value] || [];
  } else {
    filteredSubTypes.value = [];
  }
  selectedSubType.value =
    filteredSubTypes.value.find((st) => st.value === customer.value.sub_type) ||
    null;
});

// Sync with parent open/close
watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue;
    if (newValue) initializeForm();
  }
);

// Fetch customer types
const fetchCustomerTypes = async () => {
  try {
    const response = await transactionStore.fetchCustomerTypes();
    typeOptions.value = response.customerTypes.map((type) => ({
      label: type, value: type
    }));
    subTypeMapping.value = response.subTypeMapping;
  } catch (error) {
    console.error("Error fetching customer types:", error);
  }
};

// Initialize form and sanitize existing numbers
const initializeForm = async () => {
  await fetchCustomerTypes();

  if (transactionStore.selectedCustomer) {
    customer.value = { ...transactionStore.selectedCustomer };
  }

  // sanitize pre-filled numbers coming from backend/store
  enforceDigits(customer.value.contact_no1, "contact_no1");
  enforceDigits(customer.value.contact_no2, "contact_no2");

  // Set type dropdown value
  selectedType.value = typeOptions.value.find(
    (t) => t.value === customer.value.type
  ) || null;

  if (selectedType.value) {
    filteredSubTypes.value =
      subTypeMapping.value[selectedType.value.value] || [];

    selectedSubType.value = filteredSubTypes.value.find(
      (st) => st.value === customer.value.sub_type
    ) || null;
  } else {
    filteredSubTypes.value = [];
    selectedSubType.value = null;
  }
};

// Update
const handleUpdateCustomer = async () => {
  try {
    if (!customer.value.id) {
      $q.notify({ type: "negative", message: "Missing customer ID" });
      return;
    }

    customer.value.type = selectedType.value?.value || "";
    customer.value.sub_type = selectedSubType.value?.value || "";

    await transactionStore.updateCustomer(customer.value);
    transactionStore.setSelectedCustomer(customer.value);

    $q.notify({ type: "positive", message: "Customer updated successfully" });

    emit("customer-updated");
    closeDialog();
  } catch (error) {
    console.error("Error updating customer:", error);
    $q.notify({ type: "negative", message: "Update failed. Try again." });
  }
};

// Close
const closeDialog = () => {
  emit("update:modelValue", false);
};
</script>
