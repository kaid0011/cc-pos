<template>
  <div class="full-container transactions-history">
    <div class="text-h6 text-center text-uppercase text-weight-bold q-mb-md">
      Transaction History
    </div>
    <!-- Search Bar -->
    <div class="row justify-end q-mb-sm q-gutter-x-sm">
      <!-- Date Range Filters -->
      <div class="date-filter-container row q-gutter-x-sm">
        <q-input
          class="date-input"
          v-model="startDate"
          type="date"
          outlined
          dense
          label="Start Date"
          clearable
        />
        <q-input
          class="date-input"
          v-model="endDate"
          type="date"
          outlined
          dense
          label="End Date"
          clearable
        />
      </div>
      <q-input
        class="search-transactions search-input"
        v-model="searchQuery"
        outlined
        dense
        placeholder="Search by Order No, Customer Name, or Contact No"
        @input="filterOrders"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
    <div class="row-col-table">
      <!-- Table Header -->
      <div class="row row-col-header q-px-md">
        <div class="col">Order No</div>
        <div class="col">Date Created</div>
        <div class="col">Ready By</div>
        <div class="col">Goods Status</div>
        <div class="col">Logistic Status</div>
        <div class="col">Payment Status</div>
        <div class="col">Customer Name</div>
        <!-- <div class="col">Actions</div> -->
      </div>

      <!-- Table Rows -->
      <div v-if="filteredOrders.length === 0" class="text-center text-grey q-pa-lg text-h6">
        No existing transactions.
      </div>
      <div v-else
        v-for="order in filteredOrders"
        :key="order.id"
        class="row row-col-row q-mx-md"
      >
        <div class="col">
          <a @click="openOrderDialog(order)">{{ order.order_no }}</a>
        </div>
        <div class="col">{{ formatDate(order.order_date_time) }}</div>
        <div class="col">{{ formatDate(order.ready_by) }}</div>
        <div class="col">{{ order.goods_status }}</div>
        <div class="col">{{ order.logistic_status }}</div>
        <div class="col">{{ order.payment_status }}</div>
        <div class="col">
          <a @click="openCustomerDialog(order.customer_id)">{{
            order.customer_name
          }}</a>
        </div>
        <!-- <div class="col">
          <q-btn
            flat
            dense
            label="Create transa..."
            color="primary"
            @click="createTransaction(order)"
          />
        </div> -->
        
      </div>
    </div>
  </div>

  <!-- Order Dialog -->
  <q-dialog v-model="orderDialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">Order Details - {{ selectedOrder?.order_no }}</div>
        <div class="transactions-table">
          <!-- Transaction Items Header -->
          <div class="row transaction-header">
            <div class="col">Item Name</div>
            <div class="col">Price</div>
            <div class="col">Process</div>
            <div class="col">Quantity</div>
            <div class="col">Subtotal</div>
          </div>
          <!-- Transaction Items Rows -->
          <div
            v-for="item in transactionItems"
            :key="item.id"
            class="row transaction-row"
          >
            <div class="col">{{ item.item_name }}</div>
            <div class="col">${{ item.price.toFixed(2) }}</div>
            <div class="col">{{ item.process }}</div>
            <div class="col">{{ item.quantity }}</div>
            <div class="col">${{ item.subtotal.toFixed(2) }}</div>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Close"
          color="primary"
          @click="orderDialog = false"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Collection Dialog -->
  <q-dialog v-model="collectionDialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          Collection Details (ID: {{ selectedCollection?.id }})
        </div>
        <div class="collection-details text-p">
          <div>
            <span class="text-weight-bold">Created At:</span>
            {{ selectedCollection?.created_at }}
          </div>
          <div>
            <span class="text-weight-bold">Date From:</span>
            {{ selectedCollection?.date_from }}
          </div>
          <div>
            <span class="text-weight-bold">Date To:</span>
            {{ selectedCollection?.date_to }}
          </div>
          <div>
            <span class="text-weight-bold">Driver ID:</span>
            {{ selectedCollection?.driver_id }}
          </div>
          <div>
            <span class="text-weight-bold">Status:</span>
            {{ selectedCollection?.status }}
          </div>
          <div>
            <span class="text-weight-bold">Area:</span>
            {{ selectedCollection?.area }}
          </div>
          <div>
            <span class="text-weight-bold">Remarks:</span>
            {{ selectedCollection?.remarks }}
          </div>
          <div>
            <span class="text-weight-bold">Contact Person Details:</span>
          </div>
          <ul v-if="contactPerson">
            <li>
              <span class="text-weight-bold">Name:</span>
              {{ contactPerson.name }}
            </li>
            <li>
              <span class="text-weight-bold">Contact No 1:</span>
              {{ contactPerson.contact_no1 }}
            </li>
            <li>
              <span class="text-weight-bold">Contact No 2:</span>
              {{ contactPerson.contact_no2 }}
            </li>
            <li>
              <span class="text-weight-bold">Email:</span>
              {{ contactPerson.email }}
            </li>
            <li>
              <span class="text-weight-bold">Address:</span>
              {{ contactPerson.address }}
            </li>
            <li>
              <span class="text-weight-bold">Remarks:</span>
              {{ contactPerson.remarks }}
            </li>
          </ul>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Close"
          color="primary"
          @click="collectionDialog = false"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Delivery Dialog -->
  <q-dialog v-model="deliveryDialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          Delivery Details (ID: {{ selectedDelivery?.id }})
        </div>
        <div class="delivery-details text-p">
          <div>
            <span class="text-weight-bold">Created At:</span>
            {{ selectedDelivery?.created_at }}
          </div>
          <div>
            <span class="text-weight-bold">Date From:</span>
            {{ selectedDelivery?.date_from }}
          </div>
          <div>
            <span class="text-weight-bold">Date To:</span>
            {{ selectedDelivery?.date_to }}
          </div>
          <div>
            <span class="text-weight-bold">Driver ID:</span>
            {{ selectedDelivery?.driver_id }}
          </div>
          <div>
            <span class="text-weight-bold">Status:</span>
            {{ selectedDelivery?.status }}
          </div>
          <div>
            <span class="text-weight-bold">Area:</span>
            {{ selectedDelivery?.area }}
          </div>
          <div>
            <span class="text-weight-bold">Remarks:</span>
            {{ selectedDelivery?.remarks }}
          </div>
          <div>
            <span class="text-weight-bold">Contact Person Details:</span>
          </div>
          <ul v-if="contactPerson">
            <li>
              <span class="text-weight-bold">Name:</span>
              {{ contactPerson.name }}
            </li>
            <li>
              <span class="text-weight-bold">Contact No 1:</span>
              {{ contactPerson.contact_no1 }}
            </li>
            <li>
              <span class="text-weight-bold">Contact No 2:</span>
              {{ contactPerson.contact_no2 }}
            </li>
            <li>
              <span class="text-weight-bold">Email:</span>
              {{ contactPerson.email }}
            </li>
            <li>
              <span class="text-weight-bold">Address:</span>
              {{ contactPerson.address }}
            </li>
            <li>
              <span class="text-weight-bold">Remarks:</span>
              {{ contactPerson.remarks }}
            </li>
          </ul>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Close"
          color="primary"
          @click="deliveryDialog = false"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Customer Dialog -->
  <q-dialog v-model="customerDialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          Customer Details (ID: {{ selectedCustomer?.id }})
        </div>
        <div class="customer-details text-p">
          <div>
            <span class="text-weight-bold">Created At:</span>
            {{ selectedCustomer?.created_at }}
          </div>
          <div>
            <span class="text-weight-bold">Name:</span>
            {{ selectedCustomer?.name }}
          </div>
          <div>
            <span class="text-weight-bold">Contact No 1:</span>
            {{ selectedCustomer?.contact_no1 }}
          </div>
          <div>
            <span class="text-weight-bold">Contact No 2:</span>
            {{ selectedCustomer?.contact_no2 }}
          </div>
          <div>
            <span class="text-weight-bold">Email:</span>
            {{ selectedCustomer?.email }}
          </div>
          <div>
            <span class="text-weight-bold">Address:</span>
            {{ selectedCustomer?.address }}
          </div>
          <div>
            <span class="text-weight-bold">Remarks:</span>
            {{ selectedCustomer?.remarks }}
          </div>
          <div>
            <span class="text-weight-bold">Postal:</span>
            {{ selectedCustomer?.postal }}
          </div>
          <div>
            <span class="text-weight-bold">Recommended By:</span>
            {{ selectedCustomer?.recommended_by }}
          </div>
          <div>
            <span class="text-weight-bold">Type:</span>
            {{ selectedCustomer?.type }}
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Close"
          color="primary"
          @click="customerDialog = false"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { fetchAllOrders } from "@/../supabase/api/orders";
