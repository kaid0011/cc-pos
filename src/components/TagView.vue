<template>
  <div class="view-tag">
    <div class="slip-container">
<!-- Loading Spinner -->
<div v-if="isLoading" class="q-pa-md text-center">
  <q-spinner color="primary" size="40px" />
  <div class="text-caption q-mt-md">Loading Tag Slip...</div>
</div>

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
  <q-card class="tag-container" ref="tagContainer">
<div>This is for sample only.</div>
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

const deliveryContact = computed(
  () => transactionStore.selectedDeliveryContact || {}
);
const collectionContact = computed(
  () => transactionStore.selectedCollectionContact || {}
);

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
  const orderElement = document.querySelector(".tag-container");

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
  const orderElement = document.querySelector(".tag-container");
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