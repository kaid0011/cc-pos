<!-- =======================================================================
     src/components/LogisticsTableComponent.vue
     Smart table: renders logistics rows + owns all update dialogs/actions.
     ======================================================================= -->
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
    <div v-if="rows.length === 0" class="text-center text-grey q-pa-lg text-h6">
      No orders found.
    </div>

    <!-- Rows -->
    <template v-else>
      <div v-for="(logistics, index) in rows" :key="logistics.logistics_id || logistics.id || index">
        <div
          v-for="(order, idx) in ordersOrPlaceholder(logistics)"
          :key="`${logistics.logistics_id || logistics.id || index}-${order?.id ?? 'placeholder'}-${idx}`"
          class="row row-col-row line-height-1"
        >
          <!-- ORDER DETAILS -->
          <div class="col bordered">
            <div class="q-mb-xs">
              <div v-if="order?.order_no || logistics.order?.order_no">
                <q-btn
                  outline color="blue-8" dense
                  @click="openOrderTab(order || logistics.order)"
                  class="text-weight-bold bg-blue-1 text-subtitle1 q-px-sm"
                >
                  {{ order?.order_no || logistics.order?.order_no }}
                </q-btn>
              </div>
              <div v-else>
                <q-btn dense label="Create Order" color="primary" unelevated class="q-px-sm"
                       @click="createOrderFromLogistics(logistics)" />
              </div>
            </div>

            <div>
              <span class="text-caption text-uppercase text-weight-bold">Date:</span>
              {{ getOrderDate(order || logistics.order) }}
            </div>

            <div>
              <span class="text-caption text-uppercase text-weight-bold">Urgency:</span>
              <span :class="urgencyClass(logistics.urgency)">{{ logistics.urgency || 'default' }}</span>
            </div>

            <q-separator class="q-mt-sm" />
            <div class="mark-brown text-center text-uppercase">Customer Details</div>
            <q-separator class="q-mb-sm" />

            <div class="text-weight-bold q-mb-sm">
              <a @click.prevent="openCustomerTab(logistics.customer?.id)"
                 class="text-weight-bold text-subtitle1 line-height-1">
                {{ logistics.customer?.name || '[NOT SELECTED]' }}
              </a>
            </div>

            <div class="phone-link" @click.stop>
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
            </div>

            <div v-if="logistics.customer?.contact_no2" class="phone-link" @click.stop>
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
            </div>

            <div v-if="logistics.customer?.email">
              <span class="email-link" @click.stop>
                {{ logistics.customer?.email }}
                <q-popup-proxy transition-show="scale" transition-hide="scale">
                  <q-list style="min-width: 220px">
                    <q-item clickable v-ripple @click="composeEmail(logistics.customer?.email)">
                      <q-item-section avatar><q-icon name="email" /></q-item-section>
                      <q-item-section>Compose email</q-item-section>
                    </q-item>
                    <q-item clickable v-ripple @click="copyEmail(logistics.customer?.email)">
                      <q-item-section avatar><q-icon name="content_copy" /></q-item-section>
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
              <div class="col flex flex-center"
                   :class="['text-weight-bold','text-subtitle1','text-center','line-height-1','text-uppercase', logisticsBadgeClass(logistics.logistics_status)]"
                   style="border-style: solid; border-width: 1px; min-height: 100%;">
                {{ logistics.logistics_status }}
              </div>
              <div class="col-auto">
                <q-icon name="edit" size="sm" unelevated class="cursor-pointer bg-primary text-white q-pa-xs"
                        role="button" aria-label="UpdateLogStatus"
                        @click="openUpdateStatusDialog(logistics)" />
              </div>
            </div>

            <q-separator />

            <div class="row" style="min-height: auto">
              <!-- Collection -->
              <div class="col"
                   :style="{
                     order: isDeliveryFirst(logistics.logistics_status) ? 2 : 1,
                     borderRight: isDeliveryFirst(logistics.logistics_status) ? '' : '1px solid #c09f8b'
                   }">
                <div class="text-uppercase text-weight-bolder text-pink-4 text-center">Collection</div>
                <q-separator />
                <div class="q-pa-sm">
                  <div>
                    <span class="text-caption text-uppercase text-weight-bold">Date:</span>
                    <span :class="{'mark-yellow text-weight-bolder': toISODate(logistics.collections?.[0]?.collection_date) === toISODate(selectedFilterDate)}">
                      {{ getCollectionDate(logistics.collections) }}
                    </span>
                  </div>
                  <div><span class="text-caption text-uppercase text-weight-bold">Time:</span> {{ logistics.collections?.[0]?.collection_time || '-' }}</div>
                  <div>
                    <span class="text-caption text-uppercase text-weight-bold">Driver:</span>
                    <span :class="{'mark-yellow text-weight-bolder': String(logistics.collections?.[0]?.driver_id ?? '') === String(activeDriverTab)}">
                      {{ getDriverName(logistics.collections?.[0]?.driver_id) || '-' }}
                    </span>
                  </div>
                  <div><span class="text-caption text-uppercase text-weight-bold">Address: </span>{{ formatAddress(logistics.collections?.[0]?.address) }}</div>
                </div>

                <q-separator />
                <div class="q-pa-sm">
                  <div class="text-caption text-uppercase text-weight-bold">Contact Person:</div>
                  <div>
                    {{
                      logistics.collections?.[0]?.contact_person?.name ||
                      logistics.collections?.[0]?.customer_contact_persons?.name ||
                      '[NOT SET]'
                    }}
                  </div>
                  <div>
                    <template v-if="pickCollectionContact(logistics).phone1 || pickCollectionContact(logistics).phone2">
                      <span v-if="pickCollectionContact(logistics).phone1" class="phone-link" @click.stop>
                        {{ pickCollectionContact(logistics).phone1 }}
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
                      <span v-if="pickCollectionContact(logistics).phone2" class="phone-link" @click.stop>
                        {{ pickCollectionContact(logistics).phone2 }}
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
                    <template v-else> - </template>
                  </div>
                  <div v-if="pickCollectionContact(logistics).email">
                    <span class="email-link" @click.stop>
                      {{ pickCollectionContact(logistics).email }}
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

              <!-- Delivery -->
              <div class="col"
                   :style="{
                     order: isDeliveryFirst(logistics.logistics_status) ? 1 : 2,
                     borderRight: isDeliveryFirst(logistics.logistics_status) ? '1px solid #c09f8b' : ''
                   }">
                <div class="text-uppercase text-weight-bolder text-blue text-center">Delivery</div>
                <q-separator />
                <div class="q-pa-sm">
                  <div>
                    <span class="text-caption text-uppercase text-weight-bold">Date:</span>
                    <span :class="{'mark-yellow text-weight-bolder': toISODate(logistics.deliveries?.[0]?.delivery_date) === toISODate(selectedFilterDate)}">
                      {{ getDeliveryDate(logistics.deliveries) }}
                    </span>
                  </div>
                  <div><span class="text-caption text-uppercase text-weight-bold">Time: </span>{{ logistics.deliveries?.[0]?.delivery_time || '-' }}</div>
                  <div>
                    <span class="text-caption text-uppercase text-weight-bold">Driver:</span>
                    <span :class="{'mark-yellow text-weight-bolder': String(logistics.deliveries?.[0]?.driver_id ?? '') === String(activeDriverTab)}">
                      {{ getDriverName(logistics.deliveries?.[0]?.driver_id) || '-' }}
                    </span>
                  </div>
                  <div><span class="text-caption text-uppercase text-weight-bold">Address: </span>{{ formatAddress(logistics.deliveries?.[0]?.address) }}</div>
                </div>

                <q-separator />
                <div class="q-pa-sm">
                  <div class="text-caption text-uppercase text-weight-bold">Contact Person:</div>
                  <div>
                    {{
                      logistics.deliveries?.[0]?.contact_person?.name ||
                      logistics.deliveries?.[0]?.customer_contact_persons?.name ||
                      '[NOT SET]'
                    }}
                  </div>
                  <div>
                    <template v-if="pickDeliveryContact(logistics).phone1 || pickDeliveryContact(logistics).phone2">
                      <span v-if="pickDeliveryContact(logistics).phone1" class="phone-link" @click.stop>
                        {{ pickDeliveryContact(logistics).phone1 }}
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
                      <span v-if="pickDeliveryContact(logistics).phone2" class="phone-link" @click.stop>
                        {{ pickDeliveryContact(logistics).phone2 }}
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
                    <template v-else> - </template>

                    <div v-if="pickDeliveryContact(logistics).email">
                      <span class="email-link" @click.stop>
                        {{ pickDeliveryContact(logistics).email }}
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
                dense unelevated color="primary" icon="edit_note" label="Update Logistics" class="full-width"
                @click="openUpdateLogistics(logistics)"
              />
            </div>
          </div>

          <!-- PRODUCTION -->
          <div class="col bordered" style="padding-top: 0">
            <div class="row justify-between q-mx-sm q-my-xs">
              <div class="col flex flex-center text-weight-bold text-subtitle1 text-center line-height-1 text-uppercase"
                   style="border-style: solid; border-width: 1px; min-height: 100%;">
                {{ order?.goods_status || logistics.order?.goods_status || '-' }}
              </div>
              <div class="col-auto" v-if="order || logistics.order">
                <q-icon name="edit" size="sm" unelevated class="cursor-pointer bg-primary text-white q-pa-xs"
                        role="button" aria-label="UpdateGoodsStatus"
                        @click="openUpdateGoodsDialog(order || logistics.order)" />
              </div>
            </div>

            <div>
              <span class="text-caption text-uppercase text-weight-bold">Ready By:</span>
              {{ formatDate(order?.order_production?.ready_by || logistics.order?.order_production?.ready_by) || '-' }}
            </div>

            <q-separator class="q-my-sm" />

            <div v-if="logistics.collections?.[0]?.no_bags">
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs">Bags: </span>
              {{ logistics.collections?.[0]?.no_bags || '-' }}b
            </div>
            <div v-if="order?.order_production?.no_hangers || logistics.order?.order_production?.no_hangers">
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs">Hang:</span>
              {{ order?.order_production?.no_hangers || logistics.order?.order_production?.no_hangers || '-' }}h
            </div>
            <div v-if="order?.order_production?.no_packets || logistics.order?.order_production?.no_packets">
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs">Pack:</span>
              {{ order?.order_production?.no_packets || logistics.order?.order_production?.no_packets || '-' }}p
            </div>
            <div v-if="order?.order_production?.no_rolls || logistics.order?.order_production?.no_rolls">
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs">Rolls:</span>
              {{ order?.order_production?.no_rolls || logistics.order?.order_production?.no_rolls || '-' }}r
            </div>
          </div>

          <!-- PAYMENT -->
          <div class="col bordered" style="padding-top: 0">
            <div class="row justify-between q-mx-sm q-my-xs">
              <div class="col flex flex-center"
                   :class="[
                     'text-weight-bold','text-subtitle1','text-center','line-height-1','text-uppercase',
                     ((order?.payment_status || logistics.order?.payment_status || '')).toLowerCase() === 'paid'
                       ? 'mark-bg-green'
                       : ((order?.payment_status || logistics.order?.payment_status || '')).toLowerCase() === 'unpaid'
                       ? 'mark-bg-red'
                       : '',
                   ]"
                   style="border-style: solid; border-width: 1px; min-height: 100%;">
                {{ order?.payment_status || logistics.order?.payment_status || '-' }}
              </div>
              <div class="col-auto">
                <q-icon name="add" size="sm" unelevated class="cursor-pointer bg-primary text-white q-pa-xs"
                        role="button" aria-label="UpdateLogStatus"
                        @click="openAddPaymentDialog(order || logistics.order, logistics.customer)" />
              </div>
            </div>

            <div>
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs">Credits:</span>
              <span class="text-weight-bold">{{ getCustomerCredits(logistics.customer) }}</span>
            </div>

            <q-separator class="q-my-sm" />

            <div>
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs">Paid:</span>
              <span class="text-weight-bold">
                ${{ order?.paid_amount ?? logistics.order?.paid_amount ?? '0.00' }}
              </span>
            </div>
            <div>
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs">Balance:</span>
              <span class="text-red text-weight-bold">
                ${{ order?.balance_amount ?? logistics.order?.balance_amount ?? '0.00' }}
              </span>
            </div>
            <div>
              <span class="text-caption text-uppercase text-weight-bold q-mr-xs">Amount:</span>
              <span class="text-weight-bold">
                ${{ order?.total_amount ?? logistics.order?.total_amount ?? '0.00' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- ===================== DIALOGS (owned here) ====================== -->

  <!-- Update Logistics Status -->
  <q-dialog v-model="showUpdateStatusDialog">
    <q-card style="min-width: 400px">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">Update Logistics Status</div>
        <q-btn icon="close" flat dense round class="absolute-top-right q-ma-sm" @click="showUpdateStatusDialog=false" />
      </q-card-section>
      <q-card-section>
        <q-select
          v-model="statusForm.status"
          :options="dialogStatusOptions"
          label="Select logistics status"
          outlined dense emit-value map-options option-label="label" option-value="value" clearable
          :disable="savingStatus"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" :disable="savingStatus" @click="showUpdateStatusDialog=false" />
        <q-btn color="primary" label="Save" :loading="savingStatus"
               :disable="!statusForm.status || statusForm.status === (selectedLogisticsRow?.logistics_status || null)"
               @click="saveLogisticsStatus" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Update Goods Status -->
  <q-dialog v-model="showUpdateGoodsDialog">
    <q-card style="min-width: 400px">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">Update Goods Status</div>
        <q-btn icon="close" flat dense round class="absolute-top-right q-ma-sm" @click="showUpdateGoodsDialog=false" />
      </q-card-section>
      <q-card-section>
        <q-select
          v-model="goodsForm.status"
          :options="goodsStatusOptions"
          label="Select goods status"
          outlined dense emit-value map-options option-label="label" option-value="value" clearable
          :disable="savingGoods"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" :disable="savingGoods" @click="showUpdateGoodsDialog=false" />
        <q-btn color="primary" label="Save" :loading="savingGoods"
               :disable="!goodsForm.status || goodsForm.status === (selectedGoodsOrder?.goods_status || selectedGoodsOrder?.order_production?.goods_status || null)"
               @click="saveGoodsStatus" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Update Logistics (Collection + Delivery) -->
  <q-dialog v-model="showUpdateLogisticsDialog" persistent transition-show="slide-down" transition-hide="slide-up">
    <q-card style="min-width: 90vw">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">Update Collection and Delivery</div>
        <q-btn icon="close" flat dense round class="absolute-top-right q-ma-sm" @click="showUpdateLogisticsDialog=false" />
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

  <!-- Add Payment -->
  <q-dialog v-model="showAddPaymentDialog">
    <q-card style="min-width: 1000px">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">Add Payment</div>
        <q-btn icon="close" flat dense round class="absolute-top-right q-ma-sm" @click="showAddPaymentDialog=false" />
      </q-card-section>

      <q-card-section class="dialog-body text-subtitle1">
        <div class="row text-center">
          <div class="col all-border text-uppercase">
            <div>Paid</div>
            <div class="text-weight-bolder text-uppercase text-h6 text-green-9">
              ${{ displayPaid.toFixed(2) }}
            </div>
          </div>
          <div class="col all-border text-uppercase">
            <div>Unpaid</div>
            <div class="text-weight-bolder text-uppercase text-h6 text-red-9">
              ${{ displayUnpaid.toFixed(2) }}
            </div>
          </div>
          <div class="col all-border text-uppercase">
            <div>Total Amount</div>
            <div class="text-weight-bolder text-uppercase text-h6">
              ${{ displayTotal.toFixed(2) }}
            </div>
          </div>
        </div>

        <q-separator class="q-my-sm" />

        <q-banner v-if="selectedPaymentType === 'Online Package Credits'" class="bg-yellow-1 q-my-sm" rounded>
          <q-icon name="account_balance_wallet" class="q-mr-sm" />
          Customer Credit Available:
          <span class="text-weight-bolder text-subtitle1 q-ml-xs">
            ${{ (totalCredits || 0).toFixed(2) }}
          </span>
        </q-banner>

        <div class="row q-col-gutter-x-md">
          <div class="col-6">
            <div class="dialog-label">Payment Type<span class="dialog-asterisk">*</span></div>
            <q-select v-model="selectedPaymentType" :options="paymentTypes" outlined dense class="dialog-inputs"
                      :rules="[(val) => !!val || 'Payment Type is required']" />
          </div>
          <div class="col-6">
            <div class="dialog-label">Payment Amount<span class="dialog-asterisk">*</span></div>
            <q-input v-model.number="paymentAmount" type="number" outlined dense class="dialog-inputs q-pb-xs"
                     :rules="[(val)=>!!val || 'Payment Amount is required',(val)=>val>0 || 'Must be greater than 0']" />
            <div v-if="selectedPaymentType==='Bank Transfer' || selectedPaymentType==='Cheque'">
              <div class="dialog-label q-mb-xs">Reference No.<span class="dialog-asterisk">*</span></div>
              <q-input v-model="referenceNo" type="text" outlined dense class="dialog-inputs"
                       placeholder="Enter bank transfer reference number"
                       :rules="[(val)=>!!val || 'Reference number is required']" />
            </div>
          </div>
        </div>

        <div class="q-mb-sm">
          <div class="dialog-label q-mb-xs">Remarks</div>
          <q-input v-model="creditRemarks" type="textarea" outlined dense class="dialog-inputs" />
        </div>

        <q-btn unelevated color="primary" label="Add Payment" class="full-width q-my-sm" @click="addPayment" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useQuasar, openURL, copyToClipboard } from 'quasar';
import { useTransactionStore } from '@/stores/transactionStore';
import UpdateCollectionDialog from '@/components/dialogs/UpdateCollectionDialog.vue';
import UpdateDeliveryDialog from '@/components/dialogs/UpdateDeliveryDialog.vue';

const props = defineProps({
  rows: { type: Array, default: () => [] },       
  selectedFilterDate: { type: [String, Date, null], default: null },
});

const safeRows = computed(() => (Array.isArray(props.rows) ? props.rows : []));

const $q = useQuasar();
const transactionStore = useTransactionStore();

/* ------------------- Helpers (encapsulated) ------------------- */
const DRIVER_NOT_SET = '[NOT SET]';

const driverMapById = computed(() => {
  const m = new Map();
  (transactionStore.driverOptions || []).forEach((d) => {
    if (d?.id != null) m.set(String(d.id), (d.name || '').trim() || DRIVER_NOT_SET);
  });
  return m;
});
const getDriverName = (id) => driverMapById.value.get(String(id)) || DRIVER_NOT_SET;

const toISODate = (d) => {
  if (!d) return null;
  if (typeof d === 'string') {
    const m = d.match(/^\d{4}-\d{2}-\d{2}/);
    if (m) return m[0];
  }
  const dt = new Date(d);
  if (isNaN(dt)) return null;
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
  });
};
const getOrderDate = (t) => formatDate(t?.created_at);

