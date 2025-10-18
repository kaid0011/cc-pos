<template>
  <div class="row justify-center page-title-header text-uppercase">
    Logistics Management
  </div>
  <div class="full-container logistics-management">
    <!-- Weekly Summary Section -->
    <q-card flat class="q-mb-lg q-pa-md">
      <div class="row justify-between">
        <div class="col-2 text-center">
          <div v-if="showWeeklySummary">
            <div class="mark-green line-height-1">1+ col/del</div>
            <div class="mark-yellow line-height-1">10+ col/del</div>
            <div class="mark-red line-height-1">20+ col/del</div>
          </div>
        </div>
        <div class="col row items-center justify-center q-mb-sm">
          <q-btn
            icon="fa-regular fa-circle-left"
            color="teal-6"
            flat
            @click="previousWeek"
          />
          <div class="text-center">
            <div
              class="text-h6 text-weight-bolder text-uppercase line-height-1"
            >
              Weekly Summary
            </div>
            <div class="text-subtitle1 text-weight-bold line-height-1">
              ({{ formattedStartOfWeek }} - {{ formattedEndOfWeek }})
            </div>
          </div>
          <q-btn
            icon="fa-regular fa-circle-right"
            color="teal-6"
            flat
            @click="nextWeek"
          />
        </div>
        <div class="col-2" align="right">
          <q-btn
            outline
            color="primary"
            @click="toggleWeeklySummary"
            class="text-weight-bolder text-subtitle1"
          >
            {{ showWeeklySummary ? "Hide Summary" : "Show Summary" }}
          </q-btn>
        </div>
      </div>

      <!-- Weekly Summary Table Using <div class="row"> -->
      <div v-if="showWeeklySummary" class="weekly-summary-container">
        <!-- Header Row: Weekdays with Dates -->
        <div
          class="row text-center text-weight-bold bg-primary text-white items-center all-border"
          style="padding: 0.5em"
        >
          <div class="col">Driver</div>
          <div
            v-for="(day, index) in daysOfWeek"
            :key="day"
            class="col line-height-1"
          >
            <div class="text-uppercase text-yellow">{{ day }}</div>
            <div class="text-caption line-height-1 text-weight-bold">
              {{ formattedWeekDates[index] }}
            </div>
          </div>
        </div>

        <!-- Driver-Based Rows -->
        <div
          v-for="driverId in drivers"
          :key="driverId"
          class="row text-center items-center bg-grey-3 q-pa-sm all-border"
          style="padding: 0.5em"
        >
          <div class="col text-weight-bold">{{ displayDriver(driverId) }}</div>
          <div
            v-for="(day, index) in daysOfWeek"
            :key="'cd' + index"
            class="col"
          >
            <template
              v-if="
                driverTransactionCounts[driverId] &&
                driverTransactionCounts[driverId][day]
              "
            >
              <span
                :class="
                  getTransactionClass(
                    driverTransactionCounts[driverId][day].collections
                  )
                "
              >
                C: {{ driverTransactionCounts[driverId][day].collections }}
              </span>
              |
              <span
                :class="
                  getTransactionClass(
                    driverTransactionCounts[driverId][day].deliveries
                  )
                "
              >
                D: {{ driverTransactionCounts[driverId][day].deliveries }}
              </span>
            </template>
            <template v-else> C: 0 | D: 0 </template>
          </div>
        </div>
      </div>
    </q-card>

    <q-card flat class="generate-card q-mb-lg">
      <div class="text-subtitle1 text-uppercase text-weight-bolder">
        Generate Driver Schedule
      </div>
      <div class="row q-col-gutter-x-lg">
        <div class="col">
          <q-input
            class="date-input"
            v-model="formattedGenerateDate"
            outlined
            dense
            label="Pick a Date Here"
            clearable
            readonly
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy>
                  <q-date v-model="selectedGenerateDate" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
              <q-icon
                name="close"
                class="cursor-pointer q-ml-sm"
                @click="selectedGenerateDate = null"
              />
            </template>
          </q-input>
        </div>
        <div class="col">
          <q-select
            v-model="transactionStore.selectedGenerateDriver"
            :options="sortedDriverOptions"
            option-label="name"
            option-value="id"
            label="Select Driver"
            outlined
            dense
            clearable
            class="bg-white"
          />
        </div>
        <div class="col-auto">
          <q-btn
            label="Generate Driver Schedule"
            color="primary"
            class="main-button float-right"
            icon="receipt"
            @click="generateDriverSchedule()"
          />
        </div>
      </div>
    </q-card>

    <div class="row justify-between items-center q-mb-md">
      <q-input
        class="date-input"
        v-model="formattedFilterDate"
        outlined
        dense
        label="Search Date Here"
        clearable
        readonly
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy>
              <q-date v-model="selectedFilterDate" mask="YYYY-MM-DD" />
            </q-popup-proxy>
          </q-icon>
          <q-icon
            name="close"
            class="cursor-pointer q-ml-sm"
            @click="selectedFilterDate = null"
          />
        </template>
      </q-input>
      <div class="text-h6 text-center text-uppercase text-weight-bolder">
        Collections & Deliveries
      </div>
      <q-btn
        label="Create Collection"
        color="primary"
        class="main-button float-right"
        icon="add"
        @click="openCreateCollectionDialog()"
      />
    </div>

    <div>
      <q-scroll-area
        class="q-mb-sm"
        style="width: 100%; height: 3em"
        :thumb-style="thumbStyle"
        :bar-style="barStyle"
      >
        <div class="row no-wrap">
          <q-tabs
            v-model="activeDriverTab"
            align="left"
            dense
            narrow-indicator
            indicator-color="secondary"
            class="tab-header"
            visible
          >
            <q-tab
              v-for="driverId in driverTabs"
              :key="driverId"
              :name="driverId"
              :class="{
                'active-tab': activeDriverTab === driverId,
                'text-weight-bold tab-divider': true,
              }"
              class="q-py-none q-px-sm"
            >
              {{ displayDriver(driverId) }} ({{
                getTransactionsByDriver(driverId).filter(
                  (t) => t.type === "collection"
                ).length
              }}
              :
              {{
                getTransactionsByDriver(driverId).filter(
                  (t) => t.type === "delivery"
                ).length
              }})
            </q-tab>
          </q-tabs>
        </div>
      </q-scroll-area>

      <q-tab-panels v-model="activeDriverTab" animated>
        <!-- Dynamic Driver Panels -->
        <q-tab-panel
          v-for="driverId in driverTabs"
          :key="driverId"
          :name="driverId"
          class="q-pa-none"
        >
