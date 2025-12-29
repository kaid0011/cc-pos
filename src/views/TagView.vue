<template>
  <div class="tags-view-container">
    <div class="row justify-center q-col-gutter-md q-pa-md">
      <div class="col-auto">
        <q-btn color="primary" unelevated @click="PrintTag"> Print Tags </q-btn>
      </div>
      <div class="col-auto">
        <q-btn color="accent" unelevated @click="PrintTagPDF">
          Print Tag Slip
        </q-btn>
      </div>
      <div class="col-auto">
        <q-btn color="secondary" unelevated @click="downloadTagPDF">
          Download Tag Slip
        </q-btn>
      </div>
    </div>

    <div class="row justify-center q-mb-lg">
      <q-card class="tag-card-container">
        <q-card flat class="tag-card" ref="printableCard">
          <!-- Header -->
          <div class="row tag-card-header justify-between items-center q-pa-sm">
            <div class="col text-h6 line-height-1">
              <div v-if="brandLogoSrc">
                <img :src="brandLogoSrc" alt="Brand logo" class="brand-logo" />
              </div>
            </div>

            <div class="col-auto">
              <!-- <div
                class="text-uppercase bg-grey-3 text-weight-bolder order-box"
              >
                <div class="q-px-sm">Tag Slip</div>
              </div> -->
            <div style="border: solid black 1px">
            <q-card
              flat
              class="tags row items-center no-wrap justify-between text-center"
            >
              <div class="col-auto">
                <div
                  class="tag-urgency"
                  v-if="
                    logistics?.urgency?.toLowerCase() === 'urgent' ||
                    logistics?.urgency?.toLowerCase() === 'express'
                  "
                >
                  {{ tagUrgency }}
                </div>
              </div>

              <div class="col-auto">
                <div class="row text-center">
                  <div class="col-auto tag-count">
                    <div class="text-weight-bold">
                      {{ tagCategoryCounts.clothing || 0 }}
                    </div>
                    <div>A</div>
                  </div>
                  <div class="col-auto tag-count">
                    <div class="text-weight-bold">
                      {{ tagCategoryCounts.bedding || 0 }}
                    </div>
                    <div>B</div>
                  </div>
                  <div class="col-auto tag-count">
                    <div class="text-weight-bold">
                      {{ tagCategoryCounts.curtain || 0 }}
                    </div>
                    <div>C</div>
                  </div>
                  <div class="col-auto tag-count">
                    <div class="text-weight-bold">
                      {{ tagCategoryCounts.sofa || 0 }}
                    </div>
                    <div>D</div>
                  </div>
                  <div class="col-auto tag-count">
                    <div class="text-weight-bold">
                      {{ tagCategoryCounts.stuffed_toy || 0 }}
                    </div>
                    <div>E</div>
                  </div>
                  <div class="col-auto tag-count">
                    <div class="text-weight-bold">
                      {{ tagCategoryCounts.carpet || 0 }}
                    </div>
                    <div>F</div>
                  </div>
                  <div class="col-auto tag-count">
                    <div class="text-weight-bold">
                      {{ tagCategoryCounts.others || 0 }}
                    </div>
                    <div>G</div>
                  </div>
                </div>
              </div>

              <div class="col-auto tag-details text-weight-bold">
                {{ formattedTagDetails }}
              </div>

              <div class="col-auto">
                <qrcode-vue
                  v-if="order?.order_no"
                  :value="order.order_no"
                  :size="40"
                  level="H"
                  class="q-mt-xs"
                  render-as="svg"
                />
              </div>

              <div class="col-auto">
                <div class="tag-pcs">{{ totalItems }}</div>
              </div>
            </q-card>
          </div>
            </div>
          </div>

          <!-- Top info row -->
          <div class="row text-subtitle1 q-mt-sm q-col-gutter-x-md">
            <div class="col-auto">
              <div class="all-simple-borders q-pa-sm q-mb-sm">
                <div class="text-weight-bold text-uppercase">Order Details</div>
                <div class="line-height-1">
                  <div>
                    <span class="text-subtitle2 text-uppercase">
                      Order No:
                    </span>
                    <span class="text-summary">{{
                      order?.order_no || "N/A"
                    }}</span>
                  </div>

                  <div>
                    <span class="text-subtitle2 text-uppercase">
                      Order Date:
                    </span>
                    <span class="text-summary">{{ formattedOrderDate }}</span>
                  </div>
                </div>
              </div>
              <div class="all-simple-borders q-pa-sm">
                <div class="text-weight-bold text-subtitle1 text-uppercase">
                  Customer Details
                </div>
                <div class="line-height-1">
                  <div>
                    <span class="text-subtitle2 text-uppercase">
                      Customer Name:
                    </span>
                    <span class="text-summary">{{
                      customer?.name || "N/A"
                    }}</span>
                  </div>

                  <div>
                    <span class="text-subtitle2 text-uppercase">
                      Contact No/s:
                    </span>
                    <span class="text-summary">
                      {{ customer?.contact_no1 || "N/A"
                      }}<span v-if="customer?.contact_no2">
                        / {{ customer?.contact_no2 || "-" }}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="col">
              <div class="float-right">
                <qrcode-vue
                  v-if="order?.order_no"
                  :value="order.order_no"
                  :size="80"
                  level="H"
                  class=""
                />
                <div v-else>No QR Code</div>
              </div>
              <!-- <div class="text-weight-bold text-subtitle1">Other Details</div> -->
              <div class="line-height-1">
                <div>
                  <span class="text-subtitle2 text-uppercase"> Urgency: </span>
                  <span
                    :class="[
                      'text-uppercase',
                      'text-summary',
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

                <div>
                  <span class="text-subtitle2 text-uppercase">
                    No. of Bags:
                  </span>
                  <span class="text-summary">{{
                    collection?.no_bags || 0
                  }}</span>
                </div>

                <!-- NEW: Total Items (above Total Amount) -->
                <div>
                  <span class="text-subtitle2 text-uppercase">
                    Total Items:
                  </span>
                  <span class="text-summary">{{ totalItems }}</span>
                </div>

                <div>
                  <span class="text-subtitle2 text-uppercase">
                    Total Amount:
                  </span>
                  <span class="text-summary">
                    ${{ (order?.order_payment?.total_amount || 0).toFixed(2) }}
                  </span>
                </div>
                <div>
                  <span class="text-subtitle2 text-uppercase"> Notes: </span>
                  <span class="text-summary">N/A</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Pieces -->
          <div
            v-if="pcItems && pcItems.length"
            class="q-mt-md line-height-1 text-center"
          >
            <div class="text-weight-bolder q-mb-xs text-uppercase text-left">
              Pieces Unit
            </div>
            <div class="all-simple-borders">
              <div
                class="row tag-card-header text-weight-bold horizontal-line-cell"
              >
                <div class="col col-3 vertical-line-cell tag-card-cell">
                  Item
                </div>
                <div class="col col-2 vertical-line-cell tag-card-cell">
                  Method
                </div>
                <div class="col col-2 vertical-line-cell tag-card-cell">
                  Price
                </div>
                <div class="col col-1 vertical-line-cell tag-card-cell">
                  Qty
                </div>
                <div class="col col-1 vertical-line-cell tag-card-cell">
                  Pieces
                </div>
                <div class="col col-3 vertical-line-cell tag-card-cell">
                  Remarks
                </div>
              </div>

              <div
                v-for="(item, idx) in pcItems"
                :key="'pc-' + (item.id ?? idx)"
                class="row horizontal-line-cell"
              >
                <div
                  class="col col-3 vertical-line-cell tag-card-cell text-left"
                >
                  {{ item.item_name }}
                </div>
                <div class="col col-2 vertical-line-cell tag-card-cell">
                  {{ processLabel(item.process) }}
                </div>
                <div class="col col-2 vertical-line-cell tag-card-cell">
                  {{ priceDisplay(item) }}
                </div>
                <div class="col col-1 vertical-line-cell tag-card-cell">
                  {{ formatQty(item.quantity) }} {{ qtyUnitLabel(item) }}
                </div>
                <div class="col col-1 vertical-line-cell tag-card-cell">
                  {{ totalPiecesForPc(item) }} pcs
                </div>
                <div class="col col-3 vertical-line-cell tag-card-cell"></div>
              </div>
            </div>
          </div>

          <!-- Weight -->
          <div
            v-if="weightItems && weightItems.length"
            class="q-mt-md line-height-1 text-center"
          >
            <div class="text-weight-bolder q-mb-xs text-uppercase text-left">
              Weight Unit
            </div>
            <div class="all-simple-borders">
              <div
                class="row tag-card-header text-weight-bold horizontal-line-cell"
              >
                <div class="col col-3 vertical-line-cell tag-card-cell">
                  Item
                </div>
                <div class="col col-2 vertical-line-cell tag-card-cell">
                  Method
                </div>
                <div class="col col-2 vertical-line-cell tag-card-cell">
                  Price
                </div>
                <div class="col col-1 vertical-line-cell tag-card-cell">
                  Weight
                </div>
                <div class="col col-1 vertical-line-cell tag-card-cell">
                  Pieces
                </div>
                <div class="col col-3 vertical-line-cell tag-card-cell">
                  Remarks
                </div>
              </div>

              <div
                v-for="(item, idx) in weightItems"
                :key="'wt-' + (item.id ?? idx)"
                class="row horizontal-line-cell"
              >
                <div
                  class="col col-3 vertical-line-cell tag-card-cell text-left"
                >
                  {{ item.item_name }}
                </div>
                <div class="col col-2 vertical-line-cell tag-card-cell">
                  {{ processLabel(item.process) }}
                </div>
                <div class="col col-2 vertical-line-cell tag-card-cell">
                  {{ priceDisplay(item) }}
                </div>
                <div class="col col-1 vertical-line-cell tag-card-cell">
                  {{ formatQty(item.quantity, 2) }}
                  {{ unitLabel(getUnitForItem(item)) }}
                </div>
                <div class="col col-1 vertical-line-cell tag-card-cell">
                  {{ computedPcs(item) }} pcs
                </div>
                <div class="col col-3 vertical-line-cell tag-card-cell"></div>
              </div>
            </div>
          </div>

          <!-- Size -->
          <div
            v-if="sizeItems && sizeItems.length"
            class="q-mt-md line-height-1 text-center"
          >
            <div class="text-weight-bolder q-mb-xs text-uppercase text-left">
              Size Unit
            </div>
            <div class="all-simple-borders">
              <div
                class="row tag-card-header text-weight-bold horizontal-line-cell"
              >
                <div class="col col-3 vertical-line-cell tag-card-cell">
                  Item
                </div>
                <div class="col col-2 vertical-line-cell tag-card-cell">
                  Method
                </div>
                <div class="col col-2 vertical-line-cell tag-card-cell">
                  Price
                </div>
                <div class="col col-1 vertical-line-cell tag-card-cell">
                  Size
                </div>
                <div class="col col-1 vertical-line-cell tag-card-cell">
                  Pieces
                </div>
                <div class="col col-3 vertical-line-cell tag-card-cell">
                  Remarks
                </div>
              </div>

              <div
                v-for="(item, idx) in sizeItems"
                :key="'sz-' + (item.id ?? idx)"
                class="row horizontal-line-cell"
              >
                <div
                  class="col col-3 vertical-line-cell tag-card-cell text-left"
                >
                  {{ item.item_name }}
                </div>
                <div class="col col-2 vertical-line-cell tag-card-cell">
                  {{ processLabel(item.process) }}
                </div>
                <div class="col col-2 vertical-line-cell tag-card-cell">
                  {{ priceDisplay(item) }}
                </div>
                <div class="col col-1 vertical-line-cell tag-card-cell">
                  {{ formatQty(item.quantity, 2) }}
                  {{ unitLabel(getUnitForItem(item)) }}
                </div>
                <div class="col col-1 vertical-line-cell tag-card-cell">
                  {{ computedPcs(item) }} pcs
                </div>
                <div class="col col-3 vertical-line-cell tag-card-cell"></div>
              </div>
            </div>
          </div>

          <!-- Empty -->
          <div
            v-if="
              (!pcItems || !pcItems.length) &&
              (!weightItems || !weightItems.length) &&
              (!sizeItems || !sizeItems.length)
            "
            class="text-center text-grey q-my-md text-subtitle1"
          >
            No items added to the list.
          </div>

          <!-- Other remarks + category counts -->
          <div class="q-mt-md text-subtitle1 text-weight-bold">
            Other Remarks:
          </div>
          <div>
            <div class="bottom-border"></div>
            <div class="bottom-border"></div>
            <div class="bottom-border"></div>
          </div>

          <div class="row text-center q-mb-xs q-mt-sm text-weight-bold">
            <div class="col">A. Clothing</div>
            <div class="col">B. Bedding</div>
            <div class="col">C. Curtain</div>
            <div class="col">D. Sofa</div>
            <div class="col">E. Stuffed Toy</div>
            <div class="col">F. Carpet</div>
            <div class="col">G. Others</div>
          </div>
          <div class="row text-center q-col-gutter-x-sm">
            <div class="col">
              <div class="tag-borders">
                {{ tagCategoryCounts.clothing || 0 }}
              </div>
            </div>
            <div class="col">
              <div class="tag-borders">
                {{ tagCategoryCounts.bedding || 0 }}
              </div>
            </div>
            <div class="col">
              <div class="tag-borders">
                {{ tagCategoryCounts.curtain || 0 }}
              </div>
            </div>
            <div class="col">
              <div class="tag-borders">{{ tagCategoryCounts.sofa || 0 }}</div>
            </div>
            <div class="col">
              <div class="tag-borders">
                {{ tagCategoryCounts.stuffed_toy || 0 }}
              </div>
            </div>
            <div class="col">
              <div class="tag-borders">{{ tagCategoryCounts.carpet || 0 }}</div>
            </div>
            <div class="col">
              <div class="tag-borders">{{ tagCategoryCounts.others || 0 }}</div>
            </div>
          </div>
        </q-card>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { useRoute } from "vue-router";
