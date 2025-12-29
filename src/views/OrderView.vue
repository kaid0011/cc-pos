<template>
  <div class="preview">
    <div class="row q-col-gutter-x-md q-pa-md page-1-container">
      <!-- Left Container -->
      <div class="col-6">
        <q-card flat class="order-banner bg-blue-grey text-white">
          <div class="flex justify-between items-center">
            <div class="text-left q-pa-sm">
              <img
                    v-if="brandLogoSrc"
                    :src="brandLogoSrc"
                    alt="Brand logo"
                    style="height:50px;width:auto;vertical-align:middle"
                  />
                  <!-- <div
                  class="q-mt-xs text-h6 text-uppercase text-weight-bolder order-box text-center"
                >
                  Order Details
                </div> -->
            </div>
            <div class="text-right q-pa-md text-subtitle1 line-height-1">
                
              <div class="text-slip-row">
                Order No:
                <span class="text-summary">{{ order?.order_no || "N/A" }}</span>
              </div>
              <div class="text-slip-row">
                Order Date:
                <span class="text-summary">{{
                  formatDate(order?.created_at)
                }}</span>
              </div>
                 
            </div>
          </div>
          <!-- <div>
            <q-btn
              unelevated
              outline
              class="full-width q-mt-md"
              label="Generate Invoice"
              color="white"
              icon="update"
              @click="handlePrintInvoice(order.order_no)"
            />
          </div> -->
        </q-card>

        <q-card class="preview-card order-container" ref="orderContainer">
          <!-- Customer and Order Details -->
          <div class="text-subtitle1 text-uppercase text-weight-bolder">
            Customer Details
          </div>
          <q-separator class="q-my-xs" />
          <q-card-section>
            <div class="">
              <div class="text-slip-row">
                <span v-if="customer?.type == 'Contract'">Company Name:</span>
                <span v-else>Customer Name:</span>
                <span
                  ><a
                    class="text-summary text-weight-bold"
                    @click.prevent="openCustomerTab(customer.id)"
                    >{{ customer.name }}</a
                  ></span
                >
              </div>
              <div class="text-slip-row">
                Customer Type:
                <span class="text-summary"
                  >{{ customer?.type || "N/A"
                  }}<span v-if="customer.sub_type && customer.sub_type != '-'">
                    - {{ customer.sub_type }}</span
                  ></span
                >
              </div>
              <div class="text-slip-row">
                Contact No/s:
                <span class="text-summary"
                  >{{ customer?.contact_no1 || "-"
                  }}<span v-if="customer.contact_no2">
                    / {{ customer?.contact_no2 || "-" }}</span
                  ></span
                >
              </div>
              <div class="text-slip-row">
                Email Address:
                <span class="text-summary">{{ customer?.email || "N/A" }}</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
        <!-- Collection and Delivery Details -->
        <div class="row text-p q-col-gutter-md">
          <div class="col-6">
            <q-card class="slip-card">
              <div class="text-subtitle1 text-uppercase text-weight-bolder">
                Collection Details
              </div>
              <div class="text-weight-bold">
                <a @click.prevent="openCollectionHistoryDialog()">
                  (View Collection History)
                </a>
              </div>
              <q-separator class="q-my-xs" />
              <div class="row text-slip-row row-col-row">
                <div class="col-6">Contact Person:</div>
                <div class="col-6">
                  {{ collection.contact_person?.name || "-" }}
                </div>
              </div>
              <div class="row text-slip-row row-col-row">
                <div class="col-6">Contact Nos:</div>
                <div class="col-6">
                  {{ formattedCollectionContactNos || "-" }}
                </div>
              </div>
              <div class="row text-slip-row row-col-row">
                <div class="col-6">Address:</div>
                <div class="col-6">
                  {{ formatAddress(collection.address) || "-" }}
                </div>
              </div>

              <div class="row text-slip-row row-col-row">
                <div class="col-6">Collection Date:</div>
                <div class="col-6">
                  {{ formattedCollectionDate }}
                </div>
              </div>
              <div class="row text-slip-row row-col-row">
                <div class="col-6">Collection Time:</div>
                <div class="col-6">
                  {{ collection.collection_time || "-" }}
                </div>
              </div>
              <div class="row text-slip-row row-col-row">
                <div class="col-6">Collection Driver:</div>
                <div class="col-6">
                  {{ getDriverName(collection.driver_id) || "-" }}
                </div>
              </div>
              <div class="row text-slip-row row-col-row">
                <div class="col-6">No. of Bags:</div>
                <div class="col-6">
                  {{ collection.no_bags || "-" }}
                </div>
              </div>
              <div class="row text-slip-row row-col-row">
                <div class="col-6">Remarks:</div>
                <div class="col-6">
                  {{ collection.collection_remarks || "-" }}
                </div>
              </div>

              <q-card-actions align="right">
                <!-- Update Button -->
                <q-btn
                  unelevated
                  dense
                  label="Update Collection"
                  color="primary"
                  icon="update"
                  class="full-width q-mt-md"
                  @click="updateCollection(logistics.logistics_id)"
                />
              </q-card-actions>
            </q-card>
          </div>
          <div class="col-6">
            <q-card class="slip-card">
              <div class="text-subtitle1 text-uppercase text-weight-bolder">
                Delivery Details
              </div>
              <div class="text-weight-bold">
                <a @click.prevent="openDeliveryHistoryDialog()">
                  (View Delivery History)
                </a>
              </div>
              <q-separator class="q-my-xs" />
              <div class="row text-slip-row row-col-row">
                <div class="col-6">Contact Person:</div>
                <div class="col-6">
                  {{ delivery.contact_person?.name || "-" }}
                </div>
              </div>
              <div class="row text-slip-row row-col-row">
                <div class="col-6">Contact Nos:</div>
                <div class="col-6">
                  {{ formattedDeliveryContactNos || "-" }}
                </div>
              </div>
              <div class="row text-slip-row row-col-row">
                <div class="col-6">Address:</div>
                <div class="col-6">
                  {{ formatAddress(delivery.address) || "-" }}
                </div>
              </div>

              <div class="row text-slip-row row-col-row">
                <div class="col-6">Delivery Date:</div>
                <div class="col-6">
                  {{ formattedDeliveryDate }}
                </div>
              </div>

              <div class="row text-slip-row row-col-row">
                <div class="col-6">Delivery Time:</div>
                <div class="col-6">
                  {{ delivery.delivery_time || "-" }}
                </div>
              </div>
              <div class="row text-slip-row row-col-row">
                <div class="col-6">Delivery Driver:</div>
                <div class="col-6">
                  {{ getDriverName(delivery.driver_id) || "-" }}
                </div>
              </div>
              <div class="row text-slip-row row-col-row">
                <div class="col-6">Remarks:</div>
                <div class="col-6">
                  {{ delivery.delivery_remarks || "-" }}
                </div>
              </div>

              <div class="q-mt-md">
                <div class="text-weight-bold text-uppercase">
                  Delivery Exceptions
                </div>

                <q-list>
                  <q-item
                    v-for="exc in exceptionGroups"
                    :key="exc.key"
                    clickable
                    dense
                    class="rounded-borders bg-blue-2 q-pa-sm q-mt-sm"
                    @click="openExceptionDetails(exc)"
                  >
                    <q-item-section>
                      <div class="">
                        <div class="row items-center no-wrap">
                          <q-icon
                            name="event"
                            size="16px"
                            class="q-mr-sm text-blue-9"
                          />
                          <span>{{ formatDateLine(exc.date) }}</span>
                        </div>
                        <div class="row items-center no-wrap">
                          <q-icon
                            name="schedule"
                            size="16px"
                            class="q-mr-sm text-blue-9"
                          />
                          <span>{{ exc.time || "[No time]" }}</span>
                        </div>
                        <div class="row items-center no-wrap">
                          <q-icon
                            name="person"
                            size="16px"
                            class="q-mr-sm text-blue-9"
                          />
                          <span>{{ exc.driverName || "[No driver]" }}</span>
                        </div>
                      </div>
                    </q-item-section>
                    <q-item-section side>
                      <q-chip dense square color="blue-9" text-color="white">
                        {{ exc.items?.length || 0 }} item{{
                          (exc.items?.length || 0) === 1 ? "" : "s"
                        }}
                      </q-chip>
                    </q-item-section>
                  </q-item>

                  <!-- No exceptions -->
                  <q-item v-if="!exceptionGroups.length" dense>
                    <q-item-section>
                      <div class="text-grey">No delivery exceptions.</div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

              <q-card-actions align="right">
                <q-btn
                  unelevated
                  dense
                  label="Make Delivery Exception"
                  color="orange"
                  icon="local_shipping"
                  class="full-width q-mb-sm q-mt-md"
                  @click="showDeliveryExceptionDialog = true"
                />
                <q-btn
                  unelevated
                  dense
                  label="Update Delivery"
                  color="primary"
                  icon="update"
                  class="full-width"
                  @click="updateDelivery(logistics.logistics_id)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Right Container -->
      <div class="col-6">
        <!-- Instructions Display -->
        <q-card class="instructions-list preview-card q-mb-md">
          <!-- Add Instruction Button -->
          <div class="row justify-between items-center">
            <div class="text-subtitle1 text-uppercase text-weight-bolder">
              Instructions
            </div>
            <q-btn
              label="Add Instruction"
              color="primary"
              icon="add"
              dense
              flat
              class="q-px-sm"
              @click="openAddInstructionDialog"
            />
          </div>
          <q-separator class="q-mt-xs" />

          <q-card-section>
            <!-- Check if instructions array exists and has items -->
            <div v-if="instructions && instructions.length > 0">
              <div
                v-for="(instruction, index) in instructions"
                :key="instruction.id"
                class="row justify-between per-instruction q-mb-sm"
              >
                <div>
                  <!-- Instruction ID and description -->
                  <div class="text-p q-ml-sm">
                    <q-icon
                      name="circle"
                      size="7px"
                      class="q-mr-sm text-primary"
                    />
                    <span>{{
                      instruction.description || "No description provided."
                    }}</span>
                  </div>

                  <!-- Instruction chips -->
                  <div class="instruction-chips q-ml-lg">
                    <q-chip
                      square
                      :color="
                        instruction.type === 'onetime' ? 'purple-10' : 'pink-10'
                      "
                      text-color="white"
                      class="instructions-type"
                    >
                      {{
                        instruction.type === "onetime"
                          ? "One-time"
                          : "Recurring"
                      }}
                    </q-chip>
                    <span v-if="instruction.to && instruction.to.length > 0">
                      |
                    </span>
                    <q-chip
                      v-for="section in instruction.to || []"
                      :key="section"
                      :color="getSectionColor(section)"
                      text-color="white"
                      class="instructions-to"
                    >
                      {{ formatSectionLabel(section) }}
                    </q-chip>
                  </div>
                </div>
                <q-btn
                  dense
                  flat
                  icon="delete"
                  color="red"
                  @click="
                    openDeleteInstructionDialog(
                      instruction.id,
                      instruction.type
                    )
                  "
                />
              </div>
            </div>
            <div v-else class="text-center text-grey">
              No instructions added.
            </div>
          </q-card-section>
        </q-card>

        <!-- Reports Section -->

        <q-card class="report-list preview-card">
          <!-- Add Report Button in Report List Card -->
          <div class="row justify-between items-center">
            <div class="text-subtitle1 text-uppercase text-weight-bolder">
              Error Reports
            </div>
            <q-btn
              label="Add Report"
              color="primary"
              icon="add"
              dense
              flat
              class="q-px-sm"
              @click="openAddReportDialog"
            />
          </div>
          <q-separator class="q-mt-xs" />

          <q-card-section>
            <div v-if="reports.length > 0">
              <div
                v-for="(report, index) in reports"
                :key="report.id"
                class="row justify-between per-report q-mb-sm"
              >
                <div>
                  <!-- Display the report description -->
                  <div class="text-p">
                    <span>
                      <q-icon
                        name="circle"
                        color="primary"
                        size="7px"
                        class="q-mr-sm q-ml-md"
                      />
                    </span>
                    {{ report.description }}
                  </div>
                  <!-- Display the report category and sub-category -->
                  <div class="q-ml-xl text-weight-bold text-red">
                    {{ report.category }} - {{ report.sub_category }}
                  </div>
                  <!-- Display the report photo, if any -->
                  <q-img
                    v-if="report.image"
                    :src="report.image"
                    class="q-mt-sm q-ml-lg"
                    style="max-width: 200px; height: auto"
                  />
                </div>
                <!-- Delete button -->
                <q-btn
                  dense
                  flat
                  icon="delete"
                  color="red"
                  @click="openDeleteReportDialog(report.id)"
                />
              </div>
            </div>
            <div v-else class="text-center text-grey">
              No error reports added.
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-x-md page-2-container q-pa-md">
      <div class="col-4">
        <q-card class="preview-card full-height">
          <div class="row justify-start items-center">
            <div class="text-subtitle1 text-uppercase text-weight-bolder">
              Logistics Details
            </div>
          </div>
          <q-separator class="q-mt-xs" />
          <q-card-section class="q-pb-sm">
            <div class="row q-mb-xs items-center">
              <div class="col-4 text-right q-mr-sm">
                <div>Logistics Status:</div>
              </div>
              <div class="col text-uppercase text-weight-bold">
                {{ logistics?.logistics_status || "-" }}
              </div>
            </div>
            <div class="row q-mb-xs items-center">
              <div class="col-4 text-right q-mr-sm"><div>Job Type:</div></div>
              <div class="col text-weight-bold">
              {{ jobTypeLabel(logistics?.job_type) }}
              </div>
            </div>
            <div class="row q-mb-xs items-center">
              <div class="col-4 text-right q-mr-sm"><div>Urgency:</div></div>
              <div class="col text-weight-bold text-capitalize">
                {{ logistics?.urgency || "-" }}
              </div>
            </div>
          </q-card-section>
          <q-card-actions class="q-pt-none">
            <q-btn
              dense
              unelevated
              class="full-width q-mt-md"
              label="Update Logistics"
              color="primary"
              icon="update"
              @click="showUpdateLogisticsDialog = true"
            />
          </q-card-actions>
        </q-card>
      </div>
      <div class="col-4">
        <q-card class="preview-card full-height">
          <div class="row justify-start items-center">
            <div class="text-subtitle1 text-uppercase text-weight-bolder">
              Production Details
            </div>
          </div>
          <q-separator class="q-mt-xs" />
          <q-card-section class="q-pb-sm">
            <div class="row q-mb-xs items-center">
              <div class="col-4 text-right q-mr-sm">
                <div>Goods Status:</div>
              </div>
              <div class="col text-uppercase text-weight-bold">
                {{ goodsStatus || "none" }}
              </div>
            </div>
            <div class="row q-mb-xs items-center">
              <div class="col-4 text-right q-mr-sm">
                <div>No. of Packets:</div>
              </div>
              <div class="col text-weight-bold">
                {{ noPackets || "0" }}
              </div>
            </div>
            <div class="row q-mb-xs items-center">
              <div class="col-4 text-right q-mr-sm">
                <div>No. of Hangers:</div>
              </div>
              <div class="col text-weight-bold">
                {{ noHangers || "0" }}
              </div>
            </div>
            <div class="row q-mb-xs items-center">
              <div class="col-4 text-right q-mr-sm">
                <div>No. of Rolls:</div>
              </div>
              <div class="col text-weight-bold">
                {{ noRolls || "0" }}
              </div>
            </div>
          </q-card-section>
          <q-card-actions class="q-pt-none">
            <q-btn
              unelevated
              dense
              class="full-width q-mt-md"
              label="Update Production"
              color="primary"
              icon="update"
              @click="showUpdateProductionDialog = true"
            />
          </q-card-actions>
        </q-card>
      </div>
      <div class="col-4">
        <q-card class="preview-card full-height" ref="orderContainer">
          <div class="row justify-between items-center">
            <div class="text-subtitle1 text-uppercase text-weight-bolder">
              Invoice Details
            </div>
            <q-btn
              label="Add Payment"
              color="primary"
              icon="add"
              dense
              flat
              class="q-px-sm"
              @click="openAddPaymentDialog"
            />
          </div>
          <q-separator class="q-my-xs" />
          <q-card-section class="q-pb-sm">
            <div class="">
              <div>
                Payment Status:
                <span class="q-ml-xs text-weight-bold text-uppercase">{{
                  order.order_payment?.payment_status
                }}</span>
              </div>
              <div>
                Paid:
                <span class="q-ml-xs text-weight-bold">
                  ${{ (order.order_payment?.paid_amount || 0).toFixed(2) }}
                </span>
              </div>
              <div>
                Balance:
                <span class="q-ml-xs text-red text-weight-bold">
                  ${{
                    (
                      (order.order_payment?.total_amount || 0) -
                      (order.order_payment?.paid_amount || 0)
                    ).toFixed(2)
                  }}
                </span>
              </div>
              <div>
                Amount:
                <span class="q-ml-xs text-weight-bold">
                  ${{ (order.order_payment?.total_amount || 0).toFixed(2) }}
                </span>
              </div>
            </div>
          </q-card-section>
          <q-card-actions class="q-pt-none">
            <q-btn
              unelevated
              dense
              label="Generate Invoice"
              color="primary"
              icon="update"
              class="full-width q-mt-md"
              @click="handlePrintInvoice(order?.order_no)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <div class="row page-1-container q-pa-md">
      <q-card class="transactions-list preview-card full-width">
        <!-- Add Instruction Button -->
        <div class="row justify-between items-center">
          <div class="text-subtitle1 text-uppercase text-weight-bolder">
            Transaction Items
          </div>
          <!-- Add Row Button Aligned Right -->
          <q-btn
            label="Add Transactions"
            color="primary"
            icon="add"
            dense
            flat
            class="q-px-sm"
            @click="openAddTransactionDialog"
          />
        </div>
        <q-separator class="q-mt-xs" />

        <q-card-section>
          <!-- ============ PC (pieces) ============ -->
          <div v-if="pcItems.length" class="q-mb-md">
            <div
              class="text-subtitle1 text-weight-bolder q-mb-xs text-uppercase"
            >
              Pieces
            </div>
            <div class="transaction-summary">
              <div class="row row-col-header order-header text-center">
                <div class="col-4 text-weight-bold bordered">Item</div>
                <div class="col-2 text-weight-bold bordered">Process</div>
                <div class="col text-weight-bold bordered">Price</div>
                <div class="col text-weight-bold bordered">Qty</div>
                <div class="col text-weight-bold bordered">Pieces</div>
                <div class="col text-weight-bold bordered">Subtotal</div>
                <div class="col-1 text-weight-bold bordered">Ready?</div>
              </div>

              <div
                v-for="(item, idx) in pcItems"
                :key="`pc-${item.id ?? idx}`"
                class="row row-col-row order-row"
              >
                <!-- Item + delete -->
                <div class="col-4 bordered row items-center no-wrap">
                  <div class="col" :style="{ minWidth: 0 }">
                    <q-input
                      outlined
                      dense
                      type="textarea"
                      autogrow
                      rows="1"
                      v-model="item.item_name"
                      class="editable-field item-name-textarea"
                      placeholder="Item Name"
                    />
                  </div>
                  <div class="col-auto q-ml-xs">
                    <q-btn
                      flat
                      class="trash-icon"
                      color="negative"
                      icon="delete"
                      @click="
                        openDeleteTransactionDialog(
                          transactions.indexOf(item),
                          item.id
                        )
                      "
                    />
                  </div>
                </div>

                <!-- Process -->
                <div class="col-2 bordered">
                  <q-select
                    outlined
                    dense
                    options-dense
                    v-model="item.process"
                    :options="processOptions"
                    class="editable-field"
                    emit-value
                    map-options
                  />
                </div>

                <!-- Price -->
                <div class="col bordered">
                  <q-input
                    outlined
                    dense
                    type="text"
                    inputmode="decimal"
                    :model-value="formatPriceNumber(item.price)"
                    :suffix="`/ ${priceUnitLabel(item)}`"
                    class="editable-field"
                    :disable="String(item.price).toUpperCase() === 'TBA'"
                    @keypress="
                      (e) => allowOnlyNumberDot(e, false, e.target.value)
                    "
                    @paste="(e) => onPasteNumberDot(e, false)"
                    @update:model-value="
                      (val) =>
                        onPriceInputChange(transactions.indexOf(item), val)
                    "
                  />
                  <div
                    v-if="String(item.price).toUpperCase() === 'TBA'"
                    class="text-center"
                  >
                    TBA
                  </div>
                </div>

                <!-- Qty -->
                <div class="col bordered">
                  <q-input
                    outlined
                    dense
                    type="text"
                    inputmode="decimal"
                    :model-value="formatQtyModelValue(item)"
                    :suffix="qtyUnitLabel(item)"
                    class="editable-field"
                    @keypress="
                      (e) => allowOnlyNumberDot(e, false, e.target.value)
                    "
                    @paste="(e) => onPasteNumberDot(e, false)"
                    @update:model-value="
                      (val) => onQtyInputChange(transactions.indexOf(item), val)
                    "
                  />
                </div>
                <!-- Pieces -->
                <div class="col bordered flex flex-center">
                  <span class="q-mr-xs">{{ totalPiecesForPc(item) }}</span
                  ><span class="unit-dim">pcs</span>
                </div>

                <!-- Subtotal -->
                <div
                  class="col bordered flex items-center justify-center pos-rel"
                >
                  <span>${{ formatMoney(item.subtotal) }}</span>

                  <!-- tiny ? help icon in bottom-right -->
                  <q-icon
                    name="help_outline"
                    size="14px"
                    class="calc-help"
                    tabindex="0"
                    role="button"
                    aria-label="See computation"
                  >
                    <q-tooltip
                      anchor="bottom right"
                      self="top right"
                      max-width="260px"
                    >
                      {{ subtotalBreakdown(item) }}
                    </q-tooltip>
                  </q-icon>
                </div>

                <!-- Ready -->
                <div class="col-1 bordered flex-center flex">
                  <q-checkbox v-model="item.ready_status" size="md" dense />
                </div>
              </div>
            </div>
          </div>

          <!-- ============ WEIGHT (kg/lbs) ============ -->
          <div v-if="weightItems.length" class="q-mb-md">
            <div
              class="text-subtitle1 text-weight-bolder q-mb-xs text-uppercase"
            >
              Weight
            </div>
            <div class="transaction-summary">
              <div class="row row-col-header order-header text-center">
                <div class="col-4 text-weight-bold bordered">Item</div>
                <div class="col-2 text-weight-bold bordered">Process</div>
                <div class="col text-weight-bold bordered">Price</div>
                <div class="col text-weight-bold bordered">Weight</div>
                <div class="col text-weight-bold bordered">Pieces</div>
                <div class="col text-weight-bold bordered">Subtotal</div>
                <div class="col-1 text-weight-bold bordered">Ready?</div>
              </div>

              <div
                v-for="(item, idx) in weightItems"
                :key="`wt-${item.id ?? idx}`"
                class="row row-col-row order-row"
              >
                <!-- Item + delete -->
                <div class="col-4 bordered row items-center no-wrap">
                  <div class="col" :style="{ minWidth: 0 }">
                    <q-input
                      outlined
                      dense
                      type="textarea"
                      autogrow
                      rows="1"
                      v-model="item.item_name"
                      class="editable-field item-name-textarea"
                      placeholder="Item Name"
                    />
                  </div>
                  <div class="col-auto q-ml-xs">
                    <q-btn
                      flat
                      class="trash-icon"
                      color="negative"
                      icon="delete"
                      @click="
                        openDeleteTransactionDialog(
                          transactions.indexOf(item),
                          item.id
                        )
                      "
                    />
                  </div>
                </div>

                <!-- Process -->
                <div class="col-2 bordered">
                  <q-select
                    outlined
                    dense
                    options-dense
                    v-model="item.process"
                    :options="processOptions"
                    class="editable-field"
                    emit-value
                    map-options
                  />
                </div>

                <!-- Price -->
                <div class="col bordered">
                  <q-input
                    outlined
                    dense
                    type="text"
                    inputmode="decimal"
                    :model-value="formatPriceNumber(item.price)"
                    :suffix="`/ ${priceUnitLabel(item)}`"
                    class="editable-field"
                    :disable="String(item.price).toUpperCase() === 'TBA'"
                    @keypress="
                      (e) => allowOnlyNumberDot(e, false, e.target.value)
                    "
                    @paste="(e) => onPasteNumberDot(e, false)"
                    @update:model-value="
                      (val) =>
                        onPriceInputChange(transactions.indexOf(item), val)
                    "
                  />
                  <div
                    v-if="String(item.price).toUpperCase() === 'TBA'"
                    class="text-center"
                  >
                    TBA
                  </div>
                </div>

                <!-- Weight -->
                <div class="col bordered">
                  <q-input
                    outlined
                    dense
                    type="text"
                    inputmode="decimal"
                    :model-value="formatQtyModelValue(item)"
                    :suffix="unitLabel(getUnitForItem(item))"
                    class="editable-field"
                    @keypress="
                      (e) => allowOnlyNumberDot(e, false, e.target.value)
                    "
                    @paste="(e) => onPasteNumberDot(e, false)"
                    @update:model-value="
                      (val) => onQtyInputChange(transactions.indexOf(item), val)
                    "
                  />
                </div>

                <!-- Pieces -->
                <div class="col bordered">
                  <q-input
                    outlined
                    dense
                    type="number"
                    :model-value="computedPcs(item)"
                    suffix="pcs"
                    class="editable-field"
                    @update:model-value="
                      (val) =>
                        onPiecesInputChange(transactions.indexOf(item), val)
                    "
                  />
                </div>

                <!-- Subtotal -->
                <div
                  class="col bordered flex items-center justify-center pos-rel"
                >
                  <span>${{ formatMoney(item.subtotal) }}</span>

                  <!-- tiny ? help icon in bottom-right -->
                  <q-icon
                    name="help_outline"
                    size="14px"
                    class="calc-help"
                    tabindex="0"
                    role="button"
                    aria-label="See computation"
                  >
                    <q-tooltip
                      anchor="bottom right"
                      self="top right"
                      max-width="260px"
                    >
                      {{ subtotalBreakdown(item) }}
                    </q-tooltip>
                  </q-icon>
                </div>

                <!-- Ready -->
                <div class="col-1 bordered flex-center flex">
                  <q-checkbox v-model="item.ready_status" size="md" dense />
                </div>
              </div>
            </div>
          </div>

          <!-- ============ SIZE (sqft/sqm) ============ -->
          <div v-if="sizeItems.length" class="q-mb-md">
            <div
              class="text-subtitle1 text-weight-bolder q-mb-xs text-uppercase"
            >
              Size
            </div>
            <div class="transaction-summary">
              <div class="row row-col-header order-header text-center">
                <div class="col-4 text-weight-bold bordered">Item</div>
                <div class="col-2 text-weight-bold bordered">Process</div>
                <div class="col text-weight-bold bordered">Price</div>
                <div class="col text-weight-bold bordered">Size</div>
                <div class="col text-weight-bold bordered">Pieces</div>
                <div class="col text-weight-bold bordered">Subtotal</div>
                <div class="col-1 text-weight-bold bordered">Ready?</div>
              </div>

              <div
                v-for="(item, idx) in sizeItems"
                :key="`sz-${item.id ?? idx}`"
                class="row row-col-row order-row"
              >
                <!-- Item + delete -->
                <div class="col-4 bordered row items-center no-wrap">
                  <div class="col" :style="{ minWidth: 0 }">
                    <q-input
                      outlined
                      dense
                      type="textarea"
                      autogrow
                      rows="1"
                      v-model="item.item_name"
                      class="editable-field item-name-textarea"
                      placeholder="Item Name"
                    />
                  </div>
                  <div class="col-auto q-ml-xs">
                    <q-btn
                      flat
                      class="trash-icon"
                      color="negative"
                      icon="delete"
                      @click="
                        openDeleteTransactionDialog(
                          transactions.indexOf(item),
                          item.id
                        )
                      "
                    />
                  </div>
                </div>

                <!-- Process -->
                <div class="col-2 bordered">
                  <q-select
                    outlined
                    dense
                    options-dense
                    v-model="item.process"
                    :options="processOptions"
                    class="editable-field"
                    emit-value
                    map-options
                  />
                </div>

                <!-- Price -->
                <div class="col bordered">
                  <q-input
                    outlined
                    dense
                    type="text"
                    inputmode="decimal"
                    :model-value="formatPriceNumber(item.price)"
                    :suffix="`/ ${priceUnitLabel(item)}`"
                    class="editable-field"
                    :disable="String(item.price).toUpperCase() === 'TBA'"
                    @keypress="
                      (e) => allowOnlyNumberDot(e, false, e.target.value)
                    "
                    @paste="(e) => onPasteNumberDot(e, false)"
                    @update:model-value="
                      (val) =>
                        onPriceInputChange(transactions.indexOf(item), val)
                    "
                  />
                  <div
                    v-if="String(item.price).toUpperCase() === 'TBA'"
                    class="text-center"
                  >
                    TBA
                  </div>
                </div>

                <!-- Size (area/length) -->
                <div class="col bordered">
                  <q-input
                    outlined
                    dense
                    type="text"
                    inputmode="decimal"
                    :model-value="formatQtyModelValue(item)"
                    :suffix="unitLabel(getUnitForItem(item))"
                    class="editable-field"
                    @keypress="
                      (e) => allowOnlyNumberDot(e, false, e.target.value)
                    "
                    @paste="(e) => onPasteNumberDot(e, false)"
                    @update:model-value="
                      (val) => onQtyInputChange(transactions.indexOf(item), val)
                    "
                  />
                </div>

                <!-- Pieces -->
                <div class="col bordered">
                  <q-input
                    outlined
                    dense
                    type="number"
                    :model-value="computedPcs(item)"
                    suffix="pcs"
                    class="editable-field"
                    @update:model-value="
                      (val) =>
                        onPiecesInputChange(transactions.indexOf(item), val)
                    "
                  />
                </div>

                <!-- Subtotal -->
                <div
                  class="col bordered flex items-center justify-center pos-rel"
                >
                  <span>${{ formatMoney(item.subtotal) }}</span>

                  <!-- tiny ? help icon in bottom-right -->
                  <q-icon
                    name="help_outline"
                    size="14px"
                    class="calc-help"
                    tabindex="0"
                    role="button"
                    aria-label="See computation"
                  >
                    <q-tooltip
                      anchor="bottom right"
                      self="top right"
                      max-width="260px"
                    >
                      {{ subtotalBreakdown(item) }}
                    </q-tooltip>
                  </q-icon>
                </div>

                <!-- Ready -->
                <div class="col-1 bordered flex-center flex">
                  <q-checkbox v-model="item.ready_status" size="md" dense />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="flex justify-between q-pt-none">
          <div class="unit-totals-right">
            <q-card flat bordered class="unit-totals-card q-pa-sm">
              <div class="unit-line">
                <span class="unit-label">Per Piece</span>
                <span class="unit-value"
                  >${{ formatMoney(totalsAmounts.piece) }}</span
                >
              </div>
              <q-separator />
              <div class="unit-line">
                <span class="unit-label">By Weight</span>
                <span class="unit-value"
                  >${{ formatMoney(totalsAmounts.weight) }}</span
                >
              </div>
              <q-separator />
              <div class="unit-line">
                <span class="unit-label">By Size</span>
                <span class="unit-value"
                  >${{ formatMoney(totalsAmounts.size) }}</span
                >
              </div>
              <q-separator spaced />
              <div class="unit-line grand">
                <span class="unit-label">Total Amount</span>
                <span class="unit-value text-red-9"
                  >${{ formatMoney(totalsAmounts.total) }}</span
                >
              </div>
            </q-card>
          </div>

          <!-- Update Transactions Button -->
          <div>
            <q-btn
              unelevated
              label="Update Transactions"
              color="primary"
              icon="update"
              class="q-py-md"
              @click="updateTransaction(order.id)"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>

  <q-dialog v-model="isDeleteInstructionDialogOpen" persistent>
    <q-card>
      <q-card-section class="text-center">
        <div class="text-h6">Confirm Deletion</div>
        <div>Are you sure you want to delete this instruction?</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="closeDeleteInstructionDialog"
        />
        <q-btn
          flat
          label="Delete"
          color="negative"
          @click="confirmDeleteInstruction"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="isDeleteReportDialogOpen" persistent>
    <q-card style="min-width: 300px">
      <q-card-section class="text-center">
        <div class="text-h6">Confirm Deletion</div>
        <div class="q-mt-md">Are you sure you want to delete this report?</div>
      </q-card-section>
      <q-card-actions align="right" class="q-pa-sm">
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="closeDeleteReportDialog"
        />
        <q-btn
          flat
          label="Delete"
          color="negative"
          @click="confirmDeleteReport"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!-- Delete Confirmation Dialog -->
  <q-dialog v-model="isDeleteTransactionDialogOpen" persistent>
    <q-card>
      <q-card-section class="text-center">
        <div class="text-h6">Confirm Deletion</div>
        <div>Are you sure you want to delete this transaction?</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="cancelDeleteTransaction"
        />
        <q-btn
          flat
          label="Delete"
          color="negative"
          @click="confirmDeleteTransaction"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!-- Add Transaction Dialog -->
  <q-dialog v-model="isAddTransactionDialogOpen" persistent>
    <q-card>
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Add Transaction
        </div>
        <q-btn
          icon="close"
          flat
          dense
          round
          class="absolute-top-right q-ma-sm"
          @click="isAddTransactionDialogOpen = false"
        />
      </q-card-section>
      <q-card-section class="dialog-body">
        <!-- Add Transaction Form (Copied from OthersComponent) -->
        <div class="text-p">
          <q-checkbox
            v-model="searchModeActive"
            label="Search an item instead"
            class="q-my-sm"
            @update:model="resetInputs"
          />

          <div v-if="searchModeActive">
            <div>Search an item...</div>
            <q-select
              v-model="selectedSearchItemName"
              :options="filteredSearchItemOptions"
              square
              dense
              outlined
              use-input
              input-debounce="300"
              class="others-input q-mb-xs bg-white"
              label="Type to search item"
              @filter="filterSearchItemsByInput"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:append>
                <q-icon
                  name="close"
                  @click="clearSearchInput"
                  class="cursor-pointer"
                />
              </template>
            </q-select>
          </div>

          <div v-else>
            <div class="row">
              <div class="col">
                <div>Category</div>
                <q-select
                  v-model="selectedCategoryName"
                  :options="categoryOptions"
                  square
                  dense
                  outlined
                  input-debounce="300"
                  class="others-input q-mb-xs bg-white"
                  label="Select Category"
                />
              </div>
            </div>

            <div v-if="isNewItemSelected">
              <div>Enter New Item:</div>
              <q-input
                v-model="newItemNameInput"
                square
                dense
                outlined
                class="others-input q-mb-xs bg-white"
                placeholder="Enter item name"
              />
              <div>Unit:</div>
              <q-select
                v-model="newItemUnitType"
                :options="unitTypeOptions"
                square
                dense
                outlined
                class="others-input q-mb-xs bg-white"
                label="Select Unit"
              />
            </div>
            <div v-else>
              <div>Sub-category</div>
              <q-select
                v-model="selectedSubCategoryName"
                :options="filteredSubCategoryOptions"
                square
                dense
                outlined
                input-debounce="300"
                class="others-input q-mb-xs bg-white"
                label="Select Sub-category"
              />

              <div>Item Name:</div>
              <q-select
                v-model="selectedItemName"
                :options="filteredItemOptions"
                square
                dense
                outlined
                input-debounce="300"
                class="others-input q-mb-xs bg-white"
                label="Select Item"
              />
            </div>
          </div>

          <div>Process</div>
          <q-select
            v-model="selectedProcessOption"
            :options="filteredProcessOptions"
            square
            dense
            outlined
            class="others-input q-mb-xs bg-white"
            label="Select Process"
            @update:model="calculatePriceForSelectedType"
          />

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <div>Price Type</div>
              <q-select
                v-model="selectedPriceTypeOption"
                :options="filteredPriceTypeOptions"
                square
                dense
                outlined
                class="others-input q-mb-xs bg-white"
                label="Select Price Type"
              />
            </div>
            <div class="col-6">
              <div>Price:</div>
              <q-input
                v-model="priceInputValue"
                square
                dense
                outlined
                class="others-input q-mb-xs bg-white"
                label="Enter Price"
                :disable="isPriceInputDisabled"
              />
            </div>
          </div>

          <div
            v-if="
              selectedUnitType === 'pc' ||
              (isNewItemSelected && newItemUnitType === 'pc')
            "
          >
            <div>Quantity:</div>
            <q-input
              v-model="pieceQuantityInput"
              type="number"
              square
              dense
              outlined
              class="others-input q-mb-xs bg-white"
              label="Enter Quantity"
            />
          </div>

          <div
            v-else-if="
              selectedUnitType === 'sqft' ||
              (isNewItemSelected && newItemUnitType === 'sqft')
            "
            class="row q-col-gutter-sm"
          >
            <div class="col">
              <div>Width:</div>
              <q-input
                v-model="areaWidthInput"
                type="number"
                square
                dense
                outlined
                class="others-input q-mb-xs bg-white"
                label="Enter Width (ft)"
              />
            </div>
            <div class="col">
              <div>Breadth:</div>
              <q-input
                v-model="areaBreadthInput"
                type="number"
                square
                dense
                outlined
                class="others-input q-mb-xs bg-white"
                label="Enter Breadth (ft)"
              />
            </div>
          </div>

          <div
            v-else-if="
              selectedUnitType === 'kg' ||
              (isNewItemSelected && newItemUnitType === 'kg')
            "
          >
            <div>Weight:</div>
            <q-input
              v-model="weightInput"
              type="number"
              square
              dense
              outlined
              class="others-input q-mb-xs bg-white"
              label="Enter Weight (kg)"
            />
          </div>

          <!-- Display area, weight, and subtotal conditionally -->
          <div
            v-if="(selectedUnitType || newItemUnitType) === 'sqft'"
            class="q-mt-md text-right"
          >
            <div>
              Area:
              <span class="text-summary"
                >{{ computedArea.toFixed(2) }} sqft</span
              >
            </div>
            <div>
              Subtotal:
              <span class="text-summary"
                >${{ computedSubtotal.toFixed(2) }}</span
              >
            </div>
          </div>
          <div
            v-else-if="(selectedUnitType || newItemUnitType) === 'kg'"
            class="text-right q-mt-md"
          >
            <div>
              Weight: <span class="text-summary">{{ weightInput }} kg</span>
            </div>
            <div>
              Subtotal:
              <span class="text-summary"
                >${{ computedSubtotal.toFixed(2) }}</span
              >
            </div>
          </div>

          <div class="row justify-end">
            <q-btn
              class="float-right q-my-md"
              label="Add to Transaction"
              color="primary"
              @click="addTransactionItem"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="isAddInstructionDialogOpen" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6 text-center">Add Instruction</div>
      </q-card-section>
      <q-card-section>
        <div class="row q-gutter-x-md">
          <div class="col-auto">
            <div>Enter Instructions:</div>
            <div class="q-pl-sm q-pt-sm">
              <div class="text-p">
                <span>
                  <q-radio
                    v-model="instructionsType"
                    checked-icon="task_alt"
                    unchecked-icon="panorama_fish_eye"
                    val="onetime"
                    dense
                  />
                </span>
                One-time
              </div>
              <div class="text-p">
                <span>
                  <q-radio
                    v-model="instructionsType"
                    checked-icon="task_alt"
                    unchecked-icon="panorama_fish_eye"
                    val="recurring"
                    dense
                  />
                </span>
                Recurring
              </div>
            </div>
          </div>
          <div class="col">
            <textarea
              v-model="instructionsDesc"
              type="textarea"
              class="q-pa-sm instructions-desc full-width"
              placeholder="Enter instruction here..."
            />
            <div class="q-gutter-sm">
              <q-checkbox
                v-model="instructionsTo"
                val="cleaning"
                label="Cleaning"
                color="teal"
              />
              <q-checkbox
                v-model="instructionsTo"
                val="packing"
                label="Packing"
                color="orange"
              />
              <q-checkbox
                v-model="instructionsTo"
                val="pickingsending"
                label="Picking/Sending"
                color="red"
              />
              <q-checkbox
                v-model="instructionsTo"
                val="admin"
                label="Admin"
                color="cyan"
              />
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="negative"
          @click="closeAddInstructionDialog"
        />
        <q-btn label="Add" color="primary" @click="addInstruction" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!-- Add Report Dialog -->
  <AddErrorReportDialog
    v-model="isAddReportDialogOpen"
    :order-id="order?.id"
    @added="onReportAdded"
  />

  <q-dialog
    v-model="showUpdateCollectionDialog"
    persistent
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card style="min-width: 50em">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Update Collection
        </div>
        <q-btn
          icon="close"
          flat
          dense
          round
          class="absolute-top-right q-ma-sm"
          @click="showUpdateCollectionDialog = false"
        />
      </q-card-section>
      <q-card-section class="q-pa-none">
        <UpdateCollectionDialog
          @update:modelValue="(val) => (showUpdateCollectionDialog = val)"
          @close="onCollectionDialogClosed"
        />
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog
    v-model="showUpdateDeliveryDialog"
    persistent
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card style="min-width: 50em">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Update Delivery
        </div>
        <q-btn
          icon="close"
          flat
          dense
          round
          class="absolute-top-right q-ma-sm"
          @click="showUpdateDeliveryDialog = false"
        />
      </q-card-section>
      <q-card-section class="q-pa-none">
        <UpdateDeliveryDialog
          @update:modelValue="(val) => (showUpdateDeliveryDialog = val)"
          @close="onDeliveryDialogClosed"
        />
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog
    v-model="showCollectionHistoryDialog"
    persistent
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card style="min-width: 90vw">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Collection History
        </div>
        <q-btn
          icon="close"
          flat
          dense
          round
          class="absolute-top-right q-ma-sm"
          @click="showCollectionHistoryDialog = false"
        />
      </q-card-section>
      <q-card-section class="q-pa-none">
        <div class="full-container">
          <CollectionHistory
            v-if="selectedCollectionId"
            :logisticsCollectionId="selectedCollectionId"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog
    v-model="showDeliveryHistoryDialog"
    persistent
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card style="min-width: 90vw">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Delivery History
        </div>
        <q-btn
          icon="close"
          flat
          dense
          round
          class="absolute-top-right q-ma-sm"
          @click="showDeliveryHistoryDialog = false"
        />
      </q-card-section>
      <q-card-section class="q-pa-none">
        <div class="full-container">
          <DeliveryHistory />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showAddPaymentDialog">
    <q-card style="min-width: 1000px">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Add Payment
        </div>
        <q-btn
          icon="close"
          flat
          dense
          round
          class="absolute-top-right q-ma-sm"
          @click="showAddPaymentDialog = false"
        />
      </q-card-section>

      <q-card-section class="dialog-body text-subtitle1">
        <div class="row text-center">
          <div class="col all-border text-uppercase">
            <div>Paid</div>
            <div class="text-weight-bolder text-uppercase text-h6 text-green-9">
              ${{ (order.order_payment?.paid_amount || 0).toFixed(2) }}
            </div>
          </div>
          <div class="col all-border text-uppercase">
            <div>Unpaid</div>
            <div class="text-weight-bolder text-uppercase text-h6 text-red-9">
              ${{
                (
                  (order.order_payment?.total_amount || 0) -
                  (order.order_payment?.paid_amount || 0)
                ).toFixed(2)
              }}
            </div>
          </div>
          <div class="col all-border text-uppercase">
            <div>Total Amount</div>
            <div class="text-weight-bolder text-uppercase text-h6">
              ${{ (order.order_payment?.total_amount || 0).toFixed(2) }}
            </div>
          </div>
        </div>

        <q-separator class="q-my-sm" />

        <q-banner class="bg-yellow-1 text-primary q-my-sm" rounded>
          <q-icon name="account_balance_wallet" class="q-mr-sm" />
          Customer Credit Available:
          <span class="text-weight-bolder text-subtitle1 q-ml-xs"
            >${{ (totalCredits || 0).toFixed(2) }}</span
          >
        </q-banner>

        <div class="row q-col-gutter-x-md q-mb-sm">
          <!-- Payment Type -->
          <div class="col">
            <div class="dialog-label">
              Payment Type<span class="dialog-asterisk">*</span>
            </div>
            <q-select
              v-model="selectedPaymentType"
              :options="paymentTypes"
              outlined
              dense
              class="dialog-inputs"
              :rules="[(val) => !!val || 'Payment Type is required']"
            />
          </div>

          <!-- Payment Amount + Reference No -->
          <div class="col">
            <div class="dialog-label">
              Payment Amount<span class="dialog-asterisk">*</span>
            </div>
            <q-input
              v-model.number="paymentAmount"
              type="number"
              outlined
              dense
              class="dialog-inputs q-pb-xs"
              :rules="[
                (val) => !!val || 'Payment Amount is required',
                (val) => val > 0 || 'Must be greater than 0',
              ]"
            />
            <div
              v-if="
                selectedPaymentType === 'Bank Transfer' ||
                selectedPaymentType === 'Cheque'
              "
            >
              <div class="dialog-label q-mb-xs">
                Reference No.<span class="dialog-asterisk">*</span>
              </div>
              <q-input
                v-model="referenceNo"
                type="text"
                outlined
                dense
                class="dialog-inputs"
                placeholder="Enter bank transfer reference number"
                :rules="[(val) => !!val || 'Reference number is required']"
              />
            </div>
          </div>
          <div class="col">
            <div class="dialog-label">
              Company
              <span
                v-if="availablePaymentCompanies.length > 1"
                class="dialog-asterisk"
                >*</span
              >
            </div>
            <q-select
              v-model="selectedPaymentCompany"
              :options="availablePaymentCompanies"
              option-label="label"
              option-value="value"
              outlined
              dense
              class="dialog-inputs"
              :disable="availablePaymentCompanies.length <= 1"
              :rules="
                availablePaymentCompanies.length > 1
                  ? [(val) => !!val || 'Company is required for split payments']
                  : []
              "
              :hint="
                availablePaymentCompanies.length === 0
                  ? 'No items tagged with CC/DC. Company will not be saved.'
                  : availablePaymentCompanies.length === 1
                  ? `Auto-selected: ${
                      availablePaymentCompanies[0]?.label || ''
                    }`
                  : 'Select which company this payment belongs to.'
              "
            />
          </div>
        </div>

        <div class="q-mb-sm">
          <div class="dialog-label q-mb-xs">Remarks</div>
          <q-input
            v-model="creditRemarks"
            type="textarea"
            outlined
            dense
            class="dialog-inputs"
          />
        </div>

        <q-btn
          unelevated
          color="primary"
          label="Add Payment"
          class="full-width q-my-sm"
          @click="addPayment"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
  <!-- Delivery Exception Dialog -->
  <CreateExceptionDialog
    v-model="showDeliveryExceptionDialog"
    :delivery-id="delivery?.id"
    @saved="onExceptionSaved"
  />
