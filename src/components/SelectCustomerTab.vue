<template>
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
  
    <AddCustomerDialog
      v-model="showAddCustomerDialog"
      @customer-added="handleCustomerAdded"
    />
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from "vue";
  import { useTransactionStore } from "@/stores/transactionStore";
  import AddCustomerDialog from "@/components/dialogs/AddCustomerDialog.vue";
  
  const transactionStore = useTransactionStore();
  const searchTerm = ref("");
  const showAddCustomerDialog = ref(false);
  
  const filteredCustomers = ref([]);
  
  const filterCustomers = (term) => {
    const searchLower = term.toLowerCase();
  
    filteredCustomers.value = transactionStore.customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(searchLower) ||
        (customer.contact_no1 &&
          customer.contact_no1.toLowerCase().includes(searchLower)) ||
        (customer.contact_no2 &&
          customer.contact_no2.toLowerCase().includes(searchLower)) ||
        (customer.email && customer.email.toLowerCase().includes(searchLower))
      );
    });
  };
  
  watch(searchTerm, (newVal) => {
    filterCustomers(newVal);
  });
  
  onMounted(async () => {
    await transactionStore.loadCustomers();
    filterCustomers(searchTerm.value);
  });
  
const selectCustomer = async (customer) => {
  try {
    transactionStore.useCcCollection = false;
    transactionStore.useCcDelivery = false;
    transactionStore.selectedCollectionContact = null;
    transactionStore.selectedDeliveryContact = null;
    transactionStore.selectedCollectionAddress = null;
    transactionStore.selectedDeliveryAddress = null;
    transactionStore.selectedCollectionDriver = null;
    transactionStore.selectedDeliveryDriver = null;
    transactionStore.collectionDate = null;
    transactionStore.deliveryDate = null;
    transactionStore.collectionTime = null;
    transactionStore.deliveryTime = null;
    transactionStore.collectionRemarks = null;
    transactionStore.deliveryRemarks = null;

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
  
  const handleCustomerAdded = async () => {
    showAddCustomerDialog.value = false;
    await updateOptions(); // Refresh customer list
  };
  
  const updateOptions = async () => {
    try {
      const customerId = transactionStore.selectedCustomer?.id || null;
      await Promise.all([
        transactionStore.loadContactOptions(customerId),
        transactionStore.loadAddressOptions(customerId),
        transactionStore.loadDrivers(),
      ]);
    } catch (error) {
      console.error("Error updating options:", error);
    }
  };
  </script>
  