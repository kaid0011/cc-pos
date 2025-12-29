<template>
  <div class="full-container">
    <div class="q-pa-md">
      <q-card flat class="order-banner bg-blue-grey text-white">
        <div class="flex justify-between items-center q-pa-sm">
          <div class="text-left">
            <img
              v-if="brandLogoSrc"
              :src="brandLogoSrc"
              alt="Brand logo"
              style="height: 50px; width: auto; vertical-align: middle"
            />
          </div>

          <div
            class="text-h6 text-uppercase text-weight-bolder order-box text-center q-pa-sm"
          >
            Pack Details
          </div>
        </div>
      </q-card>
    </div>

    <div class="row q-col-gutter-md q-px-md line-height-1">
      <div class="col-4 q-pt-md" style="min-height: 100%">
        <q-card class="order-container" style="padding: 1em">
          <div class="text-subtitle1 text-uppercase text-weight-bolder">
            Order Details
          </div>
          <q-separator class="q-my-xs" />
          <div class="row text-slip-row row-col-row">
            <div class="col-6">Order No:</div>
            <div class="col-6 text-h6 text-weight-bold text-primary">
              {{ order?.order_no || "N/A" }}
            </div>
          </div>

          <div class="row text-slip-row row-col-row">
            <div class="col-6">
              <div>Order Date:</div>
            </div>
            <div class="col-6">
              {{ formatDate(order?.created_at) }}
            </div>
          </div>

          <div class="row text-slip-row row-col-row">
            <div class="col-6">
              <div>Job Type:</div>
            </div>
            <div class="col-6 text-capitalize">
              {{ logistics?.job_type }}
            </div>
          </div>

          <div class="row text-slip-row row-col-row">
            <div class="col-6">
              <div>Urgency:</div>
            </div>
            <div class="col-6 text-capitalize">
              {{ logistics?.urgency || "-" }}
            </div>
          </div>
        </q-card>
        <q-card class="order-container" style="padding: 1em">
          <div class="text-subtitle1 text-uppercase text-weight-bolder">
            Customer Details
          </div>
          <q-separator class="q-my-xs" />
          <div class="row text-slip-row row-col-row" style="height: 100%">
            <div class="col-6">
              <span v-if="customer?.type == 'Contract'">Company Name:</span>
              <span v-else>Customer Name:</span>
            </div>
            <div class="col-6">
              <a
                class="text-weight-bold"
                @click.prevent="openCustomerTab(customer.id)"
                >{{ customer.name }}</a
              >
            </div>
          </div>
          <div class="row text-slip-row row-col-row">
            <div class="col-6">
              <div>Customer Type:</div>
            </div>
            <div class="col-6">
              {{ customer?.type || "N/A"
              }}<span v-if="customer.sub_type && customer.sub_type != '-'">
                - {{ customer.sub_type }}</span
              >
            </div>
          </div>
          <div class="row text-slip-row row-col-row">
            <div class="col-6">
              <div>Contact No/s:</div>
            </div>
            <div class="col-6">
              <template v-if="customerPhones.length">
                <template
                  v-for="(ph, i) in customerPhones"
                  :key="'cust-ph-' + i"
                >
                  <a :href="phoneHref(ph)">{{ ph }}</a
                  ><span v-if="i < customerPhones.length - 1"> / </span>
                </template>
              </template>
              <template v-else>-</template>
            </div>
          </div>
          <div class="row text-slip-row row-col-row">
            <div class="col-6">
              <div>Email Address:</div>
            </div>
            <div class="col-6">
              <template v-if="customer?.email">
                <a :href="mailtoHref(customer.email)">{{ customer.email }}</a>
              </template>
              <template v-else>N/A</template>
            </div>
          </div>
        </q-card>
        <q-card class="order-container" style="padding: 1em; margin-bottom: 0">
          <div class="row items-center">
            <div class="text-subtitle1 text-uppercase text-weight-bolder">
              Packing Details
            </div>
          </div>
          <q-separator class="q-my-xs" />
          <q-card-section class="q-pb-sm">
            <div class="row q-mb-xs text-center">
              <div class="col q-mr-sm">
                <div class="text-weight-bold q-mb-xs">Hang</div>
                <div class="">
                  <q-input v-model="noHangers" dense outlined />
                </div>
              </div>
              <div class="col q-mr-sm">
                <div class="text-weight-bold q-mb-xs">Pack</div>
                <div class="">
                  <q-input v-model="noPackets" dense outlined />
                </div>
              </div>
              <div class="col q-mr-sm">
                <div class="text-weight-bold q-mb-xs">Roll</div>
                <div class="">
                  <q-input v-model="noRolls" dense outlined />
                </div>
              </div>
              <div class="col q-mr-sm">
                <div class="text-weight-bold q-mb-xs">Return</div>
                <div class="">
                  <q-input v-model="noReturns" dense outlined />
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="q-pa-none">
            <q-btn
              label="Save Details"
              color="primary"
              unelevated
              @click="updatePackDetails"
            />
          </q-card-actions>
        </q-card>
      </div>
      <div class="col-4 q-pt-md" style="min-height: 100%">
        <q-card class="slip-card">
          <div class="text-subtitle1 text-uppercase text-weight-bolder">
            Collection Details
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
              <template v-if="collectionPhones.length">
                <template
                  v-for="(ph, i) in collectionPhones"
                  :key="'col-ph-' + i"
                >
                  <a :href="phoneHref(ph)">{{ ph }}</a
                  ><span v-if="i < collectionPhones.length - 1"> / </span>
                </template>
              </template>
              <template v-else>-</template>
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
        </q-card>
      </div>
      <div class="col-4 q-pt-md" style="min-height: 100%">
        <q-card class="slip-card">
          <div class="text-subtitle1 text-uppercase text-weight-bolder">
            Delivery Details
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
              <template v-if="deliveryPhones.length">
                <template
                  v-for="(ph, i) in deliveryPhones"
                  :key="'del-ph-' + i"
                >
                  <a :href="phoneHref(ph)">{{ ph }}</a
                  ><span v-if="i < deliveryPhones.length - 1"> / </span>
                </template>
              </template>
              <template v-else>-</template>
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
        </q-card>
      </div>
    </div>

    <q-card class="slip-card q-ma-md">
      <div class="row justify-around line-height-1 text-subtitle1">
        <div class="col-auto">
          Logistics Status:
          <span>
            <q-badge
              :color="badgeColorForLogistics(logistics?.logistics_status)"
              class="q-px-md q-ml-xs text-subtitle1 text-uppercase"
              align="middle"
            >
              {{ logistics?.logistics_status || "N/A" }}
            </q-badge>
          </span>
        </div>

        <div class="col-auto">
          Goods Status:<span>
            <q-badge
              :color="badgeColorForGoods(goodsStatus)"
              class="q-px-md q-ml-xs text-subtitle1 text-uppercase"
              align="middle"
            >
              {{ goodsStatus || "N/A" }}
            </q-badge>
          </span>
        </div>

        <div class="col-auto">
          Payment Status:
          <span>
            <q-badge
              :color="badgeColorForPayment(paymentStatus)"
              class="q-px-md q-ml-xs text-subtitle1 text-uppercase"
              align="middle"
            >
              {{ paymentStatus || "N/A" }}
            </q-badge>
          </span>
        </div>
      </div>
    </q-card>
    <div class="transactions-list preview-card q-ma-md">
      <!-- ========== PC TABLE (includes 'others') ========== -->
      <div v-if="itemsPC.length">
        <div class="row items-center">
          <div class="text-subtitle1 text-uppercase text-weight-bolder">
            Per piece
          </div>
        </div>
        <q-separator class="q-mt-xs" />

        <div class="q-px-none">
          <div class="transaction-summary line-height-1">
            <div class="row row-col-header order-header text-center">
              <div class="col-2 text-weight-bold bordered">Item</div>
              <div class="col-2 text-weight-bold bordered">Category</div>
              <div class="col-1 text-weight-bold bordered">Pack Type</div>
              <div class="col-2 text-weight-bold bordered">Process</div>
              <div class="col-1 text-weight-bold bordered">Price</div>
              <div class="col-1 text-weight-bold bordered">Pcs</div>
              <div class="col-1 text-weight-bold bordered">Qty</div>
              <div class="col-1 text-weight-bold bordered">Subtotal</div>
              <div class="col-1 text-weight-bold bordered">Ready?</div>
            </div>

            <div
              v-for="(item, index) in itemsPC"
              :key="'pc-' + index"
              class="row row-col-row order-row text-center"
            >
              <div class="col-2 bordered text-left">{{ item.item_name }}</div>
              <div class="col-2 bordered text-capitalize">
                {{ item.category }}
              </div>
              <div class="col-1 bordered text-capitalize">
                {{ item.pack_type }}
              </div>
              <div class="col-2 bordered">{{ processLabel(item.process) }}</div>
              <div class="col-1 bordered">
                ${{ Number(item.price).toFixed(2) }}
              </div>
              <div class="col-1 bordered">
                ${{ Number(item.price || 0).toFixed(2) }}{{ priceSuffix(item) }}
              </div>

              <div class="col-1 bordered">
                {{ formatQty(item) }}
              </div>
              <div class="col-1 bordered pos-rel">
                ${{ Number(item.subtotal).toFixed(2) }}
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
              <div class="col-1 bordered">
                <q-checkbox v-model="item.ready_status" size="md" dense />
              </div>
            </div>

            <div class="row row-col-footer order-footer text-center">
              <div
                class="col text-weight-bold text-uppercase bordered text-right"
              ></div>
              <div class="col-1 text-weight-bold bordered">
                {{ groupTotals(itemsPC).pcs }}
              </div>
              <div class="col-1 text-weight-bold bordered">
                {{ groupTotals(itemsPC).qtyLabel }}
              </div>
              <div class="col-1 text-weight-bold bordered">
                {{ groupTotals(itemsPC).subtotalLabel }}
              </div>
              <div class="col-1 text-weight-bold bordered"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== KG TABLE ========== -->
      <div v-if="itemsKG.length">
        <div class="row items-center q-mt-md">
          <div class="text-subtitle1 text-uppercase text-weight-bolder">
            Per kg
          </div>
        </div>
        <q-separator class="q-mt-xs" />

        <div class="q-px-none">
          <div class="transaction-summary line-height-1">
            <div class="row row-col-header order-header text-center">
              <div class="col-2 text-weight-bold bordered">Item</div>
              <div class="col-2 text-weight-bold bordered">Category</div>
              <div class="col-1 text-weight-bold bordered">Pack Type</div>
              <div class="col-2 text-weight-bold bordered">Process</div>
              <div class="col-1 text-weight-bold bordered">Price</div>
              <div class="col-1 text-weight-bold bordered">Pcs</div>
              <div class="col-1 text-weight-bold bordered">Weight</div>
              <div class="col-1 text-weight-bold bordered">Subtotal</div>
              <div class="col-1 text-weight-bold bordered">Ready?</div>
            </div>

            <div
              v-for="(item, index) in itemsKG"
              :key="'kg-' + index"
              class="row row-col-row order-row text-center"
            >
              <div class="col-2 bordered text-left">{{ item.item_name }}</div>
              <div class="col-2 bordered text-capitalize">
                {{ item.category }}
              </div>
              <div class="col-1 bordered text-capitalize">
                {{ item.pack_type }}
              </div>
              <div class="col-2 bordered">{{ processLabel(item.process) }}</div>
              <div class="col-1 bordered">
                ${{ Number(item.price).toFixed(2) }}
              </div>
              <div class="col-1 bordered">
                ${{ Number(item.price || 0).toFixed(2) }}{{ priceSuffix(item) }}
              </div>

              <div class="col-1 bordered">
                {{ formatQty(item) }}
              </div>
              <div class="col-1 bordered pos-rel">
                ${{ Number(item.subtotal).toFixed(2) }}
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
              <div class="col-1 bordered">
                <q-checkbox v-model="item.ready_status" size="md" dense />
              </div>
            </div>

            <div class="row row-col-footer order-footer text-center">
              <div class="col text-weight-bold text-uppercase bordered"></div>
              <div class="col-1 text-weight-bold bordered">
                {{ groupTotals(itemsKG).pcs }}
              </div>
              <div class="col-1 text-weight-bold bordered">
                {{ groupTotals(itemsKG).qtyLabel }}
              </div>
              <div class="col-1 text-weight-bold bordered">
                {{ groupTotals(itemsKG).subtotalLabel }}
              </div>
              <div class="col-1 text-weight-bold bordered"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== SQFT TABLE ========== -->
      <div v-if="itemsSQFT.length">
        <div class="row items-center q-mt-md">
          <div class="text-subtitle1 text-uppercase text-weight-bolder">
            Per sqft
          </div>
        </div>
        <q-separator class="q-mt-xs" />

        <div class="q-px-none">
          <div class="transaction-summary line-height-1">
            <div class="row row-col-header order-header text-center">
              <div class="col-2 text-weight-bold bordered">Item</div>
              <div class="col-2 text-weight-bold bordered">Category</div>
              <div class="col-1 text-weight-bold bordered">Pack Type</div>
              <div class="col-2 text-weight-bold bordered">Process</div>
              <div class="col-1 text-weight-bold bordered">Price</div>
              <div class="col-1 text-weight-bold bordered">Pcs</div>
              <div class="col-1 text-weight-bold bordered">Size</div>
              <div class="col-1 text-weight-bold bordered">Subtotal</div>
              <div class="col-1 text-weight-bold bordered">Ready?</div>
            </div>

            <div
              v-for="(item, index) in itemsSQFT"
              :key="'sqft-' + index"
              class="row row-col-row order-row text-center"
            >
              <div class="col-2 bordered text-left">{{ item.item_name }}</div>
              <div class="col-2 bordered text-capitalize">
                {{ item.category }}
              </div>
              <div class="col-1 bordered text-capitalize">
                {{ item.pack_type }}
              </div>
              <div class="col-2 bordered">{{ processLabel(item.process) }}</div>
              <div class="col-1 bordered">
                ${{ Number(item.price).toFixed(2) }}
              </div>
              <div class="col-1 bordered">
                ${{ Number(item.price || 0).toFixed(2) }}{{ priceSuffix(item) }}
              </div>

              <div class="col-1 bordered">
                {{ formatQty(item) }}
              </div>
              <div class="col-1 bordered pos-rel">
                ${{ Number(item.subtotal).toFixed(2) }}
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
              <div class="col-1 bordered">
                <q-checkbox v-model="item.ready_status" size="md" dense />
              </div>
            </div>

            <div class="row row-col-footer order-footer text-center">
              <div class="col text-weight-bold text-uppercase bordered"></div>
              <div class="col-1 text-weight-bold bordered">
                {{ groupTotals(itemsSQFT).pcs }}
              </div>
              <div class="col-1 text-weight-bold bordered">
                {{ groupTotals(itemsSQFT).qtyLabel }}
              </div>
              <div class="col-1 text-weight-bold bordered">
                {{ groupTotals(itemsSQFT).subtotalLabel }}
              </div>
              <div class="col-1 text-weight-bold bordered"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="row justify-end q-mt-md">
        <q-btn
          label="Save Update"
          color="primary"
          unelevated
          @click="updateReadyStatus"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch, nextTick } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { useRoute } from "vue-router";
