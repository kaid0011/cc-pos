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
        <div class="col bordered">Payment Type </div>
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
              {{address.block_no}} {{address.road_name}} {{address.unit_no}} {{address.building_name}}, {{address.postal_code}} ({{address?.additional_info || ""}})
            </li>
          </ul>
          <span v-else>No Address Available</span>
        </div>
        
        <div class="col bordered">
          <ul class="q-pl-md q-mb-none">
            <li>
              {{ customer.contact_no1 || 'N/A'}}
            </li>
          </ul>
          <ul class="q-pl-md q-mt-none">
            <li>
              {{ customer.contact_no2 || 'N/A'}}
            </li>
          </ul>
         </div>
        <div class="col bordered">{{ customer.email }}</div>
        <div class="col bordered">{{ customer.payment_type }}</div>
        <div class="col bordered">{{ customer.remarks }}</div>
        <div class="col bordered actions">
<q-btn
  dense
  label="Create Transa..."
  color="primary"
  class="main-button q-ma-xs q-px-sm"
  @click="navigateToPOS(customer)"
/>

          <q-btn
            dense
            label="View Contacts"
            color="primary"
            class="main-button q-ma-xs q-px-sm"
            @click="viewCustomer(customer)"
          />
          <q-btn
            dense
            label="Update"
            color="primary"
            class="secondary-button q-ma-xs q-px-sm"
            @click="openUpdateDialog(customer)"
          />
        </div>
      </div>
    </div>

    <!-- Address Dialog -->
    <q-dialog
      v-model="showAddressDialog"
      persistent
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card class="dialog" style="width: 500px">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">
            Customer Addresses
          </div>
        </q-card-section>
        <q-card-section>
          <div v-if="selectedCustomerAddresses.length">
            <ul>
              <li v-for="address in selectedCustomerAddresses" :key="address.id">
                {{ address.address }}
              </li>
            </ul>
          </div>
          <div v-else>
            No addresses available for this customer.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="primary" label="Close" @click="showAddressDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add Customer Dialog -->
    <q-dialog
      v-model="showAddCustomerDialog"
      persistent
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card class="dialog" style="width: 500px">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">
            Add New Customer
          </div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="addCustomer" class="q-gutter-md">
            <q-input
              v-model="newCustomer.name"
              label="Name"
              outlined
              required
            />
            <q-input v-model="newCustomer.address" label="Address" outlined />
            <q-input
              v-model="newCustomer.contact_no1"
              label="Contact No 1"
              outlined
            />
            <q-input
              v-model="newCustomer.contact_no2"
              label="Contact No 2"
              outlined
            />
            <q-input v-model="newCustomer.email" label="Email" outlined />
            <q-input v-model="newCustomer.remarks" label="Remarks" outlined />
            <q-card-actions align="right">
              <q-btn
                flat
                class="negative-button"
                @click="resetAndCloseAddDialog"
                label="Cancel"
              />
              <q-btn
                flat
                class="main-button"
                color="primary"
                type="submit"
                label="Add Customer"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Update Customer Dialog -->
    <q-dialog
    v-model="showUpdateCustomerDialog"
    persistent
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card class="dialog" style="width: 500px">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Update Customer
        </div>
      </q-card-section>
      <q-card-section>
        <!-- Update Customer Form -->
        <q-form @submit.prevent="updateCustomer" class="q-gutter-md">
          <q-input
            v-model="selectedCustomer.name"
            label="Name"
            outlined
            required
          />
          <q-input
            v-model="selectedCustomer.contact_no1"
            label="Contact No 1"
            outlined
          />
          <q-input
            v-model="selectedCustomer.contact_no2"
            label="Contact No 2"
            outlined
          />
          <q-input v-model="selectedCustomer.email" label="Email" outlined />
          <q-input
            v-model="selectedCustomer.remarks"
            label="Remarks"
            outlined
          />
  
          <!-- List Existing Addresses -->
          <div>
            <div class="text-body1 text-weight-bold q-mb-sm">Addresses</div>
            <div
              v-for="(address, index) in selectedCustomer.addresses"
              :key="index"
              class="row items-center q-mb-sm"
            >
              <q-input
                v-model="address.address"
                outlined
                class="col"
                label="Address"
              />
              <q-btn
                flat
                dense
                color="negative"
                icon="delete"
                class="q-ml-sm"
                @click="removeAddress(index)"
              />
            </div>
          </div>
  
          <!-- Add New Address -->
          <q-btn
            flat
            dense
            color="primary"
            label="Add Address"
            class="q-mt-md"
            @click="addNewAddress"
          />
  
          <q-card-actions align="right" class="q-mt-md">
            <q-btn
              flat
              class="negative-button"
              @click="showUpdateCustomerDialog = false"
              label="Cancel"
            />
            <q-btn
              flat
              class="main-button"
              type="submit"
              label="Update Customer"
            />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
  <!-- View Customer Dialog -->
