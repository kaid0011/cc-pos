<template>
  <div class="row instructions-tab main-container">
    <!-- Instructions Section -->
    <div class="left-container col-6">
      <q-card flat class="card1">
        <div class="text-p text-center text-uppercase text-weight-bolder q-mb-sm">
          Instructions
        </div>
        <div class="row q-gutter-x-md">
          <div class="col-auto">
            <div>Enter Instructions:</div>
            <div class="q-pl-sm q-pt-sm">
              <div class="text-p">
                <span>
                  <q-radio
                    v-model="instructionsType"
                    checked-icon="task_alt"
                    unchecked-icon="panorama_fish_eye"
                    val="onetime"
                    dense
                  />
                </span>
                One-time
              </div>
              <div class="text-p">
                <span>
                  <q-radio
                    v-model="instructionsType"
                    checked-icon="task_alt"
                    unchecked-icon="panorama_fish_eye"
                    val="recurring"
                    dense
                  />
                </span>
                Recurring
              </div>
            </div>
          </div>
          <div class="col">
            <textarea
              v-model="instructionsDesc"
              type="textarea"
              class="q-pa-sm instructions-desc full-width"
              placeholder="Enter instruction here..."
            />
            <div class="q-gutter-sm">
              <q-checkbox
                v-model="instructionsTo"
                val="cleaning"
                label="Cleaning"
                color="teal"
              />
              <q-checkbox
                v-model="instructionsTo"
                val="packing"
                label="Packing"
                color="orange"
              />
              <q-checkbox
                v-model="instructionsTo"
                val="pickingsending"
                label="Picking/Sending"
                color="red"
              />
              <q-checkbox
                v-model="instructionsTo"
                val="admin"
                label="Admin"
                color="cyan"
              />
            </div>
            <q-btn
              color="primary"
              label="Add Instruction"
              class="float-right q-mt-sm"
              @click="addInstruction"
            />
          </div>
        </div>
      </q-card>

      <q-card flat class="card2 q-mt-md">
        <div v-if="transactionStore.displayInstructions.length > 0">
          <div
            v-for="displayInstruction in transactionStore.displayInstructions"
            :key="displayInstruction.id"
            class="row justify-between per-instruction q-mb-sm"
          >
            <div>
              <div class="text-p">
                <span>
                  <q-icon
                    name="circle"
                    color="primary"
                    size="8px"
                    class="q-mr-sm q-ml-md"
                  />
                </span>
                {{ displayInstruction.description }}
              </div>
              <div class="instruction-chips q-ml-lg">
                <q-chip
                  square
                  :color="
                  displayInstruction.type === 'onetime' ? 'purple-10' : 'pink-10'
                  "
                  text-color="white"
                  class="instructions-type"
                >
                  {{
                    displayInstruction.type === "onetime" ? "One-time" : "Recurring"
                  }}
                </q-chip>
                <span> | </span>
                <q-chip
                  v-for="section in displayInstruction.to"
                  :key="section"
                  :color="getSectionColor(section)"
                  text-color="white"
                  class="instructions-to"
                >
                  {{ formatSectionLabel(section) }}
                </q-chip>
              </div>
            </div>
          </div>
        </div>
        <q-separator class="q-mb-lg"/>
        <div v-if="transactionStore.instructions.length > 0">
          <div
            v-for="instruction in transactionStore.instructions"
            :key="instruction.id"
            class="row justify-between per-instruction q-mb-sm"
          >
            <div>
              <div class="text-p">
                <span>
                  <q-icon
                    name="circle"
                    color="primary"
                    size="8px"
                    class="q-mr-sm q-ml-md"
                  />
                </span>
                {{ instruction.description }}
              </div>
              <div class="instruction-chips q-ml-lg">
                <q-chip
                  square
                  :color="
                    instruction.type === 'onetime' ? 'purple-10' : 'pink-10'
                  "
                  text-color="white"
                  class="instructions-type"
                >
                  {{
                    instruction.type === "onetime" ? "One-time" : "Recurring"
                  }}
                </q-chip>
                <span> | </span>
                <q-chip
                  v-for="section in instruction.to"
                  :key="section"
                  :color="getSectionColor(section)"
                  text-color="white"
                  class="instructions-to"
                >
                  {{ formatSectionLabel(section) }}
                </q-chip>
              </div>
            </div>
            <q-btn
            dense
            flat
            icon="delete"
            color="red"
            @click="openDeleteDialog('instruction', instruction.id)"
          />
          </div>
        </div>
        <div v-else class="text-center text-grey">No instructions added.</div>
      </q-card>
    </div>

    <div class="right-container col-6">
      <!-- Error Reporting Section -->
      <q-card flat class="card3">
        <div class="text-p text-center text-uppercase text-weight-bolder q-mb-sm">
          Error Reporting
        </div>
        <div class="q-px-md">
          <div class="row items-center q-mb-sm">
            <div class="col-4">Select Category:</div>
            <div class="col-8">
              <q-select
                square
                dense
                outlined
                class="bg-white"
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
                square
                dense
                outlined
                class="bg-white"
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
              <!-- File Uploader -->
              <!-- <q-uploader
                ref="uploader"
                accept="image/*"
                label="Attach a photo"
                :auto-upload="false"
                @added="handleFileUpload"
                style="max-width: 300px"
              /> -->
              <!-- Capture Photo Button -->
              <q-btn
              outline
                color="primary"
                label="Click Here to Capture Photo"
                dense
                class="outline-btn q-mt-sm"
                @click="openCameraDialog"
              />
              <!-- Remove Photo Button -->
              <q-btn
                dense
                flat
                icon="delete"
                color="red"
                v-if="uploadedPhotoUrl"
                @click="clearUploadedPhoto"
                label="Remove Photo"
                class="q-mt-xs"
              />
              <!-- Display Captured Photo -->
              <q-img
                v-if="uploadedPhotoUrl"
                :src="uploadedPhotoUrl"
                class="q-mt-sm"
                style="max-width: 300px; height: auto;"
              />
            </div>
          
            <!-- Camera Dialog -->
            <q-dialog v-model="isCameraDialogOpen" persistent>
              <q-card style="max-width: 500px;">
                <q-card-section class="dialog-header">
                  <div class="text-h6">Capture Photo</div>
                </q-card-section>
                <q-card-section class="dialog-body">
                  <!-- Add a ref to link the video element -->
                  <video ref="videoElement" autoplay playsinline disablePictureInPicture class="camera-feed styled-camera"></video>
                  <div align="right" class="q-mt-md">
                    <q-btn label="Close" color="negative" @click="closeCameraDialog" />
                    <q-btn color="primary" class="q-ml-sm" label="Capture" @click="capturePhoto" />
                  </div>
                </q-card-section>
              </q-card>
            </q-dialog>
            
          </div>
          
        </div>
        <div class="row">
          <div class="full-width">
            <q-btn
              color="primary"
              label="Add Report"
              class="float-right q-mt-sm"
              @click="addErrorReport"
            />
          </div>
        </div>
      </q-card>

      <q-card flat class="card4 q-mt-md">
        <div v-if="transactionStore.reports.length > 0">
          <div
            v-for="report in transactionStore.reports"
            :key="report.id"
            class="row justify-between per-report"
          >
            <div>
              <div class="text-p">
                <span>
                  <q-icon
                    name="circle"
                    color="primary"
                    size="8px"
                    class="q-mr-sm q-ml-md"
                  />
                </span>
                {{ report.description }}
              </div>
              <div class="q-ml-xl text-weight-bold text-red">
                {{ report.category }} - {{ report.sub_category }}
              </div>
              <q-img
              v-if="report.image"
              :src="report.image"
              class="q-mt-sm q-ml-lg"
              style="max-width: 200px; height: auto"
            />
            
            </div>
            <q-btn
            dense
            flat
            icon="delete"
            color="red"
            @click="openDeleteDialog('report', report.id)"
          />
          </div>
        </div>
        <div v-else class="text-center text-grey">No error reports added.</div>
      </q-card>

      <!-- Stepper Navigation -->
      <!-- <q-stepper-navigation>
        <div class="row justify-between">
          <q-btn @click="$emit('back')" color="primary" label="Back" />
          <div>
            <q-btn flat color="primary" label="Reset" class="q-ml-sm" />
            <q-btn @click="$emit('next')" color="primary" label="Continue" />
          </div>
        </div>
      </q-stepper-navigation> -->
    </div>
    <q-dialog v-model="isDeleteDialogOpen" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="warning" color="red" size="32px" />
          <div class="q-ml-sm text-h6">Are you sure you want to delete this item?</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Cancel" color="primary" @click="isDeleteDialogOpen = false" />
          <q-btn label="Delete" color="negative" @click="confirmDeleteItem" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { fetchAllErrorItems } from "@/../supabase/api/error_list.js";

