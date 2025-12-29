<!-- File: src/views/TagsManagement.vue -->
<template>
  <div class="row justify-center page-title-header text-uppercase">
    Tags Management
  </div>
  <div class="full-container orders-history">
    <q-card class="row preview-card q-mb-md">
      <!-- Generate Tag Section -->
      <div class="col-5 q-pa-md">
        <q-select
          v-model="selectedDriver"
          :options="sortedDriverOptions"
          option-label="name"
          option-value="id"
          label="Select Collection Driver"
          outlined
          dense
          class="q-pb-sm"
        />
        <q-input
          v-model="formattedSelectedDate"
          outlined
          dense
          label="Select Collection Date"
          readonly
          class="q-pb-sm"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="selectedDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
            <q-icon
              name="close"
              class="cursor-pointer q-ml-sm"
              @click="selectedDate = null"
            />
          </template>
        </q-input>
        <div class="row q-col-gutter-sm">
          <div class="col">
            <q-btn
              unelevated
              label="Generate Tag"
              color="primary full-width"
              :disable="!selectedMatchedOrders.length"
              @click="generateTag"
              class="q-mt-sm"
            />
          </div>
          <div class="col">
            <q-btn
              unelevated
              label="Generate Invoice"
              color="secondary full-width"
              :disable="!selectedMatchedOrders.length"
              @click="generateInvoice"
              class="q-mt-sm"
            />
          </div>
        </div>
        <q-btn
          outline
          label="Customize Tag"
          color="primary full-width"
          @click="openCustomizeDialog"
          class="q-mt-sm"
        />
      </div>

      <div class="col-7 q-pa-md">
        <q-card
          bordered
          flat
          class="q-pa-sm"
          style="
            border-width: 1.5px;
            border-color: #c09f8b;
            height: 13.5em;
            display: flex;
            flex-direction: column;
          "
        >
          <!-- Header -->
          <div class="row items-center justify-between text-uppercase q-ml-xs">
            <div class="text-weight-bold">
              Matched Orders ({{ matchedOrdersList.length }}):
            </div>
            <q-checkbox
              class="text-caption"
              v-model="selectAll"
              label="Select All"
              dense
            />
          </div>

          <q-separator class="q-my-xs" />

          <!-- Scrollable List -->
          <div
            v-if="matchedOrdersList.length"
            style="overflow-y: auto; flex-grow: 1"
            class="q-pr-sm"
          >
            <div
              v-for="(logistics, index) in matchedOrdersList"
              :key="index"
              class="q-mb-sm"
            >
              <div class="row items-center justify-between q-mx-md">
                <div class="row">
                  <q-checkbox
                    v-model="selectedMatchedOrders"
                    :val="logistics"
                    dense
                  />
                  <div class="row items-center q-ml-sm">
                    <div>
                      <span class="text-weight-bold q-mr-xs">
                        {{ logistics.order?.order_no || "N/A" }}
                      </span>
                      - {{ logistics.customer?.name || "Unknown" }}
                    </div>
                  </div>
                </div>
                <q-btn
                  flat
                  dense
                  icon="open_in_new"
                  size="10px"
                  @click="openOrderDialog(logistics)"
                />
              </div>
            </div>
          </div>

          <div v-else class="text-grey">No matching orders found.</div>
        </q-card>
      </div>
    </q-card>
    <div class="row justify-end q-mb-sm q-col-gutter-sm">
      <div class="col">
        <div class="dialog-label">
          <div class="text-weight-bold text-subtitle2">Logistics Status</div>
        </div>
        <q-select
          v-model="logisticsStatusFilter"
          :options="logisticsStatusOptions"
          outlined
          dense
          emit-value
          map-options
          class="bg-white"
          :display-value="!logisticsStatusFilter ? 'None applied' : undefined"
        >
          <template #append>
            <q-icon
              v-if="logisticsStatusFilter"
              name="close"
              class="cursor-pointer q-ml-sm"
              @click.stop="logisticsStatusFilter = null"
            />
          </template>
        </q-select>
      </div>
      <div class="col">
        <div class="dialog-label">
          <div class="text-weight-bold text-subtitle2">Tag Status</div>
        </div>
        <!-- Tag Status -->
        <q-select
          v-model="tagStatusFilter"
          :options="tagStatusOptions"
          outlined
          dense
          emit-value
          map-options
          class="bg-white"
          :display-value="!tagStatusFilter ? 'None applied' : undefined"
        >
          <template #append>
            <q-icon
              v-if="tagStatusFilter"
              name="close"
              class="cursor-pointer q-ml-sm"
              @click.stop="tagStatusFilter = null"
            />
          </template>
        </q-select>
      </div>

      <div class="col">
        <div class="dialog-label">
          <div class="text-weight-bold text-subtitle2">Collection Driver</div>
        </div>
        <!-- Collection Driver -->
        <q-select
          v-model="collectionDriverFilter"
          :options="sortedDriverOptions"
          option-label="name"
          option-value="name"
          outlined
          dense
          emit-value
          map-options
          class="bg-white"
          :display-value="!collectionDriverFilter ? 'None applied' : undefined"
        >
          <template #append>
            <q-icon
              v-if="collectionDriverFilter"
              name="close"
              class="cursor-pointer q-ml-sm"
              @click.stop="collectionDriverFilter = null"
            />
          </template>
        </q-select>
      </div>

      <div class="col">
        <div class="dialog-label">
          <div class="text-weight-bold text-subtitle2">Collection Date</div>
        </div>
        <q-input
          v-model="formattedCollectionStartDate"
          outlined
          dense
          readonly
          class="bg-white"
        >
          <template #append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="collectionStartDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
            <q-icon
              name="close"
              class="cursor-pointer q-ml-sm"
              @click="clearDate('collectionStartDate')"
            />
          </template>
        </q-input>
      </div>

      <div class="col">
        <div class="dialog-label">
          <div class="text-weight-bold text-subtitle2">Search</div>
        </div>
        <q-input
          class="search-transactions search-input"
          v-model="searchQuery"
          outlined
          dense
          debounce="300"
          placeholder="Search here..."
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Table Display -->
    <TagsListComponent :orders="filteredOrders" />
  </div>

  <!-- Customize Tag Dialog (drop-in) -->
  <q-dialog v-model="showCustomizeDialog" persistent>
    <q-card class="input-dialog">
      <!-- Header -->
      <q-card-section class="dialog-header">
        <q-btn
          icon="close"
          flat
          dense
          round
          class="absolute-top-right q-ma-sm"
          v-close-popup
        />
        <div class="text-body1 text-uppercase text-weight-bold">
          Customize Tag
        </div>
      </q-card-section>

      <!-- Body -->
      <q-card-section class="dialog-body">
        <q-form @submit.prevent="printCustomTag">
          <!-- Description -->
          <div class="dialog-label">Description:</div>
          <q-input
            v-model="customDescription"
            outlined
            dense
            class="q-mb-md"
            placeholder="XYYYY-XXXYY-XYYYY"
          />

          <div class="row q-col-gutter-md">
            <!-- Order No -->
            <div class="col">
              <div class="dialog-label">Order No:</div>
              <q-select
                v-model="customOrderNo"
                :options="orderNoOptions"
                outlined
                dense
                placeholder="Enter or search here..."
                clearable
                use-input
                input-debounce="200"
                emit-value
                map-options
                @filter="filterOrderNos"
              />
            </div>

            <!-- PCS -->
            <div class="col">
              <div class="dialog-label">
                PCS:
              </div>
             <q-input
  v-model.number="customPcs"
  type="number"
  outlined
  dense
  min="1"
  step="1"
  inputmode="numeric"
  pattern="[0-9]*"
  class="q-mb-md"
  @keydown="allowDigitsOnly"
  @paste="blockNonDigitsPaste"
  @blur="customPcs=onBlurDefault(customPcs, 1, 1)"
