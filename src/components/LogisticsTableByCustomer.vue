<template>
    <div v-if="loading" class="q-pa-md text-center">
      <q-spinner-dots color="primary" size="2em" />
    </div>

    <div v-else>
      <div v-if="logisticsData.length === 0" class="q-pa-md text-center text-grey">
        No logistics records found for this customer.
      </div>

      <div v-else>
        <div class="row-col-table">
          <!-- Table Header -->
          <div class="row row-col-header q-px-md text-center">
            <div class="col bordered text-weight-bolder">Order Details</div>
            <div class="col-5 bordered text-weight-bolder">Logistics Details</div>
            <div class="col bordered text-weight-bolder">Production Details</div>
            <div class="col bordered text-weight-bolder">Payment Status</div>
          </div>

          <!-- Table Rows -->
          <div
            v-for="(logistics, index) in logisticsData"
            :key="logistics.logistics_id || logistics.id || index"
          >
            <div
              v-for="(order, idx) in ordersOrPlaceholder(logistics)"
              :key="`${logistics.logistics_id || logistics.id || index}-${order?.id ?? 'placeholder'}-${idx}`"
              class="row row-col-row q-px-md line-height-1"
            >
              <slot
                name="row"
                :logistics="logistics"
                :order="order"
              >
                <!-- ORDER DETAILS COLUMN -->
                <div class="col bordered">
                  <div class="q-mb-xs">
                    <div v-if="order?.order_no || logistics.order?.order_no">
                      <q-btn
                        outline
                        color="blue-8"
                        dense
                        @click="openOrderTab(order || logistics.order)"
                        class="text-weight-bold bg-blue-1 text-subtitle1 q-px-sm"
                      >
                        {{ order?.order_no || logistics.order?.order_no }}
                      </q-btn>
                    </div>
                    <div v-else>
                      <q-btn
                        dense
                        label="Create Order"
                        color="primary"
                        unelevated
                        class="q-px-sm"
                        @click="createOrder(logistics)"
                      />
                    </div>
                  </div>

                  <div>
                    <span class="text-caption text-uppercase text-weight-bold">
                      Date:
                    </span>
                    {{ getOrderDate(order || logistics.order) }}
                  </div>
                  <div>
                    <span class="text-caption text-uppercase text-weight-bold">
                      Urgency:
                    </span>
                    <span
                      :class="[
                        'text-uppercase',
                        'text-weight-bolder',
                        (logistics.urgency || '').toLowerCase() === 'urgent'
                          ? 'text-purple'
                          : (logistics.urgency || '').toLowerCase() ===
                            'express'
                          ? 'text-red'
                          : 'text-caption',
                      ]"
                    >
                      {{ logistics.urgency || "default" }}
                    </span>
                  </div>

                </div>

                <!-- LOGISTICS DETAILS COLUMN -->
                <div class="col-5 bordered" style="padding: 0">
                  <div class="row justify-between q-mx-sm q-mb-sm">
                    <div
                      class="col flex flex-center"
                      :class="[
                        'text-weight-bold',
                        'text-subtitle1',
                        'text-center',
                        'line-height-1',
                        'text-uppercase',
                        logisticsBadgeClass(logistics.logistics_status),
                      ]"
                      style="
                        border-style: solid;
                        border-width: 1px;
                        min-height: 100%;
                      "
                    >
                      {{ logistics.logistics_status }}
                      <!-- {{ logistics.logistics_id || logistics.id }} -->
                    </div>
                    <div class="col-auto">
                      <q-icon
                        name="edit"
                        size="sm"
                        unelevated
                        class="cursor-pointer bg-primary text-white q-pa-xs"
                        role="button"
                        aria-label="UpdateLogStatus"
                        @click="openUpdateStatusDialog(logistics)"
                      />
                    </div>
                  </div>
                  <q-separator />
                  <div class="row" style="min-height: auto">
                    <div
                      class="col"
                      :style="{
                        order: isDeliveryFirst(logistics.logistics_status)
                          ? 2
                          : 1,
                        borderRight: isDeliveryFirst(logistics.logistics_status)
                          ? ''
                          : '1px solid #c09f8b',
                      }"
                    >
                      <div
                        class="text-uppercase text-weight-bolder text-pink-4 text-center"
                      >
                        Collection
                      </div>
                      <q-separator />
                      <div class="q-pa-sm">
                        <div>
                          <span
                            class="text-caption text-uppercase text-weight-bold"
                          >
                            Date:
                          </span>
                          <span
                            :class="{
                              'mark-yellow text-weight-bolder':
                                  logistics.collections?.[0]?.collection_date
                            }"
                          >
                            {{ getCollectionDate(logistics.collections) }}
                          </span>
                        </div>
                        <div>
                          <span
                            class="text-caption text-uppercase text-weight-bold"
                          >
                            Time:
                          </span>
                          {{
                            logistics.collections?.[0]?.collection_time || "-"
                          }}
                        </div>
                        <div>
                          <span
                            class="text-caption text-uppercase text-weight-bold"
                          >
                            Driver:
                          </span>
                          <span
                            :class="{
                              'mark-yellow text-weight-bolder':
                                  logistics.collections?.[0]?.driver_name
                            }"
                          >
                            {{ logistics.collections?.[0]?.driver_name || "-" }}
                          </span>
                        </div>
                        <div>
                          <span
                            class="text-caption text-uppercase text-weight-bold"
                          >
                            Address: </span
                          >{{ logistics.collections?.[0]?.address || "-" }}
                        </div>
                      </div>

                      <q-separator />
                      <div class="q-pa-sm">
                        <div
                          class="text-caption text-uppercase text-weight-bold"
                        >
                          Contact Person:
                        </div>
                        <div>
                          {{
                            logistics.collections?.[0]?.contact_person?.name ||
                            logistics.collections?.[0]?.customer_contact_persons
                              ?.name ||
                            "[NOT SET]"
                          }}
                        </div>
                        <div>
                          <template
                            v-if="
                              pickCollectionContact(logistics).phone1 ||
                              pickCollectionContact(logistics).phone2
                            "
                          >
                            <span
                              v-if="pickCollectionContact(logistics).phone1"
                              class="phone-link"
                              @click.stop
                            >
                              {{ pickCollectionContact(logistics).phone1 }}
                              <q-popup-proxy
                                transition-show="scale"
                                transition-hide="scale"
                              >
                                <q-list style="min-width: 220px">
                                  <q-item
                                    clickable
                                    v-ripple
                                    @click="
                                      callViaPhone(
                                        pickCollectionContact(logistics).phone1
                                      )
                                    "
                                  >
                                    <q-item-section avatar
                                      ><q-icon name="call"
                                    /></q-item-section>
                                    <q-item-section
                                      >Call via phone</q-item-section
                                    >
                                  </q-item>
                                  <q-item
                                    clickable
                                    v-ripple
                                    @click="
                                      callViaWhatsApp(
                                        pickCollectionContact(logistics).phone1
                                      )
                                    "
                                  >
                                    <q-item-section avatar
                                      ><q-icon name="chat"
                                    /></q-item-section>
                                    <q-item-section
                                      >Call via WhatsApp</q-item-section
                                    >
                                  </q-item>
                                </q-list>
                              </q-popup-proxy>
                            </span>
                            <span
                              v-if="pickCollectionContact(logistics).phone2"
                            >
                              /
                            </span>
                            <span
                              v-if="pickCollectionContact(logistics).phone2"
                              class="phone-link"
                              @click.stop
                            >
                              {{ pickCollectionContact(logistics).phone2 }}
                              <q-popup-proxy
                                transition-show="scale"
                                transition-hide="scale"
                              >
                                <q-list style="min-width: 220px">
                                  <q-item
                                    clickable
                                    v-ripple
                                    @click="
                                      callViaPhone(
                                        pickCollectionContact(logistics).phone2
                                      )
                                    "
                                  >
                                    <q-item-section avatar
                                      ><q-icon name="call"
                                    /></q-item-section>
                                    <q-item-section
                                      >Call via phone</q-item-section
                                    >
                                  </q-item>
                                  <q-item
                                    clickable
                                    v-ripple
                                    @click="
                                      callViaWhatsApp(
                                        pickCollectionContact(logistics).phone2
                                      )
                                    "
                                  >
                                    <q-item-section avatar
                                      ><q-icon name="chat"
                                    /></q-item-section>
                                    <q-item-section
                                      >Call via WhatsApp</q-item-section
                                    >
                                  </q-item>
                                </q-list>
                              </q-popup-proxy>
                            </span>
                          </template>
                          <template v-else> - </template>
                        </div>
                        <div v-if="pickCollectionContact(logistics).email">
                          <span class="email-link" @click.stop>
                            {{ pickCollectionContact(logistics).email }}
                            <q-popup-proxy
                              transition-show="scale"
                              transition-hide="scale"
                            >
                              <q-list style="min-width: 220px">
                                <q-item
                                  clickable
                                  v-ripple
                                  @click="
                                    composeEmail(
                                      pickCollectionContact(logistics).email
                                    )
                                  "
                                >
                                  <q-item-section avatar
                                    ><q-icon name="email"
                                  /></q-item-section>
                                  <q-item-section>Compose email</q-item-section>
                                </q-item>
                                <q-item
                                  clickable
                                  v-ripple
                                  @click="
                                    copyEmail(
                                      pickCollectionContact(logistics).email
                                    )
                                  "
                                >
                                  <q-item-section avatar
                                    ><q-icon name="content_copy"
                                  /></q-item-section>
                                  <q-item-section>Copy email</q-item-section>
                                </q-item>
                              </q-list>
                            </q-popup-proxy>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      class="col"
                      :style="{
                        order: isDeliveryFirst(logistics.logistics_status)
                          ? 1
                          : 2,
                        borderRight: isDeliveryFirst(logistics.logistics_status)
                          ? '1px solid #c09f8b'
                          : '',
                      }"
                    >
                      <div
                        class="text-uppercase text-weight-bolder text-blue text-center"
                      >
                        Delivery
                      </div>
                      <q-separator />
                      <div class="q-pa-sm">
                        <div>
                          <span
                            class="text-caption text-uppercase text-weight-bold"
                          >
                            Date:
                          </span>
                          <span
                            :class="{
                              'mark-yellow text-weight-bolder':
                                  logistics.deliveries?.[0]?.delivery_date
                            }"
                          >
                            {{ getDeliveryDate(logistics.deliveries) }}
                          </span>
                        </div>
                        <div>
                          <span
                            class="text-caption text-uppercase text-weight-bold"
                          >
                            Time: </span
                          >{{ logistics.deliveries?.[0]?.delivery_time || "-" }}
                        </div>
                        <div>
                          <span
                            class="text-caption text-uppercase text-weight-bold"
                          >
                            Driver:
                          </span>
                          <span
                            :class="{
                              'mark-yellow text-weight-bolder':
                                  logistics.deliveries?.[0]?.driver_name
                            }"
                          >
                            {{ logistics.deliveries?.[0]?.driver_name || "-" }}
                          </span>
                        </div>
                        <div>
                          <span
                            class="text-caption text-uppercase text-weight-bold"
                          >
                            Address: </span
                          >{{ logistics.deliveries?.[0]?.address || "-" }}
                        </div>
                      </div>
                      <q-separator />
                      <div class="q-pa-sm">
                        <div
                          class="text-caption text-uppercase text-weight-bold"
                        >
                          Contact Person:
                        </div>
                        <div>
                          {{
                            logistics.deliveries?.[0]?.contact_person?.name ||
                            logistics.deliveries?.[0]?.customer_contact_persons
                              ?.name ||
                            "[NOT SET]"
                          }}
                        </div>
                        <div>
                          <template
                            v-if="
                              pickDeliveryContact(logistics).phone1 ||
                              pickDeliveryContact(logistics).phone2
                            "
                          >
                            <span
                              v-if="pickDeliveryContact(logistics).phone1"
                              class="phone-link"
                              @click.stop
                            >
                              {{ pickDeliveryContact(logistics).phone1 }}
                              <q-popup-proxy
                                transition-show="scale"
                                transition-hide="scale"
                              >
                                <q-list style="min-width: 220px">
                                  <q-item
                                    clickable
                                    v-ripple
                                    @click="
                                      callViaPhone(
                                        pickDeliveryContact(logistics).phone1
                                      )
                                    "
                                  >
                                    <q-item-section avatar
                                      ><q-icon name="call"
                                    /></q-item-section>
                                    <q-item-section
                                      >Call via phone</q-item-section
                                    >
                                  </q-item>
                                  <q-item
                                    clickable
                                    v-ripple
                                    @click="
                                      callViaWhatsApp(
                                        pickDeliveryContact(logistics).phone1
                                      )
                                    "
                                  >
                                    <q-item-section avatar
                                      ><q-icon name="chat"
                                    /></q-item-section>
                                    <q-item-section
                                      >Call via WhatsApp</q-item-section
                                    >
                                  </q-item>
                                </q-list>
                              </q-popup-proxy>
                            </span>
                            <span v-if="pickDeliveryContact(logistics).phone2">
                              /
                            </span>
                            <span
                              v-if="pickDeliveryContact(logistics).phone2"
                              class="phone-link"
                              @click.stop
                            >
                              {{ pickDeliveryContact(logistics).phone2 }}
                              <q-popup-proxy
                                transition-show="scale"
                                transition-hide="scale"
                              >
                                <q-list style="min-width: 220px">
                                  <q-item
                                    clickable
                                    v-ripple
                                    @click="
                                      callViaPhone(
                                        pickDeliveryContact(logistics).phone2
                                      )
                                    "
                                  >
                                    <q-item-section avatar
                                      ><q-icon name="call"
                                    /></q-item-section>
                                    <q-item-section
                                      >Call via phone</q-item-section
                                    >
                                  </q-item>
                                  <q-item
                                    clickable
                                    v-ripple
                                    @click="
                                      callViaWhatsApp(
                                        pickDeliveryContact(logistics).phone2
                                      )
                                    "
                                  >
                                    <q-item-section avatar
                                      ><q-icon name="chat"
                                    /></q-item-section>
                                    <q-item-section
                                      >Call via WhatsApp</q-item-section
                                    >
                                  </q-item>
                                </q-list>
                              </q-popup-proxy>
                            </span>
                          </template>
                          <template v-else> - </template>
                          <div v-if="pickDeliveryContact(logistics).email">
                            <span class="email-link" @click.stop>
                              {{ pickDeliveryContact(logistics).email }}
                              <q-popup-proxy
                                transition-show="scale"
                                transition-hide="scale"
                              >
                                <q-list style="min-width: 220px">
                                  <q-item
                                    clickable
                                    v-ripple
                                    @click="
                                      composeEmail(
                                        pickDeliveryContact(logistics).email
                                      )
                                    "
                                  >
                                    <q-item-section avatar
                                      ><q-icon name="email"
                                    /></q-item-section>
                                    <q-item-section
                                      >Compose email</q-item-section
                                    >
                                  </q-item>
                                  <q-item
                                    clickable
                                    v-ripple
                                    @click="
                                      copyEmail(
                                        pickDeliveryContact(logistics).email
                                      )
                                    "
                                  >
                                    <q-item-section avatar
                                      ><q-icon name="content_copy"
                                    /></q-item-section>
                                    <q-item-section>Copy email</q-item-section>
                                  </q-item>
                                </q-list>
                              </q-popup-proxy>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- PRODUCTION DETAILS COLUMN -->
                <div class="col bordered" style="padding-top: 0">
                  <div class="row justify-between q-mx-sm q-mb-sm">
                    <div
                      class="col flex flex-center"
                      :class="[
                        'text-weight-bold',
                        'text-subtitle1',
                        'text-center',
                        'line-height-1',
                        'text-uppercase',
                      ]"
                      style="
                        border-style: solid;
                        border-width: 1px;
                        min-height: 100%;
                      "
                    >
                      {{
                        order?.goods_status ||
                        logistics.order?.goods_status ||
                        "-"
                      }}
                    </div>
                    <div class="col-auto" v-if="order || logistics.order">
                      <q-icon
                        name="edit"
                        size="sm"
                        unelevated
                        class="cursor-pointer bg-primary text-white q-pa-xs"
                        role="button"
                        aria-label="UpdateGoodsStatus"
                        @click="openUpdateGoodsDialog(order || logistics.order)"
                      />
                    </div>
                  </div>
                  <div>
                    <span class="text-caption text-uppercase text-weight-bold"
                      >Ready By:</span
                    >
                    {{
                      formatDate(
                        order?.order_production?.ready_by ||
                          logistics.order?.order_production?.ready_by
                      ) || "-"
                    }}
                  </div>
                  <q-separator class="q-ma-sm" />
                  <div v-if="logistics.collections?.[0]?.no_bags">
                    <span
                      class="text-caption text-uppercase text-weight-bold q-mr-xs"
                      >Bags: </span
                    >{{ logistics.collections?.[0]?.no_bags || "-" }}b
                  </div>
                  <div
                    v-if="
                      order?.order_production?.no_hangers ||
                      logistics.order?.order_production?.no_hangers
                    "
                  >
                    <span
                      class="text-caption text-uppercase text-weight-bold q-mr-xs"
                      >Hang:</span
                    >
                    {{
                      order?.order_production?.no_hangers ||
                      logistics.order?.order_production?.no_hangers ||
                      "-"
                    }}h
                  </div>
                  <div
                    v-if="
                      order?.order_production?.no_packets ||
                      logistics.order?.order_production?.no_packets
                    "
                  >
                    <span
                      class="text-caption text-uppercase text-weight-bold q-mr-xs"
                      >Pack:</span
                    >
                    {{
                      order?.order_production?.no_packets ||
                      logistics.order?.order_production?.no_packets ||
                      "-"
                    }}p
                  </div>
                  <div
                    v-if="
                      order?.order_production?.no_rolls ||
                      logistics.order?.order_production?.no_rolls
                    "
                  >
                    <span
                      class="text-caption text-uppercase text-weight-bold q-mr-xs"
                      >Rolls:</span
                    >
                    {{
                      order?.order_production?.no_rolls ||
                      logistics.order?.order_production?.no_rolls ||
                      "-"
                    }}r
                  </div>
                </div>

                <!-- PAYMENT COLUMN -->
                <div class="col bordered" style="padding-top: 0">
                  <div class="row justify-between q-mx-sm q-mb-sm">
                    <div
                      class="col flex flex-center"
                      :class="[
                        'text-weight-bold',
                        'text-subtitle1',
                        'text-center',
                        'line-height-1',
                        'text-uppercase',
                        (
                          order?.payment_status ||
                          logistics.order?.payment_status ||
                          ''
                        ).toLowerCase() === 'paid'
                          ? 'mark-bg-green'
                          : (
                              order?.payment_status ||
                              logistics.order?.payment_status ||
                              ''
                            ).toLowerCase() === 'unpaid'
                          ? 'mark-bg-red'
                          : '',
                      ]"
                      style="
                        border-style: solid;
                        border-width: 1px;
                        min-height: 100%;
                      "
                    >
                      {{
                        order?.payment_status ||
                        logistics.order?.payment_status ||
                        "-"
                      }}
                    </div>
                    <div class="col-auto">
                      <q-icon
                        name="add"
                        size="sm"
                        unelevated
                        class="cursor-pointer bg-primary text-white q-pa-xs"
                        role="button"
                        aria-label="UpdateLogStatus"
                        @click="
                          openAddPaymentDialog(
                            order || logistics.order,
                            logistics.customer
                          )
                        "
                      />
                    </div>
                  </div>

                  <div>
                    <span
                      class="text-caption text-uppercase text-weight-bold q-mr-xs"
                      >Credits:</span
                    >
                    <span class="text-weight-bold">{{
                      getCustomerCredits(logistics.customer)
                    }}</span>
                  </div>
                  <q-separator class="q-ma-sm" />
                  <div>
                    <span
                      class="text-caption text-uppercase text-weight-bold q-mr-xs"
                      >Paid:</span
                    >
                    <span class="text-weight-bold"
                      >${{
                        order?.paid_amount ??
                        logistics.order?.paid_amount ??
                        "0.00"
                      }}</span
                    >
                  </div>
                  <div>
                    <span
                      class="text-caption text-uppercase text-weight-bold q-mr-xs"
                      >Balance:</span
                    >
                    <span class="text-red text-weight-bold"
                      >${{
                        order?.balance_amount ??
                        logistics.order?.balance_amount ??
                        "0.00"
                      }}</span
                    >
                  </div>
                  <div>
                    <span
                      class="text-caption text-uppercase text-weight-bold q-mr-xs"
                      >Amount:</span
                    >
                    <span class="text-weight-bold"
                      >${{
                        order?.total_amount ??
                        logistics.order?.total_amount ??
                        "0.00"
                      }}</span
                    >
                  </div>
                </div>
              </slot>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { useQuasar, openURL, copyToClipboard } from "quasar";

