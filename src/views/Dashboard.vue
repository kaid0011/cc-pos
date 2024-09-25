<template>
  <div>
    <!-- Main Container -->
    <div class="container row">
      <!-- Left Container: Search Bar, Tabs, and Items -->
      <div class="left-container col-6">
        <!-- Category Tabs -->
        <q-tabs
          v-model="tab"
          class="text-black"
          align="justify"
          narrow-indicator
        >
          <q-tab
            v-for="category in categories"
            :key="category.name"
            :name="category.name"
            :icon="category.icon"
            :label="$t(category.name)"
          />
        </q-tabs>

        <!-- Tab Panels for Categories -->
        <q-tab-panels
          v-model="tab"
          animated
          transition-prev="jump-up"
          transition-next="jump-down"
          class="tab-list"
        >
          <q-tab-panel
            v-for="category in filteredCategories"
            :key="category.id"
            :name="category.name"
            class="q-pa-md"
          >
            <!-- Search Bar -->
            <q-input
              color="lime-11"
              bg-color="brown-3"
              filled
              debounce="300"
              :placeholder="$t('search_items')"
              v-model="searchQuery"
              @input="filterItems"
              class="search-input q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <!-- Sub-category Grouping -->
            <div
              v-for="(items, subCategory) in groupBySubCategory(category.items)"
              :key="subCategory"
            >
              <div
                class="text-h5 text-uppercase text-grey-4 text-weight-bold q-pb-md"
              >
                {{ subCategory }}
              </div>
              <!-- Sub-category Title -->

              <!-- Items under each sub-category -->
              <div class="row q-pa-sm q-col-gutter-md item-card-container">
                <div
                  v-for="item in items"
                  :key="item.id"
                  class="item-card q-pa-xs col-3"
                >
                  <q-btn
                    push
                    @click="openDialog(item)"
                    :class="[
                      'list-buttons',
                      getItemCardClass(item.sub_category),
                    ]"
                    class="q-pa-none"
                  >
                    <q-card flat class="list-cards">
                      <q-card-section class="q-pa-none">
                        <q-item>
                          <q-item-section>
                            <div
                              class="text-p text-bold"
                              style="line-height: 1.5"
                            >
                              {{ $t(`itemsList.${item.name}`) }}
                              <span
                                :class="{
                                  'text-blue-9': item.unit === 'kg',
                                  'text-pink': item.unit === 'sqft',
                                  'text-orange-9':
                                    item.unit !== 'kg' && item.unit !== 'sqft',
                                }"
                              >
                                [{{ item.unit }}]
                              </span>
                            </div>
                          </q-item-section>
                        </q-item>
                      </q-card-section>
                      <q-card-section
                        v-if="showImages"
                        class="item-image q-pa-none"
                      >
                        <q-img
                          :src="item.imageUrl"
                          style="height: 100px; width: 100px; object-fit: cover"
                        />
                      </q-card-section>
                    </q-card>
                  </q-btn>
                </div>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <!-- Right Container: Transaction Details and Actions -->
      <div class="right-container col-6 q-pl-md">
        <!-- Transaction List -->
        <div class="list-area">
          <div class="list-header q-py-xs">
            <div class="text-p text-bold">
              <!-- <span>
                <q-btn
                  dense
                  push
                  class="bg-orange-10 text-white rounded-borders"
                  :label="$t('switch')"
                  @click="switchTransaction"
                ></q-btn>
              </span> -->
              <span>
                {{ $t("transaction") }}
                <span class="text-primary text-h6">
                  '{{ currentTransaction }}'
                </span>
                {{ $t("items") }}
              </span>
            </div>
          </div>
            <div class="row d-flex justify-center bg-grey-6">
              <div class="table-cell col-4">
                <div class="text-p text-left">
                  {{ $t("item") }}
                </div>
              </div>

              <div class="table-cell col-2 text-center">
                <div class="text-p">
                  {{ $t("price") }}
                </div>
              </div>

              <div class="table-cell col-1 text-center">
                <div class="text-p">
                  {{ $t("pieces") }}
                </div>
              </div>

              <div class="table-cell col-1 text-center">
                <div class="text-p">
                  {{ $t("quantity") }}
                </div>
              </div>
              <div class="table-cell col-2 text-center">
                <div class="text-p">{{ $t("total") }}</div>
              </div>

              <div class="table-cell col-2 d-flex justify-center"></div>
            </div>
          <div class="scrollable-list">
            <!-- Transaction Items List -->
            <div
              class="row d-flex align-items-center"
              v-for="(item, index) in transactionItems"
              :key="item.name"
            >
              <!-- Name Column -->
              <div class="table-cell col-4">
                <div
                  class="text-p text-left text-blue-10"
                  style="line-height: 1.5"
                >
                  {{ $t(`itemsList.${item.name}`) }}
                  <span class="text-purple" v-if="item.unit === 'kg' || item.unit === 'sqft'">
                    ({{ item.size }} {{ item.unit }})
                  </span>
                  <span class="text-teal"> {{ item.suffix }} </span>
                </div>
              </div>

              <!-- Unit Price Column -->
              <div class="table-cell col-2 text-center">
                <div class="text-p">
                  ${{ item.unit_price }} <span> / {{ item.unit }}</span>
                </div>
              </div>

              <!-- Pieces Column -->
              <div class="table-cell col-1 text-center">
                <div class="text-p">
                  {{ item.pcs }}
                </div>
              </div>

              <!-- Quantity Column -->
              <div class="table-cell col-1 text-center">
                <div class="text-p">
                  {{ item.quantity }}
                </div>
              </div>
              <!-- Total Price Column -->
              <div class="table-cell col-2 text-center">
                <div class="text-p text-green-8">${{ item.price }}</div>
              </div>

              <!-- Actions Column -->
              <div class="table-cell col-2 d-flex justify-center">
                <q-btn
                  flat
                  class="edit-item"
                  icon="edit"
                  color="primary"
                  @click="editItem(item, index)"
                />
                <q-btn
                  flat
                  class="delete-item"
                  icon="delete"
                  color="negative"
                  @click="confirmDeleteItem(item)"
                />
              </div>
            </div>
            <!-- Conditionally display the row if totalQuantities is greater than 0 -->
            <div
              v-if="totalQuantities > 0"
              class="row d-flex align-items-center q-py-xs text-red"
            >
              <div class="table-cell col-4">
                <div class="text-p text-left text-uppercase">
                  {{ $t("total") }}
                </div>
              </div>

              <div class="table-cell col-2 text-center"></div>

              <div class="table-cell col-1 text-center">
                <div class="text-p">
                  {{ totalPieces }}
                </div>
              </div>

              <div class="table-cell col-1 text-center">
                <div class="text-p">
                  {{ totalQuantities }}
                </div>
              </div>

              <div class="table-cell col-2 text-center">
                <div class="text-p">${{ totalPrices.toFixed(2) }}</div>
              </div>

              <div class="table-cell col-2 d-flex justify-center"></div>
            </div>

            <!-- Display this message if totalQuantities is 0 -->
            <div v-else class="text-center q-pa-md text-h6 text-grey-8">
              {{ $t("no_items_in_transaction") }}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-area q-pa-md">
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-btn
                push
                :label="$t('customer_details')"
                @click="showAdditionalInfoDialog = true"
                class="action-buttons bg-warning full-width q-py-sm"
              ></q-btn>
            </div>
            <div class="col-3">
              <q-btn
                :label="$t('reset')"
                push
                class="action-buttons bg-negative text-white full-width q-py-sm"
                @click="confirmCancel"
              ></q-btn>
            </div>
            <!-- <div class="col-3">
              <q-btn
                :label="$t('switch')"
                push
                class="action-buttons bg-orange text-white full-width q-py-sm"
                @click="switchTransaction"
              ></q-btn>
            </div> -->
            <div class="col-3">
              <q-btn
                :label="$t('submit')"
                push
                class="action-buttons bg-positive text-white full-width q-py-sm"
                @click="submitTransaction"
              ></q-btn>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <q-dialog v-model="showQuantityDialog" persistent>
      <q-card>
        <q-bar>
          <q-space />
          <q-btn flat icon="close" v-close-popup></q-btn>
        </q-bar>
        <q-card-section>
          <q-input v-model="quantities.Laundry" label="Quantity" type="number" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn @click="addToTransaction" label="Add" color="primary" />
        </q-card-actions>
      </q-card>
    </q-dialog> -->

    <!-- Additional Info Dialog -->
    <q-dialog
      v-model="showAdditionalInfoDialog"
      backdrop-filter="brightness(50%)"
    >
      <q-card class="dialog-additional-info">
        <q-bar>
          <q-space></q-space>
          <q-btn
            dense
            flat
            class="bg-negative text-white"
            icon="close"
            v-close-popup
          >
            <q-tooltip class="bg-white text-primary">{{
              $t("close")
            }}</q-tooltip>
          </q-btn>
        </q-bar>
        <q-tabs
          v-model="additionalInfoTab"
          class="text-black"
          align="justify"
          narrow-indicator
        >
          <q-tab :name="'customerInfo'" :label="$t('customer_info')" />
          <q-tab :name="'instructions'" :label="$t('instructions')" />
        </q-tabs>
        <q-tab-panels
          v-model="additionalInfoTab"
          animated
          transition-prev="jump-up"
          transition-next="jump-down"
        >
          <!-- Customer Info Panel -->
          <q-tab-panel name="customerInfo">
            <q-card-section class="column items-center q-gutter-y-md">
              <!-- Customer Info Section -->
              <div class="full-width">
                <div class="text-caption text-uppercase text-p">
                  {{ $t("customer_name") }}
                </div>
                <q-input
                  v-model="currentCustomer.name"
                  filled
                  lazy-rules
                  class="full-width"
                />
              </div>
              <div class="full-width q-mt-sm">
                <div class="text-caption text-uppercase text-p">
                  {{ $t("contact_number") }}
                </div>
                <q-input
                  v-model="currentCustomer.contactNo"
                  type="tel"
                  filled
                  lazy-rules
                  class="full-width"
                />
              </div>
              <div class="full-width q-mt-sm">
                <div class="text-caption text-uppercase text-p">
                  {{ $t("email") }}
                </div>
                <q-input
                  v-model="currentCustomer.email"
                  type="email"
                  filled
                  lazy-rules
                  class="full-width"
                />
              </div>
              <!-- Delivery Address Section with Checkbox -->
              <div class="full-width q-mt-sm">
                <div class="text-caption text-uppercase text-p">
                  {{ $t("delivery_address") }}
                </div>
                <q-checkbox
                  v-model="useDefaultAddress"
                  :label="$t('use_default_address')"
                  @change="toggleDefaultAddress"
                />
                <div v-if="useDefaultAddress">
                  <q-input
                    v-model="defaultAddress"
                    filled
                    lazy-rules
                    class="full-width"
                    readonly
                  />
                </div>
                <div v-else>
                  <q-input
                    v-model="currentCustomer.address"
                    filled
                    lazy-rules
                    class="full-width"
                  />
                </div>
              </div>
              <div class="full-width q-mt-sm">
                <div class="text-caption text-uppercase text-p">
                  {{ $t("remarks") }}
                </div>
                <q-input
                  v-model="currentCustomer.remarks"
                  filled
                  type="textarea"
                  class="full-width"
                />
              </div>
              <!-- Upload Image Section -->
              <div class="upload-image flex items-end q-col-gutter-sm q-mt-md">
                <div class="col auto-width">
                  <q-file
                    filled
                    bottom-slots
                    v-model="currentImage"
                    :label="$t('click_here')"
                    dense
                    clearable
                    class="upload-input q-pa-none"
                  >
                    <template v-slot:prepend>
                      <q-icon name="cloud_upload" @click.stop.prevent />
                    </template>
                  </q-file>
                  <div class="text-caption text-uppercase text-p">
                    {{ $t("click_upload") }}
                  </div>
                </div>
                <div class="col-1">
                  <q-btn
                    dense
                    flat
                    class="bg-pink-10 text-white rounded-borders"
                    icon="photo_camera"
                    @click="openCamera"
                  ></q-btn>
                  <div class="text-caption text-uppercase text-p">
                    {{ $t("camera") }}
                  </div>
                </div>
                <div class="col-1">
                  <q-btn
                    dense
                    flat
                    class="bg-orange-10 text-white rounded-borders"
                    icon="visibility"
                    @click="viewImage"
                  ></q-btn>
                  <div class="text-caption text-uppercase text-p">
                    {{ $t("view") }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-tab-panel>

          <!-- Instructions Panel -->
          <q-tab-panel name="instructions">
            <q-card-section class="column items-center q-gutter-y-md">
              <!-- Instructions Section -->
              <div class="full-width">
                <div class="text-caption text-uppercase text-p">
                  {{ $t("ready_by_date") }}
                </div>
                <q-input
                  v-model="readyByDate"
                  type="date"
                  filled
                  lazy-rules
                  class="full-width"
                />
              </div>
              <div class="full-width q-mt-sm">
                <div class="row q-gutter-x-md">
                  <div class="text-caption text-uppercase text-p">
                    {{ $t("enter_instruction") }}:
                  </div>
                  <!-- Radio buttons for One-time and Recurring -->
                  <q-option-group
                    v-model="recurringInstruction"
                    type="radio"
                    :options="[
                      { label: $t('one_time'), value: false, color: 'yellow' },
                      { label: $t('recurring'), value: true, color: 'orange' },
                    ]"
                    inline
                  />
                </div>
                <q-input
                  v-model="instruction"
                  filled
                  lazy-rules
                  class="full-width"
                />
              </div>
              <div class="q-gutter-x-sm q-mt-sm">
                <q-checkbox
                  dense
                  v-model="instruction_to.Cleaning"
                  :label="$t('cleaning')"
                />
                <q-checkbox
                  dense
                  v-model="instruction_to.Packing"
                  :label="$t('packing')"
                />
                <q-checkbox
                  dense
                  v-model="instruction_to.PickingSending"
                  :label="$t('picking_sending')"
                />
                <q-checkbox
                  dense
                  v-model="instruction_to.Admin"
                  :label="$t('admin')"
                />
              </div>
              <q-btn
                class="dialog-buttons q-mt-md"
                :label="$t('add_instruction')"
                color="secondary"
                @click="addInstruction"
              />
            </q-card-section>

            <q-separator />

            <q-card-section>
              <!-- Chips Display for List of Instructions -->
              <div>
                <div class="text-p text-weight-bold text-uppercase">
                  {{ $t("list_of_instructions") }}
                </div>
                <ul>
                  <li
                    v-for="(instr, index) in instructions"
                    :key="index"
                    class="q-mt-sm row"
                  >
                    <div class="col-8">
                      <div class="text-p">{{ instr.text }}</div>
                      <div>
                        <q-chip
                          label
                          v-for="target in instr.targets"
                          :key="target"
                          class="q-mr-sm"
                          >{{ target }}</q-chip
                        >
                        <!-- Updated Chips for Recurrence -->
                        <q-chip
                          v-if="instr.recurring"
                          label="Recurring"
                          color="orange"
                        ></q-chip>
                        <q-chip v-else label="One-time" color="yellow"></q-chip>
                      </div>
                    </div>
                    <div class="col-4 text-right">
                      <q-btn
                        flat
                        dense
                        icon="edit"
                        color="primary"
                        @click="editInstruction(index)"
                      />
                      <q-btn
                        flat
                        dense
                        icon="delete"
                        color="negative"
                        @click="deleteInstruction(index)"
                      />
                    </div>
                  </li>
                </ul>
              </div>
            </q-card-section>
          </q-tab-panel>
        </q-tab-panels>

        <q-card-actions>
          <q-btn
            class="full-width dialog-buttons"
            :label="$t('submit')"
            color="primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit Instruction Dialog -->
    <q-dialog v-model="showEditInstructionDialog" persistent>
      <q-card>
        <q-bar>
          <q-space></q-space>
          <q-btn
            dense
            flat
            class="bg-negative text-white"
            icon="close"
            v-close-popup
          >
            <q-tooltip class="bg-white text-primary">{{
              $t("close")
            }}</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section class="column items-center q-gutter-y-md">
          <div class="full-width">
            <div class="text-caption text-uppercase text-p">
              {{ $t("enter_instruction") }}:
            </div>
            <q-input
              v-model="editInstructionText"
              filled
              lazy-rules
              class="full-width"
            />
          </div>
          <div class="q-gutter-x-sm q-mt-sm">
            <!-- Radio Buttons for One-time and Recurring -->
            <q-option-group
              v-model="editRecurringInstruction"
              type="radio"
              :options="[
                { label: $t('one_time'), value: false, color: 'yellow' },
                { label: $t('recurring'), value: true, color: 'orange' },
              ]"
              inline
            />
          </div>
          <div class="q-gutter-x-sm q-mt-sm">
            <q-checkbox
              dense
              v-model="editInstructionTargets.Cleaning"
              :label="$t('cleaning')"
            />
            <q-checkbox
              dense
              v-model="editInstructionTargets.Packing"
              :label="$t('packing')"
            />
            <q-checkbox
              dense
              v-model="editInstructionTargets.PickingSending"
              :label="$t('picking_sending')"
            />
            <q-checkbox
              dense
              v-model="editInstructionTargets.Admin"
              :label="$t('admin')"
            />
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn
            class="full-width dialog-buttons"
            :label="$t('save_changes')"
            color="primary"
            @click="saveInstructionEdit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Camera Dialog -->
    <q-dialog v-model="cam_dialog" persistent>
      <q-card>
        <q-bar>
          <q-space></q-space>
          <q-btn
            dense
            flat
            class="bg-negative text-white"
            icon="close"
            v-close-popup
          >
            <q-tooltip class="bg-white text-primary">{{
              $t("close")
            }}</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section>
          <div v-if="photoUri">
            <img :src="photoUri" alt="Captured Photo" style="max-width: 100%" />
          </div>
          <div class="text-p" v-else>{{ $t("no_photo") }}</div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Item Dialog -->
    <q-dialog v-model="showQuantityDialog" backdrop-filter="brightness(50%)">
      <q-card class="dialog-cards">
        <q-bar>
          <q-space></q-space>
          <q-btn
            dense
            flat
            class="bg-negative text-white"
            icon="close"
            v-close-popup
          >
            <q-tooltip class="bg-white text-primary">{{
              $t("close")
            }}</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section class="column items-center q-gutter-y-sm">
          <div class="justify-center">
            <div class="text-h6 text-center text-uppercase">
              {{ $t(`itemsList.${selectedItem?.name}`) }}
            </div>
            <div class="row justify-center">
              <q-img
                :src="selectedItem?.imageUrl"
                style="height: 250px; width: 250px; object-fit: cover"
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
                {{ $t("laundry") }} - ${{
                  selectedItem?.laundry_price.toFixed(2)
                }}
              </div>
              <div class="row">
                <q-btn
                  push
                  class="counter-buttons"
                  icon="remove"
                  @click="decreaseQuantity('Laundry')"
                />
                <q-input
                  outlined
                  v-model="quantities.Laundry"
                  class="counter-input q-pa-none q-mx-md"
                />
                <q-btn
                  push
                  class="counter-buttons"
                  icon="add"
                  @click="increaseQuantity('Laundry')"
                />
              </div>
            </div>

            <div
              v-if="selectedItem?.dryclean_price !== null"
              class="justify-center q-pa-sm"
            >
              <div class="text-center q-pb-md text-p">
                {{ $t("dry_clean") }} - ${{
                  selectedItem?.dryclean_price.toFixed(2)
                }}
              </div>
              <div class="row">
                <q-btn
                  push
                  class="counter-buttons"
                  icon="remove"
                  @click="decreaseQuantity('DryClean')"
                />
                <q-input
                  outlined
                  v-model="quantities.DryClean"
                  class="counter-input q-pa-none q-mx-md"
                />
                <q-btn
                  push
                  class="counter-buttons"
                  icon="add"
                  @click="increaseQuantity('DryClean')"
                />
              </div>
            </div>

            <div
              v-if="selectedItem?.pressing_price !== null"
              class="justify-center q-pa-sm"
            >
              <div class="text-center q-pb-md text-p">
                {{ $t("pressing_only") }} - ${{
                  selectedItem?.pressing_price.toFixed(2)
                }}
              </div>
              <div class="row">
                <q-btn
                  push
                  class="counter-buttons"
                  icon="remove"
                  @click="decreaseQuantity('PressingOnly')"
                />
                <q-input
                  outlined
                  v-model="quantities.PressingOnly"
                  class="counter-input q-pa-none q-mx-md"
                />
                <q-btn
                  push
                  class="counter-buttons"
                  icon="add"
                  @click="increaseQuantity('PressingOnly')"
                />
              </div>
            </div>

            <div
              v-if="selectedItem?.others_price !== null"
              class="justify-center q-pa-sm"
            >
              <div class="text-center q-pb-md text-p">
                {{ $t("others_service") }} - ${{
                  selectedItem?.others_price.toFixed(2)
                }}
              </div>
              <div class="row">
                <q-btn
                  push
                  class="counter-buttons"
                  icon="remove"
                  @click="decreaseQuantity('Others')"
                />
                <q-input
                  outlined
                  v-model="quantities.Others"
                  class="counter-input q-pa-none q-mx-md"
                />
                <q-btn
                  push
                  class="counter-buttons"
                  icon="add"
                  @click="increaseQuantity('Others')"
                />
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn
            class="full-width dialog-buttons"
            :label="$t('add_item')"
            color="primary"
            @click="addToTransaction"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showMeasurementDialog" persistent>
      <q-card>
        <q-bar>
          <q-space />
          <q-btn flat icon="close" v-close-popup></q-btn>
        </q-bar>
        <q-card-section>
          <!-- Dropdown for unit selection -->
          <q-select
            v-model="selectedUnit"
            :options="['ft', 'cm']"
            label="Select Unit"
            outlined
          />

          <!-- Inputs for Length and Breadth -->
          <q-input
            v-model="length"
            :label="`Length (in ${selectedUnit})`"
            type="number"
          />
          <q-input
            v-model="breadth"
            :label="`Breadth (in ${selectedUnit})`"
            type="number"
          />

          <!-- Display the total sqft -->
          <div class="text-h6">Total: {{ totalSqft.toFixed(2) }} sqft</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn @click="addToTransaction" label="Add" color="primary" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Weight Dialog -->
    <q-dialog v-model="showWeightDialog" persistent>
      <q-card class="dialog-cards" >
        <q-bar>
          <q-space />
          <q-btn flat icon="close" v-close-popup></q-btn>
        </q-bar>
        <q-card-section>
          <div class="q-pa-lg">
            <div class="text-h6 text-center text-uppercase">
              Enter Weight (in kg) and Select Service
            </div>  
  
            <!-- Service Selection -->
            <q-option-group
              v-model="selectedProcess"
              :options="availableServices"
              type="radio"
              label="Select Service"
              inline
            />
  
            <!-- Input for Weight -->
            <q-input v-model="totalKg" label="Weight (in kg)" type="number" />
            <q-input v-model="totalPcs" label="Pieces" type="number" />
          </div>

                    <!-- Add to Item Button -->
                    <q-btn
                    class="full-width dialog-buttons"
                    label="Add Item to List"
                    color="primary"
                    @click="addToTempItems"
                  />
          <!-- Added Items List -->
          <div v-if="tempWeightItems.length" class="q-pa-md q-mt-md bg-grey-5">
            <div class="text-h6">Items to Add:</div>

            <!-- Headers -->
            <div class="row text-weight-bold text-uppercase q-mt-md bg-grey-3">
              <div class="table-cell col-3">
                <div class="text-p">
                  Item Name
                </div>
              </div>
              <div class="table-cell col-1">
                <div class="text-p">
                  Type
                </div>
              </div>
              <div class="table-cell col-2 text-center">
                <div class="text-p">
                  Price
                </div>
              </div>
              <div class="table-cell col-1 text-center">
                <div class="text-p">
                  Pcs
                </div>
              </div>
              <div class="table-cell col-2 text-center">
                <div class="text-p">
                  Weight (kg)
                </div>
              </div>
              <div class="table-cell col-2 text-center">
                <div class="text-p">
                  Total Price
                </div>
              </div>
              <div class="table-cell col-1 text-center">
                <div class="text-p">
                  Actions
                </div>
              </div>
            </div>

            <!-- Data Rows -->
            <div
              v-for="(item, index) in tempWeightItems"
              :key="index"
              class="row bg-grey-3"
            >
              <!-- Item Name -->
              <div class="table-cell col-3">
                <div class="text-p" v-if="!item.edit" style="line-height: 1.5;">{{ item.name }}</div>
                <q-input v-else v-model="item.name" dense />
              </div>

              <!-- Type/Service -->
              <div class="table-cell col-1">
                <div class="text-p" v-if="!item.edit">{{ item.process }}</div>
                <q-input v-else v-model="item.process" dense />
              </div>


              <!-- Price per kg -->
              <div class="table-cell col-2 text-center">
                <div class="text-p" v-if="!item.edit">${{ item.unit_price }} /kg</div>
                <q-input v-else v-model="item.unit_price" type="number" dense />
              </div>
                            <!-- Pcs -->
                            <div class="table-cell col-1 text-center">
                              <div class="text-p" v-if="!item.edit">{{ item.pcs }}</div>
                              <q-input v-else v-model="item.pcs" type="number" dense />
                            </div>

              <!-- Weight (kg) -->
              <div class="table-cell col-2 text-center">
                <div class="text-p" v-if="!item.edit">{{ item.weight }} kg</div>
                <q-input v-else v-model="item.weight" type="number" dense />
              </div>
              

              <!-- Total Price (computed) -->
              <div class="table-cell col-2 text-center">
                <div class="text-p">${{ (item.weight * item.unit_price).toFixed(2) }}</div>
              </div>

              <!-- Edit / Delete Button -->
              <div class="table-cell col-1 text-center">
                <q-btn
                  v-if="!item.edit"
                  class="edit-item"
                  icon="edit"
                  color="primary"
                  @click="editItemWeight(index)"
                  flat
                />
                <q-btn
                class="delete-item"
                icon="delete"
                color="negative"
                @click="deleteItemWeight(index)"
                flat
              />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions>
          <!-- Final Add Button - Disable if there are no items in the tempWeightItems list -->
          <q-btn
            class="full-width dialog-buttons"
            label="Add To Transaction"
            color="secondary"
            @click="addToTransaction"
            :disable="tempWeightItems.length === 0"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit Item Dialog -->
    <q-dialog v-model="showEditWeight" persistent>
      <q-card>
        <q-bar>
          <q-space />
          <q-btn flat icon="close" v-close-popup></q-btn>
        </q-bar>
        <q-card-section class="column items-center q-gutter-y-md">
          <div class="full-width">
            <q-input
              v-model="editedItem.name"
              label="Item Name"
              filled
              dense
              readonly
            />
            <q-input
              v-model="editedItem.pcs"
              label="Pcs"
              type="number"
              filled
              dense
              :rules="[(val) => val > 0 || 'Pcs must be greater than 0']"
            />
            <q-input
              v-model="editedItem.weight"
              label="Weight (kg)"
              type="number"
              filled
              dense
              :rules="[(val) => val > 0 || 'Weight must be greater than 0']"
            />

            <q-input
              v-model="editedItem.unit_price"
              label="Price per kg"
              type="number"
              filled
              dense
              readonly
            />

            <q-option-group
              v-model="editedItem.process"
              :options="availableServices"
              label="Select Process"
              inline
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            :disable="editedItem.weight <= 0 || editedItem.weight == NULL"
            @click="saveItemEditWeight(editedIndex)"
            label="Save"
            color="primary"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit Measurement Dialog -->
    <q-dialog v-model="showEditMeasurementDialog" persistent>
      <q-card>
        <q-bar>
          <q-space />
          <q-btn flat icon="close" v-close-popup></q-btn>
        </q-bar>
        <q-card-section class="column items-center q-gutter-y-md">
          <div class="full-width">
            <!-- Process Selection -->
            <q-option-group
              v-model="editedItem.process"
              :options="availableServices"
              label="Select Process"
              inline
              @change="updateUnitPriceBasedOnProcess"
            />

            <!-- Inputs for Length and Breadth -->
            <q-input
              v-model="editLength"
              label="Length (in ft)"
              type="number"
              filled
              dense
              :rules="[(val) => val > 0 || 'Length must be greater than 0']"
            />

            <q-input
              v-model="editBreadth"
              label="Breadth (in ft)"
              type="number"
              filled
              dense
              :rules="[(val) => val > 0 || 'Breadth must be greater than 0']"
            />

            <div>Total: {{ totalSqftEdit.toFixed(2) }} sqft</div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            :disable="editLength <= 0 || editBreadth <= 0 || editLength == NULL || editBreadth == NULL"
            @click="saveMeasurementEdit(editedIndex)"
            label="Save"
            color="primary"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit Quantity Dialog (for non-kg, non-sqft items) -->
    <q-dialog v-model="showEditQuantityDialog" persistent>
      <q-card>
        <q-bar>
          <q-space />
          <q-btn flat icon="close" v-close-popup></q-btn>
        </q-bar>
        <q-card-section class="column items-center q-gutter-y-md">
          <div class="full-width">
            <q-input
              v-model="editedItem.name"
              label="Item Name"
              filled
              dense
              readonly
            />

            <!-- Process Selection -->
            <q-option-group
              v-model="editedItem.process"
              :options="availableServices"
              label="Select Process"
              inline
              @change="updateUnitPriceBasedOnProcess"
            />

            <q-input
              v-model="editedItem.quantity"
              label="Quantity"
              type="number"
              filled
              dense
              :rules="[(val) => val > 0 || 'Quantity must be greater than 0']"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            :disable="editedItem.quantity <= 0 || editedItem.quantity == NULL"
            @click="saveItemEdit(editedIndex)"
            label="Save"
            color="primary"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Confirmation Dialog -->
    <q-dialog v-model="confirmationDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="warning" color="negative" size="2em" class="q-mr-sm" />
          <div class="text-p">{{ confirmationMessage }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn push :label="$t('cancel')" color="primary" v-close-popup />
          <q-btn
            push
            :label="$t('confirm')"
            color="negative"
            @click="confirmAction"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showTransactionSummaryDialog" persistent>
      <q-card class="dialog-cards dialog-transaction-summary">
        <q-bar>
          <q-space />
          <q-btn flat icon="close" v-close-popup />
        </q-bar>
        
        <q-card-section>
          <div class="text-h6 text-bold">Transaction Summary</div>
    
          <!-- Customer Information -->
          <div class="text-p q-mt-md">Customer Information:</div>
          <div class="text-p">
            Name: {{ currentCustomer.name }} <br />
            Contact: {{ currentCustomer.contactNo }} <br />
            Email: {{ currentCustomer.email }} <br />
            Address: {{ currentCustomer.address }} <br />
            Remarks: {{ currentCustomer.remarks }}
          </div>
    
          <!-- Ready By Date -->
          <div class="text-p q-mt-md">Ready By Date: {{ readyByDate }}</div>
    
          <!-- Items Summary -->
          <div class="text-p q-mt-md">Items:</div>
          <div class="row d-flex justify-center bg-grey-6">
            <div class="table-cell col-6">
              <div class="text-p text-left">
                {{ $t("item") }}
              </div>
            </div>

            <div class="table-cell col-2 text-center">
              <div class="text-p">
                {{ $t("price") }}
              </div>
            </div>

            <div class="table-cell col-1 text-center">
              <div class="text-p">
                {{ $t("pieces") }}
              </div>
            </div>

            <div class="table-cell col-1 text-center">
              <div class="text-p">
                {{ $t("quantity") }}
              </div>
            </div>
            <div class="table-cell col-2 text-center">
              <div class="text-p">{{ $t("total") }}</div>
            </div>

          </div>
          <div v-for="item in transactionItems" :key="item.name" class="q-card-section row">
            <!-- Name Column -->
            <div class="table-cell col-6">
              <div
                class="text-p text-left text-blue-10"
                style="line-height: 1.5"
              >
                {{ $t(`itemsList.${item.name}`) }}
                <span class="text-purple" v-if="item.unit === 'kg' || item.unit === 'sqft'">
                  ({{ item.size }} {{ item.unit }})
                </span>
                <span class="text-teal"> {{ item.suffix }} </span>
              </div>
            </div>

            <!-- Unit Price Column -->
            <div class="table-cell col-2 text-center">
              <div class="text-p">
                ${{ item.unit_price }} <span> / {{ item.unit }}</span>
              </div>
            </div>

            <!-- Pieces Column -->
            <div class="table-cell col-1 text-center">
              <div class="text-p">
                {{ item.pcs }}
              </div>
            </div>

            <!-- Quantity Column -->
            <div class="table-cell col-1 text-center">
              <div class="text-p">
                {{ item.quantity }}
              </div>
            </div>
            <!-- Total Price Column -->
            <div class="table-cell col-2 text-center">
              <div class="text-p text-green-8">${{ item.price }}</div>
            </div>

          </div>
            <!-- Conditionally display the row if totalQuantities is greater than 0 -->
            <div
              v-if="totalQuantities > 0"
              class="row d-flex align-items-center q-py-xs text-red"
            >
              <div class="table-cell col-6">
                <div class="text-p text-left text-uppercase">
                  {{ $t("total") }}
                </div>
              </div>

              <div class="table-cell col-2 text-center"></div>

              <div class="table-cell col-1 text-center">
                <div class="text-p">
                  {{ totalPieces }}
                </div>
              </div>

              <div class="table-cell col-1 text-center">
                <div class="text-p">
                  {{ totalQuantities }}
                </div>
              </div>

              <div class="table-cell col-2 text-center">
                <div class="text-p">${{ totalPrices.toFixed(2) }}</div>
              </div>

            </div>

            <!-- Display this message if totalQuantities is 0 -->
            <div v-else class="text-center q-pa-md text-h6 text-grey-8">
              {{ $t("no_items_in_transaction") }}
            </div>
    
          <!-- Instructions -->
          <div class="text-p q-mt-md">Instructions:</div>
          <div v-for="(instr, index) in instructions" :key="index" class="text-p">
            {{ instr.text }} - 
            <q-chip v-for="target in instr.targets" :key="target">{{ target }}</q-chip>
            <q-chip v-if="instr.recurring" label="Recurring" color="orange" />
            <q-chip v-else label="One-time" color="yellow" />
          </div>
        </q-card-section>
    
        <!-- Action Buttons -->
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="negative" v-close-popup />
          <q-btn flat label="Confirm & Submit" color="primary" @click="confirmSubmitTransaction" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    
  </div>

  <div class="absolute-top-right q-gutter-xs q-ma-xs">
    <q-btn-dropdown
      class="q-btn--flat q-btn--dense bg-purple text-black"
      icon="menu"
      no-caps
    >
      <q-list>
        <q-item clickable @click="toggleFullscreen">
          <q-item-section avatar>
            <q-icon name="aspect_ratio" />
          </q-item-section>
          <q-item-section>
            {{ isFullscreen ? $t("exit_fullscreen") : $t("enter_fullscreen") }}
          </q-item-section>
        </q-item>
        <q-item clickable @click="switchTransaction">
          <q-item-section avatar>
            <q-icon name="swap_horiz" />
          </q-item-section>
          <q-item-section>
            {{ $t("switch") }}
          </q-item-section>
        </q-item>
        <q-item clickable @click="toggleLanguage">
          <q-item-section avatar>
            <q-icon name="translate" />
          </q-item-section>
          <q-item-section>
            {{ currentLanguage }}
          </q-item-section>
        </q-item>
        <!-- <q-item clickable @click="toggleImages">
          <q-item-section avatar>
            <q-icon name="visibility_off" />
          </q-item-section>
          <q-item-section>
            {{ showImages ? $t("hide_images") : $t("show_images") }}
          </q-item-section>
        </q-item> -->
        <q-item clickable @click="goToHome">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>
            {{ $t("logout") }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { Device } from "@capacitor/device";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { fetchAllItems } from "@/../supabase/api/item_list.js";
import {
  insertOrder,
  insertCustomer,
  insertTransactions,
  insertInstructions,
  getMaxTagNo,
  getMaxOrderId,
  uploadPhoto,
} from "@/../supabase/api/invoices.js";
import { useRouter } from "vue-router";

const router = useRouter();
const goToHome = () => {
  router.push({ name: "Home" });
};

const isFullscreen = ref(false);

function toggleFullscreen() {
  if (!isFullscreen.value) {
    openFullscreen();
  } else {
    closeFullscreen();
  }
}

function openFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    /* Chrome, Safari & Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    /* IE/Edge */
    elem.msRequestFullscreen();
  }
  isFullscreen.value = true;
}

