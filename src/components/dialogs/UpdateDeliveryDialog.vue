<template>
  <q-card class="slip-card text-weight-bold">
    <div class="text-subtitle1 text-uppercase text-weight-bolder">
      Delivery Details
    </div>
    <q-separator class="q-my-xs" />

    <div class="row q-col-gutter-sm">
      <div class="col text-slip-row">
        Contact Person:
        <q-select
          v-model="transactionStore.selectedDeliveryContact"
          :options="contactOptions"
          option-label="name"
          option-value="id"
          outlined
          dense
          clearable
          class="q-mb-sm bg-white"
        />
      </div>

      <div class="col text-slip-row">
        Contact Nos:
        <q-input
          v-model="formattedDeliveryContactNos"
          disable
          outlined
          dense
          class="q-mb-sm bg-white"
        />
      </div>
    </div>

    <div class="text-slip-row">
      Address:
      <q-select
        v-model="transactionStore.selectedDeliveryAddress"
        :options="transactionStore.addressOptions"
        option-label="label"
        option-value="id"
        outlined
        dense
        clearable
        class="q-mb-sm bg-white"
      />
    </div>

    <div class="row q-col-gutter-sm">
      <div class="col text-slip-row">
        Delivery Date:
        <q-input
          v-model="formattedDeliveryDate"
          outlined
          dense
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
        Delivery Time:
        <q-select
          v-model="transactionStore.deliveryTime"
          :options="timeOptions"
          option-label="label"
          option-value="id"
          outlined
          dense
          class="q-mb-sm bg-white"
        />
      </div>
    </div>

    <div class="row q-col-gutter-sm">
      <div class="col text-slip-row">
        Delivery Driver:
        <q-select
          v-model="transactionStore.selectedDeliveryDriver"
          :options="driverOptions"
          option-label="name"
          outlined
          dense
          class="q-mb-sm bg-white"
        />
      </div>

      <div class="col text-slip-row">
        No. of Bags:
        <q-input
          v-model="transactionStore.deliveryNoBags"
          outlined
          dense
          class="q-mb-sm bg-white"
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

const driverOptions = ref([]);
const timeOptions = ref([]);
const contactOptions = ref([]);
const addressOptions = ref([]);

onMounted(async () => {
  await transactionStore.loadDrivers();
  await transactionStore.loadTimeOptions();

  driverOptions.value = transactionStore.driverOptions;
  timeOptions.value = transactionStore.timeOptions;

  if (transactionStore.selectedCustomer?.id) {
    await updateOptions(transactionStore.selectedCustomer.id);
  }
});

watch(
  () => transactionStore.selectedCustomer?.id,
  async (newCustomerId) => {
    if (newCustomerId) {
      await updateOptions(newCustomerId);
    } else {
      contactOptions.value = [];
      addressOptions.value = [];
    }
  }
);

async function updateOptions(customerId) {
  try {
    await Promise.all([
      transactionStore.loadContactOptions(customerId),
      transactionStore.loadAddressOptions(customerId),
    ]);

    contactOptions.value = transactionStore.contactOptions.map((contact) => ({
      id: contact.id,
      name: contact.name,
      contact_no1: contact.contact_no1,
      contact_no2: contact.contact_no2,
      label: `${contact.name} - ${contact.contact_no1}`,
    }));

    addressOptions.value = transactionStore.addressOptions.map((address) => ({
      id: address.id,
      label: `${address.block_no} ${address.road_name} ${address.unit_no} ${
        address.building_name
      }, ${address.postal_code} (${address?.additional_info || ""})`,
    }));
  } catch (error) {
    console.error("Error loading contact/address options:", error);
    contactOptions.value = [];
    addressOptions.value = [];
  }
}

const formattedDeliveryDate = computed(() =>
  formatDate(transactionStore.deliveryDate)
);

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const formattedDeliveryContactNos = computed({
  get() {
    const contact = transactionStore.selectedDeliveryContact;
    if (!contact) return "-";
    const contact1 = contact.contact_no1 || "-";
    const contact2 = contact.contact_no2;
    return contact2 ? `${contact1} / ${contact2}` : contact1;
  },
  set(value) {
    if (!transactionStore.selectedDeliveryContact) {
      transactionStore.selectedDeliveryContact = {};
    }
    const [c1, c2] = value.split(" / ").map((n) => n.trim());
    transactionStore.selectedDeliveryContact.contact_no1 = c1 || "";
    transactionStore.selectedDeliveryContact.contact_no2 = c2 || null;
  },
});

async function updateDelivery() {
  if (!transactionStore.selectedDeliveryId) {
    $q.notify({
      type: "negative",
      message: "No delivery selected for update.",
    });
    return;
  }

  try {
    await transactionStore.updateDelivery(transactionStore.selectedDeliveryId);
    $q.notify({
      type: "positive",
      message: "Delivery updated successfully.",
    });
  } catch (error) {
    console.error("Update delivery failed:", error);
    $q.notify({
      type: "negative",
      message: "Failed to update delivery. Please try again.",
    });
  }
}
</script>
