<template>
  <div class="preview row">
    <!-- Left Container -->
    <div class="col-6 preview-left-container">
      <q-card class="order-container" ref="orderContainer">
        <!-- Header Section -->
        <q-card-section>
          <div class="banner bg-blue-grey text-white q-pa-md">
            <div class="flex justify-between">
              <div class="text-left">
                <div class="text-h6 text-weight-bolder">COTTON CARE</div>
                <div class="text-caption">
                  53 Ubi Ave 1 #01-29 Paya Ubi Ind. Park Singapore 408934
                </div>
                <div class="text-caption">9029 6919 / 6747 7844</div>
                <div class="text-caption">enquire@cottoncare.com.sg</div>
              </div>
              <div class="text-right">
                <div class="text-caption">
                  <div
                    class="text-h6 text-uppercase text-weight-bolder order-box"
                  >
                    Order Slip
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Customer and Order Details -->
        <div class="row slip-card justify-between text-p">
          <div class="col">
            <div class="text-slip-row">
              Customer Name:
              <span
                ><a
                  class="text-summary text-weight-bold"
                  @click.prevent="openCustomerTab(customer.id)"
                  >{{ customer.name }}</a
                ></span
              >
            </div>
            <div class="text-slip-row">
              Customer Type:
              <span class="text-summary">{{ customer?.type || "N/A" }}</span>
            </div>
            <div class="text-slip-row">
              Contact Nos:
              <span class="text-summary"
                >{{ customer?.contact_no1 || "-" }} /
                {{ customer?.contact_no2 || "-" }}</span
              >
            </div>
            <div class="text-slip-row">
              Email Address:
              <span class="text-summary">{{ customer?.email || "N/A" }}</span>
            </div>
          </div>
          <div class="col">
            <div class="text-slip-row">
              Order No:
              <span class="text-summary">{{ order?.order_no || "N/A" }}</span>
            </div>
            <div class="text-slip-row">
              Order Date:
              <span class="text-summary">{{ formattedOrderDate }}</span>
            </div>
            <div class="text-slip-row">
              Ready By:
              <q-input
                v-model="order.ready_by"
                type="date"
                outlined
                dense
                placeholder="Select Ready By Date"
                class="q-mb-xs bg-white"
              />
            </div>
          </div>
        </div>

        <!-- Add Contact Person Button -->
        <q-btn
          label="Add Contact Person"
          color="primary"
          icon="person_add"
          size="sm"
          flat
          class="q-ml-sm"
          @click="openAddContactPersonDialog"
        />
        <!-- Add Address Button -->
        <q-btn
          label="Add Address"
          color="primary"
          icon="add_home"
          size="sm"
          flat
          class="q-ml-sm"
          @click="openAddAddressDialog"
        />
        <!-- Collection and Delivery Details -->
        <div class="row summary-header text-p">
          <div class="col slip-card">
            <div class="text-p text-center text-weight-bold text-uppercase">
              Collection Details
            </div>
            <q-separator class="q-my-xs" />
            <div class="text-slip-row">
              Contact Person:
              <q-select
                v-model="collection.contactPerson"
                :options="contactOptions"
                option-label="name"
                option-value="id"
                outlined
                dense
                clearable
                class="q-mb-xs bg-white"
                label="Select Collection Contact Person"
              />
            </div>
            <div class="text-slip-row">
              Contact Nos:
              <q-input
                v-model="formattedCollectionContactNos"
                disable
                outlined
                dense
                class="q-mb-xs bg-light-grey"
              />
            </div>
            <div class="text-slip-row">
              Address:
              <q-select
                v-model="collection.address"
                :options="addressOptions"
                option-label="label"
                option-value="id"
                outlined
                dense
                clearable
                class="q-mb-xs bg-white"
                label="Select Collection Address"
              />
            </div>

            <div class="text-slip-row">
              Date From:
              <q-input
                v-model="collection.date_from"
                outlined
                dense
                type="date"
                placeholder="Collection Date From"
                class="q-mb-xs bg-white"
              />
            </div>
            <div class="text-slip-row">
              Date To:
              <q-input
                v-model="collection.date_to"
                outlined
                dense
                type="date"
                placeholder="Collection Date To"
                class="q-mb-xs bg-white"
              />
            </div>
          </div>
          <div class="col slip-card">
            <div class="text-p text-center text-weight-bold text-uppercase">
              Delivery Details
            </div>
            <q-separator class="q-my-xs" />
            <div class="text-slip-row">
              Contact Person:
              <q-select
                v-model="delivery.contactPerson"
                :options="contactOptions"
                option-label="name"
                option-value="id"
                outlined
                dense
                class="q-mb-xs bg-white"
                label="Select Delivery Contact Person"
              />
            </div>
            <div class="text-slip-row">
              Contact Nos:
              <q-input
                v-model="formattedDeliveryContactNos"
                disable
                outlined
                dense
                class="q-mb-xs bg-light-grey"
              />
            </div>
            <div class="text-slip-row">
              Address:
              <q-select
                v-model="delivery.address"
                :options="addressOptions"
                option-label="label"
                option-value="id"
                outlined
                dense
                class="q-mb-xs bg-white"
                label="Select Delivery Address"
              />
            </div>

            <div class="text-slip-row">
              Date From:
              <q-input
                v-model="delivery.date_from"
                type="date"
                outlined
                dense
                placeholder="Select Date From"
                class="q-mb-xs bg-white"
              />
            </div>
            <div class="text-slip-row">
              Date To:
              <q-input
                v-model="delivery.date_to"
                type="date"
                outlined
                dense
                placeholder="Select Date To"
                class="q-mb-xs bg-white"
              />
            </div>
          </div>
        </div>
        <!-- Update Button -->
        <div class="row justify-center q-mb-md">
          <q-btn
            label="Update Ready By, Collection, and Delivery Details"
            color="primary"
            icon="update"
            @click="updateReadyByCollectionAndDelivery"
          />
        </div>
        <q-separator />
        <!-- Transaction Table -->
        <div class="transaction-summary">
          <!-- Add Row Button Aligned Right -->
          <div class="add-row-button text-right q-mb-md">
            <q-btn
              label="Add Transactions"
              color="primary"
              icon="add"
              @click="openAddTransactionDialog"
            />
          </div>

          <div class="row row-col-header order-header">
            <div class="col col-3 text-weight-bold bordered">Item</div>
            <div class="col col-2 text-weight-bold bordered">Process</div>
            <div class="col col-2 text-weight-bold bordered">Price</div>
            <div class="col col-1 text-weight-bold bordered">Pcs</div>
            <div class="col col-1 text-weight-bold bordered">Qty</div>
            <div class="col col-2 text-weight-bold bordered">Subtotal</div>
            <div class="col col-1 text-weight-bold bordered"></div>
          </div>

          <div v-if="transactions.length > 0">
            <div
              v-for="(item, index) in transactions"
              :key="index"
              class="row row-col-row order-row"
            >
              <div class="col col-3 bordered">
                <textarea
                  type="text"
                  v-model="transactions[index].item_name"
                  class="editable-field"
                  placeholder="Item Name"
                  @input="autoResize($event)"
                ></textarea>
              </div>
              <div class="col col-2 bordered">
                <input
                  type="text"
                  v-model="transactions[index].process"
                  class="editable-field"
                  placeholder="Process"
                />
              </div>
              <div class="col col-2 bordered">
                <input
                  type="number"
                  v-model.number="transactions[index].price"
                  class="editable-field"
                  placeholder="Price"
                />
              </div>
              <div class="col col-1 bordered">
                <input
                  type="number"
                  v-model.number="transactions[index].pieces"
                  class="editable-field"
                  placeholder="Pcs"
                />
              </div>
              <div class="col col-1 bordered">
                <input
                  type="number"
                  v-model.number="transactions[index].quantity"
                  class="editable-field"
                  placeholder="Qty"
                />
              </div>
              <div class="col col-2 bordered">
                <input
                  type="number"
                  v-model.number="transactions[index].subtotal"
                  class="editable-field"
                  placeholder="Subtotal"
                  readonly
                />
              </div>
              <!-- Delete Button Column -->
              <div class="col col-1 text-center bordered">
                <q-btn
                  flat
                  class="trash-icon"
                  color="negative"
                  icon="delete"
                  @click="openDeleteTransactionDialog(index, item.id)"
                />
              </div>
            </div>
          </div>

          <div v-else class="text-center text-grey q-my-md">
            No items added to the list.
          </div>

          <div class="row row-col-footer order-footer">
            <div class="col col-5 text-weight-bold text-uppercase"></div>
            <div class="col col-2 text-weight-bold text-uppercase bordered">
              Total
            </div>
            <div class="col col-1 text-weight-bold bordered">
              {{ totalPcs }}
            </div>
            <div class="col col-1 text-weight-bold bordered">
              {{ totalQty }}
            </div>
            <div class="col col-2 text-weight-bold bordered">
              ${{ totalSubtotal }}
            </div>
            <div class="col col-1 text-weight-bold bordered"></div>
          </div>
        </div>
        <!-- Update Transactions Button -->
        <div class="row justify-center q-pb-md">
          <q-btn
            label="Update Transactions"
            color="primary"
            icon="update"
            @click="updateTransactions"
          />
        </div>
      </q-card>
    </div>

    <!-- Right Container -->
    <div class="col-6 preview-right-container">
      <!-- Download PDF Button -->
      <!-- <q-btn
        flat
        color="primary"
        class="text-white q-mb-md q-mt-md"
        @click="downloadOrderPDF"
        label="Download PDF"
      /> -->

      <q-card flat class="preview-card q-mt-md">
        <div class="text-p text-center text-uppercase text-weight-bold q-mb-sm">
          Other Information
        </div>
        <div class="row q-mb-sm items-center">
          <div class="col-4 text-right q-mr-sm">
            <div>Job Type / Urgency:</div>
          </div>
          <div class="col">
            <q-input
              v-model="order.job_type"
              filled
              placeholder="Enter Job Type / Urgency"
              dense
            />
          </div>
        </div>
        <div class="row q-mb-sm items-center">
          <div class="col-4 text-right q-mr-sm">
            <div>Job Sub-Type:</div>
          </div>
          <div class="col">
            <q-input
              v-model="order.job_subtype"
              filled
              placeholder="Enter Job Sub-Type"
              dense
            />
          </div>
        </div>
        <div class="row q-mb-sm items-center">
          <div class="col-4 text-right q-mr-sm">
            <div>Goods Status:</div>
          </div>
          <div class="col">
            <q-input
              v-model="order.goods_status"
              filled
              placeholder="Enter Goods Status"
              dense
            />
          </div>
        </div>
        <div class="row q-mb-sm items-center">
          <div class="col-4 text-right q-mr-sm">
            <div>Logistics Status:</div>
          </div>
          <div class="col">
            <q-input
              v-model="order.logistics_status"
              filled
              placeholder="Enter Logistics Status"
              dense
            />
          </div>
        </div>
        <div class="row q-mb-sm items-center">
          <div class="col-4 text-right q-mr-sm">
            <div>Payment Status:</div>
          </div>
          <div class="col">
            <q-input
              v-model="order.payment_status"
              filled
              placeholder="Enter Payment Status"
              dense
            />
          </div>
        </div>
        <div class="row q-mb-sm items-center">
          <div class="col-4 text-right q-mr-sm">
            <div>Payment Type:</div>
          </div>
          <div class="col">
            <q-input
              v-model="customer.payment_type"
              filled
              placeholder="Enter Payment Type"
              dense
            />
          </div>
        </div>
        <div class="row q-mb-sm items-center">
          <div class="col-4 text-right q-mr-sm">
            <div>No. of Packets / Hangers:</div>
          </div>
          <div class="col">
            <q-input
              v-model="order.no_packets_hangers"
              filled
              placeholder="Enter No. of Packets / Hangers"
              dense
            />
          </div>
        </div>
        <div class="row justify-center q-my-md">
          <q-btn
            label="Update Other Information"
            color="primary"
            icon="update"
            @click="updateOtherInformation"
          />
        </div>
      </q-card>
      <!-- Collapsible Header -->
      <div
        class="row showhidetab text-p text-center text-uppercase text-weight-bold q-mb-sm"
      >
        <q-btn
          dense
          flat
          class="q-ml-md full-width"
          icon="keyboard_arrow_down"
          :icon="showInstructions ? 'arrow_up' : 'arrow_down'"
          @click="toggleInstructions"
          label="List of Instructions"
        />
      </div>
      <div v-show="showInstructions">
        <!-- Instructions Section -->
        <q-card flat class="preview-card">
          <div
            class="text-p text-center text-uppercase text-weight-bold q-mb-sm"
          >
            Instructions
          </div>
          <div class="row q-gutter-x-md">
            <div class="col-auto">
              <div>Enter Instructions:</div>
              <div class="q-pl-sm q-pt-sm">
                <div class="text-p">
                  <span>
                    <q-radio
                      v-model="instructionsType"
                      checked-icon="task_alt"
                      unchecked-icon="panorama_fish_eye"
                      val="onetime"
                      dense
                    />
                  </span>
                  One-time
                </div>
                <div class="text-p">
                  <span>
                    <q-radio
                      v-model="instructionsType"
                      checked-icon="task_alt"
                      unchecked-icon="panorama_fish_eye"
                      val="recurring"
                      dense
                    />
                  </span>
                  Recurring
                </div>
              </div>
            </div>
            <div class="col">
              <textarea
                v-model="instructionsDesc"
                type="textarea"
                class="q-pa-sm instructions-desc full-width"
                placeholder="Enter instruction here..."
              />
              <div class="q-gutter-sm">
                <q-checkbox
                  v-model="instructionsTo"
                  val="cleaning"
                  label="Cleaning"
                  color="teal"
                />
                <q-checkbox
                  v-model="instructionsTo"
                  val="packing"
                  label="Packing"
                  color="orange"
                />
                <q-checkbox
                  v-model="instructionsTo"
                  val="pickingsending"
                  label="Picking/Sending"
                  color="red"
                />
                <q-checkbox
                  v-model="instructionsTo"
                  val="admin"
                  label="Admin"
                  color="cyan"
                />
              </div>
              <q-btn
                color="primary"
                label="Add Instruction"
                class="float-right q-mt-sm"
                @click="addInstruction"
              />
            </div>
          </div>
        </q-card>

        <!-- Instructions Display -->
        <q-card flat class="preview-card q-mt-md">
          <!-- Check if instructions array exists and has items -->
          <div v-if="instructions && instructions.length > 0">
            <div
              v-for="(instruction, index) in instructions"
              :key="instruction.id"
              class="row justify-between per-instruction q-mb-sm"
            >
              <div>
                <!-- Instruction ID and description -->
                <div class="text-p q-ml-md">
                  <span class="text-weight-bold">#{{ instruction.id }}:</span>
                  {{ instruction.description || "No description provided." }}
                </div>

                <!-- Instruction chips -->
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
                  <span v-if="instruction.to && instruction.to.length > 0">
                    |
                  </span>
                  <q-chip
                    v-for="section in instruction.to || []"
                    :key="section"
                    :color="getSectionColor(section)"
                    text-color="white"
                    class="instructions-to"
                  >
                    {{ formatSectionLabel(section) }}
                  </q-chip>
                </div>
              </div>
              <q-btn
                dense
                flat
                icon="delete"
                color="red"
                @click="
                  openDeleteInstructionDialog(instruction.id, instruction.type)
                "
              />
            </div>
          </div>
          <div v-else class="text-center text-grey">No instructions added.</div>
        </q-card>
      </div>
      <div
        class="row showhidetab text-p text-center text-uppercase text-weight-bold q-mb-sm"
      >
        <q-btn
          dense
          flat
          class="q-ml-md full-width"
          icon="keyboard_arrow_down"
          :icon="showReports ? 'arrow_up' : 'arrow_down'"
          @click="toggleReports"
          label="List of Error Reports"
        />
      </div>
      <!-- Reports Section -->
      <div v-show="showReports">
        <!-- Collapsible Header -->

        <q-card flat class="preview-card">
          <div
            class="text-p text-center text-uppercase text-weight-bold q-mb-sm"
          >
            Error Reporting
          </div>
          <div class="q-px-md">
            <div class="row items-center q-mb-sm">
              <div class="col-4">Select Category:</div>
              <div class="col-8">
                <q-select
                  square
                  dense
                  outlined
                  class="bg-white"
                  :options="reportCategories"
                  v-model="selectedCategory"
                  label="Select Category"
                  @update:model-value="updateSubCategories"
                />
              </div>
            </div>
            <div class="row items-center q-mb-sm">
              <div class="col-4">Select Sub-category:</div>
              <div class="col-8">
                <q-select
                  square
                  dense
                  outlined
                  class="bg-white"
                  :options="filteredSubCategories"
                  v-model="selectedSubCategory"
                  label="Select Sub-category"
                />
              </div>
            </div>

            <div class="row items-center q-mb-sm">
              <div class="col-4">Enter Item Description:</div>
              <div class="col-8">
                <textarea
                  v-model="reportDesc"
                  type="textarea"
                  class="q-pa-sm report-desc full-width"
                  placeholder="Enter item description here..."
                />
              </div>
            </div>
            <div class="row items-center q-mb-sm">
              <div class="col-4">Attach Photo (Optional):</div>
              <div class="col-8">
                <!-- Capture Photo Button -->
                <q-btn
                  outline
                  color="primary"
                  label="Capture Photo"
                  dense
                  class="outline-btn q-mt-sm"
                  @click="openCameraDialog"
                />
                <!-- Remove Photo Button -->
                <q-btn
                  dense
                  flat
                  icon="delete"
                  color="red"
                  v-if="uploadedPhotoUrl"
                  @click="clearUploadedPhoto"
                  label="Remove Photo"
                  class="q-mt-xs"
                />
                <!-- Display Captured Photo -->
                <q-img
                  v-if="uploadedPhotoUrl"
                  :src="uploadedPhotoUrl"
                  class="q-mt-sm"
                  style="max-width: 300px; height: auto"
                />
              </div>
            </div>

            <!-- Camera Dialog -->
            <q-dialog v-model="isCameraDialogOpen" persistent>
              <q-card style="max-width: 500px">
                <q-card-section class="dialog-header">
                  <div class="text-h6">Capture Photo</div>
                </q-card-section>
                <q-card-section class="dialog-body">
                  <!-- Video Element -->
                  <video
                    ref="videoElement"
                    autoplay
                    playsinline
                    disablePictureInPicture
                    class="camera-feed styled-camera"
                  ></video>
                  <div align="right" class="q-mt-md">
                    <q-btn
                      label="Close"
                      color="negative"
                      @click="closeCameraDialog"
                    />
                    <q-btn
                      color="primary"
                      class="q-ml-sm"
                      label="Capture"
                      @click="capturePhoto"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </q-dialog>
          </div>
          <div class="row">
            <div class="full-width">
              <q-btn
                color="primary"
                label="Add Report"
                class="float-right q-mt-sm"
                @click="addErrorReport"
              />
            </div>
          </div>
        </q-card>

        <q-card flat class="preview-card q-mt-md">
          <div v-if="reports.length > 0">
            <div
              v-for="(report, index) in reports"
              :key="report.id"
              class="row justify-between per-report q-mb-sm"
            >
              <div>
                <!-- Display the report description -->
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
                <!-- Display the report category and sub-category -->
                <div class="q-ml-xl text-weight-bold text-red">
                  {{ report.category }} - {{ report.sub_category }}
                </div>
                <!-- Display the report photo, if any -->
                <q-img
                  v-if="report.image"
                  :src="report.image"
                  class="q-mt-sm q-ml-lg"
                  style="max-width: 200px; height: auto"
                />
              </div>
              <!-- Delete button -->
              <q-btn
                dense
                flat
                icon="delete"
                color="red"
                @click="openDeleteReportDialog(report.id)"
              />
            </div>
          </div>
          <div v-else class="text-center text-grey">
            No error reports added.
          </div>
        </q-card>
      </div>
    </div>
  </div>

  <q-dialog v-model="isDeleteInstructionDialogOpen" persistent>
    <q-card>
      <q-card-section class="text-center">
        <div class="text-h6">Confirm Deletion</div>
        <div>Are you sure you want to delete this instruction?</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="closeDeleteInstructionDialog"
        />
        <q-btn
          flat
          label="Delete"
          color="negative"
          @click="confirmDeleteInstruction"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="isDeleteReportDialogOpen" persistent>
    <q-card style="min-width: 300px">
      <q-card-section class="text-center">
        <div class="text-h6">Confirm Deletion</div>
        <div class="q-mt-md">Are you sure you want to delete this report?</div>
      </q-card-section>
      <q-card-actions align="right" class="q-pa-sm">
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="closeDeleteReportDialog"
        />
        <q-btn
          flat
          label="Delete"
          color="negative"
          @click="confirmDeleteReport"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!-- Delete Confirmation Dialog -->
  <q-dialog v-model="isDeleteTransactionDialogOpen" persistent>
    <q-card>
      <q-card-section class="text-center">
        <div class="text-h6">Confirm Deletion</div>
        <div>Are you sure you want to delete this transaction?</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="cancelDeleteTransaction"
        />
        <q-btn
          flat
          label="Delete"
          color="negative"
          @click="confirmDeleteTransaction"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!-- Add Transaction Dialog -->
  <q-dialog v-model="isAddTransactionDialogOpen" persistent>
    <q-card>
      <q-card-section>
        <div class="text-h6 text-center">Add Transaction</div>
      </q-card-section>
      <q-card-section>
        <!-- Add Transaction Form (Copied from OthersComponent) -->
        <div class="text-p">
          <q-checkbox
            v-model="searchModeActive"
            label="Search an item instead"
            class="q-my-sm"
            @update:model="resetInputs"
          />

          <div v-if="searchModeActive">
            <div>Search an item...</div>
            <q-select
              v-model="selectedSearchItemName"
              :options="filteredSearchItemOptions"
              square
              dense
              outlined
              use-input
              input-debounce="300"
              class="others-input q-mb-xs bg-white"
              label="Type to search item"
              @filter="filterSearchItemsByInput"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:append>
                <q-icon
                  name="close"
                  @click="clearSearchInput"
                  class="cursor-pointer"
                />
              </template>
            </q-select>
          </div>

          <div v-else>
            <div class="row">
              <div class="col">
                <div>Category</div>
                <q-select
                  v-model="selectedCategoryName"
                  :options="categoryOptions"
                  square
                  dense
                  outlined
                  input-debounce="300"
                  class="others-input q-mb-xs bg-white"
                  label="Select Category"
                />
              </div>
            </div>

            <div v-if="isNewItemSelected">
              <div>Enter New Item:</div>
              <q-input
                v-model="newItemNameInput"
                square
                dense
                outlined
                class="others-input q-mb-xs bg-white"
                placeholder="Enter item name"
              />
              <div>Unit:</div>
              <q-select
                v-model="newItemUnitType"
                :options="unitTypeOptions"
                square
                dense
                outlined
                class="others-input q-mb-xs bg-white"
                label="Select Unit"
              />
            </div>
            <div v-else>
              <div>Sub-category</div>
              <q-select
                v-model="selectedSubCategoryName"
                :options="filteredSubCategoryOptions"
                square
                dense
                outlined
                input-debounce="300"
                class="others-input q-mb-xs bg-white"
                label="Select Sub-category"
              />

              <div>Item Name:</div>
              <q-select
                v-model="selectedItemName"
                :options="filteredItemOptions"
                square
                dense
                outlined
                input-debounce="300"
                class="others-input q-mb-xs bg-white"
                label="Select Item"
              />
            </div>
          </div>

          <div>Process</div>
          <q-select
            v-model="selectedProcessOption"
            :options="filteredProcessOptions"
            square
            dense
            outlined
            class="others-input q-mb-xs bg-white"
            label="Select Process"
            @update:model="calculatePriceForSelectedType"
          />

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <div>Price Type</div>
              <q-select
                v-model="selectedPriceTypeOption"
                :options="filteredPriceTypeOptions"
                square
                dense
                outlined
                class="others-input q-mb-xs bg-white"
                label="Select Price Type"
              />
            </div>
            <div class="col-6">
              <div>Price:</div>
              <q-input
                v-model="priceInputValue"
                square
                dense
                outlined
                class="others-input q-mb-xs bg-white"
                label="Enter Price"
                :disable="isPriceInputDisabled"
              />
            </div>
          </div>

          <div
            v-if="
              selectedUnitType === 'pc' ||
              (isNewItemSelected && newItemUnitType === 'pc')
            "
          >
            <div>Quantity:</div>
            <q-input
              v-model="pieceQuantityInput"
              type="number"
              square
              dense
              outlined
              class="others-input q-mb-xs bg-white"
              label="Enter Quantity"
            />
          </div>

          <div
            v-else-if="
              selectedUnitType === 'sqft' ||
              (isNewItemSelected && newItemUnitType === 'sqft')
            "
            class="row q-col-gutter-sm"
          >
            <div class="col">
              <div>Width:</div>
              <q-input
                v-model="areaWidthInput"
                type="number"
                square
                dense
                outlined
                class="others-input q-mb-xs bg-white"
                label="Enter Width (ft)"
              />
            </div>
            <div class="col">
              <div>Breadth:</div>
              <q-input
                v-model="areaBreadthInput"
                type="number"
                square
                dense
                outlined
                class="others-input q-mb-xs bg-white"
                label="Enter Breadth (ft)"
              />
            </div>
          </div>

          <div
            v-else-if="
              selectedUnitType === 'kg' ||
              (isNewItemSelected && newItemUnitType === 'kg')
            "
          >
            <div>Weight:</div>
            <q-input
              v-model="weightInput"
              type="number"
              square
              dense
              outlined
              class="others-input q-mb-xs bg-white"
              label="Enter Weight (kg)"
            />
          </div>

          <!-- Display area, weight, and subtotal conditionally -->
          <div
            v-if="(selectedUnitType || newItemUnitType) === 'sqft'"
            class="q-mt-md text-right"
          >
            <div>
              Area:
              <span class="text-summary"
                >{{ computedArea.toFixed(2) }} sqft</span
              >
            </div>
            <div>
              Subtotal:
              <span class="text-summary"
                >${{ computedSubtotal.toFixed(2) }}</span
              >
            </div>
          </div>
          <div
            v-else-if="(selectedUnitType || newItemUnitType) === 'kg'"
            class="text-right q-mt-md"
          >
            <div>
              Weight: <span class="text-summary">{{ weightInput }} kg</span>
            </div>
            <div>
              Subtotal:
              <span class="text-summary"
                >${{ computedSubtotal.toFixed(2) }}</span
              >
            </div>
          </div>

          <div class="row justify-end">
            <q-btn
              class="float-right q-my-md"
              label="Add to Transaction"
              color="primary"
              @click="addTransactionItem"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Close"
          color="negative"
          @click="closeAddTransactionDialog"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="isAddContactPersonDialogOpen" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6 text-center">Add Contact Person</div>
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="newContactPerson.name"
          label="Name"
          outlined
          dense
          class="q-mb-md"
          required
        />
        <q-input
          v-model="newContactPerson.contact_no1"
          label="Contact Number 1"
          outlined
          dense
          class="q-mb-md"
        />
        <q-input
          v-model="newContactPerson.contact_no2"
          label="Contact Number 2"
          outlined
          dense
          class="q-mb-md"
        />
        <q-input
          v-model="newContactPerson.email"
          label="Email"
          outlined
          dense
          type="email"
          class="q-mb-md"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          label="Cancel"
          flat
          color="negative"
          @click="closeAddContactPersonDialog"
        />
        <q-btn label="Add" color="primary" @click="addContactPerson" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!-- Add Address Dialog -->
  <q-dialog v-model="isAddAddressDialogOpen" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6 text-center">Add Address</div>
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="newAddress.block_no"
          label="Block No."
          outlined
          dense
          class="q-mb-md"
          required
        />
        <q-input
          v-model="newAddress.road_name"
          label="Road Name"
          outlined
          dense
          class="q-mb-md"
          required
        />
        <q-input
          v-model="newAddress.unit_no"
          label="Unit No."
          outlined
          dense
          class="q-mb-md"
        />
        <q-input
          v-model="newAddress.building_name"
          label="Building Name"
          outlined
          dense
          class="q-mb-md"
        />
        <q-input
          v-model="newAddress.postal_code"
          label="Postal Code"
          outlined
          dense
          class="q-mb-md"
          required
        />
        <q-input
          v-model="newAddress.additional_info"
          label="Additional Info"
          outlined
          dense
          class="q-mb-md"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          label="Cancel"
          flat
          color="negative"
          @click="closeAddAddressDialog"
        />
        <q-btn label="Add" color="primary" @click="addAddress" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { onMounted, ref, computed, watch, nextTick } from "vue";
