<template>
  <div class="main-page">
    <q-stepper
      class="category-stepper"
      v-model="step"
      alternative-labels
      color="primary"
      animated
      header-nav
    >
      <!-- Step 1: Enter Customer -->
      <q-step class="cat-step" :name="1" title="Enter Customer" icon="person">
        <CustomerTab @next="step = 2" @back="step = 1" />
      </q-step>

      <!-- Step 2: Create Transaction -->
      <q-step class="cat-step step-2" :name="2" title="Create Transaction" icon="shopping_cart">
        <TransactionTab @next="step = 3" @back="step = 1" />
      </q-step>

      <!-- Step 3: Instructions & Reporting -->
      <q-step class="cat-step" :name="3" title="Instructions & Reporting" icon="report_problem">
        <InstructionsTab @next="step = 4" @back="step = 2" />
      </q-step>

      <!-- Step 4: Review and Submit -->
      <q-step class="cat-step" :name="4" title="Review and Submit" icon="rate_review">
        <ReviewTab @next="step = 5" @back="step = 3" />

        <!-- Submit Transaction Button (Moved from ReviewTab.vue) -->
        <div class="row justify-end q-mx-md q-my-sm">
          <q-btn @click="handleSubmit" color="primary" label="Submit Transaction" />
        </div>
      </q-step>
    </q-stepper>

    <!-- Transaction Success/Failure Dialog -->
    <q-dialog v-model="isDialogOpen">
      <q-card>
        <q-card-section class="text-h6 text-center">
          {{ dialogMessage }}
        </q-card-section>
        <q-card-actions align="center" class="q-pt-md">
          <q-btn v-if="transactionSuccess" label="Generate Invoice" color="primary" @click="handleGenerateInvoice" />
          <q-btn label="Close" color="secondary" @click="isDialogOpen = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import CustomerTab from "@/components/CustomerTab.vue";
import TransactionTab from "@/components/TransactionTab.vue";
import InstructionsTab from "@/components/InstructionsTab.vue";
import ReviewTab from "@/components/ReviewTab.vue";

const step = ref(1);
const transactionStore = useTransactionStore();

// Dialog state and message
const isDialogOpen = ref(false);
const dialogMessage = ref("");
const transactionSuccess = ref(false);

// Submit Transaction function (moved from ReviewTab.vue)
async function handleSubmit() {
  try {
    const orderNo = await transactionStore.createWholeTransaction(); // Save transaction and get order number
    if (!orderNo) {
      throw new Error("Order number could not be retrieved.");
    }

    dialogMessage.value = `Transaction for Order No: ${orderNo} submitted successfully!`;
    transactionStore.orderNo = orderNo;
    transactionSuccess.value = true;
    isDialogOpen.value = true;
  } catch (error) {
    dialogMessage.value = `Error submitting transaction: ${error.message}`;
    transactionSuccess.value = false;
    isDialogOpen.value = true;
    console.error("Error submitting transaction:", error.message);
  }
}

// Generate Invoice function (moved from ReviewTab.vue)
async function handleGenerateInvoice() {
  try {
    const orderNo = transactionStore.orderNo;
    if (!orderNo) {
      throw new Error("Order number is missing. Please submit the transaction first.");
    }

    const result = await transactionStore.generateInvoice(orderNo);
    if (result) {
      dialogMessage.value = `Invoice generated successfully for Order No: ${orderNo}!`;
      transactionSuccess.value = true;
      window.open(`/payment/${orderNo}`, "_blank");
    } else {
      dialogMessage.value = "Failed to generate invoice.";
      transactionSuccess.value = false;
    }
  } catch (error) {
    console.error("Error generating invoice:", error.message);
    dialogMessage.value = `Error: ${error.message}`;
    transactionSuccess.value = false;
  }
}
</script>
