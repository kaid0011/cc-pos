<template>
  <div class="row-col-table">
    <!-- Header -->
    <div class="row row-col-header text-center items-center">
      <div
        v-if="showCustomerColumn"
        class="col-3 header-bordered flex flex-center"
      >
        Customer Details
      </div>
      <div class="col header-bordered flex flex-center">Complaint</div>
      <div class="col-2 header-bordered flex flex-center">Created At/By</div>
    </div>

    <!-- States -->
    <div v-if="loading" class="text-center text-grey q-pa-lg text-subtitle1">
      Loading complaints…
    </div>
    <div
      v-else-if="error"
      class="text-center text-negative q-pa-lg text-subtitle1"
    >
      {{ error }}
    </div>
    <div
      v-else-if="rows.length === 0"
      class="text-center text-grey q-pa-lg text-h6"
    >
      No complaints found.
    </div>

    <!-- Rows -->
    <template v-else>
      <div
        class="row text-left items-stretch"
        v-for="data in rows"
        :key="data.id"
      >
        <!-- Customer Details -->
        <div v-if="showCustomerColumn" class="col-3 bordered q-pa-md">
          <div class="text-weight-bold">
            <a
              @click.prevent="openCustomerTab(data.customers?.id)"
              class="text-weight-bold text-subtitle1 line-height-1"
            >
              <NotSetText :value="data.customers?.name" />
            </a>
          </div>

          <div class="phone-link" @click.stop>
            <NotSetText :value="data.customers?.contact_no1" />
            <q-popup-proxy transition-show="scale" transition-hide="scale">
              <q-list style="min-width: 220px">
                <q-item
                  clickable
                  v-ripple
                  @click="callViaPhone(data.customers?.contact_no1)"
                >
                  <q-item-section avatar><q-icon name="call" /></q-item-section>
                  <q-item-section>Call via phone</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-ripple
                  @click="callViaWhatsApp(data.customers?.contact_no1)"
                >
                  <q-item-section avatar><q-icon name="chat" /></q-item-section>
                  <q-item-section>Call via WhatsApp</q-item-section>
                </q-item>
              </q-list>
            </q-popup-proxy>
          </div>

          <div
            v-if="data.customers?.contact_no2"
            class="phone-link"
            @click.stop
          >
            <NotSetText :value="data.customers?.contact_no2" />
            <q-popup-proxy transition-show="scale" transition-hide="scale">
              <q-list style="min-width: 220px">
                <q-item
                  clickable
                  v-ripple
                  @click="callViaPhone(data.customers?.contact_no2)"
                >
                  <q-item-section avatar><q-icon name="call" /></q-item-section>
                  <q-item-section>Call via phone</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-ripple
                  @click="callViaWhatsApp(data.customers?.contact_no2)"
                >
                  <q-item-section avatar><q-icon name="chat" /></q-item-section>
                  <q-item-section>Call via WhatsApp</q-item-section>
                </q-item>
              </q-list>
            </q-popup-proxy>
          </div>

          <div v-if="data.customers?.email">
            <span class="email-link" @click.stop>
              <NotSetText :value="data.customers?.email" />
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-list style="min-width: 220px">
                  <q-item
                    clickable
                    v-ripple
                    @click="composeEmail(data.customers?.email)"
                  >
                    <q-item-section avatar
                      ><q-icon name="email"
                    /></q-item-section>
                    <q-item-section>Compose email</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-ripple
                    @click="copyEmail(data.customers?.email)"
                  >
                    <q-item-section avatar
                      ><q-icon name="content_copy"
                    /></q-item-section>
                    <q-item-section>Copy email</q-item-section>
                  </q-item>
                </q-list>
              </q-popup-proxy>
            </span>
          </div>
        </div>

        <!-- Complaint (category chip + text in one cell) -->
        <div class="col bordered q-pa-md">
          <div class="q-mb-xs">
            <q-chip
              round
              :color="categoryColor(data.category)"
              text-color="white"
              class="q-ma-none text-weight-bold"
            >
              {{ displayCategory(data.category) }}
            </q-chip>
          </div>
          <div class="q-ml-sm">
            {{ data.description || "—" }}
          </div>
        </div>

        <!-- Created At/By -->
        <div class="col-2 bordered q-pa-md">
          <div>
            {{ formatDateLong(data.created_at) }}
          </div>
          <div>
            {{ data.profile_name || data.created_by || "—" }}
          </div>
        </div>
      </div>
    </template>

    <!-- Pagination -->
    <div class="row justify-center q-mt-md" v-if="totalPages > 1">
      <q-pagination
        :model-value="page"
        :max="totalPages"
        :max-pages="10"
        boundary-numbers
        direction-links
        @update:model-value="(p) => emit('update:page', p)"
      />
    </div>
  </div>
</template>

<script setup>
import { defineComponent, h } from "vue";
import { useQuasar, openURL, copyToClipboard } from "quasar";

/* Props / Emits */
defineProps({
  rows: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
  page: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  showCustomerColumn: { type: Boolean, default: true },
});
const emit = defineEmits(["update:page"]);

const $q = useQuasar();

/* Display utils */
const formatDateLong = (dateString) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/* Category: map DB values to pretty labels and colors */
const normCat = (v) =>
  String(v ?? "")
    .trim()
    .toLowerCase();
const displayCategory = (v) => {
  const n = normCat(v);
  if (
    n === "customer service" ||
    n === "customer_service" ||
    n === "customer-service"
  )
    return "Customer Service";
  if (n === "order") return "Order";
  return "Others";
};
const categoryColor = (v) => {
  const n = normCat(v);
  if (
    n === "customer service" ||
    n === "customer_service" ||
    n === "customer-service"
  )
    return "indigo-6";
  if (n === "order") return "orange-6";
  return "grey-7";
};

/* Actions */
const openCustomerTab = (customerId) =>
  window.open(`/customers/${customerId}`, "_blank");
const sanitizeForTel = (raw) => String(raw || "").replace(/[^\d+]/g, "");
const sanitizeForWhatsApp = (raw) => String(raw || "").replace(/\D/g, "");
const sanitizeEmail = (raw) => String(raw || "").trim();

const callViaPhone = (raw) => {
  const tel = sanitizeForTel(raw);
  if (tel) openURL(`tel:${tel}`);
};
const callViaWhatsApp = (raw) => {
  const wa = sanitizeForWhatsApp(raw);
  if (wa) openURL(`https://wa.me/${wa}`);
};
const composeEmail = (raw) => {
  const email = sanitizeEmail(raw);
  if (email) openURL(`mailto:${email}`);
};
const copyEmail = async (raw) => {
  const email = sanitizeEmail(raw);
  if (!email) return;
  try {
    await copyToClipboard(email);
    $q.notify({ type: "positive", message: "Email copied" });
  } catch {
    $q.notify({ type: "negative", message: "Copy failed" });
  }
};

/* Local fallback for NotSetText */
const NotSetText = defineComponent({
  name: "NotSetText",
  props: {
    value: { type: [String, Number, Boolean, Object, null], default: null },
  },
  setup(p) {
    return () => {
      const raw = p.value;
      const str = (raw ?? "").toString().trim();
      if (str) return h("span", str);
      return h(
        "span",
        { class: "text-grey-6 text-uppercase text-caption" },
        "[not set]"
      );
    };
  },
});
</script>
