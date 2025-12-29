<template>
  <q-card class="slip-card text-weight-bold">
    <div class="text-subtitle1 text-uppercase text-weight-bolder">
      Delivery Details
    </div>
    <q-separator class="q-my-xs" />

    <div class="row q-col-gutter-sm">
      <div class="col text-slip-row">
        Contact Person:<span class="dialog-asterisk">*</span>
        <q-select
          v-model="transactionStore.selectedDeliveryContact"
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
          v-model="formattedDeliveryContactNos"
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
        v-model="transactionStore.selectedDeliveryAddress"
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
        Delivery Date:<span class="dialog-asterisk">*</span>
        <q-input
          v-model="formattedDeliveryDate"
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
                  v-model="transactionStore.deliveryDate"
                  mask="YYYY-MM-DD"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="col text-slip-row">
        Delivery Time:<span class="dialog-asterisk">*</span>
        <q-select
          v-model="transactionStore.deliveryTime"
          :options="timeOptionsUi"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          label="Select Delivery Time"
          outlined
          dense
          clearable
          class="q-mb-xs bg-white"
        />
      </div>
    </div>

    <div class="row q-col-gutter-sm">
      <div class="col text-slip-row">
        Delivery Driver:<span class="dialog-asterisk">*</span>
        <q-select
          v-model="transactionStore.selectedDeliveryDriver"
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
      <!-- Delivered Date -->
      <div class="col text-slip-row">
        Delivered Date:
        <q-input
          v-model="transactionStore.deliveredDate"
          type="date"
          dense
          outlined
          clearable
          @clear="transactionStore.deliveredDate = null"
        />
      </div>
    </div>

    <div class="text-slip-row">
      Remarks:
      <q-input
        v-model="transactionStore.deliveryRemarks"
        outlined
        dense
        class="q-mb-sm bg-white"
      />
    </div>

    <q-card-actions align="right">
      <q-btn
        label="Update Delivery"
        color="primary"
        icon="update"
        class="full-width"
        @click="updateDelivery"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { useQuasar } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";

const $q = useQuasar();
const transactionStore = useTransactionStore();

const emit = defineEmits(["close", "update:modelValue"]);

const contactOptions = ref([]);
const addressOptions = ref([]);

// ✅ Map whatever the store returns into { label, value } for q-select
const timeOptionsUi = computed(() => {
  const src = transactionStore.timeOptions || [];
  return src.map((t) => {
    if (typeof t === "string") {
      return { label: t, value: t };
    }
    // support a few common shapes (label/value, time, name)
    return {
      label: t.label ?? t.value ?? t.time ?? t.name ?? "",
      value: t.value ?? t.label ?? t.time ?? t.name ?? "",
    };
  }).filter(o => o.label && o.value);
});

const sortedDriverOptions = computed(() =>
  [...(transactionStore.driverOptions || [])].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "")
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
  (arr || []).find((o) => String(o.id) === String(id)) || null;

