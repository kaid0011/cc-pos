<template>
  <div class="row justify-center page-title-header text-uppercase">
    Customer Details
  </div>
  <div class="full-container contact-persons-management">
    <q-btn
      dense
      flat
      label="Create Collection"
      class="bg-primary text-white full-width q-px-sm"
      @click="openCollectionDialog(customerDetails)"
    />
    <div class="page-1-container p-exception text-subtitle1">
      <div class="row">
        <div class="col bordered p-min">
          <div class="row justify-center">
            <span
              class="subheadline text-h6 text-weight-bolder text-uppercase text-center"
            >
              Customer Details
            </span>
          </div>

          <q-btn
            unelevated
            outline
            dense
            label="Update Customer Details"
            color="primary"
            class="q-mb-sm full-width"
            @click="openUpdateCustomerDialog(customerDetails)"
          />
          <div class="">
            <!-- <div><strong>ID:</strong> {{ customerDetails.id }}</div> -->
            <div>
              <strong>Customer Name:</strong> {{ customerDetails.name }}
            </div>
            <div>
              <strong>Contact Nos:</strong> {{ customerDetails.contact_no1
              }}<span
                v-if="
                  customerDetails.contact_no2 &&
                  customerDetails.contact_no2.length
                "
              >
                / {{ customerDetails.contact_no2 }}</span
              >
            </div>
            <!-- <div>
            <strong>Contact No 2:</strong> {{ customerDetails.contact_no2 }}
          </div> -->
            <div>
              <strong>Email:</strong> {{ customerDetails.email || "-" }}
            </div>

            <div>
              <strong>Customer Type:</strong> {{ customerDetails.type }}
            </div>
            <div>
              <strong>Customer Sub Type:</strong>
              {{ customerDetails.sub_type }}
            </div>
            <div>
              <strong>Recommended By:</strong>
              {{ customerDetails.recommended_by || "-" }}
            </div>
            <div>
              <strong>Customer Since:</strong>
              {{ formatDate(customerDetails.created_at) }}
            </div>
            <div>
              <strong>Status: </strong>
              <span
                :class="isActiveClass"
                class="text-uppercase text-weight-bold"
                >{{ isActiveLabel }}</span
              >
            </div>
          </div>
        </div>

        <div class="col bordered p-min">
          <div class="row justify-center">
            <span
              class="subheadline text-h6 text-weight-bolder text-uppercase text-center"
            >
              Customer Credits
            </span>
          </div>

          <div class="row">
            <q-btn
              dense
              unelevated
              outline
              label="Top Up Credits"
              color="primary"
              class="full-width"
              @click="openUpdateCreditsDialog(customerDetails)"
            />
          </div>
          <div>
            <a
              class="text-subtitle1 cursor-pointer"
              @click="openCreditsHistoryDialog(customerCredits.id)"
            >
              (View Credit History)</a
            >

            <div>
              <div>
                Online Package Credits:
                <span class="text-weight-bolder mark-yellow"
                  >${{
                    parseFloat(customerCredits.online_package).toFixed(2)
                  }}</span
                >
              </div>
              <div>
                Other Credits:
                <span class="text-weight-bolder mark-yellow"
                  >${{
                    parseFloat(customerCredits.other_credits).toFixed(2)
                  }}</span
                >
              </div>
              <q-separator />
              <div>
                Total Credits:
                <span class="text-weight-bolder mark-yellow"
                  >${{ parseFloat(creditsTotal).toFixed(2) }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <div class="col bordered p-min">
          <div class="row justify-center">
            <span
              class="subheadline text-h6 text-weight-bolder text-uppercase text-center"
            >
              Order Payments
            </span>
          </div>
          <a class="text-subtitle1"> (View Order Payments)</a>
          <div>
            <div>
              Unpaid Amount:
              <span class="text-weight-bolder mark-yellow"></span>
            </div>
            <div>
              Paid Amount:
              <span class="text-weight-bolder mark-yellow"></span>
            </div>
            <div>
              Total Amount:
              <span class="text-weight-bolder mark-yellow"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-2-container">
      <div class="row">
        <!-- Addresses -->
        <div class="col show-addresses q-ma-xs">
          <q-btn
            unelevated
            :icon="showAddresses ? 'arrow_drop_up' : 'arrow_drop_down'"
            label="Show Addresses"
            class="full-width text-primary show-list-tab text-weight-bolder text-subtitle1"
            @click="toggleAddresses"
          />
          <div v-if="showAddresses" class="q-pa-md addresses-container">
            <div class="row items-center justify-end">
              <q-btn
                flat
                dense
                icon="add"
                color="primary"
                class="q-mb-sm text-weight-bold"
                @click="showAddAddressDialog = true"
                label="Add Address"
              />
            </div>

            <div class="">
              <!-- Header -->
              <div
                class="row row-col-header text-center items-stretch line-height-1"
              >
                <div class="col col-6 header-bordered flex flex-center">
                  Address
                </div>
                <div class="col col-3 header-bordered flex flex-center">
                  Remarks
                </div>
                <div class="col col-3 header-bordered flex flex-center">
                  Actions
                </div>
              </div>

              <!-- Rows -->
              <template v-if="addresses && addresses.length">
                <div
                  v-for="address in addresses"
                  :key="address.id"
                  class="row row-col-row bg-white"
                >
                  <div class="col col-6 bordered">
                    {{ address.block_no || "" }} {{ address.road_name || "" }}
                    {{ address.unit_no || "" }}
                    {{ address.building_name || "" }}
                    {{ address.postal_code || "" }}
                    <span
                      v-if="
                        address.additional_info &&
                        address.additional_info.length
                      "
                    >
                      , ({{ address.additional_info }})
                    </span>
                  </div>
                  <div class="col col-3 bordered">
                    {{ address.remarks || "-" }}
                  </div>
                  <div class="col col-3 bordered actions">
                    <q-btn
                      dense
                      unelevated
                      label="Update"
                      color="primary"
                      class="main-button q-ma-xs q-px-sm"
                      @click="openUpdateDialog(address, 'address')"
                    />
                    <!-- <q-btn
                      dense
                      unelevated
                      label="Delete"
                      color="negative"
                      class="negative-button q-ma-xs q-px-sm"
                      @click="openDeleteDialog(address, 'address')"
                    /> -->
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="row row-col-row bg-white">
                  <div class="col-12 bordered text-center q-pa-sm">
                    No address available
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Contact Persons -->
        <div class="col show-contact-person q-ma-xs">
          <q-btn
            unelevated
            :icon="showContactPersons ? 'arrow_drop_up' : 'arrow_drop_down'"
            label="Show Contact Persons"
            class="full-width text-primary show-list-tab text-weight-bolder text-subtitle1"
            @click="toggleContactPersons"
          />
          <div
            v-if="showContactPersons"
            class="q-pa-md contact-persons-container"
          >
            <div class="row items-bottom justify-between">
              <div class="search-container q-pt-none">
                <q-input
                  v-model="searchQuery"
                  placeholder="Search contact person..."
                  square
                  dense
                  outlined
                  class="search-input"
                >
                  <template v-slot:prepend><q-icon name="search" /></template>
                  <template v-slot:append>
                    <q-icon
                      name="close"
                      @click="searchQuery = ''"
                      class="cursor-pointer"
                    />
                  </template>
                </q-input>
              </div>
              <q-btn
                flat
                dense
                icon="add"
                color="primary"
                class="text-weight-bold"
                @click="showAddContactPersonDialog = true"
                label="Add Contact Person"
              />
            </div>

            <div class="q-mt-sm">
              <!-- Header -->
              <div
                class="row row-col-header text-center text-weight-bold items-stretch line-height-1"
              >
                <div class="col header-bordered flex flex-center">Name</div>
                <div class="col header-bordered flex flex-center">
                  Contact Details
                </div>
                <div class="col header-bordered flex flex-center">Remarks</div>
              </div>

              <!-- Rows -->
              <template
                v-if="filteredContactPersons && filteredContactPersons.length"
              >
                <div
                  v-for="person in filteredContactPersons"
                  :key="person.id"
                  class="row row-col-row bg-white"
                >
                  <div class="col bordered"><div>{{ person.name || "-" }}</div>
                     <div>
                    <q-btn
                      dense
                      outline
                      label="Update"
                      color="primary"
                      class="main-button q-mt-xs q-px-md"
                      @click="openUpdateDialog(person, 'contact')"
                    />
                    <!-- <q-btn
                      dense
                      unelevated
                      label="Delete"
                      color="negative"
                      class="negative-button q-ma-xs q-px-sm"
                      @click="openDeleteDialog(person, 'contact')"
                    /> -->
                  </div>
                  </div>
                  <div class="col bordered">
                    <div>{{ person.contact_no1 || "-" }}</div>
                    <div v-if="person.contact_no2">
                      {{ person.contact_no2 }}
                    </div>
                    <div v-if="person.email">{{ person.email }}</div>
                  </div>
                  <div class="col bordered">{{ person.remarks || "-" }}</div>
                </div>
              </template>
              <template v-else>
                <div class="row row-col-row bg-white">
                  <div class="col-12 bordered text-center q-pa-sm">
                    No contact person
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-1-container text-subtitle1">
      <div class="row justify-center">
        <span
          class="subheadline text-h6 text-weight-bolder text-uppercase text-center"
        >
          Important Remarks
        </span>
      </div>
      <div class="row">
        <div class="col all-border">
          <div
            class="text-subtitle1 text-weight-bold text-uppercase text-center"
          >
            Schedule Remarks:
          </div>
          <div class="q-pa-sm" style="white-space: pre-line">
            {{ customerDetails.schedule_remarks }}
          </div>
        </div>
        <div class="col all-border">
          <div
            class="text-subtitle1 text-weight-bold text-uppercase text-center"
          >
            Price Remarks:
          </div>
          <div class="q-pa-sm" style="white-space: pre-line">
            {{ customerDetails.price_remarks }}
          </div>
        </div>
        <div class="col all-border">
          <div
            class="text-subtitle1 text-weight-bold text-uppercase text-center"
          >
            Accounting Remarks:
          </div>
          <div class="q-pa-sm" style="white-space: pre-line">
            {{ customerDetails.accounting_remarks }}
          </div>
        </div>
        <div class="col all-border">
          <div
            class="text-subtitle1 text-weight-bold text-uppercase text-center"
          >
            Other Remarks:
          </div>
          <div class="q-pa-sm" style="white-space: pre-line">
            {{ customerDetails.other_remarks }}
          </div>
        </div>
      </div>
    </div>

    <div class="page-2-container">
      <div class="row justify-center">
        <span
          class="subheadline text-h6 text-weight-bolder text-uppercase text-center"
        >
          Logistics History
        </span>
      </div>
      <LogisticsTableByCustomer :customer-id="customerDetails.id" />
    </div>

    <div class="page-1-container">
      <div class="row justify-center">
        <span
          class="subheadline text-h6 text-weight-bolder text-uppercase text-center"
        >
          Customer Price List
        </span>
      </div>
      <ItemsManager :default-group-id="customerDetails.pricing_group_id" />
    </div>

    <div class="page-2-container text-subtitle1">
      <div class="row justify-center">
        <span
          class="subheadline text-h6 text-weight-bolder text-uppercase text-center"
        >
          Other Information
        </span>
      </div>
      <ul>
        <li>
          <a>Customer Description / Rating</a>
        </li>
        <li>
          <a>Error Reports History (with view image)</a>
        </li>
        <li>
          <a>Outstanding Complaints History (with view image)</a>
        </li>
        <li>
          <a>Compensation History</a>
        </li>
      </ul>
    </div>

    <AddContactPersonDialog
      v-model="showAddContactPersonDialog"
      @contact-added="handleContactAdded"
    />
    <UpdateContactDialog
      v-model="showUpdateContactPersonDialog"
      @contact-updated="handleUpdated"
    />

    <q-dialog
      v-model="showCreateCollectionDialog"
      persistent
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card class="input-dialog" style="min-width: 300em">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">
            Create Collection
          </div>
          <q-btn
            icon="close"
            flat
            dense
            round
            class="absolute-top-right q-ma-sm"
            @click="showCreateCollectionDialog = false"
          />
        </q-card-section>
        <q-card-section class="dialog-body">
          <!-- Inject the CreateCollectionTab Component Here -->
          <CreateCollectionTab />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            unelevated
            class="full-width"
            color="primary"
            @click="createCollection()"
            label="Create Collection"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <AddAddressDialog
      v-model="showAddAddressDialog"
      @address-added="handleAddressAdded"
    />
    <UpdateAddressDialog
      v-model="showUpdateAddressDialog"
      :initialAddress="selectedAddress"
      @address-updated="handleUpdated"
    />

    <DeleteConfirmationDialog
      :isOpen="showDeleteDialog"
      :title="deleteDialogTitle"
      :message="deleteDialogMessage"
      @update:isOpen="showDeleteDialog = $event"
      @confirm="deleteItem"
    />
    <UpdateCustomerDialog
      v-model="showUpdateCustomerDialog"
      :customerData="selectedCustomer"
      @customer-updated="handleCustomerUpdated"
    />

    <q-dialog v-model="showUpdateCreditsDialog">
      <q-card style="min-width: 1000px">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">
            Update Credits
          </div>
          <q-btn
            icon="close"
            flat
            dense
            round
            class="absolute-top-right q-ma-sm"
            @click="showUpdateCreditsDialog = false"
          />
        </q-card-section>

        <q-card-section class="dialog-body text-subtitle1">
          <div class="row text-center">
            <div class="col all-border bg-yellow-2">
              <div>Online Package Credits</div>
              <div class="text-weight-bold text-uppercase text-h6">
                {{ customerCredits.online_package }}
              </div>
            </div>
            <div class="col all-border">
              <div>Other Credits</div>
              <div class="text-weight-bold text-uppercase text-h6">
                {{ customerCredits.other_credits }}
              </div>
            </div>
            <div class="col all-border bg-green-2">
              <div>Total Credits</div>
              <div class="text-weight-bold text-uppercase text-h6">
                {{ creditsTotal }}
              </div>
            </div>
          </div>

          <q-separator class="q-my-sm" />

          <div class="row q-col-gutter-x-md">
            <div class="col-6">
              <div class="dialog-label">
                Add credits to<span class="dialog-asterisk">*</span>
              </div>
              <q-select
                v-model="selectedCreditType"
                :options="creditTypes"
                outlined
                dense
                class="dialog-inputs"
                :rules="[(val) => !!val || 'Credit Type is required']"
              />
            </div>
            <div class="col-6">
              <div class="dialog-label">
                Credit Amount<span class="dialog-asterisk">*</span>
              </div>
              <q-input
                v-model.number="creditAmount"
                type="number"
                outlined
                dense
                class="dialog-inputs"
                :rules="[
                  (val) => !!val || 'Credit Amount is required',
                  (val) => val > 0 || 'Must be greater than 0',
                ]"
              />
            </div>
          </div>
          <div class="q-mb-sm">
            <div class="dialog-label q-mb-xs">Remarks</div>
            <q-input
              v-model="creditRemarks"
              type="textarea"
              outlined
              dense
              class="dialog-inputs"
            />
          </div>

          <q-btn
            unelevated
            color="primary"
            label="Top Up"
            class="full-width q-my-sm"
            @click="topUpCredits"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showCreditsHistoryDialog" persistent>
      <q-card style="min-width: 800px">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">
            Credits History
          </div>
          <q-btn
            icon="close"
            flat
            dense
            round
            class="absolute-top-right q-ma-sm"
            @click="showCreditsHistoryDialog = false"
          />
        </q-card-section>

        <q-card-section class="dialog-body">
          <q-table
            :rows="creditHistoryWithNames"
            :columns="[
              {
                name: 'credit_type',
                label: 'Type',
                align: 'center',
                field: 'credit_type',
              },
              {
                name: 'amount',
                label: 'Amount',
                align: 'center',
                field: 'amount',
                format: (val) => parseFloat(val).toFixed(2),
              },
              {
                name: 'remarks',
                label: 'Remarks',
                align: 'center',
                field: 'remarks',
              },
              {
                name: 'created_at',
                label: 'Date',
                align: 'center',
                field: 'created_at',
                format: (val) => new Date(val).toLocaleString(),
              },
              {
                name: 'created_by_name',
                label: 'Created By',
                align: 'center',
                field: 'created_by_name',
              },
            ]"
            row-key="id"
            flat
            bordered
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";

