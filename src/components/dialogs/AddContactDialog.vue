<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="width: 600px">
      <q-card-section class="dialog-header">
        <q-btn
        icon="close"
        flat
        dense
        round
        class="absolute-top-right q-ma-sm"
        @click="closeDialog"
      />
      <div class="text-body1 text-uppercase text-weight-bold">
        Add Contact Person
      </div>
      </q-card-section>
      <q-card-section class="dialog-body">
        <q-form @submit.prevent="handleAddContact">
          <div>
            <div class="dialog-label">Name:<span class="dialog-asterisk">*</span></div>
            <q-input
              v-model="contact.name"
              outlined
              class="dialog-inputs"
              :rules="[(val) => !!val || 'Contact Person Name is required']"
            />
          </div>
          <div class="row q-col-gutter-x-sm">
            <div class="col">
              <div class="dialog-label">Contact No:<span class="dialog-asterisk">*</span></div>
              <q-input
                v-model="contact.contact_no1"
                outlined
                class="dialog-inputs"
                :rules="[(val) => !!val || 'Contact No. is required']"
              />
            </div>
            <div class="col">
              <div class="dialog-label">Alternative Contact No:<span class="dialog-asterisk"></span></div>
              <q-input
                v-model="contact.contact_no2"
                outlined
                class="dialog-inputs"
              />
            </div>
          </div>
          <div class="q-mb-md">
            <div class="dialog-label">Email Address:<span class="dialog-asterisk"></span></div>
            <q-input
              v-model="contact.email"
              outlined
              class="dialog-inputs"
            />
          </div>
          <div class="q-mb-md">
            <div class="dialog-label">Remarks:<span class="dialog-asterisk"></span></div>
            <q-input
              v-model="contact.remarks"
              outlined
              type="textarea"
              class="dialog-inputs"
            />
          </div>
          <q-card-actions align="right">
            <q-btn unelevated label="Add Contact Person" color="primary" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { useQuasar } from "quasar";

const $q = useQuasar();

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(["update:modelValue", "contact-added"]);

const transactionStore = useTransactionStore();
const isOpen = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue;
  }
);

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

    $q.notify({
      type: "positive",
      message: "Contact person added successfully!",
    });

    emit("contact-added");
    closeDialog();
  } catch (error) {
    console.error("Error adding contact person:", error);
    $q.notify({
      type: "negative",
      message: "Failed to add contact person. Please try again.",
    });
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
