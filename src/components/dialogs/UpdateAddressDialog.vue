<template>
    <q-dialog v-model="isOpen" persistent>
      <q-card style="width: 800px">
        <q-card-section class="dialog-header">
          <div class="text-weight-bold text-h6">Update Address</div>
        </q-card-section>
        <q-card-section class="dialog-body">
          <q-form @submit.prevent="handleUpdateAddress">
            <!-- Postal Code Search -->
            <div class="row q-gutter-x-sm">
              <div class="col">
                <q-input v-model="address.postal_code" label="Postal Code" outlined class="dialog-inputs" />
              </div>
              <q-btn label="Search Address" color="primary" @click="searchAddress" class="q-mb-sm" />
            </div>
            <q-separator class="q-my-md" />
  
            <!-- Address Fields -->
            <div class="row q-col-gutter-x-sm">
              <div class="col-4">
                <div class="dialog-label">Block No:</div>
                <q-input v-model="address.block_no" label="Block Number" outlined class="dialog-inputs" />
              </div>
              <div class="col-8">
                <div class="dialog-label">Road Name:</div>
                <q-input v-model="address.road_name" label="Road Name" outlined class="dialog-inputs" />
              </div>
              <div class="col-8">
                <div class="dialog-label">Building Name:</div>
                <q-input v-model="address.building_name" label="Building Name" outlined class="dialog-inputs" />
              </div>
              <div class="col-4">
                <div class="dialog-label">Unit No:</div>
                <q-input v-model="address.unit_no" label="Unit No" outlined class="dialog-inputs" />
              </div>
              <div class="col-3">
                <div class="dialog-label">Postal Code:</div>
                <q-input v-model="address.postal_code" label="Postal Code" outlined class="dialog-inputs" />
              </div>
              <div class="col-9">
                <div class="dialog-label">Additional Information:</div>
                <q-input v-model="address.additional_info" label="Additional Info" outlined class="dialog-inputs" />
              </div>
              <div class="col-12">
                <div class="dialog-label">Remarks:</div>
                <q-input v-model="address.remarks" label="Remarks" outlined class="dialog-inputs" />
              </div>
            </div>
  
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
  import { ref, watch } from "vue";
  import { useTransactionStore } from "@/stores/transactionStore";
  import { callOneMapAPI } from "@/services/onemapService";
  
  const props = defineProps({
    modelValue: Boolean,
    initialAddress: Object,
  });
  const emit = defineEmits(["update:modelValue", "address-updated"]);
  
  const transactionStore = useTransactionStore();
  const isOpen = ref(props.modelValue);
  const address = ref({ ...props.initialAddress });


watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue;
  if (newValue && transactionStore.selectedAddress) {
    address.value = { ...transactionStore.selectedAddress }; // Load latest selected address
  }
});

  
watch(
  () => transactionStore.selectedAddress,
  (newAddress) => {
    if (newAddress) {
      address.value = { ...newAddress }; // Ensure reactivity
    }
  },
  { deep: true, immediate: true } // Run immediately when the dialog opens
);

  const handleUpdateAddress = async () => {
  if (!address.value.block_no || !address.value.road_name) {
    console.error("Address is incomplete. Ensure all fields are filled.");
    return;
  }

  try {
    const formattedAddress = {
      id: transactionStore.selectedAddress.id, // Ensure correct ID is sent
      postal_code: address.value.postal_code.toUpperCase(),
      block_no: address.value.block_no.toUpperCase(),
      road_name: address.value.road_name.toUpperCase(),
      building_name: address.value.building_name.toUpperCase(),
      unit_no: address.value.unit_no.toUpperCase(),
      remarks: address.value.remarks.toUpperCase(),
    };

    await transactionStore.updateCustomerAddress(formattedAddress);
    console.log("✅ Address updated successfully:", formattedAddress);

    emit("address-updated"); // Notify parent component
    closeDialog();
  } catch (error) {
    console.error("❌ Error updating address:", error.message);
  }
};
  
  const searchAddress = async () => {
    if (!address.value.postal_code) {
      console.error("Postal code is required.");
      return;
    }
  
    try {
      const data = await callOneMapAPI("/common/elastic/search", {
        searchVal: address.value.postal_code,
        returnGeom: "Y",
        getAddrDetails: "Y",
        pageNum: 1,
      });
  
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        address.value.block_no = result.BLK_NO || "N/A";
        address.value.road_name = result.ROAD_NAME || "N/A";
        address.value.building_name = result.BUILDING || "N/A";
        address.value.postal_code = result.POSTAL || address.value.postal_code.toUpperCase();
        console.log("Address search result:", address.value);
      } else {
        console.error("No address found for the provided postal code.");
      }
    } catch (error) {
      console.error("Error fetching address:", error.message);
    }
  };
  
  const closeDialog = () => {
    emit("update:modelValue", false); // Update parent state
  };
  </script>
  