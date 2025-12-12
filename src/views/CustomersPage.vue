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
          <template #prepend><q-icon name="search" /></template>
          <template #append>
            <q-icon
              name="close"
              @click="searchQuery = ''"
              class="cursor-pointer"
            />
            <q-tooltip>Clear search</q-tooltip>
          </template>
        </q-input>

        <q-checkbox
          v-model="showInactive"
          label="Show inactive customers"
          aria-label="Show inactive customers"
          dense
          color="negative"
          class="q-mx-sm text-negative"
        />
      </div>

      <div class="row items-center q-gutter-sm">
        <q-btn
          unelevated
          class="main-button"
          color="primary"
          icon="person_add"
          @click="showAddCustomerDialog = true"
          label="Add Customer"
        >
          <q-tooltip>Add a new customer</q-tooltip>
        </q-btn>
      </div>
    </div>

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
              class="row row-col-row line-height-1"
            >
              <div class="col bordered">
                <div class="row items-center no-wrap q-col-gutter-x-sm">
                  <a
                    @click.prevent="openCustomerTab(customer.id)"
                    class="text-weight-bold text-subtitle1 line-height-1"
                  >
                    {{ customer.name }}
                  </a>
                  <q-tooltip>Open customer in new tab</q-tooltip>
                </div>
                <div>{{ customer.type }}</div>
                <div>
                  <q-badge
                    v-if="!isCustomerActive(customer)"
                    label="Inactive"
                    color="negative"
                    text-color="white"
                    class="q-py-xs"
                    aria-label="Inactive customer"
                    dense
                  />
                </div>
              </div>

              <div class="col bordered">
                <div>
                  <template v-if="customer.contact_no1 || customer.contact_no2">
                    <div
                      v-if="customer.contact_no1"
                      class="phone-link"
                      role="button"
                      tabindex="0"
                      @click.stop
                      @keydown.enter.stop
                      @keydown.space.prevent.stop
                    >
                      {{ customer.contact_no1 }}
                      <q-tooltip>Click for options</q-tooltip>
                      <q-popup-proxy
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-list style="min-width: 220px">
                          <q-item
                            clickable
                            v-ripple
                            @click="callViaPhone(customer.contact_no1)"
                          >
                            <q-item-section avatar
                              ><q-icon name="call"
                            /></q-item-section>
                            <q-item-section>Call via phone</q-item-section>
                          </q-item>
                          <q-item
                            clickable
                            v-ripple
                            @click="callViaWhatsApp(customer.contact_no1)"
                          >
                            <q-item-section avatar
                              ><q-icon name="chat"
                            /></q-item-section>
                            <q-item-section>Call via WhatsApp</q-item-section>
                          </q-item>
                        </q-list>
                      </q-popup-proxy>
                    </div>

                    <div
                      v-if="customer.contact_no2"
                      class="phone-link"
                      role="button"
                      tabindex="0"
                      @click.stop
                      @keydown.enter.stop
                      @keydown.space.prevent.stop
                    >
                      {{ customer.contact_no2 }}
                      <q-tooltip>Click for options</q-tooltip>
                      <q-popup-proxy
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-list style="min-width: 220px">
                          <q-item
                            clickable
                            v-ripple
                            @click="callViaPhone(customer.contact_no2)"
                          >
                            <q-item-section avatar
                              ><q-icon name="call"
                            /></q-item-section>
                            <q-item-section>Call via phone</q-item-section>
                          </q-item>
                          <q-item
                            clickable
                            v-ripple
                            @click="callViaWhatsApp(customer.contact_no2)"
                          >
                            <q-item-section avatar
                              ><q-icon name="chat"
                            /></q-item-section>
                            <q-item-section>Call via WhatsApp</q-item-section>
                          </q-item>
                        </q-list>
                      </q-popup-proxy>
                    </div>
                  </template>
                  <template v-else>N/A</template>
                </div>

                <div v-if="customer.email">
                  <span
                    class="email-link"
                    role="button"
                    tabindex="0"
                    @click.stop
                    @keydown.enter.stop
                    @keydown.space.prevent.stop
                  >
                    {{ customer.email }}
                    <q-tooltip>Click for options</q-tooltip>
                    <q-popup-proxy
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-list style="min-width: 220px">
                        <q-item
                          clickable
                          v-ripple
                          @click="composeEmail(customer.email)"
                        >
                          <q-item-section avatar
                            ><q-icon name="email"
                          /></q-item-section>
                          <q-item-section>Compose email</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-ripple
                          @click="copyEmail(customer.email)"
                        >
                          <q-item-section avatar
                            ><q-icon name="content_copy"
                          /></q-item-section>
                          <q-item-section>Copy email</q-item-section>
                        </q-item>
                      </q-list>
                    </q-popup-proxy>
                  </span>
                </div>
              </div>

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
                    v-if="customer.last_order_no"
                    class="text-weight-bold"
                    style="text-decoration: underline"
                  >
                    <a
                      href="#"
                      class="text-primary cursor-pointer"
                      @click.prevent="openOrderTab(customer.last_order_no)"
                    >
                      {{ formatDate(customer.last_order_date) }}
                    </a>
                    <q-tooltip>Open last order in new tab</q-tooltip>
                  </span>
                  <span v-else>N/A</span>
                </div>
              </div>

              <div class="col bordered">
                <div>
                  Outstanding Balance:
                  <span class="text-weight-bold text-red-8">
                     {{ formatMoney(getOutstandingBalance(customer)) }}
                  </span>
                </div>
                <div>
                  Current Credits:
                  <span class="text-weight-bold text-green-9">
                 {{ formatMoney(getTotalCredits(customer)) }}
                  </span>
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
                >
                  <q-tooltip>Create collection for this customer</q-tooltip>
                </q-btn>
                <!-- <q-btn
                  unelevated
                  dense
                  label="Create Transaction"
                  color="primary"
                  class="main-button q-ma-xs q-px-sm full-width"
                  @click="navigateToPOS(customer)"
                >
                  <q-tooltip>Open POS with this customer</q-tooltip>
                </q-btn> -->
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
import { useQuasar, openURL, copyToClipboard } from "quasar";
import AddCustomerDialog from "@/components/dialogs/AddCustomerDialog.vue";
import CreateCollectionTab from "@/components/CreateCollectionTab.vue";

