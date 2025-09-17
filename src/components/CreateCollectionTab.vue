<template>
  <div class="selected-customer" v-if="selectedCustomer">
    <q-card flat class="customer-card q-pa-sm text-p">
      <q-card-section>
        <div
          class="text-body1 text-center text-uppercase text-weight-bold q-mb-xs"
        >
          Selected Customer
        </div>
        <q-separator class="q-my-xs q-mb-sm" />
        <div class="row">
          <div class="col-auto text-right">
            <div>Name:</div>
            <div>Contact No:</div>
            <div v-if="selectedCustomer.email">Email:</div>
          </div>
          <div class="col q-pl-sm">
            <div class="text-summary">{{ selectedCustomer.name }}</div>
            <div class="text-summary">
              {{ selectedCustomer.contact_no1
              }}<span v-if="selectedCustomer.contact_no2">
                / {{ selectedCustomer.contact_no2 || "-" }}</span
              >
            </div>
            <div v-if="selectedCustomer.email" class="text-summary">
              {{ selectedCustomer.email }}
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="row contact-selection q-mt-md q-col-gutter-x-md">
      <!-- Collection Section -->
      <div class="col">
        <q-card flat class="customer-card q-pa-md">
          <div
            class="text-body1 text-center text-uppercase text-weight-bold q-mb-xs"
          >
            For Collection
          </div>
          <q-separator class="q-mb-md" />
          <!-- <q-checkbox
            v-model="transactionStore.useCcCollection"
            @update:model-value="
              (value) => handleCheckboxChange('collection', value)
            "
            label="Self-collect"
            class="row full-width q-mb-sm"
          /> -->

          <q-btn
            outline
            dense
            class="outline-btn q-mb-sm q-px-sm"
            color="primary"
            label="Add Contact Person"
            @click="showAddContactPersonDialog = true"
          />
          <q-btn
            outline
            dense
            color="primary"
            label="Add Address"
            @click="showAddAddressDialog = true"
            class="outline-btn q-ml-sm q-mb-sm q-px-sm"
          />
          <div>
            <div class="dialog-label">
              Contact Person<span class="dialog-asterisk">*</span>
            </div>
            <q-select
              v-model="transactionStore.selectedCollectionContact"
              :options="contactOptions || []"
              option-label="label"
              option-value="id"
              label="Select Collection Contact"
              outlined
              dense
              clearable
              class="q-mb-xs bg-white"
            />
          </div>
          <div>
            <div class="dialog-label">
              Collection Address<span class="dialog-asterisk">*</span>
            </div>
            <q-select
              v-model="transactionStore.selectedCollectionAddress"
              :options="transactionStore.addressOptions"
              option-label="label"
              option-value="id"
              label="Select Collection Address"
              outlined
              dense
              clearable
              class="q-mb-xs bg-white"
            />
          </div>
          <!-- Collection Dates -->
          <div class="row q-col-gutter-xs">
            <div class="col">
              <div class="dialog-label">
                Collection Date<span class="dialog-asterisk">*</span>
              </div>
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
                  <q-icon
                    name="close"
                    class="cursor-pointer q-ml-sm"
                    @click="clearDate('collectionDate')"
                  />
                </template>
              </q-input>
            </div>
            <div class="col">
              <div class="dialog-label">
                Collection Time<span class="dialog-asterisk">*</span>
              </div>
              <q-select
                v-model="transactionStore.collectionTime"
                :options="transactionStore.timeOptions"
                option-label="label"
                option-value="value"
                label="Select Collection Time"
                outlined
                dense
                clearable
                class="q-mb-xs bg-white"
              />
            </div>
          </div>
          <div>
            <div class="dialog-label">
              Colection Driver<span class="dialog-asterisk">*</span>
            </div>
            <q-select
              v-model="transactionStore.selectedCollectionDriver"
              :options="sortedDriverOptions"
              label="Select Collection Driver"
              outlined
              dense
              clearable
              class="q-mb-xs bg-white"
            />
          </div>
          <div class="row q-col-gutter-xs">
            <div class="col">
              <div class="dialog-label">
                Job Type<span class="dialog-asterisk">*</span>
              </div>
             <q-select
  v-model="transactionStore.jobType"
  :options="jobOptions"
  option-label="label"
  option-value="value"
  label="Select Job Type"
  outlined
  dense
  clearable
  class="q-mb-xs bg-white"