import { useTransactionStore } from "@/stores/transactionStore";
import AddContactPersonDialog from "@/components/dialogs/AddContactDialog.vue";
import AddAddressDialog from "@/components/dialogs/AddAddressDialog.vue";
import UpdateContactDialog from "@/components/dialogs/UpdateContactDialog.vue";
import UpdateAddressDialog from "@/components/dialogs/UpdateAddressDialog.vue";
import DeleteConfirmationDialog from "@/components/dialogs/DeleteConfirmationDialog.vue";
import UpdateCustomerDialog from "@/components/dialogs/UpdateCustomerDialog.vue";
import CreateCollectionTab from "@/components/CreateCollectionTab.vue";

import LogisticsTableByCustomer from "@/components/LogisticsTableByCustomer.vue";
import ItemsManager from "@/components/ItemsManager.vue";

const transactionStore = useTransactionStore();
const $q = useQuasar();

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
const customerCredits = ref({});
const addresses = ref([]);
const contactPersons = ref([]);
const selectedAddress = ref({});
const searchQuery = ref("");

onMounted(async () => {
  await loadCustomerData();
  await transactionStore.setSelectedCustomer(customerDetails.value);
});

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
  customerDetails.value = await transactionStore.fetchCustomerDetailsById(
    customerId
  );
  customerCredits.value = await transactionStore.fetchCustomerCreditsById(
    customerId
  );
  addresses.value = await transactionStore.fetchAddressesForCustomer(
    customerId
  );
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
    deleteDialogMessage.value =
      "Are you sure you want to delete this contact person?";
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
      await loadCustomerData();
    } else if (deleteType.value === "address") {
      await transactionStore.deleteCustomerAddress(deleteTarget.value.id);
      await loadCustomerData();
    }

    $q.notify({
      type: "positive",
      message: `${
        deleteType.value === "contact" ? "Contact person" : "Address"
      } deleted successfully.`,
    });

    showDeleteDialog.value = false;
  } catch (error) {
    console.error(`Error deleting ${deleteType.value}:`, error);
    $q.notify({
      type: "negative",
      message: `Failed to delete ${deleteType.value}. Please try again.`,
    });
  }
};