function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    /* Firefox */
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    /* Chrome, Safari & Opera */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    /* IE/Edge */
    document.msExitFullscreen();
  }
  isFullscreen.value = false;
}

// Localization
import { useI18n } from "vue-i18n";
const { locale, t } = useI18n();
const currentLanguage = ref(locale.value === "en" ? "中文" : "English");

const toggleLanguage = () => {
  locale.value = locale.value === "en" ? "zh" : "en";
};

watch(locale, (newLocale) => {
  currentLanguage.value = newLocale === "en" ? "中文" : "English";
});

// Device Information
const model = ref("Please wait...");
const manufacturer = ref("Please wait...");
const photoUri = ref(null);
const cinfo_imageA = ref(null);
const cinfo_imageB = ref(null);
const cam_dialog = ref(false);

const currentImage = computed({
  get() {
    return currentTransaction.value === "A"
      ? cinfo_imageA.value
      : cinfo_imageB.value;
  },
  set(value) {
    if (currentTransaction.value === "A") {
      cinfo_imageA.value = value;
    } else {
      cinfo_imageB.value = value;
    }
  },
});

onMounted(() => {
  Device.getInfo().then((info) => {
    model.value = info.model;
    manufacturer.value = info.manufacturer;
  });
});

// Camera Functions
const openCamera = async () => {
  try {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 90,
    });
    photoUri.value = capturedPhoto.webPath;

    const response = await fetch(photoUri.value);
    const blob = await response.blob();
    const timestamp = new Date().getTime();
    const fileObject = new File([blob], `photo_${timestamp}.jpg`, {
      type: blob.type,
    });

    if (currentTransaction.value === "A") {
      cinfo_imageA.value = fileObject;
    } else {
      cinfo_imageB.value = fileObject;
    }
  } catch (error) {
    console.error("Error opening camera:", error);
  }
};

