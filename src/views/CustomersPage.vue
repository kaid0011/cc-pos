<template>
  <div class="full-container customers-management">
    <div class="row items-center justify-between q-mb-sm">
      <div class="search-container">
        <q-input
          v-model="searchQuery"
          placeholder="Search customers..."
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

      <q-btn
      unelevated
        class="main-button"
        color="primary"
        icon="person_add"
        @click="showAddCustomerDialog = true"
        label="Add Customer"
      />
    </div>

    <!-- Tab Panels for Customers -->
    <q-tabs v-model="activeTab" align="justify" class="tab-header">
      <q-tab name="all" class="text-weight-bold text-subtitle1 tab-divider">All Customers</q-tab>
      <q-tab name="contract" class="text-weight-bold text-subtitle1 tab-divider">Contract Customers</q-tab>
      <q-tab name="non-contract" class="text-weight-bold text-subtitle1 tab-divider">Non-Contract Customers</q-tab>
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated>
      <!-- All Customers -->
      <q-tab-panel name="all" class="q-pa-none">
        <div class="row-col-table">
          <div class="row row-col-header q-px-md">
            <div class="col bordered">Name</div>
            <div class="col bordered">Address</div>
            <div class="col bordered">Contact Nos</div>
            <div class="col bordered">Email</div>
            <div class="col bordered">Remarks</div>
            <div class="col bordered">Actions</div>
          </div>
          <div
            v-for="customer in filteredCustomersWithAddress"
            :key="customer.id"
            class="row row-col-row q-mx-md"
          >
            <div class="col bordered">
              <div>
                <a @click.prevent="openCustomerTab(customer.id)" class="text-weight-bold text-subtitle1">{{
            customer.name
          }}</a>
              </div>
              <div>
                {{ customer.type }}
              </div>
            </div>
            <div class="col bordered">
              <ul v-if="customer.addresses?.length" class="q-mt-none q-pl-md">
                <li v-for="address in customer.addresses" :key="address.id">
                  {{ address.block_no }} {{ address.road_name }} {{ address.unit_no }} {{ address.building_name }} {{ address.postal_code }}<span v-if="address.additional_info.length != 0">, ({{ address.additional_info }})</span>
                </li>
              </ul>
              <span v-else>No Address Available</span>
            </div>
            <div class="col bordered">
              <div>
                {{ customer.contact_no1 || "N/A" }}
              </div>
              <div v-if="customer.contact_no2">
                {{ customer.contact_no2 || "-" }}
              </div>
            </div>
            <div class="col bordered">{{ customer.email }}</div>
            <div class="col bordered">{{ customer.remarks }}</div>
            <div class="col bordered actions">
              <q-btn
              unelevated
                dense
                label="Create Collection"
                color="primary"
                class="main-button q-ma-xs q-px-sm"
                @click="openCollectionDialog(customer)"
              />
              <q-btn
              unelevated
                dense
                label="Create Transaction"
                color="primary"
                class="main-button q-ma-xs q-px-sm"
                @click="navigateToPOS(customer)"
              />
              <!-- <q-btn
                dense
                label="View Customer"
                color="primary"
                class="main-button q-ma-xs q-px-sm"
                @click="viewCustomer(customer)"
              /> -->
            </div>
          </div>
        </div>
      </q-tab-panel>

      <!-- Contract Customers -->
      <q-tab-panel name="contract" class="q-pa-none">
        <div class="row-col-table">
          <div class="row row-col-header q-px-md">
            <div class="col bordered">Name</div>
            <div class="col bordered">Address</div>
            <div class="col bordered">Contact Nos</div>
            <div class="col bordered">Email</div>
            <div class="col bordered">Remarks</div>
            <div class="col bordered">Actions</div>
          </div>
          <div
          v-for="customer in contractCustomers"
          :key="customer.id"
          class="row row-col-row q-mx-md"
          >
            <div class="col bordered">
              <div>
                  <a @click.prevent="openCustomerTab(customer.id)" class="text-weight-bold text-subtitle1">{{
              customer.name
            }}</a>
              </div>
              <div>
                {{ customer.type }}
              </div>
            </div>
            <div class="col bordered">
              <ul v-if="customer.addresses?.length" class="q-mt-none q-pl-md">
                <li v-for="address in customer.addresses" :key="address.id">
                  {{ address.block_no }} {{ address.road_name }} {{ address.unit_no }} {{ address.building_name }} {{ address.postal_code }}<span v-if="address.additional_info.length != 0">, ({{ address.additional_info }})</span>
                </li>
              </ul>
              <span v-else>No Address Available</span>
            </div>
            <div class="col bordered">{{ customer.contact_no1 || "N/A" }}</div>
            <div class="col bordered">{{ customer.email }}</div>
            <div class="col bordered">{{ customer.remarks }}</div>
            <div class="col bordered actions">
              <q-btn
              unelevated
                dense
                label="Create Collection"
                color="primary"
                class="main-button q-ma-xs q-px-sm"
                @click="openCollectionDialog(customer)"
              />
              <q-btn
              unelevated
                dense
                label="Create Transaction"
                color="primary"
                class="main-button q-ma-xs q-px-sm"
                @click="navigateToPOS(customer)"
              />
              <!-- <q-btn
                dense
                label="View Customer"
                color="primary"
                class="main-button q-ma-xs q-px-sm"
                @click="viewCustomer(customer)"
              /> -->
            </div>
          </div>
        </div>
      </q-tab-panel>

      <!-- Non-Contract Customers -->
      <q-tab-panel name="non-contract" class="q-pa-none">
        <div class="row-col-table">
          <div class="row row-col-header q-px-md">
            <div class="col bordered">Name</div>
            <div class="col bordered">Address</div>
            <div class="col bordered">Contact Nos</div>
            <div class="col bordered">Email</div>
            <div class="col bordered">Remarks</div>
            <div class="col bordered">Actions</div>
          </div>
          <div
          v-for="customer in nonContractCustomers"
          :key="customer.id"
          class="row row-col-row q-mx-md"
          >
            <div class="col bordered">
              <div>
                  <a @click.prevent="openCustomerTab(customer.id)" class="text-weight-bold text-subtitle1">{{
              customer.name
            }}</a>
              </div>
              <div>
                {{ customer.type }}
              </div>
            </div>
            <div class="col bordered">
              <ul v-if="customer.addresses?.length" class="q-mt-none q-pl-md">
                <li v-for="address in customer.addresses" :key="address.id">
                  {{ address.block_no }} {{ address.road_name }} {{ address.unit_no }} {{ address.building_name }} {{ address.postal_code }}<span v-if="address.additional_info.length != 0">, ({{ address.additional_info }})</span>
                </li>
              </ul>
              <span v-else>No Address Available</span>
            </div>
            <div class="col bordered">{{ customer.contact_no1 || "N/A" }}</div>
            <div class="col bordered">{{ customer.email }}</div>
            <div class="col bordered">{{ customer.remarks }}</div>
            <div class="col bordered actions">
              <q-btn
              unelevated
                dense
                label="Create Collection"
                color="primary"
                class="main-button q-ma-xs q-px-sm"
                @click="openCollectionDialog(customer)"
              />
              <q-btn
              unelevated
                dense
                label="Create Transaction"
                color="primary"
                class="main-button q-ma-xs q-px-sm"
                @click="navigateToPOS(customer)"
              />
              <!-- <q-btn
                dense
                label="View Customer"
                color="primary"
                class="main-button q-ma-xs q-px-sm"
                @click="viewCustomer(customer)"
              /> -->
            </div>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <AddCustomerDialog
      v-model="showAddCustomerDialog"
      @customer-added="handleCustomerAdded"
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

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useTransactionStore } from "@/stores/transactionStore";
import { useQuasar } from "quasar";
import AddCustomerDialog from "@/components/dialogs/AddCustomerDialog.vue";
import CreateCollectionTab from "@/components/CreateCollectionTab.vue";