const openCollectionDialog = (customerDetails) => {
  transactionStore.setSelectedCustomer(customerDetails);
  showCreateCollectionDialog.value = true;
};

async function createCollection() {
  try {
    // Call the store function to create the collection
    const logisticsId = await transactionStore.createLogistics();
    await transactionStore.createCollection(logisticsId);
    await transactionStore.createDelivery(logisticsId);

    // Show success dialog
    $q.dialog({
      title: "Collection Created",
      message: "Collection created successfully!",
      ok: "OK",
      color: "positive",
    });

    // Reset the fields
    transactionStore.selectedCollectionContact = null;
    transactionStore.selectedDeliveryContact = null;
    transactionStore.selectedCollectionAddress = null;
    transactionStore.selectedDeliveryAddress = null;
    transactionStore.selectedCollectionDriver = null;
    transactionStore.selectedDeliveryDriver = null;
    transactionStore.collectionRemarks = "";
    transactionStore.deliveryRemarks = "";

    // Close the dialog
    showCreateCollectionDialog.value = false;
  } catch (error) {
    console.error("Error submitting collection:", error.message);

    // Show error dialog
    $q.dialog({
      title: "Error",
      message: "Failed to create collection. Please try again.",
      ok: "Close",
      color: "negative",
    });
  }
}