const transactionStore = useTransactionStore();
const router = useRouter();
const $q = useQuasar();

const searchQuery = ref("");
const showInactive = ref(false);
const showAddCustomerDialog = ref(false);
const showCreateCollectionDialog = ref(false);
const activeTab = ref("all");

onMounted(async () => {
  try {
    await transactionStore.loadCustomers();
  } catch (error) {
    console.error("Error loading customers:", error);
  }
});

const isCustomerActive = (customer) => {
  const v = customer?.is_active;
  return v === true || v === "true" || v === 1;
};

const getLastOrderTs = (c) => {
  const d = c?.last_order_date ? new Date(c.last_order_date) : null;
  const t = d && !isNaN(d.getTime()) ? d.getTime() : Number.NEGATIVE_INFINITY;
  return t;
};

const compareByLastOrder = (a, b) => {
  const ta = getLastOrderTs(a);
  const tb = getLastOrderTs(b);
  if (tb !== ta) return tb - ta;
  const an = (a?.name || "").toLowerCase();
  const bn = (b?.name || "").toLowerCase();
  return an.localeCompare(bn);
};

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

const filteredCustomers = computed(() => {
  const base = (transactionStore.customers ?? []).filter((c) =>
    showInactive.value ? true : isCustomerActive(c)
  );

  const query = searchQuery.value.trim().toLowerCase();
  const afterSearch = !query
    ? base
    : base.filter((customer) =>
        [
          customer.name,
          customer.contact_no1,
          customer.contact_no2,
          customer.email,
          customer.type,
        ].some((field) => field?.toLowerCase().includes(query))
      );

  return [...afterSearch].sort(compareByLastOrder);
});

const contractCustomers = computed(() =>
  filteredCustomers.value
    .filter((customer) => customer.type === "Contract")
    .sort(compareByLastOrder)
);

const nonContractCustomers = computed(() =>
  filteredCustomers.value
    .filter((customer) => customer.type !== "Contract")
    .sort(compareByLastOrder)
);

const tabConfig = computed(() => [
  { name: "all", data: filteredCustomers.value },
  { name: "contract", data: contractCustomers.value },
  { name: "non-contract", data: nonContractCustomers.value },
]);

const openCustomerTab = (customerId) => {
  window.open(`/customers/${customerId}`, "_blank");
};

const openOrderTab = (orderNo) => {
  window.open(`/orders/${orderNo}`, "_blank");
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

const DEFAULT_WHATSAPP_CC = "+65";
const sanitizeForTel = (raw) => String(raw || "").replace(/[^\d+]/g, "");
const sanitizeForWhatsApp = (raw) => String(raw || "").replace(/\D/g, "");
const ensureWhatsAppWithCc = (digits) => {
  if (!digits) return "";
  if (digits.startsWith("0"))
    return `${DEFAULT_WHATSAPP_CC.replace("+", "")}${digits.slice(1)}`;
  return digits;
};
const sanitizeEmail = (raw) => String(raw || "").trim();

const callViaPhone = (raw) => {
  const tel = sanitizeForTel(raw);
  if (tel) openURL(`tel:${tel}`);
};

const callViaWhatsApp = (raw) => {
  const onlyDigits = sanitizeForWhatsApp(raw);
  const withCc = onlyDigits.startsWith("0")
    ? ensureWhatsAppWithCc(onlyDigits)
    : onlyDigits;
  if (withCc) openURL(`https://wa.me/${withCc}`);
};

const composeEmail = (raw) => {
  const email = sanitizeEmail(raw);
  if (email) openURL(`mailto:${email}`);
};

const copyEmail = async (raw) => {
  const email = sanitizeEmail(raw);
  if (!email) return;
  try {
    await copyToClipboard(email);
    $q.notify({ type: "positive", message: "Email copied" });
  } catch {
    $q.notify({ type: "negative", message: "Copy failed" });
  }
};

function formatDate(input) {
  if (!input) return "N/A";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function formatMoney(value) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
</script>
