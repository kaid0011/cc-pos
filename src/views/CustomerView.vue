<template>
  <div class="row justify-center page-title-header text-uppercase">
    Customer Details
  </div>
  <div class="full-container contact-persons-management">
    <div class="row">
      <div class="col q-pa-sm">
        <q-btn
          dense
          flat
          label="Create Collection"
          class="bg-primary text-white full-width"
          @click="openCollectionDialog(customerDetails)"
        />
      </div>
      <div class="col q-pa-sm">
        <q-btn
          dense
          flat
          label="Generate SOA"
          class="bg-secondary text-white full-width"
          @click="openSoaDialog"
        />
      </div>
    </div>
    <div class="page-1-container p-exception text-subtitle1">
      <div class="row">
        <div class="col bordered p-min">
          <div class="row justify-center">
            <span
              class="subheadline text-h6 text-weight-bolder text-uppercase text-center"
            >
              Customer Details
            </span>
          </div>

          <q-btn
            unelevated
            outline
            dense
            label="Update Customer Details"
            color="primary"
            class="q-mb-sm full-width"
            @click="openUpdateCustomerDialog(customerDetails)"
          />
          <div class="">
            <!-- <div><strong>ID:</strong> {{ customerDetails.id }}</div> -->
            <div>
              <strong>Customer Name:</strong> {{ customerDetails.name }}
            </div>
            <div>
              <strong>Contact Nos:</strong> {{ customerDetails.contact_no1
              }}<span
                v-if="
                  customerDetails.contact_no2 &&
                  customerDetails.contact_no2.length
                "
              >
                / {{ customerDetails.contact_no2 }}</span
              >
            </div>
            <!-- <div>
            <strong>Contact No 2:</strong> {{ customerDetails.contact_no2 }}
          </div> -->
            <div>
              <strong>Email:</strong> {{ customerDetails.email || "-" }}
            </div>

            <div>
              <strong>Customer Type: </strong>
              <span>
                {{ customerDetails.type }}
                <span
                  v-if="
                    customerDetails.sub_type &&
                    customerDetails.sub_type.trim().length
                  "
                >
                  - {{ customerDetails.sub_type }}
                </span>
              </span>
            </div>
            <div>
              <strong>Billing Address: </strong>
              {{ customerDetails.billing_address || "-" }}
            </div>
            <div>
              <strong>PO No.: </strong>
              {{ customerDetails.po_no || "-" }}
            </div>
            <div>
              <strong>Recommended By:</strong>
              {{ customerDetails.recommended_by || "-" }}
            </div>
            <div>
              <strong>Customer Since:</strong>
              {{ formatDate(customerDetails.created_at) }}
            </div>
            <div>
              <strong>Status: </strong>
              <span
                :class="isActiveClass"
                class="text-uppercase text-weight-bold"
                >{{ isActiveLabel }}</span
              >
            </div>
          </div>
        </div>

        <div class="col bordered p-min">
          <div class="row justify-center">
            <span
              class="subheadline text-h6 text-weight-bolder text-uppercase text-center"
            >
              Customer Credits
            </span>
          </div>

          <div class="row">
            <q-btn
              dense
              unelevated
              outline
              label="Top Up Credits"
              color="primary"
              class="full-width"
              @click="openUpdateCreditsDialog(customerDetails)"
            />
          </div>
          <div>
            <a
              class="text-subtitle1 cursor-pointer"
              @click="openCreditsHistoryDialog(customerCredits.id)"
            >
              (View Credit History)</a
            >

            <div>
              <div>
                Online Package Credits:
                <span class="text-weight-bolder mark-yellow"
                  >${{
                    parseFloat(customerCredits.online_package).toFixed(2)
                  }}</span
                >
              </div>
              <div>
                Other Credits:
                <span class="text-weight-bolder mark-yellow"
                  >${{
                    parseFloat(customerCredits.other_credits).toFixed(2)
                  }}</span
                >
              </div>
              <q-separator />
              <div>
                Total Credits:
                <span class="text-weight-bolder mark-green"
                  >${{ parseFloat(creditsTotal).toFixed(2) }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <div class="col bordered p-min">
          <div class="row justify-center">
            <span
              class="subheadline text-h6 text-weight-bolder text-uppercase text-center"
            >
              Order Payments
            </span>
          </div>
          <!-- <a class="text-subtitle1"> (View Order Payments)</a> -->
          <div class="line-height-1 q-mb-md">
            <div>
              Unpaid Amount:
              <span class="text-weight-bold text-red-8">{{
                formatCurrency(unpaidAmount)
              }}</span>
            </div>
            <div>
              Paid Amount:
              <span class="text-weight-bold text-green-9">{{
                formatCurrency(paidAmount)
              }}</span>
            </div>
            <div>
              Total Amount:
              <span class="text-weight-bold mark-yellow">{{
                formatCurrency(totalAmount)
              }}</span>
            </div>
          </div>
          <div class="q-mt-md flex flex-center">
            <canvas
              ref="paymentsPieRef"
              style="max-width: 250px; max-height: 250px"
            ></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="page-2-container">
      <div class="row">
        <!-- Addresses -->
        <div class="col show-addresses q-ma-xs">
          <q-btn
            unelevated
            :icon="showAddresses ? 'arrow_drop_up' : 'arrow_drop_down'"
            label="Show Addresses"
            class="full-width text-primary show-list-tab text-weight-bolder text-subtitle1"
            @click="toggleAddresses"
            ><q-icon
              name="help_outline"
              size="14px"
              class="q-ml-sm"
              tabindex="0"
              role="button"
              aria-label="Show/hide addresses help"
            >
              <q-tooltip
                anchor="bottom right"
                self="top right"
                max-width="260px"
              >
                Click to {{ showAddresses ? "collapse" : "expand" }} the
                customer’s address list below.
              </q-tooltip>
            </q-icon></q-btn
          >
          <div v-if="showAddresses" class="q-pa-md addresses-container">
            <div class="row items-center justify-end">
              <q-btn
                flat
                dense
                icon="add"
                color="primary"
                class="q-mb-sm text-weight-bold"
                @click="showAddAddressDialog = true"
                label="Add Address"
              />
            </div>

            <div class="">
              <!-- Header -->
              <div
                class="row row-col-header text-center items-stretch line-height-1"
              >
                <div class="col col-6 header-bordered flex flex-center">
                  Address
                </div>
                <div class="col col-3 header-bordered flex flex-center">
                  Remarks
                </div>
              </div>

              <!-- Rows -->
              <template v-if="addresses && addresses.length">
                <div
                  v-for="address in addresses"
                  :key="address.id"
                  class="row row-col-row bg-white"
                >
                  <div class="col col-6 bordered">
                    {{ address.block_no || "" }} {{ address.road_name || "" }}
                    {{ address.unit_no || "" }}
                    {{ address.building_name || "" }}
                    {{ address.postal_code || "" }}
                    <span
                      v-if="
                        address.additional_info &&
                        address.additional_info.length
                      "
                    >
                      , ({{ address.additional_info }})
                    </span>
                    <div>
                      <q-btn
                        dense
                        outline
                        label="Update"
                        color="primary"
                        class="main-button q-px-sm line-height-1"
                        @click="openUpdateDialog(address, 'address')"
                      />
                    </div>
                  </div>
                  <div class="col col-3 bordered">
                    {{ address.remarks || "-" }}
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="row row-col-row bg-white">
                  <div class="col-12 bordered text-center q-pa-sm">
                    No address available
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Contact Persons -->
        <div class="col show-contact-person q-ma-xs">
          <q-btn
            unelevated
            :icon="showContactPersons ? 'arrow_drop_up' : 'arrow_drop_down'"
            label="Show Contact Persons"
            class="full-width text-primary show-list-tab text-weight-bolder text-subtitle1"
            @click="toggleContactPersons"
          >
            <q-icon
              name="help_outline"
              size="14px"
              class="q-ml-sm"
              tabindex="0"
              role="button"
              aria-label="Show/hide contact persons help"
            >
              <q-tooltip
                anchor="bottom right"
                self="top right"
                max-width="260px"
              >
                Click to {{ showContactPersons ? "collapse" : "expand" }} the
                contact persons list below. You can search by name, phone, or
                email.
              </q-tooltip>
            </q-icon></q-btn
          >
          <div
            v-if="showContactPersons"
            class="q-pa-md contact-persons-container"
          >
            <div class="row items-bottom justify-between">
              <div class="search-container q-pt-none">
                <q-input
                  v-model="searchQuery"
                  placeholder="Search contact person..."
                  square
                  dense
                  outlined
                  class="search-input"
                >
                  <template v-slot:prepend><q-icon name="search" /></template>
                  <template v-slot:append>
                    <q-icon
                      name="close"
                      @click="searchQuery = ''"
                      class="cursor-pointer"
                    />
                  </template>
                </q-input>
              </div>
              <q-btn
                flat
                dense
                icon="add"
                color="primary"
                class="text-weight-bold"
                @click="showAddContactPersonDialog = true"
                label="Add Contact Person"
              />
            </div>

            <div class="q-mt-sm">
              <!-- Header -->
              <div
                class="row row-col-header text-center text-weight-bold items-stretch line-height-1"
              >
                <div class="col header-bordered flex flex-center">Name</div>
                <div class="col header-bordered flex flex-center">
                  Contact Details
                </div>
                <div class="col header-bordered flex flex-center">Remarks</div>
              </div>

              <!-- Rows -->
              <template
                v-if="filteredContactPersons && filteredContactPersons.length"
              >
                <div
                  v-for="person in filteredContactPersons"
                  :key="person.id"
                  class="row row-col-row bg-white"
                >
                  <div class="col bordered">
                    <div>{{ person.name || "-" }}</div>
                    <div>
                      <q-btn
                        dense
                        outline
                        label="Update"
                        color="primary"
                        class="main-button q-px-sm line-height-1"
                        @click="openUpdateDialog(person, 'contact')"
                      />
                    </div>
                  </div>
                  <div class="col bordered">
                    <div>{{ person.contact_no1 || "-" }}</div>
                    <div v-if="person.contact_no2">
                      {{ person.contact_no2 }}
                    </div>
                    <div v-if="person.email">{{ person.email }}</div>
                  </div>
                  <div class="col bordered">{{ person.remarks || "-" }}</div>
                </div>
              </template>
              <template v-else>
                <div class="row row-col-row bg-white">
                  <div class="col-12 bordered text-center q-pa-sm">
                    No contact person
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-1-container text-subtitle1 q-py-lg">
      <div class="row justify-center">
        <span
          class="subheadline text-h6 text-weight-bolder text-uppercase text-center"
        >
          Important Remarks
        </span>
      </div>
      <div class="row">
        <div class="col all-border">
          <div
            class="text-subtitle1 text-weight-bold text-uppercase text-center"
          >
            Schedule Remarks:
          </div>
          <div class="q-pa-sm" style="white-space: pre-line">
            <span
              v-if="
                customerDetails.schedule_remarks &&
                customerDetails.schedule_remarks.trim()
              "
            >
              {{ customerDetails.schedule_remarks }}
            </span>
            <span v-else class="text-grey-6 flex flex-center">No remarks.</span>
          </div>
        </div>
        <div class="col all-border">
          <div
            class="text-subtitle1 text-weight-bold text-uppercase text-center"
          >
            Price Remarks:
          </div>
          <div class="q-pa-sm" style="white-space: pre-line">
            <span
              v-if="
                customerDetails.price_remarks &&
                customerDetails.price_remarks.trim()
              "
            >
              {{ customerDetails.price_remarks }}
            </span>
            <span v-else class="text-grey-6 flex flex-center">No remarks.</span>
          </div>
        </div>
        <div class="col all-border">
          <div
            class="text-subtitle1 text-weight-bold text-uppercase text-center"
          >
            Accounting Remarks:
          </div>
          <div class="q-pa-sm" style="white-space: pre-line">
            <span
              v-if="
                customerDetails.accounting_remarks &&
                customerDetails.accounting_remarks.trim()
              "
            >
              {{ customerDetails.accounting_remarks }}
            </span>
            <span v-else class="text-grey-6 flex flex-center">No remarks.</span>
          </div>
        </div>
        <div class="col all-border">
          <div
            class="text-subtitle1 text-weight-bold text-uppercase text-center"
          >
            Other Remarks:
          </div>
          <div class="q-pa-sm" style="white-space: pre-line">
            <span
              v-if="
                customerDetails.other_remarks &&
                customerDetails.other_remarks.trim()
              "
            >
              {{ customerDetails.other_remarks }}
            </span>
            <span v-else class="text-grey-6 flex flex-center">No remarks.</span>
          </div>
        </div>
      </div>
    </div>

    <div class="page-2-container page-2-exception">
      <div>
        <q-tabs
          v-model="activeTab"
          class="text-primary customer-element-tabs"
          align="left"
          narrow-indicator
          outside-arrows
          mobile-arrows
        >
          <q-tab
            name="logistics"
            label="Logistics History"
            icon="local_shipping"
          />
          <q-tab name="invoices" label="Invoice History" icon=" receipt" />
          <q-tab name="payments" label="Payment History" icon="payments" />
          <q-tab name="soa" label="SOA History" icon="receipt" />
          <q-tab name="complaints" label="Complaints History" icon="report_problem" />
          <q-tab
            name="pricelist"
            label="Customer Price List"
            icon="price_change"
          />
        </q-tabs>
        <q-separator />
        <q-tab-panels
          v-model="activeTab"
          class="customer-element-panels"
          animated
          keep-alive
        >
          <q-tab-panel name="logistics">
            <LogisticsTableByCustomer :customer-id="customerDetails.id" />
          </q-tab-panel>
          <q-tab-panel name="invoices">
            <InvoiceTableByCustomer :customer-id="customerDetails.id" />
          </q-tab-panel>
         <q-tab-panel name="payments" class="q-pa-none">
  <q-table
    :rows="paymentHistoryRows"
    :columns="paymentHistoryColumns"
    row-key="id"
    flat
    bordered
    :loading="paymentHistoryLoading"
    :pagination="{ rowsPerPage: 10, sortBy: 'created_at', descending: true }"
    no-data-label="No payment history found."
  >
    <template #top-right>
      <q-btn
        flat dense icon="refresh" label="Refresh" color="primary"
        @click="loadCustomerPaymentHistory"
        :loading="paymentHistoryLoading"
      />
    </template>

    <template #body-cell-created_at="props">
      <q-td :props="props">
        {{ new Date(props.row.created_at).toLocaleString('en-GB') }}
      </q-td>
    </template>

    <template #body-cell-order_no="props">
      <q-td :props="props">
        <a
          v-if="props.row.order_no && props.row.order_no !== '-'"
          href="javascript:void(0)"
          class="text-weight-bold text-primary"
          style="text-decoration: none"
          @click="openOrderTab(props.row.order_no)"
        >
          {{ props.row.order_no }}
        </a>
        <span v-else>-</span>
      </q-td>
    </template>

    <template #body-cell-amount="props">
      <q-td :props="props">
        <div :class="props.row.amount < 0 ? 'text-red' : 'text-green-9'" class="text-weight-bold">
          {{ formatCurrency(props.row.amount) }}
        </div>
      </q-td>
    </template>
  </q-table>
</q-tab-panel>
          <q-tab-panel name="soa">
            <SoaTableByCustomer :customer-id="customerDetails.id" />
          </q-tab-panel>
 <q-tab-panel name="complaints">
          <ComplaintsByCustomer :customer-id="customerDetails.id" />
        </q-tab-panel>
          <q-tab-panel name="pricelist">
            <ItemsManager
              :default-group-id="customerDetails.pricing_group_id"
            />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>

    <div class="page-1-container text-subtitle1">
      <div class="row justify-center">
        <span
          class="subheadline text-h6 text-weight-bolder text-uppercase text-center"
        >
          Other Information
        </span>
      </div>
      <ul>
        <li>
          <a>Customer Description / Rating</a>
        </li>
        <li>
          <a>Error Reports History (with view image)</a>
        </li>
        <li>
          <a>Outstanding Complaints History (with view image)</a>
        </li>
        <li>
          <a>Compensation History</a>
        </li>
      </ul>
    </div>

    <AddContactPersonDialog
      v-model="showAddContactPersonDialog"
      @contact-added="handleContactAdded"
    />
    <UpdateContactDialog
      v-model="showUpdateContactPersonDialog"
      @contact-updated="handleUpdated"
    />

    <q-dialog
      v-model="showCreateCollectionDialog"
      persistent
      transition-show="slide-down"
      transition-hide="slide-up"
    >
      <q-card class="input-dialog" style="min-width: 300em">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">
            Create Collection
          </div>
          <q-btn
            icon="close"
            flat
            dense
            round
            class="absolute-top-right q-ma-sm"
            @click="showCreateCollectionDialog = false"
          />
        </q-card-section>
        <q-card-section class="dialog-body">
          <!-- Inject the CreateCollectionTab Component Here -->
          <CreateCollectionTab />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            unelevated
            class="full-width"
            color="primary"
            @click="createCollection()"
            label="Create Collection"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <AddAddressDialog
      v-model="showAddAddressDialog"
      @address-added="handleAddressAdded"
    />
    <UpdateAddressDialog
      v-model="showUpdateAddressDialog"
      :initialAddress="selectedAddress"
      @address-updated="handleUpdated"
    />

    <DeleteConfirmationDialog
      :isOpen="showDeleteDialog"
      :title="deleteDialogTitle"
      :message="deleteDialogMessage"
      @update:isOpen="showDeleteDialog = $event"
      @confirm="deleteItem"
    />
    <UpdateCustomerDialog
      v-model="showUpdateCustomerDialog"
      :customerData="selectedCustomer"
      @customer-updated="handleCustomerUpdated"
    />

    <q-dialog v-model="showUpdateCreditsDialog">
      <q-card style="min-width: 1000px">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">
            Update Credits
          </div>
          <q-btn
            icon="close"
            flat
            dense
            round
            class="absolute-top-right q-ma-sm"
            @click="showUpdateCreditsDialog = false"
          />
        </q-card-section>

        <q-card-section class="dialog-body text-subtitle1">
          <div class="row text-center">
            <div class="col all-border bg-yellow-2">
              <div>Online Package Credits</div>
              <div class="text-weight-bold text-uppercase text-h6">
                {{ customerCredits.online_package }}
              </div>
            </div>
            <div class="col all-border">
              <div>Other Credits</div>
              <div class="text-weight-bold text-uppercase text-h6">
                {{ customerCredits.other_credits }}
              </div>
            </div>
            <div class="col all-border bg-green-2">
              <div>Total Credits</div>
              <div class="text-weight-bold text-uppercase text-h6">
                {{ creditsTotal }}
              </div>
            </div>
          </div>

          <q-separator class="q-my-sm" />

          <div class="row q-col-gutter-x-md">
            <div class="col-6">
              <div class="dialog-label">
                Add credits to<span class="dialog-asterisk">*</span>
              </div>
              <q-select
                v-model="selectedCreditType"
                :options="creditTypes"
                outlined
                dense
                class="dialog-inputs"
                :rules="[(val) => !!val || 'Credit Type is required']"
              />
            </div>
            <div class="col-6">
              <div class="dialog-label">
                Credit Amount<span class="dialog-asterisk">*</span>
              </div>
              <q-input
                v-model.number="creditAmount"
                type="number"
                outlined
                dense
                class="dialog-inputs"
                :rules="[
                  (val) => !!val || 'Credit Amount is required',
                  (val) => val > 0 || 'Must be greater than 0',
                ]"
              />
            </div>
          </div>
          <div class="q-mb-sm">
            <div class="dialog-label q-mb-xs">Remarks</div>
            <q-input
              v-model="creditRemarks"
              type="textarea"
              outlined
              dense
              class="dialog-inputs"
            />
          </div>

          <q-btn
            unelevated
            color="primary"
            label="Top Up"
            class="full-width q-my-sm"
            @click="topUpCredits"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showCreditsHistoryDialog" persistent>
      <q-card style="min-width: 800px">
        <q-card-section class="dialog-header">
          <div class="text-body1 text-uppercase text-weight-bold">
            Credits History
          </div>
          <q-btn
            icon="close"
            flat
            dense
            round
            class="absolute-top-right q-ma-sm"
            @click="showCreditsHistoryDialog = false"
          />
        </q-card-section>

        <q-card-section class="dialog-body">
          <q-table
            :rows="creditHistoryWithNames"
            :columns="[
              {
                name: 'credit_type',
                label: 'Type',
                align: 'center',
                field: 'credit_type',
              },
              {
                name: 'amount',
                label: 'Amount',
                align: 'center',
                field: 'amount',
                format: (val) => parseFloat(val).toFixed(2),
              },
              {
                name: 'remarks',
                label: 'Remarks',
                align: 'center',
                field: 'remarks',
              },
              {
                name: 'created_at',
                label: 'Date',
                align: 'center',
                field: 'created_at',
                format: (val) => new Date(val).toLocaleString(),
              },
              {
                name: 'created_by_name',
                label: 'Created By',
                align: 'center',
                field: 'created_by_name',
              },
            ]"
            row-key="id"
            flat
            bordered
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <GenerateSoaComponent
      v-model="showSoaDialog"
      :customer-id="customerDetails.id"
      :rows="rows"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useQuasar } from "quasar";

