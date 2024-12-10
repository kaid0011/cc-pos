<template>
  <div class="view-order">
    <div class="slip-container">
<!-- Loading Spinner -->
<div v-if="isLoading" class="q-pa-md text-center">
  <q-spinner color="primary" size="40px" />
  <div class="text-caption q-mt-md">Loading Order Slip...</div>
</div>

<!-- Order Content -->
<div v-else>
  <div class="row">
    <q-btn
    class="text-white q-mb-md"
    color="primary"
    @click="printOrder"
    label="Print Order"
  />
  <q-btn
    color="primary"
    class="text-white q-mb-md q-ml-sm"
    @click="downloadOrder"
    label="Download PDF"
  />
  </div>
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

    <div class="row slip-card justify-between text-p">
      <div class="col">
        <div class="text-slip-row">
          Customer Name:
          <span class="text-summary">{{
            transactionStore.selectedCustomer?.name || 'N/A'
          }}</span>
        </div>
        <div class="text-slip-row">
          Contact No: <span class="text-summary">{{
            transactionStore.selectedCustomer?.contact_no1 || 'N/A'
          }}</span>
        </div>
        <div class="text-slip-row">
          Email: <span class="text-summary">{{
            transactionStore.selectedCustomer?.email || 'N/A'
          }}</span>
        </div>
      </div>
      <div class="col">
        <div class="text-slip-row">
          Order No:
          <span class="text-summary">{{ transactionStore?.orderNo || 'N/A' }}</span>
        </div>
        <div class="text-slip-row">
          Order Date:
          <span class="text-summary">{{ formattedOrderDate }}</span>
        </div>
        <div class="text-slip-row">
          Ready By: <span class="text-summary">{{ formattedReadyBy }}</span>
        </div>
      </div>
    </div>
    <div class="row summary-header text-p">
      <div class="col slip-card">
        <div class="text-p text-center text-weight-bold text-uppercase">
          Collection Details
        </div>
        <q-separator class="q-my-xs" />
        <div class="text-slip-row">
          Contact Person:
          <span class="text-summary">{{
            collectionContact?.name || "N/A"
          }}</span>
        </div>
        <div class="text-slip-row">
          Contact No:
          <span class="text-summary">{{
            collectionContact?.contact_no1 || "N/A"
          }}</span>
        </div>
        <div class="text-slip-row">
          Address:
          <span class="text-summary">{{
            collectionAddress?.address || "N/A"
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
            deliveryContact?.name || "N/A"
          }}</span>
        </div>
        <div class="text-slip-row">
          Contact No:
          <span class="text-summary">{{
            deliveryContact?.contact_no1 || "N/A"
          }}</span>
        </div>
        <div class="text-slip-row">
          Address:
          <span class="text-summary">{{
            deliveryAddress?.address || "N/A"
          }}</span>
        </div>
      </div>
    </div>

<!-- Transaction Table -->
<div class="transaction-summary">
<!-- Table Header -->
<div class="row row-col-header order-header">
<div class="col col-4 text-weight-bold bordered">Item</div>
<div class="col col-2 text-weight-bold bordered">Process</div>
<div class="col col-2 text-weight-bold bordered">Price</div>
<div class="col col-1 text-weight-bold bordered">Pcs</div>
<div class="col col-1 text-weight-bold bordered">Qty</div>
<div class="col col-2 text-weight-bold bordered">Subtotal</div>
</div>

<!-- Transactions -->
<div v-if="rows.length > 0">
<div
  v-for="item in rows"
  :key="item.name"
  class="row row-col-row order-row"
>
  <div class="col col-4 bordered">{{ item.name || 'N/A' }}</div>
  <div class="col col-2 bordered">{{ item.process || 'N/A' }}</div>
  <div class="col col-2 bordered">{{ item.price ? `$${item.price.toFixed(2)}` : 'N/A' }}</div>
  <div class="col col-1 bordered">{{ item.pieces || 'N/A' }}</div>
  <div class="col col-1 bordered">{{ item.quantity || 'N/A' }}</div>
  <div class="col col-2 bordered">{{ item.subtotal ? `$${item.subtotal.toFixed(2)}` : 'N/A' }}</div>
</div>


