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
          Update Request Item
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
              <div class="dialog-label">Category:<span class="dialog-asterisk">*</span></div>
              <q-select
                v-model="editableItem.category"
                :options="categoryOptions"
                outlined
                dense
                emit-value
                map-options
                class="q-mb-md"
                @update:model-value="(val) => {
                  editableItem.sub_category = null;
                  loadSubCategoryOptions(val);
                }"
              />
            </div>

            <!-- Sub Category -->
            <div class="col">
              <div class="dialog-label">Sub-Category:<span class="dialog-asterisk">*</span></div>
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
              <div class="dialog-label">Tag Category:<span class="dialog-asterisk">*</span></div>
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
              <div class="dialog-label">Unit:<span class="dialog-asterisk">*</span></div>
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
              <div class="dialog-label">Pieces:<span class="dialog-asterisk">*</span></div>
              <q-input v-model.number="editableItem.pieces" type="number" outlined dense class="q-mb-md" />
            </div>

            <!-- Pack Type -->
            <div class="col">
              <div class="dialog-label">Pack Type:<span class="dialog-asterisk">*</span></div>
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
              <div class="dialog-label">Turnaround:<span class="dialog-asterisk">*</span></div>
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

          <q-separator class="q-mb-md" />

          <!-- Service Prices -->
          <div class="q-mb-md">
            <div class="dialog-label">Service Prices</div>

            <div
              v-for="(rate, idx) in editableItem.rates"
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
                <q-input v-model.number="rate.price" type="number" outlined dense label="Price" />
              </div>

              <div class="col-3">
                <q-select
                  v-model="rate.pricing_group_id"
                  :options="pricingGroupOptions"
                  label="Pricing Group"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>

              <div class="col-3">
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

              <div class="col-1 text-right">
                <q-btn
                  dense
                  flat
                  round
                  icon="delete"
                  color="negative"
                  @click="removeServiceRow(idx)"
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
            <q-btn color="negative" outline label="Clear" @click="resetForm" />
            <q-btn color="primary" type="submit" label="Save Changes" />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { supabase } from "@/../supabase/config.js";

const props = defineProps({
  modelValue: Boolean,
  selectedItem: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["update:modelValue", "updated"]);

const isOpen = ref(props.modelValue);
watch(() => props.modelValue, (val) => {
  isOpen.value = val;
  if (val) initEditableItem();
});

const editableItem = ref({});

function initEditableItem() {
  editableItem.value = JSON.parse(JSON.stringify(props.selectedItem));

  // normalize applicable_days for each rate
  if (editableItem.value.rates) {
    editableItem.value.rates = editableItem.value.rates.map(r => ({
      ...r,
      applicable_days: Array.isArray(r.applicable_days)
        ? r.applicable_days
        : (() => {
            try {
              return JSON.parse(r.applicable_days || "[]");
            } catch {
              return [];
            }
          })(),
    }));
  }
}

function addServiceRow() {
  editableItem.value.rates.push({
    service_type: null,
    price: 0,
    pricing_group_id: null,
    applicable_days: [],
  });
}
function removeServiceRow(idx) {
  editableItem.value.rates.splice(idx, 1);
}

async function handleUpdate() {
  try {
    // update item_requests
    const { error: itemError } = await supabase
      .from("item_requests")
      .update({
        name: editableItem.value.name,
        category: editableItem.value.category,
        sub_category: editableItem.value.sub_category,
        tag_category: editableItem.value.tag_category,
        pack_type: editableItem.value.pack_type,
        turnaround_time: editableItem.value.turnaround_time,
        unit: editableItem.value.unit,
        pieces: editableItem.value.pieces,
      })
      .eq("id", editableItem.value.id);

    if (itemError) throw itemError;

    // refresh its rates
    await supabase.from("item_requests_rates").delete().eq("item_request_id", editableItem.value.id);

    if (editableItem.value.rates?.length) {
      const mappedRates = editableItem.value.rates.map((r) => ({
        item_request_id: editableItem.value.id,
        service_type: r.service_type,
        price: r.price,
        applicable_days: Array.isArray(r.applicable_days) ? r.applicable_days : [],
        pricing_group_id: r.pricing_group_id,
      }));
      const { error: rateError } = await supabase.from("item_requests_rates").insert(mappedRates);
      if (rateError) throw rateError;
    }

    emit("updated");
    closeDialog();
  } catch (err) {
    console.error("Update failed:", err.message);
  }
}

function closeDialog() {
  emit("update:modelValue", false);
}
function resetForm() {
  initEditableItem();
}
function capitalizeWords(str) {
  if (!str) return "";
  return str.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const categoryOptions = ref([]);
const subCategoryOptions = ref([]);
const tagCategoryOptions = [
  { label: "Clothing", value: "clothing" },
  { label: "Bedding", value: "bedding" },
  { label: "Stuffed Toy", value: "stuffed toy" },
  { label: "Curtain", value: "curtain" },
  { label: "Sofa", value: "sofa" },
  { label: "Carpet", value: "carpet" },
  { label: "Others", value: "others" },
];
const unitOptions = [
  { label: "Piece (pc)", value: "pc" },
  { label: "Kilogram (kg)", value: "kg" },
  { label: "Square Foot (sqft)", value: "sqft" },
];
const packTypeOptions = [
  { label: "Hang", value: "hang" },
  { label: "Fold", value: "fold" },
  { label: "Roll", value: "roll" },
];
const serviceTypeOptions = [
  { label: "Laundry", value: "laundry" },
  { label: "Dry Clean", value: "dry clean" },
  { label: "Pressing", value: "pressing" },
  { label: "Others", value: "others" },
];
const pricingGroupOptions = ref([]);
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

// load categories & pricing groups on mount
onMounted(async () => {
  const { data: catData } = await supabase
    .from("pricing_items")
    .select("category")
    .neq("category", "")
    .order("category");

  if (catData) {
    const unique = [...new Set(catData.map((row) => row.category))];
    categoryOptions.value = unique.map((c) => ({
      label: capitalizeWords(c),
      value: c,
    }));
  }

  const { data: pgData } = await supabase.from("pricing_groups").select("id, name");
  if (pgData) {
    pricingGroupOptions.value = pgData.map((g) => ({
      label: g.name,
      value: g.id,
    }));
  }
});

async function loadSubCategoryOptions(category) {
  const { data, error } = await supabase
    .from("pricing_items")
    .select("sub_category")
    .eq("category", category)
    .neq("sub_category", "")
    .order("sub_category");

  if (!error && data) {
    const unique = [...new Set(data.map((row) => row.sub_category))];
    subCategoryOptions.value = unique.map((sc) => ({
      label: capitalizeWords(sc),
      value: sc,
    }));
  }
}

</script>