// Toggles
const toggleAddresses = () => (showAddresses.value = !showAddresses.value);
const toggleContactPersons = () =>
  (showContactPersons.value = !showContactPersons.value);

const handleContactAdded = loadCustomerData;
const handleAddressAdded = loadCustomerData;

const openUpdateDialog = (item, type) => {
  if (type === "address") {
    transactionStore.setSelectedAddress(item);
    showUpdateAddressDialog.value = true;
  } else if (type === "contact") {
    transactionStore.setSelectedContact(item);
    showUpdateContactPersonDialog.value = true;
  }
};

const handleUpdated = async () => {
  try {
    await loadCustomerData(); // Refresh both addresses and contacts

    // Close both dialogs
    showUpdateAddressDialog.value = false;
    showUpdateContactPersonDialog.value = false;

    console.log("Customer updated successfully.");
  } catch (error) {
    console.error("Error updating item:", error);
  }
};

const openUpdateCustomerDialog = (customer) => {
  transactionStore.setSelectedCustomer(customer);
  showUpdateCustomerDialog.value = true;
};

const handleCustomerUpdated = async () => {
  await loadCustomerData();
  showUpdateCustomerDialog.value = false;
  await transactionStore.loadCustomers();
};

const creditsTotal = computed(() => {
  const credits = customerCredits.value || {};
  return (credits.online_package || 0) + (credits.other_credits || 0);
});

