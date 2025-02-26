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
      <q-step
        class="cat-step step-2"
        :name="2"
        title="Create Transaction"
        icon="shopping_cart"
      >
        <TransactionTab @next="step = 3" @back="step = 1" />
      </q-step>

      <!-- Step 3: Instructions & Reporting -->
      <q-step
        class="cat-step"
        :name="3"
        title="Instructions & Reporting"
        icon="report_problem"
      >
        <InstructionsTab @next="step = 4" @back="step = 2" />
      </q-step>

      <!-- Step 4: Review and Submit -->
      <q-step
        class="cat-step"
        :name="4"
        title="Review and Submit"
        icon="rate_review"
      >
        <ReviewTab @next="step = 5" @back="step = 3" />
      </q-step>

      <!-- Step 5: Print -->
      <!-- <q-step class="cat-step" :name="5" title="Print" icon="print">
        <PaymentTab @back="step = 4" />
      </q-step> -->
    </q-stepper>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import CustomerTab from "@/components/CustomerTab.vue";
import TransactionTab from "@/components/TransactionTab.vue";
import InstructionsTab from "@/components/InstructionsTab.vue";
import ReviewTab from "@/components/ReviewTab.vue";

const step = ref(1);


</script>
