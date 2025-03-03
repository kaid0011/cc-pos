<template>
  <div class="tags-view-container">
<div class="row justify-center q-col-gutter-md q-pa-md">
<div class="col-auto">
  <q-btn color="primary" @click="downloadTagPDF">
    Download Tag Slip PDF
  </q-btn>
</div>
<div class="col-auto">
  <q-btn color="primary" @click="PrintTagPDF">
    Print Tag Slip PDF
  </q-btn>
</div>
<div class="col-auto">
  <q-btn color="primary" @click="PrintTag">
    Print Tags
  </q-btn>
</div>
</div>
<div class="row justify-center">
  <q-card class="tag-card" ref="printableCard">
    <div class="row tag-card-header justify-between items-center">
      <!-- QR Code Section -->
      <div class="col-auto">
        <qrcode-vue
          v-if="order?.order_no"
          :value="order.order_no"
          :size="70"
          level="H"
          class="q-mt-sm q-ml-sm"
        />
        <div v-else>No QR Code</div>
      </div>
      <div class="col text-subtitle1 q-ma-md">
        <div class="">
          Order No:
          <span class="text-summary">{{ order?.order_no || "N/A" }}</span>
        </div>
        <div class="">
          Order Date:
          <span class="text-summary">{{ formattedOrderDate }}</span>
        </div>
      </div>
      <div class="col-auto text-h6 q-pa-md">
        <div class="text-uppercase bg-grey-3 text-weight-bolder order-box">
          <div class="q-px-sm">Tag Slip</div>
        </div>
      </div>
       
    </div>

    <div class="row justify-between q-pa-md">
      <div class="col">
        <div class="">
          Customer Name:
          <span class="text-summary">{{ customer?.name || "N/A" }}</span>
        </div>
        <div class="">
          Contact Nos:
          <span class="text-summary"
            >{{ customer?.contact_no1 || "N/A"
            }}<span v-if="customer?.contact_no2">
              / {{ customer?.contact_no2 || "-" }}</span
            ></span
          >
        </div>
        <div class="">
          Ready By:
          <span class="text-summary">{{ order?.ready_by || "N/A" }}</span>
        </div>
        <div class="">
          No. of Bags:
          <span class="text-summary">{{ "N/A" }}</span>
        </div>
        <div class="">
          Notes:
          <span class="text-summary">{{ "N/A" }}</span>
        </div>
      </div>
      <div class="col-auto">
        <q-card style="width: 100mm; height: 0.5in; border: solid; border-width: 1px; box-shadow: none;">
          <!-- Right Card Content -->
          <div class="text-center row q-pa-xs">
            <div class="col">
              <div>{{ tagCategoryCounts.clothing || 0 }}</div>
              <div>A</div>
            </div>
            <div class="col">
              <div>{{ tagCategoryCounts.bedding || 0 }}</div>
              <div>B</div>
            </div>
            <div class="col">
              <div>{{ tagCategoryCounts.curtain || 0 }}</div>
              <div>C</div>
            </div>
            <div class="col">
              <div>{{ tagCategoryCounts.sofa || 0 }}</div>
              <div>D</div>
            </div>
            <div class="col">
              <div>{{ tagCategoryCounts.stuffed_toy || 0 }}</div>
              <div>E</div>
            </div>
            <div class="col">
              <div>{{ tagCategoryCounts.carpet || 0 }}</div>
              <div>F</div>
            </div>
            <div class="col q-mr-sm">
              <div>{{ tagCategoryCounts.others || 0 }}</div>
              <div>G</div>
            </div>
            <div class="col-6 tag-details q-mb-xs">
              {{ formattedTagDetails }}
            </div>
          </div>
        </q-card>
      </div>
     
    </div>
    <!-- Transaction Table -->
    <div class="row tag-card-header">
      <div class="col col-3 text-weight-bold tag-card-cell text-center">
        Item
      </div>
      <div class="col col-2 text-weight-bold tag-card-cell text-center">
        Method
      </div>
      <div class="col col-2 text-weight-bold tag-card-cell text-center">
        Price
      </div>
      <div class="col col-1 text-weight-bold tag-card-cell text-center">
        Pcs
      </div>
      <div class="col col-1 text-weight-bold tag-card-cell text-center">
        Qty
      </div>
      <div class="col col-3 text-weight-bold tag-card-cell text-center">
        Remarks
      </div>
    </div>

    <div v-if="transactions.length > 0">
      <div v-for="item in transactions" :key="item.name" class="row">
        <div class="col col-3 tag-card-cell">{{ item.item_name }}</div>
        <div class="col col-2 tag-card-cell text-center">
          {{ item.process }}
        </div>
        <div class="col col-2 tag-card-cell text-center">
          {{ `$${item.price.toFixed(2)}` }}
        </div>
        <div class="col col-1 tag-card-cell text-center">
          {{ item.pieces }}
        </div>
        <div class="col col-1 tag-card-cell text-center">
          {{ item.quantity }}
        </div>
        <div class="col col-3 tag-card-cell"></div>
      </div>
    </div>
    <div v-else class="text-center text-grey q-my-md">
      No items added to the list.
    </div>
    <div class="row tag-card-header q-py-sm">
      <div class="col col-5 text-weight-bold text-uppercase"></div>
      <div
        class="col col-2 text-weight-bold text-uppercase text-right q-pr-md"
      >
        Total :
      </div>
      <div class="col col-1 text-weight-bold text-center">
        {{ totalPcs }}
      </div>
      <div class="col col-1 text-weight-bold text-center">
        {{ totalQty }}
      </div>
      <div class="col col-3 text-weight-bold"></div>
    </div>
    <div class="q-mt-md text-subtitle1 text-weight-bold">Other Remarks:</div>
    <div>
      <div class="bottom-border"></div>
      <div class="bottom-border"></div>
      <div class="bottom-border"></div>
    </div>
    <div class="row text-center q-mb-xs">
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
        <div class="tag-borders">
          {{ tagCategoryCounts.sofa || 0 }}
        </div>
      </div>
      <div class="col">
        <div class="tag-borders">
          {{ tagCategoryCounts.stuffed_toy || 0 }}
        </div>
      </div>
      <div class="col">
        <div class="tag-borders">
          {{ tagCategoryCounts.carpet || 0 }}
        </div>
      </div>
      <div class="col">
        <div class="tag-borders">
          {{ tagCategoryCounts.others || 0 }}
        </div>
      </div>
    </div>
  </q-card>
