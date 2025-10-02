<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="input-dialog">
      <q-card-section class="dialog-header">
        <q-btn
          icon="close"
          flat
          dense
          round
          class="absolute-top-right q-ma-sm"
          @click="closeDialog"
        />
        <div class="text-body1 text-uppercase text-weight-bold">
          Update Item
        </div>
      </q-card-section>

      <q-card-section class="dialog-body">
        <q-form @submit.prevent="handleUpdate">
          <!-- Name -->
          <div class="dialog-label">
            Item Name:<span class="dialog-asterisk">*</span>
          </div>
          <q-input v-model="editableItem.name" outlined dense class="q-mb-md" />

          <div class="row q-col-gutter-md">
            <!-- Category -->
            <div class="col">
              <div class="dialog-label">
              Category:<span class="dialog-asterisk">*</span>
            </div>
            <q-select
              v-model="editableItem.category"
              :options="categoryOptions"
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
            </div>

            <!-- Sub Category -->
           <div class="col">
             <div class="dialog-label">
              Sub-Category:<span class="dialog-asterisk">*</span>
            </div>
            <q-select
              v-model="editableItem.sub_category"
              :options="subCategoryOptions"
              outlined
              dense
              emit-value
              map-options
              class="q-mb-md"
              :disable="!editableItem.category"
            />
           </div>
            <!-- Tag Category -->
            <div class="col">
              <div class="dialog-label">
              tag Category:<span class="dialog-asterisk">*</span>
            </div>
            <q-select
              v-model="editableItem.tag_category"
              :options="tagCategoryOptions"
              outlined
              dense
              emit-value
              map-options
              class="q-mb-md"
            />
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <!-- Unit -->
            <div class="col">
              <div class="dialog-label">
              Unit:<span class="dialog-asterisk">*</span>
            </div>
            <q-select
              v-model="editableItem.unit"
              :options="unitOptions"
              outlined
              dense
              emit-value
              map-options
              class="q-mb-md"
            />
            </div>

            <!-- Pieces -->
            <div class="col">
              <div class="dialog-label">
              Pieces:<span class="dialog-asterisk">*</span>
            </div>
            <q-input
              v-model.number="editableItem.pieces"
              type="number"
              outlined
              dense
              class="q-mb-md"
            />
            </div>

            <!-- Pack Type -->
            <div class="col">
              <div class="dialog-label">
              Pack Type:<span class="dialog-asterisk">*</span>
            </div>
            <q-select
              v-model="editableItem.pack_type"
              :options="packTypeOptions"
              outlined
              dense
              emit-value
              map-options
              class="q-mb-md"
            />
            </div>

            <!-- Turnaround Time -->
            <div class="col">
              <div class="dialog-label">
                Turnaround:<span class="dialog-asterisk">*</span>
              </div>
              <q-input
                v-model.number="editableItem.turnaround_time"
                type="number"
                min="1"
                outlined
                dense
                class="q-mb-md"
                :rules="[(val) => val > 0 || 'Must be a positive number']"
              />
            </div>
          </div>
          <q-separator class="q-mb-md"/>
          <!-- Service Prices -->
          <div class="q-mb-md">
            <div class="dialog-label">Service Prices</div>

            <div
              v-for="(rate, idx) in editableItem.servicePrices"
              :key="idx"
              class="row q-col-gutter-md q-mb-sm items-center"
            >
              <div class="col-3">
                <q-select
                  v-model="rate.service_type"
                  :options="serviceTypeOptions"
                  label="Service Type"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>

              <div class="col-2">
                <q-input
                  v-model.number="rate.price"
                  type="number"
                  outlined
                  dense
                  label="Price"
                />
              </div>

              <div class="col-4">
                <q-select
                  v-model="rate.applicable_days"
                  :options="dayOptions"
                  multiple
                  use-chips
                  emit-value
                  map-options
                  outlined
                  dense
                  label="Applicable Days"
                >
                  <!-- 🟢 Custom chip rendering -->
                  <template v-slot:selected-item="scope">
                    <q-chip
                      dense
                      removable
                      :color="scope.opt.color || 'primary'"
                      text-color="white"
                      @remove="scope.removeAtIndex(scope.index)"
                    >
                      {{ capitalizeWords(scope.opt.value) }}
                    </q-chip>
                  </template>
                </q-select>
              </div>

              <div class="col-1">
                <q-toggle
                  v-model="rate.is_active"
                  label="Active"
                  color="green"
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
              @click="addServiceRow"
            />
          </div>

          <!-- Actions -->
          <q-card-actions align="between">
            <q-btn
              color="negative"
              outline
              label="Delete Item"
              @click="$emit('delete-request', editableItem.value)"
            />
            <q-btn color="primary" type="submit" label="Update Item" />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useQuasar } from "quasar";
