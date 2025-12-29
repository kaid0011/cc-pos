<!-- File: src/components/TagsListComponent.vue -->
<template>
  <div class="row-col-table">
    <!-- Table Header -->
    <div class="row row-col-header">
      <div class="col header-bordered">Order Details</div>
      <div class="col header-bordered">Collection Details</div>
      <div class="col header-bordered">Customer Details</div>
      <div class="col header-bordered">Tag Details</div>
    </div>

    <!-- Empty State -->
    <div v-if="paginatedOrders.length === 0" class="text-center text-grey q-pa-lg text-h6">
      No orders found.
    </div>

    <!-- Rows -->
    <div
      v-for="(logistics, index) in paginatedOrders"
      :key="index"
      class="row row-col-row"
    >
      <!-- Order Details -->
      <div class="col bordered">
        <q-btn
          outline
          color="blue-8"
          dense
          @click="openOrderDialog(logistics)"
          class="text-weight-bold bg-blue-1 text-subtitle1 q-px-sm q-mb-xs"
        >
          {{ logistics.order?.order_no || "N/A" }}
        </q-btn>

        <div>
          <span class="text-caption text-uppercase text-weight-bold">Date:</span>
          {{ getOrderDate(logistics) }}
        </div>

        <div>
          <span class="text-caption text-uppercase text-weight-bold">Urgency: </span>
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
      </div>

      <!-- Collection Details -->
      <div class="col bordered">
        <div
          :class="[
            'text-weight-bold',
            'text-subtitle1',
            'text-center',
            'line-height-1',
            'text-uppercase',
            logisticsBadgeClass(logistics.logistics_status),
          ]"
          style="border-style: solid; border-width: 1px"
        >
          {{ logistics.logistics_status }}
        </div>
        <div class="row" style="min-height: auto">
          <div class="col">
            <div class="q-pa-sm">
              <div>
                <span class="text-caption text-uppercase text-weight-bold">Date: </span>
                {{ getCollectionDate(logistics.collections) }}
              </div>
              <div>
                <span class="text-caption text-uppercase text-weight-bold">Time: </span>
                {{ logistics.collections?.[0]?.collection_time || "N/A" }}
              </div>
              <div>
                <span class="text-caption text-uppercase text-weight-bold">Driver: </span>
                {{ collectionDriverName(logistics.collections) || "N/A" }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Details -->
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
          <template v-if="logistics.customer?.contact_no1 || logistics.customer?.contact_no2">
            <span
              v-if="logistics.customer?.contact_no1"
              class="phone-link"
              @click.stop
            >
              {{ logistics.customer?.contact_no1 }}
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-list style="min-width: 220px">
                  <q-item clickable v-ripple @click="callViaPhone(logistics.customer?.contact_no1)">
                    <q-item-section avatar><q-icon name="call" /></q-item-section>
                    <q-item-section>Call via phone</q-item-section>
                  </q-item>
                  <q-item clickable v-ripple @click="callViaWhatsApp(logistics.customer?.contact_no1)">
                    <q-item-section avatar><q-icon name="chat" /></q-item-section>
                    <q-item-section>Call via WhatsApp</q-item-section>
                  </q-item>
                </q-list>
              </q-popup-proxy>
            </span>

            <span v-if="logistics.customer?.contact_no2"> / </span>

            <span
              v-if="logistics.customer?.contact_no2"
              class="phone-link"
              @click.stop
            >
              {{ logistics.customer?.contact_no2 }}
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-list style="min-width: 220px">
                  <q-item clickable v-ripple @click="callViaPhone(logistics.customer?.contact_no2)">
                    <q-item-section avatar><q-icon name="call" /></q-item-section>
                    <q-item-section>Call via phone</q-item-section>
                  </q-item>
                  <q-item clickable v-ripple @click="callViaWhatsApp(logistics.customer?.contact_no2)">
                    <q-item-section avatar><q-icon name="chat" /></q-item-section>
                    <q-item-section>Call via WhatsApp</q-item-section>
                  </q-item>
                </q-list>
              </q-popup-proxy>
            </span>
          </template>
        </div>

        <q-separator class="q-mt-sm" />
        <div class="mark-yellow text-center text-uppercase">Contact Person</div>
        <q-separator />

        <div>
          {{ logistics.collections?.[0]?.contact_person?.name || "[NOT SET]" }}
        </div>

        <div>
          <template v-if="logistics.collections?.[0]?.contact_person?.contact_no1 || logistics.collections?.[0]?.contact_person?.contact_no2">
            <span
              v-if="logistics.collections?.[0]?.contact_person?.contact_no1"
              class="phone-link"
              @click.stop
            >
              {{ logistics.collections?.[0]?.contact_person?.contact_no1 }}
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-list style="min-width: 220px">
                  <q-item clickable v-ripple @click="callViaPhone(logistics.collections?.[0]?.contact_person?.contact_no1)">
                    <q-item-section avatar><q-icon name="call" /></q-item-section>
                    <q-item-section>Call via phone</q-item-section>
                  </q-item>
                  <q-item clickable v-ripple @click="callViaWhatsApp(logistics.collections?.[0]?.contact_person?.contact_no1)">
                    <q-item-section avatar><q-icon name="chat" /></q-item-section>
                    <q-item-section>Call via WhatsApp</q-item-section>
                  </q-item>
                </q-list>
              </q-popup-proxy>
            </span>

            <span v-if="logistics.collections?.[0]?.contact_person?.contact_no2"> / </span>

            <span
              v-if="logistics.collections?.[0]?.contact_person?.contact_no2"
              class="phone-link"
              @click.stop
            >
              {{ logistics.collections?.[0]?.contact_person?.contact_no2 }}
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-list style="min-width: 220px">
                  <q-item clickable v-ripple @click="callViaPhone(logistics.collections?.[0]?.contact_person?.contact_no2)">
                    <q-item-section avatar><q-icon name="call" /></q-item-section>
                    <q-item-section>Call via phone</q-item-section>
                  </q-item>
                  <q-item clickable v-ripple @click="callViaWhatsApp(logistics.collections?.[0]?.contact_person?.contact_no2)">
                    <q-item-section avatar><q-icon name="chat" /></q-item-section>
                    <q-item-section>Call via WhatsApp</q-item-section>
                  </q-item>
                </q-list>
              </q-popup-proxy>
            </span>
          </template>
        </div>
      </div>

      <!-- Tag Details -->
      <div class="col bordered text-uppercase">
        <div>
          <q-btn
            label="View Tag"
            color="primary"
            unelevated
            dense
            class="q-px-sm full-width"
            @click="viewTag(logistics.order?.order_no)"
          />
        </div>

        <div
          class="text-weight-bolder text-subtitle1 text-center q-my-sm q-py-xs line-height-1 text-uppercase"
          style="border-style: solid; border-width: 1px"
        >
          <span :class="getStatusClass(logistics.order?.order_tags?.tag_status)">
            {{ logistics.order?.order_tags?.tag_status || '-' }}
          </span>
        </div>

        <!-- A–G counts -->
        <div class="row items-center justify-between no-wrap text-center q-mt-sm">
          <div v-for="ltr in letters" :key="ltr" class="col-auto q-px-xs">
            <div class="text-weight-bold">{{ rowTagCounts(logistics)[ltr] }}</div>
            <div class="text-caption">{{ ltr }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

   <!-- Pagination -->
    <div class="row justify-center q-mt-md">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="10"
        boundary-numbers
        direction-links
      />
    </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { openURL } from 'quasar';

const props = defineProps({
  orders: { type: Array, required: true },
  pageSize: { type: Number, default: 10 },
});

const transactionStore = useTransactionStore();
const currentPage = ref(1);

watch(
  () => props.orders,
  () => { currentPage.value = 1; },
  { deep: false }
);

const letters = ['A','B','C','D','E','F','G'];

const driverMapById = computed(() => {
  const m = new Map();
  (transactionStore.driverOptions || []).forEach((d) => {
    if (d?.id != null) m.set(String(d.id), (d.name || '').trim());
  });
  return m;
});
const getDriverName = (id) => (id != null ? (driverMapById.value.get(String(id)) || '') : '');
const collectionDriverName = (collections) => {
  const c = (Array.isArray(collections) && collections[0]) ? collections[0] : null;
  if (!c) return '';
  // prefer ID lookup; fallback to stored driver_name on the collection row
  return (getDriverName(c.driver_id) || c.driver_name || '').trim();
};

const COLLECTION_STATUSES = [
  'collection arranged',
  'items with driver',
  'collection completed',
  'collection rescheduled',
  'collection cancelled',
  'ongoing collection issue/s',
];
const DELIVERY_STATUSES = [
  'processing items',
  'delivery arranged',
  'delivery partial',
  'delivery completed',
  'delivery postponed',
  'ongoing delivery issue/s',
];
function logisticsBadgeClass(status) {
  const s = String(status || '').trim().toLowerCase();
  if (COLLECTION_STATUSES.includes(s)) return 'mark-bg-pink';
  if (DELIVERY_STATUSES.includes(s)) return 'mark-bg-blue';
  return '';
}
const getStatusClass = (status) => {
  const s = String(status || '').trim().toLowerCase();
  if (!s) return '';
  if (s === 'done') return 'status-done';
  if (s === 'to print') return 'status-to-print';
  return '';
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
  });
};
const getOrderDate = (logistics) => formatDate(logistics.order?.created_at);
const getCollectionDate = (collections) =>
  !collections || collections.length === 0 ? 'N/A' : formatDate(collections[0]?.collection_date);