const viewImage = () => {
  const currentImage =
    currentTransaction.value === "A" ? cinfo_imageA.value : cinfo_imageB.value;
  if (currentImage) {
    const reader = new FileReader();
    reader.onload = () => {
      photoUri.value = reader.result;
      cam_dialog.value = true;
    };
    reader.readAsDataURL(currentImage);
  } else {
    cam_dialog.value = true;
  }
};

watch([cinfo_imageA, cinfo_imageB], (newFile) => {
  if (!newFile) {
    photoUri.value = null;
  }
});

// Tab and Dialog States
const tab = ref("clothings");
const dialog = ref(false);
const showAdditionalInfoDialog = ref(false);
const additionalInfoTab = ref("customerInfo");
const showImages = ref(false);

// Toggle Images Function
const toggleImages = () => {
  showImages.value = !showImages.value;
};

// Search Bar State
const searchQuery = ref("");
const filteredCategories = computed(() => {
  if (searchQuery.value === "") {
    return categories.value;
  }
  return categories.value.map((category) => {
    const filteredItems = category.items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
    return {
      ...category,
      items: filteredItems,
    };
  });
});

const filterItems = () => {
  filteredCategories.value = filteredCategories.value;
};

// Customer Information
const customerA = ref({
  name: "",
  contactNo: "",
  email: "",
  address: "",
  remarks: "",
});
const customerB = ref({
  name: "",
  contactNo: "",
  email: "",
  address: "",
  remarks: "",
});
const defaultAddress = ref(
  "53 Ubi Avenue 1 #01-29, Paya Ubi Ind. Park Singapore 408934"
);
const useDefaultAddress = ref(false);