<q-dialog
v-model="showViewCustomerDialog"
persistent
transition-show="slide-down"
transition-hide="slide-up"
style="width: 800px; max-width: 90%;"
>
<q-card class="dialog">
  <q-card-section>
    <div class="text-body1 text-uppercase text-weight-bold">
      Customer Details
    </div>
  </q-card-section>
  <q-card-section>
    <!-- Dynamically load CustomerView -->
    <CustomerView :customerId="selectedCustomer.id" />
  </q-card-section>
  <q-card-actions align="right">
    <q-btn flat color="primary" label="Close" @click="showViewCustomerDialog = false" />
  </q-card-actions>
</q-card>
</q-dialog>

  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useTransactionStore } from "@/stores/transactionStore";

const transactionStore = useTransactionStore();
const router = useRouter();

const searchQuery = ref("");
const showAddCustomerDialog = ref(false);
const showUpdateCustomerDialog = ref(false);
const showAddressDialog = ref(false);

const newCustomer = ref({
  name: "",
  address: "",
  contact_no1: "",
  contact_no2: "",
  email: "",
  remarks: "",
  payment_type: "",
});

const selectedCustomer = ref({
  id: "",
  name: "",
  contact_no1: "",
  contact_no2: "",
  email: "",
  remarks: "",
  payment_type: "",
  addresses: [],
});

const selectedCustomerAddresses = ref([]);

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
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.contact_no1?.toLowerCase().includes(query) ||
      customer.contact_no2?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      (customer.addresses || []).some((address) =>
        address.address.toLowerCase().includes(query)
      )
    );
  });
});

// View addresses
const viewAddresses = (customer) => {
  selectedCustomerAddresses.value = customer.addresses || [];
  showAddressDialog.value = true;
};

// Add a new customer
const addCustomer = async () => {
  try {
    await transactionStore.createCustomer(newCustomer.value);
    await transactionStore.loadCustomers();
    resetAndCloseAddDialog();
  } catch (error) {
    console.error("Error adding customer:", error);
  }
};

// Reset and close add customer dialog
const resetAndCloseAddDialog = () => {
  newCustomer.value = {
    name: "",
    address: "",
    contact_no1: "",
    contact_no2: "",
    email: "",
    remarks: "",
    payment_type:"",
  };
  showAddCustomerDialog.value = false;
};

// Handle viewing a customer (for navigation or modal display)
const viewCustomer = (customer) => {
  const url = router.resolve({
    name: "CustomerView",
    params: { id: customer.id },
  }).href;
  window.open(url, "_blank");
};

const openUpdateDialog = async (customer) => {
  try {
    selectedCustomer.value = { ...customer };

    if (!selectedCustomer.value.addresses?.length) {
      const addresses = await transactionStore.fetchAddressesForCustomer(customer.id);
      selectedCustomer.value.addresses = addresses || [];
    }

    showUpdateCustomerDialog.value = true;
  } catch (error) {
    console.error("Error opening update dialog:", error);
  }
};

const updateCustomer = async () => {
  try {
    // Update customer details
    await transactionStore.updateCustomer({
      id: selectedCustomer.value.id,
      name: selectedCustomer.value.name,
      contact_no1: selectedCustomer.value.contact_no1,
      contact_no2: selectedCustomer.value.contact_no2,
      email: selectedCustomer.value.email,
      remarks: selectedCustomer.value.remarks,
    });

    // Synchronize addresses
    for (const address of selectedCustomer.value.addresses) {
      if (address.id) {
        // Update existing addresses
        await transactionStore.updateCustomerAddress(address);
      } else if (address.address.trim()) {
        // Add new addresses
        await transactionStore.createCustomerAddress({
          customer_id: selectedCustomer.value.id,
          address: address.address,
        });
      }
    }

    // Reload customers and close dialog
    await transactionStore.loadCustomers();
    showUpdateCustomerDialog.value = false;
  } catch (error) {
    console.error('Error updating customer:', error);
  }
};

const addNewAddress = () => {
  selectedCustomer.value.addresses.push({ address: '' });
};
const removeAddress = async (index) => {
  const address = selectedCustomer.value.addresses[index];

  if (address.id) {
    // If the address exists in the database, delete it
    await transactionStore.deleteCustomerAddress(address.id);
  }

  // Remove address from the local list
  selectedCustomer.value.addresses.splice(index, 1);
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

</script>
