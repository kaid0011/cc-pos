<template>
  <div class="row justify-center page-title-header text-uppercase">
    Logistics Management
  </div>
  <div class="full-container logistics-management">
    <!-- Weekly Summary Section -->
    <q-card flat class="q-mb-lg q-pa-md">
      <div class="row justify-between">
        <div class="col-2 text-center">
          <!-- Optional tweak -->
          <div v-if="showWeeklySummary">
            <div class="mark-green line-height-1">1+ C and D (AM/PM)</div>
            <div class="mark-yellow line-height-1">10+ C and D (AM/PM)</div>
            <div class="mark-red line-height-1">20+ C and D (AM/PM)</div>
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
                driverAmPmCounts[driverId] && driverAmPmCounts[driverId][day]
              "
            >
              <span> AM: </span>
              <span
                :class="getTransactionClass(driverAmPmCounts[driverId][day].am)"
              >
                {{ driverAmPmCounts[driverId][day].am }}
              </span>
              |
              <span> PM: </span>
              <span
                :class="getTransactionClass(driverAmPmCounts[driverId][day].pm)"
              >
                {{ driverAmPmCounts[driverId][day].pm }}
              </span>
            </template>
            <template v-else> AM: 0 | PM: 0 </template>
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
        label="Search C/D Date Here"
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useQuasar, openURL, copyToClipboard } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";
import CreateCollectionTab from "@/components/CustomerTab.vue";
import LogisticsTableComponent from "@/components/LogisticsTableComponent.vue";

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
const showWeeklySummary = ref(false);

const allOrders = ref([]);

const deliveryExceptions = ref([]);

// === Exception grouping helper ===
const exGroupKey = (dateISO, timeLabel, driverId) => {
  const d = dateISO ? toISODate(dateISO) : "";
  const t = (timeLabel ?? "").toString().trim();
  const drv = driverId == null || driverId === "" ? DRIVER_NOT_SET : String(driverId);
  return `${d}__${t}__${drv}`;
};

// Is there any exception for this logistics on the selected date?
const exceptionDateMatchedFor = (log, targetISO) => {
  if (!targetISO) return false;
  const key = String(log?.logistics_id ?? log?.id ?? "");
  if (!key) return false;
  const list = exceptionsByLogisticsId.value.get(key) || [];
  return list.some((ex) => toISODate(ex?.delivery_date) === targetISO);
};

// Which drivers (as strings) handle exceptions on that date (ex.driver_id, fallback to main delivery driver)
const exceptionDriverIdsForDate = (log, targetISO) => {
  const out = new Set();
  if (!targetISO) return out;
  const d = log?.deliveries?.[0] || null;
  const fallback = d?.driver_id ?? null;

  const key = String(log?.logistics_id ?? log?.id ?? "");
  if (!key) return out;
  const list = exceptionsByLogisticsId.value.get(key) || [];

  list.forEach((ex) => {
    if (toISODate(ex?.delivery_date) !== targetISO) return;
    const id = ex?.driver_id != null && ex.driver_id !== "" ? ex.driver_id : fallback;
    out.add(id == null || id === "" ? DRIVER_NOT_SET : String(id));
  });
  return out;
};


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

const exceptionsByLogisticsId = computed(() => {
  const m = new Map();
  for (const ex of deliveryExceptions.value || []) {
    const key = ex?.logistics_id;
    if (key == null) continue;
    const id = String(key);
    if (!m.has(id)) m.set(id, []);
    m.get(id).push(ex);
  }
  // sort (latest first by date/time)
  for (const arr of m.values()) {
    arr.sort((a, b) => {
      const da = new Date(a?.delivery_date || 0).getTime();
      const db = new Date(b?.delivery_date || 0).getTime();
      if (db !== da) return db - da;
      return String(b?.delivery_time || "").localeCompare(
        String(a?.delivery_time || "")
      );
    });
  }
  return m;
});

