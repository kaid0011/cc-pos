<template>
      <q-card class="slip-card">
        <div class="text-subtitle1 text-uppercase text-weight-bolder">
          Collection Details
        </div>
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
                  <q-date
                    v-model="transactionStore.collectionDate"
                    mask="YYYY-MM-DD"
                  />
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
            option-value="id"
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
          <!-- Update Button -->
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
import { onMounted, ref, computed, watch, } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";

const transactionStore = useTransactionStore();

// Initialize objects to prevent null errors
const customer = ref({});
const collection = ref({});

const driverOptions = ref([]); // Initialize as a reactive array
const timeOptions = ref([]); // Initialize as a reactive array

onMounted(async () => {
  try {
    // Load drivers first
    await transactionStore.loadDrivers();
    await transactionStore.loadTimeOptions();

    // Now set the dropdown options to the driverOptions from the store
    driverOptions.value = transactionStore.driverOptions;
    timeOptions.value = transactionStore.timeOptions;

    console.log("Driver Options Set:", driverOptions.value);
  } catch (error) {
    console.error("Error loading driver options:", error);
    driverOptions.value = []; // Fallback to an empty array
  }
});

const contactOptions = ref([]);
const addressOptions = ref([]);

const updateOptions = async () => {
  try {
    const customerId = customer.value?.id || null;
    if (!customerId) {
      console.warn("No customer selected. Options cleared.");
      contactOptions.value = [];
      addressOptions.value = [];
      return;
    }

    // Fetch data from API or store
    await Promise.all([
      transactionStore.loadContactOptions(customerId),
      transactionStore.loadAddressOptions(customerId),
    ]);

    // Map data to dropdown options
    contactOptions.value = transactionStore.contactOptions.map((contact) => ({
      id: contact.id,
      name: contact.name, // Only include the name here
      contact_no1: contact.contact_no1,
      contact_no2: contact.contact_no2,
      label: `${contact.name} - ${contact.contact_no1}`,
    }));

    addressOptions.value = transactionStore.addressOptions.map((address) => ({
      id: address.id,
      label: `${address.block_no} ${address.road_name} ${address.unit_no} ${
        address.building_name
      }, ${address.postal_code} (${address?.additional_info || ""})`,
    }));
  } catch (error) {
    console.error("Error fetching contact/address options:", error);
    contactOptions.value = [];
    addressOptions.value = [];
  }
};

// Watch for customer changes and update options
watch(customer, async () => {
  await updateOptions();
});

// Computed properties for formatted display
const formattedCollectionDate = computed(() =>
  formatDate(transactionStore.collectionDate)
);

// Function to format dates as "Thu, 30/01/2025"
const formatDate = (dateString) => {
  if (!dateString) return "N/A"; // If the date is missing or null, return "N/A"

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A"; // If the date is invalid, return "N/A"

  return date.toLocaleDateString("en-GB", {
    weekday: "short", // "Thu"
    day: "2-digit", // "30"
    month: "2-digit", // "01"
    year: "numeric", // "2025"
  });
};

function getContactNumber(contactPersonId) {
  if (!contactOptions.value || contactOptions.value.length === 0) return "-"; // Ensure options are loaded
  const contact = contactOptions.value.find(
    (option) => option.id === contactPersonId
  );
  if (contact) {
    return `${contact.contact_no1 || "-"} / ${contact.contact_no2 || "-"}`;
  }
  return "-";
}

const formattedCollectionContactNos = computed({
  get() {
    const contact1 = transactionStore.selectedCollectionContact.contact_no1 || "-";
    const contact2 = transactionStore.selectedCollectionContact.contact_no2;

    // If contact2 exists, show "contact1 / contact2", otherwise just show contact1
    return contact2 ? `${contact1} / ${contact2}` : contact1;
  },
  set(value) {
    const [contact1, contact2] = value.split(" / ").map((num) => num.trim());
    transactionStore.selectedCollectionContact.contact_no1 = contact1 || "";

    // Only set contact_no2 if it was provided
    transactionStore.selectedCollectionContact.contact_no2 = contact2 || null;
  },
});

async function updateCollection() {
  if (!transactionStore.selectedCollectionId) {
    console.error("No collection selected for update.");
    return;
  }
  await transactionStore.updateCollection(transactionStore.selectedCollectionId);
}
</script>
