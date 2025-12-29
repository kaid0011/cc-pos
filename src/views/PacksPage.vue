<template>
  <div class="row justify-center page-title-header text-uppercase">
    Packs Management
  </div>
  <div class="full-container orders-history">
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
    </div>
    <div class="row q-my-sm q-col-gutter-sm">
<div class="col-2">
  <div class="dialog-label">
    <div class="text-weight-bold text-subtitle2">Goods Status</div>
  </div>
  <q-select
    v-model="goodsStatusFilter"
    :options="goodsStatusOptions"
    outlined
    dense
    emit-value
    map-options
    class="bg-white"
     :display-value="!goodsStatusFilter ? 'None applied' : undefined"
  >
    <template v-slot:append>
      <q-icon
        v-if="goodsStatusFilter"
        name="close"
        class="cursor-pointer q-ml-sm"
        @click.stop="goodsStatusFilter = null"
      />
    </template>
  </q-select>
</div>

      <div class="col-2">
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
          :display-value="!deliveryDriverFilter ? 'None applied' : undefined"
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
      <div class="col-2">
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
      <div class="col">
        <div class="dialog-label">
          <div class="text-weight-bold text-subtitle2">Search</div>
        </div>
        <q-input
          class="search-transactions search-input"
          v-model="searchQuery"
          outlined
          dense
          debounce="300"
          placeholder="Search here..."
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      
      <div class="col-3">
        <q-btn
          label="Show Ready For Packing"
          color="primary"
          unelevated
          dense
          class="q-mt-xs full-width"
          @click=""
          disabled
        />
        <q-btn
          label="Print Ready For Packing"
          color="primary"
          unelevated
          dense
          class="q-mt-xs full-width"
          @click=""
          disabled
        />
      </div>
    </div>

    <!-- Table Display -->
<PacksListComponent :orders="filteredOrders" :pageSize="10" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useTransactionStore } from '@/stores/transactionStore';
import PacksListComponent from '@/components/PacksListComponent.vue';

const transactionStore = useTransactionStore();
const orders = ref([]); // Stores fetched orders

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

// Goods Status filter (default to 'ready for packing')
const goodsStatusFilter = ref('ready for packing');

const goodsStatusOptions = [
  { label: 'None', value: 'none' },
  { label: 'For Collection', value: 'for collection' },
  { label: 'Under Process', value: 'under process' },
  { label: 'Ready for Packing', value: 'ready for packing' },
  { label: 'Ready for Delivery', value: 'ready for delivery' },
  { label: 'Ongoing Packing Issue/s', value: 'ongoing packing issue/s' },
  { label: 'Items Delivered', value: 'items delivered' },
];

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
   const hasMatchingDriver = (logistics.deliveries || []).some((d) => {
     const rowDriver =
       getDriverName(d?.driver_id) || d?.driver?.name || d?.driver_name || '';
     return rowDriver === driverName;
   });

    const hasMatchingDeliveryDate = (logistics.deliveries || []).some(
      (d) => d?.delivery_date === selectedRawDate
    );

    return hasMatchingDriver && hasMatchingDeliveryDate;
  });
});

// Fetch orders on mount
onMounted(async () => {
  try {
    const result = await transactionStore.fetchOrdersForPacks();
    orders.value = result;
    await transactionStore.loadDrivers();
     const orderIds = (orders.value || [])
      .map((lg) => lg?.order?.id)
      .filter(Boolean);
    await transactionStore.fetchPackCategoriesByOrderIds(orderIds);
  } catch (error) {
    console.error('Error on load:', error);
  }
});

const formattedDeliveryStartDate = computed(() =>
   deliveryStartDate.value ? formatDate(deliveryStartDate.value) : 'None applied'
 );

// Clear Date Input
const clearDate = (type) => {
  if (type === 'deliveryStartDate') deliveryStartDate.value = null;
};

const filteredOrders = computed(() => {
  const query = (searchQuery.value || '').toLowerCase().trim();
  const selectedDeliveryDate = deliveryStartDate.value;
  const gsSel = (goodsStatusFilter.value || '').trim().toLowerCase();

  return orders.value
    .filter((logistics) => {
      // --- allowed search fields only ---
      const orderNo = (logistics.order?.order_no || '').toLowerCase();

      const cust = logistics.customer || {};
      const customerFields = [
        cust.name,
        cust.contact_no1,
        cust.contact_no2,
        cust.email,
      ];

      const cp = logistics.deliveries?.[0]?.contact_person || {};
      const contactPersonFields = [
        cp.name,
        cp.contact_no1,
        cp.contact_no2,
        cp.email,
      ];

      const haystack = [orderNo, ...customerFields, ...contactPersonFields]
        .map((v) => (v == null ? '' : String(v).toLowerCase()));

      const searchMatch = !query || haystack.some((s) => s.includes(query));
      // ----------------------------------

      // goods status filter
      const rowGoods = String(logistics.order?.order_production?.goods_status || '')
        .trim()
        .toLowerCase();
      const goodsMatch = !gsSel
        ? true
        : gsSel === 'none'
        ? rowGoods === '' // treat empty/null as "none"
        : rowGoods === gsSel;

      // driver/date filters
      const deliveryDate = logistics.deliveries?.[0]?.delivery_date || null;
      const deliveryMatch = !selectedDeliveryDate || deliveryDate === selectedDeliveryDate;

      const deliveryDriver = deliveryDriverName(logistics);
      const driverMatch =
        !deliveryDriverFilter.value || deliveryDriver === deliveryDriverFilter.value;

      // pack category filter (reactive checkboxes)
      let categoryMatch = true;
      const selCats = selectedPackCategories.value;
      if (selCats.size > 0) {
        const orderId = logistics.order?.id;
        const catCounts =
          (orderId && transactionStore.packCategoriesByOrderId?.[orderId]) || {};
        categoryMatch = Array.from(selCats).some((cat) => (catCounts[cat] || 0) > 0);
      }

      return goodsMatch && deliveryMatch && searchMatch && driverMatch && categoryMatch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.deliveries?.[0]?.delivery_date || 0);
      const dateB = new Date(b.deliveries?.[0]?.delivery_date || 0);
      return dateB - dateA; // latest first
    });
});

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

const driverMapById = computed(() => {
  const m = new Map();
  (transactionStore.driverOptions || []).forEach((d) => {
    if (d?.id != null) m.set(String(d.id), (d.name || '').trim());
  });
  return m;
});

const getDriverName = (id) => {
  const key = id != null ? String(id) : '';
  return (key && driverMapById.value.get(key)) || '';
};

const deliveryDriverName = (src) => {
  const d = Array.isArray(src?.deliveries) ? src.deliveries?.[0] : src;
  if (!d) return '';
return getDriverName(d?.driver_id) || d?.driver?.name || d?.driver_name || '';
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

// map checkbox keys -> pack_category values (lowercase)
const PACK_CATEGORY_MAP = {
  clothings: 'clothings',
  officeWear: 'office wear',
  casualWear: 'casual wear',
  culturalWear: 'cultural wear',
  winterWear: 'winter wear',
  bedding: 'bedding',
  curtains: 'curtains',
  sofaCushionCovers: 'sofa/cushion covers',
  stuffToys: 'stuff toys',
  carpet: 'carpet',
  accessories: 'accessories',
  others: 'others',
  custom: 'custom',
  rAndI: 'r&i',
};

const selectedPackCategories = computed(() => {
  const sel = new Set();
  for (const [key, checked] of Object.entries(filters.value)) {
    if (checked && PACK_CATEGORY_MAP[key]) sel.add(PACK_CATEGORY_MAP[key]);
  }
  return sel;
});

</script>
