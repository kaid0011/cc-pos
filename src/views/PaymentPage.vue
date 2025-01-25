<template>
  <div class="preview row">
    <!-- Left Container -->
    <div class="col-6 preview-left-container">
      <q-card class="order-container" ref="orderContainer">
        <!-- Header Section -->
        <q-card-section>
          <div class="banner bg-blue-grey text-white q-pa-md">
            <div class="flex justify-between">
              <div class="text-left">
                <div class="text-h6 text-weight-bolder">COTTON CARE</div>
                <div class="text-caption">
                  53 Ubi Ave 1 #01-29 Paya Ubi Ind. Park Singapore 408934
                </div>
                <div class="text-caption">9029 6919 / 6747 7844</div>
                <div class="text-caption">enquire@cottoncare.com.sg</div>
              </div>
              <div class="text-right">
                <div class="text-caption">
                  <div
                    class="text-h6 text-uppercase text-weight-bolder order-box"
                  >
                    Order Slip
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Customer and Order Details -->
        <div class="row slip-card justify-between text-p">
          <div class="col">
            <div class="text-slip-row">
              Customer Name:
              <span class="text-summary">{{
                customer?.name || "N/A"
              }}</span>
            </div>
            <div class="text-slip-row">
              Customer Type:
              <span class="text-summary">{{
                customer?.type || "N/A"
              }}</span>
            </div>
          </div>
          <div class="col">
            <div class="text-slip-row">
              Order No:
              <span class="text-summary">{{ order?.order_no || "N/A" }}</span>
            </div>
            <div class="text-slip-row">
              Order Date:
              <span class="text-summary">{{ formattedOrderDate }}</span>
            </div>
            <div class="text-slip-row">
              Ready By:
              <span class="text-summary">{{ formattedReadyBy }}</span>
            </div>
          </div>
        </div>

        <!-- Collection and Delivery Details -->
        <div class="row summary-header text-p">
          <div class="col slip-card">
            <div class="text-p text-center text-weight-bold text-uppercase">
              Collection Details
            </div>
            <q-separator class="q-my-xs" />
            <div class="text-slip-row">
              Contact Person:
              <span class="text-summary">{{
                collection.contactPerson?.name || "N/A"
              }}</span>
            </div>
            <div class="text-slip-row">
              Contact No:
              <span class="text-summary">{{
                collection.contactPerson?.contact_no1 || "N/A"
              }}</span>
            </div>
            <div class="text-slip-row">
              Address:
              <span class="text-summary">{{ collection?.address || "N/A" }}</span>
            </div>
            <div class="text-slip-row">
              Date From:
              <span class="text-summary">{{
                formattedCollectionDateFrom
              }}</span>
            </div>
            <div class="text-slip-row">
              Date To:
              <span class="text-summary">{{
                formattedCollectionDateTo
              }}</span>
            </div>
          </div>
          <div class="col slip-card">
            <div class="text-p text-center text-weight-bold text-uppercase">
              Delivery Details
            </div>
            <q-separator class="q-my-xs" />
            <div class="text-slip-row">
              Contact Person:
              <span class="text-summary">{{
                delivery.contactPerson?.name || "N/A"
              }}</span>
            </div>
            <div class="text-slip-row">
              Contact No:
              <span class="text-summary">{{
                delivery.contactPerson?.contact_no1 || "N/A"
              }}</span>
            </div>
            <div class="text-slip-row">
              Address:
              <span class="text-summary">{{ delivery?.address || "N/A" }}</span>
            </div>
            <div class="text-slip-row">
              Date From:
              <span class="text-summary">{{
                formattedDeliveryDateFrom
              }}</span>
            </div>
            <div class="text-slip-row">
              Date To:
              <span class="text-summary">{{
                formattedDeliveryDateTo
              }}</span>
            </div>
          </div>
        </div>

        <!-- Transaction Table -->
        <div class="transaction-summary">
          <div class="row row-col-header order-header">
            <div class="col col-4 text-weight-bold bordered">Item</div>
            <div class="col col-2 text-weight-bold bordered">Process</div>
            <div class="col col-2 text-weight-bold bordered">Price</div>
            <div class="col col-1 text-weight-bold bordered">Pcs</div>
            <div class="col col-1 text-weight-bold bordered">Qty</div>
            <div class="col col-2 text-weight-bold bordered">Subtotal</div>
          </div>

          <div v-if="transactions.length > 0">
            <div
              v-for="item in transactions"
              :key="item.name"
              class="row row-col-row order-row"
            >
              <div class="col col-4 bordered">{{ item.item_name }}</div>
              <div class="col col-2 bordered">{{ item.process }}</div>
              <div class="col col-2 bordered">
                {{ `$${item.price.toFixed(2)}` }}
              </div>
              <div class="col col-1 bordered">{{ item.pieces }}</div>
              <div class="col col-1 bordered">{{ item.quantity }}</div>
              <div class="col col-2 bordered">
                {{ `$${item.subtotal.toFixed(2)}` }}
              </div>
            </div>
          </div>
          <div v-else class="text-center text-grey q-my-md">
            No items added to the list.
          </div>
          <div class="row row-col-footer order-footer">
            <div class="col col-6 text-weight-bold text-uppercase"></div>
            <div class="col col-2 text-weight-bold text-uppercase bordered">
              Total
            </div>
            <div class="col col-1 text-weight-bold bordered">{{ totalPcs }}</div>
            <div class="col col-1 text-weight-bold bordered">{{ totalQty }}</div>
            <div class="col col-2 text-weight-bold bordered">
              ${{ totalSubtotal }}
            </div>
          </div>
        </div>
      </q-card>
    </div>

    <!-- Right Container -->
    <div class="col-6 print-right-container">
      <div class="text-h6 text-weight-bold text-center q-mt-xl">Would you like to deposit now?</div>
      <div class="row justify-center q-col-gutter-md q-mx-xl q-my-lg">
        <div class="col">
        <q-btn class="payment-btn text-white q-mb-sm" color="primary"
          ><span class="payment-btn-txt">Cash</span>
        </q-btn></div>
        <div class="col">
        <q-btn class="payment-btn text-white q-mb-sm" color="primary"
          ><span class="payment-btn-txt">Pay Now (QR)</span>
        </q-btn></div>
        <div class="col">
        <q-btn class="payment-btn text-white q-mb-sm" color="primary"
          ><span class="payment-btn-txt">Paid Online</span></q-btn
        ></div>
        <div class="col">
        <q-btn outline class="payment-btn q-mb-sm" color="primary"
          ><span class="payment-btn-txt">Skip</span></q-btn
        ></div>
      </div>
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
    const orderDetails = await transactionStore.fetchOrderDetailsByOrderNo(orderNo);
    console.log("Order Details:", orderDetails);

    // Assign fetched data directly
    order.value = orderDetails.order;
    customer.value = orderDetails.customer;
    collection.value = orderDetails.collection;
    delivery.value = orderDetails.delivery;
    transactions.value = orderDetails.transactions || [];
    
    // Prepare instructionsOnetime with dynamically created `to` field
    instructionsOnetime.value = (orderDetails.instructionsOneTime || []).map(instruction => ({
      ...instruction,
      to: [
        ...(instruction.admin ? ["admin"] : []),
        ...(instruction.cleaning ? ["cleaning"] : []),
        ...(instruction.packing ? ["packing"] : []),
        ...(instruction.picking_sending ? ["pickingsending"] : []),
      ],
    }));

    // Prepare instructionsRecurring with dynamically created `to` field
    instructionsRecurring.value = (orderDetails.instructionsRecurring || []).map(instruction => ({
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
    ? new Date(order.value.order_date_time).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "N/A"
);

const formattedReadyBy = computed(() =>
  order.value?.ready_by
    ? new Date(order.value.ready_by).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
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

// Date formatting for collection
const formattedCollectionDateFrom = computed(() =>
  collection.value?.date_from
    ? new Date(collection.value.date_from).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A"
);

const formattedCollectionDateTo = computed(() =>
  collection.value?.date_to
    ? new Date(collection.value.date_to).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A"
);

// Date formatting for delivery
const formattedDeliveryDateFrom = computed(() =>
  delivery.value?.date_from
    ? new Date(delivery.value.date_from).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A"
);

const formattedDeliveryDateTo = computed(() =>
  delivery.value?.date_to
    ? new Date(delivery.value.date_to).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A"
);
</script>
