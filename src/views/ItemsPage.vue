<template>
  <div class="full-container items-management">
    <!-- 🔍 Search + Pricing Group Selector -->
    <div class="row items-center justify-between q-mb-md">
      <!-- Search -->
      <div class="col-3">
        <div class="dialog-label">
          <div class="text-weight-bold text-subtitle2">Search here...</div>
        </div>
        <q-input
          v-model="searchQuery"
          placeholder="Search items..."
          square
          dense
          outlined
          class="search-input col-6"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-icon
              name="close"
              class="cursor-pointer"
              @click="searchQuery = ''"
            />
          </template>
        </q-input>
      </div>

      <!-- Pricing Group -->
      <div class="col-3">
        <div class="dialog-label">
          <div class="text-weight-bold text-subtitle2">Select Pricing Group</div>
        </div>
        <q-select
          v-model="activeGroup"
          :options="pricingGroups.map((g) => ({ label: g.name, value: g.id }))"
          outlined
          dense
          emit-value
          map-options
          label="Select Pricing Group"
          clearable
          @clear="resetToDefaultGroup"
        />
      </div>
    </div>

    <!-- Category Tabs -->
    <q-tabs
      v-if="
        categoriesByGroup[activeGroup] && categoriesByGroup[activeGroup].length
      "
      v-model="activeCategory[activeGroup]"
      dense
      class="bg-grey-3 text-dark shadow-1"
      align="justify"
    >
      <q-tab
        v-for="cat in categoriesByGroup[activeGroup]"
        :key="cat"
        :name="cat"
        :label="`${capitalizeWords(cat)} (${getCategoryCount(
          activeGroup,
          cat
        )})`"
        class="q-py-sm"
      />
    </q-tabs>

    <!-- Category Panels -->
    <q-tab-panels
      v-if="
        categoriesByGroup[activeGroup] && categoriesByGroup[activeGroup].length
      "
      v-model="activeCategory[activeGroup]"
      animated
    >
      <q-tab-panel
        v-for="cat in categoriesByGroup[activeGroup]"
        :key="cat"
        :name="cat"
        class="q-pa-none"
      >
        <!-- Table Header -->
        <div class="row row-col-header text-center q-px-md text-weight-bold">
          <div class="col bordered">Name</div>
          <div class="col-2 bordered">Sub Category</div>
          <div class="col-2 bordered">Service Prices</div>
          <div class="col-1 bordered">Pcs</div>
          <div class="col-1 bordered">Unit</div>
          <div class="col-2 bordered">Actions</div>
        </div>

        <!-- No Items -->
        <div
          v-if="filteredItems(activeGroup, cat).length === 0"
          class="text-center text-grey q-pa-lg text-h6 bg-grey-1"
        >
          No items found.
        </div>

        <!-- Items -->
        <div
          v-else
          v-for="(item, idx) in filteredItems(activeGroup, cat)"
          :key="item.id"
          class="row row-col-row"
          :class="[idx % 2 === 0 ? 'bg-white' : 'bg-grey-1']"
        >
          <!-- Item Name -->
          <div class="col bordered">
            {{ item.name }}
            <q-badge
              v-if="!item.is_active"
              color="negative"
              label="Inactive"
              class="q-ml-sm"
            />
          </div>

          <!-- Sub Category -->
          <div class="col-2 bordered">
            {{ capitalizeWords(item.sub_category) }}
          </div>

          <!-- Service Prices -->
          <div class="col-2 bordered">
            <div
              v-for="(rate, idx) in resolveServicePrices(item)"
              :key="rate.service_type"
            >
              {{ capitalizeWords(rate.service_type) }}:
              <span class="text-weight-bold text-red-9">
                ${{ rate.price.toFixed(2) }}
              </span>
              <q-separator
                v-if="idx < resolveServicePrices(item).length - 1"
                class="q-my-xs"
              />
            </div>
          </div>

          <!-- Pieces -->
          <div class="col-1 bordered text-center">{{ item.pieces }}</div>

          <!-- Unit -->
          <div class="col-1 bordered text-center">{{ item.unit }}</div>

          <!-- Actions -->
          <div class="col-2 bordered text-center">
            <q-btn
              unelevated
              dense
              class="col-12 full-width q-px-sm q-mb-xs"
              label="Update"
              color="primary"
              @click="openUpdateDialog(item)"
              :disable="!item.is_active"
            />
            <q-btn
              unelevated
              class="col-12 full-width q-px-sm"
              dense
              :label="item.is_active ? 'Deactivate' : 'Reactivate'"
              :color="item.is_active ? 'negative' : 'positive'"
              @click="
                item.is_active
                  ? openDeactivateDialog(item)
                  : openReactivateDialog(item)
              "
            />
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- ✅ Update Item Dialog -->
<q-dialog v-model="showUpdateItemDialog" persistent>
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
      <q-form @submit="updateItem">
        <!-- Name -->
        <q-input
          v-model="selectedItem.name"
          label="Item Name"
          outlined
          dense
          class="q-mb-md"
        />

<!-- Category -->
<q-select
  v-model="selectedItem.category"
  :options="categoryOptions"
  label="Category"
  outlined
  dense
  emit-value
  map-options
  class="q-mb-md"
  @update:model-value="(val) => {
    selectedItem.sub_category = null;  
    loadSubCategoryOptions(val);     
  }"
/>

<!-- Sub Category -->
<q-select
  v-model="selectedItem.sub_category"
  :options="subCategoryOptions"
  label="Sub Category"
  outlined
  dense
  emit-value
  map-options
  class="q-mb-md"
  :disable="!selectedItem.category"
/>


        <!-- Unit -->
        <q-select
          v-model="selectedItem.unit"
          :options="unitOptions"
          label="Unit"
          outlined
          dense
          emit-value
          map-options
          class="q-mb-md"
        />

        <!-- Pieces -->
        <q-input
          v-model.number="selectedItem.pieces"
          label="Pieces"
          type="number"
          outlined
          dense
          class="q-mb-md"
        />

        <!-- Service Prices -->
        <div class="q-mb-md">
          <div class="dialog-label">Service Prices</div>
          <div
            v-for="(rate, idx) in selectedItem.servicePrices"
            :key="idx"
            class="row q-col-gutter-md q-mb-sm items-center"
          >
            <div class="col-5">
              <q-select
                v-model="selectedItem.servicePrices[idx].service_type"
                :options="getAvailableServiceTypeOptions(idx)"
                label="Service Type"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-5">
              <q-input
                v-model.number="selectedItem.servicePrices[idx].price"
                type="number"
                outlined
                dense
                label="Price"
              />
            </div>
            <div class="col-2 text-right">
              <q-btn
                dense
                flat
                round
                icon="delete"
                color="negative"
                @click="markServiceRowDeleted(idx)"
              />
            </div>
          </div>
          <q-btn
            flat
            dense
            icon="add"
            label="Add Service Type"
            color="primary"
            @click="addServiceRowUpdate"
          />
        </div>

        <!-- Actions -->
        <q-card-actions align="between">
          <q-btn
            color="negative"
            outline
            label="Delete Item"
            @click="openDeleteItemDialog"
          />
          <q-btn color="primary" type="submit" label="Update Item" />
        </q-card-actions>
      </q-form>
    </q-card-section>
  </q-card>
</q-dialog>

    <!-- ✅ Deactivate / Reactivate Dialogs -->
    <q-dialog v-model="showDeactivateItemDialog" persistent>
      <q-card>
        <q-card-section class="text-h6">Deactivate Item</q-card-section>
        <q-card-section>
          Are you sure you want to deactivate this item?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showDeactivateItemDialog = false" />
          <q-btn color="negative" label="Deactivate" @click="deactivateItemAction" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showReactivateItemDialog" persistent>
      <q-card>
        <q-card-section class="text-h6">Reactivate Item</q-card-section>
        <q-card-section>
          Are you sure you want to reactivate this item?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showReactivateItemDialog = false" />
          <q-btn color="positive" label="Reactivate" @click="reactivateItemAction" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ✅ Delete Confirmation -->
    <q-dialog v-model="showDeleteItemDialog" persistent>
      <q-card>
        <q-card-section class="text-h6 text-negative">Delete Item</q-card-section>
        <q-card-section>
          ⚠️ This will permanently delete <b>{{ selectedItem.name }}</b> and its
          prices. Continue?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showDeleteItemDialog = false" />
          <q-btn color="negative" label="Delete" @click="deleteItemAction" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>


<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import { supabase } from "@/../supabase/config.js";
import {
  fetchPricingGroups,
  fetchItemsByGroup,
  createItem,
  updateItems,
  deactivateItem,
  reactivateItem,
  deleteItem,
} from "@/../supabase/api/item_list.js";

const $q = useQuasar();

// State
const pricingGroups = ref([]);
const activeGroup = ref(null);
const itemsByGroup = ref({});
const searchQuery = ref("");
const showAddItemDialog = ref(false);
const showUpdateItemDialog = ref(false);
const showDeactivateItemDialog = ref(false);
const showReactivateItemDialog = ref(false);
const itemToDeactivate = ref(null);
const itemToReactivate = ref(null);
const newItem = ref({});
const selectedItem = ref({});

// Each group will have its own active category
const activeCategory = ref({});
const categoriesByGroup = ref({});
const itemsByGroupAndCategory = ref({});

onMounted(async () => {
  pricingGroups.value = await fetchPricingGroups();

  if (pricingGroups.value.length > 0) {
    const defaultGroup = pricingGroups.value.find((g) => g.name === "Default");
    activeGroup.value = defaultGroup ? defaultGroup.id : pricingGroups.value[0].id;

    await refreshItemsForAllGroups();
  }

  await loadCategoryOptions();
});

function filteredItems(groupId, category) {
  const items = itemsByGroup.value[groupId] || [];
  const query = (searchQuery.value ?? "").toString().toLowerCase();

  return items.filter((item) => {
    const matchesCategory =
      (item.category && item.category.trim() !== ""
        ? item.category
        : "Uncategorized") === category;
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      (item.sub_category || "").toLowerCase().includes(query);

    // ✅ Check if it has at least one price
    const hasPrices = resolveServicePrices(item).length > 0;

    return matchesCategory && matchesSearch && hasPrices;
  });
}

function getCategoryCount(groupId, category) {
  return filteredItems(groupId, category).length;
}

// Lifecycle
onMounted(async () => {
  await loadGroupsAndItems();
});

// Get current logged-in user email
async function getCurrentUserEmail() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email || "unknown";
}

// Fetch groups + their items
async function loadGroupsAndItems() {
  pricingGroups.value = await fetchPricingGroups();
  if (pricingGroups.value.length > 0) {
    activeGroup.value = pricingGroups.value[0].id;
    await refreshItemsForAllGroups();
  }
}

async function refreshItemsForAllGroups() {
  for (const group of pricingGroups.value) {
    const items = await fetchItemsByGroup(group.id);

    // group items by category
    const groupedByCategory = {};
    items.forEach((item) => {
      const category =
        item.category && item.category.trim() !== ""
          ? item.category
          : "Uncategorized";
      if (!groupedByCategory[category]) {
        groupedByCategory[category] = [];
      }
      groupedByCategory[category].push(item);
    });

    categoriesByGroup.value[group.id] = Object.keys(groupedByCategory);
    activeCategory.value[group.id] = categoriesByGroup.value[group.id][0];
    itemsByGroupAndCategory.value[group.id] = groupedByCategory;
    itemsByGroup.value[group.id] = items; // store raw items too
  }
}

// Add Item
const addItem = async () => {
  try {
    const userEmail = await getCurrentUserEmail();
    await createItem(newItem.value, activeGroup.value, userEmail);

    $q.notify({ type: "positive", message: "Item added successfully" });
    showAddItemDialog.value = false;
    await refreshItemsForAllGroups();
  } catch (error) {
    console.error(error);

    // Handle duplicate name error
    if (error.message?.includes("duplicate key value")) {
      $q.notify({
        type: "warning",
        message: `Item "${newItem.value.name}" already exists. Please use a different name.`,
      });
    } else {
      $q.notify({ type: "negative", message: "Failed to add item" });
    }
  }
};

// Update Item
const updateItem = async () => {
  try {
    const userEmail = await getCurrentUserEmail();

    const payload = {
      ...selectedItem.value,
      servicePrices: selectedItem.value.servicePrices || [],
      deletedServiceTypes: selectedItem.value.deletedServiceTypes || [],
    };

    await updateItems(payload, activeGroup.value, userEmail);

    $q.notify({ type: "positive", message: "Item updated successfully" });
    showUpdateItemDialog.value = false;
    await refreshItemsForAllGroups();
  } catch (error) {
    console.error(error);
    $q.notify({ type: "negative", message: "Failed to update item" });
  }
};

// Deactivate Item
const deactivateItemAction = async () => {
  try {
    const userEmail = await getCurrentUserEmail();
    await deactivateItem(
      itemToDeactivate.value.id,
      activeGroup.value,
      userEmail
    );
    $q.notify({ type: "positive", message: "Item deactivated" });
    showDeactivateItemDialog.value = false;
    await refreshItemsForAllGroups();
  } catch (error) {
    $q.notify({ type: "negative", message: "Failed to deactivate item" });
  }
};

// Reactivate Item
const reactivateItemAction = async () => {
  try {
    const userEmail = await getCurrentUserEmail();
    await reactivateItem(
      itemToReactivate.value.id,
      activeGroup.value,
      userEmail
    );
    $q.notify({ type: "positive", message: "Item reactivated" });
    showReactivateItemDialog.value = false;
    await refreshItemsForAllGroups();
  } catch (error) {
    console.error(error);
    $q.notify({ type: "negative", message: "Failed to reactivate item" });
  }
};

function capitalizeWords(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const openUpdateDialog = (item) => {
  selectedItem.value = { ...item };

  // Build servicePrices from pricing_group_rates of the active group
  if (item.pricing_group_rates && item.pricing_group_rates.length > 0) {
    selectedItem.value.servicePrices = item.pricing_group_rates
      .filter((rate) => rate.group_id === activeGroup.value) // only active group
      .map((rate) => ({
        service_type: rate.service_type,
        price: rate.price,
      }));
  } else {
    selectedItem.value.servicePrices = [];
  }

  showUpdateItemDialog.value = true;
};

const openDeactivateDialog = (item) => {
  itemToDeactivate.value = item;
  showDeactivateItemDialog.value = true;
};

const openReactivateDialog = (item) => {
  itemToReactivate.value = item;
  showReactivateItemDialog.value = true;
};

const serviceTypeOptions = [
  { label: "Laundry", value: "laundry" },
  { label: "Dry Clean", value: "dry clean" },
  { label: "Pressing", value: "pressing" },
  { label: "Others", value: "others" },
];

function resetForm() {
  newItem.value = {
    name: "",
    category: "",
    sub_category: "",
    unit: "",
    pieces: 1,
    servicePrices: [{ service_type: "laundry", price: 0 }],
  };
}

function addServiceRow() {
  if (!newItem.value.servicePrices) {
    newItem.value.servicePrices = [];
  }
  newItem.value.servicePrices.push({ service_type: null, price: 0 });
}

const categoryOptions = ref([]);
const subCategoryOptions = ref([]);
const unitOptions = ref([
  { label: "Piece (pc)", value: "pc" },
  { label: "Kilogram (kg)", value: "kg" },
  { label: "Square Foot (sqft)", value: "sqft" },
]);

onMounted(async () => {
  await loadCategoryOptions();
});

async function loadCategoryOptions() {
  const { data, error } = await supabase
    .from("pricing_items")
    .select("category")
    .neq("category", "")
    .order("category", { ascending: true });

  if (!error && data) {
    const unique = [...new Set(data.map((row) => row.category))];
    categoryOptions.value = unique.map((c) => ({
      label: capitalizeWords(c),
      value: c,
    }));
  }
}

async function loadSubCategoryOptions(category) {
  const { data, error } = await supabase
    .from("pricing_items")
    .select("sub_category")
    .eq("category", category)
    .neq("sub_category", "")
    .order("sub_category", { ascending: true });

  if (!error && data) {
    const unique = [...new Set(data.map((row) => row.sub_category))];
    subCategoryOptions.value = unique.map((sc) => ({
      label: capitalizeWords(sc),
      value: sc,
    }));
  }
}

function markServiceRowDeleted(index) {
  const removed = selectedItem.value.servicePrices[index];
  if (removed && removed.service_type) {
    if (!selectedItem.value.deletedServiceTypes) {
      selectedItem.value.deletedServiceTypes = [];
    }
    selectedItem.value.deletedServiceTypes.push(removed.service_type);
  }
  selectedItem.value.servicePrices.splice(index, 1);
}

function addServiceRowUpdate() {
  if (!selectedItem.value.servicePrices) {
    selectedItem.value.servicePrices = [];
  }
  selectedItem.value.servicePrices.push({ service_type: null, price: 0 });
}

function getAvailableServiceTypeOptions(currentIdx) {
  const usedTypes = selectedItem.value.servicePrices
    .map((rate, idx) => (idx !== currentIdx ? rate.service_type : null))
    .filter(Boolean);

  return serviceTypeOptions.filter((opt) => !usedTypes.includes(opt.value));
}

const showDeleteItemDialog = ref(false);

const openDeleteItemDialog = () => {
  showDeleteItemDialog.value = true;
};

const deleteItemAction = async () => {
  try {
    const userEmail = await getCurrentUserEmail();

    // find group name by activeGroup id
    const activeGroupObj = pricingGroups.value.find(
      (g) => g.id === activeGroup.value
    );
    const groupName = activeGroupObj?.name || "Unknown Group";

    const success = await deleteItem(selectedItem.value, groupName, userEmail);

    if (success) {
      $q.notify({ type: "positive", message: "Item deleted successfully" });
      showDeleteItemDialog.value = false;
      showUpdateItemDialog.value = false;
      await refreshItemsForAllGroups();
    }
  } catch (error) {
    console.error(error);
    $q.notify({ type: "negative", message: "Failed to delete item" });
  }
};

function resolveServicePrices(item) {
  const activeGroupId = activeGroup.value;

  if (!activeGroupId) return [];

  // ✅ Only show prices belonging to the active group
  return (item.pricing_group_rates || [])
    .filter((rate) => rate.group_id === activeGroupId)
    .map((rate) => ({
      service_type: rate.service_type,
      price: rate.price || 0,
    }));
}

function resetToDefaultGroup() {
  const defaultGroup = pricingGroups.value.find((g) => g.name === "Default");
  if (defaultGroup) {
    activeGroup.value = defaultGroup.id;
  }
}
</script>
