<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 70em">
      <q-card-section class="dialog-header">
        <div class="text-weight-bold text-h6">Add Customer</div>
      </q-card-section>
      <q-card-section class="dialog-body">
        <q-form @submit.prevent="handleAddCustomer">
          <div
            class="text-center text-h6 text-weight-bold text-uppercase q-mb-md"
          >
            Customer Details
          </div>

          <div class="row q-col-gutter-x-sm">
            <div class="col">
              <div class="dialog-label">Name:</div>
              <q-input
                v-model="customer.name"
                label="Name"
                outlined
                required
                class="dialog-inputs"
              />
            </div>
            <div class="col-3">
              <div class="dialog-label">Customer Type:</div>
              <q-select
                v-model="selectedType"
                :options="typeOptions"
                option-value="value"
                option-label="label"
                label="Select Customer Type"
                outlined
                class="dialog-inputs"
              />
            </div>
            <div class="col-3">
              <div class="dialog-label">Customer Sub-Type:</div>
              <q-select
                v-model="selectedSubType"
                :options="filteredSubTypes"
                label="Select Customer Sub-Type"
                outlined
                class="dialog-inputs"
                :disable="!selectedType"
              />
            </div>
          </div>
          <div class="row q-col-gutter-x-sm">
            <div class="col">
              <div class="dialog-label">Contact No:</div>
              <q-input
                v-model="customer.contact_no1"
                label="Contact No 1"
                outlined
                required
                class="dialog-inputs"
              />
            </div>
            <div class="col">
              <div class="dialog-label">Alternative Contact No:</div>
              <q-input
                v-model="customer.contact_no2"
                label="Contact No 2"
                outlined
                class="dialog-inputs"
              />
            </div>
            <div class="col">
              <div class="dialog-label">E-mail Address:</div>
              <q-input
                v-model="customer.email"
                label="Email"
                outlined
                class="dialog-inputs"
              />
            </div>
          </div>
          <div class="row q-col-gutter-x-sm">
            <div class="col">
              <div class="dialog-label">Payment Type:</div>
              <q-select
                v-model="customer.payment_type"
                :options="paymentTypeOptions"
                label="Payment Type"
                outlined
                class="dialog-inputs"
              />
            </div>
            <div class="col">
              <div class="dialog-label">Recommended By:</div>
              <q-input
                v-model="customer.recommended_by"
                label="Recommended By"
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
          <div class="row q-col-gutter-x-sm">
            <div class="col">
              <q-input
                v-model="customer.schedule_remarks"
                label="Schedule Remarks"
                outlined
                type="textarea"
                class="dialog-inputs"
              />
            </div>
            <div class="col">
              <q-input
                v-model="customer.price_remarks"
                label="Price Remarks"
                outlined
                type="textarea"
                class="dialog-inputs"
              />
            </div>
          </div>
          <div class="row q-col-gutter-x-sm">
            <div class="col">
              <q-input
                v-model="customer.accounting_remarks"
                label="Accounting Remarks"
                outlined
                type="textarea"
                class="dialog-inputs"
              />
            </div>
            <div class="col">
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
            <q-btn label="Cancel" color="negative" @click="closeDialog" />
            <q-btn label="Add" color="primary" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(["update:modelValue", "customer-added"]);

const transactionStore = useTransactionStore();
const isOpen = ref(props.modelValue);

// Selected Values
const selectedType = ref(null);
const selectedSubType = ref(null);

const paymentTypeOptions = ref(["Cash", "Paid Online", "Pay Now"]);

// Ensure customer.type & sub_type match selected dropdowns
watch([selectedType, selectedSubType], ([newType, newSubType]) => {
  customer.value.type = newType && newType.value ? newType.value : ""; // Update customer type
  customer.value.sub_type =
    newSubType && newSubType.value ? newSubType.value : ""; // Update customer sub-type
});

// Sync `isOpen` with `modelValue` from parent
watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue;
    if (newValue) {
      setCreatedAt(); // Set the timestamp when opening the dialog
    }
  }
);

const customer = ref({
  name: "",
  contact_no1: "",
  contact_no2: "",
  email: "",
  type: "",
  sub_type: "",
  payment_type: "",
  recommended_by: "",
  schedule_remarks: "",
  price_remarks: "",
  accounting_remarks: "",
  other_remarks: "",
  created_at: "",
});

const setCreatedAt = () => {
  customer.value.created_at = new Date().toISOString(); // Set UTC timestamp
};

const handleAddCustomer = async () => {
  try {
    customer.value.type = selectedType.value ? selectedType.value.value : "";
    customer.value.sub_type = selectedSubType.value
      ? selectedSubType.value.value
      : "";

    await transactionStore.createCustomer(customer.value);
    emit("customer-added"); // Notify parent
    closeDialog(); // Close dialog after success
  } catch (error) {
    console.error("Error adding customer:", error);
  }
};

const closeDialog = () => {
  emit("update:modelValue", false); // Update parent state
  resetCustomerForm();
};

const resetCustomerForm = () => {
  customer.value = {
    name: "",
    contact_no1: "",
    contact_no2: "",
    email: "",
    type: "",
    sub_type: "",
    payment_type: "",
    recommended_by: "",
    schedule_remarks: "",
    price_remarks: "",
    accounting_remarks: "",
    other_remarks: "",
  };
  selectedType.value = null;
  selectedSubType.value = null;
  filteredSubTypes.value = [];
};

// Dropdown Data
const typeOptions = ref([]);
const subTypeMapping = ref({});
const filteredSubTypes = ref([]);

const fetchCustomerTypes = async () => {
  try {
    const response = await transactionStore.fetchCustomerTypes();

    console.log("Response from fetchCustomerTypes:", response);

    // Populate type options
    typeOptions.value = response.customerTypes.map((type) => ({
      label: type,
      value: type,
    }));

    // Assign sub-type mapping
    subTypeMapping.value = response.subTypeMapping;

    console.log("Type Options:", typeOptions.value);
    console.log("Sub-Type Mapping:", subTypeMapping.value);
  } catch (error) {
    console.error("Error fetching customer types:", error);
  }
};

watch(selectedType, (newType) => {
  console.log("DEBUG: Selected Type (Fixed) ->", newType);

  // Check if newType is not null before accessing .value
  if (newType && newType.value) {
    filteredSubTypes.value = subTypeMapping.value[newType.value] || [];
    console.log(
      `DEBUG: Filtered Sub-Types for '${newType.value}' ->`,
      filteredSubTypes.value
    );
  } else {
    filteredSubTypes.value = [];
    console.log("DEBUG: No Type Selected. Filtered Sub-Types cleared.");
  }

  selectedSubType.value = null; // Reset sub-type when type changes
});

// Fetch types when component loads
onMounted(() => {
  fetchCustomerTypes();
});
</script>