// ---------- options (contacts/addresses/drivers/time) ----------
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

  // 1) Ensure base lookups are loaded FIRST (drivers + times)
  await Promise.all([
    transactionStore.loadDrivers(),
    transactionStore.loadTimeOptions(),
  ]);

  // 2) fetch the current delivery row
  const rows = await transactionStore.fetchDeliveryByLogisticsId(logisticsId);
  const del = Array.isArray(rows) && rows[0] ? rows[0] : null;
  if (!del) return;

  // 3) derive customer id
  const customerId =
    transactionStore.selectedCustomer?.id ??
    transactionStore.selectedTransaction?.customer?.id ??
    transactionStore.customerId ??
    null;

  // 4) ensure contact/address options are ready
  await updateOptions(customerId);

  // 5) map address/contact to option objects
  const addrObj = findById(addressOptions.value, del.address_id);
  const contactObj = del.customer_contact_persons
    ? {
        ...del.customer_contact_persons,
        label: `${del.customer_contact_persons.name}${
          del.customer_contact_persons.contact_no1
            ? " - " + del.customer_contact_persons.contact_no1
            : ""
        }`,
      }
    : null;

  // 6) hydrate store fields used by inputs
  transactionStore.selectedDeliveryId = del.id || null;
  transactionStore.selectedDeliveryContact = contactObj || null;
  transactionStore.selectedDeliveryAddress = addrObj || null;

  // driver/time selects use emit-value + map-options
  transactionStore.selectedDeliveryDriver = del.driver_id ?? null;

  // If the saved time is not in options, clear it to avoid a blank chip
  const savedTime = del.delivery_time ?? null;
  const allowedValues = new Set(timeOptionsUi.value.map((o) => o.value));
  transactionStore.deliveryTime = allowedValues.has(savedTime) ? savedTime : null;

  // dates/remarks
  transactionStore.deliveryDate =
    (del.delivery_date || "").slice(0, 10) || null;
  transactionStore.deliveredDate =
    (del.delivered_date || "").slice(0, 10) || null;
  transactionStore.deliveryRemarks = del.delivery_remarks ?? null;
}

// ---------- lifecycle / watchers ----------
onMounted(async () => {
  // load times/drivers once; then hydrate form
  await Promise.all([
    transactionStore.loadDrivers(),
    transactionStore.loadTimeOptions(),
  ]);
  await initFromLogisticsId(transactionStore.logisticsId);
});

watch(
  () => transactionStore.logisticsId,
  async (id) => {
    await initFromLogisticsId(id);
  }
);

// If the store’s timeOptions change later, re-validate selected value
watch(
  () => transactionStore.timeOptions,
  () => {
    const values = new Set(timeOptionsUi.value.map((o) => o.value));
    if (transactionStore.deliveryTime && !values.has(transactionStore.deliveryTime)) {
      transactionStore.deliveryTime = null;
    }
  },
  { deep: true }
);

// ---------- UI formatters ----------
const formattedDeliveryDate = computed(() =>
  formatDate(transactionStore.deliveryDate)
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

const formattedDeliveryContactNos = computed({
  get() {
    const c = transactionStore.selectedDeliveryContact;
    if (!c) return "-";
    const c1 = c.contact_no1 || "-";
    const c2 = c.contact_no2;
    return c2 ? `${c1} / ${c2}` : c1;
  },
  set(value) {
    if (!transactionStore.selectedDeliveryContact) {
      transactionStore.selectedDeliveryContact = {};
    }
    const [c1, c2] = String(value)
      .split(" / ")
      .map((s) => s.trim());
    transactionStore.selectedDeliveryContact.contact_no1 = c1 || "";
    transactionStore.selectedDeliveryContact.contact_no2 = c2 || null;
  },
});

// ---------- save ----------
async function updateDelivery() {
  const id = transactionStore.selectedDeliveryId;
  if (!id) {
    $q.notify({ type: "negative", message: "No delivery selected for update." });
    return;
  }

  const contact = transactionStore.selectedDeliveryContact;
  const address = transactionStore.selectedDeliveryAddress;
  const driver = transactionStore.selectedDeliveryDriver;

  const updateData = {
    delivery_date: transactionStore.deliveryDate || null,
    delivery_time: transactionStore.deliveryTime || null,
    delivery_remarks: transactionStore.deliveryRemarks || null,
    contact_person_id: contact?.id ?? contact ?? null,
    address_id: address?.id ?? address ?? null,
    driver_id: driver?.id ?? driver ?? null,
  };

  try {
    await transactionStore.updateDelivery(id, updateData);
    $q.notify({ type: "positive", message: "Delivery updated successfully." });
    emit("close");
  } catch (error) {
    console.error("Update delivery failed:", error);
    $q.notify({
      type: "negative",
      message: "Failed to update delivery. Please try again.",
    });
  }
}

const formattedDeliveredDate = computed(() =>
  formatDate(transactionStore.deliveredDate)
);
</script>