const getCollectionDate = (t) => {
  let d = null;
  if (Array.isArray(t)) d = t?.[0]?.collection_date;
  else d = t?.collections?.[0]?.collection_date || t?.collection_date || t?.logistics_collections?.[0]?.collection_date;
  return d ? formatDate(d) : '-';
};
const getDeliveryDate = (t) => {
  let d = null;
  if (Array.isArray(t)) d = t?.[0]?.delivery_date;
  else d = t?.deliveries?.[0]?.delivery_date || t?.delivery_date || t?.logistics_deliveries?.[0]?.delivery_date;
  return d ? formatDate(d) : '-';
};

const COLLECTION_STATUSES = new Set(['collection arranged', 'collection completed', 'collection rescheduled', 'collection cancelled']);
const DELIVERY_STATUSES = new Set(['delivery arranged', 'delivery completed', 'delivery postponed', 'delivery partial']);

function logisticsBadgeClass(status) {
  const s = String(status || '').trim().toLowerCase();
  if (COLLECTION_STATUSES.has(s)) return 'mark-bg-pink';
  if (DELIVERY_STATUSES.has(s)) return 'mark-bg-blue';
  return '';
}
const isDeliveryFirst = (status) => {
  const s = String(status || '').trim().toLowerCase();
  if (DELIVERY_STATUSES.has(s) || s.startsWith('delivery')) return true;
  return false;
};

