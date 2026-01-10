<template>
  <div class="row transactions-tab main-container">
    <div class="left-container col-5">
      <!-- Search and Category Section -->
      <div class="category-container">
        <!-- Category Buttons -->
        <div class="row q-col-gutter-sm q-mb-sm">
          <div class="col-4" v-for="category in categories" :key="category">
            <q-btn
              flat
              class="cat-btn ellipsis text-weight-bold"
              @click="filterByCategory(category)"
            >
              {{ category }}
            </q-btn>
          </div>
        </div>

        <!-- Search bar -->
        <div v-if="selectedItemCategory !== 'custom item'" class="search-container">
          <q-input
            class="search-input items-center"
            v-model="searchItem"
            square
            dense
            outlined
            type="search"
            placeholder="Search here..."
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-icon
                name="close"
                @click="searchItem = ''"
                class="cursor-pointer"
              />
            </template>
          </q-input>
        </div>
      </div>

      <!-- Item List Section -->
      <div class="item-container">
        <div v-if="selectedItemCategory !== 'custom item'" class="item-list">
          <div v-for="(group, subCategory) in groupedItems" :key="subCategory">
            <div
              class="text-h6 text-uppercase text-weight-bold text-center q-py-sm"
            >
              {{ subCategory }}
            </div>
            <div class="row q-col-gutter-sm">
              <div
                v-for="(item, index) in group"
                :key="item.id"
                class="col-4 individual-item"
              >
                <q-btn
                  class="item-btn full-width bg-white"
                  unelevated
                  no-caps
                  dense
                  @click="openDialog(item)"
                >
                  <div>{{ item.name }}</div>
                </q-btn>
              </div>
            </div>
          </div>
        </div>
        <!-- Others Category Section -->
        <div v-else>
          <OthersComponent @add-item="handleAddItem" />
        </div>
      </div>
    </div>

    <div class="right-container col-7">
      <div class="row q-mb-sm justify-between">
        <!-- Column 1: Order No + Order Date -->
        <div class="col-auto">
          <div class="text-weight-bold">
            Order No:
            <span class="text-summary">
              {{ transactionStore.orderNo || "-" }}
            </span>
          </div>
          <div class="text-weight-bold">
            Order Date:
            <span class="text-summary">
              {{ orderDateDisplay }}
            </span>
          </div>
        </div>

        <!-- Column 2: Customer Name + Contact Nos -->
        <div class="col-auto">
          <div class="text-weight-bold">
            Customer:
            <span class="text-summary">
              {{ transactionStore.selectedCustomer?.name || "-" }}
            </span>
          </div>
          <div class="text-weight-bold">
            Contacts:
            <span class="text-summary">
              {{ transactionStore.selectedCustomer?.contact_no1 || "N/A" }}
              <span v-if="transactionStore.selectedCustomer?.contact_no2">
                / {{ transactionStore.selectedCustomer?.contact_no2 || "-" }}
              </span>
            </span>
          </div>
        </div>

        <!-- Column 3: Global Company dropdown -->
        <div class="col-auto">
          <div class="row items-center text-weight-bold">
            Company:
            <span>
              <q-select
                v-model="selectedCompany"
                :options="companyOptions"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                dense
                outlined
                class="q-ml-sm"
              />
            </span>
          </div>
        </div>
      </div>
      <div class="transaction-table">
        <!-- Table Headers -->
        <div
          class="row row-col-header text-p text-center text-uppercase text-weight-bold"
        >
          <div class="col-5 header-bordered text-weight-bold">Item</div>
          <div class="col-1 header-bordered text-weight-bold">Job</div>
          <div class="col header-bordered text-weight-bold">Price</div>
          <div class="col header-bordered text-weight-bold">Qty</div>
          <div class="col header-bordered text-weight-bold">S.total</div>
        </div>

        <!-- Render each transaction item if there are items in the list -->
        <div v-if="transactionItems.length" class="row-col-body">
          <div
            v-for="(item, index) in transactionItems"
            :key="item.id ?? index"
            class="row row-col-row text-p text-center"
          >
            <div class="col-5 bordered text-left q-pl-sm justify-between row">
              <div>{{ displayItemName(item) }}</div>
              <q-icon
                color="red-8"
                name="delete"
                size="sm"
                @click="notifyDelete(index)"
              />
            </div>
            <div class="col-1 bordered">
              {{ formatProcessText(item.process) }}
            </div>
            <div class="col bordered">
              {{ formatPriceWithUnit(item.price, item) }}
            </div>
            <div class="col bordered">
              <q-input
                dense
                outlined
                type="number"
                step="0.01"
                input-class="text-center"
                :model-value="formatQtyDisplay(item)"
                @update:model-value="(val) => onQtyLikeChange(index, val)"
              />

              <!-- Line 2: unit (existing behavior) -->
              <div class="q-pl-xs text-weight-bold text-blue-10">
             {{ unitLabelForRow(item) }}
                <!-- Line 3: show × pcs for sqft items -->
                <span
                  v-if="item.unit === 'sqft' && Number(item.pieces ?? 0) > 0"
                  class="text-weight-bold text-green-9"
                >
                  × {{ item.pieces }} pcs
                </span>

                <span
                  v-if="
                    (item.unit === 'kg' || item.unit === 'lbs') &&
                    Number(item.pieces ?? 0) > 0
                  "
                  class="text-weight-bold text-green-9"
                >
                  ({{ Math.trunc(item.pieces) }} pcs)
                </span>
              </div>

              <!-- Line 4: optional – show computed total sqft -->
              <!-- <div
                  v-if="item.unit === 'sqft' && Number(item.pieces ?? 0) > 0"
                  class="q-pl-xs text-caption text-grey-7"
                >
                  (= {{ (getDisplayQty(item) * item.pieces).toFixed(2) }} sqft
                  total)
                </div> -->
            </div>

            <div class="col bordered">${{ item.subtotal.toFixed(2) }}</div>
          </div>
        </div>
        <!-- Display "No items on the list" if transactionItems is empty -->
        <div v-else class="text-center text-muted q-pa-md">
          No items on the list.
        </div>
        <!-- Total Row -->
        <div class="row row-col-footer text-weight-bold text-subtitle1">
          <div class="col bordered text-right text-uppercase">Total</div>
          <div class="col-2 col bordered text-red-10 text-center">
            ${{ totalAmount.toFixed(2) }}
          </div>
        </div>
      </div>

      <div class="text-p q-mt-sm text-weight-bold">
        Total Transactions: {{ transactionCount }}
      </div>
    </div>

    <!-- Quantity Dialog Box -->
    <q-dialog v-model="dialogQuantity" @hide="resetQuantityDialog">
      <q-card class="item-dialog">
        <q-toolbar class="item-toolbar">
          <q-avatar></q-avatar>

          <q-toolbar-title><span class=""></span></q-toolbar-title>

          <q-btn class="dialog-close" flat round icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section
          class="item-container-dialog column items-center q-gutter-y-sm"
        >
          <div class="inner-item-dialog row full-width window-height">
            <div class="left-item-dialog col-6">
              <div class="justify-center">
                <div class="text-h6 text-center text-weight-bold">
                  {{ selectedItem?.name }}
                </div>
                <div class="row justify-center">
                  <q-img
                    :src="selectedItem?.imageUrl"
                    style="height: 200px; width: 200px; object-fit: cover"
                  />
                </div>
              </div>

              <div class="row q-gutter-x-xl justify-center">
                <!-- Item Quantity Controls -->
                <div
                  v-if="selectedItem?.laundry_price !== null"
                  class="justify-center q-pa-sm"
                >
                  <div class="text-center q-pb-md text-p">
                    Laundry - ${{ selectedItem?.laundry_price.toFixed(2) }}
                  </div>
                  <div class="row">
                    <q-btn
                      flat
                      class="item-counter-buttons"
                      icon="remove"
                      @click="decreaseQuantity('laundry')"
                    />
                    <q-input
                      outlined
                      v-model="quantities.laundry"
                      class="item-counter-input q-pa-none q-mx-md"
                    />
                    <q-btn
                      flat
                      class="item-counter-buttons"
                      icon="add"
                      @click="increaseQuantity('laundry')"
                    />
                  </div>
                </div>

                <div
                  v-if="selectedItem?.dryclean_price !== null"
                  class="justify-center q-pa-sm"
                >
                  <div class="text-center q-pb-md text-p">
                    Dry Clean - ${{ selectedItem?.dryclean_price.toFixed(2) }}
                  </div>
                  <div class="row">
                    <q-btn
                      flat
                      class="item-counter-buttons"
                      icon="remove"
                      @click="decreaseQuantity('dryclean')"
                    />
                    <q-input
                      outlined
                      v-model="quantities.dryclean"
                      class="item-counter-input q-pa-none q-mx-md"
                    />
                    <q-btn
                      flat
                      class="item-counter-buttons"
                      icon="add"
                      @click="increaseQuantity('dryclean')"
                    />
                  </div>
                </div>

                <div
                  v-if="selectedItem?.pressing_price !== null"
                  class="justify-center q-pa-sm"
                >
                  <div class="text-center q-pb-md text-p">
                    Pressing Only - ${{
                      selectedItem?.pressing_price.toFixed(2)
                    }}
                  </div>
                  <div class="row">
                    <q-btn
                      flat
                      class="item-counter-buttons"
                      icon="remove"
                      @click="decreaseQuantity('pressing')"
                    />
                    <q-input
                      outlined
                      v-model="quantities.pressing"
                      class="item-counter-input q-pa-none q-mx-md"
                    />
                    <q-btn
                      flat
                      class="item-counter-buttons"
                      icon="add"
                      @click="increaseQuantity('pressing')"
                    />
                  </div>
                </div>

                <div
                  v-if="selectedItem?.others_price !== null"
                  class="justify-center q-pa-sm"
                >
                  <div class="text-center q-pb-md text-p">
                    Others - ${{ selectedItem?.others_price.toFixed(2) }}
                  </div>
                  <div class="row">
                    <q-btn
                      flat
                      class="item-counter-buttons"
                      icon="remove"
                      @click="decreaseQuantity('others')"
                    />
                    <q-input
                      outlined
                      v-model="quantities.others"
                      class="item-counter-input q-pa-none q-mx-md"
                    />
                    <q-btn
                      flat
                      class="item-counter-buttons"
                      icon="add"
                      @click="increaseQuantity('others')"
                    />
                  </div>
                </div>
              </div>
              <q-card-actions align="right">
                <q-btn
                  flat
                  label="Cancel"
                  color="negative"
                  @click="resetDialogs"
                />
                <q-btn
                  label="Add to Transaction"
                  color="primary"
                  @click="addItemToTransactionTable(quantity, 'pcs')"
                />
              </q-card-actions>
            </div>
            <div class="right-item-dialog col-6">
              <q-card flat class="card1">
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

              <q-card flat class="card2 q-mt-md">
                <div v-if="transactionStore.displayInstructions.length > 0">
                  <div
                    v-for="displayInstruction in transactionStore.displayInstructions"
                    :key="displayInstruction.id"
                    class="row justify-between per-instruction q-mb-sm"
                  >
                    <div>
                      <div class="text-p">
                        <span>
                          <q-icon
                            name="circle"
                            color="primary"
                            size="8px"
                            class="q-mr-sm q-ml-md"
                          />
                        </span>
                        {{ displayInstruction.description }}
                      </div>
                      <div class="instruction-chips q-ml-lg">
                        <q-chip
                          square
                          :color="
                            displayInstruction.type === 'onetime'
                              ? 'purple-10'
                              : 'pink-10'
                          "
                          text-color="white"
                          class="instructions-type"
                        >
                          {{
                            displayInstruction.type === "onetime"
                              ? "One-time"
                              : "Recurring"
                          }}
                        </q-chip>
                        <span> | </span>
                        <q-chip
                          v-for="section in displayInstruction.to"
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
                </div>
                <q-separator class="q-mb-lg" />
                <div v-if="transactionStore.instructions.length > 0">
                  <div
                    v-for="instruction in transactionStore.instructions"
                    :key="instruction.id"
                    class="row justify-between per-instruction q-mb-sm"
                  >
                    <div>
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
                            instruction.type === 'onetime'
                              ? 'purple-10'
                              : 'pink-10'
                          "
                          text-color="white"
                          class="instructions-type"
                        >
                          {{
                            instruction.type === "onetime"
                              ? "One-time"
                              : "Recurring"
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
                    <q-btn
                      dense
                      flat
                      icon="delete"
                      color="red"
                      @click="openDeleteDialog('instruction', instruction.id)"
                    />
                  </div>
                </div>
                <div v-else class="text-center text-grey">
                  No instructions added.
                </div>
              </q-card>

              <!-- Error Reporting Section -->
              <q-card flat class="card3 q-mt-md">
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
                      <q-btn
                        outline
                        color="primary"
                        label="Click Here to Capture Photo"
                        dense
                        class="outline-btn q-mt-sm"
                        @click="openCameraDialog"
                      />
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
                      <q-img
                        v-if="uploadedPhotoUrl"
                        :src="uploadedPhotoUrl"
                        class="q-mt-sm"
                        style="max-width: 300px; height: auto"
                      />
                    </div>

                    <q-dialog v-model="isCameraDialogOpen" persistent>
                      <q-card style="max-width: 500px">
                        <q-card-section class="dialog-header">
                          <div class="text-h6">Capture Photo</div>
                        </q-card-section>
                        <q-card-section class="dialog-body">
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

              <q-card flat class="card4 q-mt-md">
                <div v-if="transactionStore.reports.length > 0">
                  <div
                    v-for="report in transactionStore.reports"
                    :key="report.id"
                    class="row justify-between per-report"
                  >
                    <div>
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
                      <div class="q-ml-xl text-weight-bold text-red">
                        {{ report.category }} - {{ report.sub_category }}
                      </div>
                      <q-img
                        v-if="report.image"
                        :src="report.image"
                        class="q-mt-sm q-ml-lg"
                        style="max-width: 200px; height: auto"
                      />
                    </div>
                    <q-btn
                      dense
                      flat
                      icon="delete"
                      color="red"
                      @click="openDeleteDialog('report', report.id)"
                    />
                  </div>
                </div>
                <div v-else class="text-center text-grey">
                  No error reports added.
                </div>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Size Dialog Box -->
    <q-dialog v-model="dialogSize" @hide="resetSizeDialog">
      <q-card class="item-dialog">
        <q-toolbar class="item-toolbar">
          <q-avatar></q-avatar>
          <q-toolbar-title><span class=""></span></q-toolbar-title>
          <q-btn class="dialog-close" flat round icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section
          class="item-container-dialog column items-center q-gutter-y-sm"
        >
          <div class="inner-item-dialog row full-width">
            <div class="left-item-dialog col-6">
              <div class="justify-center">
                <div class="text-h6 text-center text-weight-bold">
                  {{ selectedItem?.name }}
                </div>
                <div class="row justify-center">
                  <q-img
                    :src="selectedItem?.imageUrl"
                    style="height: 200px; width: 200px; object-fit: cover"
                  />
                </div>
              </div>

              <div class="row items-center">
                <div class="text-weight-bold text-uppercase">Process:</div>
                <div v-if="selectedItem?.laundry_price !== null">
                  <div class="text-p">
                    <span>
                      <q-radio
                        v-model="process"
                        checked-icon="task_alt"
                        unchecked-icon="panorama_fish_eye"
                        val="laundry"
                      />
                    </span>
                    Laundry - ${{ selectedItem?.laundry_price.toFixed(2) }}
                  </div>
                </div>

                <div v-if="selectedItem?.dryclean_price !== null">
                  <div class="text-p">
                    <span>
                      <q-radio
                        v-model="process"
                        checked-icon="task_alt"
                        unchecked-icon="panorama_fish_eye"
                        val="dryclean"
                      />
                    </span>
                    Dry Clean - ${{ selectedItem?.dryclean_price.toFixed(2) }}
                  </div>
                </div>

                <div v-if="selectedItem?.pressing_price !== null">
                  <div class="text-p">
                    <span>
                      <q-radio
                        v-model="process"
                        checked-icon="task_alt"
                        unchecked-icon="panorama_fish_eye"
                        val="pressing"
                      />
                    </span>
                    Pressing Only - ${{
                      selectedItem?.pressing_price.toFixed(2)
                    }}
                  </div>
                </div>

                <div v-if="selectedItem?.others_price !== null">
                  <div class="text-p">
                    <span>
                      <q-radio
                        v-model="process"
                        checked-icon="task_alt"
                        unchecked-icon="panorama_fish_eye"
                        val="others"
                      />
                    </span>
                    Others - ${{ selectedItem?.others_price.toFixed(2) }}
                  </div>
                </div>
              </div>

              <!-- Shape -->
              <div class="row items-center">
                <div class="text-weight-bold text-uppercase">Shape:</div>
                <div class="text-p">
                  <span>
                    <q-radio
                      v-model="shapeSize"
                      checked-icon="task_alt"
                      unchecked-icon="panorama_fish_eye"
                      val="cornered"
                    />
                  </span>
                  Cornered (Square/Rectangle)
                </div>

                <div class="text-p">
                  <span>
                    <q-radio
                      v-model="shapeSize"
                      checked-icon="task_alt"
                      unchecked-icon="panorama_fish_eye"
                      val="circle"
                    />
                  </span>
                  Circle
                </div>

                <div class="text-p">
                  <span>
                    <q-radio
                      v-model="shapeSize"
                      checked-icon="task_alt"
                      unchecked-icon="panorama_fish_eye"
                      val="oval"
                    />
                  </span>
                  Oval
                </div>
              </div>

              <div class="row items-center">
                <div class="text-weight-bold text-uppercase">Unit:</div>
                <q-radio
                  v-model="unitSize"
                  checked-icon="task_alt"
                  unchecked-icon="panorama_fish_eye"
                  val="ft"
                />
                <div class="text-p">Feet and inches</div>

                <q-radio
                  v-model="unitSize"
                  checked-icon="task_alt"
                  unchecked-icon="panorama_fish_eye"
                  val="cm"
                />
                <div class="text-p">Centimeter</div>
              </div>

              <!-- Width and Breadth Input for Feet and Inches -->
              <div v-if="shapeSize === 'cornered'">
                <div v-if="unitSize === 'ft'" class="items-center">
                  <div class="row items-center">
                    <div class="text-weight-bold text-uppercase">Width:</div>
                    <span>
                      <div class="row items-center text-p">
                        <q-input
                          class="size-input"
                          outlined
                          dense
                          v-model="widthFeet"
                        />
                        <div
                          class="text-teal-9 text-weight-bold text-subtitle1"
                        >
                          ft
                        </div>
                        <q-input
                          dense
                          class="size-input"
                          outlined
                          v-model="widthInches"
                        />
                        <div
                          class="text-teal-9 text-weight-bold text-subtitle1"
                        >
                          in
                        </div>
                      </div>
                    </span>
                  </div>

                  <div class="row items-center">
                    <div class="text-weight-bold text-uppercase">Breadth:</div>
                    <span>
                      <div class="row items-center text-p">
                        <q-input
                          dense
                          class="size-input"
                          outlined
                          v-model="breadthFeet"
                        />
                        <div
                          class="text-teal-9 text-weight-bold text-subtitle1"
                        >
                          ft
                        </div>
                        <q-input
                          dense
                          class="size-input"
                          outlined
                          v-model="breadthInches"
                        />
                        <div
                          class="text-teal-9 text-weight-bold text-subtitle1"
                        >
                          in
                        </div>
                      </div>
                    </span>
                  </div>
                </div>

                <div v-if="unitSize === 'cm'">
                  <div class="row items-center">
                    <div class="text-weight-bold text-uppercase">Width:</div>
                    <span>
                      <div class="row items-center text-p">
                        <q-input
                          class="size-input"
                          dense
                          outlined
                          v-model="widthCm"
                        />
                        <div
                          class="text-teal-9 text-weight-bold text-subtitle1"
                        >
                          cm
                        </div>
                      </div>
                    </span>
                  </div>
                  <div class="row items-center">
                    <div class="text-weight-bold text-uppercase">Breadth:</div>
                    <span>
                      <div class="row items-center text-p">
                        <q-input
                          class="size-input"
                          dense
                          outlined
                          v-model="breadthCm"
                        />
                        <div
                          class="text-teal-9 text-weight-bold text-subtitle1"
                        >
                          cm
                        </div>
                      </div>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Circle Inputs -->
              <div v-if="shapeSize === 'circle'">
                <div class="row items-center">
                  <div class="text-weight-bold text-uppercase">Radius:</div>
                  <div class="row items-center text-p" v-if="unitSize === 'ft'">
                    <q-input class="size-input" outlined v-model="radiusFeet" />
                    <div class="text-teal-9 text-weight-bold text-subtitle1">
                      ft
                    </div>
                    <q-input
                      class="size-input"
                      outlined
                      v-model="radiusInches"
                    />
                    <div class="text-teal-9 text-weight-bold text-subtitle1">
                      in
                    </div>
                  </div>
                  <div class="row items-center text-p" v-if="unitSize === 'cm'">
                    <q-input class="size-input" outlined v-model="radiusCm" />
                    <div class="text-teal-9 text-weight-bold text-subtitle1">
                      cm
                    </div>
                  </div>
                </div>
              </div>

              <!-- Oval Inputs -->
              <div v-if="shapeSize === 'oval'">
                <div class="row items-center">
                  <div class="text-weight-bold text-uppercase">
                    Semi-Major Axis:
                  </div>
                  <div class="row items-center text-p" v-if="unitSize === 'ft'">
                    <q-input
                      dense
                      class="size-input"
                      outlined
                      v-model="semiMajorAxisFeet"
                    />
                    <div class="text-teal-9 text-weight-bold text-subtitle1">
                      ft
                    </div>
                  </div>
                  <div class="row items-center text-p" v-if="unitSize === 'cm'">
                    <q-input
                      dense
                      class="size-input"
                      outlined
                      v-model="semiMajorAxisCm"
                    />
                    <div class="text-teal-9 text-weight-bold text-subtitle1">
                      cm
                    </div>
                  </div>
                </div>

                <div class="row items-center">
                  <div class="text-weight-bold text-uppercase">
                    Semi-Minor Axis:
                  </div>
                  <div class="row items-center text-p" v-if="unitSize === 'ft'">
                    <q-input
                      dense
                      class="size-input"
                      outlined
                      v-model="semiMinorAxisFeet"
                    />
                    <div class="text-teal-9 text-weight-bold text-subtitle1">
                      ft
                    </div>
                  </div>
                  <div class="row items-center text-p" v-if="unitSize === 'cm'">
                    <q-input
                      dense
                      class="size-input"
                      outlined
                      v-model="semiMinorAxisCm"
                    />
                    <div class="text-teal-9 text-weight-bold text-subtitle1">
                      cm
                    </div>
                  </div>
                </div>
              </div>

              <!-- No. of pieces (for sqft items) -->
              <div class="row items-center">
                <div class="text-weight-bold text-uppercase">
                  No. of Pieces:
                </div>
                <span>
                  <q-input
                    dense
                    class="size-input"
                    outlined
                    v-model.number="piecesSize"
                    type="number"
                    min="0"
                  />
                </span>
              </div>

              <div class="row items-center">
                <div class="text-weight-bold text-uppercase">Total Area:</div>
                <span>
                  <div class="text-p">{{ totalArea }} sqft</div>
                </span>
              </div>

              <div class="row items-center">
                <div class="text-weight-bold text-uppercase">Total Price:</div>
                <span>
                  <div class="text-p">${{ totalSizePrice }}</div>
                </span>
              </div>

              <q-card-actions align="right">
                <q-btn
                  flat
                  label="Cancel"
                  color="negative"
                  @click="resetDialogs"
                />
                <q-btn
                  label="Add to Transaction"
                  color="primary"
                  @click="addItemToTransactionTable(quantity, 'sqft')"
                />
              </q-card-actions>
            </div>

            <div class="right-item-dialog col-6">
              <!-- (right side content unchanged for brevity) -->
              <!-- Keeping original instructions/reports UI -->
              <q-card flat class="card1">
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

              <!-- ...rest of replicated cards unchanged -->
              <q-card flat class="card2 q-mt-md">
                <div v-if="transactionStore.displayInstructions.length > 0">
                  <div
                    v-for="displayInstruction in transactionStore.displayInstructions"
                    :key="displayInstruction.id"
                    class="row justify-between per-instruction q-mb-sm"
                  >
                    <div>
                      <div class="text-p">
                        <span>
                          <q-icon
                            name="circle"
                            color="primary"
                            size="8px"
                            class="q-mr-sm q-ml-md"
                          />
                        </span>
                        {{ displayInstruction.description }}
                      </div>
                      <div class="instruction-chips q-ml-lg">
                        <q-chip
                          square
                          :color="
                            displayInstruction.type === 'onetime'
                              ? 'purple-10'
                              : 'pink-10'
                          "
                          text-color="white"
                          class="instructions-type"
                        >
                          {{
                            displayInstruction.type === "onetime"
                              ? "One-time"
                              : "Recurring"
                          }}
                        </q-chip>
                        <span> | </span>
                        <q-chip
                          v-for="section in displayInstruction.to"
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
                </div>
                <q-separator class="q-mb-lg" />
                <div v-if="transactionStore.instructions.length > 0">
                  <div
                    v-for="instruction in transactionStore.instructions"
                    :key="instruction.id"
                    class="row justify-between per-instruction q-mb-sm"
                  >
                    <div>
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
                            instruction.type === 'onetime'
                              ? 'purple-10'
                              : 'pink-10'
                          "
                          text-color="white"
                          class="instructions-type"
                        >
                          {{
                            instruction.type === "onetime"
                              ? "One-time"
                              : "Recurring"
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
                    <q-btn
                      dense
                      flat
                      icon="delete"
                      color="red"
                      @click="openDeleteDialog('instruction', instruction.id)"
                    />
                  </div>
                </div>
                <div v-else class="text-center text-grey">
                  No instructions added.
                </div>
              </q-card>

              <!-- Error Reporting repeated block ... -->
              <!-- Keeping as-is -->
              <!-- ... -->
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Weight Dialog Box -->
    <q-dialog v-model="dialogWeight" @hide="resetWeightDialog">
      <q-card class="item-dialog">
        <q-toolbar class="item-toolbar">
          <q-avatar></q-avatar>
          <q-toolbar-title><span class=""></span></q-toolbar-title>
          <q-btn class="dialog-close" flat round icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section
          class="item-container-dialog column items-center q-gutter-y-sm"
        >
          <div class="inner-item-dialog row full-width window-height">
            <div class="left-item-dialog col-6">
              <div class="justify-center">
                <div class="text-h6 text-center text-weight-bold">
                  {{ selectedItem?.name }}
                </div>
                <div class="row justify-center">
                  <q-img
                    :src="selectedItem?.imageUrl"
                    style="height: 200px; width: 200px; object-fit: cover"
                  />
                </div>
              </div>

              <div class="row items-center">
                <div class="text-weight-bold text-uppercase">Process:</div>
                <div v-if="selectedItem?.laundry_price !== null">
                  <div class="text-p">
                    <span>
                      <q-radio
                        v-model="process"
                        checked-icon="task_alt"
                        unchecked-icon="panorama_fish_eye"
                        val="laundry"
                      />
                    </span>
                    Laundry - ${{ selectedItem?.laundry_price.toFixed(2) }}
                  </div>
                </div>

                <div v-if="selectedItem?.dryclean_price !== null">
                  <div class="text-p">
                    <span>
                      <q-radio
                        v-model="process"
                        checked-icon="task_alt"
                        unchecked-icon="panorama_fish_eye"
                        val="dryclean"
                      />
                    </span>
                    Dry Clean - ${{ selectedItem?.dryclean_price.toFixed(2) }}
                  </div>
                </div>

                <div v-if="selectedItem?.pressing_price !== null">
                  <div class="text-p">
                    <span>
                      <q-radio
                        v-model="process"
                        checked-icon="task_alt"
                        unchecked-icon="panorama_fish_eye"
                        val="pressing"
                      />
                    </span>
                    Pressing Only - ${{
                      selectedItem?.pressing_price.toFixed(2)
                    }}
                  </div>
                </div>

                <div v-if="selectedItem?.others_price !== null">
                  <div class="text-p">
                    <span>
                      <q-radio
                        v-model="process"
                        checked-icon="task_alt"
                        unchecked-icon="panorama_fish_eye"
                        val="others"
                      />
                    </span>
                    Others - ${{ selectedItem?.others_price.toFixed(2) }}
                  </div>
                </div>
              </div>

              <!-- Unit -->
              <div class="row items-center">
                <div class="text-weight-bold text-uppercase">Unit:</div>
                <q-radio
                  v-model="unitWeight"
                  checked-icon="task_alt"
                  unchecked-icon="panorama_fish_eye"
                  val="kg"
                />
                <div class="text-p">Kilogram</div>

                <q-radio
                  v-model="unitWeight"
                  checked-icon="task_alt"
                  unchecked-icon="panorama_fish_eye"
                  val="lbs"
                />
                <div class="text-p">Pounds</div>
              </div>

              <div v-if="unitWeight === 'kg'" class="row items-center">
                <div class="text-weight-bold text-uppercase">Weight:</div>
                <q-input class="size-input" dense outlined v-model="weightKg" />
                <div>kg</div>
              </div>

              <div v-if="unitWeight === 'lbs'" class="row items-center">
                <div class="text-weight-bold text-uppercase">Weight:</div>
                <q-input
                  class="size-input"
                  dense
                  outlined
                  v-model="weightLbs"
                />
                <div>lbs</div>
              </div>

              <!-- Total Weight in Kilograms -->
              <div class="row items-center">
                <div class="text-weight-bold text-uppercase">Total Weight:</div>
                <span>
                  <div class="text-p">{{ convertWeightToKg() }} kg</div>
                </span>
              </div>

              <div class="row items-center">
                <div class="text-weight-bold text-uppercase">Total Price:</div>
                <span>
                  <div class="text-p">${{ totalWeightPrice }}</div>
                </span>
              </div>

              <div class="row items-center">
                <div class="text-weight-bold text-uppercase">
                  No. of Pieces:
                </div>
                <span>
                  <q-input
                    class="size-input"
                    dense
                    outlined
                    v-model.number="piecesWeight"
                    type="number"
                    min="0"
                  />
                </span>
              </div>
              <q-card-actions align="right">
                <q-btn
                  flat
                  label="Cancel"
                  color="negative"
                  @click="resetDialogs"
                />
                <q-btn
                  label="Add to Transaction"
                  color="primary"
                  @click="addItemToTransactionTable(quantity, 'kg')"
                />
              </q-card-actions>
            </div>

            <div class="right-item-dialog col-6">
              <!-- Right side content repeats; unchanged -->
              <!-- ... -->
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isDeleteDialogOpen" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="warning" color="red" size="32px" />
          <div class="q-ml-sm text-h6">
            Are you sure you want to delete this item?
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            label="Cancel"
            color="primary"
            @click="isDeleteDialogOpen = false"
          />
          <q-btn label="Delete" color="negative" @click="confirmDeleteItem" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { useQuasar } from "quasar";
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { fetchAllErrorItems } from "@/../supabase/api/error_list.js";
import debounce from "lodash.debounce";

import OthersComponent from "./OthersComponent.vue";

const $q = useQuasar();

const transactionStore = useTransactionStore();
const transactionItems = computed(() => transactionStore.transactionItems);

// References for items and dialog states
const searchItem = ref("");
const selectedItemCategory = ref(null);
const dialogQuantity = ref(false);
const dialogSize = ref(false);
const dialogWeight = ref(false);
const selectedItem = ref({});

// For size-based (sqft) items
const piecesSize = ref(1);

// For weight-based (kg/lbs) items
const piecesWeight = ref(0);

// laundry process options
const quantities = ref({
  laundry: 0,
  dryclean: 0,
  pressing: 0,
  others: 0,
});

const companyOptions = [
  { label: "CC", value: "cc" },
  { label: "DC", value: "dc" },
];

// Initialize default unit and shape for Size dialog
const process = ref("");
const unitSize = ref("ft");
const shapeSize = ref("cornered");

// Feet & Inches Inputs
const widthFeet = ref(0);
const widthInches = ref(0);
const breadthFeet = ref(0);
const breadthInches = ref(0);
const radiusFeet = ref(0);
const radiusInches = ref(0);
const semiMajorAxisFeet = ref(0);
const semiMinorAxisFeet = ref(0);

// Centimeter Inputs
const widthCm = ref(0);
const breadthCm = ref(0);
const radiusCm = ref(0);
const semiMajorAxisCm = ref(0);
const semiMinorAxisCm = ref(0);

// Weight Inputs
const unitWeight = ref("kg"); // Default unit for weight
const weightKg = ref(0);
const weightLbs = ref(0);

// Computed property to access transaction count
const transactionCount = computed(
  () => transactionStore.transactionItems.length
);

const selectedCompany = ref(companyOptions[0].value);

watch(
  transactionItems,
  (list) => {
    (list || []).forEach((it) => {
      const unit = String(it.unit || "").toLowerCase();
      const price = Number(it.price) || 0;

      // unify the "qty" used for math per unit
      let qty = 0;
      if (unit === "sqft" || unit === "sqm") {
        qty = Number(it.area ?? it.quantity ?? 0) || 0; // size rows
      } else if (unit === "kg" || unit === "lbs") {
        qty = Number(it.weight ?? it.quantity ?? 0) || 0; // weight rows
      } else {
        qty = Number(it.quantity ?? 0) || 0; // pc / others
      }

      // pieces multiplier only for size rows (default 1)
      const pcs =
        unit === "sqft" || unit === "sqm"
          ? Math.max(Number(it.pieces ?? 1) || 1, 1)
          : 1;

      it.subtotal = +(price * qty * pcs).toFixed(2);
    });
  },
  { deep: true, immediate: true }
);

watch(
  selectedCompany,
  (val) => {
    transactionItems.value.forEach((it) => (it.company = val));
  },
  { immediate: true }
);

/* Today (Asia/Manila) */
const orderDateDisplay = computed(() =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date())
);

// Computed property to calculate the total area based on shape and unit
const totalArea = computed(() => {
  if (shapeSize.value === "cornered") return computeCorneredArea();
  if (shapeSize.value === "circle") return computeCircleArea();
  if (shapeSize.value === "oval") return computeOvalArea();
  return 0;
});

// Computed property to calculate the total price based on area and process type
const totalSizePrice = computed(() => {
  const area = parseFloat(totalArea.value) || 0;
  const pricePerSqft = getPricePerSqft() || 0;
  const pcs = Number(piecesSize.value) || 1; // <- multiply by pieces
  return (area * pricePerSqft * pcs).toFixed(2);
});

const totalWeightPrice = computed(() => {
  const weightInKg =
    unitWeight.value === "kg"
      ? parseFloat(weightKg.value)
      : parseFloat(weightLbs.value) * 0.453592; // Convert lbs to kg
  const pricePerKg = getPricePerWeight(); // Price is always per kg
  return (weightInKg * pricePerKg).toFixed(2);
});

// Computed property for total quantity
const totalQuantity = computed(() => {
  return transactionItems.value.reduce((sum, item) => sum + item.quantity, 0);
});

// Computed property for total amount
const totalAmount = computed(() => {
  return transactionItems.value.reduce((sum, item) => sum + item.subtotal, 0);
});

const debouncedSearchItem = ref(searchItem.value);
const updateSearch = debounce((value) => {
  debouncedSearchItem.value = (value || "").toLowerCase();
}, 300);

watch(
  () => searchItem.value,
  (v) => updateSearch(v)
);

watch(
  () => totalAmount.value,
  (newTotal) => {
    transactionStore.totalAmount = newTotal;
  }
);

function convertWeightToKg() {
  return unitWeight.value === "kg"
    ? parseFloat(weightKg.value).toFixed(2)
    : (parseFloat(weightLbs.value) * 0.453592).toFixed(2);
}

onMounted(async () => {
  try {
    await transactionStore.generateOrderNo();
  } catch (error) {
    console.error("❌ Error initializing transaction:", error);
  }
});

onMounted(() => {
  if (!selectedItemCategory.value && categories.value?.length) {
    selectedItemCategory.value = categories.value[0];
  }
});

watch(
  () => transactionStore.selectedCustomer,
  async (cust) => {
    if (!cust) return;
    const gid = cust.pricing_group_id;
    console.log("👤 customer changed → pricing_group_id:", gid);
    if (
      gid &&
      typeof transactionStore.loadPricingItemsForCustomer === "function"
    ) {
      try {
        await transactionStore.loadPricingItemsForCustomer(cust.id, gid);
        console.log(
          "✅ loaded pricing items for group:",
          gid,
          "len:",
          transactionStore.pricingItems?.length
        );
      } catch (e) {
        console.error("❌ failed to load pricing items for group:", gid, e);
      }
    }
  },
  { immediate: true }
);

// Which catalog the UI would prefer to use
const catalogItemsRaw = computed(() =>
  transactionStore.itemCatalog?.length
    ? transactionStore.itemCatalog
    : transactionStore.pricingItems?.length
    ? transactionStore.pricingItems
    : transactionStore.items?.length
    ? transactionStore.items
    : []
);

// Who is the current customer's pricing group?
const currentPricingGroupId = computed(
  () => transactionStore.selectedCustomer?.pricing_group_id ?? null
);

// Does an item belong to that pricing group?
function isItemInPricingGroup(item, gid) {
  if (!gid) return false;

  // A) direct column on the item
  if (item.pricing_group_id != null) {
    return String(item.pricing_group_id) === String(gid);
  }

  // B) via any of its rates
  if (Array.isArray(item.pricing_group_rates)) {
    return item.pricing_group_rates.some(
      (r) =>
        String(r?.pricing_group_id ?? "") === String(gid) &&
        r?.is_active !== false
    );
  }

  return false;
}

// ✅ Only items that match the selected customer's pricing group
const itemsForCustomer = computed(() => {
  const gid = currentPricingGroupId.value;
  const src = catalogItemsRaw.value || [];
  return gid ? src.filter((it) => isItemInPricingGroup(it, gid)) : [];
});

function normalizeItem(item) {
  const rates = Array.isArray(item.pricing_group_rates)
    ? item.pricing_group_rates
    : [];
  const pick = (needle) => {
    const n = String(needle).toLowerCase();
    const r = rates.find((r) =>
      String(r?.service_type || "")
        .toLowerCase()
        .includes(n)
    );
    return r && r.is_active !== false ? Number(r.price) : null;
  };
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    sub_category: item.sub_category,
    unit: item.unit,
    pieces: item.pieces,
    tag_category: item.tag_category,
    pack_type: item.pack_type,
    turnaround_time: item.turnaround_time,
    company: item.company || null,
    laundry_price: pick("laundry"),
    dryclean_price: pick("dry"),
    pressing_price: pick("press"),
    others_price: pick("other"),
  };
}

// Use ONLY the items for this customer's pricing group
const normalizedItems = computed(() =>
  itemsForCustomer.value.map(normalizeItem)
);

const CATEGORY_UNCATEGORIZED = "Uncategorized";
function normalizeCategory(cat) {
  const c = (cat ?? "").toString().trim();
  return c ? c : CATEGORY_UNCATEGORIZED;
}
const categories = computed(() => {
  const set = new Set(
    itemsForCustomer.value.map((it) => normalizeCategory(it.category))
  );
  const arr = Array.from(set);
  if (!arr.some((c) => c.toLowerCase() === "custom item")) arr.push("custom item");
  return arr;
});

watch(
  () => categories.value,
  (cats) => {
    // no categories? show "others"
    if (!cats || cats.length === 0) {
      selectedItemCategory.value = "others";
      return;
    }

    const current = (selectedItemCategory.value || "").toLowerCase();
    const hasCurrent = cats.some((c) => c.toLowerCase() === current);

    if (!current || !hasCurrent) {
      selectedItemCategory.value = cats[0];
    }
  },
  { immediate: true }
);

watch(unitSize, (newUnit) => {
  if (newUnit === "cm") {
    widthFeet.value = 0;
    widthInches.value = 0;
    breadthFeet.value = 0;
    breadthInches.value = 0;
    radiusFeet.value = 0;
    radiusInches.value = 0;
    semiMajorAxisFeet.value = 0;
    semiMinorAxisFeet.value = 0;
  } else {
    widthCm.value = 0;
    breadthCm.value = 0;
    radiusCm.value = 0;
    semiMajorAxisCm.value = 0;
    semiMinorAxisCm.value = 0;
  }
});

watch(unitWeight, (newUnit) => {
  if (newUnit === "lbs") {
    weightKg.value = 0;
  } else {
    weightLbs.value = 0;
  }
});

const filteredItems = computed(() => {
  const search = (debouncedSearchItem.value || "").trim().toLowerCase();
  const selectedCat = (selectedItemCategory.value || "").toLowerCase();

  return normalizedItems.value.filter((item) => {
    const itemCat = normalizeCategory(item.category).toLowerCase();
    const name = (item.name || "").toLowerCase();

    const matchesCategory = !selectedCat || itemCat === selectedCat;
    const matchesSearch = !search || name.includes(search);

    return matchesCategory && matchesSearch;
  });
});

const groupedItems = computed(() => {
  const groups = {};
  filteredItems.value.forEach((item) => {
    const subCategory = item.sub_category || "Uncategorized";
    if (!groups[subCategory]) groups[subCategory] = [];
    groups[subCategory].push(item);
  });
  return groups;
});

const filterByCategory = (category) => {
  selectedItemCategory.value = category;
};

// Helper function to get price per square foot based on process type
function getPricePerSqft() {
  if (process.value === "laundry")
    return selectedItem.value?.laundry_price || 0;
  if (process.value === "dryclean")
    return selectedItem.value?.dryclean_price || 0;
  if (process.value === "pressing")
    return selectedItem.value?.pressing_price || 0;
  if (process.value === "others") return selectedItem.value?.others_price || 0;
  return 0;
}

// Helper function to get price per unit based on process type
function getPricePerWeight() {
  if (process.value === "laundry")
    return selectedItem.value?.laundry_price || 0;
  if (process.value === "dryclean")
    return selectedItem.value?.dryclean_price || 0;
  if (process.value === "pressing")
    return selectedItem.value?.pressing_price || 0;
  if (process.value === "others") return selectedItem.value?.others_price || 0;
  return 0; // Default price
}

// Conversion factor for cm to ft
const CM_TO_FT = 0.0328084;

// Function to compute area of a cornered shape, with cm-to-ft conversion if needed
function computeCorneredArea() {
  if (unitSize.value === "ft") {
    const totalWidth =
      parseFloat(widthFeet.value) + parseFloat(widthInches.value) / 12;
    const totalBreadth =
      parseFloat(breadthFeet.value) + parseFloat(breadthInches.value) / 12;
    return totalWidth * totalBreadth;
  }
  if (unitSize.value === "cm") {
    // Convert cm inputs to ft
    const totalWidth = parseFloat(widthCm.value) * CM_TO_FT;
    const totalBreadth = parseFloat(breadthCm.value) * CM_TO_FT;
    return totalWidth * totalBreadth;
  }
  return 0;
}

// Function to compute area of a circle, with cm-to-ft conversion if needed
function computeCircleArea() {
  let radius = 0;
  if (unitSize.value === "ft") {
    radius = parseFloat(radiusFeet.value) + parseFloat(radiusInches.value) / 12;
  } else if (unitSize.value === "cm") {
    // Convert cm radius to ft
    radius = parseFloat(radiusCm.value) * CM_TO_FT;
  }
  return Math.PI * Math.pow(radius, 2);
}

// Function to compute area of an oval, with cm-to-ft conversion if needed
function computeOvalArea() {
  if (unitSize.value === "ft") {
    const semiMajorAxis = parseFloat(semiMajorAxisFeet.value);
    const semiMinorAxis = parseFloat(semiMinorAxisFeet.value);
    return Math.PI * semiMajorAxis * semiMinorAxis;
  }
  if (unitSize.value === "cm") {
    // Convert cm inputs to ft
    const semiMajorAxis = parseFloat(semiMajorAxisCm.value) * CM_TO_FT;
    const semiMinorAxis = parseFloat(semiMinorAxisCm.value) * CM_TO_FT;
    return Math.PI * semiMajorAxis * semiMinorAxis;
  }
  return 0;
}

// Function to open the appropriate dialog based on the item unit type
function openDialog(item) {
  const unitType = detectUnitType(item.unit);
  selectedItem.value = item;

  if (unitType === "quantity") {
    dialogQuantity.value = true;
  } else if (unitType === "size") {
    dialogSize.value = true;
  } else if (unitType === "weight") {
    dialogWeight.value = true;
  } else {
    dialogQuantity.value = true;
  }
}

// Helper function to detect the unit type
function detectUnitType(unit) {
  const t =
    unit === "pc"
      ? "quantity"
      : unit === "sqft"
      ? "size"
      : unit === "kg" || unit === "lbs"
      ? "weight"
      : "quantity";
  return t;
}

// Quantity control functions
const increaseQuantity = (type) => {
  quantities.value[type]++;
};

const decreaseQuantity = (type) => {
  if (quantities.value[type] > 0) quantities.value[type]--;
};

// Reset functions
const resetQuantityDialog = () => {
  quantities.value = {
    laundry: 0,
    dryclean: 0,
    pressing: 0,
    others: 0,
  };
};

const resetSizeDialog = () => {
  process.value = "";
  shapeSize.value = "cornered";
  unitSize.value = "ft";
  widthFeet.value = 0;
  widthInches.value = 0;
  breadthFeet.value = 0;
  breadthInches.value = 0;
  radiusFeet.value = 0;
  radiusInches.value = 0;
  semiMajorAxisFeet.value = 0;
  semiMinorAxisFeet.value = 0;
  widthCm.value = 0;
  breadthCm.value = 0;
  radiusCm.value = 0;
  semiMajorAxisCm.value = 0;
  semiMinorAxisCm.value = 0;
  piecesSize.value = 1;
};

const resetWeightDialog = () => {
  process.value = "";
  unitWeight.value = "kg";
  weightKg.value = 0;
  weightLbs.value = 0;
  piecesWeight.value = 0;
};

function getPriceBasedOnProcess(processType = process.value) {
  if (!selectedItem.value) return 0;

  if (processType === "laundry") return selectedItem.value.laundry_price || 0;
  if (processType === "dryclean") return selectedItem.value.dryclean_price || 0;
  if (processType === "pressing") return selectedItem.value.pressing_price || 0;
  if (processType === "others") return selectedItem.value.others_price || 0;

  return 0;
}

function addItemToTransactionTable() {
  if (!selectedItem.value) return;

  const unitType = detectUnitType(selectedItem.value.unit);

  const getPriceBasedOnProcessLocal = (processType) => {
    return processType === "laundry"
      ? selectedItem.value.laundry_price
      : processType === "dryclean"
      ? selectedItem.value.dryclean_price
      : processType === "pressing"
      ? selectedItem.value.pressing_price
      : selectedItem.value.others_price ?? selectedItem.value.price ?? 0;
  };

  const baseTemplate = {
    name: selectedItem.value.name,
    process: process.value,
    price: getPriceBasedOnProcessLocal(process.value),
    unit: selectedItem.value.unit,
    quantity: 1,
    pieces: selectedItem.value.pieces ?? 0, // per-unit (for pc)
    pieces_per_unit: selectedItem.value.pieces ?? 0,
    subtotal: 0,
    category: selectedItem.value.category,
    tag_category: selectedItem.value.tag_category,
    company: selectedItem.value.company,
  };

  if (unitType === "size") {
    const areaPerPiece = Number(totalArea.value) || 0; // e.g. 3.2 sqft
    const pcs = Number(piecesSize.value) || 1; // how many pcs for this line
    const price = baseTemplate.price || 0;

    const newItem = {
      ...baseTemplate,
      id: Date.now(), // 🚫 ensure each size item is its own row
      area: areaPerPiece, // what we show as "qty"
      quantity: areaPerPiece, // Qty column shows 3.2
      pieces: pcs, // for DB / backend logic
      pieces_per_unit: null, // not used for size pricing display
      subtotal: price * areaPerPiece * pcs, // price × sqft × pcs
    };

    transactionStore.transactionItems.push(newItem);

    resetSizeDialog();
    dialogSize.value = false;
    return;
  }

  // 🔹 2) WEIGHT-BASED: unit = 'kg' or 'lbs'
  if (unitType === "weight") {
    const weightRaw =
      unitWeight.value === "kg"
        ? Number(weightKg.value)
        : Number(weightLbs.value) * 0.453592;

    const weight = Number(weightRaw) || 0;
    const price = baseTemplate.price || 0;

    transactionStore.addItem({
      ...baseTemplate,
      weight,
      quantity: weight,
      pieces: Number(piecesWeight.value) || 0,
      pieces_per_unit: null,
      subtotal: price * weight,
    });

    resetWeightDialog();
    dialogWeight.value = false;
    return;
  }

  // 🔹 3) QUANTITY-BASED: unit = 'pc'
  Object.keys(quantities.value).forEach((processType) => {
    const qty = Number(quantities.value[processType] || 0);
    if (qty <= 0) return;

    const price = getPriceBasedOnProcessLocal(processType);
    const perUnit =
      Number(baseTemplate.pieces_per_unit ?? baseTemplate.pieces ?? 1) || 1;
    const totalPieces = qty * perUnit;

    transactionStore.addItem({
      ...baseTemplate,
      process: processType,
      price,
      quantity: qty,
      pieces: totalPieces,
      subtotal: (price || 0) * qty,
    });
  });

  resetQuantityDialog();
  dialogQuantity.value = false;
}

function formatProcessText(process) {
  switch (process) {
    case "laundry":
      return "L";
    case "dryclean":
      return "DC";
    case "pressing":
      return "PO";
    case "others":
      return "O";
    default:
      return process;
  }
}

const handleAddItem = (item) => {
  transactionStore.addItem(item); // Add to store
};

const uploadedPhotoUrl = ref(null); // Holds the uploaded photo's URL
const uploader = ref(null); // Reference for the q-uploader
const localReports = ref([]); // Array to store reports locally

const instructionsType = ref("onetime");
const instructionsDesc = ref("");
const instructionsTo = ref([]);

const reportCategories = ref([]);
const reportSubCategories = ref([]);
const reportDesc = ref("");

const selectedCategory = ref("");
const selectedSubCategory = ref("");

// Functions to add/delete instructions and reports
function addInstruction() {
  if (!instructionsDesc.value.trim()) {
    console.error("Instruction description is required.");
    return;
  }

  if (instructionsTo.value.length === 0) {
    console.error("At least one instruction category must be selected.");
    return;
  }

  const newInstruction = {
    id: Date.now(),
    type: instructionsType.value,
    description: instructionsDesc.value.trim(),
    to: [...instructionsTo.value],
  };

  try {
    transactionStore.addInstruction(newInstruction);

    // Reset input fields
    instructionsType.value = "onetime";
    instructionsDesc.value = "";
    instructionsTo.value = [];
  } catch (error) {
    console.error("❌ Error adding instruction to the store:", error);
  }
}

function deleteInstruction(id) {
  const instructionIndex = transactionStore.instructions.findIndex(
    (instruction) => instruction.id === id
  );
  if (instructionIndex > -1) {
    transactionStore.instructions.splice(instructionIndex, 1);
  } else {
    console.error(`❌ Instruction ${id} not found.`);
  }
}

function addErrorReport() {
  if (reportDesc.value && selectedCategory.value && selectedSubCategory.value) {
    const payload = {
      id: Date.now(),
      category: selectedCategory.value,
      sub_category: selectedSubCategory.value,
      description: reportDesc.value,
      image: uploadedPhotoUrl.value || null,
    };

    transactionStore.addReport(payload);

    reportDesc.value = "";
    selectedCategory.value = "";
    selectedSubCategory.value = "";
    uploadedPhotoUrl.value = null;

    if (uploader.value) uploader.value.reset();
  } else {
    console.error("❌ All fields must be filled to add a report.");
  }
}

function deleteReport(id) {
  const reportIndex = transactionStore.reports.findIndex(
    (report) => report.id === id
  );
  if (reportIndex > -1) {
    transactionStore.reports.splice(reportIndex, 1);
  } else {
    console.error(`❌ Report ${id} not found.`);
  }
}

// Load report categories and sub-categories on mount
onMounted(async () => {
  const items = await fetchAllErrorItems();
  const categoriesSet = new Set(items.map((item) => item.category));
  reportCategories.value = Array.from(categoriesSet);

  if (reportCategories.value.length > 0) {
    selectedCategory.value = reportCategories.value[0];
    updateSubCategories(selectedCategory.value);
  }
});

async function updateSubCategories(category) {
  const items = await fetchAllErrorItems();
  reportSubCategories.value = items
    .filter((item) => item.category === category)
    .map((item) => item.sub_category);
  selectedSubCategory.value = "";
}

// Watch for changes in `selectedCategory` and update sub-categories
watch(selectedCategory, (newCategory) => {
  if (newCategory) {
    updateSubCategories(newCategory);
  }
});

// Computed property to filter sub-categories based on selected category
const filteredSubCategories = computed(() => {
  return reportSubCategories.value;
});

// Utility methods
function getSectionColor(section) {
  return (
    {
      cleaning: "teal",
      packing: "orange",
      pickingsending: "red",
      admin: "cyan",
    }[section] || "grey"
  );
}

function formatSectionLabel(section) {
  return (
    {
      cleaning: "Cleaning",
      packing: "Packing",
      pickingsending: "Picking/Sending",
      admin: "Admin",
    }[section] || section
  );
}

// Reactive variables
const videoStream = ref(null); // Video stream for the camera
const isCameraDialogOpen = ref(false); // Tracks if the camera dialog is open
const videoElement = ref(null); // Reference to the video element

/**
 * Opens the camera dialog and initializes the video stream.
 */
async function openCameraDialog() {
  try {
    isCameraDialogOpen.value = true;
    await nextTick();

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoStream.value = stream;

    if (videoElement.value) {
      videoElement.value.srcObject = stream;
    } else {
      console.error("❌ Video element is not available.");
    }
  } catch (error) {
    console.error("❌ Error accessing the camera:", error);
    closeCameraDialog();
  }
}

/**
 * Captures a photo from the camera feed and stores it as a Base64 URL.
 */
function capturePhoto() {
  try {
    if (!videoElement.value) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoElement.value.videoWidth;
    canvas.height = videoElement.value.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height);

    uploadedPhotoUrl.value = canvas.toDataURL("image/png");

    closeCameraDialog();
  } catch (error) {
    console.error("❌ Error capturing photo:", error);
  }
}

/**
 * Closes the camera dialog and stops the video stream.
 */
function closeCameraDialog() {
  if (videoStream.value) {
    const tracks = videoStream.value.getTracks();
    tracks.forEach((track) => track.stop());
    videoStream.value = null;
  }
  isCameraDialogOpen.value = false;
}

/**
 * Clears the uploaded or captured photo.
 */
function clearUploadedPhoto() {
  uploadedPhotoUrl.value = null;
  if (uploader.value) {
    uploader.value.reset();
  }
  closeCameraDialog();
}

function notifyDelete(index) {
  const item = transactionStore.transactionItems[index];
  if (!item) return;

  const name = item.name || "Item";
  const processLabel = item.process;
const priceLabel = formatPriceWithUnit(item.price, item);
  const qty = Number(item.quantity ?? 0);
  const subtotal = Number(item.subtotal ?? 0).toFixed(2);

  $q.notify({
    classes: "bg-grey-11 text-dark",
    html: true,
    position: "center",
    timeout: 0,
    multiLine: true,
    icon: "warning",
    message: `
    <div style="min-width:460px;max-width:92vw;">
      <div class="text-h6 bg-primary text-uppercase text-white q-pa-sm text-weight-bold">
        Confirm delete item
      </div>
      <div class="q-pa-md">
        <div class="text-black text-h6 text-weight-bold">${name}</div>
        <div class="all-border q-mt-sm text-grey-9">
          <div>Process: ${processLabel}</div>
          <div>Price: ${priceLabel}</div>
          <div>Qty: ${qty}</div>
          <div>Subtotal: $${subtotal}</div>
        </div>
      </div>
    </div>
  `,
    actions: [
      { label: "Cancel", unelevated: true, class: "bg-secondary text-white" },
      {
        label: "Delete",
        unelevated: true,
        class: "q-ml-sm bg-negative text-white",
        handler: () => removeItem(index),
      },
    ],
  });
}

const removeItem = (index) => {
  if (index >= 0 && index < transactionStore.transactionItems.length) {
    transactionStore.transactionItems.splice(index, 1);
  } else {
    console.error("❌ Invalid index for removal:", index);
  }
};

function getDisplayQty(item) {
  if (item.unit === "kg" || item.unit === "lbs")
    return item.weight ?? item.quantity ?? 0;
  if (item.unit === "sqft") return item.area ?? item.quantity ?? 0;
  return item.quantity ?? 0;
}

/** Format Qty: 2 decimals when unit ≠ 'pc'; integer for 'pc' */
function formatQtyDisplay(item) {
  const unit = String(item.unit || "").toLowerCase();
  const q = Number(getDisplayQty(item) ?? 0);
  if (!Number.isFinite(q)) return unit === "pc" ? "0" : "0.00";
  return unit === "pc" ? String(Math.trunc(q)) : q.toFixed(2);
}

function onQtyLikeChange(rowIndex, val) {
  const item = transactionStore.transactionItems[rowIndex];
  if (!item) return;

  let qty = parseFloat(val);
  if (Number.isNaN(qty) || qty < 0) qty = 0;

  if (item.unit === "kg" || item.unit === "lbs") {
    item.weight = qty;
    item.quantity = qty;
    item.subtotal = (item.price || 0) * qty;
    return;
  }

  if (item.unit === "sqft") {
    item.area = qty;
    item.quantity = qty;

    const pcs = Number(item.pieces ?? 1) || 1;
    item.subtotal = (item.price || 0) * qty * pcs; // ✅ keep area × pcs
    return;
  }

  item.quantity = qty;
  item.subtotal = (item.price || 0) * qty;
}

/** is this row a "set" item for display? (unit pc + pieces per unit > 1) */
function isSetItem(row) {
  const unit = String(row?.unit || '').toLowerCase();
  if (unit !== 'pc') return false;
  const perUnit = Number(row?.pieces_per_unit ?? row?.pieces ?? 0);
  return perUnit > 1;
}

/** show 'set' for display only; DB keeps unit = 'pc' */
function unitLabelForRow(row) {
  if (isSetItem(row)) return 'set';
  // fall back to your existing label mapping
  return unitLabel(row.unit);
}

/** keep your existing version if used elsewhere */
function unitLabel(unit) {
  if (!unit) return '';
  const u = String(unit).toLowerCase();
  if (u === 'pc') return 'pcs'; // display 'pcs' when not a set
  return unit;
}

/** format price with display unit; use 'set' for pc items with pieces_per_unit > 1 */
function formatPriceWithUnit(price, rowOrUnit) {
  if (price === 'TBA') return 'TBA';

  // accept old call signature (price, unit) and the new one (price, item)
  let displayUnit = '';
  if (typeof rowOrUnit === 'object' && rowOrUnit !== null) {
    displayUnit = isSetItem(rowOrUnit)
      ? 'set'
      : unitLabel(rowOrUnit.unit);
  } else {
    // legacy: (price, unit)
    displayUnit = unitLabel(rowOrUnit);
  }

  if (typeof price === 'number') {
    return `$${price.toFixed(2)} / ${displayUnit}`;
  }
  return `$0.00 / ${displayUnit || ''}`.trim();
}

/** Item name: don't append pieces when unit=pc and per-unit pieces > 1 */
function displayItemName(item) {
  const unit = String(item.unit || '').toLowerCase();
  if (unit !== 'pc') {
    return item.name || '';
  }

  const perUnit = Number(item.pieces_per_unit ?? item.pieces ?? 0);
  // requirement: if pieces > 1, DON'T append to name
  if (perUnit > 1) return item.name || '';

  // keep old behavior for 1pc (or unknown/0 -> no suffix)
  if (perUnit === 1) return `${item.name} (1pc)`;
  return item.name || '';
}


</script>
