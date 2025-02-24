<template>
  <div class="customer-tab main-container row">
    <!-- Select Customer Column -->
    <div class="col-6 left-container">
      <SelectCustomerTab />
    </div>

    <!-- Create Collection Column -->
    <div class="col-6 right-container">
      <CreateCollectionTab />
    </div>
  </div>
</template>

<script setup>
import SelectCustomerTab from "./SelectCustomerTab.vue";
import CreateCollectionTab from "./CreateCollectionTab.vue";
</script>
