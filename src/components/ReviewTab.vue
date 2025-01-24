<template>
  <div class="main-container">
    <div class="review-tab">
      <!-- Order Summary Header -->
      <div class="row summary-header text-p">
        <div class="col summary-card-header justify-between text-p">
          <div class="text-h6 text-center text-weight-bold">Order Details</div>
          <q-separator class="q-my-sm" />
          <div class="text-summary-row">
            Customer Name:
            <span class="text-summary">{{
              transactionStore.selectedCustomer?.name || "N/A"
            }}</span>
          </div>
          <div class="text-summary-row">
            Contact No:
            <span class="text-summary">{{
              transactionStore.selectedCustomer?.contact_no1 || "N/A"
            }}</span>
          </div>
          <div class="text-summary-row">
            Email:
            <span class="text-summary">{{
              transactionStore.selectedCustomer?.email || "N/A"
            }}</span>
          </div>
          <div class="text-summary-row">
            Order No:
            <span class="text-summary">{{
              transactionStore?.orderNo || "N/A"
            }}</span>
          </div>
          <div class="text-summary-row">
            Ready By:
            <span class="text-summary">{{ formattedReadyByDate }}</span>
          </div>
        </div>
        <!-- Collection Details -->
        <div class="col summary-card-header">
          <div class="text-h6 text-center text-weight-bold">
            Collection Details
          </div>
          <q-separator class="q-my-sm" />
          <div class="text-summary-row">
            Contact Person:
            <span class="text-summary">{{
              collectionContact?.name || "N/A"
            }}</span>
          </div>
          <div class="text-summary-row">
            Contact No:
            <span class="text-summary">{{
              collectionContact?.contact_no1 || "N/A"
            }}</span>
          </div>
          <div class="text-summary-row">
            Address:
            <span class="text-summary">{{
              collectionAddress?.address || "N/A"
            }}</span>
          </div>
          <div class="text-summary-row">
            Date From:
            <span class="text-summary">{{ formattedCollectionDateFrom }}</span>
          </div>
          <div class="text-summary-row">
            Date To:
            <span class="text-summary">{{ formattedCollectionDateTo }}</span>
          </div>
        </div>

        <!-- Delivery Details -->
        <div class="col summary-card-header">
          <div class="text-h6 text-center text-weight-bold">
            Delivery Details
          </div>
          <q-separator class="q-my-sm" />
          <div class="text-summary-row">
            Contact Person:
            <span class="text-summary">{{
              deliveryContact?.name || "N/A"
            }}</span>
          </div>
          <div class="text-summary-row">
            Contact No:
            <span class="text-summary">{{
              deliveryContact?.contact_no1 || "N/A"
            }}</span>
          </div>
          <div class="text-summary-row">
            Address:
            <span class="text-summary">{{
              deliveryAddress?.address || "N/A"
            }}</span>
          </div>
          <div class="text-summary-row">
            Date From:
            <span class="text-summary">{{ formattedDeliveryDateFrom }}</span>
          </div>
          <div class="text-summary-row">
            Date To:
            <span class="text-summary">{{ formattedDeliveryDateTo }}</span>
          </div>
        </div>
      </div>

      <!-- Transaction Summary -->
      <div class="transaction-summary">
        <!-- Table Header -->
        <div class="row row-col-header">
          <div class="col col-4 text-weight-bold bordered">Item</div>
          <div class="col col-2 text-weight-bold bordered">Process</div>
          <div class="col col-2 text-weight-bold bordered">Price</div>
          <div class="col col-1 text-weight-bold bordered">Pcs</div>
          <div class="col col-1 text-weight-bold bordered">Qty</div>
          <div class="col col-2 text-weight-bold bordered">Subtotal</div>
        </div>

        <!-- Transactions or Fallback Message -->
        <div v-if="rows.length > 0">
          <div
            v-for="item in rows"
            :key="item.name"
            class="row row-col-row summary-row"
          >
            <div class="col col-4 bordered">{{ item.name }}</div>
            <div class="col col-2 bordered">{{ item.process }}</div>
            <div class="col col-2 bordered">{{ item.price }}</div>
            <div class="col col-1 bordered">{{ item.pieces }}</div>
            <div class="col col-1 bordered">{{ item.quantity }}</div>
            <div class="col col-2 bordered">{{ item.subtotal }}</div>
          </div>
        </div>

        <!-- No Items Message -->
        <div v-else class="text-center text-grey q-my-md">
          No items added to the list.
        </div>

        <div class="row row-col-footer">
          <div class="col col-6 text-weight-bold text-uppercase"></div>
          <div class="col col-2 text-weight-bold text-uppercase bordered">
            Total
          </div>
          <div class="col col-1 text-weight-bold bordered">{{ totalPcs }}</div>
          <div class="col col-1 text-weight-bold bordered">{{ totalQty }}</div>
          <div class="col col-2 text-weight-bold bordered">
            {{ totalSubtotal }}
          </div>
        </div>
      </div>

      <!-- Instructions and Error Reporting Summaries -->
      <div class="row">
        <!-- Instructions Summary -->
        <div class="col-6">
          <q-card flat class="summary-card q-mt-md">
            <div class="text-h6 text-center text-weight-bold">Instructions</div>
            <q-separator class="q-my-sm" />
            <!-- Display instructions or a fallback message -->
            <div v-if="instructions.length > 0">
              <div
                v-for="instruction in instructions"
                :key="instruction.id"
                class="per-instruction q-mb-sm"
              >
                <div class="text-p">
                  <span>
                    <q-icon
                      name="circle"
                      color="primary"
                      size="8px"
                      class="q-mr-sm q-ml-md"
                    />
                  </span>
                  {{ instruction.description }}
                </div>
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
                      instruction.type === "onetime" ? "One-time" : "Recurring"
                    }}
                  </q-chip>
                  <span> | </span>
                  <q-chip
                    v-for="section in instruction.to"
                    :key="section"
                    :color="getSectionColor(section)"
                    text-color="white"
                    class="instructions-to"
                  >
                    {{ formatSectionLabel(section) }}
                  </q-chip>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-grey">
              No instructions listed.
            </div>
          </q-card>
        </div>

        <!-- Error Reporting Summary -->
        <div class="col-6">
          <q-card flat class="summary-card q-mt-md">
            <div class="text-h6 text-center text-weight-bold">
              Error Reporting
            </div>
            <q-separator class="q-my-sm" />
            <!-- Display error reports or a fallback message -->
            <div v-if="reports.length > 0">
              <div
                v-for="report in reports"
                :key="report.id"
                class="per-report q-mb-sm"
              >
                <!-- Error Description -->
                <div class="text-p">
                  <span>
                    <q-icon
                      name="circle"
                      color="primary"
                      size="8px"
                      class="q-mr-sm q-ml-md"
                    />
                  </span>
                  {{ report.description }}
                </div>

                <!-- Error Category and Sub-category -->
                <div class="q-ml-lg text-weight-bold text-red">
                  {{ report.category }} - {{ report.sub_category }}
                </div>

                <!-- Error Photo Preview (if available) -->
                <q-img
                  v-if="report.image"
                  :src="report.image"
                  class="q-mt-sm q-ml-lg"
                  style="max-width: 200px; height: auto"
                />
              </div>
            </div>
            <div v-else class="text-center text-grey">
              No error reports listed.
            </div>
          </q-card>
        </div>
      </div>