/>
            </div>

            <!-- Urgency -->
            <div class="col">
              <div class="dialog-label">Urgency:</div>
              <q-select
                v-model="customUrgencyValue"
                :options="[
                  { label: 'Default (D)', value: 'default' },
                  { label: 'Express (E)', value: 'express' },
                  { label: 'Urgent (U)', value: 'urgent' },
                ]"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
          </div>

          <!-- A–G row -->
          <div class="row q-col-gutter-md">
            <div class="col">
              <div class="dialog-label">A:</div>
              <q-input
                v-model.number="customA"
                type="number"
                outlined
                dense
                min="0"
                step="1"
                inputmode="numeric"
                pattern="[0-9]*"
  @keydown="allowDigitsOnly"
  @paste="blockNonDigitsPaste"
   @blur="customA=onBlurDefault(customA, 0, 0)"
              />
            </div>
            <div class="col">
              <div class="dialog-label">B:</div>
              <q-input
                v-model.number="customB"
                type="number"
                outlined
                dense
                min="0"
                step="1"
                inputmode="numeric"
                pattern="[0-9]*"
  @keydown="allowDigitsOnly"
  @paste="blockNonDigitsPaste"
   @blur="customB=onBlurDefault(customB, 0, 0)"
              />
            </div>
            <div class="col">
              <div class="dialog-label">C:</div>
              <q-input
                v-model.number="customC"
                type="number"
                outlined
                dense
                min="0"
                step="1"
                inputmode="numeric"
                pattern="[0-9]*"
  @keydown="allowDigitsOnly"
  @paste="blockNonDigitsPaste"
   @blur="customC=onBlurDefault(customC, 0, 0)"
              />
            </div>
            <div class="col">
              <div class="dialog-label">D:</div>
              <q-input
                v-model.number="customD"
                type="number"
                outlined
                dense
                min="0"
                step="1"
                inputmode="numeric"
                pattern="[0-9]*"
  @keydown="allowDigitsOnly"
  @paste="blockNonDigitsPaste"
   @blur="customD=onBlurDefault(customD, 0, 0)"
              />
            </div>
            <div class="col">
              <div class="dialog-label">E:</div>
              <q-input
                v-model.number="customE"
                type="number"
                outlined
                dense
                min="0"
                step="1"
                inputmode="numeric"
                pattern="[0-9]*"
  @keydown="allowDigitsOnly"
  @paste="blockNonDigitsPaste"
   @blur="customE=onBlurDefault(customE, 0, 0)"
              />
            </div>
            <div class="col">
              <div class="dialog-label">F:</div>
              <q-input
                v-model.number="customF"
                type="number"
                outlined
                dense
                min="0"
                step="1"
                inputmode="numeric"
                pattern="[0-9]*"
  @keydown="allowDigitsOnly"
  @paste="blockNonDigitsPaste"
   @blur="customF=onBlurDefault(customF, 0, 0)"
              />
            </div>
            <div class="col">
              <div class="dialog-label">G:</div>
              <q-input
                v-model.number="customG"
                type="number"
                outlined
                dense
                min="0"
                step="1"
                inputmode="numeric"
                pattern="[0-9]*"
  @keydown="allowDigitsOnly"
  @paste="blockNonDigitsPaste"
   @blur="customG=onBlurDefault(customG, 0, 0)"
              />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Tag Preview (ribbon layout 100mm x 12.7mm) -->
