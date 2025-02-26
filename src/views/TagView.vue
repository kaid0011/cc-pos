<template>
  <div class="tags-view-container row">
    <!-- Left Container -->
    <div class="col-6 tags-left-container">
      <button @click="printCard" class="q-btn q-btn-item q-btn-red">
        Print
      </button>
      <q-card class="tag-card" ref="printableCard">
        <div>
          <div class="">
            Order No:
            <span class="text-summary">{{ order?.order_no || "N/A" }}</span>
          </div>
          <div class="">
            Order Date:
            <span class="text-summary">{{ formattedOrderDate }}</span>
          </div>
          <div class="">
            Customer Name:
            <span class="text-summary">{{ customer?.name || "N/A" }}</span>
          </div>
          <div class="">
            Contact Nos:
            <span class="text-summary"
              >{{ customer?.contact_no1 || "N/A" }} /
              {{ customer?.contact_no2 || "-" }}</span
            >
          </div>
          <div class="">
            Delivery Date:
            <span class="text-summary">{{
              delivery?.delivery_date || "N/A"
            }}</span>
          </div>
          <div class="">
            No. of Bags:
            <span class="text-summary">{{ "N/A" }}</span>
          </div>
          <div class="">
            Notes:
            <span class="text-summary">{{ "N/A" }}</span>
          </div>
          <div class="">BARCODE</div>
        </div>
        <!-- Transaction Table -->
        <div class="row">
          <div class="col col-3 text-weight-bold tag-card-cell">Item</div>
          <div class="col col-2 text-weight-bold tag-card-cell">Method</div>
          <div class="col col-2 text-weight-bold tag-card-cell">Price</div>
          <div class="col col-1 text-weight-bold tag-card-cell">Pcs</div>
          <div class="col col-1 text-weight-bold tag-card-cell">Qty</div>
          <div class="col col-3 text-weight-bold tag-card-cell">Remarks</div>
        </div>

        <div v-if="transactions.length > 0">
          <div v-for="item in transactions" :key="item.name" class="row">
            <div class="col col-3 tag-card-cell">{{ item.item_name }}</div>
            <div class="col col-2 tag-card-cell">{{ item.process }}</div>
            <div class="col col-2 tag-card-cell">
              {{ `$${item.price.toFixed(2)}` }}
            </div>
            <div class="col col-1 tag-card-cell">{{ item.pieces }}</div>
            <div class="col col-1 tag-card-cell">{{ item.quantity }}</div>
            <div class="col col-3 tag-card-cell"></div>
          </div>
        </div>
        <div v-else class="text-center text-grey q-my-md">
          No items added to the list.
        </div>
        <div class="row">
          <div class="col col-5 text-weight-bold text-uppercase"></div>
          <div class="col col-2 text-weight-bold text-uppercase tag-card-cell">
            Total
          </div>
          <div class="col col-1 text-weight-bold tag-card-cell">
            {{ totalPcs }}
          </div>
          <div class="col col-1 text-weight-bold tag-card-cell">
            {{ totalQty }}
          </div>
          <div class="col col-3 text-weight-bold"></div>
        </div>
        <div class="">Other Remarks:</div>
        <div>
          <div class="bottom-border"></div>
          <div class="bottom-border"></div>
          <div class="bottom-border"></div>
        </div>
        <div class="row q-mb-sm">
          <div class="col">A. Clothing</div>
          <div class="col tag-borders q-pl-md">
            {{ tagCategoryCounts.clothing || 0 }}
          </div>
        </div>
        <div class="row q-mb-sm">
          <div class="col">B. Bedding</div>
          <div class="col tag-borders q-pl-md">
            {{ tagCategoryCounts.bedding || 0 }}
          </div>
        </div>
        <div class="row q-mb-sm">
          <div class="col">C. Curtain</div>
          <div class="col tag-borders q-pl-md">
            {{ tagCategoryCounts.curtain || 0 }}
          </div>
        </div>
        <div class="row q-mb-sm">
          <div class="col">D. Sofa</div>
          <div class="col tag-borders q-pl-md">
            {{ tagCategoryCounts.sofa || 0 }}
          </div>
        </div>
        <div class="row q-mb-sm">
          <div class="col">E. Stuffed Toy</div>
          <div class="col tag-borders q-pl-md">
            {{ tagCategoryCounts.stuffed_toy || 0 }}
          </div>
        </div>
        <div class="row q-mb-sm">
          <div class="col">F. Carpet</div>
          <div class="col tag-borders q-pl-md">
            {{ tagCategoryCounts.carpet || 0 }}
          </div>
        </div>
        <div class="row q-mb-sm">
          <div class="col">G. Others</div>
          <div class="col tag-borders q-pl-md">
            {{ tagCategoryCounts.others || 0 }}
          </div>
        </div>
      </q-card>
    </div>
    <!-- Right Container -->
    <div class="col-6 tags-right-container">
      <q-card style="width: 100mm; height: 0.5in">
        <!-- Right Card Content -->
          <div class="text-center row q-pa-xs">
          <div class="col">
            <div>{{ tagCategoryCounts.clothings || 0 }}</div>
            <div>A</div>
          </div>
          <div class="col">
            <div>{{ tagCategoryCounts.beddings || 0 }}</div>
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

// Method to download orderContainer as a PDF
async function downloadOrderPDF() {
  const orderContainer = document.querySelector(".order-container"); // Ensure the selector matches your container

  if (!orderContainer) {
    console.error("Order container not found.");
    return;
  }

  try {
    // A4 paper dimensions in mm
    const a4WidthInMm = 297; // Landscape width
    const a4HeightInMm = 210; // Landscape height
    const halfA4WidthInMm = a4WidthInMm / 2; // Half the width of A4 paper
    const conversionFactor = 3.779528; // mm to pixels

    // Convert dimensions to pixels
    const a4HeightInPixels = a4HeightInMm * conversionFactor;
    const halfA4WidthInPixels = halfA4WidthInMm * conversionFactor;

    // Set the container dimensions
    orderContainer.style.minHeight = `${a4HeightInPixels}px`;
    orderContainer.style.minWidth = `${halfA4WidthInPixels}px`;

    // Capture the HTML element as a canvas
    const canvas = await html2canvas(orderContainer, { scale: 2 }); // Increase scale for better quality
    const imgData = canvas.toDataURL("image/png");

    // Create a new PDF with landscape orientation
    const pdf = new jsPDF("landscape", "mm", "a4"); // Landscape orientation
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Add the image to the PDF at the left half
    pdf.addImage(imgData, "PNG", 0, 0, halfA4WidthInMm, a4HeightInMm);

    // Download the PDF
    pdf.save(`Order_${order.value?.order_no || "Slip"}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
}
// Print Function
async function printCard() {
  const cardElement = document.querySelector(".tag-card");

  if (!cardElement) {
    console.error("Card element not found.");
    return;
  }

  try {
    // Capture the card as a canvas
    const canvas = await html2canvas(cardElement, { scale: 2 });

    // Convert canvas to an image
    const imageData = canvas.toDataURL("image/png");

    // Open the image in a new tab for printing
    const printWindow = window.open("", "_blank");

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Print</title>
        <style>
          @media print {
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            img {
              width: 100mm;
              height: auto;
            }
          }
        </style>
      </head>
      <body>
        <img src="${imageData}" alt="Printable Card" />
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  } catch (error) {
    console.error("Error capturing and printing the card:", error);
  }
}
const tagCategoryCounts = computed(() => {
  return transactions.value.reduce((counts, item) => {
    const category = item.tag_category?.toLowerCase() || "others";
    counts[category] = (counts[category] || 0) + 1;
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
</script>
