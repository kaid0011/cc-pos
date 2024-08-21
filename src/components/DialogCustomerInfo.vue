<template>
  <q-dialog v-model="innerValue" backdrop-filter="brightness(50%)">
    <q-card class="dialog-customer">
      <q-bar>
        <q-space></q-space>
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip class="bg-white text-primary">{{ $t("close") }}</q-tooltip>
        </q-btn>
      </q-bar>
      <q-card-section class="column items-center q-gutter-y-md">
        <div class="full-width">
          <div class="text-caption text-uppercase">Customer Name</div>
          <q-input v-model="currentCustomer.name" filled lazy-rules class="full-width" />
        </div>
        <!-- Repeat similar blocks for other customer info fields -->
      </q-card-section>
      <q-card-actions>
        <q-btn class="full-width dialog-buttons" :label="$t('add_details')" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  currentCustomer: Object
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
