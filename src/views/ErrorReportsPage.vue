<!-- FILE: /src/pages/ErrorReportsPage.vue -->
<template>
  <div class="row justify-center page-title-header text-uppercase">
    Error Reports
  </div>

  <div class="full-container orders-history">
    <!-- Search -->
    <div class="flex justify-between q-mb-md">
      <div>
        <div class="dialog-label">
          <div class="text-weight-bold text-subtitle2">Search Here...</div>
        </div>
        <q-input
          class="search-transactions search-input"
          v-model="searchQuery"
          outlined dense debounce="300"
        >
          <template v-slot:prepend><q-icon name="search" /></template>
          <template v-slot:append>
            <q-icon
              v-if="searchQuery"
              name="close"
              class="cursor-pointer q-ml-sm"
              @click="searchQuery = ''"
            />
          </template>
        </q-input>
      </div>
      <!-- Add Report button -->
      <div>
        <q-btn
          color="primary"
          icon="add"
          label="Add Report"
          unelevated
          @click="openOrderPicker()"
        />
      </div>
    </div>

    <!-- Table Display -->
    <div class="row-col-table">
      <div class="row row-col-header text-center">
        <div class="col-2 bordered text-weight-bolder">Order No.</div>
        <div class="col-2 bordered text-weight-bolder">Category</div>
        <div class="col-2 bordered text-weight-bolder">Sub-category</div>
        <div class="col-4 bordered text-weight-bolder">Description</div>
        <div class="col-2 bordered text-weight-bolder">Status</div>
      </div>

      <div
        v-if="paginatedReports.length === 0"
        class="text-center text-grey q-pa-lg text-h6"
      >
        {{ loading ? 'Loading error reports…' : 'No error reports found.' }}
      </div>

      <div v-else v-for="(report, idx) in paginatedReports" :key="report.id || idx">
        <div class="row row-col-row line-height-1">
          <div class="col-2 bordered">
            <q-btn
              outline color="blue-8" dense
              class="text-weight-bold bg-blue-1 text-subtitle1 full-width"
              :disable="!report.order_no || report.order_no === '-'"
              @click="openOrderTab(report.order_no)"
            >
              {{ report.order_no || '-' }}
            </q-btn>
          </div>
          <div class="col-2 bordered">
            <div class="text-weight-bold text-uppercase">{{ report.category || '-' }}</div>
          </div>
          <div class="col-2 bordered">
            <div class="text-weight-bold text-uppercase">{{ report.sub_category || '-' }}</div>
          </div>
          <div class="col-4 bordered">
            <div class="q-pr-sm">{{ report.description || '-' }}</div>
          </div>
          <div class="col-2 bordered">
            <div
              :class="[
                'text-weight-bold','text-subtitle1','text-center','q-py-xs','line-height-1','text-uppercase',
                statusBadgeClass(report.status),
              ]"
              style="border-style: solid; border-width: 1px"
            >
              {{ report.status || '-' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="row justify-center q-mt-md">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="10"
        boundary-numbers
        direction-links
      />
    </div>
  </div>

  <!-- Order Picker: Manual / Scan QR / Upload QR -->
  <q-dialog v-model="showOrderPicker" persistent @hide="stopQrScanner">
    <q-card style="min-width: 560px; max-width: 92vw">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">Select Order</div>
        <q-btn icon="close" flat dense round class="absolute-top-right q-ma-sm" @click="showOrderPicker = false" />
      </q-card-section>

      <q-card-section>
        <q-tabs v-model="orderPickerTab" dense align="left" class="text-primary" @update:model-value="onOrderTabChanged">
          <q-tab name="manual" label="Enter Order No" />
          <q-tab name="qr" label="Scan QR" />
          <q-tab name="upload" label="Upload QR" />
        </q-tabs>
        <q-separator />

        <q-tab-panels v-model="orderPickerTab" animated>
          <!-- Manual -->
          <q-tab-panel name="manual" class="q-pt-md">
            <div class="q-mb-sm">Enter Order No:</div>
            <q-input
              v-model="orderNoInput"
              outlined dense
              placeholder="e.g. OR-2025-000123"
              :loading="validatingOrder"
              @keyup.enter="validateAndProceedManual"
            >
              <template v-slot:append>
                <q-btn flat dense color="primary" label="Use" :disable="!orderNoInput" @click="validateAndProceedManual" />
              </template>
            </q-input>
            <div v-if="orderMeta" class="q-mt-sm text-caption text-grey-7">
              Selected: <span class="text-weight-bold">{{ orderMeta?.order_no }}</span>
              — Customer: {{ orderMeta?.customer?.name || '-' }}
            </div>
          </q-tab-panel>

          <!-- Scan QR (camera) -->
          <q-tab-panel name="qr" class="q-pt-md">
            <q-banner v-if="!hasGetUserMedia" class="bg-yellow-1 text-orange-10 q-mb-sm" rounded>
              <q-icon name="warning" class="q-mr-sm" />
              Camera access is not available in this browser/device. Use <b>Upload QR</b> or <b>Enter Order No</b>.
            </q-banner>

            <div v-else>
              <div class="row q-col-gutter-sm q-mb-sm">
                <div class="col">
                  <q-select
                    v-model="selectedDeviceId"
                    :options="cameraOptions"
                    option-label="label"
                    option-value="value"
                    outlined dense
                    label="Camera"
                    :loading="enumeratingDevices"
                    emit-value map-options
                  />
                </div>
                <div class="col-auto flex items-center q-gutter-sm">
                  <q-btn
                    color="primary" dense
                    :label="qrRunning ? 'Scanning…' : 'Start Scan'"
                    :disable="qrRunning || !selectedDeviceId"
                    @click="startQrScanner"
                  />
                  <q-btn
                    color="negative" outline dense
                    label="Stop"
                    :disable="!qrRunning"
                    @click="stopQrScanner"
                  />
                </div>
              </div>

              <div>
                <video
                  ref="videoEl"
                  autoplay playsinline muted
                  style="width:100%; max-height:60vh; background:#000; border-radius:8px"
                ></video>
              </div>

              <div v-if="qrError" class="text-negative text-caption q-mt-xs">
                {{ qrError }}
              </div>
            </div>
          </q-tab-panel>

          <!-- Upload QR (image) -->
          <q-tab-panel name="upload" class="q-pt-md">
            <div class="q-mb-sm">Upload an image containing a QR code:</div>
            <q-file
              v-model="qrFile"
              accept="image/*"
              outlined dense
              label="Choose image..."
              clearable
              @update:model-value="onQrFilePicked"
            >
              <template v-slot:prepend><q-icon name="upload" /></template>
            </q-file>
            <div v-if="uploadPreviewUrl" class="q-mt-sm">
              <q-img :src="uploadPreviewUrl" style="max-width: 280px; max-height: 280px" />
            </div>
            <div v-if="uploadError" class="text-negative text-caption q-mt-xs">
              {{ uploadError }}
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat color="negative" label="Cancel" @click="showOrderPicker = false" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Add Report Dialog -->
  <AddErrorReportDialog
    v-model="showAddReportDialog"
    :order-id="selectedOrderId"
    @added="onReportAdded"
  />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from "vue";
import { useQuasar } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";
import AddErrorReportDialog from "@/components/dialogs/AddErrorReportDialog.vue";

/* Store + list */
const $q = useQuasar();
const transactionStore = useTransactionStore();
const loading = ref(false);
const rawReports = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

onMounted(async () => {
  loading.value = true;
  try {
    const data = await transactionStore.fetchAllErrorReports();
    rawReports.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching error reports:", error);
    $q.notify({ type: "negative", message: "Failed to load error reports." });
  } finally {
    loading.value = false;
  }
});

/* Pagination */
const normalizedReports = computed(() =>
  rawReports.value.map((r, idx) => ({
    id: r?.id ?? idx,
    order_no: str(r?.order_no) || "-",
    category: str(r?.category) || "-",
    sub_category: str(r?.sub_category) || "-",
    description: str(r?.description) || "-",
    status: str(r?.status) || "-",
  }))
);
const filteredReports = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return normalizedReports.value;
  return normalizedReports.value.filter((r) =>
    [r.order_no, r.category, r.sub_category, r.description, r.status]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
});
const paginatedReports = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredReports.value.slice(start, end);
});
const totalPages = computed(() => Math.max(1, Math.ceil(filteredReports.value.length / pageSize.value)));