<div class="flex flex-center">
            <div style="border: solid black 1px">
            <q-card
              flat
              class="tags row items-center no-wrap justify-between text-center"
            >
              <!-- Urgency -->
              <div class="col-auto" v-if="customUrgency">
                <div class="tag-urgency">{{ customUrgency }}</div>
              </div>

              <!-- A–G counters -->
              <div class="col-auto">
                <div class="row text-center no-wrap items-center">
                  <div class="col-auto tag-count">
                    <div class="text-weight-bold">{{ customA ?? 0 }}</div>
                    <div>A</div>
                  </div>
                  <div class="col-auto tag-count">
                    <div class="text-weight-bold">{{ customB ?? 0 }}</div>
                    <div>B</div>
                  </div>
                  <div class="col-auto tag-count">
                    <div class="text-weight-bold">{{ customC ?? 0 }}</div>
                    <div>C</div>
                  </div>
                  <div class="col-auto tag-count">
                    <div class="text-weight-bold">{{ customD ?? 0 }}</div>
                    <div>D</div>
                  </div>
                  <div class="col-auto tag-count">
                    <div class="text-weight-bold">{{ customE ?? 0 }}</div>
                    <div>E</div>
                  </div>
                  <div class="col-auto tag-count">
                    <div class="text-weight-bold">{{ customF ?? 0 }}</div>
                    <div>F</div>
                  </div>
                  <div class="col-auto tag-count">
                    <div class="text-weight-bold">{{ customG ?? 0 }}</div>
                    <div>G</div>
                  </div>
                </div>
              </div>

              <!-- Details -->
              <div class="col-auto tag-details text-weight-bold">
                <span
                  v-for="(c, i) in descriptionChars"
                  :key="i"
                  :class="{ 'placeholder-char': c.placeholder }"
                >
                  {{ c.ch }}
                </span>
              </div>

              <!-- QR (Order No) -->
              <div class="col-auto">
                <qrcode-vue
                  v-if="customOrderNo"
                  :value="String(customOrderNo)"
                  :size="40"
                  level="H"
                  class="q-mt-xs"
                  render-as="svg"
                />
              </div>

              <!-- PCS -->
              <div class="col-auto">
                <div class="tag-pcs">{{ customPcs ?? 1 }}</div>
              </div>
            </q-card>
          </div>
