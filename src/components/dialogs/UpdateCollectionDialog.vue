<template>
  <q-card class="slip-card">
    <div class="text-subtitle1 text-uppercase text-weight-bolder">Collection Details</div>
    <q-separator class="q-my-xs" />

    <div class="text-slip-row">
      Contact Person:
      <q-select
        v-model="transactionStore.selectedCollectionContact"
        :options="contactOptions"
        option-label="name"
        option-value="id"
        outlined
        dense
        clearable
        class="q-mb-xs bg-white"
        label="Select Collection Contact Person"
      />
    </div>

    <div class="text-slip-row">
      Contact Nos:
      <q-input
        v-model="formattedCollectionContactNos"
        disable
        outlined
        dense
        class="q-mb-xs bg-white"
      />
    </div>

    <div class="text-slip-row">
      Address:
      <q-select
        v-model="transactionStore.selectedCollectionAddress"
        :options="transactionStore.addressOptions"
        option-label="label"
        option-value="id"
        outlined
        dense
        clearable
        class="q-mb-xs bg-white"
        label="Select Collection Address"
      />
    </div>

    <div class="text-slip-row">
      Collection Date:
      <q-input
        v-model="formattedCollectionDate"
        outlined
        dense
        readonly
        class="q-mb-xs bg-white"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy>
              <q-date v-model="transactionStore.collectionDate" mask="YYYY-MM-DD" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>

    <div class="text-slip-row">
      Collection Time:
      <q-select
        v-model="transactionStore.collectionTime"
        :options="timeOptions"
        option-label="label"
        option-value="id"
        outlined
        dense
        class="q-mb-xs bg-white"
        label="Select Collection Time"
      />
    </div>

    <div class="text-slip-row">
      Collection Driver:
      <q-select
        v-model="transactionStore.selectedCollectionDriver"
        :options="driverOptions"
        option-label="name"
        outlined
        dense
        class="q-mb-xs bg-white"
        label="Select Collection Driver"
      />
    </div>

    <div class="text-slip-row">
      Remarks:
      <q-input
        v-model="transactionStore.collectionRemarks"
        outlined
        dense
        class="q-mb-xs bg-white"
      />
    </div>

    <q-card-actions align="right">
      <q-btn
        label="Update Collection"
        color="primary"
        icon="update"
        class="full-width"
        @click="updateCollection"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { useQuasar } from "quasar";

const $q = useQuasar();

const transactionStore = useTransactionStore();

const driverOptions = ref([]);
const timeOptions = ref([]);
const contactOptions = ref([]);
const addressOptions = ref([]);

onMounted(async () => {
  await transactionStore.loadDrivers();
  await transactionStore.loadTimeOptions();

  driverOptions.value = transactionStore.driverOptions;
  timeOptions.value = transactionStore.timeOptions;

  console.log("Mounted - Driver Options:", driverOptions.value);
  console.log("Mounted - Time Options:", timeOptions.value);

  if (transactionStore.selectedCustomer?.id) {
    console.log("Mounted - Customer ID Found:", transactionStore.selectedCustomer.id);
    await updateOptions(transactionStore.selectedCustomer.id);
  } else {
    console.log("Mounted - No Customer Selected");
  }
});

watch(
  () => transactionStore.selectedCustomer?.id,
  async (newCustomerId) => {
    console.log("Watch - Customer ID Changed:", newCustomerId);
    if (newCustomerId) await updateOptions(newCustomerId);
    else {
      contactOptions.value = [];
      addressOptions.value = [];
      console.log("Watch - Cleared contact/address options");
    }
  }
);

async function updateOptions(customerId) {
  try {
    console.log("Fetching contact/address options for Customer ID:", customerId);
    await Promise.all([
      transactionStore.loadContactOptions(customerId),
      transactionStore.loadAddressOptions(customerId),
    ]);

    console.log("Raw contact options:", transactionStore.contactOptions);
    console.log("Raw address options:", transactionStore.addressOptions);

    contactOptions.value = transactionStore.contactOptions.map((contact) => ({
      id: contact.id,
      name: contact.name,
      contact_no1: contact.contact_no1,
      contact_no2: contact.contact_no2,
      label: `${contact.name} - ${contact.contact_no1}`,
    }));

    addressOptions.value = transactionStore.addressOptions.map((address) => ({
      id: address.id,
      label: `${address.block_no} ${address.road_name} ${address.unit_no} ${address.building_name}, ${address.postal_code} (${address?.additional_info || ""})`,
    }));

    console.log("Formatted contact options:", contactOptions.value);
    console.log("Formatted address options:", addressOptions.value);
  } catch (err) {
    console.error("Failed to load contact/address options", err);
    contactOptions.value = [];
    addressOptions.value = [];
  }
}

const formattedCollectionDate = computed(() => formatDate(transactionStore.collectionDate));

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const formattedCollectionContactNos = computed({
  get() {
    const contact = transactionStore.selectedCollectionContact;
    if (!contact) return "-";
    const contact1 = contact.contact_no1 || "-";
    const contact2 = contact.contact_no2;
    return contact2 ? `${contact1} / ${contact2}` : contact1;
  },
  set(value) {
    if (!transactionStore.selectedCollectionContact) {
      transactionStore.selectedCollectionContact = {};
    }
    const [contact1, contact2] = value.split(" / ").map((num) => num.trim());
    transactionStore.selectedCollectionContact.contact_no1 = contact1 || "";
    transactionStore.selectedCollectionContact.contact_no2 = contact2 || null;
  },
});

async function updateCollection() {
  if (!transactionStore.selectedCollectionId) {
    $q.notify({
      type: "negative",
      message: "No collection selected for update.",
    });
    return;
  }

  try {
    await transactionStore.updateCollection(transactionStore.selectedCollectionId);
    $q.notify({
      type: "positive",
      message: "Collection updated successfully.",
    });
  } catch (error) {
    console.error("Update collection failed:", error);
    $q.notify({
      type: "negative",
      message: "Failed to update collection. Please try again.",
    });
  }
}

</script>
