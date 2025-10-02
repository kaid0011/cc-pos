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
          Request Item
        </div>
      </q-card-section>

      <q-card-section class="dialog-body">
        <q-form @submit.prevent="handleRequest">
          <!-- Name -->
          <div class="dialog-label">
            Item Name:<span class="dialog-asterisk">*</span>
          </div>
          <q-input v-model="newItem.name" outlined dense class="q-mb-md" />

          <div class="row q-col-gutter-md">
            <!-- Category -->
            <div class="col">
              <div class="dialog-label">
                Category:<span class="dialog-asterisk">*</span>
              </div>
              <q-select
                v-model="newItem.category"
                :options="categoryOptions"
                outlined
                dense
                emit-value
                map-options
                class="q-mb-md"
                @update:model-value="
                  (val) => {
                    newItem.sub_category = null;
                    loadSubCategoryOptions(val);
                  }
                "
              />
            </div>

<!-- Sub Category -->
<div class="col">
  <div class="dialog-label">
    Sub-Category:<span class="dialog-asterisk">*</span>
  </div>
  <q-select
    v-model="newItem.sub_category"
    :options="subCategoryOptions"
    outlined
    dense
    emit-value
    map-options
    class="q-mb-md"
    :disable="!newItem.category"
  />
</div>

            <!-- Tag Category -->
            <div class="col">
              <div class="dialog-label">
                Tag Category:<span class="dialog-asterisk">*</span>
              </div>
              <q-select
                v-model="newItem.tag_category"
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
                v-model="newItem.unit"
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
                v-model.number="newItem.pieces"
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
                v-model="newItem.pack_type"
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
                v-model.number="newItem.turnaround_time"
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
              v-for="(rate, idx) in newItem.servicePrices"
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
    <!-- same chip renderer as UpdateItemDialog -->
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
            <q-btn color="primary" type="submit" label="Submit Request" />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useQuasar } from "quasar";
import { supabase } from "@/../supabase/config.js";

const pricingGroupOptions = ref([]);
const subCategoryOptions = ref([]);

const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(["update:modelValue", "requested"]);

const $q = useQuasar();
const isOpen = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => (isOpen.value = val)
);

function closeDialog() {
  emit("update:modelValue", false);
}

const newItem = ref({
  name: "",
  category: null,
  sub_category: "",
  tag_category: null,
  pack_type: null,
  turnaround_time: null,
  unit: null,
  pieces: 1,
  servicePrices: [],
});

const categoryOptions = [
  { label: "Beddings", value: "beddings" },
  { label: "Clothings", value: "clothings" },
  { label: "Curtains", value: "curtains" },
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

onMounted(async () => {
  const { data, error } = await supabase
    .from("pricing_groups")
    .select("id, name");
  if (!error) {
    pricingGroupOptions.value = data.map((g) => ({
      label: g.name,
      value: g.id,
    }));
  }

  if (newItem.value.category) {
    loadSubCategoryOptions(newItem.value.category);
  }
});

async function loadSubCategoryOptions(category) {
  subCategoryOptions.value = [];
  if (!category) return;

  const { data, error } = await supabase
    .from("pricing_items")
    .select("sub_category")
    .eq("category", category)
    .neq("sub_category", "")
    .order("sub_category", { ascending: true });

  if (!error && data) {
    const unique = [...new Set(data.map((r) => r.sub_category))];
    subCategoryOptions.value = unique.map((sc) => ({
      label: sc.charAt(0).toUpperCase() + sc.slice(1),
      value: sc,
    }));
  }
}

function addServiceRow() {
  newItem.value.servicePrices.push({
    service_type: null,
    price: 0,
    pricing_group_id: null,
    applicable_days: [], // ✅ start empty array
  });
}

function removeServiceRow(idx) {
  newItem.value.servicePrices.splice(idx, 1);
}

function resetForm() {
  newItem.value = {
    name: "",
    category: null,
    sub_category: "",
    tag_category: null,
    pack_type: null,
    turnaround_time: null,
    unit: null,
    pieces: 1,
    servicePrices: [],
  };
}

async function handleRequest() {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id || null;

    const { data: insertedItem, error: itemError } = await supabase
      .from("item_requests")
      .insert([
        {
          name: newItem.value.name,
          category: newItem.value.category,
          sub_category: newItem.value.sub_category,
          tag_category: newItem.value.tag_category,
          pack_type: newItem.value.pack_type,
          turnaround_time: newItem.value.turnaround_time,
          unit: newItem.value.unit,
          pieces: newItem.value.pieces,
          requested_by: userId,
        },
      ])
      .select()
      .single();

    if (itemError) throw itemError;

    if (newItem.value.servicePrices.length > 0) {
      const ratesToInsert = newItem.value.servicePrices.map((rate) => ({
        item_request_id: insertedItem.id,
        service_type: rate.service_type,
        price: rate.price,
        pricing_group_id: rate.pricing_group_id,
        applicable_days: JSON.stringify(rate.applicable_days || []),
      }));

      const { error: ratesError } = await supabase
        .from("item_requests_rates")
        .insert(ratesToInsert);

      if (ratesError) throw ratesError;
    }

    $q.notify({ type: "positive", message: "Item request submitted!" });
    emit("requested");
    closeDialog();
  } catch (err) {
    console.error("Error requesting item:", err.message);
    $q.notify({ type: "negative", message: "Failed to submit request." });
  }
}

function capitalizeWords(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

watch(
  () => newItem.value.category,
  (val) => {
    newItem.value.sub_category = null; // reset selection
    loadSubCategoryOptions(val);
  }
);
</script>
