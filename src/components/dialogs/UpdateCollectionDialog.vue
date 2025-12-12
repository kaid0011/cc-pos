<template>
  <q-card class="slip-card text-weight-bold">
    <div class="text-subtitle1 text-uppercase text-weight-bolder">
      Collection Details
    </div>
    <q-separator class="q-my-xs" />

    <div class="row q-col-gutter-sm">
      <div class="col text-slip-row">
        Contact Person:<span class="dialog-asterisk">*</span>
        <q-select
          v-model="transactionStore.selectedCollectionContact"
          :options="contactOptions"
          option-label="name"
          outlined
          required
          dense
          clearable
          class="q-mb-sm bg-white"
        />
      </div>

      <div class="col text-slip-row">
        Contact Nos:<span class="dialog-asterisk">*</span>
        <q-input
          v-model="formattedCollectionContactNos"
          disable
          required
          outlined
          dense
          class="q-mb-sm bg-white"
        />
      </div>
    </div>

    <div class="text-slip-row">
      Address:<span class="dialog-asterisk">*</span>
      <q-select
        v-model="transactionStore.selectedCollectionAddress"
        :options="addressOptions"
        option-label="__label"
        outlined
        required
        dense
        clearable
        class="q-mb-sm bg-white"
      />
    </div>

    <div class="row q-col-gutter-sm">
      <div class="col text-slip-row">
        Collection Date:<span class="dialog-asterisk">*</span>
        <q-input
          v-model="formattedCollectionDate"
          outlined
          dense
          required
          readonly
          class="q-mb-sm bg-white"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date
                  v-model="transactionStore.collectionDate"
                  mask="YYYY-MM-DD"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="col text-slip-row">
        Collection Time:<span class="dialog-asterisk">*</span>
<q-select
  v-model="transactionStore.collectionTime"
  :options="timeOptionsUi"
  option-label="label"
  option-value="value"
  emit-value
  map-options
  label="Select Collection Time"
  outlined
  dense
  clearable
  class="q-mb-xs bg-white"
/>
      </div>
    </div>

    <div class="row q-col-gutter-sm">
      <div class="col text-slip-row">
        Collection Driver:<span class="dialog-asterisk">*</span>
        <q-select
          v-model="transactionStore.selectedCollectionDriver"
          :options="sortedDriverOptions"
          option-label="name"
          option-value="id"
          emit-value
          map-options
          outlined
          required
          dense
          class="q-mb-sm bg-white"
        />
      </div>

      <div class="col text-slip-row">
        No.of Bags:<span class="dialog-asterisk">*</span>
        <q-input
          v-model="transactionStore.collectionNoBags"
          outlined
          dense
          required
          class="q-mb-sm bg-white"
        />
      </div>
    </div>

    <div class="text-slip-row">
      Remarks:
      <q-input
        v-model="transactionStore.collectionRemarks"
        outlined
        dense
        class="q-mb-sm bg-white"
      />
    </div>

    <q-card-actions align="right">
      <q-btn
        label="Update Collection"
        color="primary"
        icon="update"
        class="full-width"
        @click="updateCollection"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { useQuasar } from "quasar";

const $q = useQuasar();
const transactionStore = useTransactionStore();

const timeOptions = ref([]);
const contactOptions = ref([]);
const addressOptions = ref([]);

const sortedDriverOptions = computed(() =>
  [...transactionStore.driverOptions].sort((a, b) =>
    a.name.localeCompare(b.name)
  )
);

// ---------- helpers ----------
const buildAddressLabel = (a) => {
  if (!a) return "";
  const main = [a.block_no, a.road_name, a.unit_no, a.building_name]
    .map((v) => String(v ?? "").trim())
    .filter(Boolean)
    .join(" ");
  const postal = String(a.postal_code ?? "").trim();
  const extra = String(a.additional_info ?? "").trim();
  return [[main, postal].filter(Boolean).join(", "), extra ? `(${extra})` : ""]
    .filter(Boolean)
    .join(" ");
};

const findById = (arr, id) =>
  arr.find((o) => String(o.id) === String(id)) || null;

// ---------- options (contacts/addresses/time/drivers) ----------
async function updateOptions(customerId) {
  if (!customerId) {
    contactOptions.value = [];
    addressOptions.value = [];
    return;
  }
  await Promise.all([
    transactionStore.loadContactOptions(customerId),
    transactionStore.loadAddressOptions(customerId),
  ]);

  contactOptions.value = (transactionStore.contactOptions || []).map((c) => ({
    ...c,
    label: `${c.name}${c.contact_no1 ? " - " + c.contact_no1 : ""}`,
  }));

  addressOptions.value = (transactionStore.addressOptions || []).map((a) => ({
    ...a,
    __label: buildAddressLabel(a), // used by option-label="__label"
  }));
}

