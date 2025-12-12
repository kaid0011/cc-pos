<template>
  <div class="text-p">
    <!-- Checkbox to toggle between search and category view -->
    <q-checkbox
      v-model="searchModeActive"
      label="Search an item instead"
      class="q-my-sm"
      @update:model="resetInputs"
    />

    <!-- Conditional rendering based on the checkbox state -->
    <div v-if="searchModeActive">
      <div>Search an item...</div>
      <q-select
        v-model="selectedSearchItemName"
        :options="filteredSearchItemOptions"
        square
        dense
        outlined
        use-input
        input-debounce="300"
        class="others-input q-mb-xs bg-white"
        label="Type to search item"
        @filter="filterSearchItemsByInput"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
        <template v-slot:append>
          <q-icon name="close" @click="clearSearchInput" class="cursor-pointer" />
        </template>
      </q-select>
    </div>

    <!-- Category, Sub-category, Item, Price Type, Process, and Price displayed if not in search mode -->
    <div v-else>
      <div class="row">
        <div class="col">
          <div>Category</div>
          <q-select
            v-model="selectedCategoryName"
            :options="categoryOptions"
            square
            dense
            outlined
            input-debounce="300"
            class="others-input q-mb-xs bg-white"
            label="Select Category"
          />
        </div>
      </div>

      <!-- If "New Item" category is selected -->
      <div v-if="isNewItemSelected">
        <div>Enter New Item:</div>
        <q-input
          v-model="newItemNameInput"
          square
          dense
          outlined
          class="others-input q-mb-xs bg-white"
          placeholder="Enter item name"
        />
        <div>Unit:</div>
        <q-select
          v-model="newItemUnitType"
          :options="unitTypeOptions"
          square
          dense
          outlined
          class="others-input q-mb-xs bg-white"
          label="Select Unit"
        />
      </div>
      <div v-else>
        <div>Sub-category</div>
        <q-select
          v-model="selectedSubCategoryName"
          :options="filteredSubCategoryOptions"
          square
          dense
          outlined
          input-debounce="300"
          class="others-input q-mb-xs bg-white"
          label="Select Sub-category"
        />

        <div>Item Name:</div>
        <q-select
          v-model="selectedItemName"
          :options="filteredItemOptions"
          square
          dense
          outlined
          input-debounce="300"
          class="others-input q-mb-xs bg-white"
          label="Select Item"
        />
      </div>
    </div>

    <!-- Process Dropdown -->
    <div>Process</div>
    <q-select
      v-model="selectedProcessOption"
      :options="filteredProcessOptions"
      square
      dense
      outlined
      class="others-input q-mb-xs bg-white"
      label="Select Process"
      @update:model="calculatePriceForSelectedType"
    />

    <div class="row q-col-gutter-sm">
      <div class="col-6">
        <!-- Price Type Dropdown -->
        <div>Price Type</div>
        <q-select
          v-model="selectedPriceTypeOption"
          :options="filteredPriceTypeOptions"
          square
          dense
          outlined
          class="others-input q-mb-xs bg-white"
          label="Select Price Type"
        />
      </div>
      <div class="col-6">
        <!-- Price Input -->
        <div>Price:</div>
        <q-input
          v-model="priceInputValue"
          square
          dense
          outlined
          class="others-input q-mb-xs bg-white"
          label="Enter Price"
          :disable="isPriceInputDisabled"
        />
      </div>
    </div>

    <!-- Conditional Inputs Based on Unit -->
    <div v-if="selectedUnitType === 'pc' || (isNewItemSelected && newItemUnitType === 'pc')">
      <div>Quantity:</div>
      <q-input
        v-model="pieceQuantityInput"
        type="number"
        square
        dense
        outlined
        class="others-input q-mb-xs bg-white"
        label="Enter Quantity"
      />
    </div>

    <div
      v-else-if="selectedUnitType === 'sqft' || (isNewItemSelected && newItemUnitType === 'sqft')"
      class="row q-col-gutter-sm"
    >
      <div class="col">
        <div>Width:</div>
        <q-input
          v-model="areaWidthInput"
          type="number"
          square
          dense
          outlined
          class="others-input q-mb-xs bg-white"
          label="Enter Width (ft)"
        />
      </div>
      <div class="col">
        <div>Breadth:</div>
        <q-input
          v-model="areaBreadthInput"
          type="number"
          square
          dense
          outlined
          class="others-input q-mb-xs bg-white"
          label="Enter Breadth (ft)"
        />
      </div>
    </div>

    <div v-else-if="selectedUnitType === 'kg' || (isNewItemSelected && newItemUnitType === 'kg')">
      <div>Weight:</div>
      <q-input
        v-model="weightInput"
        type="number"
        square
        dense
        outlined
        class="others-input q-mb-xs bg-white"
        label="Enter Weight (kg)"
      />
    </div>

    <!-- Display area, weight, and subtotal conditionally -->
    <div v-if="(selectedUnitType || newItemUnitType) === 'sqft'" class="q-mt-md text-right">
      <div>Area: <span class="text-summary">{{ computedArea.toFixed(2) }} sqft</span></div>
      <div>Subtotal: <span class="text-summary">${{ computedSubtotal.toFixed(2) }}</span></div>
    </div>
    <div v-else-if="(selectedUnitType || newItemUnitType) === 'kg'" class="text-right q-mt-md">
      <div>Weight: <span class="text-summary">{{ weightInput }} kg</span></div>
      <div>Subtotal: <span class="text-summary">${{ computedSubtotal.toFixed(2) }}</span></div>
    </div>

    <!-- Button to add item to transaction table -->
    <div class="row justify-end">
      <q-btn
        class="float-right q-my-md"
        label="Add to Transaction"
        color="primary"
        @click="addTransactionItem"
      />
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";

