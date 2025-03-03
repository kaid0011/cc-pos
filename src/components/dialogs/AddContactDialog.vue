<template>
    <q-dialog v-model="isOpen" persistent>
      <q-card style="width: 400px">
        <q-card-section class="dialog-header">
          <div class="text-weight-bold text-h6">Add Contact Person</div>
        </q-card-section>
        <q-card-section class="dialog-body">
          <q-form @submit.prevent="handleAddContact">
              <div class="dialog-label">Name:</div>
              <q-input
              v-model="contact.name"
              label="Name"
              outlined
              required
              class="dialog-inputs"
            />
            <div class="row q-col-gutter-x-sm">
              <div class="col">
              <div class="dialog-label">Contact No:</div>
              <q-input
                  v-model="contact.contact_no1"
                  label="Contact No 1"
                  outlined
                  required
                  class="dialog-inputs"
                />
              </div>
              <div class="col">
              <div class="dialog-label">Alternative Contact No:</div>
              <q-input
                  v-model="contact.contact_no2"
                  label="Contact No 2"
                  outlined
                  class="dialog-inputs"
                />
              </div>
            </div>
              <div class="dialog-label">Email Address:</div>
              <q-input
              v-model="contact.email"
              label="Email"
              outlined
              class="dialog-inputs"
            />
              <div class="dialog-label">Remarks:</div>
              <q-input
              v-model="contact.remarks"
              label="Remarks"
              outlined
              type="textarea"
              class="dialog-inputs"
            />
            <q-card-actions align="right">
              <q-btn label="Cancel" color="negative" @click="closeDialog" />
              <q-btn label="Add" color="primary" type="submit" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </template>
  
  <script setup>
  import { ref, watch } from "vue";
  import { useTransactionStore } from "@/stores/transactionStore";
  
  const props = defineProps({ modelValue: Boolean });
  const emit = defineEmits(["update:modelValue", "contact-added"]);
  
  const transactionStore = useTransactionStore();
  const isOpen = ref(props.modelValue);
  
  watch(() => props.modelValue, (newValue) => {
    isOpen.value = newValue;
  });
  
  const contact = ref({
    name: "",
    contact_no1: "",
    contact_no2: "",
    email: "",
    remarks: "",
  });
  
  const handleAddContact = async () => {
    try {
      await transactionStore.addContactPerson(contact.value);
      emit("contact-added");
      closeDialog();
    } catch (error) {
      console.error("Error adding contact person:", error);
    }
  };
  
  const closeDialog = () => {
    emit("update:modelValue", false);
    resetContactForm();
  };
  
  const resetContactForm = () => {
    contact.value = {
      name: "",
      contact_no1: "",
      contact_no2: "",
      email: "",
      remarks: "",
    };
  };
  </script>
  