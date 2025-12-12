<!-- File: src/views/SettlementsPage.vue -->
<template>
  <div class="full-container orders-history">
    <div class="row justify-start q-mb-md">
      <div class="col-12 text-uppercase text-h6">Show driver collections and deliveries</div>
    </div>

    <!-- Controls -->
    <div class="row items-end q-col-gutter-md q-mb-md">
      <div class="col-3">
        <div class="text-subtitle2 q-mb-xs">Driver</div>
        <q-select
          v-model="selectedDriverId"
          :options="sortedDriverOptions"
          option-label="name"
          option-value="id"
          dense
          outlined
          emit-value
          map-options
          clearable
        />
      </div>

      <div class="col-3">
        <div class="text-subtitle2 q-mb-xs">Settlement Date</div>
        <q-input v-model="settlementDateStr" dense outlined readonly>
          <template #append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="settlementDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
            <q-icon
              v-if="settlementDate"
              name="close"
              class="cursor-pointer q-ml-sm"
              @click="settlementDate = null"
            />
          </template>
        </q-input>
      </div>

      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          class="q-px-xl q-mt-md"
          label="Show"
          :disable="!selectedDriverId || !settlementDate"
          @click="loadSettlement"
        />
      </div>
    </div>

    <!-- Heading -->
    <div v-if="driverLabel || settlementDate" class="q-mt-md q-mb-sm">
      <div class="text-subtitle1">
        <span class="text-weight-bold">Settlement Receipt - </span>
        <span class="text-weight-bold">{{ (driverLabel || '').toUpperCase() }}</span>
        <span class="text-weight-bold"> - {{ settlementDateDisplay }}</span>
      </div>
    </div>

    <!-- Top: Money Summary -->
    <q-markup-table v-if="hasLoaded" flat bordered class="settlement-table">
      <tbody>
        <tr class="row-head">
          <th>Cash Received</th>
          <th>Cheq Received</th>
          <th>Credit Received</th>
          <th>Bank Transfer</th>
        </tr>
        <tr class="row-values">
          <td :class="greenCls">{{ money(s.cash_received) }}</td>
          <td :class="orangeCls">{{ money(s.cheq_received) }}</td>
          <td :class="blueCls">{{ money(s.credit_received) }}</td>
          <td>{{ money(s.bank_transfer) }}</td>
        </tr>

        <tr class="row-head">
          <th>DC Cash Received</th>
          <th>DC Cheq Received</th>
          <th>DC Credit Received</th>
          <th>DC Bank Transfer</th>
        </tr>
        <tr class="row-values">
          <td :class="greenCls">{{ money(s.dc_cash_received) }}</td>
          <td :class="orangeCls">{{ money(s.dc_cheq_received) }}</td>
          <td :class="blueCls">{{ money(s.dc_credit_received) }}</td>
          <td>{{ money(s.dc_bank_transfer) }}</td>
        </tr>

        <tr class="row-head">
          <th>Total Cash Received</th>
          <th>Total Cheq Received</th>
          <th>Total Credit Received</th>
          <th>Total Bank Transfer</th>
        </tr>
        <tr class="row-values">
          <td :class="greenCls">{{ money(totals.total_cash) }}</td>
          <td :class="orangeCls">{{ money(totals.total_cheq) }}</td>
          <td :class="blueCls">{{ money(totals.total_credit) }}</td>
          <td>{{ money(totals.total_bank) }}</td>
        </tr>
      </tbody>
    </q-markup-table>

    <!-- Separator + Bottom: Counts + Driver Spent/Balance -->
    <div v-if="hasLoaded" class="bottom-sep" />
    <q-markup-table v-if="hasLoaded" flat bordered class="settlement-table bottom-table">
      <thead>
        <tr class="row-head compact">
          <th>Collections</th>
          <th>Deliveries</th>
          <th>Repeats</th>
          <th>Postponed</th>
          <th>DC Collections</th>
          <th>DC Deliveries</th>
          <th>Removals</th>
          <th>Installations</th>
          <th>Onsite Carpet</th>
          <th>Onsite Sofa</th>
          <th>Driver Spent</th>
          <th>Balance Cash</th>
        </tr>
      </thead>
      <tbody>
        <tr class="row-values compact">
          <td>{{ s.count_collections }}</td>
          <td>{{ s.count_deliveries }}</td>
          <td>{{ s.count_repeats }}</td>
          <td>{{ s.count_postponed }}</td>
          <td>{{ s.count_dc_collections }}</td>
          <td>{{ s.count_dc_deliveries }}</td>
          <td>{{ s.count_removals }}</td>
          <td>{{ s.count_installations }}</td>
          <td>{{ s.count_onsite_carpet }}</td>
          <td>{{ s.count_onsite_sofa }}</td>
          <td>{{ money(s.driver_spent) }}</td>
          <td>{{ money(totals.balance_cash) }}</td>
        </tr>
      </tbody>
    </q-markup-table>

    <div v-else class="text-grey q-mt-md">
      Select a driver and date, then click <b>Show</b>.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";

