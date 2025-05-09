<template>
  <div class="full-container items-management">
    <!-- Search and Add Button Row -->
    <div class="row items-center justify-between q-mb-sm">
      <div class="search-container">
        <q-input
          v-model="searchQuery"
          placeholder="Search items..."
          square
          dense
          outlined
          class="search-input"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-icon
              name="close"
              @click="searchQuery = ''"
              class="cursor-pointer"
            />
          </template>
        </q-input>
      </div>

      <q-btn
        class="main-button"
        color="primary"
        icon="add"
        @click="showAddItemDialog = true"
        label="Add Item"
      />
    </div>

    <!-- Items List -->
    <div class="row-col-table">
      <div class="row row-col-header text-center q-px-md text-weight-bold">
        <div class="col-2 bordered text-weight-bolder">Name</div>
        <div class="col-2 bordered text-weight-bolder">Category</div>
        <div class="col-1 bordered text-weight-bolder">Laundry</div>
        <div class="col-1 bordered text-weight-bolder">Dry Clean</div>
        <div class="col-1 bordered text-weight-bolder">Pressing</div>
        <div class="col-1 bordered text-weight-bolder">Others</div>
        <div class="col-1 bordered text-weight-bolder">Pcs</div>
        <div class="col-1 bordered text-weight-bolder">Unit</div>
        <div class="col bordered text-weight-bolder">Actions</div>
      </div>

      <div
        v-if="paginatedItems.length === 0"
        class="text-center text-grey q-pa-lg text-h6"
      >
        No items found.
      </div>

      <div
        v-else
        v-for="item in paginatedItems"
        :key="item.id"
        class="row row-col-row q-mx-md"
      >
        <div class="col-2 bordered">{{ item.name }}</div>
        <div class="col-2 bordered text-center">
          {{ capitalizeWords(item.category) }}
          <span v-if="item.sub_category"
            >- {{ capitalizeWords(item.sub_category) }}</span
          >
        </div>
        <div class="col-1 bordered text-center">
          {{ item.laundry_price ? `$ ${item.laundry_price.toFixed(2)}` : "" }}
        </div>
        <div class="col-1 bordered text-center">
          {{ item.dryclean_price ? `$ ${item.dryclean_price.toFixed(2)}` : "" }}
        </div>
        <div class="col-1 bordered text-center">
          {{ item.pressing_price ? `$ ${item.pressing_price.toFixed(2)}` : "" }}
        </div>
        <div class="col-1 bordered text-center">
          {{ item.others_price ? `$ ${item.others_price.toFixed(2)}` : "" }}
        </div>
        <div class="col-1 bordered text-center">{{ item.pieces }}</div>
        <div class="col-1 bordered text-center">{{ item.unit }}</div>
        <div class="col bordered text-center actions">
          <q-btn
            dense
            label="Update"
            color="primary"
            class="main-button q-ma-xs q-px-sm"
            @click="openUpdateDialog(item)"
          />
          <q-btn
            dense
            label="Delete"
            color="negative"
            class="negative-button q-ma-xs q-px-sm"
            @click="openDeleteDialog(item)"
          />
        </div>
      </div>
    </div>
    <!-- Pagination Controls -->
    <div class="row justify-end items-center q-my-md q-col-gutter-x-sm">
      <div class="col-auto row items-center">
        <div class="text-weight-bold text-subtitle1 q-mr-sm">
          Items per page:
        </div>
        <q-select
          v-model="rowsPerPage"
          :options="[5, 10, 15, 20, 50, 75, 100]"
          dense
          outlined
          emit-value
          map-options
          style="
            font-size: 12px;
            padding: 0;
            margin: 0;
            background-color: white;
            border-radius: 5px;
          "
        />
      </div>
      <div class="col-auto">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          max-pages="7"
          boundary-numbers
          direction-links
          input
        />
      </div>
    </div>
    <!-- Add Item Dialog -->
    <q-dialog
      v-model="showAddItemDialog"
      @before-show="resetForm"
      persistent
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card class="input-dialog">
        <q-card-section class="dialog-header">
          <q-btn
            icon="close"
            flat
            dense
            round
            class="absolute-top-right q-ma-sm"
            @click="showAddItemDialog = false"
          />
          <div class="text-body1 text-uppercase text-weight-bold">
            Add New Item
          </div>
        </q-card-section>
        <q-card-section class="dialog-body">
          <!-- Add Item Form -->
          <q-form @submit="addItem">
            <div>
              <div class="dialog-label">
                Item Name<span
                  class="dialog-asterisk"
                  >*</span
                >
              </div>
              <q-input
                v-model="newItem.name"
                label="Enter item name here"
                class="dialog-inputs"
                outlined
                :rules="[(val) => !!val || 'Item name is required']"
              />
            </div>
            <div class="row q-col-gutter-md">
              <div class="col">
                <div class="dialog-label">
                  Category<span
                    class="dialog-asterisk"
                    >*</span
                  >
                </div>
                <q-select
                  v-model="selectedCategory"
                  :options="categories"
                  label="Select a category"
                  outlined
                  emit-value
                  map-options
                  :rules="[(val) => !!val || 'Category is required']"
                  @update:model-value="onCategoryChange"
                />
              </div>
              <div class="col">
                <div class="dialog-label">
                  Sub-Category<span
                    class="dialog-asterisk"
                    >*</span
                  >
                </div>
                <q-select
                  v-model="selectedSubCategory"
                  :options="subCategories"
                  label="Select a sub-category"
                  outlined
                  emit-value
                  map-options
                  :disable="subCategories.length === 0"
                  :rules="[(val) => !!val || 'Sub-category is required']"
                />
              </div>
            </div>
            <div class="row q-col-gutter-md">
              <div class="col">
                <div class="dialog-label">
                  Laundry Price
                </div>
                <q-input
                  v-model="newItem.laundry_price"
                  type="number"
                  dense
                  outlined
                  :rules="[
                    (val) => val === null || val >= 0 || 'Must be 0 or greater',
                  ]"
                />
              </div>
              <div class="col">
                <div class="dialog-label">
                  Dry Clean Price
                </div>
                <q-input
                  v-model="newItem.dryclean_price"
                  type="number"
                  dense
                  outlined
                  :rules="[
                    (val) => val === null || val >= 0 || 'Must be 0 or greater',
                  ]"
                />
              </div>
              <div class="col">
                <div class="dialog-label">
                  Pressing Price
                </div>
                <q-input
                  v-model="newItem.pressing_price"
                  type="number"
                  dense
                  outlined
                  :rules="[
                    (val) => val === null || val >= 0 || 'Must be 0 or greater',
                  ]"
                />
              </div>
              <div class="col">
                <div class="dialog-label">
                  Others Price
                </div>
                <q-input
                  v-model="newItem.others_price"
                  type="number"
                  dense
                  outlined
                  :rules="[
                    (val) => val === null || val >= 0 || 'Must be 0 or greater',
                  ]"
                />
              </div>
            </div>
            <div class="row q-col-gutter-md">
              <div class="col">
                <div class="dialog-label">
                  Unit<span
                    class="dialog-asterisk"
                    >*</span
                  >
                </div>
                <q-select
                  v-model="selectedUnit"
                  :options="units"
                  label="Select a unit"
                  emit-value
                  map-options
                  outlined
                  :rules="[(val) => !!val || 'Unit is required']"
                />
              </div>
              <div class="col">
                <div class="dialog-label">
                  Pieces<span
                    class="dialog-asterisk"
                    >*</span
                  >
                </div>
                <q-input
                  v-model.number="pieces"
                  label="Enter number of pieces"
                  type="number"
                  min="1"
                  outlined
                  :rules="[
                    (val) => !!val || 'Pieces is required',
                    (val) => val > 0 || 'Must be greater than 0',
                  ]"
                />
              </div>
            </div>
            <q-card-actions align="right">
              <q-btn
                unelevated
                color="primary"
                class="dialog-button"
                type="submit"
                label="Add Item"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Update Item Dialog -->
    <q-dialog
      v-model="showUpdateItemDialog"
      persistent
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card class="input-dialog">
        <q-card-section class="dialog-header">
          <q-btn
            icon="close"
            flat
            dense
            round
            class="absolute-top-right q-ma-sm"
            @click="showUpdateItemDialog = false"
          />
          <div class="text-body1 text-uppercase text-weight-bold">
            Update Item
          </div>
        </q-card-section>
        <q-card-section class="dialog-body">
          <!-- Update Item Form -->
          <q-form @submit="updateItem">
            <div>
              <div class="dialog-label">
                Item Name<span
                  class="dialog-asterisk"
                  >*</span
                >
              </div>
              <q-input
                v-model="selectedItem.name"
                label="Enter item name here"
                outlined
                :rules="[(val) => !!val || 'Item name is required']"
              />
            </div>
            <div class="row q-col-gutter-md">
              <div class="col">
                <div class="dialog-label">
                  Category<span
                    class="dialog-asterisk"
                    >*</span
                  >
                </div>
                <q-select
                  v-model="selectedCategory"
                  :options="categories"
                  label="Select a category"
                  outlined
                  emit-value
                  map-options
                  :rules="[(val) => !!val || 'Category is required']"
                  @update:model-value="onCategoryChange"
                />
              </div>
              <div class="col">
                <div class="dialog-label">
                  Sub-Category<span
                    class="dialog-asterisk"
                    >*</span
                  >
                </div>
                <q-select
                  v-model="selectedSubCategory"
                  :options="subCategories"
                  label="Select a sub-category"
                  outlined
                  emit-value
                  map-options
                  :rules="[(val) => !!val || 'Sub-category is required']"
                  :disable="subCategories.length === 0"
                />
              </div>
            </div>
            <div class="row q-col-gutter-md">
              <div class="col">
                <div class="dialog-label">
                  Laundry Price<span
                    class="dialog-asterisk"
                    >*</span
                  >
                </div>
                <q-input
                  v-model="selectedItem.laundry_price"
                  type="number"
                  dense
                  outlined
                  :rules="[
                    (val) => val === null || val >= 0 || 'Must be 0 or greater',
                  ]"
                />
              </div>
              <div class="col">
                <div class="dialog-label">
                  Dry Clean Price<span
                    class="dialog-asterisk"
                    >*</span
                  >
                </div>
                <q-input
                  v-model="selectedItem.dryclean_price"
                  type="number"
                  dense
                  outlined
                  :rules="[
                    (val) => val === null || val >= 0 || 'Must be 0 or greater',
                  ]"
                />
              </div>
              <div class="col">
                <div class="dialog-label">
                  Pressing Price<span
                    class="dialog-asterisk"
                    >*</span
                  >
                </div>
                <q-input
                  v-model="selectedItem.pressing_price"
                  type="number"
                  dense
                  outlined
                  :rules="[
                    (val) => val === null || val >= 0 || 'Must be 0 or greater',
                  ]"
                />
              </div>
              <div class="col">
                <div class="dialog-label">
                  Others Price<span
                    class="dialog-asterisk"
                    >*</span
                  >
                </div>
                <q-input
                  v-model="selectedItem.others_price"
                  type="number"
                  dense
                  outlined
                  :rules="[
                    (val) => val === null || val >= 0 || 'Must be 0 or greater',
                  ]"
                />
              </div>
            </div>
            <div class="row q-col-gutter-md">
              <div class="col">
                <div class="dialog-label">
                  Unit<span
                    class="dialog-asterisk"
                    >*</span
                  >
                </div>
                <q-select
                  v-model="selectedUnit"
                  label="Select a unit"
                  outlined
                  :rules="[(val) => !!val || 'Unit is required']"
                  :options="units"
                />
              </div>
              <div class="col">
                <div class="dialog-label">
                  Pieces<span
                    class="dialog-asterisk"
                    >*</span
                  >
                </div>
                <q-input
                  v-model="selectedItem.pieces"
                  type="number"
                  label="Enter number of pieces"
                  outlined
                  :rules="[
                    (val) => !!val || 'Pieces is required',
                    (val) => val > 0 || 'Must be greater than 0',
                  ]"
                />
              </div>
            </div>
            <q-card-actions align="right">
              <q-btn
                unelevated
                color="primary"
                class="dialog-button"
                type="submit"
                label="Update Item"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog
      v-model="showDeleteItemDialog"
      persistent
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card class="delete-dialog">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">
            <span>
              <q-icon name="warning" size="md" color="orange" class="q-mr-sm" />
            </span>Delete Item
          </div>
        </q-card-section>
        <q-card-section class="dialog-body">
          <p>Are you sure you want to delete this item?</p>
          <q-card-actions align="right">
            <q-btn
              unelevated
              color="negative"
              class="dialog-button"
              label="No"
              @click="showDeleteItemDialog = false"
            ></q-btn>
            <q-btn
              unelevated
              color="primary"
              class="dialog-button"
              label="Yes"
              @click="deleteItem"
            ></q-btn>
          </q-card-actions>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import {
  fetchAllItems,
  createItem,
  updateItems,
  deleteItems,
} from "@/../supabase/api/item_list.js";

