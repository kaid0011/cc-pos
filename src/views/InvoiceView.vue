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
          <div class="row tag-card-header items-center">
            <q-img
              :src="ccLogo"
              spinner-color="white"
              style="height: 50px; max-width: 200px"
              class="q-mr-sm"
            />
            <div>
              <div>
                Address: 53 Ubi Ave 1 #01-29 Paya Ubi Ind. Park Singapore 408934
              </div>
              <div>Hotlines: 9029 6919 / 6747 7844</div>
            </div>
          </div>
          <div class="row line-height-1 q-mb-lg">
            <div class="col">
              <div class="row q-mt-md tag-card-header q-mr-md">
                <div>
                  <qrcode-vue
                    v-if="order?.order_no"
                    :value="order.order_no"
                    :size="70"
                    level="H"
                  />
                  <div v-else>No QR Code</div>
                </div>
                <div class="q-ml-sm q-mt-sm text-subtitle1 line-height-1">
                  <div>Order No: 
                    <span class="text-weight-bold q-ml-lg">{{ order?.order_no }}</span></div>
                  <div>
                    Invoice Date:
                    <span class="text-weight-bold">
                        {{ formatDateOnly(order?.order_invoices?.created_at) }}
                    </span>
                  </div>
                  <div>Invoice No: 
                    <span class="text-weight-bold q-ml-md">{{ order?.order_invoices?.invoice_no }}</span></div>
                </div>
              </div>
              <div class="q-mt-md">
                <div class="text-uppercase text-weight-bold">
                  Customer Information
                </div>
                <div>Company Name:</div>
                <div>Billing Address:</div>
                <div>Contact:</div>
                <div>Email:</div>
              </div>
            </div>
            <div class="col">
              <div
                class="q-mt-md"
                style="
                  border: solid;
                  border-width: 0.5px;
                  border-radius: 5px;
                  padding: 10px;
                "
              >
                <div class="text-uppercase text-weight-bold">
                  Collection Details
                </div>
                <div>
                  {{ collection?.customer_contact_persons?.name || "N/A" }}
                </div>
                <div>{{ collection?.address || "N/A" }}</div>
                <div>Collected By: {{ collection?.driver_name || "N/A" }}</div>
                <div>
                  Collected On: {{ formatDateOnly(collection?.collection_date) }},
                  {{ collection?.collection_time }}
                </div>
              </div>

              <div
                class="q-mt-sm"
                style="
                  border: solid;
                  border-width: 0.5px;
                  border-radius: 5px;
                  padding: 10px;
                "
              >
                <div class="text-uppercase text-weight-bold">
                  Delivery Details
                </div>
                <div>
                  {{ delivery?.customer_contact_persons?.name || "N/A" }}
                </div>
                <div>{{ delivery?.address || "N/A" }}</div>
                <div>Delivered By: {{ delivery?.driver_name || "N/A" }}</div>
                <div>
                  Delivered On: {{ formatDateOnly(delivery?.delivery_date) }},
                  {{ delivery?.delivery_time }}
                </div>
              </div>
            </div>
          </div>

          <!-- Transaction Table -->
          <div class="row tag-card-header line-height-1 text-uppercase">
            <div class="col col-4 text-weight-bold tag-card-cell text-center">
              Item
            </div>
            <div class="col col-2 text-weight-bold tag-card-cell text-center">
              Method
            </div>
            <div class="col col-2 text-weight-bold tag-card-cell text-center">
              Unit Price
            </div>
            <div class="col col-1 text-weight-bold tag-card-cell text-center">
              Pcs
            </div>
            <div class="col col-1 text-weight-bold tag-card-cell text-center">
              Qty
            </div>
            <div class="col col-2 text-weight-bold tag-card-cell text-center">
              Subtotal
            </div>
          </div>

          <div v-if="transactions.length > 0">
            <div
              v-for="item in transactions"
              :key="item.name"
              class="row line-height-1"
            >
              <div class="col col-4 tag-card-cell">{{ item.item_name }}</div>
              <div class="col col-2 tag-card-cell text-center">
                {{ item.process }}
              </div>
              <div class="col col-2 tag-card-cell text-center">
                {{ `$${item.price.toFixed(2)}` }} / {{ item.unit }}
              </div>
              <div class="col col-1 tag-card-cell text-center">
                {{ item.pieces }}
              </div>
              <div class="col col-1 tag-card-cell text-center">
                {{ item.quantity }}
              </div>
              <div class="col col-2 tag-card-cell text-center">
                {{ `$${(item.quantity * item.price).toFixed(2)}` }}
              </div>
            </div>
          </div>

          <div v-else class="text-center text-grey q-my-md text-subtitle1">
            No items added to the list.
          </div>
          <div class="row tag-card-footer line-height-1">
            <div class="col col-6 text-weight-bold text-uppercase"></div>
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
            <div class="col col-2 text-weight-bold text-center">
              ${{ totalPrice }}
            </div>
          </div>
          <div class="q-mt-md">
