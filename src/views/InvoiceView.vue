<template>
  <div class="tags-view-container">
    <div class="row justify-center q-col-gutter-md q-pa-md">
      <div class="col-auto">
        <q-btn color="primary" @click="downloadInvoicePDF">
          Download Invoice PDF
        </q-btn>
      </div>
      <div class="col-auto">
        <q-btn color="primary" @click="PrintInvoicePDF">
          Print Invoice PDF
        </q-btn>
      </div>
    </div>

    <div class="row justify-center q-mb-lg">
      <div ref="printableContainer">
        <q-card class="tag-card-container single-invoice-page">
          <q-card flat class="tag-card">
            
            <div class="row tag-card-header items-center">
              <q-img
                :src="companyInfo.logo"
                spinner-color="white"
                style="height: 50px; max-width: 200px"
                class="q-mr-sm"
              />
              <div>
                <div>{{ companyInfo.address }}</div>
                <div>Hotlines: {{ companyInfo.hotlines }}</div>
              </div>
            </div>

            <div class="row line-height-1 q-mt-sm">
              <div class="col tag-card-header flex items-center">
                <div class="row">
                  <div class="q-ml-sm">
                    <qrcode-vue
                      v-if="order?.order_no"
                      :value="order.order_no"
                      :size="70"
                      level="H"
                    />
                    <div v-else>No QR Code</div>
                  </div>
                  <div class="q-ml-sm q-mt-sm text-subtitle1 line-height-1">
                    <div>
                      Order No:
                      <span class="text-weight-bold">{{ order?.order_no || "N/A" }}</span>
                    </div>
                    <div>
                      Invoice Date:
                      <span class="text-weight-bold">{{ formatDateOnly(history?.printed_at) }}</span>
                    </div>
                    <div>
                      Invoice No:
                      <span class="text-weight-bold q-ml-md">{{ invoiceNoDisplay }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col q-pa-sm" style="border: solid; border-width: 0.5px; border-color: #e9e9e9;">
                <div>
                  <div class="text-uppercase text-weight-bold">Customer Information</div>
                  <div>Name: <span>{{ customer?.name || "N/A" }}</span></div>
                  <div v-if="hasBillingAddress">Billing Address: <span>{{ customer.billing_address }}</span></div>
                  <div v-if="hasPoNo">PO No.: <span>{{ customer.po_no }}</span></div>
                  <div>
                    Contact No:
                    <span>{{ customer?.contact_no1 }}<span v-if="customer?.contact_no2"> / {{ customer?.contact_no2 }}</span></span>
                  </div>
                  <div>Email: <span>{{ customer?.email || "N/A" }}</span></div>
                </div>
              </div>
            </div>

            <div class="row line-height-1 q-mb-lg q-mt-xs q-col-gutter-sm">
              <div class="col">
                <div style="border: solid; border-width: 0.5px; border-radius: 5px; padding: 10px;">
                  <div class="text-uppercase text-weight-bold">Collection Details</div>
                  <div>
                    {{ collection?.contact_person?.name || "N/A" }} -
                    {{ collection?.contact_person?.contact_no1 || "N/A" }}
                  </div>
                  <div>{{ formatAddress(collection?.address) || "N/A" }}</div>
                  <div>Collected By: {{ getDriverName(collection?.driver_id) || "N/A" }}</div>
                  <div>Collected On: {{ formatDateOnly(collection?.collection_date) }}, {{ collection?.collection_time }}</div>
                </div>
              </div>
              <div class="col">
                <div style="border: solid; border-width: 0.5px; border-radius: 5px; padding: 10px;">
                  <div class="text-uppercase text-weight-bold">Delivery Details</div>
                  <div>
                    {{ delivery?.contact_person?.name || "N/A" }} -
                    {{ delivery?.contact_person?.contact_no1 || "N/A" }}
                  </div>
                  <div>{{ formatAddress(delivery?.address) || "N/A" }}</div>
                  <div>
                    Delivered By:
                    <span>{{ isDelivered ? getDriverName(delivery?.driver_id) || "N/A" : "[NOT YET DELIVERED]" }}</span>
                  </div>
                  <div>
                    Delivered On:
                    <span>{{ isDelivered ? `${formatDateOnly(delivery?.delivery_date)}` : "[NOT YET DELIVERED]" }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="pcItems.length" class="text-center">
              <div class="row line-height-1 text-uppercase bg-grey text-white">
                <div class="col text-weight-bold tag-table-cell">By Pieces</div>
              </div>
              <div class="plain-border">
                <div class="row tag-card-header line-height-1 text-uppercase">
                  <div class="col-4 text-weight-bold tag-table-cell">Item</div>
                  <div class="col text-weight-bold tag-table-cell">Method</div>
                  <div class="col text-weight-bold tag-table-cell">Unit Price</div>
                  <div class="col text-weight-bold tag-table-cell">Qty</div>
                  <div class="col text-weight-bold tag-table-cell">Subtotal</div>
                </div>
                <div v-for="item in pcItems" :key="item.id || item.item_name" class="row line-height-1 tag-table-row">
                  <div class="col-4 tag-table-cell text-left">{{ item.item_name }}</div>
                  <div class="col tag-table-cell">{{ formatProcessText(item.process) }}</div>
                  <div class="col tag-table-cell">{{ unitPriceDisplay(item) }}</div>
                  <div class="col tag-table-cell">{{ formatQtyForInvoice(item) }} {{ qtyUnitLabel(item) }}</div>
                  <div class="col tag-table-cell">{{ `$${itemSubtotal(item).toFixed(2)}` }}</div>
                </div>
                <div class="row line-height-1 text-weight-bold bg-grey-2" style="border-top: 1px solid #ddd;">
                  <div class="col text-right tag-table-cell text-uppercase q-pr-md">Total (Pieces):</div>
                  <div class="col-2 tag-table-cell text-center">${{ totalsAmounts.piece.toFixed(2) }}</div>
                </div>
              </div>
            </div>

            <div v-if="weightItems.length" class="text-center q-mt-sm">
              <div class="row line-height-1 text-uppercase bg-grey text-white">
                <div class="col text-weight-bold tag-table-cell">Weight</div>
              </div>
              <div class="plain-border">
                <div class="row tag-card-header line-height-1 text-uppercase">
                  <div class="col-4 text-weight-bold tag-table-cell">Item</div>
                  <div class="col text-weight-bold tag-table-cell">Method</div>
                  <div class="col text-weight-bold tag-table-cell">Unit Price</div>
                  <div class="col text-weight-bold tag-table-cell">Qty</div>
                  <div class="col text-weight-bold tag-table-cell">Subtotal</div>
                </div>
                <div v-for="item in weightItems" :key="item.id || item.item_name" class="row line-height-1">
                  <div class="col-4 tag-table-cell text-left">{{ item.item_name }}</div>
                  <div class="col tag-table-cell">{{ formatProcessText(item.process) }}</div>
                  <div class="col tag-table-cell">{{ unitPriceDisplay(item) }}</div>
                  <div class="col tag-table-cell">{{ formatQtyForInvoice(item) }} {{ qtyUnitLabel(item) }}</div>
                  <div class="col tag-table-cell">{{ `$${itemSubtotal(item).toFixed(2)}` }}</div>
                </div>
                <div class="row line-height-1 text-weight-bold bg-grey-2" style="border-top: 1px solid #ddd;">
                  <div class="col text-right tag-table-cell text-uppercase q-pr-md">Total (Weight):</div>
                  <div class="col-2 tag-table-cell text-center">${{ totalsAmounts.weight.toFixed(2) }}</div>
                </div>
              </div>
            </div>

            <div v-if="sizeItems.length" class="text-center q-mt-sm">
              <div class="row line-height-1 text-uppercase bg-grey text-white">
                <div class="col text-weight-bold tag-table-cell">By Size</div>
              </div>
              <div class="plain-border">
                <div class="row tag-card-header line-height-1 text-uppercase">
                  <div class="col-4 text-weight-bold tag-table-cell">Item</div>
                  <div class="col text-weight-bold tag-table-cell">Method</div>
                  <div class="col text-weight-bold tag-table-cell">Unit Price</div>
                  <div class="col text-weight-bold tag-table-cell">Qty</div>
                  <div class="col text-weight-bold tag-table-cell">Subtotal</div>
                </div>
                <div v-for="item in sizeItems" :key="item.id || item.item_name" class="row line-height-1">
                  <div class="col-4 tag-table-cell text-left">{{ item.item_name }}</div>
                  <div class="col tag-table-cell">{{ formatProcessText(item.process) }}</div>
                  <div class="col tag-table-cell">{{ unitPriceDisplay(item) }}</div>
                  <div class="col tag-table-cell">{{ formatQtyForInvoice(item) }} {{ qtyUnitLabel(item) }}</div>
                  <div class="col tag-table-cell">{{ `$${itemSubtotal(item).toFixed(2)}` }}</div>
                </div>
                <div class="row line-height-1 text-weight-bold bg-grey-2" style="border-top: 1px solid #ddd;">
                  <div class="col text-right tag-table-cell text-uppercase q-pr-md">Total (Size):</div>
                  <div class="col-2 tag-table-cell text-center">${{ totalsAmounts.size.toFixed(2) }}</div>
                </div>
              </div>
            </div>

            <div v-if="transactions.length === 0" class="text-center text-grey q-my-md text-subtitle1">
              No items in this order.
            </div>

            <div class="row justify-end q-mt-sm line-height-1">
              <div class="col-6">
                </div>
            </div>

            <q-separator class="q-my-sm" />

            <div class="q-mt-md">
              <div class="row">
                <div class="col">
                  <div class="text-weight-bold text-uppercase q-mb-xs">Payment Summary</div>
                  
                  <div>Subtotal: <span>${{ totalsAmounts.total.toFixed(2) }}</span></div>

                  <div v-if="mergedDiscountsAndCharges.length > 0" class="q-pl-sm">
                    <div
                      v-for="(rule, index) in mergedDiscountsAndCharges"
                      :key="'rule-' + index"
                      class="row text-caption"
                    >
                      <div class="col-auto q-mr-xs">
                        {{ rule.description || "Adjustment" }}
                        <span v-if="rule.value_type === 'percent'">({{ rule.percentage }}%)</span>:
                      </div>
                      <div :class="rule.dc_type === 'discount' ? 'text-green-8' : 'text-red-8'">
                        {{ formatCurrencyDisplay(rule.dc_type === 'discount' ? -Math.abs(rule.totalAmount) : rule.totalAmount) }}
                      </div>
                    </div>
                  </div>

                  <div>
                    Credits Used:
                    <span>${{ creditsUsed.toFixed(2) }}</span>
                  </div>

                  <div>
                    Current Credit:
                    <span>${{ totalRemainingCredits.toFixed(2) }}</span>
                  </div>
                  
                  <div class="q-mt-xs text-weight-bold">
                    Total Due:
                    <span>${{ finalOrderTotal.toFixed(2) }}</span>
                  </div>
                </div>

                <div class="col text-right">
                  <div class="text-weight-bold text-uppercase q-mb-xs">
                    Subtotal After Discounts, Credits, and Express
                  </div>
                  
                  <div>
                    Outstanding:
                    <span>${{ finalOrderTotal.toFixed(2) }}</span>
                  </div>

                  <div>
                    Outstanding Paid:
                    <span>${{ (order.order_payment?.paid_amount || 0).toFixed(2) }}</span>
                  </div>

                  <div class="text-h6 text-weight-bolder">
                    Balance: <span>${{ totalDue }}</span>
                  </div>
                </div>
              </div>

              <div class="text-center line-height-1 q-mt-md">
                <div>(Prepaid credits are available for purchase on our website)</div>
                <div>*** For cheque payment, please make cheque payable to 'Cotton Care Drycleaners Pte Ltd'. ***</div>
              </div>
            </div>

            <div class="row q-my-md" style="border: solid; border-width: 0.5px; border-radius: 5px; padding: 10px;">
              <q-img :src="payQr" spinner-color="white" style="height: 140px; max-width: 220px" />
              <div class="col q-pl-md">
                <div class="line-height-1 text-weight-bolder text-uppercase">Bank Details:</div>
                <div class="line-height-1">Account Name:<span class="text-summary">COTTON CARE DRYCLEANERS PTE LTD</span></div>
                <div class="line-height-1">Bank Name:<span class="text-summary">OCBC</span></div>
                <div class="line-height-1">Account No.:<span class="text-summary">5881-0542-9001</span></div>
                <div class="line-height-1">Bank/Branch Code:<span class="text-summary">7339/588</span></div>
                <div class="line-height-1">Paynow UEN No:<span class="text-summary">201205607R</span></div>
                <div class="line-height-1 text-weight-bold">Note: For transaction ref, pls indicate your handphone no. +65_______________</div>
              </div>
            </div>

            <div style="font-size: 9px; line-height: 1.1">
              <div class="text-weight-bold" style="font-size: 10px">
                Conditions of Services
              </div>
              <ol>
                <li>
                  <div class="q-ml-xs">
                    All articles are accepted at owner's risk. The company shall
                    not be responsible for shrinkage, fading, fastness of
                    colour, defect due to manufacture, buttons or ornaments that
                    cannot withstand cleaning or pressing or water & tear due to
                    the process of cleaning.
                  </div>
                </li>
                <li>
                  <div class="q-ml-xs">
                    Stain removal is done at owner's risk with additional
                    charges and is NOT guaranteed.
                  </div>
                </li>
                <li>
                  <div class="q-ml-xs">
                    If any article is lost or damage through our negligence or
                    in the event of fire, our liability shall be limited from 5
                    to 10 times the regular service charge for each article. The
                    total claim for all articles shall be deemed not to exceed
                    $100.00 per order. In the event of a claim for any damaged
                    item/s, that item/s shall be retained by the company.
                  </div>
                </li>
                <li>
                  <div class="q-ml-xs">
                    Customers are advised to check the articles at the time of
                    return. The company will not bear any responsibility once
                    the articles have been returned for more than 24 hours.
                  </div>
                </li>
                <li>
                  <div class="q-ml-xs">
                    he company shall not be liable for any loss or damage due to
                    storage of any unclaimed article more than 14 days from
                    Return Date. Any unclaimed article shall be disposed after 3
                    months.
                  </div>
                </li>
                <li>
                  <div class="q-ml-xs">
                    There is a minimum charge of $30 per laundry collection and
                    a minimum charge of $250 for curtains removal and
                    installation.
                  </div>
                </li>
                <li>
                  <div class="q-ml-xs">
                    The company reserves the right to impose a surcharge of S$10
                    for any extra trips made outside of normal collection &
                    delivery.
                  </div>
                </li>
                <li>
                  <div class="q-ml-xs">
                    Customers are reminded that it is an offense under the law
                    to send bedding, clothing, or any articles which have been
                    in contact with infectious disease to a public house.
                  </div>
                </li>
              </ol>
            </div>
            
            <div class="text-weight-bold text-caption text-center">
              *** This is a computer generated invoice. No signatory is required. ***
            </div>
          </q-card>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { useRoute } from "vue-router";
import QrcodeVue from "qrcode.vue";
import html2pdf from "html2pdf.js";
import payQr from "@/assets/images/pay_qr.png";
import ccLogo from "@/assets/images/cc_logo.png";
import dcLogo from "@/assets/images/dc_logo.png";

const transactionStore = useTransactionStore();
const route = useRoute();

const order = ref({});
const customer = ref({});
const collection = ref({});
const delivery = ref({});
const logistics = ref({});
const transactions = ref([]);
const reports = ref([]);

const invoice = ref(null);
const history = ref(null);
const paymentsHistory = ref([]);
const rawAppliedRules = ref([]);
const customerRules = ref([]);

// --- 1. DETERMINE COMPANY (Single Invoice Mode) ---
const determinedCompany = computed(() => {
  if (transactions.value.length > 0 && transactions.value[0].company) {
    const c = transactions.value[0].company.toLowerCase().trim();
    if (c === 'dc') return 'dc';
  }
  return 'cc';
});

const companyInfo = computed(() => {
  if (determinedCompany.value === 'dc') {
    return {
      logo: dcLogo,
      address: "53 Ubi Ave 1 #01-29 Paya Ubi Ind. Park Singapore 408934",
      hotlines: "9029 6919 / 6747 7844"
    };
  }
  // Default CC
  return {
    logo: ccLogo,
    address: "53 Ubi Ave 1 #01-29 Paya Ubi Ind. Park Singapore 408934",
    hotlines: "9029 6919 / 6747 7844"
  };
});

const invoiceNoDisplay = computed(() => {
  const base = route.params?.invoice_no || invoice.value?.invoice_no || "N/A";
  if (base === "N/A") return base;
  return `${base}-${determinedCompany.value.toUpperCase()}`;
});

// --- 2. UNIT SPLITS (Based on ALL transactions) ---
function getUnitForItem(item) {
  const u = (item?.unit || "").toString().toLowerCase().trim();
  if (u) return u;
  return (item?.item_name || "").toLowerCase().includes("kg") ? "kg" : "pc"; 
}

const pcItems = computed(() => transactions.value.filter(i => getUnitForItem(i) === 'pc'));
const weightItems = computed(() => transactions.value.filter(i => ['kg', 'lbs'].includes(getUnitForItem(i))));
const sizeItems = computed(() => transactions.value.filter(i => ['sqft', 'sqm'].includes(getUnitForItem(i))));

// --- 3. HELPER FUNCTIONS ---
function perUnitPieces(item) {
  const n = Number(item?.pieces_per_unit ?? item?.pieces ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function isTBA(item) {
  const p = item?.price;
  return p == null || (typeof p === "string" && p.toUpperCase() === "TBA") || !Number.isFinite(parseFloat(p));
}

function unitLabel(u) {
  if (!u) return "";
  return u.toLowerCase() === "pc" ? "pcs" : u.toLowerCase();
}

function priceUnitLabel(item) {
  const unit = getUnitForItem(item);
  return (unit === "pc" && perUnitPieces(item) > 1) ? "set" : unitLabel(unit);
}

function qtyUnitLabel(item) {
  const unit = getUnitForItem(item);
  return (unit === "pc" && perUnitPieces(item) > 1) ? "sets" : unitLabel(unit);
}

function unitPriceDisplay(item) {
  if (isTBA(item)) return "TBA";
  return `$${parseFloat(item.price).toFixed(2)} / ${priceUnitLabel(item)}`;
}

function formatProcessText(process) {
  if (!process) return "-";
  const p = process.toLowerCase();
  if (p === 'laundry') return 'Laundry';
  if (p === 'dryclean') return 'Dry Clean';
  if (p === 'pressing') return 'Pressing Only';
  return process;
}

function formatQtyForInvoice(item) {
  const unit = getUnitForItem(item);
  const q = parseFloat(item.quantity) || 0;
  return unit === 'pc' ? q.toFixed(0) : q.toFixed(2);
}

function itemSubtotal(item) {
  if (!item || isTBA(item)) return 0;
  const unit = getUnitForItem(item);
  const price = parseFloat(item.price) || 0;
  const qty = parseFloat(item.quantity) || 0;
  const pcs = Math.max(Number(item.pieces ?? 0) || 1, 1);
  
  if (unit === 'sqft' || unit === 'sqm') return +(price * qty * pcs).toFixed(2);
  return +(price * qty).toFixed(2);
}

// --- 4. TOTALS CALCULATIONS ---
const totalsAmounts = computed(() => {
  let piece = 0, weight = 0, size = 0;
  for (const it of transactions.value) {
    const sub = itemSubtotal(it);
    const unit = getUnitForItem(it);
    if (unit === "pc") piece += sub;
    else if (unit === "kg" || unit === "lbs") weight += sub;
    else if (unit === "sqft" || unit === "sqm") size += sub;
  }
  return { piece, weight, size, total: piece + weight + size };
});

const totalRemainingCredits = computed(() => {
  // Safe access to credits array
  const credits = customer.value?.customer_credits;
  if (Array.isArray(credits) && credits.length > 0) {
    const c = credits[0];
    return (Number(c.online_package) || 0) + (Number(c.other_credits) || 0);
  }
  return 0;
});

// Calculate Credits Used based on Payment History 'credit' methods
const creditsUsed = computed(() => {
  if (!paymentsHistory.value || paymentsHistory.value.length === 0) return 0;
  return paymentsHistory.value.reduce((acc, curr) => {
    const method = (curr.payment_method || "").toLowerCase();
    // Assuming methods like 'credit', 'wallet', 'online_package' indicate credit usage
    if (method.includes('credit') || method.includes('wallet') || method.includes('package')) {
      return acc + (Number(curr.amount) || 0);
    }
    return acc;
  }, 0);
});

// --- 5. DISCOUNTS & CHARGES LOGIC ---

const loadDiscountsAndCharges = async () => {
  try {
    // 1. Fetch Customer Rules
    if (customer.value?.id) {
      customerRules.value = await transactionStore.fetchCustomerDiscounts(customer.value.id);
    }
    // 2. Fetch Applied Order Rules
    const itemIds = transactions.value.map((t) => t.id).filter((id) => id);
    if (itemIds.length > 0) {
      rawAppliedRules.value = await transactionStore.fetchAppliedOrderDiscounts(itemIds);
    } else {
      rawAppliedRules.value = [];
    }
  } catch (error) {
    console.error("Failed to load discounts:", error);
  }
};

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
        isCustomerRule: false,
      };
    }
    groupMap[key].count++;

    // Calculate Impact per Item
    let impact = 0;
    const item = transactions.value.find((t) => t.id === row.order_transaction_item_id);

    if (item) {
      // Re-calculate line total base on item properties
      const basePrice = isTBA(item) ? 0 : Number(item.price || 0);
      const qty = Number(item.quantity || 0);
      const unit = getUnitForItem(item);
      const pcs = (item.pieces && (unit === "sqft" || unit === "sqm")) ? Number(item.pieces) : 1;
      
      const lineTotal = (unit === "sqft" || unit === "sqm") 
        ? basePrice * qty * pcs 
        : basePrice * qty;

      if (row.value_type === "amount") {
        impact = Number(row.amount || 0);
      } else if (row.value_type === "percent") {
        impact = lineTotal * (Number(row.percentage) / 100);
      }
      groupMap[key].totalAmount += impact;
    }
  });

  // Finalize Order Rules
  Object.values(groupMap).forEach((g) => {
    // If discount, result is negative. If charge, positive.
    const modifier = g.dc_type === "discount" ? -1 : 1;
    g.totalAmount = Math.abs(g.totalAmount) * modifier; 
    list.push(g);
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
      count: 0,
      totalAmount: netImpact,
      isCustomerRule: true,
    });
  });

  // Sort
  return list.sort((a, b) => {
    if (a.value_type === "percent" && b.value_type !== "percent") return -1;
    if (a.value_type !== "percent" && b.value_type === "percent") return 1;
    return 0;
  });
});

