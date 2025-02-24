<template>
  <div class="customer-tab main-container row">
    <!-- Select Customer Column -->
    <div class="col-6">
      <SelectCustomerTab />
    </div>

    <!-- Create Collection Column -->
    <div class="col-6">
      <CreateCollectionTab />
    </div>
  </div>
</template>

<script setup>
import SelectCustomerTab from "./SelectCustomerTab.vue";
import CreateCollectionTab from "./CreateCollectionTab.vue";
</script>
