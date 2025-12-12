<!-- FILE: /src/components/dialogs/AddErrorReportDialog.vue -->
<template>
  <q-dialog v-model="innerModel" @show="onShow">
    <q-card style="min-width: 480px; max-width: 90vw">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">Add Error Report</div>
        <div class="row items-center q-mt-xs">
          <div class="text-caption">
            Order:
            <span class="text-weight-bold">
              <q-spinner v-if="orderNoLoading" size="14px" class="q-mr-xs" />
              #{{ orderNo || '-' }}
            </span>
          </div>
          <!-- <q-space />
          <q-btn
            v-if="orderNo"
            size="sm" flat dense round icon="open_in_new"
            :href="`/orders/${orderNo}`" target="_blank"
          /> -->
        </div>
        <q-btn icon="close" flat dense round class="absolute-top-right q-ma-sm" @click="close" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-px-md">
        <div class="row items-center q-mb-sm">
          <div class="col-4">Select Category:</div>
          <div class="col-8">
            <q-select
              square dense outlined class="bg-white"
              :options="reportCategories"
              v-model="selectedCategory"
              label="Select Category"
              @update:model-value="updateSubCategories"
            />
          </div>
        </div>

        <div class="row items-center q-mb-sm">
          <div class="col-4">Select Sub-category:</div>
          <div class="col-8">
            <q-select
              square dense outlined class="bg-white"
              :options="filteredSubCategories"
              v-model="selectedSubCategory"
              label="Select Sub-category"
            />
          </div>
        </div>

        <div class="row items-center q-mb-sm">
          <div class="col-4">Enter Item Description:</div>
          <div class="col-8">
            <textarea
              v-model="reportDesc"
              type="textarea"
              class="q-pa-sm report-desc full-width"
              placeholder="Enter item description here..."
            />
          </div>
        </div>

        <div class="row items-center q-mb-sm">
          <div class="col-4">Attach Photo (Optional):</div>
          <div class="col-8">
            <q-btn outline color="primary" label="Capture Photo" dense class="outline-btn q-mt-sm q-mr-sm" @click="openCameraDialog" />
            <q-btn dense flat icon="delete" color="red" v-if="uploadedPhotoUrl" @click="clearUploadedPhoto" label="Remove Photo" class="q-mt-sm" />
            <q-img v-if="uploadedPhotoUrl" :src="uploadedPhotoUrl" class="q-mt-sm" style="max-width: 300px; height: auto" />
          </div>
        </div>

        <q-dialog v-model="isCameraDialogOpen" persistent>
          <q-card style="max-width: 500px">
            <q-card-section class="dialog-header">
              <div class="text-h6">Capture Photo</div>
            </q-card-section>
            <q-card-section class="dialog-body">
              <video ref="videoElement" autoplay playsinline disablePictureInPicture class="camera-feed styled-camera" style="width:100%; max-height:60vh; background:#000; border-radius:8px"></video>
              <div align="right" class="q-mt-md">
                <q-btn label="Close" color="negative" @click="closeCameraDialog" />
                <q-btn color="primary" class="q-ml-sm" label="Capture" @click="capturePhoto" />
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-sm">
        <q-btn flat label="Cancel" color="negative" @click="close" />
        <q-btn label="Add Report" color="primary" @click="addErrorReport" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { Notify } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";
import { fetchAllErrorItems } from "@/../supabase/api/error_list.js";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  orderId: { type: [Number, String], required: true },
});
const emit = defineEmits(["update:modelValue", "added", "close"]);

const store = useTransactionStore();

const innerModel = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

/* Order no */
const orderNo = ref("");
const orderNoLoading = ref(false);

async function resolveOrderNo(force = false) {
  if (!props.orderId) { orderNo.value = ""; return; }
  if (orderNo.value && !force) return;
  orderNoLoading.value = true;
  try {
      orderNo.value = await store.fetchOrderNoByOrderId(props.orderId);
  } catch (_) {
    orderNo.value = "";
  } finally {
    orderNoLoading.value = false;
  }
}
function onShow() { resolveOrderNo(false); }
onMounted(() => resolveOrderNo(false));
watch(() => props.orderId, () => resolveOrderNo(true));

/* Category/subcategory */
const reportCategories = ref([]);
const reportSubCategories = ref([]);
const selectedCategory = ref("");
const selectedSubCategory = ref("");
const reportDesc = ref("");
const filteredSubCategories = computed(() => reportSubCategories.value);

async function loadCategories() {
  const items = await fetchAllErrorItems();
  const set = new Set(items.map((i) => i.category));
  reportCategories.value = Array.from(set);
  if (reportCategories.value.length && !selectedCategory.value) {
    selectedCategory.value = reportCategories.value[0];
    updateSubCategories(selectedCategory.value);
  }
}
function updateSubCategories(category) {
  fetchAllErrorItems()
    .then((items) => {
      reportSubCategories.value = items
        .filter((i) => i.category === category)
        .map((i) => i.sub_category);
      selectedSubCategory.value = "";
    })
    .catch(() => {});
}
onMounted(loadCategories);

/* Camera capture (optional) */
const uploadedPhotoUrl = ref(null);
const isCameraDialogOpen = ref(false);
const videoStream = ref(null);
const videoElement = ref(null);

async function openCameraDialog() {
  try {
    isCameraDialogOpen.value = true;
    await nextTick();
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoStream.value = stream;
    if (videoElement.value) videoElement.value.srcObject = stream;
  } catch (e) {
    Notify.create({ message: "Camera not available.", color: "red" });
    closeCameraDialog();
  }
}
function capturePhoto() {
  if (!videoElement.value) return;
  const canvas = document.createElement("canvas");
  canvas.width = videoElement.value.videoWidth || 640;
  canvas.height = videoElement.value.videoHeight || 480;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height);
  uploadedPhotoUrl.value = canvas.toDataURL("image/png");
  closeCameraDialog();
}
function closeCameraDialog() {
  if (videoStream.value) {
    try { videoStream.value.getTracks().forEach((t) => t.stop()); } catch (_) {}
    videoStream.value = null;
  }
  isCameraDialogOpen.value = false;
}
function clearUploadedPhoto() { uploadedPhotoUrl.value = null; }

/* Save */
async function addErrorReport() {
  try {
    if (!selectedCategory.value || !selectedSubCategory.value || !reportDesc.value) {
      Notify.create({ message: "Category, sub-category, and description are required.", color: "red" });
      return;
    }
    if (!props.orderId) {
      Notify.create({ message: "Order ID is missing.", color: "red" });
      return;
    }
    const payload = {
      order_id: props.orderId,
      category: selectedCategory.value,
      sub_category: selectedSubCategory.value,
      description: reportDesc.value,
      image: uploadedPhotoUrl.value || null,
    };
    const added = await store.addReport(payload, props.orderId);
    emit("added", { ...added, order_no: orderNo.value || added?.order_no || null });
    selectedCategory.value = "";
    selectedSubCategory.value = "";
    reportDesc.value = "";
    uploadedPhotoUrl.value = null;
    innerModel.value = false;
    Notify.create({ message: "Report added successfully!", color: "green" });
  } catch (e) {
    Notify.create({ message: "Failed to add report.", color: "red" });
  }
}
function close() { innerModel.value = false; emit("close"); }
</script>