</div>

          <!-- Actions -->
          <q-card-actions align="between" class="q-mt-sm">
            <q-btn
              outline
              color="negative"
              label="Clear"
              @click="resetCustomizeForm"
            />
            <div>
              <q-btn flat label="Cancel" v-close-popup class="q-mr-sm" />
              <q-btn color="primary" type="submit" label="Print" />
            </div>
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>

</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import html2pdf from "html2pdf.js";
import QrcodeVue from "qrcode.vue";
import TagsListComponent from "@/components/TagsListComponent.vue";

const transactionStore = useTransactionStore();
const orders = ref([]);

const searchQuery = ref(""); // Search input
// Date Filters
const collectionStartDate = ref(null);

const selectedDriver = ref(null);
const selectedDate = ref(null);

const formattedSelectedDate = computed(() => formatDate(selectedDate.value));
const selectedMatchedOrders = ref([]);
const customUrgencyValue = ref("default"); // 'default' | 'express' | 'urgent'
const customUrgency = computed(() => {
  const raw = customUrgencyValue.value;
  const v = typeof raw === "string" ? raw : raw?.value;
  if (v === "urgent") return "U";
  if (v === "express") return "E";
  return ""; // default -> hide chip
});
const customDescription = ref("");
const customPcs = ref(1);
const customA = ref(0);
const customB = ref(0);
const customC = ref(0);
const customD = ref(0);
const customE = ref(0);
const customF = ref(0);
const customG = ref(0);

const DESCRIPTION_TEMPLATE = "XYYYY-XXXYY-XYYYY";

const descriptionChars = computed(() => {
  const tpl = DESCRIPTION_TEMPLATE;
  const input = String(customDescription.value || "");
  // strip non-alphanumerics except hyphen to keep positions deterministic
  const typed = input.replace(/-/g, ""); // user may type '-'; ignore for mapping
  let tIdx = 0;
  const out = [];

  for (let i = 0; i < tpl.length; i++) {
    const tplCh = tpl[i];
    if (tplCh === "-") {
      out.push({ ch: "-", placeholder: false });
      continue;
    }
    if (tIdx < typed.length) {
      out.push({ ch: typed[tIdx], placeholder: false });
      tIdx++;
    } else {
      out.push({ ch: tplCh, placeholder: true });
    }
  }
  return out;
});

const COLLECTION_STATUSES = [
  "collection arranged",
  "items with driver",
  "collection completed",
  "collection rescheduled",
  "collection cancelled",
  "ongoing collection issue/s",
];

