<template>
  <div>
    <div class="container row">
      <div class="left-container col-8">
        <q-tabs
          v-model="tab"
          class="text-black"
          align="justify"
          narrow-indicator
        >
          <q-tab
            v-for="category in categories"
            :key="category.name"
            :name="category.name"
            :icon="category.icon"
            :label="category.label"
          />
        </q-tabs>

        <q-tab-panels
          v-model="tab"
          animated
          transition-prev="jump-up"
          transition-next="jump-down"
          class="bg-primary"
        >
          <q-tab-panel
            v-for="category in categories"
            :key="category.name"
            :name="category.name"
            class="q-pa-md"
          >
            <div class="row q-pa-sm q-col-gutter-md item-card-container">
              <div
                v-for="item in category.items"
                :key="item.id"
                class="item-card q-pa-xs col-2"
              >
                <q-btn
                  push
                  @click="openDialog(item)"
                  class="list-buttons q-pa-none"
                >
                  <q-card flat class="list-cards">
                    <q-card-section class="q-pa-none">
                      <q-item>
                        <q-item-section>
                          <q-item-label class="text-bold">{{
                            item.name
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-card-section>
                    <q-card-section class="item-image q-pa-none">
                      <q-img
                        :src="item.imageUrl"
                        style="height: 100px; width: 100px; object-fit: cover"
                      />
                    </q-card-section>
                  </q-card>
                </q-btn>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
      <div class="right-container col-4 q-pl-md">
        <div class="list-area">
          <div class="list-header q-py-md">
            <p class="q-ma-none text-bold">
              Transaction
              <span class="text-primary text-h6"
                >'{{ currentTransaction }}'</span
              >
              Items
            </p>
          </div>
          <div class="scrollable-list">
            <q-table
              :rows="transactionItems"
              :columns="columns"
              row-key="name"
              flat
              separator="cell"
              no-data-label="No items in transaction"
              virtual-scroll
              v-model:pagination="pagination"
              :rows-per-page-options="[0]"
              hide-bottom
              dense
              class="scrollable-table"
            >
              <template v-slot:body-cell-name="props">
                <q-td :props="props" class="name-column">
                  <p class="q-ma-none text-left wrap-text">
                    {{ props.row.name }}
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
                    <q-btn
                      flat
                      class="list-counter-buttons"
                      icon="remove"
                      @click="confirmDecrease(props.row)"
                    />
                    <div class="list-quantity q-border rounded-borders q-mx-xs">
                      <p class="list-counter-input q-px-sm q-ma-none wrap-text">
                        {{ props.row.quantity }}
                      </p>
                    </div>
                    <q-btn
                      flat
                      class="list-counter-buttons"
                      icon="add"
                      @click="increaseItemQuantity(props.row)"
                    />
                  </div>
                </q-td>
              </template>
              <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="actions-column auto-width">
                  <q-btn
                    round
                    size="7px"
                    color="negative"
                    icon="delete"
                    @click="confirmRemove(props.row)"
                  />
                </q-td>
              </template>
              <template v-slot:footer="props">
                <q-tr :props="props">
                  <q-td class="text-left"><strong>Total</strong></q-td>
                  <q-td class="text-center"
                    ><strong>${{ totalPrices.toFixed(2) }}</strong></q-td
                  >
                  <q-td class="text-center"
                    ><strong>{{ totalQuantities }}</strong></q-td
                  >
                  <q-td></q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
        </div>
        <div class="customer-area q-pa-md">
          <div class="flex items-center q-col-gutter-sm">
            <div class="col auto-width">
              <q-file
                filled
                bottom-slots
                v-model="currentImage"
                label="Upload Customer Information"
                dense
                clearable
                required
                class="q-pa-none"
              >
                <template v-slot:before>
                  <q-icon name="folder_open" />
                </template>
                <template v-slot:append>
                  <q-btn round dense flat icon="add" />
                </template>
              </q-file>
            </div>
            <div class="col-1">
              <q-btn
                dense
                flat
                class="bg-orange-10 text-white rounded-borders"
                icon="visibility"
                @click="viewImage"
              ></q-btn>
              <!-- <div v-if="photoUri">Photo URI: {{ photoUri }}</div> -->
            </div>
            <div class="col-1">
              <q-btn
                dense
                flat
                class="bg-pink-10 text-white rounded-borders"
                icon="photo_camera"
                @click="openCamera"
              ></q-btn>
              <!-- <div v-if="photoUri">Photo URI: {{ photoUri }}</div> -->
            </div>
          </div>
        </div>
        <div class="action-area q-pa-md">
          <div class="row q-col-gutter-sm">
            <div class="col-4">
              <q-btn
                label="RESET"
                push
                class="action-buttons bg-negative text-white full-width q-py-sm"
                @click="confirmCancel"
              ></q-btn>
            </div>
            <div class="col-4">
              <q-btn
                label="SWITCH"
                push
                class="action-buttons bg-warning full-width q-py-sm"
                @click="switchTransaction"
              ></q-btn>
            </div>
            <div class="col-4">
              <q-btn
                label="SUBMIT"
                push
                class="action-buttons bg-positive text-white full-width q-py-sm"
                @click="submitTransaction"
              ></q-btn>
            </div>
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="cam_dialog" persistent>
      <q-card>
        <q-bar>
          <q-space></q-space>
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">Close</q-tooltip>
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

    <q-dialog v-model="dialog" backdrop-filter="brightness(50%)">
      <q-card class="dialog-cards">
        <q-bar>
          <q-space></q-space>
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section class="column items-center q-gutter-y-sm">
          <q-img
            :src="selectedItem?.imageUrl"
            style="height: 150px; width: 150px; object-fit: cover"
          />
          <div class="text-h6 text-center">{{ selectedItem?.name }}</div>

          <div
            v-if="selectedItem?.laundry_price !== null"
            class="row items-center q-pa-sm"
          >
            <div class="col-12 text-center q-pb-md">
              Laundry - ${{ selectedItem?.laundry_price.toFixed(2) }}
            </div>
            <q-btn
              push
              class="counter-buttons"
              icon="remove"
              @click="decreaseQuantity('Laundry')"
            />
            <q-input
              outlined
              v-model="quantities.Laundry"
              class="counter-input q-pa-none q-mx-md"
            />
            <q-btn
              push
              class="counter-buttons"
              icon="add"
              @click="increaseQuantity('Laundry')"
            />
          </div>

          <div
            v-if="selectedItem?.dryclean_price !== null"
            class="row items-center q-pa-sm"
          >
            <div class="col-12 text-center q-pb-md">
              Dry Clean - ${{ selectedItem?.dryclean_price.toFixed(2) }}
            </div>
            <q-btn
              push
              class="counter-buttons"
              icon="remove"
              @click="decreaseQuantity('DryClean')"
            />
            <q-input
              outlined
              v-model="quantities.DryClean"
              class="counter-input q-pa-none q-mx-md"
            />
            <q-btn
              push
              class="counter-buttons"
              icon="add"
              @click="increaseQuantity('DryClean')"
            />
          </div>

          <div
            v-if="selectedItem?.pressing_price !== null"
            class="row items-center q-pa-sm"
          >
            <div class="col-12 text-center q-pb-md">
              Pressing Only - ${{ selectedItem?.pressing_price.toFixed(2) }}
            </div>
            <q-btn
              push
              class="counter-buttons"
              icon="remove"
              @click="decreaseQuantity('PressingOnly')"
            />
            <q-input
              outlined
              v-model="quantities.PressingOnly"
              class="counter-input q-pa-none q-mx-md"
            />
            <q-btn
              push
              class="counter-buttons"
              icon="add"
              @click="increaseQuantity('PressingOnly')"
            />
          </div>

          <div
            v-if="selectedItem?.others_price !== null"
            class="row items-center q-pa-sm"
          >
            <div class="col-12 text-center q-pb-md">
              Others - ${{ selectedItem?.others_price.toFixed(2) }}
            </div>
            <q-btn
              push
              class="counter-buttons"
              icon="remove"
              @click="decreaseQuantity('Others')"
            />
            <q-input
              outlined
              v-model="quantities.Others"
              class="counter-input q-pa-none q-mx-md"
            />
            <q-btn
              push
              class="counter-buttons"
              icon="add"
              @click="increaseQuantity('Others')"
            />
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn
            class="full-width dialog-buttons"
            label="Add Item"
            color="primary"
            @click="addToTransaction"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="confirmationDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="warning" color="negative" size="2em" class="q-mr-sm" />
          <span>{{ confirmationMessage }}</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn push label="Cancel" color="primary" v-close-popup />
          <q-btn push label="Confirm" color="negative" @click="confirmAction" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
  <q-btn 
      icon="logout" 
      @click="goToHome" 
      class="q-btn--flat q-btn--dense absolute-top-right bg-negative text-black q-ma-xs" 
    />
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { Device } from "@capacitor/device";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { fetchAllItems } from "@/../supabase/api/item_list.js";
import {
  insertInvoice,
  insertTransactions,
  getMaxTagNo,
  uploadPhoto,
  updateInvoiceWithPhoto
} from "@/../supabase/api/invoices.js";
import { useRouter } from 'vue-router';

const router = useRouter();

const goToHome = () => {
  router.push({ name: 'Home' });
};

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

const openCamera = async () => {
  try {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 90,
    });
    photoUri.value = capturedPhoto.webPath;

    // Convert the photo URI to a file object
    const response = await fetch(photoUri.value);
    const blob = await response.blob();
    const timestamp = new Date().getTime();
    const fileObject = new File([blob], `photo_${timestamp}.jpg`, { type: blob.type });
    
    // Set the file object in the q-file component
    if (currentTransaction.value === "A") {
      cinfo_imageA.value = fileObject;
    } else {
      cinfo_imageB.value = fileObject;
    }
  } catch (error) {
    console.error('Error opening camera:', error);
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

// Watch for changes in the file input
watch([cinfo_imageA, cinfo_imageB], (newFile) => {
  if (!newFile) {
    photoUri.value = null;
  }
});

const tab = ref("clothings");
const dialog = ref(false);
const confirmationDialog = ref(false);
const confirmationMessage = ref("");
const selectedItem = ref(null);
const quantities = ref({
  Laundry: 0,
  DryClean: 0,
  PressingOnly: 0,
  Others: 0,
});
const transactionA = ref([]);
const transactionB = ref([]);
const currentTransaction = ref("A");
let confirmAction = null;

const columns = [
  {
    name: "name",
    required: true,
    label: "Item",
    align: "left",
    field: (row) => row.name,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: "price",
    required: true,
    label: "Price",
    align: "center",
    field: "price",
    format: (val) => `$${val}`,
    sortable: true,
  },
  {
    name: "quantity",
    required: true,
    label: "Quantity",
    align: "center",
    field: "quantity",
    sortable: true,
  },
  { name: "actions", required: true, align: "center" },
];

const categories = ref([
  { name: "clothings", icon: "fas fa-tshirt", label: "Clothings", items: [] },
  { name: "beddings", icon: "fas fa-bed", label: "Beddings", items: [] },
  {
    name: "upholsteries",
    icon: "fas fa-couch",
    label: "Upholsteries",
    items: [],
  },
  {
    name: "onsite-cleaning",
    icon: "fas fa-broom",
    label: "Onsite Cleaning",
    items: [],
  },
  {
    name: "miscellaneous",
    icon: "fas fa-th-large",
    label: "Miscellaneous",
    items: [],
  },
  { name: "others", icon: "fas fa-ellipsis-h", label: "Others", items: [] },
]);

onMounted(async () => {
  const allItems = await fetchAllItems();

  categories.value.forEach((category) => {
    category.items = allItems
      .filter((item) => item.category === category.label)
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort items alphabetically
  });
});

const totalPrices = computed(() => {
  return transactionItems.value.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
});

const totalQuantities = computed(() => {
  return transactionItems.value.reduce(
    (total, item) => total + item.quantity,
    0
  );
});

const transactionItems = computed(() => {
  return currentTransaction.value === "A"
    ? transactionA.value
    : transactionB.value;
});

const openDialog = (item) => {
  selectedItem.value = item;
  quantities.value = {
    Laundry: 0,
    DryClean: 0,
    PressingOnly: 0,
    Others: 0,
  };
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
      const name = `${selectedItem.value.name} ${suffix}`;
      const existingItem = transactionItems.value.find((i) => i.name === name);
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
        existingItem.quantity += quantities.value[key]; // Sum the quantities
        existingItem.price = price; // Update the price
      } else {
        transactionItems.value.push({
          name: name,
          quantity: quantities.value[key],
          price: price,
        });
      }
    }
  }
  dialog.value = false;
};

