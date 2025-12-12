<template>
  <div class="tags-view-container">
    <div class="row justify-center q-col-gutter-md q-pa-md">
      <div class="col-auto">
        <q-btn color="primary" @click="downloadInvoicePDF">
          Download Invoice PDF
        </q-btn>
      </div>
      <div class="col-auto">
        <q-btn color="primary" @click="PrintInvoicePDF">
          Print Invoice PDF
        </q-btn>
      </div>
    </div>

    <div class="row justify-center q-mb-lg">
      <div ref="printableContainer">
        <!-- CC invoice page -->
        <q-card
          v-if="hasCcItems"
          class="tag-card-container single-invoice-page"
        >
          <q-card flat class="tag-card">
            <div class="row tag-card-header items-center">
              <q-img
                :src="ccLogo"
                spinner-color="white"
                style="height: 50px; max-width: 200px"
                class="q-mr-sm"
              />
              <div>
                <div>
                  Address: 53 Ubi Ave 1 #01-29 Paya Ubi Ind. Park Singapore
                  408934
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
                    <div>
                      Order No:
                      <span class="text-weight-bold">{{
                        order?.order_no || "N/A"
                      }}</span>
                    </div>
                    <div>
                      Invoice Date:
                      <span class="text-weight-bold">
                        {{ formatDateOnly(history?.printed_at) }}
                      </span>
                    </div>
                    <div>
                      Invoice No:
                      <span class="text-weight-bold q-ml-md">
                        {{ invoiceNoCC || "N/A" }}</span
                      >
                    </div>
                  </div>
                </div>
                <div class="q-mt-md">
                  <div class="text-uppercase text-weight-bold">
                    Customer Information
                  </div>
                  <div>
                    Name: <span>{{ customer?.name || "N/A" }}</span>
                  </div>
                  <div v-if="hasBillingAddress">
                    Billing Address: <span>{{ customer.billing_address }}</span>
                  </div>
                  <div v-if="hasPoNo">
                    PO No.: <span>{{ customer.po_no }}</span>
                  </div>
                  <div>
                    Contact No:
                    <span
                      >{{ customer?.contact_no1
                      }}<span v-if="customer?.contact_no2">
                        / {{ customer?.contact_no2 }}</span
                      ></span
                    >
                  </div>
                  <div>
                    Email: <span>{{ customer?.email || "N/A" }}</span>
                  </div>
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
                    {{ collection?.contact_person?.name || "N/A" }}
                  </div>
                  <div>{{ formatAddress(collection?.address) || "N/A" }}</div>
                  <div>
                    Collected By:
                    {{ getDriverName(collection?.driver_id) || "N/A" }}
                  </div>
                  <div>
                    Collected On:
                    {{ formatDateOnly(collection?.collection_date) }},
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
                    {{ delivery?.contact_person?.name || "N/A" }}
                  </div>
                  <div>{{ formatAddress(delivery?.address) || "N/A" }}</div>
                  <div>
                    Delivered By:
                    <span>{{
                      isDelivered
                        ? getDriverName(delivery?.driver_id) || "N/A"
                        : "[NOT YET DELIVERED]"
                    }}</span>
                  </div>
                  <div>
                    Delivered On:
                    <span>
                      {{
                        isDelivered
                          ? `${formatDateOnly(delivery?.delivery_date)}${
                              delivery?.delivery_time
                                ? ", " + delivery.delivery_time
                                : ""
                            }`
                          : "[NOT YET DELIVERED]"
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Transaction Table -->
            <div class="row tag-card-header line-height-1 text-uppercase">
              <div class="col-4 text-weight-bold tag-card-cell text-center">
                Item
              </div>
              <div class="col text-weight-bold tag-card-cell text-center">
                Method
              </div>
              <div class="col text-weight-bold tag-card-cell text-center">
                Unit Price
              </div>
              <!-- <div class="col-1 text-weight-bold tag-card-cell text-center">
                Pcs
              </div> -->
              <div class="col text-weight-bold tag-card-cell text-center">
                Qty
              </div>
              <div class="col text-weight-bold tag-card-cell text-center">
                Subtotal
              </div>
            </div>

            <div v-if="hasCcItems">
              <div
                v-for="item in ccItems"
                :key="item.id || item.item_name"
                class="row line-height-1"
              >
                <div class="col-4 tag-card-cell">{{ item.item_name }}</div>
                <div class="col tag-card-cell text-center">
                  {{ formatProcessText(item.process) }}
                </div>
                <div class="col tag-card-cell text-center">
                  {{ `$${(parseFloat(item.price) || 0).toFixed(2)}` }} /
                  {{ item.unit }}
                </div>
                <!-- <div class="col-1 tag-card-cell text-center">
                  {{ item.pieces }}
                </div> -->
                <div class="col tag-card-cell text-center">
                  {{ formatQtyForInvoice(item) }}
                  {{ unitLabel(getUnitForItem(item)) }}
                </div>
                <div class="col tag-card-cell text-center">
                  {{
                    `$${(
                      (parseFloat(item.quantity) || 0) *
                      (parseFloat(item.price) || 0)
                    ).toFixed(2)}`
                  }}
                </div>
              </div>
            </div>

            <div v-else class="text-center text-grey q-my-md text-subtitle1">
              No CC items added to the list.
            </div>
            <!-- 
            <div class="row tag-card-footer line-height-1">
              <div class="col-6 text-weight-bold text-uppercase"></div>
              <div class="col text-weight-bold text-uppercase text-right">
                Total :
              </div>
              <div class="col-1 text-weight-bold text-center">
                {{ ccTotalPcs }}
              </div>
              <div class="col text-weight-bold text-center">
                {{ ccTotalQty }}
              </div>
              <div class="col text-weight-bold text-center">
                ${{ ccTotalPrice }}
              </div>
            </div> -->

            <div class="q-mt-md">
              <div class="row">
                <div class="col">
                  <div class="text-weight-bold text-uppercase">
                    Payment Summary
                  </div>
                  <div>
                    Subtotal:
                    <span>${{ ccTotalPrice }}</span>
                  </div>
                  <div>
                    Paid:
                    <span>${{ ccPaidTotal.toFixed(2) }}</span>
                  </div>
                  <div>
                    Remaining Credit:
                    <span>
                      ${{
                        (
                          customer?.customer_credits[0]?.online_package +
                            customer?.customer_credits[0]?.other_credits || 0
                        ).toFixed(2)
                      }}
                    </span>
                  </div>
                  <div>
                    Total Due:
                    <span>${{ ccTotalDue }}</span>
                  </div>
                </div>

                <div class="col">
                  <div class="text-weight-bold text-uppercase">
                    Subtotal After Discounts, Credits, and Express
                  </div>
                  <div>
                    Outstanding:
                    <span>${{ ccTotalPrice }}</span>
                  </div>
                  <div>
                    Outstanding Paid:
                    <span>${{ ccPaidTotal.toFixed(2) }}</span>
                  </div>
                  <div>
                    Total Due:
                    <span>${{ ccTotalDue }}</span>
                  </div>
                </div>
              </div>
              <div class="text-center line-height-1 q-mt-md">
                <div>
                  (Prepaid credits are available for purchase on our website)
                </div>
                <div>
                  *** For cheque payment, please make cheque payable to 'Cotton
                  Care Drycleaners Pte Ltd'. ***
                </div>
              </div>
            </div>

            <div
              class="row q-my-md"
              style="
                border: solid;
                border-width: 0.5px;
                border-radius: 5px;
                padding: 10px;
              "
            >
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
                    not be responsible for shrinkage, fading, fastness of
                    colour, defect due to manufacture, buttons or ornaments that
                    cannot withstand cleaning or pressing or water & tear due to
                    the process of cleaning.
                  </div>
                </li>
                <li>
                  <div class="q-ml-xs">
                    Stain removal is done at owner's risk with additional
                    charges and is NOT guaranteed.
                  </div>
                </li>
                <li>
                  <div class="q-ml-xs">
                    If any article is lost or damage through our negligence or
                    in the event of fire, our liability shall be limited from 5
                    to 10 times the regular service charge for each article. The
                    total claim for all articles shall be deemed not to exceed
                    $100.00 per order. In the event of a claim for any damaged
                    item/s, that item/s shall be retained by the company.
                  </div>
                </li>
                <li>
                  <div class="q-ml-xs">
                    Customers are advised to check the articles at the time of
                    return. The company will not bear any responsibility once
                    the articles have been returned for more than 24 hours.
                  </div>
                </li>
                <li>
                  <div class="q-ml-xs">
                    he company shall not be liable for any loss or damage due to
                    storage of any unclaimed article more than 14 days from
                    Return Date. Any unclaimed article shall be disposed after 3
                    months.
                  </div>
                </li>
                <li>
                  <div class="q-ml-xs">
                    There is a minimum charge of $30 per laundry collection and
                    a minimum charge of $250 for curtains removal and
                    installation.
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
                    Customers are reminded that it is an offense under the law
                    to send bedding, clothing, or any articles which have been
                    in contact with infectious disease to a public house.
                  </div>
                </li>
              </ol>
            </div>
            <div class="text-weight-bold text-caption text-center">
              *** This is a computer generated invoice. No signatory is
              required. ***
            </div>
          </q-card>
        </q-card>

        <!-- DC invoice page -->
        <q-card
          v-if="hasDcItems"
          class="tag-card-container single-invoice-page"
        >
          <q-card flat class="tag-card">
            <div class="row tag-card-header items-center">
              <q-img
                :src="dcLogo"
                spinner-color="white"
                style="height: 50px; max-width: 200px"
                class="q-mr-sm"
              />
              <div>
                <div>
                  Address: 53 Ubi Ave 1 #01-29 Paya Ubi Ind. Park Singapore
                  408934
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
                    <div>
                      Order No:
                      <span class="text-weight-bold">{{
                        order?.order_no || "N/A"
                      }}</span>
                    </div>
                    <div>
                      Invoice Date:
                      <span class="text-weight-bold">
                        {{ formatDateOnly(history?.printed_at) }}
                      </span>
                    </div>
                    <div>
                      Invoice No:
                      <span class="text-weight-bold q-ml-md">
                        {{ invoiceNoDC || "N/A" }}</span
                      >
                    </div>
                  </div>
                </div>
                <div class="q-mt-md">
                  <div class="text-uppercase text-weight-bold">
                    Customer Information
                  </div>
                  <div>
                    Name: <span>{{ customer?.name || "N/A" }}</span>
                  </div>
                  <div v-if="hasBillingAddress">
                    Billing Address: <span>{{ customer.billing_address }}</span>
                  </div>
                  <div v-if="hasPoNo">
                    PO No.: <span>{{ customer.po_no }}</span>
                  </div>
                  <div>
                    Contact No:
                    <span
                      >{{ customer?.contact_no1
                      }}<span v-if="customer?.contact_no2">
                        / {{ customer?.contact_no2 }}</span
                      ></span
                    >
                  </div>
                  <div>
                    Email: <span>{{ customer?.email || "N/A" }}</span>
                  </div>
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
                    {{ collection?.contact_person?.name || "N/A" }}
                  </div>
                  <div>{{ formatAddress(collection?.address) || "N/A" }}</div>
                  <div>
                    Collected By:
                    {{ getDriverName(collection?.driver_id) || "N/A" }}
                  </div>
                  <div>
                    Collected On:
                    {{ formatDateOnly(collection?.collection_date) }},
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
                    {{ delivery?.contact_person?.name || "N/A" }}
                  </div>
                  <div>{{ formatAddress(delivery?.address) || "N/A" }}</div>
                  <div>
                    Delivered By:
                    <span>{{
                      isDelivered
                        ? getDriverName(delivery?.driver_id) || "N/A"
                        : "[NOT YET DELIVERED]"
                    }}</span>
                  </div>
                  <div>
                    Delivered On:
                    <span>
                      {{
                        isDelivered
                          ? `${formatDateOnly(delivery?.delivery_date)}${
                              delivery?.delivery_time
                                ? ", " + delivery.delivery_time
                                : ""
                            }`
                          : "[NOT YET DELIVERED]"
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Transaction Table -->
            <div class="row tag-card-header line-height-1 text-uppercase">
              <div class="col-4 text-weight-bold tag-card-cell text-center">
                Item
              </div>
              <div class="col text-weight-bold tag-card-cell text-center">
                Method
              </div>
              <div class="col text-weight-bold tag-card-cell text-center">
                Unit Price
              </div>
              <!-- <div class="col-1 text-weight-bold tag-card-cell text-center">
                Pcs
              </div> -->
              <div class="col text-weight-bold tag-card-cell text-center">
                Qty
              </div>
              <div class="col text-weight-bold tag-card-cell text-center">
                Subtotal
              </div>
            </div>

            <div v-if="hasDcItems">
              <div
                v-for="item in dcItems"
                :key="item.id || item.item_name"
                class="row line-height-1"
              >
                <div class="col-4 tag-card-cell">{{ item.item_name }}</div>
                <div class="col tag-card-cell text-center">
                  {{ formatProcessText(item.process) }}
                </div>
                <div class="col tag-card-cell text-center">
                  {{ `$${(parseFloat(item.price) || 0).toFixed(2)}` }} /
                  {{ item.unit }}
                </div>
                <!-- <div class="col-1 tag-card-cell text-center">
                  {{ item.pieces }}
                </div> -->
                <div class="col tag-card-cell text-center">
                  {{ formatQtyForInvoice(item) }}
                  {{ unitLabel(getUnitForItem(item)) }}
                </div>
                <div class="col tag-card-cell text-center">
                  {{
                    `$${(
                      (parseFloat(item.quantity) || 0) *
                      (parseFloat(item.price) || 0)
                    ).toFixed(2)}`
                  }}
                </div>
              </div>
            </div>

            <div v-else class="text-center text-grey q-my-md text-subtitle1">
              No DC items added to the list.
            </div>

            <!-- <div class="row tag-card-footer line-height-1">
              <div class="col-6 text-weight-bold text-uppercase"></div>
              <div class="col text-weight-bold text-uppercase text-right">
                Total :
              </div>
              <div class="col text-weight-bold text-center">
                {{ dcTotalPcs }}
              </div>
              <div class="col text-weight-bold text-center">
                {{ dcTotalQty }}
              </div>
              <div class="col text-weight-bold text-center">
                ${{ dcTotalPrice }}
              </div>
            </div> -->

            <div class="q-mt-md">
              <div class="row">
                <div class="col">
                  <div class="text-weight-bold text-uppercase">
                    Payment Summary
                  </div>
                  <div>
                    Subtotal:
                    <span>${{ dcTotalPrice }}</span>
                  </div>
                  <div>
                    Paid:
                    <span>${{ dcPaidTotal.toFixed(2) }}</span>
                  </div>
                  <div>
                    Remaining Credit:
                    <span>
                      ${{
                        (
                          customer?.customer_credits[0]?.online_package +
                            customer?.customer_credits[0]?.other_credits || 0
                        ).toFixed(2)
                      }}
                    </span>
                  </div>
                  <div>
                    Total Due:
                    <span>${{ dcTotalDue }}</span>
                  </div>
                </div>

                <div class="col">
                  <div class="text-weight-bold text-uppercase">
                    Subtotal After Discounts, Credits, and Express
                  </div>
                  <div>
                    Outstanding:
                    <span>${{ dcTotalPrice }}</span>
                  </div>
                  <div>
                    Outstanding Paid:
                    <span>${{ dcPaidTotal.toFixed(2) }}</span>
                  </div>
                  <div>
                    Total Due:
                    <span>${{ dcTotalDue }}</span>
                  </div>
                </div>
              </div>
              <div class="text-center line-height-1 q-mt-md">
                <div>
                  (Prepaid credits are available for purchase on our website)
                </div>
                <div>
                  *** For cheque payment, please make cheque payable to 'Cotton
                  Care Drycleaners Pte Ltd'. ***
                </div>
              </div>
            </div>

            <div
              class="row q-my-md"
              style="
                border: solid;
                border-width: 0.5px;
                border-radius: 5px;
                padding: 10px;
              "
            >
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
                    not be responsible for shrinkage, fading, fastness of
                    colour, defect due to manufacture, buttons or ornaments that
                    cannot withstand cleaning or pressing or water & tear due to
                    the process of cleaning.
                  </div>
                </li>
                <li>
                  <div class="q-ml-xs">
                    Stain removal is done at owner's risk with additional
                    charges and is NOT guaranteed.
                  </div>
                </li>
                <li>
                  <div class="q-ml-xs">
                    If any article is lost or damage through our negligence or
                    in the event of fire, our liability shall be limited from 5
                    to 10 times the regular service charge for each article. The
                    total claim for all articles shall be deemed not to exceed
                    $100.00 per order. In the event of a claim for any damaged
                    item/s, that item/s shall be retained by the company.
                  </div>
                </li>
                <li>
                  <div class="q-ml-xs">
                    Customers are advised to check the articles at the time of
                    return. The company will not bear any responsibility once
                    the articles have been returned for more than 24 hours.
                  </div>
                </li>
                <li>
                  <div class="q-ml-xs">
                    he company shall not be liable for any loss or damage due to
                    storage of any unclaimed article more than 14 days from
                    Return Date. Any unclaimed article shall be disposed after 3
                    months.
                  </div>
                </li>
                <li>
                  <div class="q-ml-xs">
                    There is a minimum charge of $30 per laundry collection and
                    a minimum charge of $250 for curtains removal and
                    installation.
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
                    Customers are reminded that it is an offense under the law
                    to send bedding, clothing, or any articles which have been
                    in contact with infectious disease to a public house.
                  </div>
                </li>
              </ol>
            </div>
            <div class="text-weight-bold text-caption text-center">
              *** This is a computer generated invoice. No signatory is
              required. ***
            </div>
          </q-card>
        </q-card>
      </div>
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
import dcLogo from "@/assets/images/dc_logo.png";

const transactionStore = useTransactionStore();
const route = useRoute();

const order = ref(null);
const customer = ref(null);
const collection = ref({});
const delivery = ref({});
const logistics = ref({});
const transactions = ref([]);

const reports = ref([]);

const invoice = ref(null); // CHANGED: holds order_invoices row
const history = ref(null); // CHANGED: holds order_invoices_print_history row

const paymentsHistory = ref([]);

// --- SPLIT ITEMS BY COMPANY ---

const ccItems = computed(() =>
  transactions.value.filter(
    (item) => (item.company || "").toString().toLowerCase() === "cc"
  )
);

const dcItems = computed(() =>
  transactions.value.filter(
    (item) => (item.company || "").toString().toLowerCase() === "dc"
  )
);

const hasCcItems = computed(() => ccItems.value.length > 0);
const hasDcItems = computed(() => dcItems.value.length > 0);

// Totals for CC
const ccTotalPcs = computed(() =>
  ccItems.value.reduce((acc, item) => {
    const pcs = parseFloat(item.pieces) || 1;
    const qty = parseFloat(item.quantity) || 1;
    return acc + pcs * qty;
  }, 0)
);

const ccTotalQty = computed(() =>
  ccItems.value.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    return acc + qty;
  }, 0)
);

// numeric subtotal for CC
const ccSubtotal = computed(() =>
  ccItems.value.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return acc + qty * price;
  }, 0)
);

