<template>
  <div>
    <!-- Main Container -->
    <div class="container row">
      
      <!-- Left Container: Tabs and Items -->
      <div class="left-container col-8">
        <!-- Category Tabs -->
        <q-tabs v-model="tab" class="text-black" align="justify" narrow-indicator>
          <q-tab
            v-for="category in categories"
            :key="category.name"
            :name="category.name"
            :icon="category.icon"
            :label="$t(category.name)"
          />
        </q-tabs>

        <!-- Tab Panels for Categories -->
        <q-tab-panels v-model="tab" animated transition-prev="jump-up" transition-next="jump-down" class="tab-list">
          <q-tab-panel v-for="category in categories" :key="category.id" :name="category.name" class="q-pa-md">
            <div class="row q-pa-sm q-col-gutter-md item-card-container">
              <div v-for="item in category.items" :key="item.id" class="item-card q-pa-xs col-2">
                <q-btn push @click="openDialog(item)" class="list-buttons q-pa-none">
                  <q-card flat class="list-cards">
                    <q-card-section class="q-pa-none">
                      <q-item>
                        <q-item-section>
                          <q-item-label class="text-bold">{{ $t(`itemsList.${item.name}`) }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-card-section>
                    <q-card-section class="item-image q-pa-none">
                      <q-img :src="item.imageUrl" style="height: 100px; width: 100px; object-fit: cover" />
                    </q-card-section>
                  </q-card>
                </q-btn>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <!-- Right Container: Transaction Details and Actions -->
      <div class="right-container col-4 q-pl-md">
        <!-- Transaction List -->
        <div class="list-area">
          <div class="list-header q-py-xs">
            <p class="q-ma-none text-bold">
              {{ $t("transaction") }} <span class="text-primary text-h6">'{{ currentTransaction }}'</span> {{ $t("items") }}
            </p>
          </div>
          <div class="scrollable-list">
            <q-table
              :rows="transactionItems"
              :columns="columns"
              row-key="name"
              flat
              separator="cell"
              :no-data-label="$t('no_items_in_transaction')"
              virtual-scroll
              v-model:pagination="pagination"
              :rows-per-page-options="[0]"
              hide-bottom
              dense
              class="scrollable-table"
            >
              <!-- Custom Body Cells -->
              <template v-slot:body-cell-name="props">
                <q-td :props="props" class="name-column">
                  <p class="q-ma-none text-left wrap-text">
                    {{ $t(`itemsList.${props.row.name}`) }}
                    <span> {{ props.row.suffix }} </span>
                  </p>
                </q-td>
              </template>
              <template v-slot:body-cell-price="props">
                <q-td :props="props" class="price-column">
                  <p class="q-ma-none text-center wrap-text">
                    ${{ props.row.price }}
                  </p>
                </q-td>
              </template>
              <template v-slot:body-cell-quantity="props">
                <q-td :props="props" class="quantity-column">
                  <div class="row items-center justify-center">
                    <q-btn flat class="list-counter-buttons" icon="remove" @click="confirmDecrease(props.row)" />
                    <div class="list-quantity q-border rounded-borders q-mx-xs">
                      <p class="list-counter-input q-px-sm q-ma-none wrap-text">
                        {{ props.row.quantity }}
                      </p>
                    </div>
                    <q-btn flat class="list-counter-buttons" icon="add" @click="increaseItemQuantity(props.row)" />
                  </div>
                </q-td>
              </template>
              <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="actions-column auto-width">
                  <q-btn round size="7px" color="negative" icon="delete" @click="confirmRemove(props.row)" />
                </q-td>
              </template>
              <template v-slot:footer="props">
                <q-tr :props="props">
                  <q-td class="text-left"><strong>{{ $t("total") }}</strong></q-td>
                  <q-td class="text-center"><strong>${{ totalPrices.toFixed(2) }}</strong></q-td>
                  <q-td class="text-center"><strong>{{ totalQuantities }}</strong></q-td>
                  <q-td></q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
        </div>

        <!-- Customer Actions -->
        <div class="customer-area q-pa-md">
          <div class="row items-center q-col-gutter-sm">
            <div class="col-4">
              <q-btn dense push class="bg-orange-10 text-white rounded-borders full-width" label="Upload Image" @click="showUploadImageDialog = true"></q-btn>
            </div>
            <div class="col-4">
              <q-btn dense push class="bg-blue-10 text-white rounded-borders full-width" label="Customer Info" @click="showCustomerInfoDialog = true"></q-btn>
            </div>
            <div class="col-4">
              <q-btn dense push class="bg-pink-9 text-white rounded-borders full-width" label="Instructions" @click="showInstructionsDialog = true"></q-btn>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-area q-pa-md">
          <div class="row q-col-gutter-sm">
            <div class="col-4">
              <q-btn :label="$t('reset')" push class="action-buttons bg-negative text-white full-width q-py-sm" @click="confirmCancel"></q-btn>
            </div>
            <div class="col-4">
              <q-btn :label="$t('switch')" push class="action-buttons bg-warning full-width q-py-sm" @click="switchTransaction"></q-btn>
            </div>
            <div class="col-4">
              <q-btn :label="$t('submit')" push class="action-buttons bg-positive text-white full-width q-py-sm" @click="submitTransaction"></q-btn>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Camera Dialog -->
    <q-dialog v-model="cam_dialog" persistent>
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

    <!-- Item Dialog -->
    <q-dialog v-model="dialog" backdrop-filter="brightness(50%)">
      <q-card class="dialog-cards">
        <q-bar>
          <q-space></q-space>
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">{{ $t("close") }}</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section class="column items-center q-gutter-y-sm">
          <q-img :src="selectedItem?.imageUrl" style="height: 150px; width: 150px; object-fit: cover" />
          <div class="text-h6 text-center">
            {{ $t(`itemsList.${selectedItem?.name}`) }}
          </div>

          <!-- Item Quantity Controls -->
          <div v-if="selectedItem?.laundry_price !== null" class="row items-center q-pa-sm">
            <div class="col-12 text-center q-pb-md">
              {{ $t("laundry") }} - ${{ selectedItem?.laundry_price.toFixed(2) }}
            </div>
            <q-btn push class="counter-buttons" icon="remove" @click="decreaseQuantity('Laundry')" />
            <q-input outlined v-model="quantities.Laundry" class="counter-input q-pa-none q-mx-md" />
            <q-btn push class="counter-buttons" icon="add" @click="increaseQuantity('Laundry')" />
          </div>

          <div v-if="selectedItem?.dryclean_price !== null" class="row items-center q-pa-sm">
            <div class="col-12 text-center q-pb-md">
              {{ $t("dry_clean") }} - ${{ selectedItem?.dryclean_price.toFixed(2) }}
            </div>
            <q-btn push class="counter-buttons" icon="remove" @click="decreaseQuantity('DryClean')" />
            <q-input outlined v-model="quantities.DryClean" class="counter-input q-pa-none q-mx-md" />
            <q-btn push class="counter-buttons" icon="add" @click="increaseQuantity('DryClean')" />
          </div>

          <div v-if="selectedItem?.pressing_price !== null" class="row items-center q-pa-sm">
            <div class="col-12 text-center q-pb-md">
              {{ $t("pressing_only") }} - ${{ selectedItem?.pressing_price.toFixed(2) }}
            </div>
            <q-btn push class="counter-buttons" icon="remove" @click="decreaseQuantity('PressingOnly')" />
            <q-input outlined v-model="quantities.PressingOnly" class="counter-input q-pa-none q-mx-md" />
            <q-btn push class="counter-buttons" icon="add" @click="increaseQuantity('PressingOnly')" />
          </div>

          <div v-if="selectedItem?.others_price !== null" class="row items-center q-pa-sm">
            <div class="col-12 text-center q-pb-md">
              {{ $t("others_service") }} - ${{ selectedItem?.others_price.toFixed(2) }}
            </div>
            <q-btn push class="counter-buttons" icon="remove" @click="decreaseQuantity('Others')" />
            <q-input outlined v-model="quantities.Others" class="counter-input q-pa-none q-mx-md" />
            <q-btn push class="counter-buttons" icon="add" @click="increaseQuantity('Others')" />
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn class="full-width dialog-buttons" :label="$t('add_item')" color="primary" @click="addToTransaction" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Customer Info Dialog -->
    <q-dialog v-model="showCustomerInfoDialog" backdrop-filter="brightness(50%)">
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
          <div class="full-width">
            <div class="text-caption text-uppercase">Contact Number</div>
            <q-input v-model="currentCustomer.contactNo" type="tel" filled lazy-rules class="full-width" />
          </div>
          <div class="full-width">
            <div class="text-caption text-uppercase">Delivery Address</div>
            <q-input v-model="currentCustomer.address" clearable filled lazy-rules class="full-width" />
          </div>
          <div class="full-width">
            <div class="text-caption text-uppercase">Remarks</div>
            <q-input v-model="currentCustomer.remarks" filled type="textarea" class="full-width" />
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn class="full-width dialog-buttons" :label="$t('add_details')" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Instructions Dialog -->
    <q-dialog v-model="showInstructionsDialog" backdrop-filter="brightness(50%)">
      <q-card class="dialog-instructions">
        <q-bar>
          <q-space></q-space>
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">{{ $t("close") }}</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section class="column items-center q-gutter-y-md">
          <div class="full-width">
            <div class="text-caption text-uppercase">Ready By Date</div>
            <q-input v-model="readyByDate" type="date" filled lazy-rules class="full-width" />
          </div>
          <div class="full-width">
            <div class="text-caption text-uppercase">Enter Instruction:</div>
            <q-input v-model="instruction" filled lazy-rules class="full-width" />
          </div>
          <div class="q-gutter-x-sm">
            <q-checkbox dense v-model="instruction_to.Tagger" label="Tagger" />
            <q-checkbox dense v-model="instruction_to.Packer" label="Packer" />
            <q-checkbox dense v-model="instruction_to.Admin" label="Admin" />
            <q-checkbox dense v-model="instruction_to.Collection" label="Collection" />
            <q-checkbox dense v-model="instruction_to.Delivery" label="Delivery" />
          </div>
          <q-btn class="dialog-buttons" label="Add Instruction" color="secondary" @click="addInstruction" />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div>
            <div class="text-p text-weight-bold text-uppercase">List of Instructions</div>
            <ul>
              <li v-for="(instr, index) in instructions" :key="index" class="q-mt-sm">
                <div>{{ instr.text }}</div>
                <div>
                  <q-chip label v-for="target in instr.targets" :key="target" class="q-mr-sm">{{ target }}</q-chip>
                </div>
              </li>
            </ul>
          </div>
        </q-card-section>
        <q-separator class="q-mt-md" />
        <q-card-actions>
          <q-btn class="full-width dialog-buttons" label="Submit Instructions" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <!-- Upload Image Dialog -->
    <q-dialog v-model="showUploadImageDialog">
      <q-card>
        <q-bar>
          <q-space></q-space>
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">{{ $t("close") }}</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section>
          <div class="upload-image flex items-end q-col-gutter-sm">
            <div class="col auto-width">
              <q-file
                filled
                bottom-slots
                v-model="currentImage"
                :label="$t('click_here')"
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
          <q-btn class="full-width dialog-buttons" :label="$t('add_details')" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Confirmation Dialog -->
    <q-dialog v-model="confirmationDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="warning" color="negative" size="2em" class="q-mr-sm" />
          <span>{{ confirmationMessage }}</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn push :label="$t('cancel')" color="primary" v-close-popup />
          <q-btn push :label="$t('confirm')" color="negative" @click="confirmAction" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>

  <!-- Top Right Buttons -->
  <div class="absolute-top-right q-gutter-xs q-ma-xs">
    <q-btn @click="toggleLanguage" class="q-btn--flat q-btn--dense bg-purple text-black" icon="translate" />
    <q-btn icon="logout" @click="goToHome" class="q-btn--flat q-btn--dense bg-negative text-black" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { Device } from "@capacitor/device";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { fetchAllItems } from "@/../supabase/api/item_list.js";
import {
  insertOrder,
  insertCustomer,
  insertTransactions,
  insertInstructions,
  getMaxTagNo,
  getMaxOrderId,
  uploadPhoto,
} from "@/../supabase/api/invoices.js";
import { useRouter } from "vue-router";

// Router for navigation
const router = useRouter();
const goToHome = () => {
  router.push({ name: "Home" });
};

// Localization
import { useI18n } from "vue-i18n";
const { locale, t } = useI18n();
const currentLanguage = ref(locale.value === "en" ? "中文" : "English");

const toggleLanguage = () => {
  locale.value = locale.value === "en" ? "zh" : "en";
};

watch(locale, (newLocale) => {
  currentLanguage.value = newLocale === "en" ? "中文" : "English";
});

// Device Information
const model = ref("Please wait...");
const manufacturer = ref("Please wait...");
const photoUri = ref(null);
const cinfo_imageA = ref(null);
const cinfo_imageB = ref(null);
const cam_dialog = ref(false);

const currentImage = computed({
  get() {
    return currentTransaction.value === "A" ? cinfo_imageA.value : cinfo_imageB.value;
  },
  set(value) {
    if (currentTransaction.value === "A") {
      cinfo_imageA.value = value;
    } else {
      cinfo_imageB.value = value;
    }
  },
});

onMounted(() => {
  Device.getInfo().then((info) => {
    model.value = info.model;
    manufacturer.value = info.manufacturer;
  });
});

// Camera Functions
const openCamera = async () => {
  try {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 90,
    });
    photoUri.value = capturedPhoto.webPath;

    const response = await fetch(photoUri.value);
    const blob = await response.blob();
    const timestamp = new Date().getTime();
    const fileObject = new File([blob], `photo_${timestamp}.jpg`, { type: blob.type });

    if (currentTransaction.value === "A") {
      cinfo_imageA.value = fileObject;
    } else {
      cinfo_imageB.value = fileObject;
    }
  } catch (error) {
    console.error("Error opening camera:", error);
  }
};