const currentCustomer = computed({
  get() {
    return currentTransaction.value === "A" ? customerA.value : customerB.value;
  },
  set(value) {
    if (currentTransaction.value === "A") {
      customerA.value = value;
    } else {
      customerB.value = value;
    }
  },
});

const toggleDefaultAddress = () => {
  if (useDefaultAddress.value) {
    currentCustomer.value.address = defaultAddress.value;
  } else {
    currentCustomer.value.address = "";
  }
};

// Transaction Data
const confirmationDialog = ref(false);
const confirmationMessage = ref("");
const selectedItem = ref(null);
const quantities = ref({ Laundry: 0, DryClean: 0, PressingOnly: 0, Others: 0 });
const transactionA = ref([]);
const transactionB = ref([]);
const currentTransaction = ref("A");
let confirmAction = null;

const columns = computed(() => [
  {
    name: "name",
    required: true,
    label: t("item"),
    align: "left",
    field: (row) => row.name,
    format: (val) => `${val}`,
    sortable: false,
    style: "width: 40%", // Set column width
  },
  {
    name: "unit_price",
    required: true,
    label: t("price"),
    align: "center",
    field: "unit_price",
    format: (val) => `$${val}`,
    sortable: false,
    style: "width: 15%", // Set column width
  },
  {
    name: "pcs",
    required: true,
    label: t("pieces"),
    align: "center",
    field: "pcs",
    sortable: false,
    style: "width: 10%", // Set column width
  },
  {
    name: "quantity",
    required: true,
    label: t("quantity"),
    align: "center",
    field: "quantity",
    sortable: false,
    style: "width: 10%", // Set column width
  },
  {
    name: "price",
    required: true,
    label: t("total"),
    align: "center",
    field: "price",
    format: (val) => `$${val}`,
    sortable: false,
    style: "width: 20%", // Set column width
  },
  {
    name: "actions",
    // label: t("actions"),
    align: "center",
    sortable: false,
    field: "actions",
    style: "width: 15%", // Set column width
  },
]);