const showUpdateCreditsDialog = ref(false);

const openUpdateCreditsDialog = () => {
  showUpdateCreditsDialog.value = true;
};

const selectedCreditType = ref(null);
const creditAmount = ref(0);
const creditRemarks = ref("");

const creditTypes = [
  "Online Package",
  "Free Wash",
  "Bank Transfer",
  "Over Payment",
  "Other Credits",
];

const topUpCredits = async () => {
  if (!selectedCreditType.value || creditAmount.value <= 0) {
    $q.notify({
      type: "negative",
      message: "Please select credit type and enter a valid amount.",
    });
    return;
  }

  try {
    await transactionStore.topUpCredits({
      customerId: customerDetails.value.id,
      type: selectedCreditType.value,
      amount: creditAmount.value,
      remarks: creditRemarks.value,
    });

    await loadCustomerData();
    showUpdateCreditsDialog.value = false;
    selectedCreditType.value = null;
    creditAmount.value = 0;
    creditRemarks.value = "";

    $q.notify({
      type: "positive",
      message: "Credits successfully topped up.",
    });
  } catch (error) {
    console.error("Error topping up credits:", error);
    $q.notify({
      type: "negative",
      message: "Failed to top up credits. Try again.",
    });
  }
};

const creditHistory = ref([]);
const showCreditsHistoryDialog = ref(false);
const userNamesMap = ref({});

