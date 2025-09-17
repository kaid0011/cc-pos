<template>
  <div class="full-container orders-history">
    <div class="text-h6 text-center text-uppercase text-weight-bolder q-mb-md">
      Packs Management
    </div>

    <q-card class="row preview-card q-mb-md">
      <!-- Generate Tag Section -->
      <div class="col-5 q-pa-md">
        <q-select
          v-model="selectedDriver"
          :options="sortedDriverOptions"
          option-label="name"
          option-value="id"
          label="Select Delivery Driver"
          outlined
          dense
          class="q-pb-sm"
        />
        <q-input
          v-model="formattedSelectedDate"
          outlined
          dense
          label="Select Delivery Date"
          readonly
          class="q-pb-sm"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="selectedDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
            <q-icon
              name="close"
              class="cursor-pointer q-ml-sm"
              @click="selectedDate = null"
            />
          </template>
        </q-input>
        <q-btn
          label="Generate Packing List"
          color="primary full-width"
          :disable="!selectedMatchedOrders.length"
          @click="generatePack"
          class="q-mt-sm"
        />
        <!-- <q-btn
          label="Customize Tag"
          color="secondary full-width"
          @click="openCustomizeDialog"
          class="q-mt-sm"
        /> -->
      </div>

      <div class="col-7 q-pa-md">
        <q-card
          bordered
          flat
          class="q-pa-sm"
          style="
            border-width: 1.5px;
            border-color: #c09f8b;
            height: 13.5em;
            display: flex;
            flex-direction: column;
          "
        >
          <!-- Header -->
          <div class="row items-center justify-between text-uppercase q-ml-xs">
            <div class="text-weight-bold">
              Matched Orders ({{ matchedOrdersList.length }}):
            </div>
            <q-checkbox
              class="text-caption"
              v-model="selectAll"
              label="Select All"
              dense
            />
          </div>

          <q-separator class="q-my-xs" />

          <!-- Scrollable List -->
          <div
            v-if="matchedOrdersList.length"
            style="overflow-y: auto; flex-grow: 1"
            class="q-pr-sm"
          >
            <div
              v-for="(logistics, index) in matchedOrdersList"
              :key="index"
              class="q-mb-sm"
            >
              <div class="row items-center justify-between q-mx-md">
                <div class="row">
                  <q-checkbox
                    v-model="selectedMatchedOrders"
                    :val="logistics"
                    dense
                  />
                  <div class="row items-center q-ml-sm">
                    <div>
                      <span class="text-weight-bold q-mr-xs">
                        {{ logistics.order?.order_no || 'N/A' }}
                      </span>
                      - {{ logistics.customer?.name || 'Unknown' }}
                    </div>
                  </div>
                </div>
                <q-btn
                  flat
                  dense
                  icon="open_in_new"
                  size="10px"
                  @click="openOrderDialog(logistics)"
                />
              </div>
            </div>
          </div>

          <div v-else class="text-grey">No matching orders found.</div>
        </q-card>
      </div>
    </q-card>

    <div class="row">
      <div class="col q-pa-sm q-mr-md" style="border: solid 1px">
        <div class="row">
          <div class="col">
            <div>
              <q-checkbox dense v-model="filters.clothings" label="Clothings" />
            </div>
            <div>
              <q-checkbox
                dense
                v-model="filters.officeWear"
                label="Office Wear"
              />
            </div>
            <div>
              <q-checkbox
                dense
                v-model="filters.casualWear"
                label="Casual Wear"
              />
            </div>
            <div>
              <q-checkbox
                dense
                v-model="filters.culturalWear"
                label="Cultural Wear"
              />
            </div>
          </div>
          <div class="col">
            <div>
              <q-checkbox
                dense
                v-model="filters.winterWear"
                label="Winter Wear"
              />
            </div>
            <div>
              <q-checkbox dense v-model="filters.bedding" label="Bedding" />
            </div>
            <div>
              <q-checkbox dense v-model="filters.curtains" label="Curtains" />
            </div>
            <div>
              <q-checkbox
                dense
                v-model="filters.sofaCushionCovers"
                label="Sofa/Cushion Covers"
              />
            </div>
          </div>
          <div class="col">
            <div>
              <q-checkbox
                dense
                v-model="filters.stuffToys"
                label="Stuff Toys"
              />
            </div>
            <div>
              <q-checkbox dense v-model="filters.carpet" label="Carpet" />
            </div>
            <div>
              <q-checkbox
                dense
                v-model="filters.accessories"
                label="Accessories"
              />
            </div>
            <div>
              <q-checkbox dense v-model="filters.others" label="Others" />
            </div>
          </div>
          <div class="col">
            <div>
              <q-checkbox dense v-model="filters.custom" label="Custom" />
            </div>
            <div><q-checkbox dense v-model="filters.rAndI" label="R&I" /></div>
          </div>
        </div>
      </div>
      <div class="col-2">
        <q-btn
          label="Find Category"
          color="primary"
          unelevated
          dense
          class="full-width"
          @click=""
        />
        <q-btn
          label="Show Not Ready"
          color="primary"
          unelevated
          dense
          class="q-mt-xs full-width"
          @click=""
        />
        <q-btn
          label="Print Not Ready"
          color="primary"
          unelevated
          dense
          class="q-mt-xs full-width"
          @click=""
        />
      </div>
    </div>
    <div class="row q-mt-md justify-end q-col-gutter-md">
      <div class="col-3">
        <div class="dialog-label">
          <div class="text-weight-bold text-subtitle2">Delivery Driver</div>
        </div>
        <q-select
          v-model="deliveryDriverFilter"
          :options="sortedDriverOptions"
          option-label="name"
          option-value="name"
          outlined
          dense
          emit-value
          map-options
          class="bg-white"
      >
          <template v-slot:append>
            <q-icon
              v-if="deliveryDriverFilter"
              name="close"
              class="cursor-pointer q-ml-sm"
              @click.stop="deliveryDriverFilter = null"
            />
          </template></q-select>
      </div>
      <div class="col-3">
        <div class="dialog-label">
          <div class="text-weight-bold text-subtitle2">Delivery Date</div>
        </div>
        <q-input
          v-model="formattedDeliveryStartDate"
          outlined
          dense
          readonly
          class="bg-white q-mb-xs"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="deliveryStartDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
            <q-icon
              name="close"
              class="cursor-pointer q-ml-sm"
              @click="clearDate('deliveryStartDate')"
            />
          </template>
        </q-input>
      </div>
      <div class="col-3">
        <div class="dialog-label">
          <div class="text-weight-bold text-subtitle2">Search Here...</div>
        </div>
        <q-input
          class="search-transactions search-input"
          v-model="searchQuery"
          outlined
          dense
          debounce="300"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Table Display -->
    <div class="row-col-table q-mt-md">
      <!-- Table Header -->
      <div class="row row-col-header q-px-md text-center">
        <div class="col text-weight-bolder q-py-sm">Order Details</div>
        <div class="col-4 text-weight-bolder q-py-sm">Logistics Details</div>
        <div class="col text-weight-bolder q-py-sm">Production Details</div>
        <div class="col text-weight-bolder q-py-sm">Customer Details</div>
      </div>

      <!-- Table Rows -->
      <div
        v-if="paginatedOrders.length === 0"
        class="text-center text-grey q-pa-lg text-h6"
      >
        No orders found.
      </div>

      <div
        v-for="(logistics, index) in paginatedOrders"
        :key="index"
        class="row row-col-row q-px-md"
      >
        <div class="col bordered">
          <div>
            <a
              @click="openOrderDialog(logistics)"
              class="text-weight-bold text-subtitle1"
            >
              {{ logistics.order?.order_no || 'N/A' }}
            </a>
          </div>
          <div>
            <span class="text-caption text-uppercase text-weight-bold">
              Date:
            </span>
            {{ getOrderDate(logistics) }}
          </div>
          <div>
            <span class="text-caption text-uppercase text-weight-bold">
              Urgency:
            </span>
            <span
              :class="[
                'text-uppercase',
                'text-weight-bolder',
                logistics.urgency?.toLowerCase?.() === 'urgent'
                  ? 'text-purple'
                  : logistics.urgency?.toLowerCase?.() === 'express'
                  ? 'text-red'
                  : 'text-caption',
              ]"
            >
              {{ logistics.urgency || 'default' }}
            </span>
          </div>
        </div>
        <div class="col-4 bordered" style="padding: 0">
          <div>
            <div
              :class="[
                'text-weight-bold',
                'text-subtitle1',
                'text-center',
                'q-mb-sm',
                'q-mx-sm',
                'line-height-1',
                'text-uppercase',
                logisticsBadgeClass(logistics.logistics_status),
              ]"
              style="border-style: solid; border-width: 1px"
            >
              {{ logistics.logistics_status }}
            </div>
          </div>
          <q-separator />
          <div class="row" style="min-height: auto">
            <div
              class="col"
               :style="{
                        order: isDeliveryFirst(logistics.logistics_status)
                          ? 2
                          : 1,
                        borderRight: isDeliveryFirst(logistics.logistics_status)
                          ? ''
                          : '1px solid #c09f8b',
                      }"
            >
              <div
                class="text-uppercase text-weight-bolder text-pink-4 text-center"
              >
                Collection
              </div>
              <q-separator />
              <div class="q-pa-sm">
                <div>
                  <span class="text-caption text-uppercase text-weight-bold">
                    Date: </span
                  >{{ getCollectionDate(logistics.collections) }}
                </div>
                <div>
                  <span class="text-caption text-uppercase text-weight-bold">
                    Time:
                  </span>
                  {{ logistics.collections?.[0]?.collection_time || 'N/A' }}
                </div>
                <div>
                  <span class="text-caption text-uppercase text-weight-bold">
                    Driver: </span
                  >{{ logistics.collections?.[0]?.driver_name || 'N/A' }}
                </div>
              </div>
            </div>
            <div class="col":style="{
                        order: isDeliveryFirst(logistics.logistics_status)
                          ? 1
                          : 2,
                        borderRight: isDeliveryFirst(logistics.logistics_status)
                          ? '1px solid #c09f8b'
                          : '',
                      }">
              <div
                class="text-uppercase text-weight-bolder text-blue text-center"
              >
                Delivery
              </div>
              <q-separator />
              <div class="q-pa-sm">
                <div>
                  <span class="text-caption text-uppercase text-weight-bold">
                    Date: </span
                  >{{ getDeliveryDate(logistics.deliveries) }}
                </div>
                <div>
                  <span class="text-caption text-uppercase text-weight-bold">
                    Time: </span
                  >{{ logistics.deliveries?.[0]?.delivery_time || 'N/A' }}
                </div>
                <div>
                  <span class="text-caption text-uppercase text-weight-bold">
                    Driver: </span
                  >{{ logistics.deliveries?.[0]?.driver_name || 'N/A' }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col bordered" style="padding-top: 0">
          <div
            class="text-weight-bold text-uppercase text-subtitle1 text-center q-mb-xs line-height-1"
            style="border-style: solid; border-width: 1px"
          >
            {{ logistics.order?.order_production?.goods_status || '-' }}
          </div>
                    <div>
            <q-btn
              label="View Pack Details"
              color="primary"
              unelevated
              dense
              class="q-mb-sm full-width"
              @click="viewPackDetails(logistics.order?.order_no)"
            />
          </div>
                  <div>
                    <span class="text-caption text-uppercase text-weight-bold"
                      >Ready By:</span
                    >
                    {{
                      formatDate(
                        order?.order_production?.ready_by ||
                          logistics.order?.order_production?.ready_by
                      ) || "-"
                    }}
                  </div>
                  <q-separator class="q-ma-sm" />
          <div v-if="logistics.collections?.[0]?.no_bags">
            <span class="text-caption text-caption text-weight-bold text-uppercase q-mr-xs">Bags: </span
            >{{ logistics.collections?.[0]?.no_bags || '-' }}b
          </div>
          <div v-if="logistics.order?.order_production?.no_hangers">
            <span class="text-caption text-caption text-weight-bold text-uppercase q-mr-xs">Hang:</span>
            {{ logistics.order?.order_production?.no_hangers || '-' }}h
          </div>
          <div v-if="logistics.order?.order_production?.no_packets">
            <span class="text-caption text-caption text-weight-bold text-uppercase q-mr-xs">Pack:</span>
            {{ logistics.order?.order_production?.no_packets || '-' }}p
          </div>
          <div v-if="logistics.order?.order_production?.no_rolls">
            <span class="text-caption text-caption text-weight-bold text-uppercase q-mr-xs">Rolls:</span>
            {{ logistics.order?.order_production?.no_rolls || '-' }}r
          </div>
        </div>
        <div class="col bordered">
          <div class="text-weight-bold">
            <a
              @click.prevent="openCustomerTab(logistics.customer?.id)"
              class="text-weight-bold text-subtitle1 line-height-1"
            >
              {{ logistics.customer?.name || '[NOT SELECTED]' }}
            </a>
          </div>
         <div>
            <template v-if="logistics.customer?.contact_no1 || logistics.customer?.contact_no2">
              <span
                v-if="logistics.customer?.contact_no1"
                class="phone-link"
                @click.stop
              >
                {{ logistics.customer?.contact_no1 }}
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-list style="min-width:220px">
                    <q-item clickable v-ripple @click="callViaPhone(logistics.customer?.contact_no1)">
                      <q-item-section avatar><q-icon name="call"/></q-item-section>
                      <q-item-section>Call via phone</q-item-section>
                   </q-item>
                    <q-item clickable v-ripple @click="callViaWhatsApp(logistics.customer?.contact_no1)">
                      <q-item-section avatar><q-icon name="chat"/></q-item-section>
                      <q-item-section>Call via WhatsApp</q-item-section>
                    </q-item>
                  </q-list>
                </q-popup-proxy>
              </span>
              <span v-if="logistics.customer?.contact_no2"> / </span>
              <span
                v-if="logistics.customer?.contact_no2"
                class="phone-link"
                @click.stop
              >
                {{ logistics.customer?.contact_no2 }}
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-list style="min-width:220px">
                    <q-item clickable v-ripple @click="callViaPhone(logistics.customer?.contact_no2)">
                      <q-item-section avatar><q-icon name="call"/></q-item-section>
                      <q-item-section>Call via phone</q-item-section>
                    </q-item>
                    <q-item clickable v-ripple @click="callViaWhatsApp(logistics.customer?.contact_no2)">
                      <q-item-section avatar><q-icon name="chat"/></q-item-section>
                      <q-item-section>Call via WhatsApp</q-item-section>
                    </q-item>
                  </q-list>
                </q-popup-proxy>
              </span>
            </template>
          </div>
          <q-separator class="q-mt-sm" />
          <div class="mark-yellow text-center text-uppercase">
            Contact Person
          </div>
          <q-separator />
          <div>
            {{
              logistics.collections?.[0]?.contact_person?.name || '[NOT SET]'
            }}
          </div>
         <div>
            <template v-if="logistics.collections?.[0]?.contact_person?.contact_no1 || logistics.collections?.[0]?.contact_person?.contact_no2">
              <span
                v-if="logistics.collections?.[0]?.contact_person?.contact_no1"
                class="phone-link"
                @click.stop
              >
                {{ logistics.collections?.[0]?.contact_person?.contact_no1 }}
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-list style="min-width:220px">
                    <q-item clickable v-ripple @click="callViaPhone(logistics.collections?.[0]?.contact_person?.contact_no1)">
                      <q-item-section avatar><q-icon name="call"/></q-item-section>
                      <q-item-section>Call via phone</q-item-section>
                    </q-item>
                    <q-item clickable v-ripple @click="callViaWhatsApp(logistics.collections?.[0]?.contact_person?.contact_no1)">
                      <q-item-section avatar><q-icon name="chat"/></q-item-section>
                      <q-item-section>Call via WhatsApp</q-item-section>
                    </q-item>
                  </q-list>
                </q-popup-proxy>
              </span>
              <span v-if="logistics.collections?.[0]?.contact_person?.contact_no2"> / </span>
              <span
                v-if="logistics.collections?.[0]?.contact_person?.contact_no2"
                class="phone-link"
                @click.stop
              >
                {{ logistics.collections?.[0]?.contact_person?.contact_no2 }}
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-list style="min-width:220px">
                    <q-item clickable v-ripple @click="callViaPhone(logistics.collections?.[0]?.contact_person?.contact_no2)">
                      <q-item-section avatar><q-icon name="call"/></q-item-section>
                      <q-item-section>Call via phone</q-item-section>
                    </q-item>
                    <q-item clickable v-ripple @click="callViaWhatsApp(logistics.collections?.[0]?.contact_person?.contact_no2)">
                      <q-item-section avatar><q-icon name="chat"/></q-item-section>
                      <q-item-section>Call via WhatsApp</q-item-section>
                    </q-item>
                  </q-list>
                </q-popup-proxy>
              </span>
            </template>
          </div>
        </div>
      </div>
    </div>
    <!-- Pagination Controls -->
    <div class="row justify-center q-mt-md">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="10"
        boundary-numbers
        direction-links
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { openURL } from 'quasar';

const transactionStore = useTransactionStore();
const orders = ref([]); // Stores fetched orders
const currentPage = ref(1); // Current page for pagination
const pageSize = ref(10); // Number of records per page

const searchQuery = ref(''); // Search input
// Date Filters
const deliveryStartDate = ref(null);

const selectedDriver = ref(null);
const selectedDate = ref(null);

const formattedSelectedDate = computed(() => formatDate(selectedDate.value));
const selectedMatchedOrders = ref([]);

const deliveryDriverFilter = ref(null);

const filters = ref({
  clothings: false,
  officeWear: false,
  casualWear: false,
  culturalWear: false,
  winterWear: false,
  bedding: false,
  curtains: false,
  sofaCushionCovers: false,
  stuffToys: false,
  carpet: false,
  accessories: false,
  others: false,
  custom: false,
  rAndI: false,
});

// --- SAME COLOR-CODING AS IN LogisticsManagement.vue ---
const COLLECTION_STATUSES = new Set([
  'collection arranged',
  'collection completed',
  'collection rescheduled',
  'collection cancelled',
]);

const DELIVERY_STATUSES = new Set([
  'delivery arranged',
  'delivery completed',
  'delivery postponed',
  'delivery partial',
]);

function logisticsBadgeClass(status) {
  const s = String(status || '').trim().toLowerCase();
  if (COLLECTION_STATUSES.has(s)) return 'mark-bg-pink';
  if (DELIVERY_STATUSES.has(s)) return 'mark-bg-blue';
  return '';
}
// -------------------------------------------------------

const sortedDriverOptions = computed(() => {
  return [...transactionStore.driverOptions].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
});

const selectAll = ref(false);

watch(selectAll, (val) => {
  if (val) {
    selectedMatchedOrders.value = [...matchedOrdersList.value];
  } else {
    selectedMatchedOrders.value = [];
  }
});

watch(selectedMatchedOrders, (val) => {
  selectAll.value =
    val.length === matchedOrdersList.value.length &&
    matchedOrdersList.value.length > 0;
});

watch([selectedDriver, selectedDate], () => {
  if (!selectedDriver.value || !selectedDate.value) {
    matchedOrdersList.value = [];
    return;
  }

  const driverName = selectedDriver.value.name;
  const selectedRawDate = selectedDate.value;

  matchedOrdersList.value = filteredOrders.value.filter((logistics, index) => {
    const hasMatchingDriver = logistics.deliveries?.some(
      (c) => c?.driver_name === driverName
    );

    const hasMatchingDeliveryDate = logistics.deliveries?.some(
      (d) => d?.delivery_date === selectedRawDate
    );

    return hasMatchingDriver && hasMatchingDeliveryDate;
  });
});

// Fetch orders on mount
onMounted(async () => {
  try {
    const result = await transactionStore.fetchAllOrdersSimple();
    orders.value = result;
    await transactionStore.loadDrivers();
  } catch (error) {
    console.error('Error on load:', error);
  }
});

const formattedDeliveryStartDate = computed(() =>
  formatDate(deliveryStartDate.value)
);

// Clear Date Input
const clearDate = (type) => {
  if (type === 'deliveryStartDate') deliveryStartDate.value = null;
};

// Filter Orders Based on Search & Date Range
const filteredOrders = computed(() => {
  const query = searchQuery.value.toLowerCase();
  const selectedDeliveryDate = deliveryStartDate.value;

  return orders.value
    .filter((logistics) => {
      const orderNo = logistics.order?.order_no?.toLowerCase() || '';
      const customerName = logistics.customer?.name?.toLowerCase() || '';
      const deliveryDate = logistics.deliveries?.[0]?.delivery_date || null;
      const deliveryDriver = logistics.deliveries?.[0]?.driver_name || '';

      const deliveryMatch =
        !selectedDeliveryDate || deliveryDate === selectedDeliveryDate;
      const searchMatch =
        orderNo.includes(query) || customerName.includes(query);
      const driverMatch =
        !deliveryDriverFilter.value ||
        deliveryDriver === deliveryDriverFilter.value;

      return deliveryMatch && searchMatch && driverMatch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.deliveries?.[0]?.delivery_date || 0);
      const dateB = new Date(b.deliveries?.[0]?.delivery_date || 0);
      return dateB - dateA; // latest delivery date first
    });
});

