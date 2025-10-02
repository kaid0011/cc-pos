<template>
  <div class="full-container items-management">
    <!-- Table Header -->
    <div
      class="row row-col-header text-center text-weight-bold items-stretch line-height-1"
    >
      <div class="col-3 header-bordered flex flex-center">Name</div>
      <div class="col header-bordered flex flex-center">Sub Category</div>
      <div class="col header-bordered flex flex-center">Tag Category</div>
      <div class="col header-bordered flex flex-center">Pack Type</div>
      <div class="col header-bordered flex flex-center">T.A. Time</div>
      <div class="col-3 header-bordered flex flex-center">Service Prices</div>
      <div class="col header-bordered flex flex-center">Pcs</div>
      <div class="col header-bordered flex flex-center">Unit</div>
      <div class="col-1 header-bordered flex flex-center">Actions</div>
    </div>

    <!-- No Items -->
    <div
      v-if="!loading && requests.length === 0"
      class="text-center text-grey q-pa-lg text-h6 bg-grey-1"
    >
      No item requests found.
    </div>

    <!-- Items -->
    <div
      v-else
      v-for="(item, idx) in requests"
      :key="item.id"
      class="row row-col-row"
      :class="[idx % 2 === 0 ? 'bg-white' : 'bg-grey-1']"
    >
      <!-- Item Name -->
      <div class="col-3 bordered">
        <div class="row justify-between">
          <div>{{ item.name }}</div>
          <div>
            <q-btn
            v-if="item.status === 'pending'"
              dense
              outline
              full-width
              icon="edit"
              color="primary"
              label="Edit"
              @click="openEditDialog(item)"
            />
          </div>
        </div>
      </div>

      <!-- Sub Category -->
      <div class="col bordered">{{ capitalizeWords(item.sub_category) }}</div>
      <div class="col bordered text-center">
        {{ capitalizeWords(item.tag_category) }}
      </div>
      <div class="col bordered text-center">
        {{ capitalizeWords(item.pack_type) }}
      </div>
      <div class="col bordered text-center">{{ item.turnaround_time }}</div>

      <!-- Service Prices -->
      <div class="col-3 bordered q-px-sm">
        <div
          v-for="(rate, rIdx) in item.rates || []"
          :key="rIdx"
          class="q-mb-xs"
        >
          <div class="price-border">
            <div class="row justify-between service-prices q-pa-xs">
              <div>
                {{ capitalizeWords(rate.service_type) }}:
                <span class="text-weight-bold text-red-9">
                  ${{ rate.price.toFixed(2) }}
                </span>
              </div>
            </div>
            <div class="q-ma-xs">
              <q-badge
                v-for="day in parseDays(rate.applicable_days)"
                :key="day"
                :color="
                  dayOptions.find((d) => d.value === day)?.color || 'grey'
                "
                text-color="white"
                class="q-mr-xs"
              >
                {{ capitalizeWords(day) }}
              </q-badge>
            </div>
          </div>
        </div>
      </div>

      <!-- Pieces -->
      <div class="col bordered text-center">{{ item.pieces }}</div>

      <!-- Unit -->
      <div class="col bordered text-center">{{ item.unit }}</div>

      <!-- Actions -->
      <div class="col-1 bordered text-center">
        <template v-if="item.status === 'pending'">
          <q-btn
            dense
            unelevated
            full-width
            icon="check"
            color="positive"
            class="q-ma-xs"
            @click="approveRequest(item)"
          />
          <q-btn
            dense
            unelevated
            full-width
            icon="close"
            color="negative"
            class="q-ma-xs"
            @click="rejectRequest(item)"
          />
        </template>
        <template v-else>
          <q-badge
          outline
            :color="
              item.status === 'approved'
                ? 'positive'
                : item.status === 'declined'
                ? 'negative'
                : 'warning'
            "
            text-color="white"
            class="text-weight-bold text-uppercase q-py-sm"
          >
            {{ capitalizeWords(item.status) }}
          </q-badge>
        </template>
      </div>
    </div>
    <EditItemRequestDialog
      v-model="showEditDialog"
      :selected-item="selectedItem"
      @updated="loadRequests"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import { supabase } from "@/../supabase/config.js";
import EditItemRequestDialog from "@/components/dialogs/EditItemRequestDialog.vue";

const $q = useQuasar();
const requests = ref([]);
const loading = ref(false);

const showEditDialog = ref(false);
const selectedItem = ref({});

function openEditDialog(item) {
  selectedItem.value = { ...item };
  showEditDialog.value = true;
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

function capitalizeWords(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function parseDays(days) {
  if (!days) return [];
  if (Array.isArray(days)) return days;
  try {
    return JSON.parse(days);
  } catch {
    return [];
  }
}

async function loadRequests() {
  loading.value = true;
  const { data, error } = await supabase
    .from("item_requests")
    .select("*, rates:item_requests_rates(*)");

  if (error) {
    $q.notify({ type: "negative", message: "Failed to fetch requests." });
  } else {
    requests.value = data || [];
  }
  loading.value = false;
}

async function approveRequest(req) {
  try {
    // 1. Insert into pricing_items
    const { data: inserted, error: insertError } = await supabase
      .from("pricing_items")
      .insert([
        {
          name: req.name,
          category: req.category,
          sub_category: req.sub_category,
          tag_category: req.tag_category,
          pack_type: req.pack_type,
          turnaround_time: req.turnaround_time,
          pieces: req.pieces,
          unit: req.unit,
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    // 2. Insert its rates
    if (req.rates?.length) {
      const mappedRates = req.rates.map((r) => ({
        item_id: inserted.id,
        service_type: r.service_type,
        price: r.price,
        applicable_days: Array.isArray(r.applicable_days)
          ? r.applicable_days
          : (() => {
              try {
                return JSON.parse(r.applicable_days || "[]");
              } catch {
                return [];
              }
            })(),
        pricing_group_id: r.pricing_group_id,
      }));

      const { error: rateError } = await supabase
        .from("pricing_group_rates")
        .insert(mappedRates);

      if (rateError) throw rateError;
    }

    // 3. Mark request as approved
    await supabase
      .from("item_requests")
      .update({ status: "approved" })
      .eq("id", req.id);

    $q.notify({ type: "positive", message: "Item approved & added!" });
    await loadRequests();
  } catch (err) {
    console.error("Approval failed:", err.message);
    $q.notify({ type: "negative", message: "Failed to approve request." });
  }
}

async function rejectRequest(req) {
  try {
    await supabase
      .from("item_requests")
      .update({ status: "declined" })
      .eq("id", req.id);

    $q.notify({ type: "warning", message: "Request declined." });
    await loadRequests();
  } catch (err) {
    console.error("Rejection failed:", err.message);
    $q.notify({ type: "negative", message: "Failed to reject request." });
  }
}

onMounted(loadRequests);
</script>
