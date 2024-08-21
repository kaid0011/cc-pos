<template>
  <q-dialog v-model="innerValue" persistent>
    <q-card>
      <q-bar>
        <q-space></q-space>
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip class="bg-white text-primary">{{ $t("close") }}</q-tooltip>
        </q-btn>
      </q-bar>
      <q-card-section>
        <div v-if="photoUri">
          <img :src="photoUri" alt="Captured Photo" style="max-width: 100%" />
        </div>
        <div v-else>No photo to display</div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  photoUri: String
});

const emit = defineEmits(['update:modelValue']);

const innerValue = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  innerValue.value = newVal;
});

watch(innerValue, (newVal) => {
  if (newVal !== props.modelValue) {
    emit('update:modelValue', newVal);
  }
});
</script>