import { useTransactionStore } from "@/stores/transactionStore";
import AddContactPersonDialog from "@/components/dialogs/AddContactDialog.vue";
import AddAddressDialog from "@/components/dialogs/AddAddressDialog.vue";
import UpdateContactDialog from "@/components/dialogs/UpdateContactDialog.vue";
import UpdateAddressDialog from "@/components/dialogs/UpdateAddressDialog.vue";
import DeleteConfirmationDialog from "@/components/dialogs/DeleteConfirmationDialog.vue";
import UpdateCustomerDialog from "@/components/dialogs/UpdateCustomerDialog.vue";
import CreateCollectionTab from "@/components/CreateCollectionTab.vue";

import LogisticsTableByCustomer from "@/components/LogisticsTableByCustomer.vue";
import InvoiceTableByCustomer from "@/components/InvoiceTableByCustomer.vue";
import SoaTableByCustomer from "@/components/SoaTableByCustomer.vue";
import ComplaintsByCustomer from "@/components/ComplaintsByCustomer.vue";
import ItemsManager from "@/components/ItemsManager.vue";
import GenerateSoaComponent from "@/components/GenerateSoaComponent.vue";
import Chart from "chart.js/auto";
import { onBeforeUnmount } from "vue";
import ChartDataLabels from "chartjs-plugin-datalabels";
Chart.register(ChartDataLabels);