const viewImage = () => {
  const currentImage = currentTransaction.value === "A" ? cinfo_imageA.value : cinfo_imageB.value;
  if (currentImage) {
    const reader = new FileReader();
    reader.onload = () => {
      photoUri.value = reader.result;
      cam_dialog.value = true;
    };
    reader.readAsDataURL(currentImage);
  } else {
    cam_dialog.value = true;
  }
};

watch([cinfo_imageA, cinfo_imageB], (newFile) => {
  if (!newFile) {
    photoUri.value = null;
  }
});

// Tab and Dialog States
const tab = ref("clothings");
const dialog = ref(false);
const showUploadImageDialog = ref(false);
const showCustomerInfoDialog = ref(false);
const showInstructionsDialog = ref(false);

// Customer Information
const customerA = ref({ name: "", contactNo: "", address: "53 Ubi Avenue 1 #01-29, Paya Ubi Ind. Park Singapore 408934", remarks: "" });
const customerB = ref({ name: "", contactNo: "", address: "53 Ubi Avenue 1 #01-29, Paya Ubi Ind. Park Singapore 408934", remarks: "" });

const currentCustomer = computed({
  get() {
    return currentTransaction.value === "A" ? customerA.value : customerB.value;
  },
  set(value) {
    if (currentTransaction.value === "A") {
      customerA.value = value;
    } else {
      customerB.value = value;
    }
  },
});