import QrcodeVue from "qrcode.vue";
import html2pdf from "html2pdf.js";
import ccLogo from "@/assets/images/cc_logo.png";
import dcLogo from "@/assets/images/dc_logo.png";

const transactionStore = useTransactionStore();
const route = useRoute();

const order = ref(null);
const customer = ref(null);
const collection = ref({});
const delivery = ref({});
const logistics = ref({});
const transactions = ref([]);
const instructionsRecurring = ref([]);
const instructionsOnetime = ref([]);
const reports = ref([]);

const printableCard = ref(null);

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

onMounted(async () => {
  try {
    const orderNo = route.params.order_no;
    const orderDetails = await transactionStore.fetchWholeOrderByOrderNo(
      orderNo
    );

    logistics.value = orderDetails || {};
    order.value = orderDetails.order || {};
    customer.value = orderDetails.customer || {};
    collection.value = orderDetails.collection || {};
    delivery.value = orderDetails.delivery || {};

    transactions.value = [];
    (orderDetails.transactions || []).forEach((tx) => {
      if (Array.isArray(tx.order_transaction_items)) {
        tx.order_transaction_items.forEach((item) =>
          transactions.value.push(item)
        );
      }
    });

    reports.value = orderDetails.error_reports || [];

    instructionsOnetime.value = (orderDetails.instructionsOneTime || []).map(
      (instruction) => ({
        ...instruction,
        to: [
          ...(instruction.admin ? ["admin"] : []),
          ...(instruction.cleaning ? ["cleaning"] : []),
          ...(instruction.packing ? ["packing"] : []),
          ...(instruction.picking_sending ? ["pickingsending"] : []),
        ],
      })
    );

    instructionsRecurring.value = (
      orderDetails.instructionsRecurring || []
    ).map((instruction) => ({
      ...instruction,
      to: [
        ...(instruction.admin ? ["admin"] : []),
        ...(instruction.cleaning ? ["cleaning"] : []),
        ...(instruction.packing ? ["packing"] : []),
        ...(instruction.picking_sending ? ["pickingsending"] : []),
      ],
    }));
  } catch (error) {
    console.error("Error loading order details:", error);
  }
});