import { fetchAllErrorItems } from "@/../supabase/api/error_list.js";
import { useTransactionStore } from "@/stores/transactionStore";
import { useRoute } from "vue-router";
import { Notify } from "quasar";

const transactionStore = useTransactionStore();
const route = useRoute();

// Initialize objects to prevent null errors
const order = ref({}); // Changed from null to an empty object
const customer = ref({});
const collection = ref({});
const delivery = ref({});
const transactions = ref([]);
const instructions = ref([]);
const reports = ref([]);

// Watcher for transactions to dynamically calculate subtotals
watch(
  transactions,
  (newTransactions) => {
    newTransactions.forEach((transaction) => {
      transaction.subtotal =
        (transaction.price || 0) * (transaction.quantity || 1); // Exclude pieces
      // transaction.subtotal = (transaction.price || 0) * (transaction.quantity || 0) * (transaction.pieces || 1);
    });
  },
  { deep: true }
);
onMounted(async () => {
  try {
    const orderNo = route.params.order_no;
    const orderDetails = await transactionStore.fetchOrderDetailsByOrderNo(
      orderNo
    );

    collection.value = {
      ...orderDetails.collection,
      address: orderDetails.collection?.address || null,
      date_from: orderDetails.collection?.date_from || "",
      date_to: orderDetails.collection?.date_to || "",
    };

    delivery.value = {
      ...orderDetails.delivery,
      address: orderDetails.delivery?.address || null,
      date_from: orderDetails.delivery?.date_from || "",
      date_to: orderDetails.delivery?.date_to || "",
    };

    customer.value = orderDetails.customer || {};
    transactions.value = orderDetails.transactions || [];
  } catch (error) {
    console.error("Error loading order details:", error);
  }
});