import { Notify } from "quasar";
import { useQuasar } from "quasar";
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

const driverOptions = ref([]); // Initialize as a reactive array
const timeOptions = ref([]); // Initialize as a reactive array

function processLabel(p) {
  const s = String(p || "").toLowerCase();
  if (s === "laundry") return "Laundry";
  if (s === "dryclean") return "Dry Clean";
  if (s === "pressing") return "Pressing Only";
  if (s === "others") return "Others";
  return p || "-";
}

// Load driverOptions when component is mounted
onMounted(async () => {
  try {
    // Load drivers first
    await transactionStore.loadDrivers();
    await transactionStore.loadTimeOptions();

    // Now set the dropdown options to the driverOptions from the store
    driverOptions.value = transactionStore.driverOptions;
    timeOptions.value = transactionStore.timeOptions;

    console.log("Driver Options Set:", driverOptions.value);
  } catch (error) {
    console.error("Error loading driver options:", error);
    driverOptions.value = []; // Fallback to an empty array
  }
});

onMounted(async () => {
  try {
    const orderNo = route.params.order_no;
    const orderDetails = await transactionStore.fetchWholeOrderByOrderNo(
      orderNo
    );

    if (!orderDetails) {
      console.warn("No order details found for:", orderNo);
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

    reports.value = orderDetails.error_reports || [];

    console.log("Assigned reports to reactive var:", reports.value);

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

    console.log("Final instructions list:", instructions.value);
  } catch (error) {
    console.error("❌ Error loading order details:", error);
  }
});

// Watcher for transactions to dynamically calculate subtotals
watch(
  transactions,
  (newTransactions) => {
    newTransactions.forEach((transaction) => {
      transaction.subtotal =
        (transaction.price || 0) * (transaction.quantity || 1); // Exclude pieces
      // transaction.subtotal = (transaction.price || 0) * (transaction.quantity || 0) * (transaction.pieces || 1);
    });
  },
  { deep: true }
);

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

const paymentStatus = computed({
  get() {
    return order.value?.order_payment?.payment_status || "";
  },
  set(val) {
    if (!order.value.order_payment) order.value.order_payment = {};
    order.value.order_payment.payment_status = val;
  },
});

function badgeColorForLogistics(s) {
  const v = String(s || "").toUpperCase();
  if (v.includes("PENDING")) return "warning";
  if (v.includes("ON") || v.includes("IN PROGRESS")) return "info";
  if (v.includes("COMPLETED") || v.includes("DELIVERED")) return "positive";
  if (v.includes("CANCEL") || v.includes("FAILED")) return "negative";
  return "grey-6";
}

function badgeColorForGoods(s) {
  const v = String(s || "").toUpperCase();
  if (v === "READY") return "positive";
  if (v.includes("PARTIAL")) return "warning";
  if (v === "NOT READY") return "grey-6";
  return "grey-6";
}

function badgeColorForPayment(s) {
  const v = String(s || "").toUpperCase();
  if (v === "PAID") return "positive";
  if (v.includes("PARTIAL") || v === "PENDING") return "warning";
  if (v === "UNPAID" || v.includes("FAILED")) return "negative";
  return "grey-6";
}

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

const noReturns = computed({
  get() {
    return order.value.order_production?.no_returns || "";
  },
  set(val) {
    if (!order.value.order_production) {
      order.value.order_production = {};
    }
    order.value.order_production.no_returns = val;
  },
});
// --- unit helpers ---
function getItemUnit(item) {
  const u = String(item?.unit ?? "").toLowerCase();
  if (u === "kg" || u === "sqft" || u === "pc") return u;
  // anything else (including empty) goes to PC table
  return "pc";
}

function formatQty(item) {
  const u = getItemUnit(item);
  const q = Number(item?.quantity) || 0;
  if (u === "kg") return `${q.toFixed(2)} kg`;
  if (u === "sqft") return `${q.toFixed(2)} sqft`;
  return q; // pc
}

// --- groupings (PC is the fallback bucket for "others") ---
const itemsPC = computed(() =>
  transactions.value.filter((it) => getItemUnit(it) === "pc")
);
const itemsKG = computed(() =>
  transactions.value.filter((it) => getItemUnit(it) === "kg")
);
const itemsSQFT = computed(() =>
  transactions.value.filter((it) => getItemUnit(it) === "sqft")
);

// --- per-group totals ---
function groupTotals(list) {
  const pcs = list.reduce(
    (a, it) => a + (it.pieces || 1) * (Number(it.quantity) || 0),
    0
  );
  const qty = list.reduce((a, it) => a + (Number(it.quantity) || 0), 0);
  const subtotal = list.reduce((a, it) => a + (Number(it.subtotal) || 0), 0);
  const u = list.length ? getItemUnit(list[0]) : "pc";

  const qtyLabel =
    u === "kg"
      ? `${qty.toFixed(2)} kg`
      : u === "sqft"
      ? `${qty.toFixed(2)} sqft`
      : qty; // pc

  return {
    pcs,
    qtyRaw: qty,
    qtyLabel, // pretty for the table footer
    subtotalLabel: `$${subtotal.toFixed(2)}`,
  };
}

function priceSuffix(item) {
  const u = getItemUnit
    ? getItemUnit(item)
    : String(item?.unit ?? "").toLowerCase();
  if (u === "kg") return "/kg";
  if (u === "sqft") return "/sqft";
  // default piece-based pricing
  const pcs = Number(item?.pieces) || 1;
  return pcs > 1 ? "/set" : "/pc";
}
function subtotalBreakdown(item) {
  // 1) Prefer server-provided notes exactly as-is
  const notes = String(item?.notes ?? "").trim();
  if (notes) return notes;

  // 2) Fallback: generate a readable computation line
  const unit = getItemUnit(item); // "pc" | "kg" | "sqft"
  const rawPrice = item?.price;
  const priceNum = Number(rawPrice);
  const isTBA =
    rawPrice == null ||
    (typeof rawPrice === "string" && rawPrice.toUpperCase() === "TBA") ||
    !Number.isFinite(priceNum);

  const qty = Number(item?.quantity) || 0;
  const pcs = Math.max(Number(item?.pieces) || 1, 1);

  if (isTBA) return "Price is TBA → subtotal treated as $0.00";

  // price label with correct suffix (/pc, /set, /kg, /sqft)
  const priceLabel = `$${priceNum.toFixed(2)}${priceSuffix(item)}`;

  // quantity label with unit formatting
  let qtyLabel = "";
  if (unit === "kg") qtyLabel = `${qty.toFixed(2)} kg`;
  else if (unit === "sqft") qtyLabel = `${qty.toFixed(2)} sqft`;
  else qtyLabel = `${qty} pc${qty === 1 ? "" : "s"}`;

  // show final value (use provided subtotal if available)
  const subtotal = Number.isFinite(Number(item?.subtotal))
    ? Number(item.subtotal)
    : priceNum * qty;
  let line = `${priceLabel} × ${qtyLabel} = $${subtotal.toFixed(2)}`;

  // extra notes based on pieces
  if (unit === "pc" && pcs > 1) {
    line += `\n(${pcs} pcs per set)`;
  } else if ((unit === "kg" || unit === "sqft") && pcs > 1) {
    line += `\nNote: Pieces are recorded and do not change the price.`;
  }

  return line;
}

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

function phoneHref(raw) {
  const cleaned = String(raw || "").replace(/[^+\d]/g, ""); // keep digits and leading +
  return cleaned ? `tel:${cleaned}` : "#";
}
function mailtoHref(email) {
  const e = String(email || "").trim();
  return e ? `mailto:${encodeURIComponent(e)}` : "#";
}

// Arrays of phones for easy rendering
const customerPhones = computed(() =>
  [customer.value?.contact_no1, customer.value?.contact_no2].filter(Boolean)
);
const collectionPhones = computed(() => {
  const cp = collection.value?.contact_person || {};
  return [cp.contact_no1, cp.contact_no2].filter(Boolean);
});
const deliveryPhones = computed(() => {
  const cp = delivery.value?.contact_person || {};
  return [cp.contact_no1, cp.contact_no2].filter(Boolean);
});

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

const DRIVER_NOT_SET = "[NOT SET]";
const driverMapById = computed(() => {
  const m = new Map();
  (transactionStore.driverOptions || []).forEach((d) => {
    if (d?.id != null)
      m.set(String(d.id), (d.name || "").trim() || DRIVER_NOT_SET);
  });
  return m;
});
function getDriverName(id) {
  return driverMapById.value.get(String(id)) || DRIVER_NOT_SET;
}

const openCustomerTab = (customerId) => {
  const url = `/customers/${customerId}`;
  window.open(url, "_blank"); // Open in a new tab
};

// Data Initialization
onMounted(async () => {
  await transactionStore.loadItems();
});

const updateReadyStatus = async () => {
  try {
    const updates = transactions.value.map((item) => ({
      id: item.id,
      ready_status: item.ready_status === true,
    }));

    // Save item checkbox states
    await Promise.all(
      updates.map((u) =>
        transactionStore.updateTransactionReady(u.id, u.ready_status)
      )
    );

    // 🔎 Compute goods_status
    const total = transactions.value.length;
    const checked = transactions.value.filter(
      (t) => t.ready_status === true
    ).length;

    let nextStatus = "NOT READY";
    if (total > 0) {
      if (checked === 0) nextStatus = "NOT READY";
      else if (checked === total) nextStatus = "READY";
      else nextStatus = "PARTIAL READY";
    }

    // 💾 Persist to order_production
    await transactionStore.updateOrderProductionGoodsStatus(
      order.value.id,
      nextStatus
    );

    // 🖥️ Update local reactive state so UI shows the new value immediately
    if (!order.value.order_production) order.value.order_production = {};
    order.value.order_production.goods_status = nextStatus;

    Notify.create({
      type: "positive",
      message: "Ready status & goods status updated!",
      icon: "check_circle",
      timeout: 2500,
    });
  } catch (error) {
    console.error("❌ Error updating ready/goods status:", error);
    Notify.create({
      type: "negative",
      message: "Failed to update statuses.",
      icon: "error",
      timeout: 3500,
    });
  }
};

const updatePackDetails = async () => {
  try {
    if (!order.value.id) {
      throw new Error("Order ID is missing");
    }

    const data = {
      no_rolls: noRolls.value || "",
      no_hangers: noHangers.value || "",
      no_packets: noPackets.value || "",
      no_returns: noReturns.value || "",
    };

    await transactionStore.updateOrderPackingDetails(order.value.id, data);

    Notify.create({
      type: "positive",
      message: "Packing details updated successfully!",
      icon: "check_circle",
      timeout: 2500,
    });
  } catch (error) {
    console.error("❌ Failed to update packing details:", error);
    Notify.create({
      type: "negative",
      message: "Failed to update packing details.",
      icon: "error",
      timeout: 3500,
    });
  }
};
</script>
<style scoped>
.order-banner {
  margin-bottom: 0 !important;
}
.preview-card,
.slip-card {
  min-height: 100%;
}

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
</style>
