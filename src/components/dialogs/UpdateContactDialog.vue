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
          Update Contact Person
        </div>
      </q-card-section>
      <q-card-section class="dialog-body">
        <q-form @submit.prevent="handleUpdateContact">
          <div>
            <div class="dialog-label">
              Name:<span class="dialog-asterisk">*</span>
            </div>
            <q-input
              v-model="contact.name"
              outlined
              class="dialog-inputs"
              :rules="[(val) => !!val || 'Contact Person Name is required']"
            />
          </div>
          <div class="row q-col-gutter-x-sm">
            <div class="col">
              <div class="dialog-label">
                Contact No:<span class="dialog-asterisk">*</span>
              </div>
              <q-input
                :model-value="contact.contact_no1"
                @update:model-value="(v) => enforceDigits(v, 'contact_no1')"
                @keydown="onDigitsKeydown"
                outlined
                type="tel"
                inputmode="numeric"
                :rules="[
                  (val) => !!val || 'Contact No. is required',
                  (val) => /^\d+$/.test(val) || 'Numbers only',
                ]"
                class="dialog-inputs"
              />
            </div>

            <div class="col">
              <div class="dialog-label">
                Alternative Contact No:<span class="dialog-asterisk"></span>
              </div>
              <q-input
                :model-value="contact.contact_no2"
                @update:model-value="(v) => enforceDigits(v, 'contact_no2')"
                @keydown="onDigitsKeydown"
                outlined
                type="tel"
                inputmode="numeric"
                :rules="[
                  (val) => val === '' || /^\d+$/.test(val) || 'Numbers only',
                ]"
                class="dialog-inputs"
              />
            </div>
          </div>
          <div class="q-mb-md">
            <div class="dialog-label">
              Email Address:<span class="dialog-asterisk"></span>
            </div>
            <q-input v-model="contact.email" outlined class="dialog-inputs" />
          </div>
          <div class="q-mb-md">
            <div class="dialog-label">
              Remarks:<span class="dialog-asterisk"></span>
            </div>
            <q-input
              v-model="contact.remarks"
              outlined
              type="textarea"
              class="dialog-inputs"
            />
          </div>
          <q-card-actions align="right">
            <q-btn
              unelevated
              label="Update Contact Person"
              color="primary"
              type="submit"
            />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { useQuasar } from "quasar";

const $q = useQuasar();

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

    $q.notify({
      type: "positive",
      message: "Contact person updated successfully!",
    });

    emit("contact-updated");
    closeDialog();
  } catch (error) {
    console.error("Error updating contact person:", error);
    $q.notify({
      type: "negative",
      message: "Failed to update contact person. Please try again.",
    });
  }
};

const closeDialog = () => {
  emit("update:modelValue", false);
};

const allowedControlKeys = new Set([
  "Backspace",
  "Delete",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "Tab",
]);

const onDigitsKeydown = (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return; // keep shortcuts
  if (allowedControlKeys.has(e.key)) return;
  if (e.key >= "0" && e.key <= "9") return;
  e.preventDefault();
};

const enforceDigits = (val, field) => {
  const digits = (val ?? "").toString().replace(/\D+/g, "");
  if (contact.value[field] !== digits) {
    contact.value[field] = digits;
  }
};

</script>