// ---------- main hydration from logisticsId ----------
async function initFromLogisticsId(logisticsId) {
  if (!logisticsId) return;

  // base lookups
  await Promise.all([
    transactionStore.loadDrivers(),
    transactionStore.loadTimeOptions(),
  ]);
  timeOptions.value = transactionStore.timeOptions || [];

  // 1) fetch the current collection row
  const rows = await transactionStore.fetchCollectionByLogisticsId(logisticsId);
  const col = Array.isArray(rows) && rows[0] ? rows[0] : null;
  if (!col) return;

  // 2) ensure options for the selected customer are loaded
  const customerId = transactionStore.selectedCustomer?.id || null;
  await updateOptions(customerId);

  // 3) map address_id → address option object
  const addrObj = findById(addressOptions.value, col.address_id);

  // 4) contact comes already joined as customer_contact_persons
  const contactObj = col.customer_contact_persons
    ? {
        ...col.customer_contact_persons,
        label: `${col.customer_contact_persons.name}${
          col.customer_contact_persons.contact_no1
            ? " - " + col.customer_contact_persons.contact_no1
            : ""
        }`,
      }
    : null;

  // 5) hydrate store fields used by the inputs
  transactionStore.selectedCollectionId = col.id || null;
  transactionStore.selectedCollectionContact = contactObj || null;
  transactionStore.selectedCollectionAddress = addrObj || null;

  // driver/time selects use emit-value+map-options → set to IDs/values
  transactionStore.selectedCollectionDriver = col.driver_id ?? null;
  transactionStore.collectionTime = col.collection_time ?? null;

  // dates/remarks/bags
  transactionStore.collectionDate =
    (col.collection_date || "").slice(0, 10) || null;
  transactionStore.collectionNoBags = col.no_bags ?? null;

  // NOTE: your fetch column is "collection_remarks"
  transactionStore.collectionRemarks = col.collection_remarks ?? null;
}

// ---------- watches / lifecycle ----------
onMounted(async () => {
  // hydrate when dialog mounts
  await initFromLogisticsId(transactionStore.logisticsId);
});

// rehydrate if parent switches the logistics we’re editing
watch(
  () => transactionStore.logisticsId,
  async (id) => {
    await initFromLogisticsId(id);
  }
);

// keep your 7-working-days rule for default delivery date
watch(
  () => transactionStore.collectionDate,
  (newDate) => {
    if (newDate) {
      transactionStore.deliveryDate = addWorkingDays(newDate, 7);
    }
  }
);

// ---------- misc ----------
function addWorkingDays(startDate, workingDays) {
  let date = new Date(startDate);
  while (workingDays > 0) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) workingDays--;
  }
  return date.toISOString().split("T")[0];
}

const formattedCollectionDate = computed(() =>
  formatDate(transactionStore.collectionDate)
);
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const formattedCollectionContactNos = computed({
  get() {
    const c = transactionStore.selectedCollectionContact;
    if (!c) return "-";
    const c1 = c.contact_no1 || "-";
    const c2 = c.contact_no2;
    return c2 ? `${c1} / ${c2}` : c1;
  },
  set(value) {
    if (!transactionStore.selectedCollectionContact) {
      transactionStore.selectedCollectionContact = {};
    }
    const [c1, c2] = String(value)
      .split(" / ")
      .map((s) => s.trim());
    transactionStore.selectedCollectionContact.contact_no1 = c1 || "";
    transactionStore.selectedCollectionContact.contact_no2 = c2 || null;
  },
});

async function updateCollection() {
  const id = transactionStore.selectedCollectionId;
  if (!id) {
    $q.notify({ type: "negative", message: "No collection selected for update." });
    return;
  }

  // Normalize values coming from selects (could be id or object)
  const contact = transactionStore.selectedCollectionContact;
  const address = transactionStore.selectedCollectionAddress;
  const driver  = transactionStore.selectedCollectionDriver;

  const updateData = {
    collection_date:     transactionStore.collectionDate || null,
    collection_time:     transactionStore.collectionTime || null,
    collection_remarks:  transactionStore.collectionRemarks || null,
    no_bags:             transactionStore.collectionNoBags ?? null,

    // IDs: accept either raw id or object with id
    contact_person_id:   contact?.id ?? contact ?? null,
    address_id:          address?.id ?? address ?? null,
    driver_id:           driver?.id ?? driver ?? null,
  };

  try {
    await transactionStore.updateCollection(id, updateData);
    $q.notify({ type: "positive", message: "Collection updated successfully." });
    
  } catch (error) {
    console.error("Update collection failed:", error);
    $q.notify({ type: "negative", message: "Failed to update collection. Please try again." });
  }
}
const timeOptionsUi = computed(() => {
  // support both array and { time: [...] }
  const raw = Array.isArray(transactionStore.timeOptions)
    ? transactionStore.timeOptions
    : Array.isArray(transactionStore.timeOptions?.time)
      ? transactionStore.timeOptions.time
      : [];

  return raw.map((t) => {
    if (typeof t === "string") {
      return { label: t, value: t };
    }
    // object case: accept common keys and fallbacks
    const label = t.label ?? t.value ?? t.time ?? "";
    const value = t.value ?? t.time ?? t.label ?? "";
    return { label, value };
  });
});
</script>
