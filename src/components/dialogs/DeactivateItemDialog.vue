<template>
  <q-dialog v-model="modelValue" persistent>
    <q-card>
      <q-card-section class="text-h6">Deactivate Item</q-card-section>
      <q-card-section>
        Are you sure you want to deactivate <b>{{ selectedItem?.name }}</b>?
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="close" />
        <q-btn color="negative" label="Deactivate" @click="handleDeactivate" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { useQuasar } from "quasar";
import { deactivateItem } from "@/../supabase/api/item_list.js";
import { supabase } from "@/../supabase/config.js";

const props = defineProps({
  modelValue: Boolean,
  selectedItem: Object,
  activeGroup: Number,
});

const emit = defineEmits(["update:modelValue", "deactivated"]);

const $q = useQuasar();
const modelValue = ref(props.modelValue);
watch(() => props.modelValue, (val) => (modelValue.value = val));

async function getCurrentUserEmail() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email || "system";
}

async function handleDeactivate() {
  try {
    const userEmail = await getCurrentUserEmail();
    await deactivateItem(props.selectedItem.id, props.activeGroup, userEmail);
    $q.notify({ type: "positive", message: "Item deactivated" });
    emit("deactivated");
    close();
  } catch (err) {
    console.error(err);
    $q.notify({ type: "negative", message: "Failed to deactivate item" });
  }
}

function close() {
  emit("update:modelValue", false);
}
</script>