// formatted subtotal string
const ccTotalPrice = computed(() => ccSubtotal.value.toFixed(2));

// Totals for DC
const dcTotalPcs = computed(() =>
  dcItems.value.reduce((acc, item) => {
    const pcs = parseFloat(item.pieces) || 1;
    const qty = parseFloat(item.quantity) || 1;
    return acc + pcs * qty;
  }, 0)
);

const dcTotalQty = computed(() =>
  dcItems.value.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    return acc + qty;
  }, 0)
);

// numeric subtotal for DC
const dcSubtotal = computed(() =>
  dcItems.value.reduce((acc, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return acc + qty * price;
  }, 0)
);

// formatted subtotal string
const dcTotalPrice = computed(() => dcSubtotal.value.toFixed(2));

// --- PER-COMPANY PAYMENTS (from order_payments_history) ---
// Only rows for company 'cc' (order already filtered in fetchPaymentHistoryByOrderId)
const ccPayments = computed(() =>
  paymentsHistory.value.filter(
    (p) => (p.company || "").toString().toLowerCase() === "cc"
  )
);

// Only rows for company 'dc'
const dcPayments = computed(() =>
  paymentsHistory.value.filter(
    (p) => (p.company || "").toString().toLowerCase() === "dc"
  )
);

// Sum of amounts for CC
const ccPaidTotal = computed(() =>
  ccPayments.value.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
);

