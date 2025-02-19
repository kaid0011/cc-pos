<template>
  <div class="full-container contact-persons-management">
    <div class="customer-details-container q-pb-md">
      <q-card flat bordered>
        
        <q-btn
        dense
        label="Update"
        color="primary"
        class="secondary-button q-ma-xs q-px-sm"
        @click="openUpdateDialog(customerDetails)"
      />
        <q-card-section>
          <div class="row items-start q-gutter-md">
            <div class="col">
              <!-- <div><strong>ID:</strong> {{ customerDetails.id }}</div> -->
              <div>
                <strong>Customer Name:</strong> {{ customerDetails.name }}
              </div>
              <div>
                <strong>Customer Type:</strong> {{ customerDetails.type }}
              </div>
              <div>
                <strong>Customer Sub Type:</strong>
                {{ customerDetails.sub_type }}
              </div>
              <div>
                <strong>Contact No 1:</strong> {{ customerDetails.contact_no1 }}
              </div>
              <div>
                <strong>Contact No 2:</strong> {{ customerDetails.contact_no2 }}
              </div>
              <div><strong>Email:</strong> {{ customerDetails.email }}</div>
              <div>
                <strong>Customer Since:</strong>
                {{ formatDate(customerDetails.created_at) }}
              </div>
              <div>
                <strong>Recommended By:</strong>
                {{ customerDetails.recommended_by }}
              </div>
              <div><strong>Remarks:</strong> {{ customerDetails.remarks }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="show-addresses q-py-sm">
      <q-btn
        flat
        :icon="showAddresses ? 'arrow_drop_up' : 'arrow_drop_down'"
        label="Show Addresses"
        class="full-width text-primary show-list-tab"
        @click="toggleAddresses"
      />
      <div v-if="showAddresses" class="q-pa-md addresses-container">
        <div class="row items-center justify-between">
          <q-btn
            color="primary"
            class="main-button"
            @click="showAddAddressDialog = true"
            label="Add Address"
          />
        </div>

        <!-- Addresses Data -->
        <div class="row-col-table q-mt-md">
          <!-- Table Header -->
          <div class="row row-col-header q-px-md">
            <div class="col col-6 bordered">Address</div>
            <div class="col col-3 bordered">Type</div>
            <div class="col col-3 bordered">Actions</div>
          </div>

          <!-- Table Rows -->
          <div
            v-for="address in addresses"
            :key="address.id"
            class="row row-col-row q-mx-md"
          >
            <div class="col col-6 bordered">{{ address.block_no }} {{ address.road_name }} {{ address.unit_no }} {{ address.building_name }} {{ address.postal_code }}, ({{ address.additional_info }})</div>
            <div class="col col-3 bordered">{{ address.type || "N/A" }}</div>
            <div class="col col-3 bordered actions">
              <q-btn
                dense
                label="Update"
                color="primary"
                class="main-button q-ma-xs q-px-sm"
                @click="openUpdateAddressDialog(address)"
              />
              <q-btn
                dense
                label="Delete"
                color="negative"
                class="negative-button q-ma-xs q-px-sm"
                @click="openDeleteDialog(address, 'address')"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="show-contact-person q-py-sm">
      <q-btn
        flat
        :icon="showContactPersons ? 'arrow_drop_up' : 'arrow_drop_down'"
        label="Show Contact Persons"
        class="full-width text-primary show-list-tab"
        @click="toggleContactPersons"
      />
      <div v-if="showContactPersons" class="q-pa-md contact-persons-container">
        <div class="row items-center justify-between">
          <!-- Add Contact Person Button -->
          <q-btn
            color="primary"
            class="main-button"
            @click="showAddContactPersonDialog = true"
            label="Add Contact Person"
          />
          <!-- Search Field -->
          <div class="search-container q-pt-none">
            <q-input
              v-model="searchQuery"
              placeholder="Search contact person..."
              square
              dense
              outlined
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>

              <template v-slot:append>
                <q-icon
                  name="close"
                  @click="searchQuery = ''"
                  class="cursor-pointer"
                />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Contact Persons Data -->
        <div class="row-col-table">
          <!-- Table Header -->
          <div class="row row-col-header q-px-md">
            <div class="col col-2 bordered">Name</div>
            <div class="col col-2 bordered">Contact No 1</div>
            <div class="col col-2 bordered">Contact No 2</div>
            <div class="col col-2 bordered">Email</div>
            <div class="col col-2 bordered">Remarks</div>
            <div class="col col-2 bordered">Actions</div>
          </div>

          <!-- Table Rows -->
          <div
            v-for="person in filteredContactPersons"
            :key="person.id"
            class="row row-col-row q-mx-md"
          >
            <div class="col col-2 bordered">{{ person.name }}</div>
            <div class="col col-2 bordered">{{ person.contact_no1 }}</div>
            <div class="col col-2 bordered">{{ person.contact_no2 }}</div>
            <div class="col col-2 bordered">{{ person.email }}</div>
            <div class="col col-2 bordered">{{ person.remarks }}</div>
            <div class="col col-2 bordered actions">
              <q-btn
                dense
                label="Create Collection"
                color="primary"
                class="secondary-button q-ma-xs q-px-sm"
                @click="openCollectionDialog(person)"
              />
              <q-btn
                dense
                label="Update"
                color="primary"
                class="main-button q-ma-xs q-px-sm"
                @click="openUpdateContactDialog(person)"
              />
              <q-btn
                dense
                label="Delete"
                color="negative"
                class="negative-button q-ma-xs q-px-sm"
                @click="openDeleteDialog(person, 'contact')"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div>Customer Description / Rating</div>
      <div>Total / Average Usage</div>
      <div>Credits</div>
      <div>Outstanding Amount</div>
      <div>Invoice History</div>
      <div>Error Reports History (with view image)</div>
      <div>Outstanding Complaints History (with view image)</div>
      <div>Compensation History</div>
    </div>
    <AddContactPersonDialog
    v-model="showAddContactPersonDialog"
    @contact-added="handleContactAdded"
  />

  <UpdateContactDialog
  v-model="showUpdateContactPersonDialog"
  @contact-updated="handleContactUpdated"
/>


    <!-- Create Collection Dialog -->
    <q-dialog
      v-model="showCreateCollectionDialog"
      persistent
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card class="dialog" style="width: 500px">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">
            Create Collection
          </div>
        </q-card-section>
        <q-card-section>
          <!-- Display Contact Person Info -->
          <div class="q-mb-md">
            <div><strong>Name:</strong> {{ selectedContactPerson.name }}</div>
            <div>
              <strong>Contact No 1:</strong>
              {{ selectedContactPerson.contact_no1 }}
            </div>
            <div>
              <strong>Contact No 2:</strong>
              {{ selectedContactPerson.contact_no2 }}
            </div>
          </div>
          <!-- Collection Form -->
          <q-form @submit.prevent="createCollection" class="q-gutter-md">
            <q-input
              v-model="collectionDate"
              label="Collection Date"
              outlined
              type="date"
              required
            />
            <q-input
              v-model="collectionTime"
              label="Collection Time"
              outlined
              type="time"
              required
            />
            <q-card-actions align="right">
              <q-btn
                flat
                class="negative-button"
                @click="showCreateCollectionDialog = false"
                label="Cancel"
              />
              <q-btn
                flat
                class="main-button"
                type="submit"
                label="Create Collection"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
    <AddAddressDialog
      v-model="showAddAddressDialog"
      @address-added="handleAddressAdded"
    />
    <UpdateAddressDialog
      v-model="showUpdateAddressDialog"
      :initialAddress="selectedAddress"
      @address-updated="handleAddressUpdated"
    />
    <DeleteConfirmationDialog
    :isOpen="showDeleteDialog"
    :title="deleteDialogTitle"
    :message="deleteDialogMessage"
    @update:isOpen="showDeleteDialog = $event"
    @confirm="deleteItem"
  />
  <UpdateCustomerDialog v-model="showUpdateCustomerDialog" :customerData="selectedCustomer" @customer-updated="handleCustomerUpdated" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

import { useTransactionStore } from "@/stores/transactionStore";
import AddContactPersonDialog from "@/components/dialogs/AddContactDialog.vue";
import AddAddressDialog from "@/components/dialogs/AddAddressDialog.vue";
import UpdateContactDialog from "@/components/dialogs/UpdateContactDialog.vue";
import UpdateAddressDialog from "@/components/dialogs/UpdateAddressDialog.vue";
import DeleteConfirmationDialog from "@/components/dialogs/DeleteConfirmationDialog.vue";
import UpdateCustomerDialog from "@/components/dialogs/UpdateCustomerDialog.vue";

const transactionStore = useTransactionStore();

const route = useRoute();

// State management
const showAddresses = ref(false);
const showContactPersons = ref(false);
const showAddContactPersonDialog = ref(false);
const showUpdateContactPersonDialog = ref(false);
const showCreateCollectionDialog = ref(false);
const showAddAddressDialog = ref(false);
const showUpdateAddressDialog = ref(false);
const showDeleteDialog = ref(false);
const showUpdateCustomerDialog = ref(false);

// Deletion state variables
const deleteTarget = ref(null);
const deleteType = ref("");
const deleteDialogTitle = ref("");
const deleteDialogMessage = ref("");

const customerDetails = ref({});
const addresses = ref([]);
const contactPersons = ref([]);
const selectedContactPerson = ref({});
const selectedAddress = ref({});
const collectionDate = ref("");
const collectionTime = ref("");
const searchQuery = ref("");

// Helper function for formatting
const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
};

