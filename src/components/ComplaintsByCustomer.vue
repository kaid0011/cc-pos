<template>
  <!-- Top bar -->
    <div class="col-auto">
      <q-btn
        color="primary"
        icon="add"
        label="Create Complaint"
        outline
        class="full-width q-mb-md"
        @click="showCreateDialog = true"
      />
  </div>
  <ComplaintsTableComponent
    :rows="paginated"
    :loading="loading"
    :error="error"
    :page="page"
    :total-pages="totalPages"
    :show-customer-column="false"
    @update:page="(p) => (page = p)"
  />

  <!-- Dialog: customer preselected & locked -->
  <CreateComplaintDialog
    v-model="showCreateDialog"
    :default-customer-id="customerId"
    :lock-customer="true"
    @created="handleCreated"
  />
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import ComplaintsTableComponent from "@/components/ComplaintsTableComponent.vue";
import CreateComplaintDialog from "@/components/dialogs/CreateComplaintDialog.vue";
import { useTransactionStore } from "@/stores/transactionStore";

const props = defineProps({
  customerId: { type: [String, Number], required: true },
  pageSize: { type: Number, default: 10 },
});

const transactionStore = useTransactionStore();

const all = ref([]);
const loading = ref(false);
const error = ref("");
const page = ref(1);
const showCreateDialog = ref(false);

const forCustomer = computed(() =>
  all.value.filter((c) => c.customers?.id == props.customerId)
);

const paginated = computed(() => {
  const start = (page.value - 1) * props.pageSize;
  return forCustomer.value.slice(start, start + props.pageSize);
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(forCustomer.value.length / props.pageSize))
);

watch(() => props.customerId, () => { page.value = 1; });

async function loadComplaints() {
  loading.value = true;
  error.value = "";
  try {
    all.value = await transactionStore.fetchCustomerComplaints();
  } catch (e) {
    error.value = e?.message || "Failed to load complaints.";
  } finally {
    loading.value = false;
  }
}

async function handleCreated() {
  showCreateDialog.value = false;
  await loadComplaints();
  page.value = 1;
}

onMounted(loadComplaints);
</script>