// Sum of amounts for DC
const dcPaidTotal = computed(() =>
  dcPayments.value.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
);

// Total due per company = subtotal (items) - paid (history)
const ccTotalDue = computed(() =>
  (ccSubtotal.value - ccPaidTotal.value).toFixed(2)
);

const dcTotalDue = computed(() =>
  (dcSubtotal.value - dcPaidTotal.value).toFixed(2)
);


// --- INVOICE NUMBER BASE + CC/DC SUFFIX (DISPLAY ONLY) ---

const invoiceNoBase = computed(() => {
  const fromRoute = route.params?.invoice_no;
  if (fromRoute && String(fromRoute).trim()) {
    return String(fromRoute).trim();
  }

  if (invoice.value?.invoice_no != null) {
    return String(invoice.value.invoice_no).trim();
  }

  return "";
});

const invoiceNoCC = computed(() =>
  invoiceNoBase.value ? `${invoiceNoBase.value}-CC` : ""
);

const invoiceNoDC = computed(() =>
  invoiceNoBase.value ? `${invoiceNoBase.value}-DC` : ""
);

const getParams = () => {
  const p = {
    orderNo: route.params?.order_no || null,
    invoiceNo: route.params?.invoice_no || null,
    historyId: route.params?.history_id || null,
  };
  return p;
};

