<template>
  <q-dialog v-model="modelValue" persistent>
    <q-card>
      <q-card-section class="text-h6">Reactivate Item</q-card-section>
      <q-card-section>
        Are you sure you want to reactivate <b>{{ selectedItem?.name }}</b>?
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="close" />
        <q-btn color="positive" label="Reactivate" @click="handleReactivate" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { useQuasar } from "quasar";
import { reactivateItem } from "@/../supabase/api/item_list.js";
import { supabase } from "@/../supabase/config.js";

const props = defineProps({
  modelValue: Boolean,
  selectedItem: Object,
  activeGroup: Number,
});

const emit = defineEmits(["update:modelValue", "reactivated"]);

const $q = useQuasar();
const modelValue = ref(props.modelValue);
watch(() => props.modelValue, (val) => (modelValue.value = val));

async function getCurrentUserEmail() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email || "system";
}

async function handleReactivate() {
  try {
    const userEmail = await getCurrentUserEmail();
    await reactivateItem(props.selectedItem.id, props.activeGroup, userEmail);
    $q.notify({ type: "positive", message: "Item reactivated" });
    emit("reactivated");
    close();
  } catch (err) {
    console.error(err);
    $q.notify({ type: "negative", message: "Failed to reactivate item" });
  }
}

function close() {
  emit("update:modelValue", false);
}
</script>