const tagUrgency = computed(() => {
  const urgency = logistics.value?.urgency?.toLowerCase?.() || "";
  if (urgency === "urgent") return "U";
  if (urgency === "express") return "E";
  return "D";
});

// ================= Helpers for unit-split tables =================
function getUnitForItem(item) {
  const u = String(item?.unit || "")
    .toLowerCase()
    .trim();
  if (u) return u;
  const s = String(item?.item_name || "").toLowerCase();
  if (s.includes("sqft")) return "sqft";
  if (s.includes("sqm")) return "sqm";
  if (s.includes("kg")) return "kg";
  if (s.includes("lb")) return "lbs";
  return "pc";
}
function unitLabel(u) {
  return String(u).toLowerCase() === "pc" ? "pcs" : u;
}
function processLabel(p) {
  const s = String(p || "").toLowerCase();
  if (s === "laundry") return "Laundry";
  if (s === "dryclean") return "Dry Clean";
  if (s === "pressing") return "Pressing Only";
  if (s === "others") return "Others";
  return p || "-";
}
function computedPcs(item) {
  const n = parseFloat(item?.pieces);
  return Number.isFinite(n) ? n : 0;
}
function qtyUnitLabel(item) {
  const u = getUnitForItem(item);
  if (u === "pc") {
    // treat multi-piece as "set"
    return computedPcs(item) > 1 ? "set" : "pcs";
  }
  return unitLabel(u);
}
function priceUnitLabel(item) {
  const u = getUnitForItem(item);
  if (u === "pc" && computedPcs(item) > 1) return "set";
  return unitLabel(u);
}
function priceDisplay(item) {
  const isTBA =
    item?.price == null ||
    (typeof item.price === "string" && item.price.toUpperCase() === "TBA");
  if (isTBA) return "TBA";
  const num = parseFloat(item.price) || 0;
  return `$${num.toFixed(2)} / ${priceUnitLabel(item)}`;
}
function formatQty(val, dp = 0) {
  const n = Number(val);
  if (!Number.isFinite(n)) return dp ? "0.00" : "0";
  return dp ? n.toFixed(dp) : String(Math.trunc(n));
}