<LogisticsTableComponent
  :rows="paginatedOrders"
  :active-driver-tab="activeDriverTab"
  :selected-filter-date="selectedFilterDate"
/>
        </q-tab-panel>
      </q-tab-panels>

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

    <!-- dialogs -->
    <q-dialog
      v-model="showCreateCollectionDialog"
      persistent
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card style="min-width: 90vw">
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
        <q-card-section class="q-pa-none">
          <CreateCollectionTab />
        </q-card-section>
        <q-card-actions align="right" style="background-color: #ffe0cd">
          <q-btn
            color="primary"
            @click="createCollection()"
            label="Create Collection"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Create Order Dialog -->
    <q-dialog
      v-model="showCreateOrderDialog"
      persistent
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card style="min-width: 90vw">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">
            Create Order
          </div>
          <q-btn
            icon="close"
            flat
            dense
            round
            class="absolute-top-right q-ma-sm"
            @click="showCreateOrderDialog = false"
          />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <CreateOrderFromCollection />
        </q-card-section>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useQuasar, openURL, copyToClipboard } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";
import CreateCollectionTab from "@/components/CustomerTab.vue";
import CreateOrderFromCollection from "@/views/CreateOrderFromCollection.vue";
import LogisticsTableComponent from '@/components/LogisticsTableComponent.vue';

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const $q = useQuasar();
const transactionStore = useTransactionStore();

// STATE
const searchQuery = ref("");
const DRIVER_NOT_SET = "[NOT SET]";
const activeDriverTab = ref("");
const selectedFilterDate = ref(new Date().toISOString().split("T")[0]);
const selectedGenerateDate = ref(new Date().toISOString().split("T")[0]);
const selectedWeek = ref(new Date().toISOString().split("T")[0]);

const currentPage = ref(1);
const pageSize = ref(10);

const showCreateCollectionDialog = ref(false);
const showCreateOrderDialog = ref(false);
const showUpdateLogisticsDialog = ref(false);
const showWeeklySummary = ref(false);
const showUpdateStatusDialog = ref(false);
const selectedLogisticsRow = ref(null);
const statusForm = ref({ status: null });
const savingStatus = ref(false);
const dialogStatusOptions = ref([]);

const showUpdateGoodsDialog = ref(false);
const selectedGoodsOrder = ref(null);
const goodsForm = ref({ status: null });
const savingGoods = ref(false);

const sanitizeForTel = (raw) => String(raw || "").replace(/[^\d+]/g, ""); // keep digits and +
const sanitizeForWhatsApp = (raw) => String(raw || "").replace(/\D/g, ""); // digits only
const sanitizeEmail = (raw) => String(raw || "").trim();

const toTitleCase = (input) => {
  const s = String(input || "")
    .trim()
    .toLowerCase();
  if (!s) return s;
  return s.replace(/([A-Za-zÀ-ÖØ-öø-ÿ])([A-Za-zÀ-ÖØ-öø-ÿ]*)/g, (_, f, rest) => {
    return f.toUpperCase() + rest; // keep rest as-is (already lowercased above)
  });
};

// Basic options; replace with API-driven options if you have them
const goodsStatusOptions = ref([
  { label: "None", value: "none" },
  { label: "To Be Collected", value: "to collected" },
  { label: "Under Process", value: "under process" },
  { label: "To Be Delivered", value: "to be delivered" },
  { label: "Ongoing Issue/s", value: "ongoing issue/s" },
  { label: "Items Delivered", value: "Items Delivered" },
]);

// DATA: normalized simple-orders (logistics + orders + collections/deliveries)
const allOrders = ref([]);

// CONSTANTS
const COLLECTION_STATUSES = new Set([
  "collection arranged",
  "collection completed",
  "collection rescheduled",
  "collection cancelled",
]);

const DELIVERY_STATUSES = new Set([
  "delivery arranged",
  "delivery completed",
  "delivery postponed",
  "delivery partial",
]);

const baseLogisticsStatusOptions = computed(() => {
  return Array.from(
    new Set([...COLLECTION_STATUSES, ...DELIVERY_STATUSES])
  ).sort();
});

function logisticsBadgeClass(status) {
  const s = String(status || "")
    .trim()
    .toLowerCase();
  if (COLLECTION_STATUSES.has(s)) return "mark-bg-pink";
  if (DELIVERY_STATUSES.has(s)) return "mark-bg-blue";
  return "";
}

const sortedDriverOptions = computed(() => {
  return [...transactionStore.driverOptions].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
});

