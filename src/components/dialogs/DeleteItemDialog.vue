<template>
  <q-dialog v-model="modelValue" persistent>
    <q-card>
      <q-card-section class="text-h6 text-negative">Delete Item</q-card-section>
      <q-card-section>
        ⚠️ This will permanently delete
        <b>{{ selectedItem?.name }}</b> and its prices. Continue?
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="close" />
        <q-btn color="negative" label="Delete" @click="handleDelete" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { useQuasar } from "quasar";
import { deleteItem } from "@/../supabase/api/item_list.js";
import { supabase } from "@/../supabase/config.js";

const props = defineProps({
  modelValue: Boolean,
  selectedItem: Object,
  activeGroup: Number,
});

const emit = defineEmits(["update:modelValue", "deleted"]);

const $q = useQuasar();
const modelValue = ref(props.modelValue);
watch(() => props.modelValue, (val) => (modelValue.value = val));

async function getCurrentUserEmail() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email || "system";
}

async function handleDelete() {
  try {
    const userEmail = await getCurrentUserEmail();
    const success = await deleteItem(
      props.selectedItem,
      props.activeGroup,
      userEmail
    );
    if (success) {
      $q.notify({ type: "positive", message: "Item deleted successfully" });
      emit("deleted");
      close();
    }
  } catch (err) {
    console.error(err);
    $q.notify({ type: "negative", message: "Failed to delete item" });
  }
}

function close() {
  emit("update:modelValue", false);
}
</script>