onMounted(async () => {
  try {
    // Get order_no from route params
    const orderNo = route.params.order_no;

    // Fetch the order details
    const orderDetails = await transactionStore.fetchOrderDetailsByOrderNo(
      orderNo
    );
    console.log("Order Details:", orderDetails);

    // Assign fetched data directly
    order.value = orderDetails.order || {}; // Ensure it's an object
    customer.value = orderDetails.customer || {};
    collection.value = orderDetails.collection || {};
    delivery.value = orderDetails.delivery || {};
    transactions.value = orderDetails.transactions || [];

    // Combine onetime and recurring instructions into a single array
    instructions.value = [
      ...(orderDetails.instructionsOneTime || []).map((instruction) => ({
        ...instruction,
        type: "onetime",
        to: [
          ...(instruction.admin ? ["admin"] : []),
          ...(instruction.cleaning ? ["cleaning"] : []),
          ...(instruction.packing ? ["packing"] : []),
          ...(instruction.picking_sending ? ["pickingsending"] : []),
        ],
      })),
      ...(orderDetails.instructionsRecurring || []).map((instruction) => ({
        ...instruction,
        type: "recurring",
        to: [
          ...(instruction.admin ? ["admin"] : []),
          ...(instruction.cleaning ? ["cleaning"] : []),
          ...(instruction.packing ? ["packing"] : []),
          ...(instruction.picking_sending ? ["pickingsending"] : []),
        ],
      })),
    ];

    reports.value = orderDetails.errorReports || [];
    // Set the selected customer in the store
    if (customer.value.id) {
      transactionStore.setSelectedCustomer(customer.value);
    }
  } catch (error) {
    console.error("Error loading order details:", error);
  }
});