<!-- Success/Failure Dialog -->
<q-dialog v-model="isDialogOpen">
  <q-card>
    <q-card-section class="text-h6 text-center">
      {{ dialogMessage }}
    </q-card-section>
    <q-card-actions align="center" class="q-pt-md">
      <q-btn
        v-if="transactionSuccess"
        label="Generate Invoice"
        color="primary"
        @click="handleGenerateInvoice"
      />
      <q-btn
        label="Close"
        color="secondary"
        @click="isDialogOpen = false"
      />
    </q-card-actions>
  </q-card>
</q-dialog>


      <q-dialog v-model="isPrintTagsDialogOpen">
        <q-card class="tag-print-container">
          <div class="tag-print-paper" id="tagPaper">
            <div class="tag-row full-width" v-for="n in 26" :key="n">
              <!-- Content of each row -->
              Row {{ n }}
            </div>
          </div>
          <q-card-actions class="row justify-between" align="right">
            <q-btn label="Close" color="accent" v-close-popup />
            <q-btn label="Print" color="primary" @click="printTagPaper" />
          </q-card-actions>
        </q-card>
      </q-dialog>      
      

      <!-- Stepper Navigation -->
      <q-stepper-navigation>
        <div class="row justify-end q-mx-md q-my-sm">
          <!-- <q-btn @click="$emit('back')" color="primary" label="Back" />
          <q-btn
            flat
            class="secondary-button text-white q-mb-md q-ml-sm"
            @click="downloadInvoice"
            label="Download PDF"
          />
          <q-btn flat color="primary" label="Reset" class="q-ml-sm" /> -->
          <q-btn
            @click="handlePrintTags"
            color="accent"
            label="Print Tags"
            class="q-mr-md"
          />
          <q-btn
            @click="handleSubmit"
            color="primary"
            label="Submit Transaction"
          />
        </div>
      </q-stepper-navigation>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const transactionStore = useTransactionStore();

