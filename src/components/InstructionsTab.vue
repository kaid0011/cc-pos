<template>
  <div class="row instructions-tab main-container">
    <!-- Instructions Section -->
    <div class="left-container col-6">
      <q-card flat class="card1">
        <div class="text-p text-center text-uppercase text-weight-bold q-mb-sm">
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
                {{ instruction.desc }}
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
              @click="deleteInstruction(instruction.id)"
            />
          </div>
        </div>
        <div v-else class="text-center text-grey">No instructions added.</div>
      </q-card>
    </div>

    <div class="right-container col-6">
      <!-- Error Reporting Section -->
      <q-card flat class="card3">
        <div class="text-p text-center text-uppercase text-weight-bold q-mb-sm">
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
              <q-uploader
              ref="uploader"
              accept="image/*"
              label="Attach a photo"
              :auto-upload="false"
              @added="handleFileUpload"
              style="max-width: 300px"
            />            
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
            </div>
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
                {{ report.desc }}
              </div>
              <div class="q-ml-xl text-weight-bold text-red">
                {{ report.category }} - {{ report.subCategory }}
              </div>
              <q-img
              v-if="report.photo"
              :src="report.photo"
              class="q-mt-sm q-ml-lg"
              style="max-width: 200px; height: auto"
            />
            
            </div>
            <q-btn
              dense
              flat
              icon="delete"
              color="red"
              @click="deleteReport(report.id)"
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
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
  if (instructionsDesc.value && instructionsTo.value.length) {
    transactionStore.addInstruction({
      id: Date.now(),
      type: instructionsType.value,
      desc: instructionsDesc.value,
      to: [...instructionsTo.value],
    });
    instructionsType.value = "onetime";
    instructionsDesc.value = "";
    instructionsTo.value = [];
  }
}

function deleteInstruction(id) {
  transactionStore.deleteInstruction(id);
}

function addErrorReport() {
  if (reportDesc.value && selectedCategory.value && selectedSubCategory.value) {
    transactionStore.addReport({
      id: Date.now(), // Unique ID
      category: selectedCategory.value,
      subCategory: selectedSubCategory.value,
      desc: reportDesc.value,
      photo: uploadedPhotoUrl.value || null, // Add photo URL if uploaded
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
  // Remove report from local list by its unique ID
  localReports.value = localReports.value.filter((report) => report.id !== id);
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
function handleFileUpload(files) {
  if (files.length === 0) {
    console.error("No file uploaded.");
    return;
  }

  const file = files[0]; // Get the first file from the array

  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedPhotoUrl.value = event.target.result; // Base64 URL of the uploaded photo
  };

  reader.readAsDataURL(file); // Read file as a data URL
}

function clearUploadedPhoto() {
  uploadedPhotoUrl.value = null; // Reset uploaded photo URL
  if (uploader.value) {
    uploader.value.reset(); // Reset the uploader
  }
}

</script>
