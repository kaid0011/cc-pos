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
          <div
            class="text-center text-h6 text-weight-bold text-uppercase q-mb-md"
          >
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
                v-model="customer.contact_no1"
                outlined
                :rules="[(val) => !!val || 'Contact No. is required']"
                class="dialog-inputs"
              />
            </div>
            <div class="col">
              <div class="dialog-label">
                Alternative Contact No:<span class="dialog-asterisk"></span>
              </div>
              <q-input
                v-model="customer.contact_no2"
                outlined
                class="dialog-inputs"
              />
            </div>
            <div class="col">
              <div class="dialog-label">
                E-mail Address:<span class="dialog-asterisk"></span>
              </div>
              <q-input
                v-model="customer.email"
                outlined
                class="dialog-inputs"
              />
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
          <div
            class="text-center text-h6 text-weight-bold text-uppercase q-mb-sm"
          >
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
import { useQuasar } from 'quasar';

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

// Computed customer data from store
const customer = ref({
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


// Watch for changes in customer type selection
watch(selectedType, (newType) => {
  if (newType) {
    filteredSubTypes.value = subTypeMapping.value[newType.value] || [];
  } else {
    filteredSubTypes.value = [];
  }
  // Keep the sub-type pre-selected if it exists in the filtered options
  selectedSubType.value =
    filteredSubTypes.value.find((st) => st.value === customer.value.sub_type) ||
    null;
});

// Watch for changes in parent `modelValue`
watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue;
    if (newValue) {
      initializeForm(); // Reset form and load dropdowns
    }
  }
);

// Fetch customer types
const fetchCustomerTypes = async () => {
  try {
    const response = await transactionStore.fetchCustomerTypes();
    typeOptions.value = response.customerTypes.map((type) => ({
      label: type,
      value: type,
    }));
    subTypeMapping.value = response.subTypeMapping;
  } catch (error) {
    console.error("Error fetching customer types:", error);
  }
};

// Initialize form when the dialog opens
const initializeForm = async () => {
  await fetchCustomerTypes();

  if (transactionStore.selectedCustomer) {
    // Deep copy to prevent mutation of store state
    customer.value = { ...transactionStore.selectedCustomer };
  }

  // Set type dropdown value
  selectedType.value = typeOptions.value.find(
    (t) => t.value === customer.value.type
  ) || null;

  // Set filtered sub-types and sub-type selection
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


// Handle customer update
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

// Close dialog
const closeDialog = () => {
  emit("update:modelValue", false);
};
</script>