const driverMapById = computed(() => {
  const map = new Map();
  (transactionStore.driverOptions || []).forEach((d) => {
    if (d?.id != null)
      map.set(String(d.id), (d.name || "").trim() || DRIVER_NOT_SET);
  });
  return map;
});
const getDriverName = (id) =>
  driverMapById.value.get(String(id)) || DRIVER_NOT_SET;
const displayDriver = (driverIdOrNotSet) =>
  driverIdOrNotSet === DRIVER_NOT_SET
    ? DRIVER_NOT_SET
    : getDriverName(driverIdOrNotSet);

const toggleWeeklySummary = () => {
  showWeeklySummary.value = !showWeeklySummary.value;
};

// LIFECYCLE
onMounted(async () => {
  await transactionStore.loadDrivers();

  if (driverTabs.value.length > 0) {
    activeDriverTab.value = driverTabs.value[0];
  }
  try {
    const raw = await transactionStore.fetchAllOrdersSimple();
    allOrders.value = normalizeOrders(raw);
  } catch (e) {
    console.error("Failed to fetch orders:", e);
    $q.notify({ type: "negative", message: "Failed to load orders" });
  }
});

// HELPERS
const toISODate = (d) => {
  if (!d) return null;
  if (typeof d === "string") {
    const m = d.match(/^\d{4}-\d{2}-\d{2}/);
    if (m) return m[0];
  }
  const dt = new Date(d);
  if (isNaN(dt)) return null;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const isNotSetTab = (tab) => tab === DRIVER_NOT_SET;

function decorateOrder(order) {
  const op =
    order?.order_payment || order?.payment || order?.order_payments?.[0] || {};
  const total = Number(op.total_amount ?? order?.total_amount ?? 0);
  const paid = Number(op.paid_amount ?? order?.paid_amount ?? 0);
  const balance = total - paid;
  return {
    ...order,
    goods_status:
      order?.order_production?.[0]?.goods_status ??
      order?.order_production?.goods_status ??
      order?.goods_status ??
      "-",
    order_production: Array.isArray(order?.order_production)
      ? order.order_production[0]
      : order?.order_production ?? {},
    payment_status: op?.payment_status ?? order?.payment_status ?? "-",
    total_amount: total.toFixed(2),
    paid_amount: paid.toFixed(2),
    balance_amount: balance.toFixed(2),
  };
}

function normalizeOrders(rows) {
  const list = Array.isArray(rows) ? rows : [];
  return list.map((r) => {
    const logistics = r.logistics ?? r;

    // normalize orders: may be object, array, or null
    let ordersRaw = logistics.orders ?? r.orders ?? (r.order ? [r.order] : []);
    if (!Array.isArray(ordersRaw)) ordersRaw = ordersRaw ? [ordersRaw] : [];
    const orders = ordersRaw.map((o) => decorateOrder(o));

    // normalize customer(s)
    const customer =
      logistics.customer ??
      r.customer ??
      logistics.customers ??
      r.customers ??
      null;

    // normalize collections & deliveries (plural keys from API)
    const collections =
      logistics.collections ??
      r.collections ??
      logistics.logistics_collections ??
      r.logistics_collections ??
      [];

    const deliveries =
      logistics.deliveries ??
      r.deliveries ??
      logistics.logistics_deliveries ??
      r.logistics_deliveries ??
      [];

    return {
      ...logistics,
      logistics_id: logistics.logistics_id ?? logistics.id,
      orders,
      order: orders?.[0] || null,
      customer,
      collections,
      deliveries,
    };
  });
}

// Dates formatting
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getOrderDate = (t) => formatDate(t?.created_at);

// Robust: accept object with arrays OR the array itself
const getCollectionDate = (t) => {
  let d = null;
  if (Array.isArray(t)) d = t?.[0]?.collection_date;
  else
    d =
      t?.collections?.[0]?.collection_date ||
      t?.collection_date ||
      t?.logistics_collections?.[0]?.collection_date;
  return d ? formatDate(d) : "-";
};

const getDeliveryDate = (t) => {
  let d = null;
  if (Array.isArray(t)) d = t?.[0]?.delivery_date;
  else
    d =
      t?.deliveries?.[0]?.delivery_date ||
      t?.delivery_date ||
      t?.logistics_deliveries?.[0]?.delivery_date;
  return d ? formatDate(d) : "-";
};

const pickCollectionDateRaw = (t) =>
  t?.collections?.[0]?.collection_date ||
  t?.collection_date ||
  t?.logistics_collections?.[0]?.collection_date ||
  null;

const pickDeliveryDateRaw = (t) =>
  t?.deliveries?.[0]?.delivery_date ||
  t?.delivery_date ||
  t?.logistics_deliveries?.[0]?.delivery_date ||
  null;

const getEffectiveDateISO = (t) => {
  return {
    col: toISODate(pickCollectionDateRaw(t)),
    del: toISODate(pickDeliveryDateRaw(t)),
  };
};

const getEffectiveDriverIds = (t) => {
  const ids = [];
  const cId = t?.collections?.[0]?.driver_id;
  const dId = t?.deliveries?.[0]?.driver_id;
  if (cId != null && cId !== "") ids.push(String(cId));
  if (dId != null && dId !== "") ids.push(String(dId));
  return ids;
};

const hasUnsetDriver = (t) => {
  const cId = t?.collections?.[0]?.driver_id;
  const dId = t?.deliveries?.[0]?.driver_id;
  const noC = cId == null || cId === "";
  const noD = dId == null || dId === "";
  return noC || noD;
};

// FILTERING (search + date + driver tab)
const filteredOrders = computed(() => {
  const query = searchQuery.value?.toLowerCase?.() || "";
  const targetISO = selectedFilterDate.value
    ? toISODate(selectedFilterDate.value)
    : null;
  const driverId = activeDriverTab.value;

  const list = (allOrders.value || [])
    .filter((log) => {
      const customerName = log.customer?.name?.toLowerCase?.() || "";
      const orderNo = log.order?.order_no?.toLowerCase?.() || "";
      const status = log.logistics_status?.toLowerCase?.() || "";
      const colDriverId = log.collections?.[0]?.driver_id;
      const delDriverId = log.deliveries?.[0]?.driver_id;

      const matchesSearch =
        !query ||
        customerName.includes(query) ||
        orderNo.includes(query) ||
        status.includes(query) ||
        getDriverName(colDriverId).toLowerCase().includes(query) ||
        getDriverName(delDriverId).toLowerCase().includes(query);

      const txISO = getEffectiveDateISO(log);
      const matchesDate = targetISO
        ? txISO.col === targetISO || txISO.del === targetISO
        : true;

      let matchesDriver = true;
      if (driverId) {
        if (isNotSetTab(driverId)) {
          matchesDriver = hasUnsetDriver(log);
        } else {
          const effectiveIds = getEffectiveDriverIds(log);
          matchesDriver = effectiveIds.includes(String(driverId));
        }
      }

      return matchesSearch && matchesDate && matchesDriver;
    })
    .sort((a, b) => {
      const txA = getEffectiveDateISO(a);
      const txB = getEffectiveDateISO(b);

      // prefer collection date, else delivery date
      const isoA = txA.col || txA.del || "";
      const isoB = txB.col || txB.del || "";

      if (!isoA && !isoB) return 0;
      if (!isoA) return 1;
      if (!isoB) return -1;
      return isoA.localeCompare(isoB);
    });

  return list;
});

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredOrders.value.slice(start, end);
});

