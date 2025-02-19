<template>
    <q-dialog v-model="isOpen" persistent>
      <q-card style="width: 400px">
        <q-card-section class="dialog-header">
          <div class="text-weight-bold text-h6">Update Contact Person</div>
        </q-card-section>
        <q-card-section class="dialog-body">
          <q-form @submit.prevent="handleUpdateContact">
            <q-input v-model="contact.name" label="Name" outlined required class="dialog-inputs" />
            <div class="row q-col-gutter-x-sm">
              <div class="col">
                <q-input v-model="contact.contact_no1" label="Contact No 1" outlined required class="dialog-inputs" />
              </div>
              <div class="col">
                <q-input v-model="contact.contact_no2" label="Contact No 2" outlined class="dialog-inputs" />
              </div>
            </div>
            <q-input v-model="contact.email" label="Email" outlined class="dialog-inputs" />
  
            <q-card-actions align="right">
              <q-btn label="Cancel" color="negative" @click="closeDialog" />
              <q-btn label="Update" color="primary" type="submit" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </template>
  
  <script setup>
  import { ref, watch, computed } from "vue";
  import { useTransactionStore } from "@/stores/transactionStore";
  
  const props = defineProps({
    modelValue: Boolean,
  });
  const emit = defineEmits(["update:modelValue", "contact-updated"]);
  
  const transactionStore = useTransactionStore();
  const isOpen = ref(props.modelValue);
  const contact = computed(() => transactionStore.selectedContact);
  
  watch(
    () => props.modelValue,
    (newValue) => {
      isOpen.value = newValue;
    }
  );
  
  const handleUpdateContact = async () => {
    try {
      await transactionStore.updateContactPerson(contact.value);
      emit("contact-updated");
      closeDialog();
    } catch (error) {
      console.error("Error updating contact person:", error);
    }
  };
  
  const closeDialog = () => {
    emit("update:modelValue", false);
  };
  </script>
  