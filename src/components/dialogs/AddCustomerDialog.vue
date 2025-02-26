<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="width: 400px">
      <q-card-section class="dialog-header">
        <div class="text-weight-bold text-h6">Add Customer</div>
      </q-card-section>
      <q-card-section class="dialog-body">
        <q-form @submit.prevent="handleAddCustomer">
          <q-input
            v-model="customer.name"
            label="Name"
            outlined
            required
            class="dialog-inputs"
          />
          <q-input
            v-model="customer.sub_type"
            label="Organization / Department"
            outlined
            class="dialog-inputs"
          />
          <div class="row q-col-gutter-x-sm">
            <div class="col">
              <q-input
                v-model="customer.contact_no1"
                label="Contact No 1"
                outlined
                required
                class="dialog-inputs"
              />
            </div>
            <div class="col">
              <q-input
                v-model="customer.contact_no2"
                label="Contact No 2"
                outlined
                class="dialog-inputs"
              />
            </div>
          </div>
          <q-input
            v-model="customer.email"
            label="Email"
            outlined
            class="dialog-inputs"
          /><q-select
          v-model="selectedType"
          :options="typeOptions"
          option-value="value"
          option-label="label"
          label="Select Customer Type"
          outlined
          dense
          class="q-mb-sm bg-white"
        />

        <q-select
          v-model="selectedSubType"
          :options="filteredSubTypes"
          label="Select Customer Sub-Type"
          outlined
          dense
          class="q-mb-md bg-white"
          :disable="!selectedType"
        />
          <q-input
            v-model="customer.recommended_by"
            label="Recommended By"
            outlined
            class="dialog-inputs"
          />
          <q-input
            v-model="customer.remarks"
            label="Remarks"
            outlined
            type="textarea"
            class="dialog-inputs"
          />
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

// Ensure customer.type & sub_type match selected dropdowns
watch([selectedType, selectedSubType], ([newType, newSubType]) => {
  customer.value.type = newType && newType.value ? newType.value : ""; // Update customer type
  customer.value.sub_type = newSubType && newSubType.value ? newSubType.value : ""; // Update customer sub-type
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
  recommended_by: "",
  remarks: "",
  created_at: "",
});

const setCreatedAt = () => {
  customer.value.created_at = new Date().toISOString(); // Set UTC timestamp
};

const handleAddCustomer = async () => {
  try {
    customer.value.type = selectedType.value ? selectedType.value.value : "";
    customer.value.sub_type = selectedSubType.value ? selectedSubType.value.value : "";

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
    recommended_by: "",
    remarks: "",
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