const totalPages = computed(
  () => Math.ceil(filteredOrders.value.length / pageSize.value) || 1
);

const driverTabs = computed(() => {
  const ids = (transactionStore.driverOptions || [])
    .filter((d) => d?.id != null)
    .map((d) => String(d.id));
  const unique = [...new Set(ids)];
  unique.sort((a, b) => displayDriver(a).localeCompare(displayDriver(b)));
  return [...unique, DRIVER_NOT_SET];
});

// Counts per driver used in tab header (collection vs delivery)
const getTransactionsByDriver = (driverIdOrNotSet) => {
  const query = searchQuery.value?.toLowerCase?.() || "";
  const targetISO = selectedFilterDate.value
    ? toISODate(selectedFilterDate.value)
    : null;

  const base = (allOrders.value || []).filter((log) => {
    const customerName = log.customer?.name?.toLowerCase?.() || "";
    const orderNo = log.order?.order_no?.toLowerCase?.() || "";
    const status = log.logistics_status?.toLowerCase?.() || "";
    const matchesSearch =
      !query ||
      customerName.includes(query) ||
      orderNo.includes(query) ||
      status.includes(query);
    const txISO = getEffectiveDateISO(log);
    const matchesDate = targetISO
      ? txISO.col === targetISO || txISO.del === targetISO
      : true;

    return matchesSearch && matchesDate;
  });

  const items = [];
  base.forEach((log) => {
    const c = log.collections?.[0];
    const d = log.deliveries?.[0];
    if (c)
      items.push({
        type: "collection",
        driver_id: c.driver_id ?? null,
        date: c.collection_date,
      });
    if (d)
      items.push({
        type: "delivery",
        driver_id: d.driver_id ?? null,
        date: d.delivery_date,
      });
  });

  if (isNotSetTab(driverIdOrNotSet)) {
    return items.filter((t) => !t.driver_id && t.driver_id !== 0);
  }
  return items.filter((t) => String(t.driver_id) === String(driverIdOrNotSet));
};

// Weekly summary counts computed from orders
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

const getEndOfWeek = (date) => {
  const d = new Date(getStartOfWeek(date));
  return new Date(d.setDate(d.getDate() + 6));
};

const startOfWeek = computed(() => getStartOfWeek(selectedWeek.value));
const endOfWeek = computed(() => getEndOfWeek(selectedWeek.value));

const formattedStartOfWeek = computed(() =>
  startOfWeek.value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
);
const formattedEndOfWeek = computed(() =>
  endOfWeek.value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
);

const formattedWeekDates = computed(() => {
  return daysOfWeek.map((_, index) => {
    const dayDate = new Date(startOfWeek.value);
    dayDate.setDate(dayDate.getDate() + index);
    return dayDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  });
});

const drivers = computed(() => {
  const allIds = (transactionStore.driverOptions || [])
    .filter((d) => d?.id != null)
    .map((d) => String(d.id));
  const unique = new Set(allIds);
  unique.add(DRIVER_NOT_SET);
  return Array.from(unique);
});

const driverTransactionCounts = computed(() => {
  const counts = {};
  const start = new Date(startOfWeek.value);
  drivers.value.forEach((driverIdOrNotSet) => {
    counts[driverIdOrNotSet] = {};
    daysOfWeek.forEach((day, index) => {
      const dayDate = new Date(start);
      dayDate.setDate(dayDate.getDate() + index);
      const iso = toISODate(dayDate);

      const colCount = (allOrders.value || []).filter((log) => {
        const c = log.collections?.[0];
        const cId = c?.driver_id;
        const date = toISODate(c?.collection_date);
        return (
          date === iso &&
          (isNotSetTab(driverIdOrNotSet)
            ? cId == null || cId === ""
            : String(cId) === String(driverIdOrNotSet))
        );
      }).length;

      const delCount = (allOrders.value || []).filter((log) => {
        const d = log.deliveries?.[0];
        const dId = d?.driver_id;
        const date = toISODate(d?.delivery_date);
        return (
          date === iso &&
          (isNotSetTab(driverIdOrNotSet)
            ? dId == null || dId === ""
            : String(dId) === String(driverIdOrNotSet))
        );
      }).length;

      counts[driverIdOrNotSet][day] = {
        collections: colCount,
        deliveries: delCount,
      };
    });
  });
  return counts;
});