const printableContainer = ref(null);

onMounted(async () => {
  const TAG = "[InvoiceView:onMounted]";
  const { orderNo, invoiceNo, historyId } = getParams();
  console.log(`${TAG} params`, { orderNo, invoiceNo, historyId });

  try {
    // Load drivers for name mapping
    await transactionStore.loadDrivers();

    // 1) Fetch order + details
    const orderDetails = await transactionStore.fetchWholeOrderByOrderNo(
      orderNo
    );
    console.log(`${TAG} orderDetails`, orderDetails);

    logistics.value = orderDetails || {};
    order.value = orderDetails.order || {};
    customer.value = orderDetails.customer || {};
    collection.value = orderDetails.collection || {};
    delivery.value = orderDetails.delivery || {};
    transactions.value = [];
    (orderDetails.transactions || []).forEach((tx) => {
      if (Array.isArray(tx.order_transaction_items)) {
        tx.order_transaction_items.forEach((item) =>
          transactions.value.push(item)
        );
      }
    });
    reports.value = orderDetails.error_reports || [];

    // 2) Fetch payment history for this order (order_payments_history)
    try {
      if (
        order.value?.id &&
        typeof transactionStore.fetchPaymentHistoryByOrderId === "function"
      ) {
        // EXPECTATION:
        // fetchPaymentHistoryByOrderId(orderId) returns rows from order_payments_history
        // each having: { order_id, company, amount, ... }
        const ph = await transactionStore.fetchPaymentHistoryByOrderId(
          order.value.id
        );
        paymentsHistory.value = Array.isArray(ph) ? ph : [];
      } else {
        paymentsHistory.value = [];
      }
      console.log("[InvoiceView] paymentsHistory:", paymentsHistory.value);
    } catch (e) {
      console.error("[InvoiceView] payment history fetch error", e);
      paymentsHistory.value = [];
    }

    // 3) Fetch invoice by invoice_no (try common store methods)
    let inv = null;

    try {
      if (typeof transactionStore.fetchInvoiceByNo === "function") {
        inv = await transactionStore.fetchInvoiceByNo(invoiceNo);
      } else if (typeof transactionStore.fetchInvoiceByNumber === "function") {
        inv = await transactionStore.fetchInvoiceByNumber(invoiceNo);
      } else if (typeof transactionStore.fetchInvoiceById === "function") {
        // fallback if your route passes id instead of no
        inv = await transactionStore.fetchInvoiceById(invoiceNo);
      }
      console.log(`${TAG} invoice fetch result`, inv);
    } catch (e) {
      console.error(`${TAG} invoice fetch error`, e);
    }
    invoice.value = inv;

    let hist = null;
    try {
      if (typeof transactionStore.fetchPrintHistoryById === "function") {
        const r = await transactionStore.fetchPrintHistoryById(historyId);
        if (r?.ok) hist = r.data;
        else
          console.error(
            "[InvoiceView] fetchPrintHistoryById failed:",
            r?.error
          );
      }
      console.log("[InvoiceView] history fetch result", hist);
    } catch (e) {
      console.error("[InvoiceView] history fetch error", e);
    }
    history.value = hist;
    console.log("[InvoiceView] bound printed_at", history.value?.printed_at);
  } catch (error) {
    console.error(`${TAG} load error`, error);
  }
});

