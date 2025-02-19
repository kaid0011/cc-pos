<template>
  <div class="customer-tab main-container row">
    <div class="col-6 left-container">
      <div class="text-uppercase text-weight-bold text-center q-mb-sm">
        Select a customer
      </div>
      <!-- Search Input -->
      <q-input
        v-model="searchTerm"
        placeholder="Search customer name, contact no, or email..."
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
          <div class="col-4">
            {{ customer.contact_no1 }} / {{ customer.contact_no2 || "-" }}
          </div>
          <div class="col-4">{{ customer.email }}</div>
        </div>
      </div>
    </div>

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
              <div>
                <q-input
                  :model-value="formatDate(transactionStore.collectionDate)"
                  label="Collection Date"
                  outlined
                  dense
                  class="q-mb-xs bg-white"
                  type="text"
                  readonly
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
              <div>
                <q-input
                  :model-value="formatDate(transactionStore.deliveryDate)"
                  label="Delivery Date"
                  outlined
                  dense
                  class="q-mb-xs bg-white"
                  type="text"
                  readonly
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AddCustomerDialog
    v-model="showAddCustomerDialog"
    @customer-added="handleCustomerAdded"
  />

  <AddContactPersonDialog
  v-model="showAddContactPersonDialog"
  @contact-added="handleContactAdded"
/>

<AddAddressDialog
    v-model="showAddAddressDialog"
    @address-added="handleAddressAdded"
  />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watchEffect, watch } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import AddCustomerDialog from "@/components/dialogs/AddCustomerDialog.vue";
import AddContactPersonDialog from "@/components/dialogs/AddContactDialog.vue";
import AddAddressDialog from "@/components/dialogs/AddAddressDialog.vue";

const transactionStore = useTransactionStore();
const searchTerm = ref("");

const showAddCustomerDialog = ref(false);
const showAddContactPersonDialog = ref(false);
const showAddAddressDialog = ref(false);

const filteredCustomers = computed(() => {
  return transactionStore.customers.filter((customer) => {
    const searchLower = searchTerm.value.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.contact_no1.toLowerCase().includes(searchLower) ||
      (customer.contact_no2 &&
        customer.contact_no2.toLowerCase().includes(searchLower)) ||
      customer.email.toLowerCase().includes(searchLower)
    );
  });
});

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
      label: `${contact.name} - ${contact.contact_no1 || ""} / ${
        contact.contact_no2 || "-"
      }`,
    }));

    addressOptions.value = transactionStore.addressOptions.map((address) => ({
      id: address.id,
      label: `${address.block_no} ${address.road_name} ${address.unit_no} ${
        address.building_name
      }, ${address.postal_code} (${address?.additional_info || ""})`,
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

    transactionStore.useCcCollection = false;
    transactionStore.useCcDelivery = false;
    transactionStore.selectedCollectionContact = null;
    transactionStore.selectedDeliveryContact = null;
    transactionStore.selectedCollectionAddress = null;
    transactionStore.selectedDeliveryAddress = null;

    // Set the selected customer in the store
    await transactionStore.setSelectedCustomer(customer);

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
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  return date.toLocaleDateString("en-GB", options);
};

onMounted(() => {
  const today = new Date().toISOString().split("T")[0]; // Format today's date as YYYY-MM-DD

  // Initialize collection dates to today's date
  transactionStore.collectionDate = today;

  // Calculate delivery dates (7 working days from today)
  const deliveryDate = addWorkingDays(new Date(), 7);

  transactionStore.deliveryDate = deliveryDate;

  console.log(`Initialized collection date: ${today}`);
  console.log(`Initialized delivery date: ${deliveryDate}`);
});

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

const handleCustomerAdded = async () => {
  console.log("Customer successfully added");
  showAddCustomerDialog.value = false;
  await updateOptions(); // Refresh customer list
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

</script>