const $q = useQuasar();

const props = defineProps({
  customerId: { type: [String, Number], required: true },
});

const transactionStore = useTransactionStore();
const logisticsData = ref([]);
const loading = ref(true);

onMounted(fetchData);
watch(() => props.customerId, fetchData);

async function fetchData() {
  if (!props.customerId) return;
  loading.value = true;
  try {
    const raw = await transactionStore.fetchOrdersByCustomerId(props.customerId);
    logisticsData.value = normalizeOrders(raw);
  } catch (err) {
    console.error('Failed to fetch logistics:', err);
  } finally {
    loading.value = false;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('en-GB');
}

function normalizeName(name) {
  return typeof name === 'string' ? name.trim().toLowerCase() : '';
}

function getOrderDate(order) {
  return formatDate(order?.created_at);
}

function getCollectionDate(collections) {
  return formatDate(collections?.[0]?.collection_date);
}

function getDeliveryDate(deliveries) {
  return formatDate(deliveries?.[0]?.delivery_date);
}

function openOrderTab(order) {
  if (!order?.order_no) return;
  window.open(`/orders/${order.order_no}`, '_blank');
}

function ordersOrPlaceholder(logistics) {
  return Array.isArray(logistics?.orders) && logistics.orders.length > 0
    ? logistics.orders
    : [null];
}

function normalizeOrders(rows) {
  const list = Array.isArray(rows) ? rows : [];
  return list.map((r) => {
    const logistics = r.logistics ?? r;
    let ordersRaw = logistics.orders ?? r.orders ?? (r.order ? [r.order] : []);
    if (!Array.isArray(ordersRaw)) ordersRaw = ordersRaw ? [ordersRaw] : [];
    const orders = ordersRaw.map(decorateOrder);

    const collections = (logistics.logistics_collections ?? r.logistics_collections ?? []).filter(
      (c) => c.status === 'active'
    );
    const deliveries = (logistics.logistics_deliveries ?? r.logistics_deliveries ?? []).filter(
      (d) => d.status === 'active'
    );

    return {
      ...logistics,
      logistics_id: logistics.logistics_id ?? logistics.id,
      orders,
      order: orders?.[0] || null,
      collections,
      deliveries,
    };
  });
}


function decorateOrder(order) {
  const op =
    order?.order_payment ||
    order?.payment ||
    order?.order_payments?.[0] ||
    {};
  const total = Number(op.total_amount ?? order?.total_amount ?? 0);
  const paid = Number(op.paid_amount ?? order?.paid_amount ?? 0);
  const balance = total - paid;
  return {
    ...order,
    goods_status:
      order?.order_production?.[0]?.goods_status ??
      order?.order_production?.goods_status ??
      order?.goods_status ??
      '-',
    order_production: Array.isArray(order?.order_production)
      ? order.order_production[0]
      : order?.order_production ?? {},
    payment_status: op?.payment_status ?? order?.payment_status ?? '-',
    total_amount: total.toFixed(2),
    paid_amount: paid.toFixed(2),
    balance_amount: balance.toFixed(2),
  };
}

const pickCollectionContact = (logistics) => {
  const src =
    logistics?.collections?.[0]?.contact_person ||
    logistics?.collections?.[0]?.customer_contact_persons ||
    {};
  return {
    phone1: src.contact_no1 || "",
    phone2: src.contact_no2 || "",
    email: src.email || "",
  };
};

const pickDeliveryContact = (logistics) => {
  const src =
    logistics?.deliveries?.[0]?.contact_person ||
    logistics?.deliveries?.[0]?.customer_contact_persons ||
    {};
  return {
    phone1: src.contact_no1 || "",
    phone2: src.contact_no2 || "",
    email: src.email || "",
  };
};

const getCustomerCredits = (customer) => {
  // accept object or single-element array shape
  const credits = Array.isArray(customer?.customer_credits)
    ? customer?.customer_credits?.[0]
    : customer?.customer_credits;
  const online = parseFloat(credits?.online_package ?? "0") || 0;
  const other = parseFloat(credits?.other_credits ?? "0") || 0;
  return `$${(online + other).toFixed(2)}`;
};

const COLLECTION_STATUSES = new Set([
  "collection arranged",
  "collection completed",
  "collection rescheduled",
  "collection cancelled",
]);

const DELIVERY_STATUSES = new Set([
  "delivery arranged",
  "delivery completed",
  "delivery postponed",
  "delivery partial",
]);

function logisticsBadgeClass(status) {
  const s = normalizeName(status);
  if (COLLECTION_STATUSES.has(s)) return 'bg-pink-2';
  if (DELIVERY_STATUSES.has(s)) return 'bg-blue-2';
  return '';
}

const isDeliveryFirst = (status) => {
  const s = String(status || "")
    .trim()
    .toLowerCase();
  if (DELIVERY_STATUSES.has(s) || s.startsWith("delivery")) return true;
  // default & collection-* → collection first
  return false;
};

const sanitizeForTel = (raw) => String(raw || "").replace(/[^\d+]/g, ""); // keep digits and +
const sanitizeForWhatsApp = (raw) => String(raw || "").replace(/\D/g, ""); // digits only
const sanitizeEmail = (raw) => String(raw || "").trim();

const callViaPhone = (raw) => {
  const tel = sanitizeForTel(raw);
  if (tel) openURL(`tel:${tel}`);
};

const callViaWhatsApp = (raw) => {
  const wa = sanitizeForWhatsApp(raw);
  if (wa) openURL(`https://wa.me/${wa}`);
};

const composeEmail = (raw) => {
  const email = sanitizeEmail(raw);
  if (email) openURL(`mailto:${email}`);
};

const copyEmail = async (raw) => {
  const email = sanitizeEmail(raw);
  if (!email) return;
  try {
    await copyToClipboard(email);
    $q.notify({ type: "positive", message: "Email copied" });
  } catch {
    $q.notify({ type: "negative", message: "Copy failed" });
  }
};
</script>