onBeforeUnmount(() => {
  if (paymentsChart) {
    paymentsChart.destroy();
    paymentsChart = null;
  }
});

const paymentsPieRef = ref(null);
let paymentsChart = null;

const transactionStore = useTransactionStore();
const $q = useQuasar();

const route = useRoute();

// State management
const showAddresses = ref(false);
const showContactPersons = ref(false);
const showAddContactPersonDialog = ref(false);
const showUpdateContactPersonDialog = ref(false);
const showCreateCollectionDialog = ref(false);
const showAddAddressDialog = ref(false);
const showUpdateAddressDialog = ref(false);
const showDeleteDialog = ref(false);
const showUpdateCustomerDialog = ref(false);

// Deletion state variables
const deleteTarget = ref(null);
const deleteType = ref("");
const deleteDialogTitle = ref("");
const deleteDialogMessage = ref("");

const customerDetails = ref({});
const customerCredits = ref({});
const addresses = ref([]);
const contactPersons = ref([]);
const selectedAddress = ref({});
const searchQuery = ref("");
const activeTab = ref("logistics");

const ordersByCustomer = ref([]);
const paidAmount = ref(0);
const totalAmount = ref(0);
const unpaidAmount = ref(0);

const paymentHistoryRows = ref([]);
const paymentHistoryLoading = ref(false);