// Define reactive variables
const items = ref([]);
const searchQuery = ref(""); // Added search query state
const currentPage = ref(1);
const rowsPerPage = ref(10);
const showAddItemDialog = ref(false);
const showUpdateItemDialog = ref(false);
const showDeleteItemDialog = ref(false);

const newItem = ref({
  name: "",
  category: "",
  sub_category: "",
  laundry_price: null,
  dryclean_price: null,
  pressing_price: null,
  others_price: null,
  pieces: null,
  unit: "", // Added unit field
});
const selectedItem = ref({
  id: null,
  name: "",
  category: "",
  sub_category: "",
  laundry_price: null,
  dryclean_price: null,
  pressing_price: null,
  others_price: null,
  pieces: null,
  unit: "", // Added unit field
});
const itemToDelete = ref(null);

const selectedCategory = ref("clothings");
const selectedSubCategory = ref("");
const selectedUnit = ref("");
const pieces = ref(1);

const categories = [
  { label: "Clothings", value: "clothings" },
  { label: "Beddings", value: "beddings" },
  { label: "Upholsteries", value: "upholsteries" },
  { label: "Miscellaneous", value: "miscellaneous" },
  { label: "Onsite Cleaning", value: "onsite cleaning" },
];

const allSubCategories = {
  clothings: [
    { label: "Casual Attire", value: "casual attire" },
    { label: "Heritage Attire", value: "heritage attire" },
    { label: "Winter Wear", value: "winter wear" },
    { label: "Accessories", value: "accessories" },
  ],
  beddings: [
    { label: "Bed Linens", value: "bed linens" },
    { label: "Bath Essentials", value: "bath essentials" },
    { label: "Snuggle Essentials", value: "snuggle essentials" },
  ],
  upholsteries: [
    { label: "Curtains/blinds", value: "curtains/blinds" },
    { label: "Cushions", value: "cushions" },
    { label: "Carpets", value: "carpets" },
  ],
  miscellaneous: [],
  "onsite cleaning": [
    { label: "Mattress Cleaning", value: "mattress cleaning" },
    { label: "Sofa Cleaning", value: "sofa cleaning" },
    { label: "Curtain/blinds Cleaning", value: "curtain/blinds cleaning" },
    { label: "Baby Car Seat Cleaning", value: "baby car seat cleaning" },
    { label: "Dining Chair Cleaning", value: "dining chair cleaning" },
    { label: "Carpet/rug Cleaning", value: "carpet/rug cleaning" },
    { label: "Stroller/pram Cleaning", value: "stroller/pram cleaning" },
    {
      label: "Working/computer Chair Cleaning",
      value: "working/computer chair cleaning",
    },
  ],
};

