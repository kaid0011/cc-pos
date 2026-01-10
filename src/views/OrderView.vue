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
                style="height: 50px; width: auto; vertical-align: middle"
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
                        {{ exc.totalCount || 0 }} item{{
                          exc.totalCount === 1 ? "" : "s"
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

        <q-card-section class="q-pa-none">
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
          <div class="unit-totals-right line-height-1">
            <q-card flat bordered class="unit-totals-card q-pa-sm">
              <div class="unit-line">
                <span class="unit-label">Per Piece</span>

                <span class="unit-value"
                  >${{ formatMoney(totalsAmounts.piece) }}</span
                >
              </div>

              <div class="unit-line">
                <span class="unit-label">By Weight</span>

                <span class="unit-value"
                  >${{ formatMoney(totalsAmounts.weight) }}</span
                >
              </div>

              <div class="unit-line">
                <span class="unit-label">By Size</span>

                <span class="unit-value"
                  >${{ formatMoney(totalsAmounts.size) }}</span
                >
              </div>

              <div v-if="mergedDiscountsAndCharges.length > 0">
                <q-separator spaced />

                <div
                  v-for="(rule, index) in mergedDiscountsAndCharges"
                  :key="'summary-' + index"
                  class="unit-line"
                >
                  <span
                    class="unit-label text-capitalize text-left"
                    style="
                      max-width: 200px;
                      white-space: normal;
                      line-height: 1.1;
                    "
                  >
                    {{ rule.description || "Adjustment" }}

                    <span v-if="rule.value_type === 'percent'"
                      >({{ rule.percentage }}%)</span
                    >:
                  </span>

                  <span
                    class="unit-value"
                    :class="
                      rule.dc_type === 'discount'
                        ? 'text-green-8'
                        : 'text-red-8'
                    "
                  >
                    {{
                      formatCurrencyDisplay(
                        rule.dc_type === "discount"
                          ? -Math.abs(rule.totalAmount)
                          : rule.totalAmount
                      )
                    }}
                  </span>
                </div>
              </div>

              <q-separator spaced />

              <div class="unit-line grand">
                <span class="unit-label">Total Amount</span>

                <span class="unit-value text-red-9">
                  ${{ formatMoney(finalOrderTotal) }}
                </span>
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

      <div class="col-12 q-mt-md">
        <q-card class="preview-card">
          <div class="row justify-between items-center">
            <div class="text-subtitle1 text-uppercase text-weight-bolder">
              Applied Discounts & Charges
            </div>

            <div class="q-gutter-x-sm">
              <q-btn
                label="Add Discount/Charge"
                color="primary"
                icon="sell"
                dense
                flat
                class="q-px-sm"
                @click="openAddDiscountDialog"
              />
            </div>
          </div>

        <q-separator class="q-mt-xs" />

          <q-card-section>
            <div class="transaction-summary">
              <div class="row row-col-header order-header text-center">
                <div class="col-5 text-weight-bold bordered">Description</div>

                <div class="col-2 text-weight-bold bordered">Type</div>

                <div class="col-2 text-weight-bold bordered">Amount</div>

                <div class="col-3 text-weight-bold bordered">
                  Amount After Applied
                </div>
              </div>

              <div
                v-if="mergedDiscountsAndCharges.length === 0"
                class="text-center q-pa-md text-grey"
              >
                No discounts or charges found.
              </div>

              <div
                v-for="(rule, index) in mergedDiscountsAndCharges"
                :key="'rule-' + index"
                class="row row-col-row order-row items-center"
                :class="{ 'bg-grey-1': rule.isCustomerRule }"
              >
                <div class="col-5 bordered text-left q-pl-sm">
                  <div class="text-weight-medium">
                    {{
                      rule.description ||
                      (rule.isCustomerRule ? "Customer Rule" : "No description")
                    }}
                  </div>

                  <div class="text-caption text-grey">
                    <span v-if="rule.code" class="q-mr-sm"
                      >Code: {{ rule.code }}</span
                    >

                    <span v-if="rule.isCustomerRule">
                      Global / Customer Account
                    </span>

                    <span
                      v-else
                      class="cursor-pointer text-primary"
                      style="text-decoration: underline"
                      @click="openAppliedItemsDialog(rule)"
                    >
                      (Applied to {{ rule.count }} items)
                    </span>
                  </div>
                </div>

                <div class="col-2 bordered text-center text-capitalize">
                  {{ rule.dc_type }}

                  <span class="text-grey-7">({{ rule.value_type }})</span>
                </div>

                <div
                  class="col-2 bordered text-center text-weight-bold"
                  :class="rule.dc_type === 'charge' ? 'text-red' : 'text-green'"
                >
                  <span v-if="rule.value_type === 'percent'">
                    {{ rule.percentage }}% ({{
                      formatCurrencyDisplay(
                        rule.dc_type === "discount"
                          ? -Math.abs(rule.totalAmount)
                          : rule.totalAmount
                      )
                    }})
                  </span>

                  <span v-else>
                    {{
                      formatCurrencyDisplay(
                        rule.dc_type === "discount"
                          ? -Math.abs(rule.totalAmount)
                          : rule.totalAmount
                      )
                    }}
                  </span>
                </div>

                <div class="col-3 bordered text-center text-weight-bold">
                  ${{ formatMoney(rule.amountAfterApplied) }}

                  <q-tooltip>
                    {{
                      rule.isCustomerRule
                        ? "Applied to Total Order"
                        : "Applied to Item Subtotals"
                    }}
                  </q-tooltip>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
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

  <AddPaymentDialog
    v-model:show="showAddPaymentDialog"
    :order="order"
    :customer="customer"
    @saved="onPaymentSaved"
  />
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
    @updated="
      (async () => {
        await loadDeliveryExceptions();

        await updateDeliveryLogisticsStatus();

        deliveredDate = null;

        selectedException = null;
      })()
    "
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

  <q-dialog v-model="showAppliedItemsDialog">
    <q-card style="min-width: 600px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-capitalize">{{ selectedRuleTitle }}</div>

        <q-space />

        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="text-caption text-grey q-mb-md">
          This rule was applied to the following transaction items:
        </div>

        <q-markup-table dense flat bordered>
          <thead class="bg-grey-2">
            <tr>
              <th class="text-left">Item Name</th>

              <th class="text-right">Qty</th>

              <th class="text-right">Subtotal</th>

              <th class="text-right">Effect</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, idx) in selectedRuleItems" :key="idx">
              <td class="text-left">{{ item.name }}</td>

              <td class="text-right">{{ item.quantity }} {{ item.unit }}</td>

              <td class="text-right">${{ formatMoney(item.subtotal) }}</td>

              <td class="text-right text-weight-bold">
                ${{ item.effectValue }}
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

<AddDiscountChargeDialog
    v-model:show="showAddDiscountDialog"
    :order-id="order?.id"
    :transactions="transactions"
    @saved="onDiscountSaved"
  />
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
import AddPaymentDialog from "@/components/dialogs/AddPaymentDialog.vue";
import AddDiscountChargeDialog from "@/components/dialogs/AddDiscountChargeDialog.vue";
import ccLogo from "@/assets/images/cc_logo.png";
import dcLogo from "@/assets/images/dc_logo.png";

const $q = useQuasar();
const transactionStore = useTransactionStore();
const route = useRoute();

const order = ref({}); // Changed from null to an empty object
const customer = ref({});
const logistics = ref({});
const collection = ref({});
const delivery = ref({});
const transactions = ref([]);
const instructions = ref([]);
const reports = ref([]);
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

    await loadDiscountsAndCharges();
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
    // 1. Prepare Payload
    transactionStore.transactionItems = transactions.value.map((item) => {
      const unit =
        (item.unit || "").toLowerCase().trim() || getUnitForItem(item);
      const pieces = item.pieces != null ? Number(item.pieces) || 0 : null;

      return {
        id: item.id, // <--- (+) ADD THIS LINE (Preserve the ID)
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

    // 2. Persist the item changes to the database

    // This updates 'order_transaction_items' but leaves 'order_payments' alone

    await transactionStore.updateTransaction(orderId);

    // 3. Refresh UI Data

    await refreshTransactionsAndGoodsStatus();

    // Optional: Refresh discounts just in case item changes affect visual % calculations in the UI

    await loadDiscountsAndCharges();

    Notify.create({
      message: "Transactions updated successfully.",

      color: "green",

      icon: "check_circle",
    });
    await checkSyncStatus();
  } catch (error) {
    console.error("Error updating transactions:", error);

    Notify.create({
      message: "Failed to update transactions.",

      color: "red",

      icon: "error",
    });
  }
}

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

const openAddPaymentDialog = () => {
  showAddPaymentDialog.value = true;
};

function onPaymentSaved({ patch }) {
  Object.assign(order.value, patch);
  if (order.value.order_payment) {
    Object.assign(order.value.order_payment, patch.order_payment);
  }
  showAddPaymentDialog.value = false;
}

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
  const logisticsId = logistics.value?.logistics_id || logistics.value?.id;

  if (!logisticsId) return;

  // Use the new clean function

  const rows = await transactionStore.fetchDeliveryExceptionsByLogisticsId(
    logisticsId
  );

  // Directly assign the nested structure

  deliveryExceptions.value = rows;

  console.log(
    "Successfully loaded nested exceptions:",

    deliveryExceptions.value
  );
}

const deliveryPlanGroups = computed(() => {
  const groups = [];

  const fmtDate = (dateStr) => {
    if (!dateStr) return "[No date]";

    const d = new Date(dateStr);

    return isNaN(d.getTime())
      ? "[Invalid date]"
      : d.toLocaleDateString("en-SG", {
          weekday: "short",

          day: "2-digit",

          month: "2-digit",

          year: "numeric",
        });
  };

  // --- Process Exception Headers ---

  deliveryExceptions.value.forEach((header) => {
    // 1. Map the nested items

    const subItems = (header.logistics_delivery_exception_items || []).map(
      (si) => {
        const tx = transactions.value.find(
          (t) => String(t.id) === String(si.order_transaction_item_id)
        );

        return {
          id: si.order_transaction_item_id,

          name: tx?.item_name || "Unknown Item",

          qty: parseFloat(si.quantity) || 0,

          // This is the total pieces (calculated total for PC, manual for KG)

          pieces: parseFloat(si.pieces) || 0,

          unit: tx ? getUnitForItem(tx) : "pc",
        };
      }
    );

    if (subItems.length > 0) {
      // 2. THE FIX: Sum the pieces column directly for the badge

      // No more (qty * pieces) here!

      const totalPcsInGroup = subItems.reduce(
        (sum, item) => sum + item.pieces,

        0
      );

      groups.push({
        id: header.id,

        key: `EXC_${header.id}`,

        type: "exception",

        isException: true,

        date: header.delivery_date,

        time: header.delivery_time,

        driverName: getDriverName(header.driver_id),

        remarks: header.remarks,

        items: subItems,

        totalCount: totalPcsInGroup, // Used in the q-chip

        label: `Exception • ${fmtDate(header.delivery_date)}`,
      });
    }
  });

  return groups.sort((a, b) => new Date(a.date) - new Date(b.date));
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
  // Use the database 'pieces' column as the per-set multiplier

  const per = Math.max(parseFloat(item.pieces) || 1, 1);

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

/** Match rows for "Mark Delivered" actions */

function exceptionRowsForGroup(group) {
  // Since group is now 1:1 with header, just return that row

  return deliveryExceptions.value.filter(
    (r) => String(r.id) === String(group.id)
  );
}

function deliveredDateForGroup(group) {
  const row = deliveryExceptions.value.find(
    (r) => String(r.id) === String(group.id)
  );

  return toDateOnly(row?.delivered_date || row?.deliveredDate);
}

/** Compute subtotal for an exception item */

function excSubtotalForItem(excItem) {
  const tx = txById(excItem.id);

  if (!tx) return 0;

  const price =
    typeof tx.price === "string" && tx.price.toUpperCase() === "TBA"
      ? 0
      : parseFloat(tx.price) || 0;

  const qty = Number(excItem.qty) || 0;

  const pcsMultiplier =
    getUnitForItem(tx) === "sqft" ? Number(tx.pieces) || 1 : 1;

  return +(price * qty * pcsMultiplier).toFixed(2);
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

      .map((i) => (i?.company ? String(i.company).toLowerCase().trim() : ""))

      .filter(Boolean)
  );

  if (companies.size !== 1) return null; // mixed or none → no logo

  const only = [...companies][0];

  if (only === "cc") return ccLogo;

  if (only === "dc") return dcLogo;

  return null;
});

// ... existing imports

// --- STATE ---

const rawAppliedRules = ref([]);

const customerRules = ref([]);

// --- DIALOG STATE (Add this) ---

const showAppliedItemsDialog = ref(false);

const selectedRuleItems = ref([]);

const selectedRuleTitle = ref("");

// --- UPDATED COMPUTED PROPERTY: Includes "After Applied" Calculation ---

const uniqueAppliedRules = computed(() => {
  const groups = {};

  rawAppliedRules.value.forEach((row) => {
    // Grouping Key

    const key = `${row.dc_type}-${row.value_type}-${row.percentage}-${row.amount}-${row.description}`;

    if (!groups[key]) {
      groups[key] = {
        ...row,

        count: 0,

        totalAmount: 0,

        totalOriginalSubtotal: 0, // NEW: Track sum of item subtotals before adjustment

        linkedItemIds: [],
      };
    }

    groups[key].count++;

    groups[key].linkedItemIds.push(row.order_transaction_item_id);

    // --- CALCULATION LOGIC ---

    let impact = 0;

    let lineTotal = 0;

    // Find the specific transaction item this rule is attached to

    const item = transactions.value.find(
      (t) => t.id === row.order_transaction_item_id
    );

    if (item) {
      const basePrice =
        typeof item.price === "string" && item.price.toUpperCase() === "TBA"
          ? 0
          : Number(item.price || 0);

      const qty = Number(item.quantity || 0);

      const unit = getUnitForItem(item);

      const pcs = item.pieces && unit === "sqft" ? Number(item.pieces) : 1;

      if (unit === "sqft" || unit === "sqm") {
        lineTotal = basePrice * qty * pcs;
      } else {
        lineTotal = basePrice * qty;
      }
    }

    if (row.value_type === "amount") {
      impact = Number(row.amount || 0);
    } else if (row.value_type === "percent") {
      impact = lineTotal * (Number(row.percentage) / 100);
    }

    // Add to group totals

    groups[key].totalAmount += impact;

    groups[key].totalOriginalSubtotal += lineTotal;
  });

  // Calculate the final "After Applied" for the group

  return Object.values(groups).map((g) => {
    // If it's a discount, we subtract the totalAmount from original subtotal.

    // If it's a charge, we add it.

    const modifier = g.dc_type === "discount" ? -1 : 1;

    const netImpact = Math.abs(g.totalAmount) * modifier;

    return {
      ...g,

      amountAfterApplied: g.totalOriginalSubtotal + netImpact,
    };
  });
});

// --- UPDATED DIALOG FUNCTION (Fixing 'percent' check) ---

const openAppliedItemsDialog = (rule) => {
  const typeStr = rule.dc_type === "discount" ? "Discount" : "Charge";

  selectedRuleTitle.value = `${typeStr}: ${rule.description || "N/A"}`;

  const relevantIds = rule.linkedItemIds || [];

  const items = transactions.value.filter((t) => relevantIds.includes(t.id));

  selectedRuleItems.value = items.map((t) => {
    let effectValue = 0;

    const basePrice = Number(t.price || 0);

    const qty = Number(t.quantity || 0);

    const pcs = t.pieces ? Number(t.pieces) : 1;

    // CHECK FOR 'percent' HERE

    if (rule.value_type === "percent") {
      const lineTotal =
        getUnitForItem(t) === "sqft" ? basePrice * qty * pcs : basePrice * qty;

      effectValue = lineTotal * (Number(rule.percentage) / 100);
    } else {
      effectValue = Number(rule.amount || 0);
    }

    return {
      name: t.item_name,

      quantity: t.quantity,

      unit: getUnitForItem(t),

      subtotal: t.subtotal,

      effectValue: effectValue.toFixed(2),
    };
  });

  showAppliedItemsDialog.value = true;
};

// --- FETCH LOGIC ---

const loadDiscountsAndCharges = async () => {
  try {
    // 1. Fetch Customer Rules

    if (customer.value?.id) {
      customerRules.value = await transactionStore.fetchCustomerDiscounts(
        customer.value.id
      );
    }

    // 2. Fetch Applied Order Rules

    const itemIds = transactions.value.map((t) => t.id).filter((id) => id);

    if (itemIds.length > 0) {
      rawAppliedRules.value = await transactionStore.fetchAppliedOrderDiscounts(
        itemIds
      );
    } else {
      rawAppliedRules.value = [];
    }
  } catch (error) {
    console.error("Failed to load discounts:", error);

    $q.notify({ type: "warning", message: "Could not load discounts/charges" });
  }
};

// NEW: Helper to format currency as -$10.00 instead of $-10.00

const formatCurrencyDisplay = (val) => {
  const num = parseFloat(val);

  if (isNaN(num)) return "$0.00";

  const sign = num < 0 ? "-" : "+";

  const absValue = Math.abs(num).toFixed(2);

  return `${sign}$${absValue}`;
};

// --- NEW COMPUTED PROPERTY: Calculate Customer Rule Values ---

const processedCustomerRules = computed(() => {
  // Customer rules generally apply to the whole order total

  const currentTotal = totalsAmounts.value.total || 0;

  return customerRules.value.map((rule) => {
    let impact = 0;

    // Calculate Impact based on Total Order Amount

    if (rule.value_type === "amount") {
      impact = Number(rule.amount || 0);
    } else if (rule.value_type === "percent") {
      impact = currentTotal * (Number(rule.percentage) / 100);
    }

    // Determine if we add or subtract

    const modifier = rule.dc_type === "discount" ? -1 : 1;

    const netImpact = Math.abs(impact) * modifier;

    return {
      ...rule,

      calculatedAmount: impact, // The dollar value of the rule

      amountAfterApplied: currentTotal + netImpact, // The order total if this rule is applied
    };
  });
});

// --- MERGED COMPUTED PROPERTY ---

const mergedDiscountsAndCharges = computed(() => {
  const list = [];

  // 1. PROCESS ORDER-BASED RULES (Item Level)

  const groupMap = {};

  rawAppliedRules.value.forEach((row) => {
    const key = `${row.dc_type}-${row.value_type}-${row.percentage}-${row.amount}-${row.description}`;

    if (!groupMap[key]) {
      groupMap[key] = {
        ...row,

        count: 0,

        totalAmount: 0,

        totalOriginalSubtotal: 0,

        linkedItemIds: [],

        isCustomerRule: false, // Flag to distinguish in UI
      };
    }

    groupMap[key].count++;

    groupMap[key].linkedItemIds.push(row.order_transaction_item_id);

    // Calculate Impact per Item

    let impact = 0;

    let lineTotal = 0;

    const item = transactions.value.find(
      (t) => t.id === row.order_transaction_item_id
    );

    if (item) {
      const basePrice =
        typeof item.price === "string" && item.price.toUpperCase() === "TBA"
          ? 0
          : Number(item.price || 0);

      const qty = Number(item.quantity || 0);

      const unit = getUnitForItem(item);

      const pcs = item.pieces && unit === "sqft" ? Number(item.pieces) : 1;

      lineTotal =
        unit === "sqft" || unit === "sqm"
          ? basePrice * qty * pcs
          : basePrice * qty;
    }

    if (row.value_type === "amount") {
      impact = Number(row.amount || 0);
    } else if (row.value_type === "percent") {
      impact = lineTotal * (Number(row.percentage) / 100);
    }

    groupMap[key].totalAmount += impact;

    groupMap[key].totalOriginalSubtotal += lineTotal;
  });

  // Finalize Order Rules and push to list

  Object.values(groupMap).forEach((g) => {
    const modifier = g.dc_type === "discount" ? -1 : 1;

    const netImpact = Math.abs(g.totalAmount) * modifier;

    list.push({
      ...g,

      amountAfterApplied: g.totalOriginalSubtotal + netImpact,
    });
  });

  // 2. PROCESS CUSTOMER-BASED RULES (Global Level)

  const currentOrderTotal = totalsAmounts.value.total || 0;

  customerRules.value.forEach((rule) => {
    let impact = 0;

    if (rule.value_type === "amount") {
      impact = Number(rule.amount || 0);
    } else if (rule.value_type === "percent") {
      impact = currentOrderTotal * (Number(rule.percentage) / 100);
    }

    const modifier = rule.dc_type === "discount" ? -1 : 1;

    const netImpact = Math.abs(impact) * modifier;

    list.push({
      ...rule,

      count: 0, // Not applied to specific item count

      totalAmount: impact, // Standardize variable name for the UI

      isCustomerRule: true,

      amountAfterApplied: currentOrderTotal + netImpact,
    });
  });

  // 3. SORT: Percent first, then Amount

  return list.sort((a, b) => {
    // If types are different, put 'percent' before 'amount'

    if (a.value_type === "percent" && b.value_type !== "percent") return -1;

    if (a.value_type !== "percent" && b.value_type === "percent") return 1;

    return 0; // Keep original order if types match
  });
});

// --- NEW COMPUTED PROPERTY: Net Total (Subtotal - Discounts + Charges) ---

const finalOrderTotal = computed(() => {
  let total = totalsAmounts.value.total || 0; // Start with Item Subtotals

  mergedDiscountsAndCharges.value.forEach((rule) => {
    // Determine monetary impact

    const amount = Number(rule.totalAmount) || 0;

    if (rule.dc_type === "discount") {
      total -= Math.abs(amount);
    } else {
      total += Math.abs(amount);
    }
  });

  return Math.max(total, 0); // Ensure total doesn't go below 0
});

// --- ADD DISCOUNT STATE ---

const showAddDiscountDialog = ref(false);

async function onDiscountSaved() {
  // 1. Refresh UI Data (Discounts list)
  await loadDiscountsAndCharges();

  // 2. Refresh order details (to show updated Invoice Balance/Total)
  const details = await transactionStore.fetchWholeOrderByOrderNo(
    route.params.order_no
  );
  order.value = details?.order || {};

  // 3. Verify Sync (Reuse your helper)
  await checkSyncStatus();
}

// --- INTEGRITY CHECKER ---

const isTotalSynced = computed(() => {
  // If data isn't loaded yet, assume synced to avoid false alarms

  if (!order.value?.order_payment) return true;

  const dbTotal = Number(order.value.order_payment.total_amount || 0);

  const calcTotal = Number(finalOrderTotal.value || 0);

  // Check difference (allow tiny float margin)

  return Math.abs(dbTotal - calcTotal) < 0.01;
});
async function checkSyncStatus() {
  // Wait for UI to re-render/re-calculate based on new data
  await nextTick();

  if (!isTotalSynced.value) {
    $q.notify({
      type: "negative",
      icon: "report_problem",
      message: `CRITICAL ERROR: Totals Unsynced! DB: $${formatMoney(
        order.value?.order_payment?.total_amount
      )} vs Calc: $${formatMoney(
        finalOrderTotal.value
      )}. Please inform IT immediately.`,
      timeout: 0,
      closeBtn: "Dismiss",
      group: "sync-warning",
    });
  } else {
    Notify.create({
      message: "DB total amount and UI total amound in-sync",

      color: "green",

      icon: "check_circle",
    });
  }
}
watch(
  () => transactions.value.length,

  async () => {
    await loadDiscountsAndCharges();
  }
);
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

  padding: 0;
}

.unit-label {
  text-transform: uppercase;

  letter-spacing: 0.04em;

  font-weight: 600;

  color: rgb(39, 109, 131);
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