const paymentHistoryColumns = [
  { name: 'created_at', label: 'Date', field: 'created_at', align: 'left', sortable: true },
  { name: 'order_no', label: 'Order No', field: 'order_no', align: 'left', sortable: true },
  { name: 'payment_type', label: 'Type', field: 'payment_type', align: 'left', sortable: true },
  { name: 'reference_no', label: 'Ref No', field: 'reference_no', align: 'left' },
  { name: 'remarks', label: 'Remarks', field: 'remarks', align: 'left' },
  { name: 'amount', label: 'Amount', field: 'amount', align: 'right', sortable: true },
];

onMounted(async () => {
  await loadCustomerData();
  await transactionStore.setSelectedCustomer(customerDetails.value);
});

// Helper function for formatting
const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
};
const formatMoneyCompact = (n) => {
  const num = Number(n) || 0;
  if (Math.abs(num) >= 100000) {
    return `$${new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num)}`;
  }
  return `$${num.toFixed(2)}`;
};
const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const formatCurrency = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    toNumber(v)
  );

const loadCustomerData = async () => {
  const customerId = route.params.id;
  customerDetails.value = await transactionStore.fetchCustomerDetailsById(
    customerId
  );
  customerCredits.value = await transactionStore.fetchCustomerCreditsById(
    customerId
  );
  addresses.value = await transactionStore.fetchAddressesForCustomer(
    customerId
  );
  contactPersons.value = await transactionStore.fetchContactPersons(customerId);
  ordersByCustomer.value = await transactionStore.fetchOrdersByCustomerId(
    customerId
  );
  computePaymentsSummary();
  renderPaymentsChart();
  await loadCustomerPaymentHistory();
};