const transactionStore = useTransactionStore();

const uploadedPhotoUrl = ref(null); // Holds the uploaded photo's URL
const uploader = ref(null); // Reference for the q-uploader
const localReports = ref([]); // Array to store reports locally

const instructionsType = ref("onetime");
const instructionsDesc = ref("");
const instructionsTo = ref([]);

const reportCategories = ref([]);
const reportSubCategories = ref([]);
const reportDesc = ref("");

const selectedCategory = ref("");
const selectedSubCategory = ref("");

// Functions to add/delete instructions and reports
function addInstruction() {
  if (!instructionsDesc.value.trim()) {
    console.error("Instruction description is required.");
    return;
  }

  if (instructionsTo.value.length === 0) {
    console.error("At least one instruction category must be selected.");
    return;
  }

  const newInstruction = {
    id: Date.now(),
    type: instructionsType.value,
    description: instructionsDesc.value.trim(),
    to: [...instructionsTo.value],
  };

  try {
    transactionStore.addInstruction(newInstruction);

    // Reset input fields after successful addition
    instructionsType.value = "onetime";
    instructionsDesc.value = "";
    instructionsTo.value = [];
    console.log("Instruction added successfully:", newInstruction);
  } catch (error) {
    console.error("Error adding instruction to the store:", error);
  }
}