function formatAddress(addr) {
  if (!addr) return '-';
  const main = [addr.block_no, addr.road_name, addr.unit_no, addr.building_name]
    .map((v) => (v ?? '').toString().trim()).filter(Boolean).join(' ');
  const postal = (addr.postal_code ?? '').toString().trim();
  const line = [main, postal].filter(Boolean).join(', ');
  const extra = [addr.additional_info, addr.remarks]
    .map((v) => (v ?? '').toString().trim()).filter(Boolean).join(' — ');
  return extra ? `${line} (${extra})` : line || '-';
}

const pickCollectionContact = (logistics) => {
  const src = logistics?.collections?.[0]?.contact_person || logistics?.collections?.[0]?.customer_contact_persons || {};
  return { phone1: src.contact_no1 || '', phone2: src.contact_no2 || '', email: src.email || '' };
};
const pickDeliveryContact = (logistics) => {
  const src = logistics?.deliveries?.[0]?.contact_person || logistics?.deliveries?.[0]?.customer_contact_persons || {};
  return { phone1: src.contact_no1 || '', phone2: src.contact_no2 || '', email: src.email || '' };
};

const ordersOrPlaceholder = (logistics) =>
  Array.isArray(logistics?.orders) && logistics.orders.length > 0 ? logistics.orders : [null];

