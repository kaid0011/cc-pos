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
          <q-icon name="close" @click="searchTerm = ''" class="cursor-pointer" />
        </template>
      </q-input>

      <!-- Add Customer Button -->
      <q-btn
        flat
        color="primary"
        label="Add Customer"
        @click="showAddCustomerDialog = true"
        class="q-mt-md"
      />

      <!-- Customer List -->
      <div class="customer-list">
        <div class="row customer-header">
          <div class="col-4">Customer Name</div>
          <div class="col-4">Contact No.</div>
          <div class="col-4">Email</div>
        </div>
        <div v-if="filteredCustomers.length === 0" class="text-center text-grey q-my-md">
          No existing customers.
        </div>
        <div v-else
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
        <q-card flat class="customer-card q-pa-sm">
          <q-card-section>
            <div class="text-p text-uppercase text-weight-bold q-mb-xs">
              Selected Customer
            </div>
            <q-separator class="q-my-xs q-mb-sm" />
            <div><strong>Name:</strong> {{ selectedCustomer.name }}</div>
            <div><strong>Contact No:</strong> {{ selectedCustomer.contact_no1 }}</div>
            <div><strong>Email:</strong> {{ selectedCustomer.email }}</div>
          </q-card-section>
        </q-card>

        <div class="contact-selection q-mt-md">
          <!-- Collection Section -->
          <div class="q-mb-md">
            <div class="text-p text-uppercase text-weight-bold q-mt-md q-mb-xs">
              For Collection
            </div>
            <q-btn
              flat
              color="primary"
              label="Add Contact Person"
              @click="showAddContactPersonDialog = true"
            />
            <q-btn
              flat
              color="primary"
              label="Add Address"
              @click="showAddAddressDialog = true"
              class="q-ml-sm"
            />

            <q-select
              v-model="transactionStore.selectedCollectionContact"
              :options="contactOptions"
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
              :options="transactionStore.addressOptions.map((address) => ({
                id: address.id,
                address: address.address,
              }))"
              option-label="address"
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
            <q-btn
              flat
              color="primary"
              label="Add Contact Person"
              @click="showAddContactPersonDialog = true"
            />
            <q-btn
              flat
              color="primary"
              label="Add Address"
              @click="showAddAddressDialog = true"
              class="q-ml-sm"
            />

            <q-select
              v-model="transactionStore.selectedDeliveryContact"
              :options="contactOptions"
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
              :options="transactionStore.addressOptions.map((address) => ({
                id: address.id,
                address: address.address,
              }))"
              option-label="address"
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
<div class=col>
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
        <q-card-section>
          <div class="text-weight-bold text-h6">Add Contact Person</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="addContactPerson">
            <q-input v-model="newContactPerson.name" label="Name" outlined />
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
            <q-card-actions align="right">
              <q-btn flat label="Cancel" color="negative" @click="showAddContactPersonDialog = false" />
              <q-btn flat label="Add" color="primary" type="submit" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Add Address Dialog -->
    <q-dialog v-model="showAddAddressDialog" persistent>
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-weight-bold text-h6">Add Address</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="addAddress">
            <q-input v-model="newAddress.address" label="Address" outlined />
            <q-card-actions align="right">
              <q-btn flat label="Cancel" color="negative" @click="showAddAddressDialog = false" />
              <q-btn flat label="Add" color="primary" type="submit" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Add Customer Dialog -->
    <q-dialog v-model="showAddCustomerDialog" persistent>
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-weight-bold text-h6">Add Customer</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="addCustomer">
            <q-input v-model="newCustomer.name" label="Name" outlined required />
            <q-input
              v-model="newCustomer.contact_no1"
              label="Contact No 1"
              outlined
              required
            />
            <q-input
              v-model="newCustomer.contact_no2"
              label="Contact No 2"
              outlined
            />
            <q-input v-model="newCustomer.email" label="Email" outlined />
            <q-card-actions align="right">
              <q-btn flat label="Cancel" color="negative" @click="showAddCustomerDialog = false" />
              <q-btn flat label="Add" color="primary" type="submit" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";

const transactionStore = useTransactionStore();
const searchTerm = ref("");

const newCustomer = ref({
  name: "",
  contact_no1: "",
  contact_no2: "",
  email: "",
  address: "",
});

const newContactPerson = ref({
  name: "",
  contact_no1: "",
  contact_no2: "",
  email: "",
});

const newAddress = ref({ address: "" });

const showAddCustomerDialog = ref(false);
const showAddContactPersonDialog = ref(false);
const showAddAddressDialog = ref(false);

const contactOptions = computed(() =>
  transactionStore.contactPersons.map((contact) => ({
    id: contact.id,
    label: `${contact.name} - ${contact.contact_no1}`,
  }))
);

const filteredCustomers = computed(() =>
  transactionStore.customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
);

const selectedCustomer = computed(() => transactionStore.selectedCustomer);

onMounted(() => {
  transactionStore.loadCustomers();
});

const selectCustomer = (customer) => {
  transactionStore.setSelectedCustomer(customer);
  transactionStore.loadContactPersons(customer.id);
  transactionStore.loadAddressOptions(customer.id);
};

const addCustomer = async () => {
 transactionStore.createCustomer(newCustomer.value);
  showAddCustomerDialog.value = false;
  newCustomer.value = { name: "", contact_no1: "", contact_no2: "", email: "" };
};


const addContactPerson = () => {
  transactionStore.addContactPerson(newContactPerson.value);
  showAddContactPersonDialog.value = false;
  newContactPerson.value = { name: "", contact_no1: "", contact_no2: "", email: "" };
};

const addAddress = () => {
  transactionStore.addAddress(newAddress.value);
  showAddAddressDialog.value = false;
  newAddress.value = { address: "" };
};
</script>
