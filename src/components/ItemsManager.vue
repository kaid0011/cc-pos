<!-- /src/components/ItemsManager.vue -->
<template>
  <!-- 🔍 Search + Pricing Group Selector -->
  <div class="row q-mb-md justify-between q-col-gutter-x-md">
    <div class="col flex column justify-between">
      <div class="dialog-label">
        <div class="text-weight-bold text-subtitle2">Search here...</div>
      </div>
      <q-input
        v-model="searchQuery"
        placeholder="Search items..."
        dense
        outlined
        class="full-width"
      >
        <template #prepend><q-icon name="search" /></template>
        <template #append>
          <q-icon name="close" class="cursor-pointer" @click="searchQuery = ''" />
        </template>
      </q-input>
    </div>

    <!-- Pricing Group -->
    <div class="col flex column justify-between">
      <div class="dialog-label text-weight-bold text-subtitle2">
        Select Pricing Group
      </div>

      <q-select
        v-if="!isCustomerContext"
        v-model="activeGroup"
        :options="effectivePricingGroups.map((g) => ({ label: g.name, value: g.id }))"
        outlined dense emit-value map-options clearable
        @clear="resetToDefaultGroup"
      />
      <div v-else class="q-pa-sm bg-grey-2 rounded-borders">
        <q-chip square>{{ currentGroupName }}</q-chip>
      </div>
    </div>

    <!-- Button -->
    <div class="col-2 flex column justify-end">
      <q-btn
        label="Request Item"
        color="primary"
        unelevated
        class="full-width full-height"
        icon="add"
        @click="showRequestItemDialog = true"
      />
    </div>
  </div>

  <!-- Category Tabs -->
  <q-tabs
    v-if="getVisibleCategories(activeGroup).length"
    v-model="activeCategory[activeGroup]"
    dense class="bg-grey-2 text-dark q-mb-md" align="justify"
  >
    <q-tab
      v-for="cat in getVisibleCategories(activeGroup)"
      :key="cat"
      :name="cat"
      :label="`${capitalizeWords(cat)} (${getCategoryCount(activeGroup, cat)})`"
      class="tab-bordered"
    />
  </q-tabs>

  <!-- Category Panels -->
  <q-tab-panels
    v-if="getVisibleCategories(activeGroup).length"
    v-model="activeCategory[activeGroup]"
    animated
  >
    <q-tab-panel
      v-for="cat in getVisibleCategories(activeGroup)"
      :key="cat"
      :name="cat"
      class="q-pa-none"
    >
      <!-- Table Header -->
      <div class="row row-col-header text-center text-weight-bold items-stretch line-height-1">
        <div class="col-3 header-bordered flex flex-center">Name</div>
        <div class="col header-bordered flex flex-center">Sub Category</div>
        <div class="col header-bordered flex flex-center">Tag Category</div>
        <div class="col header-bordered flex flex-center">Pack Type</div>
        <div class="col header-bordered flex flex-center">T.A. Time</div>
        <div class="col-3 header-bordered flex flex-center">Service Prices</div>
        <div class="col header-bordered flex flex-center">Pcs</div>
        <div class="col header-bordered flex flex-center">Unit</div>
        <div class="col header-bordered flex flex-center">Company</div>
      </div>

      <!-- No Items -->
      <div
        v-if="filteredItems(activeGroup, cat).length === 0"
        class="text-center text-grey q-pa-lg text-h6 bg-grey-1"
      >
        No items found.
      </div>

      <!-- Items -->
      <template v-else>
        <div
          v-for="(item, idx) in filteredItems(activeGroup, cat)"
          :key="item.id"
          class="row row-col-row"
          :class="[idx % 2 === 0 ? 'bg-white' : 'bg-grey-1']"
        >
          <!-- Item Name + Actions -->
          <div class="col-3 bordered">
            <div>{{ item.name }}</div>
            <div>
              <q-btn
                unelevated dense outline class="q-px-md q-mt-sm"
                label="Update" color="primary"
                @click="openUpdateDialog(item)"
              />
            </div>
          </div>

          <!-- Sub Category -->
          <div class="col bordered">{{ capitalizeWords(item.sub_category) }}</div>

          <!-- Tag/Pack/TA -->
          <div class="col bordered text-center">{{ capitalizeWords(item.tag_category) }}</div>
          <div class="col bordered text-center">{{ capitalizeWords(item.pack_type) }}</div>
          <div class="col bordered text-center">{{ item.turnaround_time }}</div>

          <!-- Service Prices -->
          <div class="col-3 bordered q-px-sm">
            <div
              v-for="(rate, rIdx) in resolveServicePrices(item)"
              :key="rate.id ?? rIdx"
              class="q-mb-xs"
            >
              <div class="price-border">
                <div class="row justify-between service-prices q-pa-xs">
                  <div>
                    {{ capitalizeWords(rate.service_type) }}:
                    <span class="text-weight-bold text-red-9">
                      ${{ formatPrice(rate.price) }}
                    </span>
                  </div>
                  <div>
                    <q-badge :color="rate.is_active ? 'positive' : 'negative'">
                      {{ rate.is_active ? "Active" : "Inactive" }}
                    </q-badge>
                  </div>
                </div>
                <div class="q-ma-xs">
                  <q-badge
                    v-for="day in rate.applicable_days"
                    :key="`${rIdx}-${day}`"
                    :color="dayOptions.find((d) => d.value === day)?.color || 'grey'"
                    text-color="white"
                    class="q-mr-xs"
                  >
                    {{ capitalizeWords(day) }}
                  </q-badge>
                </div>
              </div>
            </div>
          </div>

          <!-- Pieces / Unit / Company -->
          <div class="col bordered text-center">{{ item.pieces }}</div>
          <div class="col bordered text-center">{{ item.unit }}</div>
          <div class="col bordered text-center text-uppercase">{{ item.company }}</div>
        </div>
      </template>
    </q-tab-panel>
  </q-tab-panels>

  <div
    v-if="getVisibleCategories(activeGroup).length === 0"
    class="text-center text-grey q-pa-xl bg-grey-1 rounded-borders"
  >
    {{ searchQuery ? 'No items match your search.' : 'No items available.' }}
  </div>

  <!-- 🔹 Dialogs -->
