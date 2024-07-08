<template>
    <div>
      <div class="container row">
        <div class="left-container col-9">
          <q-tabs v-model="tab" class="text-black" align="justify" narrow-indicator>
            <q-tab v-for="category in categories" :key="category.name" :name="category.name" :icon="category.icon" :label="category.label" />
          </q-tabs>
  
          <q-tab-panels v-model="tab" animated transition-prev="jump-up" transition-next="jump-down" class="bg-primary">
            <q-tab-panel v-for="category in categories" :key="category.name" :name="category.name" class="q-pa-md">
              <div class="row q-pa-sm q-col-gutter-md item-card-container">
                <div v-for="item in category.items" :key="item.id" class="item-card q-pa-xs col-2">
                  <q-btn push @click="openDialog(item)" class="list-buttons q-pa-none">
                    <q-card flat class="list-cards">
                      <q-card-section class="q-pa-none">
                        <q-item>
                          <q-item-section>
                            <q-item-label class="text-bold">{{ item.name }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-card-section>
                      <q-card-section class="item-image q-pa-none">
                        <q-img :src="item.imageUrl" style="height: 100px; width: 100px; object-fit: cover" />
                      </q-card-section>
                    </q-card>
                  </q-btn>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
        <div class="right-container col-3 q-pl-md">
          <div class="list-area">
            <div class="list-header q-py-md">
              <p class="q-ma-none text-bold">Transaction <span class="text-primary text-h6">'{{ currentTransaction }}'</span> Items</p>
            </div>
            <div class="scrollable-list">
              <div v-for="item in transactionItems" :key="item.name">
                <div class="row items-center q-py-md q-px-md q-col-gutter-md">
                  <div class="col-2">
                    <q-btn round size="12px" color="negative" icon="delete" @click="confirmRemove(item)"></q-btn>
                  </div>
                  <div class="col-5 text-center">
                    <p class="q-ma-none">{{ item.name }}</p>
                  </div>
                  <div class="col-5 text-center">
                    <div class="row items-center justify-center">
                      <q-btn push class="list-counter-buttons" icon="remove" @click="confirmDecrease(item)" />
                      <p class="list-counter-input q-px-md q-ma-none">{{ item.quantity }}</p>
                      <q-btn push class="list-counter-buttons" icon="add" @click="increaseItemQuantity(item)" />
                    </div>
                  </div>
                </div>
                <q-separator color="grey" />
              </div>
            </div>
          </div>
          <div class="action-area q-pa-md">
            <div class="row q-col-gutter-sm">
              <div class="col-4">
                <q-btn label="RESET" push class="action-buttons bg-negative text-white full-width q-py-sm" @click="confirmCancel"></q-btn>
              </div>
              <div class="col-4">
                <q-btn label="SWITCH" push class="action-buttons bg-warning full-width q-py-sm" @click="switchTransaction"></q-btn>
              </div>
              <div class="col-4">
                <q-btn label="SUBMIT" push class="action-buttons bg-positive text-white full-width q-py-sm" @click="submitTransaction"></q-btn>
              </div>
            </div>
          </div>
        </div>
      </div>
      <q-dialog v-model="dialog" backdrop-filter="brightness(50%)">
        <q-card class="dialog-cards">
          <q-bar>
            <q-space></q-space>
            <q-btn dense flat icon="close" v-close-popup>
              <q-tooltip class="bg-white text-primary">Close</q-tooltip>
            </q-btn>
          </q-bar>
          <q-card-section class="column items-center q-gutter-y-sm">
            <q-img :src="selectedItem?.imageUrl" style="height: 150px; width: 150px; object-fit: cover" />
            <div class="text-h6 text-center">{{ selectedItem?.name }}</div>
            <div class="row items-center q-pa-sm">
              <div class="col-12 text-center q-pb-md">Laundry</div>
              <q-btn push class="counter-buttons" icon="remove" @click="decreaseQuantity('Laundry')" />
              <q-input outlined v-model="quantities.Laundry" class="counter-input q-pa-none q-mx-md" />
              <q-btn push class="counter-buttons" icon="add" @click="increaseQuantity('Laundry')" />
            </div>
            <div class="row items-center q-pa-sm">
              <div class="col-12 text-center q-pb-md">Dry Clean</div>
              <q-btn push class="counter-buttons" icon="remove" @click="decreaseQuantity('DryClean')" />
              <q-input outlined v-model="quantities.DryClean" class="counter-input q-pa-none q-mx-md" />
              <q-btn push class="counter-buttons" icon="add" @click="increaseQuantity('DryClean')" />
            </div>
            <div class="row items-center q-pa-sm">
              <div class="col-12 text-center q-pb-md">Pressing Only</div>
              <q-btn push class="counter-buttons" icon="remove" @click="decreaseQuantity('PressingOnly')" />
              <q-input outlined v-model="quantities.PressingOnly" class="counter-input q-pa-none q-mx-md" />
              <q-btn push class="counter-buttons" icon="add" @click="increaseQuantity('PressingOnly')" />
            </div>
            <div class="row items-center q-pa-sm">
              <div class="col-12 text-center q-pb-md">Others</div>
              <q-btn push class="counter-buttons" icon="remove" @click="decreaseQuantity('Others')" />
              <q-input outlined v-model="quantities.Others" class="counter-input q-pa-none q-mx-md" />
              <q-btn push class="counter-buttons" icon="add" @click="increaseQuantity('Others')" />
            </div>
          </q-card-section>
          <q-card-actions>
            <q-btn class="full-width dialog-buttons" label="Add Item" color="primary" @click="addToTransaction" />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-dialog v-model="confirmationDialog" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <q-icon name="warning" color="negative" size="2em" class="q-mr-sm" />
            <span>{{ confirmationMessage }}</span>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn push label="Cancel" color="primary" v-close-popup />
            <q-btn push label="Confirm" color="negative" @click="confirmAction" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from "vue";
  import { fetchAllItems } from "@/../supabase/api/item_list.js";
  import { insertInvoice, insertTransactions, getMaxTagNo } from "@/../supabase/api/invoices.js"; // Adjust the path based on your project's structure
  
  const tab = ref("clothings");
  const dialog = ref(false);
  const confirmationDialog = ref(false);
  const confirmationMessage = ref("");
  const selectedItem = ref(null);
  const quantities = ref({
    Laundry: 0,
    DryClean: 0,
    PressingOnly: 0,
    Others: 0
  });
  const transactionA = ref([]);
  const transactionB = ref([]);
  const currentTransaction = ref('A');
  let confirmAction = null;
  
  const categories = ref([
    { name: "clothings", icon: "fas fa-tshirt", label: "Clothings", items: [] },
    { name: "beddings", icon: "fas fa-bed", label: "Beddings", items: [] },
    { name: "upholsteries", icon: "fas fa-couch", label: "Upholsteries", items: [] },
    { name: "onsite-cleaning", icon: "fas fa-broom", label: "Onsite Cleaning", items: [] },
    { name: "miscellaneous", icon: "fas fa-th-large", label: "Miscellaneous", items: [] },
    { name: "others", icon: "fas fa-ellipsis-h", label: "Others", items: [] },
  ]);
  
  onMounted(async () => {
    const allItems = await fetchAllItems();
  
    categories.value.forEach((category) => {
      category.items = allItems
        .filter(item => item.category === category.label)
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort items alphabetically
    });
  });
  
  const transactionItems = computed(() => {
    return currentTransaction.value === 'A' ? transactionA.value : transactionB.value;
  });
  
  const openDialog = (item) => {
    selectedItem.value = item;
    quantities.value = {
      Laundry: 0,
      DryClean: 0,
      PressingOnly: 0,
      Others: 0
    };
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
      'Laundry': '(L)',
      'DryClean': '(DC)',
      'PressingOnly': '(PO)',
      'Others': '(O)'
    };
  
    for (const [key, suffix] of Object.entries(services)) {
      if (quantities.value[key] > 0) {
        const name = `${selectedItem.value.name} ${suffix}`;
        const existingItem = transactionItems.value.find((i) => i.name === name);
        if (existingItem) {
          existingItem.quantity += quantities.value[key]; // Sum the quantities
        } else {
          transactionItems.value.push({
            name: name,
            quantity: quantities.value[key],
          });
        }
      }
    }
    dialog.value = false;
  };
  
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
      const updatedItems = transactionItems.value.filter((i) => i.name !== item.name);
      if (currentTransaction.value === 'A') {
        transactionA.value = updatedItems;
      } else {
        transactionB.value = updatedItems;
      }
      confirmationDialog.value = false;
    };
    confirmationMessage.value = `Are you sure you want to remove ${item.name} from the transaction?`;
    confirmationDialog.value = true;
  };
  
  const confirmCancel = () => {
    confirmAction = () => {
      if (currentTransaction.value === 'A') {
        transactionA.value = [];
      } else {
        transactionB.value = [];
      }
      confirmationDialog.value = false;
    };
    confirmationMessage.value = `Are you sure you want to reset the entire transaction?`;
    confirmationDialog.value = true;
  };
  
  const switchTransaction = () => {
    currentTransaction.value = currentTransaction.value === 'A' ? 'B' : 'A';
  };
  
  const submitTransaction = async () => {
    try {
      const invoiceNo = `INV-${Date.now()}`;
      const dateTime = new Date().toISOString();
      const readyBy = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(); // Set ready by date to one week later
      const status = 'Ongoing';
  
      // Insert a new invoice row
      const invoice = await insertInvoice(invoiceNo, dateTime, readyBy, status);
      const invoiceId = invoice.id;
  
      // Get the max tag_no
      const maxTagNo = await getMaxTagNo() || 0;
  
      // Prepare transactions data
      let serialNo = 1;
      let tagNo = maxTagNo + 1;
      const transactionsData = transactionItems.value.flatMap(item => {
        return Array.from({ length: item.quantity }, () => ({
          item_name: item.name,
          invoice_id: invoiceId,
          serial_no: serialNo++,
          tag_no: tagNo++
        }));
      });
  
      // Insert multiple rows into transactions table
      await insertTransactions(transactionsData);
  
      alert('Transaction submitted successfully!');
      if (currentTransaction.value === 'A') {
        transactionA.value = [];
      } else {
        transactionB.value = [];
      }
    } catch (error) {
      console.error('Error submitting transaction:', error);
      alert('Failed to submit transaction.');
    }
  };
  </script>
  
  
  
  <style scoped>
  .container {
    padding: 2vh;
    background-color: #000000;
  }
  
  .list-area {
    height: 80vh; /* Fixed height to enable scrolling */
    background-color: #e9e9e9;
    overflow-y: auto; /* Enable vertical scrolling */
  }
  
  .list-header {
    background-color: #aaadb2;
  }
  
  .scrollable-list {
    height: 100%; /* Ensure it takes full height of list-area */
    overflow-y: auto; /* Enable vertical scrolling */
  }
  
  .action-area {
    margin-top: 2vh;
    min-height: 14vh;
    background-color: #aaadb2;
  }
  
  .item-image {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .item-button-section {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .q-tab-panels.q-panel-parent {
    max-height: calc(96vh - 75px);
    min-height: calc(96vh - 75px);
    overflow-y: auto;
    background-color: #aaadb2;
  }
  
  .q-tabs {
    max-height: 75px;
    min-height: 75px;
    background-color: #b29852;
  }
  
  .list-buttons {
    width: 100%;
    height: 200px;
    background-color: #d1d3ce;
  }
  
  .list-cards {
    background-color: rgba(0, 0, 0, 0);
  }
  
  .dialog-cards {
    max-height: 80vh;
    width: 200px;
    background-color: #e9e9e9;
  }
  
  .counter-buttons {
    width: 10px;
    height: 10px;
    background-color: #b29852;
  }
  
  .counter-input {
    width: 50px;
  }
  
  .list-counter-buttons {
    padding: 5px;
    font-size: 8px;
    background-color: #b29852;
  }
  
  .list-counter-input {
    font-size: 15px;
    text-align: center;
  }
  
  .action-buttons {
    height: 9vh;
    margin: 0;
  }
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  /* Firefox */
  input[type=number] {
    -moz-appearance: textfield;
  }
  </style>
  