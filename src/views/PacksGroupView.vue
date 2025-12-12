<template>
  <div class="tags-view-container">
    <div class="row justify-center q-col-gutter-md q-pa-md">
      <div class="col-auto">
        <q-btn color="primary" @click="downloadPackPDF">
          Download Packing List PDF
        </q-btn>
      </div>
      <div class="col-auto">
        <q-btn color="primary" @click="PrintPackPDF">
          Print Packing List PDF
        </q-btn>
      </div>

      <div class="col-auto">
        <q-btn color="secondary" @click="PrintPacketLabel">
          Print Packet Label
        </q-btn>
      </div>
    </div>
    <div
      v-for="logistics in matchedOrders"
      :key="logistics.order?.order_no"
      class="row justify-center q-mb-lg"
    >
      <q-card class="tag-card-container">
        <q-card flat class="tag-card" ref="printableCard">
          <!-- <div class="text-h6 text-weight-bold">
            Packing List for:
            {{ logistics.collection?.driver_name || "N/A" }} on
            {{ logistics.delivery?.delivery_date || "N/A" }}
          </div> -->
          <div>
            <q-separator size="3px" />
            <div class="row line-height-1">
              <div class="col-4 bordered">
                <div class="text-weight-bold text-subtitle1 line-height-1">
                  {{ logistics.order?.order_no }}
                </div>
                <div>
                  {{ logistics.customer?.name || "N/A" }}
                </div>
                <div>
                  {{ logistics.customer?.contact_no1 || "N/A" }}
                  <span v-if="logistics.customer?.contact_no2">
                    - {{ logistics.customer?.contact_no2 }}</span
                  >
                </div>
                <div>
                  No. of Items:
                  <span class="text-weight-bold">{{ logistics.totalPcs }}</span>
                </div>
                <div>
                  Total Amount:
                  <span class="text-weight-bold"
                    >${{
                      (
                        logistics.order?.order_payment?.total_amount || 0
                      ).toFixed(2)
                    }}</span
                  >
                </div>
                <div>
                  Balance:
                  <span class="text-weight-bold"
                    >${{
                      (
                        logistics.order?.order_payment?.total_amount -
                          logistics.order?.order_payment?.paid_amount || 0
                      ).toFixed(2)
                    }}</span
                  >
                </div>
              </div>
              <div class="col bordered">
                <div>
                  Ready By:
                  <span class="text-weight-bold">{{
                    logistics.order?.order_production?.ready_by
                  }}</span>
                </div>
                <div>
                  Delivery Date:
                  <span class="text-weight-bold">{{
                    logistics.delivery?.delivery_date || "N/A"
                  }}</span>
                </div>
                <div>
                  Logistics Status:
                  <span class="text-weight-bold">{{
                    logistics.logistics_status
                  }}</span>
                </div>
                <div>
                  Payment Status:
                  <span class="text-weight-bold">{{
                    logistics.order?.order_payment?.payment_status
                  }}</span>
                </div>
                <div>
                  Goods Status:
                  <span class="text-weight-bold">{{
                    logistics.order?.order_production?.goods_status
                  }}</span>
                </div>
                <div>Notes:</div>
              </div>
              <div class="col-2 bordered">
                <div>
                  Hang:
                  <span class="text-weight-bold"
                    >{{
                      logistics.order?.order_production?.no_hangers || 0
                    }}h</span
                  >
                </div>
                <div>
                  Pack:
                  <span class="text-weight-bold"
                    >{{
                      logistics.order?.order_production?.no_packets || 0
                    }}p</span
                  >
                </div>
                <div>
                  Roll:
                  <span class="text-weight-bold"
                    >{{
                      logistics.order?.order_production?.no_rolls || 0
                    }}r</span
                  >
                </div>
                <!-- <div>Return: <span class="text-weight-bold">{{ logistics.order?.order_production?.no_returns }}</span></div> -->
              </div>
            </div>
            <div class="dashed-separator" />
            <div class="row text-center text-weight-bold q-mt-xs">
              <div class="col">Clothing</div>
              <div class="col">Bedding</div>
              <div class="col">Curtain</div>
              <div class="col">Sofa</div>
              <div class="col">Stuffed Toy</div>
              <div class="col">Carpet</div>
              <div class="col">Others</div>
            </div>

            <div class="row text-center q-col-gutter-x-sm q-mb-sm">
              <div class="col">
                <div class="pack-borders">
                  {{ logistics.tagCategoryCounts.clothing || 0 }}
                </div>
              </div>
              <div class="col">
                <div class="pack-borders">
                  {{ logistics.tagCategoryCounts.bedding || 0 }}
                </div>
              </div>
              <div class="col">
                <div class="pack-borders">
                  {{ logistics.tagCategoryCounts.curtain || 0 }}
                </div>
              </div>
              <div class="col">
                <div class="pack-borders">
                  {{ logistics.tagCategoryCounts.sofa || 0 }}
                </div>
              </div>
              <div class="col">
                <div class="pack-borders">
                  {{ logistics.tagCategoryCounts.stuffed_toy || 0 }}
                </div>
              </div>
              <div class="col">
                <div class="pack-borders">
                  {{ logistics.tagCategoryCounts.carpet || 0 }}
                </div>
              </div>
              <div class="col">
                <div class="pack-borders">
                  {{ logistics.tagCategoryCounts.others || 0 }}
                </div>
              </div>
            </div>
            <!-- <q-separator size="3px"/> -->
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
import ccdcLogo from "@/assets/images/dc_logo.png";
import ccPackImg from "@/assets/images/cc_pack.jpg";
import payQrPackImg from "@/assets/images/payQr_pack.jpg";