const categories = ref([
  { name: "clothings", icon: "fas fa-tshirt", label: "Clothings", items: [] },
  { name: "beddings", icon: "fas fa-bed", label: "Beddings", items: [] },
  {
    name: "upholsteries",
    icon: "fas fa-couch",
    label: "Upholsteries",
    items: [],
  },
  {
    name: "miscellaneous",
    icon: "fas fa-th-large",
    label: "Miscellaneous",
    items: [],
  },
  {
    name: "onsite_cleaning",
    icon: "fas fa-broom",
    label: "Onsite Cleaning",
    items: [],
  },
  { name: "others", icon: "fas fa-ellipsis-h", label: "Others", items: [] },
]);

onMounted(async () => {
  const allItems = await fetchAllItems();
  categories.value.forEach((category) => {
    category.items = allItems
      .filter((item) => item.category === category.label)
      .sort((a, b) => a.name.localeCompare(b.name));
  });
});

const totalPrices = computed(() => {
  return transactionItems.value.reduce(
    (total, item) => total + Number(item.price),
    0
  );
});

const totalPieces = computed(() => {
  return transactionItems.value.reduce((total, item) => total + Number(item.pcs), 0);
});


const totalQuantities = computed(() => {
  return transactionItems.value.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );
});

const transactionItems = computed(() => {
  return currentTransaction.value === "A"
    ? transactionA.value
    : transactionB.value;
});