function deleteInstruction(id) {
  // Check if the instruction exists in the store
  const instructionIndex = transactionStore.instructions.findIndex((instruction) => instruction.id === id);
  if (instructionIndex > -1) {
    // Remove the instruction from the transaction store
    transactionStore.instructions.splice(instructionIndex, 1);
    console.log(`Instruction with ID ${id} deleted successfully.`);
  } else {
    console.error(`Instruction with ID ${id} not found.`);
  }
}


function addErrorReport() {
  if (reportDesc.value && selectedCategory.value && selectedSubCategory.value) {
    transactionStore.addReport({
      id: Date.now(), // Unique ID
      category: selectedCategory.value,
      sub_category: selectedSubCategory.value,
      description: reportDesc.value,
      image: uploadedPhotoUrl.value || null, // Add photo URL if uploaded
    });

    // Reset fields after adding the report
    reportDesc.value = "";
    selectedCategory.value = "";
    selectedSubCategory.value = "";
    uploadedPhotoUrl.value = null; // Clear uploaded photo URL

    // Reset the uploader
    if (uploader.value) {
      uploader.value.reset();
    }
  } else {
    console.error("All fields must be filled to add a report.");
  }
}

function deleteReport(id) {
  // Check if the report exists in the store
  const reportIndex = transactionStore.reports.findIndex((report) => report.id === id);
  if (reportIndex > -1) {
    // Remove the report from the transaction store
    transactionStore.reports.splice(reportIndex, 1);
    console.log(`Report with ID ${id} deleted successfully.`);
  } else {
    console.error(`Report with ID ${id} not found.`);
  }
}


// Load report categories and sub-categories on mount
onMounted(async () => {
  const items = await fetchAllErrorItems();
  const categoriesSet = new Set(items.map((item) => item.category));
  reportCategories.value = Array.from(categoriesSet);

  if (reportCategories.value.length > 0) {
    selectedCategory.value = reportCategories.value[0];
    updateSubCategories(selectedCategory.value);
  }
});


