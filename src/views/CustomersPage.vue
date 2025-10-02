<template>
  <div class="row justify-center page-title-header text-uppercase">
    List of Customers
  </div>
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
    <q-tabs
      v-model="activeTab"
      dense
      class="bg-grey-2 text-dark q-mb-md"
      align="justify"
    >
      <q-tab name="all" class="tab-bordered">All Customers</q-tab>
      <q-tab name="contract" class="tab-bordered">Contract Customers</q-tab>
      <q-tab name="non-contract" class="tab-bordered"
        >Non-Contract Customers</q-tab
      >
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated>
      <q-tab-panel
        v-for="(tab, index) in tabConfig"
        :key="index"
        :name="tab.name"
        class="q-pa-none"
      >
        <div class="row-col-table">
          <div class="row row-col-header text-center items-center">
            <div class="col header-bordered flex flex-center">Name</div>
            <div class="col header-bordered flex flex-center">
              Contact Details
            </div>
            <div class="col header-bordered flex flex-center">
              Orders Summary
            </div>
            <div class="col header-bordered flex flex-center">
              Payments Summary
            </div>
            <div class="col-2 header-bordered flex flex-center">Actions</div>
          </div>

          <template v-if="tab.data.length > 0">
            <div
              v-for="customer in tab.data"
              :key="customer.id"
              class="row row-col-row"
            >
              <div class="col bordered">
                <div>
                  <a
                    @click.prevent="openCustomerTab(customer.id)"
                    class="text-weight-bold text-subtitle1 line-height-1"
                  >
                    {{ customer.name }}
                  </a>
                </div>
                <div>{{ customer.type }}</div>
              </div>

              <div class="col bordered">
                <div>{{ customer.contact_no1 || "N/A" }}</div>
                <div v-if="customer.contact_no2">
                  {{ customer.contact_no2 || "-" }}
                </div>
                <div>{{ customer.email }}</div>
              </div>
              <!-- <div class="col bordered">
                <ul v-if="customer.addresses?.length" class="line-height-1">
                  <li v-for="address in customer.addresses" :key="address.id">
                    {{ address.block_no }} {{ address.road_name }}
                    {{ address.unit_no }} {{ address.building_name }}
                    {{ address.postal_code
                    }}<span v-if="address.additional_info.length != 0"
                      >, ({{ address.additional_info }})</span
                    >
                  </li>
                </ul>
                <span v-else>No Address Available</span>
              </div> -->

              <div class="col bordered">
                <div>
                  Total Orders:
                  <span class="text-weight-bold">{{
                    customer.orders_count
                  }}</span>
                </div>
                <div>
                  Active Orders:
                  <span class="text-weight-bold">{{
                    customer.active_orders_count
                  }}</span>
                </div>
                <div>
                  Last Order:
                  <span
                    v-if="customer.last_order_id"
                    class="text-weight-bold"
                    style="text-decoration: underline"
                  >
                    <a
                      href="#"
                      class="text-primary cursor-pointer"
                      @click.prevent="openOrderTab(customer.last_order_id)"
                    >
                      {{
                        new Date(customer.last_order_date).toLocaleDateString()
                      }}
                    </a>
                  </span>
                  <span v-else>N/A</span>
                </div>
              </div>

              <div class="col bordered">
                <div>
                  Outstanding Balance:
                  <span class="text-weight-bold text-red-8 text-subtitle1">{{
                    getOutstandingBalance(customer)
                  }}</span>
                </div>
                <div>
                  Current Credits:
                  <span class="text-weight-bold text-green-9 text-subtitle1">{{
                    getTotalCredits(customer)
                  }}</span>
                </div>
              </div>

              <div class="col-2 bordered actions">
                <q-btn
                  unelevated
                  dense
                  label="Create Collection"
                  color="primary"
                  class="main-button q-ma-xs q-px-sm full-width"
                  @click="openCollectionDialog(customer)"
                />
                <q-btn
                  unelevated
                  dense
                  label="Create Transaction"
                  color="primary"
                  class="main-button q-ma-xs q-px-sm full-width"
                  @click="navigateToPOS(customer)"
                />
              </div>
            </div>
          </template>

          <template v-else>
            <div class="text-center q-pa-lg text-grey text-h6">
              No customers found.
            </div>
          </template>
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
    await transactionStore.loadCustomers(); // Only customers with credits, no addresses
  } catch (error) {
    console.error("Error loading customers:", error);
  }
});

function getTotalCredits(customer) {
  const credit = customer.customer_credits?.[0];
  const online = credit?.online_package ?? 0;
  const other = credit?.other_credits ?? 0;
  return online + other;
}

function getOutstandingBalance(customer) {
  const total = customer.total_amount ?? 0;
  const paid = customer.paid_amount ?? 0;
  return total - paid;
}

const tabConfig = computed(() => [
  { name: "all", data: filteredCustomers.value },
  { name: "contract", data: contractCustomers.value },
  { name: "non-contract", data: nonContractCustomers.value },
]);

const filteredCustomers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return transactionStore.customers;

  return transactionStore.customers.filter((customer) =>
    [
      customer.name,
      customer.contact_no1,
      customer.contact_no2,
      customer.email,
      customer.type,
    ].some((field) => field?.toLowerCase().includes(query))
  );
});

const contractCustomers = computed(() =>
  filteredCustomers.value
    .filter((customer) => customer.type === "Contract")
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
);

const nonContractCustomers = computed(() =>
  filteredCustomers.value.filter((customer) => customer.type !== "Contract")
);

const openCustomerTab = (customerId) => {
  const url = `/customers/${customerId}`;
  window.open(url, "_blank");
};

const handleCustomerAdded = async () => {
  showAddCustomerDialog.value = false;
  await transactionStore.loadCustomers();
};

const navigateToPOS = (customer) => {
  transactionStore.setSelectedCustomer({
    id: customer.id,
    name: customer.name,
    contact_no1: customer.contact_no1,
    contact_no2: customer.contact_no2,
    email: customer.email,
    remarks: customer.remarks,
    payment_type: customer.payment_type,
  });

  const routeData = router.resolve({ name: "Pos" });
  window.open(routeData.href, "_blank");
};

const openCollectionDialog = (customer) => {
  transactionStore.setSelectedCustomer(customer);
  showCreateCollectionDialog.value = true;
};

async function createCollection() {
  try {
    const logisticsId = await transactionStore.createLogistics();
    await transactionStore.createCollection(logisticsId);
    await transactionStore.createDelivery(logisticsId);

    $q.dialog({
      title: "Collection Created",
      message: "Collection created successfully!",
      ok: "OK",
      color: "positive",
    });

    transactionStore.selectedCollectionContact = null;
    transactionStore.selectedDeliveryContact = null;
    transactionStore.selectedCollectionAddress = null;
    transactionStore.selectedDeliveryAddress = null;
    transactionStore.selectedCollectionDriver = null;
    transactionStore.selectedDeliveryDriver = null;
    transactionStore.collectionRemarks = "";
    transactionStore.deliveryRemarks = "";

    showCreateCollectionDialog.value = false;
  } catch (error) {
    console.error("Error submitting collection:", error.message);
    $q.dialog({
      title: "Error",
      message: "Failed to create collection. Please try again.",
      ok: "Close",
      color: "negative",
    });
  }
}

const activeTab = ref("all");

const openOrderTab = (orderId) => {
  const url = `/orders/${orderId}`;
  window.open(url, "_blank");
};
</script>
