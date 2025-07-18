<template>
  <div class="tags-view-container">
    <div class="row justify-center q-col-gutter-md q-pa-md">
      <div class="col-auto">
        <q-btn color="primary" @click="downloadTagPDF"
          >Download Tag Slip PDF</q-btn
        >
      </div>
      <div class="col-auto">
        <q-btn color="primary" @click="PrintTagPDF">Print Tag Slip PDF</q-btn>
      </div>
      <div class="col-auto">
        <q-btn color="primary" @click="PrintTag">Print Tags</q-btn>
      </div>
    </div>

    <div
      v-for="logistics in matchedOrders"
      :key="logistics.order?.order_no"
      class="row justify-center q-pb-lg"
    >
      <q-card class="tag-card-container">
        <q-card flat class="tag-card" ref="printableCard">
          <div class="row tag-card-header justify-between items-center">
            <div class="col-auto">
              <qrcode-vue
                v-if="logistics.order?.order_no"
                :value="logistics.order.order_no"
                :size="70"
                level="H"
                class="q-mt-sm q-ml-sm"
              />
              <div v-else>No QR Code</div>
            </div>
            <div class="col text-h6 q-ma-md">
              <div>
                Order No:
                <span class="text-summary text-h5">{{
                  logistics.order?.order_no || "N/A"
                }}</span>
              </div>
              <div>
                Order Date:
                <span class="text-summary text-h5">{{
                  new Date(logistics.order?.created_at).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )
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
              <div>
                Customer Name:
                <span class="text-summary">{{
                  logistics.customer?.name || "N/A"
                }}</span>
              </div>
              <div>
                Contact Nos:
                <span class="text-summary"
                  >{{ logistics.customer?.contact_no1 || "N/A"
                  }}<span v-if="logistics.customer?.contact_no2">
                    / {{ logistics.customer.contact_no2 }}</span
                  ></span
                >
              </div>
              <div>Ready By: <span class="text-summary">N/A</span></div>
              <div>No. of Bags: <span class="text-summary">N/A</span></div>
              <div>Notes: <span class="text-summary">N/A</span></div>
            </div>
            <div class="col-auto">
              <q-card flat class="tags row justify-between text-center">
                                <div class="col-auto">
                  <div class="tag-urgency">U</div>
                </div>
                <div class="col-auto">
                  <div class="row">
                    <div class="col-auto tag-count">
                      <div class="text-weight-bold">
                        {{ logistics.tagCategoryCounts.clothing || 0 }}
                      </div>
                      <div>A</div>
                    </div>
                    <div class="col-auto tag-count">
                      <div class="text-weight-bold">
                        {{ logistics.tagCategoryCounts.bedding || 0 }}
                      </div>
                      <div>B</div>
                    </div>
                    <div class="col-auto tag-count">
                      <div class="text-weight-bold">
                        {{ logistics.tagCategoryCounts.curtain || 0 }}
                      </div>
                      <div>C</div>
                    </div>
                    <div class="col-auto tag-count">
                      <div class="text-weight-bold">
                        {{ logistics.tagCategoryCounts.sofa || 0 }}
                      </div>
                      <div>D</div>
                    </div>
                    <div class="col-auto tag-count">
                      <div class="text-weight-bold">
                        {{ logistics.tagCategoryCounts.stuffed_toy || 0 }}
                      </div>
                      <div>E</div>
                    </div>
                    <div class="col-auto tag-count">
                      <div class="text-weight-bold">
                        {{ logistics.tagCategoryCounts.carpet || 0 }}
                      </div>
                      <div>F</div>
                    </div>
                    <div class="col-auto tag-count">
                      <div class="text-weight-bold">
                        {{ logistics.tagCategoryCounts.others || 0 }}
                      </div>
                      <div>G</div>
                    </div>
                  </div>
                </div>
                <div class="col-auto tag-details text-weight-bold">
                    {{ logistics.formattedTagDetails }}
                  </div>
                <div class="col-auto">
                  <div class="tag-pcs">
                    {{ logistics.totalPcs }}
                  </div>
                </div>
              </q-card>
            </div>
          </div>

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

          <div
            v-if="logistics.order_transactions?.length > 0"
            class="text-subtitle1"
          >
            <div
              v-for="item in logistics.order_transactions"
              :key="item.item_name"
              class="row"
            >
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
              {{ logistics.totalPcs }}
            </div>
            <div class="col col-1 text-weight-bold text-center">
              {{ logistics.totalQty }}
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
                {{ logistics.tagCategoryCounts.clothing || 0 }}
              </div>
            </div>
            <div class="col">
              <div class="tag-borders">
                {{ logistics.tagCategoryCounts.bedding || 0 }}
              </div>
            </div>
            <div class="col">
              <div class="tag-borders">
                {{ logistics.tagCategoryCounts.curtain || 0 }}
              </div>
            </div>
            <div class="col">
              <div class="tag-borders">
                {{ logistics.tagCategoryCounts.sofa || 0 }}
              </div>
            </div>
            <div class="col">
              <div class="tag-borders">
                {{ logistics.tagCategoryCounts.stuffed_toy || 0 }}
              </div>
            </div>
            <div class="col">
              <div class="tag-borders">
                {{ logistics.tagCategoryCounts.carpet || 0 }}
              </div>
            </div>
            <div class="col">
              <div class="tag-borders">
                {{ logistics.tagCategoryCounts.others || 0 }}
              </div>
            </div>
          </div>
        </q-card>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useTransactionStore } from "@/stores/transactionStore";