onMounted(async () => {
  try {
    const items = await fetchAllErrorItems(); // Fetch categories and subcategories
    const categoriesSet = new Set(items.map((item) => item.category));
    reportCategories.value = Array.from(categoriesSet);

    // Automatically set the first category and load its subcategories
    if (reportCategories.value.length > 0) {
      selectedCategory.value = reportCategories.value[0];
      updateSubCategories(selectedCategory.value);
    }
  } catch (error) {
    console.error("Error fetching error items:", error);
  }
});

function autoResize(event) {
  const textarea = event.target;
  textarea.style.height = "auto"; // Reset the height
  textarea.style.height = `${textarea.scrollHeight}px`; // Adjust based on content
  textarea.style.overflow = "hidden";
}

async function addInstruction() {
  try {
    if (!instructionsDesc.value || !instructionsTo.value.length) {
      Notify.create({
        message: "Instruction description and 'To' fields are required.",
        color: "red",
      });
      return;
    }

    const newInstruction = {
      description: instructionsDesc.value,
      type: instructionsType.value,
      to: [...instructionsTo.value],
    };

    await transactionStore.addInstruction(
      newInstruction,
      order.value.id, // Pass orderId for onetime instructions
      customer.value.id // Pass customerId for recurring instructions
    );

    // Reset form
    instructionsDesc.value = "";
    instructionsTo.value = [];
    instructionsType.value = "onetime";

    Notify.create({
      message: "Instruction added successfully!",
      color: "green",
    });
  } catch (error) {
    Notify.create({
      message: "Failed to add instruction. Please try again.",
      color: "red",
    });
  }
}