const isDelivered = computed(() => {
  const s = (logistics.value?.logistics_status || "")
    .toString()
    .trim()
    .toLowerCase();
  return s === "delivery completed";
});

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

function formatDate(date) {
  if (!date) return "N/A";
  const parsedDate = new Date(date);
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
  const weekday = weekdays[parsedDate.getDay()]; // Day abbreviation
  const monthDay = parsedDate.getDate().toString().padStart(2, "0"); // 2-digit day
  const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0"); // 2-digit month
  return `${weekday}${month}${monthDay}`; // Combine into format
}

const downloadInvoicePDF = () => {
  if (!printableContainer.value) {
    console.error("Printable container not found");
    return;
  }

  setTimeout(() => {
    const element = printableContainer.value.$el || printableContainer.value;

    const options = {
      margin: [0,0,0,0],
      filename: `Invoice_${order.value?.order_no || "N_A"}_CC_DC.pdf`,
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
      pagebreak: { mode: ["css", "legacy"] }, // will respect page-break CSS
    };

    html2pdf()
      .set(options)
      .from(element)
      .toPdf()
      .save()
      .catch((err) => console.error("Error generating PDF:", err));
  }, 500);
};

const PrintInvoicePDF = () => {
  if (!printableContainer.value) {
    console.error("Printable container not found");
    return;
  }

  setTimeout(() => {
    const element = printableContainer.value.$el || printableContainer.value;

    const options = {
      margin: [0,0,0,0],
      filename: `Invoice_${order.value?.order_no || "N_A"}_CC_DC.pdf`,
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
      pagebreak: { mode: ["css", "legacy"] },
    };

    html2pdf()
      .set(options)
      .from(element)
      .toPdf()
      .output("blob")
      .then((blob) => {
        const pdfUrl = URL.createObjectURL(blob);
        const newWindow = window.open(pdfUrl, "_blank");

        if (newWindow) {
          setTimeout(() => {
            newWindow.print();
            newWindow.onafterprint = () => {
              newWindow.close();
            };
          }, 300);
        } else {
          console.error("Pop-up blocked. Please allow pop-ups for this site.");
        }
      })
      .catch((err) => console.error("Error generating PDF:", err));
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

const DRIVER_NOT_SET = "[NOT SET]";

const driverMapById = computed(() => {
  const m = new Map();
  (transactionStore.driverOptions || []).forEach((d) => {
    if (d?.id != null)
      m.set(String(d.id), (d.name || "").trim() || DRIVER_NOT_SET);
  });
  return m;
});
const getDriverName = (id) =>
  driverMapById.value.get(String(id)) || DRIVER_NOT_SET;

function formatAddress(addr) {
  if (!addr) return "-";
  const main = [addr.block_no, addr.road_name, addr.unit_no, addr.building_name]
    .map((v) => (v ?? "").toString().trim())
    .filter(Boolean)
    .join(" ");
  const postal = (addr.postal_code ?? "").toString().trim();
  const line = [main, postal].filter(Boolean).join(", ");
  const extra = [addr.additional_info, addr.remarks]
    .map((v) => (v ?? "").toString().trim())
    .filter(Boolean)
    .join(" — ");
  return extra ? `${line} (${extra})` : line || "-";
}

const hasBillingAddress = computed(() => {
  const v = customer.value?.billing_address;
  return v != null && String(v).trim().length > 0;
});

const hasPoNo = computed(() => {
  const v = customer.value?.po_no;
  return v != null && String(v).trim().length > 0;
});

function formatProcessText(process) {
  switch (process) {
    case "laundry":
      return "Laundry";
    case "dryclean":
      return "Dry Clean";
    case "pressing":
      return "Pressing Only";
    case "others":
      return "Others";
    default:
      return process;
  }
}

/** Safely get unit for an item; fallback by inferring from the name */
function getUnitForItem(item) {
  const u = (item.unit || "").toString().toLowerCase().trim();
  if (u) return u;
  return inferUnitFromName(item.item_name || "");
}

/** Infer unit based on item name text if unit not stored */
function inferUnitFromName(name) {
  const s = (name || "").toLowerCase();
  if (s.includes("sqft")) return "sqft";
  if (s.includes("kg")) return "kg";
  return "pc"; // default
}

/** Display label for unit */
function unitLabel(u) {
  if (!u) return "";
  const lower = u.toLowerCase();
  if (lower === "pc") return "pcs";
  return lower;
}

function formatQtyForInvoice(item) {
  const unit = (getUnitForItem(item) || "").toLowerCase();
  const raw = parseFloat(item.quantity);

  const q = Number.isFinite(raw) ? raw : 0;

  // pcs → integer only, no decimals
  if (unit === "pc") {
    return q.toFixed(0);
  }

  // all other units → 2 decimal places
  return q.toFixed(2);
}
</script>
<style scoped>
.single-invoice-page {
  page-break-after: always;
  margin-bottom: 10px;
}

/* Optional: prevent extra blank page after the last invoice */
.single-invoice-page:last-child {
  page-break-after: auto;
}
</style>