const units = [
  { label: "Piece (pc)", value: "pc" },
  { label: "Kilogram (kg)", value: "kg" },
  { label: "Square Foot (sqft)", value: "sqft" },
];

const subCategories = ref(allSubCategories["clothings"]);

function onCategoryChange(category) {
  selectedSubCategory.value = "";
  subCategories.value = allSubCategories[category] || [];
}

// Quasar utilities
const $q = useQuasar();

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return filteredItems.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredItems.value.length / rowsPerPage.value) || 1;
});

watch(rowsPerPage, () => {
  currentPage.value = 1;
});

// Computed property for filtered items
const filteredItems = computed(() => {
  if (!searchQuery.value) {
    return items.value;
  }
  return items.value.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  );
});

// Fetch items on component mount
onMounted(async () => {
  await fetchItems();
});

// Helper function to set empty inputs to null
const cleanItem = (item) => {
  Object.keys(item).forEach((key) => {
    if (item[key] === "") {
      item[key] = null;
    }
  });
};

// Function to fetch all items
const fetchItems = async () => {
  try {
    const fetchedItems = await fetchAllItems();
    if (fetchedItems) {
      items.value = fetchedItems;
    } else {
      items.value = [];
    }
  } catch (error) {
    console.error("Error fetching items:", error);
    $q.notify({ type: "negative", message: "Failed to fetch items" });
  }
};