const DELIVERY_STATUSES = [
  "processing items",
  "delivery arranged",
  "delivery partial",
  "delivery completed",
  "delivery postponed",
  "ongoing delivery issue/s",
];
const customOrderNo = ref(null);
const orderNoOptions = ref([]); // [{label,value}]
function filterOrderNos(val, update) {
  update(() => {
    const needle = String(val || "").toLowerCase();
    orderNoOptions.value = orderNoOptions.value.filter((o) =>
      o.label.toLowerCase().includes(needle)
    );
  });
}

const toTitleCase = (input) => {
  const s = String(input || "")
    .trim()
    .toLowerCase();
  if (!s) return s;
  return s.replace(
    /([A-Za-zÀ-ÖØ-öø-ÿ])([A-Za-zÀ-ÖØ-öø-ÿ]*)/g,
    (_, f, rest) => f.toUpperCase() + rest
  );
};

const logisticsStatusOptions = computed(() => [
  ...COLLECTION_STATUSES.map((v) => ({ label: toTitleCase(v), value: v })),
  ...DELIVERY_STATUSES.map((v) => ({ label: toTitleCase(v), value: v })),
]);

const logisticsStatusFilter = ref("collection completed");
const collectionDriverFilter = ref(null);
const tagStatusFilter = ref(null);

const tagStatusOptions = [
  { label: "Printed", value: "printed" },
  { label: "To Print", value: "to print" },
];

const sortedDriverOptions = computed(() => {
  return [...transactionStore.driverOptions].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
});

const norm = (v) =>
  String(v ?? "")
    .trim()
    .toLowerCase();

const driverMapById = computed(() => {
  const m = new Map();
  (transactionStore.driverOptions || []).forEach((d) => {
    if (d?.id != null) m.set(String(d.id), (d.name || "").trim());
  });
  return m;
});

const getDriverName = (id) => {
  const key = id != null ? String(id) : "";
  return (key && driverMapById.value.get(key)) || "";
};

const collectionDriverName = (src) => {
  const c = Array.isArray(src?.collections) ? src.collections?.[0] : src;
  if (!c) return "";
  return (getDriverName(c?.driver_id) || c?.driver_name || "").trim();
};

const selectAll = ref(false);

watch(selectAll, (val) => {
  if (val) {
    selectedMatchedOrders.value = [...matchedOrdersList.value];
  } else {
    selectedMatchedOrders.value = [];
  }
});

watch(selectedMatchedOrders, (val) => {
  selectAll.value =
    val.length === matchedOrdersList.value.length &&
    matchedOrdersList.value.length > 0;
});

watch([selectedDriver, selectedDate], () => {
  if (!selectedDriver.value || !selectedDate.value) {
    matchedOrdersList.value = [];
    return;
  }

  const driverName = selectedDriver.value.name;
  const selectedRawDate = selectedDate.value;

  matchedOrdersList.value = filteredOrders.value.filter((logistics) =>
    (logistics.collections || []).some(
      (c) =>
        (getDriverName(c?.driver_id) || c?.driver_name || "") === driverName &&
        c?.collection_date === selectedRawDate
    )
  );
});

onMounted(async () => {
  try {
    const result = await transactionStore.fetchOrdersForTags();
    orders.value = result;
    await transactionStore.loadDrivers();

    // NEW: fetch A–G counts for all loaded orders
    const orderIds = (orders.value || [])
      .map((lg) => lg?.order?.id)
      .filter(Boolean);
    await transactionStore.fetchTagCountsByOrderIds(orderIds);
  } catch (error) {
    console.error("Error on load:", error);
  }
});

const formattedCollectionStartDate = computed(() =>
  collectionStartDate.value
    ? formatDate(collectionStartDate.value)
    : "None applied"
);

// Clear Date Input
const clearDate = (type) => {
  if (type === "collectionStartDate") collectionStartDate.value = null;
};

