<!-- File: src/components/CreateCollectionTab.vue -->
<template>
  <div class="selected-customer" v-if="selectedCustomer">
    <q-card flat class="customer-card q-pa-sm text-p">
      <q-card-section>
        <div
          class="text-body1 text-center text-uppercase text-weight-bold q-mb-xs"
        >
          Selected Customer
        </div>
        <q-separator class="q-my-xs q-mb-sm" />
        <div class="row">
          <div class="col-auto text-right">
            <div>Name:</div>
            <div>Contact No:</div>
            <div v-if="selectedCustomer.email">Email:</div>
          </div>
          <div class="col q-pl-sm">
            <div class="text-summary">{{ selectedCustomer.name }}</div>
            <div class="text-summary">
              {{ selectedCustomer.contact_no1
              }}<span v-if="selectedCustomer.contact_no2">
                / {{ selectedCustomer.contact_no2 || "-" }}
              </span>
            </div>
            <div v-if="selectedCustomer.email" class="text-summary">
              {{ selectedCustomer.email }}
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div class="row contact-selection q-mt-md q-col-gutter-x-md">
      <!-- Collection -->
      <div class="col">
        <q-card flat class="customer-card q-pa-md">
          <div
            class="text-body1 text-center text-uppercase text-weight-bold q-mb-xs"
          >
            For Collection
          </div>
          <q-separator class="q-mb-md" />

          <q-btn
            outline
            dense
            class="outline-btn q-mb-sm q-px-sm"
            color="primary"
            label="Add Contact Person"
            @click="showAddContactPersonDialog = true"
          />
          <q-btn
            outline
            dense
            color="primary"
            label="Add Address"
            @click="showAddAddressDialog = true"
            class="outline-btn q-ml-sm q-mb-sm q-px-sm"
          />

          <div>
            <div class="dialog-label">
              Contact Person<span class="dialog-asterisk">*</span>
            </div>
            <q-select
              v-model="transactionStore.selectedCollectionContact"
              :options="contactOptionsUi"
              option-label="label"
              option-value="id"
              label="Select Collection Contact"
              outlined
              dense
              clearable
              class="q-mb-xs bg-white"
            />
          </div>

          <div>
            <div class="dialog-label">
              Collection Address<span class="dialog-asterisk">*</span>
            </div>
            <q-select
              v-model="transactionStore.selectedCollectionAddress"
              :options="addressOptionsUi"
              option-label="label"
              option-value="id"
              label="Select Collection Address"
              outlined
              dense
              clearable
              class="q-mb-xs bg-white"
            />
          </div>

          <div class="row q-col-gutter-xs">
            <div class="col">
              <div class="dialog-label">
                Collection Date<span class="dialog-asterisk">*</span>
              </div>
              <q-input
                v-model="formattedCollectionDate"
                outlined
                dense
                readonly
                class="q-mb-xs bg-white"
              >
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                      <q-date
                        v-model="transactionStore.collectionDate"
                        mask="YYYY-MM-DD"
                      />
                    </q-popup-proxy>
                  </q-icon>
                  <q-icon
                    name="close"
                    class="cursor-pointer q-ml-sm"
                    @click="clearDate('collectionDate')"
                  />
                </template>
              </q-input>
            </div>
            <div class="col">
              <div class="dialog-label">
                Collection Time<span class="dialog-asterisk">*</span>
              </div>
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

          <div>
            <div class="dialog-label">
              Colection Driver<span class="dialog-asterisk">*</span>
            </div>
            <q-select
              v-model="transactionStore.selectedCollectionDriver"
              :options="driverOptionsUi"
              option-label="name"
              label="Select Collection Driver"
              outlined
              dense
              clearable
              class="q-mb-xs bg-white"
            />
          </div>

          <div class="row q-col-gutter-xs">
            <div class="col">
              <div class="dialog-label">
                Job Type<span class="dialog-asterisk">*</span>
              </div>
              <q-select
                v-model="transactionStore.jobType"
                :options="jobOptions"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                label="Select Job Type"
                outlined
                dense
                clearable
                class="q-mb-xs bg-white"
              />
            </div>
            <div class="col">
              <div class="dialog-label">
                No. of Bags<span class="dialog-asterisk">*</span>
              </div>
              <q-input
                v-model="transactionStore.collectionNoBags"
                label="No. of Bags"
                outlined
                dense
                class="q-mb-xs bg-white"
              />
            </div>
          </div>

          <div>
            <div class="dialog-label">Collection Remarks</div>
            <q-input
              v-model="transactionStore.collectionRemarks"
              label="Remarks"
              outlined
              dense
              class="q-mb-xs bg-white"
            />
          </div>

          <q-btn
            outline
            dense
            color="white"
            label="Reset Collection"
            @click="confirmReset('collection')"
            class="text-red-9 text-weight-bold q-mt-sm q-px-sm"
          />
        </q-card>
      </div>

      <!-- Delivery -->
      <div class="col">
        <q-card flat class="customer-card q-pa-md">
          <div
            class="text-body1 text-center text-uppercase text-weight-bold q-mb-xs"
          >
            For Delivery
          </div>
          <q-separator class="q-mb-md" />

          <q-btn
            outline
            dense
            class="outline-btn q-mb-sm q-px-sm"
            color="primary"
            label="Add Contact Person"
            @click="showAddContactPersonDialog = true"
          />
          <q-btn
            outline
            dense
            color="primary"
            label="Add Address"
            @click="showAddAddressDialog = true"
            class="outline-btn q-ml-sm q-mb-sm q-px-sm"
          />

          <div>
            <div class="dialog-label">Contact Person</div>
            <q-select
              v-model="transactionStore.selectedDeliveryContact"
              :options="contactOptionsUi"
              option-label="label"
              option-value="id"
              label="Select Delivery Contact"
              outlined
              dense
              clearable
              class="q-mb-xs bg-white"
            />
          </div>

          <div>
            <div class="dialog-label">Address</div>
            <q-select
              v-model="transactionStore.selectedDeliveryAddress"
              :options="addressOptionsUi"
              option-label="label"
              option-value="id"
              label="Select Delivery Address"
              outlined
              dense
              clearable
              class="q-mb-xs bg-white"
            />
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <div class="dialog-label">
                Delivery Date<span class="dialog-asterisk">*</span>
              </div>
              <q-input
                v-model="formattedDeliveryDate"
                outlined
                dense
                readonly
                class="q-mb-xs bg-white"
              >
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy>
                      <q-date
                        v-model="transactionStore.deliveryDate"
                        mask="YYYY-MM-DD"
                      />
                    </q-popup-proxy>
                  </q-icon>
                  <q-icon
                    name="close"
                    class="cursor-pointer q-ml-sm"
                    @click="clearDate('deliveryDate')"
                  />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <div class="dialog-label">Delivery Time</div>
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

          <div>
            <div class="dialog-label">Delivery Driver</div>
            <q-select
              v-model="transactionStore.selectedDeliveryDriver"
              :options="driverOptionsUi"
              option-label="name"
              label="Select Delivery Driver"
              outlined
              dense
              clearable
              class="q-mb-xs bg-white"
            />
          </div>

          <div>
            <div class="dialog-label">Delivery Remarks</div>
            <q-input
              v-model="transactionStore.deliveryRemarks"
              label="Remarks"
              outlined
              dense
              class="q-mb-xs bg-white"
            />
          </div>

          <q-btn
            outline
            dense
            color="white"
            label="Reset Delivery"
            @click="confirmReset('delivery')"
            class="text-red-9 text-weight-bold q-mt-sm q-px-sm"
          />
        </q-card>
      </div>
    </div>
  </div>

  <AddContactPersonDialog
    v-model="showAddContactPersonDialog"
    @contact-added="handleContactAdded"
  />
  <AddAddressDialog
    v-model="showAddAddressDialog"
    @address-added="handleAddressAdded"
  />

  <q-dialog v-model="showConfirmation">
    <q-card>
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Confirm Reset
        </div>
      </q-card-section>
      <q-card-section class="dialog-body">
        <p>
          Are you sure you want to reset this section? This action cannot be
          undone.
        </p>
        <q-card-actions align="right">
          <q-btn
            class="dialog-button"
            unelevated
            label="Cancel"
            color="negative"
            @click="showConfirmation = false"
          />
          <q-btn
            class="dialog-button"
            unelevated
            label="Yes"
            color="primary"
            @click="confirmAction"
          />
        </q-card-actions>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import AddContactPersonDialog from "@/components/dialogs/AddContactDialog.vue";
