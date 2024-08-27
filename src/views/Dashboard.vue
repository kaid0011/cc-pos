<template>
  <div>
    <!-- Main Container -->
    <div class="container row">
      <!-- Left Container: Search Bar, Tabs, and Items -->
      <div class="left-container col-8">
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
            color="lime-11" bg-color="brown-3" filled
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

            <div class="row q-pa-sm q-col-gutter-md item-card-container">
              <div
                v-for="item in category.items"
                :key="item.id"
                class="item-card q-pa-xs col-2"
              >
                <q-btn
                  push
                  @click="openDialog(item)"
                  class="list-buttons q-pa-none"
                >
                  <q-card flat class="list-cards">
                    <q-card-section class="q-pa-none">
                      <q-item>
                        <q-item-section>
                          <div class="text-p text-bold">
                            {{ $t(`itemsList.${item.name}`) }}
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
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <!-- Right Container: Transaction Details and Actions -->
      <div class="right-container col-4 q-pl-md">
        <!-- Transaction List -->
        <div class="list-area">
          <div class="list-header q-py-xs">
            <div class="text-p text-bold">
              {{ $t('transaction') }}
              <span class="text-primary text-h6">
                '{{ currentTransaction }}'
              </span>
              {{ $t('items') }}
            </div>
          </div>
          <div class="scrollable-list">
            <q-table
              :rows="transactionItems"
              :columns="columns"
              row-key="name"
              flat
              separator="cell"
              :no-data-label="$t('no_items_in_transaction')"
              virtual-scroll
              v-model:pagination="pagination"
              :rows-per-page-options="[0]"
              dense
              class="scrollable-table"
              hide-bottom
            >
              <template v-slot:body-cell-name="props">
                <q-td :props="props" class="name-column">
                  <div class="text-p text-left wrap-text">
                    {{ $t(`itemsList.${props.row.name}`) }}
                    <span> {{ props.row.suffix }} </span>
                  </div>
                </q-td>
              </template>
              <template v-slot:body-cell-price="props">
                <q-td :props="props" class="price-column">
                  <div class="text-p text-center wrap-text">
                    ${{ props.row.price }}
                  </div>
                </q-td>
              </template>
              <template v-slot:body-cell-quantity="props">
                <q-td :props="props" class="quantity-column">
                  <div class="row items-center justify-center">
                    <q-btn
                      flat
                      class="list-counter-buttons"
                      icon="remove"
                      @click="confirmDecrease(props.row)"
                    />
                    <div class="list-quantity q-border rounded-borders q-mx-xs">
                      <div
                        class="text-p text-center q-px-sm q-ma-none wrap-text"
                      >
                        {{ props.row.quantity }}
                      </div>
                    </div>
                    <q-btn
                      flat
                      class="list-counter-buttons"
                      icon="add"
                      @click="increaseItemQuantity(props.row)"
                    />
                  </div>
                </q-td>
              </template>
              <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="actions-column auto-width">
                  <q-btn
                    round
                    size="7px"
                    color="negative"
                    icon="delete"
                    @click="confirmRemove(props.row)"
                  />
                </q-td>
              </template>
            </q-table>
                    <!-- Totals Display Below the Table -->
        <div class="total-container totals q-pa-sm ">
          <div class="row">
            <div class="col text-left">
              <div class="text-p">{{ $t('total_quantity') }}:</div>
            </div>
            <div class="col text-right">
              <div class="text-p">{{ totalQuantities }}</div>
            </div>
          </div>
          <div class="row">
            <div class="col text-left">
              <div class="text-p">{{ $t('total_price') }}:</div>
            </div>
            <div class="col text-right">
              <div class="text-p" >${{ totalPrices.toFixed(2) }}</div>
            </div>
          </div>
        </div>
          </div>
        </div>




        <!-- Customer Actions -->
        <div class="customer-area q-pa-md">
          <div class="row items-center q-col-gutter-sm">
            <div class="col-12">
              <q-btn
                dense
                push
                class="bg-orange-10 text-white rounded-borders full-width"
                :label="$t('add_details')"
                @click="showAdditionalInfoDialog = true"
              ></q-btn>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-area q-pa-md">
          <div class="row q-col-gutter-sm">
            <div class="col-4">
              <q-btn
                :label="$t('reset')"
                push
                class="action-buttons bg-negative text-white full-width q-py-sm"
                @click="confirmCancel"
              ></q-btn>
            </div>
            <div class="col-4">
              <q-btn
                :label="$t('switch')"
                push
                class="action-buttons bg-warning full-width q-py-sm"
                @click="switchTransaction"
              ></q-btn>
            </div>
            <div class="col-4">
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

    <!-- Additional Info Dialog -->
    <q-dialog
      v-model="showAdditionalInfoDialog"
      backdrop-filter="brightness(50%)"
    >
      <q-card class="dialog-additional-info">
        <q-bar>
          <q-space></q-space>
          <q-btn dense flat class="bg-negative text-white" icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">{{
              $t('close')
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
                  {{ $t('customer_name') }}
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
                  {{ $t('contact_number') }}
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
                  {{ $t('email') }}
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
                  {{ $t('delivery_address') }}
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
                  {{ $t('remarks') }}
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
                    {{ $t('click_upload') }}
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
                    {{ $t('camera') }}
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
                    {{ $t('view') }}
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
                  {{ $t('ready_by_date') }}
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
                    {{ $t('enter_instruction') }}:
                  </div>
                  <q-checkbox
                    dense
                    v-model="recurringInstruction"
                    :label="$t('recurring')"
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
                  v-model="instruction_to.Tagger"
                  :label="$t('tagger')"
                />
                <q-checkbox
                  dense
                  v-model="instruction_to.Packer"
                  :label="$t('packer')"
                />
                <q-checkbox
                  dense
                  v-model="instruction_to.Admin"
                  :label="$t('admin')"
                />
                <q-checkbox
                  dense
                  v-model="instruction_to.Collection"
                  :label="$t('collection')"
                />
                <q-checkbox
                  dense
                  v-model="instruction_to.Delivery"
                  :label="$t('delivery')"
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
              <div>
                <div class="text-p text-weight-bold text-uppercase">
                  {{ $t('list_of_instructions') }}
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
                        <q-chip v-if="instr.recurring" label color="blue">
                          {{ $t('recurring') }}
                        </q-chip>
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
          <q-btn dense flat class="bg-negative text-white" icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">{{
              $t('close')
            }}</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section class="column items-center q-gutter-y-md">
          <div class="full-width">
            <div class="text-caption text-uppercase text-p">
              {{ $t('enter_instruction') }}:
            </div>
            <q-input
              v-model="editInstructionText"
              filled
              lazy-rules
              class="full-width"
            />
          </div>
          <div class="q-gutter-x-sm q-mt-sm">
            <q-checkbox
              dense
              v-model="editInstructionTargets.Tagger"
              :label="$t('tagger')"
            />
            <q-checkbox
              dense
              v-model="editInstructionTargets.Packer"
              :label="$t('packer')"
            />
            <q-checkbox
              dense
              v-model="editInstructionTargets.Admin"
              :label="$t('admin')"
            />
            <q-checkbox
              dense
              v-model="editInstructionTargets.Collection"
              :label="$t('collection')"
            />
            <q-checkbox
              dense
              v-model="editInstructionTargets.Delivery"
              :label="$t('delivery')"
            />
            <!-- Recurring Checkbox for Edit -->
            <q-checkbox
              dense
              v-model="editRecurringInstruction"
              :label="$t('recurring')"
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
          <q-btn dense flat class="bg-negative text-white" icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">{{
              $t('close')
            }}</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section>
          <div v-if="photoUri">
            <img :src="photoUri" alt="Captured Photo" style="max-width: 100%" />
          </div>
          <div class="text-p" v-else>{{ $t('no_photo') }}</div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Item Dialog -->
    <q-dialog v-model="dialog" backdrop-filter="brightness(50%)">
      <q-card class="dialog-cards">
        <q-bar>
          <q-space></q-space>
          <q-btn dense flat class="bg-negative text-white" icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">{{
              $t('close')
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
                {{ $t('laundry') }} - ${{ selectedItem?.laundry_price.toFixed(2) }}
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
                {{ $t('dry_clean') }} - ${{ selectedItem?.dryclean_price.toFixed(2) }}
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
                {{ $t('pressing_only') }} - ${{ selectedItem?.pressing_price.toFixed(2) }}
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
                {{ $t('others_service') }} - ${{ selectedItem?.others_price.toFixed(2) }}
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
            {{ isFullscreen ? $t('exit_fullscreen') : $t('enter_fullscreen') }}
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
        <q-item clickable @click="toggleImages">
          <q-item-section avatar>
            <q-icon name="visibility_off" />
          </q-item-section>
          <q-item-section>
            {{ showImages ? $t('hide_images') : $t('show_images') }}
          </q-item-section>
        </q-item>
        <q-item clickable @click="goToHome">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>
            {{ $t('logout') }}
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
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }
  isFullscreen.value = true;
}