<ExceptionDetailsDialog
  v-model="isExceptionDetailsOpen"
  :logistics-id="logistics?.logistics_id || logistics?.id"
  :group="selectedException"
  :transactions="transactions"
  :prefilled-delivered-date="deliveredDate"
  @updated="(async () => {
    await loadDeliveryExceptions();
    await updateDeliveryLogisticsStatus();
    deliveredDate = null;
    selectedException = null;
  })()"
/>

  <q-dialog
    v-model="showUpdateProductionDialog"
    persistent
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card style="min-width: 40em; max-width: 95vw">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Update Production
        </div>
        <q-btn
          icon="close"
          flat
          dense
          round
          class="absolute-top-right q-ma-sm"
          @click="showUpdateProductionDialog = false"
        />
      </q-card-section>
      <q-card-section class="q-pa-none">
        <UpdateProductionDialog
          :order="order"
          v-model:show="showUpdateProductionDialog"
          @saved="onProductionSaved"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog
    v-model="showUpdateLogisticsDialog"
    persistent
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card style="min-width: 40em; max-width: 95vw">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Update Logistics
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
        <UpdateLogisticsDialog
          :logistics="logistics"
          v-model:show="showUpdateLogisticsDialog"
          @saved="onLogisticsSaved"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog
    v-model="showDeliveryHistoryDialog"
    persistent
    transition-show="slide-down"
    transition-hide="slide-up"
  >
    <q-card style="min-width: 90vw">
      <q-card-section class="dialog-header">
        <div class="text-body1 text-uppercase text-weight-bold">
          Delivery History
        </div>
        <q-btn
          icon="close"
          flat
          dense
          round
          class="absolute-top-right q-ma-sm"
          @click="showDeliveryHistoryDialog = false"
        />
      </q-card-section>
      <q-card-section class="q-pa-none">
        <div class="full-container">
          <!-- ✅ pass the delivery row id, mirror CollectionHistory -->
          <DeliveryHistory
            v-if="selectedDeliveryId"
            :logisticsDeliveryId="selectedDeliveryId"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { onMounted, ref, computed, watch, nextTick } from "vue";