const urgencyClass = (u) => {
  const v = String(u || '').toLowerCase();
  return ['text-uppercase','text-weight-bolder', v === 'urgent' ? 'text-purple' : v === 'express' ? 'text-red' : 'text-caption'];
};

/* ------------------- Navigation / comms ------------------- */
const openOrderTab = (order) => {
  try { transactionStore.setOrderNo(order?.order_no); window.open(`/orders/${order?.order_no}`, '_blank'); }
  catch (e) { console.error(e); }
};
const openCustomerTab = (customerId) => window.open(`/customers/${customerId}`, '_blank');

const sanitizeForTel = (raw) => String(raw || '').replace(/[^\d+]/g, '');
const sanitizeForWhatsApp = (raw) => String(raw || '').replace(/\D/g, '');
const sanitizeEmail = (raw) => String(raw || '').trim();

const callViaPhone = (raw) => { const tel = sanitizeForTel(raw); if (tel) openURL(`tel:${tel}`); };
const callViaWhatsApp = (raw) => { const wa = sanitizeForWhatsApp(raw); if (wa) openURL(`https://wa.me/${wa}`); };
const composeEmail = (raw) => { const email = sanitizeEmail(raw); if (email) openURL(`mailto:${email}`); };
const copyEmail = async (raw) => { const email = sanitizeEmail(raw); if (!email) return;
  try { await copyToClipboard(email); $q.notify({ type:'positive', message:'Email copied' }); }
  catch { $q.notify({ type:'negative', message:'Copy failed' }); }
};

