<!-- path: src/components/DeliveryHistory.vue -->
<template>
  <div class="logistics-management">
    <div class="q-px-md flex items-center justify-between bg-brown-4 text-white q-pa-sm">
      <div class="text-h6 text-uppercase text-weight-bold">Delivery History</div>
    </div>

    <div class="row-col-table">
      <div class="row row-col-header q-px-md">
        <div class="col bordered q-py-sm text-weight-bold">Date</div>
        <div class="col bordered q-py-sm text-weight-bold">Contact Person</div>
        <div class="col bordered q-py-sm text-weight-bold">Address</div>
        <div class="col q-py-sm text-weight-bold">Remarks</div>
        <div class="col bordered q-py-sm text-weight-bold">Status</div>
        <div class="col q-py-sm text-weight-bold">Created At/By</div>
      </div>

      <div v-if="allTransactions.length === 0" class="text-center text-grey q-pa-lg text-h6">
        No transactions found.
      </div>

      <div v-else v-for="transaction in allTransactions" :key="transaction.id" class="row row-col-row q-mx-md">
        <div class="col bordered">
          <div>{{ formatDate(transaction.logistics_deliveries.delivery_date) || "[NOT SET]" }}</div>
          <div><span class="text-weight-bold">Time: </span>{{ transaction.logistics_deliveries.delivery_time || transaction.delivery_time || "-" }}</div>
          <div><span class="text-weight-bold">Driver: </span>{{ getDriverName(transaction.logistics_deliveries.driver_id) || "[NOT SET]" }}</div>
        </div>

        <div class="col bordered">
          <div>{{ transaction.logistics_deliveries?.customer_contact_persons?.name || "[NOT SET]" }}</div>
          <div>{{ transaction.logistics_deliveries?.customer_contact_persons?.contact_no1 || "-" }}</div>
          <div v-if="transaction.logistics_deliveries?.customer_contact_persons?.contact_no2">
            {{ transaction.logistics_deliveries?.customer_contact_persons?.contact_no2 || "-" }}
          </div>
        </div>

        <div class="col bordered">
          {{ formatAddress(transaction.logistics_deliveries?.customer_address) || "[NOT SET]" }}
        </div>

        <div class="col bordered">{{ transaction.logistics_deliveries?.delivery_remarks || "-" }}</div>

        <!-- SAFE: logistics may be missing -->
        <div class="col bordered text-uppercase text-weight-bold">
          {{ transaction.logistics_deliveries?.logistics?.logistics_status || "-" }}
        </div>

        <div class="col bordered">
          <div>{{ formatTimestamp(transaction.created_at) }}</div>
          <div>{{ transaction.profile_name || "-" }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";

const transactionStore = useTransactionStore();
const allTransactions = ref([]);
const showHistory = ref(false);


// Function to format dates in "Thu, 30/01/2025" format
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

// Function to format date and time as "Thu, 30/01/2025 02:15:45 PM"
const formatTimestamp = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

onMounted(async () => {
  try {
    const rows = await transactionStore.fetchDeliveryHistoryByLogisticsId(
      transactionStore.logisticsId
    );

    // Normalize to avoid undefined property access in templates/store mappers
    allTransactions.value = Array.isArray(rows)
      ? rows.map((t) => {
          const driverName =
            t.driver_name ??
            t.profiles?.name ?? // common join alias
            t.driver?.name ??   // alternative
            null;

          // address may be a string in some queries or an object from a join
          const addressObj = t.customer_address ?? t.address ?? null;
          const addressStr = formatAddress(addressObj);

          // logistics may be absent depending on query
          const logisticsStatus =
            t.logistics?.logistics_status ??
            t.logistics_status ?? // some APIs flatten this
            null;

          const profileName = t.profile_name ?? t.profiles?.name ?? null;

          return {
            ...t,
            driver_name: driverName,
            address_str: addressStr,
            logistics_status: logisticsStatus,
            profile_name: profileName,
          };
        })
      : [];
  } catch (error) {
    console.error("Error initializing transactions:", error);
    allTransactions.value = [];
  }
});


const DRIVER_NOT_SET = '[NOT SET]';

const driverMapById = computed(() => {
  const m = new Map();
  (transactionStore.driverOptions || []).forEach((d) => {
    if (d?.id != null) m.set(String(d.id), (d.name || '').trim() || DRIVER_NOT_SET);
  });
  return m;
});
const getDriverName = (id) => driverMapById.value.get(String(id)) || DRIVER_NOT_SET;


function formatAddress(addr) {
  if (!addr) return '-';
  const main = [addr.block_no, addr.road_name, addr.unit_no, addr.building_name]
    .map((v) => (v ?? '').toString().trim()).filter(Boolean).join(' ');
  const postal = (addr.postal_code ?? '').toString().trim();
  const line = [main, postal].filter(Boolean).join(', ');
  const extra = [addr.additional_info, addr.remarks]
    .map((v) => (v ?? '').toString().trim()).filter(Boolean).join(' — ');
  return extra ? `${line} (${extra})` : line || '-';}
  
  </script>
