<!-- /src/components/SimpleItemForm.vue -->
<template>
  <div class="q-gutter-y-md">
    <div>
      <div class="dialog-label">
        Item Name:<span class="dialog-asterisk">*</span>
      </div>
      <q-input
        v-model="itemName"
        outlined
        dense
        class="bg-white"
      />
    </div>

    <div class="row q-col-gutter-x-sm">
      <div class="col">
      <div class="dialog-label">
        Category:<span class="dialog-asterisk">*</span>
      </div>
        <q-select
          v-model="selectedCategory"
          :options="categoryOptions"
          map-options
          emit-value
          outlined
          dense
          class="bg-white"
          @update:model-value="selectedSubCategory = null"
        />
      </div>
      <div class="col">
      <div class="dialog-label">
       Sub-category:<span class="dialog-asterisk">*</span>
      </div>
        <q-select
          v-model="selectedSubCategory"
          :options="subCategoryOptions"
          map-options
          emit-value
          :disable="!selectedCategory"
          outlined
          dense
          class="bg-white"
        />
      </div>
    </div>

    <div class="row q-col-gutter-x-sm">
      <div class="col">
      <div class="dialog-label">
        Pieces:<span class="dialog-asterisk">*</span>
      </div>
        <q-input
          v-model.number="pieces"
          type="number"
          min="0"
          outlined
          dense
          class="bg-white"
        />
      </div>
      <div class="col">
      <div class="dialog-label">
        Process:<span class="dialog-asterisk">*</span>
      </div>
        <q-select
          v-model="selectedProcess"
          :options="processOptions"
          outlined
          dense
          class="bg-white"
        />
      </div>
      <div class="col">
      <div class="dialog-label">
        Unit:<span class="dialog-asterisk">*</span>
      </div>
        <q-select
          v-model="unit"
          :options="unitOptions"
          outlined
          dense
          label="pc / kg / sqft"
          class="bg-white"
        />
      </div>
    </div>

    <div class="row q-col-gutter-x-sm">
      <div class="col">
      <div class="dialog-label">
        Price:<span class="dialog-asterisk">*</span>
      </div>
        <q-input
          v-model.number="price"
          type="number"
          min="0"
          outlined
          dense
          prefix="$"
          class="bg-white"
        />
      </div>

      <!-- pc -->
      <div v-if="unit === 'pc'" class="col">
      <div class="dialog-label">
        Quantity:<span class="dialog-asterisk">*</span>
      </div>
        <q-input
          v-model.number="quantityInput"
          type="number"
          min="0"
          outlined
          dense
          class="bg-white"
        />
      </div>

      <!-- sqft -->
      <div v-if="unit === 'sqft'" class="col">
      <div class="dialog-label">
        Width (ft):<span class="dialog-asterisk">*</span>
      </div>
        <q-input
          v-model.number="width"
          type="number"
          min="0"
          outlined
          dense
          class="bg-white"
        />
      </div>
      <div v-if="unit === 'sqft'" class="col">
      <div class="dialog-label">
        Breadth (ft):<span class="dialog-asterisk">*</span>
      </div>
        <q-input
          v-model.number="breadth"
          type="number"
          min="0"
          outlined
          dense
          class="bg-white"
        />
      </div>

      <!-- kg -->
      <div v-if="unit === 'kg'" class="col">
      <div class="dialog-label">
        Weight (kg):<span class="dialog-asterisk">*</span>
      </div>
        <q-input
          v-model.number="weight"
          type="number"
          min="0"
          outlined
          dense
          class="bg-white"
        />
      </div>
    </div>

    <div class="row items-center justify-between">
      <div class="text-caption">
        Subtotal preview:
        <span class="text-weight-medium"
          >${{ subtotalPreview.toFixed(2) }}</span
        >
        <span v-if="unit === 'sqft' && area > 0" class="q-ml-sm"
          >(Area: {{ area.toFixed(2) }} sqft)</span
        >
        <span v-if="unit === 'kg' && weight > 0" class="q-ml-sm"
          >(Weight: {{ Number(weight).toFixed(2) }} kg)</span
        >
        <span v-if="unit === 'pc' && quantityInput > 0" class="q-ml-sm"
          >(Qty: {{ quantityInput }})</span
        >
      </div>
      <q-btn
        unelevated
        color="primary"
        label="Add to Transaction"
        @click="addTransactionItem"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";