function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) { /* Firefox */
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) { /* Chrome, Safari & Opera */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE/Edge */
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
    sortable: true,
  },
  {
    name: "price",
    required: true,
    label: t("price"),
    align: "center",
    field: "price",
    format: (val) => `$${val}`,
    sortable: true,
  },
  {
    name: "quantity",
    required: true,
    label: t("quantity"),
    align: "center",
    field: "quantity",
    sortable: true,
  },
  {
    name: "actions",
    required: true,
    align: "center",
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
    name: "onsite_cleaning",
    icon: "fas fa-broom",
    label: "Onsite Cleaning",
    items: [],
  },
  {
    name: "miscellaneous",
    icon: "fas fa-th-large",
    label: "Miscellaneous",
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
    (total, item) => total + item.price * item.quantity,
    0
  );
});

const totalQuantities = computed(() => {
  return transactionItems.value.reduce(
    (total, item) => total + item.quantity,
    0
  );
});

const transactionItems = computed(() => {
  return currentTransaction.value === "A"
    ? transactionA.value
    : transactionB.value;
});

// Dialog Functions
const openDialog = (item) => {
  selectedItem.value = item;
  quantities.value = { Laundry: 0, DryClean: 0, PressingOnly: 0, Others: 0 };
  dialog.value = true;
};