// Computed properties to access data from the store
const rows = computed(() => transactionStore.transactionItems); // Transaction items for the table
const instructions = computed(() => transactionStore.instructions); // Instructions
const reports = computed(() => transactionStore.reports); // Instructions

// Access selected delivery and collection contacts from the store
const deliveryContact = computed(
  () => transactionStore.selectedDeliveryContact || "N/A"
);
const collectionContact = computed(
  () => transactionStore.selectedCollectionContact || "N/A"
);

const collectionAddress = computed(
  () => transactionStore.selectedCollectionAddress || "N/A"
);
const deliveryAddress = computed(
  () => transactionStore.selectedDeliveryAddress || "N/A"
);

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

// Dialog state and message for feedback
const isDialogOpen = ref(false);
const dialogMessage = ref("");


// Download Invoice
const downloadInvoice = async () => {
  const element = document.querySelector(".review-tab");

  try {
    // Convert inches to mm (1 inch = 25.4 mm)
    const margin = 0.2 * 25.4; // 0.2 inches in mm

    // Use html2canvas with high resolution
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true, // Cross-origin support for images
      scrollX: 0,
      scrollY: 0,
    });

    // Grayscale conversion for the full canvas (commented out)
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Commented-out grayscale conversion loop:
    // for (let i = 0; i < data.length; i += 4) {
    //   const grayscale = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11; // Grayscale formula
    //   data[i] = grayscale; // Set Red to grayscale
    //   data[i + 1] = grayscale; // Set Green to grayscale
    //   data[i + 2] = grayscale; // Set Blue to grayscale
    //   // Alpha channel (data[i + 3]) remains unchanged for transparency
    // }
    // ctx.putImageData(imageData, 0, 0); // Update the canvas with the grayscale data

    const imgData = canvas.toDataURL("image/png");

    // Get the true dimensions of the canvas
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // A4 dimensions in mm (landscape)
    const pageWidth = 297; // A4 width
    const pageHeight = 210; // A4 height
    const contentWidth = pageWidth - 2 * margin; // Account for horizontal margins
    const contentHeight = pageHeight - 2 * margin; // Account for vertical margins

    // Convert canvas dimensions to mm
    const pxToMm = contentWidth / canvasWidth; // Conversion factor
    const scaledCanvasHeight = canvasHeight * pxToMm;

    const pdf = new jsPDF("landscape", "mm", "a4");

    // If the content height fits on one page, add it directly
    if (scaledCanvasHeight <= contentHeight) {
      pdf.addImage(
        imgData,
        "PNG",
        margin,
        margin,
        contentWidth,
        scaledCanvasHeight
      );
    } else {
      // Split the content into multiple pages
      let yPosition = 0; // Current Y position on canvas
      const pageCanvasHeight =
        canvasHeight / (scaledCanvasHeight / contentHeight); // Page height in canvas pixels

      while (yPosition < canvasHeight) {
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageCanvasHeight;

        const pageContext = pageCanvas.getContext("2d");

        // Draw the current slice of the canvas onto the new page canvas
        pageContext.drawImage(
          canvas,
          0,
          yPosition,
          canvas.width,
          pageCanvasHeight,
          0,
          0,
          canvas.width,
          pageCanvasHeight
        );

        // Grayscale conversion for the page slice (commented out):
        // const pageImageData = pageContext.getImageData(
        //   0,
        //   0,
        //   pageCanvas.width,
        //   pageCanvas.height
        // );
        // const pageData = pageImageData.data;
        // for (let i = 0; i < pageData.length; i += 4) {
        //   const grayscale =
        //     pageData[i] * 0.3 + pageData[i + 1] * 0.59 + pageData[i + 2] * 0.11; // Grayscale formula
        //   pageData[i] = grayscale; // Set Red to grayscale
        //   pageData[i + 1] = grayscale; // Set Green to grayscale
        //   pageData[i + 2] = grayscale; // Set Blue to grayscale
        // }
        // pageContext.putImageData(pageImageData, 0, 0); // Update the page canvas with grayscale data

        // Convert the page canvas to image
        const pageImgData = pageCanvas.toDataURL("image/png");

        // Add the page to the PDF
        if (yPosition === 0) {
          pdf.addImage(
            pageImgData,
            "PNG",
            margin,
            margin,
            contentWidth,
            contentHeight
          );
        } else {
          pdf.addPage();
          pdf.addImage(
            pageImgData,
            "PNG",
            margin,
            margin,
            contentWidth,
            contentHeight
          );
        }

        // Move to the next slice
        yPosition += pageCanvasHeight;
      }
    }

    // Save the PDF
    pdf.save(`${transactionStore.orderNo}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};

const totalPcs = computed(() =>
  rows.value.reduce((acc, item) => acc + (item.pieces || 0), 0)
);

const totalQty = computed(() =>
  rows.value.reduce((acc, item) => acc + (item.quantity || 0), 0)
);

const totalSubtotal = computed(() => {
  const total = rows.value.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(total);
});

// Computed properties for formatted collection and delivery dates
const formattedReadyByDate = computed(() => {
  return transactionStore.readyBy
    ? new Intl.DateTimeFormat("en-US", { month: "long", day: "2-digit", year: "numeric" }).format(
        new Date(transactionStore.readyBy)
      )
    : "N/A";
});

const formattedCollectionDateFrom = computed(() => {
  return transactionStore.collectionDateFrom
    ? new Intl.DateTimeFormat("en-US", { month: "long", day: "2-digit", year: "numeric" }).format(
        new Date(transactionStore.collectionDateFrom)
      )
    : "N/A";
});

const formattedCollectionDateTo = computed(() => {
  return transactionStore.collectionDateTo
    ? new Intl.DateTimeFormat("en-US", { month: "long", day: "2-digit", year: "numeric" }).format(
        new Date(transactionStore.collectionDateTo)
      )
    : "N/A";
});

const formattedDeliveryDateFrom = computed(() => {
  return transactionStore.deliveryDateFrom
    ? new Intl.DateTimeFormat("en-US", { month: "long", day: "2-digit", year: "numeric" }).format(
        new Date(transactionStore.deliveryDateFrom)
      )
    : "N/A";
});

const formattedDeliveryDateTo = computed(() => {
  return transactionStore.deliveryDateTo
    ? new Intl.DateTimeFormat("en-US", { month: "long", day: "2-digit", year: "numeric" }).format(
        new Date(transactionStore.deliveryDateTo)
      )
    : "N/A";
});


const isPrintTagsDialogOpen = ref(false);

function handlePrintTags() {
  isPrintTagsDialogOpen.value = true;
}

function printTagPaper() {
  const tagPaper = document.getElementById("tagPaper");
  if (tagPaper) {
    const printWindow = window.open("", "_blank");
    const printContent = tagPaper.outerHTML;

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .tag-print-paper {
              width: 10cm;
              height: 27.5cm;
              border: 1px solid #ccc;
              display: flex;
              flex-direction: column;
              box-sizing: border-box;
            }
            .tag-row {
              flex: 1;
              border: 1px solid black;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
            }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
}

const transactionSuccess = ref(false); // Tracks if transaction was successful
let submittedOrderId = null; // Store the submitted order ID for invoice generation

// Handle transaction submission
async function handleSubmit() {
  try {
    const orderNo = await transactionStore.saveTransaction(); // Save transaction and get orderNo
    if (!orderNo) {
      throw new Error("Order number could not be retrieved.");
    }

    dialogMessage.value = `Transaction for Order No: ${orderNo} submitted successfully!`;
    transactionStore.orderNo = orderNo; // Save the orderNo in the store
    transactionSuccess.value = true;
    isDialogOpen.value = true;
  } catch (error) {
    dialogMessage.value = `Error submitting transaction: ${error.message}`;
    transactionSuccess.value = false;
    isDialogOpen.value = true;
    console.error("Error submitting transaction:", error.message);
  }
}

async function handleGenerateInvoice() {
  try {
    const orderNo = transactionStore.orderNo; // Retrieve the orderNo from the store
    if (!orderNo) {
      throw new Error("Order number is missing. Please submit the transaction first.");
    }

    const result = await transactionStore.generateInvoice(orderNo);
    if (result) {
      dialogMessage.value = `Invoice generated successfully for Order No: ${orderNo}!`;
      transactionSuccess.value = true;

      // Open the payment page in a new tab
      window.open(`/payment/${orderNo}`, "_blank");
    } else {
      dialogMessage.value = "Failed to generate invoice.";
      transactionSuccess.value = false;
    }
  } catch (error) {
    console.error("Error generating invoice:", error.message);
    dialogMessage.value = `Error: ${error.message}`;
    transactionSuccess.value = false;
  }
}


</script>