const increaseItemQuantity = (item) => {
  item.quantity++;
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
    const updatedItems = transactionItems.value.filter(
      (i) => i.name !== item.name
    );
    if (currentTransaction.value === "A") {
      transactionA.value = updatedItems;
    } else {
      transactionB.value = updatedItems;
    }
    confirmationDialog.value = false;
  };
  confirmationMessage.value = `Are you sure you want to remove ${item.name} from the transaction?`;
  confirmationDialog.value = true;
};

const confirmCancel = () => {
  confirmAction = () => {
    if (currentTransaction.value === "A") {
      transactionA.value = [];
    } else {
      transactionB.value = [];
    }
    confirmationDialog.value = false;
  };
  confirmationMessage.value = `Are you sure you want to reset the entire transaction?`;
  confirmationDialog.value = true;
};

const switchTransaction = () => {
  currentTransaction.value = currentTransaction.value === "A" ? "B" : "A";
};

const submitTransaction = async () => {
  try {
    // Check if there is an image
    const currentImage = currentTransaction.value === "A" ? cinfo_imageA.value : cinfo_imageB.value;
    if (!currentImage) {
      throw new Error("Please upload customer information.");
    }

    // Check if there is at least one row in the table
    if (transactionItems.value.length === 0) {
      throw new Error("Please add at least one item to the transaction.");
    }

    // Upload the photo to Supabase storage and get the URL
    let photoUrl = null;
    if (currentImage) {
      photoUrl = await uploadPhoto(currentImage);
    }

    // Insert a new invoice row with the customer photo URL
    const invoiceNo = `INV-${Date.now()}`;
    const dateTime = new Date().toISOString();
    const readyBy = new Date(
      new Date().setDate(new Date().getDate() + 7)
    ).toISOString(); // Set ready by date to one week later
    const status = "Pending";
    const invoice = await insertInvoice(invoiceNo, dateTime, readyBy, status, photoUrl);
    const invoiceId = invoice.id;

    // Get the max tag_no
    const maxTagNo = (await getMaxTagNo()) || 0;

    // Prepare transactions data
    let serialNo = 1;
    let tagNo = maxTagNo + 1;
    const transactionsData = transactionItems.value.flatMap((item) => {
      const typeSuffix = item.name.match(/\((L|DC|PO|O)\)$/);
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
        invoice_id: invoiceId,
        serial_no: serialNo++,
        tag_no: tagNo++,
      }));
    });

    // Insert multiple rows into transactions table
    await insertTransactions(transactionsData);

    alert("Transaction submitted successfully!");
    if (currentTransaction.value === "A") {
      transactionA.value = [];
      cinfo_imageA.value = null;
    } else {
      transactionB.value = [];
      cinfo_imageB.value = null;
    }
  } catch (error) {
    console.error("Error submitting transaction:", error);
    alert(`Failed to submit transaction: ${error.message}`);
  }
};