// Reactive variables for adding instructions
const instructionsType = ref("onetime");
const instructionsDesc = ref("");
const instructionsTo = ref([]);

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

// Reactive variables for categories and subcategories
const reportCategories = ref([]);
const reportSubCategories = ref([]);
const selectedCategory = ref("");
const selectedSubCategory = ref("");
const reportDesc = ref(""); // Holds the description for the report

function updateSubCategories(category) {
  fetchAllErrorItems()
    .then((items) => {
      reportSubCategories.value = items
        .filter((item) => item.category === category)
        .map((item) => item.sub_category);
      selectedSubCategory.value = ""; // Reset the selected sub-category
    })
    .catch((error) => {
      console.error("Error updating subcategories:", error);
    });
}

// Watch for changes in the selected category
watch(selectedCategory, (newCategory) => {
  if (newCategory) {
    updateSubCategories(newCategory);
  }
});

const filteredSubCategories = computed(() => {
  return reportSubCategories.value;
});

async function addErrorReport() {
  try {
    // Validate required fields
    if (
      !selectedCategory.value ||
      !selectedSubCategory.value ||
      !reportDesc.value
    ) {
      Notify.create({
        message: "Category, sub-category, and description are required.",
        color: "red",
      });
      return;
    }

    // Check if order ID is available
    if (!order.value?.id) {
      Notify.create({
        message: "Order ID is missing. Cannot add the report.",
        color: "red",
      });
      return;
    }

    // Construct the new report object
    const newReport = {
      order_id: order.value.id,
      category: selectedCategory.value,
      sub_category: selectedSubCategory.value,
      description: reportDesc.value,
      image: uploadedPhotoUrl.value || null,
    };

    // Call the store action and await the result
    const addedReport = await transactionStore.addReport(newReport);

    // Add the new report to the local state
    reports.value.push(addedReport);

    // Reset input fields
    selectedCategory.value = "";
    selectedSubCategory.value = "";
    reportDesc.value = "";
    uploadedPhotoUrl.value = null;

    // Notify success
    Notify.create({
      message: "Report added successfully!",
      color: "green",
    });
    console.log("Added report:", addedReport);
  } catch (error) {
    console.error("Error adding report:", error); // Log the error for debugging
    Notify.create({
      message: "Failed to add report. Please try again.",
      color: "red",
    });
  }
}

// Watchers for category and sub-category selection (optional, based on dynamic dropdowns)
watch(selectedCategory, (newCategory) => {
  if (newCategory) {
    // Dynamically update subcategories if needed
    console.log(`Selected category changed to: ${newCategory}`);
  }
});

const uploadedPhotoUrl = ref(null); // Captured photo's URL
const isCameraDialogOpen = ref(false); // Camera dialog visibility
const videoStream = ref(null); // Video stream object
const videoElement = ref(null); // Video element reference

// Open the camera dialog and start the video stream
async function openCameraDialog() {
  try {
    isCameraDialogOpen.value = true; // Show the dialog
    await nextTick(); // Wait for the dialog to render

    // Access the camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoStream.value = stream;

    // Attach the stream to the video element
    if (videoElement.value) {
      videoElement.value.srcObject = stream;
    } else {
      console.error("Video element not available.");
    }
  } catch (error) {
    console.error("Error accessing camera:", error);
    closeCameraDialog(); // Ensure dialog is closed if there's an error
  }
}

// Capture the photo from the video feed
function capturePhoto() {
  try {
    if (!videoElement.value) {
      console.error("Video element not available.");
      return;
    }

    // Create a canvas to capture the current frame
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.value.videoWidth;
    canvas.height = videoElement.value.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height);

    // Convert the canvas content to a Base64 URL
    uploadedPhotoUrl.value = canvas.toDataURL("image/png");

    // Close the camera dialog
    closeCameraDialog();
  } catch (error) {
    console.error("Error capturing photo:", error);
  }
}

// Close the camera dialog and stop the video stream
function closeCameraDialog() {
  if (videoStream.value) {
    const tracks = videoStream.value.getTracks();
    tracks.forEach((track) => track.stop()); // Stop all tracks
    videoStream.value = null; // Reset the video stream
  }
  isCameraDialogOpen.value = false; // Hide the dialog
}

// Clear the uploaded photo
function clearUploadedPhoto() {
  uploadedPhotoUrl.value = null; // Reset the photo URL
}

