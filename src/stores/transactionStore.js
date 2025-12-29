import { supabase } from "@/../supabase/config.js";
import { defineStore } from "pinia";
import { getLastOrderIdForDate } from "@/../supabase/api/orders.js";
import { fetchAllCustomers } from "@/../supabase/api/customers.js";
import { fetchAllItems } from "@/../supabase/api/item_list.js";
// import { fetchContactPersons } from "@/../supabase/api/contacts.js";
// import { laThSolid } from "@quasar/extras/line-awesome";
function derivePaymentStatus(paidAmount, totalAmount) {
  const paid = Number(paidAmount || 0);
  const total = Number(totalAmount || 0);
  if (total <= 0) return "paid";
  if (paid <= 0) return "unpaid";
  if (paid >= total) return "paid";
  return "partial";
}
function toNum(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}
function inferUnitFromName(name) {
  const s = (name || "").toLowerCase();
  if (s.includes("sqft")) return "sqft";
  if (s.includes("kg")) return "kg";
  return "pc";
}


function parseNumeric(input) {
  if (input == null) return null;
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  const s = String(input).trim();
  if (!s) return null;
  const cleaned = s.replace(/[%$,]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function distributeEqualAmountAbs(totalAbs, itemCount) {
  const totalCents = Math.round(Number(totalAbs) * 100);
  if (!Number.isFinite(totalCents) || totalCents <= 0 || itemCount <= 0) return [];

  const base = Math.floor(totalCents / itemCount);
  let rem = totalCents - base * itemCount;

  const cents = Array.from({ length: itemCount }, () => base);
  for (let i = 0; i < itemCount && rem > 0; i++, rem--) cents[i] += 1;

  return cents.map((c) => c / 100);
}

function makeItemKey(item) {
  const n = (v) => (v == null ? "" : String(v).trim().toLowerCase());
  const num = (v) => {
    const x = Number(v);
    return Number.isFinite(x) ? String(x) : "";
  };

  return [
    n(item?.name ?? item?.item_name),
    n(item?.process),
    n(item?.unit),
    n(item?.category),
    num(item?.price),
    num(item?.quantity),
    num(item?.subtotal),
  ].join("|");
}

function mapItemsToInsertedIds(transactionItems, insertedItems) {
  const buckets = new Map();
  for (const ins of insertedItems) {
    const key = makeItemKey(ins);
    const arr = buckets.get(key) ?? [];
    arr.push(ins);
    buckets.set(key, arr);
  }

  const pairs = [];
  for (let i = 0; i < transactionItems.length; i++) {
    const src = transactionItems[i];
    const key = makeItemKey(src);
    const bucket = buckets.get(key);

    let match = bucket && bucket.length ? bucket.shift() : null;
    if (!match) match = insertedItems[i] ?? null;

    if (match?.id) pairs.push({ item: src, orderTransactionItemId: match.id });
  }

  return pairs;
}

async function fetchLatestTransactionAndItems(supabase, orderId) {
  const { data: tx, error: txErr } = await supabase
    .from("order_transactions")
    .select("id")
    .eq("order_id", orderId)
    .order("id", { ascending: false })
    .limit(1)
    .single();

  if (txErr) throw txErr;
  if (!tx?.id) throw new Error("No transaction found for created order.");

  const { data: items, error: itemsErr } = await supabase
    .from("order_transaction_items")
    .select("id, item_name, process, unit, category, price, quantity, subtotal")
    .eq("order_transaction_id", tx.id)
    .order("id", { ascending: true });

  if (itemsErr) throw itemsErr;

  return { transactionId: tx.id, insertedItems: items ?? [] };
}

async function fetchCustomerOverallRules(supabase, customerId) {
  if (!customerId) return [];

  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("customer_discounts_charges")
    .select("dc_type, value_type, percentage, amount, active, starts_at, ends_at")
    .eq("customer_id", customerId)
    .eq("active", true)
    .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
    .or(`ends_at.is.null,ends_at.gte.${nowIso}`);

  if (error) throw error;

  return (data ?? [])
    .map((r) => {
      const dc_type = String(r?.dc_type ?? "").toLowerCase();      // discount | charge
      const value_type = String(r?.value_type ?? "").toLowerCase(); // percent | amount

      if ((dc_type !== "discount" && dc_type !== "charge")) return null;
      if ((value_type !== "percent" && value_type !== "amount")) return null;

      return {
        dc_type,
        value_type,
        percentage: value_type === "percent" ? parseNumeric(r?.percentage) : null,
        amount: value_type === "amount" ? parseNumeric(r?.amount) : null,
      };
    })
    .filter(Boolean);
}

function expandOverallAdjustmentsToDcRows(overallAdjustments, pairs) {
  const itemIds = (pairs ?? [])
    .map((p) => p?.orderTransactionItemId)
    .filter(Boolean);

  const itemCount = itemIds.length;
  if (!itemCount) return [];

  const rows = [];

  for (const a of overallAdjustments ?? []) {
    const dc_type = String(a?.dc_type ?? "").toLowerCase();         // discount | charge
    const value_type = String(a?.value_type ?? "").toLowerCase();   // percent | amount

    if ((dc_type !== "discount" && dc_type !== "charge")) continue;
    if ((value_type !== "percent" && value_type !== "amount")) continue;

    const sign = dc_type === "discount" ? -1 : 1;

    // ✅ PERCENT: replicate per item (overall % is equivalent when summed)
    if (value_type === "percent") {
      const pct = parseNumeric(a?.percentage);
      if (pct == null || pct === 0) continue;

      for (const itemId of itemIds) {
        rows.push({
          order_transaction_item_id: itemId,
          dc_type,
          value_type,
          percentage: sign * Math.abs(pct),
          amount: null,
        });
      }
      continue;
    }

    // ✅ AMOUNT: distribute across items (overall fixed $)
    const amt = parseNumeric(a?.amount);
    if (amt == null || amt === 0) continue;

    const parts = distributeEqualAmountAbs(Math.abs(amt), itemCount);
    for (let i = 0; i < itemIds.length; i++) {
      const part = parts[i] ?? 0;
      if (!part) continue;

      rows.push({
        order_transaction_item_id: itemIds[i],
        dc_type,
        value_type,
        percentage: null,
        amount: sign * part,
      });
    }
  }

  return rows;
}


export const useTransactionStore = defineStore("transactionStore", {
  state: () => ({
    transactionItems: [],
    instructions: [],
    displayInstructions: [],
    reports: [],
    items: [],
    customers: [],
    contactOptions: [],
    addressOptions: [],
    driverOptions: [],
    timeOptions: [],
    selectedCustomer: null,
    selectedDeliveryId: null,
    selectedCollectionId: null,
    selectedDeliveryContact: null,
    selectedCollectionContact: null,
    selectedDeliveryAddress: null,
    selectedCollectionAddress: null,
    selectedCollectionDriver: null,
    additionalCollectionDriver: null,
    additionalDeliveryDriver: null,
    selectedDeliveryDriver: null,
    totalAmount: null,
    orderNo: "",
    addresses: "",
    isOrderNoManuallySet: false,
    collectionDate: null,
    deliveryDate: null,
    deliveredDate: null,
    collectionTime: null,
    deliveryTime: null,
    collectionRemarks: null,
    collectionNoBags: null,
    deliveryRemarks: null,
    useCcCollection: false, // New: Self-collect checkbox state
    useCcDelivery: false, // New: Self-pickup checkbox state
    transactions: [],
    nextLogisticsNo: null,
    selectedGenerateDriver: null,
    jobType: null,
    jobUrgency: null,
    logisticsId: null,
    tagCountsByOrderId: {},
    packCategoriesByOrderId: {},
        totalAmount: 0,
    deposit: 0,
       orderOverallDiscountCharges: [],
         customerDiscountCharges: [],
  }),
  actions: {
    async loadItems() {
      if (this.items.length === 0) {
        try {
          this.items = await fetchAllItems();
        } catch (error) {
          console.error("Error fetching items:", error);
        }
      }
    },

    async getUserProfile() {
      try {
        const { data, error: userError } = await supabase.auth.getUser(); // Get authenticated user data
        if (userError) throw userError;

        const user = data.user; // Ensure we get the user object
        if (!user || !user.id)
          throw new Error("User not authenticated or ID missing");

        const { data: userProfile, error } = await supabase
          .from("profiles")
          .select("system_access, name, position")
          .eq("id", user.id) // Match where profiles.id is the current user's ID
          .single(); // Assumes one result per user

        if (error) throw error;
        return userProfile;
      } catch (error) {
        console.error("Error fetching user system access:", error);
        return null;
      }
    },

    async getUserPosition() {
      try {
        const { data, error: userError } = await supabase.auth.getUser(); // Get authenticated user data
        if (userError) throw userError;

        const user = data.user; // Ensure we get the user object
        if (!user || !user.id)
          throw new Error("User not authenticated or ID missing");

        const { data: userPosition, error } = await supabase
          .from("profiles")
          .select("position")
          .eq("id", user.id) // Match where profiles.id is the current user's ID
          .single(); // Assumes one result per user

        if (error) throw error;
        return userPosition.position;
      } catch (error) {
        console.error("Error fetching user position:", error);
        return null;
      }
    },

    async SetUserProfile() {
      try {
        const profile = await this.getUserProfile(); // assumes returns user profile object
        return profile; // full profile object now
      } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
    },

    async getProfileByUserId(profileId) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("position, id, code")
          .eq("id", profileId)
          .single();

        if (error) {
          throw error;
        }

        return data;
      } catch (error) {
        console.error("Error fetching driver profile:", error);
        return null;
      }
    },

    // Generate order number only if it has not been set manually
    async generateOrderNo() {
      try {
        if (this.isOrderNoManuallySet) {
          console.log("Order number was manually set. Skipping generation.");
          return;
        }

        const date = new Date();
        const formattedDate = `${String(date.getFullYear()).slice(-2)}${String(
          date.getMonth() + 1
        ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;

        const nameToCodeMap = {
          Ass: "Ass",
          Ken: "Ken",
          Ang: "Ang",
          Pea: "Pea",
          You: "You",
          "Self-collect": "Sfc",
          "Ng Soo Chong": "Nsc",
          Chia: "Cha",
          Des: "Des",
          Cue: "Cue",
          Are: "Are",
          Ting: "Tin",
        };

        const driverName = this.selectedCollectionDriver.name || "";
        const code = nameToCodeMap.hasOwnProperty(driverName)
          ? nameToCodeMap[driverName]
          : "UNK";

        console.log(`Selected Driver: "${driverName}", Code: "${code}"`);

        const lastOrderForToday = await getLastOrderIdForDate(formattedDate);
        const newOrderId = lastOrderForToday
          ? parseInt(lastOrderForToday.slice(-2)) + 1
          : 1;

        this.orderNo = `CC-${formattedDate}${code}${String(newOrderId).padStart(
          2,
          "0"
        )}`;
      } catch (error) {
        console.error("Error generating Order No:", error);
      }
    },

    async loadCustomers() {
      try {
        const data = await fetchAllCustomers();
        this.customers = data;
      } catch (error) {
        console.error("Error loading customers:", error);
      }
    },
    async createCustomer(newCustomer) {
      try {
        // Step 1: Insert the new customer into the 'customers' table
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .insert([
            {
              name: newCustomer.name,
              contact_no1: newCustomer.contact_no1 || null,
              contact_no2: newCustomer.contact_no2 || null,
              email: newCustomer.email || null,
              type: newCustomer.type || null,
              sub_type: newCustomer.sub_type || null,
              recommended_by: newCustomer.recommended_by || null,
              schedule_remarks: newCustomer.schedule_remarks || null,
              price_remarks: newCustomer.price_remarks || null,
              accounting_remarks: newCustomer.accounting_remarks || null,
              other_remarks: newCustomer.other_remarks || null,
              pricing_group_id: newCustomer.pricing_group_id || null,
              po_no: newCustomer.po_no || null,
              billing_address: newCustomer.billing_address || null,
            },
          ])
          .select();

        if (customerError) throw customerError;

        const createdCustomer = customerData[0]; // Retrieve the newly created customer
        if (!createdCustomer) throw new Error("Failed to create customer");

        // Step 2: Insert a contact person with the same details as the customer
        const contactPerson = {
          name: createdCustomer.name,
          contact_no1: createdCustomer.contact_no1,
          contact_no2: createdCustomer.contact_no2,
          email: createdCustomer.email,
          customer_id: createdCustomer.id, // Link the contact person to the customer
          remarks: "Default contact person",
        };

        const { error: contactError } = await supabase
          .from("customer_contact_persons")
          .insert([contactPerson]);

        if (contactError) throw contactError;

        // Step 3
        const customerCredits = {
          customer_id: createdCustomer.id, // Link the contact person to the customer
          online_package: 0,
          other_credits: 0,
        };

        const { error: creditError } = await supabase
          .from("customer_credits")
          .insert([customerCredits]);

        if (creditError) throw creditError;

        return createdCustomer; // Return the created customer
      } catch (error) {
        console.error(
          "Error creating customer with contact person and address:",
          error
        );
        throw error;
      }
    },
    async loadContactOptions(customerId) {
      // why: contacts are 0..N per customer; array result avoids PGRST116
      const { data, error } = await supabase
        .from("customer_contact_persons")
        .select("id,name,contact_no1,contact_no2,email")
        .eq("customer_id", customerId) // <- FIX: use customer_id, not id
        .order("name", { ascending: true });

      if (error) throw error;
      this.contactOptions = Array.isArray(data) ? data : [];
    },

    // addresses
    async loadAddressOptions(customerId) {
      const { data, error } = await supabase
        .from("customer_address")
        .select(
          "id,block_no,road_name,building_name,postal_code,unit_no,additional_info,remarks"
        )
        .eq("customer_id", customerId) // <- FIX: use customer_id, not id
        .order("road_name", { ascending: true });

      if (error) throw error;
      this.addressOptions = Array.isArray(data) ? data : [];
    },

    async loadDrivers() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name")
          .eq("position", "driver");

        if (error) {
          throw error;
        }

        this.driverOptions = data.map((profile) => ({
          id: profile.id,
          name: profile.name,
          contact_no1: profile.contact_no1,
          label: `${profile.name} - ${profile.contact_no1 || ""}`,
        }));

        console.log("Loaded Drivers:", this.driverOptions);
      } catch (error) {
        console.error("Error loading drivers:", error);
      }
    },

    // transactionStore.js
    async loadTimeOptions() {
      try {
        const { data, error } = await supabase
          .from("options_time")
          .select("time, am_pm"); // ✅ fetch both columns

        if (error) {
          console.error("Error fetching time options:", error);
          return;
        }

        // ✅ Keep as array of { time, am_pm } exactly from DB
        this.timeOptions = Array.isArray(data)
          ? data.map((option) => ({
              time: option.time?.trim() || "",
              am_pm: option.am_pm?.trim() || "",
            }))
          : [];
      } catch (error) {
        console.error("Unexpected error fetching time options:", error);
      }
    },

    // Load recurring instructions for a specific customer
    async loadRecurringInstructions(customerId) {
      try {
        if (!customerId) {
          console.error(
            "No customer ID provided for loading recurring instructions."
          );
          return;
        }

        const { data: recurringInstructions, error } = await supabase
          .from("instructions_recurring")
          .select("*")
          .eq("customer_id", customerId);

        if (error) {
          throw error;
        }

        // Log the loaded instructions for debugging
        console.log(
          "Recurring instructions fetched from database:",
          recurringInstructions
        );

        // Map recurring instructions into the `instructions` array
        this.instructions = recurringInstructions.map((instruction) => ({
          id: instruction.id,
          description: instruction.description,
          type: "recurring",
          to: [
            ...(instruction.admin ? ["admin"] : []),
            ...(instruction.cleaning ? ["cleaning"] : []),
            ...(instruction.packing ? ["packing"] : []),
            ...(instruction.picking_sending ? ["pickingsending"] : []),
          ],
        }));

        // Log the initialized instructions for verification
        console.log("Initialized instructions:", this.instructions);
      } catch (error) {
        console.error("Error loading recurring instructions:", error);
        this.instructions = [];
      }
    },

    // Set the selected customer and load associated instructions
    async setSelectedCustomer(customer) {
      try {
        if (!customer) {
          this.resetSelectedCustomer();
          return;
        }

        this.selectedCustomer = customer;

        // Log selected customer for debugging
        console.log("Selected customer:", customer);

        // Load related contact and address options
        await this.loadContactOptions(customer.id);
        await this.loadAddressOptions(customer.id);

        // Load recurring instructions for the selected customer
        await this.loadRecurringInstructions(customer.id);

        // Reset selected contacts and addresses
        this.selectedDeliveryContact = null;
        this.selectedCollectionContact = null;
        this.selectedDeliveryAddress = null;
        this.selectedCollectionAddress = null;

        console.log(
          "Selected customer set successfully with instructions initialized."
        );
      } catch (error) {
        console.error("Error setting selected customer:", error);
        this.resetSelectedCustomer(); // Reset in case of failure
      }
    },

    // Reset the selected customer and clear associated data
    resetSelectedCustomer() {
      this.selectedCustomer = null;
      this.contactOptions = [];
      this.addressOptions = [];
      this.selectedDeliveryContact = null;
      this.selectedCollectionContact = null;
      this.selectedDeliveryAddress = null;
      this.selectedCollectionAddress = null;
      this.instructions = [];

      console.log("Customer and related options reset.");
    },

    setSelectedContact(contact) {
      this.selectedContact = contact;
    },

    clearSelectedContact() {
      this.selectedContact = null;
    },

    setSelectedAddress(address) {
      this.selectedAddress = address;
    },

    clearSelectedAddress() {
      this.selectedAddress = null;
    },

    setSelectedCollectionDriver(driverId) {
      this.selectedCollectionDriver = driverId;
      console.log("Selected Collection Driver:", this.selectedCollectionDriver);
    },

    setSelectedDeliveryDriver(driverId) {
      this.selectedDeliveryDriver = driverId;
      console.log("Selected Delivery Driver:", this.selectedDeliveryDriver);
    },

    async updateContactPerson(contact) {
      try {
        const { error } = await supabase
          .from("customer_contact_persons")
          .update({
            name: contact.name,
            contact_no1: contact.contact_no1,
            contact_no2: contact.contact_no2,
            email: contact.email,
            remarks: contact.remarks,
          })
          .eq("id", contact.id);

        if (error) throw error;

        // Reload the contact options after update
        // await this.loadContactOptions(contact.customer_id);
      } catch (error) {
        console.error("Error updating contact person:", error);
        throw error;
      }
    },

    async updateCustomerAddress(address) {
      try {
        const { error } = await supabase
          .from("customer_address")
          .update({
            block_no: address.block_no,
            road_name: address.road_name,
            building_name: address.building_name,
            postal_code: address.postal_code,
            unit_no: address.unit_no,
            additional_info: address.additional_info,
            remarks: address.remarks,
          })
          .eq("id", address.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error updating address:", error);
        throw error;
      }
    },

    setSelectedCollectionContact(contactId) {
      this.selectedCollectionContact = contactId;
    },
    setSelectedDeliveryContact(contactId) {
      this.selectedDeliveryContact = contactId;
    },
    setSelectedCollectionAddress(addressId) {
      this.selectedCollectionAddress = addressId;
    },
    setSelectedDeliveryAddress(addressId) {
      this.selectedDeliveryAddress = addressId;
    },

    // Manually set the order number and override generation
    setOrderNo(orderNo) {
      this.orderNo = orderNo;
      this.isOrderNoManuallySet = true; // Mark as manually set
    },

    addItem(item) {
      const {
        name,
        unit,
        process,
        price,
        pieces,
        quantity = 0,
        subtotal,
        category,
        tag_category,
        pack_category,
        pack_type,
        company,
        weight,
        area,
        pieces_per_unit,
      } = item;

      const unitType = this.detectUnitType(unit);

      // per-unit pieces (for display math); base pieces stays in `pieces`
      const perUnit =
        typeof pieces_per_unit === "number"
          ? pieces_per_unit
          : typeof pieces === "number"
          ? pieces
          : 0;

      const safeNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

      // Normalized measurement used in math
      let measure = 0;
      if (unitType === "weight") {
        measure = typeof weight === "number" ? weight : safeNum(quantity);
      } else if (unitType === "size") {
        measure = typeof area === "number" ? area : safeNum(quantity);
      } else {
        measure = safeNum(quantity);
      }

      const lineSubtotal =
        typeof subtotal === "number"
          ? subtotal
          : typeof price === "number"
          ? price * measure
          : 0;

      let newItem;

      // --- TBA branch (no merge). If you want TBA merging, move the merge logic above this and compare price === "TBA".
      if (price === "TBA") {
        newItem = {
          name,
          process,
          price: "TBA",
          unit,
          pieces, // base only
          quantity: measure, // normalized measure
          subtotal: 0,
          category,
          tag_category,
          pack_category,
          pack_type,
          company,
          pieces_per_unit: perUnit,
        };

        if (unitType === "weight") newItem.weight = measure;
        else if (unitType === "size") newItem.area = measure;

        this.transactionItems = [...this.transactionItems, newItem];
        return;
      }

      // 🔹 Try to merge with existing row (same name + process + unit + price + company)
      const existingItem = this.transactionItems.find(
        (tItem) =>
          tItem.name === name &&
          tItem.process === process &&
          tItem.unit === unit &&
          tItem.price === price &&
          tItem.company === company
      );

      if (existingItem) {
        // Update normalized measurement
        existingItem.quantity = safeNum(existingItem.quantity) + measure;

        if (unitType === "weight") {
          existingItem.weight = safeNum(existingItem.weight) + measure;
        } else if (unitType === "size") {
          existingItem.area = safeNum(existingItem.area) + measure;
        }

        // Set per-unit/base pieces only if missing
        if (
          existingItem.pieces_per_unit == null &&
          typeof perUnit === "number"
        ) {
          existingItem.pieces_per_unit = perUnit;
        }
        if (existingItem.pieces == null && typeof pieces === "number") {
          existingItem.pieces = pieces; // base only
        }

        // Subtotal
        existingItem.subtotal = safeNum(existingItem.subtotal) + lineSubtotal;
      } else {
        // 🔹 Create new row
        newItem = {
          name,
          process,
          price,
          unit,
          pieces, // base only
          quantity: measure, // normalized
          subtotal: lineSubtotal,
          category,
          tag_category,
          pack_category,
          pack_type,
          company,
          pieces_per_unit: perUnit,
        };

        if (unitType === "weight") newItem.weight = measure;
        else if (unitType === "size") newItem.area = measure;

        this.transactionItems = [...this.transactionItems, newItem];
      }
    },

    detectUnitType(unit) {
      if (unit === "pc") return "quantity";
      if (unit === "sqft") return "size";
      if (unit === "kg" || unit === "lbs") return "weight";
      return "quantity";
    },

    removeItem(index) {
      this.transactionItems.splice(index, 1);
    },

    resetTransactionItems() {
      this.transactionItems = [];
      this.instructions = [];
      this.reports = [];
      this.orderNo = "";
      this.selectedCustomer = null;
      this.selectedDeliveryContact = null;
      this.selectedCollectionContact = null;
      this.selectedDeliveryAddress = null;
      this.selectedCollectionAddress = null;
      this.selectedCollectionDriver = null;
      this.selectedDeliveryDriver = null;
      this.collectionTime = null;
      this.deliveryTime = null;
      this.collectionDate = null;
      this.deliveryDate = null;
      this.jobType = null;
      this.useCcCollection = false;
      this.useCcDelivery = false;
    },

    addInstruction(instruction) {
      this.instructions.push(instruction);
    },

    async deleteInstruction(instructionId, instructionType) {
      try {
        if (!instructionId || !instructionType) {
          throw new Error("Instruction ID and type are required.");
        }

        const table =
          instructionType === "onetime"
            ? "instructions_onetime"
            : "instructions_recurring";

        // Delete instruction from the database
        const { error } = await supabase
          .from(table)
          .delete()
          .eq("id", instructionId);

        if (error) {
          throw error;
        }

        // Remove the instruction from the local state
        this.instructions = this.instructions.filter(
          (inst) => inst.id !== instructionId
        );

        console.log(
          `Instruction with ID ${instructionId} deleted successfully.`
        );
      } catch (error) {
        console.error("Error deleting instruction:", error);
        throw error; // Re-throw for higher-level handling
      }
    },

    async addReport(report, orderId) {
      try {
        // Validate required fields
        if (!report.category || !report.sub_category || !report.description) {
          throw new Error(
            "All fields (category, sub-category, description) are required."
          );
        }

        // Prepare the payload
        const payload = {
          description: report.description,
          category: report.category,
          sub_category: report.sub_category,
          order_id: orderId,
          status: "flagged",
        };

        // Check for and upload photo if provided
        if (report.image) {
          const [meta, base64Data] = report.image.split(",");
          const mimeType = meta.match(/:(.*?);/)[1];

          if (!["image/png", "image/jpeg", "image/jpg"].includes(mimeType)) {
            throw new Error(`Unsupported file type: ${mimeType}`);
          }

          const byteCharacters = atob(base64Data);
          const byteArray = new Uint8Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteArray[i] = byteCharacters.charCodeAt(i);
          }
          const blob = new Blob([byteArray], { type: mimeType });
          const fileExtension = mimeType.split("/")[1];

          const now = new Date();

          // Extract components
          const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
          const day = String(now.getDate()).padStart(2, "0");
          const year = String(now.getFullYear()).slice(-2); // Get last two digits of the year
          const hours = String(now.getHours()).padStart(2, "0"); // Military time
          const minutes = String(now.getMinutes()).padStart(2, "0");

          // Concatenate to MMDDYYHHMM format
          const timestamp = `${month}${day}${year}${hours}${minutes}`;

          // Use the formatted timestamp in the file name
          const fileName = `error-report-${timestamp}.${fileExtension}`;

          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("error_report_images")
              .upload(fileName, blob);

          if (uploadError) {
            throw new Error(`File upload failed: ${uploadError.message}`);
          }

          const { data: publicUrlData, error: urlError } = supabase.storage
            .from("error_report_images")
            .getPublicUrl(uploadData.path);

          if (urlError || !publicUrlData.publicUrl) {
            throw new Error(
              "Failed to retrieve public URL for uploaded photo."
            );
          }

          payload.image = publicUrlData.publicUrl;
        }

        // Insert the report into the database
        const { data, error } = await supabase
          .from("order_error_reports")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;

        // Update local state
        this.reports.push({
          id: data.id,
          ...payload,
        });

        console.log("Report added successfully:", data);
        return data;
      } catch (error) {
        console.error("Error adding report:", error);
        throw error;
      }
    },
    async deleteReport(reportId) {
      try {
        if (!reportId) {
          throw new Error("Report ID is required for deletion.");
        }

        // Delete the report from the database
        const { error } = await supabase
          .from("order_error_reports")
          .delete()
          .eq("id", reportId);

        if (error) {
          throw new Error("Failed to delete report from the database.");
        }

        // Remove the report from the local state
        this.reports = this.reports.filter((report) => report.id !== reportId);

        console.log(`Report with ID ${reportId} deleted successfully.`);
      } catch (error) {
        console.error("Error deleting report:", error);
        throw error; // Re-throw for higher-level handling
      }
    },

    async printInvoice(orderNo) {
      const TAG = "[store.printInvoice]";
      console.log(`${TAG} start`, { orderNo });

      try {
        // 1) Resolve orders.id from order_no
        const { data: orderRow, error: orderErr } = await supabase
          .from("orders")
          .select("id")
          .eq("order_no", orderNo)
          .single();

        if (orderErr || !orderRow?.id) {
          console.error(`${TAG} orders lookup failed`, { orderErr, orderRow });
          return { ok: false, error: `Order not found for ${orderNo}` };
        }
        const orderId = orderRow.id;
        console.log(`${TAG} order resolved`, { orderId });

        // 2) Fetch the existing invoice row by order_id (DO NOT INSERT)
        const { data: invRow, error: invErr } = await supabase
          .from("order_invoices")
          .select("id, invoice_no")
          .eq("order_id", orderId)
          .single();

        if (invErr || !invRow?.id) {
          console.error(`${TAG} invoice lookup failed`, {
            invErr,
            invRow,
            orderId,
          });
          return {
            ok: false,
            error: `Invoice row not found for order ${orderNo}`,
          };
        }
        const orderInvoiceId = invRow.id;
        const invoiceNo = invRow.invoice_no;
        console.log(`${TAG} invoice resolved`, { orderInvoiceId, invoiceNo });

        // 3) Insert a print history row (DB auto-fills printed_by, printed_at)
        const { data: histInsert, error: histErr } = await supabase
          .from("order_invoices_print_history")
          .insert({ order_invoice_id: orderInvoiceId })
          .select("id") // Postgres RETURNING
          .single();

        if (histErr || !histInsert?.id) {
          console.error(`${TAG} history insert failed`, {
            histErr,
            histInsert,
          });
          return {
            ok: false,
            error: `Failed to create print history for invoice #${invoiceNo}`,
          };
        }
        const historyId = histInsert.id;
        console.log(`${TAG} history inserted`, { historyId });

        // 4) Fetch the inserted history row to display printed_at/printed_by
        const { data: histRow, error: histFetchErr } = await supabase
          .from("order_invoices_print_history")
          .select("id, printed_at, printed_by")
          .eq("id", historyId)
          .single();

        if (histFetchErr || !histRow?.id) {
          console.warn(
            `${TAG} history fetch failed; proceeding with ids only`,
            { histFetchErr }
          );
          return { ok: true, orderId, orderInvoiceId, invoiceNo, historyId };
        }

        console.log(`${TAG} history fetched`, { histRow });

        // 5) Done — return structured payload
        return {
          ok: true,
          orderId,
          orderInvoiceId,
          invoiceNo,
          historyId,
          history: histRow, // contains printed_at (invoice date) & printed_by
        };
      } catch (err) {
        console.error(`${TAG} unexpected error`, err);
        return { ok: false, error: err?.message || "Unexpected error" };
      }
    },
    async fetchPrintHistoryById(historyId) {
      const TAG = "[fetchPrintHistoryById]";
      console.log(`${TAG} start`, { historyId });

      const { data, error } = await supabase
        .from("order_invoices_print_history")
        .select("id, order_invoice_id, printed_at, printed_by")
        .eq("id", historyId)
        .single();

      if (error) {
        console.error(`${TAG} error`, error);
        return { ok: false, error: error.message };
      }

      console.log(`${TAG} ok`, data);
      return { ok: true, data };
    },

    // Fetch contact person details by contact person ID
    async fetchContactPersonById(contactPersonId) {
      try {
        const { data: contactPerson, error } = await supabase
          .from("customer_contact_persons")
          .select("*")
          .eq("id", contactPersonId)
          .single();

        if (error) {
          console.error("Error fetching contact person details:", error);
          return null;
        }

        return contactPerson;
      } catch (error) {
        console.error(
          "Unexpected error fetching contact person details:",
          error
        );
        return null;
      }
    },
    async fetchCustomerDetailsById(customerId) {
      if (!customerId) {
        console.error("Customer ID is missing.");
        return null;
      }

      try {
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .eq("id", customerId)
          .single();

        if (error) {
          console.error("Error fetching customer details:", error);
          return null;
        }

        return data;
      } catch (err) {
        console.error("Unexpected error fetching customer details:", err);
        return null;
      }
    },

    async fetchCustomerCreditsById(customerId) {
      if (!customerId) {
        console.error("Customer ID is missing.");
        return null;
      }

      try {
        const { data, error } = await supabase
          .from("customer_credits")
          .select("*")
          .eq("customer_id", customerId)
          .single();

        if (error) {
          console.error("Error fetching customer credits:", error);
          return null;
        }

        return data;
      } catch (err) {
        console.error("Unexpected error fetching customer credits:", err);
        return null;
      }
    },

    async fetchCustomerCreditsHistoryById(customerCreditsId) {
      if (!customerCreditsId) {
        console.error("Customer ID is missing.");
        return null;
      }

      try {
        const { data, error } = await supabase
          .from("customer_credits_history")
          .select("*")
          .eq("customer_credit_id", customerCreditsId);

        if (error) {
          console.error("Error fetching customer credits history:", error);
          return null;
        }

        return data;
      } catch (err) {
        console.error(
          "Unexpected error fetching customer credits history:",
          err
        );
        return null;
      }
    },

    async topUpCredits({ customerId, type, amount, remarks }) {
      const typeToColumn = {
        "Online Package": "online_package",
        "Free Wash": "other_credits",
        "Bank Transfer": "other_credits",
        "Over Payment": "other_credits",
        "Other Credits": "other_credits",
      };

      const column = typeToColumn[type];
      if (!column) throw new Error("Invalid credit type");

      // Fetch existing credits (row is guaranteed to exist)
      const { data: creditData, error: fetchError } = await supabase
        .from("customer_credits")
        .select("*")
        .eq("customer_id", customerId)
        .single();
      if (fetchError) throw fetchError;

      // ✅ Numeric-safe math (avoid string concatenation bugs)
      const currentCredit = Number(creditData[column] ?? 0);
      const delta = Number(amount ?? 0);
      const newCredit = currentCredit + delta;

      // Update the credits
      const { error: updateError } = await supabase
        .from("customer_credits")
        .update({ [column]: newCredit })
        .eq("id", creditData.id);
      if (updateError) throw updateError;

      // Log to history with the numeric delta
      const { error: insertError } = await supabase
        .from("customer_credits_history")
        .insert({
          credit_type: type,
          amount: delta, // ✅ ensure numeric
          remarks,
          customer_credit_id: creditData.id,
        });
      if (insertError) throw insertError;

      // (optional) return the updated totals so UI can refresh instantly
      return { ...creditData, [column]: newCredit };
    },

    async addPayment({
      order_id,
      amount,
      type,
      remarks,
      reference_no,
      company,
    }) {
      if (!order_id) throw new Error("Missing order_id");

      const { data: orderPayment, error: fetchError } = await supabase
        .from("order_payments")
        .select("id, paid_amount, total_amount")
        .eq("order_id", order_id)
        .single();

      if (fetchError) throw fetchError;

      const currentPaid = orderPayment.paid_amount || 0;
      const newPaidAmount = currentPaid + amount;
      const isFullyPaid = newPaidAmount >= (orderPayment.total_amount || 0);

      const { error: updateError } = await supabase
        .from("order_payments")
        .update({
          paid_amount: newPaidAmount,
          payment_status: isFullyPaid ? "paid" : "partial",
        })
        .eq("id", orderPayment.id);

      if (updateError) throw updateError;

      const { error: insertError } = await supabase
        .from("order_payments_history")
        .insert({
          order_payment_id: orderPayment.id,
          amount,
          payment_type: type,
          remarks,
          reference_no,
          company,
        });

      if (insertError) throw insertError;
    },

    setSelectedCollectionAddress(address) {
      this.selectedCollectionAddress = address; // Set the selected collection address
    },

    setSelectedDeliveryAddress(address) {
      this.selectedDeliveryAddress = address; // Set the selected delivery address
    },
    async fetchAddressesForCustomer(customerId) {
      try {
        if (!customerId) {
          console.error("Customer ID is required to fetch addresses.");
          return [];
        }

        const { data, error } = await supabase
          .from("customer_address")
          .select(
            "id, block_no, road_name, building_name, postal_code, unit_no, additional_info, remarks"
          )
          .eq("customer_id", customerId);

        if (error) {
          throw new Error(`Error fetching addresses: ${error.message}`);
        }

        return data || []; // Return addresses or an empty array
      } catch (error) {
        console.error("Unexpected error fetching addresses:", error);
        return [];
      }
    },
    async updateCustomer(customer) {
      const { error } = await supabase
        .from("customers")
        .update({
          name: customer.name,
          contact_no1: customer.contact_no1,
          contact_no2: customer.contact_no2,
          email: customer.email,
          type: customer.type,
          sub_type: customer.sub_type,
          payment_type: customer.payment_type,
          recommended_by: customer.recommended_by,
          schedule_remarks: customer.schedule_remarks,
          price_remarks: customer.price_remarks,
          accounting_remarks: customer.accounting_remarks,
          other_remarks: customer.other_remarks,
          po_no: customer.po_no,
          billing_address: customer.billing_address,
        })
        .eq("id", customer.id);

      if (error) throw error;
    },
    async createCustomerAddress(newAddress) {
      try {
        const { error } = await supabase
          .from("customer_address")
          .insert(newAddress);

        if (error) throw error;
      } catch (error) {
        console.error("Error creating address:", error);
        throw error;
      }
    },
    async addAddress(newAddress) {
      try {
        if (!this.selectedCustomer?.id) {
          throw new Error("No customer selected. Cannot add address.");
        }

        // Insert new address into the database
        const { error } = await supabase.from("customer_address").insert({
          ...newAddress,
          customer_id: this.selectedCustomer.id, // Associate with selected customer
        });

        if (error) throw error;

        // Reload addresses
        await this.loadAddressOptions(this.selectedCustomer.id);

        console.log("Address added successfully.");
      } catch (error) {
        console.error("Error adding address:", error.message);
        throw error;
      }
    },

    async fetchAllAddresses() {
      try {
        const { data, error } = await supabase
          .from("customer_address")
          .select("*");

        if (error) throw error;

        return data || [];
      } catch (error) {
        console.error("Error fetching all addresses:", error);
        return [];
      }
    },
    async deleteContactPerson(contactId) {
      try {
        if (!contactId) {
          throw new Error("Contact ID is required for deletion.");
        }

        // Delete from Supabase
        const { error } = await supabase
          .from("customer_contact_persons")
          .delete()
          .eq("id", contactId);

        if (error) {
          throw new Error(`Error deleting contact person: ${error.message}`);
        }

        // Remove from store state
        this.contactOptions = this.contactOptions.filter(
          (contact) => contact.id !== contactId
        );

        console.log(
          `Contact Person with ID ${contactId} deleted successfully.`
        );
      } catch (error) {
        console.error("Error deleting contact person:", error);
        throw error;
      }
    },

    // Delete a customer address by ID
    async deleteCustomerAddress(addressId) {
      try {
        if (!addressId) {
          throw new Error("Address ID is required for deletion.");
        }

        // Delete from Supabase
        const { error } = await supabase
          .from("customer_address")
          .delete()
          .eq("id", addressId);

        if (error) {
          throw new Error(`Error deleting address: ${error.message}`);
        }

        // Remove from store state
        this.addressOptions = this.addressOptions.filter(
          (address) => address.id !== addressId
        );

        console.log(
          `Customer Address with ID ${addressId} deleted successfully.`
        );
      } catch (error) {
        console.error("Error deleting customer address:", error);
        throw error;
      }
    },
    resetItems() {
      this.transactionItems = [];
    },

    async fetchContactPersons(customerId) {
      if (!customerId) {
        console.error("fetchContactPersons: customerId is missing.");
        return [];
      }

      try {
        const { data, error } = await supabase
          .from("customer_contact_persons")
          .select("*")
          .eq("customer_id", customerId);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching contact persons:", error);
        return [];
      }
    },

    setCollectionDates({ from, to }) {
      this.collectionDateFrom = from;
      this.collectionDateTo = to;
    },

    setDeliveryDates({ from, to }) {
      this.deliveryDateFrom = from;
      this.deliveryDateTo = to;
    },

    async addContactPerson(contactPerson) {
      try {
        if (!this.selectedCustomer?.id) {
          throw new Error("No customer selected. Cannot add contact person.");
        }

        // Insert new contact person into the database
        const { data, error } = await supabase
          .from("customer_contact_persons")
          .insert({
            ...contactPerson,
            customer_id: this.selectedCustomer.id, // Associate with selected customer
          });

        if (error) throw error;

        // Reload contact persons to include the new one
        this.contactPersons = await this.fetchContactPersons(
          this.selectedCustomer.id
        );
      } catch (error) {
        console.error("Error adding contact person:", error);
        throw error; // Re-throw to handle errors in the UI if needed
      }
    },

    toggleUseCcCollection(value) {
      this.useCcCollection = value;

      console.log(`Self-collect checkbox changed: ${value}`); // Log the new value

      if (value) {
        // Find the default contact and address (id=1) in the options
        const defaultContact = this.contactOptions.find(
          (contact) => contact.id === 1
        );
        const defaultAddress = this.addressOptions.find(
          (address) => address.id === 1
        );

        // Set default values for collection contact and address
        this.selectedCollectionContact = defaultContact
          ? {
              id: defaultContact.id,
              name: defaultContact.name,
              contact_no1: defaultContact.contact_no1,
              contact_no2: defaultContact.contact_no2,
              label: `${defaultContact.name} - ${
                defaultContact.contact_no1
              } / ${defaultContact.contact_no2 || "-"}`,
            }
          : null;

        this.selectedCollectionAddress = defaultAddress
          ? {
              id: defaultAddress.id,
              block_no: defaultAddress.block_no,
              road_name: defaultAddress.road_name,
              building_name: defaultAddress.building_name,
              postal_code: defaultAddress.postal_code,
              label: `${defaultAddress.block_no} ${defaultAddress.road_name} ${
                defaultAddress.unit_no
              } ${defaultAddress.building_name}, ${
                defaultAddress.postal_code
              } ${defaultAddress?.additional_info || ""}`,
            }
          : null;

        console.log("Self-collect enabled. Default values set:", {
          contact: this.selectedCollectionContact,
          address: this.selectedCollectionAddress,
        });
      } else {
        // Reset values when self-collect is disabled
        this.selectedCollectionContact = null;
        this.selectedCollectionAddress = null;

        console.log("Self-collect disabled. Values reset.");
      }
    },

    toggleUseCcDelivery(value) {
      this.useCcDelivery = value;

      console.log(`Self-pickup checkbox changed: ${value}`); // Log the new value

      if (value) {
        // Find the default contact and address (id=1) in the options
        const defaultContact = this.contactOptions.find(
          (contact) => contact.id === 1
        );
        const defaultAddress = this.addressOptions.find(
          (address) => address.id === 1
        );

        // Set default values for delivery contact and address
        this.selectedDeliveryContact = defaultContact
          ? {
              id: defaultContact.id,
              name: defaultContact.name,
              contact_no1: defaultContact.contact_no1,
              contact_no2: defaultContact.contact_no2,
              label: `${defaultContact.name} - ${
                defaultContact.contact_no1
              } / ${defaultContact.contact_no2 || "-"}`,
            }
          : null;

        this.selectedDeliveryAddress = defaultAddress
          ? {
              id: defaultAddress.id,
              block_no: defaultAddress.block_no,
              road_name: defaultAddress.road_name,
              building_name: defaultAddress.building_name,
              postal_code: defaultAddress.postal_code,
              label: `${defaultAddress.block_no} ${defaultAddress.road_name} ${
                defaultAddress.unit_no
              } ${defaultAddress.building_name}, ${
                defaultAddress.postal_code
              } ${defaultAddress?.additional_info || ""}`,
            }
          : null;

        console.log("Self-pickup enabled. Default values set:", {
          contact: this.selectedDeliveryContact,
          address: this.selectedDeliveryAddress,
        });
      } else {
        // Reset values when self-pickup is disabled
        this.selectedDeliveryContact = null;
        this.selectedDeliveryAddress = null;

        console.log("Self-pickup disabled. Values reset.");
      }
    },
    async updateOrder(orderNo, payload) {
      try {
        const { error } = await supabase
          .from("orders")
          .update(payload)
          .eq("order_no", orderNo);

        if (error) {
          throw error;
        }

        console.log("Order updated successfully:", orderNo);
      } catch (error) {
        console.error("Error updating order:", error);
        throw error;
      }
    },
    async addInstruction(instruction, orderId = null, customerId = null) {
      try {
        if (!instruction.description || !instruction.to.length) {
          throw new Error(
            "Instruction description and 'To' fields are required."
          );
        }

        const table =
          instruction.type === "onetime"
            ? "instructions_onetime"
            : "instructions_recurring";

        // Construct payload
        const payload = {
          description: instruction.description,
          admin: instruction.to.includes("admin"),
          cleaning: instruction.to.includes("cleaning"),
          packing: instruction.to.includes("packing"),
          picking_sending: instruction.to.includes("pickingsending"),
        };

        if (instruction.type === "onetime") {
          payload.order_id = orderId;
        } else {
          payload.customer_id = customerId;
        }

        // Insert into the appropriate table
        const { data, error } = await supabase
          .from(table)
          .insert(payload)
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Update local instructions array
        this.instructions.push({
          id: data.id,
          description: data.description,
          type: instruction.type,
          to: instruction.to,
        });

        console.log("Instruction added successfully:", data);
        return data; // Return the added instruction
      } catch (error) {
        console.error("Error adding instruction:", error);
        throw error; // Re-throw for higher-level handling
      }
    },
    async deleteTransaction(transactionId) {
      try {
        const { error } = await supabase
          .from("transactions")
          .delete()
          .eq("id", transactionId);

        if (error) throw error;

        console.log(
          `Transaction with ID ${transactionId} deleted successfully.`
        );
      } catch (error) {
        console.error("Error deleting transaction from database:", error);
        throw error;
      }
    },
    async addTransaction(transaction) {
      try {
        const { data, error } = await supabase
          .from("order_transaction_items") // Replace with your actual table name
          .insert(transaction)
          .select();

        if (error) throw error;

        // Update local state with the new transaction
        if (data && data.length) {
          this.transactions.push(data[0]);
        }

        return data[0]; // Return the added transaction
      } catch (err) {
        console.error("Error adding transaction:", err);
        throw err; // Rethrow the error for the caller to handle
      }
    },

    async fetchRecurringInstructions(customerId) {
      try {
        if (!customerId) {
          console.error(
            "Customer ID is required to fetch recurring instructions."
          );
          return;
        }

        const { data: recurringInstructions, error } = await supabase
          .from("instructions_recurring")
          .select("*")
          .eq("customer_id", customerId);

        if (error) {
          throw error;
        }

        console.log("Fetched recurring instructions:", recurringInstructions);

        // Format and update displayInstructions
        this.displayInstructions = recurringInstructions.map((instruction) => ({
          id: instruction.id,
          description: instruction.description,
          type: "recurring",
          to: [
            ...(instruction.admin ? ["admin"] : []),
            ...(instruction.cleaning ? ["cleaning"] : []),
            ...(instruction.packing ? ["packing"] : []),
            ...(instruction.picking_sending ? ["pickingsending"] : []),
          ],
        }));

        console.log(
          "Formatted recurring instructions:",
          this.displayInstructions
        );
      } catch (error) {
        console.error("Error fetching recurring instructions:", error);
        this.displayInstructions = []; // Reset on error
      }
    },
    async fetchCustomerTypes() {
      try {
        const { data, error } = await supabase
          .from("options_customer_types")
          .select("type, sub_type");

        if (error) {
          throw error;
        }

        // Group sub-types under their respective types
        const groupedData = data.reduce((acc, item) => {
          const { type, sub_type } = item;

          if (!acc[type]) {
            acc[type] = [];
          }

          if (sub_type && !acc[type].includes(sub_type)) {
            acc[type].push(sub_type);
          }

          return acc;
        }, {});

        // Extract unique customer types
        const customerTypes = Object.keys(groupedData);

        // Map types to their sub-types
        const subTypeMapping = Object.entries(groupedData).reduce(
          (acc, [type, subTypes]) => {
            acc[type] = subTypes.map((subType) => ({
              label: subType,
              value: subType,
            }));
            return acc;
          },
          {}
        );

        return { customerTypes, subTypeMapping };
      } catch (error) {
        console.error("Error fetching customer types:", error);
        return { customerTypes: [], subTypeMapping: {} }; // Return empty structure on error
      }
    },
    async fetchAllCollections() {
      try {
        const { data, error } = await supabase
          .from("logistics_collections")
          .select(
            `
        id,
        created_at,
        collection_remarks,
        contact_person_id,
        address_id,
        collection_date,
        collection_time,
        no_bags,
        logistics_id,
        driver_id,
        customer_contact_persons (
          id,
          name,
          contact_no1,
          contact_no2,
          email
        ),
        logistics (
          id,
          customer_id,
          job_type,
          logistics_status,
          urgency,
          order_id,
          orders (
            id,
            order_no,
            order_payments (
              payment_status,
              total_amount,
              paid_amount
            ),
            order_production (
            id,
              
              goods_status,
              no_packets,
              no_hangers,
              no_rolls
            )
          ),
          customers (
            id,
            name,
            contact_no1,
            contact_no2,
            email,
            type,
            sub_type,
            customer_credits (
              online_package,
              other_credits
            )
          )
        )
      `
          )
          .order("logistics_id", { ascending: true })
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formattedData = data.map((collection) => ({
          id: collection.id,
          created_at: collection.created_at,
          logistics_status: collection.logistics?.logistics_status || null,
          urgency: collection.logistics?.urgency,
          collection_remarks: collection.collection_remarks,
          contact_person_id: collection.contact_person_id,
          address_id: collection.address_id,
          driver_id: collection.driver_id,
          collection_date: collection.collection_date,
          collection_time: collection.collection_time,
          no_bags: collection.no_bags,
          logistics_id: collection.logistics_id,
          job_type: collection.logistics?.job_type || null,
          customer_id: collection.logistics?.customer_id || null,
          order_id: collection.logistics?.order_id || null,
          order_no: collection.logistics?.orders?.order_no || null,
          customer: collection.logistics?.customers
            ? {
                id: collection.logistics.customers.id,
                name: collection.logistics.customers.name,
                contact_no1: collection.logistics.customers.contact_no1,
                contact_no2: collection.logistics.customers.contact_no2,
                email: collection.logistics.customers.email,
                type: collection.logistics.customers.type,
                sub_type: collection.logistics.customers.sub_type,
              }
            : null,
          customer_credits: collection.logistics?.customers?.customer_credits[0]
            ? {
                online_package:
                  collection.logistics.customers?.customer_credits[0]
                    .online_package,
                other_credits:
                  collection.logistics.customers?.customer_credits[0]
                    .other_credits,
              }
            : null,
          contact_person: collection.customer_contact_persons
            ? {
                id: collection.customer_contact_persons.id,
                name: collection.customer_contact_persons.name,
                contact_no1: collection.customer_contact_persons.contact_no1,
                contact_no2: collection.customer_contact_persons.contact_no2,
                email: collection.customer_contact_persons.email,
              }
            : null,
          order_payments: collection.logistics?.orders?.order_payments[0]
            ? {
                payment_status:
                  collection.logistics.orders.order_payments[0].payment_status,
                total_amount:
                  collection.logistics.orders.order_payments[0].total_amount,
                paid_amount:
                  collection.logistics.orders.order_payments[0].paid_amount,
              }
            : null,
          order_production: collection.logistics?.orders?.order_production[0]
            ? {
                id: collection.logistics?.orders?.order_production[0].id,
                goods_status:
                  collection.logistics?.orders?.order_production[0]
                    .goods_status,
                no_packets:
                  collection.logistics?.orders?.order_production[0].no_packets,
                no_hangers:
                  collection.logistics?.orders?.order_production[0].no_hangers,
                no_rolls:
                  collection.logistics?.orders?.order_production[0].no_rolls,
              }
            : null,
        }));

        console.log("Fetched Collections:", formattedData);
        return formattedData || [];
      } catch (error) {
        console.error("Error fetching collections:", error);
        return [];
      }
    },

    async fetchAllDeliveries() {
      try {
        const { data, error } = await supabase
          .from("logistics_deliveries")
          .select(
            `
            id,
            created_at,
            delivery_remarks,
            contact_person_id,
            address_id,
            delivery_date,
            delivered_date,
            delivery_time,
            logistics_id,
            driver_id,
            customer_contact_persons (
              id,
              name,
              contact_no1,
              contact_no2 ,
              email
            ),
            logistics (
            id,
              customer_id,
              job_type,
              logistics_status,
              customers (
                id,
                name,
                contact_no1,
                contact_no2,
                email,
                type,
                sub_type
              )
            )
          `
          )
          .order("logistics_id", { ascending: true })
          .order("created_at", { ascending: false }); // Ensure latest version comes first

        if (error) {
          throw error;
        }

        // Transform data to include related customer and driver details
        const formattedData = data.map((delivery) => ({
          id: delivery.id,
          created_at: delivery.created_at,
          logistics_status: delivery.logistics?.logistics_status,
          delivery_remarks: delivery.delivery_remarks,
          contact_person_id: delivery.contact_person_id,
          address_id: delivery.address_id,
          driver_id: delivery.driver_id,
          delivery_date: delivery.delivery_date,
          delivery_time: delivery.delivery_time,
          logistics_id: delivery.logistics_id,
          job_type: delivery.logistics?.job_type,
          // order_no: delivery.logistics?.orders?.order_no || null,
          customer_id: delivery.logistics?.customer_id || null,
          customer: delivery.logistics?.customers
            ? {
                id: delivery.logistics?.customers?.id,
                name: delivery.logistics?.customers?.name,
                contact_no1: delivery.logistics?.customers?.contact_no1,
                contact_no2: delivery.logistics?.customers?.contact_no2,
                email: delivery.logistics?.customers?.email,
                type: delivery.logistics?.customers?.type,
                sub_type: delivery.logistics?.customers?.sub_type,
              }
            : null,
          contact_person: delivery.customer_contact_persons
            ? {
                id: delivery.customer_contact_persons.id,
                name: delivery.customer_contact_persons.name,
                contact_no1: delivery.customer_contact_persons.contact_no1,
                contact_no2: delivery.customer_contact_persons.contact_no2,
                email: delivery.customer_contact_persons.email,
              }
            : null,
        }));

        console.log("Fetched Deliveries with Logistics:", formattedData);
        return formattedData || [];
      } catch (error) {
        console.error("Error fetching deliveries:", error);
        return [];
      }
    },

    async fetchAllOrders() {
      try {
        const { data, error } = await supabase
          .from("logistics") // ✅ Fetch from logistics as the central table
          .select(
            `
              id,
              job_type,
              logistics_status,
              urgency,
              orders (
                id,
                order_no,
                logistics_id,
                tag_timestamp,
                tag_changes,
                tag_status,
              goods_status,
              payment_status,
                customer_id,
                customers (
                  id,
                  name,
                  contact_no1,
                  contact_no2,
                  email
                )
              ),
              collections (
                id,
                logistics_id,
                collection_date,
                collection_time,
                contact_person_id,
                driver_id,
                no_bags,
                drivers (
                  id,
                  name,
                  contact_no1
                ),
                contact_persons (
                  id,
                  name,
                  contact_no1,
                  contact_no2,
                  email
                )
              ),
              deliveries (
                id,
                logistics_id,
                delivery_date,
                delivery_time,
                driver_id,
                contact_person_id,
                no_bags,
                drivers (
                  id,
                  name,
                  contact_no1
                ),
                contact_persons (
                  id,
                  name,
                  contact_no1,
                  contact_no2,
                  email
                )
              )
            `
          )
          .order("id", { ascending: true }); // ✅ Order by logistics.id to maintain structure

        if (error) throw error;

        if (!data || data.length === 0) {
          console.warn("No orders found.");
          return [];
        }

        return data.map((logistics) => ({
          logistics_id: logistics.id,
          job_type: logistics.job_type,
          urgency: logistics.urgency,
          logistics_status: logistics.logistics_status,
          orders:
            logistics.orders?.map((order) => ({
              id: order.id,
              order_no: order.order_no,
              tag_timestamp: order.tag_timestamp,
              tag_changes: order.tag_changes,
              tag_status: order.tag_status,
              goods_status: order.goods_status,
              payment_status: order.payment_status,
              customer_id: order.customer_id,
              customer: order.customers
                ? {
                    id: order.customers.id,
                    name: order.customers.name,
                    contact_no1: order.customers.contact_no1,
                    contact_no2: order.customers.contact_no2,
                    email: order.customers.email,
                  }
                : null,
            })) || [], // ✅ Ensure it's always an array
          collections:
            logistics.collections?.map((collection) => ({
              id: collection.id,
              collection_date: collection.collection_date,
              collection_time: collection.collection_time,
              no_bags: collection.no_bags,
              driver: collection.drivers
                ? {
                    id: collection.drivers.id,
                    name: collection.drivers.name,
                    contact_no1: collection.drivers.contact_no1,
                  }
                : null,
              contact_person: collection.contact_persons
                ? {
                    id: collection.contact_persons.id,
                    name: collection.contact_persons.name,
                    contact_no1: collection.contact_persons.contact_no1,
                    contact_no2: collection.contact_persons.contact_no2,
                    email: collection.contact_persons.email,
                  }
                : null,
            })) || [], // ✅ Ensure collections is always an array
          deliveries:
            logistics.deliveries?.map((delivery) => ({
              id: delivery.id,
              delivery_date: delivery.delivery_date,
              delivery_time: delivery.delivery_time,
              no_bags: delivery.no_bags,
              driver: delivery.drivers
                ? {
                    id: delivery.drivers.id,
                    name: delivery.drivers.name,
                    contact_no1: delivery.drivers.contact_no1,
                  }
                : null,
              contact_person: delivery.contact_persons
                ? {
                    id: delivery.contact_persons.id,
                    name: delivery.contact_persons.name,
                    contact_no1: delivery.contact_persons.contact_no1,
                    contact_no2: delivery.contact_persons.contact_no2,
                    email: delivery.contact_persons.email,
                  }
                : null,
            })) || [], // ✅ Ensure deliveries is always an array
        }));
      } catch (error) {
        console.error("Error fetching all orders:", error);
        return [];
      }
    },
    async fetchWholeOrderByOrderNo(orderNo) {
      try {
        // 1) Core order + customer (use same aliasing as the working function)
        const { data, error } = await supabase
          .from("logistics")
          .select(
            `
          id,
          job_type,
          urgency,
          logistics_status,
          customer_id,
          orders!inner(
            order_no,
            id,
            created_at,
            order_payments(id, payment_status, paid_amount, total_amount, deposit),
            order_tags(tag_status, tag_changes),
            order_production(id,  goods_status, no_packets, no_hangers, no_rolls, no_returns),
            order_invoices(invoice_no, created_at)
          ),
          customers:customer_id (
            id,
            name,
            contact_no1,
            contact_no2,
            email,
            type,
            sub_type,
            schedule_remarks,
            price_remarks,
            accounting_remarks,
            other_remarks,
            billing_address,
            po_no,
            customer_credits(online_package, other_credits)
          )
        `
          )
          .eq("orders.order_no", orderNo)
          .single();

        if (error) throw error;
        if (!data || !data.orders) return null;

        const order = data.orders;

        // 2) Collections & deliveries via helpers (same as the working function)
        const [collectionsRes, deliveriesRes] = await Promise.allSettled([
          this.fetchCollectionByLogisticsId(data.id),
          this.fetchDeliveryByLogisticsId(data.id),
        ]);

        const rawCollections =
          collectionsRes.status === "fulfilled" &&
          Array.isArray(collectionsRes.value)
            ? collectionsRes.value
            : [];

        const rawDeliveries =
          deliveriesRes.status === "fulfilled" &&
          Array.isArray(deliveriesRes.value)
            ? deliveriesRes.value
            : [];

        // 3) Map collections to SAME shape as fetchAllOrdersSimple
        const collections = rawCollections.map((c) => ({
          id: c.id,
          collection_date: c.collection_date,
          collection_time: c.collection_time,
          no_bags: c.no_bags,
          collection_remarks: c.collection_remarks,
          driver_id: c.driver_id,
          driver: c.profiles
            ? { id: c.profiles.id, name: c.profiles.name }
            : null,
          address_id: c.address_id,
          // Why: UI expects 'address', not 'customer_address' (keep parity with Simple)
          address: c.customer_address
            ? {
                id: c.customer_address.id,
                block_no: c.customer_address.block_no,
                road_name: c.customer_address.road_name,
                unit_no: c.customer_address.unit_no,
                building_name: c.customer_address.building_name,
                postal_code: c.customer_address.postal_code,
                additional_info: c.customer_address.additional_info,
                remarks: c.customer_address.remarks,
              }
            : null,
          contact_person: c.customer_contact_persons
            ? {
                id: c.customer_contact_persons.id,
                name: c.customer_contact_persons.name,
                contact_no1: c.customer_contact_persons.contact_no1,
                contact_no2: c.customer_contact_persons.contact_no2,
                email: c.customer_contact_persons.email,
              }
            : null,
        }));

        // 4) Map deliveries to SAME shape as fetchAllOrdersSimple
        const deliveries = rawDeliveries.map((d) => ({
          id: d.id,
          delivery_date: d.delivery_date,
          delivery_time: d.delivery_time,
          delivery_remarks: d.delivery_remarks,
          driver_id: d.driver_id,
          driver: d.profiles
            ? { id: d.profiles.id, name: d.profiles.name }
            : null,
          address_id: d.address_id,
          address: d.customer_address
            ? {
                id: d.customer_address.id,
                block_no: d.customer_address.block_no,
                road_name: d.customer_address.road_name,
                unit_no: d.customer_address.unit_no,
                building_name: d.customer_address.building_name,
                postal_code: d.customer_address.postal_code,
                additional_info: d.customer_address.additional_info,
                remarks: d.customer_address.remarks,
              }
            : null,
          contact_person: d.customer_contact_persons
            ? {
                id: d.customer_contact_persons.id,
                name: d.customer_contact_persons.name,
                contact_no1: d.customer_contact_persons.contact_no1,
                contact_no2: d.customer_contact_persons.contact_no2,
                email: d.customer_contact_persons.email,
              }
            : null,
        }));

        // 5) Fetch related resources in parallel
        const [
          transactions,
          onetimeInstructions,
          errorReports,
          recurringInstructions,
        ] = await Promise.all([
          this.fetchTransactionsByOrderId(order.id),
          this.fetchOnetimeInstructionsByOrderId(order.id),
          this.fetchErrorReportsByOrderId(order.id),
          this.fetchRecurringInstructionsByCustomerId(data.customer_id),
        ]);

        // 6) Assemble final payload (parity with working function + backward-compat single objects)
        const fullData = {
          logistics_id: data.id,
          job_type: data.job_type,
          urgency: data.urgency,
          logistics_status: data.logistics_status,

          customer_id: order.customer_id,
          customer: data.customers || null,

          transactions,
          instructions_onetime: onetimeInstructions,
          error_reports: errorReports,

          order: {
            id: order.id,
            order_no: order.order_no,
            created_at: order.created_at,
            order_payment: Array.isArray(order.order_payments)
              ? order.order_payments[0] || null
              : order.order_payments || null,
            order_tags: Array.isArray(order.order_tags)
              ? order.order_tags[0] || null
              : order.order_tags || null,
            order_production: Array.isArray(order.order_production)
              ? order.order_production[0] || null
              : order.order_production || null,
            order_invoices: Array.isArray(order.order_invoices)
              ? order.order_invoices[0] || null
              : order.order_invoices || null,
          },

          instructions_recurring: recurringInstructions,

          // Arrays aligned with fetchAllOrdersSimple
          collections,
          deliveries,

          // Backward-compat single-object shape using first mapped item
          collection: collections[0] || null,
          delivery: deliveries[0] || null,
        };

        return fullData;
      } catch (err) {
        console.error("Error fetching whole order:", err);
        return null;
      }
    },
    async fetchAllOrdersSimple() {
      try {
        const { data, error } = await supabase
          .from("logistics")
          .select(
            `
              id,
              logistics_status,
              urgency,
job_type,
              orders (
                id,
                order_no,
                created_at,
                order_payments (
                  payment_status,
                  total_amount,
                  paid_amount
                ),
                order_tags (
                  tag_status,
                  tag_changes
                ),
                order_production (
                  id,
                  
                  goods_status,
                  no_packets,
                  no_hangers,
                  no_rolls,
                  no_returns
                ),
                order_invoices (
                  invoice_no,
                  created_at
                )
              ),

              customers:customer_id (
                id,
                name,
                contact_no1,
                contact_no2,
                email,
                pricing_group_id,
                customer_credits (
                  online_package,
                  other_credits
                )
              )
            `
          )
          .order("id", { ascending: true });

        if (error) throw error;
        if (!Array.isArray(data) || data.length === 0) return [];

        // attach collections & deliveries via helper functions
        const enriched = await Promise.all(
          data.map(async (logistics) => {
            const [collectionsRes, deliveriesRes] = await Promise.allSettled([
              this.fetchCollectionByLogisticsId(logistics.id),
              this.fetchDeliveryByLogisticsId(logistics.id),
            ]);

            const collections =
              collectionsRes.status === "fulfilled" &&
              Array.isArray(collectionsRes.value)
                ? collectionsRes.value
                : [];
            const deliveries =
              deliveriesRes.status === "fulfilled" &&
              Array.isArray(deliveriesRes.value)
                ? deliveriesRes.value
                : [];

            return {
              ...logistics,
              logistics_collections: collections,
              logistics_deliveries: deliveries,
            };
          })
        );

        // map to the same output shape you already use
        return enriched.map((logistics) => ({
          logistics_id: logistics.id,
          logistics_status: logistics.logistics_status,
          urgency: logistics.urgency,
          job_type: logistics.job_type,
          order: logistics.orders
            ? {
                id: logistics.orders.id,
                order_no: logistics.orders.order_no,
                created_at: logistics.orders.created_at,
                order_payment: Array.isArray(logistics.orders.order_payments)
                  ? logistics.orders.order_payments[0] || null
                  : logistics.orders.order_payments || null,
                order_tags: Array.isArray(logistics.orders.order_tags)
                  ? logistics.orders.order_tags[0] || null
                  : logistics.orders.order_tags || null,
                order_production: Array.isArray(
                  logistics.orders.order_production
                )
                  ? logistics.orders.order_production[0] || null
                  : logistics.orders.order_production || null,
                order_invoices: Array.isArray(logistics.orders.order_invoices)
                  ? logistics.orders.order_invoices[0] || null
                  : logistics.orders.order_invoices || null,
              }
            : null,

          customer: logistics.customers
            ? {
                id: logistics.customers.id,
                name: logistics.customers.name,
                contact_no1: logistics.customers.contact_no1,
                contact_no2: logistics.customers.contact_no2,
                email: logistics.customers.email,
                pricing_group_id: logistics.customers.pricing_group_id,
                customer_credits: Array.isArray(
                  logistics.customers.customer_credits
                )
                  ? logistics.customers.customer_credits[0] || null
                  : logistics.customers.customer_credits || null,
              }
            : null,

          collections:
            logistics.logistics_collections?.map((c) => ({
              id: c.id,
              collection_date: c.collection_date,
              collection_time: c.collection_time,
              no_bags: c.no_bags,
              driver_id: c.driver_id,
              driver: c.profiles
                ? {
                    id: c.profiles.id,
                    name: c.profiles.name,
                  }
                : null,
              address_id: c.address_id,
              address: c.customer_address
                ? {
                    id: c.customer_address.id,
                    block_no: c.customer_address.block_no,
                    road_name: c.customer_address.road_name,
                    unit_no: c.customer_address.unit_no,
                    building_name: c.customer_address.building_name,
                    postal_code: c.customer_address.postal_code,
                    additional_info: c.customer_address.additional_info,
                    remarks: c.customer_address.remarks,
                  }
                : null,
              contact_person: c.customer_contact_persons
                ? {
                    id: c.customer_contact_persons.id,
                    name: c.customer_contact_persons.name,
                    contact_no1: c.customer_contact_persons.contact_no1,
                    contact_no2: c.customer_contact_persons.contact_no2,
                    email: c.customer_contact_persons.email,
                  }
                : null,
            })) || [],

          deliveries:
            logistics.logistics_deliveries?.map((d) => ({
              id: d.id,
              delivery_date: d.delivery_date,
              delivered_date: d.delivered_date,
              delivery_time: d.delivery_time,
              driver_id: d.driver_id,
              driver: d.profiles
                ? {
                    id: d.profiles.id,
                    name: d.profiles.name,
                  }
                : null,
              address_id: d.address_id,
              address: d.customer_address
                ? {
                    id: d.customer_address.id,
                    block_no: d.customer_address.block_no,
                    road_name: d.customer_address.road_name,
                    unit_no: d.customer_address.unit_no,
                    building_name: d.customer_address.building_name,
                    postal_code: d.customer_address.postal_code,
                    additional_info: d.customer_address.additional_info,
                    remarks: d.customer_address.remarks,
                  }
                : null,
              contact_person: d.customer_contact_persons
                ? {
                    id: d.customer_contact_persons.id,
                    name: d.customer_contact_persons.name,
                    contact_no1: d.customer_contact_persons.contact_no1,
                    contact_no2: d.customer_contact_persons.contact_no2,
                    email: d.customer_contact_persons.email,
                  }
                : null,
            })) || [],
        }));
      } catch (error) {
        console.error("Error fetching all orders:", error);
        return [];
      }
    },
    // Fetch Transactions
    async fetchTransactionsByOrderId(orderId) {
      const { data, error } = await supabase
        .from("order_transactions")
        .select(
          `
      order_id,
      created_at,
      status,
      order_transaction_items (
      id,
        item_name,
        price,
        process,
        quantity,
        pieces,
        subtotal,
        category,
        tag_category,
        pack_category,
        unit,
        ready_status,
        pack_type,
        company
      )
    `
        )
        .eq("order_id", orderId)
        .eq("status", "active");

      if (error) {
        console.error("Error fetching transactions:", error);
        return [];
      }

      console.log("Fetched transactions:", data);
      return data;
    },

    // Fetch One-Time Instructions
    async fetchOnetimeInstructionsByOrderId(orderId) {
      const { data, error } = await supabase
        .from("instructions_onetime")
        .select(
          "id, order_id, description, admin, packing, cleaning, picking_sending"
        )
        .eq("order_id", orderId);

      if (error) {
        console.error("Error fetching one-time instructions:", error);
        return [];
      }
      return data;
    },

    // Fetch Recurring Instructions
    async fetchRecurringInstructionsByCustomerId(customerId) {
      const { data, error } = await supabase
        .from("instructions_recurring")
        .select(
          "id, customer_id, description, admin, packing, cleaning, picking_sending"
        )
        .eq("customer_id", customerId);

      if (error) {
        console.error("Error fetching recurring instructions:", error);
        return [];
      }

      // console.log("✅ Recurring instructions fetched:", data);
      return data;
    },

    // Fetch Error Reports
    async fetchErrorReportsByOrderId(orderId) {
      const { data, error } = await supabase
        .from("order_error_reports")
        .select(
          "id, order_id, description, category, sub_category, image, status"
        )
        .eq("order_id", orderId);

      if (error) {
        console.error("Error fetching error reports:", error);
        return [];
      }
      // console.log("✅ Error reports fetched:", data);

      return data;
    },

    // Function to fetch profile name by user ID (created_by)
    async getProfileName(userId) {
      const { data, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", userId)
        .single();

      if (error) {
        console.error(`Error fetching profile name for user ${userId}:`, error);
        return "[UNKNOWN]";
      }

      return data?.name || "[UNKNOWN]";
    },

    // Fetch Collection
    async fetchCollectionByLogisticsId(logisticsId) {
      const { data, error } = await supabase
        .from("logistics_collections")
        .select(
          `
 id,
          logistics_id,
          collection_date,
          collection_time,
          no_bags,
          collection_remarks,
          driver_id,
                  profiles:driver_id (
          id,
          name
        ),
          address_id,
          customer_address (
            id,
            road_name,
            postal_code,
            unit_no,
            building_name,
            additional_info,
            block_no,
            remarks
          ),
          customer_contact_persons (
            id,
            name,
            contact_no1,
            contact_no2,
            email
          ),
          logistics ( logistics_status )
        `
        )
        .eq("logistics_id", logisticsId);

      if (error) {
        console.error("Error fetching collections:", error);
        return [];
      }

      return data;
    },

    async fetchCollectionHistoryByCollectionId(collectionId) {
      const id = Number(collectionId);
      if (!Number.isFinite(id) || id <= 0) {
        console.warn(
          "[fetchCollectionHistoryByCollectionId] invalid id:",
          collectionId
        ); // WHY: prevent 22P02
        return [];
      }

      const { data, error } = await supabase
        .from("logistics_collections_history")
        .select(
          `
        id,
        created_at,
        created_by, 
        collection_date,
        collection_time,
        no_bags,
        collection_remarks,
        driver_id,
        profiles:driver_id ( id, name ),
        address_id,
        customer_address:address_id (
          id, road_name, postal_code, unit_no, building_name, additional_info, block_no, remarks
        ),
        customer_contact_persons:contact_person_id (
          id, name, contact_no1, contact_no2, email
        ),
      logistics_collection_id
    `
        )
        .eq("logistics_collection_id", id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching collection history:", error);
        return [];
      }

      const withProfiles = await Promise.all(
        (data || []).map(async (row) => {
          const profile_name = row.created_by
            ? await this.getProfileName(row.created_by).catch(() => "[NOT SET]")
            : "[NOT SET]";
          return { ...row, profile_name };
        })
      );

      return withProfiles;
    },
    async fetchDeliveryById(deliveryId) {
      const { data, error } = await supabase
        .from("logistics_deliveries")
        .select(
          `
      id,
      logistics_id,
      delivery_date,
      delivery_time,
      driver_id,
      delivery_remarks,
      delivered_date,
      profiles:driver_id ( id, name ),
      address_id,
      customer_address (
        id, road_name, postal_code, unit_no, building_name,
        additional_info, block_no, remarks
      ),
      customer_contact_persons ( id, name, contact_no1, contact_no2, email ),
      logistics ( id, order_id, logistics_status, orders(order_no) )
    `
        )
        .eq("id", deliveryId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching delivery by id:", error);
        return null;
      }
      return data;
    },

    async fetchDeliveryByLogisticsId(logisticsId) {
      const { data, error } = await supabase
        .from("logistics_deliveries")
        .select(
          `
          id,
          logistics_id,
          delivery_date,
          delivery_time,
          driver_id,
          delivery_remarks,
          delivered_date,
                  profiles:driver_id (
          id,
          name
        ),
          address_id,
          customer_address (
            id,
            road_name,
            postal_code,
            unit_no,
            building_name,
            additional_info,
            block_no,
            remarks
          ),
          customer_contact_persons (
            id,
            name,
            contact_no1,
            contact_no2,
            email
          ),
          logistics ( logistics_status )
        `
        )
        .eq("logistics_id", logisticsId);
      if (error) {
        console.error("Error fetching deliveries:", error);
        return [];
      }

      return data;
    },

    async fetchDeliveryHistoryByDeliveryId(deliveryId) {
      const id = Number(deliveryId);
      if (!Number.isFinite(id) || id <= 0) {
        console.warn(
          "[fetchDeliveryHistoryByDeliveryId] invalid id:",
          deliveryId
        ); // WHY: prevent 22P02 from eq.undefined
        return [];
      }

      const { data, error } = await supabase
        .from("logistics_deliveries_history")
        .select(
          `
            id,
            created_at,
            created_by,
            delivery_date,
            delivered_date,
            delivery_time,
            delivery_remarks,
            driver_id,
            profiles:driver_id (
              id,
              name
            ),
            address_id,
            customer_address:address_id (
              id,
              road_name,
              postal_code,
              unit_no,
              building_name,
              additional_info,
              block_no,
              remarks
            ),
            customer_contact_persons:contact_person_id (
              id,
              name,
              contact_no1,
              contact_no2,
              email
            ),
            logistics_delivery_id
          `
        )
        .eq("logistics_delivery_id", id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching delivery history:", error);
        return [];
      }

      // Attach creator's profile name (from created_by)
      const withProfiles = await Promise.all(
        (data || []).map(async (row) => {
          const profile_name = row.created_by
            ? await this.getProfileName(row.created_by).catch(() => "[NOT SET]")
            : "[NOT SET]";
          return { ...row, profile_name };
        })
      );

      return withProfiles;
    },

    async fetchDbCollectionAndDeliveryDates(logisticsId) {
  const TAG = "[transactionStore.fetchDbCollectionAndDeliveryDates]";
  try {
    const id = logisticsId ?? this.logisticsId ?? null;
    if (!id) {
      console.warn(`${TAG} missing logisticsId`, { logisticsId, store: this.logisticsId });
      return { collection_date: null, delivery_date: null };
    }

    // 1) Latest collection_date for this logistics
    const { data: cRow, error: cErr } = await supabase
      .from("logistics_collections")
      .select("collection_date, created_at")
      .eq("logistics_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cErr) throw cErr;

    // 2) Latest delivery_date for this logistics
    const { data: dRow, error: dErr } = await supabase
      .from("logistics_deliveries")
      .select("delivery_date, created_at")
      .eq("logistics_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (dErr) throw dErr;

    const result = {
      collection_date: cRow?.collection_date ?? null, // "YYYY-MM-DD"
      delivery_date: dRow?.delivery_date ?? null,     // "YYYY-MM-DD"
    };

    // OPTIONAL: also sync into store state if you want the store to own truth
    // (uncomment if you want this behavior)
    // this.collectionDate = result.collection_date;
    // this.deliveryDate = result.delivery_date;

    return result;
  } catch (err) {
    console.error(TAG, err);
    return { collection_date: null, delivery_date: null, error: err?.message || String(err) };
  }
},
    async createOrderFromCollection(logisticsId) {
      try {
        const { orderId } = await this.createOrder(logisticsId);
        if (!orderId) throw new Error("Failed to create order");

        await supabase
          .from("logistics")
          .update({ order_id: orderId })
          .eq("id", logisticsId);

        await this.createTransaction(orderId);
        await this.createInstructions(orderId);
        await this.createErrorReports(orderId);
        await this.createInvoice(orderId);

        this.resetTransactionItems();
      } catch (error) {
        console.error("[createOrderFromCollection] Error:", error);
      }
    },

    // Computes Ready By Date = 1 working day (Mon–Fri) BEFORE deliveryDate
    computeReadyByDate(deliveryDate) {
      let base = deliveryDate ? new Date(deliveryDate) : new Date();

      if (isNaN(base.getTime())) {
        console.warn("[computeReadyByDate] Invalid deliveryDate, using today.");
        base = new Date();
      }

      const result = new Date(base);
      let subtracted = 0;

      while (subtracted < 1) {
        result.setDate(result.getDate() - 1);
        const dow = result.getDay(); // 0=Sun, 6=Sat
        if (dow !== 0 && dow !== 6) subtracted++;
      }

      return result.toISOString().split("T")[0];
    },

    // start of order creation
    async createWholeTransaction() {
      try {
        // Step 4: Create Order with logisticsId and get orderId
        const { orderId, orderNo } = await this.createOrder();
        if (!orderId || !orderNo) throw new Error("Failed to create order");

        this.order_no = orderNo;

        // Step 1: Create Logistics and get logisticsId
        const logisticsId = await this.createLogistics(orderId);
        if (!logisticsId) throw new Error("Failed to create logistics");

        // Step 2: Create Collections & Delivery with logisticsId
        await this.createCollection(logisticsId);
        await this.createDelivery(logisticsId);

        // Step 5: Create Transaction, Instructions, and Error Reports with orderId
        await this.createTransaction(orderId);
        await this.createInstructions(orderId);
        await this.createErrorReports(orderId);
        await this.createInvoice(orderId);

        // Reset transaction data after successful save
        this.resetTransactionItems();
      } catch (error) {
        console.error("Error in createWholeTransaction:", error);
      }
    },

    async createLogistics(orderId) {
      try {
        const { data: logisticsData, error: logisticsError } = await supabase
          .from("logistics")
          .insert([
            {
              customer_id: this.selectedCustomer?.id || null,
              logistics_status: "collection arranged",
              job_type: this.jobType,
              order_id: orderId,
            },
          ])
          .select("id")
          .single();

        if (logisticsError) throw logisticsError;
        if (!logisticsData?.id)
          throw new Error("Logistics entry was not created successfully.");

        return logisticsData.id; // ✅ Return the logisticsId
      } catch (error) {
        console.error("Error in create logistics:", error);
        return null;
      }
    },

    async updateLogistics(logisticsId, updateData) {
      try {
        // 1. Fetch existing logistics record for archiving & merging
        const { data: logisticsData, error: fetchError } = await supabase
          .from("logistics")
          .select(
            "id, logistics_status, created_at, job_type, urgency, created_by"
          )
          .eq("id", logisticsId)
          .single();

        if (fetchError) throw fetchError;
        if (!logisticsData) throw new Error("Logistics record not found.");

        // 2. Archive to history
        const { id, ...rest } = logisticsData;
        const { error: insertError } = await supabase
          .from("logistics_history")
          .insert([{ ...rest, logistics_id: id }]);
        if (insertError) throw insertError;

        // 3. Merge existing data with updateData

        const session = await supabase.auth.getSession();
        const userId = session?.data?.session?.user?.id;

        const mergedUpdate = {
          logistics_status:
            updateData.logistics_status ?? logisticsData.logistics_status,
          job_type: updateData.job_type ?? logisticsData.job_type,
          urgency: updateData.urgency ?? logisticsData.urgency,
          created_at: new Date().toISOString(),
          created_by: userId,
        };
        console.log(
          "[updateLogistics] payload → logistics.update",
          mergedUpdate
        );

        // 5. Update logistics row
        const { error: updateError } = await supabase
          .from("logistics")
          .update(mergedUpdate)
          .eq("id", logisticsId);

        if (updateError) throw updateError;

        return true;
      } catch (error) {
        console.error("❌ Error updating logistics:", error);
        return false;
      }
    },
    async updateProduction(productionId, updateData) {
      if (!productionId) throw new Error("productionId is required");

      // fetch current row
      const { data: current, error: fetchErr } = await supabase
        .from("order_production")
        .select("*")
        .eq("id", productionId)
        .maybeSingle();
      if (fetchErr) throw fetchErr;

      // archive to history (exclude order_id, use order_production_id)
      if (current) {
        const { id: opId, order_id, ...rest } = current; // remove order_id
        const historyRow = { ...rest, order_production_id: opId };

        const { error: histErr } = await supabase
          .from("order_production_history")
          .insert([historyRow]);
        if (histErr) throw histErr;
      }

      // get session user id
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id ?? null;
      const nowIso = new Date().toISOString();

      // update live row with audit fields
      const payload = {
        ...updateData,
        created_at: nowIso,
        created_by: userId,
      };

      const { error: updateErr } = await supabase
        .from("order_production")
        .update(payload)
        .eq("id", productionId);
      if (updateErr) throw updateErr;

      return true;
    },

    // in store
    async createCollection(logisticsId, fallback = {}) {
      try {
        const { error: collectionError } = await supabase
          .from("logistics_collections")
          .insert([
            {
              contact_person_id:
                this.selectedCollectionContact?.id ??
                fallback.contact_person_id ??
                null,
              address_id:
                this.selectedCollectionAddress?.id ??
                fallback.address_id ??
                null,
              collection_date:
                this.collectionDate ?? fallback.collection_date ?? null,
              collection_time:
                this.collectionTime ?? fallback.collection_time ?? null,
              collection_remarks:
                this.collectionRemarks ?? fallback.collection_remarks ?? null,
              driver_id: this.selectedCollectionDriver?.id ?? null,
              no_bags: this.collectionNoBags ?? fallback.no_bags ?? null,
              logistics_id: logisticsId,
            },
          ]);

        if (collectionError) throw collectionError;

        console.log("Collection successfully created!");
      } catch (error) {
        console.error("Error in create collection:", error);
      }
    },

    // in transactionStore.js
    async updateCollection(collectionId) {
      try {
        // 1) fetch the current live row
        const { data: oldRow, error: fetchErr } = await supabase
          .from("logistics_collections")
          .select("*")
          .eq("id", collectionId)
          .single();
        if (fetchErr) throw fetchErr;
        if (!oldRow) throw new Error("Collection not found");

        // helpers
        const idOf = (v) =>
          v && typeof v === "object" ? v.id ?? null : v ?? null;
        const toNull = (v) => (v === "" || v === undefined ? null : v);

        // session user + audit time (you said changed_* should still be created_*)
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id ?? null;
        const nowIso = new Date().toISOString();

        // 2) archive OLD values to history
        // NOTE: history has NO logistics_id; it references the original row by logistics_collection_id
        const historyPayload = {
          logistics_collection_id: oldRow.id,
          contact_person_id: oldRow.contact_person_id ?? null,
          address_id: oldRow.address_id ?? null,
          collection_date: oldRow.collection_date ?? null,
          collection_time: oldRow.collection_time ?? null,
          collection_remarks: oldRow.collection_remarks ?? null,
          driver_id: oldRow.driver_id ?? null,
          no_bags: oldRow.no_bags ?? null,
          created_at: nowIso, // acts as changed_at
          created_by: userId, // acts as changed_by
        };

        const { error: histErr } = await supabase
          .from("logistics_collections_history")
          .insert([historyPayload]);
        if (histErr) throw histErr;

        // 3) update LIVE row with NEW values from the store (`this.`)
        const livePayload = {
          contact_person_id: idOf(this.selectedCollectionContact),
          address_id: idOf(this.selectedCollectionAddress),
          collection_date: toNull(this.collectionDate),
          collection_time: toNull(this.collectionTime),
          collection_remarks: toNull(this.collectionRemarks),
          driver_id: idOf(this.selectedCollectionDriver),
          no_bags: this.collectionNoBags ?? null,

          // audit fields (you asked to keep using created_* for changes)
          created_at: nowIso,
          created_by: userId,
        };

        const { error: updErr } = await supabase
          .from("logistics_collections")
          .update(livePayload)
          .eq("id", collectionId);
        if (updErr) throw updErr;

        // (optional) return the updated row for immediate UI refresh
        const { data: fresh, error: refetchErr } = await supabase
          .from("logistics_collections")
          .select(
            `
        id, logistics_id, collection_date, collection_time, collection_remarks,
        address_id, driver_id, no_bags,
        customer_contact_persons ( id, name, contact_no1, contact_no2 )
      `
          )
          .eq("id", collectionId)
          .single();
        if (!refetchErr && fresh) {
          // reflect the latest values into the store state if you want instant UI sync
          this.selectedCollectionId = fresh.id;
          this.collectionDate = fresh.collection_date ?? null;
          this.collectionTime = fresh.collection_time ?? null;
          this.collectionRemarks = fresh.collection_remarks ?? null;
          this.collectionNoBags = fresh.no_bags ?? null;

          // if your selects use objects, you may want to rehydrate them:
          // this.selectedCollectionDriver = fresh.driver_id ?? null;
          // this.selectedCollectionAddress = fresh.address_id ?? null;
          // this.selectedCollectionContact = fresh.customer_contact_persons ?? null;
        }

        console.log("Collection updated + history archived.");
      } catch (err) {
        console.error("Error updating collection:", err);
        throw err;
      }
    },

    async createDelivery(logisticsId, fallback = {}) {
      try {
        const { error: deliveryError } = await supabase
          .from("logistics_deliveries")
          .insert([
            {
              contact_person_id:
                this.selectedDeliveryContact?.id ??
                fallback.contact_person_id ??
                null,
              address_id:
                this.selectedDeliveryAddress?.id ?? fallback.address_id ?? null,
              delivery_date:
                this.deliveryDate ?? fallback.delivery_date ?? null,
              delivered_date:
                this.deliveredDate ?? fallback.delivered_date ?? null,
              delivery_time:
                this.deliveryTime ?? fallback.delivery_time ?? null,
              delivery_remarks:
                this.deliveryRemarks ?? fallback.delivery_remarks ?? null,
              driver_id: this.selectedDeliveryDriver?.id ?? null,
              logistics_id: logisticsId,
            },
          ]);

        if (deliveryError) throw deliveryError;

        console.log("Delivery successfully created!");
      } catch (error) {
        console.error("Error in create delivery:", error);
      }
    },

    async updateDelivery(deliveryId, updateData = {}) {
      const TAG = "[transactionStore.updateDelivery]";
      try {
        // 1) Load current delivery for history + logistics_id
        const { data: oldRow, error: fetchErr } = await supabase
          .from("logistics_deliveries")
          .select("*")
          .eq("id", deliveryId)
          .single();
        if (fetchErr) throw fetchErr;
        if (!oldRow) throw new Error("Delivery not found");

        const idOf = (v) =>
          v && typeof v === "object" ? v.id ?? null : v ?? null;
        const toNull = (v) => (v === "" || v === undefined ? null : v);

        // 2) Archive old deliveries row
        const historyPayload = {
          logistics_delivery_id: oldRow.id,
          contact_person_id: oldRow.contact_person_id ?? null,
          address_id: oldRow.address_id ?? null,
          delivery_date: oldRow.delivery_date ?? null,
          delivered_date: oldRow.delivered_date ?? null,
          delivery_time: oldRow.delivery_time ?? null,
          delivery_remarks: oldRow.delivery_remarks ?? null,
          driver_id: oldRow.driver_id ?? null,
          // created_at/created_by not set here; Supabase defaults can handle timestamps on the history table if desired
        };
        const { error: histErr } = await supabase
          .from("logistics_deliveries_history")
          .insert([historyPayload]);
        if (histErr) throw histErr;

        // 3) Update LIVE deliveries row (main delivered_date lives here)
        const livePayload = {
          contact_person_id:
            idOf(updateData.contact_person_id ?? updateData.contact_person) ??
            idOf(this.selectedDeliveryContact),
          address_id:
            idOf(updateData.address_id ?? updateData.address) ??
            idOf(this.selectedDeliveryAddress),
          delivery_date: toNull(updateData.delivery_date ?? this.deliveryDate),
          delivered_date: toNull(
            updateData.delivered_date ?? this.deliveredDate
          ),
          delivery_time: toNull(updateData.delivery_time ?? this.deliveryTime),
          delivery_remarks:
            updateData.delivery_remarks ?? this.deliveryRemarks ?? null,
          driver_id:
            idOf(updateData.driver_id ?? updateData.driver) ??
            idOf(this.selectedDeliveryDriver),
        };

        console.log(`${TAG} ▶️ updating logistics_deliveries`, {
          deliveryId,
          livePayload,
        });
        const { error: updErr } = await supabase
          .from("logistics_deliveries")
          .update(livePayload)
          .eq("id", deliveryId);
        if (updErr) throw updErr;

        // 4) Re-fetch updated delivery (to get the authoritative delivered_date + logistics_id)
        const { data: fresh, error: refetchErr } = await supabase
          .from("logistics_deliveries")
          .select(
            `
        id, logistics_id, delivery_date, delivered_date, delivery_time, delivery_remarks,
        address_id, driver_id,
        customer_contact_persons ( id, name, contact_no1, contact_no2 )
      `
          )
          .eq("id", deliveryId)
          .single();
        if (refetchErr) throw refetchErr;

        // Sync minimal store fields used by the dialog
        this.selectedDeliveryId = fresh.id;
        this.deliveryDate = fresh.delivery_date ?? null;
        this.deliveryTime = fresh.delivery_time ?? null;
        this.deliveryRemarks = fresh.delivery_remarks ?? null;
        this.deliveredDate = fresh.delivered_date ?? null;

        // 5) Compute next logistics_status from main + exceptions
        const logisticsId = fresh.logistics_id;
        if (!logisticsId) {
          console.warn(`${TAG} ⛔ Missing logistics_id on delivery`, {
            deliveryId,
          });
          console.log(
            `${TAG} Delivery updated + history archived (no status recompute).`
          );
          return;
        }

        // 5a) Main delivered (from deliveries.delivered_date)
        const mainDone = Boolean(fresh.delivered_date);

        // 5b) Exceptions: delivered_date count
        const { data: exceptions, error: excErr } = await supabase
          .from("logistics_delivery_exceptions")
          .select("id, delivered_date")
          .eq("logistics_id", logisticsId);
        if (excErr) throw excErr;

        const totalExceptions = exceptions?.length ?? 0;
        const deliveredExceptions = (exceptions || []).filter(
          (e) => !!e.delivered_date
        ).length;

        // 5c) Current logistics status (to avoid redundant writes)
        const { data: logRow, error: logErr } = await supabase
          .from("logistics")
          .select("id, logistics_status")
          .eq("id", logisticsId) // change to .eq("logistics_id", logisticsId) if your PK is different
          .single();
        if (logErr) throw logErr;

        // 5d) Decide next status
        let next = null;
        if (mainDone && deliveredExceptions === totalExceptions)
          next = "delivery completed";
        else if (mainDone || deliveredExceptions > 0) next = "delivery partial";

        console.log(`${TAG} status decision`, {
          logisticsId,
          mainDone,
          totalExceptions,
          deliveredExceptions,
          currentStatus: logRow?.logistics_status ?? null,
          next,
        });

        // 5e) Update logistics status if needed (no created_* fields)
        if (next && next !== logRow?.logistics_status) {
          const { error: sErr } = await supabase
            .from("logistics")
            .update({ logistics_status: next })
            .eq("id", logisticsId); // change eq target if your PK differs
          if (sErr) throw sErr;
          console.log(`${TAG} logistics_status updated → ${next}`);
        } else {
          console.log(`${TAG} no logistics_status change needed`);
        }

        console.log(
          `${TAG} ✅ Delivery saved, history archived, status evaluated.`
        );
      } catch (err) {
        console.error(`${TAG} ❌`, err);
        throw err;
      }
    },
    // In actions:
    async markDeliveryExceptionsDelivered(ids, deliveredDateStr) {
      const TAG = "[transactionStore.markDeliveryExceptionsDelivered]";
      try {
        if (!Array.isArray(ids) || ids.length === 0) {
          console.warn(`${TAG} no ids provided`, ids);
          return { updated: 0 };
        }

        // normalize to YYYY-MM-DD (accepts Date or string)
        const toDateOnly = (v) => {
          if (!v) return null;
          if (v instanceof Date) return v.toISOString().slice(0, 10);
          const d = new Date(v);
          if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
          const s = String(v).slice(0, 10);
          return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
        };

        const day = toDateOnly(deliveredDateStr);
        if (!day) {
          console.warn(`${TAG} invalid delivered date`, deliveredDateStr);
          return { updated: 0 };
        }

        // 1) Update exceptions and collect affected logistics_id
        const { data, error } = await supabase
          .from("logistics_delivery_exceptions")
          .update({ delivered_date: day })
          .in("id", ids)
          .select("id, logistics_id");

        if (error) throw error;

        const logisticsIds = [
          ...new Set((data || []).map((r) => r.logistics_id).filter(Boolean)),
        ];

        // 2) For each logistics_id, compute & write next status (same rules as updateDelivery)
        for (const logisticsId of logisticsIds) {
          // a) main delivery done?
          const { data: main, error: mErr } = await supabase
            .from("logistics_deliveries")
            .select("id, delivered_date")
            .eq("logistics_id", logisticsId)
            .single();
          if (mErr && mErr.code !== "PGRST116") throw mErr;

          const mainDone = !!(main && main.delivered_date);

          // b) exceptions delivered count
          const { data: excRows, error: eErr } = await supabase
            .from("logistics_delivery_exceptions")
            .select("id, delivered_date")
            .eq("logistics_id", logisticsId);
          if (eErr) throw eErr;

          const total = excRows?.length ?? 0;
          const delivered = (excRows || []).filter(
            (r) => !!r.delivered_date
          ).length;

          // c) current logistics row
          const { data: logRow, error: logErr } = await supabase
            .from("logistics")
            .select("id, logistics_status")
            .eq("id", logisticsId)
            .single();
          if (logErr) throw logErr;

          // d) decide next
          let next = null;
          if (mainDone && delivered === total) next = "delivery completed";
          else if (mainDone || delivered > 0) next = "delivery partial";

          // e) write only if a change is needed
          if (next && next !== logRow?.logistics_status) {
            const { error: sErr } = await supabase
              .from("logistics")
              .update({ logistics_status: next })
              .eq("id", logisticsId);
            if (sErr) throw sErr;
            console.log(`${TAG} logistics ${logisticsId} → ${next}`);
          }
        }

        console.log(`${TAG} updated rows:`, data?.length || 0);
        return { updated: data?.length || 0 };
      } catch (err) {
        console.error(`${TAG} error`, err);
        throw err;
      }
    },

    async clearDeliveryExceptionsDelivered(ids) {
      const TAG = "[transactionStore.clearDeliveryExceptionsDelivered]";
      try {
        if (!Array.isArray(ids) || ids.length === 0) {
          console.warn(`${TAG} no ids provided`, ids);
          return { updated: 0 };
        }

        // 1) Clear delivered_date and collect affected logistics_id
        const { data, error } = await supabase
          .from("logistics_delivery_exceptions")
          .update({ delivered_date: null })
          .in("id", ids)
          .select("id, logistics_id");

        if (error) throw error;

        const logisticsIds = [
          ...new Set((data || []).map((r) => r.logistics_id).filter(Boolean)),
        ];

        // 2) Recompute status per logistics_id (same rules as updateDelivery)
        for (const logisticsId of logisticsIds) {
          const { data: main, error: mErr } = await supabase
            .from("logistics_deliveries")
            .select("id, delivered_date")
            .eq("logistics_id", logisticsId)
            .single();
          if (mErr && mErr.code !== "PGRST116") throw mErr;

          const mainDone = !!(main && main.delivered_date);

          const { data: excRows, error: eErr } = await supabase
            .from("logistics_delivery_exceptions")
            .select("id, delivered_date")
            .eq("logistics_id", logisticsId);
          if (eErr) throw eErr;

          const total = excRows?.length ?? 0;
          const delivered = (excRows || []).filter(
            (r) => !!r.delivered_date
          ).length;

          const { data: logRow, error: logErr } = await supabase
            .from("logistics")
            .select("id, logistics_status")
            .eq("id", logisticsId)
            .single();
          if (logErr) throw logErr;

          let next = null;
          if (mainDone && delivered === total) next = "delivery completed";
          else if (mainDone || delivered > 0) next = "delivery partial";

          if (next && next !== logRow?.logistics_status) {
            const { error: sErr } = await supabase
              .from("logistics")
              .update({ logistics_status: next })
              .eq("id", logisticsId);
            if (sErr) throw sErr;
            console.log(`${TAG} logistics ${logisticsId} → ${next}`);
          } else {
            console.log(`${TAG} no logistics_status change for`, logisticsId);
          }
        }

        return { updated: data?.length || 0 };
      } catch (error) {
        console.error(`${TAG} error`, error);
        throw error;
      }
    },

  async createOrder(logisticsId) {
      try {
        // 1) orders
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert([{ order_no: this.orderNo }])
          .select("id, order_no")
          .single();

        if (orderError) throw orderError;
        if (!orderData?.id) throw new Error("Order was not created successfully.");

        const orderId = orderData.id;

        // 2) transaction + discounts/charges FIRST
        await this.handleDiscountsCharges(orderId);

        // 3) payments AFTER discounts/charges
        const totalAmount = Number(this.totalAmount) || 0;
        const depositNum = Number(this?.deposit ?? 0);
        const safeDeposit = Math.max(0, Math.min(depositNum, totalAmount));
        const paymentStatus = safeDeposit >= totalAmount ? "paid" : "unpaid";

        const { data: paymentData, error: paymentError } = await supabase
          .from("order_payments")
          .insert([{
            order_id: orderId,
            payment_status: paymentStatus,
            deposit: safeDeposit,
            paid_amount: safeDeposit,
            total_amount: totalAmount,
          }])
          .select("id")
          .single();

        if (paymentError) throw paymentError;
        if (!paymentData?.id) throw new Error("Payment record was not created successfully.");

        // 4) production
        const { data: productionData, error: productionError } = await supabase
          .from("order_production")
          .insert([{
            order_id: orderId,
            goods_status: "NOT READY",
            no_packets: 0,
            no_hangers: 0,
            no_rolls: 0,
            no_returns: 0,
          }])
          .select("id")
          .single();

        if (productionError) throw productionError;
        if (!productionData?.id) throw new Error("Production record was not created successfully.");

        // 5) tags
        const { data: tagsData, error: tagsError } = await supabase
          .from("order_tags")
          .insert([{
            order_id: orderId,
            tag_status: "to print",
            tag_changes: "-",
          }])
          .select("id")
          .single();

        if (tagsError) throw tagsError;
        if (!tagsData?.id) throw new Error("Tags record was not created successfully.");

        return { orderId, orderNo: orderData.order_no };
      } catch (error) {
        console.error("Error in createOrder:", error);
        return null;
      }
    },

    async createTransaction(orderId) {
      try {
        if (!orderId) {
          console.error("Invalid orderId");
          return;
        }

        if (
          !Array.isArray(this.transactionItems) ||
          this.transactionItems.length === 0
        ) {
          console.warn("No transaction items found.");
          return;
        }

        // Step 1: Insert into order_transactions
        const { data: transactionHeader, error: headerError } = await supabase
          .from("order_transactions")
          .insert({
            order_id: orderId,
            status: "active",
          })
          .select("id")
          .single();

        if (headerError) {
          console.error("Failed to insert order_transactions:", headerError);
          throw headerError;
        }

        const transactionId = transactionHeader.id;
        // Step 2: Insert each item into order_transaction_items
        for (const [index, item] of this.transactionItems.entries()) {
          const u = String(item.unit || "").toLowerCase();
          const piecesDb =
            u === "pc"
              ? (() => {
                  const perUnit = Number(
                    item.pieces_per_unit ?? item.pieces ?? 0
                  );
                  return Number.isFinite(perUnit) && perUnit > 0
                    ? Math.trunc(perUnit)
                    : null;
                })()
              : u === "kg" || u === "lbs" || u === "sqft"
              ? (() => {
                  const userPieces = Number(item.pieces ?? 0);
                  return Number.isFinite(userPieces) && userPieces > 0
                    ? Math.trunc(userPieces)
                    : null;
                })()
              : null;

          const itemData = {
            order_transaction_id: transactionId,
            item_name: item.name,
            price: item.price,
            process: item.process,
            pieces: piecesDb, // <-- use inlined value
            quantity: item.quantity,
            subtotal: item.subtotal,
            category: item.category,
            tag_category: item.tag_category,
            pack_category: item.pack_category,
            unit: item.unit,
            pack_type: item.pack_type,
            company: item.company,
          };

          const { error: itemError } = await supabase
            .from("order_transaction_items")
            .insert(itemData);

          if (itemError) {
            console.error(`Error inserting item #${index + 1}:`, itemError);
            throw itemError;
          }
        }
      } catch (error) {
        console.error("Fatal error:", error);
      }
    },

    async updateTransaction(orderId) {
      if (!orderId) throw new Error("updateTransaction: missing orderId");

      // 0) Ensure ACTIVE transaction exists
      const { data: activeTxRow, error: activeErr } = await supabase
        .from("order_transactions")
        .select("id")
        .eq("order_id", orderId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (activeErr) throw activeErr;


      let activeTxId = activeTxRow?.id;
      if (!activeTxId) {
        const { data: created, error: createErr } = await supabase
          .from("order_transactions")
          .insert({ order_id: orderId, status: "active" })
          .select("id")
          .single();
        if (createErr) throw createErr;
        activeTxId = created.id;
      }

      // 1) Create HISTORY transaction header (inactive)
      const { data: historyTx, error: histTxErr } = await supabase
        .from("order_transactions")
        .insert({ order_id: orderId, status: "inactive" })
        .select("id")
        .single();
      if (histTxErr) throw histTxErr;
      const historyTxId = historyTx.id;

      // 2) Fetch CURRENT active items
      const { data: currentItems, error: curErr } = await supabase
        .from("order_transaction_items")
        .select("*")
        .eq("order_transaction_id", activeTxId);
      if (curErr) throw curErr;

      const currentById = new Map(
        (currentItems || [])
          .filter((r) => r && r.id != null)
          .map((r) => [String(r.id), r])
      );

      // 3) Snapshot CURRENT items into HISTORY transaction
      if (currentItems?.length) {
        const snapshotRows = currentItems.map((old) => ({
          order_transaction_id: historyTxId,
          item_name: old.item_name,
          price: old.price,
          process: old.process,
          quantity: old.quantity,
          subtotal: old.subtotal,
          pieces: old.pieces,
          category: old.category,
          sub_category: old.sub_category,
          tag_category: old.tag_category,
          pack_category: old.pack_category,
          unit: old.unit,
          ready_status: old.ready_status,
          pack_type: old.pack_type,
          company: old.company,
        }));
        const { error: snapErr } = await supabase
          .from("order_transaction_items")
          .insert(snapshotRows);
        if (snapErr) throw snapErr;
      }

      // 4) Normalize incoming from UI (must carry id for edited rows)
      const incoming = (this.transactionItems || []).map((i) => {
        const item_name = i.item_name ?? i.name ?? "";
        const unit = (i.unit || inferUnitFromName(item_name))?.toLowerCase();

        // pieces per your existing rules
        let pieces = null;
        if (unit === "pc") {
          const perUnit = Number(i.pieces_per_unit ?? i.pieces ?? 0);
          pieces =
            Number.isFinite(perUnit) && perUnit > 0
              ? Math.trunc(perUnit)
              : null;
        } else if (unit === "kg" || unit === "lbs" || unit === "sqft") {
          const userPieces = Number(i.pieces ?? 0);
          pieces =
            Number.isFinite(userPieces) && userPieces > 0
              ? Math.trunc(userPieces)
              : null;
        }

        return {
          order_transaction_id: activeTxId,
          item_name,
          price:
            typeof i.price === "string" && i.price?.toUpperCase() === "TBA"
              ? "TBA"
              : toNum(i.price, 0),
          process: i.process ?? null,
          quantity: toNum(i.quantity, 0),
          subtotal: toNum(i.subtotal, 0),
          pieces,
          category: i.category ?? null,
          sub_category: i.sub_category ?? null,
          tag_category: i.tag_category ?? null,
          pack_category: i.pack_category ?? null,
          unit,
          ready_status: !!i.ready_status,
          pack_type: i.pack_type ?? null,
          company: i.company ?? null,
        };
      });

      const incomingIds = new Set(
        incoming.filter((r) => r.id != null).map((r) => String(r.id))
      );

      // 5) Apply updates (in-place) & collect inserts
      const inserts = [];
      let updated = 0;

      for (const row of incoming) {
        if (row.id != null && currentById.has(String(row.id))) {
          const { error: updErr } = await supabase
            .from("order_transaction_items")
            .update({
              item_name: row.item_name,
              price: row.price,
              process: row.process,
              quantity: row.quantity,
              subtotal: row.subtotal,
              pieces: row.pieces,
              category: row.category,
              sub_category: row.sub_category,
              tag_category: row.tag_category,
              pack_category: row.pack_category,
              unit: row.unit,
              ready_status: row.ready_status,
              pack_type: row.pack_type,
              company: row.company,
            })
            .eq("id", row.id);
          if (updErr) throw updErr;
          updated += 1;
        } else if (row.id == null) {
          inserts.push(row);
        }
      }

      // 6) Insert brand new items into ACTIVE tx
      let inserted = 0;
      if (inserts.length) {
        const { error: insErr, count } = await supabase
          .from("order_transaction_items")
          .insert(inserts, { count: "exact" });
        if (insErr) throw insErr;
        inserted = count || inserts.length;
      }

      // 7) Handle removed items: keep row (to preserve FKs) but neutralize totals
      let zeroed = 0;
      for (const [id, old] of currentById.entries()) {
        if (!incomingIds.has(id)) {
          const { error: delErr } = await supabase
            .from("order_transaction_items")
            .update({
              quantity: 0,
              subtotal: 0,
            })
            .eq("id", old.id);
          if (delErr) throw delErr;
          zeroed += 1;
        }
      }

      // 8) Recompute goods status
      await this.recomputeProductionGoodsStatusByOrderId(orderId);

      return {
        history_transaction_id: historyTxId,
        updated,
        inserted,
        zeroed, // items neutralized (soft-removed)
      };
    },
    async updateTransactionReady(id, ready_status) {
      const { data: updatedItem, error: updErr } = await supabase
        .from("order_transaction_items")
        .update({ ready_status })
        .eq("id", id)
        .select("order_transaction_id")
        .single();
      if (updErr) throw updErr;

      const { data: tx, error: txErr } = await supabase
        .from("order_transactions")
        .select("order_id")
        .eq("id", updatedItem.order_transaction_id)
        .single();
      if (txErr) throw txErr;

      await this.recomputeProductionGoodsStatusByOrderId(tx.order_id);
    },

    async recomputeProductionGoodsStatusByOrderId(orderId) {
      const { data: activeTx, error: actErr } = await supabase
        .from("order_transactions")
        .select("id")
        .eq("order_id", orderId)
        .eq("status", "active");
      if (actErr) throw actErr;

      const ids = (activeTx || []).map((r) => r.id);
      if (!ids.length) {
        await supabase
          .from("order_production")
          .update({ goods_status: "not ready" })
          .eq("order_id", orderId);
        return;
      }

      const { data: items, error: itErr } = await supabase
        .from("order_transaction_items")
        .select("ready_status")
        .in("order_transaction_id", ids);
      if (itErr) throw itErr;

      const total = items?.length || 0;
      const trues =
        items?.reduce((a, it) => a + (it.ready_status ? 1 : 0), 0) || 0;

      let goods_status = "not ready";
      if (total > 0) {
        goods_status =
          trues === 0
            ? "not ready"
            : trues === total
            ? "ready"
            : "partial ready";
      }

      const { error: prodErr } = await supabase
        .from("order_production")
        .update({ goods_status })
        .eq("order_id", orderId);
      if (prodErr) throw prodErr;
    },

    async recomputeProductionGoodsStatusByOrderId(orderId) {
      // a) Active transaction ids for this order
      const { data: activeTx, error: activeErr } = await supabase
        .from("order_transactions")
        .select("id")
        .eq("order_id", orderId)
        .eq("status", "active");

      if (activeErr) throw activeErr;

      const activeIds = (activeTx || []).map((r) => r.id);
      if (activeIds.length === 0) {
        // No active transactions: conservatively mark not ready
        await supabase
          .from("order_production")
          .update({ goods_status: "not ready" })
          .eq("order_id", orderId);
        return;
      }

      // b) Load all items under these active versions
      const { data: items, error: itemsErr } = await supabase
        .from("order_transaction_items")
        .select("id, ready_status")
        .in("order_transaction_id", activeIds);

      if (itemsErr) throw itemsErr;

      const total = (items || []).length;
      const trues = (items || []).reduce(
        (acc, it) => acc + (it.ready_status === true ? 1 : 0),
        0
      );

      // c) Decide goods_status
      let goods_status = "not ready";
      if (total > 0) {
        if (trues === 0) goods_status = "not ready";
        else if (trues === total) goods_status = "ready";
        else goods_status = "partial ready";
      } else {
        goods_status = "not ready";
      }

      // d) Persist to order_production
      const { error: prodErr } = await supabase
        .from("order_production")
        .update({ goods_status })
        .eq("order_id", orderId);

      if (prodErr) throw prodErr;
    },

    async createInstructions(orderId) {
      // ✅ Pass orderId as an argument
      try {
        for (const instruction of this.instructions) {
          const instructionData = {
            description: instruction.description,
            admin: instruction.to.includes("admin"),
            cleaning: instruction.to.includes("cleaning"),
            packing: instruction.to.includes("packing"),
            picking_sending: instruction.to.includes("pickingsending"),
          };

          const table =
            instruction.type === "onetime"
              ? "instructions_onetime"
              : "instructions_recurring";

          if (instruction.type === "onetime") {
            instructionData.order_id = orderId;
          } else {
            instructionData.customer_id = this.selectedCustomer?.id || null;
          }

          const { error: instructionError } = await supabase
            .from(table)
            .insert(instructionData);
          if (instructionError) throw instructionError;
        }
      } catch (error) {
        console.error("Error in create instructions:", error);
      }
    },

    async createErrorReports(orderId) {
      // ✅ Pass orderId as an argument
      try {
        for (const report of this.reports) {
          const reportData = {
            description: report.description,
            category: report.category,
            sub_category: report.sub_category,
            order_id: orderId, // ✅ Now correctly assigned
            image: report.image || null,
            status: "flagged",
          };

          const { error: reportError } = await supabase
            .from("order_error_reports")
            .insert(reportData);
          if (reportError) throw reportError;
        }
      } catch (error) {
        console.error("Error in create error reports:", error);
      }
    },

    async createInvoice(orderId) {
      try {
        if (!orderId) throw new Error("Invalid orderId");

        const { data: insertedInvoice, error: insertError } = await supabase
          .from("order_invoices")
          .insert({ order_id: orderId })
          .single();

        if (insertError) throw insertError;

        console.log("[createInvoice] Invoice created:", insertedInvoice);
        return insertedInvoice;
      } catch (error) {
        console.error("[createInvoice] Error:", error);
        return null;
      }
    },

    async updateOrderProductionGoodsStatus(order_id, goods_status) {
      const { error } = await supabase
        .from("order_production")
        .update({ goods_status })
        .eq("order_id", order_id);

      if (error) throw error;
    },

    async updateOrderPackingDetails(
      orderId,
      { no_rolls, no_packets, no_hangers, no_returns }
    ) {
      const { error } = await supabase
        .from("order_production")
        .update({
          no_rolls,
          no_packets,
          no_hangers,
          no_returns,
        })
        .eq("order_id", orderId);

      if (error) {
        throw error;
      }
    },

    // stores/transactionStore.(ts|js)
    async fetchCollectionsForCustomer(customerId) {
      const { data, error } = await supabase
        .from("logistics")
        .select(
          `
      id, logistics_status, urgency, customer_id, order_id,

      customers:customer_id (
        id, name, contact_no1, contact_no2, email,
        customer_credits ( online_package, other_credits )
      ),

      orders (
        id, order_no, created_at,
        order_payments (            
                total_amount, paid_amount, payment_status ),
        order_production (   
           no_hangers, no_packets, no_rolls, goods_status
        )
      ),

      logistics_collections (
        collection_date, collection_time, address_id, driver_id,
        customer_contact_persons ( name, contact_no1, contact_no2, email )
      ),

      logistics_deliveries (
        delivery_date, delivered_date, delivery_time, address_id, driver_id,
        customer_contact_persons ( name, contact_no1, contact_no2, email )
      )
    `
        )
        .eq("customer_id", customerId)
        .order("collection_date", {
          foreignTable: "logistics_collections",
          ascending: false,
        })
        .order("delivery_date", {
          foreignTable: "logistics_deliveries",
          ascending: false,
        });

      if (error) throw error;
      return data ?? [];
    },

    async fetchOrdersByCustomerId(customerId) {
      if (!customerId) return [];

      const { data, error } = await supabase
        .from("logistics")
        .select(
          `
            id, created_at, logistics_status, urgency, customer_id, order_id,

            customers:customer_id (
              id, name, contact_no1, contact_no2, email,
              customer_credits ( online_package, other_credits )
            ),

            orders (
              id, order_no, created_at,
              order_payments ( total_amount, paid_amount, payment_status ),
              order_production (  no_hangers, no_packets, no_rolls, goods_status )
            )
          `
        )
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders by customer:", error);
        throw error;
      }
      if (!Array.isArray(data) || data.length === 0) return [];

      // parallel fetch collections & deliveries per logistics row
      const enriched = await Promise.all(
        data.map(async (row) => {
          const logisticsId = row.id;

          const [collections, deliveries] = await Promise.allSettled([
            this.fetchCollectionByLogisticsId(logisticsId),
            this.fetchDeliveryByLogisticsId(logisticsId),
          ]);

          return {
            ...row,
            logistics_collections:
              collections.status === "fulfilled" &&
              Array.isArray(collections.value)
                ? collections.value
                : [],
            logistics_deliveries:
              deliveries.status === "fulfilled" &&
              Array.isArray(deliveries.value)
                ? deliveries.value
                : [],
          };
        })
      );

      return enriched;
    },
    async fetchStatusByCustomerId(customerId) {
      const { data, error } = await supabase
        .from("logistics")
        .select(
          `id, customer_id, logistics_status,
      orders ( 
        order_no,
        order_payments ( payment_status ),
        order_production ( goods_status )
      )
    `
        )
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders by customer:", error);
        throw error;
      }

      return data;
    },

    async fetchInvoicesByCustomer(customerId) {
      // Guard: only null/undefined is invalid; allow 0 if your IDs can be 0
      if (customerId === undefined || customerId === null) {
        throw new Error("customerId is required");
      }

      const { data, error } = await supabase
        .from("logistics")
        .select(
          `
      id,
      logistics_status,
      urgency,
      customer_id,
      orders:order_id!inner (
        id,
        order_no,
        created_at,
        order_payments (
          payment_status,
          total_amount,
          paid_amount
        ),
        order_invoices (
          id,
          invoice_no,
          created_at
        )
      )
    `
        )
        .eq("customer_id", customerId);

      if (error) throw error;
      return data || [];
    },

    async getNextSoaNo(customerId) {
      // Fetch customer code
      const { data: cust, error: custErr } = await supabase
        .from("customers")
        .select("code")
        .eq("id", customerId)
        .single();
      if (custErr) throw custErr;

      const code = (cust?.code || "").trim().toUpperCase();
      if (!code) throw new Error("Customer code not found");

      // Fetch latest SOA for this customer; lexicographic is safe due to zero padding
      const { data: lastList, error: lastErr } = await supabase
        .from("customer_soa")
        .select("soa_no")
        .eq("customer_id", customerId)
        .order("soa_no", { ascending: false })
        .limit(1);
      if (lastErr) throw lastErr;

      const lastSoaNo =
        Array.isArray(lastList) && lastList.length ? lastList[0].soa_no : null;
      const lastNum =
        lastSoaNo && lastSoaNo.startsWith(code)
          ? parseInt(String(lastSoaNo).slice(-5), 10)
          : 0;

      const nextNum = (Number.isFinite(lastNum) ? lastNum : 0) + 1;
      const padded = String(nextNum).padStart(5, "0");

      return `${code}${padded}`; // e.g., HFC00001
    },

    async createCustomerSoa({ customerId, invoiceIds }) {
      if (customerId === undefined || customerId === null)
        throw new Error("customerId is required");
      if (!Array.isArray(invoiceIds) || invoiceIds.length === 0)
        throw new Error("invoiceIds is required");

      const soaNo = await this.getNextSoaNo(customerId);

      const { data: soaRow, error: soaErr } = await supabase
        .from("customer_soa")
        .insert([{ soa_no: soaNo, customer_id: customerId }])
        .select("id, soa_no")
        .single();
      if (soaErr) throw soaErr;

      const soaId = soaRow?.id;
      if (!soaId) throw new Error("SOA header insert returned no ID");

      // 🔧 FIX: use 'soa_id' (DB column), not 'customer_soa_id'
      const linkRows = invoiceIds.map((invoice_id) => ({
        customer_soa_id: soaId,
        invoice_id,
      }));

      const { error: linkErr } = await supabase
        .from("customer_soa_invoices")
        .insert(linkRows);

      if (linkErr) {
        // best-effort rollback
        await supabase.from("customer_soa").delete().eq("id", soaId);
        throw linkErr;
      }

      return { soa_id: soaId, soa_no: soaRow.soa_no };
    },
    async fetchAllSoa() {
      const { data, error } = await supabase
        .from("customer_soa")
        .select(
          `
      id,
      soa_no,
      created_at,
      customers:customer_id!inner (
        id,
        name,
        contact_no1,
        contact_no2,
        email
      )
    `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    async fetchSoaDetails(soaNo) {
      if (!soaNo) {
        console.error("SOA number is missing.");
        return null;
      }

      try {
        // 1) Header with nested customer & invoice links
        const { data: header, error: headerErr } = await supabase
          .from("customer_soa")
          .select(
            `
          id,
          soa_no,
          created_at,
          customer_id,
          customers (
            id,
            name,
            type,
            billing_address,
            payment_terms
          ),
          customer_soa_invoices (
            invoice_id,
            order_invoices (
              id,
              invoice_no,
              order_id,
              created_at
            )
          )
        `
          )
          .eq("soa_no", soaNo)
          .single();

        if (headerErr) {
          console.error("Error fetching SOA header:", headerErr);
          return null;
        }
        if (!header) return null;

        // 1a) Fetch customer credits (gracefully default to zeros if no row)
        let customerCredits = { id: null, online_package: 0, other_credits: 0 };
        {
          const { data: creditsRow, error: creditsErr } = await supabase
            .from("customer_credits")
            .select("id, online_package, other_credits")
            .eq("customer_id", header.customer_id)
            .single();

          // PostgREST 'no rows' => code PGRST116; treat as 0/0, otherwise log & continue
          if (!creditsErr && creditsRow) {
            customerCredits = {
              id: creditsRow.id ?? null,
              online_package: Number(creditsRow.online_package || 0),
              other_credits: Number(creditsRow.other_credits || 0),
            };
          } else if (creditsErr && creditsErr.code !== "PGRST116") {
            console.warn("Warning fetching customer_credits:", creditsErr);
          }
        }

        // Flatten nested invoices -> collect order_ids
        const invoiceLinks = (header.customer_soa_invoices || []).flatMap((l) =>
          l?.order_invoices ? [l.order_invoices] : []
        );
        const orderIds = [
          ...new Set(
            invoiceLinks
              .map((oi) => oi?.order_id)
              .filter((v) => v !== null && v !== undefined)
          ),
        ];

        // Early return if no invoice/order links
        if (!invoiceLinks.length || !orderIds.length) {
          return {
            soa: {
              soa_no: header.soa_no,
              created_at: header.created_at,
              customer_id: header.customer_id,
            },
            customer: header.customers
              ? {
                  id: header.customers.id,
                  name: header.customers.name,
                  type: header.customers.type,
                  billing_address: header.customers.billing_address,
                  payment_terms: header.customers.payment_terms,
                }
              : null,
            customer_credits: customerCredits,
            lines: (invoiceLinks || []).map((oi) => ({
              order_id: null,
              order_no: null,
              invoice_no: oi?.invoice_no ?? null,
              invoice_date: oi?.created_at ?? null,
              logistics_status: null,
              payment_status: null,
              order_balance: 0,
            })),
          };
        }

        // 2) Orders with nested payments + logistics
        let ordersData = [];
        {
          const { data: ordersNested, error: ordersErr } = await supabase
            .from("orders")
            .select(
              `
            id,
            order_no,
            order_payments (
              order_id,
              payment_status,
              total_amount,
              paid_amount
            ),
            logistics (
              order_id,
              logistics_status,
              customer_id
            )
          `
            )
            .in("id", orderIds);

          if (ordersErr) {
            console.error("Error fetching orders (nested):", ordersErr);
            return null;
          }
          ordersData = ordersNested || [];
        }

        // Index helpers
        const ordersMap = new Map(ordersData.map((o) => [String(o.id), o]));

        // 3) Compose lines
        const lines = invoiceLinks.map((oi) => {
          const k = String(oi.order_id);
          const ord = ordersMap.get(k) || {};

          // Aggregate payments per order
          const payAgg = (ord.order_payments || []).reduce(
            (acc, p) => {
              acc.payment_status = p.payment_status || acc.payment_status;
              acc.total_amount += Number(p.total_amount || 0);
              acc.paid_amount += Number(p.paid_amount || 0);
              return acc;
            },
            { total_amount: 0, paid_amount: 0, payment_status: null }
          );

          // Logistics for matching customer
          const logi =
            (ord.logistics || []).find(
              (l) => String(l.customer_id) === String(header.customer_id)
            ) ||
            (ord.logistics || [])[0] ||
            null;

          const balance = Math.max(
            Number(payAgg.total_amount) - Number(payAgg.paid_amount),
            0
          );

          return {
            order_id: ord.id ?? null,
            order_no: ord.order_no ?? null,
            invoice_no: oi.invoice_no ?? null,
            invoice_date: oi.created_at ?? null,
            logistics_status: logi?.logistics_status ?? null,
            payment_status: payAgg.payment_status ?? null,

            // ⬇️ Added so your table can show "Paid ($X.XX)"
            total_amount: Number(payAgg.total_amount.toFixed(2)),
            paid_amount: Number(payAgg.paid_amount.toFixed(2)),

            order_balance: Number(balance.toFixed(2)),
          };
        });

        // Sort for stable UI
        lines.sort((a, b) => {
          const ao = a.order_no || "";
          const bo = b.order_no || "";
          if (ao === bo)
            return String(a.invoice_no || "").localeCompare(
              String(b.invoice_no || "")
            );
          return String(ao).localeCompare(String(bo));
        });

        // 4) Final payload with customer_credits included
        return {
          soa: {
            soa_no: header.soa_no,
            created_at: header.created_at,
            customer_id: header.customer_id,
          },
          customer: header.customers
            ? {
                id: header.customers.id,
                name: header.customers.name,
                type: header.customers.type,
                billing_address: header.customers.billing_address,
                payment_terms: header.customers.payment_terms,
              }
            : null,
          customer_credits: customerCredits, // <-- NEW
          lines,
        };
      } catch (err) {
        console.error("Unexpected error fetching SOA details:", err);
        return null;
      }
    },

    async ensureCustomerCreditsRow(customerId) {
      if (!customerId) {
        console.error("ensureCustomerCreditsRow: customerId missing");
        return null;
      }

      // Try fetch existing
      const { data: existing, error: fetchErr } = await supabase
        .from("customer_credits")
        .select("id, customer_id, online_package, other_credits")
        .eq("customer_id", customerId)
        .single();

      if (existing) return existing;

      if (fetchErr && fetchErr.code !== "PGRST116") {
        console.error("ensureCustomerCreditsRow fetch error:", fetchErr);
        return null;
      }

      const { data: inserted, error: insErr } = await supabase
        .from("customer_credits")
        .insert({
          customer_id: customerId,
          online_package: 0,
          other_credits: 0,
        })
        .select("id, customer_id, online_package, other_credits")
        .single();

      if (insErr) {
        console.error("ensureCustomerCreditsRow insert error:", insErr);
        return null;
      }
      return inserted;
    },

    async applyCredits({ customerId, amount, remarks }) {
      if (
        !customerId ||
        !Number.isFinite(Number(amount)) ||
        Number(amount) <= 0
      ) {
        console.error("applyCredits: invalid args");
        return null;
      }

      // 1) Ensure row exists
      const creditRow = await this.ensureCustomerCreditsRow(customerId);
      if (!creditRow) return null;

      // 2) Read current balances
      const online = Number(creditRow.online_package || 0);
      const other = Number(creditRow.other_credits || 0);
      let remaining = Number(amount);

      // 3) Compute deductions: online_package first, then other_credits
      const useOnline = Math.min(online, remaining);
      remaining -= useOnline;
      const useOther = Math.min(other, remaining);
      remaining -= useOther;

      const newOnline = Number((online - useOnline).toFixed(2));
      const newOther = Number((other - useOther).toFixed(2));

      // If nothing to deduct, short-circuit
      if (useOnline + useOther <= 0) {
        return {
          appliedOnline: 0,
          appliedOther: 0,
          totalApplied: 0,
          remaining: Number((Number(amount) - 0).toFixed(2)),
          after: { online_package: online, other_credits: other },
        };
      }

      // 4) Update balances
      const { error: updErr } = await supabase
        .from("customer_credits")
        .update({ online_package: newOnline, other_credits: newOther })
        .eq("id", creditRow.id);

      if (updErr) {
        console.error("applyCredits update error:", updErr);
        return null;
      }

      // 5) Insert history rows (negative amounts to represent deduction)
      const historyRows = [];
      if (useOnline > 0) {
        historyRows.push({
          customer_credit_id: creditRow.id,
          credit_type: "Online Package Deduction",
          amount: -Number(useOnline.toFixed(2)),
          remarks: remarks || null,
        });
      }
      if (useOther > 0) {
        historyRows.push({
          customer_credit_id: creditRow.id,
          credit_type: "Other Credits Deduction",
          amount: -Number(useOther.toFixed(2)),
          remarks: remarks || null,
        });
      }

      if (historyRows.length) {
        const { error: histErr } = await supabase
          .from("customer_credits_history")
          .insert(historyRows);
        if (histErr) {
          // Non-fatal: balances already updated, but log the failure
          console.error("applyCredits history insert error:", histErr);
        }
      }

      const appliedOnline = Number(useOnline.toFixed(2));
      const appliedOther = Number(useOther.toFixed(2));
      const totalApplied = Number((appliedOnline + appliedOther).toFixed(2));

      return {
        appliedOnline,
        appliedOther,
        totalApplied,
        remaining: Number(remaining.toFixed(2)),
        after: { online_package: newOnline, other_credits: newOther },
      };
    },
    async fetchPaymentHistoryByOrderId(orderId) {
      const TAG = "[transactionStore:fetchPaymentHistoryByOrderId]";

      if (!orderId) {
        console.warn(`${TAG} called without orderId`);
        return [];
      }

      // 1) Get order_payments rows for this order
      const { data: opRows, error: opError } = await supabase
        .from("order_payments")
        .select("id")
        .eq("order_id", orderId);

      if (opError) {
        console.error(`${TAG} error fetching order_payments`, opError);
        return [];
      }

      if (!opRows || opRows.length === 0) {
        console.log(`${TAG} no order_payments found for order_id=${orderId}`);
        return [];
      }

      const orderPaymentIds = opRows.map((r) => r.id);

      // 2) Get all history rows linked to those order_payment_id(s)
      const { data: historyRows, error: histError } = await supabase
        .from("order_payments_history")
        .select("*")
        .in("order_payment_id", orderPaymentIds)
        .order("created_at", { ascending: true }); // optional ordering

      if (histError) {
        console.error(
          `${TAG} error fetching order_payments_history`,
          histError
        );
        return [];
      }

      console.log(
        `${TAG} loaded ${
          historyRows?.length || 0
        } history rows for order_id=${orderId}`,
        (historyRows || []).slice(0, 5)
      );

      return historyRows || [];
    },
    async createDeliveryException(payload) {
      const { data, error } = await supabase
        .from("logistics_delivery_exceptions")
        .insert(payload)
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
    // transactionStore.js
    async fetchDeliveryExceptions() {
      const { data, error } = await supabase
        .from("logistics_delivery_exceptions")
        .select(
          "id, logistics_id, delivery_date, delivery_time, remarks, created_at"
        ) // no reason cols
        .not("logistics_id", "is", null); // ✅ correct way to do IS NOT NULL

      if (error) {
        console.error("error:", error);
        throw error;
      }

      const rows = data || [];
      return rows;
    },

    async fetchItemDeliveryExceptions(orderTransactionItemId) {
      const { data, error } = await supabase
        .from("logistics_delivery_exceptions")
        .select("*")
        .eq("order_transaction_item_id", orderTransactionItemId);

      if (error) throw error;
      return data || [];
    },
    async markExceptionAsDelivered(exceptionId, payload) {
      // payload: { delivered_date, delivered_driver_id }

      const { data, error } = await supabase
        .from("logistics_delivery_exceptions")
        .update(payload)
        .eq("id", exceptionId)
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
    async fetchDeliveryPlan(logisticsId) {
      // Fetch main delivery schedule
      const { data: mainDelivery, error: err1 } = await supabase
        .from("logistics_deliveries")
        .select("*")
        .eq("logistics_id", logisticsId)
        .single();

      if (err1) throw err1;

      // Fetch all exceptions
      const { data: exceptions, error: err2 } = await supabase
        .from("logistics_delivery_exceptions")
        .select("*, order_transaction_items(item_name, quantity)")
        .eq("logistics_id", logisticsId);

      if (err2) throw err2;

      return {
        mainDelivery,
        exceptions,
      };
    },
    // transactionStore.js – inside defineStore({ ..., actions: { ... } })
    async fetchDeliveryExceptionsByLogisticsId(logisticsId) {
      const TAG = "[transactionStore.fetchDeliveryExceptionsByLogisticsId]";
      try {
        if (!logisticsId) {
          console.warn(`${TAG} logisticsId is missing or invalid`, logisticsId);
          return [];
        }

        const { data, error } = await supabase
          .from("logistics_delivery_exceptions")
          .select(
            `
        id,
        created_at,
        created_by,
        logistics_id,
        order_transaction_item_id,
        quantity,
        pieces,
        delivery_date,
        delivered_date,
        delivery_time,
        driver_id,
        remarks
      `
          )
          .eq("logistics_id", logisticsId)
          .order("delivery_date", { ascending: true })
          .order("delivery_time", { ascending: true });

        if (error) {
          console.error(`${TAG} Supabase error`, error);
          throw error;
        }

        console.log(`${TAG} fetched ${data?.length || 0} rows`, data);
        return data || [];
      } catch (err) {
        console.error(`${TAG} unexpected error`, err);
        return [];
      }
    },

    async syncOrderPaymentsTotals(orderId, newTotal) {
      if (!orderId) throw new Error("Missing orderId");
      const totalAmount = Number(newTotal || 0);

      // 1) fetch existing order_payment row (assumed single-row-per-order)
      const { data: row, error: fetchErr } = await supabase
        .from("order_payments")
        .select("id, order_id, paid_amount, total_amount, payment_status")
        .eq("order_id", orderId)
        .limit(1)
        .single();

      if (fetchErr && fetchErr.code !== "PGRST116") {
        // PGRST116: no rows found
        throw fetchErr;
      }

      // 2) insert if missing
      if (!row) {
        const status = derivePaymentStatus(0, totalAmount);
        const { error: insErr } = await supabase.from("order_payments").insert({
          order_id: orderId,
          total_amount: totalAmount,
          paid_amount: 0,
          payment_status: status,
        });
        if (insErr) throw insErr;
        return true;
      }

      // 3) update existing
      const paid = Number(row.paid_amount || 0);
      const status = derivePaymentStatus(paid, totalAmount);
      const { error: updErr } = await supabase
        .from("order_payments")
        .update({
          total_amount: totalAmount,
          payment_status: status,
        })
        .eq("id", row.id);

      if (updErr) throw updErr;
      return true;
    },
    // transactionStore.js
    async fetchAllErrorReports() {
      const { data, error } = await supabase
        .from("order_error_reports")
        .select(
          `
      id,
      order_id,
      category,
      sub_category,
      description,
      status,
      created_at,
      orders:orders ( order_no )
    `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // expose order_no at top-level
      return (data ?? []).map((r) => ({
        id: r.id,
        order_id: r.order_id ?? null,
        order_no: r.orders?.order_no ?? null, // WHY: UI expects this field
        category: r.category ?? null,
        sub_category: r.sub_category ?? null,
        description: r.description ?? null,
        status: r.status ?? null,
        created_at: r.created_at ?? null,
      }));
    },
    async fetchOrderNoByOrderId(orderId) {
      const idNum = Number(orderId);
      if (!Number.isFinite(idNum)) return "";

      // Supabase direct query:
      const { data, error } = await supabase
        .from("orders")
        .select("order_no")
        .eq("id", idNum)
        .maybeSingle();

      if (error) {
        console.error("[fetchOrderNoByOrderId] supabase error:", error);
        return "";
      }
      return data?.order_no || "";
    },
    async fetchCustomerComplaints() {
      const { data, error } = await supabase
        .from("customer_complaints")
        .select(
          `
      id,
      category,
      description,
      created_at,
      created_by,
      customers:customer_id!inner (
        id,
        name,
        contact_no1,
        contact_no2,
        email
      )
    `
        )
        .order("created_at", { ascending: false });

      const withProfiles = await Promise.all(
        (data || []).map(async (row) => {
          const profile_name = row.created_by
            ? await this.getProfileName(row.created_by).catch(() => "[NOT SET]")
            : "[NOT SET]";
          return {
            ...row,
            profile_name,
          };
        })
      );
      if (error) throw error;

      return withProfiles;
    },
    async createCustomerComplaint(payload) {
      const { data, error } = await supabase
        .from("customer_complaints")
        .insert({
          customer_id: payload.customer_id,
          category: payload.category,
          description: payload.description,
        })
        .select();

      if (error) throw error;
      return data?.[0];
    },
    async fetchOrderPayments() {
      try {
        const { data, error } = await supabase
          .from("logistics")
          .select(
            `
        id,
        orders!inner (
          id,
          order_no,
          created_at,
          order_payments (
            payment_status,
            total_amount,
            paid_amount
          )
        ),
        customers:customer_id (
          id,
          name,
          contact_no1,
          contact_no2,
          email,
          pricing_group_id,
          customer_credits (
            online_package,
            other_credits
          )
        )
      `
          )
          .not("orders.order_no", "is", null) // ensure existing order_no
          .order("id", { ascending: true });

        if (error) throw error;
        if (!Array.isArray(data) || data.length === 0) return [];

        return data.map((logistics) => {
          const rawOrder = logistics?.orders ?? null;
          const rawCustomer = logistics?.customers ?? null;

          const op = Array.isArray(rawOrder?.order_payments)
            ? rawOrder.order_payments[0] || null
            : rawOrder?.order_payments || null;

          const order = rawOrder
            ? {
                id: rawOrder.id,
                order_no: rawOrder.order_no,
                created_at: rawOrder.created_at,
                payment_status: op?.payment_status ?? null,
                total_amount: op?.total_amount ?? null,
                paid_amount: op?.paid_amount ?? null,
                order_payment: op,
              }
            : null;

          const credits = Array.isArray(rawCustomer?.customer_credits)
            ? rawCustomer.customer_credits[0] || null
            : rawCustomer?.customer_credits || null;

          const customer = rawCustomer
            ? {
                id: rawCustomer.id,
                name: rawCustomer.name,
                contact_no1: rawCustomer.contact_no1,
                contact_no2: rawCustomer.contact_no2,
                email: rawCustomer.email,
                pricing_group_id: rawCustomer.pricing_group_id,
                customer_credits: credits,
              }
            : null;

          return {
            logistics_id: logistics.id,
            order,
            customer,
          };
        });
      } catch (error) {
        console.error("Error fetching all payments:", error);
        return [];
      }
    },
    computeTagCountsFromItems(items = []) {
      // bucket by tag_category (same categories as TagView)
      const base = {
        clothing: 0, // A
        bedding: 0, // B
        curtain: 0, // C
        sofa: 0, // D
        stuffed_toy: 0, // E
        carpet: 0, // F
        others: 0, // G
      };

      const normUnit = (u) =>
        String(u || "")
          .trim()
          .toLowerCase();

      for (const it of items) {
        const cat = String(it?.tag_category || "others").toLowerCase();
        const unit = normUnit(it?.unit);
        const pcs = Number(it?.pieces) || 0;
        const qty = Number(it?.quantity) || 0;

        // counting rule:
        // pc  -> pieces * quantity
        // kg/sqft -> pieces
        // anything else -> treat like 'pc' only if you want; here we default to plain pieces unless it's explicitly 'pc'
        let add;
        if (
          unit === "pc" ||
          unit === "pcs" ||
          unit === "piece" ||
          unit === "pieces"
        ) {
          add = pcs * qty; // multiply
        } else if (unit === "kg" || unit === "sqft") {
          add = pcs; // as-is
        } else {
          // fallback: safest is to assume "as-is"
          add = pcs;
        }

        if (cat in base) base[cat] += add;
        else base.others += add;
      }

      return {
        A: base.clothing,
        B: base.bedding,
        C: base.curtain,
        D: base.sofa,
        E: base.stuffed_toy,
        F: base.carpet,
        G: base.others,
      };
    },

    // Bulk-fetch transactions+items for MANY orders → compute & store A–G
    async fetchTagCountsByOrderIds(orderIds = []) {
      const unique = [...new Set(orderIds.filter(Boolean))];
      if (!unique.length) return;

      const { data, error } = await supabase
        .from("order_transactions")
        .select(
          `
    order_id,
    order_transaction_items(pieces, tag_category, unit, quantity)
  `
        )
        .in("order_id", unique)
        .eq("status", "active");

      if (error) {
        console.error("fetchTagCountsByOrderIds error:", error);
        // Initialize zeros so UI stays stable
        unique.forEach((id) => {
          this.tagCountsByOrderId[id] = this.computeTagCountsFromItems([]);
        });
        return;
      }

      // Group items by order_id
      const grouped = new Map();
      unique.forEach((id) => grouped.set(id, []));
      (data || []).forEach((row) => {
        const items = Array.isArray(row.order_transaction_items)
          ? row.order_transaction_items
          : [];
        grouped.set(
          row.order_id,
          (grouped.get(row.order_id) || []).concat(items)
        );
      });

      // Compute counts for each order
      for (const [orderId, items] of grouped.entries()) {
        this.tagCountsByOrderId[orderId] =
          this.computeTagCountsFromItems(items);
      }
    },
    async fetchOrdersForTags() {
      try {
        const { data, error } = await supabase
          .from("logistics")
          .select(
            `
              id,
              logistics_status,
              urgency,

              orders!inner (
                id,
                order_no,
                created_at,
                order_tags (
                  tag_status,
                  tag_changes
                ),
                order_production (
                  id,
                  
                  goods_status
                )
              ),
              customers:customer_id (
                id,
                name,
                contact_no1,
                contact_no2,
                email
              )
            `
          )
          .not("orders.order_no", "is", null)
          .neq("orders.order_no", "")
          .order("id", { ascending: true });

        if (error) throw error;
        if (!Array.isArray(data) || data.length === 0) return [];

        // attach deliveries via helper functions
        const enriched = await Promise.all(
          data.map(async (logistics) => {
            const [collectionsRes] = await Promise.allSettled([
              this.fetchCollectionByLogisticsId(logistics.id),
            ]);

            const collections =
              collectionsRes.status === "fulfilled" &&
              Array.isArray(collectionsRes.value)
                ? collectionsRes.value
                : [];

            return {
              ...logistics,
              logistics_collections: collections,
            };
          })
        );

        // map to the same output shape you already use
        return enriched.map((logistics) => ({
          logistics_id: logistics.id,
          logistics_status: logistics.logistics_status,
          urgency: logistics.urgency,

          order: logistics.orders
            ? {
                id: logistics.orders.id,
                order_no: logistics.orders.order_no,
                created_at: logistics.orders.created_at,
                order_tags: Array.isArray(logistics.orders.order_tags)
                  ? logistics.orders.order_tags[0] || null
                  : logistics.orders.order_tags || null,
                order_production: Array.isArray(
                  logistics.orders.order_production
                )
                  ? logistics.orders.order_production[0] || null
                  : logistics.orders.order_production || null,
              }
            : null,

          customer: logistics.customers
            ? {
                id: logistics.customers.id,
                name: logistics.customers.name,
                contact_no1: logistics.customers.contact_no1,
                contact_no2: logistics.customers.contact_no2,
                email: logistics.customers.email,
              }
            : null,

          collections:
            logistics.logistics_collections?.map((c) => ({
              id: c.id,
              collection_date: c.collection_date,
              collection_time: c.collection_time,
              no_bags: c.no_bags,
              driver_id: c.driver_id,
              driver: c.profiles
                ? {
                    id: c.profiles.id,
                    name: c.profiles.name,
                  }
                : null,
              contact_person: c.customer_contact_persons
                ? {
                    id: c.customer_contact_persons.id,
                    name: c.customer_contact_persons.name,
                    contact_no1: c.customer_contact_persons.contact_no1,
                    contact_no2: c.customer_contact_persons.contact_no2,
                    email: c.customer_contact_persons.email,
                  }
                : null,
            })) || [],
        }));
      } catch (error) {
        console.error("Error fetching all orders for tagging:", error);
        return [];
      }
    },

    async fetchOrdersForPacks() {
      try {
        const { data, error } = await supabase
          .from("logistics")
          .select(
            `
          id,
          logistics_status,
          urgency,
          orders!inner (           
            id,
            order_no,
            created_at,
            order_production (
              id,
              
              goods_status,
              no_packets,
              no_hangers,
              no_rolls
            )
          ),
          customers:customer_id (
            id,
            name,
            contact_no1,
            contact_no2,
            email
          )
        `
          )
          .order("id", { ascending: true });

        if (error) throw error;
        if (!Array.isArray(data) || data.length === 0) return [];

        // 1) Fetch deliveries per logistics
        const enriched = await Promise.all(
          data.map(async (logistics) => {
            const [deliveriesRes] = await Promise.allSettled([
              this.fetchDeliveryByLogisticsId(logistics.id),
            ]);
            const deliveries =
              deliveriesRes.status === "fulfilled" &&
              Array.isArray(deliveriesRes.value)
                ? deliveriesRes.value
                : [];
            return { ...logistics, logistics_deliveries: deliveries };
          })
        );

        // 2) Bulk fetch exceptions by logistics_id
        const logisticsIds = enriched.map((l) => l.id).filter((v) => v != null);
        let exceptionsByLogId = new Map();

        if (logisticsIds.length) {
          const { data: excRows, error: excErr } = await supabase
            .from("logistics_delivery_exceptions")
            .select(
              `
          id,
          logistics_id,
          order_transaction_item_id,
          delivery_date,
          delivery_time,
          driver_id,
          quantity,
          remarks,
          delivered_date,
          created_at
        `
            )
            .in("logistics_id", logisticsIds);

          if (excErr) {
            console.error("Error fetching delivery exceptions:", excErr);
          } else {
            exceptionsByLogId = (excRows || []).reduce((m, r) => {
              const k = r.logistics_id;
              const bucket = m.get(k) || [];
              bucket.push(r);
              m.set(k, bucket);
              return m;
            }, new Map());
          }
        }

        const matchExceptionsToDelivery = (logisticsId, d) => {
          const all = exceptionsByLogId.get(logisticsId) || [];
          if (!all.length) return [];
          const date = d?.delivery_date || null;
          const time = d?.delivery_time || null;
          const driverId = d?.driver_id ?? null;

          const precise = all.filter((e) => {
            const dtOk =
              (!date || e.delivery_date === date) &&
              (!time || e.delivery_time === time);
            const drvOk =
              e.driver_id == null ||
              (driverId != null && String(e.driver_id) === String(driverId));
            return dtOk && drvOk;
          });
          if (precise.length) return precise;

          const dateOnly = all.filter((e) => date && e.delivery_date === date);
          if (dateOnly.length) return dateOnly;

          return all;
        };

        // 3) Map + attach exceptions
        const mapped = enriched.map((logistics) => {
          const deliveries = (logistics.logistics_deliveries || []).map((d) => {
            const delivery_exceptions = matchExceptionsToDelivery(
              logistics.id,
              d
            );
            return {
              id: d.id,
              delivery_date: d.delivery_date,
              delivery_time: d.delivery_time,
              no_bags: d.no_bags,
              driver_id: d.driver_id,
              driver: d.profiles
                ? { id: d.profiles.id, name: d.profiles.name }
                : null,
              contact_person: d.customer_contact_persons
                ? {
                    id: d.customer_contact_persons.id,
                    name: d.customer_contact_persons.name,
                    contact_no1: d.customer_contact_persons.contact_no1,
                    contact_no2: d.customer_contact_persons.contact_no2,
                    email: d.customer_contact_persons.email,
                  }
                : null,
              delivery_exceptions: delivery_exceptions.map((e) => ({
                id: e.id,
                logistics_id: e.logistics_id,
                order_transaction_item_id: e.order_transaction_item_id ?? null,
                delivery_date: e.delivery_date,
                delivery_time: e.delivery_time,
                driver_id: e.driver_id,
                quantity: e.quantity,
                remarks: e.remarks,
                delivered_date: e.delivered_date,
                created_at: e.created_at,
              })),
            };
          });

          return {
            logistics_id: logistics.id,
            logistics_status: logistics.logistics_status,
            urgency: logistics.urgency,
            order: logistics.orders
              ? {
                  id: logistics.orders.id,
                  order_no: logistics.orders.order_no,
                  created_at: logistics.orders.created_at,
                  order_production: Array.isArray(
                    logistics.orders.order_production
                  )
                    ? logistics.orders.order_production[0] || null
                    : logistics.orders.order_production || null,
                }
              : null,
            customer: logistics.customers
              ? {
                  id: logistics.customers.id,
                  name: logistics.customers.name,
                  contact_no1: logistics.customers.contact_no1,
                  contact_no2: logistics.customers.contact_no2,
                  email: logistics.customers.email,
                }
              : null,
            deliveries,
          };
        });

        // 4) FINAL FILTER: only rows with a truthy order_no
        return mapped.filter((r) => !!r?.order?.order_no);
      } catch (error) {
        console.error("Error fetching all orders for packing:", error);
        return [];
      }
    },

    async fetchPackCategoriesByOrderIds(orderIds = []) {
      const unique = [...new Set(orderIds.filter(Boolean))];
      if (!unique.length) return {};

      const { data, error } = await supabase
        .from("order_transactions")
        .select(
          `
      order_id,
      order_transaction_items (
        pieces,
        pack_category,
        unit,
        quantity
      )
    `
        )
        .in("order_id", unique)
        .eq("status", "active");

      if (error) {
        console.error("fetchPackCategoriesByOrderIds error:", error);
        return {};
      }

      // Build: { [orderId]: { [pack_category]: totalPiecesOrCount } }
      const byOrder = {};
      for (const row of data || []) {
        const oid = row.order_id;
        const items = Array.isArray(row.order_transaction_items)
          ? row.order_transaction_items
          : [];

        if (!byOrder[oid]) byOrder[oid] = {};

        items.forEach((it) => {
          const cat = String(it.pack_category || "")
            .trim()
            .toLowerCase();
          if (!cat) return;
          // You can sum pieces, quantity, or just count 1 per item.
          // Here we sum `pieces` if present, else fall back to `quantity` or 1.
          const val =
            (Number.isFinite(+it.pieces) && +it.pieces) ||
            (Number.isFinite(+it.quantity) && +it.quantity) ||
            1;

          byOrder[oid][cat] = (byOrder[oid][cat] || 0) + val;
        });
      }

      // Store for quick access
      this.packCategoriesByOrderId = byOrder; // <- add this state in your store if not present
      return byOrder;
    },

    async fetchOrderNos() {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("order_no")
          .not("order_no", "is", null) // only rows where order_no IS NOT NULL
          .order("order_no", { ascending: true });

        if (error) throw error;

        return Array.from(new Set((data || []).map((r) => String(r.order_no))));
      } catch (e) {
        console.error("fetchOrderNos:", e);
        return [];
      }
    },
 async handleDiscountsCharges(orderId) {
      if (!orderId) throw new Error("Missing orderId in handleDiscountsCharges().");

      // 1) createTransaction first so we can get inserted item ids
      await this.createTransaction(orderId);

      // 2) fetch inserted items and map to UI items to get order_transaction_item_id per item
      const { insertedItems } = await fetchLatestTransactionAndItems(supabase, orderId);
      const pairs = mapItemsToInsertedIds(this.transactionItems ?? [], insertedItems);

      if (!pairs.length) return;

      // 3) overall rules: customer + order (both apply to whole order total)
      const customerId = this.selectedCustomer?.id ?? null;
      const customerOverall = await fetchCustomerOverallRules(supabase, customerId);

      const orderOverall = Array.isArray(this.orderOverallDiscountCharges)
        ? this.orderOverallDiscountCharges
        : [];

      const overallCombined = [...customerOverall, ...orderOverall];

      // 4) expand overall rules into per-item rows and insert once
      const allDcRows = expandOverallAdjustmentsToDcRows(overallCombined, pairs);

      if (allDcRows.length) {
        const { error: dcError } = await supabase
          .from("order_discounts_charges")
          .insert(allDcRows);

        if (dcError) throw dcError;
      }
    },
async fetchCustomerDiscountCharges() {
  this.customerDiscountCharges = [];

  const customerId = this.selectedCustomer?.id ?? null;
  if (!customerId) return [];

  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("customer_discounts_charges")
    .select("id, dc_type, value_type, percentage, amount, code, description, active, starts_at, ends_at")
    .eq("customer_id", customerId)
    .eq("active", true)
    .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
    .or(`ends_at.is.null,ends_at.gte.${nowIso}`);

  if (error) throw error;

  this.customerDiscountCharges = data ?? [];
  return this.customerDiscountCharges;
},

},
});