import { supabase } from "@/../supabase/config.js";
import { updateItems } from "@/../supabase/api/item_list.js";

const $q = useQuasar();

const props = defineProps({
  modelValue: Boolean,
  selectedItem: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["update:modelValue", "updated"]);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

watch(isOpen, (val) => {
  if (val) initEditableItem();
});

const editableItem = ref({});

function initEditableItem() {
  editableItem.value = {
    ...props.selectedItem,
    servicePrices: (props.selectedItem.pricing_group_rates || [])
      .filter((r) => r.pricing_group_id === props.activeGroup)
      .map((r) => ({
        id: r.id,
        service_type: r.service_type,
        price: r.price,
        is_active: r.is_active,
        applicable_days: Array.isArray(r.applicable_days)
          ? r.applicable_days
          : (() => {
              try {
                return JSON.parse(r.applicable_days || "[]");
              } catch {
                return [];
              }
            })(),
      })),
    deletedServiceTypes: [], // 🆕 track deletions
  };
}

const categoryOptions = ref([]);
const subCategoryOptions = ref([]);
const unitOptions = [
  { label: "Piece (pc)", value: "pc" },
  { label: "Kilogram (kg)", value: "kg" },
  { label: "Square Foot (sqft)", value: "sqft" },
];

const serviceTypeOptions = [
  { label: "Laundry", value: "laundry" },
  { label: "Dry Clean", value: "dry clean" },
  { label: "Pressing", value: "pressing" },
  { label: "Others", value: "others" },
];

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

const tagCategoryOptions = [
  { label: "Clothing", value: "clothing" },
  { label: "Bedding", value: "bedding" },
  { label: "Stuffed Toy", value: "stuffed toy" },
  { label: "Curtain", value: "curtain" },
  { label: "Sofa", value: "sofa" },
  { label: "Carpet", value: "carpet" },
  { label: "Others", value: "others" },
];

const packTypeOptions = [
  { label: "Hang", value: "hang" },
  { label: "Fold", value: "fold" },
  { label: "Roll", value: "roll" },
];

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

function addServiceRow() {
  editableItem.value.servicePrices.push({
    service_type: null,
    price: 0,
    is_active: true,
    applicable_days: [],
  });
}

// 🆕 same delete logic as ItemsPage.vue
function markServiceRowDeleted(index) {
  const removed = editableItem.value.servicePrices[index];
  if (removed && removed.id) {
    if (!editableItem.value.deletedServiceIds) {
      editableItem.value.deletedServiceIds = [];
    }
    editableItem.value.deletedServiceIds.push(removed.id);
    console.log("🗑 Marked for deletion (id):", removed.id);
  }
  editableItem.value.servicePrices.splice(index, 1);
}

async function handleUpdate() {
  try {
    const userEmail =
      (await supabase.auth.getUser()).data.user?.email || "system";

    const payload = {
      ...editableItem.value,
      servicePrices: editableItem.value.servicePrices,
      deletedServiceTypes: editableItem.value.deletedServiceTypes,
    };

    console.log("📤 Update payload:", payload);

    await updateItems(payload, props.activeGroup, userEmail);

    emit("updated");
    closeDialog();
  } catch (err) {
    console.error("Update failed:", err?.message || err);
    $q.notify({ type: "negative", message: "Failed to update item." });
  }
}

function capitalizeWords(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function closeDialog() {
  emit("update:modelValue", false);
}
</script>
