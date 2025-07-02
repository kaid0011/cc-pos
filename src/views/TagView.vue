<template>
  <div class="tags-view-container">
    <div class="row justify-center q-col-gutter-md q-pa-md">
      <div class="col-auto">
        <q-btn color="primary" @click="downloadTagPDF">
          Download Tag Slip PDF
        </q-btn>
      </div>
      <div class="col-auto">
        <q-btn color="primary" @click="PrintTagPDF"> Print Tag Slip PDF </q-btn>
      </div>
      <div class="col-auto">
        <q-btn color="primary" @click="PrintTag"> Print Tags </q-btn>
      </div>
    </div>
    <div class="row justify-center q-mb-lg">
      <q-card class="tag-card-container">
        <q-card flat class="tag-card" ref="printableCard">
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
            <div class="col text-h6 q-ma-md">
              <div class="">
                Order No:
                <span class="text-summary text-h5">{{
                  order?.order_no || "N/A"
                }}</span>
              </div>
              <div class="">
                Order Date:
                <span class="text-summary text-h5">{{
                  formattedOrderDate
                }}</span>
              </div>
            </div>
            <div class="col-auto text-h6 q-pa-md">
              <div
                class="text-uppercase bg-grey-3 text-weight-bolder order-box"
              >
                <div class="q-px-sm">Tag Slip</div>
              </div>
            </div>
          </div>

          <div class="row justify-between q-pa-md">
            <div class="col text-subtitle1">
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
                <span class="text-summary">{{ readyByFormatted }}</span>
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
              <q-card
                flat
                style="border: solid; border-width: 1px; border-radius: 0"
              >
                <q-card flat class="tags">
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
              </q-card>
            </div>
          </div>
          <!-- Transaction Table -->
          <div class="row tag-card-header text-subtitle1">
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

          <div v-if="transactions.length > 0" class="text-subtitle1">
            <div v-for="item in transactions" :key="item.name" class="row">
              <div class="col col-3 tag-card-cell">{{ item.item_name }}</div>
              <div class="col col-2 tag-card-cell text-center">
                {{ item.process }}
              </div>
              <div class="col col-2 tag-card-cell text-center">
                {{ `$${item.price.toFixed(2)}` }}
              </div>
              <div class="col col-1 tag-card-cell text-center">
                {{ item.pieces * item.quantity }}
              </div>
              <div class="col col-1 tag-card-cell text-center">
                {{ item.quantity }}
              </div>
              <div class="col col-3 tag-card-cell"></div>
            </div>
          </div>

          <div v-else class="text-center text-grey q-my-md text-subtitle1">
            No items added to the list.
          </div>
          <div class="row tag-card-footer q-py-sm text-subtitle1">
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
          <div class="q-mt-md text-subtitle1 text-weight-bold">
            Other Remarks:
          </div>
          <div>
            <div class="bottom-border"></div>
            <div class="bottom-border"></div>
            <div class="bottom-border"></div>
          </div>
          <div class="row text-center q-mb-xs text-weight-bold">
            <div class="col">A. Clothing</div>
            <div class="col">B. Bedding</div>
            <div class="col">C. Curtain</div>
            <div class="col">D. Sofa</div>
            <div class="col">E. Stuffed Toy</div>
            <div class="col">F. Carpet</div>
            <div class="col">G. Others</div>
          </div>
          <div class="row text-center q-col-gutter-x-sm text-subtitle1">
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
      </q-card>
    </div>
    <div class="row justify-center">
      <!-- <q-card class="tags" style="width: 100mm; height: 0.5in">
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
      </q-card> -->
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { useRoute } from "vue-router";
import QrcodeVue from "qrcode.vue";
import html2pdf from "html2pdf.js"; // Import html2pdf for PDF generation

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

onMounted(async () => {
  try {
    // Get order_no from route params
    const orderNo = route.params.order_no;

    // Fetch the order details
    const orderDetails = await transactionStore.fetchWholeOrderByOrderNo(orderNo);
    console.log("Order Details:", orderDetails);

    // Assign fetched data directly
    logistics.value = orderDetails || {};
    order.value = orderDetails.order || {};
    customer.value = orderDetails.customer || {};
    collection.value = orderDetails.collection?.[0] || {};
    delivery.value = orderDetails.delivery?.[0] || {};

        transactions.value = [];
    (orderDetails.transactions || []).forEach((tx) => {
      if (Array.isArray(tx.order_transaction_items)) {
        tx.order_transaction_items.forEach((item) => transactions.value.push(item));
      }
    });

    reports.value = orderDetails.error_reports || [];

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
    const pcs = parseFloat(item.pieces) || 1; // Ensure a numeric value
    const qty = parseFloat(item.quantity) || 1; // Ensure a numeric value
    return acc + (pcs*qty);
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
  order.value?.created_at
    ? new Date(order.value.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A"
);

const readyByFormatted = computed(() => {
  const date = order.value?.order_production?.ready_by
    ? new Date(order.value.order_production.ready_by)
    : null;
  return date
    ? date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "N/A";
});



const tagCategoryCounts = computed(() => {
  return transactions.value.reduce((counts, item) => {
    const category = item.tag_category?.toLowerCase() || "others";
    const pieces = parseInt(item.pieces*item.quantity) || 0; // Use pieces instead of quantity
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

const downloadTagPDF = () => {
  if (!printableCard.value) {
    console.error("Printable tag-card not found");
    return;
  }

  setTimeout(() => {
    const element = printableCard.value.$el || printableCard.value;

    const options = {
      margin: [13, 13, 13, 13], // 0.5-inch margins
      filename: `Tag_Slip_${order.value?.order_no || "N/A"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: null,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { avoid: [".tag-card"] }, // Prevents breaking important elements
    };

    html2pdf()
      .set(options)
      .from(element)
      .toPdf()
      .save() // Directly triggers download
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
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
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
    // Get the total number of tags to print
    const totalTags = Object.values(tagCategoryCounts.value).reduce((a, b) => a + b, 0) || 1;

    // Create a container to hold multiple cloned tags
    const clonedContainer = document.createElement("div");
    clonedContainer.style.display = "flex";
    clonedContainer.style.flexWrap = "wrap";
    clonedContainer.style.gap = "0px"; // Ensures no space between elements

    for (let i = 0; i < totalTags; i++) {
      const clonedTag = tagElement.cloneNode(true);
      clonedTag.style.pageBreakBefore = "always"; // Ensures each tag starts on a new page
      clonedContainer.appendChild(clonedTag);
    }

    const options = {
      margin: 0, // Remove all margins
      filename: `Tags_Print_${order.value?.order_no || "N/A"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: null,
      },
      jsPDF: {
        unit: "mm",
        format: [100, 12.7], // 100mm × 12.7mm per page
        orientation: "landscape",
      },
      pagebreak: { mode: ["avoid-all", "css"] }, // Fixes extra blank pages
    };

    // Generate the PDF
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


</script>