const transactionStore = useTransactionStore();

// Data Initialization
onMounted(async () => {
  await transactionStore.loadItems();
});

const capitalizeFirst = (str) =>
  str.replace(/\b\w/g, (char) => char.toUpperCase());

// Options and Category Data
const categoryOptions = [
  "clothings",
  "beddings",
  "upholsteries",
  "miscellaneous",
  "onsite cleaning",
  "new item",
];
const priceTypeOptions = ["Current", "TBA", "Custom"];
const unitTypeOptions = ["pc", "sqft", "kg"];

// Reactive Variables
const searchModeActive = ref(false);
const selectedSearchItemName = ref(null);
const selectedCategoryName = ref(null);
const selectedSubCategoryName = ref(null);
const selectedItemName = ref(null);
const newItemNameInput = ref("");
const newItemUnitType = ref(null);
const selectedPriceTypeOption = ref(null);
const selectedProcessOption = ref(null);
const priceInputValue = ref(null);

// Input Controls for Units
const pieceQuantityInput = ref(1);
const areaWidthInput = ref(0);
const areaBreadthInput = ref(0);
const weightInput = ref(0);

// Computed Properties
const isNewItemSelected = computed(
  () => selectedCategoryName.value === "New Item"
);

const filteredPriceTypeOptions = computed(() => {
  return isNewItemSelected.value && !searchModeActive.value
    ? priceTypeOptions.filter((type) => type !== "Current")
    : priceTypeOptions;
});

const filteredSubCategoryOptions = computed(() => {
  if (!selectedCategoryName.value) return [];
  return [
    ...new Set(
      transactionStore.items
        .filter((item) => item.category === selectedCategoryName.value)
        .map((item) => item.sub_category)
    ),
  ];
});

const filteredItemOptions = computed(() => {
  if (!selectedCategoryName.value || !selectedSubCategoryName.value) return [];
  return transactionStore.items
    .filter(
      (item) =>
        item.category === selectedCategoryName.value &&
        item.sub_category === selectedSubCategoryName.value
    )
    .map((item) => item.name);
});

const filteredSearchItemOptions = ref([]);
const filterSearchItemsByInput = (searchInput, updateCallback) => {
  filteredSearchItemOptions.value =
    searchInput === ""
      ? []
      : transactionStore.items
          .filter((item) =>
            item.name.toLowerCase().includes(searchInput.toLowerCase())
          )
          .map((item) => item.name);
  updateCallback();
};

const filteredProcessOptions = ref([]);
const selectedUnitType = computed(() => {
  const itemName = searchModeActive.value
    ? selectedSearchItemName.value
    : selectedItemName.value;
  const item = transactionStore.items.find((i) => i.name === itemName);
  return item ? item.unit : null;
});

// Calculations for Area and Subtotal
const computedArea = computed(() => {
  if (
    selectedUnitType.value === "sqft" ||
    (isNewItemSelected.value && newItemUnitType.value === "sqft")
  ) {
    return areaWidthInput.value * areaBreadthInput.value;
  }
  return 0;
});

const computedSubtotal = computed(() => {
  if (
    selectedUnitType.value === "sqft" ||
    (isNewItemSelected.value && newItemUnitType.value === "sqft")
  ) {
    return computedArea.value * numericPrice.value;
  } else if (
    selectedUnitType.value === "kg" ||
    (isNewItemSelected.value && newItemUnitType.value === "kg")
  ) {
    return weightInput.value * numericPrice.value;
  }
  return 0;
});