import { fetchAllErrorItems } from "@/../supabase/api/error_list.js";
import { useTransactionStore } from "@/stores/transactionStore";
import { useRoute } from "vue-router";
import { Notify } from "quasar";
import { useQuasar } from "quasar";
import UpdateCollectionDialog from "@/components/dialogs/UpdateCollectionDialog.vue";
import UpdateDeliveryDialog from "@/components/dialogs/UpdateDeliveryDialog.vue";
import UpdateProductionDialog from "@/components/dialogs/UpdateProductionDialog.vue";
import UpdateLogisticsDialog from "@/components/dialogs/UpdateLogisticsDialog.vue";
import CollectionHistory from "@/components/CollectionHistory.vue";
import DeliveryHistory from "@/components/DeliveryHistory.vue";
import AddErrorReportDialog from "@/components/dialogs/AddErrorReportDialog.vue";
import CreateExceptionDialog from "@/components/dialogs/CreateExceptionDialog.vue";
import ExceptionDetailsDialog from "@/components/dialogs/ExceptionDetailsDialog.vue";
import ccLogo from "@/assets/images/cc_logo.png";
import dcLogo from "@/assets/images/dc_logo.png";

const $q = useQuasar();
const transactionStore = useTransactionStore();
const route = useRoute();

// Initialize objects to prevent null errors
const order = ref({}); // Changed from null to an empty object
const customer = ref({});
const logistics = ref({});
const collection = ref({});
const delivery = ref({});
const transactions = ref([]);
const instructions = ref([]);
const reports = ref([]);
// Exception details dialog: picked Delivered Date for the group
const deliveredDate = ref(null);