const $q = useQuasar();
const transactionStore = useTransactionStore();

const selectedDriverId = ref(null);
const settlementDate = ref(null);
const settlementDateStr = computed({
  get: () => (settlementDate.value ? formatDateISO(settlementDate.value) : ""),
  set: () => {}
});
const settlementDateDisplay = computed(() => toDDMMYYYY(settlementDate.value));

const sortedDriverOptions = computed(() => {
  const list = Array.isArray(transactionStore.driverOptions)
    ? transactionStore.driverOptions
    : [];
  return [...list].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
});
const driverLabel = computed(() => {
  const id = selectedDriverId.value != null ? String(selectedDriverId.value) : null;
  const found = (transactionStore.driverOptions || []).find(d => String(d.id) === id);
  return found?.name || "";
});

const hasLoaded = ref(false);
const s = ref(defaultSettlement());

const totals = computed(() => {
  const v = s.value;
  const total_cash = num(v.cash_received) + num(v.dc_cash_received);
  const total_cheq = num(v.cheq_received) + num(v.dc_cheq_received);
  const total_credit = num(v.credit_received) + num(v.dc_credit_received);
  const total_bank = num(v.bank_transfer) + num(v.dc_bank_transfer);
  const balance_cash = total_cash - num(v.driver_spent);
  return { total_cash, total_cheq, total_credit, total_bank, balance_cash };
});

const greenCls = "text-green-8";
const orangeCls = "text-orange-8";
const blueCls = "text-blue-8";

onMounted(async () => {
  try {
    if (typeof transactionStore.loadDrivers === "function") {
      await transactionStore.loadDrivers();
    }
  } catch (e) {
    console.error(e);
  }
});

async function loadSettlement() {
  hasLoaded.value = false;
  s.value = defaultSettlement();
  const driverId = selectedDriverId.value;
  const date = settlementDate.value;
  try {
    if (typeof transactionStore.fetchSettlement === "function") {
      const data = await transactionStore.fetchSettlement(driverId, date);
      s.value = normalizeSettlement(data);
    } else {
      $q.notify({ type: "warning", message: "No settlement API, showing empty template." });
    }
  } catch (err) {
    console.error("Failed to load settlement:", err);
    $q.notify({ type: "negative", message: "Failed to load settlement." });
  } finally {
    hasLoaded.value = true;
  }
}

function defaultSettlement() {
  return {
    cash_received: 0, cheq_received: 0, credit_received: 0, bank_transfer: 0,
    dc_cash_received: 0, dc_cheq_received: 0, dc_credit_received: 0, dc_bank_transfer: 0,
    driver_spent: 0,
    count_collections: 0, count_deliveries: 0, count_repeats: 0, count_postponed: 0,
    count_dc_collections: 0, count_dc_deliveries: 0, count_removals: 0, count_installations: 0,
    count_onsite_carpet: 0, count_onsite_sofa: 0,
  };
}
function normalizeSettlement(raw) {
  const v = raw || {};
  return {
    cash_received: num(v.cash_received),
    cheq_received: num(v.cheq_received),
    credit_received: num(v.credit_received),
    bank_transfer: num(v.bank_transfer),
    dc_cash_received: num(v.dc_cash_received),
    dc_cheq_received: num(v.dc_cheq_received),
    dc_credit_received: num(v.dc_credit_received),
    dc_bank_transfer: num(v.dc_bank_transfer),
    driver_spent: num(v.driver_spent),
    count_collections: int(v.count_collections),
    count_deliveries: int(v.count_deliveries),
    count_repeats: int(v.count_repeats),
    count_postponed: int(v.count_postponed),
    count_dc_collections: int(v.count_dc_collections),
    count_dc_deliveries: int(v.count_dc_deliveries),
    count_removals: int(v.count_removals),
    count_installations: int(v.count_installations),
    count_onsite_carpet: int(v.count_onsite_carpet),
    count_onsite_sofa: int(v.count_onsite_sofa),
  };
}
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const int = (v) => (Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : 0);
const money = (v) => num(v).toFixed(2);

function formatDateISO(d) {
  if (!d) return "";
  return toDDMMYYYY(d);
}
function toDDMMYYYY(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
</script>

<style scoped>
.settlement-table {
  border: 1px solid #e0e0e0;
}
.settlement-table th,
.settlement-table td {
  border: 1px solid #e0e0e0;
  padding: 8px 10px;
  text-align: left;
}
.settlement-table .row-head th {
  background: #fafafa;
  font-weight: 600;
}
.settlement-table .row-values td {
  font-weight: 600;
}
.settlement-table .compact th,
.settlement-table .compact td {
  padding: 6px 8px;
}

/* subtle separation for bottom block */
.bottom-sep {
  height: 14px;
}
.bottom-table {
  border-color: #e8e2b5;
}
</style>
