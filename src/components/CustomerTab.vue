<template>
  <div class="customer-tab main-container row">
    <div class="col-6 left-container">
      <div class="text-uppercase text-weight-bold text-center q-mb-sm">
        Select a customer
      </div>
      <!-- Search Input -->
      <q-input
        v-model="searchTerm"
        placeholder="Search customers..."
        square
        dense
        outlined
        class="search-input q-mb-md"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
        <template v-slot:append>
          <q-icon
            name="close"
            @click="searchTerm = ''"
            class="cursor-pointer"
          />
        </template>
      </q-input>

      <!-- Add Customer Button -->
      <q-btn
        outline
        color="primary"
        label="Click Here to Add a Customer"
        @click="showAddCustomerDialog = true"
        class="outline-btn q-mt-md q-mb-sm"
      />

      <!-- Customer List -->
      <div class="customer-list">
        <div class="row customer-header">
          <div class="col-4">Customer Name</div>
          <div class="col-4">Contact No.</div>
          <div class="col-4">Email</div>
        </div>
        <div
          v-if="filteredCustomers.length === 0"
          class="text-center text-grey q-my-md"
        >
          No existing customers.
        </div>
        <div
          v-else
          v-for="customer in filteredCustomers"
          :key="customer.id"
          class="row customer-row"
          @click="selectCustomer(customer)"
        >
          <div class="col-4">{{ customer.name }}</div>
          <div class="col-4">{{ customer.contact_no1 }}</div>
          <div class="col-4">{{ customer.email }}</div>
        </div>
      </div>
    </div>

    <div class="col-6 right-container">
      <div class="selected-customer" v-if="selectedCustomer">
        <q-card flat class="customer-card q-pa-sm text-large">
          <q-card-section>
            <div class="text-p text-uppercase text-weight-bold q-mb-xs">
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
                <div class="text-summary">{{ selectedCustomer.contact_no1 }} / {{ selectedCustomer?.contact_no2 || '-' }} </div>
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
              :model-value="transactionStore.useCcCollection"
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
              <div class="col">
                <q-input
                  v-model="transactionStore.collectionDateFrom"
                  label="Collection Date From"
                  outlined
                  dense
                  class="q-mb-xs bg-white"
                  type="date"
                />
              </div>
              <div class="col">
                <q-input
                  v-model="transactionStore.collectionDateTo"
                  label="Collection Date To"
                  outlined
                  dense
                  class="q-mb-xs bg-white"
                  type="date"
                />
              </div>
            </div>
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
              <div class="col">
                <q-input
                  v-model="transactionStore.deliveryDateFrom"
                  label="Delivery Date From"
                  outlined
                  dense
                  class="q-mb-xs bg-white"
                  type="date"
                />
              </div>
              <div class="col">
                <q-input
                  v-model="transactionStore.deliveryDateTo"
                  label="Delivery Date To"
                  outlined
                  dense
                  class="q-mb-xs bg-white"
                  type="date"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Contact Person Dialog -->
    <q-dialog v-model="showAddContactPersonDialog" persistent>
      <q-card style="width: 400px">
        <q-card-section class="dialog-header">
          <div class="text-weight-bold text-h6">Add Contact Person</div>
        </q-card-section>
        <q-card-section class="dialog-body">
          <q-form @submit.prevent="addContactPerson">
            <q-input
              v-model="newContactPerson.name"
              label="Name"
              class="dialog-inputs"
              outlined
            />
            <q-input
              v-model="newContactPerson.contact_no1"
              label="Contact No 1"
              class="dialog-inputs"
              outlined
            />
            <q-input
              v-model="newContactPerson.contact_no2"
              label="Contact No 2"
              class="dialog-inputs"
              outlined
            />
            <q-input
              v-model="newContactPerson.email"
              class="dialog-inputs"
              label="Email"
              outlined
            />
            <q-card-actions align="right">
              <q-btn
                label="Cancel"
                color="negative"
                @click="showAddContactPersonDialog = false"
              />
              <q-btn label="Add" color="primary" type="submit" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Add Address Dialog -->