import AddAddressDialog from "@/components/dialogs/AddAddressDialog.vue";

const transactionStore = useTransactionStore();
const showAddContactPersonDialog = ref(false);
const showAddAddressDialog = ref(false);

const jobOptions = [
  { label: "Laundry", value: "laundry" },
  { label: "R&I", value: "ri" },
  { label: "R&I Quotation", value: "ri_quotation" },
  { label: "Onsite Carpet Cleaning", value: "onsite_carpet_cleaning" },
  { label: "Onsite Quotation", value: "onsite_quotation" },
  { label: "Onsite Sofa Cleaning", value: "onsite_sofa_cleaning" },
  { label: "Others", value: "others" },
];

onMounted(async () => {
  await transactionStore.loadDrivers();
  await transactionStore.loadTimeOptions();
  hardResetForm();
  updateUrgency();
});

const MS_DAY = 86_400_000;

function workingDays(collectionYmd, deliveryYmd) {
  if (!collectionYmd || !deliveryYmd) return null;
  const s = new Date(collectionYmd);
  const e = new Date(deliveryYmd);
  if (isNaN(s) || isNaN(e)) return null;

  let d = new Date(s.getTime() + MS_DAY);
  let count = 0;
  while (d.getTime() <= e.getTime()) {
    const day = d.getDay();           
    if (day !== 0 && day !== 6) count++; 
    d = new Date(d.getTime() + MS_DAY);
  }
  return count;
}