const openCustomerTab = (customerId) => { if (customerId) window.open(`/customers/${customerId}`, '_blank'); };
const openOrderDialog = async (logistics) => {
  if (!logistics || !logistics.order) return;
  transactionStore.setSelectedCustomer({ id: logistics.customer?.id });
  transactionStore.setOrderNo(logistics.order.order_no);
  transactionStore.resetTransactionItems();
  window.open(`/orders/read-${logistics.order.order_no}`, '_blank');
};
const viewTag = (order_no) => { if (order_no) window.open(`/tags/${order_no}`, '_blank'); };

const sanitizeForTel = (raw) => String(raw || '').replace(/[^\d+]/g, '');
const sanitizeForWhatsApp = (raw) => String(raw || '').replace(/\D/g, '');
const callViaPhone = (raw) => { const tel = sanitizeForTel(raw); if (tel) openURL(`tel:${tel}`); };
const callViaWhatsApp = (raw) => { const wa = sanitizeForWhatsApp(raw); if (wa) openURL(`https://wa.me/${wa}`); };

const rowTagCounts = (logistics) => {
  const orderId = logistics?.order?.id;
  return (orderId && transactionStore.tagCountsByOrderId[orderId]) || { A:0,B:0,C:0,D:0,E:0,F:0,G:0 };
};

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * props.pageSize;
  const end = start + props.pageSize;
  return (props.orders || []).slice(start, end);
});
const totalPages = computed(() =>
  Math.max(1, Math.ceil(((props.orders || []).length || 0) / props.pageSize))
);
</script>