const loadCustomerPaymentHistory = async () => {
  const customerId = route.params.id;
  if (!customerId) return;

  try {
    paymentHistoryLoading.value = true;

    // 1. Fetch data using the new optimized store action
    const results = await transactionStore.fetchCustomerPaymentHistory(customerId);

    // 2. Map the nested structure to a flat format for the table
    // Structure is: history -> order_payments -> orders -> order_no
    paymentHistoryRows.value = results.map((p) => {
      // Safely access the nested order number
      // Note: Supabase might return 'orders' as an object (single relation) or array depending on schema setup.
      // We handle the object access here assuming standard Many-to-One.
      
      const paymentParent = p.order_payments;
      const orderGrandParent = Array.isArray(paymentParent?.orders) 
        ? paymentParent.orders[0] 
        : paymentParent?.orders;

      return {
        ...p,
        order_no: orderGrandParent?.order_no || '-',
        amount: Number(p.amount) || 0
      };
    });

  } catch (err) {
    console.error("Error loading payment history:", err);
    $q.notify({ type: 'negative', message: 'Failed to load payment history' });
  } finally {
    paymentHistoryLoading.value = false;
  }
};
function computePaymentsSummary() {
  let total = 0;
  let paid = 0;

  for (const row of ordersByCustomer.value || []) {
    const orderId =
      row?.orders?.id ?? row?.orders?.order_id ?? row?.order_id ?? "unknown";
    const opRaw = row?.orders?.order_payments;

    let t = 0;
    let p = 0;

    if (Array.isArray(opRaw)) {
      // Supabase many-to-one returns array
      t = opRaw.reduce((mx, it) => Math.max(mx, toNumber(it?.total_amount)), 0);
      p = opRaw.reduce((s, it) => s + toNumber(it?.paid_amount), 0);
    } else {
      t = toNumber(opRaw?.total_amount);
      p = toNumber(opRaw?.paid_amount);
    }

    // clamp overpayment per order
    const pClamped = Math.min(p, t);
    total += t;
    paid += pClamped;
  }

  totalAmount.value = round2(total);
  paidAmount.value = round2(paid);
  unpaidAmount.value = round2(Math.max(total - paid, 0));
}