const loadCustomerData = async () => {
  const customerId = route.params.id;
  customerDetails.value = await transactionStore.fetchCustomerDetailsById(customerId);
  addresses.value = await transactionStore.fetchAddressesForCustomer(customerId);
  contactPersons.value = await transactionStore.fetchContactPersons(customerId);
};

// Computed filter for contacts
const filteredContactPersons = computed(() => {
  return searchQuery.value
    ? contactPersons.value.filter((person) =>
        person.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    : contactPersons.value;
});

const openDeleteDialog = (item, type) => {
  deleteTarget.value = item;
  deleteType.value = type;
  showDeleteDialog.value = true;

  if (type === "contact") {
    deleteDialogTitle.value = "Delete Contact Person";
    deleteDialogMessage.value = "Are you sure you want to delete this contact person?";
  } else {
    deleteDialogTitle.value = "Delete Address";
    deleteDialogMessage.value = "Are you sure you want to delete this address?";
  }
};

const deleteItem = async () => {
  if (!deleteTarget.value) return;

  try {
    if (deleteType.value === "contact") {
      await transactionStore.deleteContactPerson(deleteTarget.value.id);
      await loadCustomerData(); // Refresh contact persons
    } else if (deleteType.value === "address") {
      await transactionStore.deleteCustomerAddress(deleteTarget.value.id);
      await loadCustomerData(); // Refresh addresses
    }

    console.log(`${deleteType.value} deleted successfully.`);
    showDeleteDialog.value = false; // Close dialog after deletion
  } catch (error) {
    console.error(`Error deleting ${deleteType.value}:`, error);
  }
};


// Collection Actions
const openCollectionDialog = (contactPerson) => {
  selectedContactPerson.value = { ...contactPerson };
  showCreateCollectionDialog.value = true;
};

const createCollection = () => {
  console.log("Collection created for:", selectedContactPerson.value.name);
  console.log("Date:", collectionDate.value);
  console.log("Time:", collectionTime.value);
  showCreateCollectionDialog.value = false;
};

// Toggles
const toggleAddresses = () => (showAddresses.value = !showAddresses.value);
const toggleContactPersons = () =>
  (showContactPersons.value = !showContactPersons.value);


  onMounted(loadCustomerData);

  const handleContactAdded = loadCustomerData;
  const handleAddressAdded = loadCustomerData;

const openUpdateContactDialog = (contactPerson) => {
  transactionStore.setSelectedContact(contactPerson);
  showUpdateContactPersonDialog.value = true;
};

const handleContactUpdated = async () => {
  try {
    await loadCustomerData(); // Refresh contact persons after update
    showUpdateContactPersonDialog.value = false; // Close dialog
    console.log("Contact person updated successfully.");
  } catch (error) {
    console.error("Error updating contact person:", error);
  }
};

const handleAddressUpdated = async () => {
  try {
    await loadCustomerData(); // Refresh addresses after update
    showUpdateAddressDialog.value = false; // Close dialog
    console.log("Address updated successfully.");
  } catch (error) {
    console.error("Error updating address:", error);
  }
};

const openUpdateDialog = (customer) => {
  transactionStore.setSelectedCustomer(customer);
  showUpdateCustomerDialog.value = true;
};

const handleCustomerUpdated = async () => {
  await loadCustomerData();
  showUpdateCustomerDialog.value = false;
  await transactionStore.loadCustomers();
};
</script>
