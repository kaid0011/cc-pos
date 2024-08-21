<template>
  <q-dialog v-model="innerValue" backdrop-filter="brightness(50%)">
    <q-card class="dialog-cards">
      <q-bar>
        <q-space></q-space>
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip class="bg-white text-primary">{{ $t("close") }}</q-tooltip>
        </q-btn>
      </q-bar>
      <q-card-section class="column items-center q-gutter-y-sm">
        <q-img :src="selectedItem?.imageUrl" style="height: 150px; width: 150px; object-fit: cover" />
        <div class="text-h6 text-center">{{ $t(`itemsList.${selectedItem?.name}`) }}</div>

        <div v-if="selectedItem?.laundry_price !== null" class="row items-center q-pa-sm">
          <div class="col-12 text-center q-pb-md">
            {{ $t("laundry") }} - ${{ selectedItem?.laundry_price.toFixed(2) }}
          </div>
          <q-btn push class="counter-buttons" icon="remove" @click="decreaseQuantity('Laundry')" />
          <q-input outlined v-model="quantities.Laundry" class="counter-input q-pa-none q-mx-md" />
          <q-btn push class="counter-buttons" icon="add" @click="increaseQuantity('Laundry')" />
        </div>

        <!-- Repeat similar blocks for other services -->

      </q-card-section>
      <q-card-actions>
        <q-btn class="full-width dialog-buttons" :label="$t('add_item')" color="primary" @click="addToTransaction" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  modelValue: Boolean,
  selectedItem: Object,
  quantities: Object
});

const emit = defineEmits(['update:modelValue', 'add-to-transaction']);

const { t } = useI18n();

const innerValue = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  innerValue.value = newVal;
});

watch(innerValue, (newVal) => {
  if (newVal !== props.modelValue) {
    emit('update:modelValue', newVal);
  }
});

const decreaseQuantity = (type) => {
  if (props.quantities[type] > 0) {
    props.quantities[type]--;
  }
};

const increaseQuantity = (type) => {
  props.quantities[type]++;
};

const addToTransaction = () => {
  emit('add-to-transaction');
};
</script>
