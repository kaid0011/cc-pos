<template>
  <div class="full-container customers-management">
    <div class="row items-center justify-between q-mb-sm">
      <!-- Search Field and Button -->
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
      <!-- Add Customer Button -->
      <q-btn
        class="main-button"
        color="primary"
        icon="person_add"
        @click="showAddCustomerDialog = true"
        label="Add Customer"
      />
    </div>

    <!-- Customers Data -->
    <div class="row-col-table">
      <!-- Table Header -->
      <div class="row row-col-header q-px-md">
        <div class="col bordered">Name</div>
        <div class="col bordered">Address</div>
        <div class="col bordered">Contact Nos</div>
        <div class="col bordered">Email</div>
        <div class="col bordered">Payment Type</div>
        <div class="col bordered">Remarks</div>
        <div class="col bordered">Actions</div>
      </div>

      <!-- Table Rows -->
      <div
        v-for="customer in filteredCustomersWithAddress"
        :key="customer.id"
        class="row row-col-row q-mx-md"
      >
        <div class="col bordered">{{ customer.name }}</div>
        <div class="col bordered">
          <ul v-if="customer.addresses?.length" class="q-pl-md">
            <li v-for="address in customer.addresses" :key="address.id">
              {{ address.block_no }} {{ address.road_name }} {{ address.unit_no }} {{ address.building_name }} {{ address.postal_code }}<span v-if="address.additional_info.length != 0">, ({{ address.additional_info }})</span>
            </li>
          </ul>
          <span v-else>No Address Available</span>
        </div>

        <div class="col bordered">
          <ul class="q-pl-md q-mb-none">
            <li>
              {{ customer.contact_no1 || "N/A" }}
            </li>
          </ul>
          <ul class="q-pl-md q-mt-none">
            <li>
              {{ customer.contact_no2 || "N/A" }}
            </li>
          </ul>
        </div>
        <div class="col bordered">{{ customer.email }}</div>
        <div class="col bordered">{{ customer.payment_type }}</div>
        <div class="col bordered">{{ customer.remarks }}</div>
        <div class="col bordered actions">

          <q-btn
            dense
            label="Create Collection"
            color="primary"
            class="main-button q-ma-xs q-px-sm"
            @click="openCollectionDialog(customer)"
          />
          <q-btn
            dense
            label="Create Transaction"
            color="primary"
            class="main-button q-ma-xs q-px-sm"
            @click="navigateToPOS(customer)"
          />
          <q-btn
            dense
            label="View Customer"
            color="primary"
            class="main-button q-ma-xs q-px-sm"
            @click="viewCustomer(customer)"
          />
        </div>
      </div>
    </div>
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
  <q-card class="dialog" style="width: 600px">
    <q-card-section class="dialog-header">
      <div class="text-body1 text-uppercase text-weight-bold">
        Create Collection
      </div>
    </q-card-section>
    <q-card-section>
      <!-- Inject the CreateCollectionTab Component Here -->
      <CreateCollectionTab/>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn
        flat
        class="negative-button"
        @click="showCreateCollectionDialog = false"
        label="Close"
      />
      <q-btn
        flat
        class=""
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
    await transactionStore.createCollection();

    // Show success dialog
    $q.dialog({
      title: "Success",
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

</script>