onMounted(async () => {
  await transactionStore.loadDrivers();
  await buildTimeMapFromStoreExact();

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

  try {
    const ex = await transactionStore.fetchDeliveryExceptions();
    deliveryExceptions.value = Array.isArray(ex) ? ex : [];
  } catch (e) {
    console.error("Failed to fetch delivery exceptions:", e);
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

function formatAddress(addr) {
  if (!addr || typeof addr !== "object") {
    // why: gracefully handle strings/nulls just in case
    return (addr ?? "").toString().trim();
  }
  const partsMain = [
    addr.block_no,
    addr.road_name,
    addr.unit_no,
    addr.building_name,
  ]
    .map((v) => (v ?? "").toString().trim())
    .filter(Boolean)
    .join(" ");
  const postal = (addr.postal_code ?? "").toString().trim();
  const line = [partsMain, postal].filter(Boolean).join(", ");
  const extra = [addr.additional_info, addr.remarks]
    .map((v) => (v ?? "").toString().trim())
    .filter(Boolean)
    .join(" — ");
  return (extra ? `${line} (${extra})` : line) || "";
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

const filteredOrders = computed(() => {
  const query = searchQuery.value?.toLowerCase?.() || "";
  const targetISO = selectedFilterDate.value ? toISODate(selectedFilterDate.value) : null;
  const driverId = activeDriverTab.value;

  const list = (allOrders.value || [])
    .filter((log) => {
      // --- search ---
      const customerName = log.customer?.name?.toLowerCase?.() || "";
      const orderNo = log.order?.order_no?.toLowerCase?.() || "";
      const status = log.logistics_status?.toLowerCase?.() || "";
      const matchesSearch =
        !query || customerName.includes(query) || orderNo.includes(query) || status.includes(query);
      if (!matchesSearch) return false;

      const txISO = getEffectiveDateISO(log);
      const exMatched = targetISO ? exceptionDateMatchedFor(log, targetISO) : false;

      // --- date match ---
      const matchesDate =
        !targetISO ||
        txISO.col === targetISO ||
        txISO.del === targetISO ||
        exMatched;
      if (!matchesDate) return false;

      // --- driver match ---
      if (!driverId) return true;

      const isNotSet = isNotSetTab(driverId);

      if (exMatched) {
        // On exception day: ONLY exception drivers (fallback to main delivery), never collections
        const ids = exceptionDriverIdsForDate(log, targetISO);
        return isNotSet ? ids.has(DRIVER_NOT_SET) : ids.has(String(driverId));
      }

      // Non-exception day: normal behavior (collection+delivery drivers allowed)
      const cId = log?.collections?.[0]?.driver_id;
      const dId = log?.deliveries?.[0]?.driver_id;

      if (isNotSet) return cId == null || cId === "" || dId == null || dId === "";
      return String(cId) === String(driverId) || String(dId) === String(driverId);
    })
    .sort((a, b) => {
      const txA = getEffectiveDateISO(a);
      const txB = getEffectiveDateISO(b);
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

const getTransactionsByDriver = (driverIdOrNotSet) => {
  const query = searchQuery.value?.toLowerCase?.() || "";
  const targetISO = selectedFilterDate.value ? toISODate(selectedFilterDate.value) : null;

  // base rows: search + (col/del or exception date)
  const base = (allOrders.value || []).filter((log) => {
    const customerName = log.customer?.name?.toLowerCase?.() || "";
    const orderNo = log.order?.order_no?.toLowerCase?.() || "";
    const status = log.logistics_status?.toLowerCase?.() || "";
    const matchesSearch =
      !query || customerName.includes(query) || orderNo.includes(query) || status.includes(query);
    if (!matchesSearch) return false;

    if (!targetISO) return true;

    const txISO = getEffectiveDateISO(log);
    if (txISO.col === targetISO || txISO.del === targetISO) return true;

    const key = String(log?.logistics_id ?? log?.id ?? "");
    const list = exceptionsByLogisticsId.value.get(key) || [];
    return list.some((ex) => toISODate(ex?.delivery_date) === targetISO);
  });

  const items = [];
  const seenExc = new Set();

  base.forEach((log) => {
    const c = log.collections?.[0] || null;
    const d = log.deliveries?.[0] || null;

    const onExceptionDay = !!targetISO && exceptionDateMatchedFor(log, targetISO);

    // COLLECTION — skip entirely if we're looking at an exception day for this logistics
    if (c && !onExceptionDay) {
      const cISO = toISODate(c.collection_date);
      if (!targetISO || cISO === targetISO) {
        items.push({ type: "collection", driver_id: c.driver_id ?? null, date: cISO });
      }
    }

    // DELIVERY — always allowed
    if (d) {
      const dISO = toISODate(d.delivery_date);
      if (!targetISO || dISO === targetISO) {
        items.push({ type: "delivery", driver_id: d.driver_id ?? null, date: dISO });
      }
    }

    // EXCEPTIONS — standalone deliveries
    const key = String(log?.logistics_id ?? log?.id ?? "");
    const exList = exceptionsByLogisticsId.value.get(key) || [];
    for (const ex of exList) {
      const exISO = toISODate(ex?.delivery_date);
      if (targetISO && exISO !== targetISO) continue;

      const exDriverId =
        ex?.driver_id != null && ex.driver_id !== "" ? ex.driver_id : d?.driver_id ?? null;

      const gkey = exGroupKey(exISO, ex?.delivery_time, exDriverId);
      if (seenExc.has(gkey)) continue;
      seenExc.add(gkey);

      items.push({ type: "delivery", driver_id: exDriverId, date: exISO });
    }
  });

  // filter by driver tab
  if (isNotSetTab(driverIdOrNotSet)) {
    return items.filter((t) => t.driver_id == null || t.driver_id === "");
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

const generateDriverSchedule = () => {
  const doc = new jsPDF({ orientation: "landscape", format: "a4" });
  const selectedDriver = transactionStore.selectedGenerateDriver;
  const generatedDate = selectedGenerateDate.value;

 if (!selectedDriver) {
    $q.notify({
      type: "warning",
      message: "Please select a driver before generating the schedule.",
      position: "bottom",
      timeout: 3500,
      actions: [{ label: "OK", color: "white" }],
    });
    return;
  }

  if (!generatedDate) {
    $q.notify({
      type: "warning",
      message: "Please select a date before generating the schedule.",
      position: "bottom",
      timeout: 3500,
      actions: [{ label: "OK", color: "white" }],
    });
    return;
  }

  // ---------- helpers ----------
  const toMinutes = (hh, mm, ampm) => {
    let h = Number(hh) || 0;
    const m = Number(mm) || 0;
    const a = (ampm || "").toLowerCase();
    if (a === "pm" && h !== 12) h += 12;
    if (a === "am" && h === 12) h = 0;
    return h * 60 + m;
  };
  const parseTimeStart = (str) => {
    // Accepts: "9am", "09:30 AM", "12nn - 3pm", "Custom Time", null, etc.
    if (!str) return Number.MAX_SAFE_INTEGER;
    const s = String(str).toLowerCase().trim();

    // Range like "9am - 12nn" -> take left side
    const left = s.split("-")[0].trim();

    // normalize "nn" as pm
    const norm = left.replace("nn", "pm"); // 12nn => 12pm

    // 9am / 9 am / 9:30am / 09:30 AM
    const m1 = norm.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
    if (m1) return toMinutes(m1[1], m1[2] || "0", m1[3]);

    // "12pm" written as "12"
    const m2 = norm.match(/^(\d{1,2})(?::(\d{2}))?\s*(a|p)m?$/i);
    if (m2) return toMinutes(m2[1], m2[2] || "0", m2[3] === "a" ? "am" : "pm");

    // plain "09:30" (assume 24h) — rare
    const m3 = norm.match(/^(\d{1,2}):(\d{2})$/);
    if (m3) return Number(m3[1]) * 60 + Number(m3[2]);

    // no parse => put at end
    return Number.MAX_SAFE_INTEGER;
  };

  const sectionHeader = (label) => [
    {
      content: label,
      colSpan: 6,
      styles: {
        fillColor: [44, 62, 80],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "left",
      },
    },
  ];

  // ---------- collect items ----------
  const items = [];
  (allOrders.value || []).forEach((log) => {
    const c = log.collections?.[0];
    const d = log.deliveries?.[0];

    // COLLECTION
    if (
      c &&
      String(c.driver_id) === String(selectedDriver.id) &&
      toISODate(c.collection_date) === toISODate(generatedDate)
    ) {
      const cp = c.contact_person || c.customer_contact_persons || {};
      items.push({
        kind: "COL",
        sortTime: parseTimeStart(c.collection_time),
        time: c.collection_time,
        customer: log.customer,
        contact: cp,
        address: c.address,
        bags: c.no_bags,
        remarks: c.remarks,
      });
    }

    // DELIVERY
    if (
      d &&
      String(d.driver_id) === String(selectedDriver.id) &&
      toISODate(d.delivery_date) === toISODate(generatedDate)
    ) {
      const cp = d.contact_person || d.customer_contact_persons || {};
      items.push({
        kind: "DEL",
        sortTime: parseTimeStart(d.delivery_time),
        time: d.delivery_time,
        customer: log.customer,
        contact: cp,
        address: d.address,
        bags: d.no_bags,
        remarks: d.remarks,
      });
    }

    // DELIVERY EXCEPTIONS (EXC)
    const key = String(log?.logistics_id ?? log?.id ?? "");
    const exList = exceptionsByLogisticsId.value.get(key) || [];
    for (const ex of exList) {
      const exDriverId =
        ex?.driver_id != null && ex.driver_id !== ""
          ? ex.driver_id
          : d?.driver_id ?? null;

      if (
        String(exDriverId) === String(selectedDriver.id) &&
        toISODate(ex?.delivery_date) === toISODate(generatedDate)
      ) {
        const cp =
          ex.contact_person ||
          ex.customer_contact_persons ||
          d?.contact_person ||
          d?.customer_contact_persons ||
          {};
        items.push({
          kind: "EXC",
          sortTime: parseTimeStart(ex.delivery_time || d?.delivery_time),
          time: ex.delivery_time || d?.delivery_time,
          customer: log.customer,
          contact: cp,
          address: ex.address || d?.address || null,
          bags: ex.no_bags ?? d?.no_bags ?? null,
          remarks:
            ex.remarks ||
            (ex.reason ? `Exception: ${ex.reason}` : d?.remarks) ||
            "-",
        });
      }
    }
  });

  // ---------- split, sort, count ----------
  const cols = items.filter((i) => i.kind === "COL").sort((a, b) => a.sortTime - b.sortTime);
  const dels = items.filter((i) => i.kind === "DEL").sort((a, b) => a.sortTime - b.sortTime);
  const excs = items.filter((i) => i.kind === "EXC").sort((a, b) => a.sortTime - b.sortTime);

  const collectionCount = cols.length;
  const deliveryCount = dels.length + excs.length;

  // ---------- header (title + summary ribbon) ----------
  const margin = { left: 12, right: 12, top: 18, bottom: 14 };
  doc.setFontSize(16);
  doc.text(
    `Driver Schedule — ${selectedDriver.name}`,
    margin.left,
    margin.top
  );

  doc.setFontSize(11);
  doc.text(
    `${formatDate(generatedDate)}    |    ${collectionCount} Collections   •   ${deliveryCount} Deliveries (incl. EXC)`,
    margin.left,
    margin.top + 7
  );

  // footer (page X of Y)
  const addFooter = (data) => {
    const str = `Page ${data.pageNumber}`;
    doc.setFontSize(9);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(str, pageWidth - margin.right, doc.internal.pageSize.getHeight() - 6, {
      align: "right",
    });
  };

  // ---------- common table options ----------
  const tableHead = [
    [
      "Time",
      "Type",
      "Customer & Contact",
      "Address",
      "Bags",
      "Remarks",
    ],
  ];

  const mapRow = (t) => {
    let customer = t.customer?.name || "[NOT SET]";
    if (t.customer?.contact_no1) customer += `\n${t.customer.contact_no1}`;
    if (t.customer?.contact_no2) customer += `\n${t.customer.contact_no2}`;

    const cp = t.contact || {};
    let contact = cp?.name || "[NOT SET]";
    if (cp?.contact_no1) contact += `\n${cp.contact_no1}`;
    if (cp?.contact_no2) contact += `\n${cp.contact_no2}`;

    return [
      t.time || "[NOT SET]",
      t.kind === "COL" ? "Collection" : t.kind === "DEL" ? "Delivery" : "Delivery (EXC)",
      `${customer}\n— ${contact}`,
      formatAddress(t.address) || "[NOT SET]",
      t.bags != null && t.bags !== "" ? String(t.bags) : "-",
      t.remarks || "-",
    ];
  };

  const commonOptions = {
    startY: margin.top + 14, // below header
    margin,
    head: tableHead,
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.2,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: [20, 20, 20],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 26 },  // Time
      1: { cellWidth: 30 },  // Type
      2: { cellWidth: 72 },  // Customer & Contact
      3: { cellWidth: 100 }, // Address
      4: { cellWidth: 18, halign: "center" }, // Bags
      5: { cellWidth: "auto" }, // Remarks
    },
    theme: "grid",
    didDrawPage: (data) => addFooter(data),
    // Keep section headers sticky in body as separate rows (we'll push them manually)
  };

  // ---------- build combined body with section headers ----------
  const body = [];

  if (cols.length) body.push(sectionHeader("COLLECTIONS"));
  cols.forEach((t) => body.push(mapRow(t)));

  if (dels.length) body.push(sectionHeader("DELIVERIES"));
  dels.forEach((t) => body.push(mapRow(t)));

  if (excs.length) body.push(sectionHeader("DELIVERIES (EXC)"));
  excs.forEach((t) => body.push(mapRow(t)));

  // if nothing found
  if (!cols.length && !dels.length && !excs.length) {
    body.push([
      {
        content: "No tasks for the selected driver/date.",
        colSpan: 6,
        styles: { halign: "center", fontStyle: "italic" },
      },
    ]);
  }

  // ---------- draw table ----------
  autoTable(doc, {
    ...commonOptions,
    body,
    // Allow section header rows to span across columns (we pushed them already as objects)
    // Ensure these rows look like headers, not data
    didParseCell: (data) => {
      const cell = data.cell;
      if (Array.isArray(cell.raw)) return; // normal row
      if (typeof cell.raw === "object" && cell.raw?.colSpan === 6) {
        data.cell.styles.fillColor = cell.raw.styles?.fillColor || [44, 62, 80];
        data.cell.styles.textColor = cell.raw.styles?.textColor || [255, 255, 255];
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.halign = "left";
      }
    },
  });

  // ---------- open ----------
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, "_blank");
};


// STYLES
const thumbStyle = { right: "4px", borderRadius: "5px", height: "7px" };
const barStyle = { right: "2px", borderRadius: "9px", height: "7px" };

// WATCHERS
watch([selectedFilterDate, searchQuery, activeDriverTab], () => {
  currentPage.value = 1;
});

// EXACT label → "am" | "pm" (from DB)
const timeLabelToAmPm = ref(new Map());

async function buildTimeMapFromStoreExact() {
  // Ensure time options exist
  if (
    !Array.isArray(transactionStore.timeOptions) ||
    !transactionStore.timeOptions.length
  ) {
    if (typeof transactionStore.loadTimeOptions === "function") {
      await transactionStore.loadTimeOptions(); // must return [{time, am_pm}, …]
    }
  }

  timeLabelToAmPm.value.clear();

  // Expect shape: { time: "12nn - 3pm", am_pm: "pm" }
  const opts = transactionStore.timeOptions || [];
  opts.forEach((opt) => {
    if (!opt || typeof opt !== "object") return;
    const label = String(opt.time ?? "").trim();
    const ampm = (opt.am_pm ?? "").toString().trim().toLowerCase(); // "am" | "pm" | ""
    if (!label) return; // skip empties
    // Only map rows that have a definite am_pm ("am" / "pm"). Ignore "Custom Time" (null).
    if (ampm === "am" || ampm === "pm") {
      timeLabelToAmPm.value.set(label, ampm);
    } else {
      console.log(
        `[AM/PM] Skipping label="${label}" with am_pm="${opt.am_pm}"`
      );
    }
  });
}
const driverAmPmCounts = computed(() => {
  const counts = {};
  const start = new Date(startOfWeek.value);
  const end = new Date(endOfWeek.value);

  // grid init
  drivers.value.forEach((driverIdOrNotSet) => {
    counts[driverIdOrNotSet] = {};
    daysOfWeek.forEach((day) => {
      counts[driverIdOrNotSet][day] = { am: 0, pm: 0 };
    });
  });

  const inWeek = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    const ds = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return ds >= s && ds <= e;
  };

  // label -> "am"/"pm"
  const timeMap = new Map(
    (transactionStore.timeOptions || [])
      .filter((opt) => opt?.time && opt?.am_pm)
      .map((opt) => [opt.time.trim(), opt.am_pm.trim().toLowerCase()])
  );

  const bump = ({ driverId, dateISO, label }) => {
    if (!inWeek(dateISO)) return;
    const ampm = timeMap.get((label ?? "").trim());
    if (ampm !== "am" && ampm !== "pm") return;

    const driverKey =
      driverId == null || driverId === "" ? DRIVER_NOT_SET : String(driverId);
    const dayKey = daysOfWeek[new Date(dateISO).getDay()];

    if (!counts[driverKey]) counts[driverKey] = {};
    if (!counts[driverKey][dayKey]) counts[driverKey][dayKey] = { am: 0, pm: 0 };

    counts[driverKey][dayKey][ampm] += 1;
  };

  // --- DEDUPE set for exceptions across the week (grouped by date+time+driver)
  const seenExc = new Set();

  (allOrders.value || []).forEach((log) => {
    const c = log.collections?.[0] || null;
    const d = log.deliveries?.[0] || null;

    if (c) {
      bump({
        driverId: c.driver_id ?? null,
        dateISO: toISODate(c.collection_date),
        label: c.collection_time,
      });
    }

    if (d) {
      bump({
        driverId: d.driver_id ?? null,
        dateISO: toISODate(d.delivery_date),
        label: d.delivery_time,
      });
    }

    // === GROUPED EXCEPTIONS ===
    const lid = String(log?.logistics_id ?? log?.id ?? "");
    const exList = exceptionsByLogisticsId.value.get(lid) || [];
    for (const ex of exList) {
      const exDriverId =
        ex?.driver_id != null && ex.driver_id !== ""
          ? ex.driver_id
          : d?.driver_id ?? null;

      const gkey = exGroupKey(ex?.delivery_date, ex?.delivery_time, exDriverId);
      if (seenExc.has(gkey)) continue;
      seenExc.add(gkey);

      bump({
        driverId: exDriverId,
        dateISO: toISODate(ex?.delivery_date),
        label: ex?.delivery_time,
      });
    }
  });

  return counts;
});

</script>
