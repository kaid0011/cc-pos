<template>
  <div class="text-p">
    <!-- Checkbox to toggle between search and category view -->
    <q-checkbox
      v-model="isSearchMode"
      label="Search an item instead"
      class="q-mb-md"
      @update:model="toggleSearchMode"
    />

    <!-- Conditional rendering based on the checkbox state -->
    <div v-if="isSearchMode">
      <div>Search an item...</div>
      <q-select
        v-model="selectedSearchItem"
        :options="filteredSearchItems"
        square
        dense
        outlined
        use-input
        input-debounce="300"
        class="q-mb-xs bg-white"
        label="Type to search item"
        @filter="filterSearchItems"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
        <template v-slot:append>
          <q-icon
            name="close"
            @click="clearSearch"
            class="cursor-pointer"
          />
        </template>
      </q-select>
    </div>

    <!-- Category, Sub-category, Item, Price Type, Process, and Price displayed if not in search mode -->
    <div v-else>
      <div>Category</div>
      <q-select
        v-model="selectedCategory"
        :options="categories"
        square
        dense
        outlined
        input-debounce="300"
        class="q-mb-xs bg-white"
        label="Select Category"
      />

      <div v-if="isNewItemCategory">
        <div>Enter New Item:</div>
        <q-input
          v-model="newItemName"
          square
          dense
          outlined
          class="q-mb-xs bg-white"
          placeholder="Enter item name"
        />
      </div>
      <div v-else>
        <div>Sub-category</div>
        <q-select
          v-model="selectedSubCategory"
          :options="filteredSubCategories"
          square
          dense
          outlined
          input-debounce="300"
          class="q-mb-xs bg-white"
          label="Select Sub-category"
        />

        <div>Item Name:</div>
        <q-select
          v-model="selectedItem"
          :options="filteredItems"
          square
          dense
          outlined
          input-debounce="300"
          class="q-mb-xs bg-white"
          label="Select Item"
        />
      </div>
    </div>

    <!-- Price Type Dropdown -->
    <div>Price Type</div>
    <q-select
      v-model="selectedPriceType"
      :options="filteredPriceTypes"
      square
      dense
      outlined
      class="q-mb-xs bg-white"
      label="Select Price Type"
    />

    <!-- Process Dropdown -->
    <div>Process</div>
    <q-select
      v-model="selectedProcess"
      :options="filteredProcessOptions"
      square
      dense
      outlined
      class="q-mb-xs bg-white"
      label="Select Process"
      @update:model="updatePriceBasedOnType"
    />

    <!-- Price Input -->
    <div>Price:</div>
    <q-input
      v-model="priceDisplay"
      square
      dense
      outlined
      class="q-mb-xs bg-white"
      label="Enter Price"
      :disable="isPriceDisabled"
    />

    <!-- Conditional Inputs Based on Unit -->
    <div v-if="selectedUnit === 'pc'">
      <div>Quantity:</div>
      <q-input
        v-model="quantity"
        type="number"
        square
        dense
        outlined
        class="q-mb-xs bg-white"
        label="Enter Quantity"
      />
    </div>
    
    <div v-else-if="selectedUnit === 'sqft'">
      <div>Width:</div>
      <q-input
        v-model="width"
        type="number"
        square
        dense
        outlined
        class="q-mb-xs bg-white"
        label="Enter Width (ft)"
      />
      <div>Breadth:</div>
      <q-input
        v-model="breadth"
        type="number"
        square
        dense
        outlined
        class="q-mb-xs bg-white"
        label="Enter Breadth (ft)"
      />
    </div>

    <div v-else-if="selectedUnit === 'kg'">
      <div>Weight:</div>
      <q-input
        v-model="weight"
        type="number"
        square
        dense
        outlined
        class="q-mb-xs bg-white"
        label="Enter Weight (kg)"
      />
    </div>

    <!-- Display area, weight, and subtotal conditionally -->
    <div v-if="selectedUnit === 'sqft'" class="q-mt-md">
      <div>Area: {{ calculatedArea.toFixed(2) }} sqft</div>
      <div>Subtotal: ${{ calculatedSubtotal.toFixed(2) }}</div>
    </div>
    <div v-else-if="selectedUnit === 'kg'" class="q-mt-md">
      <div>Weight: {{ weight }} kg</div>
      <div>Subtotal: ${{ calculatedSubtotal.toFixed(2) }}</div>
    </div>

    <!-- Button to add item to transaction table -->
    <q-btn
      label="Add to Transaction"
      color="primary"
      @click="addToTransaction"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";

