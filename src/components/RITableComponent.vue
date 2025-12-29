<!-- src/components/RITableComponent.vue -->
<template>
  <div class="row-col-table">
    <!-- Header -->
    <div class="row row-col-header text-center items-center">
      <div class="col header-bordered flex flex-center">Order Details</div>
      <div class="col-5 header-bordered flex flex-center">Logistics Details</div>
      <div class="col header-bordered flex flex-center">Production Details</div>
      <div class="col header-bordered flex flex-center">Payment Status</div>
    </div>

    <!-- Empty -->
    <div
      v-if="filteredRows.length === 0"
      class="text-center text-grey q-pa-lg text-h6"
    >
      No orders found.
    </div>

    <!-- Rows -->
    <template v-else>
      <div
        v-for="(logistics, index) in filteredRows"
        :key="logistics.logistics_id || logistics.id || index"
      >
        <div
          v-for="(rowItem, idx) in ordersOrPlaceholder(logistics)"
          :key="`${logistics.logistics_id || logistics.id || index}-${rowKey(
            rowItem,
            idx
          )}`"
          class="row row-col-row line-height-1"
        >
          <!-- ORDER DETAILS -->
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
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Date:</span
              >
              <NotSetText :value="getOrderDate(rowItem.order || logistics.order)" />
            </div>

            <div>
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Urgency:</span
              >
              <span :class="urgencyClass(logistics.urgency)">
                {{ logistics.urgency || "default" }}
              </span>
            </div>

            <div>
              <span
                class="text-caption text-uppercase text-weight-bold q-mr-xs q-mr-xs"
              >
                Job Type:
              </span>
              <span class="text-weight-bold text-primary">
                <NotSetText :value="displayJobTypeLabel(logistics.job_type)" />
              </span>
            </div>

            <q-separator class="q-mt-sm" />
            <div class="mark-brown text-center text-uppercase">Customer Details</div>
            <q-separator class="q-mb-sm" />

            <div class="text-weight-bold q-mb-sm">
              <a
                @click.prevent="openCustomerTab(logistics.customer?.id)"
                class="text-weight-bold text-subtitle1 line-height-1"
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
                    <q-item-section avatar><q-icon name="call" /></q-item-section>
                    <q-item-section>Call via phone</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-ripple
                    @click="callViaWhatsApp(logistics.customer?.contact_no1)"
                  >
                    <q-item-section avatar><q-icon name="chat" /></q-item-section>
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
                    <q-item-section avatar><q-icon name="call" /></q-item-section>
                    <q-item-section>Call via phone</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-ripple
                    @click="callViaWhatsApp(logistics.customer?.contact_no2)"
                  >
                    <q-item-section avatar><q-icon name="chat" /></q-item-section>
                    <q-item-section>Call via WhatsApp</q-item-section>
                  </q-item>
                </q-list>
              </q-popup-proxy>
            </div>

            <div v-if="logistics.customer?.email">
              <span class="email-link" @click.stop>
                <NotSetText :value="logistics.customer?.email" />
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-list style="min-width: 220px">
                    <q-item
                      clickable
                      v-ripple
                      @click="composeEmail(logistics.customer?.email)"
                    >
                      <q-item-section avatar><q-icon name="email" /></q-item-section>
                      <q-item-section>Compose email</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-ripple
                      @click="copyEmail(logistics.customer?.email)"
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

          <!-- LOGISTICS DETAILS -->
          <div class="col-5 bordered" style="padding: 0">
            <div class="row justify-between q-mx-sm q-my-xs">
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
                style="border-style: solid; border-width: 1px; min-height: 100%"
              >
                <NotSetText :value="logistics.logistics_status" />
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
              <template
                v-if="
                  shouldShowCollectionForRow(
                    ordersOrPlaceholder(logistics),
                    rowItem,
                    idx
                  )
                "
              >
                <!-- Collection -->
                <div
                  class="col"
                  :style="{
                    order: isDeliveryFirst(logistics.logistics_status) ? 2 : 1,
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
                        class="text-caption text-uppercase text-weight-bold q-mr-xs"
                        >Date:</span
                      >
                      <span
                        :class="{
                          'mark-yellow text-weight-bolder':
                            toISODate(
                              logistics.collections?.[0]?.collection_date
                            ) === toISODate(selectedFilterDate),
                        }"
                      >
                        <NotSetText :value="getCollectionDate(logistics.collections)" />
                      </span>
                    </div>
                    <div>
                      <span
                        class="text-caption text-uppercase text-weight-bold q-mr-xs"
                        >Time:</span
                      >
                      <NotSetText :value="logistics.collections?.[0]?.collection_time" />
                    </div>
                    <div>
                      <span
                        class="text-caption text-uppercase text-weight-bold q-mr-xs"
                        >Driver:</span
                      >
                      <NotSetText :value="getDriverName(logistics.collections?.[0]?.driver_id)" />
                    </div>
                    <div>
                      <span
                        class="text-caption text-uppercase text-weight-bold q-mr-xs"
                        >Address:</span
                      >
                      <NotSetText :value="formatAddress(logistics.collections?.[0]?.address)" />
                    </div>
                  </div>

                  <q-separator />

                  <div class="q-pa-sm">
                    <div
                      class="text-caption text-uppercase text-weight-bold q-mr-xs"
                    >
                      Contact Person:
                    </div>
                    <div>
                      <NotSetText
                        :value="
                          logistics.collections?.[0]?.contact_person?.name ||
                          logistics.collections?.[0]?.customer_contact_persons
                            ?.name
                        "
                      />
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
                          <NotSetText :value="pickCollectionContact(logistics).phone1" />
                          <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-list style="min-width: 220px">
                              <q-item clickable v-ripple @click="callViaPhone(pickCollectionContact(logistics).phone1)">
                                <q-item-section avatar><q-icon name="call" /></q-item-section>
                                <q-item-section>Call via phone</q-item-section>
                              </q-item>
                              <q-item clickable v-ripple @click="callViaWhatsApp(pickCollectionContact(logistics).phone1)">
                                <q-item-section avatar><q-icon name="chat" /></q-item-section>
                                <q-item-section>Call via WhatsApp</q-item-section>
                              </q-item>
                            </q-list>
                          </q-popup-proxy>
                        </span>

                        <span v-if="pickCollectionContact(logistics).phone2"> / </span>

                        <span
                          v-if="pickCollectionContact(logistics).phone2"
                          class="phone-link"
                          @click.stop
                        >
                          <NotSetText :value="pickCollectionContact(logistics).phone2" />
                          <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-list style="min-width: 220px">
                              <q-item clickable v-ripple @click="callViaPhone(pickCollectionContact(logistics).phone2)">
                                <q-item-section avatar><q-icon name="call" /></q-item-section>
                                <q-item-section>Call via phone</q-item-section>
                              </q-item>
                              <q-item clickable v-ripple @click="callViaWhatsApp(pickCollectionContact(logistics).phone2)">
                                <q-item-section avatar><q-icon name="chat" /></q-item-section>
                                <q-item-section>Call via WhatsApp</q-item-section>
                              </q-item>
                            </q-list>
                          </q-popup-proxy>
                        </span>
                      </template>
                      <template v-else><NotSetText :value="null" /></template>
                    </div>

                    <div v-if="pickCollectionContact(logistics).email">
                      <span class="email-link" @click.stop>
                        <NotSetText :value="pickCollectionContact(logistics).email" />
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-list style="min-width: 220px">
                            <q-item clickable v-ripple @click="composeEmail(pickCollectionContact(logistics).email)">
                              <q-item-section avatar><q-icon name="email" /></q-item-section>
                              <q-item-section>Compose email</q-item-section>
                            </q-item>
                            <q-item clickable v-ripple @click="copyEmail(pickCollectionContact(logistics).email)">
                              <q-item-section avatar><q-icon name="content_copy" /></q-item-section>
                              <q-item-section>Copy email</q-item-section>
                            </q-item>
                          </q-list>
                        </q-popup-proxy>
                      </span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Delivery (exception-aware) -->
              <div
                class="col"
                :style="{
                  order: isDeliveryFirst(logistics.logistics_status) ? 1 : 2,
                  borderRight: isDeliveryFirst(logistics.logistics_status)
                    ? '1px solid #c09f8b'
                    : '',
                }"
              >
                <div class="text-uppercase text-weight-bolder text-blue text-center">
                  <div>Delivery</div>
                  <q-badge
                    v-if="rowItem.kind === 'exception'"
                    color="red"
                    flat
                    class="float-right text-weight-bold"
                  >
                    Exception
                  </q-badge>
                </div>

                <q-separator />

                <div class="q-pa-sm">
                  <div>
                    <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
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
                    <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
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
                    <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                      >Driver:</span
                    >
                    <NotSetText
                      :value="getDriverName(deliveryDriverIdForRow(rowItem, logistics))"
                    />
                  </div>

                  <div>
                    <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                      >Address:</span
                    >
                    <NotSetText :value="formatAddress(logistics.deliveries?.[0]?.address)" />
                  </div>
                </div>

                <q-separator />

                <div class="q-pa-sm">
                  <div class="text-caption text-uppercase text-weight-bold q-mr-xs">
                    Contact Person:
                  </div>
                  <div>
                    <NotSetText
                      :value="
                        logistics.deliveries?.[0]?.contact_person?.name ||
                        logistics.deliveries?.[0]?.customer_contact_persons
                          ?.name
                      "
                    />
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
                        <NotSetText :value="pickDeliveryContact(logistics).phone1" />
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-list style="min-width: 220px">
                            <q-item clickable v-ripple @click="callViaPhone(pickDeliveryContact(logistics).phone1)">
                              <q-item-section avatar><q-icon name="call" /></q-item-section>
                              <q-item-section>Call via phone</q-item-section>
                            </q-item>
                            <q-item clickable v-ripple @click="callViaWhatsApp(pickDeliveryContact(logistics).phone1)">
                              <q-item-section avatar><q-icon name="chat" /></q-item-section>
                              <q-item-section>Call via WhatsApp</q-item-section>
                            </q-item>
                          </q-list>
                        </q-popup-proxy>
                      </span>

                      <span v-if="pickDeliveryContact(logistics).phone2"> / </span>

                      <span
                        v-if="pickDeliveryContact(logistics).phone2"
                        class="phone-link"
                        @click.stop
                      >
                        <NotSetText :value="pickDeliveryContact(logistics).phone2" />
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-list style="min-width: 220px">
                            <q-item clickable v-ripple @click="callViaPhone(pickDeliveryContact(logistics).phone2)">
                              <q-item-section avatar><q-icon name="call" /></q-item-section>
                              <q-item-section>Call via phone</q-item-section>
                            </q-item>
                            <q-item clickable v-ripple @click="callViaWhatsApp(pickDeliveryContact(logistics).phone2)">
                              <q-item-section avatar><q-icon name="chat" /></q-item-section>
                              <q-item-section>Call via WhatsApp</q-item-section>
                            </q-item>
                          </q-list>
                        </q-popup-proxy>
                      </span>
                    </template>
                    <template v-else><NotSetText :value="null" /></template>

                    <div v-if="pickDeliveryContact(logistics).email" class="q-mt-xs">
                      <span class="email-link" @click.stop>
                        <NotSetText :value="pickDeliveryContact(logistics).email" />
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-list style="min-width: 220px">
                            <q-item clickable v-ripple @click="composeEmail(pickDeliveryContact(logistics).email)">
                              <q-item-section avatar><q-icon name="email" /></q-item-section>
                              <q-item-section>Compose email</q-item-section>
                            </q-item>
                            <q-item clickable v-ripple @click="copyEmail(pickDeliveryContact(logistics).email)">
                              <q-item-section avatar><q-icon name="content_copy" /></q-item-section>
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

            <q-separator />

            <div class="row justify-between q-mx-sm q-my-xs">
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

          <!-- PRODUCTION -->
          <div class="col bordered" style="padding-top: 0">
            <div class="row justify-between q-mx-sm q-my-xs">
              <div
                class="col flex flex-center text-weight-bold text-subtitle1 text-center line-height-1 text-uppercase"
                style="border-style: solid; border-width: 1px; min-height: 100%"
              >
                <NotSetText :value="(rowItem.order || logistics.order)?.goods_status" />
              </div>
              <div class="col-auto" v-if="rowItem.order || logistics.order">
                <q-icon
                  name="edit"
                  size="sm"
                  unelevated
                  class="cursor-pointer bg-primary text-white q-pa-xs"
                  role="button"
                  aria-label="UpdateGoodsStatus"
                  @click="openUpdateGoodsDialog(rowItem.order || logistics.order)"
                />
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <div v-if="logistics.collections?.[0]?.no_bags">
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Bags:</span
              >
              <NotSetText
                :value="
                  (logistics.collections?.[0]?.no_bags ?? null) === null
                    ? ''
                    : `${logistics.collections?.[0]?.no_bags}b`
                "
              />
            </div>

            <div v-if="(rowItem.order || logistics.order)?.order_production?.no_hangers">
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Hang:</span
              >
              <NotSetText
                :value="
                  ((rowItem.order || logistics.order)?.order_production?.no_hangers ??
                    null) === null
                    ? ''
                    : `${
                        (rowItem.order || logistics.order)?.order_production?.no_hangers
                      }h`
                "
              />
            </div>

            <div v-if="(rowItem.order || logistics.order)?.order_production?.no_packets">
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Pack:</span
              >
              <NotSetText
                :value="
                  ((rowItem.order || logistics.order)?.order_production?.no_packets ??
                    null) === null
                    ? ''
                    : `${
                        (rowItem.order || logistics.order)?.order_production?.no_packets
                      }p`
                "
              />
            </div>

            <div v-if="(rowItem.order || logistics.order)?.order_production?.no_rolls">
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Rolls:</span
              >
              <NotSetText
                :value="
                  ((rowItem.order || logistics.order)?.order_production?.no_rolls ??
                    null) === null
                    ? ''
                    : `${
                        (rowItem.order || logistics.order)?.order_production?.no_rolls
                      }r`
                "
              />
            </div>
          </div>

          <!-- PAYMENT -->
          <div class="col bordered" style="padding-top: 0">
            <div class="row justify-between q-mx-sm q-my-xs">
              <div
                class="col flex flex-center"
                :class="[
                  'text-weight-bold',
                  'text-subtitle1',
                  'text-center',
                  'line-height-1',
                  'text-uppercase',
                  (
                    (rowItem.order || logistics.order)?.payment_status || ''
                  ).toLowerCase() === 'paid'
                    ? 'mark-bg-green'
                    : (
                        (rowItem.order || logistics.order)?.payment_status || ''
                      ).toLowerCase() === 'unpaid'
                    ? 'mark-bg-red'
                    : '',
                ]"
                style="border-style: solid; border-width: 1px; min-height: 100%"
              >
                <NotSetText :value="(rowItem.order || logistics.order)?.payment_status" />
              </div>
              <div class="col-auto">
                <q-icon
                  name="add"
                  size="sm"
                  unelevated
                  class="cursor-pointer bg-primary text-white q-pa-xs"
                  role="button"
                  aria-label="UpdatePaymentStatus"
                  @click="openAddPaymentDialog(rowItem.order || logistics.order, logistics.customer)"
                />
              </div>
            </div>

            <div>
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Credits:</span
              >
              <span class="text-weight-bold">{{ getCustomerCredits(logistics.customer) }}</span>
            </div>

            <q-separator class="q-my-sm" />

            <div>
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Paid:</span
              >
              <span class="text-weight-bold">
                ${{ (rowItem.order || logistics.order)?.paid_amount ?? "0.00" }}
              </span>
            </div>
            <div>
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Balance:</span
              >
              <span class="text-red text-weight-bold">
                ${{ (rowItem.order || logistics.order)?.balance_amount ?? "0.00" }}
              </span>
            </div>
            <div>
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs"
                >Amount:</span
              >
              <span class="text-weight-bold">
                ${{ (rowItem.order || logistics.order)?.total_amount ?? "0.00" }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- ===================== DIALOGS (owned here) ====================== -->
  <UpdateLogisticsStatusDialog
    v-model:show="showUpdateStatusDialog"
    :logistics="selectedLogisticsRow"
    @saved="onLogisticsStatusSaved"
  />

  <UpdateGoodsStatusDialog
    v-model:show="showUpdateGoodsDialog"
    :order="selectedGoodsOrder"
    @saved="onGoodsSaved"
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
            <span class="text-subtitle1 text-uppercase text-weight-bold text-red-9">
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
    @saved="onPaymentSaved"
  />

  <q-dialog
    v-model="showCreateOrderDialog"
    persistent
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card style="min-width: 90vw">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">Create Order</div>
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
import { ref, computed, watch, onMounted, defineComponent, h } from "vue";
import { useQuasar, openURL, copyToClipboard } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";
import UpdateCollectionDialog from "@/components/dialogs/UpdateCollectionDialog.vue";
import UpdateDeliveryDialog from "@/components/dialogs/UpdateDeliveryDialog.vue";
import CreateOrderFromCollection from "@/views/CreateOrderFromCollection.vue";
import AddPaymentDialog from "@/components/dialogs/AddPaymentDialog.vue";
import UpdateGoodsStatusDialog from "@/components/dialogs/UpdateGoodsStatusDialog.vue";
import UpdateLogisticsStatusDialog from "@/components/dialogs/UpdateLogisticsStatusDialog.vue";
import { fetchItemsByGroup } from "@/../supabase/api/item_list.js";

const props = defineProps({
  rows: { type: Array, default: () => [] },
  selectedFilterDate: { type: [String, Date, null], default: null },
  deliveryExceptions: { type: Array, default: () => [] },
});

const $q = useQuasar();
const transactionStore = useTransactionStore();

function shouldShowCollectionForRow(allRows, rowItem, idx) {
  const hasNonException = (allRows || []).some((r) => r?.kind !== "exception");
  if (rowItem?.kind === "exception") return !hasNonException && idx === 0;
  const firstNonExceptionIndex = (allRows || []).findIndex(
    (r) => r?.kind !== "exception"
  );
  return idx === firstNonExceptionIndex;
}

// keep local cache
const allDeliveryExceptions = ref([...props.deliveryExceptions]);

watch(
  () => props.deliveryExceptions,
  (v) => {
    allDeliveryExceptions.value = Array.isArray(v) ? [...v] : [];
  },
  { deep: true, immediate: true }
);

onMounted(async () => {
  try {
    const data = await transactionStore.fetchDeliveryExceptions();
    allDeliveryExceptions.value = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("fetch failed:", e);
  }
});

const NotSetText = defineComponent({
  name: "NotSetText",
  props: {
    value: { type: [String, Number, Boolean, Object, null], default: null },
  },
  setup(p) {
    return () => {
      const raw = p.value;
      const str = (raw ?? "").toString().trim();
      if (str) return h("span", str);
      return h(
        "span",
        { class: "text-grey-6 text-uppercase text-caption" },
        "[not set]"
      );
    };
  },
});

/* ------------------- Helpers ------------------- */
const DRIVER_NOT_SET = "[NOT SET]";

const driverMapById = computed(() => {
  const m = new Map();
  (transactionStore.driverOptions || []).forEach((d) => {
    if (d?.id != null)
      m.set(String(d.id), (d.name || "").trim() || DRIVER_NOT_SET);
  });
  return m;
});

const getDriverName = (id) => driverMapById.value.get(String(id)) || "";

const toISODate = (d) => {
  if (!d) return null;
  if (typeof d === "string") {
    const m = d.match(/^\d{4}-\d{2}-\d{2}/);
    if (m) return m[0];
  }
  const dt = new Date(d);
  if (isNaN(dt)) return null;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getOrderDate = (t) => formatDate(t?.created_at);

const getCollectionDate = (t) => {
  let d = null;
  if (Array.isArray(t)) d = t?.[0]?.collection_date;
  else
    d =
      t?.collections?.[0]?.collection_date ||
      t?.collection_date ||
      t?.logistics_collections?.[0]?.collection_date;
  return d ? formatDate(d) : "";
};

const getDeliveryDate = (t) => {
  let d = null;
  if (Array.isArray(t)) d = t?.[0]?.delivery_date;
  else
    d =
      t?.deliveries?.[0]?.delivery_date ||
      t?.delivery_date ||
      t?.logistics_deliveries?.[0]?.delivery_date;
  return d ? formatDate(d) : "";
};

function deliveryDriverIdForRow(rowItem, logistics) {
  const mainId = logistics?.deliveries?.[0]?.driver_id ?? null;
  if (rowItem?.kind === "exception") {
    const exId = rowItem?.ex?.driver_id;
    return exId != null && exId !== "" ? exId : mainId;
  }
  return mainId;
}

function formatAddress(addr) {
  if (!addr) return "";
  const main = [addr.block_no, addr.road_name, addr.unit_no, addr.building_name]
    .map((v) => (v ?? "").toString().trim())
    .filter(Boolean)
    .join(" ");
  const postal = (addr.postal_code ?? "").toString().trim();
  const line = [main, postal].filter(Boolean).join(", ");
  const extra = [addr.additional_info, addr.remarks]
    .map((v) => (v ?? "").toString().trim())
    .filter(Boolean)
    .join(" — ");
  return (extra ? `${line} (${extra})` : line) || "";
}

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

function logisticsBadgeClass(status) {
  const s = String(status || "").trim().toLowerCase();
  if (COLLECTION_STATUSES.has(s)) return "mark-bg-pink";
  if (DELIVERY_STATUSES.has(s)) return "mark-bg-blue";
  return "";
}

const isDeliveryFirst = (status) => {
  const s = String(status || "").trim().toLowerCase();
  return DELIVERY_STATUSES.has(s) || s.startsWith("delivery");
};

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

/* ------------------- GROUPED exception rows (date + time + driver) ------------------- */
function exceptionGroupKey(ex) {
  const day = toISODate(ex?.delivery_date) || "";
  const time = String(ex?.delivery_time || "");
  const driver = String(ex?.driver_id ?? "");
  return `${day}__${time}__${driver}`;
}

const groupedExceptionsByLogisticsId = computed(() => {
  const byLog = new Map();

  for (const ex of allDeliveryExceptions.value || []) {
    const logId = ex?.logistics_id;
    if (logId == null) continue;
    const logKey = String(logId);

    const gKey = exceptionGroupKey(ex);
    if (!byLog.has(logKey)) byLog.set(logKey, new Map());

    const bucket = byLog.get(logKey);
    if (!bucket.has(gKey)) {
      bucket.set(gKey, {
        _key: gKey,
        logistics_id: logId,
        delivery_date: toISODate(ex?.delivery_date) || null,
        delivery_time: String(ex?.delivery_time || ""),
        driver_id: ex?.driver_id ?? null,
        rows: [],
        count: 0,
      });
    }
    const group = bucket.get(gKey);
    group.rows.push(ex);
    group.count++;
  }

  const out = new Map();
  for (const [logKey, groupsMap] of byLog.entries()) {
    const arr = Array.from(groupsMap.values());
    arr.sort((a, b) => {
      const da = new Date(a.delivery_date || 0).getTime();
      const db = new Date(b.delivery_date || 0).getTime();
      if (db !== da) return db - da;
      return String(b.delivery_time || "").localeCompare(
        String(a.delivery_time || "")
      );
    });
    out.set(logKey, arr);
  }
  return out;
});

function getDeliveryExceptionsFor(logistics) {
  const key = String(logistics?.logistics_id ?? logistics?.id ?? "");
  return key ? groupedExceptionsByLogisticsId.value.get(key) || [] : [];
}

/* ------------------- Row source builder ------------------- */
const ordersOrPlaceholder = (logistics) => {
  const base = (
    Array.isArray(logistics?.orders) && logistics.orders.length
      ? logistics.orders
      : [null]
  ).map((o) => ({
    kind: "order",
    order: o,
  }));

  const exc = getDeliveryExceptionsFor(logistics).map((group) => ({
    kind: "exception",
    order: logistics?.order || null,
    ex: {
      id: group._key,
      delivery_date: group.delivery_date,
      delivery_time: group.delivery_time,
      driver_id: group.driver_id,
      _count: group.count,
      _rows: group.rows,
      _key: group._key,
    },
  }));

  return [...base, ...exc];
};

const rowKey = (rowItem, idx) =>
  rowItem.kind === "exception"
    ? `exgrp-${rowItem.ex?._key ?? rowItem.ex?.id ?? idx}`
    : rowItem.order?.id ?? `placeholder-${idx}`;

const urgencyClass = (u) => {
  const v = String(u || "").toLowerCase();
  return [
    "text-uppercase",
    "text-weight-bolder",
    v === "urgent" ? "text-purple" : v === "express" ? "text-red" : "text-caption",
  ];
};

/* ------------------- Job Type UI labels + filtering ------------------- */
const JOB_TYPE_OPTIONS = [
  { label: "R&I", value: "ri" },
  { label: "R&I Quotation", value: "ri_quotation" },
  { label: "Installation ONLY", value: "installation" },
  { label: "Removal ONLY", value: "removal" },
  { label: "Onsite Carpet Cleaning", value: "onsite_carpet_cleaning" },
  { label: "Onsite Quotation", value: "onsite_quotation" },
  { label: "Onsite Sofa Cleaning", value: "onsite_sofa_cleaning" },
];

const JOB_TYPE_LABEL_BY_VALUE = new Map(
  JOB_TYPE_OPTIONS.map((o) => [o.value, o.label])
);

const ALLOWED_JOB_TYPES = new Set(JOB_TYPE_OPTIONS.map((o) => o.value));

const normalizeJobType = (v) => {
  const s = (v ?? "").toString().trim().toLowerCase();
  if (!s) return "";
  return s
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
};

const displayJobTypeLabel = (raw) => {
  const norm = normalizeJobType(raw);
  return JOB_TYPE_LABEL_BY_VALUE.get(norm) || raw || "";
};

const filteredRows = computed(() => {
  const list = Array.isArray(props.rows) ? props.rows : [];
  return list.filter((logistics) => {
    const jt = normalizeJobType(logistics?.job_type);
    return ALLOWED_JOB_TYPES.has(jt); // excludes laundry + others
  });
});

/* ------------------- Navigation / comms ------------------- */
const openOrderTab = (order) => {
  try {
    transactionStore.setOrderNo(order?.order_no);
    window.open(`/orders/${order?.order_no}`, "_blank");
  } catch (e) {
    console.error(e);
  }
};
const openCustomerTab = (customerId) =>
  window.open(`/customers/${customerId}`, "_blank");

const sanitizeForTel = (raw) => String(raw || "").replace(/[^\d+]/g, "");
const sanitizeForWhatsApp = (raw) => String(raw || "").replace(/\D/g, "");
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

/* ------------------- Dialogs ------------------- */
const showAddPaymentDialog = ref(false);
const selectedPaymentOrder = ref(null);
const selectedPaymentCustomer = ref(null);

function openAddPaymentDialog(rowOrder, rowCustomer) {
  if (!rowOrder?.id) {
    $q.notify({
      type: "warning",
      message: "No order attached to this row. Create an order first.",
    });
    return;
  }
  selectedPaymentOrder.value = rowOrder;
  selectedPaymentCustomer.value = rowCustomer || null;
  showAddPaymentDialog.value = true;
}

const showUpdateStatusDialog = ref(false);
const selectedLogisticsRow = ref(null);

function openUpdateStatusDialog(row) {
  selectedLogisticsRow.value = row || null;
  showUpdateStatusDialog.value = true;
}

function onLogisticsStatusSaved({ newStatus }) {
  if (selectedLogisticsRow.value)
    selectedLogisticsRow.value.logistics_status = newStatus;
  $q.notify({ type: "positive", message: "Logistics status updated." });
}

const showUpdateGoodsDialog = ref(false);
const selectedGoodsOrder = ref(null);

function openUpdateGoodsDialog(row) {
  selectedGoodsOrder.value = row || null;
  showUpdateGoodsDialog.value = true;
}

function onGoodsSaved({ patch, orderNo }) {
  if (!selectedGoodsOrder.value) return;
  selectedGoodsOrder.value.goods_status = patch.goods_status;
  if (selectedGoodsOrder.value.order_production) {
    selectedGoodsOrder.value.order_production.goods_status =
      patch.order_production.goods_status;
  } else {
    selectedGoodsOrder.value.order_production = patch.order_production;
  }

  $q.notify({
    type: "positive",
    message: `Goods status updated${orderNo ? ` for Order ${orderNo}.` : "."}`,
  });

  showUpdateGoodsDialog.value = false;
}

const showUpdateLogisticsDialog = ref(false);

function openUpdateLogistics(logistics) {
  transactionStore.logisticsId =
    logistics?.logistics_id || logistics?.id || null;
  transactionStore.selectedCustomer = logistics?.customer || null;
  showUpdateLogisticsDialog.value = true;
}

const getCustomerCredits = (customer) => {
  const credits = Array.isArray(customer?.customer_credits)
    ? customer?.customer_credits?.[0]
    : customer?.customer_credits;
  const online = parseFloat(credits?.online_package ?? "0") || 0;
  const other = parseFloat(credits?.other_credits ?? "0") || 0;
  return `$${(online + other).toFixed(2)}`;
};

const showCreateOrderDialog = ref(false);

// -------- Driver resolvers --------
const findLocalDriver = (id) => {
  if (!id) return null;
  const idStr = String(id);
  return (
    (transactionStore.driverOptions || []).find((d) => String(d.id) === idStr) ||
    null
  );
};

const fetchProfilesByIds = async (ids = []) => {
  if (!ids.length) return [];
  if (typeof transactionStore.fetchProfilesByIds === "function")
    return await transactionStore.fetchProfilesByIds(ids);
  if (typeof transactionStore.fetchProfileById === "function") {
    const out = [];
    for (const id of ids) {
      const p = await transactionStore.fetchProfileById(id);
      if (p) out.push(p);
    }
    return out;
  }
  return [];
};

const resolveDriverProfiles = async (collectionDriverId, deliveryDriverId) => {
  const needIds = [collectionDriverId, deliveryDriverId]
    .filter((v) => v != null)
    .map((v) => String(v));

  const local = new Map();
  for (const id of needIds) {
    const d = findLocalDriver(id);
    if (d) local.set(id, d);
  }

  const missing = needIds.filter((id) => !local.has(id));
  const fetched = missing.length ? await fetchProfilesByIds(missing) : [];
  const fetchedMap = new Map((fetched || []).map((p) => [String(p.id), p]));

  return {
    collection:
      collectionDriverId != null
        ? local.get(String(collectionDriverId)) ||
          fetchedMap.get(String(collectionDriverId)) ||
          null
        : null,
    delivery:
      deliveryDriverId != null
        ? local.get(String(deliveryDriverId)) ||
          fetchedMap.get(String(deliveryDriverId)) ||
          null
        : null,
  };
};

const createOrder = async (logistics) => {
  if (!logistics) return;

  transactionStore.resetTransactionItems();
  transactionStore.selectedCustomer = logistics.customer || null;
  transactionStore.logisticsId = logistics.logistics_id || logistics.id || null;

  const pricingGroupId =
    logistics?.customer?.pricing_group_id ??
    logistics?.customer?.pricing_group?.id ??
    transactionStore.selectedCustomer?.pricing_group_id ??
    transactionStore.selectedCustomer?.pricing_group?.id ??
    null;

  if (!pricingGroupId) {
    $q.notify({
      type: "warning",
      message: "Customer has no pricing group. Using empty item list.",
    });
  }

  try {
    const items = pricingGroupId ? await fetchItemsByGroup(pricingGroupId) : [];
    transactionStore.pricingGroupId = pricingGroupId;
    if (typeof transactionStore.setItemCatalog === "function")
      transactionStore.setItemCatalog(items);
    else if ("pricingItems" in transactionStore) transactionStore.pricingItems = items;
    else transactionStore.itemCatalog = items;
  } catch (err) {
    console.error("Failed to load items by pricing group:", err);
    $q.notify({
      type: "negative",
      message: "Failed to load items for this customer.",
    });
  }

  const collection =
    Array.isArray(logistics.collections) && logistics.collections.length
      ? logistics.collections[0]
      : logistics.collection_date || logistics.collection_time || logistics.address
      ? logistics
      : null;

  const delivery =
    Array.isArray(logistics.deliveries) && logistics.deliveries.length
      ? logistics.deliveries[0]
      : logistics.delivery_date || logistics.delivery_time || logistics.address
      ? logistics
      : null;

  const collectionDriverId = collection?.driver_id ?? null;
  const deliveryDriverId = delivery?.driver_id ?? null;

  const { collection: collectionDriverProfile, delivery: deliveryDriverProfile } =
    await resolveDriverProfiles(collectionDriverId, deliveryDriverId);

  if (collection) {
    const cp = collection.contact_person || collection.customer_contact_persons || null;
    transactionStore.selectedCollectionContact = cp;
    transactionStore.selectedCollectionAddress = collection.address || null;

    transactionStore.selectedCollectionDriver = collectionDriverProfile
      ? collectionDriverProfile
      : collection.driver_name
      ? { id: collectionDriverId, name: collection.driver_name }
      : null;

    transactionStore.collectionDate = collection.collection_date || null;
    transactionStore.collectionTime = collection.collection_time || null;
    transactionStore.collectionRemarks = collection.remarks || null;
    transactionStore.collectionNoBags = collection.no_bags || null;
  }

  if (delivery) {
    const dp = delivery.contact_person || delivery.customer_contact_persons || null;
    transactionStore.selectedDeliveryContact = dp;
    transactionStore.selectedDeliveryAddress = delivery.address || null;

    transactionStore.selectedDeliveryDriver = deliveryDriverProfile
      ? deliveryDriverProfile
      : delivery.driver_name
      ? { id: deliveryDriverId, name: delivery.driver_name }
      : null;

    transactionStore.deliveryDate = delivery.delivery_date || null;
    transactionStore.deliveryTime = delivery.delivery_time || null;
    transactionStore.deliveryRemarks = delivery.remarks || null;
  }

  try {
    await transactionStore.generateOrderNo();
  } catch (e) {
    console.error("Failed to generate Order No:", e);
    $q.notify({ type: "negative", message: "Failed to generate Order No." });
  }

  showCreateOrderDialog.value = true;
};

/* -------- Payment patch -------- */
function applyPaymentPatch(patch) {
  const o = selectedPaymentOrder.value;
  if (!o) return;
  o.order_payment = { ...(o.order_payment || {}), ...(patch.order_payment || {}) };
  o.paid_amount = patch.paid_amount ?? o.paid_amount;
  o.balance_amount = patch.balance_amount ?? o.balance_amount;
  o.payment_status = patch.payment_status ?? o.payment_status;
}

function onPaymentSaved({ patch, paidNow, orderNo }) {
  applyPaymentPatch(patch);
  showAddPaymentDialog.value = false;
  const prettyAmt = (Number(paidNow) || 0).toFixed(2);
  $q.notify({
    type: "positive",
    message: `Paid $${prettyAmt} successfully for ${orderNo ? `Order ${orderNo}` : "this order"}.`,
  });
}
</script>
