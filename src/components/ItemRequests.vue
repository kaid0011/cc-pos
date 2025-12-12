<!-- /src/components/ItemRequests.vue -->
<template>
  <div class="full-container items-management">
    <!-- Loading -->
    <div v-if="loading" class="q-pa-lg flex flex-center bg-grey-1">
      <q-spinner size="32px" class="q-mr-sm" />
      <span class="text-subtitle1">Loading requests…</span>
    </div>

    <!-- Empty -->
    <div
      v-else-if="pendingRequests.length === 0 && processedRequests.length === 0"
      class="text-center text-grey q-pa-lg text-h6 bg-grey-1"
    >
      No item requests found.
    </div>

    <!-- Tabs -->
    <template v-else>
      <q-tabs
        v-model="activeTab"
        dense
        class="bg-grey-2 text-dark q-mb-md"
        align="justify"
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab
          name="pending"
          :label="`Pending (${pendingRequests.length})`"
        />
        <q-tab
          name="processed"
          :label="`Processed (${processedRequests.length})`"
        />
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated>
        <!-- PENDING TAB -->
        <q-tab-panel name="pending" class="q-pa-none">
          <!-- Header -->
          <div class="row row-col-header text-center text-weight-bold items-stretch line-height-1">
            <div class="col-3 header-bordered flex flex-center">Name</div>
            <div class="col header-bordered flex flex-center">Category</div>
            <div class="col header-bordered flex flex-center">Tag Category</div>
            <div class="col header-bordered flex flex-center">Pack Type</div>
            <div class="col header-bordered flex flex-center">T.A. Time</div>
            <div class="col-3 header-bordered flex flex-center">Service Prices</div>
            <div class="col header-bordered flex flex-center">Pcs</div>
            <div class="col header-bordered flex flex-center">Unit</div>
            <div class="col header-bordered flex flex-center">Company</div>
            <div class="col-1 header-bordered flex flex-center">Actions</div>
          </div>

          <!-- Empty-in-tab -->
          <div
            v-if="pendingRequests.length === 0"
            class="text-center text-grey q-pa-lg text-h6 bg-grey-1"
          >
            No pending requests.
          </div>

          <!-- Rows -->
          <template v-else>
            <div
              v-for="(item, idx) in pendingRequests"
              :key="item.id"
              class="row row-col-row"
              :class="[idx % 2 === 0 ? 'bg-white' : 'bg-grey-1']"
            >
              <!-- Name + Edit -->
              <div class="col-3 bordered">
                <div class="row justify-between">
                  <div>{{ item.name }}</div>
                  <div>
                    <q-btn
                      dense outline full-width icon="edit" color="primary" label="Edit"
                      @click="openEditDialog(item)"
                    />
                  </div>
                </div>
              </div>

              <!-- Category (+ Sub) -->
              <div class="col bordered">
                {{ capitalizeWords(item.category) }}
                <span v-if="item.sub_category">({{ capitalizeWords(item.sub_category) }})</span>
              </div>

              <div class="col bordered text-center">{{ capitalizeWords(item.tag_category) }}</div>
              <div class="col bordered text-center">{{ capitalizeWords(item.pack_type) }}</div>
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
                          ${{ formatPrice(rate.price) }}
                        </span>
                      </div>
                    </div>
                    <div class="q-ma-xs">
                      <q-badge
                        v-for="day in parseDays(rate.applicable_days)"
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

              <div class="col bordered text-center">{{ item.pieces }}</div>
              <div class="col bordered text-center">{{ item.unit }}</div>
              <div class="col bordered text-center text-uppercase">{{ item.company }}</div>

              <!-- Actions -->
              <div class="col-1 bordered text-center">
                <q-btn dense unelevated full-width icon="check" color="positive" class="q-ma-xs" @click="approveRequest(item)" />
                <q-btn dense unelevated full-width icon="close" color="negative" class="q-ma-xs" @click="rejectRequest(item)" />
              </div>
            </div>
          </template>
        </q-tab-panel>

        <!-- PROCESSED TAB -->
        <q-tab-panel name="processed" class="q-pa-none">
          <!-- Header -->
          <div class="row row-col-header text-center text-weight-bold items-stretch line-height-1">
            <div class="col-3 header-bordered flex flex-center">Name</div>
            <div class="col header-bordered flex flex-center">Category</div>
            <div class="col header-bordered flex flex-center">Tag Category</div>
            <div class="col header-bordered flex flex-center">Pack Type</div>
            <div class="col header-bordered flex flex-center">T.A. Time</div>
            <div class="col-3 header-bordered flex flex-center">Service Prices</div>
            <div class="col header-bordered flex flex-center">Pcs</div>
            <div class="col header-bordered flex flex-center">Unit</div>
            <div class="col header-bordered flex flex-center">Company</div>
            <div class="col-1 header-bordered flex flex-center">Status</div>
          </div>

          <!-- Empty-in-tab -->
          <div
            v-if="processedRequests.length === 0"
            class="text-center text-grey q-pa-lg text-h6 bg-grey-1"
          >
            No processed requests.
          </div>

          <!-- Rows -->
          <template v-else>
            <div
              v-for="(item, idx) in processedRequests"
              :key="item.id"
              class="row row-col-row"
              :class="[idx % 2 === 0 ? 'bg-white' : 'bg-grey-1']"
            >
              <div class="col-3 bordered">{{ item.name }}</div>

              <div class="col bordered">
                {{ capitalizeWords(item.category) }}
                <span v-if="item.sub_category">({{ capitalizeWords(item.sub_category) }})</span>
              </div>

              <div class="col bordered text-center">{{ capitalizeWords(item.tag_category) }}</div>
              <div class="col bordered text-center">{{ capitalizeWords(item.pack_type) }}</div>
              <div class="col bordered text-center">{{ item.turnaround_time }}</div>

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
                          ${{ formatPrice(rate.price) }}
                        </span>
                      </div>
                    </div>
                    <div class="q-ma-xs">
                      <q-badge
                        v-for="day in parseDays(rate.applicable_days)"
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

              <div class="col bordered text-center">{{ item.pieces }}</div>
              <div class="col bordered text-center">{{ item.unit }}</div>
              <div class="col bordered text-center text-uppercase">{{ item.company }}</div>

              <div class="col-1 bordered text-center">
                <q-badge
                  outline
                  :color="item.status_normalized === 'approved'
                    ? 'positive'
                    : item.status_normalized === 'declined'
                    ? 'negative'
                    : 'warning'"
                  text-color="white"
                  class="text-weight-bold text-uppercase q-py-sm"
                >
                  {{ capitalizeWords(item.status) }}
                </q-badge>
              </div>
            </div>
          </template>
        </q-tab-panel>
      </q-tab-panels>
    </template>

    <!-- Dialog -->
    <UpdateItemDialog
      v-model="showEditDialog"
      context="request"
      :selected-item="selectedItem"
      @updated="loadRequests"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useQuasar, QSpinner } from "quasar";