const $q = useQuasar();
const transactionStore = useTransactionStore();

onMounted(async () => {
  await transactionStore.loadItems?.();
});

const itemName = ref("");
const selectedCategory = ref(null);
const selectedSubCategory = ref(null);
const selectedProcess = ref(null);

const rawCategories = [
  "clothings",
  "beddings",
  "upholsteries",
  "miscellaneous",
  "onsite cleaning",
  "new item",
];

const categoryOptions = computed(() =>
  rawCategories.map((v) => ({ label: toTitleCase(v), value: v }))
);

const unitOptions = ["pc", "kg", "sqft"];
const unit = ref("pc");

const price = ref(null);

// pc
const quantityInput = ref(null);

// sqft
const width = ref(null);
const breadth = ref(null);

// kg
const weight = ref(null);

// pieces: applies to all units (display-only)
const pieces = ref(null);

const processOptions = ["Laundry", "Dry Clean", "Pressing Only", "Others"];

/* Sub-category options with Title Case labels, raw values preserved */
const subCategoryOptions = computed(() => {
  const items = transactionStore.items || [];
  if (!selectedCategory.value) return [];
  const uniques = Array.from(
    new Set(
      items
        .filter((i) => i.category === selectedCategory.value)
        .map((i) => i.sub_category)
        .filter(Boolean)
    )
  );
  return uniques.map((v) => ({ label: toTitleCase(String(v)), value: v }));
});

const area = computed(() => {
  if (unit.value !== "sqft") return 0;
  const w = Number(width.value) || 0;
  const b = Number(breadth.value) || 0;
  return w * b;
});

/* DB quantity mapping (pieces never affects quantity). */
const quantityForDB = computed(() => {
  if (unit.value === "pc") return Number(quantityInput.value) || 0;
  if (unit.value === "sqft") return area.value || 0;
  if (unit.value === "kg") return Number(weight.value) || 0;
  return 0;
});

const subtotalPreview = computed(() => {
  const p = Number(price.value) || 0;
  return p * (Number(quantityForDB.value) || 0);
});

function addTransactionItem() {
  if (!itemName.value) return notifyWarn("Item Name is required.");
  if (!selectedCategory.value) return notifyWarn("Category is required.");
  if (!selectedProcess.value) return notifyWarn("Process is required.");
  const p = Number(price.value);
  if (!(p >= 0)) return notifyWarn("Price must be a non-negative number.");

  if (unit.value === "pc") {
    if (!((Number(quantityInput.value) || 0) > 0))
      return notifyWarn("Enter positive Quantity for pc.");
  } else if (unit.value === "sqft") {
    if (!((Number(width.value) || 0) > 0 && (Number(breadth.value) || 0) > 0)) {
      return notifyWarn("Enter positive Width and Breadth.");
    }
  } else if (unit.value === "kg") {
    if (!((Number(weight.value) || 0) > 0))
      return notifyWarn("Enter positive Weight.");
  }

  const match = (transactionStore.items || []).find(
    (i) =>
      i.category === selectedCategory.value &&
      i.sub_category === selectedSubCategory.value
  );
  const tagCategory = match?.tag_category ?? null;

  transactionStore.addItem?.({
    name: itemName.value,
    category: selectedCategory.value,
    subCategory: selectedSubCategory.value || null, // raw value
    tag_category: tagCategory,
    process: selectedProcess.value,
    unit: unit.value,
    price: p,
    quantity: Number(quantityForDB.value),
    pieces: Number(pieces.value) || 0,
    subtotal: subtotalPreview.value,
  });

  resetInputs();
}

function resetInputs() {
  itemName.value = "";
  selectedCategory.value = null;
  selectedSubCategory.value = null;
  selectedProcess.value = null;
  unit.value = "pc";
  price.value = null;
  quantityInput.value = null;
  width.value = null;
  breadth.value = null;
  weight.value = null;
  pieces.value = null;
}

function notifyWarn(message) {
  $q?.notify?.({ type: "warning", message });
}

function toTitleCase(s) {
  return s.replace(
    /\w\S*/g,
    (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()
  );
}
</script>

<style scoped>
/* Minimal */
</style>