// Source guard
const safeTx = computed(() =>
  Array.isArray(transactions.value) ? transactions.value : []
);

// Grouped lists
const pcItems = computed(() =>
  safeTx.value.filter((i) => getUnitForItem(i) === "pc")
);
const weightItems = computed(() =>
  safeTx.value.filter((i) => {
    const u = getUnitForItem(i);
    return u === "kg" || u === "lbs";
  })
);
const sizeItems = computed(() =>
  safeTx.value.filter((i) => {
    const u = getUnitForItem(i);
    return u === "sqft" || u === "sqm";
  })
);

// ================= Totals =================
// Total items = sum of pieces; for 'pc' rows: pieces-per-set × quantity
const totalItems = computed(() =>
  safeTx.value.reduce((acc, item) => {
    const unit = getUnitForItem(item);
    if (unit === "pc") {
      const per = Math.max(computedPcs(item) || 1, 1);
      const qty = Number(item?.quantity ?? 0) || 0;
      return acc + per * qty;
    }
    return acc + (Number(item?.pieces) || 0);
  }, 0)
);

// ================= Dates & badges =================
const formattedOrderDate = computed(() =>
  order.value?.created_at
    ? new Date(order.value.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A"
);

const tagCategoryCounts = computed(() =>
  safeTx.value.reduce((counts, item) => {
    const category = (item.tag_category || "others").toLowerCase();
    const unit = getUnitForItem(item);

    let add = 0;
    if (unit === "pc") {
      const per = Math.max(computedPcs(item) || 1, 1);
      const qty = Math.max(Number(item?.quantity ?? 0) || 0, 0);
      add = per * qty;
    } else {
      add = Number(item?.pieces) || 0;
    }

    counts[category] = (counts[category] || 0) + add;
    return counts;
  }, {})
);

function formatDate(date) {
  if (!date) return "N/A";
  const parsedDate = new Date(date);
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
  const weekday = weekdays[parsedDate.getDay()];
  const monthDay = parsedDate.getDate().toString().padStart(2, "0");
  const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0");
  return `${weekday}${month}${monthDay}`;
}
const formattedTagDetails = computed(() => {
  const collectionDate = formatDate(collection.value?.collection_date);
  const deliveryDate = formatDate(delivery.value?.delivery_date);
  const orderNoLast5 = order.value?.order_no?.slice(-5) || "N/A";
  return `${collectionDate}-${orderNoLast5}-${deliveryDate}`;
});

// ================= PDF / Print =================
const downloadTagPDF = () => {
  if (!printableCard.value) {
    console.error("Printable tag-card not found");
    return;
  }

  setTimeout(() => {
    const element = printableCard.value.$el || printableCard.value;

    const options = {
      margin: [13, 13, 13, 13],
      filename: `Tag_Slip_${order.value?.order_no || "N/A"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: null,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { avoid: [".tag-card"] },
    };

    html2pdf()
      .set(options)
      .from(element)
      .toPdf()
      .save()
      .catch((err) => console.error("Error generating PDF:", err));
  }, 500);
};

const PrintTagPDF = () => {
  if (!printableCard.value) {
    console.error("Printable tag-card not found");
    return;
  }

  setTimeout(() => {
    const element = printableCard.value.$el || printableCard.value;

    const options = {
      margin: [13, 13, 13, 13],
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: null,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { avoid: [".tag-card"] },
    };

    html2pdf()
      .set(options)
      .from(element)
      .toPdf()
      .output("blob")
      .then((blob) => {
        const pdfUrl = URL.createObjectURL(blob);
        const printWindow = window.open(pdfUrl, "_blank");

        if (printWindow) {
          setTimeout(() => {
            printWindow.print();
            printWindow.onafterprint = () => printWindow.close();
          }, 500);
        } else {
          console.error("Pop-up blocked. Please allow pop-ups for this site.");
        }
      })
      .catch((err) => console.error("Error generating PDF for printing:", err));
  }, 500);
};

async function PrintTag() {
  const tagElement = document.querySelector(".tags");
  if (!tagElement) {
    console.error("Tag element not found.");
    return;
  }

  try {
    const totalTags =
      Object.values(tagCategoryCounts.value).reduce((a, b) => a + b, 0) || 1;

    const clonedContainer = document.createElement("div");
    clonedContainer.style.display = "flex";
    clonedContainer.style.flexWrap = "wrap";
    clonedContainer.style.gap = "0px";

    for (let i = 0; i < totalTags; i++) {
      const clonedTag = tagElement.cloneNode(true);
      clonedTag.style.pageBreakBefore = "always";
      clonedContainer.appendChild(clonedTag);
    }

    const options = {
      margin: 0,
      filename: `Tags_Print_${order.value?.order_no || "N/A"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: null,
      },
      jsPDF: { unit: "mm", format: [105, 12.7], orientation: "landscape" },
      pagebreak: { mode: ["avoid-all", "css"] },
    };

    html2pdf()
      .set(options)
      .from(clonedContainer)
      .toPdf()
      .output("blob")
      .then((blob) => {
        const pdfUrl = URL.createObjectURL(blob);
        const newWindow = window.open(pdfUrl, "_blank");

        if (newWindow) {
          setTimeout(() => {
            newWindow.print();
            newWindow.onafterprint = () => newWindow.close();
          }, 500);
        } else {
          console.error("Pop-up blocked. Please allow pop-ups for this site.");
        }
      })
      .catch((err) => console.error("Error generating Tag PDF:", err));
  } catch (error) {
    console.error("Error generating printable tag PDF:", error);
  }
}

function totalPiecesForPc(item) {
  const per = Math.max(computedPcs(item) || 1, 1); // pieces per set
  const qty = Number(item?.quantity ?? 0) || 0; // number of sets
  return per * qty;
}
</script>