import { useRouter } from "vue-router";
const transactionStore = useTransactionStore();
const orders = ref([]);
const orderDialog = ref(false);
const collectionDialog = ref(false);
const deliveryDialog = ref(false);
const customerDialog = ref(false);
const selectedOrder = ref(null);
const selectedCollection = ref(null);
const selectedDelivery = ref(null);
const selectedCustomer = ref(null);
const contactPerson = ref(null);
const transactionItems = ref([]);
const searchQuery = ref("");
const startDate = ref(null);
const endDate = ref(null);

const router = useRouter();
// Fetch orders and customer details on component mount
onMounted(async () => {
  try {
    const rawOrders = await fetchAllOrders();
    console.log("Fetched Orders:", rawOrders); // Debug orders

    orders.value = await Promise.all(
      rawOrders.map(async (order) => {
        const customerDetails = await transactionStore.fetchCustomerDetailsById(
          order.customer_id
        );

        console.log("Customer Details:", customerDetails); // Debug customers

        return {
          ...order,
          customer_name: customerDetails?.name || "Unknown",
          contact_no1: customerDetails?.contact_no1 || "N/A",
              contact_no2: customerDetails?.contact_no2 || null,
              email: customerDetails?.email || null,
              remarks: customerDetails?.remarks || null,
              type: customerDetails?.type || null,
        };
      })
    );

    console.log("Orders with Customer Details:", orders.value);
  } catch (error) {
    console.error("Error initializing orders:", error);
  }
});



