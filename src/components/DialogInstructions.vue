<template>
  <q-dialog v-model="innerValue" backdrop-filter="brightness(50%)">
    <q-card class="dialog-instructions">
      <q-bar>
        <q-space></q-space>
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip class="bg-white text-primary">{{ $t("close") }}</q-tooltip>
        </q-btn>
      </q-bar>
      <q-card-section class="column items-center q-gutter-y-md">
        <div class="full-width">
          <div class="text-caption text-uppercase">Instruction</div>
          <q-input v-model="localInstruction" filled lazy-rules class="full-width" />
        </div>
        <div class="q-gutter-x-sm">
          <q-checkbox dense v-model="localInstructionTo" label="Tagger" />
          <q-checkbox dense v-model="localInstructionTo" label="Packer" />
          <q-checkbox dense v-model="localInstructionTo" label="Admin" />
          <q-checkbox dense v-model="localInstructionTo" label="Collection" />
          <q-checkbox dense v-model="localInstructionTo" label="Delivery" />
        </div>
        <q-btn class="dialog-buttons" label="Add Instruction" color="secondary" v-close-popup />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div>
          <div class="text-p text-weight-bold text-uppercase">List of Instructions</div>
        </div>
      </q-card-section>
      <q-separator class="q-mt-md" />
      <q-card-actions>
        <q-btn class="full-width dialog-buttons" label="Submit Instructions" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  instruction: {
    type: String,
    default: ''
  },
  instruction_to: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue', 'update:instruction', 'update:instruction_to']);

const innerValue = ref(props.modelValue);
const localInstruction = ref(props.instruction);
const localInstructionTo = ref([...props.instruction_to]);

watch(() => props.modelValue, (newVal) => {
  innerValue.value = newVal;
});

watch(innerValue, (newVal) => {
  if (newVal !== props.modelValue) {
    emit('update:modelValue', newVal);
  }
});

watch(() => props.instruction, (newVal) => {
  localInstruction.value = newVal;
});

watch(localInstruction, (newVal) => {
  if (newVal !== props.instruction) {
    emit('update:instruction', newVal);
  }
});

watch(() => props.instruction_to, (newVal) => {
  localInstructionTo.value = [...newVal];
});

watch(localInstructionTo, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(props.instruction_to)) {
    emit('update:instruction_to', newVal);
  }
});
</script>
