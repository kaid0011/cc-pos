<!-- /src/components/dialogs/UnifiedItemEditorDialog.vue -->
<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="input-dialog">
      <q-card-section class="dialog-header">
        <q-btn icon="close" flat dense round class="absolute-top-right q-ma-sm" @click="closeDialog" />
        <div class="text-body1 text-uppercase text-weight-bold">
          {{ context === 'item' ? 'Update Item' : 'Update Request Item' }}
        </div>
      </q-card-section>

      <q-card-section class="dialog-body">
        <q-form @submit.prevent="handleSubmit">
          <!-- Name -->
          <div class="dialog-label">Item Name:<span class="dialog-asterisk">*</span></div>
          <q-input v-model="editableItem.name" outlined dense class="q-mb-md" />

          <div class="row q-col-gutter-md">
            <!-- Category -->
            <div class="col">
              <div class="dialog-label">Category:<span class="dialog-asterisk">*</span></div>
              <q-select
                v-model="editableItem.category"
                :options="categoryOptions"
                outlined dense emit-value map-options class="q-mb-md"
                @update:model-value="(val) => { editableItem.sub_category = null; loadSubCategoryOptions(val); }"
              />
            </div>

            <!-- Sub Category -->
            <div class="col">
              <div class="dialog-label">Sub-Category:<span class="dialog-asterisk">*</span></div>
              <q-select
                v-model="editableItem.sub_category"
                :options="subCategoryOptions"
                outlined dense emit-value map-options class="q-mb-md"
                :disable="!editableItem.category"
              />
            </div>

            <!-- Tag Category -->
            <div class="col">
              <div class="dialog-label">Tag Category:<span class="dialog-asterisk">*</span></div>
              <q-select
                v-model="editableItem.tag_category"
                :options="tagCategoryOptions"
                outlined dense emit-value map-options class="q-mb-md"
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
                outlined dense emit-value map-options class="q-mb-md"
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
                outlined dense emit-value map-options class="q-mb-md"
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
                suffix="day/s"
                :rules="[(val) => val > 0 || 'Must be a positive number']"
              />
            </div>

            <!-- Company -->
            <div class="col">
              <div class="dialog-label">Company:<span class="dialog-asterisk">*</span></div>
              <q-select
                v-model="editableItem.company"
                :options="companyOptions"
                outlined dense emit-value map-options class="q-mb-md"
              />
            </div>
          </div>

          <q-separator class="q-mb-md" />

          <!-- Service Prices -->
          <div class="q-mb-md">
            <div class="dialog-label">Service Prices</div>

            <!-- ITEM context -->
            <template v-if="context === 'item'">
              <div
                v-for="(rate, idx) in editableItem.servicePrices"
                :key="rate.id ?? idx"
                class="row q-col-gutter-md q-mb-sm items-center"
              >
                <div class="col-3">
                  <q-select
                    v-model="rate.service_type"
                    :options="serviceTypeOptions"
                    label="Service Type" outlined dense emit-value map-options
                  />
                </div>

                <div class="col-2">
                  <q-input
                    v-model="rate.priceStr"
                    type="text"
                    outlined
                    dense
                    label="Price"
                    prefix="$"
                    inputmode="decimal"
                    @blur="rate.priceStr = formatPriceStr(rate.priceStr)"
                  />
                </div>

                <div class="col-4">
                  <q-select
                    v-model="rate.applicable_days"
                    :options="dayOptions"
                    multiple use-chips emit-value map-options outlined dense
                    label="Applicable Days"
                  >
                    <template #selected-item="scope">
                      <q-chip dense removable :color="scope.opt.color || 'primary'" text-color="white"
                              @remove="scope.removeAtIndex(scope.index)">
                        {{ capitalizeWords(scope.opt.value) }}
                      </q-chip>
                    </template>
                  </q-select>
                </div>

                <div class="col-1">
                  <q-toggle v-model="rate.is_active" label="Active" color="green" />
                </div>

                <div class="col-2 text-right">
                  <q-btn dense flat round icon="delete" color="negative" @click="markServiceRowDeleted(idx)" />
                </div>
              </div>

              <q-btn flat dense icon="add" label="Add Service Type" color="primary" @click="addServiceRowItem()" />
            </template>

            <!-- REQUEST context -->
            <template v-else>
              <div
                v-for="(rate, idx) in editableItem.rates"
                :key="idx"
                class="row q-col-gutter-md q-mb-sm items-center"
              >
                <div class="col-3">
                  <q-select
                    v-model="rate.service_type"
                    :options="serviceTypeOptions"
                    label="Service Type" outlined dense emit-value map-options
                  />
                </div>

                <div class="col-2">
                  <q-input
                    v-model="rate.priceStr"
                    type="text"
                    outlined
                    dense
                    label="Price"
                    prefix="$"
                    inputmode="decimal"
                    @blur="rate.priceStr = formatPriceStr(rate.priceStr)"
                  />
                </div>

                <div class="col-3">
                  <q-select
                    v-model="rate.pricing_group_id"
                    :options="pricingGroupOptions"
                    label="Pricing Group" outlined dense emit-value map-options
                  />
                </div>

                <div class="col-3">
                  <q-select
                    v-model="rate.applicable_days"
                    :options="dayOptions"
                    multiple use-chips emit-value map-options outlined dense
                    label="Applicable Days"
                  >
                    <template #selected-item="scope">
                      <q-chip dense removable :color="scope.opt.color || 'primary'" text-color="white"
                              @remove="scope.removeAtIndex(scope.index)">
                        {{ capitalizeWords(scope.opt.value) }}
                      </q-chip>
                    </template>
                  </q-select>
                </div>

                <div class="col-1 text-right">
                  <q-btn dense flat round icon="delete" color="negative" @click="removeRequestServiceRow(idx)" />
                </div>
              </div>

              <q-btn flat dense icon="add" label="Add Service Type" color="primary" @click="addServiceRowRequest()" />
            </template>
          </div>

          <!-- Actions -->
          <q-card-actions align="between">
            <q-btn
              v-if="context === 'item'"
              color="negative" outline label="Delete Item"
              @click="$emit('delete-request', editableItem)"
            />
            <q-btn color="primary" type="submit" :label="context === 'item' ? 'Update Item' : 'Save Changes'" />
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
  modelValue: { type: Boolean, default: false },
  context: { type: String, required: true }, // 'item' | 'request'
  selectedItem: { type: Object, default: () => ({}) },
  activeGroup: { type: [String, Number], default: null },
});
const emit = defineEmits(["update:modelValue", "updated", "delete-request"]);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
watch(isOpen, (val) => { if (val) initEditableItem(); });

