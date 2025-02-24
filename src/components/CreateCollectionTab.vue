<template>
  
      <div class="col-6 right-container">
        <div class="selected-customer" v-if="selectedCustomer">
          <q-card flat class="customer-card q-pa-sm text-p">
            <q-card-section>
              <div class="text-uppercase text-weight-bold q-mb-xs">
                Selected Customer
              </div>
              <q-separator class="q-my-xs q-mb-sm" />
              <div class="row">
                <div class="col-auto text-right">
                  <div>Name:</div>
                  <div>Contact No:</div>
                  <div>Email:</div>
                </div>
                <div class="col q-pl-sm">
                  <div class="text-summary">{{ selectedCustomer.name }}</div>
                  <div class="text-summary">
                    {{ selectedCustomer.contact_no1 }} /
                    {{ selectedCustomer?.contact_no2 || "-" }}
                  </div>
                  <div class="text-summary">{{ selectedCustomer.email }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
  
          <div class="contact-selection q-mt-md">
            <!-- Collection Section -->
            <div class="q-mb-md">
              <div class="text-p text-uppercase text-weight-bold q-mt-md q-mb-xs">
                For Collection
              </div>
              <q-checkbox
                v-model="transactionStore.useCcCollection"
                @update:model-value="
                  (value) => handleCheckboxChange('collection', value)
                "
                label="Self-collect"
                class="row full-width q-mb-sm"
              />
  
              <q-btn
                outline
                class="outline-btn q-mb-sm"
                color="primary"
                label="Add Contact Person"
                @click="showAddContactPersonDialog = true"
              />
              <q-btn
                outline
                color="primary"
                label="Add Address"
                @click="showAddAddressDialog = true"
                class="outline-btn q-ml-sm q-mb-sm"
              />
  
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
              <q-select
                v-model="transactionStore.selectedCollectionAddress"
                :options="addressOptions || []"
                option-label="label"
                option-value="id"
                label="Select Collection Address"
                outlined
                dense
                clearable
                class="q-mb-xs bg-white"
              />
  
              <!-- Collection Dates -->
              <div class="row q-col-gutter-sm">
                <div class="col-6">
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
                <div class="col-6">
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
              <q-select
                v-model="transactionStore.selectedCollectionDriver"
                :options="transactionStore.driverOptions"
                option-label="label"
                option-value="id"
                label="Select Collection Driver"
                outlined
                dense
                clearable
                class="q-mb-xs bg-white"
              />
              <q-input
                v-model="transactionStore.collectionRemarks"
                label="Remarks"
                outlined
                dense
                class="q-mb-xs bg-white"
              />
            </div>
  
            <!-- Delivery Section -->
            <div>
              <div class="text-p text-uppercase text-weight-bold q-mb-xs">
                For Delivery
              </div>
              <q-checkbox
                :model-value="transactionStore.useCcDelivery"
                @update:model-value="
                  (value) => handleCheckboxChange('delivery', value)
                "
                label="Self-pickup"
                class="row full-width q-mb-sm"
              />
              <q-btn
                outline
                class="outline-btn q-mb-sm"
                color="primary"
                label="Add Contact Person"
                @click="showAddContactPersonDialog = true"
              />
              <q-btn
                outline
                color="primary"
                label="Add Address"
                @click="showAddAddressDialog = true"
                class="outline-btn q-ml-sm q-mb-sm"
              />
  
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
              <q-select
                v-model="transactionStore.selectedDeliveryAddress"
                :options="addressOptions || []"
                option-label="label"
                option-value="id"
                label="Select Delivery Address"
                outlined
                dense
                clearable
                class="q-mb-xs bg-white"
              />
  
              <!-- Delivery Dates -->
              <div class="row q-col-gutter-sm">
                <div class="col-6">
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
                    </template>
                  </q-input>
                </div>
                <div class="col-6">
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
              <q-select
                v-model="transactionStore.selectedDeliveryDriver"
                :options="transactionStore.driverOptions"
                option-label="label"
                option-value="id"
                label="Select Delivery Driver"
                outlined
                dense
                clearable
                class="q-mb-xs bg-white"
              />
  
              <q-input
                v-model="transactionStore.deliveryRemarks"
                label="Remarks"
                outlined
                dense
                class="q-mb-xs bg-white"
              />
            </div>
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
  </template>
  
  <script setup>
  import { ref, onMounted, computed, watchEffect, watch } from "vue";
  import { useTransactionStore } from "@/stores/transactionStore";
  import AddContactPersonDialog from "@/components/dialogs/AddContactDialog.vue";
  import AddAddressDialog from "@/components/dialogs/AddAddressDialog.vue";
  
  const transactionStore = useTransactionStore();
  const showAddContactPersonDialog = ref(false);
  const showAddAddressDialog = ref(false);
  
  onMounted(async () => {
    await transactionStore.loadDrivers();
    await transactionStore.loadTimeOptions();
  });
  
  const selectedCustomer = computed(() => transactionStore.selectedCustomer);
  
  // Trigger an immediate update for contactOptions when the selected customer changes
  const contactOptions = ref([]);
  const addressOptions = ref([]);
  const driverOptions = ref([]);

  const handleCheckboxChange = (type, value) => {
    if (type === "collection") {
      transactionStore.useCcCollection = value;
      transactionStore.toggleUseCcCollection(value); // Call store logic
      console.log(`Self-collect checkbox updated: ${value}`);
    } else if (type === "delivery") {
      transactionStore.useCcDelivery = value;
      transactionStore.toggleUseCcDelivery(value); // Call store logic
      console.log(`Self-pickup checkbox updated: ${value}`);
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
  
      contactOptions.value = transactionStore.contactOptions.map((contact) => ({
        id: contact.id,
        label: `${contact.name} - ${contact.contact_no1 || ''} / ${contact.contact_no2 || '-'}`,
      }));
  
      addressOptions.value = transactionStore.addressOptions.map((address) => ({
        id: address.id,
        label: `${address.block_no} ${address.road_name} ${address.unit_no} ${address.building_name}, ${address.postal_code}`,
      }));
  
      driverOptions.value = transactionStore.driverOptions.map((driver) => ({
        id: driver.id,
        label: `${driver.name} - ${driver.contact_no1 || ''}`,
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
  
  </script>
  