// UI BITS
const formattedFilterDate = computed(() =>
  formatDate(selectedFilterDate.value)
);
const formattedGenerateDate = computed(() =>
  formatDate(selectedGenerateDate.value)
);

const previousWeek = () => {
  selectedWeek.value = new Date(
    new Date(selectedWeek.value).setDate(
      new Date(selectedWeek.value).getDate() - 7
    )
  );
};

const nextWeek = () => {
  selectedWeek.value = new Date(
    new Date(selectedWeek.value).setDate(
      new Date(selectedWeek.value).getDate() + 7
    )
  );
};

const getTransactionClass = (count) => {
  if (count >= 20) return "mark-red";
  else if (count >= 10) return "mark-yellow";
  else if (count >= 1) return "mark-green";
  else return "";
};

// Render helper: return [null] when no orders, so we still render a row
const ordersOrPlaceholder = (logistics) =>
  Array.isArray(logistics?.orders) && logistics.orders.length > 0
    ? logistics.orders
    : [null];

// DIALOGS / ACTIONS
const openCreateCollectionDialog = () => {
  showCreateCollectionDialog.value = true;
};

async function createCollection() {
  try {
    const logisticsId = await transactionStore.createLogistics();
    await transactionStore.createCollection(logisticsId);
    await transactionStore.createDelivery(logisticsId);

    $q.dialog({
      title: "Success",
      message: "Collection created successfully!",
      ok: "OK",
      color: "positive",
    });

    transactionStore.resetTransactionItems();
    showCreateCollectionDialog.value = false;
  } catch (error) {
    console.error("Error submitting collection:", error?.message);
    $q.dialog({
      title: "Error",
      message: "Failed to create collection. Please try again.",
      ok: "Close",
      color: "negative",
    });
  }
}

const openOrderTab = async (order) => {
  try {
    transactionStore.setOrderNo(order?.order_no);
    window.open(`/orders/${order?.order_no}`, "_blank");
  } catch (error) {
    console.error("Error opening order:", error);
  }
};

const openCustomerTab = (customerId) => {
  const url = `/customers/${customerId}`;
  window.open(url, "_blank");
};

const createOrder = (transaction) => {
  if (!transaction) return;
  transactionStore.resetTransactionItems();

  transactionStore.selectedCustomer = transaction.customer;
  transactionStore.logisticsId = transaction.logistics_id || null;

  const isCollection = Boolean(
    transaction.collection_date || transaction.collections?.[0]
  );
  const isDelivery = Boolean(
    transaction.delivery_date || transaction.deliveries?.[0]
  );

  if (isCollection) {
    const c = transaction.collections?.[0] || transaction;
    transactionStore.selectedCollectionContact =
      c.contact_person || c.customer_contact_persons || null;
    transactionStore.selectedCollectionAddress = c.address || null;
    transactionStore.selectedCollectionDriver = c.driver_name || null;
    transactionStore.collectionDate = c.collection_date || null;
    transactionStore.collectionTime = c.collection_time || null;
    transactionStore.collectionRemarks = c.remarks || null;
    transactionStore.collectionNoBags = c.no_bags || null;
  }

  if (isDelivery) {
    const d = transaction.deliveries?.[0] || transaction;
    transactionStore.selectedDeliveryContact =
      d.contact_person || d.customer_contact_persons || null;
    transactionStore.selectedDeliveryAddress = d.address || null;
    transactionStore.selectedDeliveryDriver = d.driver_name || null;
    transactionStore.deliveryDate = d.delivery_date || null;
    transactionStore.deliveryTime = d.delivery_time || null;
    transactionStore.deliveryRemarks = d.remarks || null;
  }

  Promise.all([
    updateCollection(transaction.logistics_id),
    updateDelivery(transaction.logistics_id),
  ])
    .then(() => {
      showCreateOrderDialog.value = true;
    })
    .catch((error) => {
      console.error("Error loading related data:", error);
      $q.notify({
        type: "negative",
        message: "Failed to fetch collection or delivery data.",
      });
    });
};

function handleClose() {
  transactionStore.resetTransactionItems();
  showCreateOrderDialog.value = false;
}

const getCustomerCredits = (customer) => {
  // accept object or single-element array shape
  const credits = Array.isArray(customer?.customer_credits)
    ? customer?.customer_credits?.[0]
    : customer?.customer_credits;
  const online = parseFloat(credits?.online_package ?? "0") || 0;
  const other = parseFloat(credits?.other_credits ?? "0") || 0;
  return `$${(online + other).toFixed(2)}`;
};