const creditHistoryWithNames = computed(() => {
  return creditHistory.value.map((entry) => ({
    ...entry,
    created_by_name: userNamesMap.value[entry.created_by] || entry.created_by,
  }));
});

const openCreditsHistoryDialog = async (customerCreditsId) => {
  try {
    creditHistory.value =
      await transactionStore.fetchCustomerCreditsHistoryById(customerCreditsId);
    await fetchCreatorNames();
    showCreditsHistoryDialog.value = true;
  } catch (error) {
    console.error("Failed to load credit history:", error);
    $q.notify({ type: "negative", message: "Failed to load credit history." });
  }
};

const fetchCreatorNames = async () => {
  const ids = [...new Set(creditHistory.value.map((h) => h.created_by))];
  const nameMap = {};

  await Promise.all(
    ids.map(async (id) => {
      const name = await transactionStore.getProfileName(id);
      nameMap[id] = name;
    })
  );

  userNamesMap.value = nameMap;
};

const toBoolean = (v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string")
    return ["1", "true", "yes", "y"].includes(v.trim().toLowerCase());
  return false;
};

const isActive = computed(() => toBoolean(customerDetails.value?.is_active));
const isActiveLabel = computed(() => (isActive.value ? "active" : "inactive"));
const isActiveClass = computed(() =>
  isActive.value ? "text-green-9" : "text-red-8"
);
</script>

<style scoped>
.p-exception {
  padding: 0 !important;
}

.p-min {
  padding: 2rem !important;
}
</style>