// Pagination: Get the paginated slice of orders
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredOrders.value.slice(start, end);
});

// Total number of pages
const totalPages = computed(() =>
  Math.ceil(filteredOrders.value.length / pageSize.value)
);

// Function to format dates
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getOrderDate = (logistics) => {
  return formatDate(logistics.order?.created_at);
};

// Get collection date from collections array
const getCollectionDate = (collections) => {
  if (!collections || collections.length === 0) return 'N/A';
  return formatDate(collections[0]?.collection_date);
};

// Get delivery date from deliveries array
const getDeliveryDate = (deliveries) => {
  if (!deliveries || deliveries.length === 0) return 'N/A';
  return formatDate(deliveries[0]?.delivery_date);
};

// Open Customer Tab
const openCustomerTab = (customerId) => {
  if (!customerId) return;
  window.open(`/customers/${customerId}`, '_blank');
};

// Open Order Dialog and fetch transaction items
const openOrderDialog = async (logistics) => {
  try {
    if (!logistics || !logistics.order) return;

    transactionStore.setSelectedCustomer({
      id: logistics.customer?.id,
    });

    transactionStore.setOrderNo(logistics.order.order_no);
    transactionStore.resetTransactionItems();

    window.open(`/orders/${logistics.order.order_no}`, '_blank');
  } catch (error) {
    console.error('Error opening order dialog:', error);
  }
};