import { supabase } from "@/../supabase/config.js";
import UpdateItemDialog from "@/components/dialogs/UpdateItemDialog.vue";

const $q = useQuasar();

const loading = ref(false);
const activeTab = ref("pending"); // why: user can jump between sets quickly
const requests = ref([]);

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
  return String(str)
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
function formatPrice(val) {
  const n = Number(val);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}
function parseDays(days) {
  if (!days) return [];
  if (Array.isArray(days)) return days;
  try { return JSON.parse(days); } catch { return []; }
}
const normalized = (s) => (s == null ? "pending" : String(s).toLowerCase());

const pendingRequests = computed(() =>
  (requests.value || [])
    .map((r) => ({ ...r, status_normalized: normalized(r.status) }))
    .filter((r) => r.status_normalized === "pending")
);
const processedRequests = computed(() =>
  (requests.value || [])
    .map((r) => ({ ...r, status_normalized: normalized(r.status) }))
    .filter((r) => r.status_normalized !== "pending")
);

async function loadRequests() {
  loading.value = true;
  const { data, error } = await supabase
    .from("item_requests")
    .select("*, rates:item_requests_rates(*)")
    .order("id", { ascending: false });

  if (error) {
    $q.notify({ type: "negative", message: "Failed to fetch requests." });
    requests.value = [];
  } else {
    requests.value = data || [];
  }
  loading.value = false;
}

async function approveRequest(req) {
  try {
    const { data: inserted, error: insertError } = await supabase
      .from("pricing_items")
      .insert([{
        name: req.name,
        category: req.category,
        sub_category: req.sub_category,
        tag_category: req.tag_category,
        pack_type: req.pack_type,
        turnaround_time: req.turnaround_time,
        pieces: req.pieces,
        unit: req.unit,
        company: req.company,
      }])
      .select()
      .single();
    if (insertError) throw insertError;

    if (req.rates?.length) {
      const mappedRates = req.rates.map((r) => ({
        item_id: inserted.id,
        service_type: r.service_type,
        price: r.price,
        applicable_days: Array.isArray(r.applicable_days)
          ? r.applicable_days
          : (() => { try { return JSON.parse(r.applicable_days || "[]"); } catch { return []; } })(),
        pricing_group_id: r.pricing_group_id,
      }));
      const { error: rateError } = await supabase.from("pricing_group_rates").insert(mappedRates);
      if (rateError) throw rateError;
    }

    await supabase.from("item_requests").update({ status: "approved" }).eq("id", req.id);
    $q.notify({ type: "positive", message: "Item approved & added!" });
    await loadRequests();
  } catch (err) {
    console.error("Approval failed:", err?.message || err);
    $q.notify({ type: "negative", message: "Failed to approve request." });
  }
}

async function rejectRequest(req) {
  try {
    await supabase.from("item_requests").update({ status: "declined" }).eq("id", req.id);
    $q.notify({ type: "warning", message: "Request declined." });
    await loadRequests();
  } catch (err) {
    console.error("Rejection failed:", err?.message || err);
    $q.notify({ type: "negative", message: "Failed to reject request." });
  }
}

onMounted(loadRequests);
</script>
