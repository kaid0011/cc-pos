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
        <div v-if="selectedItemCategory !== 'Others'" class="search-container">
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
        <div v-if="selectedItemCategory !== 'Others'" class="item-list">
          <div
            class="q-pa-md"
            v-for="(group, subCategory) in groupedItems"
            :key="subCategory"
          >
            <div
              class="text-h6 text-uppercase text-weight-bolder text-center q-py-sm"
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
                  <div class="item-name">{{ item.name }}</div>
                </q-btn>
              </div>
            </div>
          </div>
        </div>
        <!-- Others Category Section -->
        <div v-else class="others-container">
          <OthersComponent @add-item="handleAddItem" />
        </div>
      </div>
    </div>

    <div class="right-container col-7">

      <div class="row q-gutter-x-md items-center text-p">
        <div class="col">
          <div>
            Order No:
          </div></div>
        <!-- Customer Name -->
        <div class="col">
          <div>
            Customer Name:
          </div>
        </div>

        <!-- Contact No -->
        <div class="col">
          <div>
            Contact Nos:
          </div>
        </div>

        <!-- Email -->
        <div class="col">
          <div>
            Email:
          </div>
        </div>
      </div>
      <div class="row q-gutter-x-md items-center text-p">
        <div class="col">
          <div>
            <span class="text-summary">{{
              transactionStore.orderNo || "-"
            }}</span>
          </div></div>
        <!-- Customer Name -->
        <div class="col">
          <div>
            <span class="text-summary">{{
              transactionStore.selectedCustomer?.name || "-"
            }}</span>
          </div>
        </div>

        <!-- Contact No -->
        <div class="col">
          <div>
            <span class="text-summary">{{
              transactionStore.selectedCustomer?.contact_no1 || "N/A"
            }} / {{
              transactionStore.selectedCustomer?.contact_no2 || "-"
            }}</span>
          </div>
        </div>

        <!-- Email -->
        <div class="col">
          <div>
            <span class="text-summary">{{
              transactionStore.selectedCustomer?.email || "-"
            }}</span>
          </div>
        </div>
      </div>

      <div class="transaction-table">
        <!-- Table Headers -->
        <div
          class="row row-col-header text-p text-center text-uppercase text-weight-bold"
        >
          <div class="col-5 col bordered text-weight-bolder">Item</div>
          <div class="col-2 col bordered text-weight-bolder">Process</div>
          <div class="col-1 col bordered text-weight-bolder">Price</div>
          <div class="col-1 col bordered text-weight-bolder">Qty</div>
          <div class="col-2 col bordered text-weight-bolder">Subtotal</div>
          <div class="col-1 col bordered text-weight-bolder"></div>
        </div>

        <!-- Render each transaction item if there are items in the list -->
        <div v-if="transactionItems.length" class="row-col-body">
          <div
            v-for="(item, index) in transactionItems"
            :key="index"
            class="row row-col-row text-p text-center"
          >
            <div class="col-5 col bordered ellipsis text-left q-pl-sm">
              {{ item.name }}
            </div>
            <div class="col-2 col bordered">
              {{ formatProcessText(item.process) }}
            </div>
            <div class="col-1 col bordered">
              {{ formatPriceWithUnit(item.price, item.unit) }}
            </div>
            <div class="col-1 col bordered">{{ item.quantity }}</div>
            <div class="col-2 col bordered">
              ${{ item.subtotal.toFixed(2) }}
            </div>
            <div class="col-1 col bordered">
              <q-btn flat class="trash-icon" icon="delete" @click="removeItem(index)" />
            </div>
          </div>
        </div>
        <!-- Display "No items on the list" if transactionItems is empty -->
        <div v-else class="text-center text-muted q-pa-md">
          No items on the list.
        </div>
        <!-- Total Row -->
        <div
          class="row row-col-footer text-p text-center text-weight-bolder items-center"
        >
          <div class="col-5 text-left q-pl-sm text-uppercase">Total</div>
          <div class="col-2"></div>
          <div class="col-1 col bordered"></div>
          <div class="col-1 col bordered">{{ totalQuantity }}</div>
          <div class="col-2 col bordered">${{ totalAmount.toFixed(2) }}</div>
          <div class="col-1"></div>
        </div>
      </div>

      <div class="text-p q-mt-sm text-weight-bold">
        <!-- Display transaction item count from store -->
        Total Transactions: {{ transactionCount }}
      </div>

      <!-- <q-stepper-navigation>
        <div class="row justify-between">
          <q-btn @click="$emit('back')" color="primary" label="Back" />

          <div>
            <q-btn flat color="primary" label="Reset" class="q-ml-sm" />
            <q-btn @click="$emit('next')" color="primary" label="Continue" />
          </div>
        </div>
      </q-stepper-navigation> -->
    </div>

    <!-- Quantity Dialog Box -->
    <q-dialog v-model="dialogQuantity" @hide="resetQuantityDialog">
      <q-card class="item-dialog">
        <q-toolbar class="item-toolbar">
          <q-avatar>
            <!-- <img src="https://cdn.quasar.dev/logo-v2/svg/logo.svg" /> -->
          </q-avatar>

          <q-toolbar-title><span class=""></span></q-toolbar-title>

          <q-btn class="dialog-close" flat round icon="close" v-close-popup />
        </q-toolbar>

        <!-- Card Section -->
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
                  <div class="text-p text-center text-uppercase text-weight-bold q-mb-sm">
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
                            displayInstruction.type === 'onetime' ? 'purple-10' : 'pink-10'
                            "
                            text-color="white"
                            class="instructions-type"
                          >
                            {{
                              displayInstruction.type === "onetime" ? "One-time" : "Recurring"
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
                  <q-separator class="q-mb-lg"/>
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
                              instruction.type === 'onetime' ? 'purple-10' : 'pink-10'
                            "
                            text-color="white"
                            class="instructions-type"
                          >
                            {{
                              instruction.type === "onetime" ? "One-time" : "Recurring"
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
                  <div v-else class="text-center text-grey">No instructions added.</div>
                </q-card>

                <!-- Error Reporting Section -->
                <q-card flat class="card3 q-mt-md">
                  <div class="text-p text-center text-uppercase text-weight-bold q-mb-sm">
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
                        <!-- File Uploader -->
                        <!-- <q-uploader
                          ref="uploader"
                          accept="image/*"
                          label="Attach a photo"
                          :auto-upload="false"
                          @added="handleFileUpload"
                          style="max-width: 300px"
                        /> -->
                        <!-- Capture Photo Button -->
                        <q-btn
                        outline
                          color="primary"
                          label="Click Here to Capture Photo"
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
                          style="max-width: 300px; height: auto;"
                        />
                      </div>
                    
                      <!-- Camera Dialog -->
                      <q-dialog v-model="isCameraDialogOpen" persistent>
                        <q-card style="max-width: 500px;">
                          <q-card-section class="dialog-header">
                            <div class="text-h6">Capture Photo</div>
                          </q-card-section>
                          <q-card-section class="dialog-body">
                            <!-- Add a ref to link the video element -->
                            <video ref="videoElement" autoplay playsinline disablePictureInPicture class="camera-feed styled-camera"></video>
                            <div align="right" class="q-mt-md">
                              <q-btn label="Close" color="negative" @click="closeCameraDialog" />
                              <q-btn color="primary" class="q-ml-sm" label="Capture" @click="capturePhoto" />
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
                  <div v-else class="text-center text-grey">No error reports added.</div>
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
          <q-avatar>
            <!-- <img src="https://cdn.quasar.dev/logo-v2/svg/logo.svg" /> -->
          </q-avatar>
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
                <div v-if="unitSize === 'ft'" class="row items-center">
                  <div class="text-weight-bold text-uppercase">Width:</div>
                  <span>
                    <div class="row items-center text-p">
                      <q-input class="size-input" filled v-model="widthFeet" />
                      <div>ft</div>
                      <q-input
                        class="size-input"
                        filled
                        v-model="widthInches"
                      />
                      <div>in</div>
                    </div>
                  </span>

                  <div class="text-weight-bold text-uppercase">Breadth:</div>
                  <span>
                    <div class="row items-center text-p">
                      <q-input
                        class="size-input"
                        filled
                        v-model="breadthFeet"
                      />
                      <div>ft</div>
                      <q-input
                        class="size-input"
                        filled
                        v-model="breadthInches"
                      />
                      <div>in</div>
                    </div>
                  </span>
                </div>

                <div v-if="unitSize === 'cm'" class="row items-center">
                  <div class="text-weight-bold text-uppercase">Width:</div>
                  <span>
                    <div class="row items-center text-p">
                      <q-input class="size-input" filled v-model="widthCm" />
                      <div>cm</div>
                    </div>
                  </span>

                  <div class="text-weight-bold text-uppercase">Breadth:</div>
                  <span>
                    <div class="row items-center text-p">
                      <q-input class="size-input" filled v-model="breadthCm" />
                      <div>cm</div>
                    </div>
                  </span>
                </div>
              </div>

              <!-- Circle Inputs -->
              <div v-if="shapeSize === 'circle'">
                <div class="row items-center">
                  <div class="text-weight-bold text-uppercase">Radius:</div>
                  <div class="row items-center text-p" v-if="unitSize === 'ft'">
                    <q-input class="size-input" filled v-model="radiusFeet" />
                    <div>ft</div>
                    <q-input class="size-input" filled v-model="radiusInches" />
                    <div>in</div>
                  </div>
                  <div class="row items-center text-p" v-if="unitSize === 'cm'">
                    <q-input class="size-input" filled v-model="radiusCm" />
                    <div>cm</div>
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
                      class="size-input"
                      filled
                      v-model="semiMajorAxisFeet"
                    />
                    <div>ft</div>
                  </div>
                  <div class="row items-center text-p" v-if="unitSize === 'cm'">
                    <q-input
                      class="size-input"
                      filled
                      v-model="semiMajorAxisCm"
                    />
                    <div>cm</div>
                  </div>
                </div>

                <div class="row items-center">
                  <div class="text-weight-bold text-uppercase">
                    Semi-Minor Axis:
                  </div>
                  <div class="row items-center text-p" v-if="unitSize === 'ft'">
                    <q-input
                      class="size-input"
                      filled
                      v-model="semiMinorAxisFeet"
                    />
                    <div>ft</div>
                  </div>
                  <div class="row items-center text-p" v-if="unitSize === 'cm'">
                    <q-input
                      class="size-input"
                      filled
                      v-model="semiMinorAxisCm"
                    />
                    <div>cm</div>
                  </div>
                </div>
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
              <q-card flat class="card1">
                <div class="text-p text-center text-uppercase text-weight-bold q-mb-sm">
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
                          displayInstruction.type === 'onetime' ? 'purple-10' : 'pink-10'
                          "
                          text-color="white"
                          class="instructions-type"
                        >
                          {{
                            displayInstruction.type === "onetime" ? "One-time" : "Recurring"
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
                <q-separator class="q-mb-lg"/>
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
                            instruction.type === 'onetime' ? 'purple-10' : 'pink-10'
                          "
                          text-color="white"
                          class="instructions-type"
                        >
                          {{
                            instruction.type === "onetime" ? "One-time" : "Recurring"
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
                <div v-else class="text-center text-grey">No instructions added.</div>
              </q-card>

              <!-- Error Reporting Section -->
              <q-card flat class="card3 q-mt-md">
                <div class="text-p text-center text-uppercase text-weight-bold q-mb-sm">
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
                      <!-- File Uploader -->
                      <!-- <q-uploader
                        ref="uploader"
                        accept="image/*"
                        label="Attach a photo"
                        :auto-upload="false"
                        @added="handleFileUpload"
                        style="max-width: 300px"
                      /> -->
                      <!-- Capture Photo Button -->
                      <q-btn
                      outline
                        color="primary"
                        label="Click Here to Capture Photo"
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
                        style="max-width: 300px; height: auto;"
                      />
                    </div>
                  
                    <!-- Camera Dialog -->
                    <q-dialog v-model="isCameraDialogOpen" persistent>
                      <q-card style="max-width: 500px;">
                        <q-card-section class="dialog-header">
                          <div class="text-h6">Capture Photo</div>
                        </q-card-section>
                        <q-card-section class="dialog-body">
                          <!-- Add a ref to link the video element -->
                          <video ref="videoElement" autoplay playsinline disablePictureInPicture class="camera-feed styled-camera"></video>
                          <div align="right" class="q-mt-md">
                            <q-btn label="Close" color="negative" @click="closeCameraDialog" />
                            <q-btn color="primary" class="q-ml-sm" label="Capture" @click="capturePhoto" />
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
                <div v-else class="text-center text-grey">No error reports added.</div>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Weight Dialog Box -->
    <q-dialog v-model="dialogWeight" @hide="resetWeightDialog">
      <q-card class="item-dialog">
        <q-toolbar class="item-toolbar">
          <q-avatar>
            <!-- <img src="https://cdn.quasar.dev/logo-v2/svg/logo.svg" /> -->
          </q-avatar>
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
                <q-input class="size-input" filled v-model="weightKg" />
                <div>kg</div>
              </div>

              <div v-if="unitWeight === 'lbs'" class="row items-center">
                <div class="text-weight-bold text-uppercase">Weight:</div>
                <q-input class="size-input" filled v-model="weightLbs" />
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
              <q-card flat class="card1">
                <div class="text-p text-center text-uppercase text-weight-bold q-mb-sm">
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
                          displayInstruction.type === 'onetime' ? 'purple-10' : 'pink-10'
                          "
                          text-color="white"
                          class="instructions-type"
                        >
                          {{
                            displayInstruction.type === "onetime" ? "One-time" : "Recurring"
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
                <q-separator class="q-mb-lg"/>
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
                            instruction.type === 'onetime' ? 'purple-10' : 'pink-10'
                          "
                          text-color="white"
                          class="instructions-type"
                        >
                          {{
                            instruction.type === "onetime" ? "One-time" : "Recurring"
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
                <div v-else class="text-center text-grey">No instructions added.</div>
              </q-card>

              <!-- Error Reporting Section -->
              <q-card flat class="card3 q-mt-md">
                <div class="text-p text-center text-uppercase text-weight-bold q-mb-sm">
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
                      <!-- File Uploader -->
                      <!-- <q-uploader
                        ref="uploader"
                        accept="image/*"
                        label="Attach a photo"
                        :auto-upload="false"
                        @added="handleFileUpload"
                        style="max-width: 300px"
                      /> -->
                      <!-- Capture Photo Button -->
                      <q-btn
                      outline
                        color="primary"
                        label="Click Here to Capture Photo"
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
                        style="max-width: 300px; height: auto;"
                      />
                    </div>
                  
                    <!-- Camera Dialog -->
                    <q-dialog v-model="isCameraDialogOpen" persistent>
                      <q-card style="max-width: 500px;">
                        <q-card-section class="dialog-header">
                          <div class="text-h6">Capture Photo</div>
                        </q-card-section>
                        <q-card-section class="dialog-body">
                          <!-- Add a ref to link the video element -->
                          <video ref="videoElement" autoplay playsinline disablePictureInPicture class="camera-feed styled-camera"></video>
                          <div align="right" class="q-mt-md">
                            <q-btn label="Close" color="negative" @click="closeCameraDialog" />
                            <q-btn color="primary" class="q-ml-sm" label="Capture" @click="capturePhoto" />
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
                <div v-else class="text-center text-grey">No error reports added.</div>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isDeleteDialogOpen" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="warning" color="red" size="32px" />
          <div class="q-ml-sm text-h6">Are you sure you want to delete this item?</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Cancel" color="primary" @click="isDeleteDialogOpen = false" />
          <q-btn label="Delete" color="negative" @click="confirmDeleteItem" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useTransactionStore } from "@/stores/transactionStore";
import { fetchAllErrorItems } from "@/../supabase/api/error_list.js";
import debounce from "lodash.debounce";

import OthersComponent from "./OthersComponent.vue";

const transactionStore = useTransactionStore();
const transactionItems = computed(() => transactionStore.transactionItems);

// Computed property to access transaction count
const transactionCount = computed(
  () => transactionStore.transactionItems.length
);

const categories = [
  "Clothings",
  "Beddings",
  "Upholsteries",
  "Miscellaneous",
  "Onsite Cleaning",
  "Others",
];

// Computed property for total quantity
const totalQuantity = computed(() => {
  return transactionItems.value.reduce((sum, item) => sum + item.quantity, 0);
});

// Computed property for total amount
const totalAmount = computed(() => {
  return transactionItems.value.reduce((sum, item) => sum + item.subtotal, 0);
});

// References for items and dialog states
const searchItem = ref("");
const selectedItemCategory = ref(null);
const dialogQuantity = ref(false);
const dialogSize = ref(false);
const dialogWeight = ref(false);
const selectedItem = ref({});

// laundry process options
const quantities = ref({
  laundry: 0,
  dryclean: 0,
  pressing: 0,
  others: 0,
});

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

function convertWeightToKg() {
  return unitWeight.value === "kg"
    ? parseFloat(weightKg.value).toFixed(2)
    : (parseFloat(weightLbs.value) * 0.453592).toFixed(2);
}

// Helper function to calculate five working days from today
function getFiveWorkingDaysFromToday() {
  const resultDate = new Date();
  let addedDays = 0;

  while (addedDays < 5) {
    resultDate.setDate(resultDate.getDate() + 1); // Move to the next day
    const dayOfWeek = resultDate.getDay();

    // Check if it's a weekday (1 = Monday, 5 = Friday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }

  return resultDate.toISOString().split("T")[0]; // Return in 'YYYY-MM-DD' format
}

const orderNo = computed(() => transactionStore.orderNo);

onMounted(async () => {
  try {
    await transactionStore.loadItems();
    await transactionStore.generateOrderNo();
    orderNo.value = transactionStore.orderNo; // Set directly for testing

  } catch (error) {
    console.error("Error initializing transaction:", error);
  }
});


// Watch for unit changes to reset incompatible inputs
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

// Watch for weight unit changes to reset incompatible inputs
watch(unitWeight, (newUnit) => {
  if (newUnit === "lbs") {
    weightKg.value = 0; // Reset kg weight input when switching to lbs
  } else {
    weightLbs.value = 0; // Reset lbs weight input when switching to kg
  }
});

// Load items from the store when component mounts
transactionStore.loadItems();

// Debounced search term to optimize performance
const debouncedSearchItem = ref(searchItem.value);
const updateSearch = debounce((value) => {
  debouncedSearchItem.value = value.toLowerCase();
}, 300);

// Watch the search input and apply debounce effect
watch(() => {
  updateSearch(searchItem.value);
});

// Computed property for filtering items
const filteredItems = computed(() => {
  return transactionStore.items.filter((item) => {
    const matchesCategory =
      !selectedItemCategory.value ||
      item.category === selectedItemCategory.value;
    const matchesSearch =
      !debouncedSearchItem.value ||
      item.name.toLowerCase().includes(debouncedSearchItem.value);
    return matchesCategory && matchesSearch;
  });
});

// Group filtered items by sub_category
const groupedItems = computed(() => {
  const groups = {};
  filteredItems.value.forEach((item) => {
    const subCategory = item.sub_category || "Uncategorized";
    if (!groups[subCategory]) groups[subCategory] = [];
    groups[subCategory].push(item);
  });
  return groups;
});

// Category filter function
const filterByCategory = (category) => {
  selectedItemCategory.value = category;
};

// Computed property to calculate the total area based on shape and unit
const totalArea = computed(() => {
  if (shapeSize.value === "cornered") return computeCorneredArea();
  if (shapeSize.value === "circle") return computeCircleArea();
  if (shapeSize.value === "oval") return computeOvalArea();
  return 0;
});

// Computed property to calculate the total price based on area and process type
const totalSizePrice = computed(() => {
  const area = parseFloat(totalArea.value);
  const pricePerSqft = getPricePerSqft();
  return (area * pricePerSqft).toFixed(2);
});

const totalWeightPrice = computed(() => {
  const weightInKg =
    unitWeight.value === "kg"
      ? parseFloat(weightKg.value)
      : parseFloat(weightLbs.value) * 0.453592; // Convert lbs to kg
  const pricePerKg = getPricePerWeight(); // Price is always per kg
  return (weightInKg * pricePerKg).toFixed(2);
});


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
  if (process.value === "laundry") return selectedItem.value?.laundry_price || 0;
  if (process.value === "dryclean") return selectedItem.value?.dryclean_price || 0;
  if (process.value === "pressing") return selectedItem.value?.pressing_price || 0;
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
  selectedItem.value = item;

  const unitType = detectUnitType(item.unit);

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
  if (unit === "pc") return "quantity";
  if (unit === "sqft") return "size";
  if (unit === "kg" || unit === "lbs") return "weight";
  return "quantity";
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
};

const resetWeightDialog = () => {
  process.value = "";
  unitWeight.value = "kg";
  weightKg.value = 0;
  weightLbs.value = 0;
};

// Helper function to get the correct price based on the process type
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

  // Helper function to get the price based on process
  const getPriceBasedOnProcess = (processType) => {
    return processType === "laundry"
      ? selectedItem.value.laundry_price
      : processType === "dryclean"
      ? selectedItem.value.dryclean_price
      : processType === "pressing"
      ? selectedItem.value.pressing_price
      : selectedItem.value.price; // Default price if no specific process price is available
  };

  let newItem = {
    name: selectedItem.value.name,
    process: formatProcessText(process.value),
    price: getPriceBasedOnProcess(process.value), // Set price using helper function
    unit: selectedItem.value.unit,
    quantity: 1, // Default to 1
    pieces: selectedItem.value.pieces,
    subtotal: 0, // Calculated below based on type
    category: selectedItem.value.category,
    tag_category: selectedItem.value.tag_category

  };

  // Handle size-based items
  if (unitType === "size") {
    const area = totalArea.value;
    newItem.name = `${selectedItem.value.name} (${area.toFixed(2)} sqft)`;
    newItem.area = area; // Add area to item data
    newItem.subtotal = newItem.price * area;
  }
  // Handle weight-based items
  else if (unitType === "weight") {
    const weight =
      unitWeight.value === "kg" ? weightKg.value : weightLbs.value * 0.453592; // Convert lbs to kg
    const displayWeight =
      unitWeight.value === "kg" ? weightKg.value : weightLbs.value;
    newItem.name = `${selectedItem.value.name} (${displayWeight} ${unitWeight.value})`;
    newItem.weight = weight; // Add weight to item data
    newItem.subtotal = newItem.price * weight;
  }
  // Handle quantity-based items with multiple processes
  else {
    Object.keys(quantities.value).forEach((processType) => {
      const quantity = quantities.value[processType];
      if (quantity > 0) {
        newItem.process = formatProcessText(processType);
        newItem.price = getPriceBasedOnProcess(processType); // Get price for each process type
        newItem.quantity = quantity;
        newItem.pieces = selectedItem.value.pieces * quantity;
        newItem.subtotal = newItem.price * quantity;

        // Send the item with quantity directly to the store
        transactionStore.addItem({ ...newItem });
      }
    });
    resetQuantityDialog(); // Reset after adding quantity-based items
    dialogQuantity.value = false; // Close quantity dialog
    return;
  }

  // Send finalized item to the store
  transactionStore.addItem(newItem);

  // Close the appropriate dialog after adding the item
  if (unitType === "size") {
    resetSizeDialog();
    dialogSize.value = false; // Close size dialog
  }
  if (unitType === "weight") {
    resetWeightDialog();
    dialogWeight.value = false; // Close weight dialog
  }
}

// Sync local state when global state changes
watch(
  () => transactionStore.transactionItems,
  (newItems) => {
    transactionItems.value = [...newItems];
  },
  { deep: true }
);

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

const handleAddItem = (item) => {
  transactionStore.addItem(item); // Add to store
};

function formatPriceWithUnit(price, unit) {
  if (price === "TBA") {
    // If the price is 'TBA', return it directly
    return "TBA";
  }

  // If the price is a valid number, format it with .toFixed()
  if (typeof price === "number") {
    return `$${price.toFixed(2)} / ${unit}`;
  }

  // Fallback for unexpected cases (e.g., null or undefined price)
  return `$0.00 / ${unit}`;
}

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

    // Reset input fields after successful addition
    instructionsType.value = "onetime";
    instructionsDesc.value = "";
    instructionsTo.value = [];
    console.log("Instruction added successfully:", newInstruction);
  } catch (error) {
    console.error("Error adding instruction to the store:", error);
  }
}

function deleteInstruction(id) {
  // Check if the instruction exists in the store
  const instructionIndex = transactionStore.instructions.findIndex((instruction) => instruction.id === id);
  if (instructionIndex > -1) {
    // Remove the instruction from the transaction store
    transactionStore.instructions.splice(instructionIndex, 1);
    console.log(`Instruction with ID ${id} deleted successfully.`);
  } else {
    console.error(`Instruction with ID ${id} not found.`);
  }
}


function addErrorReport() {
  if (reportDesc.value && selectedCategory.value && selectedSubCategory.value) {
    transactionStore.addReport({
      id: Date.now(), // Unique ID
      category: selectedCategory.value,
      sub_category: selectedSubCategory.value,
      description: reportDesc.value,
      image: uploadedPhotoUrl.value || null, // Add photo URL if uploaded
    });

    // Reset fields after adding the report
    reportDesc.value = "";
    selectedCategory.value = "";
    selectedSubCategory.value = "";
    uploadedPhotoUrl.value = null; // Clear uploaded photo URL

    // Reset the uploader
    if (uploader.value) {
      uploader.value.reset();
    }
  } else {
    console.error("All fields must be filled to add a report.");
  }
}

function deleteReport(id) {
  // Check if the report exists in the store
  const reportIndex = transactionStore.reports.findIndex((report) => report.id === id);
  if (reportIndex > -1) {
    // Remove the report from the transaction store
    transactionStore.reports.splice(reportIndex, 1);
    console.log(`Report with ID ${id} deleted successfully.`);
  } else {
    console.error(`Report with ID ${id} not found.`);
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


// Function to update sub-categories based on the selected category
async function updateSubCategories(category) {
  const items = await fetchAllErrorItems(); // Fetch error items if not in memory
  reportSubCategories.value = items
    .filter((item) => item.category === category)
    .map((item) => item.sub_category);
  selectedSubCategory.value = ""; // Reset selected sub-category
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
// function handleFileUpload(files) {
//   if (files.length === 0) {
//     console.error("No file uploaded.");
//     return;
//   }

//   const file = files[0]; // Get the first file from the array

//   const reader = new FileReader();
//   reader.onload = (event) => {
//     uploadedPhotoUrl.value = event.target.result; // Base64 URL of the uploaded photo
//   };

//   reader.readAsDataURL(file); // Read file as a data URL
// }

// Reactive variables
const videoStream = ref(null); // Video stream for the camera
const isCameraDialogOpen = ref(false); // Tracks if the camera dialog is open
const videoElement = ref(null); // Reference to the video element

/**
 * Opens the camera dialog and initializes the video stream.
 */
async function openCameraDialog() {
  try {
    // Ensure the video element is available after DOM updates
    isCameraDialogOpen.value = true; // Open the dialog
    await nextTick(); // Wait for the dialog to render

    // Access the user's camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoStream.value = stream;

    // Attach the video stream to the video element
    if (videoElement.value) {
      videoElement.value.srcObject = stream;
    } else {
      console.error("Video element is not available.");
    }
  } catch (error) {
    console.error("Error accessing the camera:", error);
    closeCameraDialog();
  }
}

/**
 * Captures a photo from the camera feed and stores it as a Base64 URL.
 */
function capturePhoto() {
  try {
    if (!videoElement.value) {
      console.error("Video element is not available.");
      return;
    }

    // Create a canvas element to capture the current frame from the video
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.value.videoWidth;
    canvas.height = videoElement.value.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height);

    // Convert the canvas to a Base64 image URL
    uploadedPhotoUrl.value = canvas.toDataURL("image/png");

    // Close the camera dialog after capturing
    closeCameraDialog();
    console.log("Photo captured successfully!");
  } catch (error) {
    console.error("Error capturing photo:", error);
  }
}

/**
 * Closes the camera dialog and stops the video stream.
 */
function closeCameraDialog() {
  if (videoStream.value) {
    const tracks = videoStream.value.getTracks();
    tracks.forEach((track) => track.stop()); // Stop all tracks
    videoStream.value = null;
  }
  isCameraDialogOpen.value = false; // Close the dialog
}

/**
 * Clears the uploaded or captured photo.
 */
function clearUploadedPhoto() {
  uploadedPhotoUrl.value = null; // Reset the photo URL
  if (uploader.value) {
    uploader.value.reset(); // Reset the uploader
  }
  closeCameraDialog(); // Ensure the camera is closed
}

const isDeleteDialogOpen = ref(false);
const deleteTarget = ref({ type: null, id: null }); // Store the type (instruction or report) and id

function openDeleteDialog(type, id) {
  deleteTarget.value = { type, id };
  isDeleteDialogOpen.value = true;
}

// Reuse the existing openDeleteDialog and confirmDeleteItem for instructions and reports.
function confirmDeleteItem() {
  const { type, id } = deleteTarget.value;

  if (type === "instruction") {
    deleteInstruction(id);
  } else if (type === "report") {
    deleteReport(id);
  }

  isDeleteDialogOpen.value = false;
  deleteTarget.value = { type: null, id: null };
}

const removeItem = (index) => {
  if (index >= 0 && index < transactionStore.transactionItems.length) {
    transactionStore.transactionItems.splice(index, 1);
  } else {
    console.error("Invalid index for removal:", index);
  }
};
</script>