</div>
<div class="row justify-center">
  <q-card class="tags" style="width: 100mm; height: 0.5in">
    <!-- Right Card Content -->
    <div class="text-center row q-pa-xs">
      <div class="col">
        <div>{{ tagCategoryCounts.clothing || 0 }}</div>
        <div>A</div>
      </div>
      <div class="col">
        <div>{{ tagCategoryCounts.bedding || 0 }}</div>
        <div>B</div>
      </div>
      <div class="col">
        <div>{{ tagCategoryCounts.curtain || 0 }}</div>
        <div>C</div>
      </div>
      <div class="col">
        <div>{{ tagCategoryCounts.sofa || 0 }}</div>
        <div>D</div>
      </div>
      <div class="col">
        <div>{{ tagCategoryCounts.stuffed_toy || 0 }}</div>
        <div>E</div>
      </div>
      <div class="col">
        <div>{{ tagCategoryCounts.carpet || 0 }}</div>
        <div>F</div>
      </div>
      <div class="col q-mr-sm">
        <div>{{ tagCategoryCounts.others || 0 }}</div>
        <div>G</div>
      </div>
      <div class="col-6 tag-details">
        {{ formattedTagDetails }}
      </div>
    </div>
  </q-card>
</div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { useRoute } from "vue-router";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QrcodeVue from "qrcode.vue";

const transactionStore = useTransactionStore();
const route = useRoute();

const order = ref(null);
const customer = ref(null);
const collection = ref({});
const delivery = ref({});
const transactions = ref([]);
const instructionsRecurring = ref([]);
const instructionsOnetime = ref([]);
const reports = ref([]);

onMounted(async () => {
  try {
    // Get order_no from route params
    const orderNo = route.params.order_no;

    // Fetch the order details
    const orderDetails = await transactionStore.fetchOrderDetailsByOrderNo(
      orderNo
    );
    console.log("Order Details:", orderDetails);

    // Assign fetched data directly
    order.value = orderDetails.order;
    customer.value = orderDetails.customer;
    collection.value = orderDetails.collection;
    delivery.value = orderDetails.delivery;
    transactions.value = orderDetails.transactions || [];

    // Prepare instructionsOnetime with dynamically created `to` field
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

    // Prepare instructionsRecurring with dynamically created `to` field
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

    reports.value = orderDetails.errorReports || [];
  } catch (error) {
    console.error("Error loading order details:", error);
  }
});

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