const transactionStore = useTransactionStore();
const router = useRouter();
const $q = useQuasar();

const searchQuery = ref("");
const showAddCustomerDialog = ref(false);
const showCreateCollectionDialog = ref(false);

onMounted(async () => {
  try {
    // Load all customers
    await transactionStore.loadCustomers();

    // Fetch all addresses in one query
    const allAddresses = await transactionStore.fetchAllAddresses();

    // Map addresses to their corresponding customers
    const addressMap = allAddresses.reduce((map, address) => {
      if (!map[address.customer_id]) {
        map[address.customer_id] = [];
      }
      map[address.customer_id].push(address);
      return map;
    }, {});

    // Assign addresses to customers
    transactionStore.customers.forEach((customer) => {
      customer.addresses = addressMap[customer.id] || [];
    });
  } catch (error) {
    console.error("Error loading customers or addresses:", error);
  }
});

// Computed property for filtered customers
const filteredCustomersWithAddress = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  if (!query) return transactionStore.customers;

  return transactionStore.customers.filter((customer) => {
    const inAddresses = (customer.addresses || []).some((address) => {
      return (
        address.block_no?.toLowerCase().includes(query) ||
        address.road_name?.toLowerCase().includes(query) ||
        address.unit_no?.toLowerCase().includes(query) ||
        address.building_name?.toLowerCase().includes(query) ||
        address.postal_code?.toLowerCase().includes(query) ||
        address.additional_info?.toLowerCase().includes(query)
      );
    });

    return (
      customer.name.toLowerCase().includes(query) ||
      customer.contact_no1?.toLowerCase().includes(query) ||
      customer.contact_no2?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.type?.toLowerCase().includes(query) ||
      inAddresses
    );
  });
});

// Handle viewing a customer (for navigation or modal display)
const viewCustomer = (customer) => {
  const url = router.resolve({
    name: "CustomerView",
    params: { id: customer.id },
  }).href;
  window.open(url, "_blank");
};

const handleCustomerAdded = async () => {
  console.log("Customer successfully added");
  showAddCustomerDialog.value = false;
  await transactionStore.loadCustomers();
};


const navigateToPOS = (customer) => {
  try {
    // Set only the customer details in the transaction store
    transactionStore.setSelectedCustomer({
      id: customer.id,
      name: customer.name,
      contact_no1: customer.contact_no1,
      contact_no2: customer.contact_no2,
      email: customer.email,
      remarks: customer.remarks,
      payment_type: customer.payment_type,
    });

    // Navigate to POS page
    router.push({ name: "Pos" });
  } catch (error) {
    console.error("Error navigating to POS:", error);
  }
};

const openCollectionDialog = (customer) => {
  transactionStore.setSelectedCustomer(customer); // Set the selected customer in the store
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

const activeTab = ref("all");

const contractCustomers = computed(() => {
  return filteredCustomersWithAddress.value.filter(
    (customer) => customer.type === "Contract"
  );
});

const nonContractCustomers = computed(() => {
  return filteredCustomersWithAddress.value.filter(
    (customer) => customer.type !== "Contract"
  );
});

const openCustomerTab = (customerId) => {
  const url = `/customers/${customerId}`;
  window.open(url, "_blank"); // Open in a new tab
};

</script>
