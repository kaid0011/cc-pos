<template>
  <div class="full-container contact-persons-management">
    <div class="customer-details-container q-pb-md">
      <q-card flat bordered>
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
                <strong>Organisation / Department:</strong>
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
                {{ customerDetails.created_at }}
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
            <div class="col col-6 bordered">{{ address.block_no }} {{ address.road_name }} {{ address.building_name }} {{ address.lot_no }}, {{ address.postal_code }}, ({{ address.additional_info }})</div>
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
                @click="openDeleteAddressDialog(address)"
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
                @click="openUpdateDialog(person)"
              />
              <q-btn
                dense
                label="Delete"
                color="negative"
                class="negative-button q-ma-xs q-px-sm"
                @click="openDeleteDialog(person)"
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
    <!-- Add Contact Person Dialog -->
    <q-dialog
      v-model="showAddContactPersonDialog"
      persistent
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card class="dialog" style="width: 500px">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">
            Add New Contact Person
          </div>
        </q-card-section>
        <q-card-section>
          <!-- Add Contact Person Form -->
          <q-form @submit.prevent="addContactPerson" class="q-gutter-md">
            <q-input
              v-model="newContactPerson.name"
              label="Name"
              outlined
              required
            />
            <q-input
              v-model="newContactPerson.contact_no1"
              label="Contact No 1"
              outlined
            />
            <q-input
              v-model="newContactPerson.contact_no2"
              label="Contact No 2"
              outlined
            />
            <q-input v-model="newContactPerson.email" label="Email" outlined />
            <q-input
              v-model="newContactPerson.remarks"
              label="Remarks"
              outlined
            />
            <q-card-actions align="right">
              <q-btn
                flat
                class="negative-button"
                @click="showAddContactPersonDialog = false"
                label="Cancel"
              />
              <q-btn
                flat
                class="main-button"
                type="submit"
                label="Add Contact Person"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Update Contact Person Dialog -->
    <q-dialog
      v-model="showUpdateContactPersonDialog"
      persistent
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card class="dialog" style="width: 500px">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">
            Update Contact Person
          </div>
        </q-card-section>
        <q-card-section>
          <!-- Update Contact Person Form -->
          <q-form @submit.prevent="updateContactPerson" class="q-gutter-md">
            <q-input
              v-model="selectedContactPerson.name"
              label="Name"
              outlined
              required
            />
            <q-input
              v-model="selectedContactPerson.contact_no1"
              label="Contact No 1"
              outlined
            />
            <q-input
              v-model="selectedContactPerson.contact_no2"
              label="Contact No 2"
              outlined
            />
            <q-input
              v-model="selectedContactPerson.email"
              label="Email"
              outlined
            />
            <q-input
              v-model="selectedContactPerson.remarks"
              label="Remarks"
              outlined
            />
            <q-card-actions align="right">
              <q-btn
                flat
                class="negative-button"
                @click="showUpdateContactPersonDialog = false"
                label="Cancel"
              />
              <q-btn
                flat
                class="main-button"
                type="submit"
                label="Update Contact Person"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog
      v-model="showDeleteContactPersonDialog"
      persistent
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card class="dialog" style="width: 500px">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">
            Delete Contact Person
          </div>
        </q-card-section>
        <q-card-section>
          <p>Are you sure you want to delete this contact person?</p>
          <q-card-actions align="right">
            <q-btn
              flat
              class="negative-button"
              label="No"
              @click="showDeleteContactPersonDialog = false"
            />
            <q-btn
              flat
              class="main-button"
              label="Yes"
              @click="deleteContactPerson"
            />
          </q-card-actions>
        </q-card-section>
      </q-card>
    </q-dialog>

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
    <q-dialog v-model="showAddAddressDialog" persistent>
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">Add New Address</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="addAddress(newAddress)">
            <q-input v-model="newAddress.address" label="Address" outlined />
            <q-input v-model="newAddress.type" label="Type" outlined />
            <q-card-actions align="right">
              <q-btn
                flat
                label="Cancel"
                @click="showAddAddressDialog = false"
              />
              <q-btn flat label="Add" type="submit" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showUpdateAddressDialog" persistent>
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">Update Address</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="updateAddress(selectedAddress)">
            <q-input
              v-model="selectedAddress.address"
              label="Address"
              outlined
            />
            <q-input v-model="selectedAddress.type" label="Type" outlined />
            <q-card-actions align="right">
              <q-btn
                flat
                label="Cancel"
                @click="showUpdateAddressDialog = false"
              />
              <q-btn flat label="Update" type="submit" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- Delete Confirmation Dialog -->
    <q-dialog
      v-model="showDeleteAddressDialog"
      persistent
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card class="dialog" style="width: 500px">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">
            Delete Address
          </div>
        </q-card-section>
        <q-card-section>
          <p>Are you sure you want to delete this address?</p>
          <q-card-actions align="right">
            <q-btn
              flat
              class="negative-button"
              label="No"
              @click="showDeleteAddressDialog = false"
            />
            <q-btn
              flat
              class="main-button"
              label="Yes"
              @click="deleteAddress"
            />
          </q-card-actions>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