<UpdateItemDialog
  v-model="showUpdateItemDialog"
  context="item"
  :selected-item="selectedItem"
  :active-group="activeGroup"
  @updated="refreshItemsForAllGroups"
  @delete-request="openDeleteItemDialog"
/>


  <DeleteItemDialog
    v-model="showDeleteItemDialog"
    :selected-item="selectedItem"
    :active-group="activeGroup"
    @deleted="refreshItemsForAllGroups"
  />

  <DeactivateItemDialog
    v-model="showDeactivateItemDialog"
    :selected-item="selectedItem"
    :active-group="activeGroup"
    @deactivated="refreshItemsForAllGroups"
  />

  <ReactivateItemDialog
    v-model="showReactivateItemDialog"
    :selected-item="selectedItem"
    :active-group="activeGroup"
    @reactivated="refreshItemsForAllGroups"
  />

  <RequestItemDialog
    v-model="showRequestItemDialog"
    :active-group="activeGroup"
    @requested="onItemRequested"
  />
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useQuasar } from "quasar";
import { fetchPricingGroups, fetchItemsByGroup } from "@/../supabase/api/item_list.js";

import UpdateItemDialog from "@/components/dialogs/UpdateItemDialog.vue";
import DeleteItemDialog from "@/components/dialogs/DeleteItemDialog.vue";
import DeactivateItemDialog from "@/components/dialogs/DeactivateItemDialog.vue";
import ReactivateItemDialog from "@/components/dialogs/ReactivateItemDialog.vue";
import RequestItemDialog from "@/components/dialogs/RequestItemDialog.vue";

const $q = useQuasar();

const pricingGroups = ref([]);
const itemsByGroup = ref({});
const searchQuery = ref("");

const props = defineProps({
  defaultGroupId: { type: [String, Number], default: null },
});
const isCustomerContext = computed(() => !!props.defaultGroupId);
const activeGroup = ref(props.defaultGroupId);

const showUpdateItemDialog = ref(false);
const showDeleteItemDialog = ref(false);
const showDeactivateItemDialog = ref(false);
const showReactivateItemDialog = ref(false);
const showRequestItemDialog = ref(false);

const selectedItem = ref({});

const activeCategory = ref({});
const categoriesByGroup = ref({});
const itemsByGroupAndCategory = ref({});

function onItemRequested() {
  $q.notify({ type: "info", message: "Request sent for admin approval." });
}