// Computed properties for totals
const totalPcs = computed(() => {
  return transactions.value.reduce((acc, item) => {
    const pcs = parseFloat(item.pieces) || 0; // Ensure a numeric value
    return acc + pcs;
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
  order.value?.order_date_time
    ? new Date(order.value.order_date_time).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A"
);

onMounted(async () => {
  try {
    // Get order_no from route params
    const orderNo = route.params.order_no;

    // Fetch the order details
    const orderDetails = await transactionStore.fetchOrderDetailsByOrderNo(
      orderNo
    );

    // Populate collection and delivery data
    collection.value = {
      ...orderDetails.collection,
      address: orderDetails.collection?.address || null, // Set address directly from database
      date_from: orderDetails.collection?.date_from
        ? new Date(orderDetails.collection.date_from).toISOString().slice(0, 10) // Format date
        : "",
      date_to: orderDetails.collection?.date_to
        ? new Date(orderDetails.collection.date_to).toISOString().slice(0, 10)
        : "",
    };

    delivery.value = {
      ...orderDetails.delivery,
      address: orderDetails.delivery?.address || null, // Set address directly from database
      date_from: orderDetails.delivery?.date_from
        ? new Date(orderDetails.delivery.date_from).toISOString().slice(0, 10)
        : "",
      date_to: orderDetails.delivery?.date_to
        ? new Date(orderDetails.delivery.date_to).toISOString().slice(0, 10)
        : "",
    };

    // Set customer and transactions data
    customer.value = orderDetails.customer || {};
    transactions.value = orderDetails.transactions || [];
  } catch (error) {
    console.error("Error loading order details:", error);
  }
});

function getContactNumber(contactPersonId) {
  if (!contactOptions.value || contactOptions.value.length === 0) return "-"; // Ensure options are loaded
  const contact = contactOptions.value.find(
    (option) => option.id === contactPersonId
  );
  if (contact) {
    return `${contact.contact_no1 || "-"} / ${contact.contact_no2 || "-"}`;
  }
  return "-";
}

const formattedCollectionContactNos = computed({
  get() {
    const contact1 = collection.value.contactPerson?.contact_no1 || "-";
    const contact2 = collection.value.contactPerson?.contact_no2 || "-";
    return `${contact1} / ${contact2}`;
  },
  set(value) {
    const [contact1, contact2] = value.split(" / ").map((num) => num.trim());
    collection.value.contactPerson.contact_no1 = contact1 || "";
    collection.value.contactPerson.contact_no2 = contact2 || "";
  },
});

const formattedDeliveryContactNos = computed({
  get() {
    const contact1 = delivery.value.contactPerson?.contact_no1 || "-";
    const contact2 = delivery.value.contactPerson?.contact_no2 || "-";
    return `${contact1} / ${contact2}`;
  },
  set(value) {
    const [contact1, contact2] = value.split(" / ").map((num) => num.trim());
    delivery.value.contactPerson.contact_no1 = contact1 || "";
    delivery.value.contactPerson.contact_no2 = contact2 || "";
  },
});

const contactOptions = ref([]);
const addressOptions = ref([]);

const updateOptions = async () => {
  try {
    const customerId = customer.value?.id || null;
    if (!customerId) {
      console.warn("No customer selected. Options cleared.");
      contactOptions.value = [];
      addressOptions.value = [];
      return;
    }

    // Fetch data from API or store
    await Promise.all([
      transactionStore.loadContactOptions(customerId),
      transactionStore.loadAddressOptions(customerId),
    ]);

    // Map data to dropdown options
    contactOptions.value = transactionStore.contactOptions.map((contact) => ({
      id: contact.id,
      name: contact.name, // Only include the name here
      contact_no1: contact.contact_no1,
      contact_no2: contact.contact_no2,
      label: `${contact.name} - ${contact.contact_no1}`,
    }));

    addressOptions.value = transactionStore.addressOptions.map((address) => ({
      id: address.id,
      label: `${address.block_no} ${address.road_name} ${address.unit_no} ${
        address.building_name
      }, ${address.postal_code} (${address?.additional_info || ""})`,
    }));

    // Set pre-selected values if they exist in collection
    if (collection.value.contactPerson) {
      const existingContact = contactOptions.value.find(
        (option) => option.id === collection.value.contactPerson
      );
      if (existingContact) {
        collection.value.contactPerson = existingContact.id;
      }
    }

    if (collection.value.address) {
      const existingAddress = addressOptions.value.find(
        (option) => option.id === collection.value.address
      );
      if (existingAddress) {
        collection.value.address = existingAddress.id;
      }
    }
  } catch (error) {
    console.error("Error fetching contact/address options:", error);
    contactOptions.value = [];
    addressOptions.value = [];
  }
};

// Watch for customer changes and update options
watch(customer, async () => {
  await updateOptions();
});

const openCustomerTab = (customerId) => {
  const url = `/customers/${customerId}`;
  window.open(url, "_blank"); // Open in a new tab
};

async function updateReadyByCollectionAndDelivery() {
  try {
    const orderNo = order.value.order_no;

    // Prepare payloads
    const collectionPayload = {
      contact_person_id: collection.value.contactPerson?.id || null,
      address: collection.value.address || collection.address_id, // Retain existing address if not updated
      date_from: collection.value.date_from || null,
      date_to: collection.value.date_to || null,
    };

    const deliveryPayload = {
      contact_person_id: delivery.value.contactPerson?.id || null,
      address: delivery.value.address || delivery.address_id, // Retain existing address if not updated
      date_from: delivery.value.date_from || null,
      date_to: delivery.value.date_to || null,
    };

    // Include the ready_by field
    const readyByPayload = {
      ready_by: order.value.ready_by || null, // Ensure the date is included
    };

    // Update the collection, delivery, and order "ready by" details in the store
    await transactionStore.updateCollectionAndDelivery(
      orderNo,
      collectionPayload,
      deliveryPayload,
      readyByPayload
    );

    // Notify success
    Notify.create({
      message:
        "Ready By, Collection, and Delivery details updated successfully.",
      color: "green",
      icon: "check_circle",
      position: "top",
    });
  } catch (error) {
    // Notify error
    Notify.create({
      message: "Failed to update Ready By, Collection, and Delivery details.",
      color: "red",
      icon: "error",
      position: "top",
    });

    console.error("Error updating details:", error);
  }
}

function updateOtherInformation() {
  try {
    // Prepare payload
    const payload = {
      job_type: order.value.job_type,
      job_subtype: order.value.job_subtype,
      goods_status: order.value.goods_status,
      logistics_status: order.value.logistics_status,
      payment_status: order.value.payment_status,
      payment_type: customer.value.payment_type,
      no_packets_hangers: order.value.no_packets_hangers,
    };

    // Call store action or API to update
    transactionStore.updateOrderOtherInfo(order.value.order_no, payload);

    // Notify success
    Notify.create({
      message: "Other Information updated successfully.",
      color: "green",
      icon: "check_circle",
      position: "top",
    });
  } catch (error) {
    // Handle error
    Notify.create({
      message: "Failed to update Other Information.",
      color: "red",
      icon: "error",
      position: "top",
    });
    console.error("Error updating Other Information:", error);
  }
}

// State for the delete dialog
const isDeleteDialogOpen = ref(false);
const deleteTargetType = ref(""); // "instruction" or "report"
const itemToDeleteId = ref(null); // ID of the item to delete

const isDeleteInstructionDialogOpen = ref(false);
const instructionToDelete = ref({ id: null, type: null });

// Open the delete dialog
function openDeleteInstructionDialog(id, type) {
  instructionToDelete.value = { id, type };
  isDeleteInstructionDialogOpen.value = true;
}

// Confirm delete and call the store action
async function confirmDeleteInstruction() {
  if (!instructionToDelete.value.id || !instructionToDelete.value.type) return;

  try {
    await transactionStore.deleteInstruction(
      instructionToDelete.value.id,
      instructionToDelete.value.type
    );

    // Notify and update UI
    Notify.create({
      message: "Instruction deleted successfully!",
      color: "green",
    });
    instructions.value = instructions.value.filter(
      (instruction) => instruction.id !== instructionToDelete.value.id
    );

    // Reset dialog state
    instructionToDelete.value = { id: null, type: null };
    isDeleteInstructionDialogOpen.value = false;
  } catch (error) {
    console.error("Error deleting instruction:", error);
    Notify.create({
      message: "Failed to delete instruction. Please try again.",
      color: "red",
    });
  }
}

// Close the delete dialog
function closeDeleteInstructionDialog() {
  isDeleteInstructionDialogOpen.value = false;
  instructionToDelete.value = { id: null, type: null };
}

const isDeleteReportDialogOpen = ref(false);
const reportToDeleteId = ref(null);

function openDeleteReportDialog(reportId) {
  reportToDeleteId.value = reportId;
  isDeleteReportDialogOpen.value = true;
}

async function confirmDeleteReport() {
  if (!reportToDeleteId.value) return;

  try {
    await transactionStore.deleteReport(reportToDeleteId.value);

    // Notify success
    Notify.create({
      message: "Report deleted successfully!",
      color: "green",
    });

    // Close dialog
    isDeleteReportDialogOpen.value = false;
    reportToDeleteId.value = null;
  } catch (error) {
    // Notify failure
    Notify.create({
      message: "Failed to delete report. Please try again.",
      color: "red",
    });
    console.error("Error deleting report:", error);
  }
}

function closeDeleteReportDialog() {
  isDeleteReportDialogOpen.value = false;
  reportToDeleteId.value = null;
}
const showInstructions = ref(false);

function toggleInstructions() {
  showInstructions.value = !showInstructions.value;
}
const showReports = ref(false);

function toggleReports() {
  showReports.value = !showReports.value;
}

// Reactive state for delete dialog
const isDeleteTransactionDialogOpen = ref(false);
const transactionToDeleteIndex = ref(null);
const transactionToDeleteId = ref(null);

// Open delete confirmation dialog
function openDeleteTransactionDialog(index, transactionId) {
  transactionToDeleteIndex.value = index;
  transactionToDeleteId.value = transactionId;
  isDeleteTransactionDialogOpen.value = true;
}

// Confirm delete action
async function confirmDeleteTransaction() {
  if (transactionToDeleteId.value === null) return;

  try {
    // Call the transaction store to delete from the database
    await transactionStore.deleteTransaction(transactionToDeleteId.value);

    // Remove the transaction from the local array
    transactions.value.splice(transactionToDeleteIndex.value, 1);

    // Notify success
    Notify.create({
      message: "Transaction deleted successfully!",
      color: "green",
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    Notify.create({
      message: "Failed to delete transaction. Please try again.",
      color: "red",
    });
  } finally {
    // Reset dialog state
    isDeleteTransactionDialogOpen.value = false;
    transactionToDeleteIndex.value = null;
    transactionToDeleteId.value = null;
  }
}

// Cancel delete action
function cancelDeleteTransaction() {
  isDeleteTransactionDialogOpen.value = false;
  transactionToDeleteIndex.value = null;
  transactionToDeleteId.value = null;
}

const isAddTransactionDialogOpen = ref(false);
const openAddTransactionDialog = () =>
  (isAddTransactionDialogOpen.value = true);
const closeAddTransactionDialog = () =>
  (isAddTransactionDialogOpen.value = false);

// Data Initialization
onMounted(async () => {
  await transactionStore.loadItems();
});

// Options and Category Data
const categoryOptions = [
  "Clothings",
  "Beddings",
  "Upholsteries",
  "Miscellaneous",
  "Onsite Cleaning",
  "New Item",
];
const priceTypeOptions = ["Current", "TBA", "Custom"];
const unitTypeOptions = ["pc", "sqft", "kg"];

// Reactive Variables
const searchModeActive = ref(false);
const selectedSearchItemName = ref(null);
const selectedCategoryName = ref(null);
const selectedSubCategoryName = ref(null);
const selectedItemName = ref(null);
const newItemNameInput = ref("");
const newItemUnitType = ref(null);
const selectedPriceTypeOption = ref(null);
const selectedProcessOption = ref(null);
const priceInputValue = ref(null);

// Input Controls for Units
const pieceQuantityInput = ref(1);
const areaWidthInput = ref(0);
const areaBreadthInput = ref(0);
const weightInput = ref(0);

// Computed Properties
const isNewItemSelected = computed(
  () => selectedCategoryName.value === "New Item"
);

const filteredPriceTypeOptions = computed(() => {
  return isNewItemSelected.value && !searchModeActive.value
    ? priceTypeOptions.filter((type) => type !== "Current")
    : priceTypeOptions;
});

const filteredSubCategoryOptions = computed(() => {
  if (!selectedCategoryName.value) return [];
  return [
    ...new Set(
      transactionStore.items
        .filter((item) => item.category === selectedCategoryName.value)
        .map((item) => item.sub_category)
    ),
  ];
});

const filteredItemOptions = computed(() => {
  if (!selectedCategoryName.value || !selectedSubCategoryName.value) return [];
  return transactionStore.items
    .filter(
      (item) =>
        item.category === selectedCategoryName.value &&
        item.sub_category === selectedSubCategoryName.value
    )
    .map((item) => item.name);
});

const filteredSearchItemOptions = ref([]);
const filterSearchItemsByInput = (searchInput, updateCallback) => {
  filteredSearchItemOptions.value =
    searchInput === ""
      ? []
      : transactionStore.items
          .filter((item) =>
            item.name.toLowerCase().includes(searchInput.toLowerCase())
          )
          .map((item) => item.name);
  updateCallback();
};

const filteredProcessOptions = ref([]);
const selectedUnitType = computed(() => {
  const itemName = searchModeActive.value
    ? selectedSearchItemName.value
    : selectedItemName.value;
  const item = transactionStore.items.find((i) => i.name === itemName);
  return item ? item.unit : null;
});

// Calculations for Area and Subtotal
const computedArea = computed(() => {
  if (
    selectedUnitType.value === "sqft" ||
    (isNewItemSelected.value && newItemUnitType.value === "sqft")
  ) {
    return areaWidthInput.value * areaBreadthInput.value;
  }
  return 0;
});

const computedSubtotal = computed(() => {
  if (
    selectedUnitType.value === "sqft" ||
    (isNewItemSelected.value && newItemUnitType.value === "sqft")
  ) {
    return computedArea.value * numericPrice.value;
  } else if (
    selectedUnitType.value === "kg" ||
    (isNewItemSelected.value && newItemUnitType.value === "kg")
  ) {
    return weightInput.value * numericPrice.value;
  }
  return 0;
});

const numericPrice = computed(() => {
  const priceMatch = priceInputValue.value
    ? priceInputValue.value.match(/[\d.]+/)
    : null;
  return priceMatch ? parseFloat(priceMatch[0]) : 0;
});

// Functions
const resetInputs = () => {
  selectedCategoryName.value = null;
  selectedSubCategoryName.value = null;
  selectedItemName.value = null;
  newItemNameInput.value = "";
  selectedPriceTypeOption.value = null;
  selectedProcessOption.value = null;
  priceInputValue.value = null;
  selectedSearchItemName.value = null;
};

const clearSearchInput = () => {
  selectedSearchItemName.value = null;
};

const updateProcessOptionsList = () => {
  if (isNewItemSelected.value) {
    // If the category is 'New Item', use predefined options
    filteredProcessOptions.value = [
      "Laundry",
      "Dry Clean",
      "Pressing Only",
      "Others",
    ];
  } else {
    // Otherwise, derive process options based on the selected item
    const selectedItemBaseName = searchModeActive.value
      ? selectedSearchItemName.value
      : selectedItemName.value;
    const selectedItemData = transactionStore.items.find(
      (i) => i.name === selectedItemBaseName
    );

    filteredProcessOptions.value = selectedItemData
      ? [
          selectedItemData.laundry_price !== null ? "Laundry" : null,
          selectedItemData.dryclean_price !== null ? "Dry Clean" : null,
          selectedItemData.pressing_price !== null ? "Pressing Only" : null,
          selectedItemData.others_price !== null ? "Others" : null,
        ].filter(Boolean)
      : [];
  }
};

const calculatePriceForSelectedType = () => {
  const currentItemName = searchModeActive.value
    ? selectedSearchItemName.value
    : selectedItemName.value;
  const currentItemData = transactionStore.items.find(
    (i) => i.name === currentItemName
  );

  if (selectedPriceTypeOption.value === "Custom") {
    priceInputValue.value = null;
    isPriceInputDisabled.value = false;
  } else if (selectedPriceTypeOption.value === "TBA") {
    priceInputValue.value = "TBA";
    isPriceInputDisabled.value = true;
  } else if (
    selectedPriceTypeOption.value === "Current" &&
    selectedProcessOption.value &&
    currentItemData
  ) {
    const priceMap = {
      Laundry: currentItemData.laundry_price,
      "Dry Clean": currentItemData.dryclean_price,
      "Pressing Only": currentItemData.pressing_price,
      Others: currentItemData.others_price,
    };
    const processPrice = priceMap[selectedProcessOption.value];
    priceInputValue.value =
      processPrice !== null
        ? `$${processPrice.toFixed(2)} / ${currentItemData.unit}`
        : null;
    isPriceInputDisabled.value = true;
  }
};

const isPriceInputDisabled = ref(false);

const addTransactionItem = async () => {
  try {
    // Validate input
    if (!order.value?.id) {
      Notify.create({
        message: "Order ID is missing. Cannot add transaction.",
        color: "red",
      });
      return;
    }

    const unitType = isNewItemSelected.value
      ? newItemUnitType.value
      : selectedUnitType.value;

    let baseName = searchModeActive.value
      ? selectedSearchItemName.value
      : isNewItemSelected.value
      ? newItemNameInput.value
      : selectedItemName.value;

    let itemDetails = "";
    let subtotalValue = 0;

    // Calculate subtotal based on unit type
    if (unitType === "pc") {
      itemDetails = "";
      subtotalValue =
        selectedPriceTypeOption.value === "TBA"
          ? 0
          : pieceQuantityInput.value * numericPrice.value;
    } else if (unitType === "sqft") {
      itemDetails = ` (${computedArea.value.toFixed(2)} sqft)`;
      subtotalValue =
        selectedPriceTypeOption.value === "TBA"
          ? 0
          : computedArea.value * numericPrice.value;
    } else if (unitType === "kg") {
      itemDetails = ` (${weightInput.value} kg)`;
      subtotalValue =
        selectedPriceTypeOption.value === "TBA"
          ? 0
          : weightInput.value * numericPrice.value;
    }
    const tagCategory = selectedItem ? selectedItem.tag_category : null;
    // Prepare the transaction payload
    const newTransaction = {
      order_id: order.value.id, // Attach the current order ID
      item_name: `${baseName}${itemDetails}`,
      category: selectedCategoryName.value,
      tag_category: tagCategory, // Include tag_category in the transaction
      price:
        selectedPriceTypeOption.value === "TBA" ? "TBA" : numericPrice.value,
      process: selectedProcessOption.value,
      quantity: pieceQuantityInput.value,
      subtotal: subtotalValue,
    };

    // Save transaction to database
    const addedTransaction = await transactionStore.addTransaction(
      newTransaction
    );

    // Update the local transactions array
    transactions.value.push(addedTransaction);

    // Notify success
    Notify.create({
      message: "Transaction added successfully!",
      color: "green",
      icon: "check_circle",
    });

    // Reset inputs
    resetInputs();
    closeAddTransactionDialog();
  } catch (error) {
    console.error("Error adding transaction:", error);
    Notify.create({
      message: "Failed to add transaction. Please try again.",
      color: "red",
    });
  }
};

watch(searchModeActive, resetInputs);
watch(
  [
    selectedPriceTypeOption,
    selectedProcessOption,
    selectedItemName,
    selectedSearchItemName,
  ],
  calculatePriceForSelectedType
);
watch(
  [
    selectedItemName,
    selectedSearchItemName,
    searchModeActive,
    selectedCategoryName,
  ],
  updateProcessOptionsList
);

watch(selectedSearchItemName, (newItemName) => {
  if (newItemName) {
    const selectedItem = transactionStore.items.find(
      (item) => item.name === newItemName
    );
    if (selectedItem) {
      selectedCategoryName.value = selectedItem.category || null;
    }
  }
});

// Method to update transactions
async function updateTransactions() {
  try {
    // Loop through each transaction and call the store action
    for (const transaction of transactions.value) {
      await transactionStore.updateTransaction(transaction);
    }

    // Notify the user about the success
    Notify.create({
      message: "Transactions updated successfully!",
      color: "green",
      icon: "check_circle",
    });
  } catch (error) {
    console.error("Error updating transactions:", error);
    Notify.create({
      message: "Failed to update transactions. Please try again.",
      color: "red",
      icon: "error",
    });
  }
}
// Start of ass contact person
const isAddContactPersonDialogOpen = ref(false);
const newContactPerson = ref({
  name: "",
  contact_no1: "",
  contact_no2: "",
  email: "",
});

const openAddContactPersonDialog = () => {
  isAddContactPersonDialogOpen.value = true;
};

const closeAddContactPersonDialog = () => {
  isAddContactPersonDialogOpen.value = false;
};

// Add contact person function
const addContactPerson = async () => {
  try {
    if (
      !newContactPerson.value.name ||
      !transactionStore.selectedCustomer?.id
    ) {
      Notify.create({
        message: "Name is required, and a customer must be selected.",
        color: "red",
      });
      return;
    }

    // Call the transaction store to add the contact person
    const contact = {
      ...newContactPerson.value,
      customer_id: transactionStore.selectedCustomer.id,
    };
    await transactionStore.addContactPerson(contact);

    // Reload contact options to reflect the new contact person
    await transactionStore.loadContactOptions(
      transactionStore.selectedCustomer.id
    );

    Notify.create({
      message: "Contact person added successfully!",
      color: "green",
    });

    closeAddContactPersonDialog();
  } catch (error) {
    console.error("Error adding contact person:", error);
    Notify.create({
      message: "Failed to add contact person. Please try again.",
      color: "red",
    });
  }
};

// End of add contact person

// Start of add address

// Reactive variable to control the dialog visibility
const isAddAddressDialogOpen = ref(false);

// Reactive object to store the new address form data
const newAddress = ref({
  block_no: "",
  road_name: "",
  unit_no: "",
  building_name: "",
  postal_code: "",
  additional_info: "",
});

// Function to open the "Add Address" dialog
const openAddAddressDialog = () => {
  isAddAddressDialogOpen.value = true;
};

// Function to close the "Add Address" dialog
const closeAddAddressDialog = () => {
  isAddAddressDialogOpen.value = false;
};

const capitalize = (str) => {
  return str ? str.toUpperCase() : ""; // Convert string to uppercase or return empty if null/undefined
};

const addAddress = async () => {
  try {
    // Validate required fields
    if (
      !newAddress.value.block_no ||
      !newAddress.value.road_name ||
      !newAddress.value.postal_code ||
      !transactionStore.selectedCustomer?.id
    ) {
      Notify.create({
        message: "Block No., Road Name, and Postal Code are required.",
        color: "red",
      });
      return;
    }

    // Add customer_id to the address object and capitalize fields
    const address = {
      block_no: capitalize(newAddress.value.block_no),
      road_name: capitalize(newAddress.value.road_name),
      unit_no: capitalize(newAddress.value.unit_no),
      building_name: capitalize(newAddress.value.building_name),
      postal_code: capitalize(newAddress.value.postal_code),
      additional_info: capitalize(newAddress.value.additional_info),
      customer_id: transactionStore.selectedCustomer.id,
    };

    // Call the store function to save the address
    await transactionStore.addAddress(address);

    // Reload the address options to reflect the new address
    await transactionStore.loadAddressOptions(
      transactionStore.selectedCustomer.id
    );

    // Notify success
    Notify.create({
      message: "Address added successfully!",
      color: "green",
    });

    // Reset the form and close the dialog
    newAddress.value = {
      block_no: "",
      road_name: "",
      unit_no: "",
      building_name: "",
      postal_code: "",
      additional_info: "",
    };
    closeAddAddressDialog();
  } catch (error) {
    console.error("Error adding address:", error);
    Notify.create({
      message: "Failed to add address. Please try again.",
      color: "red",
    });
  }
};

// End of add address
</script>
