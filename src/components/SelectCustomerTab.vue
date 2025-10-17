<template>
  <div>
    <div class="text-uppercase text-weight-bold text-center q-mb-sm">
      Select a customer
    </div>

    <!-- Search Input -->
    <q-input
      v-model="searchTerm"
      placeholder="Search customer name, contact no, or email..."
      square
      dense
      outlined
      class="search-input q-mb-md"
    >
      <template #prepend>
        <q-icon name="search" />
      </template>
      <template #append>
        <q-icon name="close" @click="searchTerm = ''" class="cursor-pointer" />
      </template>
    </q-input>

    <!-- Add Customer Button -->
    <q-btn
      outline
      color="primary"
      label="Click Here to Add a Customer"
      @click="showAddCustomerDialog = true"
      class="full-width outline-btn q-mt-md q-mb-sm"
    />

    <!-- Customer List -->
    <div class="customer-list">
      <div class="row customer-header">
        <div class="col-4">Customer Name</div>
        <div class="col-4">Contact Details</div>
        <div class="col-4">Pendings</div>
      </div>

      <div
        v-if="filteredCustomers.length === 0"
        class="text-center text-grey q-my-md"
      >
        No existing customers.
      </div>

      <div
        v-else
        v-for="customer in filteredCustomers"
        :key="customer.id"
        class="row customer-row"
        @click="selectCustomer(customer)"
      >
        <div class="col-4">{{ customer.name }}</div>

        <div class="col-4">
          <!-- Contact No 1 -->
          <div v-if="customer.contact_no1">
            <span class="phone-link" @click.stop>
              {{ customer.contact_no1 }}
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-list style="min-width: 220px">
                  <q-item
                    clickable
                    v-ripple
                    @click="callViaPhone(customer.contact_no1)"
                  >
                    <q-item-section avatar>
                      <q-icon name="call" />
                    </q-item-section>
                    <q-item-section>Call via phone</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-ripple
                    @click="callViaWhatsApp(customer.contact_no1)"
                  >
                    <q-item-section avatar>
                      <q-icon name="chat" />
                    </q-item-section>
                    <q-item-section>Call via WhatsApp</q-item-section>
                  </q-item>
                </q-list>
              </q-popup-proxy>
            </span>
          </div>
          <div v-else>-</div>

          <!-- Contact No 2 -->
          <div v-if="customer.contact_no2">
            <span class="phone-link" @click.stop>
              {{ customer.contact_no2 }}
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-list style="min-width: 220px">
                  <q-item
                    clickable
                    v-ripple
                    @click="callViaPhone(customer.contact_no2)"
                  >
                    <q-item-section avatar>
                      <q-icon name="call" />
                    </q-item-section>
                    <q-item-section>Call via phone</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-ripple
                    @click="callViaWhatsApp(customer.contact_no2)"
                  >
                    <q-item-section avatar>
                      <q-icon name="chat" />
                    </q-item-section>
                    <q-item-section>Call via WhatsApp</q-item-section>
                  </q-item>
                </q-list>
              </q-popup-proxy>
            </span>
          </div>

          <!-- Email -->
          <div v-if="customer.email">
            <span class="email-link" @click.stop>
              {{ customer.email }}
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-list style="min-width: 220px">
                  <q-item
                    clickable
                    v-ripple
                    @click="composeEmail(customer.email)"
                  >
                    <q-item-section avatar>
                      <q-icon name="email" />
                    </q-item-section>
                    <q-item-section>Compose email</q-item-section>
                  </q-item>
                  <q-item clickable v-ripple @click="copyEmail(customer.email)">
                    <q-item-section avatar>
                      <q-icon name="content_copy" />
                    </q-item-section>
                    <q-item-section>Copy email</q-item-section>
                  </q-item>
                </q-list>
              </q-popup-proxy>
            </span>
          </div>
        </div>

        <div class="col-4">
          <div
            v-if="customer._pendings?.length"
            class="row q-col-gutter-xs items-center no-wrap"
          >
            <q-chip
              v-for="p in customer._pendings"
              :key="p.code"
              clickable
              flat
              :color="pendingColor(p.code)"
              @click.stop="openPendingsDialog(customer, p.code)"
              :label="`${p.code}-${p.count}`"
              class="q-pa-sm text-weight-bold"
            />
          </div>
          <div v-else>-</div>
        </div>
      </div>
    </div>

    <AddCustomerDialog
      v-model="showAddCustomerDialog"
      @customer-added="handleCustomerAdded"
    />

    <q-dialog v-model="showPendingsDialog" persistent>
      <q-card style="min-width: 720px; max-width: 95vw">
        <q-card-section class="dialog-header row items-center q-pb-none">
          <div class="text-h6">{{ selectedCustomer?.name }} — Pendings</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

