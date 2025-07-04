<template>
  <div class="logistics-management">
<div class="q-px-md flex items-center justify-between bg-brown-4 text-white q-pa-sm">
  <div class="text-h6 text-uppercase text-weight-bold">
    Delivery History
  </div>
  <q-btn
    dense
    flat
    round
    :icon="showDeliveryHistory ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
    @click="showDeliveryHistory = !showDeliveryHistory"
  />
</div>
    <div class="row-col-table" v-if="showDeliveryHistory">
      <!-- Table Header -->
      <div class="row row-col-header q-px-md">
        <div class="col bordered q-py-sm text-weight-bold">Date</div>
        <div class="col bordered q-py-sm text-weight-bold">
          Contact Person
        </div>
        <div class="col bordered q-py-sm text-weight-bold">Address</div>
        <div class="col bordered q-py-sm text-weight-bold">No. of Bags</div>
        <div class="col q-py-sm text-weight-bold">Remarks</div>
        <div class="col bordered q-py-sm text-weight-bold">Status</div>
        <div class="col q-py-sm text-weight-bold">Created At/By</div>
      </div>

      <!-- Table Rows -->
      <div
        v-if="allTransactions.length === 0"
        class="text-center text-grey q-pa-lg text-h6"
      >
        No transactions found.
      </div>

      <div
        v-else
        v-for="transaction in allTransactions"
        :key="transaction.id"
        class="row row-col-row q-mx-md"
      >
        <div class="col bordered">
          <div class="text-weight-bolder text-uppercase">
            <mark-blue>Delivery:</mark-blue>
          </div>
          <div>
            {{ formatDate(transaction.collection_date) || "[NOT SET]" }}
          </div>

          <div>
            <span class="text-weight-bold">Time: </span>
            {{
              transaction.collection_time || transaction.delivery_time || "-"
            }}
          </div>
          <div>
            <span class="text-weight-bold">Driver: </span>
            {{ transaction.driver_name || "[NOT SET]" }}
          </div>
        </div>
        <div class="col bordered">
          <div>{{ transaction.customer_contact_persons?.name || "[NOT SET]" }}</div>
          <div>{{ transaction.customer_contact_persons?.contact_no1 || "-" }}</div>
          <div v-if="transaction.customer_contact_persons?.contact_no2">
            {{ transaction.customer_contact_persons?.contact_no2 || "-" }}
          </div>
        </div>
        <div class="col bordered">
          {{ transaction.address || "[NOT SET]" }}
        </div>
        <div class="col bordered">{{ transaction.no_bags || "-" }}</div>
        <div class="col bordered">{{ transaction.remarks || "-" }}</div>
        <div class="col bordered text-uppercase text-weight-bold">
            {{ transaction.logistics.logistics_status }}
        </div>
        <div class="col bordered">
          <div>
            {{ formatTimestamp(transaction.created_at) }}
          </div>
          <div>
            {{ transaction.profile_name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";

const transactionStore = useTransactionStore();
const allTransactions = ref([]);
const showDeliveryHistory = ref(false);


// Function to format dates in "Thu, 30/01/2025" format
const formatDate = (dateString) => {
  if (!dateString) return ""; // Show empty input if no date is selected

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ""; // Prevent invalid date errors

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Function to format date and time as "Thu, 30/01/2025 02:15:45 PM"
const formatTimestamp = (dateString) => {
  if (!dateString) return ""; // Return empty if no date is provided

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ""; // Prevent invalid date errors

  return date.toLocaleString("en-GB", {
    weekday: "short", // "Thu"
    day: "2-digit",   // "30"
    month: "2-digit", // "01"
    year: "numeric",  // "2025"
    hour: "2-digit",  // "02"
    minute: "2-digit",// "15"
    second: "2-digit",// "45"
    hour12: true      // "AM/PM"
  });
};

onMounted(async () => {
  try {
    const transactions =
      await transactionStore.fetchDeliveryHistoryByLogisticsId(
        transactionStore.logisticsId
      );

    console.log("Loaded Transactions: ", transactions); // Debugging log

    if (Array.isArray(transactions)) {
      allTransactions.value = transactions; // ✅ Correctly update the ref
    } else {
      console.error("Fetched data is not an array:", transactions);
    }
  } catch (error) {
    console.error("Error initializing transactions:", error);
  }
});
</script>