/* ------------------- Update Logistics Status ------------------- */
const showUpdateStatusDialog = ref(false);
const selectedLogisticsRow = ref(null);
const statusForm = ref({ status: null });
const savingStatus = ref(false);
const dialogStatusOptions = ref([]);

const baseLogisticsStatusOptions = computed(() => {
  return Array.from(new Set([...COLLECTION_STATUSES, ...DELIVERY_STATUSES])).sort();
});
const toTitleCase = (input) => {
  const s = String(input || '').trim().toLowerCase();
  if (!s) return s;
  return s.replace(/([A-Za-zÀ-ÖØ-öø-ÿ])([A-Za-zÀ-ÖØ-öø-ÿ]*)/g, (_, f, rest) => f.toUpperCase() + rest);
};

function openUpdateStatusDialog(row) {
  selectedLogisticsRow.value = row || null;
  statusForm.value.status = row?.logistics_status || null;

  const base = baseLogisticsStatusOptions.value.map((s) => ({ label: toTitleCase(s), value: s }));
  if (row?.logistics_status && !base.some((o) => o.value === row.logistics_status)) {
    const v = String(row.logistics_status).trim().toLowerCase();
    base.unshift({ label: toTitleCase(v), value: v });
  }
  dialogStatusOptions.value = base;
  showUpdateStatusDialog.value = true;
}