<!-- Add Address Dialog -->
<q-dialog v-model="showAddAddressDialog" persistent>
  <q-card style="width: 400px">
    <q-card-section class="dialog-header">
      <div class="text-weight-bold text-h6">Add Address</div>
    </q-card-section>
    <q-card-section class="dialog-body">
      <q-form @submit.prevent="addAddress">
        <!-- Postal Code Input -->
        <q-input
          v-model="newAddress.postal_code"
          class="dialog-inputs"
          label="Postal Code"
          outlined
        />
        <q-btn
          label="Search Address"
          color="primary"
          @click="searchAddress"
          class="q-mb-sm"
        />

        <!-- Display Address Fields -->
        <q-input
          v-model="newAddress.block_no"
          label="Block Number"
          outlined
          class="dialog-inputs"
        />
        <q-input
          v-model="newAddress.road_name"
          label="Road Name"
          outlined
          class="dialog-inputs"
        />
        <q-input
          v-model="newAddress.building_name"
          label="Building Name"
          outlined
          class="dialog-inputs"
        />
        <q-input
          v-model="newAddress.postal_code"
          label="Postal Code"
          outlined
          class="dialog-inputs"
        />
        
        <q-input
          v-model="newAddress.unit_no"
          label="Unit No"
          outlined
          class="dialog-inputs"
        />
        <q-input
        v-model="newAddress.additional_info"
        label="Additional Info"
        outlined
        class="dialog-inputs"
      />

        <q-card-actions align="right">
          <q-btn
            label="Cancel"
            color="negative"
            @click="showAddAddressDialog = false"
          />
          <q-btn label="Add" color="primary" type="submit" />
        </q-card-actions>
      </q-form>
    </q-card-section>
  </q-card>
</q-dialog>

    <!-- Add Customer Dialog -->
    <q-dialog v-model="showAddCustomerDialog" persistent>
      <q-card style="width: 400px">
        <q-card-section class="dialog-header">
          <div class="text-weight-bold text-h6">Add Customer</div>
        </q-card-section>
        <q-card-section class="dialog-body">
          <q-form @submit.prevent="addCustomer">
            <q-input
              v-model="newCustomer.name"
              label="Name"
              outlined
              required
              class="dialog-inputs"
            />
            <q-input
              v-model="newCustomer.contact_no1"
              label="Contact No 1"
              outlined
              required
              class="dialog-inputs"
            />
            <q-input
              v-model="newCustomer.contact_no2"
              label="Contact No 2"
              outlined
              class="dialog-inputs"
            />
            <q-input
              v-model="newCustomer.email"
              label="Email"
              outlined
              class="dialog-inputs"
            />

            <q-input
              v-model="newCustomer.type"
              label="Customer Type"
              outlined
              class="dialog-inputs"
            />

            <q-input
              v-model="newCustomer.sub_type"
              label="Sub-Type"
              outlined
              class="dialog-inputs"
            />
            <q-card-actions align="right">
              <q-btn
                label="Cancel"
                color="negative"
                @click="showAddCustomerDialog = false"
              />
              <q-btn label="Add" color="primary" type="submit" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watchEffect } from "vue";
import { callOneMapAPI } from "@/services/onemapService";
import { useTransactionStore } from "@/stores/transactionStore";

const transactionStore = useTransactionStore();
const searchTerm = ref("");

const newCustomer = ref({
  name: "",
  contact_no1: "",
  contact_no2: "",
  email: "",
  type: "Self-collect",
  sub_type: "Individual",
});

const newContactPerson = ref({
  name: "",
  contact_no1: "",
  contact_no2: "",
  email: "",
});

const newAddress = ref({
  postal_code: "",
  block_no: "",
  road_name: "",
  building_name: "",
  unit_no: "",
  additional_info: "",
});


const showAddCustomerDialog = ref(false);
const showAddContactPersonDialog = ref(false);
const showAddAddressDialog = ref(false);

const filteredCustomers = computed(() =>
  transactionStore.customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
);

const selectedCustomer = computed(() => transactionStore.selectedCustomer);

// Trigger an immediate update for contactOptions when the selected customer changes
const contactOptions = ref([]);
const addressOptions = ref([]);

const updateOptions = async () => {
  try {
    const customerId = transactionStore.selectedCustomer?.id || null;
    await Promise.all([
      transactionStore.loadContactOptions(customerId),
      transactionStore.loadAddressOptions(customerId),
    ]);

    contactOptions.value = transactionStore.contactOptions.map((contact) => ({
      id: contact.id,
      label: `${contact.name} - ${contact.contact_no1 || ''}`,
    }));

    addressOptions.value = transactionStore.addressOptions.map((address) => ({
      id: address.id,
      label: `${address.block_no} ${address.road_name} ${address.unit_no} ${address.building_name}, ${address.postal_code} (${address?.additional_info || ''})`,
    }));

    console.log("Contact and Address Options Updated:", {
      contactOptions: contactOptions.value,
      addressOptions: addressOptions.value,
    });
  } catch (error) {
    console.error("Error updating options:", error);
  }
};