<q-card-section>
          <q-tabs v-model="pendingsActiveTab" class="text-primary" dense>
          <q-tab
            v-for="t in tabLabels"
            :key="t.code"
            :name="t.code"
            :label="t.label"
            :class="['q-mx-xs', 'text-grey-9', `bg-${pendingColor(t.code)}`]"
          />
        </q-tabs>
        <q-separator />

        <q-tab-panels v-model="pendingsActiveTab" animated>
          <q-tab-panel v-for="t in tabLabels" :key="t.code" :name="t.code">
            <q-table
              flat
              dense
              :rows="selectedPerOrderRows.filter((r) => r.code === t.code)"
              :columns="perOrderColumns"
              row-key="rowKey"
              hide-pagination
              :rows-per-page-options="[0]"
            >
              <template #body-cell-code="props">
                <q-td :props="props">
                  <q-chip
                    dense
                    flat
                    class="text-weight-bold"
                    :color="pendingColor(props.row.code)"
                  >
                    {{ props.row.code }}
                  </q-chip>
                </q-td>
              </template>
              <template #no-data>
                <div class="full-width text-center text-grey">
                  No {{ t.baseLabel }} found.
                </div>
              </template>
            </q-table>
          </q-tab-panel>
        </q-tab-panels>
</q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { openURL, copyToClipboard } from "quasar";
import { useTransactionStore } from "@/stores/transactionStore";
import AddCustomerDialog from "@/components/dialogs/AddCustomerDialog.vue";

const transactionStore = useTransactionStore();
const searchTerm = ref("");
const showAddCustomerDialog = ref(false);
const filteredCustomers = ref([]);

const filterCustomers = (term) => {
  const q = (term || "").toLowerCase();
  filteredCustomers.value = (transactionStore.customers || []).filter((c) =>
    [(c.name || ""), (c.contact_no1 || ""), (c.contact_no2 || ""), (c.email || "")]
      .some((v) => v.toLowerCase().includes(q))
  );
};
watch(searchTerm, (v) => filterCustomers(v));

onMounted(async () => {
  await transactionStore.loadCustomers();
  await enrichCustomersWithPendings();
  filterCustomers(searchTerm.value);
});

const selectCustomer = async (customer) => {
  try {
    transactionStore.useCcCollection = false;
    transactionStore.useCcDelivery = false;
    transactionStore.selectedCollectionContact = null;
    transactionStore.selectedDeliveryContact = null;
    transactionStore.selectedCollectionAddress = null;
    transactionStore.selectedDeliveryAddress = null;
    transactionStore.selectedCollectionDriver = null;
    transactionStore.selectedDeliveryDriver = null;
    transactionStore.collectionDate = null;
    transactionStore.deliveryDate = null;
    transactionStore.collectionTime = null;
    transactionStore.deliveryTime = null;
    transactionStore.collectionRemarks = null;
    transactionStore.deliveryRemarks = null;

    await transactionStore.setSelectedCustomer(customer);
  } catch (error) {
    console.error("Error selecting customer:", error);
  }
};

const handleCustomerAdded = async () => {
  showAddCustomerDialog.value = false;
  await transactionStore.loadCustomers();
  await enrichCustomersWithPendings();
  filterCustomers(searchTerm.value);
};

// tel/wa/email helpers
const sanitizeForTel = (raw) => String(raw || "").replace(/[^\d+]/g, "");
const sanitizeForWhatsApp = (raw) => String(raw || "").replace(/\D/g, "");
const callViaPhone = (rawNumber) => { const tel = sanitizeForTel(rawNumber); if (tel) openURL(`tel:${tel}`); };
const callViaWhatsApp = (rawNumber) => { const wa = sanitizeForWhatsApp(rawNumber); if (wa) openURL(`https://wa.me/${wa}`); };
const sanitizeEmail = (raw) => String(raw || "").trim();
const composeEmail = (rawEmail) => { const email = sanitizeEmail(rawEmail); if (email) openURL(`mailto:${email}`); };
const copyEmail = async (rawEmail) => { const email = sanitizeEmail(rawEmail); if (!email) return; try { await copyToClipboard(email); } catch (e) { console.error("Copy failed", e); } };


const showPendingsDialog = ref(false);
const selectedPerOrderRows = ref([]);
const selectedCustomer = ref(null);
const pendingsActiveTab = ref("C");

const openPendingsDialog = (customer, focusCode = null) => {
  selectedCustomer.value = customer;
  selectedPerOrderRows.value = customer?._pendingsOrders || [];

  if (focusCode && tabLabels.value.some((t) => t.code === focusCode)) {
    pendingsActiveTab.value = focusCode;
  } else {
    pendingsActiveTab.value = tabLabels.value[0]?.code || null;
  }

  showPendingsDialog.value = true;
};

const pendingTypes = [
  { code: "C", baseLabel: "Collection" },
  { code: "O", baseLabel: "Order" },
  { code: "D", baseLabel: "Delivery" },
  { code: "P", baseLabel: "Payment" },
  { code: "D&P", baseLabel: "Delivery & Payment" },
  { code: "I", baseLabel: "Issues" },
];

const tabLabels = computed(() => {
  const counts = {};
  (selectedCustomer.value?._pendings || []).forEach((p) => {
    counts[p.code] = p.count;
  });

  return pendingTypes
    .map((t) => {
      const count = counts[t.code] || 0;
      return {
        ...t,
        count,
        label: `${t.baseLabel} (${count})`,
      };
    })
    .filter((t) => t.count > 0);
});