watch(
  ordersByCustomer,
  () => {
    computePaymentsSummary();
    renderPaymentsChart();
  },
  { deep: true }
);
watch([paidAmount, totalAmount], () => {
  renderPaymentsChart();
});
// Computed filter for contacts
const filteredContactPersons = computed(() => {
  const q = (searchQuery.value || "").toString().trim().toLowerCase();
  if (!q) return contactPersons.value;

  const norm = (v) => (v == null ? "" : String(v)).toLowerCase();

  return (contactPersons.value || []).filter((p) => {
    const fields = [p?.name, p?.contact_no1, p?.contact_no2, p?.email].map(
      norm
    );
    return fields.some((f) => f.includes(q));
  });
});

const openDeleteDialog = (item, type) => {
  deleteTarget.value = item;
  deleteType.value = type;
  showDeleteDialog.value = true;

  if (type === "contact") {
    deleteDialogTitle.value = "Delete Contact Person";
    deleteDialogMessage.value =
      "Are you sure you want to delete this contact person?";
  } else {
    deleteDialogTitle.value = "Delete Address";
    deleteDialogMessage.value = "Are you sure you want to delete this address?";
  }
};

const deleteItem = async () => {
  if (!deleteTarget.value) return;

  try {
    if (deleteType.value === "contact") {
      await transactionStore.deleteContactPerson(deleteTarget.value.id);
      await loadCustomerData();
    } else if (deleteType.value === "address") {
      await transactionStore.deleteCustomerAddress(deleteTarget.value.id);
      await loadCustomerData();
    }

    $q.notify({
      type: "positive",
      message: `${
        deleteType.value === "contact" ? "Contact person" : "Address"
      } deleted successfully.`,
    });

    showDeleteDialog.value = false;
  } catch (error) {
    console.error(`Error deleting ${deleteType.value}:`, error);
    $q.notify({
      type: "negative",
      message: `Failed to delete ${deleteType.value}. Please try again.`,
    });
  }
};