// Computed properties for totals
const totalPcs = computed(() => {
  return transactions.value.reduce((acc, item) => {
    const pcs = parseFloat(item.pieces) || 0; // Ensure a numeric value
    return acc + pcs;
  }, 0);
});

const totalQty = computed(() => {
  return transactions.value.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0; // Ensure a numeric value
    return acc + qty;
  }, 0);
});

const totalSubtotal = computed(() => {
  return transactions.value
    .reduce((acc, item) => {
      const subtotal = parseFloat(item.subtotal) || 0; // Ensure a numeric value
      return acc + subtotal;
    }, 0)
    .toFixed(2); // Format as a fixed two-decimal string
});

// Date formatting
const formattedOrderDate = computed(() =>
  order.value?.order_date_time
    ? new Date(order.value.order_date_time).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A"
);

// Method to download tagContainer as a PDF
async function downloadTagPDF() {
  const tagContainer = document.querySelector(".tag-card");
  if (!tagContainer) return console.error("Order container not found.");

  try {
    const [width, height] = [210, 297].map((mm) => mm * 3.779528); // Convert A4 dimensions to pixels
    Object.assign(tagContainer.style, {
      minHeight: `${height}px`,
      minWidth: `${width}px`,
    });

    const canvas = await html2canvas(tagContainer, { scale: 2 });
    const pdf = new jsPDF("portrait", "mm", "a4");

    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      width / 3.779528,
      height / 3.779528
    );
    pdf.save(`TagSlip_${order.value?.order_no || "Slip"}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
}

const tagCategoryCounts = computed(() => {
  return transactions.value.reduce((counts, item) => {
    const category = item.tag_category?.toLowerCase() || "others";
    const pieces = parseInt(item.pieces) || 0; // Use pieces instead of quantity
    counts[category] = (counts[category] || 0) + pieces;
    return counts;
  }, {});
});


function formatDate(date) {
  if (!date) return "N/A";
  const parsedDate = new Date(date);
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
  const weekday = weekdays[parsedDate.getDay()]; // Day abbreviation
  const monthDay = parsedDate.getDate().toString().padStart(2, "0"); // 2-digit day
  const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0"); // 2-digit month
  return `${weekday}${month}${monthDay}`; // Combine into format
}

const formattedTagDetails = computed(() => {
  const collectionDate = formatDate(collection.value.collection_date);
  const deliveryDate = formatDate(delivery.value.delivery_date);
  const orderNoLast5 = order.value?.order_no?.slice(-5) || "N/A";
  return `${collectionDate} - ${orderNoLast5} - ${deliveryDate}`;
});

async function PrintTagPDF() {
  const tagContainer = document.querySelector(".tag-card");
  if (!tagContainer) return console.error("Order container not found.");
  try {
    const canvas = await html2canvas(tagContainer, { scale: 2 });
    const pdf = new jsPDF("portrait", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
    
    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    const newWindow = window.open(pdfUrl, "_blank");
    if (newWindow) {
      setTimeout(() => {
        newWindow.print();
        newWindow.onafterprint = () => {
          newWindow.close();
        };
      }, 100);
    } else {
      console.error("Pop-up blocked. Please allow pop-ups for this site.");
    }
  } catch (error) {
    console.error("Error generating printable PDF:", error);
  }
}

async function PrintTag() {
  const tagContainer = document.querySelector(".tags");
  if (!tagContainer) return console.error("Tag container not found.");
  try {
    const canvas = await html2canvas(tagContainer, { scale: 2 });
    const pdf = new jsPDF("landscape", "mm", [100, 12.7]); // 100mm x 0.5in (12.7mm)
    const imgData = canvas.toDataURL("image/png");
    
    // Calculate total number of pages based on counter total
    const totalTags = Object.values(tagCategoryCounts.value).reduce((a, b) => a + b, 0);
    
    for (let i = 0; i < totalTags; i++) {
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, 100, 12.7);
    }
    
    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    const newWindow = window.open(pdfUrl, "_blank");
    if (newWindow) {
      setTimeout(() => {
        newWindow.print();
        newWindow.onafterprint = () => {
          newWindow.close();
        };
      }, 500);
    } else {
      console.error("Pop-up blocked. Please allow pop-ups for this site.");
    }
  } catch (error) {
    console.error("Error generating printable tag PDF:", error);
  }
}
</script>