const openDialog = (item) => {
  selectedItem.value = item;
  quantities.value = { Laundry: 0, DryClean: 0, PressingOnly: 0, Others: 0 };

  if (selectedItem.value.unit === "kg") {
    // Reset weight-related fields
    totalKg.value = 0;
    totalPcs.value = 0;
    selectedProcess.value = "Laundry";
    showWeightDialog.value = true;
  } else if (selectedItem.value.unit === "sqft") {
    // Reset measurement-related fields
    length.value = null;
    breadth.value = null;
    selectedProcess.value = "Laundry";
    showMeasurementDialog.value = true;
  } else {
    showQuantityDialog.value = true;
  }
};

const increaseQuantity = (type) => {
  quantities.value[type]++;
};

const decreaseQuantity = (type) => {
  if (quantities.value[type] > 0) {
    quantities.value[type]--;
  }
};

// Functions to handle item quantity changes
const increaseItemQuantity = (item) => {
  item.quantity++;
};

const confirmDecrease = (item) => {
  if (item.quantity > 1) {
    item.quantity--;
  } else {
    confirmRemove(item);
  }
};

const confirmRemove = (item) => {
  confirmAction = () => {
    const updatedItems = transactionItems.value.filter(
      (i) => i.name !== item.name
    );
    if (currentTransaction.value === "A") {
      transactionA.value = updatedItems;
    } else {
      transactionB.value = updatedItems;
    }
    confirmationDialog.value = false;
  };
  confirmationMessage.value = t("are_you_sure_remove", { item: item.name });
  confirmationDialog.value = true;
};

const confirmCancel = () => {
  confirmAction = () => {
    if (currentTransaction.value === "A") {
      transactionA.value = [];
      customerA.value = [];
      instructionsA.value = [];
      cinfo_imageA.value = [];
    } else {
      transactionB.value = [];
      customerB.value = [];
      instructionsB.value = [];
      cinfo_imageB.value = [];
    }
    confirmationDialog.value = false;
  };
  confirmationMessage.value = t("are_you_sure_reset");
  confirmationDialog.value = true;
};

const switchTransaction = () => {
  currentTransaction.value = currentTransaction.value === "A" ? "B" : "A";
};

const confirmDeleteItem = (item) => {
  confirmAction = () => {
    const updatedItems = transactionItems.value.filter((i) => i !== item);
    if (currentTransaction.value === "A") {
      transactionA.value = updatedItems;
    } else {
      transactionB.value = updatedItems;
    }
    confirmationDialog.value = false;
  };
  confirmationMessage.value = t("are_you_sure_remove", { item: item.name });
  confirmationDialog.value = true;
};

const readyByDate = ref(calculateWorkingDate(5));
// Function to calculate the date after a given number of working days
function calculateWorkingDate(days) {
  const resultDate = new Date();
  let remainingDays = days;

  while (remainingDays > 0) {
    resultDate.setDate(resultDate.getDate() + 1);
    const day = resultDate.getDay();
    if (day !== 0 && day !== 6) {
      // 0 = Sunday, 6 = Saturday
      remainingDays--;
    }
  }
  return resultDate.toISOString().split("T")[0]; // Return date in YYYY-MM-DD format
}

// Submit Transaction
// const submitTransaction = async () => {
//   try {
//     const currentImage =
//       currentTransaction.value === "A"
//         ? cinfo_imageA.value
//         : cinfo_imageB.value;

//     if (transactionItems.value.length === 0) {
//       throw new Error(t("add_item"));
//     }

//     let photoUrl = null;
//     if (currentImage) {
//       photoUrl = await uploadPhoto(currentImage);
//     }

//     const date = new Date();
//     const year = date.getFullYear().toString().slice(-2);
//     const month = ("0" + (date.getMonth() + 1)).slice(-2);
//     const day = ("0" + date.getDate()).slice(-2);
//     const maxOrderId = (await getMaxOrderId()) || 0;
//     const nextOrderId = maxOrderId + 1;
//     const nextOrder = nextOrderId.toString().padStart(2, "0");
//     const orderNo = `CC-${day}${month}${year}Sfc${nextOrder}`;

//     const currentCustomer =
//       currentTransaction.value === "A" ? customerA.value : customerB.value;
//     const contact_person = currentCustomer.name;
//     const contact_person_no = currentCustomer.contactNo;
//     const contact_person_email = currentCustomer.email;
//     const del_address = currentCustomer.address;
//     const remarks = currentCustomer.remarks;

//     const dateTime = new Date().toISOString();
//     const readyBy = new Date(readyByDate.value).toISOString(); // Use selected date
//     const status = "Pending";
//     const order = await insertOrder(
//       orderNo,
//       dateTime,
//       readyBy,
//       status,
//       photoUrl,
//       contact_person,
//       contact_person_no,
//       del_address,
//       remarks,
//       contact_person_email
//     );
//     const orderId = order.id;

//     const maxTagNo = (await getMaxTagNo()) || 0;
//     let serialNo = 1;
//     let tagNo = maxTagNo + 1;
//     const transactionsData = transactionItems.value.flatMap((item) => {
//       const typeSuffix = item.suffix.match(/\((L|DC|PO|O)\)$/);
//       let type = "";
//       if (typeSuffix) {
//         switch (typeSuffix[1]) {
//           case "L":
//             type = "Laundry";
//             break;
//           case "DC":
//             type = "Dry Clean";
//             break;
//           case "PO":
//             type = "Pressing Only";
//             break;
//           case "O":
//             type = "Others";
//             break;
//         }
//       }
//       const itemName = item.name.replace(/\s*\((L|DC|PO|O)\)$/, "");
//       return Array.from({ length: item.quantity }, () => ({
//         item_name: itemName,
//         type: type,
//         price: item.price,
//         order_id: orderId,
//         serial_no: serialNo++,
//         tag_no: tagNo++,
//       }));
//     });

//     await insertTransactions(transactionsData);

//     const instructionsData = instructions.value.map((instruction) => ({
//       description: instruction.text,
//       order_id: orderId,
//       admin: instruction.targets.includes("Admin"),
//       packing: instruction.targets.includes("Packing"),
//       cleaning: instruction.targets.includes("Cleaning"),
//       picking_sending: instruction.targets.includes("PickingSending"),
//       recurring: instruction.recurring ? 1 : 0,
//     }));

//     for (const instructionData of instructionsData) {
//       await insertInstructions(instructionData);
//     }

//     alert(t("submit_transaction"));
//     if (currentTransaction.value === "A") {
//       transactionA.value = [];
//       instructionsA.value = [];
//       cinfo_imageA.value = null;
//     } else {
//       transactionB.value = [];
//       instructionsB.value = [];
//       cinfo_imageB.value = null;
//     }
//   } catch (error) {
//     console.error("Error submitting transaction:", error);
//     alert(t("failed_submit_transaction", { error: error.message }));
//   }
// };
const submitTransaction = () => {
  // Open the dialog to show transaction summary
  showTransactionSummaryDialog.value = true;
};

const showTransactionSummaryDialog = ref(false);


const confirmSubmitTransaction = async () => {
  showTransactionSummaryDialog.value = false; // Close the summary dialog
  try {
    const currentImage =
      currentTransaction.value === "A"
        ? cinfo_imageA.value
        : cinfo_imageB.value;

    if (transactionItems.value.length === 0) {
      throw new Error(t("add_item"));
    }

    let photoUrl = null;
    if (currentImage) {
      photoUrl = await uploadPhoto(currentImage);
    }

    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const maxOrderId = (await getMaxOrderId()) || 0;
    const nextOrderId = maxOrderId + 1;
    const nextOrder = nextOrderId.toString().padStart(2, "0");
    const orderNo = `CC-${day}${month}${year}Sfc${nextOrder}`;

    const currentCustomer =
      currentTransaction.value === "A" ? customerA.value : customerB.value;
    const contact_person = currentCustomer.name;
    const contact_person_no = currentCustomer.contactNo;
    const contact_person_email = currentCustomer.email;
    const del_address = currentCustomer.address;
    const remarks = currentCustomer.remarks;

    const dateTime = new Date().toISOString();
    const readyBy = new Date(readyByDate.value).toISOString(); // Use selected date
    const status = "Pending";
    const order = await insertOrder(
      orderNo,
      dateTime,
      readyBy,
      status,
      photoUrl,
      contact_person,
      contact_person_no,
      del_address,
      remarks,
      contact_person_email
    );
    const orderId = order.id;

    const maxTagNo = (await getMaxTagNo()) || 0;
    let serialNo = 1;
    let tagNo = maxTagNo + 1;
    const transactionsData = transactionItems.value.flatMap((item) => {
      const typeSuffix = item.suffix.match(/\((L|DC|PO|O)\)$/);
      let type = "";
      if (typeSuffix) {
        switch (typeSuffix[1]) {
          case "L":
            type = "Laundry";
            break;
          case "DC":
            type = "Dry Clean";
            break;
          case "PO":
            type = "Pressing Only";
            break;
          case "O":
            type = "Others";
            break;
        }
      }
      const itemName = item.name.replace(/\s*\((L|DC|PO|O)\)$/, "");
      return Array.from({ length: item.quantity }, () => ({
        item_name: itemName,
        type: type,
        price: item.price,
        order_id: orderId,
        serial_no: serialNo++,
        tag_no: tagNo++,
      }));
    });

    await insertTransactions(transactionsData);

    const instructionsData = instructions.value.map((instruction) => ({
      description: instruction.text,
      order_id: orderId,
      admin: instruction.targets.includes("Admin"),
      packing: instruction.targets.includes("Packing"),
      cleaning: instruction.targets.includes("Cleaning"),
      picking_sending: instruction.targets.includes("PickingSending"),
      recurring: instruction.recurring ? 1 : 0,
    }));

    for (const instructionData of instructionsData) {
      await insertInstructions(instructionData);
    }

    alert(t("submit_transaction"));
    if (currentTransaction.value === "A") {
      transactionA.value = [];
      instructionsA.value = [];
      cinfo_imageA.value = null;
    } else {
      transactionB.value = [];
      instructionsB.value = [];
      cinfo_imageB.value = null;
    }
  } catch (error) {
    console.error("Error submitting transaction:", error);
    alert(t("failed_submit_transaction", { error: error.message }));
  }
};