const dayOptions = [
  { label: "Monday", value: "mon", color: "yellow-9" },
  { label: "Tuesday", value: "tue", color: "indigo-6" },
  { label: "Wednesday", value: "wed", color: "teal-6" },
  { label: "Thursday", value: "thu", color: "blue-6" },
  { label: "Friday", value: "fri", color: "purple-5" },
  { label: "Saturday", value: "sat", color: "orange-9" },
  { label: "Sunday", value: "sun", color: "red-5" },
  { label: "Holiday", value: "holiday", color: "purple-5" },
  { label: "All", value: "all", color: "grey-7" },
];

const effectivePricingGroups = computed(() => {
  if (!pricingGroups.value?.length) return [];
  if (isCustomerContext.value) {
    return pricingGroups.value.filter((g) => String(g.id) === String(props.defaultGroupId));
  }
  return pricingGroups.value;
});

const currentGroupName = computed(() => {
  const g = effectivePricingGroups.value[0];
  return g ? g.name : "Unknown Group";
});

onMounted(async () => {
  pricingGroups.value = await fetchPricingGroups();

  if (isCustomerContext.value && props.defaultGroupId) {
    activeGroup.value = props.defaultGroupId;
  } else {
    const def = pricingGroups.value.find((g) => g.name === "Default");
    activeGroup.value = def ? def.id : pricingGroups.value[0]?.id ?? null;
  }

  await refreshItemsForAllGroups();
});

function formatPrice(val) {
  const n = Number(val);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

function filteredItems(groupId, category) {
  const items = itemsByGroup.value[groupId] || [];
  const query = (searchQuery.value ?? "").toLowerCase();

  return items.filter((item) => {
    const cat = (item.category && item.category.trim() !== "" ? item.category : "Uncategorized");
    const matchesCategory = cat === category;
    const matchesSearch = !query || (item.name || "").toLowerCase().includes(query);
    return matchesCategory && matchesSearch && resolveServicePrices(item).length > 0;
  });
}

function getCategoryCount(groupId, category) {
  return filteredItems(groupId, category).length;
}

async function refreshItemsForAllGroups() {
  for (const group of effectivePricingGroups.value) {
    const items = await fetchItemsByGroup(group.id);

    const groupedByCategory = {};
    items.forEach((item) => {
      const category = item.category?.trim() || "Uncategorized";
      if (!groupedByCategory[category]) groupedByCategory[category] = [];
      groupedByCategory[category].push(item);
    });

    categoriesByGroup.value[group.id] = Object.keys(groupedByCategory);
    itemsByGroupAndCategory.value[group.id] = groupedByCategory;
    itemsByGroup.value[group.id] = items;

    const vis = getVisibleCategories(group.id);
    activeCategory.value[group.id] = vis[0] || null;
  }
}

function resolveServicePrices(item) {
  return (item.pricing_group_rates || [])
    .filter((rate) => String(rate.pricing_group_id) === String(activeGroup.value))
    .map((rate) => ({
      id: rate.id,
      service_type: rate.service_type,
      price: rate.price ?? 0,
      is_active: rate.is_active ?? true,
      applicable_days: Array.isArray(rate.applicable_days)
        ? rate.applicable_days
        : (() => {
            try {
              return JSON.parse(rate.applicable_days || "[]");
            } catch {
              return [];
            }
          })(),
    }));
}

function capitalizeWords(str) {
  if (!str) return "";
  return String(str).split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function resetToDefaultGroup() {
  const def = effectivePricingGroups.value.find((g) => g.name === "Default");
  if (def) activeGroup.value = def.id;
}

function openUpdateDialog(item) {
  selectedItem.value = { ...item };
  showUpdateItemDialog.value = true;
}

function openDeleteItemDialog(item) {
  selectedItem.value = { ...item };
  showDeleteItemDialog.value = true;
}

function getVisibleCategories(groupId) {
  const cats = categoriesByGroup.value[groupId] || [];
  return cats.filter((cat) => getCategoryCount(groupId, cat) > 0);
}

watch([activeGroup, searchQuery], () => {
  const vis = getVisibleCategories(activeGroup.value);
  if (!vis.includes(activeCategory.value[activeGroup.value])) {
    activeCategory.value[activeGroup.value] = vis[0] || null;
  }
});

watch(
  () => props.defaultGroupId,
  async (val) => {
    if (val) {
      activeGroup.value = val;
      await refreshItemsForAllGroups();
    }
  },
  { immediate: false }
);
</script>