const numericPrice = computed(() => {
  const priceMatch = priceInputValue.value
    ? priceInputValue.value.match(/[\d.]+/)
    : null;
  return priceMatch ? parseFloat(priceMatch[0]) : 0;
});

// Functions
const resetInputs = () => {
  selectedCategoryName.value = null;
  selectedSubCategoryName.value = null;
  selectedItemName.value = null;
  newItemNameInput.value = "";
  selectedPriceTypeOption.value = null;
  selectedProcessOption.value = null;
  priceInputValue.value = null;
  selectedSearchItemName.value = null;
};

const clearSearchInput = () => {
  selectedSearchItemName.value = null;
};

const updateProcessOptionsList = () => {
  const selectedItemBaseName = searchModeActive.value
    ? selectedSearchItemName.value
    : selectedItemName.value;
  const selectedItemData = transactionStore.items.find(
    (i) => i.name === selectedItemBaseName
  );

  filteredProcessOptions.value = selectedItemData
    ? [
        selectedItemData.laundry_price !== null ? "Laundry" : null,
        selectedItemData.dryclean_price !== null ? "Dry Clean" : null,
        selectedItemData.pressing_price !== null ? "Pressing Only" : null,
        selectedItemData.others_price !== null ? "Others" : null,
      ].filter(Boolean)
    : [];
};

const calculatePriceForSelectedType = () => {
  const currentItemName = searchModeActive.value
    ? selectedSearchItemName.value
    : selectedItemName.value;
  const currentItemData = transactionStore.items.find(
    (i) => i.name === currentItemName
  );

  if (selectedPriceTypeOption.value === "Custom") {
    priceInputValue.value = null;
    isPriceInputDisabled.value = false;
  } else if (selectedPriceTypeOption.value === "TBA") {
    priceInputValue.value = "TBA";
    isPriceInputDisabled.value = true;
  } else if (
    selectedPriceTypeOption.value === "Current" &&
    selectedProcessOption.value &&
    currentItemData
  ) {
    const priceMap = {
      Laundry: currentItemData.laundry_price,
      "Dry Clean": currentItemData.dryclean_price,
      "Pressing Only": currentItemData.pressing_price,
      Others: currentItemData.others_price,
    };
    const processPrice = priceMap[selectedProcessOption.value];
    priceInputValue.value =
      processPrice !== null
        ? `$${processPrice.toFixed(2)} / ${currentItemData.unit}`
        : null;
    isPriceInputDisabled.value = true;
  }
};

const isPriceInputDisabled = ref(false);

const addTransactionItem = () => {
  const unitType = isNewItemSelected.value ? newItemUnitType.value : selectedUnitType.value;

  let baseName = searchModeActive.value
    ? selectedSearchItemName.value
    : isNewItemSelected.value
    ? newItemNameInput.value
    : selectedItemName.value;

  let itemDetails = "";
  let subtotalValue = 0;

  if (unitType === "pc") {
    itemDetails = "";
    subtotalValue =
      selectedPriceTypeOption.value === "TBA"
        ? 0
        : pieceQuantityInput.value * numericPrice.value;
  } else if (unitType === "sqft") {
    itemDetails = ` (${computedArea.value.toFixed(2)} sqft)`;
    subtotalValue =
      selectedPriceTypeOption.value === "TBA"
        ? 0
        : computedArea.value * numericPrice.value;
  } else if (unitType === "kg") {
    itemDetails = ` (${weightInput.value} kg)`;
    subtotalValue =
      selectedPriceTypeOption.value === "TBA"
        ? 0
        : weightInput.value * numericPrice.value;
  }
  const tagCategory = currentItem ? currentItem.tag_category : null;

  transactionStore.addItem({
    name: `${baseName}${itemDetails}`,
    category: selectedCategoryName.value,
    subCategory: selectedSubCategoryName.value,
    tag_category: tagCategory, // Add tag_category to the item
    price: selectedPriceTypeOption.value === "TBA" ? "TBA" : numericPrice.value,
    unit: unitType,
    process: selectedProcessOption.value,
    quantity: pieceQuantityInput.value,
    subtotal: subtotalValue,
  });
};

watch(searchModeActive, resetInputs);
watch(
  [selectedPriceTypeOption, selectedProcessOption, selectedItemName, selectedSearchItemName],
  calculatePriceForSelectedType
);
watch(
  [selectedItemName, selectedSearchItemName, searchModeActive, selectedCategoryName],
  updateProcessOptionsList
);

</script>