// Color map for chips
const pendingColor = (code) => {
  switch (code) {
    case "C":
      return "pink-2"; // Pending Collection
    case "O":
      return "blue-2"; // Pending Order
    case "D":
      return "purple-2"; // Pending Delivery
    case "P":
      return "green-3"; // Pending Payment
    case "D&P":
      return "yellow-7"; // Pending Delivery & Payment
    case "I":
      return "red-3"; // Pending Issues
    default:
      return "white";
  }
};

const perOrderColumns = [
  { name: "order_no", label: "Order No", field: "order_no", align: "left" },
  {
    name: "goods_status",
    label: "Goods Status",
    field: "goods_status",
    align: "left",
  },
  {
    name: "payment_status",
    label: "Payment Status",
    field: "payment_status",
    align: "left",
  },
  {
    name: "logistics_status",
    label: "Logistics Status",
    field: "logistics_status",
    align: "left",
  },
];

const enrichCustomersWithPendings = async () => {
  const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
  const latest = (arr) => (arr?.length ? arr[arr.length - 1] : null);

  const updated = await Promise.all(
    transactionStore.customers.map(async (customer) => {
      let C = 0,
        O = 0,
        D = 0,
        P = 0,
        DP = 0,
        I = 0;
      const perOrder = [];

      try {
        const logisticsData = await transactionStore.fetchStatusByCustomerId(
          customer.id
        );

        logisticsData.forEach((log) => {
          const orders = toArray(log?.orders);
          const logisticsStatus = log?.logistics_status
            ?.toString()
            .trim()
            .toLowerCase();

          orders.forEach((order) => {
            const prod = latest(toArray(order?.order_production));
            const pay = latest(toArray(order?.order_payments));

            const goods = prod?.goods_status?.toString().trim().toLowerCase();
            const payst = pay?.payment_status?.toString().trim().toLowerCase();
            const logisticsId = log?.id;
            const orderNo = order?.order_no || "-"; 

            const isCollectionState =
              logisticsStatus === "collection arranged" ||
              logisticsStatus === "collection rescheduled" ||
              logisticsStatus === "collection cancelled";

            if (goods === "none" && isCollectionState) {
              C++;
              perOrder.push(
                makeRow(
                  "C",
                  logisticsId,
                  goods,
                  payst,
                  logisticsStatus,
                  orderNo
                )
              );
            }
            if (goods === "under process") {
              O++;
              perOrder.push(
                makeRow(
                  "O",
                  logisticsId,
                  goods,
                  payst,
                  logisticsStatus,
                  orderNo
                )
              );
            }
            if (goods === "to be delivered") {
              D++;
              perOrder.push(
                makeRow(
                  "D",
                  logisticsId,
                  goods,
                  payst,
                  logisticsStatus,
                  orderNo
                )
              );
              if (payst === "unpaid" || payst === "partial") {
                DP++;
                perOrder.push(
                  makeRow(
                    "D&P",
                    logisticsId,
                    goods,
                    payst,
                    logisticsStatus,
                    orderNo
                  )
                ); 
              }
            }
            if (
              goods === "items delivered" &&
              (payst === "unpaid" || payst === "partial")
            ) {
              P++;
              perOrder.push(
                makeRow(
                  "P",
                  logisticsId,
                  goods,
                  payst,
                  logisticsStatus,
                  orderNo
                )
              );
            }
            if (goods === "ongoing issue/s") {
              I++;
              perOrder.push(
                makeRow(
                  "I",
                  logisticsId,
                  goods,
                  payst,
                  logisticsStatus,
                  orderNo
                )
              );
            }
          });
        });
      } catch (_) {}

      const parts = [];
      const detail = [];
      if (C) {
        parts.push(`C${C}`);
        detail.push({ code: "C", label: "Pending Collection", count: C });
      }
      if (O) {
        parts.push(`O-${O}`);
        detail.push({ code: "O", label: "Pending Order", count: O });
      }
      if (D) {
        parts.push(`D-${D}`);
        detail.push({ code: "D", label: "Pending Delivery", count: D });
      }
      if (P) {
        parts.push(`P-${P}`);
        detail.push({ code: "P", label: "Pending Payment", count: P });
      }
      if (DP) {
        parts.push(`D&P-${DP}`);
        detail.push({
          code: "D&P",
          label: "Pending Delivery & Payment",
          count: DP,
        });
      }
      if (I) {
        parts.push(`I-${I}`);
        detail.push({ code: "I", label: "Pending Issues", count: I });
      }

      return {
        ...customer,
        pendings: parts.join(", "),
        _pendings: detail,
        _pendingsOrders: perOrder.map((r, i) => ({
          ...r,
          rowKey: `${r.logistics_id}-${r.code}-${i}`,
        })),
      };
    })
  );

  transactionStore.customers = updated;
  filterCustomers(searchTerm.value);
};

const makeRow = (
  code,
  logistics_id,
  goods_status,
  payment_status,
  logistics_status,
  order_no
) => ({
  logistics_id,
  order_no,
  code,
  goods_status,
  payment_status,
  logistics_status,
});
</script>
