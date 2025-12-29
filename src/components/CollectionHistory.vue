<!-- path: src/components/CollectionHistory.vue -->
<template>
  <div class="logistics-management">
    <div class="q-px-md flex items-center justify-between bg-brown-4 text-white q-pa-sm">
      <div class="text-h6 text-uppercase text-weight-bold">Collection History</div>
    </div>

    <div class="row-col-table">
      <div class="row row-col-header q-px-md">
        <div class="col bordered q-py-sm text-weight-bold">Details</div>
        <div class="col bordered q-py-sm text-weight-bold">Contact Person</div>
        <div class="col bordered q-py-sm text-weight-bold">Address</div>
        <div class="col bordered q-py-sm text-weight-bold">No. of Bags</div>
        <div class="col q-py-sm text-weight-bold">Remarks</div>
        <!-- Status column removed -->
        <div class="col q-py-sm text-weight-bold">Created At/By</div>
      </div>

      <div v-if="!effectiveId" class="text-center text-grey q-pa-lg text-h6">
        Select a collection to view its history.
      </div>

      <div v-else-if="loading" class="text-center text-grey q-pa-lg text-h6">
        Loading…
      </div>

      <div v-else-if="allTransactions.length === 0" class="text-center text-grey q-pa-lg text-h6">
        No history found for this collection.
      </div>

      <div
        v-else
        v-for="transaction in allTransactions"
        :key="transaction.id"
        class="row row-col-row q-mx-md"
      >
        <!-- All from logistics_collections_history -->
        <div class="col bordered">
          <div><span class="text-weight-bold">Date: </span>{{ formatDate(transaction.collection_date) || "[NOT SET]" }}</div>
          <div><span class="text-weight-bold">Time: </span>{{ transaction.collection_time ?? "-" }}</div>
          <div><span class="text-weight-bold">Driver: </span>{{ getDriverName(transaction.driver_id) || "[NOT SET]" }}</div>
        </div>

        <div class="col bordered">
          <div>{{ transaction.customer_contact_persons?.name || "[NOT SET]" }}</div>
          <div>{{ transaction.customer_contact_persons?.contact_no1 ?? "-" }}</div>
          <div v-if="transaction.customer_contact_persons?.contact_no2">
            {{ transaction.customer_contact_persons?.contact_no2 ?? "-" }}
          </div>
        </div>

        <div class="col bordered">
          {{ formatAddress(transaction.customer_address) || "[NOT SET]" }}
        </div>

        <div class="col bordered">
          {{ transaction.no_bags ?? "-" }}
        </div>

        <div class="col bordered">
          {{ transaction.collection_remarks || "-" }}
        </div>

        <!-- Status cell removed -->

        <div class="col bordered">
          <div>{{ formatTimestamp(transaction.created_at) }}</div>
          <div>{{ transaction.profile_name || "-" }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* path: src/components/CollectionHistory.vue */
import { ref, onMounted, computed, watch } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";

const transactionStore = useTransactionStore();
const props = defineProps({
  logisticsCollectionId: { type: [String, Number], required: false },
});

const allTransactions = ref([]);
const loading = ref(false);

const DRIVER_NOT_SET = "[NOT SET]";
const driverMapById = computed(() => {
  const m = new Map();
  (transactionStore.driverOptions || []).forEach((d) => {
    if (d?.id != null) m.set(String(d.id), (d.name || "").trim() || DRIVER_NOT_SET);
  });
  return m;
});
const getDriverName = (id) => driverMapById.value.get(String(id)) || DRIVER_NOT_SET;

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

const effectiveId = computed(() => {
  const n = Number(props.logisticsCollectionId);
  return Number.isFinite(n) && n > 0 ? n : null; // prevents eq.undefined
});

async function loadHistory() {
  if (!effectiveId.value) {
    allTransactions.value = [];
    return;
  }
  loading.value = true;
  try {
    const rows = await transactionStore.fetchCollectionHistoryByCollectionId(effectiveId.value);
    allTransactions.value = Array.isArray(rows) ? rows : [];
  } catch (e) {
    console.error("Error initializing collection history:", e);
    allTransactions.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(loadHistory);
watch(effectiveId, loadHistory);
</script>
