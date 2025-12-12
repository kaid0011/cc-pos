<template>
  <div class="row-col-table">
    <!-- Header -->
    <div class="row row-col-header text-center items-center">
      <div class="col bordered q-py-sm text-weight-bolder">Invoice No.</div>
      <div class="col bordered q-py-sm text-weight-bolder">Order Details</div>
      <div class="col bordered q-py-sm text-weight-bolder">Customer</div>
      <div class="col header-bordered flex flex-center">Payment Status</div>
    </div>

    <!-- Empty -->
    <div v-if="!hasOrders" class="text-center text-grey q-pa-lg text-h6">
      No orders found.
    </div>

    <!-- Rows -->
    <template v-else>
      <div v-for="(logistics, index) in rows" :key="logistics.logistics_id || logistics.id || index">
        <div
          v-for="(order, idx) in ordersWithNumber(logistics)"
          :key="`${logistics.logistics_id || logistics.id || index}-${order.id || idx}`"
          class="row row-col-row line-height-1"
        >
          <!-- Invoice -->
          <div class="col bordered">
            <div class="text-weight-bold text-subtitle1 text-uppercase">
              {{ order?.order_invoices?.invoice_no || "-" }}
            </div>
          </div>

          <!-- Order details -->
          <div class="col bordered">
            <div class="q-mb-xs">
              <q-btn
                outline
                color="blue-8"
                dense
                @click="openOrderTab(order)"
                class="text-weight-bold bg-blue-1 text-subtitle1 q-px-sm"
              >
                {{ order?.order_no || "-" }}
              </q-btn>
            </div>
            <div>
              <span class="text-caption text-uppercase text-weight-bold">Date:</span>
              {{ getOrderDate(order) }}
            </div>
            <div>
              <span class="text-caption text-uppercase text-weight-bold">Urgency:</span>
              <span :class="urgencyClass(logistics.urgency)">
                {{ logistics.urgency || "default" }}
              </span>
            </div>
          </div>

          <!-- Customer -->
          <div class="col bordered">
            <div class="text-weight-bold">
              <a
                @click.prevent="openCustomerTab(logistics.customer?.id)"
                class="text-weight-bold text-subtitle1 line-height-1"
              >
                {{ logistics.customer?.name || "[NOT SELECTED]" }}
              </a>
            </div>
            <div>
              {{ logistics.customer?.contact_no1 || "-" }}<span v-if="logistics.customer?.contact_no2">
                / {{ logistics.customer?.contact_no2 || "-" }}
              </span>
            </div>
            <div v-if="logistics.customer?.email">
              {{ logistics.customer?.email || "-" }}
            </div>
          </div>

          <!-- Payment -->
          <div class="col bordered">
            <div
              class="text-weight-bold text-subtitle1 text-center q-mb-sm line-height-1 text-uppercase"
              style="border-style: solid; border-width: 1px"
            >
              {{ order?.payment_status || order?.order_payment?.payment_status || "-" }}
            </div>

            <div>
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs">Credits:</span>
              <span class="text-weight-bold">
                {{
                  (
                    parseFloat(logistics.customer?.customer_credits?.online_package || "0") +
                    parseFloat(logistics.customer?.customer_credits?.other_credits || "0")
                  ).toFixed(2)
                }}
              </span>
            </div>

            <q-separator class="q-ma-sm" />

            <div>
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs">Paid:</span>
              <span class="text-weight-bold">
                {{ (order?.paid_amount ?? order?.order_payment?.paid_amount ?? 0) }}
              </span>
            </div>

            <div>
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs">Balance:</span>
              <span class="text-red text-weight-bold">
                {{ (order?.balance_amount ?? Math.max((order?.total_amount ?? order?.order_payment?.total_amount ?? 0) - (order?.paid_amount ?? order?.order_payment?.paid_amount ?? 0), 0)).toFixed?.(2) ?? "-" }}
              </span>
            </div>

            <div>
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs">Amount:</span>
              <span class="text-weight-bold">
                {{ (order?.total_amount ?? order?.order_payment?.total_amount ?? 0) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTransactionStore } from '@/stores/transactionStore';

const props = defineProps({
  rows: { type: Array, default: () => [] },
  selectedFilterDate: { type: [String, Date, null], default: null },
});

const transactionStore = useTransactionStore();

/* Visible rows helpers */
const ordersWithNumber = (logistics) =>
  Array.isArray(logistics?.orders)
    ? logistics.orders.filter(o => !!o?.order_no)
    : [];

const hasOrders = computed(() =>
  (props.rows || []).reduce((sum, l) => {
    const list = Array.isArray(l?.orders) ? l.orders : [];
    return sum + list.filter(o => !!o?.order_no).length;
  }, 0) > 0
);

/* Dates & formatting */
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
  });
};
const getOrderDate = (obj) => formatDate(obj?.created_at);

/* Urgency badge */
const urgencyClass = (u) => {
  const v = String(u || '').toLowerCase();
  return ['text-uppercase','text-weight-bolder', v === 'urgent' ? 'text-purple' : v === 'express' ? 'text-red' : 'text-caption'];
};

/* Navigation */
const openOrderTab = (order) => {
  try { transactionStore.setOrderNo(order?.order_no); window.open(`/orders/${order?.order_no}`, '_blank'); }
  catch (e) { console.error(e); }
};
const openCustomerTab = (customerId) => window.open(`/customers/${customerId}`, '_blank');
</script>