// Instructions
const instruction = ref("");
const instruction_to = ref({
  Cleaning: false,
  Packing: false,
  Admin: false,
  PickingSending: false,
});

const instructionsA = ref([]);
const instructionsB = ref([]);
const instructions = computed(() => {
  return currentTransaction.value === "A"
    ? instructionsA.value
    : instructionsB.value;
});

const showEditInstructionDialog = ref(false);
const editInstructionIndex = ref(null);
const editInstructionText = ref("");
const editInstructionTargets = ref({
  Cleaning: false,
  Packing: false,
  PickingSending: false,
  Admin: false,
});

const recurringInstruction = ref(false); // Default to One-time
const editRecurringInstruction = ref(false); // Default to One-time in Edit Dialog

const editInstruction = (index) => {
  editInstructionIndex.value = index;
  const instructionToEdit = instructions.value[index];
  editInstructionText.value = instructionToEdit.text;
  editRecurringInstruction.value = !!instructionToEdit.recurring;
  Object.keys(editInstructionTargets.value).forEach((key) => {
    editInstructionTargets.value[key] = instructionToEdit.targets.includes(key);
  });
  showEditInstructionDialog.value = true;
};

const addInstruction = () => {
  if (instruction.value.trim() === "") return;

  const selectedInstructions = Object.keys(instruction_to.value).filter(
    (key) => instruction_to.value[key]
  );

  const newInstruction = {
    text: instruction.value,
    targets: selectedInstructions,
    recurring: recurringInstruction.value,
  };

  if (currentTransaction.value === "A") {
    instructionsA.value.push(newInstruction);
  } else {
    instructionsB.value.push(newInstruction);
  }

  instruction.value = "";
  recurringInstruction.value = false; // Reset to One-time
  Object.keys(instruction_to.value).forEach((key) => {
    instruction_to.value[key] = false;
  });
};

// Adjusted saveInstructionEdit method:
const saveInstructionEdit = () => {
  if (editInstructionText.value.trim() === "") return;

  const selectedInstructions = Object.keys(editInstructionTargets.value).filter(
    (key) => editInstructionTargets.value[key]
  );

  const updatedInstruction = {
    text: editInstructionText.value,
    targets: selectedInstructions,
    recurring: editRecurringInstruction.value,
  };

  if (currentTransaction.value === "A") {
    instructionsA.value.splice(
      editInstructionIndex.value,
      1,
      updatedInstruction
    );
  } else {
    instructionsB.value.splice(
      editInstructionIndex.value,
      1,
      updatedInstruction
    );
  }

  showEditInstructionDialog.value = false;
};

const deleteInstruction = (index) => {
  if (currentTransaction.value === "A") {
    instructionsA.value.splice(index, 1);
  } else {
    instructionsB.value.splice(index, 1);
  }
};

const selectedProcess = ref("Laundry"); // Do not default to 'Laundry'

const length = ref(null);
const breadth = ref(null);
// Unit selection for measurement
const selectedUnit = ref("ft"); // Default to 'ft'

// Computed total square footage, with conversion from cm to ft if needed
const totalSqft = computed(() => {
  if (selectedUnit.value === "cm") {
    // Convert cm to feet
    const lengthInFt = length.value * 0.0328084;
    const breadthInFt = breadth.value * 0.0328084;
    return lengthInFt * breadthInFt;
  } else {
    // No conversion needed for ft
    return length.value * breadth.value;
  }
});

const showMeasurementDialog = ref(false);

const showQuantityDialog = ref(false);

const showWeightDialog = ref(false); // Dialog to enter weight in kg
const totalKg = ref(0);
const totalPcs = ref(0);
const tempWeightItems = ref([]);

// Compute available services based on prices that are not null
const availableServices = computed(() => {
  const services = [];

  if (selectedItem.value.laundry_price !== null) {
    services.push({
      label: `Laundry - $${selectedItem.value.laundry_price.toFixed(2)} /kg`,
      value: "Laundry",
    });
  }
  if (selectedItem.value.dryclean_price !== null) {
    services.push({
      label: `Dry Clean - $${selectedItem.value.dryclean_price.toFixed(2)} /kg`,
      value: "DryClean",
    });
  }
  if (selectedItem.value.pressing_price !== null) {
    services.push({
      label: `Pressing Only - $${selectedItem.value.pressing_price.toFixed(
        2
      )} /kg`,
      value: "PressingOnly",
    }); // Ensure this is correctly added
  }
  if (selectedItem.value.others_price !== null) {
    services.push({
      label: `Others - $${selectedItem.value.others_price.toFixed(2)} /kg`,
      value: "Others",
    });
  }

  return services;
});

// Function to add items to the tempWeightItems list
const addToTempItems = () => {
  if (totalKg.value <= 0 || !selectedProcess.value) {
    alert("Please enter a valid weight and select a service");
    return;
  }

  if (totalPcs.value <= 0 || !selectedProcess.value) {
    alert("Please enter a valid quantity and select a service");
    return;
  }

  // Helper function to get the correct unit price
  const getUnitPrice = (serviceType) => {
    if (serviceType === "Laundry") return selectedItem.value.laundry_price;
    if (serviceType === "DryClean") return selectedItem.value.dryclean_price;
    if (serviceType === "PressingOnly")
      return selectedItem.value.pressing_price;
    if (serviceType === "Others") return selectedItem.value.others_price;
    return 0;
  };

  const unit_price = getUnitPrice(selectedProcess.value);

  tempWeightItems.value.push({
    name: selectedItem.value.name,
    process: selectedProcess.value,
    weight: totalKg.value,
    pcs: totalPcs.value,
    unit_price: unit_price.toFixed(2),
    total_price: (totalKg.value * unit_price).toFixed(2),
  });

  // Reset the fields
  totalKg.value = 0;
  totalPcs.value = 0;
  selectedProcess.value = "Laundry";
};

// Function to save the edited item
const saveItemEditWeight = (index) => {
  // Recalculate the price based on the new weight and unit price
  const newTotalPrice = (
    editedItem.value.weight * editedItem.value.unit_price
  ).toFixed(2);

  // Update the edited item with the new weight and price
  tempWeightItems.value[index] = {
    ...editedItem.value,
    total_price: newTotalPrice, // Update the total price after editing
  };

  // Find the corresponding item in the transaction list (by index or name)
  const transactionIndex = transactionItems.value.findIndex(
    (item) =>
      item.name === tempWeightItems.value[index].name && item.unit === "kg"
  );

  if (transactionIndex !== -1) {
    // Update the transaction list with the edited weight and price
    transactionItems.value[transactionIndex] = {
      ...transactionItems.value[transactionIndex],
      size: editedItem.value.weight, // Update the size (weight)
      price: newTotalPrice, // Update the price
    };
  }

  // Close the edit dialog
  showEditWeight.value = false;
};

// const addMeasurementToTransaction = () => {
//   const serviceSuffix = selectedProcess.value === "Laundry" ? "(L)" : "(DC)";
//   const price = selectedProcess.value === "Laundry"
//     ? selectedItem.value.laundry_price * totalSqft.value
//     : selectedItem.value.dryclean_price * totalSqft.value;