/* Helpers */
function openOrderTab(orderNo) {
  if (!orderNo || orderNo === "-") return;
  window.open(`/orders/${orderNo}`, "_blank");
}
function str(v) { return v == null ? "" : String(v).trim(); }
function statusBadgeClass(status) {
  const s = str(status).toLowerCase();
  if (s === "flagged") return "mark-red";
  if (s === "under review") return "mark-yellow";
  if (s === "resolved") return "mark-green";
  if (s === "closed") return "mark-blue";
  return "";
}

/* ===== Add Report flow ===== */
const showOrderPicker = ref(false);
const orderPickerTab = ref("manual");
const orderNoInput = ref("");
const validatingOrder = ref(false);
const orderMeta = ref(null);
const selectedOrderId = ref(null);
const showAddReportDialog = ref(false);

function openOrderPicker() {
  resetOrderPicker();
  showOrderPicker.value = true;
}
function resetOrderPicker() {
  orderPickerTab.value = "manual";
  orderNoInput.value = "";
  validatingOrder.value = false;
  orderMeta.value = null;
  selectedOrderId.value = null;
  stopQrScanner();
  qrFile.value = null;
  uploadPreviewUrl.value = "";
  uploadError.value = "";
}

async function validateAndProceedManual() {
  const orderNo = (orderNoInput.value || "").trim();
  if (!orderNo) return;
  try {
    validatingOrder.value = true;
    const details = await transactionStore.fetchWholeOrderByOrderNo(orderNo);
    if (!details || !details.order?.id) {
      $q.notify({ type: "negative", message: "Order not found." });
      return;
    }
    orderMeta.value = { order_no: details.order.order_no, customer: details.customer || null };
    selectedOrderId.value = details.order.id;
    showOrderPicker.value = false;
    showAddReportDialog.value = true;
  } catch (e) {
    console.error("[validateAndProceedManual] error", e);
    $q.notify({ type: "negative", message: "Failed to validate order." });
  } finally {
    validatingOrder.value = false;
  }
}