const filteredOrders = computed(() => {
  const query = (searchQuery.value || "").toLowerCase().trim();

  return orders.value
    .filter((logistics) => {
      // search
      const orderNo = (logistics.order?.order_no || "").toLowerCase();
      const cust = logistics.customer || {};
      const customerFields = [
        cust.name,
        cust.contact_no1,
        cust.contact_no2,
        cust.email,
      ];
      const cpSrc =
        logistics.collections?.[0]?.contact_person ||
        logistics.collections?.[0]?.customer_contact_persons ||
        {};
      const contactPersonFields = [
        cpSrc.name,
        cpSrc.contact_no1,
        cpSrc.contact_no2,
        cpSrc.email,
      ];

      const haystack = [orderNo, ...customerFields, ...contactPersonFields].map(
        (v) => (v == null ? "" : String(v).toLowerCase())
      );
      const searchPass = !query || haystack.some((s) => s.includes(query));

      // logistics status
      const statusPass = !logisticsStatusFilter.value
        ? true
        : norm(logistics.logistics_status) ===
          norm(logisticsStatusFilter.value);

      // tag status
      const tagPass = !tagStatusFilter.value
        ? true
        : norm(logistics.order?.order_tags?.tag_status) ===
          norm(tagStatusFilter.value);

      // collection driver (compare trimmed names)
      const drvSel = String(collectionDriverFilter.value || "").trim();
      const drvRow = collectionDriverName(logistics);
      const driverPass = !drvSel ? true : String(drvRow).trim() === drvSel;

      // collection date (strict match of YYYY-MM-DD)
      const dateSel = collectionStartDate.value;
      const dateRow = logistics.collections?.[0]?.collection_date || null;
      const datePass = !dateSel
        ? true
        : String(dateRow || "") === String(dateSel || "");

      return searchPass && statusPass && tagPass && driverPass && datePass;
    })
    .sort((a, b) => {
      const dateA = new Date(a.collections?.[0]?.collection_date || 0);
      const dateB = new Date(b.collections?.[0]?.collection_date || 0);
      return dateB - dateA;
    });
});

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Open Order Dialog and fetch transaction items
const openOrderDialog = async (logistics) => {
  try {
    if (!logistics || !logistics.order) return;

    transactionStore.setSelectedCustomer({
      id: logistics.customer?.id,
    });

    transactionStore.setOrderNo(logistics.order.order_no);
    transactionStore.resetTransactionItems();

    window.open(`/orders/read-${logistics.order.order_no}`, "_blank");
  } catch (error) {
    console.error("Error opening order dialog:", error);
  }
};

const DRIVER_CODES = {
  Ass: "Ass",
  Ken: "Ken",
  Ang: "Ang",
  Pea: "Pea",
  You: "You",
  "Self-collect": "Sfc",
  "Ng Soo Chong": "Nsc",
  Chia: "Cha",
  Des: "Des",
  Cue: "Cue",
  Are: "Are",
  Ting: "Tin",
};

const matchedOrdersList = ref([]);

const generateTag = () => {
  const driverName = selectedDriver.value?.name;
  const selectedRawDate = selectedDate.value;

  if (!driverName || !selectedRawDate) {
    console.warn("Driver or Date not selected");
    return;
  }

  if (!selectedMatchedOrders.value.length) {
    console.warn("No orders selected to generate tag.");
    return;
  }

  const driverCode = DRIVER_CODES[driverName] || driverName;
  const groupSlug = `${driverCode}-${selectedRawDate}`;

  const selectedOrderNos = selectedMatchedOrders.value
    .map((logistics) => logistics.order?.order_no)
    .filter(Boolean);

  const query = encodeURIComponent(selectedOrderNos.join(","));
  const url = `/tags/grp-${groupSlug}?orders=${query}`;

  window.open(url, "_blank");
};

const generateInvoice = () => {
  const driverName = selectedDriver.value?.name;
  const selectedRawDate = selectedDate.value;

  if (!driverName || !selectedRawDate) {
    console.warn("Driver or Date not selected");
    return;
  }

  if (!selectedMatchedOrders.value.length) {
    console.warn("No orders selected to generate invoice.");
    return;
  }

  const driverCode = DRIVER_CODES[driverName] || driverName;
  const groupSlug = `${driverCode}-${selectedRawDate}`;

  const selectedOrderNos = selectedMatchedOrders.value
    .map((logistics) => logistics.order?.order_no)
    .filter(Boolean);

  const query = encodeURIComponent(selectedOrderNos.join(","));
  const url = `/invoice/grp-${groupSlug}?orders=${query}`;

  window.open(url, "_blank");
};

