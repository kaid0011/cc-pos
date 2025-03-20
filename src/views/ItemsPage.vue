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

      <div v-else v-for="item in paginatedItems" :key="item.id" class="row row-col-row q-mx-md">
        <div class="col-2 bordered">{{ item.name }}</div>
        <div class="col-2 bordered text-center">{{ item.category }} - {{ item.sub_category }}</div>
        <div class="col-1 bordered text-center">{{ item.laundry_price ? `$ ${item.laundry_price.toFixed(2)}` : '' }}</div>
        <div class="col-1 bordered text-center">{{ item.dryclean_price ? `$ ${item.dryclean_price.toFixed(2)}` : '' }}</div>
        <div class="col-1 bordered text-center">{{ item.pressing_price ? `$ ${item.pressing_price.toFixed(2)}` : '' }}</div>
        <div class="col-1 bordered text-center">{{ item.others_price ? `$ ${item.others_price.toFixed(2)}` : '' }}</div>
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
<div class="row justify-between items-center q-my-md">
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
      style="font-size: 12px; padding: 0; margin: 0; background-color: white; border-radius: 5px;"
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
    persistent
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card style="width: 500px" class="dialog">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">Add New Item</div>
      </q-card-section>
      <q-card-section>
        <!-- Add Item Form -->
        <q-form @submit="addItem" class="q-gutter-md">
          <q-input
            v-model="newItem.name"
            label="Item Name"
            outlined
            required
          ></q-input>
          <q-input
            v-model="newItem.category"
            label="Category"
            outlined
            required
          ></q-input>
          <q-input
            v-model="newItem.sub_category"
            label="Sub-category"
            outlined
          ></q-input>
          <q-input
            v-model="newItem.laundry_price"
            type="number"
            label="Laundry Price"
            outlined
          ></q-input>
          <q-input
            v-model="newItem.dryclean_price"
            type="number"
            label="Dry Clean Price"
            outlined
          ></q-input>
          <q-input
            v-model="newItem.pressing_price"
            type="number"
            label="Pressing Only Price"
            outlined
          ></q-input>
          <q-input
            v-model="newItem.others_price"
            type="number"
            label="Others Price"
            outlined
          ></q-input>
          <q-input
            v-model="newItem.pieces"
            type="number"
            label="Pieces"
            outlined
          ></q-input>
          <q-select
            v-model="newItem.unit"
            label="Unit"
            outlined
            :options="units"
            required
          ></q-select>
          <q-card-actions align="right">
            <q-btn
              flat
              class="negative-button"
              @click="showAddItemDialog = false"
              label="Cancel"
            ></q-btn>
            <q-btn flat type="submit" class="main-button" label="Add Item"></q-btn>
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
    <q-card style="width: 500px" class="dialog">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">Update Item</div>
      </q-card-section>
      <q-card-section>
        <!-- Update Item Form -->
        <q-form @submit="updateItem" class="q-gutter-md">
          <q-input
            v-model="selectedItem.name"
            label="Item Name"
            outlined
            required
          ></q-input>
          <q-input
            v-model="selectedItem.category"
            label="Category"
            outlined
            required
          ></q-input>
          <q-input
            v-model="selectedItem.sub_category"
            label="Sub-category"
            outlined
          ></q-input>
          <q-input
            v-model="selectedItem.laundry_price"
            type="number"
            label="Laundry Price"
            outlined
          ></q-input>
          <q-input
            v-model="selectedItem.dryclean_price"
            type="number"
            label="Dry Clean Price"
            outlined
          ></q-input>
          <q-input
            v-model="selectedItem.pressing_price"
            type="number"
            label="Pressing Only Price"
            outlined
          ></q-input>
          <q-input
            v-model="selectedItem.others_price"
            type="number"
            label="Others Price"
            outlined
          ></q-input>
          <q-input
            v-model="selectedItem.pieces"
            type="number"
            label="Pieces"
            outlined
          ></q-input>
          <q-select
            v-model="selectedItem.unit"
            label="Unit"
            outlined
            :options="units"
            required
          ></q-select>
          <q-card-actions align="right">
            <q-btn
              flat
              class="negative-button"
              @click="showUpdateItemDialog = false"
              label="Cancel"
            ></q-btn>
            <q-btn flat class="main-button" type="submit" label="Update Item"></q-btn>
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
    <q-card style="width: 500px">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">Delete Item</div>
      </q-card-section>
      <q-card-section>
        <p>Are you sure you want to delete this item?</p>
        <q-card-actions align="right">
          <q-btn
            flat
            class="negative-button"
            label="No"
            @click="showDeleteItemDialog = false"
          ></q-btn>
          <q-btn flat class="main-button" label="Yes" @click="deleteItem"></q-btn>
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
    sub_category: "None",
    laundry_price: null,  
    dryclean_price: null,
    pressing_price: null,
    others_price: null,
    pieces: 1,
    unit: "", // Added unit field
  });
  const selectedItem = ref({
    id: null,
    name: "",
    category: "",
    sub_category: "",
    laundry_price: 0,
    dryclean_price: 0,
    pressing_price: 0,
    others_price: 0,
    pieces: "",
    unit: "", // Added unit field
  });
  const itemToDelete = ref(null);
  
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
  
  // Function to add a new item
  const addItem = async () => {
    try {
      const cleanedNewItem = { ...newItem.value };
      cleanItem(cleanedNewItem);
  
      await createItem(cleanedNewItem);
      $q.notify({ type: "positive", message: "Item added successfully" });
      showAddItemDialog.value = false;
      await fetchItems(); // Refresh the items list
    } catch (error) {
      console.error("Error adding item:", error);
      $q.notify({ type: "negative", message: "Failed to add item" });
    }
  };
  
  // Function to open update item dialog with selected item data
  const openUpdateDialog = (item) => {
    selectedItem.value = { ...item };
    showUpdateItemDialog.value = true;
  };
  
  // Function to update an item
  const updateItem = async () => {
    try {
      const cleanedItem = { ...selectedItem.value };
      cleanItem(cleanedItem);
  
      await updateItems(cleanedItem);
      $q.notify({ type: "positive", message: "Item updated successfully" });
      showUpdateItemDialog.value = false;
      await fetchItems(); // Refresh the items list
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
  
  </script>
  
  