async function saveLogisticsStatus() {
  if (!selectedLogisticsRow.value) return;
  const id = selectedLogisticsRow.value.logistics_id || selectedLogisticsRow.value.id;
  const newStatus = (statusForm.value.status || '').toString();
  if (!newStatus) return;
  try {
    savingStatus.value = true;
    await transactionStore.updateLogistics(id, { logistics_status: newStatus });
    selectedLogisticsRow.value.logistics_status = newStatus;
    $q.notify({ type: 'positive', message: 'Logistics status updated.' });
    showUpdateStatusDialog.value = false;
  } catch (e) {
    console.error('Failed to update logistics status:', e);
    $q.notify({ type: 'negative', message: 'Failed to update logistics status.' });
  } finally {
    savingStatus.value = false;
  }
}

/* ------------------- Update Goods Status (Order) ------------------- */
const goodsStatusOptions = ref([
  { label: 'None', value: 'none' },
  { label: 'To Be Collected', value: 'to collected' },
  { label: 'Under Process', value: 'under process' },
  { label: 'To Be Delivered', value: 'to be delivered' },
  { label: 'Ongoing Issue/s', value: 'ongoing issue/s' },
  { label: 'Items Delivered', value: 'Items Delivered' },
]);

const showUpdateGoodsDialog = ref(false);
const selectedGoodsOrder = ref(null);
const goodsForm = ref({ status: null });
const savingGoods = ref(false);