const showCustomizeDialog = ref(false);
const orderNosLoaded = ref(false);

const openCustomizeDialog = () => {
  showCustomizeDialog.value = true;
  if (!orderNosLoaded.value) {
    transactionStore
      .fetchOrderNos()
      .then((nos) => {
        orderNoOptions.value = (nos || []).map((n) => ({ label: n, value: n }));
        orderNosLoaded.value = true;
      })
      .catch(console.error);
  }
};

// REPLACE the existing printCustomTag with this:
const printCustomTag = () => {
  const tagElement = document.querySelector(".q-dialog .tags");
  if (!tagElement) {
    console.warn("Tag element not found.");
    return;
  }

  // how many tags to print
  const pcsCount = Number(customPcs.value) || 1;

  // container for clones
  const clonedContainer = document.createElement("div");
  clonedContainer.style.display = "flex";
  clonedContainer.style.flexWrap = "wrap";
  clonedContainer.style.gap = "0";

  for (let i = 0; i < pcsCount; i++) {
    const clonedTag = tagElement.cloneNode(true);
    clonedTag.style.pageBreakBefore = "always"; // why: force each tag start on new page
    clonedContainer.appendChild(clonedTag);
  }

  const options = {
    margin: 0,
    filename: `Custom_Tags_Print${customOrderNo?.value ? "_" + customOrderNo.value : ""}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: null,
    },
    jsPDF: {
      unit: "mm",
      format: [105, 12.7], // match TagView (100mm ≈ 105mm width in jsPDF)
      orientation: "landscape",
    },
    pagebreak: { mode: ["avoid-all", "css"] },
  };

  html2pdf()
    .set(options)
    .from(clonedContainer)
    .toPdf()
    .output("blob")
    .then((blob) => {
      const pdfUrl = URL.createObjectURL(blob);
      const newWindow = window.open(pdfUrl, "_blank");
      if (newWindow) {
        setTimeout(() => {
          newWindow.print();
          newWindow.onafterprint = () => newWindow.close();
        }, 500);
      } else {
        console.error("Pop-up blocked. Please allow pop-ups for this site.");
      }
    })
    .catch((err) => console.error("Error generating Tag PDF:", err));
};

// Blocks anything except digits and navigation keys
function allowDigitsOnly(e) {
  const allowedKeys = [
    'Backspace','Delete','Tab','Escape','Enter',
    'Home','End','ArrowLeft','ArrowRight'
  ];
  if (allowedKeys.includes(e.key)) return; // allow nav/edit keys
  // Allow Ctrl/Meta combos (copy/cut/select all)
  if ((e.ctrlKey || e.metaKey) && ['a','c','v','x'].includes(e.key.toLowerCase())) return;
  if (!/^\d$/.test(e.key)) e.preventDefault(); // block non-digit
}

// Blocks paste if it contains any non-digits
function blockNonDigitsPaste(e) {
  const text = (e.clipboardData || window.clipboardData)?.getData('text') || '';
  if (!/^\d+$/.test(text)) e.preventDefault();
}

// snaps empty/invalid to default; optionally clamps to min
function onBlurDefault(val, defaultVal, minVal = null) {
  const n = typeof val === 'number' && !Number.isNaN(val) ? val : Number(val);
  if (!Number.isFinite(n)) return defaultVal;        // empty/NaN -> default
  const clamped = minVal != null && n < minVal ? minVal : n;
  return Math.trunc(clamped);                        // enforce integer
}

// Reset helper
function resetCustomizeForm() {
  customDescription.value = "";
  customOrderNo.value = null;
  customPcs.value = 1;
  customUrgencyValue.value = "default";
  customA.value = 0;
  customB.value = 0;
  customC.value = 0;
  customD.value = 0;
  customE.value = 0;
  customF.value = 0;
  customG.value = 0;
}

</script>

<style scoped>
.placeholder-char {
  color: #9aa0a6; /* subtle grey */
}
</style>