// Transaction Data
const confirmationDialog = ref(false);
const confirmationMessage = ref("");
const selectedItem = ref(null);
const quantities = ref({ Laundry: 0, DryClean: 0, PressingOnly: 0, Others: 0 });
const transactionA = ref([]);
const transactionB = ref([]);
const currentTransaction = ref("A");
let confirmAction = null;

const columns = computed(() => [
  {
    name: "name",
    required: true,
    label: t("item"),
    align: "left",
    field: (row) => row.name,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: "price",
    required: true,
    label: t("price"),
    align: "center",
    field: "price",
    format: (val) => `$${val}`,
    sortable: true,
  },
  {
    name: "quantity",
    required: true,
    label: t("quantity"),
    align: "center",
    field: "quantity",
    sortable: true,
  },
  {
    name: "actions",
    required: true,
    align: "center",
  },
]);

const categories = ref([
  { name: "clothings", icon: "fas fa-tshirt", label: "Clothings", items: [] },
  { name: "beddings", icon: "fas fa-bed", label: "Beddings", items: [] },
  { name: "upholsteries", icon: "fas fa-couch", label: "Upholsteries", items: [] },
  { name: "onsite_cleaning", icon: "fas fa-broom", label: "Onsite Cleaning", items: [] },
  { name: "miscellaneous", icon: "fas fa-th-large", label: "Miscellaneous", items: [] },
  { name: "others", icon: "fas fa-ellipsis-h", label: "Others", items: [] },
]);