function openUpdateGoodsDialog(row) {
  selectedGoodsOrder.value = row || null;
  goodsForm.value.status = row?.goods_status || row?.order_production?.goods_status || null;
  showUpdateGoodsDialog.value = true;
}

async function saveGoodsStatus() {
  if (!selectedGoodsOrder.value) return;
  try {
    savingGoods.value = true;
    const productionId = selectedGoodsOrder.value?.order_production?.id;
    if (!productionId) throw new Error('Missing order_production.id on selected order');

    const newStatus = (goodsForm.value.status || '').toString();
    if (!newStatus) return;

    await transactionStore.updateProduction(productionId, { goods_status: newStatus });

    if (selectedGoodsOrder.value.order_production) {
      selectedGoodsOrder.value.order_production.goods_status = newStatus;
    }
    selectedGoodsOrder.value.goods_status = newStatus;
    $q.notify({ type: 'positive', message: 'Goods status updated.' });
    showUpdateGoodsDialog.value = false;
  } catch (err) {
    console.error('Failed to update goods status:', err);
    $q.notify({ type: 'negative', message: 'Failed to update goods status.' });
  } finally {
    savingGoods.value = false;
  }
}

/* ------------------- Update Logistics (open dialog with forms) ------------------- */
const showUpdateLogisticsDialog = ref(false);

function openUpdateLogistics(logistics) {
  transactionStore.logisticsId = logistics?.logistics_id || logistics?.id || null;
  transactionStore.selectedCustomer = logistics?.customer || null;
  showUpdateLogisticsDialog.value = true;
}

/* ------------------- Payment ------------------- */
const showAddPaymentDialog = ref(false);
const selectedPaymentOrder = ref(null);
const selectedPaymentCustomer = ref(null);

const selectedPaymentType = ref('Cash');
const paymentTypes = ref(['Cash', 'Bank Transfer', 'Cheque', 'Online Package Credits']);
const paymentAmount = ref(0);
const creditRemarks = ref('');
const referenceNo = ref('');
const totalCredits = ref(0);

const displayPaid = computed(() => {
  const o = selectedPaymentOrder.value;
  const op = o?.order_payment || {};
  const paidRaw = Number(op.paid_amount ?? o?.paid_amount ?? 0);
  return isNaN(paidRaw) ? 0 : paidRaw;
});
const displayTotal = computed(() => {
  const o = selectedPaymentOrder.value;
  const op = o?.order_payment || {};
  const totalRaw = Number(op.total_amount ?? o?.total_amount ?? 0);
  return isNaN(totalRaw) ? 0 : totalRaw;
});
const displayUnpaid = computed(() => Math.max(displayTotal.value - displayPaid.value, 0));

function openAddPaymentDialog(rowOrder, rowCustomer) {
  if (!rowOrder?.id) {
    $q.notify({ type: 'warning', message: 'No order attached to this row. Create an order first.' });
    return;
  }
  selectedPaymentOrder.value = rowOrder;
  selectedPaymentCustomer.value = rowCustomer || null;

  selectedPaymentType.value = 'Cash';
  paymentAmount.value = displayUnpaid.value || 0;
  referenceNo.value = '';
  creditRemarks.value = '';
  totalCredits.value = 0;

  showAddPaymentDialog.value = true;
}

