<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 70em">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Add New Customer
        </div>
        <q-btn
          icon="close"
          flat
          dense
          round
          class="absolute-top-right q-ma-sm"
          @click="closeDialog"
        />
      </q-card-section>
      <q-card-section class="dialog-body">
        <q-form @submit.prevent="handleAddCustomer">
          <div
            class="text-center text-h6 text-weight-bold text-uppercase q-mb-md"
          >
            Customer Details
          </div>

          <div class="row q-col-gutter-md">
            <div class="col">
              <div class="dialog-label">
                Name:<span class="dialog-asterisk">*</span>
              </div>
              <q-input
                v-model="customer.name"
                label="Enter name here"
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
          <div class="row q-col-gutter-md">
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
          </div>
          <div class="row q-col-gutter-md">
            <div class="col">
              <div class="dialog-label">
                Pricing Group:<span class="dialog-asterisk">*</span>
              </div>
              <q-select
                v-model="selectedPricingGroup"
                :options="pricingGroupOptions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                label="Select Pricing Group"
                outlined
                :rules="[(val) => !!val || 'Pricing Group is required']"
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
              label="Add New Customer"
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
import { ref, watch, onMounted } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { useQuasar } from "quasar";
import { fetchPricingGroups } from "@/../supabase/api/item_list.js";

const $q = useQuasar();

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(["update:modelValue", "customer-added"]);

const transactionStore = useTransactionStore();
const isOpen = ref(props.modelValue);

// Selected Values
const selectedType = ref(null);
const selectedSubType = ref(null);

// New refs
const selectedPricingGroup = ref(null);
const pricingGroupOptions = ref([]);

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
  recommended_by: "",
  schedule_remarks: "",
  price_remarks: "",
  accounting_remarks: "",
  other_remarks: "",
    pricing_group_id: null,
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

    // ✅ assign pricing_group_id directly (already just an ID)
    customer.value.pricing_group_id = selectedPricingGroup.value;

    await transactionStore.createCustomer(customer.value);

    $q.notify({
      type: "positive",
      message: "Customer added successfully!",
    });

    emit("customer-added");
    closeDialog();
  } catch (error) {
    console.error("Error adding customer:", error);
    $q.notify({
      type: "negative",
      message: "Failed to add customer. Please try again.",
    });
  }
};

const closeDialog = () => {
  emit("update:modelValue", false);
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
    schedule_remarks: "",
    price_remarks: "",
    accounting_remarks: "",
    other_remarks: "",
    pricing_group_id: null,
    created_at: "",
  };
  selectedType.value = null;
  selectedSubType.value = null;
  selectedPricingGroup.value = null;
  filteredSubTypes.value = [];
};

// Dropdown Data
const typeOptions = ref([]);
const subTypeMapping = ref({});
const filteredSubTypes = ref([]);

const fetchCustomerTypes = async () => {
  try {
    const response = await transactionStore.fetchCustomerTypes();

    // Populate type options
    typeOptions.value = response.customerTypes.map((type) => ({
      label: type,
      value: type,
    }));

    // Assign sub-type mapping
    subTypeMapping.value = response.subTypeMapping;

    // console.log("Type Options:", typeOptions.value);
    // console.log("Sub-Type Mapping:", subTypeMapping.value);
  } catch (error) {
    console.error("Error fetching customer types:", error);
  }
};

watch(selectedType, (newType) => {
  // Check if newType is not null before accessing .value
  if (newType && newType.value) {
    filteredSubTypes.value = subTypeMapping.value[newType.value] || [];
  } else {
    filteredSubTypes.value = [];
  }

  selectedSubType.value = null; // Reset sub-type when type changes
});

onMounted(async () => {
  await fetchCustomerTypes();
  pricingGroupOptions.value = await fetchPricingGroups();
});
</script>
