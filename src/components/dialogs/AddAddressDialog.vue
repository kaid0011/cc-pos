<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="width: 800px">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">Add Address</div>
        <q-btn icon="close" flat dense round class="absolute-top-right q-ma-sm" @click="closeDialog" />
      </q-card-section>

      <q-card-section class="dialog-body">
        <q-form @submit.prevent="handleAddAddress">
          <!-- Postal Code Search -->
          <div class="row q-gutter-x-sm">
            <div class="col">
              <div class="dialog-label">Postal Code<span class="dialog-asterisk"></span></div>
              <q-input v-model="address.postal_code" label="Enter here..." outlined class="dialog-inputs" />
            </div>
            <div class="">
              <div class="dialog-label"><span class="dialog-asterisk"></span></div>
              <q-btn label="Search Address" color="primary" @click="searchAddress" class="q-mb-sm" />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Address Fields -->
          <div class="row q-col-gutter-x-sm q-col-gutter-y-md q-mb-md">
            <div class="col-4">
              <div class="dialog-label">Block No:<span class="dialog-asterisk"></span></div>
              <q-input v-model="address.block_no" label="Block Number" outlined class="dialog-inputs" />
            </div>
            <div class="col-8">
              <div class="dialog-label">Road Name:<span class="dialog-asterisk"></span></div>
              <q-input v-model="address.road_name" label="Road Name" outlined class="dialog-inputs" />
            </div>
            <div class="col-8">
              <div class="dialog-label">Building Name:<span class="dialog-asterisk"></span></div>
              <q-input v-model="address.building_name" label="Building Name" outlined class="dialog-inputs" />
            </div>
            <div class="col-4">
              <div class="dialog-label">Unit No:<span class="dialog-asterisk"></span></div>
              <q-input v-model="address.unit_no" label="Unit No" outlined class="dialog-inputs" />
            </div>
            <div class="col-3">
              <div class="dialog-label">Postal Code:<span class="dialog-asterisk"></span></div>
              <q-input v-model="address.postal_code" label="Postal Code" outlined class="dialog-inputs" />
            </div>
            <div class="col-9">
              <div class="dialog-label">Additional Information:<span class="dialog-asterisk"></span></div>
              <q-input v-model="address.additional_info" label="Additional Info" outlined class="dialog-inputs" />
            </div>
            <div class="col-12">
              <div class="dialog-label">Remarks:<span class="dialog-asterisk"></span></div>
              <q-input v-model="address.remarks" label="Remarks" outlined class="dialog-inputs" />
            </div>
          </div>

          <q-card-actions align="right">
            <q-btn label="Add Address" color="primary" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { callOneMapAPI } from "@/services/onemapService"; // NOTE: same filename as server import
import { useQuasar } from "quasar";

const $q = useQuasar();

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(["update:modelValue", "address-added"]);

const transactionStore = useTransactionStore();
const isOpen = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => { isOpen.value = newValue; });

const address = ref({
  postal_code: "",
  block_no: "",
  road_name: "",
  building_name: "",
  unit_no: "",
  additional_info: "",
  remarks: ""
});

const handleAddAddress = async () => {
  try {
    const formattedAddress = {
      postal_code: address.value.postal_code.toUpperCase(),
      block_no: address.value.block_no.toUpperCase(),
      road_name: address.value.road_name.toUpperCase(),
      building_name: address.value.building_name.toUpperCase(),
      unit_no: address.value.unit_no.toUpperCase(),
      additional_info: address.value.additional_info.toUpperCase(),
      remarks: address.value.remarks.toUpperCase(),
    };

    await transactionStore.addAddress(formattedAddress);
    $q.notify({ type: "positive", message: "Address added successfully." });

    emit("address-added");
    closeDialog();
  } catch (error) {
    console.error("❌ Error adding address:", error?.message || error);
    $q.notify({ type: "negative", message: "Failed to add address. Please try again." });
  }
};

const isValidPostal = (v) => /^\d{6}$/.test((v || "").trim());

const searchAddress = async () => {
  const raw = (address.value.postal_code || "").trim();
  if (!isValidPostal(raw)) {
    $q.notify({ type: "negative", message: "Enter a valid 6-digit postal code." });
    return;
  }

  try {
    // Public Search endpoint — no token required
    const data = await callOneMapAPI("/commonapi/search", {
      searchVal: raw,
      returnGeom: "Y",
      getAddrDetails: "Y",
      pageNum: 1,
    });

    const first = data?.results?.[0];
    if (first) {
      address.value.block_no = first.BLK_NO || "";
      address.value.road_name = first.ROAD_NAME || "";
      address.value.building_name = first.BUILDING || "";
      address.value.postal_code = (first.POSTAL || raw).toUpperCase();
      // why: some payloads use LONGTITUDE instead of LONGITUDE
      const lon = first.LONGITUDE ?? first.LONGTITUDE;
      console.debug("OneMap result:", { lat: first.LATITUDE, lon, x: first.X, y: first.Y });
    } else {
      $q.notify({ type: "warning", message: "No address found for that postal code." });
    }
  } catch (error) {
    console.error("Error fetching address:", error?.message || error);
    $q.notify({ type: "negative", message: "Search failed. Please try again." });
  }
};

const closeDialog = () => { emit("update:modelValue", false); resetAddressForm(); };

const resetAddressForm = () => {
  address.value = { postal_code: "", block_no: "", road_name: "", building_name: "", unit_no: "", additional_info: "", remarks: "" };
};
</script>