watchEffectCredits();

function watchEffectCredits() {
  // minimal watcher
  watch(() => selectedPaymentType.value, async (t) => {
    if (t === 'Online Package Credits' && selectedPaymentCustomer.value?.id) {
      try {
        const creditData = await transactionStore.fetchCustomerCreditsById(selectedPaymentCustomer.value.id);
        totalCredits.value = (Number(creditData?.online_package) || 0) + (Number(creditData?.other_credits) || 0);
      } catch (err) {
        console.error('Failed to fetch customer credits:', err);
        $q.notify({ type: 'negative', message: 'Failed to load credits. Try again.' });
      }
    }
  });
}

async function addPayment() {
  if (!selectedPaymentOrder.value?.id) {
    $q.notify({ type: 'negative', message: 'Order ID is missing.' }); return;
  }
  if (!selectedPaymentType.value || paymentAmount.value <= 0) {
    $q.notify({ type: 'negative', message: 'Select a type and enter a valid amount.' }); return;
  }
  if ((selectedPaymentType.value === 'Bank Transfer' || selectedPaymentType.value === 'Cheque') && !referenceNo.value) {
    $q.notify({ type: 'negative', message: 'Reference number is required.' }); return;
  }

  const orderId = selectedPaymentOrder.value.id;
  const paymentData = {
    order_id: orderId,
    type: selectedPaymentType.value,
    amount: Number(paymentAmount.value),
    reference_no: referenceNo.value || undefined,
    remarks: creditRemarks.value || undefined,
  };

  try {
    await transactionStore.addPayment(paymentData);

    const totalAmount = displayTotal.value;
    const alreadyPaid = displayPaid.value;
    const unpaidAmount = Math.max(totalAmount - alreadyPaid, 0);
    const overpaidAmount = Math.max(Number(paymentAmount.value) - unpaidAmount, 0);

    if (overpaidAmount > 0 && selectedPaymentCustomer.value?.id) {
      await transactionStore.topUpCredits({
        customerId: selectedPaymentCustomer.value.id,
        type: 'Over Payment',
        amount: overpaidAmount,
        remarks: `Auto-credited from invoice #${orderId}`,
      });
      $q.notify({ type: 'info', message: `Overpayment of $${overpaidAmount.toFixed(2)} credited to customer.` });
    }

    // optimistic local patch
    const newPaid = alreadyPaid + Number(paymentAmount.value);
    const newStatus = newPaid >= totalAmount ? 'Paid' : 'Unpaid';

    if (!selectedPaymentOrder.value.order_payment) {
      selectedPaymentOrder.value.order_payment = {
        total_amount: totalAmount, paid_amount: newPaid, payment_status: newStatus,
      };
    } else {
      selectedPaymentOrder.value.order_payment.paid_amount = newPaid;
      selectedPaymentOrder.value.order_payment.payment_status = newStatus;
    }
    selectedPaymentOrder.value.paid_amount = newPaid.toFixed(2);
    selectedPaymentOrder.value.balance_amount = Math.max(totalAmount - newPaid, 0).toFixed(2);
    selectedPaymentOrder.value.payment_status = newStatus;

    showAddPaymentDialog.value = false;
    selectedPaymentType.value = 'Cash';
    paymentAmount.value = 0;
    referenceNo.value = '';
    creditRemarks.value = '';

    $q.notify({ type: 'positive', message: 'Payment added successfully.' });
  } catch (error) {
    console.error('Error adding payment:', error);
    $q.notify({ type: 'negative', message: 'Failed to add payment. Please try again.' });
  }
}

/* ------------------- Create order from logistics (optional) ------------------- */
function createOrderFromLogistics(transaction) {
  // Why: Keep parent clean. If you still want modal navigation, wire here.
  $q.notify({ type: 'warning', message: 'Create Order flow is handled elsewhere.' });
}


const getCustomerCredits = (customer) => {
  // accept object or single-element array shape
  const credits = Array.isArray(customer?.customer_credits)
    ? customer?.customer_credits?.[0]
    : customer?.customer_credits;
  const online = parseFloat(credits?.online_package ?? "0") || 0;
  const other = parseFloat(credits?.other_credits ?? "0") || 0;
  return `$${(online + other).toFixed(2)}`;
};

</script>