onMounted(async () => {
  const allItems = await fetchAllItems();
  categories.value.forEach((category) => {
    category.items = allItems.filter((item) => item.category === category.label).sort((a, b) => a.name.localeCompare(b.name));
  });
});

const totalPrices = computed(() => {
  return transactionItems.value.reduce((total, item) => total + item.price * item.quantity, 0);
});

const totalQuantities = computed(() => {
  return transactionItems.value.reduce((total, item) => total + item.quantity, 0);
});

const transactionItems = computed(() => {
  return currentTransaction.value === "A" ? transactionA.value : transactionB.value;
});

// Dialog Functions
const openDialog = (item) => {
  selectedItem.value = item;
  quantities.value = { Laundry: 0, DryClean: 0, PressingOnly: 0, Others: 0 };
  dialog.value = true;
};

const increaseQuantity = (type) => {
  quantities.value[type]++;
};

const decreaseQuantity = (type) => {
  if (quantities.value[type] > 0) {
    quantities.value[type]--;
  }
};

const addToTransaction = () => {
  const services = {
    Laundry: "(L)",
    DryClean: "(DC)",
    PressingOnly: "(PO)",
    Others: "(O)",
  };

  for (const [key, suffix] of Object.entries(services)) {
    if (quantities.value[key] > 0) {
      const name = selectedItem.value.name;
      const existingItem = transactionItems.value.find((i) => i.name === name && i.suffix === suffix);
      let price = 0;
      switch (suffix) {
        case "(L)":
          price = selectedItem.value.laundry_price.toFixed(2);
          break;
        case "(DC)":
          price = selectedItem.value.dryclean_price.toFixed(2);
          break;
        case "(PO)":
          price = selectedItem.value.pressing_price.toFixed(2);
          break;
        case "(O)":
          price = selectedItem.value.others_price.toFixed(2);
          break;
      }
      if (existingItem) {
        existingItem.quantity += quantities.value[key];
        existingItem.price = price;
      } else {
        transactionItems.value.push({
          id: selectedItem.value.id,
          name: name,
          suffix: suffix,
          quantity: quantities.value[key],
          price: price,
        });
      }
    }
  }
  dialog.value = false;
};

