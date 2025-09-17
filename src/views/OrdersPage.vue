<template>
  <div class="full-container orders-history">
    <div class="text-h6 text-center text-uppercase text-weight-bolder q-mb-md">
      Order Management
    </div>

    <!-- Search & Date Filters -->
    <div class="row justify-end q-mb-md q-gutter-x-sm">
      <!-- Collection Start Date -->
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

      <!-- Collection End Date -->
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

      <!-- Delivery Start Date -->
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

      <!-- Delivery End Date -->
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

      <!-- Search Input -->
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
    </div>

    <!-- Table Display -->
    <div class="row-col-table">
      <!-- Table Header -->
      <div class="row row-col-header q-px-md text-center">
        <div class="col bordered q-py-sm text-weight-bolder">Order Details</div>
        <div class="col-5 bordered q-py-sm text-weight-bolder">
          Logistics Details
        </div>
        <div class="col bordered q-py-sm text-weight-bolder">
          Production Details
        </div>
        <div class="col bordered q-py-sm text-weight-bolder">
          Payment Status
        </div>
      </div>

      <!-- Table Rows -->
      <div
        v-if="paginatedOrders.length === 0"
        class="text-center text-grey q-pa-lg text-h6"
      >
        No orders found.
      </div>

      <div v-else v-for="(logistics, index) in paginatedOrders" :key="index">
        <div
          v-for="(order, idx) in logistics.orders"
          :key="idx"
          class="row row-col-row q-px-md line-height-1"
        >
          <div class="col bordered">
            <div class="q-mb-xs">
              <q-btn
                outline
                color="blue-8"
                dense
                @click="openOrderTab(order)"
                class="text-weight-bold bg-blue-1 text-subtitle1 q-px-sm"
              >
                {{ logistics.order?.order_no || "-" }}
              </q-btn>
            </div>
            <div>
              <span class="text-caption text-uppercase text-weight-bold">
                Date:
              </span>
              {{ getOrderDate(logistics) }}
            </div>
            <div>
              <span class="text-caption text-uppercase text-weight-bold">
                Urgency:
              </span>
              <span
                :class="[
                  'text-uppercase',
                  'text-weight-bolder',
                  logistics.urgency?.toLowerCase?.() === 'urgent'
                    ? 'text-purple'
                    : logistics.urgency?.toLowerCase?.() === 'express'
                    ? 'text-red'
                    : 'text-caption',
                ]"
              >
                {{ logistics.urgency || "default" }}
              </span>
            </div>

            <q-separator class="q-mt-sm" />
            <div class="mark-brown text-center text-uppercase">
              Customer Details
            </div>
            <q-separator class="q-mb-sm" />
            <div class="text-weight-bold">
              <a
                @click.prevent="openCustomerTab(logistics.customer?.id)"
                class="text-weight-bold text-subtitle1 line-height-1"
              >
                {{ logistics.customer?.name || "[NOT SELECTED]" }}
              </a>
            </div>
            <div>
              {{ logistics.customer?.contact_no1 || "-"
              }}<span v-if="logistics.customer?.contact_no2">
                / {{ logistics.customer?.contact_no2 || "-" }}
              </span>
            </div>
            <div v-if="logistics.customer?.email">
              {{ logistics.customer?.email || "-" }}
            </div>
          </div>
          <div class="col-5 bordered" style="padding: 0">
            <div>
              <div
                :class="[
                  'text-weight-bold',
                  'text-subtitle1',
                  'text-center',
                  'q-mb-sm',
                  'q-mx-sm',
                  'line-height-1',
                  'text-uppercase',
                  logisticsBadgeClass(logistics.logistics_status),
                ]"
                style="border-style: solid; border-width: 1px"
              >
                {{ logistics.logistics_status }}
              </div>
            </div>
            <q-separator />
            <div class="row" style="min-height: auto">
              <div
                class="col"
                style="border-right: 1px solid #ddd; border-color: #c09f8b"
              >
                <div
                  class="text-uppercase text-weight-bolder text-pink-4 text-center"
                >
                  Collection
                </div>
                <q-separator />
                <div class="q-pa-sm">
                  <div>
                    <span class="text-caption text-uppercase text-weight-bold">
                      Date: </span
                    >{{ getCollectionDate(logistics.collections) }}
                  </div>
                  <div>
                    <span class="text-caption text-uppercase text-weight-bold">
                      Time:
                    </span>
                    {{ logistics.collections?.[0]?.collection_time || "-" }}
                  </div>
                  <div>
                    <span class="text-caption text-uppercase text-weight-bold">
                      Driver: </span
                    >{{ logistics.collections?.[0]?.driver_name || "-" }}
                  </div>
                  <div>
                    <span class="text-caption text-uppercase text-weight-bold">
                      Address: </span
                    >{{ logistics.collections?.[0]?.address || "-" }}
                  </div>
                </div>

                <q-separator />
                <div class="q-pa-sm">
                  <div class="text-caption text-uppercase text-weight-bold">
                    Contact Person:
                  </div>
                  <div>
                    {{
                      logistics.collections?.[0]?.contact_person?.name ||
                      "[NOT SET]"
                    }}
                  </div>
                  <div>
                    {{
                      logistics.collections?.[0]?.contact_person?.contact_no1 ||
                      "-"
                    }}<span
                      v-if="
                        logistics.collections?.[0]?.contact_person?.contact_no2
                      "
                    >
                      /
                      {{
                        logistics.collections?.[0]?.contact_person
                          ?.contact_no2 || "-"
                      }}
                    </span>
                  </div>
                  <div v-if="logistics.collections?.[0]?.contact_person?.email">
                    {{
                      logistics.collections?.[0]?.contact_person?.email || "-"
                    }}
                  </div>
                </div>
              </div>
              <div class="col">
                <div
                  class="text-uppercase text-weight-bolder text-blue text-center"
                >
                  Delivery
                </div>
                <q-separator />
                <div class="q-pa-sm">
                  <div>
                    <span class="text-caption text-uppercase text-weight-bold">
                      Date: </span
                    >{{ getDeliveryDate(logistics.deliveries) }}
                  </div>
                  <div>
                    <span class="text-caption text-uppercase text-weight-bold">
                      Time: </span
                    >{{ logistics.deliveries?.[0]?.delivery_time || "-" }}
                  </div>
                  <div>
                    <span class="text-caption text-uppercase text-weight-bold">
                      Driver: </span
                    >{{ logistics.deliveries?.[0]?.driver_name || "-" }}
                  </div>
                  <div>
                    <span class="text-caption text-uppercase text-weight-bold">
                      Address: </span
                    >{{ logistics.deliveries?.[0]?.address || "-" }}
                  </div>
                </div>
                <q-separator />
                <div class="q-pa-sm">
                  <div class="text-caption text-uppercase text-weight-bold">
                    Contact Person:
                  </div>
                  <div>
                    {{
                      logistics.deliveries?.[0]?.contact_person?.name ||
                      "[NOT SET]"
                    }}
                  </div>
                  <div>
                    {{
                      logistics.deliveries?.[0]?.contact_person?.contact_no1 ||
                      "-"
                    }}<span
                      v-if="
                        logistics.deliveries?.[0]?.contact_person?.contact_no2
                      "
                    >
                      /
                      {{
                        logistics.deliveries?.[0]?.contact_person
                          ?.contact_no2 || "-"
                      }}
                    </span>
                    <div
                      v-if="logistics.deliveries?.[0]?.contact_person?.email"
                    >
                      {{
                        logistics.deliveries?.[0]?.contact_person?.email || "-"
                      }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col bordered" style="padding-top: 0">
            <div
              class="text-weight-bold text-uppercase text-subtitle1 text-center q-mb-sm line-height-1"
              style="border-style: solid; border-width: 1px"
            >
              {{ order.goods_status }}
            </div>
            <div>
              <span class="text-caption text-uppercase text-weight-bold"
                >Ready By:</span
              >
              {{ formatDate(order.order_production?.ready_by) || "-" }}
            </div>
            <q-separator class="q-ma-sm" />
            <div v-if="logistics.collections?.[0]?.no_bags">
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Bags: </span
              >{{ logistics.collections?.[0]?.no_bags || "-" }}b
            </div>
            <div v-if="order.order_production?.no_hangers">
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Hang:</span
              >
              {{ order.order_production?.no_hangers || "-" }}h
            </div>
            <div v-if="order.order_production?.no_packets">
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Pack:</span
              >
              {{ order.order_production?.no_packets || "-" }}p
            </div>
            <div v-if="order.order_production?.no_rolls">
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Rolls:</span
              >
              {{ order.order_production?.no_rolls || "-" }}r
            </div>
          </div>
          <div class="col bordered" style="padding-top: 0">
            <div
              class="text-weight-bold text-subtitle1 text-center q-mb-sm line-height-1 text-uppercase"
              style="border-style: solid; border-width: 1px"
            >
              {{ order.payment_status }}
            </div>
            <div>
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Credits:</span
              >
              <span class="text-weight-bold">
                ${{
                  (
                    parseFloat(
                      logistics.customer?.customer_credits?.online_package ||
                        "0"
                    ) +
                    parseFloat(
                      logistics.customer?.customer_credits?.other_credits || "0"
                    )
                  ).toFixed(2)
                }}
              </span>
            </div>
            <q-separator class="q-ma-sm" />
            <div>
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Paid:</span
              >

              <span class="text-weight-bold">${{ order.paid_amount }}</span>
            </div>
            <div>
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Balance:</span
              >

              <span class="text-red text-weight-bold"
                >${{ order.balance_amount }}</span
              >
            </div>
            <div>
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Amount:</span
              >

              <span class="text-weight-bold">${{ order.total_amount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Pagination Controls -->
    <div class="row justify-center q-mt-md">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="10"
        boundary-numbers
        direction-links
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";

const transactionStore = useTransactionStore();
const rawOrders = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const searchQuery = ref("");

const collectionStartDate = ref(null);
const collectionEndDate = ref(null);
const deliveryStartDate = ref(null);
const deliveryEndDate = ref(null);

const COLLECTION_STATUSES = new Set([
  "collection arranged",
  "collection completed",
  "collection rescheduled",
  "collection cancelled",
]);

const DELIVERY_STATUSES = new Set([
  "delivery arranged",
  "delivery completed",
  "delivery rescheduled",
  "delivery postponed",
  "delivery partial",
]);

function logisticsBadgeClass(status) {
  const s = String(status || "")
    .trim()
    .toLowerCase();
  if (COLLECTION_STATUSES.has(s)) return "mark-bg-pink";
  if (DELIVERY_STATUSES.has(s)) return "mark-bg-blue";
  return "";
}

onMounted(async () => {
  try {
    rawOrders.value = await transactionStore.fetchAllOrdersSimple();
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
});

const formattedCollectionStartDate = computed(() =>
  formatDate(collectionStartDate.value)
);
const formattedCollectionEndDate = computed(() =>
  formatDate(collectionEndDate.value)
);
const formattedDeliveryStartDate = computed(() =>
  formatDate(deliveryStartDate.value)
);
const formattedDeliveryEndDate = computed(() =>
  formatDate(deliveryEndDate.value)
);

const clearDate = (type) => {
  if (type === "collectionStartDate") collectionStartDate.value = null;
  if (type === "collectionEndDate") collectionEndDate.value = null;
  if (type === "deliveryStartDate") deliveryStartDate.value = null;
  if (type === "deliveryEndDate") deliveryEndDate.value = null;
};
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

const totalPages = computed(() =>
  Math.ceil(filteredOrders.value.length / pageSize.value)
);

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

const getOrderDate = (logistics) => {
  return formatDate(logistics.order?.created_at);
};

const getCollectionDate = (collections) => {
  if (!collections || collections.length === 0) return "-";
  return formatDate(collections[0]?.collection_date);
};

const getDeliveryDate = (deliveries) => {
  if (!deliveries || deliveries.length === 0) return "-";
  return formatDate(deliveries[0]?.delivery_date);
};

const openCustomerTab = (customerId) => {
  if (!customerId) return;
  window.open(`/customers/${customerId}`, "_blank");
};

const openOrderDialog = async (order) => {
  try {
    if (!order) return;

    transactionStore.setSelectedCustomer({ id: order.customer_id });
    transactionStore.setOrderNo(order.order_no);
    transactionStore.resetTransactionItems();

    window.open(`/orders/${order.order_no}`, "_blank");
  } catch (error) {
    console.error("Error opening order dialog:", error);
  }
};

const openOrderTab = async (order) => {
  try {
    transactionStore.setOrderNo(order?.order_no);
    window.open(`/orders/${order?.order_no}`, "_blank");
  } catch (error) {
    console.error("Error opening order:", error);
  }
};

</script>