const generateDriverSchedule = () => {
  const doc = new jsPDF({ orientation: "landscape", format: "a4" });
  const selectedDriver = transactionStore.selectedGenerateDriver;
  const generatedDate = selectedGenerateDate.value;

  if (!selectedDriver) {
    alert("Please select a driver before generating the schedule.");
    return;
  }

  const items = [];
  (allOrders.value || []).forEach((log) => {
    const c = log.collections?.[0];
    const d = log.deliveries?.[0];
    if (
      c &&
      String(c.driver_id) === String(selectedDriver.id) &&
      toISODate(c.collection_date) === toISODate(generatedDate)
    ) {
      items.push({
        type: "collection",
        customer: log.customer,
        contact_person: c.contact_person || c.customer_contact_persons,
        address: c.address,
        time: c.collection_time,
        no_bags: c.no_bags,
        remarks: c.remarks,
      });
    }
    if (
      d &&
      String(d.driver_id) === String(selectedDriver.id) &&
      toISODate(d.delivery_date) === toISODate(generatedDate)
    ) {
      items.push({
        type: "delivery",
        customer: log.customer,
        contact_person: d.contact_person || d.customer_contact_persons,
        address: d.address,
        time: d.delivery_time,
        no_bags: d.no_bags,
        remarks: d.remarks,
      });
    }
  });

  const collectionCount = items.filter((t) => t.type === "collection").length;
  const deliveryCount = items.filter((t) => t.type === "delivery").length;

  const tableData = items.map((t) => {
    let customer = t.customer?.name || "[NOT SET]";
    if (t.customer?.contact_no1) customer += `\n${t.customer.contact_no1}`;
    if (t.customer?.contact_no2) customer += `\n${t.customer.contact_no2}`;

    let contactPerson = t.contact_person?.name || "[NOT SET]";
    if (t.contact_person?.contact_no1)
      contactPerson += `\n${t.contact_person.contact_no1}`;
    if (t.contact_person?.contact_no2)
      contactPerson += `\n${t.contact_person.contact_no2}`;

    return [
      `${t.type.charAt(0).toUpperCase() + t.type.slice(1)}\n${
        t.time || "[NOT SET]"
      }),`,
      customer,
      contactPerson,
      t.address || "[NOT SET]",
      `No. of Bags:\n${t.no_bags || "-"}`,
      t.remarks || "-",
    ];
  });

  doc.setFontSize(14);
  doc.text(
    `Driver Schedule for ${selectedDriver.name} on ${formatDate(
      generatedDate
    )} (${collectionCount} Collections | ${deliveryCount} Deliveries)`,
    10,
    20
  );

  autoTable(doc, {
    startY: 25,
    head: [
      ["Type", "Customer", "Contact Person", "Address", "Details", "Remarks"],
    ],
    body: tableData,
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 40 },
      2: { cellWidth: 40 },
      3: { cellWidth: 50 },
      4: { cellWidth: 50 },
      5: { cellWidth: 60 },
    },
    styles: {
      fontSize: 12,
      lineWidth: 0.3,
      cellPadding: 2,
      lineColor: [0, 0, 0],
    },
    headStyles: { halign: "center", valign: "middle" },
    theme: "striped",
  });

  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, "_blank");
};

const updateCollection = async (logisticsId) => {
  try {
    const collectionData = await transactionStore.fetchCollectionByLogisticsId(
      logisticsId
    );
    if (!collectionData || collectionData.length === 0)
      throw new Error("No collection data found!");
    const collection = collectionData[0];

    transactionStore.selectedCollectionId = collection.id || null;
    transactionStore.selectedCollectionContact =
      collection.customer_contact_persons || collection.contact_person || null;
    transactionStore.selectedCollectionAddress = collection.address || null;
    transactionStore.selectedCollectionDriver = collection.driver_name || null;
    transactionStore.collectionDate = collection.collection_date || null;
    transactionStore.collectionTime = collection.collection_time || null;
    transactionStore.collectionRemarks = collection.remarks || null;
    transactionStore.collectionNoBags = collection.no_bags || null;
    transactionStore.jobType = collection.job_type || null;
    transactionStore.readyBy = collection.ready_by || null;
    transactionStore.logisticsId = collection.logistics_id || null;
  } catch (error) {
    console.error("Error fetching collection details:", error);
    $q.notify({
      type: "negative",
      message: "Failed to load collection details",
    });
  }
};

const updateDelivery = async (logisticsId) => {
  try {
    const deliveryData = await transactionStore.fetchDeliveryByLogisticsId(
      logisticsId
    );
    if (!deliveryData || deliveryData.length === 0)
      throw new Error("No delivery data found!");
    const delivery = deliveryData[0];

    transactionStore.selectedDeliveryId = delivery.id || null;
    transactionStore.selectedDeliveryContact =
      delivery.customer_contact_persons || delivery.contact_person || null;
    transactionStore.selectedDeliveryAddress = delivery.address || null;
    transactionStore.selectedDeliveryDriver = delivery.driver_name || null;
    transactionStore.deliveryDate = delivery.delivery_date || null;
    transactionStore.deliveryTime = delivery.delivery_time || null;
    transactionStore.deliveryRemarks = delivery.remarks || null;
    transactionStore.deliveryNoBags = delivery.no_bags || null;
    transactionStore.jobType = delivery.job_type || null;
    transactionStore.readyBy = delivery.ready_by || null;
    transactionStore.logisticsId = delivery.logistics_id || null;
  } catch (error) {
    console.error("Error fetching delivery details:", error);
    $q.notify({ type: "negative", message: "Failed to load delivery details" });
  }
};

function openUpdateStatusDialog(row) {
  selectedLogisticsRow.value = row || null;
  statusForm.value.status = row?.logistics_status || null;

  const base = baseLogisticsStatusOptions.value.map((s) => ({
    label: toTitleCase(s),
    value: s,
  }));

  if (
    row?.logistics_status &&
    !base.some((o) => o.value === row.logistics_status)
  ) {
    const v = String(row.logistics_status).trim().toLowerCase();
    base.unshift({ label: toTitleCase(v), value: v });
  }

  dialogStatusOptions.value = base;
  showUpdateStatusDialog.value = true;
}