function getTagCategory(subCategory) {
  const subCat = subCategory?.toLowerCase() || "";

  if (
    ["casual attire", "heritage attire", "winter wear", "accessories"].includes(
      subCat
    )
  ) {
    return "clothing";
  } else if (["bed linens", "bath essentials"].includes(subCat)) {
    return "bedding";
  } else if (subCat === "snuggle essentials") {
    return "stuffed toy";
  } else if (subCat === "curtains/blinds") {
    return "curtain";
  } else if (subCat === "cushions") {
    return "sofa";
  } else if (subCat === "carpets") {
    return "carpet";
  } else {
    return "others";
  }
}

const addItem = async () => {
  try {
    newItem.value.category = selectedCategory.value;
    newItem.value.sub_category = selectedSubCategory.value;
    newItem.value.unit = selectedUnit.value;
    newItem.value.pieces = pieces.value;

    // Now simply call the helper function
    newItem.value.tag_category = getTagCategory(selectedSubCategory.value);

    normalizePriceFields(newItem.value);

    const cleanedNewItem = { ...newItem.value };
    cleanItem(cleanedNewItem);

    await createItem(cleanedNewItem);
    $q.notify({ type: "positive", message: "Item added successfully" });
    showAddItemDialog.value = false;
    await fetchItems();
  } catch (error) {
    console.error("Error adding item:", error);
    $q.notify({ type: "negative", message: "Failed to add item" });
  }
};