const openCollectionDialog = (customerDetails) => {
  transactionStore.setSelectedCustomer(customerDetails);
  showCreateCollectionDialog.value = true;
};

async function createCollection() {
  try {
    // Call the store function to create the collection
    const logisticsId = await transactionStore.createLogistics();
    await transactionStore.createCollection(logisticsId);
    await transactionStore.createDelivery(logisticsId);

    // Show success dialog
    $q.dialog({
      title: "Collection Created",
      message: "Collection created successfully!",
      ok: "OK",
      color: "positive",
    });

    // Reset the fields
    transactionStore.selectedCollectionContact = null;
    transactionStore.selectedDeliveryContact = null;
    transactionStore.selectedCollectionAddress = null;
    transactionStore.selectedDeliveryAddress = null;
    transactionStore.selectedCollectionDriver = null;
    transactionStore.selectedDeliveryDriver = null;
    transactionStore.collectionRemarks = "";
    transactionStore.deliveryRemarks = "";

    // Close the dialog
    showCreateCollectionDialog.value = false;
  } catch (error) {
    console.error("Error submitting collection:", error.message);

    // Show error dialog
    $q.dialog({
      title: "Error",
      message: "Failed to create collection. Please try again.",
      ok: "Close",
      color: "negative",
    });
  }
}

// Toggles
const toggleAddresses = () => (showAddresses.value = !showAddresses.value);
const toggleContactPersons = () =>
  (showContactPersons.value = !showContactPersons.value);

const handleContactAdded = loadCustomerData;
const handleAddressAdded = loadCustomerData;

const openUpdateDialog = (item, type) => {
  if (type === "address") {
    transactionStore.setSelectedAddress(item);
    showUpdateAddressDialog.value = true;
  } else if (type === "contact") {
    transactionStore.setSelectedContact(item);
    showUpdateContactPersonDialog.value = true;
  }
};

const handleUpdated = async () => {
  try {
    await loadCustomerData(); // Refresh both addresses and contacts

    showUpdateAddressDialog.value = false;
    showUpdateContactPersonDialog.value = false;

    console.log("Customer updated successfully.");
  } catch (error) {
    console.error("Error updating item:", error);
  }
};

const openUpdateCustomerDialog = (customer) => {
  transactionStore.setSelectedCustomer(customer);
  showUpdateCustomerDialog.value = true;
};

const handleCustomerUpdated = async () => {
  await loadCustomerData();
  showUpdateCustomerDialog.value = false;
  await transactionStore.loadCustomers();
};

const creditsTotal = computed(() => {
  const credits = customerCredits.value || {};
  return (credits.online_package || 0) + (credits.other_credits || 0);
});

const showUpdateCreditsDialog = ref(false);

const openUpdateCreditsDialog = () => {
  showUpdateCreditsDialog.value = true;
};

const selectedCreditType = ref(null);
const creditAmount = ref(0);
const creditRemarks = ref("");

const creditTypes = [
  "Online Package",
  "Free Wash",
  "Bank Transfer",
  "Over Payment",
  "Other Credits",
];