import QrcodeVue from "qrcode.vue";
import html2pdf from "html2pdf.js";

const route = useRoute();
const transactionStore = useTransactionStore();

const matchedOrders = ref([]);
const driver = ref("");
const date = ref("");
const printableCard = ref(null);

const DRIVER_NAMES = {
  Ass: "Ass",
  Ken: "Ken",
  Ang: "Ang",
  Pea: "Pea",
  You: "You",
  Sfc: "Self-collect",
  Nsc: "Ng Soo Chong",
  Cha: "Chia",
  Des: "Des",
  Cue: "Cue",
  Are: "Are",
  Tin: "Ting",
};

const parseSlug = () => {
  const slug = route.params.groupSlug || "";
  const parts = slug.split("-");
  const parsedDate = parts.slice(-3).join("-");
  const code = parts.slice(0, -3).join("-");
  const parsedDriver = DRIVER_NAMES[code] || code;
  return { driver: parsedDriver, date: parsedDate };
};

onMounted(async () => {
  try {
    const { driver: parsedDriver, date: parsedDate } = parseSlug();
    driver.value = parsedDriver;
    date.value = parsedDate;

    const orderNosQuery = (route.query.orders || "").split(",").filter(Boolean);
    if (!orderNosQuery.length) {
      console.warn("No order numbers provided via query.");
      matchedOrders.value = [];
      return;
    }

    const fullDetails = await Promise.all(
      orderNosQuery.map((orderNo) =>
        transactionStore.fetchWholeOrderByOrderNo(orderNo)
      )
    );

    matchedOrders.value = fullDetails.map((orderDetails) => {
      const transactions = [];
      (orderDetails.transactions || []).forEach((tx) => {
        if (Array.isArray(tx.order_transaction_items)) {
          tx.order_transaction_items.forEach((item) => transactions.push(item));
        }
      });

      const tagCategoryCounts = transactions.reduce((counts, item) => {
        const category = item.tag_category?.toLowerCase() || "others";
        const pieces = parseInt(item.pieces) || 0;
        counts[category] = (counts[category] || 0) + pieces;
        return counts;
      }, {});

      const totalPcs = transactions.reduce((acc, item) => {
        const pcs = parseFloat(item.pieces) || 1;
        return acc + pcs;
      }, 0);

      const totalQty = transactions.reduce((acc, item) => {
        const qty = parseFloat(item.quantity) || 0;
        return acc + qty;
      }, 0);

      const formattedTagDetails = (() => {
        const collectionDate = formatDate(
          orderDetails.collection?.collection_date
        );
        const deliveryDate = formatDate(
          orderDetails.delivery?.delivery_date
        );
        const orderNoLast5 = orderDetails.order?.order_no?.slice(-5) || "N/A";
        return `${collectionDate} - ${orderNoLast5} - ${deliveryDate}`;
      })();

      return {
        ...orderDetails,
        order: orderDetails.order || {},
        customer: orderDetails.customer || {},
        collection: orderDetails.collection?.[0] || {},
        delivery: orderDetails.delivery?.[0] || {},
        order_transactions: transactions,
        tagCategoryCounts,
        totalPcs,
        totalQty,
        formattedTagDetails,
      };
    });
  } catch (error) {
    console.error("Error loading group orders:", error);
  }
});