const driverOptions = ref([]); // Initialize as a reactive array
const timeOptions = ref([]); // Initialize as a reactive array

const showCollectionHistoryDialog = ref(false);
const selectedCollectionId = ref(null);

const showDeliveryHistoryDialog = ref(false);
const selectedDeliveryId = ref(null);

const showUpdateProductionDialog = ref(false);
const showUpdateLogisticsDialog = ref(false);

const isExceptionDetailsOpen = ref(false);
const selectedException = ref(null);

function jobTypeLabel(p) {
  const s = String(p || "").toLowerCase();
  if (s === "laundry") return "Laundry";
  if (s === "dryclean") return "Dry Clean";
  if (s === "pressing") return "Pressing Only";
  if (s === "others") return "Others";
  return p || "-";
}

onMounted(async () => {
  try {
    console.log("🚀 Component mounted!");

    // ROUTE PARAM
    const orderNo = route.params.order_no;
    console.log("🔍 Route param - order_no:", orderNo);

    // LOAD DROPDOWN OPTIONS
    await transactionStore.loadDrivers();
    await transactionStore.loadTimeOptions();
    driverOptions.value = transactionStore.driverOptions;
    timeOptions.value = transactionStore.timeOptions;
    console.log("✅ Driver/Time options loaded.");

    // FETCH ORDER DETAILS
    const orderDetails = await transactionStore.fetchWholeOrderByOrderNo(
      orderNo
    );
    console.log("📦 orderDetails:", orderDetails);

    if (!orderDetails) {
      console.warn("⚠️ No order details found for:", orderNo);
      return;
    }

    logistics.value = orderDetails || {};
    order.value = orderDetails.order || {};
    customer.value = orderDetails.customer || {};
    collection.value = orderDetails.collection || {};
    delivery.value = orderDetails.delivery || {};
    transactions.value = [];

    (orderDetails.transactions || []).forEach((tx, i) => {
      if (Array.isArray(tx.order_transaction_items)) {
        tx.order_transaction_items.forEach((item) => {
          transactions.value.push({
            ...item,
            ready_status: item.ready_status === true,
          });
        });
      } else {
        console.warn(`⚠️ No items in transaction ${i}`);
      }
    });

    await loadDeliveryExceptions();

    reports.value = orderDetails.error_reports || [];
    console.log("📊 reports:", reports.value);

    instructions.value = [
      ...(orderDetails.instructions_onetime || []).map((instruction) => ({
        ...instruction,
        type: "onetime",
        to: [
          ...(instruction.admin ? ["admin"] : []),
          ...(instruction.cleaning ? ["cleaning"] : []),
          ...(instruction.packing ? ["packing"] : []),
          ...(instruction.picking_sending ? ["pickingsending"] : []),
        ],
      })),
      ...(orderDetails.instructions_recurring || []).map((instruction) => ({
        ...instruction,
        type: "recurring",
        to: [
          ...(instruction.admin ? ["admin"] : []),
          ...(instruction.cleaning ? ["cleaning"] : []),
          ...(instruction.packing ? ["packing"] : []),
          ...(instruction.picking_sending ? ["pickingsending"] : []),
        ],
      })),
    ];

    console.log("📋 Final instructions:", instructions.value);

    // LOAD ERROR ITEM OPTIONS
    const items = await fetchAllErrorItems();
    const categoriesSet = new Set(items.map((item) => item.category));
    reportCategories.value = Array.from(categoriesSet);
    if (reportCategories.value.length > 0) {
      selectedCategory.value = reportCategories.value[0];
      updateSubCategories(selectedCategory.value);
    }

    // LOAD ITEM OPTIONS FOR TRANSACTIONS
    await transactionStore.loadItems();
    console.log("🛒 Items loaded.");
  } catch (error) {
    console.error("❌ Error in merged onMounted:", error);
  }
});

watch(
  transactions,
  (newTransactions) => {
    newTransactions.forEach((t) => {
      const unit = getUnitForItem(t); // 'pc' | 'kg' | 'lbs' | 'sqft' | 'sqm'
      const isTBA =
        t.price == null ||
        (typeof t.price === "string" && t.price.toUpperCase() === "TBA");
      const price = isTBA ? 0 : parseFloat(t.price) || 0;
      const qty = parseFloat(t.quantity) || 0;
      const pcs = Math.max(Number(t.pieces ?? 0) || 1, 1); // default 1

      if (unit === "sqft" || unit === "sqm") {
        t.subtotal = +(price * qty * pcs).toFixed(2);
      } else {
        t.subtotal = +(price * qty).toFixed(2);
      }
    });
  },
  { deep: true }
);

function onReportAdded(newReport) {
  try {
    reports.value.push(newReport);
    Notify.create({ message: "Report list updated.", color: "green" });
  } catch (e) {
    Notify.create({ message: "Failed to update report list.", color: "red" });
  }
}

const goodsStatus = computed({
  get() {
    return order.value.order_production?.goods_status || "";
  },
  set(val) {
    if (!order.value.order_production) {
      order.value.order_production = {};
    }
    order.value.order_production.goods_status = val;
  },
});

const noPackets = computed({
  get() {
    return order.value.order_production?.no_packets || "";
  },
  set(val) {
    if (!order.value.order_production) {
      order.value.order_production = {};
    }
    order.value.order_production.no_packets = val;
  },
});

const noHangers = computed({
  get() {
    return order.value.order_production?.no_hangers || "";
  },
  set(val) {
    if (!order.value.order_production) {
      order.value.order_production = {};
    }
    order.value.order_production.no_hangers = val;
  },
});

const noRolls = computed({
  get() {
    return order.value.order_production?.no_rolls || "";
  },
  set(val) {
    if (!order.value.order_production) {
      order.value.order_production = {};
    }
    order.value.order_production.no_rolls = val;
  },
});

// Reactive variables for adding instructions
const instructionsType = ref("onetime");
const instructionsDesc = ref("");
const instructionsTo = ref([]);

// Helper functions for instruction chip colors and labels
function getSectionColor(section) {
  const colors = {
    cleaning: "teal",
    packing: "orange",
    pickingsending: "red",
    admin: "cyan",
  };
  return colors[section] || "grey";
}

function formatSectionLabel(section) {
  const labels = {
    cleaning: "Cleaning",
    packing: "Packing",
    pickingsending: "Picking/Sending",
    admin: "Admin",
  };
  return labels[section] || section;
}

// Reactive variables for categories and subcategories
const reportCategories = ref([]);
const reportSubCategories = ref([]);
const selectedCategory = ref("");
const selectedSubCategory = ref("");
const reportDesc = ref(""); // Holds the description for the report

function updateSubCategories(category) {
  fetchAllErrorItems()
    .then((items) => {
      reportSubCategories.value = items
        .filter((item) => item.category === category)
        .map((item) => item.sub_category);
      selectedSubCategory.value = ""; // Reset the selected sub-category
    })
    .catch((error) => {
      console.error("Error updating subcategories:", error);
    });
}

// Watch for changes in the selected category
watch(selectedCategory, (newCategory) => {
  if (newCategory) {
    updateSubCategories(newCategory);
  }
});

// Watchers for category and sub-category selection (optional, based on dynamic dropdowns)
watch(selectedCategory, (newCategory) => {
  if (newCategory) {
    // Dynamically update subcategories if needed
    console.log(`Selected category changed to: ${newCategory}`);
  }
});

// Computed properties for formatted display
const formattedCollectionDate = computed(() =>
  formatDate(collection.value.collection_date)
);
const formattedDeliveryDate = computed(() =>
  formatDate(delivery.value.delivery_date)
);

// Function to format dates as "Thu, 30/01/2025"
const formatDate = (dateString) => {
  if (!dateString) return "N/A"; // If the date is missing or null, return "N/A"

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A"; // If the date is invalid, return "N/A"

  return date.toLocaleDateString("en-GB", {
    weekday: "short", // "Thu"
    day: "2-digit", // "30"
    month: "2-digit", // "01"
    year: "numeric", // "2025"
  });
};

const formattedCollectionContactNos = computed({
  get() {
    const contact1 = collection.value.contact_person?.contact_no1 || "-";
    const contact2 = collection.value.contact_person?.contact_no2;

    // If contact2 exists, show "contact1 / contact2", otherwise just show contact1
    return contact2 ? `${contact1} / ${contact2}` : contact1;
  },
  set(value) {
    const [contact1, contact2] = value.split(" / ").map((num) => num.trim());
    collection.value.contact_person.contact_no1 = contact1 || "";

    // Only set contact_no2 if it was provided
    collection.value.contact_person.contact_no2 = contact2 || null;
  },
});