// Function to update sub-categories based on the selected category
async function updateSubCategories(category) {
  const items = await fetchAllErrorItems(); // Fetch error items if not in memory
  reportSubCategories.value = items
    .filter((item) => item.category === category)
    .map((item) => item.sub_category);
  selectedSubCategory.value = ""; // Reset selected sub-category
}

// Watch for changes in `selectedCategory` and update sub-categories
watch(selectedCategory, (newCategory) => {
  if (newCategory) {
    updateSubCategories(newCategory);
  }
});

// Computed property to filter sub-categories based on selected category
const filteredSubCategories = computed(() => {
  return reportSubCategories.value;
});

// Utility methods
function getSectionColor(section) {
  return (
    {
      cleaning: "teal",
      packing: "orange",
      pickingsending: "red",
      admin: "cyan",
    }[section] || "grey"
  );
}

function formatSectionLabel(section) {
  return (
    {
      cleaning: "Cleaning",
      packing: "Packing",
      pickingsending: "Picking/Sending",
      admin: "Admin",
    }[section] || section
  );
}
// function handleFileUpload(files) {
//   if (files.length === 0) {
//     console.error("No file uploaded.");
//     return;
//   }

//   const file = files[0]; // Get the first file from the array

//   const reader = new FileReader();
//   reader.onload = (event) => {
//     uploadedPhotoUrl.value = event.target.result; // Base64 URL of the uploaded photo
//   };

//   reader.readAsDataURL(file); // Read file as a data URL
// }

// Reactive variables
const videoStream = ref(null); // Video stream for the camera
const isCameraDialogOpen = ref(false); // Tracks if the camera dialog is open
const videoElement = ref(null); // Reference to the video element

/**
 * Opens the camera dialog and initializes the video stream.
 */
async function openCameraDialog() {
  try {
    // Ensure the video element is available after DOM updates
    isCameraDialogOpen.value = true; // Open the dialog
    await nextTick(); // Wait for the dialog to render

    // Access the user's camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoStream.value = stream;

    // Attach the video stream to the video element
    if (videoElement.value) {
      videoElement.value.srcObject = stream;
    } else {
      console.error("Video element is not available.");
    }
  } catch (error) {
    console.error("Error accessing the camera:", error);
    closeCameraDialog();
  }
}

/**
 * Captures a photo from the camera feed and stores it as a Base64 URL.
 */
function capturePhoto() {
  try {
    if (!videoElement.value) {
      console.error("Video element is not available.");
      return;
    }

    // Create a canvas element to capture the current frame from the video
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.value.videoWidth;
    canvas.height = videoElement.value.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height);

    // Convert the canvas to a Base64 image URL
    uploadedPhotoUrl.value = canvas.toDataURL("image/png");

    // Close the camera dialog after capturing
    closeCameraDialog();
    console.log("Photo captured successfully!");
  } catch (error) {
    console.error("Error capturing photo:", error);
  }
}

/**
 * Closes the camera dialog and stops the video stream.
 */
function closeCameraDialog() {
  if (videoStream.value) {
    const tracks = videoStream.value.getTracks();
    tracks.forEach((track) => track.stop()); // Stop all tracks
    videoStream.value = null;
  }
  isCameraDialogOpen.value = false; // Close the dialog
}

/**
 * Clears the uploaded or captured photo.
 */
function clearUploadedPhoto() {
  uploadedPhotoUrl.value = null; // Reset the photo URL
  if (uploader.value) {
    uploader.value.reset(); // Reset the uploader
  }
  closeCameraDialog(); // Ensure the camera is closed
}

const isDeleteDialogOpen = ref(false);
const deleteTarget = ref({ type: null, id: null }); // Store the type (instruction or report) and id

function openDeleteDialog(type, id) {
  deleteTarget.value = { type, id };
  isDeleteDialogOpen.value = true;
}

// Reuse the existing openDeleteDialog and confirmDeleteItem for instructions and reports.
function confirmDeleteItem() {
  const { type, id } = deleteTarget.value;

  if (type === "instruction") {
    deleteInstruction(id);
  } else if (type === "report") {
    deleteReport(id);
  }

  isDeleteDialogOpen.value = false;
  deleteTarget.value = { type: null, id: null };
}

</script>
