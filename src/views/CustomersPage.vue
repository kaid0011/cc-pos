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
              {{ address.block_no }} {{ address.road_name }}
              {{ address.unit_no }} {{ address.building_name }},
              {{ address.postal_code }} ({{ address?.additional_info || "" }})
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

  
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useTransactionStore } from "@/stores/transactionStore";
import AddCustomerDialog from "@/components/dialogs/AddCustomerDialog.vue";

const transactionStore = useTransactionStore();
const router = useRouter();

const searchQuery = ref("");
const showAddCustomerDialog = ref(false);

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


// Handle viewing a customer (for navigation or modal display)
const viewCustomer = (customer) => {
  const url = router.resolve({
    name: "CustomerView",
    params: { id: customer.id },
  }).href;
  window.open(url, "_blank");
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
const handleCustomerAdded = async () => {
  console.log("Customer successfully added");
  showAddCustomerDialog.value = false;
  await transactionStore.loadCustomers();
};



</script>