// Watch for changes in the selected customer
watchEffect(() => {
  updateOptions();
});

onMounted(async () => {
  await transactionStore.loadCustomers();
  updateOptions();
});

const selectCustomer = async (customer) => {
  try {
    // Set the selected customer in the store
    await transactionStore.setSelectedCustomer(customer);

    // Set default 'Self-collect' checkbox to checked
    transactionStore.useCcCollection = true; // Set the default value
    handleCheckboxChange("collection", true); // Trigger any associated logic

    // Load recurring instructions for the selected customer
    if (customer?.id) {
      await transactionStore.fetchRecurringInstructions(customer.id);
      console.log(
        "Loaded instructions for the selected customer:",
        transactionStore.displayInstructions
      );
    }

    // Update contact and address options
    await updateOptions();

    console.log("Customer selected successfully:", customer);
  } catch (error) {
    console.error("Error selecting customer:", error);
  }
};

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

onMounted(() => {
  const today = new Date().toISOString().split("T")[0]; // Format today's date as YYYY-MM-DD

  // Initialize collection dates to today's date
  transactionStore.collectionDateFrom = today;
  transactionStore.collectionDateTo = today;

  // Calculate delivery dates (7 working days from today)
  const deliveryDateFrom = addWorkingDays(new Date(), 7);
  const deliveryDateTo = addWorkingDays(new Date(), 7);

  transactionStore.deliveryDateFrom = deliveryDateFrom;
  transactionStore.deliveryDateTo = deliveryDateTo;

  console.log(`Initialized collection dates: ${today}`);
  console.log(`Initialized delivery dates: ${deliveryDateFrom} to ${deliveryDateTo}`);
});

const addCustomer = async () => {
  transactionStore.createCustomer(newCustomer.value);
  showAddCustomerDialog.value = false;
  newCustomer.value = {
    name: "",
    contact_no1: "",
    contact_no2: "",
    email: "",
    type: "Self-collect",
    sub_type: "Individual",
  };
  await updateOptions();
};

const addContactPerson = async () => {
  transactionStore.addContactPerson(newContactPerson.value);
  showAddContactPersonDialog.value = false;
  newContactPerson.value = {
    name: "",
    contact_no1: "",
    contact_no2: "",
    email: "",
  };
  await updateOptions();
};

const addAddress = async () => {
  if (!newAddress.value.block_no || !newAddress.value.road_name) {
    console.error("Address is incomplete. Ensure all fields are filled.");
    return;
  }

  try {
    // Convert all address fields to uppercase
    const upperCasedAddress = {
      postal_code: newAddress.value.postal_code.toUpperCase(),
      block_no: newAddress.value.block_no.toUpperCase(),
      road_name: newAddress.value.road_name.toUpperCase(),
      building_name: newAddress.value.building_name.toUpperCase(),
      unit_no: newAddress.value.unit_no.toUpperCase(),
      additional_info: newAddress.value.additional_info.toUpperCase(),
    };

    // Pass the transformed address to the transaction store
    await transactionStore.addAddress(upperCasedAddress);
    console.log("Address added successfully:", upperCasedAddress);

    // Close the dialog
    showAddAddressDialog.value = false;

    // Reset the form
    newAddress.value = {
      postal_code: "",
      block_no: "",
      road_name: "",
      building_name: "",
      unit_no: "",
      additional_info: "",
    };
  } catch (error) {
    console.error("Error adding address:", error.message);
  }
};

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

const searchAddress = async () => {
  const postalCode = newAddress.value.postal_code;

  if (!postalCode) {
    console.error("Postal code is required");
    return;
  }

  try {
    // Perform a search using the centralized API call function
    const data = await callOneMapAPI("/common/elastic/search", {
      searchVal: postalCode,
      returnGeom: "Y",
      getAddrDetails: "Y",
      pageNum: 1,
    });

    if (data.results && data.results.length > 0) {
      const result = data.results[0]; // Take the first result

      // Map API response to `newAddress`
      newAddress.value.block_no = result.BLK_NO || "N/A";
      newAddress.value.road_name = result.ROAD_NAME || "N/A";
      newAddress.value.building_name = result.BUILDING || "N/A";
      newAddress.value.postal_code = result.POSTAL || postalCode.toUpperCase();

      console.log("Address search result mapped to newAddress:", newAddress.value);
    } else {
      console.error("No address found for the provided postal code.");
    }
  } catch (error) {
    console.error("Error fetching address:", error.message);
  }
};



</script>