const topUpCredits = async () => {
  if (!selectedCreditType.value || creditAmount.value <= 0) {
    $q.notify({
      type: "negative",
      message: "Please select credit type and enter a valid amount.",
    });
    return;
  }

  try {
    await transactionStore.topUpCredits({
      customerId: customerDetails.value.id,
      type: selectedCreditType.value,
      amount: creditAmount.value,
      remarks: creditRemarks.value,
    });

    await loadCustomerData();
    showUpdateCreditsDialog.value = false;
    selectedCreditType.value = null;
    creditAmount.value = 0;
    creditRemarks.value = "";

    $q.notify({
      type: "positive",
      message: "Credits successfully topped up.",
    });
  } catch (error) {
    console.error("Error topping up credits:", error);
    $q.notify({
      type: "negative",
      message: "Failed to top up credits. Try again.",
    });
  }
};

const creditHistory = ref([]);
const showCreditsHistoryDialog = ref(false);
const userNamesMap = ref({});

const creditHistoryWithNames = computed(() => {
  return creditHistory.value.map((entry) => ({
    ...entry,
    created_by_name: userNamesMap.value[entry.created_by] || entry.created_by,
  }));
});

const openCreditsHistoryDialog = async (customerCreditsId) => {
  try {
    creditHistory.value =
      await transactionStore.fetchCustomerCreditsHistoryById(customerCreditsId);
    await fetchCreatorNames();
    showCreditsHistoryDialog.value = true;
  } catch (error) {
    console.error("Failed to load credit history:", error);
    $q.notify({ type: "negative", message: "Failed to load credit history." });
  }
};

const fetchCreatorNames = async () => {
  const ids = [...new Set(creditHistory.value.map((h) => h.created_by))];
  const nameMap = {};

  await Promise.all(
    ids.map(async (id) => {
      const name = await transactionStore.getProfileName(id);
      nameMap[id] = name;
    })
  );

  userNamesMap.value = nameMap;
};

const toBoolean = (v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string")
    return ["1", "true", "yes", "y"].includes(v.trim().toLowerCase());
  return false;
};

const isActive = computed(() => toBoolean(customerDetails.value?.is_active));
const isActiveLabel = computed(() => (isActive.value ? "active" : "inactive"));
const isActiveClass = computed(() =>
  isActive.value ? "text-green-9" : "text-red-8"
);

const showSoaDialog = ref(false);

function openSoaDialog() {
  if (!customerDetails.value?.id) {
    $q.notify({ type: "negative", message: "Customer not found." });
    return;
  }
  showSoaDialog.value = true;
}
function getPaymentsDataset() {
  // guard against NaN
  const paid = Number(paidAmount.value) || 0;
  const total = Number(totalAmount.value) || 0;
  const unpaid = Math.max(total - paid, 0);

  return {
    labels: ["Unpaid", "Paid"],
    data: [unpaid, paid],
    // optionalconsistent colors
    colors: ["#E55E40", "#84B04F"],
  };
}

function renderPaymentsChart() {
  const ctx = paymentsPieRef.value;
  if (!ctx) return;

  const ds = getPaymentsDataset();

  // (re)create chart
  if (paymentsChart) {
    paymentsChart.destroy();
  }

  const centerTextPlugin = {
    id: "centerText",
    afterDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      const ds = chart.data.datasets?.[0]?.data || [];
      const total = ds.reduce((a, b) => a + (Number(b) || 0), 0);

      const label = "TOTAL";
      const value = `$${(Number(total) || 0).toFixed(2)}`;

      const x = (chartArea.left + chartArea.right) / 2;
      const y = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "600 12px Inter, system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText(label, x, y - 10);
      ctx.font = "700 14px Inter, system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText(value, x, y + 12);
      ctx.restore();
    },
  };

  paymentsChart = new Chart(ctx, {
    type: "doughnut", // <- was "pie"
    data: {
      labels: ds.labels,
      datasets: [{ data: ds.data, backgroundColor: ds.colors, borderWidth: 1 }],
    },
    options: {
      responsive: true,
      cutout: "40%", // <- donut hole
      plugins: {
        legend: { position: "bottom" },
        tooltip: { enabled: false },
        datalabels: {
          color: "#FFFFFF", // <- white labels on slices
          formatter: (value) => formatMoneyCompact(value),
          font: { weight: "bold" },
          anchor: "center",
          align: "center",
          offset: 0,
          clamp: true,
          display: (ctx) =>
            Number(ctx?.dataset?.data?.[ctx.dataIndex] ?? 0) > 0,
        },
      },
    },
    plugins: [centerTextPlugin],
  });
}
</script>

<style scoped>
.p-exception {
  padding: 0 !important;
}

.p-min {
  padding: 2rem !important;
}

.page-2-exception {
  padding: 10px !important;
}
</style>