/>

            </div>
            <div class="col">
              <div class="dialog-label">
                No. of Bags<span class="dialog-asterisk">*</span>
              </div>
              <q-input
                v-model="transactionStore.collectionNoBags"
                label="No. of Bags"
                outlined
                dense
                class="q-mb-xs bg-white"
              />
            </div>
          </div>
          <div>
            <div class="dialog-label">
              Collection Remarks<span class="dialog-asterisk"></span>
            </div>
            <q-input
              v-model="transactionStore.collectionRemarks"
              label="Remarks"
              outlined
              dense
              class="q-mb-xs bg-white"
            />
          </div>
          <q-btn
            outline
            dense
            color="white"
            label="Reset Collection"
            @click="confirmReset('collection')"
            class="text-red-9 text-weight-bold q-mt-sm q-px-sm"
          />
        </q-card>
      </div>

      <!-- Delivery Section -->
      <div class="col">
        <q-card flat class="customer-card q-pa-md">
          <div
            class="text-body1 text-center text-uppercase text-weight-bold q-mb-xs"
          >
            For Delivery
          </div>
          <q-separator class="q-mb-md" />
          <!-- <q-checkbox
            :model-value="transactionStore.useCcDelivery"
            @update:model-value="
              (value) => handleCheckboxChange('delivery', value)
            "
            label="Self-pickup"
            class="row full-width q-mb-sm"
          /> -->

          <q-btn
            outline
            dense
            class="outline-btn q-mb-sm q-px-sm"
            color="primary"
            label="Add Contact Person"
            @click="showAddContactPersonDialog = true"
          />
          <q-btn
            outline
            dense
            color="primary"
            label="Add Address"
            @click="showAddAddressDialog = true"
            class="outline-btn q-ml-sm q-mb-sm q-px-sm"
          />
          <div>
            <div class="dialog-label">
              Contact Person<span class="dialog-asterisk"></span>
            </div>
            <q-select
              v-model="transactionStore.selectedDeliveryContact"
              :options="contactOptions || []"
              option-label="label"
              option-value="id"
              label="Select Delivery Contact"
              outlined
              dense
              clearable
              class="q-mb-xs bg-white"
            />
          </div>
          <div>
            <div class="dialog-label">
              Address<span class="dialog-asterisk"></span>
            </div>
            <q-select
              v-model="transactionStore.selectedDeliveryAddress"
              :options="transactionStore.addressOptions"
              option-label="label"
              option-value="id"
              label="Select Delivery Address"
              outlined
              dense
              clearable
              class="q-mb-xs bg-white"
            />
          </div>

          <!-- Delivery Dates -->
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <div class="dialog-label">
                Delivery Date<span class="dialog-asterisk">*</span>
              </div>
              <q-input
                v-model="formattedDeliveryDate"
                outlined
                dense
                readonly
                class="q-mb-xs bg-white"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                      <q-date
                        v-model="transactionStore.deliveryDate"
                        mask="YYYY-MM-DD"
                      />
                    </q-popup-proxy>
                  </q-icon>
                  <q-icon
                    name="close"
                    class="cursor-pointer q-ml-sm"
                    @click="clearDate('deliveryDate')"
                  />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <div class="dialog-label">
                Delivery Time<span class="dialog-asterisk"></span>
              </div>
              <q-select
                v-model="transactionStore.deliveryTime"
                :options="transactionStore.timeOptions"
                option-label="label"
                option-value="value"
                label="Select Delivery Time"
                outlined
                dense
                clearable
                class="q-mb-xs bg-white"
              />
            </div>
          </div>
          <div>
            <div class="dialog-label">
              Delivery Driver<span class="dialog-asterisk"></span>
            </div>
            <q-select
              v-model="transactionStore.selectedDeliveryDriver"
              :options="sortedDriverOptions"
              label="Select Delivery Driver"
              outlined
              dense
              clearable
              class="q-mb-xs bg-white"
            />
          </div>
          <div>
            <div class="dialog-label">
              Delivery Remarks<span class="dialog-asterisk"></span>
            </div>
            <q-input
              v-model="transactionStore.deliveryRemarks"
              label="Remarks"
              outlined
              dense
              class="q-mb-xs bg-white"
            />
          </div>
          <q-btn
            outline
            dense
            color="white"
            label="Reset Delivery"
            @click="confirmReset('delivery')"
            class="text-red-9 text-weight-bold q-mt-sm q-px-sm"
          />
        </q-card>
      </div>
    </div>
  </div>

  <AddContactPersonDialog
    v-model="showAddContactPersonDialog"
    @contact-added="handleContactAdded"
  />

  <AddAddressDialog
    v-model="showAddAddressDialog"
    @address-added="handleAddressAdded"
  />

  <!-- Confirmation Dialog -->
  <q-dialog v-model="showConfirmation">
    <q-card>
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Confirm Reset
        </div>
      </q-card-section>

      <q-card-section class="dialog-body">
        <p>
          Are you sure you want to reset this section? This action cannot be
          undone.
        </p>

        <q-card-actions align="right">
          <q-btn
            class="dialog-button"
            unelevated
            label="Cancel"
            color="negative"
            @click="showConfirmation = false"
          />
          <q-btn
            class="dialog-button"
            unelevated
            label="Yes"
            color="primary"
            @click="confirmAction"
          />
        </q-card-actions>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed, watchEffect, watch } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import AddContactPersonDialog from "@/components/dialogs/AddContactDialog.vue";
