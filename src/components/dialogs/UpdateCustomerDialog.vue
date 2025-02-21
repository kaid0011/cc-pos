<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="width: 450px">
      <q-card-section class="dialog-header">
        <div class="text-weight-bold text-h6">Update Customer</div>
      </q-card-section>
      <q-card-section class="dialog-body">
        <q-form @submit.prevent="handleUpdateCustomer">
          <q-input v-model="customer.name" label="Name" outlined required class="dialog-inputs" />

          <div class="row q-col-gutter-x-sm">
            <div class="col">
              <q-input v-model="customer.contact_no1" label="Contact No 1" outlined required class="dialog-inputs" />
            </div>
            <div class="col">
              <q-input v-model="customer.contact_no2" label="Contact No 2" outlined class="dialog-inputs" />
            </div>
          </div>

          <q-input v-model="customer.email" label="Email" outlined class="dialog-inputs" />

          <!-- Updated: Type Dropdown -->
          <q-select
            v-model="selectedType"
            :options="typeOptions"
            option-value="value"
            option-label="label"
            label="Customer Type"
            outlined
            dense
            class="q-mb-sm bg-white"
          />

          <!-- Updated: Sub-Type Dropdown (Now Initializes Correctly) -->
          <q-select
            v-model="selectedSubType"
            :options="filteredSubTypes"
            label="Organization / Department"
            outlined
            dense
            class="q-mb-md bg-white"
            :disable="!selectedType"
          />

          <q-input v-model="customer.recommended_by" label="Recommended By" outlined class="dialog-inputs" />
          <q-input v-model="customer.remarks" label="Remarks" outlined type="textarea" class="dialog-inputs" />
          <q-input v-model="formattedCreatedAt" label="Customer Since" outlined readonly class="dialog-inputs" />

          <q-card-actions align="right">
            <q-btn label="Cancel" color="negative" @click="closeDialog" />
            <q-btn label="Update" color="primary" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";

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
const customer = computed(() => {
  return transactionStore.selectedCustomer
    ? { ...transactionStore.selectedCustomer }
    : {
        name: "",
        contact_no1: "",
        contact_no2: "",
        email: "",
        type: "",
        sub_type: "",
        recommended_by: "",
        remarks: "",
        created_at: "",
      };
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
    filteredSubTypes.value.find((st) => st.value === customer.value.sub_type) || null;
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

// Compute created_at for display
const formattedCreatedAt = computed(() => {
  if (!customer.value.created_at) return "";
  return new Date(customer.value.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
});

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

  // Set type dropdown value
  selectedType.value = typeOptions.value.find((t) => t.value === customer.value.type) || null;

  // Set filtered sub-types and initial sub-type selection
  if (selectedType.value) {
    filteredSubTypes.value = subTypeMapping.value[selectedType.value.value] || [];
    selectedSubType.value =
      filteredSubTypes.value.find((st) => st.value === customer.value.sub_type) || null;
  } else {
    filteredSubTypes.value = [];
    selectedSubType.value = null;
  }
};

// Handle customer update
const handleUpdateCustomer = async () => {
  try {
    if (!customer.value.id) {
      console.error("Error: Customer ID is missing");
      return;
    }

    // Update customer type and sub-type from dropdown selections
    customer.value.type = selectedType.value ? selectedType.value.value : "";
    customer.value.sub_type = selectedSubType.value ? selectedSubType.value.value : "";

    await transactionStore.updateCustomer(customer.value);
    transactionStore.setSelectedCustomer(customer.value); // Update selected customer
    emit("customer-updated"); // Notify parent
    closeDialog(); // Close dialog after success
  } catch (error) {
    console.error("Error updating customer:", error);
  }
};

// Close dialog
const closeDialog = () => {
  emit("update:modelValue", false);
};
</script>