function getUnitOption(unitValue) {
  return units.find((u) => u.value === unitValue) || { label: "", value: "" };
}

// Function to open update item dialog with selected item data
const openUpdateDialog = (item) => {
  selectedItem.value = { ...item };

  selectedCategory.value = item.category || "clothings";
  subCategories.value = allSubCategories[selectedCategory.value] || [];
  selectedSubCategory.value = item.sub_category || "";

  selectedUnit.value = getUnitOption(item.unit); // map value to {label, value}

  showUpdateItemDialog.value = true;
};

// Function to update an item
const updateItem = async () => {
  try {
    // Always update tag_category before submitting
    selectedItem.value.tag_category = getTagCategory(
      selectedItem.value.sub_category
    );

    normalizePriceFields(selectedItem.value);

    const cleanedItem = { ...selectedItem.value };
    cleanItem(cleanedItem);

    // selectedItem.value.unit = selectedUnit.value?.value || "";
    await updateItems(cleanedItem);
    $q.notify({ type: "positive", message: "Item updated successfully" });
    showUpdateItemDialog.value = false;
    await fetchItems();
  } catch (error) {
    console.error("Error updating item:", error);
    $q.notify({ type: "negative", message: "Failed to update item" });
  }
};

// Function to open delete confirmation dialog
const openDeleteDialog = (item) => {
  itemToDelete.value = item;
  showDeleteItemDialog.value = true;
};

// Function to delete an item
const deleteItem = async () => {
  try {
    await deleteItems(itemToDelete.value.id);
    $q.notify({ type: "positive", message: "Item deleted successfully" });
    showDeleteItemDialog.value = false;
    await fetchItems();
  } catch (error) {
    console.error("Error deleting item:", error);
    $q.notify({ type: "negative", message: "Failed to delete item" });
  }
};

function resetForm() {
  // Reset UI bindings
  selectedCategory.value = "clothings";
  selectedSubCategory.value = "";
  selectedUnit.value = "";
  pieces.value = 1;

  // Reset newItem fields
  newItem.value = {
    name: "",
    category: "",
    sub_category: "",
    laundry_price: null,
    dryclean_price: null,
    pressing_price: null,
    others_price: null,
    pieces: null,
    unit: "",
    tag_category: "",
  };

  // Reset subcategories list
  subCategories.value = allSubCategories["clothings"];
}

function capitalizeWords(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizePriceFields(item) {
  const priceFields = [
    "laundry_price",
    "dryclean_price",
    "pressing_price",
    "others_price",
  ];
  priceFields.forEach((key) => {
    if (item[key] === 0) item[key] = null;
  });
}
</script>