import AddAddressDialog from "@/components/dialogs/AddAddressDialog.vue";

const transactionStore = useTransactionStore();
const showAddContactPersonDialog = ref(false);
const showAddAddressDialog = ref(false);

// Local, hard-coded job types (label/value pair for <q-select>)
const jobOptions = [
  { label: "Laundry",               value: "LAUNDRY" },
  { label: "R&I",                   value: "RI" },
  { label: "R&I Quotation",         value: "RI_QUOTATION" },
  { label: "Onsite Carpet Cleaning",value: "ONSITE_CARPET_CLEANING" },
  { label: "Onsite Quotation",      value: "ONSITE_QUOTATION" },
  { label: "Onsite Sofa Cleaning",  value: "ONSITE_SOFA_CLEANING" },
  { label: "Others",                value: "OTHERS" }
];

onMounted(async () => {
  await transactionStore.loadDrivers();
  await transactionStore.loadTimeOptions();
});

// Auto-update delivery date when collection date changes
watch(
  () => transactionStore.collectionDate,
  (newDate) => {
    if (newDate) {
      const newDeliveryDate = addWorkingDays(newDate, 7);
      transactionStore.deliveryDate = newDeliveryDate;
    }
  }
);

// auto update order_no based on collection driver
watch(
  () => transactionStore.selectedCollectionDriver,
  async (newDriver, oldDriver) => {
    if (newDriver && newDriver !== oldDriver) {
      try {
        transactionStore.order_no = await transactionStore.generateOrderNo();
      } catch (error) {
        console.error("Failed to generate order number:", error);
      }
    }
  }
);

const selectedCustomer = computed(() => transactionStore.selectedCustomer);

// Trigger an immediate update for contactOptions when the selected customer changes
const contactOptions = ref([]);
const addressOptions = ref([]);
const driverOptions = ref([]);

const sortedDriverOptions = computed(() => {
  return transactionStore.driverOptions
    .map((driver) => driver.name)
    .sort((a, b) => a.localeCompare(b));
});

const handleCheckboxChange = (type, value) => {
  if (type === "collection") {
    transactionStore.useCcCollection = value;
    transactionStore.toggleUseCcCollection(value); // Call store logic
    // console.log(`Self-collect checkbox updated: ${value}`);
  } else if (type === "delivery") {
    transactionStore.useCcDelivery = value;
    transactionStore.toggleUseCcDelivery(value); // Call store logic
    // console.log(`Self-pickup checkbox updated: ${value}`);
  }
};

const handleContactAdded = async () => {
  console.log("Contact person successfully added");
  showAddContactPersonDialog.value = false;
  await updateOptions(); // Refresh contact list
};

const handleAddressAdded = async () => {
  console.log("Address successfully added");
  showAddAddressDialog.value = false;
  await updateOptions(); // Refresh address list
};