const formatDate = (date) => {
  if (!date) return "N/A";
  const parsed = new Date(date);
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
  const w = weekdays[parsed.getDay()];
  const d = parsed.getDate().toString().padStart(2, "0");
  const m = (parsed.getMonth() + 1).toString().padStart(2, "0");
  return `${w}${m}${d}`;
};

const downloadTagPDF = () => {
  const cards = document.querySelectorAll(".tag-card");
  if (!cards.length) {
    console.error("Printable tag-card not found");
    return;
  }

  const container = document.createElement("div");

  cards.forEach((card) => {
    const clone = card.cloneNode(true);

    // Handle QR canvas replacement
    const originalCanvases = card.querySelectorAll("canvas");
    const clonedQRContainers = clone.querySelectorAll("canvas");

    originalCanvases.forEach((canvas, index) => {
      const img = document.createElement("img");
      img.src = canvas.toDataURL("image/png");
      const desiredSize = 100; // Adjust this value to scale
      img.style.width = `70px`;
      img.style.height = `70px`;
      img.style.marginLeft = "10px";
      img.style.marginTop = "5px";
      img.width = desiredSize;
      img.height = desiredSize;

      const clonedCanvas = clonedQRContainers[index];
      if (clonedCanvas && clonedCanvas.parentNode) {
        clonedCanvas.parentNode.replaceChild(img, clonedCanvas);
      }
    });

    container.appendChild(clone);
  });

  const options = {
    margin: [13, 13, 13, 13],
    filename: `Tag_Slip_Group.pdf`,
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

  setTimeout(() => {
    html2pdf()
      .set(options)
      .from(container)
      .toPdf()
      .save()
      .catch((err) => console.error("Error generating PDF:", err));
  }, 500);
};

const PrintTagPDF = () => {
  const cards = document.querySelectorAll(".tag-card");
  if (!cards.length) {
    console.error("Printable tag-card not found");
    return;
  }

  const container = document.createElement("div");

  cards.forEach((card) => {
    const clone = card.cloneNode(true);

    // Replace QR canvas with <img>
    const originalCanvases = card.querySelectorAll("canvas");
    const clonedQRContainers = clone.querySelectorAll("canvas");

    originalCanvases.forEach((canvas, index) => {
      const img = document.createElement("img");
      img.src = canvas.toDataURL("image/png");

      const desiredSize = 100;
      img.style.width = `70px`;
      img.style.height = `70px`;
      img.style.marginLeft = "10px";
      img.style.marginTop = "5px";
      img.width = desiredSize;
      img.height = desiredSize;

      const clonedCanvas = clonedQRContainers[index];
      if (clonedCanvas && clonedCanvas.parentNode) {
        clonedCanvas.parentNode.replaceChild(img, clonedCanvas);
      }
    });

    container.appendChild(clone);
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
    pagebreak: { avoid: [".tag-card"] },
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

const PrintTag = () => {
  const tags = document.querySelectorAll(".tags");
  if (!tags.length) {
    console.error("No .tags element found");
    return;
  }

  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexWrap = "wrap";
  container.style.gap = "0px";

  tags.forEach((tag) => {
    const tagCounts = tag.querySelectorAll(".tag-count");

    tagCounts.forEach((tagCount) => {
      const countEl = tagCount.querySelector(".text-weight-bold");
      const count = parseInt(countEl?.textContent?.trim() || "0");
      if (!count || isNaN(count)) return;

      for (let i = 0; i < count; i++) {
        const clone = tag.cloneNode(true);
        clone.style.pageBreakBefore = "always";

        // Replace QR canvas with image if needed
        const canvases = clone.querySelectorAll("canvas");
        canvases.forEach((canvas) => {
          const img = document.createElement("img");
          img.src = canvas.toDataURL("image/png");
          img.style.width = `70px`;
          img.style.height = `70px`;
          canvas.parentNode?.replaceChild(img, canvas);
        });

        container.appendChild(clone);
      }
    });
  });

  const options = {
    margin: 0,
    filename: `Tags_Print_Group.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: null },
    jsPDF: { unit: "mm", format: [100, 12.7], orientation: "landscape" },
    pagebreak: { mode: ["avoid-all", "css"] },
  };

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
      }
    })
    .catch(console.error);
};

</script>

<style scoped>
.tags-view-container {
  padding: 16px;
}
</style>