const formattedDeliveryContactNos = computed({
  get() {
    const contact1 = delivery.value.contact_person?.contact_no1 || "-";
    const contact2 = delivery.value.contact_person?.contact_no2;
    // If contact2 exists, show "contact1 / contact2", otherwise just show contact1
    return contact2 ? `${contact1} / ${contact2}` : contact1;
  },
  set(value) {
    const [contact1, contact2] = value.split(" / ").map((num) => num.trim());
    delivery.value.contact_person.contact_no1 = contact1 || "";
    delivery.value.contact_person.contact_no2 = contact2 || "";
  },
});

const contactOptions = ref([]);
const addressOptions = ref([]);

const updateOptions = async () => {
  try {
    const customerId = customer.value?.id || null;
    if (!customerId) {
      console.warn("No customer selected. Options cleared.");
      contactOptions.value = [];
      addressOptions.value = [];
      return;
    }

    // Fetch data from API or store
    await Promise.all([
      transactionStore.loadContactOptions(customerId),
      transactionStore.loadAddressOptions(customerId),
    ]);

    // Map data to dropdown options
    contactOptions.value = transactionStore.contactOptions.map((contact) => ({
      id: contact.id,
      name: contact.name, // Only include the name here
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

    // Set pre-selected values if they exist in collection
    if (collection.value.contactPerson) {
      const existingContact = contactOptions.value.find(
        (option) => option.id === collection.value.contactPerson
      );
      if (existingContact) {
        collection.value.contactPerson = existingContact.id;
      }
    }

    if (collection.value.address) {
      const existingAddress = addressOptions.value.find(
        (option) => option.id === collection.value.address
      );
      if (existingAddress) {
        collection.value.address = existingAddress.id;
      }
    }
  } catch (error) {
    console.error("Error fetching contact/address options:", error);
    contactOptions.value = [];
    addressOptions.value = [];
  }
};

// Watch for customer changes and update options
watch(customer, async () => {
  await updateOptions();
});

const openCustomerTab = (customerId) => {
  const url = `/customers/${customerId}`;
  window.open(url, "_blank"); // Open in a new tab
};

function onProductionSaved({ patch }) {
  // Minimal immutable-ish merge
  order.value = {
    ...(order.value || {}),
    ...patch,
    order_production: {
      ...(order.value?.order_production || {}),
      ...(patch?.order_production || {}),
    },
  };
  Notify.create({
    message: "Production details updated.",
    color: "green",
    icon: "check_circle",
  });
}

function onLogisticsSaved({ patch }) {
  logistics.value = { ...(logistics.value || {}), ...patch };
  Notify.create({
    message: "Logistics details updated.",
    color: "green",
    icon: "check_circle",
  });
}

const isDeleteInstructionDialogOpen = ref(false);
const instructionToDelete = ref({ id: null, type: null });

// Open the delete dialog
function openDeleteInstructionDialog(id, type) {
  instructionToDelete.value = { id, type };
  isDeleteInstructionDialogOpen.value = true;
}

// Confirm delete and call the store action
async function confirmDeleteInstruction() {
  if (!instructionToDelete.value.id || !instructionToDelete.value.type) return;

  try {
    await transactionStore.deleteInstruction(
      instructionToDelete.value.id,
      instructionToDelete.value.type
    );

    // Notify and update UI
    Notify.create({
      message: "Instruction deleted successfully!",
      color: "green",
    });
    instructions.value = instructions.value.filter(
      (instruction) => instruction.id !== instructionToDelete.value.id
    );

    // Reset dialog state
    instructionToDelete.value = { id: null, type: null };
    isDeleteInstructionDialogOpen.value = false;
  } catch (error) {
    console.error("Error deleting instruction:", error);
    Notify.create({
      message: "Failed to delete instruction. Please try again.",
      color: "red",
    });
  }
}

// Close the delete dialog
function closeDeleteInstructionDialog() {
  isDeleteInstructionDialogOpen.value = false;
  instructionToDelete.value = { id: null, type: null };
}

const isDeleteReportDialogOpen = ref(false);
const reportToDeleteId = ref(null);

function openDeleteReportDialog(reportId) {
  reportToDeleteId.value = reportId;
  isDeleteReportDialogOpen.value = true;
}

async function confirmDeleteReport() {
  if (!reportToDeleteId.value) return;

  try {
    await transactionStore.deleteReport(reportToDeleteId.value);

    // Notify success
    Notify.create({
      message: "Report deleted successfully!",
      color: "green",
    });

    // Close dialog
    isDeleteReportDialogOpen.value = false;
    reportToDeleteId.value = null;
  } catch (error) {
    // Notify failure
    Notify.create({
      message: "Failed to delete report. Please try again.",
      color: "red",
    });
    console.error("Error deleting report:", error);
  }
}

function closeDeleteReportDialog() {
  isDeleteReportDialogOpen.value = false;
  reportToDeleteId.value = null;
}
// Reactive state for delete dialog
const isDeleteTransactionDialogOpen = ref(false);
const transactionToDeleteIndex = ref(null);
const transactionToDeleteId = ref(null);

// Open delete confirmation dialog
function openDeleteTransactionDialog(index, transactionId) {
  transactionToDeleteIndex.value = index;
  transactionToDeleteId.value = transactionId;
  isDeleteTransactionDialogOpen.value = true;
}

// Confirm delete action
async function confirmDeleteTransaction() {
  if (transactionToDeleteId.value === null) return;

  try {
    // Call the transaction store to delete from the database
    await transactionStore.deleteTransaction(transactionToDeleteId.value);

    // Remove the transaction from the local array
    transactions.value.splice(transactionToDeleteIndex.value, 1);

    // Notify success
    Notify.create({
      message: "Transaction deleted successfully!",
      color: "green",
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    Notify.create({
      message: "Failed to delete transaction. Please try again.",
      color: "red",
    });
  } finally {
    // Reset dialog state
    isDeleteTransactionDialogOpen.value = false;
    transactionToDeleteIndex.value = null;
    transactionToDeleteId.value = null;
  }
}

// Cancel delete action
function cancelDeleteTransaction() {
  isDeleteTransactionDialogOpen.value = false;
  transactionToDeleteIndex.value = null;
  transactionToDeleteId.value = null;
}

const isAddTransactionDialogOpen = ref(false);
const openAddTransactionDialog = () =>
  (isAddTransactionDialogOpen.value = true);
const closeAddTransactionDialog = () =>
  (isAddTransactionDialogOpen.value = false);

// Data Initialization
onMounted(async () => {
  await transactionStore.loadItems();
});

// Options and Category Data
const categoryOptions = [
  "clothings",
  "beddings",
  "upholsteries",
  "miscellaneous",
  "onsite cleaning",
  "New Item",
];
const priceTypeOptions = ["Current", "TBA", "Custom"];
const unitTypeOptions = ["pc", "sqft", "kg"];
const processOptions = [
  { label: "Laundry", value: "laundry" },
  { label: "Dry Clean", value: "dryclean" },
  { label: "Pressing Only", value: "pressing" },
  { label: "Others", value: "others" },
];

const companyOptions = [
  { label: "CC", value: "cc" },
  { label: "DC", value: "dc" },
];

// Reactive Variables
const searchModeActive = ref(false);
const selectedSearchItemName = ref(null);
const selectedCategoryName = ref(null);
const selectedSubCategoryName = ref(null);
const selectedItemName = ref(null);
const newItemNameInput = ref("");
const newItemUnitType = ref(null);
const selectedPriceTypeOption = ref(null);
const selectedProcessOption = ref(null);
const priceInputValue = ref(null);

// Input Controls for Units
const pieceQuantityInput = ref(1);
const areaWidthInput = ref(0);
const areaBreadthInput = ref(0);
const weightInput = ref(0);

// Computed Properties
const isNewItemSelected = computed(
  () => selectedCategoryName.value === "New Item"
);

const filteredPriceTypeOptions = computed(() => {
  return isNewItemSelected.value && !searchModeActive.value
    ? priceTypeOptions.filter((type) => type !== "Current")
    : priceTypeOptions;
});

const filteredSubCategoryOptions = computed(() => {
  if (!selectedCategoryName.value) return [];
  return [
    ...new Set(
      transactionStore.items
        .filter((item) => item.category === selectedCategoryName.value)
        .map((item) => item.sub_category)
    ),
  ];
});

const filteredItemOptions = computed(() => {
  if (!selectedCategoryName.value || !selectedSubCategoryName.value) return [];
  return transactionStore.items
    .filter(
      (item) =>
        item.category === selectedCategoryName.value &&
        item.sub_category === selectedSubCategoryName.value
    )
    .map((item) => item.name);
});

const filteredSearchItemOptions = ref([]);
const filterSearchItemsByInput = (searchInput, updateCallback) => {
  filteredSearchItemOptions.value =
    searchInput === ""
      ? []
      : transactionStore.items
          .filter((item) =>
            item.name.toLowerCase().includes(searchInput.toLowerCase())
          )
          .map((item) => item.name);
  updateCallback();
};

const filteredProcessOptions = ref([]);
const selectedUnitType = computed(() => {
  const itemName = searchModeActive.value
    ? selectedSearchItemName.value
    : selectedItemName.value;
  const item = transactionStore.items.find((i) => i.name === itemName);
  return item ? item.unit : null;
});

// Calculations for Area and Subtotal
const computedArea = computed(() => {
  if (
    selectedUnitType.value === "sqft" ||
    (isNewItemSelected.value && newItemUnitType.value === "sqft")
  ) {
    return areaWidthInput.value * areaBreadthInput.value;
  }
  return 0;
});

const computedSubtotal = computed(() => {
  if (
    selectedUnitType.value === "sqft" ||
    (isNewItemSelected.value && newItemUnitType.value === "sqft")
  ) {
    return computedArea.value * numericPrice.value;
  } else if (
    selectedUnitType.value === "kg" ||
    (isNewItemSelected.value && newItemUnitType.value === "kg")
  ) {
    return weightInput.value * numericPrice.value;
  }
  return 0;
});

const numericPrice = computed(() => {
  const priceMatch = priceInputValue.value
    ? priceInputValue.value.match(/[\d.]+/)
    : null;
  return priceMatch ? parseFloat(priceMatch[0]) : 0;
});

// Functions
const resetInputs = () => {
  selectedCategoryName.value = null;
  selectedSubCategoryName.value = null;
  selectedItemName.value = null;
  newItemNameInput.value = "";
  selectedPriceTypeOption.value = null;
  selectedProcessOption.value = null;
  priceInputValue.value = null;
  selectedSearchItemName.value = null;
};

const clearSearchInput = () => {
  selectedSearchItemName.value = null;
};

const updateProcessOptionsList = () => {
  if (isNewItemSelected.value) {
    // If the category is 'New Item', use predefined options
    filteredProcessOptions.value = [
      "Laundry",
      "Dry Clean",
      "Pressing Only",
      "Others",
    ];
  } else {
    // Otherwise, derive process options based on the selected item
    const selectedItemBaseName = searchModeActive.value
      ? selectedSearchItemName.value
      : selectedItemName.value;
    const selectedItemData = transactionStore.items.find(
      (i) => i.name === selectedItemBaseName
    );

    filteredProcessOptions.value = selectedItemData
      ? [
          selectedItemData.laundry_price !== null ? "Laundry" : null,
          selectedItemData.dryclean_price !== null ? "Dry Clean" : null,
          selectedItemData.pressing_price !== null ? "Pressing Only" : null,
          selectedItemData.others_price !== null ? "Others" : null,
        ].filter(Boolean)
      : [];
  }
};

const calculatePriceForSelectedType = () => {
  const currentItemName = searchModeActive.value
    ? selectedSearchItemName.value
    : selectedItemName.value;
  const currentItemData = transactionStore.items.find(
    (i) => i.name === currentItemName
  );

  if (selectedPriceTypeOption.value === "Custom") {
    priceInputValue.value = null;
    isPriceInputDisabled.value = false;
  } else if (selectedPriceTypeOption.value === "TBA") {
    priceInputValue.value = "TBA";
    isPriceInputDisabled.value = true;
  } else if (
    selectedPriceTypeOption.value === "Current" &&
    selectedProcessOption.value &&
    currentItemData
  ) {
    const priceMap = {
      Laundry: currentItemData.laundry_price,
      "Dry Clean": currentItemData.dryclean_price,
      "Pressing Only": currentItemData.pressing_price,
      Others: currentItemData.others_price,
    };
    const processPrice = priceMap[selectedProcessOption.value];
    priceInputValue.value =
      processPrice !== null
        ? `$${processPrice.toFixed(2)} / ${currentItemData.unit}`
        : null;
    isPriceInputDisabled.value = true;
  }
};

const isPriceInputDisabled = ref(false);

const addTransactionItem = async () => {
  console.log("🚀 Starting addTransactionItem...");

  const unitType = isNewItemSelected.value
    ? newItemUnitType.value
    : selectedUnitType.value;

  let baseName = searchModeActive.value
    ? selectedSearchItemName.value
    : isNewItemSelected.value
    ? newItemNameInput.value
    : selectedItemName.value;

  if (!baseName) {
    console.error("❌ No item selected!");
    Notify.create({
      message: "Please select an item before adding.",
      color: "red",
    });
    return;
  }

  let itemDetails = "";
  let subtotalValue = 0; // ✅ Declare subtotalValue before using it

  // Calculate subtotal based on unit type
  if (unitType === "pc") {
    itemDetails = "";
    subtotalValue =
      selectedPriceTypeOption.value === "TBA"
        ? 0
        : pieceQuantityInput.value * numericPrice.value;
  } else if (unitType === "sqft") {
    itemDetails = ` (${computedArea.value.toFixed(2)} sqft)`;
    subtotalValue =
      selectedPriceTypeOption.value === "TBA"
        ? 0
        : computedArea.value * numericPrice.value;
  } else if (unitType === "kg") {
    itemDetails = ` (${weightInput.value} kg)`;
    subtotalValue =
      selectedPriceTypeOption.value === "TBA"
        ? 0
        : weightInput.value * numericPrice.value;
  }

  // Prepare the transaction payload
  const newTransaction = {
    order_id: order.value.id,
    item_name: `${baseName}${itemDetails}`,
    category: selectedCategoryName.value,
    price: selectedPriceTypeOption.value === "TBA" ? "TBA" : numericPrice.value,
    process: selectedProcessOption.value,
    quantity: pieceQuantityInput.value,
    subtotal: subtotalValue, // ✅ Now subtotalValue is properly defined
  };

  console.log("📤 Sending Transaction:", newTransaction);

  try {
    const addedTransaction = await transactionStore.addTransaction(
      newTransaction
    );
    console.log("✅ Transaction added:", addedTransaction);

    transactions.value.push(addedTransaction);
    Notify.create({
      message: "Transaction added successfully!",
      color: "green",
    });

    closeAddTransactionDialog();
  } catch (error) {
    console.error("❌ Error adding transaction:", error);
    Notify.create({
      message: "Failed to add transaction. Please try again.",
      color: "red",
    });
  }
};

watch(searchModeActive, resetInputs);
watch(
  [
    selectedPriceTypeOption,
    selectedProcessOption,
    selectedItemName,
    selectedSearchItemName,
  ],
  calculatePriceForSelectedType
);
watch(
  [
    selectedItemName,
    selectedSearchItemName,
    searchModeActive,
    selectedCategoryName,
  ],
  updateProcessOptionsList
);

watch(selectedSearchItemName, (newItemName) => {
  if (newItemName) {
    const selectedItem = transactionStore.items.find(
      (item) => item.name === newItemName
    );
    if (selectedItem) {
      selectedCategoryName.value = selectedItem.category || null;
    }
  }
});
// FILE: src/views/OrderView.vue (script setup) — replace your updateTransaction() and add a refresher
async function refreshTransactionsAndGoodsStatus() {
  const orderNo = route.params.order_no;
  const details = await transactionStore.fetchWholeOrderByOrderNo(orderNo);

  // Refresh order + goods status from DB
  order.value = details?.order || {};
  // If store returns goods_status inside order.order_production, the computed "goodsStatus" will reflect it.

  // Rebuild transactions from ACTIVE transaction(s) only
  const list = [];
  (details?.transactions || [])
    .filter((tx) => tx.status === "active") // guard against old versions
    .forEach((tx) => {
      (tx.order_transaction_items || []).forEach((item) => {
        list.push({
          ...item,
          ready_status: item.ready_status === true,
        });
      });
    });

  // Fallback: if API doesn’t include `status`, keep existing behavior
  if (!list.length && Array.isArray(details?.transactions)) {
    details.transactions.forEach((tx) => {
      (tx.order_transaction_items || []).forEach((item) => {
        list.push({ ...item, ready_status: item.ready_status === true });
      });
    });
  }

  transactions.value = list;
}

function computeOrderTotalFromUI() {
  // Why: all UI subtotals are already normalized; just sum safely
  const rows = Array.isArray(transactions.value) ? transactions.value : [];
  return rows.reduce((acc, it) => acc + (Number(it.subtotal) || 0), 0);
}

async function updateTransaction(orderId) {
  try {
    // Build payload from UI rows
    transactionStore.transactionItems = transactions.value.map((item) => {
      const unit =
        (item.unit || "").toLowerCase().trim() || getUnitForItem(item);
      const pieces = item.pieces != null ? Number(item.pieces) || 0 : null;

      return {
        item_name: item.item_name,
        price: item.price,
        process: item.process,
        quantity: Number(item.quantity ?? 0) || 0,
        subtotal: Number(item.subtotal ?? 0) || 0,
        pieces,
        category: item.category ?? null,
        sub_category: item.sub_category ?? null,
        tag_category: item.tag_category ?? null,
        unit,
        ready_status: item.ready_status === true,
        pack_type: item.pack_type ?? null,
        company: item.company ?? null,
      };
    });

    // 1) Persist the item changes
    await transactionStore.updateTransaction(orderId);

    // 2) Recompute current total from UI + sync order_payments
    const newTotal = computeOrderTotalFromUI();
    if (typeof transactionStore.syncOrderPaymentsTotals !== "function") {
      // Hard guard so you notice in dev if store method is missing
      throw new Error(
        "[OrderView] transactionStore.syncOrderPaymentsTotals() is missing"
      );
    }
    await transactionStore.syncOrderPaymentsTotals(orderId, newTotal);

    // 3) Refresh UI from DB (active items + payments/goods status)
    await refreshTransactionsAndGoodsStatus();

    Notify.create({
      message: "Transactions & invoice totals updated.",
      color: "green",
      icon: "check_circle",
    });
  } catch (error) {
    console.error("Error updating transactions:", error);
    Notify.create({
      message: "Failed to update transactions.",
      color: "red",
      icon: "error",
    });
  }
};

const computedPcs = (item) => {
  const pcs = parseFloat(item.pieces);
  return isNaN(pcs) ? 0 : pcs;
};

const isAddInstructionDialogOpen = ref(false);

const openAddInstructionDialog = () => {
  isAddInstructionDialogOpen.value = true;
};

const closeAddInstructionDialog = () => {
  isAddInstructionDialogOpen.value = false;
};

const addInstruction = async () => {
  try {
    if (!instructionsDesc.value || !instructionsTo.value.length) {
      Notify.create({
        message: "Instruction description and 'To' fields are required.",
        color: "red",
      });
      return;
    }

    const newInstruction = {
      description: instructionsDesc.value,
      type: instructionsType.value,
      to: [...instructionsTo.value],
    };

    await transactionStore.addInstruction(
      newInstruction,
      order.value.id,
      customer.value.id
    );

    instructionsDesc.value = "";
    instructionsTo.value = [];
    instructionsType.value = "onetime";

    Notify.create({
      message: "Instruction added successfully!",
      color: "green",
    });

    // Close the dialog
    closeAddInstructionDialog();
  } catch (error) {
    Notify.create({
      message: "Failed to add instruction. Please try again.",
      color: "red",
    });
  }
};

const isAddReportDialogOpen = ref(false);

const openAddReportDialog = () => {
  isAddReportDialogOpen.value = true;
};


const showUpdateCollectionDialog = ref(false);
const showUpdateDeliveryDialog = ref(false);

const updateCollection = async (logisticsId) => {
  try {
    const collectionData = await transactionStore.fetchCollectionByLogisticsId(
      logisticsId
    );
    if (!collectionData || collectionData.length === 0) {
      throw new Error("No collection data found!");
    }
    transactionStore.selectedCustomer = customer || null;
    transactionStore.selectedCollectionId = collectionData[0].id || null;
    transactionStore.selectedCollectionContact =
      collectionData[0].customer_contact_persons || null;
    transactionStore.selectedCollectionAddress =
      collectionData[0].address || null;
    transactionStore.selectedCollectionDriver =
      collectionData[0].driver_name || null;
    transactionStore.collectionDate = collectionData[0].collection_date || null;
    transactionStore.collectionTime = collectionData[0].collection_time || null;
    transactionStore.collectionRemarks = collectionData[0].remarks || null;
    transactionStore.collectionNoBags = collectionData[0].no_bags || null;
    transactionStore.logisticsId = collectionData[0].logistics_id || null;

    showUpdateCollectionDialog.value = true;
  } catch (error) {
    console.error("Error fetching collection details:", error);
  }
};

const updateDelivery = async (logisticsId) => {
  try {
    const deliveryData = await transactionStore.fetchDeliveryByLogisticsId(
      logisticsId
    );
    if (!deliveryData || deliveryData.length === 0) {
      throw new Error("No delivery data found!");
    }
    transactionStore.selectedCustomer = customer || null;
    transactionStore.selectedDeliveryId = deliveryData[0].id || null;
    transactionStore.selectedDeliveryContact =
      deliveryData[0].customer_contact_persons || null;
    transactionStore.selectedDeliveryAddress = deliveryData[0].address || null;
    transactionStore.selectedDeliveryDriver =
      deliveryData[0].driver_name || null;
    transactionStore.deliveryDate = deliveryData[0].delivery_date || null;
    transactionStore.deliveryTime = deliveryData[0].delivery_time || null;
    transactionStore.deliveryRemarks = deliveryData[0].remarks || null;
    transactionStore.logisticsId = deliveryData[0].logistics_id || null;

    showUpdateDeliveryDialog.value = true;
  } catch (error) {
    console.error("Error fetching delivery details:", error);
  }
};

// Payment dialog control
const showAddPaymentDialog = ref(false);

// Payment form state
const selectedPaymentType = ref("Cash");
const paymentTypes = ref([
  "Cash",
  "Bank Transfer",
  "Cheque",
  "Online Package Credits",
]); // Add your options here
const paymentAmount = ref(0);
const creditRemarks = ref("");

// Open dialog from button
const openAddPaymentDialog = () => {
  showAddPaymentDialog.value = true;
};

const referenceNo = ref("");

const addPayment = async () => {
  console.log("🔁 addPayment triggered");

  if (!selectedPaymentType.value || paymentAmount.value <= 0) {
    $q.notify({
      type: "negative",
      message: "Please select payment type and enter a valid amount.",
    });
    return;
  }

  // If there are multiple companies on this order, make sure one is selected
  if (
    availablePaymentCompanies.value.length > 1 &&
    !selectedPaymentCompany.value
  ) {
    $q.notify({
      type: "negative",
      message: "Please select a company for this payment.",
    });
    return;
  }

  console.log("💳 Selected payment type:", selectedPaymentType.value);
  console.log("🏢 Selected payment company:", selectedPaymentCompany.value);
  console.log("💰 Payment amount:", paymentAmount.value);

  const paymentSection = order.value?.order_payment;
  console.log("📦 order.order_payment:", paymentSection);

  const orderId = order.value?.id;
  console.log("🧾 Extracted order ID:", orderId);

  if (!orderId) {
    $q.notify({ type: "negative", message: "order ID is missing." });
    return;
  }

  // 🔐 This payload is what store.addPayment will use to:
  //  - update order_payments
  //  - insert into order_payments_history (including `company`)
  const paymentData = {
    order_id: orderId,
    type: selectedPaymentType.value,
    amount: paymentAmount.value,
    reference_no: referenceNo.value || null,
    company: selectedPaymentCompany.value || null, // <-- NEW: for order_payments_history.company
    remarks: creditRemarks.value || null, // <-- send remarks down as well
  };

  console.log("📤 Final payment data to send:", paymentData);

  try {
    await transactionStore.addPayment(paymentData);

    const outstanding = parseFloat(
      (order.order_payment?.total_amount || 0) -
        (order.order_payment?.paid_amount || 0) || 0
    );
    const overpaidAmount = paymentAmount.value - outstanding;

    console.log("📊 Overpaid amount:", overpaidAmount);

    if (overpaidAmount > 0) {
      const totalAmount = order.order_payment?.total_amount || 0;
      const alreadyPaid = order.order_payment?.paid_amount || 0;
      const unpaidAmount = totalAmount - alreadyPaid;

      const overpaidAmount = Math.max(paymentAmount.value - unpaidAmount, 0);

      if (overpaidAmount > 0) {
        await transactionStore.topUpCredits({
          customerId: customer.value.id,
          type: "Over Payment",
          amount: overpaidAmount,
          remarks: `Auto-credited from invoice #${orderId}`,
        });
        $q.notify({
          type: "info",
          message: `Overpayment of $${overpaidAmount.toFixed(
            2
          )} credited to customer.`,
        });
      }
      $q.notify({
        type: "info",
        message: `Overpayment of $${overpaidAmount.toFixed(
          2
        )} credited to customer.`,
      });
    }

    showAddPaymentDialog.value = false;
    selectedPaymentType.value = null;
    paymentAmount.value = 0;
    referenceNo.value = "";
    creditRemarks.value = "";
    selectedPaymentCompany.value = null;

    $q.notify({ type: "positive", message: "Payment added successfully." });
  } catch (error) {
    console.error("❌ Error adding payment:", error);
    $q.notify({
      type: "negative",
      message: "Failed to add payment. Please try again.",
    });
  }
};

const totalCredits = ref(0);

// --- Payment company handling for split invoicing ---

// Selected company for this payment (e.g. 'cc' or 'dc')
const selectedPaymentCompany = ref(null);

// Derive which companies are actually used in the transaction items
const availablePaymentCompanies = computed(() => {
  const used = new Set(
    transactions.value
      .map((t) => (t.company || "").toLowerCase())
      .filter(Boolean)
  );

  // ✅ If no items are tagged with a company, we return an empty array.
  //    That means: no company selection is shown / needed.
  if (!used.size) {
    return [];
  }

  // ✅ Otherwise, only show the companies that actually appear in the items.
  //    - If only 'cc' => returns [{ label: 'CC', value: 'cc' }]
  //    - If only 'dc' => returns [{ label: 'DC', value: 'dc' }]
  //    - If both      => returns both options
  return companyOptions.filter((opt) => used.has(opt.value));
});

// When dialog opens, auto-pick company if there is only one option
watch(showAddPaymentDialog, (open) => {
  if (open) {
    if (availablePaymentCompanies.value.length === 1) {
      // ✅ Only CC or only DC: auto select it
      selectedPaymentCompany.value = availablePaymentCompanies.value[0].value;
    } else {
      // ✅ 0 companies (no tagging) or 2 companies (split)
      selectedPaymentCompany.value = null;
    }
  }
});

watch(selectedPaymentType, async (newType) => {
  console.log("💡 Payment Type Changed:", newType);

  if (newType === "Online Package Credits" && customer.value?.id) {
    console.log("🔍 Fetching credits for customer ID:", customer.value.id);

    try {
      const creditData = await transactionStore.fetchCustomerCreditsById(
        customer.value.id
      );

      console.log("✅ Credits fetched:", creditData);

      totalCredits.value =
        (creditData?.online_package || 0) + (creditData?.other_credits || 0);

      console.log("📦 totalCredits updated to:", totalCredits.value);
    } catch (err) {
      console.error("❌ Failed to fetch customer credits:", err);
      Notify.create({
        message: "Failed to load credits. Try again.",
        color: "red",
      });
    }
  }
});

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

function formatAddress(addr) {
  if (!addr) return "-";
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
  return extra ? `${line} (${extra})` : line || "-";
}

const reloadCollectionAndDelivery = async () => {
  const orderNo = route.params.order_no;
  const details = await transactionStore.fetchWholeOrderByOrderNo(orderNo);
  logistics.value = details || {}; // <-- refresh logistics (must include delivered_date)
  collection.value = details?.collection || {};
  delivery.value = details?.delivery || {};
  await loadDeliveryExceptions();
};

const onCollectionDialogClosed = async () => {
  showUpdateCollectionDialog.value = false;
  await reloadCollectionAndDelivery();
  $q.notify({ type: "positive", message: "Collection updated." });
};

const onDeliveryDialogClosed = async () => {
  showUpdateDeliveryDialog.value = false;
  await reloadCollectionAndDelivery();
  $q.notify({ type: "positive", message: "Delivery updated." });
};

function openCollectionHistoryDialog() {
  selectedCollectionId.value = collection.value.id;
  showCollectionHistoryDialog.value = true;
}

const openDeliveryHistoryDialog = () => {
  selectedDeliveryId.value = delivery.value.id;
  showDeliveryHistoryDialog.value = true;
};

async function handlePrintInvoice(orderNoRaw) {
  const TAG = "[handlePrintInvoice]";
  console.log(`${TAG} start`, { orderNoRaw });

  try {
    const orderNo = String(orderNoRaw ?? "").trim();

    if (!orderNo) {
      Notify.create({
        type: "negative",
        message: "Order number is required.",
        icon: "error",
      });
      return false;
    }

    const res = await transactionStore.printInvoice(orderNo);
    console.log(`${TAG} result`, res);

    if (res?.ok) {
      const url = `/invoice/${encodeURIComponent(orderNo)}/${encodeURIComponent(
        res.invoiceNo
      )}/${encodeURIComponent(res.historyId)}`;
      console.log(`${TAG} opening`, { url });

      Notify.create({
        type: "positive",
        message: `Invoice history recorded for Order #${orderNo} (Invoice #${res.invoiceNo}).`,
        icon: "check_circle",
      });

      window.open(url, "_blank");
      return true;
    }

    Notify.create({
      type: "negative",
      message: res?.error || "Failed to create print history.",
      icon: "report_problem",
    });
    return false;
  } catch (err) {
    console.error(`${TAG} error`, err);
    Notify.create({
      type: "negative",
      message: err?.message || "Unexpected error while generating invoice.",
      icon: "error",
    });
    return false;
  }
}

const formatMoney = (val) => {
  const num = parseFloat(val);
  if (isNaN(num)) return "0.00";
  return num.toFixed(2);
};

/** Get unit safely from item; fallback by inferring from name */
function getUnitForItem(item) {
  const u = (item.unit || "").toString().toLowerCase().trim();
  if (u) return u;
  return inferUnitFromName(item.item_name || "");
}

/** When name contains “(… sqft)” or “kg”, infer unit; default pc */
function inferUnitFromName(name) {
  const s = (name || "").toLowerCase();
  if (s.includes("sqft")) return "sqft";
  if (s.includes("kg")) return "kg";
  return "pc";
}

/** Display label for unit in UI */
function unitLabel(u) {
  if (!u) return "";
  return u.toLowerCase() === "pc" ? "pcs" : u;
}

/** Price input shows only the number part (no /unit) */
function formatPriceNumber(price) {
  if (price === null || price === undefined) return 0;
  if (typeof price === "string" && price.toUpperCase() === "TBA") return 0;
  const n = Number(price);
  return Number.isFinite(n) ? n : 0;
}

/** Qty model for input: 2 decimals for non-pc, integer for pc */
function formatQtyModelValue(item) {
  const unit = getUnitForItem(item);
  const q = Number(item.quantity ?? 0);
  if (!Number.isFinite(q)) return unit === "pc" ? 0 : 0.0;
  return unit === "pc" ? Math.trunc(q) : Number(q.toFixed(2));
}

/** Handle price edits; keep numeric in state */
function onPriceInputChange(rowIndex, val) {
  const n = parseFloat(val);
  transactions.value[rowIndex].price = Number.isFinite(n) ? n : 0;
}

function onQtyInputChange(rowIndex, val) {
  const item = transactions.value[rowIndex];
  const unit = getUnitForItem(item);
  let q = parseFloat(val);
  if (!Number.isFinite(q) || q < 0) q = 0;
  item.quantity = unit === "pc" ? Math.trunc(q) : parseFloat(q.toFixed(2));

  const isTBA =
    item.price == null ||
    (typeof item.price === "string" && item.price.toUpperCase() === "TBA");
  const price = isTBA ? 0 : parseFloat(item.price) || 0;
  const pcs = Math.max(Number(item.pieces ?? 0) || 1, 1);

  item.subtotal =
    unit === "sqft" || unit === "sqm"
      ? +(price * item.quantity * pcs).toFixed(2)
      : +(price * item.quantity).toFixed(2);
}

const showDeliveryExceptionDialog = ref(false);
async function onExceptionSaved() {
  await loadDeliveryExceptions();
  await updateDeliveryLogisticsStatus();
}
// This will be built from `transactions`
const deliveryExceptionItems = ref([]);

const deliveryExceptions = ref([]); // rows from logistics_delivery_exceptions

async function loadDeliveryExceptions() {
  try {
    const logisticsId =
      logistics.value?.logistics_id || logistics.value?.id || null;

    if (!logisticsId) {
      console.warn("[loadDeliveryExceptions] Missing logistics_id");
      deliveryExceptions.value = [];
      return;
    }

    const rows =
      (await transactionStore.fetchDeliveryExceptionsByLogisticsId(
        logisticsId
      )) || [];

    deliveryExceptions.value = Array.isArray(rows) ? rows : [];
    console.log(
      "[loadDeliveryExceptions] exceptions:",
      deliveryExceptions.value
    );

    // ✅ If the dialog is open, re-compute the delivered date for the selected group
    if (isExceptionDetailsOpen.value && selectedException.value) {
      deliveredDate.value = deliveredDateForGroup(selectedException.value);
    }
  } catch (err) {
    console.error("[loadDeliveryExceptions] error", err);
    deliveryExceptions.value = [];
  }
}

const deliveryPlanGroups = computed(() => {
  const groupsMap = new Map();

  const fmtDate = (dateStr) => {
    if (!dateStr) return "[No date]";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "[Invalid date]";
    return d.toLocaleDateString("en-SG", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // --- 0) Build base items and exception qty map (for pc unit) ---

  const baseItems = (transactions.value || []).map((item) => ({
    id: item.id,
    name: item.item_name,
    qty: parseFloat(item.quantity) || 0,
    unit: getUnitForItem(item), // "pc" | "kg" | "sqft"
    company: item.company || null,
  }));

  // itemId -> total exception qty (pcs only)
  const exceptionQtyByItemId = new Map();

  (deliveryExceptions.value || []).forEach((ex) => {
    const tx = (transactions.value || []).find(
      (t) => String(t.id) === String(ex.order_transaction_item_id)
    );
    if (!tx) {
      console.warn(
        "[deliveryPlanGroups] Exception references missing item",
        ex.order_transaction_item_id
      );
      return;
    }

    const unit = getUnitForItem(tx);
    if (unit !== "pc") {
      // only track pcs here; others show full qty in main
      return;
    }

    const txQty = parseFloat(tx.quantity) || 0;
    let exQty =
      ex.quantity != null && !isNaN(parseFloat(ex.quantity))
        ? parseFloat(ex.quantity)
        : txQty; // if no quantity given, assume "all"

    if (exQty <= 0) return;

    const current = exceptionQtyByItemId.get(tx.id) || 0;
    exceptionQtyByItemId.set(tx.id, current + exQty);
  });

  // --- 1) MAIN DELIVERY GROUP ---

  if (
    delivery.value &&
    (delivery.value.delivery_date ||
      delivery.value.delivery_time ||
      delivery.value.driver_id)
  ) {
    const key = [
      delivery.value.delivery_date || "",
      delivery.value.delivery_time || "",
      delivery.value.driver_id || "",
      "MAIN",
    ].join("__");

    const mainItems = baseItems
      .map((bi) => {
        let mainQty = bi.qty;

        if (bi.unit === "pc") {
          const excQty = exceptionQtyByItemId.get(bi.id) || 0;
          mainQty = Math.max(0, bi.qty - excQty);
        }
        // for non-pc units, keep full qty in main

        return {
          ...bi,
          qty: mainQty,
        };
      })
      .filter((bi) => bi.qty > 0); // only show if something left for main

    if (mainItems.length > 0) {
      groupsMap.set(key, {
        key,
        type: "main",
        isException: false,
        date: delivery.value.delivery_date || null,
        time: delivery.value.delivery_time || null,
        driverId: delivery.value.driver_id || null,
        driverName: getDriverName(delivery.value.driver_id),
        items: mainItems,
        label: `Main Delivery • ${fmtDate(delivery.value.delivery_date)}${
          delivery.value.delivery_time
            ? " • " + delivery.value.delivery_time
            : ""
        } • ${getDriverName(delivery.value.driver_id)}`,
      });
    }
  }

  // --- 2) EXCEPTION GROUPS ---

  (deliveryExceptions.value || []).forEach((ex) => {
    const tx = (transactions.value || []).find(
      (t) => String(t.id) === String(ex.order_transaction_item_id)
    );

    if (!tx) {
      console.warn(
        "[deliveryPlanGroups] Exception references missing item (for grouping)",
        ex.order_transaction_item_id
      );
      return;
    }

    const unit = getUnitForItem(tx);
    const txQty = parseFloat(tx.quantity) || 0;

    const key = [
      ex.delivery_date || "",
      ex.delivery_time || "",
      ex.driver_id || "",
      "EXC",
    ].join("__");

    let group = groupsMap.get(key);
    if (!group) {
      group = {
        key,
        type: "exception",
        isException: true,
        date: ex.delivery_date || null,
        time: ex.delivery_time || null,
        driverId: ex.driver_id || null,
        driverName: getDriverName(ex.driver_id),
        items: [],
        remarks: ex.remarks || null,
      };

      group.label = [
        "Exception",
        group.date ? fmtDate(group.date) : "[No date]",
        group.time || "",
        group.driverName || "[No driver]",
      ]
        .filter(Boolean)
        .join(" • ");

      groupsMap.set(key, group);
    }

    let exQty =
      ex.quantity != null && !isNaN(parseFloat(ex.quantity))
        ? parseFloat(ex.quantity)
        : txQty;

    if (exQty <= 0) return;

    group.items.push({
      id: tx.id,
      name: tx.item_name,
      qty: exQty,
      unit,
      company: tx.company || null,
    });
  });

  // --- 3) Filter out empty groups & sort ---

  const groups = Array.from(groupsMap.values()).filter(
    (g) => Array.isArray(g.items) && g.items.length > 0
  );

  groups.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    if (da !== db) return da - db;

    const ta = (a.time || "").toString();
    const tb = (b.time || "").toString();
    if (ta !== tb) return ta.localeCompare(tb);

    const aIsMain = a.type === "main" ? 0 : 1;
    const bIsMain = b.type === "main" ? 0 : 1;
    return aIsMain - bIsMain;
  });

  return groups;
});

function perUnitPieces(item) {
  const n = Number(item.pieces_per_unit ?? item.pieces ?? 0);
  return Number.isFinite(n) ? n : 0;
}

// Group transactions by effective unit
const pcItems = computed(() =>
  (transactions.value || []).filter((i) => getUnitForItem(i) === "pc")
);

const weightItems = computed(() =>
  (transactions.value || []).filter((i) => {
    const u = getUnitForItem(i);
    return u === "kg" || u === "lbs";
  })
);

const sizeItems = computed(() =>
  (transactions.value || []).filter((i) => {
    const u = getUnitForItem(i);
    return u === "sqft" || u === "sqm";
  })
);

// Keep sets for multi-piece pc items (price/qty suffix)
function qtyUnitLabel(item) {
  const unit = getUnitForItem(item);
  if (unit === "pc" && perUnitPieces(item) > 1) return "sets";
  return unitLabel(unit);
}
function priceUnitLabel(item) {
  const unit = getUnitForItem(item);
  if (unit === "pc" && perUnitPieces(item) > 1) return "set";
  return unitLabel(unit);
}

function onPiecesInputChange(rowIndex, val) {
  const n = parseInt(val, 10);
  const safe = Number.isFinite(n) && n >= 0 ? n : 0;
  const item = transactions.value[rowIndex];
  item.pieces = safe;

  const unit = getUnitForItem(item);
  const isTBA =
    item.price == null ||
    (typeof item.price === "string" && item.price.toUpperCase() === "TBA");
  const price = isTBA ? 0 : parseFloat(item.price) || 0;
  const pcs = Math.max(Number(item.pieces ?? 0) || 1, 1);
  const qty = parseFloat(item.quantity) || 0;

  item.subtotal =
    unit === "sqft" || unit === "sqm"
      ? +(price * qty * pcs).toFixed(2)
      : +(price * qty).toFixed(2);
}

function subtotalBreakdown(item) {
  const unit = getUnitForItem(item);
  const priceNum = parseFloat(item.price);
  const isTBA =
    item.price == null ||
    (typeof item.price === "string" && item.price.toUpperCase() === "TBA") ||
    !Number.isFinite(priceNum);

  const qty = Number(item.quantity ?? 0) || 0;
  const pcs = Math.max(Number(item.pieces ?? 0) || 1, 1);

  if (isTBA) return "Price is TBA → subtotal treated as $0.00";

  if (unit === "sqft" || unit === "sqm") {
    const subtotal = (priceNum * qty * pcs).toFixed(2);
    return `$${priceNum.toFixed(2)} / ${unit} × ${qty} ${unit}${
      pcs > 1 ? ` × ${pcs} pcs` : ""
    } = $${subtotal}`;
  }

  // existing behavior for others
  const priceUnit = priceUnitLabel(item);
  const qtyUnit = unitLabel(unit);
  const subtotal = (priceNum * qty).toFixed(2);
  let line = `$${priceNum.toFixed(
    2
  )} / ${priceUnit} × ${qty} ${qtyUnit} = $${subtotal}`;
  if (unit === "pc" && perUnitPieces(item) > 1) {
    line += `\n(${perUnitPieces(item)} pcs per set)`;
  }
  if ((unit === "kg" || unit === "lbs") && item.pieces > 0) {
    line += `\nNote: Pieces are recorded for reference and do not change the price.`;
  }
  return line;
}

const totalsAmounts = computed(() => {
  let piece = 0,
    weight = 0,
    size = 0;
  for (const it of transactions.value || []) {
    const u = getUnitForItem(it);
    const sub = Number(it.subtotal) || 0;
    if (u === "pc") piece += sub;
    else if (u === "kg" || u === "lbs") weight += sub;
    else if (u === "sqft" || u === "sqm") size += sub;
  }
  return { piece, weight, size, total: piece + weight + size };
});

function totalPiecesForPc(item) {
  // pieces-per-unit (fallback to 1) × quantity
  const per = Math.max(perUnitPieces(item) || 1, 1);
  const qty = Number(item.quantity ?? 0) || 0;
  return per * qty;
}

const exceptionGroups = computed(() =>
  (deliveryPlanGroups.value || []).filter((g) => g.isException)
);

function openExceptionDetails(group) {
  selectedException.value = group;
  // ✅ Pre-fill from DB if present and consistent across the group's rows
  deliveredDate.value = deliveredDateForGroup(group);
  isExceptionDetailsOpen.value = true;
}

function closeExceptionDetails() {
  isExceptionDetailsOpen.value = false;
  selectedException.value = null;
}

function formatDateLine(dateStr) {
  if (!dateStr) return "[No date]";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "[Invalid date]";
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Find the base transaction row by item (exception uses transaction item id) */
function txById(id) {
  return (
    (transactions.value || []).find((t) => String(t.id) === String(id)) || null
  );
}

/** Pretty process label like your main tables */
function processLabelForTxId(id) {
  const tx = txById(id);
  if (!tx) return "-";
  const p = (tx.process || "").toLowerCase();
  if (p === "laundry") return "Laundry";
  if (p === "dryclean") return "Dry Clean";
  if (p === "pressing") return "Pressing Only";
  if (p === "others") return "Others";
  return tx.process || "-";
}

/** Show price as number or TBA with unit suffix like main tables */
function priceDisplayForTxId(id) {
  const tx = txById(id);
  if (!tx) return "$0.00";
  const isTBA =
    tx.price == null ||
    (typeof tx.price === "string" && tx.price.toUpperCase() === "TBA");
  if (isTBA) return "TBA";
  const num = parseFloat(tx.price) || 0;
  return `$${num.toFixed(2)} / ${priceUnitLabel(tx)}`;
}

/** Pieces column mirrors your logic */
function piecesForTxId(id) {
  const tx = txById(id);
  if (!tx) return 0;
  return computedPcs(tx); // you already have this util
}

/** Numeric formatting for qty/size/weight cells */
function formatNumber(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0";
  // integers for pcs, 2dp otherwise (matches your inputs)
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

/** Compute subtotal for an exception item using your existing rules */
function excSubtotalForItem(excItem) {
  const tx = txById(excItem.id);
  if (!tx) return 0;

  const unit = getUnitForItem(tx); // existing util
  const isTBA =
    tx.price == null ||
    (typeof tx.price === "string" && tx.price.toUpperCase() === "TBA");
  const price = isTBA ? 0 : parseFloat(tx.price) || 0;

  const excQty = Number(excItem.qty) || 0; // quantity for this exception
  const pcs = Math.max(Number(tx.pieces ?? 0) || 1, 1);

  // mirror your main subtotal logic
  const val =
    unit === "sqft" || unit === "sqm" ? price * excQty * pcs : price * excQty;

  return +val.toFixed(2);
}

/** Header label to match section tables */
function qtyHeaderForUnit(unit) {
  const u = (unit || "").toLowerCase();
  if (u === "kg" || u === "lbs") return "Weight";
  if (u === "sqft" || u === "sqm") return "Size";
  return "Qty";
}

function excSubtotalBreakdown(excItem) {
  const tx = txById(excItem.id);
  if (!tx) return "Item not found.";

  const unit = getUnitForItem(tx);
  const priceNum = parseFloat(tx.price);
  const isTBA =
    tx.price == null ||
    (typeof tx.price === "string" && tx.price.toUpperCase() === "TBA") ||
    !Number.isFinite(priceNum);

  const qty = Number(excItem.qty) || 0; // exception quantity
  const pcs = Math.max(Number(tx.pieces ?? 0) || 1, 1);

  if (isTBA) return "Price is TBA → subtotal treated as $0.00";

  if (unit === "sqft" || unit === "sqm") {
    const subtotal = (priceNum * qty * pcs).toFixed(2);
    return `$${priceNum.toFixed(2)} / ${unit} × ${qty} ${unit}${
      pcs > 1 ? ` × ${pcs} pcs` : ""
    } = $${subtotal}`;
  }

  const priceUnit = priceUnitLabel(tx);
  const qtyUnit = unitLabel(unit);
  const subtotal = (priceNum * qty).toFixed(2);
  let line = `$${priceNum.toFixed(
    2
  )} / ${priceUnit} × ${qty} ${qtyUnit} = $${subtotal}`;

  if (unit === "pc" && perUnitPieces(tx) > 1) {
    line += `\n(${perUnitPieces(tx)} pcs per set)`;
  }
  if ((unit === "kg" || unit === "lbs") && tx.pieces > 0) {
    line += `\nNote: Pieces are recorded for reference and do not change the price.`;
  }
  return line;
}

function isMainDelivered() {
  const l = logistics.value || {};
  return Boolean(l.delivered_date || l.deliveredDate);
}

function countDeliveredExceptions() {
  const rows = Array.isArray(deliveryExceptions.value)
    ? deliveryExceptions.value
    : [];
  const delivered = rows.filter(
    (r) => r.delivered_date || r.deliveredDate
  ).length;
  return { total: rows.length, delivered };
}

// --- Place inside <script setup> of OrderView.vue ---

/** Group matcher: returns raw exception rows that belong to a computed group */
function exceptionRowsForGroup(group) {
  const rows = Array.isArray(deliveryExceptions.value)
    ? deliveryExceptions.value
    : [];

  const day = group?.date
    ? new Date(group.date).toISOString().slice(0, 10)
    : null;
  const time = (group?.time || "").toString();
  const driverId = group?.driverId ?? group?.driver_id ?? null;

  return rows.filter((r) => {
    const rDate = r.delivery_date
      ? new Date(r.delivery_date).toISOString().slice(0, 10)
      : null;
    const rTime = (r.delivery_time || "").toString();
    const rDriverId = r.driver_id ?? null;
    return (
      rDate === day &&
      rTime === time &&
      String(rDriverId ?? "") === String(driverId ?? "")
    );
  });
}

async function updateDeliveryLogisticsStatus() {
  try {
    const logisticsId = logistics.value?.logistics_id || logistics.value?.id;
    if (!logisticsId) return;

    const mainDone = isMainDelivered();

    const rows = Array.isArray(deliveryExceptions.value)
      ? deliveryExceptions.value
      : [];
    const total = rows.length;
    const delivered = rows.filter(
      (r) => r.delivered_date || r.deliveredDate
    ).length;

    let next = null;

    if (mainDone && delivered === total) {
      next = "delivery completed";
    } else if (mainDone || delivered > 0) {
      next = "delivery partial";
    } else {
      next = "delivery scheduled";
    }

    // Compare lowercase to lowercase to avoid unnecessary writes
    const current = (logistics.value.logistics_status || "").toLowerCase();
    const desired = (next || "").toLowerCase();

    if (current !== desired) {
      await transactionStore.updateLogistics(logisticsId, {
        logistics_status: next,
      });
      logistics.value.logistics_status = next;
    }
  } catch (e) {
    console.error("[updateDeliveryLogisticsStatus] write failed", e);
  }
}

async function markExceptionGroupDelivered() {
  try {
    if (!selectedException.value) {
      Notify.create({
        type: "negative",
        message: "No exception group selected.",
      });
      return;
    }
    const rows = exceptionRowsForGroup(selectedException.value);
    if (!rows.length) {
      Notify.create({
        type: "warning",
        message: "No exception rows found for the selected group.",
      });
      return;
    }

    const ids = rows.map((r) => r.id).filter((id) => id != null);
    if (!ids.length) {
      Notify.create({
        type: "warning",
        message: "No valid exception IDs found to update.",
      });
      return;
    }

    if (
      typeof transactionStore.markDeliveryExceptionsDelivered !== "function"
    ) {
      Notify.create({
        type: "negative",
        message: "Store method markDeliveryExceptionsDelivered() is missing.",
      });
      return;
    }

    await transactionStore.markDeliveryExceptionsDelivered(
      ids,
      deliveredDate.value
    );

    // Refresh and recompute status
    await loadDeliveryExceptions();

    // Reset UI state
    deliveredDate.value = null;
    isExceptionDetailsOpen.value = false;
    selectedException.value = null;

    Notify.create({
      type: "positive",
      message: "Exception group marked as delivered.",
    });
  } catch (err) {
    console.error("[markExceptionGroupDelivered] error", err);
    Notify.create({
      type: "negative",
      message: "Failed to mark exception group as delivered.",
    });
  }
}

function toDateOnly(v) {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  // handle 'YYYY-MM-DD' or ISO strings from DB
  const iso = new Date(v);
  if (!isNaN(iso.getTime())) return iso.toISOString().slice(0, 10);
  const s = String(v).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

/** Compute a group's delivered date from its raw exception rows.
 *  - If all rows share the same delivered_date → return it (YYYY-MM-DD)
 *  - If mixed or none → return null
 */
function deliveredDateForGroup(group) {
  const rows = exceptionRowsForGroup(group);
  const dates = rows
    .map((r) => r.delivered_date ?? r.deliveredDate ?? null)
    .map(toDateOnly)
    .filter(Boolean);

  if (!dates.length) return null;

  const unique = Array.from(new Set(dates));
  return unique.length === 1 ? unique[0] : null;
}

async function markExceptionGroupUndelivered() {
  try {
    if (!selectedException.value) {
      Notify.create({
        type: "negative",
        message: "No exception group selected.",
      });
      return;
    }

    const rows = exceptionRowsForGroup(selectedException.value);
    if (!rows.length) {
      Notify.create({
        type: "warning",
        message: "No exception rows found for the selected group.",
      });
      return;
    }

    const ids = rows.map((r) => r.id).filter((id) => id != null);
    if (!ids.length) {
      Notify.create({
        type: "warning",
        message: "No valid exception IDs found to update.",
      });
      return;
    }

    await transactionStore.clearDeliveryExceptionsDelivered(ids);

    // Refresh and recompute status
    await loadDeliveryExceptions();

    deliveredDate.value = null;
    isExceptionDetailsOpen.value = false;
    selectedException.value = null;

    Notify.create({
      type: "positive",
      message: "Exception group marked as undelivered.",
    });
  } catch (err) {
    console.error("[markExceptionGroupUndelivered] error", err);
    Notify.create({
      type: "negative",
      message: "Failed to mark exception group as undelivered.",
    });
  }
}

// FILE: src/views/OrderView.vue  (inside <script setup>)

// --- Numeric input helpers: allow digits + one dot; optional leading minus (for negatives).
function sanitizeToNumberDot(str, allowNegative = false) {
  if (typeof str !== "string") str = String(str ?? "");
  let out = "";
  let hasDot = false;
  let started = false; // once any non-leading-minus char is added

  for (const ch of str.trim()) {
    if (ch >= "0" && ch <= "9") {
      out += ch;
      started = true;
      continue;
    }
    if (ch === "." && !hasDot) {
      out += ".";
      hasDot = true;
      started = true;
      continue;
    }
    if (allowNegative && ch === "-" && !started && out === "") {
      out = "-"; // only at beginning
      continue;
    }
    // ignore other chars
  }
  // avoid outputs like "-" or "." alone
  if (out === "-" || out === "." || out === "-.") return "";
  return out;
}

/**
 * Keypress guard used in q-input @keypress to restrict input.
 * currentValue: pass e.target.value from the template for correct dot handling.
 */
function allowOnlyNumberDot(evt, allowNegative = false, currentValue = "") {
  // Non-character keys (e.g., Arrow keys) often don't fire keypress, but guard anyway.
  const k = evt.key;

  // Allow control combinations (copy/paste etc.)
  if (evt.ctrlKey || evt.metaKey) return;

  // Allow navigation & editing keys (defensive for some browsers emitting keypress)
  const allowedNonChar = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
    "Tab",
    "Enter",
  ];
  if (allowedNonChar.includes(k)) return;

  // Digits always ok
  if (k >= "0" && k <= "9") return;

  // Dot: only one allowed and not if current already has a dot
  if (k === "." && !String(currentValue).includes(".")) return;

  // Minus: only if negatives allowed and only at start
  if (
    k === "-" &&
    allowNegative &&
    (currentValue == null || String(currentValue).length === 0)
  )
    return;

  // Otherwise block
  evt.preventDefault();
}

/**
 * Paste handler: sanitize pasted text; replace current selection with cleaned value.
 */
function onPasteNumberDot(evt, allowNegative = false) {
  const clipboard = evt.clipboardData || window.clipboardData;
  const pasted = clipboard ? clipboard.getData("text") : "";
  const sanitized = sanitizeToNumberDot(pasted, allowNegative);

  // If sanitization changes text, replace manually and dispatch input event so v-model updates.
  if (sanitized !== pasted) {
    evt.preventDefault();
    const inputEl = evt.target;
    if (!inputEl) return;

    const start = inputEl.selectionStart ?? inputEl.value.length;
    const end = inputEl.selectionEnd ?? inputEl.value.length;
    const before = inputEl.value.slice(0, start);
    const after = inputEl.value.slice(end);
    inputEl.value = before + sanitized + after;

    // Trigger Vue to pick up the programmatic change
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

// Split rows of the SELECTED exception by unit
const pcExcRows = computed(() => {
  const rows = selectedException.value?.items || [];
  return rows.filter((it) => {
    const tx = txById(it.id);
    return tx && getUnitForItem(tx) === "pc";
  });
});

const kgExcRows = computed(() => {
  const rows = selectedException.value?.items || [];
  return rows.filter((it) => {
    const tx = txById(it.id);
    return tx && getUnitForItem(tx) === "kg";
  });
});

const sqftExcRows = computed(() => {
  const rows = selectedException.value?.items || [];
  return rows.filter((it) => {
    const tx = txById(it.id);
    return tx && getUnitForItem(tx) === "sqft";
  });
});

// For PC rows: show "set" if multi-piece, otherwise "pcs"
function rowQtySuffix(excItem) {
  const tx = txById(excItem.id);
  if (!tx) return "";
  const unit = getUnitForItem(tx);
  if (unit === "pc") {
    return perUnitPieces(tx) > 1 ? "set" : "pcs";
  }
  return unit; // fallback (not used for kg/sqft here)
}

// Sum total of the selected exception
const totalExceptionAmount = computed(() => {
  const rows = selectedException.value?.items || [];
  return rows.reduce((sum, r) => sum + (excSubtotalForItem(r) || 0), 0);
});

const brandLogoSrc = computed(() => {
  const companies = new Set(
    (Array.isArray(transactions.value) ? transactions.value : [])
      .map(i => (i?.company ? String(i.company).toLowerCase().trim() : ""))
      .filter(Boolean)
  );
  if (companies.size !== 1) return null; // mixed or none → no logo
  const only = [...companies][0];
  if (only === "cc") return ccLogo;
  if (only === "dc") return dcLogo;
  return null;
});

</script>

<style scoped>
.pos-rel {
  position: relative;
}
.calc-help {
  position: absolute;
  right: 4px;
  bottom: 4px;
  opacity: 0.7;
  cursor: help;
}
.calc-help:hover,
.calc-help:focus {
  opacity: 1;
}
.item-name-textarea :deep(.q-field__native) {
  white-space: pre-wrap; /* wrap long names */
  overflow-wrap: anywhere; /* break long words */
}

.col[style*="min-width: 0"],
.item-name-textarea {
  min-width: 0; /* prevents content from forcing row overflow */
}

.unit-totals-right {
  display: flex;
  justify-content: flex-end;
}
.unit-totals-card {
  max-width: 520px;
  min-width: 360px;
}
.unit-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 4px 0;
}
.unit-label {
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
  opacity: 0.75;
}
.unit-value {
  text-align: right;
  font-weight: 600;
}
.unit-money {
  font-weight: 700;
}
.unit-line.grand .unit-label {
  opacity: 1;
}
.unit-line.grand .unit-value {
  font-size: 1.1rem;
}
.unit-dim {
  opacity: 0.7;
}
</style>