const transactionStore = useTransactionStore();
const route = useRoute();
const matchedOrders = ref([]);

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
  const orderNos = (route.query.orders || "").split(",").filter(Boolean);
  if (!orderNos.length) return;

  const fullDetails = await Promise.all(
    orderNos.map((orderNo) =>
      transactionStore.fetchWholeOrderByOrderNo(orderNo)
    )
  );

  matchedOrders.value = fullDetails.map((orderDetails) => {
    const transactions = [];
    (orderDetails.transactions || []).forEach((tx) => {
      (tx.order_transaction_items || []).forEach((item) =>
        transactions.push(item)
      );
    });

    const tagCategoryCounts = transactions.reduce((counts, item) => {
      const category = item.tag_category?.toLowerCase() || "others";
      const pieces = parseInt(item.pieces) || 0;
      counts[category] = (counts[category] || 0) + pieces;
      return counts;
    }, {});

    const totalQty = transactions.reduce(
      (acc, item) => acc + (parseFloat(item.quantity) || 0),
      0
    );
    const totalPcs = transactions.reduce(
      (acc, item) => acc + (parseFloat(item.pieces) || 1),
      0
    );
    const totalPrice = transactions
      .reduce(
        (acc, item) =>
          acc +
          (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0),
        0
      )
      .toFixed(2);

    return {
      ...orderDetails,
      transactions,
      totalQty,
      totalPcs,
      totalPrice,
      tagCategoryCounts,
    };
  });
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

const downloadPackPDF = () => {
  Promise.all([preloadImage(payQr), preloadImage(ccLogo)])
    .then(() => {
      const cards = document.querySelectorAll(".tag-card");
      if (!cards.length) return;

      const container = document.createElement("div");

      cards.forEach((card, index) => {
        const clone = card.cloneNode(true);
        const logistics = matchedOrders.value[index];

        // Create a container div that includes the header if it's the first item on a page
        const pageWrapper = document.createElement("div");
        pageWrapper.style.marginBottom = "12px";

        // Insert header every ~700px of content (adjust for A4)
        const approxItemsPerPage = 4; // estimate ~4 cards per page
        const needsHeader = index % approxItemsPerPage === 0;

        if (needsHeader) {
          const header = document.createElement("div");
          header.className = "packing-header";
          header.innerHTML = `Packing List for: ${
            logistics.collection?.driver_name || "N/A"
          } on ${logistics.delivery?.delivery_date || "N/A"}`;
          header.style.fontSize = "20px";
          header.style.fontWeight = "bold";
          header.style.marginBottom = "5px";
          header.style.breakBefore = index === 0 ? "auto" : "always";
          pageWrapper.appendChild(header);
        }

        pageWrapper.appendChild(clone);
        container.appendChild(pageWrapper);
      });

      const options = {
        margin: [13, 13, 13, 15],
        filename: `PackingList_Grp.pdf`,
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
      };

      setTimeout(() => {
        html2pdf()
          .set(options)
          .from(container)
          .save()
          .catch((err) => console.error("Error generating PDF:", err));
      }, 500);
    })
    .catch((err) => {
      console.error("Preload failed:", err);
    });
};

