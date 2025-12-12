<!-- src/components/SoaTableComponent.vue -->
<template>
  <div class="row-col-table">
    <!-- Header -->
    <div
      class="row row-col-header text-center items-center text-weight-bolder"
    >
      <div class="col bordered">SOA No.</div>
      <div class="col bordered">Customer Details</div>
      <div class="col bordered">Created At</div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-lg">
      <q-spinner />
      <div class="q-mt-sm">Loading SOAs…</div>
    </div>

    <!-- Empty -->
    <div v-else-if="!hasSoa" class="text-center text-grey q-pa-lg text-h6">
      No SOA found.
    </div>

    <!-- Rows -->
    <template v-else>
      <div
        v-for="(soa, idx) in soasToRender"
        :key="soa.id || idx"
        class="row row-col-row line-height-1"
      >
        <div class="col bordered">
          <div class="text-subtitle1 text-uppercase">
            <a class="cursor-pointer text-weight-bold" @click.prevent="openSoaTab(soa.soa_no)">
              {{ soa.soa_no || "-" }}
            </a>
          </div>
        </div>

        <div class="col bordered">
          <div class="text-weight-bold">
            <a
              @click.prevent="openCustomerTab(soa.customers?.id)"
              class="text-weight-bold text-subtitle1 line-height-1"
            >
              {{ soa.customers?.name || "[NOT SELECTED]" }}
            </a>
          </div>
          <div>
            {{ soa.customers?.contact_no1 || "-" }}
            <span v-if="soa.customers?.contact_no2">
              / {{ soa.customers?.contact_no2 || "-" }}
            </span>
            <span v-if="soa.customers?.email">
              / {{ soa.customers?.email || "-" }}
            </span>
          </div>
        </div>

        <div class="col bordered">
          <div class="text-subtitle1">
            {{ formatDate(soa.created_at) }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";

const props = defineProps({
  rows: { type: Array, default: null },
  selectedFilterDate: { type: String, default: null },
});

const transactionStore = useTransactionStore();

const fetchedSoas = ref([]);
const isLoading = ref(false);

onMounted(async () => {
  if (props.rows && props.rows.length) return;
  isLoading.value = true;
  try {
    fetchedSoas.value = await transactionStore.fetchAllSoa();
  } catch (err) {
    console.error("Failed to load SOAs:", err);
  } finally {
    isLoading.value = false;
  }
});

const baseSoas = computed(() =>
  props.rows ? props.rows : fetchedSoas.value || []
);

const soasToRender = computed(() => {
  const list = baseSoas.value;
  if (!props.selectedFilterDate) return list;
  return list.filter((s) => {
    const d = s?.created_at ? new Date(s.created_at) : null;
    if (!d || Number.isNaN(d.getTime())) return false;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}` === props.selectedFilterDate;
  });
});

const hasSoa = computed(() => (soasToRender.value || []).length > 0);

function formatDate(dateString) {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const openCustomerTab = (customerId) => {
  if (!customerId) return;
  window.open(`/customers/${encodeURIComponent(String(customerId))}`, "_blank");
};

// why: ensure safe URL for SOA numbers like "SOA-001/2024"
const openSoaTab = (soaNo) => {
  if (!soaNo) return;
  window.open(`/finance/soa/${encodeURIComponent(String(soaNo))}`, "_blank");
};
</script>