/* ===== Cross-browser QR using ZXing (strict QR + try-harder) ===== */
let ZXBrowser = null;
let ZXLib = null;
async function ensureZX() {
  if (!ZXBrowser) ZXBrowser = await import("@zxing/browser");
  if (!ZXLib) ZXLib = await import("@zxing/library");
  return { ZXBrowser, ZXLib };
}
const hasGetUserMedia = computed(() => typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia);

/* Camera list */
const enumeratingDevices = ref(false);
const cameraOptions = ref([]); // [{label, value}]
const selectedDeviceId = ref(null);

async function enumerateCameras() {
  if (!hasGetUserMedia.value) return;
  try {
    enumeratingDevices.value = true;
    const { ZXBrowser: ZB } = await ensureZX();
    // Permissions prompt improves labels on some browsers
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (_) {}
    const devices = await ZB.BrowserMultiFormatReader.listVideoInputDevices();
    cameraOptions.value = devices.map((d, i) => ({
      label: d.label || `Camera ${i + 1}`,
      value: d.deviceId,
    }));
    if (!selectedDeviceId.value && cameraOptions.value.length) {
      selectedDeviceId.value = cameraOptions.value[0].value;
    }
  } catch (e) {
    console.error("[enumerateCameras] error", e);
  } finally {
    enumeratingDevices.value = false;
  }
}

/* Scanner state */
const videoEl = ref(null);
const qrRunning = ref(false);
const qrError = ref("");
let reader = null;

async function startQrScanner() {
  if (!hasGetUserMedia.value) {
    qrError.value = "Camera is not available on this device.";
    return;
  }
  try {
    qrError.value = "";
    const { ZXBrowser: ZB, ZXLib: ZL } = await ensureZX();

    // Build strict QR + try-harder hints
    const hints = new Map();
    hints.set(ZL.DecodeHintType.POSSIBLE_FORMATS, [ZL.BarcodeFormat.QR_CODE]);
    hints.set(ZL.DecodeHintType.TRY_HARDER, true);

    if (!reader) {
      // pass hints + small delay between scans
      reader = new ZB.BrowserMultiFormatReader(hints, 200);
    } else {
      reader.reset();
      // @ts-ignore: re-assign when supported
      reader.hints = hints;
    }

    const deviceId = selectedDeviceId.value || undefined;
    qrRunning.value = true;

    await nextTick();
    await reader.decodeFromVideoDevice(
      deviceId,
      videoEl.value,
      async (result, err, controls) => {
        if (!qrRunning.value) return;
        if (result && typeof result.getText === "function") {
          qrRunning.value = false;
          try { controls?.stop(); } catch (_) {}
          await onQrDecoded(result.getText());
        } else if (err) {
          // ignore transient decode errors
        }
      }
    );
  } catch (e) {
    console.error("[startQrScanner] error", e);
    qrError.value = "Failed to start camera scanner.";
    stopQrScanner();
  }
}