const confirmDecrease = (item) => {
  if (item.quantity > 1) {
    item.quantity--;
  } else {
    confirmRemove(item);
  }
};

const confirmRemove = (item) => {
  confirmAction = () => {
    const updatedItems = transactionItems.value.filter((i) => i.name !== item.name);
    if (currentTransaction.value === "A") {
      transactionA.value = updatedItems;
    } else {
      transactionB.value = updatedItems;
    }
    confirmationDialog.value = false;
  };
  confirmationMessage.value = t("are_you_sure_remove", { item: item.name });
  confirmationDialog.value = true;
};

const confirmCancel = () => {
  confirmAction = () => {
    if (currentTransaction.value === "A") {
      transactionA.value = [];
      customerA.value = [];
      instructionsA.value = [];
      cinfo_imageA.value = [];
    } else {
      transactionB.value = [];
      customerB.value = [];
      instructionsB.value = [];
      cinfo_imageB.value = [];
    }
    confirmationDialog.value = false;
  };
  confirmationMessage.value = t("are_you_sure_reset");
  confirmationDialog.value = true;
};

const switchTransaction = () => {
  currentTransaction.value = currentTransaction.value === "A" ? "B" : "A";
};

const readyByDate = ref(calculateWorkingDate(5));
// Function to calculate the date after a given number of working days
function calculateWorkingDate(days) {
  const resultDate = new Date();
  let remainingDays = days;

  while (remainingDays > 0) {
    resultDate.setDate(resultDate.getDate() + 1);
    const day = resultDate.getDay();
    if (day !== 0 && day !== 6) { // 0 = Sunday, 6 = Saturday
      remainingDays--;
    }
  }
  return resultDate.toISOString().split('T')[0]; // Return date in YYYY-MM-DD format
}