//   transactionItems.value.push({
//     id: selectedItem.value.id,
//     name: `${selectedItem.value.name} ${serviceSuffix} (${totalSqft.value.toFixed(2)} sqft)`,
//     suffix: serviceSuffix,
//     quantity: 1,
//     price: price.toFixed(2),
//     unit: selectedItem.value.unit,
//   });

//   showMeasurementDialog.value = false;
// };

const addToTransaction = () => {
  const services = {
    Laundry: "(L)",
    DryClean: "(DC)",
    PressingOnly: "(PO)",
    Others: "(O)",
  };

  // Helper function to get the correct unit price
  const getUnitPrice = (serviceType) => {
    if (serviceType === "Laundry") return selectedItem.value.laundry_price;
    if (serviceType === "DryClean") return selectedItem.value.dryclean_price;
    if (serviceType === "PressingOnly")
      return selectedItem.value.pressing_price;
    if (serviceType === "Others") return selectedItem.value.others_price;
    return 0;
  };

  // Add items in tempWeightItems list to the transaction for kg unit
  tempWeightItems.value.forEach((item) => {
    // Add a new item to the transaction with the correct suffix for kg unit
    transactionItems.value.push({
      id: selectedItem.value.id,
      name: `${item.name}`,
      suffix: `(${item.process})`,
      quantity: 1,
      pcs: item.pcs,
      unit_price: item.unit_price,
      price: item.total_price,
      unit: "kg",
      size: item.weight,
    });
  });

  // Clear tempWeightItems list after adding to the transaction
  tempWeightItems.value = [];

  // Handle items for sqft unit
  if (selectedItem.value.unit === "sqft" && totalSqft.value > 0) {
    const serviceSuffix = services[selectedProcess.value]; // Get suffix for the selected process
    const unit_price = getUnitPrice(selectedProcess.value); // Get the correct price
    const quantity = 1;
    const pieces = selectedItem.value.pieces;
    const pcs = pieces * quantity;
    const price = unit_price * totalSqft.value; // Calculate price for sqft

    // Add new sqft item to the transaction
    transactionItems.value.push({
      id: selectedItem.value.id,
      name: `${selectedItem.value.name}`,
      suffix: serviceSuffix,
      quantity: quantity,
      pcs: pcs,
      unit_price: unit_price.toFixed(2),
      price: price.toFixed(2),
      unit: "sqft",
      size: totalSqft.value.toFixed(2), // Store total sqft
    });
  }

  // Handle other units (Laundry, DryClean, PressingOnly, Others)
  for (const [key, suffix] of Object.entries(services)) {
    if (
      quantities.value[key] > 0 &&
      selectedItem.value.unit !== "sqft" &&
      selectedItem.value.unit !== "kg"
    ) {
      const name = selectedItem.value.name;
      const unit = selectedItem.value.unit;
      const unit_price = getUnitPrice(key); // Get the correct unit price
      const price = unit_price * quantities.value[key];
      const pieces = selectedItem.value.pieces;
      const pcs = pieces * quantities.value[key];

      // Add a new entry for each service unit
      transactionItems.value.push({
        id: selectedItem.value.id,
        name: name,
        suffix: suffix,
        quantity: quantities.value[key],
        unit_price: unit_price.toFixed(2),
        price: price.toFixed(2),
        pcs: pcs,
        unit: unit,
      });
    }
  }

  // Close dialogs
  showWeightDialog.value = false;
  showMeasurementDialog.value = false;
  showQuantityDialog.value = false;
};

const showEditWeight = ref(false); // Controls visibility of the edit dialog

// Function to open the edit dialog
const editItemWeight = (index) => {
  editedItem.value = { ...tempWeightItems.value[index] }; // Copy the current item data
  editedIndex.value = index;
  showEditWeight.value = true; // Show the edit dialog
};

const deleteItemWeight = (index) => {
  tempWeightItems.value.splice(index, 1);
};

const showEditMeasurementDialog = ref(false); // Measurement Dialog
const showEditQuantityDialog = ref(false); // Quantity Dialog

// Function to handle the edit button click
const editItem = (item, index) => {
  editedItem.value = { ...item }; // Copy the selected item to editedItem
  editedIndex.value = index; // Store the index

  // Set the process (type) to the item's current process
  if (item.suffix.includes("(L)")) {
    editedItem.value.process = "Laundry";
  } else if (item.suffix.includes("(DC)")) {
    editedItem.value.process = "DryClean";
  } else if (item.suffix.includes("(PO)")) {
    editedItem.value.process = "PressingOnly";
  } else if (item.suffix.includes("(O)")) {
    editedItem.value.process = "Others";
  }

  // Open the appropriate dialog based on the item's unit
  if (item.unit === "kg") {
    showEditWeight.value = true; // Open the Weight Edit Dialog
  } else if (item.unit === "sqft") {
    showEditMeasurementDialog.value = true; // Open the Measurement Edit Dialog
  } else {
    showEditQuantityDialog.value = true; // Open the Quantity Edit Dialog
  }
};

const saveItemEdit = (index) => {
  const process = editedItem.value.process; // Get the selected process

  // Update unit_price based on the selected process
  const unitPriceMapping = {
    Laundry: selectedItem.value.laundry_price,
    DryClean: selectedItem.value.dryclean_price,
    PressingOnly: selectedItem.value.pressing_price,
    Others: selectedItem.value.others_price,
  };

  // Update suffix based on the selected process
  const suffixMapping = {
    Laundry: "(L)",
    DryClean: "(DC)",
    PressingOnly: "(PO)",
    Others: "(O)",
  };

  // Set the new unit price and suffix
  editedItem.value.unit_price = unitPriceMapping[process].toFixed(2);
  editedItem.value.suffix = suffixMapping[process];

  // Update the full name without concatenating an additional suffix
  editedItem.value.name = `${selectedItem.value.name}`;

  // Recalculate the total price based on the updated process and unit price
  editedItem.value.price = (
    editedItem.value.quantity * editedItem.value.unit_price
  ).toFixed(2);

  // Save the edited item back into the transactionItems list
  transactionItems.value[index] = { ...editedItem.value };

  // Close the edit dialogs
  showEditWeight.value = false;
  showEditMeasurementDialog.value = false;
  showEditQuantityDialog.value = false;
};

// Variables for editing an existing item (for showEditMeasurementDialog)
const editLength = ref(null);
const editBreadth = ref(null);
const totalSqftEdit = computed(() => editLength.value * editBreadth.value);

// Sample editedItem and editedIndex to show how saving works
const editedItem = ref({});
const editedIndex = ref(null);

// Sample save function for measurement edit
const saveMeasurementEdit = (index) => {
  const price = editedItem.value.unit_price * totalSqftEdit.value;

  transactionItems.value[index] = {
    ...editedItem.value,
    size: totalSqftEdit.value.toFixed(2),
    price: price.toFixed(2),
  };

  // Clear the fields after saving the edit
  editLength.value = null;
  editBreadth.value = null;
  editedItem.value = {};
  editedIndex.value = null;

  // Close the edit dialog
  showEditMeasurementDialog.value = false;
};

// Helper function to update the unit_price and suffix when the process is changed
const updateUnitPriceBasedOnProcess = () => {
  const process = editedItem.value.process; // Get the selected process

  // Update the unit price based on the selected process
  const unitPriceMapping = {
    Laundry: selectedItem.value.laundry_price,
    DryClean: selectedItem.value.dryclean_price,
    PressingOnly: selectedItem.value.pressing_price,
    Others: selectedItem.value.others_price,
  };

  // Update suffix based on the selected process
  const suffixMapping = {
    Laundry: "(L)",
    DryClean: "(DC)",
    PressingOnly: "(PO)",
    Others: "(O)",
  };

  // Set the updated unit price
  editedItem.value.unit_price = unitPriceMapping[process];

  // Set the updated suffix
  editedItem.value.suffix = suffixMapping[process];

  // Update the full item name with the new suffix
  editedItem.value.name = `${selectedItem.value.name}`;
};

// Function to group items by sub_category
function groupBySubCategory(items) {
  return items.reduce((acc, item) => {
    const subCategory = item.sub_category || "Uncategorized"; // Handle missing sub-categories
    if (!acc[subCategory]) {
      acc[subCategory] = [];
    }
    acc[subCategory].push(item);
    return acc;
  }, {});
}

// Method to determine the background color class based on the sub_category
function getItemCardClass(subCategory) {
  switch (subCategory) {
    case "Casual Attire":
    case "Bathroom Essentials":
    case "Curtains/Blinds":
      return "bg-lime-4";
    case "Winter Attire":
    case "Bed Linens":
    case "Carpets":
      return "bg-light-blue-12";
    case "Heritage Attire":
    case "Snuggle Essentials":
    case "Cushions":
      return "bg-green-12";
    case "Accessory Attire":
      return "bg-purple-11";
    default:
      return "bg-teal-2"; // Default class or no background change
  }
}
</script>