<div class="row">
                <div class="col">
              <div class="text-weight-bold text-uppercase">Payment Summary</div>
              <div>Subtotal</div>
              <div>Deposit</div>
              <div>Remaining Credit</div>
              <div>Total Due</div>
            </div>
            <div class="col">
              <div class="text-weight-bold text-uppercase">Subtotal After Discounts, Credits, and Express</div>
              <div>Outstanding</div>
              <div>Outstanding Paid</div>
              <div>Balance</div>
            </div>
</div>
<div class="text-center line-height-1 q-mt-md">
                <div>
              (Prepaid credits are available for purchase on our website)
            </div>
            <div>
              *** For cheque payment, please make cheque payable to 'Cotton Care
              Drycleaners Pte Ltd'. ***
            </div>
</div>
          </div>
          <div class="row q-my-md" style="
                  border: solid;
                  border-width: 0.5px;
                  border-radius: 5px;
                  padding: 10px;
                ">
            <q-img
              :src="payQr"
              spinner-color="white"
              style="height: 140px; max-width: 220px"
            />
            <div class="col q-pl-md">
              <div class="line-height-1 text-weight-bolder text-uppercase">
                Bank Details:
              </div>
              <div class="line-height-1">
                Account Name:<span class="text-summary"
                  >COTTON CARE DRYCLEANERS PTE LTD</span
                >
              </div>
              <div class="line-height-1">
                Bank Name:<span class="text-summary">OCBC</span>
              </div>
              <div class="line-height-1">
                Account No.:<span class="text-summary">5881-0542-9001</span>
              </div>
              <div class="line-height-1">
                Bank/Branch Code:<span class="text-summary">7339/588</span>
              </div>
              <div class="line-height-1">
                Paynow UEN No:<span class="text-summary">201205607R</span>
              </div>
              <div class="line-height-1 text-weight-bold">
                Note: For transaction ref, pls indicate your handphone no.
                +65_______________
              </div>
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
                  not be responsible for shrinkage, fading, fastness of colour,
                  defect due to manufacture, buttons or ornaments that cannot
                  withstand cleaning or pressing or water & tear due to the
                  process of cleaning.
                </div>
              </li>
              <li>
                <div class="q-ml-xs">
                  Stain removal is done at owner's risk with additional charges
                  and is NOT guaranteed.
                </div>
              </li>
              <li>
                <div class="q-ml-xs">
                  If any article is lost or damage through our negligence or in
                  the event of fire, our liability shall be limited from 5 to 10
                  times the regular service charge for each article. The total
                  claim for all articles shall be deemed not to exceed $100.00
                  per order. In the event of a claim for any damaged item/s,
                  that item/s shall be retained by the company.
                </div>
              </li>
              <li>
                <div class="q-ml-xs">
                  Customers are advised to check the articles at the time of
                  return. The company will not bear any responsibility once the
                  articles have been returned for more than 24 hours.
                </div>
              </li>
              <li>
                <div class="q-ml-xs">
                  he company shall not be liable for any loss or damage due to
                  storage of any unclaimed article more than 14 days from Return
                  Date. Any unclaimed article shall be disposed after 3 months.
                </div>
              </li>
              <li>
                <div class="q-ml-xs">
                  There is a minimum charge of $30 per laundry collection and a
                  minimum charge of $250 for curtains removal and installation.
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
                  Customers are reminded that it is an offense under the law to
                  send bedding, clothing, or any articles which have been in
                  contact with infectious disease to a public house.
                </div>
              </li>
            </ol>
          </div>
          <div class="text-weight-bold text-caption text-center">
            *** This is a computer generated invoice. No signatory is required.
            ***
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
import html2pdf from "html2pdf.js"; // Import html2pdf for PDF generation
import payQr from "@/assets/images/pay_qr.png";
import ccLogo from "@/assets/images/cc_logo.png";
import ccdcLogo from "@/assets/images/cc_dc_logo.png";

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
    const orderDetails = await transactionStore.fetchWholeOrderByOrderNo(
      orderNo
    );
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
        tx.order_transaction_items.forEach((item) =>
          transactions.value.push(item)
        );
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
    return acc + pcs * qty;
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
    const pieces = parseInt(item.pieces * item.quantity) || 0; // Use pieces instead of quantity
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
      .output("blob") // Convert to a Blob
      .then((blob) => {
        const pdfUrl = URL.createObjectURL(blob);
        const newWindow = window.open(pdfUrl, "_blank");

        if (newWindow) {
          setTimeout(() => {
            newWindow.print(); // Open print dialog
            newWindow.onafterprint = () => {
              newWindow.close(); // Close tab after printing
            };
          }, 300); // Small delay to ensure PDF loads
        } else {
          console.error("Pop-up blocked. Please allow pop-ups for this site.");
        }
      })
      .catch((err) => console.error("Error generating PDF:", err));
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
    const totalTags =
      Object.values(tagCategoryCounts.value).reduce((a, b) => a + b, 0) || 1;

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

function formatDateOnly(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

const totalPrice = computed(() => {
  return transactions.value
    .reduce((acc, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return acc + qty * price;
    }, 0)
    .toFixed(2);
});
</script>