// Submit Transaction
const submitTransaction = async () => {
  try {
    const currentImage = currentTransaction.value === "A" ? cinfo_imageA.value : cinfo_imageB.value;
    if (!currentImage) {
      throw new Error(t("upload_customer_info"));
    }

    if (transactionItems.value.length === 0) {
      throw new Error(t("add_item"));
    }

    let photoUrl = null;
    if (currentImage) {
      photoUrl = await uploadPhoto(currentImage);
    }

    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const maxOrderId = (await getMaxOrderId()) || 0;
    const nextOrderId = maxOrderId + 1;
    const nextOrder = nextOrderId.toString().padStart(2, "0");
    const orderNo = `CC-${year}${month}${day}Sfc${nextOrder}`;

    const currentCustomer = currentTransaction.value === "A" ? customerA.value : customerB.value;
    const contact_person = currentCustomer.name;
    const contact_person_no = currentCustomer.contactNo;
    const del_address = currentCustomer.address;
    const remarks = currentCustomer.remarks;

    const dateTime = new Date().toISOString();
    const readyBy = new Date(readyByDate.value).toISOString(); // Use selected date
    const status = "Pending";
    const order = await insertOrder(orderNo, dateTime, readyBy, status, photoUrl, contact_person, contact_person_no, del_address, remarks);
    const orderId = order.id;

    const maxTagNo = (await getMaxTagNo()) || 0;
    let serialNo = 1;
    let tagNo = maxTagNo + 1;
    const transactionsData = transactionItems.value.flatMap((item) => {
      const typeSuffix = item.suffix.match(/\((L|DC|PO|O)\)$/);
      let type = "";
      if (typeSuffix) {
        switch (typeSuffix[1]) {
          case "L":
            type = "Laundry";
            break;
          case "DC":
            type = "Dry Clean";
            break;
          case "PO":
            type = "Pressing Only";
            break;
          case "O":
            type = "Others";
            break;
        }
      }
      const itemName = item.name.replace(/\s*\((L|DC|PO|O)\)$/, "");
      return Array.from({ length: item.quantity }, () => ({
        item_name: itemName,
        type: type,
        price: item.price,
        order_id: orderId,
        serial_no: serialNo++,
        tag_no: tagNo++,
      }));
    });

    await insertTransactions(transactionsData);

    // const currentCustomer = currentTransaction.value === "A" ? customerA.value : customerB.value;
    // await insertCustomer({
    //   name: currentCustomer.name,
    //   contact_no: currentCustomer.contactNo,
    //   del_address: currentCustomer.address,
    //   remarks: currentCustomer.remarks,
    //   order_id: orderId,
    // });

    // Insert Instructions
    const instructionsData = instructions.value.map(instruction => ({
      description: instruction.text,
      order_id: orderId,
      admin: instruction.targets.includes('Admin'),
      packer: instruction.targets.includes('Packer'),
      tagger: instruction.targets.includes('Tagger'),
      collection: instruction.targets.includes('Collection'),
      delivery: instruction.targets.includes('Delivery')
    }));

    for (const instructionData of instructionsData) {
      await insertInstructions(instructionData);
    }

    alert(t("submit_transaction"));
    if (currentTransaction.value === "A") {
      transactionA.value = [];
      instructionsA.value = [];
      cinfo_imageA.value = null;
    } else {
      transactionB.value = [];
      instructionsB.value = [];
      cinfo_imageB.value = null;
    }
  } catch (error) {
    console.error("Error submitting transaction:", error);
    alert(t("failed_submit_transaction", { error: error.message }));
  }
};

// Instructions
const instruction = ref("");
const instruction_to = ref({
  Tagger: false,
  Packer: false,
  Admin: false,
  Collection: false,
  Delivery: false,
});

const instructionsA = ref([]);
const instructionsB = ref([]);

const instructions = computed(() => {
  return currentTransaction.value === "A" ? instructionsA.value : instructionsB.value;
});

const addInstruction = () => {
  if (instruction.value.trim() === "") return;

  const selectedInstructions = Object.keys(instruction_to.value).filter((key) => instruction_to.value[key]);

  const newInstruction = {
    text: instruction.value,
    targets: selectedInstructions,
  };

  if (currentTransaction.value === "A") {
    instructionsA.value.push(newInstruction);
  } else {
    instructionsB.value.push(newInstruction);
  }

  instruction.value = "";
  Object.keys(instruction_to.value).forEach((key) => {
    instruction_to.value[key] = false;
  });
};
</script>