function computeUrgency(collectionDate, deliveryDate) {
  const wd = workingDays(collectionDate, deliveryDate);
  if (wd == null) return "default";
  if (wd < 4) return "express";
  if (wd <= 5) return "urgent";
  return "default";
}

function updateUrgency() {
  const wd = workingDays(transactionStore.collectionDate, transactionStore.deliveryDate);
  const level = computeUrgency(transactionStore.collectionDate, transactionStore.deliveryDate);
  transactionStore.jobUrgency = level;
}

watch(
  () => [transactionStore.collectionDate, transactionStore.deliveryDate],
  updateUrgency,
  { immediate: true }
);

watch(
  () => transactionStore.collectionDate,
  (newDate) => {
    if (newDate) transactionStore.deliveryDate = addWorkingDays(newDate, 7);
  }
);

watch(
  () => transactionStore.selectedCollectionDriver,
  async (n, o) => {
    if (n && n !== o) {
      try {
        transactionStore.order_no = await transactionStore.generateOrderNo();
      } catch (e) {
        console.error("Failed to generate order number:", e);
      }
    }
  }
);

watch(
  () => transactionStore.selectedCustomer?.id,
  (id) => {
    if (!id) return;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    transactionStore.collectionDate = todayStr;
    transactionStore.deliveryDate = addWorkingDays(today, 7);
    transactionStore.ready_by = addWorkingDays(today, 7);
    updateUrgency();
  },
  { immediate: true }
);

const selectedCustomer = computed(() => transactionStore.selectedCustomer);

watch(
  () => transactionStore.selectedCustomer?.id,
  (id) => {
    if (!id) return;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    transactionStore.collectionDate = todayStr;
    transactionStore.deliveryDate = addWorkingDays(today, 7);
    transactionStore.ready_by = addWorkingDays(today, 7);
  },
  { immediate: true }
);