const editableItem = ref({});

/* ---- Currency helpers (why: consistent $ + 2dp display, safe numeric conversion) ---- */
function toPriceStr(n) {
  const num = Number(n);
  return Number.isFinite(num) ? num.toFixed(2) : "0.00";
}
function sanitizePriceStr(s) {
  if (s == null) return "0.00";
  const cleaned = String(s).replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  const head = parts[0] || "0";
  const tail = (parts[1] || "").slice(0, 2);
  return tail.length ? `${head}.${tail.padEnd(2, "0")}` : `${head}.00`;
}
function formatPriceStr(s) {
  return toPriceStr(parseFloat(sanitizePriceStr(s)));
}
function toPriceNumber(s) {
  const n = parseFloat(sanitizePriceStr(s));
  return Number.isFinite(n) ? n : 0;
}

function ensureArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val) || []; } catch { return []; }
}

function initEditableItem() {
  const src = props.selectedItem || {};
  editableItem.value = {
    id: src.id ?? null,
    name: src.name ?? "",
    category: src.category ?? null,
    sub_category: src.sub_category ?? null,
    tag_category: src.tag_category ?? null,
    pack_type: src.pack_type ?? null,
    turnaround_time: src.turnaround_time ?? null,
    pieces: src.pieces ?? null,
    unit: src.unit ?? null,
    company: src.company ?? null,

    servicePrices: props.context === "item"
      ? (src.pricing_group_rates || [])
          .filter((r) => String(r.pricing_group_id) === String(props.activeGroup))
          .map((r) => ({
            id: r.id,
            service_type: r.service_type,
            priceStr: toPriceStr(r.price),
            is_active: r.is_active ?? true,
            applicable_days: ensureArray(r.applicable_days),
          }))
      : [],

    rates: props.context === "request"
      ? (src.rates || []).map((r) => ({
          service_type: r.service_type ?? null,
          priceStr: toPriceStr(r.price),
          pricing_group_id: r.pricing_group_id ?? null,
          applicable_days: ensureArray(r.applicable_days),
        }))
      : [],

    deletedServiceIds: [],
  };

  if (editableItem.value.category) {
    loadSubCategoryOptions(editableItem.value.category);
  }
}

