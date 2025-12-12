<template>
  <div class="row justify-center page-title-header text-uppercase">
    List of Invoices
  </div>
  <div class="full-container orders-history">
    <!-- Search & Date Filters -->
    <!-- <div class="row justify-end q-mb-md q-gutter-x-sm">
      <div class="col">
        <div class="dialog-label">
          <div class="text-weight-bold text-subtitle2">
            Collection Start Date
          </div>
        </div>
        <q-input
          v-model="formattedCollectionStartDate"
          outlined
          dense
          readonly
          class="bg-white"
        >
          <template v-slot:append>
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
          <div class="text-weight-bold text-subtitle2">Collection End Date</div>
        </div>
        <q-input
          v-model="formattedCollectionEndDate"
          outlined
          dense
          readonly
          class="bg-white"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="collectionEndDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
            <q-icon
              name="close"
              class="cursor-pointer q-ml-sm"
              @click="clearDate('collectionEndDate')"
            />
          </template>
        </q-input>
      </div>

      <div class="col">
        <div class="dialog-label">
          <div class="text-weight-bold text-subtitle2">Delivery Start Date</div>
        </div>
        <q-input
          v-model="formattedDeliveryStartDate"
          outlined
          dense
          readonly
          class="bg-white"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="deliveryStartDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
            <q-icon
              name="close"
              class="cursor-pointer q-ml-sm"
              @click="clearDate('deliveryStartDate')"
            />
          </template>
        </q-input>
      </div>
      <div class="col">
        <div class="dialog-label">
          <div class="text-weight-bold text-subtitle2">Delivery End Date</div>
        </div>
        <q-input
          v-model="formattedDeliveryEndDate"
          outlined
          dense
          readonly
          class="bg-white"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy>
                <q-date v-model="deliveryEndDate" mask="YYYY-MM-DD" />
              </q-popup-proxy>
            </q-icon>
            <q-icon
              name="close"
              class="cursor-pointer q-ml-sm"
              @click="clearDate('deliveryEndDate')"
            />
          </template>
        </q-input>
      </div>

      <div class="col">
        <div class="dialog-label">
          <div class="text-weight-bold text-subtitle2">Search Here...</div>
        </div>
        <q-input
          class="search-transactions search-input"
          v-model="searchQuery"
          outlined
          dense
          debounce="300"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div> -->

    <!-- Table Display -->
          <InvoiceTableComponent
            :rows="paginatedOrders"
          />

          
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import InvoiceTableComponent from "@/components/InvoiceTableComponent.vue";

const transactionStore = useTransactionStore();
const rawOrders = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref("");

const collectionStartDate = ref(null);
const collectionEndDate = ref(null);
const deliveryStartDate = ref(null);
const deliveryEndDate = ref(null);


onMounted(async () => {
  try {
    rawOrders.value = await transactionStore.fetchAllOrdersSimple();
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
});

const filteredOrders = computed(() => {
  const query = searchQuery.value.toLowerCase();

  return rawOrders.value
    .map((logistics) => {
      const order = logistics.order || {};

      const collectionDate =
        logistics.collections?.[0]?.collection_date || null;
      const deliveryDate = logistics.deliveries?.[0]?.delivery_date || null;

      const collectionMatch =
        (!collectionStartDate.value ||
          collectionDate >= collectionStartDate.value) &&
        (!collectionEndDate.value || collectionDate <= collectionEndDate.value);

      const deliveryMatch =
        (!deliveryStartDate.value || deliveryDate >= deliveryStartDate.value) &&
        (!deliveryEndDate.value || deliveryDate <= deliveryEndDate.value);

      const searchMatch = [
        order.order_no,
        logistics.customer?.name,
        order.goods_status,
        order.order_payment?.payment_status,
        logistics.logistics_status,
      ].some((field) => field?.toLowerCase().includes(query));

      return {
        ...logistics,
        orders:
          collectionMatch && deliveryMatch && searchMatch && order.order_no
            ? [
                {
                  ...order,
                  customer: logistics.customer || null,
                  customer_id: logistics.customer?.id || null,
                  goods_status: order.order_production?.goods_status || "-",
                  payment_status: order.order_payment?.payment_status || "-",
                  total_amount: parseFloat(
                    order.order_payment?.total_amount || 0
                  ).toFixed(2),
                  paid_amount: parseFloat(
                    order.order_payment?.paid_amount || 0
                  ).toFixed(2),
                  balance_amount: parseFloat(
                    (order.order_payment?.total_amount || 0) -
                      (order.order_payment?.paid_amount || 0)
                  ).toFixed(2),
                },
              ]
            : [],
      };
    })
    .filter((l) => l.orders.length > 0);
});

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredOrders.value.slice(start, end);
});



</script>