async function saveLogisticsStatus() {
  if (!selectedLogisticsRow.value) return;
  const id =
    selectedLogisticsRow.value.logistics_id || selectedLogisticsRow.value.id;
  const newStatus = (statusForm.value.status || "").toString();
  if (!newStatus) return;
  try {
    savingStatus.value = true;

    await transactionStore.updateLogistics(id, { logistics_status: newStatus });

    selectedLogisticsRow.value.logistics_status = newStatus;
    const idx = allOrders.value.findIndex(
      (l) => (l.logistics_id || l.id) === id
    );
    if (idx !== -1) allOrders.value[idx].logistics_status = newStatus;

    $q.notify({ type: "positive", message: "Logistics status updated." });
    showUpdateStatusDialog.value = false;
  } catch (error) {
    console.error("Failed to update logistics status:", error);
    $q.notify({
      type: "negative",
      message: "Failed to update logistics status.",
    });
  } finally {
    savingStatus.value = false;
  }
}

function openUpdateGoodsDialog(row) {
  selectedGoodsOrder.value = row || null;
  goodsForm.value.status =
    row?.goods_status || row?.order_production?.goods_status || null;
  showUpdateGoodsDialog.value = true;
}

async function saveGoodsStatus() {
  if (!selectedGoodsOrder.value) return;

  try {
    savingGoods.value = true;

    const productionId = selectedGoodsOrder.value?.order_production?.id;
    if (!productionId) {
      throw new Error("Missing order_production.id on selected order");
    }

    const newStatus = (goodsForm.value.status || "").toString();
    if (!newStatus) return;

    await transactionStore.updateProduction(productionId, {
      goods_status: newStatus,
    });

    if (selectedGoodsOrder.value.order_production) {
      selectedGoodsOrder.value.order_production.goods_status = newStatus;
    }
    selectedGoodsOrder.value.goods_status = newStatus;

    const opId = productionId;
    (allOrders.value || []).forEach((log) => {
      (log.orders || []).forEach((o) => {
        if (o?.order_production?.id === opId) {
          o.order_production.goods_status = newStatus;
          o.goods_status = newStatus;
        }
      });
      if (log.order?.order_production?.id === opId) {
        log.order.order_production.goods_status = newStatus;
        log.order.goods_status = newStatus;
      }
    });

    $q.notify({ type: "positive", message: "Goods status updated." });
    showUpdateGoodsDialog.value = false;
  } catch (err) {
    console.error("Failed to update goods status:", err);
    $q.notify({ type: "negative", message: "Failed to update goods status." });
  } finally {
    savingGoods.value = false;
  }
}

// Payment dialog control
const showAddPaymentDialog = ref(false);

// Payment form state
const selectedPaymentType = ref("Cash");
const paymentTypes = ref([
  "Cash",
  "Bank Transfer",
  "Cheque",
  "Online Package Credits",
]);
const paymentAmount = ref(0);
const creditRemarks = ref("");
const referenceNo = ref("");

const selectedPaymentOrder = ref(null);
const selectedPaymentCustomer = ref(null);

const displayPaid = computed(() => {
  const o = selectedPaymentOrder.value;
  const op = o?.order_payment || {};
  const paidRaw = Number(op.paid_amount ?? o?.paid_amount ?? 0);
  return isNaN(paidRaw) ? 0 : paidRaw;
});
const displayTotal = computed(() => {
  const o = selectedPaymentOrder.value;
  const op = o?.order_payment || {};
  const totalRaw = Number(op.total_amount ?? o?.total_amount ?? 0);
  return isNaN(totalRaw) ? 0 : totalRaw;
});
const displayUnpaid = computed(() => {
  return Math.max(displayTotal.value - displayPaid.value, 0);
});

// Open dialog from button (row-bound)
const openAddPaymentDialog = (rowOrder, rowCustomer) => {
  if (!rowOrder?.id) {
    $q.notify({
      type: "warning",
      message: "No order attached to this row. Create an order first.",
    });
    return;
  }
  selectedPaymentOrder.value = rowOrder;
  selectedPaymentCustomer.value = rowCustomer || null;

  // prefill sensible defaults
  selectedPaymentType.value = "Cash";
  paymentAmount.value = displayUnpaid.value || 0;
  referenceNo.value = "";
  creditRemarks.value = "";
  totalCredits.value = 0;

  showAddPaymentDialog.value = true;
};