const contactOptionsUi = computed(() =>
  (transactionStore.contactOptions || []).map((c) => ({
    id: c.id,
    label: `${c.name} - ${c.contact_no1 || ""}${
      c.contact_no2 ? ` / ${c.contact_no2}` : ""
    }`,
    name: c.name,
    contact_no1: c.contact_no1,
    contact_no2: c.contact_no2,
    email: c.email,
  }))
);

const addressOptionsUi = computed(() =>
  (transactionStore.addressOptions || []).map((a) => ({
    id: a.id,
    label: `${a.block_no} ${a.road_name} ${a.unit_no} ${a.building_name}, ${a.postal_code}`,
  }))
);

const driverOptionsUi = computed(() =>
  (transactionStore.driverOptions || [])
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
);

const handleContactAdded = async () => {
  showAddContactPersonDialog.value = false;
  const id = transactionStore.selectedCustomer?.id;
  if (id) await transactionStore.loadContactOptions(id);
};

const handleAddressAdded = async () => {
  showAddAddressDialog.value = false;
  const id = transactionStore.selectedCustomer?.id;
  if (id) await transactionStore.loadAddressOptions(id);
};

function addWorkingDays(startDate, workingDays) {
  const date = new Date(startDate);
  while (workingDays > 0) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) workingDays--;
  }
  return date.toISOString().split("T")[0];
}

const formatDate = (dateString) => {
  if (!dateString) return "--/--/----";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "--/--/----";
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formattedCollectionDate = computed(() =>
  formatDate(transactionStore.collectionDate)
);
const formattedDeliveryDate = computed(() =>
  formatDate(transactionStore.deliveryDate)
);

const showConfirmation = ref(false);
const actionToConfirm = ref(null);

const clearDate = (dateType) => {
  switch (dateType) {
    case "collectionDate":
      transactionStore.collectionDate = new Date().toISOString().split("T")[0];
      break;
    case "deliveryDate":
      transactionStore.deliveryDate = addWorkingDays(new Date(), 7);
      break;
  }
  updateUrgency();
};

const resetCollection = () => {
  transactionStore.selectedCollectionContact = null;
  transactionStore.selectedCollectionAddress = null;
  transactionStore.collectionDate = new Date().toISOString().split("T")[0];
  transactionStore.collectionTime = null;
  transactionStore.selectedCollectionDriver = null;
  transactionStore.collectionRemarks = "";
  transactionStore.ready_by = addWorkingDays(new Date(), 7);
  updateUrgency();
};

const resetDelivery = () => {
  transactionStore.selectedDeliveryContact = null;
  transactionStore.selectedDeliveryAddress = null;
  transactionStore.deliveryDate = addWorkingDays(new Date(), 7);
  transactionStore.deliveryTime = null;
  transactionStore.selectedDeliveryDriver = null;
  transactionStore.deliveryRemarks = "";
  updateUrgency();
};

const confirmReset = (section) => {
  actionToConfirm.value = section;
  showConfirmation.value = true;
};

const confirmAction = () => {
  if (actionToConfirm.value === "collection") resetCollection();
  else if (actionToConfirm.value === "delivery") resetDelivery();
  showConfirmation.value = false;
};

watch(
  () => transactionStore.selectedCustomer?.id,
  (id, oldId) => {
    if (!id || id === oldId) return;
    hardResetForm();
  }
);

function hardResetForm() {
  transactionStore.useCcCollection = false;
  transactionStore.useCcDelivery = false;
  transactionStore.order_no = null;
  transactionStore.jobType = null;         
  transactionStore.collectionNoBags = null; 

  resetCollection();
  resetDelivery();

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  transactionStore.collectionDate = todayStr;
  transactionStore.deliveryDate = addWorkingDays(today, 7);
  transactionStore.ready_by = addWorkingDays(today, 7);

  updateUrgency();
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