const increaseQuantity = (type) => {
  quantities.value[type]++;
};

const decreaseQuantity = (type) => {
  if (quantities.value[type] > 0) {
    quantities.value[type]--;
  }
};

const addToTransaction = () => {
  const services = {
    Laundry: "(L)",
    DryClean: "(DC)",
    PressingOnly: "(PO)",
    Others: "(O)",
  };

  for (const [key, suffix] of Object.entries(services)) {
    if (quantities.value[key] > 0) {
      const name = selectedItem.value.name;
      const existingItem = transactionItems.value.find(
        (i) => i.name === name && i.suffix === suffix
      );
      let price = 0;
      switch (suffix) {
        case "(L)":
          price = selectedItem.value.laundry_price.toFixed(2);
          break;
        case "(DC)":
          price = selectedItem.value.dryclean_price.toFixed(2);
          break;
        case "(PO)":
          price = selectedItem.value.pressing_price.toFixed(2);
          break;
        case "(O)":
          price = selectedItem.value.others_price.toFixed(2);
          break;
      }
      if (existingItem) {
        existingItem.quantity += quantities.value[key];
        existingItem.price = price;
      } else {
        transactionItems.value.push({
          id: selectedItem.value.id,
          name: name,
          suffix: suffix,
          quantity: quantities.value[key],
          price: price,
        });
      }
    }
  }
  dialog.value = false;
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
const submitTransaction = async () => {
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
    const orderNo = `CC-${year}${month}${day}Sfc${nextOrder}`;

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
      packer: instruction.targets.includes("Packer"),
      tagger: instruction.targets.includes("Tagger"),
      collection: instruction.targets.includes("Collection"),
      delivery: instruction.targets.includes("Delivery"),
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
  Tagger: false,
  Packer: false,
  Admin: false,
  Collection: false,
  Delivery: false,
});
const recurringInstruction = ref(false);

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
  Tagger: false,
  Packer: false,
  Admin: false,
  Collection: false,
  Delivery: false,
});
const editRecurringInstruction = ref(false);

const addInstruction = () => {
  if (instruction.value.trim() === "") return;

  const selectedInstructions = Object.keys(instruction_to.value).filter(
    (key) => instruction_to.value[key]
  );

  const newInstruction = {
    text: instruction.value,
    targets: selectedInstructions,
    recurring: recurringInstruction.value ? 1 : 0,
  };

  if (currentTransaction.value === "A") {
    instructionsA.value.push(newInstruction);
  } else {
    instructionsB.value.push(newInstruction);
  }

  instruction.value = "";
  recurringInstruction.value = false;
  Object.keys(instruction_to.value).forEach((key) => {
    instruction_to.value[key] = false;
  });
};

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

const saveInstructionEdit = () => {
  if (editInstructionText.value.trim() === "") return;

  const selectedInstructions = Object.keys(editInstructionTargets.value).filter(
    (key) => editInstructionTargets.value[key]
  );

  const updatedInstruction = {
    text: editInstructionText.value,
    targets: selectedInstructions,
    recurring: editRecurringInstruction.value ? 1 : 0,
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
</script>