// Load items from the store
const transactionStore = useTransactionStore();
onMounted(async () => {
  await transactionStore.loadItems();
});


// Define categories and price types
const categories = ["Clothings", "Beddings", "Upholsteries", "Miscellaneous", "Onsite Cleaning", "New Item"];
const priceTypes = ["Current", "TBA", "Custom"];

// Reactive state for selected values and search mode
const selectedSearchItem = ref(null);
const selectedCategory = ref(null);
const selectedSubCategory = ref(null);
const selectedItem = ref(null);
const newItemName = ref(""); // Holds the custom name for a new item
const selectedPriceType = ref(null); // Holds the selected price type
const selectedProcess = ref(null); // Holds the selected process
const priceDisplay = ref(null); // Holds the price display with unit if Current is selected
const isSearchMode = ref(false);

// Unit-specific inputs
const quantity = ref(1);
const width = ref(0);
const breadth = ref(0);
const weight = ref(0);

// Computed property to check if the selected category is "New Item"
const isNewItemCategory = computed(() => selectedCategory.value === "New Item");

// Watch for isSearchMode to reset all inputs when toggling the checkbox
watch(isSearchMode, () => {
  resetAllInputs();
});

// Filter the price types based on the selected category and search mode
const filteredPriceTypes = computed(() => {
  if (isNewItemCategory.value && !isSearchMode.value) {
    return priceTypes.filter(type => type !== "Current");
  }
  return priceTypes;
});

// Function to reset all inputs when toggling modes
const resetAllInputs = () => {
  selectedCategory.value = null;
  selectedSubCategory.value = null;
  selectedItem.value = null;
  newItemName.value = "";
  selectedPriceType.value = null;
  selectedProcess.value = null;
  priceDisplay.value = null;
  selectedSearchItem.value = null;
};

// Clear search input when close icon is clicked
const clearSearch = () => {
  selectedSearchItem.value = null;
};

// Filtered list of sub-categories based on the selected category
const filteredSubCategories = computed(() => {
  if (!selectedCategory.value) return [];
  return [...new Set(transactionStore.items
    .filter(item => item.category === selectedCategory.value)
    .map(item => item.sub_category)
  )];
});

// Filtered list of items based on the selected category and sub-category
const filteredItems = computed(() => {
  if (!selectedCategory.value || !selectedSubCategory.value) return [];
  return transactionStore.items
    .filter(item => item.category === selectedCategory.value && item.sub_category === selectedSubCategory.value)
    .map(item => item.name);
});

// Filtered list of items for the search dropdown in search mode
const filteredSearchItems = ref([]);
const filterSearchItems = (val, update) => {
  if (val === "") {
    filteredSearchItems.value = [];
  } else {
    filteredSearchItems.value = transactionStore.items
      .filter(item => item.name.toLowerCase().includes(val.toLowerCase()))
      .map(item => item.name);
  }
  update();
};

// Update Process Options based on the selected item or search item
const filteredProcessOptions = ref([]);
watch([selectedItem, selectedSearchItem, isSearchMode, selectedCategory], () => {
  updateProcessOptions();
});

const updateProcessOptions = () => {
  if (isNewItemCategory.value) {
    filteredProcessOptions.value = ["Laundry", "Dry Clean", "Pressing Only", "Others"];
    return;
  }

  const itemName = isSearchMode.value ? selectedSearchItem.value : selectedItem.value;
  const item = transactionStore.items.find(i => i.name === itemName);

  filteredProcessOptions.value = item
    ? [
        item.laundry_price !== null ? "Laundry" : null,
        item.dryclean_price !== null ? "Dry Clean" : null,
        item.pressing_price !== null ? "Pressing Only" : null,
        item.others_price !== null ? "Others" : null,
      ].filter(Boolean)
    : [];
};