// Filtered Orders Computed Property
const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const matchesSearch =
      order.order_no.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      order.customer_name
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      order.contact_no1.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesDateRange = (() => {
      // Parse dates and set time to midnight to ensure accurate date-only comparison
      const orderDate = new Date(order.order_date_time).setHours(0, 0, 0, 0);
      const start = startDate.value
        ? new Date(startDate.value).setHours(0, 0, 0, 0)
        : null;
      const end = endDate.value
        ? new Date(endDate.value).setHours(0, 0, 0, 0)
        : null;

      return (!start || orderDate >= start) && (!end || orderDate <= end);
    })();

    return matchesSearch && matchesDateRange;
  });
});

// Helper function to format order_date_time to display date only
const formatDate = (timestamp) => {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleDateString(); // Format to "MM/DD/YYYY" or local format
};

// Open Order Dialog and fetch transaction items
const openOrderDialog = async (order) => {
  try {
    // Pre-fill the transaction store with customer details
    transactionStore.setSelectedCustomer({
      id: order.customer_id,
      name: order.customer_name,
      contact_no1: order.contact_no1,
      contact_no2: order?.contact_no2,
      email: order?.email,
      remarks: order?.remarks,
      type: order?.type,
    });

    // Set order number
    transactionStore.setOrderNo(order.order_no);

    // Set other transaction details
    transactionStore.resetItems(); // Reset previous transaction items
    transactionStore.setReadyBy(order.ready_by);

    // Open a new tab for the ReviewTab with the order_no as a parameter
    window.open(`/orders/${order.order_no}`, "_blank");
  } catch (error) {
    console.error("Error creating transaction:", error);
  }
};


// Open Collection Dialog and fetch collection details with contact person
const openCollectionDialog = async (collectionId) => {
  selectedCollection.value = await transactionStore.fetchCollectionDetailsById(
    collectionId
  );
  collectionDialog.value = true;
  if (selectedCollection.value?.contact_person_id) {
    contactPerson.value = await transactionStore.fetchContactPersonById(
      selectedCollection.value.contact_person_id
    );
  }
};

// Open Delivery Dialog and fetch delivery details with contact person
const openDeliveryDialog = async (deliveryId) => {
  selectedDelivery.value = await transactionStore.fetchDeliveriesDetailsById(
    deliveryId
  );
  deliveryDialog.value = true;
  if (selectedDelivery.value?.contact_person_id) {
    contactPerson.value = await transactionStore.fetchContactPersonById(
      selectedDelivery.value.contact_person_id
    );
  }
};

// Open Customer Dialog and fetch customer details
const openCustomerDialog = async (customerId) => {
  selectedCustomer.value = await transactionStore.fetchCustomerDetailsById(
    customerId
  );
  customerDialog.value = true;
};

const createTransaction = async (order) => {
  try {
    // Pre-fill the transaction store with customer details
    transactionStore.setSelectedCustomer({
      id: order.customer_id,
      name: order.customer_name,
      contact_no1: order.contact_no1,
      
              contact_no2: order?.contact_no2,
              email: order?.email,
              remarks: order?.remarks,
              type: order?.type,
    });

    // Adjust the order number
    const newOrderNo = `${order.order_no}-1`;
    transactionStore.setOrderNo(newOrderNo);

    // Reset other transaction details except items
    transactionStore.resetItems();
    transactionStore.setReadyBy("");

    // Navigate to PosPage.vue
    router.push({ name: "Pos" });
  } catch (error) {
    console.error("Error creating transaction:", error);
  }
};


</script>