const finalOrderTotal = computed(() => {
  let total = totalsAmounts.value.total || 0;
  mergedDiscountsAndCharges.value.forEach((rule) => {
    total += rule.totalAmount; 
  });
  return Math.max(total, 0);
});

const totalDue = computed(() => {
  const paid = order.value?.order_payment?.paid_amount || 0;
  return Math.max(0, finalOrderTotal.value - paid).toFixed(2);
});

const formatCurrencyDisplay = (val) => {
  const num = parseFloat(val);
  if (isNaN(num)) return "$0.00";
  const sign = num < 0 ? "-" : "+";
  return `${sign}$${Math.abs(num).toFixed(2)}`;
};

const formatMoney = (val) => parseFloat(val || 0).toFixed(2);

// --- 6. SETUP & DATA FETCHING ---
const getParams = () => ({
  orderNo: route.params?.order_no,
  invoiceNo: route.params?.invoice_no,
  historyId: route.params?.history_id,
});
const printableContainer = ref(null);
const isDelivered = computed(() => (logistics.value?.logistics_status || "").toLowerCase() === "delivery completed");
const hasBillingAddress = computed(() => !!customer.value?.billing_address);
const hasPoNo = computed(() => !!customer.value?.po_no);
const DRIVER_NOT_SET = "[NOT SET]";
const driverMapById = computed(() => {
  const m = new Map();
  (transactionStore.driverOptions || []).forEach(d => {
    if (d?.id != null) m.set(String(d.id), (d.name || "").trim() || DRIVER_NOT_SET);
  });
  return m;
});
const getDriverName = (id) => driverMapById.value.get(String(id)) || DRIVER_NOT_SET;
function formatAddress(addr) {
  if (!addr) return "-";
  const main = [addr.block_no, addr.road_name, addr.unit_no, addr.building_name].filter(Boolean).join(" ");
  return main + (addr.postal_code ? `, ${addr.postal_code}` : "");
}
function formatDateOnly(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  if(isNaN(d.getTime())) return "N/A";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

onMounted(async () => {
  const { orderNo, invoiceNo, historyId } = getParams();
  try {
    await transactionStore.loadDrivers();
    const orderDetails = await transactionStore.fetchWholeOrderByOrderNo(orderNo);
    
    if (orderDetails) {
      logistics.value = orderDetails;
      order.value = orderDetails.order || {};
      customer.value = orderDetails.customer || {};
      collection.value = orderDetails.collection || {};
      delivery.value = orderDetails.delivery || {};
      
      transactions.value = [];
      (orderDetails.transactions || []).forEach((tx) => {
        if (Array.isArray(tx.order_transaction_items)) {
          tx.order_transaction_items.forEach((item) => transactions.value.push(item));
        }
      });
      
      reports.value = orderDetails.error_reports || [];
      
      // Load payment history
      if (order.value?.id) {
         await loadDiscountsAndCharges();
         // Fetch specific payment history for credits calc
         const ph = await transactionStore.fetchPaymentHistoryByOrderId(order.value.id);
         paymentsHistory.value = Array.isArray(ph) ? ph : [];
      }
    }

    if(invoiceNo) {
       // Logic to fetch invoice row if needed
    }
    if(historyId) {
       const r = await transactionStore.fetchPrintHistoryById(historyId);
       if(r?.ok) history.value = r.data;
    }

  } catch (error) {
    console.error("InvoiceView load error", error);
  }
});

// --- PDF Logic ---
const downloadInvoicePDF = () => {
  if (!printableContainer.value) return;
  setTimeout(() => {
    const element = printableContainer.value;
    const options = {
      margin: [0, 0, 0, 0],
      filename: `Invoice_${order.value?.order_no || "N_A"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };
    html2pdf().set(options).from(element).toPdf().save();
  }, 500);
};

const PrintInvoicePDF = () => {
   if (!printableContainer.value) return;
   setTimeout(() => {
    const element = printableContainer.value;
    const options = {
      margin: [0, 0, 0, 0],
      filename: `Invoice_${order.value?.order_no}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };
    html2pdf().set(options).from(element).toPdf().output("blob").then(blob => {
        const pdfUrl = URL.createObjectURL(blob);
        const newWindow = window.open(pdfUrl, "_blank");
        if(newWindow) {
           setTimeout(() => { newWindow.print(); }, 500);
        }
    });
   }, 500);
};
</script>

<style scoped>
.single-invoice-page {
  page-break-after: always;
  margin-bottom: 10px;
}
.single-invoice-page:last-child {
  page-break-after: auto;
}
</style>