const addPayment = async () => {
  // basic validation
  if (!selectedPaymentOrder.value?.id) {
    $q.notify({ type: "negative", message: "Order ID is missing." });
    return;
  }
  if (!selectedPaymentType.value || paymentAmount.value <= 0) {
    $q.notify({
      type: "negative",
      message: "Please select payment type and enter a valid amount.",
    });
    return;
  }
  if (
    (selectedPaymentType.value === "Bank Transfer" ||
      selectedPaymentType.value === "Cheque") &&
    !referenceNo.value
  ) {
    $q.notify({ type: "negative", message: "Reference number is required." });
    return;
  }

  const orderId = selectedPaymentOrder.value.id; // ✅ the clicked row order id

  const paymentData = {
    order_id: orderId,
    type: selectedPaymentType.value,
    amount: Number(paymentAmount.value),
    reference_no: referenceNo.value || undefined,
    remarks: creditRemarks.value || undefined,
  };

  try {
    await transactionStore.addPayment(paymentData);

    // handle overpayment → credit back to customer
    const totalAmount = displayTotal.value;
    const alreadyPaid = displayPaid.value;
    const unpaidAmount = Math.max(totalAmount - alreadyPaid, 0);
    const overpaidAmount = Math.max(
      Number(paymentAmount.value) - unpaidAmount,
      0
    );

    if (overpaidAmount > 0 && selectedPaymentCustomer.value?.id) {
      await transactionStore.topUpCredits({
        customerId: selectedPaymentCustomer.value.id,
        type: "Over Payment",
        amount: overpaidAmount,
        remarks: `Auto-credited from invoice #${orderId}`,
      });
      $q.notify({
        type: "info",
        message: `Overpayment of $${overpaidAmount.toFixed(
          2
        )} credited to customer.`,
      });
    }

    // update local UI values (optimistic)
    const newPaid = alreadyPaid + Number(paymentAmount.value);
    const newStatus = newPaid >= totalAmount ? "Paid" : "Unpaid";

    if (!selectedPaymentOrder.value.order_payment) {
      selectedPaymentOrder.value.order_payment = {
        total_amount: totalAmount,
        paid_amount: newPaid,
        payment_status: newStatus,
      };
    } else {
      selectedPaymentOrder.value.order_payment.paid_amount = newPaid;
      selectedPaymentOrder.value.order_payment.payment_status = newStatus;
    }
    selectedPaymentOrder.value.paid_amount = newPaid.toFixed(2);
    selectedPaymentOrder.value.balance_amount = Math.max(
      totalAmount - newPaid,
      0
    ).toFixed(2);
    selectedPaymentOrder.value.payment_status = newStatus;

    // also reflect inside allOrders table list immediately
    const targetId = selectedPaymentOrder.value.id;
    (allOrders.value || []).forEach((log) => {
      (log.orders || []).forEach((o, idx) => {
        if (o?.id === targetId) {
          log.orders[idx] = decorateOrder({
            ...o,
            ...selectedPaymentOrder.value,
          });
        }
      });
      if (log.order?.id === targetId) {
        log.order = decorateOrder({
          ...log.order,
          ...selectedPaymentOrder.value,
        });
      }
    });

    showAddPaymentDialog.value = false;
    selectedPaymentType.value = "Cash";
    paymentAmount.value = 0;
    referenceNo.value = "";
    creditRemarks.value = "";

    $q.notify({ type: "positive", message: "Payment added successfully." });
  } catch (error) {
    console.error("❌ Error adding payment:", error);
    $q.notify({
      type: "negative",
      message: "Failed to add payment. Please try again.",
    });
  }
};

const totalCredits = ref(0);

watch(selectedPaymentType, async (newType) => {
  if (
    newType === "Online Package Credits" &&
    selectedPaymentCustomer.value?.id
  ) {
    try {
      const creditData = await transactionStore.fetchCustomerCreditsById(
        selectedPaymentCustomer.value.id
      );
      totalCredits.value =
        (Number(creditData?.online_package) || 0) +
        (Number(creditData?.other_credits) || 0);
    } catch (err) {
      console.error("❌ Failed to fetch customer credits:", err);
      $q.notify({
        type: "negative",
        message: "Failed to load credits. Try again.",
      });
    }
  }
});

const callViaPhone = (raw) => {
  const tel = sanitizeForTel(raw);
  if (tel) openURL(`tel:${tel}`);
};

const callViaWhatsApp = (raw) => {
  const wa = sanitizeForWhatsApp(raw);
  if (wa) openURL(`https://wa.me/${wa}`);
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

// --- Contact pickers to simplify template ---
const pickCollectionContact = (logistics) => {
  const src =
    logistics?.collections?.[0]?.contact_person ||
    logistics?.collections?.[0]?.customer_contact_persons ||
    {};
  return {
    phone1: src.contact_no1 || "",
    phone2: src.contact_no2 || "",
    email: src.email || "",
  };
};

const pickDeliveryContact = (logistics) => {
  const src =
    logistics?.deliveries?.[0]?.contact_person ||
    logistics?.deliveries?.[0]?.customer_contact_persons ||
    {};
  return {
    phone1: src.contact_no1 || "",
    phone2: src.contact_no2 || "",
    email: src.email || "",
  };
};

// STYLES
const thumbStyle = { right: "4px", borderRadius: "5px", height: "7px" };
const barStyle = { right: "2px", borderRadius: "9px", height: "7px" };

// WATCHERS
watch([selectedFilterDate, searchQuery, activeDriverTab], () => {
  currentPage.value = 1;
});

// Which side goes first under "Logistics Details"?
const isDeliveryFirst = (status) => {
  const s = String(status || "")
    .trim()
    .toLowerCase();
  if (DELIVERY_STATUSES.has(s) || s.startsWith("delivery")) return true;
  // default & collection-* → collection first
  return false;
};

function formatAddress(addr) {
  if (!addr) return "-";
  const main = [addr.block_no, addr.road_name, addr.unit_no, addr.building_name]
    .map((v) => (v ?? "").toString().trim())
    .filter(Boolean)
    .join(" ");
  const postal = (addr.postal_code ?? "").toString().trim();
  const line = [main, postal].filter(Boolean).join(", ");
  const extra = [addr.additional_info, addr.remarks]
    .map((v) => (v ?? "").toString().trim())
    .filter(Boolean)
    .join(" — ");
  return extra ? `${line} (${extra})` : line || "-";
}

function openUpdateLogistics(logistics) {
  transactionStore.logisticsId = logistics?.logistics_id || logistics?.id || null;
  transactionStore.selectedCustomer = logistics?.customer || null;
  showUpdateLogisticsDialog.value = true;
}

</script>