const formattedCollectionDate = computed(() =>
  formatDate(transactionStore.collectionDate)
);
const formattedDeliveryDate = computed(() =>
  formatDate(transactionStore.deliveryDate)
);

function addWorkingDays(startDate, workingDays) {
  let date = new Date(startDate);
  while (workingDays > 0) {
    date.setDate(date.getDate() + 1); // Move to the next day
    // Check if it's a weekday (Monday to Friday)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      workingDays--;
    }
  }
  return date.toISOString().split("T")[0]; // Return date in YYYY-MM-DD format
}

// Function to format dates as "Thu, 30/01/2025"
const formatDate = (dateString) => {
  if (!dateString) return "--/--/----"; // If the date is missing or null, return "--/--/----"

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "--/--/----"; // If the date is invalid, return "--/--/----"

  return date.toLocaleDateString("en-GB", {
    weekday: "short", // "Thu"
    day: "2-digit", // "30"
    month: "2-digit", // "01"
    year: "numeric", // "2025"
  });
};

const updateOptions = async () => {
  try {
    const customerId = transactionStore.selectedCustomer?.id || null;
    await Promise.all([
      transactionStore.loadContactOptions(customerId),
      transactionStore.loadAddressOptions(customerId),
    ]);

    transactionStore.collectionDate = new Date().toISOString().split("T")[0];
    transactionStore.deliveryDate = addWorkingDays(new Date(), 7);
    transactionStore.ready_by = addWorkingDays(new Date(), 7);

    contactOptions.value = transactionStore.contactOptions.map((contact) => ({
      id: contact.id,
      name: contact.name,
      contact_no1: contact.contact_no1,
      contact_no2: contact.contact_no2,
      label: `${contact.name} - ${contact.contact_no1 || ""}${
        contact.contact_no2 ? ` / ${contact.contact_no2}` : ""
      }`,
    }));

    addressOptions.value = transactionStore.addressOptions.map((address) => ({
      id: address.id,
      label: `${address.block_no} ${address.road_name} ${address.unit_no} ${address.building_name}, ${address.postal_code}`,
    }));

    driverOptions.value = transactionStore.driverOptions.map((driver) => ({
      id: driver.id,
      label: `${driver.name} - ${driver.contact_no1 || ""}`,
    }));
  } catch (error) {
    console.error("Error updating options:", error);
  }
};

onMounted(async () => {
  await updateOptions();
});

watchEffect(() => {
  updateOptions();
});

// Function to Clear Date Input
const clearDate = (dateType) => {
  switch (dateType) {
    case "collectionDate":
      transactionStore.collectionDate = new Date().toISOString().split("T")[0];
      break;
    case "deliveryDate":
      transactionStore.deliveryDate = addWorkingDays(new Date(), 7);
      break;
  }
};

// Reset Collection Inputs
const resetCollection = () => {
  transactionStore.selectedCollectionContact = null;
  transactionStore.selectedCollectionAddress = null;
  transactionStore.collectionDate = new Date().toISOString().split("T")[0];
  transactionStore.collectionTime = null;
  transactionStore.selectedCollectionDriver = null;
  transactionStore.collectionRemarks = "";
  transactionStore.ready_by = addWorkingDays(new Date(), 7);
};

// Reset Delivery Inputs
const resetDelivery = () => {
  transactionStore.selectedDeliveryContact = null;
  transactionStore.selectedDeliveryAddress = null;
  transactionStore.deliveryDate = addWorkingDays(new Date(), 7);
  transactionStore.deliveryTime = null;
  transactionStore.selectedDeliveryDriver = null;
  transactionStore.deliveryRemarks = "";
};

// Confirmation State
const showConfirmation = ref(false);
const actionToConfirm = ref(null);

// Confirm Reset Action
const confirmReset = (section) => {
  actionToConfirm.value = section;
  showConfirmation.value = true;
};

// Perform the Confirmed Action
const confirmAction = () => {
  if (actionToConfirm.value === "collection") {
    resetCollection();
  } else if (actionToConfirm.value === "delivery") {
    resetDelivery();
  }
  showConfirmation.value = false;
};
</script>
