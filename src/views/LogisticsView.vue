<template>
  <div class="preview logistics-view">
    <div class="text-h6 text-center text-uppercase text-weight-bolder q-pt-md">
      Logistics Details
    </div>
    <q-form @submit.prevent="saveChanges">
      <!-- Customer Details -->
      <div class="q-pa-md">
        <div class="text-h6">Customer Details</div>
        <q-input
          v-model="collection.customer.name"
          label="Customer Name"
          outlined
          dense
        />
        <q-input
          v-model="collection.customer.contact_no1"
          label="Customer Contact 1"
          outlined
          dense
        />
        <q-input
          v-model="collection.customer.contact_no2"
          label="Customer Contact 2"
          outlined
          dense
        />
        <q-input
          v-model="collection.customer.email"
          label="Customer Email"
          outlined
          dense
        />
        <q-input
          v-model="collection.customer.remarks"
          label="Customer Remarks"
          outlined
          dense
        />
        <q-input
          v-model="collection.customer.payment_type"
          label="Payment Type"
          outlined
          dense
        />
      </div>
      <!-- Two Column Layout -->
      <div class="row q-gutter-md">
        <!-- Collections Column -->
        <div class="col">
          <q-card class="logistics-card">
            <div class="q-pa-md">
              <div class="text-h6">Collection Details</div>
              <q-input
                v-model="collection.collection_date"
                label="Collection Date"
                outlined
                dense
              />
              <q-input
                v-model="collection.collection_time"
                label="Collection Time"
                outlined
                dense
              />
              <q-input
                v-model="collection.address"
                label="Collection Address"
                outlined
                dense
              />
              <q-input
                v-model="collection.area"
                label="Collection Area"
                outlined
                dense
              />
              <q-input
                v-model="collection.status"
                label="Collection Status"
                outlined
                dense
              />
              <q-input
                v-model="collection.remarks"
                label="Collection Remarks"
                outlined
                dense
              />
            </div>

            <div class="q-pa-md">
              <div class="text-h6">Collection Driver Details</div>
<q-input
  v-model="collection.driver_name"
  label="Driver Name"
  outlined
  dense
/>
            </div>

            <div class="q-pa-md">
              <div class="text-h6">Collection Contact Person</div>
              <q-input
                v-model="collection.contact_person.name"
                label="Contact Person Name"
                outlined
                dense
              />
              <q-input
                v-model="collection.contact_person.contact_no1"
                label="Contact No 1"
                outlined
                dense
              />
              <q-input
                v-model="collection.contact_person.contact_no2"
                label="Contact No 2"
                outlined
                dense
              />
              <q-input
                v-model="collection.contact_person.email"
                label="Email"
                outlined
                dense
              />
              <q-input
                v-model="collection.contact_person.remarks"
                label="Remarks"
                outlined
                dense
              />
            </div>
          </q-card>
        </div>

        <!-- Deliveries Column -->
        <div class="col">
          <q-card class="logistics-card">
            <div class="q-pa-md">
              <div class="text-h6">Delivery Details</div>
              <q-input
                v-model="collection.delivery.delivery_date"
                label="Delivery Date"
                outlined
                dense
              />
              <q-input
                v-model="collection.delivery.delivery_time"
                label="Delivery Time"
                outlined
                dense
              />
              <q-input
                v-model="collection.delivery.address"
                label="Delivery Address"
                outlined
                dense
              />
              <q-input
                v-model="collection.delivery.area"
                label="Delivery Area"
                outlined
                dense
              />
              <q-input
                v-model="collection.delivery.status"
                label="Delivery Status"
                outlined
                dense
              />
              <q-input
                v-model="collection.delivery.remarks"
                label="Delivery Remarks"
                outlined
                dense
              />
            </div>

            <div class="q-pa-md">
              <div class="text-h6">Delivery Driver Details</div>
<q-input
  v-model="collection.driver_name"
  label="Driver Name"
  outlined
  dense
/>
            </div>

            <div class="q-pa-md">
              <div class="text-h6">Delivery Contact Person</div>
              <q-input
                v-model="collection.delivery.contact_person.name"
                label="Contact Person Name"
                outlined
                dense
              />
              <q-input
                v-model="collection.delivery.contact_person.contact_no1"
                label="Contact No 1"
                outlined
                dense
              />
              <q-input
                v-model="collection.delivery.contact_person.contact_no2"
                label="Contact No 2"
                outlined
                dense
              />
              <q-input
                v-model="collection.delivery.contact_person.email"
                label="Email"
                outlined
                dense
              />
              <q-input
                v-model="collection.delivery.contact_person.remarks"
                label="Remarks"
                outlined
                dense
              />
            </div>
          </q-card>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="q-pa-md text-center">
        <q-btn
          label="Save Changes"
          type="submit"
          color="primary"
          class="q-mr-sm"
        />
        <q-btn label="Back" @click="goBack" color="secondary" flat />
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";d
import { useTransactionStore } from "@/stores/transactionStore";

const route = useRoute();
const router = useRouter();
const transactionStore = useTransactionStore();

const collection = ref({
  collection_date: "",
  collection_time: "",
  address: "",
  area: "",
  status: "",
  remarks: "",
  driver_name: "",
  driver_contact: "",
  contact_person: {
    name: "",
    contact_no1: "",
    contact_no2: "",
    email: "",
    remarks: "",
  },
  customer: {
    name: "",
    contact_no1: "",
    contact_no2: "",
    email: "",
    remarks: "",
    payment_type: "",
  },
  delivery: {
    delivery_date: "",
    delivery_time: "",
    address: "",
    area: "",
    status: "",
    remarks: "",
    driver_name: "",
    driver_contact: "",
    contact_person: {
      name: "",
      contact_no1: "",
      contact_no2: "",
      email: "",
      remarks: "",
    },
  },
});


const fetchCollectionDeliveryDetails = async () => {
  const collectionId = route.params.id;
  try {
    const data = await transactionStore.fetchCollectionsDeliveriesById(
      collectionId
    );
    console.log("Fetched Collection Details:", data);

    // Safely populate the fields while maintaining default empty strings
collection.value = {
  ...collection.value,
  ...data,
  contact_person: {
    ...collection.value.contact_person,
    ...data.contact_person,
  },
  customer: {
    ...collection.value.customer,
    ...data.customer,
  },
  delivery: {
    ...collection.value.delivery,
    ...data.delivery,
    contact_person: {
      ...collection.value.delivery.contact_person,
      ...data.delivery?.contact_person,
    },
  },
};

  } catch (error) {
    console.error("Error fetching collection details:", error);
  }
};

const saveChanges = async () => {
  try {
    console.log("Saving changes:", collection.value);
    // Call the store's update function to save changes
    await transactionStore.updateCollectionDetails(collection.value);
    console.log("Changes saved successfully.");
  } catch (error) {
    console.error("Error saving changes:", error);
  }
};

const goBack = () => {
  router.push("/collections");
};

onMounted(() => {
  fetchCollectionDeliveryDetails();
});
</script>