function stopQrScanner() {
  qrRunning.value = false;
  try { reader?.reset(); } catch (_) {}
  reader = null;
}

async function onQrDecoded(payload) {
  try {
    const orderNo = String(payload || "").trim();
    if (!orderNo) return;
    orderNoInput.value = orderNo;
    validatingOrder.value = true;

    const details = await transactionStore.fetchWholeOrderByOrderNo(orderNo);
    if (!details || !details.order?.id) {
      $q.notify({ type: "negative", message: `Order not found for QR: ${orderNo}` });
      return;
    }
    orderMeta.value = { order_no: details.order.order_no, customer: details.customer || null };
    selectedOrderId.value = details.order.id;

    showOrderPicker.value = false;
    showAddReportDialog.value = true;
  } catch (e) {
    console.error("[onQrDecoded] error", e);
    $q.notify({ type: "negative", message: "Failed to validate QR order." });
  } finally {
    validatingOrder.value = false;
  }
}

function onOrderTabChanged(tab) {
  if (tab === "qr") {
    enumerateCameras();
  } else {
    stopQrScanner();
  }
}

onBeforeUnmount(() => {
  stopQrScanner();
});

/* ===== Upload QR (image) with robust fallback ===== */
const qrFile = ref(null);
const uploadPreviewUrl = ref("");
const uploadError = ref("");

async function onQrFilePicked(file) {
  uploadError.value = "";
  uploadPreviewUrl.value = "";
  if (!file) return;

  const url = URL.createObjectURL(file);
  uploadPreviewUrl.value = url;

  try {
    const { ZXBrowser: ZB, ZXLib: ZL } = await ensureZX();
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      try {
        // 1) Fast path: QR-only reader
        try {
          const qrReader = new ZB.BrowserQRCodeReader();
          const res = await qrReader.decodeFromImageElement(img);
          if (res?.getText) {
            await onQrDecoded(res.getText());
            URL.revokeObjectURL(url);
            return;
          }
        } catch (_) {
          // fall through
        }

        // 2) Robust fallback: canvas -> luminance -> binary -> decode with hints
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        // scale down very large images to speed up & improve decode
        const maxSide = 1024;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        canvas.width = Math.max(1, Math.floor(img.width * scale));
        canvas.height = Math.max(1, Math.floor(img.height * scale));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const luminanceSource = new ZB.HTMLCanvasElementLuminanceSource(canvas);
        // If ^ not exported in your version, fallback to library path below:
        // const luminanceSource = new ZL.RGBLuminanceSource(imageData.data, canvas.width, canvas.height);

        // Prefer library's path:
        const source = new ZL.RGBLuminanceSource(imageData.data, canvas.width, canvas.height);
        const bitmap = new ZL.BinaryBitmap(new ZL.HybridBinarizer(source));

        const hints = new Map();
        hints.set(ZL.DecodeHintType.POSSIBLE_FORMATS, [ZL.BarcodeFormat.QR_CODE]);
        hints.set(ZL.DecodeHintType.TRY_HARDER, true);

        const mfReader = new ZL.MultiFormatReader();
        mfReader.setHints(hints);

        const result = mfReader.decode(bitmap);
        if (result?.getText) {
          await onQrDecoded(result.getText());
        } else {
          uploadError.value = "No QR detected in the image.";
        }
      } catch (e) {
        uploadError.value = "Unable to decode QR from this image.";
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      uploadError.value = "Invalid image file.";
      URL.revokeObjectURL(url);
    };
    img.src = url;
  } catch (e) {
    console.error("[onQrFilePicked] error", e);
    uploadError.value = "QR decoding module failed to load.";
    URL.revokeObjectURL(url);
  }
}

/* When Add dialog returns a new report */
function onReportAdded(newReport) {
  try {
    rawReports.value.unshift({
      id: newReport?.id ?? Date.now(),
      order_no: newReport?.order_no ?? orderMeta.value?.order_no ?? "-",
      category: newReport?.category ?? "",
      sub_category: newReport?.sub_category ?? "",
      description: newReport?.description ?? "",
      status: newReport?.status ?? "flagged",
    });
    $q.notify({ type: "positive", message: "Report added." });
  } catch {
    $q.notify({ type: "negative", message: "Failed to update table." });
  } finally {
    showAddReportDialog.value = false;
  }
}
</script>