const viewPackDetails = (order_no) => {
  const url = `/packs/${order_no}`;
  window.open(url, '_blank');
};

const DRIVER_CODES = {
  Ass: 'Ass',
  Ken: 'Ken',
  Ang: 'Ang',
  Pea: 'Pea',
  You: 'You',
  'Self-collect': 'Sfc',
  'Ng Soo Chong': 'Nsc',
  Chia: 'Cha',
  Des: 'Des',
  Cue: 'Cue',
  Are: 'Are',
  Ting: 'Tin',
};

const matchedOrdersList = ref([]);

const generatePack = () => {
  const driverName = selectedDriver.value?.name;
  const selectedRawDate = selectedDate.value;

  if (!driverName || !selectedRawDate) {
    console.warn('Driver or Date not selected');
    return;
  }

  if (!selectedMatchedOrders.value.length) {
    console.warn('No orders selected to generate tag.');
    return;
  }

  const driverCode = DRIVER_CODES[driverName] || driverName;
  const groupSlug = `${driverCode}-${selectedRawDate}`;

  const selectedOrderNos = selectedMatchedOrders.value
    .map((logistics) => logistics.order?.order_no)
    .filter(Boolean);

  const query = encodeURIComponent(selectedOrderNos.join(','));
  const url = `/packs/grp-${groupSlug}?orders=${query}`;

  window.open(url, '_blank');
};

 const sanitizeForTel = (raw) => String(raw || '').replace(/[^\d+]/g, ''); // keep digits and +
 const sanitizeForWhatsApp = (raw) => String(raw || '').replace(/\D/g, '');  // digits only
 const callViaPhone = (raw) => {
   const tel = sanitizeForTel(raw);
   if (tel) openURL(`tel:${tel}`);
 };
 const callViaWhatsApp = (raw) => {
   const wa = sanitizeForWhatsApp(raw);
  if (wa) openURL(`https://wa.me/${wa}`);
 };

// Which side goes first under "Logistics Details"?
const isDeliveryFirst = (status) => {
  const s = String(status || "")
    .trim()
    .toLowerCase();
  if (DELIVERY_STATUSES.has(s) || s.startsWith("delivery")) return true;
  // default & collection-* → collection first
  return false;
};
</script>