const PrintPackPDF = () => {
  const cards = document.querySelectorAll(".tag-card");
  if (!cards.length) {
    console.error("Printable tag-card not found");
    return;
  }

  const container = document.createElement("div");

  cards.forEach((card, index) => {
    const clone = card.cloneNode(true);
    const logistics = matchedOrders.value[index];

    // Create a container div that includes the header if it's the first item on a page
    const pageWrapper = document.createElement("div");
    pageWrapper.style.marginBottom = "12px";

    // Insert header every ~700px of content (adjust for A4)
    const approxItemsPerPage = 4; // estimate ~4 cards per page
    const needsHeader = index % approxItemsPerPage === 0;

    if (needsHeader) {
      const header = document.createElement("div");
      header.className = "packing-header";
      header.innerHTML = `Packing List for: ${
        logistics.collection?.driver_name || "N/A"
      } on ${logistics.delivery?.delivery_date || "N/A"}`;
      header.style.fontSize = "20px";
      header.style.fontWeight = "bold";
      header.style.marginBottom = "5px";
      header.style.breakBefore = index === 0 ? "auto" : "always";
      pageWrapper.appendChild(header);
    }

    pageWrapper.appendChild(clone);
    container.appendChild(pageWrapper);
  });

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
  };

  setTimeout(() => {
    html2pdf()
      .set(options)
      .from(container)
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
      .catch((err) => console.error("Error generating PDF for printing:", err));
  }, 500);
};

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

function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(src);
    img.onerror = reject;
  });
}

const PrintPacketLabel = () => {
  Promise.all([preloadImage(ccPackImg), preloadImage(payQrPackImg)])
    .then(([ccImgUrl, qrImgUrl]) => {
      const container = document.createElement("div");

      matchedOrders.value.forEach((logistics, index) => {
        const wrapper = document.createElement("div");
        wrapper.style.fontFamily = "Arial, sans-serif";
        wrapper.style.fontSize = "12pt";
        wrapper.style.margin = "0 auto 12px";
        wrapper.style.breakBefore = index === 0 ? "auto" : "always";
        wrapper.style.width = "100%";

        const orderNo = logistics.order?.order_no || "N/A";
        const customerName = logistics.customer?.name || "N/A";
        const deliveryAddress = logistics.delivery?.address || "N/A";
        const hang = logistics.order?.order_production?.no_hangers || 0;
        const pack = logistics.order?.order_production?.no_packets || 0;
        const roll = logistics.order?.order_production?.no_rolls || 0;

        wrapper.innerHTML = `
          <div class="row plain-border q-pa-xs">
            <div class="col-auto plain-border q-pt-xs">
              <img src="${ccImgUrl}" alt="cc_pack" width="120" height="120" />
            </div>
            <div class="col q-ml-xs plain-border q-pa-md">
              <div class="text-h6">
                <span v-if="hang != 0">${hang}h</span> 
                <span v-if="pack != 0>${pack}p</span>
                <span v-if="roll != 0>${roll}r</span> 
              </div>
              <div class="text-h4 text-weight-bold">
                ${orderNo}
              </div> 
            </div>
          </div>

          <div class="row plain-border q-pa-xs">
            <div class="col-auto plain-border q-pt-xs">
                <img src="${qrImgUrl}" alt="pay_qr_pack" width="120" height="120" />
            </div>
            <div class="col q-ml-xs plain-border q-pa-md text-subtitle2">
                <div> ${customerName}</div>
                <div> ${deliveryAddress}</div>
            </div>
          </div>
        `;

        container.appendChild(wrapper);
      });

      const options = {
        margin: [10, 10, 10, 10],
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
          format: [148, 105], // A6 landscape
          orientation: "landscape",
        },
      };

      setTimeout(() => {
        html2pdf()
          .set(options)
          .from(container)
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
              console.error(
                "Pop-up blocked. Please allow pop-ups for this site."
              );
            }
          });
      }, 300);
    })
    .catch((err) => console.error("Image preload failed:", err));
};
</script>
