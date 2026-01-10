<template>
  <div class="row-col-table">
    <div class="row row-col-header text-center items-center">
      <div class="col header-bordered flex flex-center">Order Details</div>
      <div class="col-5 header-bordered flex flex-center">
        Logistics Details
      </div>
      <div class="col header-bordered flex flex-center">Production Details</div>
      <div class="col header-bordered flex flex-center">Payment Status</div>
    </div>

    <div v-if="rows.length === 0" class="text-center text-grey q-pa-lg text-h6">
      No orders found.
    </div>

    <template v-else>
      <div
        v-for="(logistics, index) in rows"
        :key="
          logistics.isStandaloneException
            ? `stand-ex-${logistics.tempExData.id}`
            : logistics.logistics_id || logistics.id || index
        "
      >
        <div
          v-for="(rowItem, idx) in rowsForDisplay(logistics)"
          :key="rowKey(rowItem, idx)"
          class="row row-col-row line-height-1"
        >
          <div class="col bordered">
            <div class="q-mb-xs">
              <div v-if="(rowItem.order || logistics.order)?.order_no">
                <q-btn
                  outline
                  color="blue-8"
                  dense
                  @click="openOrderTab(rowItem.order || logistics.order)"
                  class="text-weight-bold bg-blue-1 text-subtitle1 q-px-sm"
                >
                  {{ (rowItem.order || logistics.order)?.order_no }}
                </q-btn>
              </div>
              <div v-else-if="!logistics.isStandaloneException">
                <q-btn
                  dense
                  label="Create Order"
                  color="primary"
                  unelevated
                  class="q-px-sm"
                  @click="createOrder(logistics)"
                />
              </div>
              <div v-else class="text-caption text-grey-7 italic">
                Ref: Logistics #{{ logistics.logistics_id }}
              </div>
            </div>

            <div>
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Date:</span
              >
              <NotSetText
                :value="getOrderDate(rowItem.order || logistics.order)"
              />
            </div>

            <div>
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Urgency:</span
              >
              <span
                :class="
                  urgencyClass(
                    logistics.isStandaloneException
                      ? logistics.tempExData.urgency
                      : logistics.urgency
                  )
                "
              >
                {{
                  (logistics.isStandaloneException
                    ? logistics.tempExData.urgency
                    : logistics.urgency) || "default"
                }}
              </span>
            </div>

            <q-separator class="q-mt-sm" />
            <div class="mark-brown text-center text-uppercase">
              Customer Details
            </div>
            <q-separator class="q-mb-sm" />

            <div class="text-weight-bold q-mb-sm">
              <a
                @click.prevent="openCustomerTab(logistics.customer?.id)"
                class="text-weight-bold text-subtitle1 line-height-1 cursor-pointer"
              >
                <NotSetText :value="logistics.customer?.name" />
              </a>
            </div>

            <div class="phone-link" @click.stop>
              <NotSetText :value="logistics.customer?.contact_no1" />
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-list style="min-width: 220px">
                  <q-item
                    clickable
                    v-ripple
                    @click="callViaPhone(logistics.customer?.contact_no1)"
                  >
                    <q-item-section avatar
                      ><q-icon name="call"
                    /></q-item-section>
                    <q-item-section>Call via phone</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-ripple
                    @click="callViaWhatsApp(logistics.customer?.contact_no1)"
                  >
                    <q-item-section avatar
                      ><q-icon name="chat"
                    /></q-item-section>
                    <q-item-section>Call via WhatsApp</q-item-section>
                  </q-item>
                </q-list>
              </q-popup-proxy>
            </div>
            <div
              v-if="logistics.customer?.contact_no2"
              class="phone-link"
              @click.stop
            >
              <NotSetText :value="logistics.customer?.contact_no2" />
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-list style="min-width: 220px">
                  <q-item
                    clickable
                    v-ripple
                    @click="callViaPhone(logistics.customer?.contact_no2)"
                  >
                    <q-item-section avatar
                      ><q-icon name="call"
                    /></q-item-section>
                    <q-item-section>Call via phone</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-ripple
                    @click="callViaWhatsApp(logistics.customer?.contact_no2)"
                  >
                    <q-item-section avatar
                      ><q-icon name="chat"
                    /></q-item-section>
                    <q-item-section>Call via WhatsApp</q-item-section>
                  </q-item>
                </q-list>
              </q-popup-proxy>
            </div>
          </div>

          <div class="col-5 bordered" style="padding: 0">
            <div class="row justify-between q-mx-sm q-my-xs">
              <div
                class="col flex flex-center text-weight-bold text-subtitle1 text-center line-height-1 text-uppercase"
                :class="logisticsBadgeClass(logistics.logistics_status)"
                style="border-style: solid; border-width: 1px; min-height: 100%"
              >
                <NotSetText :value="logistics.logistics_status" />
              </div>
              <div class="col-auto" v-if="!logistics.isStandaloneException">
                <q-icon
                  name="edit"
                  size="sm"
                  unelevated
                  class="cursor-pointer bg-primary text-white q-pa-xs"
                  @click="openUpdateStatusDialog(logistics)"
                />
              </div>
            </div>

            <q-separator />

            <div class="row" style="min-height: auto">
              <template
                v-if="
                  !logistics.isStandaloneException &&
                  shouldShowCollectionForRow(
                    rowsForDisplay(logistics),
                    rowItem,
                    idx
                  )
                "
              >
                <div class="col" style="border-right: 1px solid #c09f8b">
                  <div
                    class="text-uppercase text-weight-bolder text-pink-4 text-center"
                  >
                    Collection
                  </div>
                  <q-separator />
                  <div class="q-pa-sm">
                    <div>
                      <span
                        class="text-caption text-uppercase text-weight-bold q-mr-xs"
                        >Date:</span
                      >
                      <NotSetText
                        :value="getCollectionDate(logistics.collections)"
                      />
                    </div>
                    <div>
                      <span
                        class="text-caption text-uppercase text-weight-bold q-mr-xs"
                        >Time:</span
                      >
                      <NotSetText
                        :value="logistics.collections?.[0]?.collection_time"
                      />
                    </div>
                    <div>
                      <span
                        class="text-caption text-uppercase text-weight-bold q-mr-xs"
                        >Driver:</span
                      >
                      <NotSetText
                        :value="
                          getDriverName(logistics.collections?.[0]?.driver_id)
                        "
                      />
                    </div>
                    <div>
                      <span
                        class="text-caption text-uppercase text-weight-bold q-mr-xs"
                        >Address:</span
                      >
                      <NotSetText
                        :value="
                          formatAddress(logistics.collections?.[0]?.address)
                        "
                      />
                    </div>
                    <div>
                      <span
                        class="text-caption text-uppercase text-weight-bold q-mr-xs"
                        >Remarks:</span
                      >
                      <NotSetText
                        :value="logistics.collections?.[0]?.collection_remarks"
                      />
                    </div>
                  </div>
                  <q-separator />
                  <div class="q-pa-sm">
                    <div
                      class="text-caption text-uppercase text-weight-bold q-mr-xs"
                    >
                      Contact Person:
                    </div>
                    <NotSetText
                      :value="logistics.collections?.[0]?.contact_person?.name"
                    />
                    <div>
                      <span class="phone-link" @click.stop>
                        <NotSetText :value="logistics.collections?.[0]?.contact_person?.contact_no1" />
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-list style="min-width: 220px">
                  <q-item
                    clickable
                    v-ripple
                    @click="callViaPhone(logistics.collections?.[0]?.contact_person?.contact_no1)"
                  >
                    <q-item-section avatar
                      ><q-icon name="call"
                    /></q-item-section>
                    <q-item-section>Call via phone</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-ripple
                    @click="callViaWhatsApp(logistics.collections?.[0]?.contact_person?.contact_no1)"
                  >
                    <q-item-section avatar
                      ><q-icon name="chat"
                    /></q-item-section>
                    <q-item-section>Call via WhatsApp</q-item-section>
                  </q-item>
                </q-list>
              </q-popup-proxy>
                      </span>
                      <span
                        class="phone-link"
                        @click.stop
                        v-if="
                          logistics.collections?.[0]?.contact_person
                            ?.contact_no2
                        "
                      >
                       <NotSetText :value="logistics.collections?.[0]?.contact_person?.contact_no2" />
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-list style="min-width: 220px">
                  <q-item
                    clickable
                    v-ripple
                    @click="callViaPhone(logistics.collections?.[0]?.contact_person?.contact_no2)"
                  >
                    <q-item-section avatar
                      ><q-icon name="call"
                    /></q-item-section>
                    <q-item-section>Call via phone</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-ripple
                    @click="callViaWhatsApp(logistics.collections?.[0]?.contact_person?.contact_no2)"
                  >
                    <q-item-section avatar
                      ><q-icon name="chat"
                    /></q-item-section>
                    <q-item-section>Call via WhatsApp</q-item-section>
                  </q-item>
                </q-list>
              </q-popup-proxy>
                      </span>
                    </div>
                  </div>
                </div>
              </template>

              <div class="col">
                <div
                  class="text-uppercase text-weight-bolder text-blue text-center"
                >
                  <div>Delivery</div>
                  <q-badge
                    v-if="rowItem.kind === 'exception'"
                    color="red"
                    flat
                    class="float-right text-weight-bold"
                    >Exception</q-badge
                  >
                </div>
                <q-separator />

                <div class="q-pa-sm">
                  <div>
                    <span
                      class="text-caption text-uppercase text-weight-bold q-mr-xs"
                      >Date:</span
                    >
                    <span
                      :class="{
                        'mark-yellow text-weight-bolder':
                          toISODate(
                            rowItem.kind === 'exception'
                              ? rowItem.ex?.delivery_date
                              : logistics.deliveries?.[0]?.delivery_date
                          ) === toISODate(selectedFilterDate),
                      }"
                    >
                      <NotSetText
                        :value="
                          rowItem.kind === 'exception'
                            ? formatDate(rowItem.ex?.delivery_date)
                            : getDeliveryDate(logistics.deliveries)
                        "
                      />
                    </span>
                  </div>
                  <div>
                    <span
                      class="text-caption text-uppercase text-weight-bold q-mr-xs"
                      >Time:</span
                    >
                    <NotSetText
                      :value="
                        rowItem.kind === 'exception'
                          ? rowItem.ex?.delivery_time
                          : logistics.deliveries?.[0]?.delivery_time
                      "
                    />
                  </div>
                  <div>
                    <span
                      class="text-caption text-uppercase text-weight-bold q-mr-xs"
                      >Driver:</span
                    >
                    <NotSetText
                      :value="
                        getDriverName(
                          deliveryDriverIdForRow(rowItem, logistics)
                        )
                      "
                    />
                  </div>
                  <div>
                    <span
                      class="text-caption text-uppercase text-weight-bold q-mr-xs"
                      >Address:</span
                    >
                    <NotSetText
                      :value="formatAddress(logistics.deliveries?.[0]?.address)"
                    />
                  </div>
                  <div>
                    <span
                      class="text-caption text-uppercase text-weight-bold q-mr-xs"
                      >Remarks:</span
                    >
                    <NotSetText
                      :value="
                        rowItem.kind === 'exception'
                          ? rowItem.ex?.remarks
                          : logistics.deliveries?.[0]?.remarks
                      "
                    />
                  </div>

                  <q-separator class="q-my-sm" />
                  <div
                    class="text-caption text-uppercase text-weight-bold q-mr-xs"
                  >
                    Contact Person:
                  </div>
                  <NotSetText
                    :value="logistics.deliveries?.[0]?.contact_person?.name"
                  />
                  <div>
                    <span class="phone-link" @click.stop>
                     <NotSetText :value="logistics.deliveries?.[0]?.contact_person?.contact_no1" />
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-list style="min-width: 220px">
                  <q-item
                    clickable
                    v-ripple
                    @click="callViaPhone(logistics.deliveries?.[0]?.contact_person?.contact_no1)"
                  >
                    <q-item-section avatar
                      ><q-icon name="call"
                    /></q-item-section>
                    <q-item-section>Call via phone</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-ripple
                    @click="callViaWhatsApp(logistics.deliveries?.[0]?.contact_person?.contact_no1)"
                  >
                    <q-item-section avatar
                      ><q-icon name="chat"
                    /></q-item-section>
                    <q-item-section>Call via WhatsApp</q-item-section>
                  </q-item>
                </q-list>
              </q-popup-proxy>
                    </span>
                    <span
                      class="phone-link"
                      @click.stop
                      v-if="
                        logistics.deliveries?.[0]?.contact_person?.contact_no2
                      "
                    >
                     <NotSetText :value="logistics.deliveries?.[0]?.contact_person?.contact_no2" />
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-list style="min-width: 220px">
                  <q-item
                    clickable
                    v-ripple
                    @click="callViaPhone(logistics.deliveries?.[0]?.contact_person?.contact_no2)"
                  >
                    <q-item-section avatar
                      ><q-icon name="call"
                    /></q-item-section>
                    <q-item-section>Call via phone</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-ripple
                    @click="callViaWhatsApp(logistics.deliveries?.[0]?.contact_person?.contact_no2)"
                  >
                    <q-item-section avatar
                      ><q-icon name="chat"
                    /></q-item-section>
                    <q-item-section>Call via WhatsApp</q-item-section>
                  </q-item>
                </q-list>
              </q-popup-proxy>
                    </span>
                  </div>

                  <div
                    v-if="
                      rowItem.kind === 'exception' &&
                      rowItem.ex?.logistics_delivery_exception_items?.length
                    "
                    class="q-mt-sm"
                  >
                    <q-separator class="q-my-xs" />
                    <div
                      class="text-caption text-weight-bold text-red-9 uppercase"
                    >
                      Items Included:
                    </div>
                    <div
                      v-for="exItem in rowItem.ex
                        .logistics_delivery_exception_items"
                      :key="exItem.id"
                      class="text-caption bg-red-1 q-px-xs q-mb-xs rounded-borders"
                    >
                      •
                      {{ exItem.order_transaction_items?.item_name || "Item" }}:
                      <span class="text-weight-bold">
                        {{ formatExceptionItem(exItem) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <q-separator />
            <div
              class="row justify-between q-mx-sm q-my-xs"
              v-if="!logistics.isStandaloneException"
            >
              <q-btn
                dense
                unelevated
                color="primary"
                icon="edit_note"
                label="Update Logistics"
                class="full-width"
                @click="openUpdateLogistics(logistics)"
              />
            </div>
          </div>

          <div class="col bordered" style="padding-top: 0">
            <div class="row justify-between q-mx-sm q-my-xs">
              <div
                class="col flex flex-center text-weight-bold text-subtitle1 text-center line-height-1 text-uppercase"
                style="border-style: solid; border-width: 1px; min-height: 100%"
              >
                <NotSetText
                  :value="(rowItem.order || logistics.order)?.goods_status"
                />
              </div>
              <div class="col-auto" v-if="rowItem.order || logistics.order">
                <q-icon
                  name="edit"
                  size="sm"
                  class="cursor-pointer bg-primary text-white q-pa-xs"
                  @click="
                    openUpdateGoodsDialog(rowItem.order || logistics.order)
                  "
                />
              </div>
            </div>
            <q-separator class="q-my-sm" />
            <div v-if="rowItem.order || logistics.order">
              <div v-if="logistics.collections?.[0]?.no_bags">
                Bags: {{ logistics.collections[0].no_bags }}b
              </div>
              <div
                v-if="
                  (rowItem.order || logistics.order).order_production
                    ?.no_hangers
                "
              >
                Hang:
                {{
                  (rowItem.order || logistics.order).order_production
                    .no_hangers
                }}h
              </div>
            </div>
          </div>

          <div class="col bordered" style="padding-top: 0">
            <div class="row justify-between q-mx-sm q-my-xs">
              <div
                class="col flex flex-center text-weight-bold text-subtitle1 text-center line-height-1 text-uppercase"
                :class="
                  (
                    rowItem.order || logistics.order
                  )?.payment_status?.toLowerCase() === 'paid'
                    ? 'mark-bg-green'
                    : (
                        rowItem.order || logistics.order
                      )?.payment_status?.toLowerCase() === 'unpaid'
                    ? 'mark-bg-red'
                    : ''
                "
                style="border-style: solid; border-width: 1px; min-height: 100%"
              >
                <NotSetText
                  :value="(rowItem.order || logistics.order)?.payment_status"
                />
              </div>
              <div class="col-auto">
                <q-icon
                  name="add"
                  size="sm"
                  class="cursor-pointer bg-primary text-white q-pa-xs"
                  @click="
                    openAddPaymentDialog(
                      rowItem.order || logistics.order,
                      logistics.customer
                    )
                  "
                />
              </div>
            </div>
            <div class="q-pa-sm text-caption">
              <div>
                Balance:
                <span class="text-red text-weight-bold"
                  >${{
                    (rowItem.order || logistics.order)?.balance_amount ?? "0.00"
                  }}</span
                >
              </div>
              <div>
                Paid: ${{
                  (rowItem.order || logistics.order)?.paid_amount ?? "0.00"
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <UpdateLogisticsStatusDialog
    v-model:show="showUpdateStatusDialog"
    :logistics="selectedLogisticsRow"
    @saved="showUpdateStatusDialog = false"
  />

  <UpdateGoodsStatusDialog
    v-model:show="showUpdateGoodsDialog"
    :order="selectedGoodsOrder"
    @saved="showUpdateGoodsDialog = false"
  />

  <q-dialog
    v-model="showUpdateLogisticsDialog"
    persistent
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card style="min-width: 90vw">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Update Collection and Delivery
        </div>
        <q-btn
          icon="close"
          flat
          dense
          round
          class="absolute-top-right q-ma-sm"
          @click="showUpdateLogisticsDialog = false"
        />
      </q-card-section>
      <q-card-section class="q-pa-none">
        <div class="dialog-body">
          <div class="text-subtitle1 text-weight-bold q-pa-md">
            Customer Name:
            <span
              class="text-subtitle1 text-uppercase text-weight-bold text-red-9"
            >
              {{ transactionStore.selectedCustomer?.name || "[NOT SELECTED]" }}
            </span>
          </div>
          <div class="row q-col-gutter-md q-px-lg q-pb-lg">
            <div class="col-6">
              <UpdateCollectionDialog />
            </div>
            <div class="col-6">
              <UpdateDeliveryDialog />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <AddPaymentDialog
    v-model:show="showAddPaymentDialog"
    :order="selectedPaymentOrder"
    :customer="selectedPaymentCustomer"
    @saved="showAddPaymentDialog = false"
  />

  <q-dialog
    v-model="showCreateOrderDialog"
    persistent
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card style="min-width: 90vw">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Create Order
        </div>
        <q-btn
          icon="close"
          flat
          dense
          round
          class="absolute-top-right q-ma-sm"
          @click="showCreateOrderDialog = false"
        />
      </q-card-section>
      <q-card-section class="q-pa-none">
        <CreateOrderFromCollection />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, defineComponent, h } from "vue";
import { useQuasar, openURL } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";
import UpdateCollectionDialog from "@/components/dialogs/UpdateCollectionDialog.vue";
import UpdateDeliveryDialog from "@/components/dialogs/UpdateDeliveryDialog.vue";
import CreateOrderFromCollection from "@/views/CreateOrderFromCollection.vue";
import AddPaymentDialog from "@/components/dialogs/AddPaymentDialog.vue";
import UpdateGoodsStatusDialog from "@/components/dialogs/UpdateGoodsStatusDialog.vue";
import UpdateLogisticsStatusDialog from "@/components/dialogs/UpdateLogisticsStatusDialog.vue";

const props = defineProps({
  rows: Array,
  selectedFilterDate: [String, Date, null],
  activeDriverTab: { type: [String, Number], default: "" },
});

const $q = useQuasar();
const transactionStore = useTransactionStore();

/* ------------------- Row Logic ------------------- */
function rowsForDisplay(logistics) {
  if (logistics.isStandaloneException) {
    return [
      {
        kind: "exception",
        order: logistics.order || null,
        ex: logistics.tempExData,
      },
    ];
  }
  const base = (
    Array.isArray(logistics?.orders) && logistics.orders.length
      ? logistics.orders
      : [null]
  ).map((o) => ({ kind: "order", order: o }));
  return base;
}

const rowKey = (rowItem, idx) =>
  rowItem.kind === "exception"
    ? `ex-${rowItem.ex.id}`
    : `${rowItem.order?.id || "no-order"}-${idx}`;

/* ------------------- Driver Helpers ------------------- */
const DRIVER_NOT_SET = "[NOT SET]";

const driverMapById = computed(() => {
  const m = new Map();
  (transactionStore.driverOptions || []).forEach((d) => {
    if (d?.id != null)
      m.set(String(d.id), (d.name || "").trim() || DRIVER_NOT_SET);
  });
  return m;
});

const getDriverName = (id) =>
  driverMapById.value.get(String(id)) || DRIVER_NOT_SET;

function isActiveDriver(driverId) {
  const tab = props.activeDriverTab;
  if (!tab) return true;
  return tab === DRIVER_NOT_SET
    ? driverId == null || driverId === ""
    : String(driverId ?? "") === String(tab);
}

function deliveryDriverIdForRow(rowItem, logistics) {
  const mainId = logistics?.deliveries?.[0]?.driver_id ?? null;
  return rowItem?.kind === "exception"
    ? rowItem.ex?.driver_id ?? mainId
    : mainId;
}

/* ------------------- Date/Text Helpers ------------------- */
const toISODate = (d) => {
  if (!d) return null;
  if (typeof d === "string") {
    const m = d.match(/^\d{4}-\d{2}-\d{2}/);
    if (m) return m[0];
  }
  const dt = new Date(d);
  return isNaN(dt) ? null : dt.toISOString().split("T")[0];
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
};

const getOrderDate = (t) => formatDate(t?.created_at);

const getCollectionDate = (t) => {
  const d = Array.isArray(t)
    ? t?.[0]?.collection_date
    : t?.collection_date || t?.collections?.[0]?.collection_date;
  return d ? formatDate(d) : "";
};

const getDeliveryDate = (t) => {
  const d = Array.isArray(t)
    ? t?.[0]?.delivery_date
    : t?.delivery_date || t?.deliveries?.[0]?.delivery_date;
  return d ? formatDate(d) : "";
};

const NotSetText = defineComponent({
  name: "NotSetText",
  props: ["value"],
  setup(props) {
    return () => {
      const str = (props.value ?? "").toString().trim();
      return str
        ? h("span", str)
        : h(
            "span",
            { class: "text-grey-6 text-uppercase text-caption" },
            "[not set]"
          );
    };
  },
});

/* ------------------- Layout Helpers ------------------- */
function formatAddress(addr) {
  if (!addr) return "";
  return (
    [
      addr.block_no,
      addr.road_name,
      addr.unit_no,
      addr.building_name,
      addr.postal_code,
    ]
      .map((v) => (v ?? "").toString().trim())
      .filter(Boolean)
      .join(" ") || ""
  );
}

function logisticsBadgeClass(status) {
  const s = String(status || "")
    .trim()
    .toLowerCase();
  const COLLECTION = [
    "collection arranged",
    "items with driver",
    "collection completed",
    "collection rescheduled",
    "collection cancelled",
    "ongoing collection issue/s",
  ];
  const DELIVERY = [
    "processing items",
    "delivery arranged",
    "delivery partial",
    "delivery completed",
    "delivery postponed",
    "ongoing delivery issue/s",
    "delivery exception",
  ];

  if (COLLECTION.includes(s)) return "mark-bg-pink";
  if (DELIVERY.includes(s)) return "mark-bg-blue";
  return "";
}

function isDeliveryFirst(status) {
  const s = String(status || "")
    .trim()
    .toLowerCase();
  return s.includes("delivery") || s.includes("processing");
}

function urgencyClass(u) {
  const v = String(u || "").toLowerCase();
  if (v === "urgent")
    return ["text-uppercase", "text-weight-bolder", "text-purple"];
  if (v === "express")
    return ["text-uppercase", "text-weight-bolder", "text-red"];
  return ["text-caption", "text-uppercase"];
}

function shouldShowCollectionForRow(allRows, rowItem, idx) {
  return idx === 0;
}

/* ------------------- UI Actions ------------------- */
const showAddPaymentDialog = ref(false);
const selectedPaymentOrder = ref(null);
const selectedPaymentCustomer = ref(null);
const showCreateOrderDialog = ref(false);

const COLLECTION_STATUSES = new Set([
  "collection arranged",
  "items with driver",
  "collection completed",
  "collection rescheduled",
  "collection cancelled",
  "ongoing collection issue/s",
]);
const DELIVERY_STATUSES = new Set([
  "processing items",
  "delivery arranged",
  "delivery partial",
  "delivery completed",
  "delivery postponed",
  "ongoing delivery issue/s",
]);
const openOrderTab = (order) => {
  window.open(`/orders/${order?.order_no}`, "_blank");
};
const openCustomerTab = (customerId) => {
  window.open(`/customers/${customerId}`, "_blank");
};
const openAddPaymentDialog = (rowOrder, rowCustomer) => {
  if (!rowOrder?.id)
    return $q.notify({
      type: "warning",
      message: "No order found. Create order first.",
    });
  selectedPaymentOrder.value = rowOrder;
  selectedPaymentCustomer.value = rowCustomer;
  showAddPaymentDialog.value = true;
};

const createOrder = (logistics) => {
  if (!logistics.customer) {
    $q.notify({ type: "warning", message: "No customer linked to this log." });
    return;
  }
  transactionStore.selectedCustomer = logistics.customer;
  transactionStore.logisticsId = logistics.id;
  showCreateOrderDialog.value = true;
};

const callViaPhone = (raw) =>
  openURL(`tel:${String(raw).replace(/[^\d+]/g, "")}`);
const callViaWhatsApp = (raw) =>
  openURL(`https://wa.me/${String(raw).replace(/\D/g, "")}`);

/* ------------------- Update Logistics Status ------------------- */
const showUpdateStatusDialog = ref(false);
const selectedLogisticsRow = ref(null);
const statusForm = ref({ status: null });
const savingStatus = ref(false);
const dialogStatusOptions = ref([]);

const baseLogisticsStatusOptions = computed(() => {
  return Array.from(
    new Set([...COLLECTION_STATUSES, ...DELIVERY_STATUSES])
  ).sort();
});
const toTitleCase = (input) => {
  const s = String(input || "")
    .trim()
    .toLowerCase();
  if (!s) return s;
  return s.replace(
    /([A-Za-zÀ-ÖØ-öø-ÿ])([A-Za-zÀ-ÖØ-öø-ÿ]*)/g,
    (_, f, rest) => f.toUpperCase() + rest
  );
};

function openUpdateStatusDialog(row) {
  selectedLogisticsRow.value = row || null;
  statusForm.value.status = row?.logistics_status || null;

  const base = baseLogisticsStatusOptions.value.map((s) => ({
    label: toTitleCase(s),
    value: s,
  }));
  if (
    row?.logistics_status &&
    !base.some((o) => o.value === row.logistics_status)
  ) {
    const v = String(row.logistics_status).trim().toLowerCase();
    base.unshift({ label: toTitleCase(v), value: v });
  }
  dialogStatusOptions.value = base;
  showUpdateStatusDialog.value = true;
}

async function saveLogisticsStatus() {
  if (!selectedLogisticsRow.value) return;
  const id =
    selectedLogisticsRow.value.logistics_id || selectedLogisticsRow.value.id;
  const newStatus = (statusForm.value.status || "").toString();
  if (!newStatus) return;
  try {
    savingStatus.value = true;
    await transactionStore.updateLogistics(id, { logistics_status: newStatus });
    selectedLogisticsRow.value.logistics_status = newStatus;
    $q.notify({ type: "positive", message: "Logistics status updated." });
    showUpdateStatusDialog.value = false;
  } catch (e) {
    console.error("Failed to update logistics status:", e);
    $q.notify({
      type: "negative",
      message: "Failed to update logistics status.",
    });
  } finally {
    savingStatus.value = false;
  }
}

/* ------------------- Update Goods Status (Order) ------------------- */
const goodsStatusOptions = ref([
  { label: "None", value: "none" },
  { label: "For Collection", value: "for collected" },
  { label: "Under Process", value: "under process" },
  { label: "Ready for Delivery", value: "ready for delivery" },
  { label: "Ongoing Issue/s", value: "ongoing issue/s" },
  { label: "Items Delivered", value: "Items Delivered" },
]);

const showUpdateGoodsDialog = ref(false);
const selectedGoodsOrder = ref(null);
const goodsForm = ref({ status: null });
const savingGoods = ref(false);

function openUpdateGoodsDialog(row) {
  selectedGoodsOrder.value = row || null;
  goodsForm.value.status =
    row?.goods_status || row?.order_production?.goods_status || null;
  showUpdateGoodsDialog.value = true;
}

async function saveGoodsStatus() {
  if (!selectedGoodsOrder.value) return;
  try {
    savingGoods.value = true;
    const productionId = selectedGoodsOrder.value?.order_production?.id;
    if (!productionId)
      throw new Error("Missing order_production.id on selected order");

    const newStatus = (goodsForm.value.status || "").toString();
    if (!newStatus) return;

    await transactionStore.updateProduction(productionId, {
      goods_status: newStatus,
    });

    if (selectedGoodsOrder.value.order_production) {
      selectedGoodsOrder.value.order_production.goods_status = newStatus;
    }
    selectedGoodsOrder.value.goods_status = newStatus;
    $q.notify({ type: "positive", message: "Goods status updated." });
    showUpdateGoodsDialog.value = false;
  } catch (err) {
    console.error("Failed to update goods status:", err);
    $q.notify({ type: "negative", message: "Failed to update goods status." });
  } finally {
    savingGoods.value = false;
  }
}

/* ------------------- Update Logistics (open dialog with forms) ------------------- */
const showUpdateLogisticsDialog = ref(false);

function openUpdateLogistics(logistics) {
  transactionStore.logisticsId =
    logistics?.logistics_id || logistics?.id || null;
  transactionStore.selectedCustomer = logistics?.customer || null;
  showUpdateLogisticsDialog.value = true;
}

function formatExceptionItem(item) {
  const unit = (item.order_transaction_items?.unit || "").toLowerCase();
  const q = item.quantity ?? 0;
  const p = item.pieces ?? 0;

  if (unit === "kg") return `${q} kg`;
  if (unit === "sqft") return `${q} sqft`;
  // If unit is generic (pc/pcs) and pieces > 1, show as 'set'
  if ((unit === "pc" || unit === "pcs" || unit === "") && p > 1) {
    return `${q} set`;
  }

  return `${q} qty (${p} pcs)`;
}
</script>