// Watch for changes to the price type or process and update the price field accordingly
watch([selectedPriceType, selectedProcess, selectedItem, selectedSearchItem], () => {
  updatePriceBasedOnType();
});

const updatePriceBasedOnType = () => {
  const itemName = isSearchMode.value ? selectedSearchItem.value : selectedItem.value;
  const item = transactionStore.items.find(i => i.name === itemName);

  if (selectedPriceType.value === "Custom") {
    priceDisplay.value = null;
    isPriceDisabled.value = false;
  } else if (selectedPriceType.value === "TBA") {
    priceDisplay.value = 'TBA';
    isPriceDisabled.value = true;
  } else if (selectedPriceType.value === "Current" && selectedProcess.value && item) {
    let processPrice = null;

    switch (selectedProcess.value) {
      case "Laundry":
        processPrice = item.laundry_price;
        break;
      case "Dry Clean":
        processPrice = item.dryclean_price;
        break;
      case "Pressing Only":
        processPrice = item.pressing_price;
        break;
      case "Others":
        processPrice = item.others_price;
        break;
    }

    priceDisplay.value = processPrice !== null ? `$${processPrice.toFixed(2)} / ${item.unit}` : null;
    isPriceDisabled.value = true;
  }
};

// Reactive property to disable or enable price input
const isPriceDisabled = ref(false);

// Computed property to extract only the numeric price from priceDisplay
const actualPrice = computed(() => {
  const match = priceDisplay.value ? priceDisplay.value.match(/[\d.]+/) : null;
  return match ? parseFloat(match[0]) : 0;
});

// Computed properties for area, weight, and subtotal
const calculatedArea = computed(() => {
  return selectedUnit.value === 'sqft' ? width.value * breadth.value : 0;
});

const calculatedSubtotal = computed(() => {
  if (selectedUnit.value === 'sqft') {
    return calculatedArea.value * actualPrice.value;
  } else if (selectedUnit.value === 'kg') {
    return weight.value * actualPrice.value;
  }
  return 0;
});

// Computed property for the selected item’s unit
const selectedUnit = computed(() => {
  const itemName = isSearchMode.value ? selectedSearchItem.value : selectedItem.value;
  const item = transactionStore.items.find(i => i.name === itemName);
  return item ? item.unit : null;
});

// Add item to transaction table
const addToTransaction = () => {
  let baseItemName = isSearchMode.value
    ? selectedSearchItem.value
    : isNewItemCategory.value
    ? newItemName.value
    : selectedItem.value;

  let itemQuantity = 1;
  let subtotal = 0; // Default subtotal
  let appendedDetails = "";

  if (selectedUnit.value === "pc") {
    itemQuantity = parseInt(quantity.value, 10);
    subtotal = selectedPriceType.value === "TBA" ? 0 : itemQuantity * actualPrice.value;
  } else if (selectedUnit.value === "sqft") {
    appendedDetails = ` (${calculatedArea.value.toFixed(2)} sqft)`;
    subtotal = selectedPriceType.value === "TBA" ? 0 : calculatedArea.value * actualPrice.value;
  } else if (selectedUnit.value === "kg") {
    appendedDetails = ` (${weight.value} kg)`;
    subtotal = selectedPriceType.value === "TBA" ? 0 : weight.value * actualPrice.value;
  }

  const itemName = `${baseItemName}${appendedDetails}`;

  const newItem = {
    name: itemName,
    category: selectedCategory.value,
    subCategory: selectedSubCategory.value,
    price: selectedPriceType.value === "TBA" ? "TBA" : actualPrice.value,
    unit: selectedUnit.value,
    process: selectedProcess.value,
    quantity: itemQuantity,
    subtotal, // Ensure subtotal is correctly set
  };

  transactionStore.addItem(newItem);
};

</script>
