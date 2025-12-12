<!-- src/pages/CustomerComplaintsPage.vue -->
<template>
  <div class="row justify-center page-title-header text-uppercase">
    Customer Complaints
  </div>

  <div class="full-container orders-history">
    <div class="row items-end justify-between q-mb-md">
      <!-- Filters (owned by page) -->
      <div class="col">
        <div class="row justify-end q-gutter-x-sm">
          <div class="col">
            <div class="dialog-label">
              <div class="text-weight-bold text-subtitle2">Date</div>
            </div>
            <q-input :model-value="formattedDate" outlined dense readonly class="bg-white">
              <template #append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy>
                    <q-date v-model="date" mask="YYYY-MM-DD" />
                  </q-popup-proxy>
                </q-icon>
                <q-icon name="close" class="cursor-pointer q-ml-sm" @click="clearDate" v-show="!!date" />
              </template>
            </q-input>
          </div>

          <div class="col">
            <div class="dialog-label">
              <div class="text-weight-bold text-subtitle2">Search Here...</div>
            </div>
            <q-input class="search-transactions search-input" v-model="searchQuery" outlined dense debounce="300">
              <template #prepend><q-icon name="search" /></template>
            </q-input>
          </div>
        </div>
      </div>
    </div>
      <div class="q-mb-md">
        <q-btn
          color="primary"
          icon="add"
          label="Create Complaint"
          outline
          class="q-pr-md full-width"
          @click="showCreateDialog = true"
        />
      </div>
    <!-- Table (pure presentational) -->
    <ComplaintsTableComponent
      :rows="paginatedComplaints"
      :loading="loading"
      :error="error"
      :page="currentPage"
      :total-pages="totalPages"
      @update:page="(p) => currentPage = p"
      :show-customer-column="true"
    />

    <!-- Create Complaint Dialog -->
    <CreateComplaintDialog
      v-model="showCreateDialog"
      @created="handleComplaintCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import ComplaintsTableComponent from "@/components/ComplaintsTableComponent.vue";
import CreateComplaintDialog from "@/components/dialogs/CreateComplaintDialog.vue";
import { useTransactionStore } from "@/stores/transactionStore";

const transactionStore = useTransactionStore();

const complaints = ref([]);
const loading = ref(false);
const error = ref("");

const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref("");
const date = ref(null);

const showCreateDialog = ref(false);

/* Filters */
const clearDate = () => { date.value = null; };

const toDateOnly = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return String(dateString).slice(0, 10);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const formattedDate = computed(() => (date.value ? date.value : ""));

const filteredComplaints = computed(() => {
  const q = (searchQuery.value || "").trim().toLowerCase();
  const selected = date.value;
  return complaints.value.filter((item) => {
    const sameDay = selected ? toDateOnly(item.created_at) === selected : true;
    if (!q) return sameDay;
    const haystack = [
      item.description,
      item.created_by,
      item.profile_name,
      item.customers?.name,
      item.customers?.email,
      item.customers?.contact_no1,
      item.customers?.contact_no2,
      toDateOnly(item.created_at),
    ].filter(Boolean).join(" ").toLowerCase();
    return sameDay && haystack.includes(q);
  });
});

const paginatedComplaints = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredComplaints.value.slice(start, start + pageSize.value);
});
const totalPages = computed(() => Math.max(1, Math.ceil(filteredComplaints.value.length / pageSize.value)));

watch([searchQuery, date], () => { currentPage.value = 1; });

async function loadComplaints() {
  loading.value = true;
  error.value = "";
  try {
    complaints.value = await transactionStore.fetchCustomerComplaints();
  } catch (e) {
    error.value = e?.message || "Failed to load complaints.";
  } finally {
    loading.value = false;
  }
}

async function handleComplaintCreated() {
  showCreateDialog.value = false;
  await loadComplaints();      // refresh table after creation
  currentPage.value = 1;       // go to first page to show newest
}

onMounted(loadComplaints);
</script>
