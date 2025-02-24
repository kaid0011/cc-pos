<template>
    <q-dialog
      :model-value="isOpen"
      persistent
      transition-show="slide-down"
      transition-hide="slide-up"
      @update:model-value="closeDialog"
    >
      <q-card class="dialog" style="width: 500px">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">{{ title }}</div>
        </q-card-section>
  
        <q-card-section>
          <p>{{ message }}</p>
          <q-card-actions align="right">
            <q-btn flat class="negative-button" :label="cancelLabel" @click="closeDialog" />
            <q-btn flat class="main-button" :label="confirmLabel" @click="confirmAction" />
          </q-card-actions>
        </q-card-section>
      </q-card>
    </q-dialog>
  </template>
  
  <script setup>
  const props = defineProps({
    isOpen: Boolean, // Controls dialog visibility
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    confirmLabel: {
      type: String,
      default: "Yes",
    },
    cancelLabel: {
      type: String,
      default: "No",
    },
  });
  
  const emit = defineEmits(["update:isOpen", "confirm"]);
  
  // Close the dialog
  const closeDialog = () => {
    emit("update:isOpen", false);
  };
  
  // Confirm action and close
  const confirmAction = () => {
    emit("confirm"); // Emits the confirmation event
    emit("update:isOpen", false); // Closes the dialog
  };
  </script>
  