</script>

<style scoped>
.container {
  padding: 2vh;
  background-color: #000000;
}

.list-area {
  height: 65vh; /* Fixed height to enable scrolling */
  background-color: #e9e9e9;
  overflow-y: auto; /* Enable vertical scrolling */
}

.customer-area {
  margin-top: 2vh;
  min-height: 12vh;
  background-color: #e9e9e9;
}

.action-area {
  margin-top: 2vh;
  min-height: 14vh;
  background-color: #aaadb2;
}

.list-header {
  background-color: #aaadb2;
}

.scrollable-list {
  height: 100%; /* Ensure it takes full height of list-area */
  overflow-y: auto; /* Enable vertical scrolling */
}

.item-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.item-button-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.q-tab-panels.q-panel-parent {
  max-height: calc(96vh - 75px);
  min-height: calc(96vh - 75px);
  overflow-y: auto;
  background-color: #aaadb2;
}

.q-tabs {
  max-height: 75px;
  min-height: 75px;
  background-color: #b29852;
}

.list-buttons {
  width: 100%;
  height: 200px;
  background-color: #f2f2f2;
}

.list-cards {
  background-color: rgba(0, 0, 0, 0);
}

.dialog-cards {
  max-height: 80vh;
  width: 200px;
  background-color: #e9e9e9;
}

.counter-buttons {
  width: 10px;
  height: 10px;
  background-color: #b29852;
}

.counter-input {
  width: 50px;
}

.list-counter-buttons {
  padding: 5px;
  font-size: 6px;
  background-color: #b29852;
}

.list-counter-input {
  font-size: 13px;
  text-align: center;
}

.action-buttons {
  height: 9vh;
  margin: 0;
}

.list-quantity {
  border-width: 1.5px;
  border-color: #8a8a8a;
  border-style: solid;
}

.scrollable-table .q-td {
  word-wrap: break-word;
  white-space: normal;
}

.fixed-width {
  width: 150px; /* You can adjust this width as needed */
}

.name-column {
  width: auto; /* Specific width for the name column */
}

.price-column {
  width: 70px; /* Specific width for the price column */
}

.quantity-column {
  width: 100px; /* Specific width for the quantity column */
}

.actions-column {
  width: 10px;
}

.wrap-text {
  overflow-wrap: break-word;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