<div class="row row-col-footer order-footer">
<div class="col col-6 text-weight-bold text-uppercase"></div>
<div class="col col-2 text-weight-bold text-uppercase bordered">Total</div>
<div class="col col-1 text-weight-bold bordered">{{ totalPcs }}</div>
<div class="col col-1 text-weight-bold bordered">{{ totalQty }}</div>
<div class="col col-2 text-weight-bold bordered">{{ totalSubtotal }}</div>
</div>
</div>

<!-- Fallback Message -->
<div v-else class="text-center text-grey q-my-md">
No items added to the list.
</div>

</div>


    <!-- Payment Summary -->
    <q-card-section>
      <div class="text-right">
        <div>Sub Total: ${{ subtotal.toFixed(2) }}</div>
        <div>Deposit: ${{ deposit.toFixed(2) }}</div>
        <div>Total Due: ${{ totalDue.toFixed(2) }}</div>
        <div>Outstanding: ${{ outstanding.toFixed(2) }}</div>
      </div>
    </q-card-section>
  </q-card>
</div>
    </div>
  
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { useTransactionStore } from "@/stores/transactionStore";

const transactionStore = useTransactionStore(); // Access transactionStore
const isLoading = ref(true); // Loading state

const rows = computed(() => transactionStore.transactionItems || []);


const totalPcs = computed(() =>
  rows.value.reduce((acc, item) => acc + (item.pieces || 0), 0)
);

const totalQty = computed(() =>
  rows.value.reduce((acc, item) => acc + (item.quantity || 0), 0)
);

const totalSubtotal = computed(() => {
  const total = rows.value.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(total);
});

// Computed properties
const transactionItems = computed(() => transactionStore.transactionItems);
const subtotal = computed(() =>
  transactionItems.value.reduce((acc, item) => acc + item.subtotal, 0)
);
const totalDue = subtotal;
const deposit = computed(() => transactionStore.deposit || 0);
const outstanding = computed(() => transactionStore.outstanding || 0);


// Access selected delivery and collection contacts from the store
const deliveryContact = computed(() => transactionStore.selectedDeliveryContact || 'N/A');
const collectionContact = computed(() => transactionStore.selectedCollectionContact || 'N/A');

const collectionAddress = computed(() => transactionStore.selectedCollectionAddress || 'N/A');
const deliveryAddress = computed(() => transactionStore.selectedDeliveryAddress || 'N/A');

// Date formatting
const formattedOrderDate = computed(() =>
  new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
);

const formattedReadyBy = computed(() => {
  if (!transactionStore.readyBy) return "N/A"; // Handle missing or undefined `readyBy`

  const date = new Date(transactionStore.readyBy);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Table columns
const columns = [
  { name: "name", align: "left", label: "Item", field: "name" },
  { name: "process", align: "left", label: "Process", field: "process" },
  { name: "price", align: "right", label: "Price", field: "price" },
  { name: "pieces", align: "right", label: "Pcs", field: "pieces" },
  { name: "quantity", align: "right", label: "Quantity", field: "quantity" },
  { name: "subtotal", align: "right", label: "Subtotal", field: "subtotal" },
];

// Fetch data on mount
onMounted(async () => {
  try {
    await transactionStore.fetchTransactionItemsByOrderId(
      transactionStore.orderNo
    );
    isLoading.value = false; // Stop loading
  } catch (error) {
    console.error("Error fetching data:", error);
    isLoading.value = false; // Stop loading on error
  }
});

// Print Order
const printOrder = async () => {
  const orderElement = document.querySelector(".order-container");

  try {
    // Capture the element as a canvas
    const canvas = await html2canvas(orderElement, {
      scale: 2, // High-resolution rendering
    });

    // Convert canvas to image data
    const imgData = canvas.toDataURL("image/png");

    // Open a new window for printing
    const printWindow = window.open("", "_blank");

    // Write the image to the new window
    printWindow.document.write(`
      <html>
        <body>
          <img src="${imgData}" />
        </body>
      </html>
    `);

    // Close the document to ensure the content is ready for printing
    printWindow.document.close();

    // Open the print dialog
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close(); // Close the window after printing
    };
  } catch (error) {
    console.error("Error printing order:", error);
  }
};


// Download Order
const downloadOrder = async () => {
  const orderElement = document.querySelector(".order-container");
  try {
    const canvas = await html2canvas(orderElement);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`order-${transactionStore.orderNo || "N/A"}.pdf`);
  } catch (error) {
    console.error("Error downloading order:", error);
  }
};
</script>