function addServiceRowItem() {
  editableItem.value.servicePrices.push({
    service_type: null,
    priceStr: "0.00",
    is_active: true,
    applicable_days: [],
  });
}
function markServiceRowDeleted(idx) {
  const removed = editableItem.value.servicePrices[idx];
  if (removed?.id) editableItem.value.deletedServiceIds.push(removed.id);
  editableItem.value.servicePrices.splice(idx, 1);
}

function addServiceRowRequest() {
  editableItem.value.rates.push({
    service_type: null,
    priceStr: "0.00",
    pricing_group_id: null,
    applicable_days: [],
  });
}
function removeRequestServiceRow(idx) {
  editableItem.value.rates.splice(idx, 1);
}

async function handleSubmit() {
  try {
    if (props.context === "item") {
      if (!props.activeGroup) {
        $q.notify({ type: "warning", message: "Active group is required." });
        return;
      }

      const userEmail = (await supabase.auth.getUser()).data.user?.email || "system";
      const payload = {
        id: editableItem.value.id,
        name: editableItem.value.name,
        category: editableItem.value.category,
        sub_category: editableItem.value.sub_category,
        tag_category: editableItem.value.tag_category,
        pack_type: editableItem.value.pack_type,
        turnaround_time: editableItem.value.turnaround_time,
        pieces: editableItem.value.pieces,
        unit: editableItem.value.unit,
        company: editableItem.value.company,
        servicePrices: editableItem.value.servicePrices.map((r) => ({
          id: r.id,
          service_type: r.service_type,
          price: toPriceNumber(r.priceStr),
          is_active: r.is_active,
          applicable_days: r.applicable_days,
        })),
        deletedServiceIds: editableItem.value.deletedServiceIds,
      };

      await updateItems(payload, props.activeGroup, userEmail);
    } else {
      const itemId = editableItem.value.id;
      const { error: itemError } = await supabase
        .from("item_requests")
        .update({
          name: editableItem.value.name,
          category: editableItem.value.category,
          sub_category: editableItem.value.sub_category,
          tag_category: editableItem.value.tag_category,
          pack_type: editableItem.value.pack_type,
          company: editableItem.value.company,
          turnaround_time: editableItem.value.turnaround_time,
          unit: editableItem.value.unit,
          pieces: editableItem.value.pieces,
        })
        .eq("id", itemId);
      if (itemError) throw itemError;

      await supabase.from("item_requests_rates").delete().eq("item_request_id", itemId);

      if (editableItem.value.rates?.length) {
        const rows = editableItem.value.rates.map((r) => ({
          item_request_id: itemId,
          service_type: r.service_type,
          price: toPriceNumber(r.priceStr),
          applicable_days: r.applicable_days,
          pricing_group_id: r.pricing_group_id,
        }));
        const { error: rateError } = await supabase.from("item_requests_rates").insert(rows);
        if (rateError) throw rateError;
      }
    }

    emit("updated");
    closeDialog();
  } catch (err) {
    console.error("Save failed:", err?.message || err);
    $q.notify({ type: "negative", message: "Failed to save changes." });
  }
}

function closeDialog() {
  emit("update:modelValue", false);
}

function capitalizeWords(str) {
  if (!str) return "";
  return String(str).split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/* lookups */
const categoryOptions = ref([]);
const subCategoryOptions = ref([]);
const pricingGroupOptions = ref([]);

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
const companyOptions = [
  { label: "Cotton Care", value: "cc" },
  { label: "Dry Cleaners", value: "dc" },
];

onMounted(async () => {
  const { data: catData } = await supabase
    .from("pricing_items")
    .select("category")
    .neq("category", "")
    .order("category", { ascending: true });
  if (catData) {
    const unique = [...new Set(catData.map((row) => row.category))];
    categoryOptions.value = unique.map((c) => ({ label: capitalizeWords(c), value: c }));
  }

  const { data: pgData } = await supabase.from("pricing_groups").select("id, name");
  if (pgData) {
    pricingGroupOptions.value = pgData.map((g) => ({ label: g.name, value: g.id }));
  }

  if (editableItem.value.category) {
    loadSubCategoryOptions(editableItem.value.category);
  }
});

async function loadSubCategoryOptions(category) {
  const { data, error } = await supabase
    .from("pricing_items")
    .select("sub_category")
    .eq("category", category)
    .neq("sub_category", "")
    .order("sub_category", { ascending: true });

  if (!error && data) {
    const unique = [...new Set(data.map((row) => row.sub_category))];
    subCategoryOptions.value = unique.map((sc) => ({ label: capitalizeWords(sc), value: sc }));
  }
}
</script>
