<template>
  <q-dialog v-model="innerValue">
    <q-card>
      <q-bar>
        <q-space></q-space>
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip class="bg-white text-primary">{{ t("close") }}</q-tooltip>
        </q-btn>
      </q-bar>
      <q-card-section>
        <div class="upload-image flex items-end q-col-gutter-sm">
          <div class="col auto-width">
            <q-file 
              :model-value="localCurrentImage" 
              @update:model-value="updateCurrentImage" 
              :label="t('click_here')" 
              dense 
              clearable 
              required 
              class="upload-input q-pa-none"
            >
              <template v-slot:prepend>
                <q-icon name="cloud_upload" @click.stop.prevent></q-icon>
              </template>
            </q-file>
            <div class="text-caption text-uppercase">{{ t("click_upload") }}</div>
          </div>
          <div class="col-1">
            <q-btn dense flat class="bg-pink-10 text-white rounded-borders" icon="photo_camera" @click="openCamera"></q-btn>
            <div class="text-caption text-uppercase">{{ t("camera") }}</div>
          </div>
          <div class="col-1">
            <q-btn dense flat class="bg-orange-10 text-white rounded-borders" icon="visibility" @click="viewImage"></q-btn>
            <div class="text-caption text-uppercase">{{ t("view") }}</div>
          </div>
        </div>
      </q-card-section>
      <q-card-actions>
        <q-btn class="full-width dialog-buttons" :label="t('add_details')" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  modelValue: Boolean,
  currentImage: File,
  photoUri: String
});

const emit = defineEmits(['update:modelValue', 'open-camera', 'view-image', 'update:currentImage']);

const innerValue = ref(props.modelValue);
const localCurrentImage = ref(props.currentImage);

watch(() => props.modelValue, (newVal) => {
  innerValue.value = newVal;
});

watch(innerValue, (newVal) => {
  if (newVal !== props.modelValue) {
    emit('update:modelValue', newVal);
  }
});

watch(() => props.currentImage, (newVal) => {
  localCurrentImage.value = newVal;
});

watch(localCurrentImage, (newVal) => {
  if (newVal !== props.currentImage) {
    emit('update:currentImage', newVal);
  }
});

const openCamera = () => {
  emit('open-camera');
};

const viewImage = () => {
  emit('view-image');
};

const updateCurrentImage = (newImage) => {
  localCurrentImage.value = newImage;
};
</script>