import { fetchAllCustomers } from "@/../supabase/api/customers.js";
import {
  fetchContactPersonsByCustomerId,
  createContactPerson,
  updateContactPersons,
  deleteContactPersons,
} from "@/../supabase/api/contacts.js";
import {
  fetchAddressesByCustomerId,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
} from "@/../supabase/api/addresses.js";

const route = useRoute();
const customerDetails = ref({});
const addresses = ref([]);
const contactPersons = ref([]);

// State management
const showAddresses = ref(false);
const showContactPersons = ref(false);
const showAddContactPersonDialog = ref(false);
const showUpdateContactPersonDialog = ref(false);
const showDeleteContactPersonDialog = ref(false);
const showCreateCollectionDialog = ref(false);
const showAddAddressDialog = ref(false);
const showUpdateAddressDialog = ref(false);
const showDeleteAddressDialog = ref(false);

// Selected and new items
const newContactPerson = ref({
  name: "",
  contact_no1: "",
  contact_no2: "",
  email: "",
  remarks: "",
});
const selectedContactPerson = ref({});
const newAddress = ref({});
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

// Loaders
const loadCustomerDetails = async () => {
  try {
    const allCustomers = await fetchAllCustomers();
    const customer = allCustomers.find(
      (c) => c.id === parseInt(route.params.id, 10)
    );
    if (customer) {
      customerDetails.value = {
        ...customer,
        created_at: formatDate(customer.created_at),
      };
    } else {
      console.error(`Customer with ID ${route.params.id} not found.`);
    }
  } catch (error) {
    console.error("Error fetching customer details:", error);
  }
};

const loadAddresses = async () => {
  try {
    addresses.value = await fetchAddressesByCustomerId(route.params.id);
  } catch (error) {
    console.error("Error loading addresses:", error);
  }
};

const loadContactPersons = async () => {
  try {
    contactPersons.value = await fetchContactPersonsByCustomerId(
      route.params.id
    );
  } catch (error) {
    console.error("Error loading contact persons:", error);
  }
};

// Address Actions
const addAddress = async () => {
  try {
    await createCustomerAddress({
      ...newAddress.value,
      customer_id: route.params.id,
    });
    await loadAddresses();
    showAddAddressDialog.value = false;
  } catch (error) {
    console.error("Error adding address:", error);
  }
};

const updateAddress = async () => {
  try {
    await updateCustomerAddress(selectedAddress.value);
    await loadAddresses();
    showUpdateAddressDialog.value = false;
  } catch (error) {
    console.error("Error updating address:", error);
  }
};

const deleteAddress = async () => {
  try {
    await deleteCustomerAddress(selectedAddress.value.id);
    await loadAddresses();
    showDeleteAddressDialog.value = false;
  } catch (error) {
    console.error("Error deleting address:", error);
  }
};

// Address Dialog Controls
const openUpdateAddressDialog = (address) => {
  selectedAddress.value = { ...address };
  showUpdateAddressDialog.value = true;
};

const openDeleteAddressDialog = (address) => {
  selectedAddress.value = { ...address };
  showDeleteAddressDialog.value = true;
};

// Contact Person Actions
const addContactPerson = async () => {
  try {
    await createContactPerson({
      ...newContactPerson.value,
      customer_id: route.params.id,
    });
    await loadContactPersons();
    showAddContactPersonDialog.value = false;
  } catch (error) {
    console.error("Error adding contact person:", error);
  }
};

const updateContactPerson = async () => {
  try {
    await updateContactPersons(selectedContactPerson.value);
    await loadContactPersons();
    showUpdateContactPersonDialog.value = false;
  } catch (error) {
    console.error("Error updating contact person:", error);
  }
};

const deleteContactPerson = async () => {
  try {
    await deleteContactPersons(selectedContactPerson.value.id);
    await loadContactPersons();
    showDeleteContactPersonDialog.value = false;
  } catch (error) {
    console.error("Error deleting contact person:", error);
  }
};

// Contact Person Dialog Controls
const openUpdateDialog = (contactPerson) => {
  selectedContactPerson.value = { ...contactPerson };
  showUpdateContactPersonDialog.value = true;
};

const openDeleteDialog = (contactPerson) => {
  selectedContactPerson.value = { ...contactPerson };
  showDeleteContactPersonDialog.value = true;
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

// Filtering
const filteredContactPersons = computed(() => {
  if (!searchQuery.value) return contactPersons.value;
  return contactPersons.value.filter((person) =>
    Object.values(person).some((val) =>
      String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  );
});

// Lifecycle Hooks
onMounted(async () => {
  await loadCustomerDetails();
  await loadAddresses();
  await loadContactPersons();
});
</script>
