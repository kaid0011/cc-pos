import { supabase } from "@/../supabase/config.js";
import { defineStore } from "pinia";
import { fetchAllItems } from "@/../supabase/api/item_list.js";
import { getLastOrderIdForDate } from "@/../supabase/api/orders.js";
import { fetchAllCustomers } from "@/../supabase/api/customers.js";
// import { fetchContactPersons } from "@/../supabase/api/contacts.js";
// import { laThSolid } from "@quasar/extras/line-awesome";

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
    jobOptions: [],
    selectedCustomer: null,
    selectedDeliveryId: null,
    selectedCollectionId: null,
    selectedDeliveryContact: null,
    selectedCollectionContact: null,
    selectedDeliveryAddress: null,
    selectedCollectionAddress: null,
    selectedCollectionDriver: null,
    selectedDeliveryDriver: null,
    totalAmount: null,
    orderNo: "",
    addresses: "",
    isOrderNoManuallySet: false,
    collectionDate: null,
    deliveryDate: null,
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

        const driverName = this.selectedCollectionDriver || "";
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
    async loadContactOptions(customerId = null) {
      try {
        let customerContacts = [];
        let defaultContact = null;

        // Fetch customer-specific contact persons
        if (customerId) {
          const { data, error } = await supabase
            .from("customer_contact_persons")
            .select("id, name, contact_no1, contact_no2, email")
            .eq("customer_id", customerId);

          if (error) throw error;
          customerContacts = data || [];
        }

        // Fetch the default contact person (id=1)
        const { data: defaultData, error: defaultError } = await supabase
          .from("customer_contact_persons")
          .select("id, name, contact_no1, contact_no2, email")
          .eq("id", 1)
          .single();

        if (!defaultError) {
          defaultContact = defaultData; // Use default contact if found
        }

        // Merge and deduplicate contacts
        const contacts = defaultContact
          ? [defaultContact, ...customerContacts]
          : customerContacts;

        this.contactOptions = contacts.filter(
          (contact, index, self) =>
            index === self.findIndex((c) => c.id === contact.id)
        );
      } catch (error) {
        console.error("Error loading contact options:", error);
        this.contactOptions = [];
      }
    },

    async loadAddressOptions(customerId = null) {
      try {
        let customerAddresses = [];
        let defaultAddress = null;

        // Fetch customer-specific addresses
        if (customerId) {
          const { data, error } = await supabase
            .from("customer_address")
            .select(
              "id, block_no, road_name, building_name, postal_code, unit_no, additional_info, remarks"
            )
            .eq("customer_id", customerId);

          if (error) throw error;
          customerAddresses = data || [];
        }

        // Fetch the default address (id=1)
        const { data: defaultData, error: defaultError } = await supabase
          .from("customer_address")
          .select(
            "id, block_no, road_name, building_name, postal_code, unit_no, additional_info, remarks"
          )
          .eq("id", 1)
          .single();

        if (!defaultError) {
          defaultAddress = defaultData; // Use default address if found
        }

        // Merge and deduplicate addresses
        const addresses = defaultAddress
          ? [defaultAddress, ...customerAddresses]
          : customerAddresses;

        this.addressOptions = addresses
          .filter(
            (address, index, self) =>
              index === self.findIndex((c) => c.id === address.id)
          )
          .map(
            ({
              block_no,
              road_name,
              unit_no,
              building_name,
              postal_code,
              additional_info,
            }) =>
              `${block_no} ${road_name} ${unit_no} ${building_name}, ${postal_code} ${
                additional_info || ""
              }`.trim()
          );

        console.log("Address options loaded:", this.addressOptions);
      } catch (error) {
        console.error("Error loading address options:", error);
        this.addressOptions = [];
      }
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

    async loadTimeOptions() {
      try {
        const { data, error } = await supabase
          .from("options_time")
          .select("time");

        if (error) {
          console.error("Error fetching time options:", error);
          return;
        }

        // Map and sort time options alphabetically
        this.timeOptions = data.map((option) => `${option.time}`);

        console.log("Sorted Time Options:", this.timeOptions);
      } catch (error) {
        console.error("Unexpected error fetching time options:", error);
      }
    },
    async loadJobOptions() {
      try {
        const { data, error } = await supabase
          .from("options_job_types")
          .select("type");

        if (error) {
          console.error("Error fetching time options:", error);
          return;
        }

        // Map and sort time options alphabetically
        this.jobOptions = data.map((option) => `${option.type}`);

        console.log("Sorted Job Type Options:", this.jobOptions);
      } catch (error) {
        console.error("Unexpected error fetching job type options:", error);
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
        quantity,
        subtotal,
        category,
        tag_category,
      } = item;

      const unitType = this.detectUnitType(unit);
      let newItem;

      if (price === "TBA") {
        // Special handling for TBA price type
        newItem = {
          name,
          process,
          price: "TBA",
          pieces,
          quantity,
          subtotal: 0,
          unit,
          category,
          tag_category,
          pack_type
        };
        this.transactionItems = [...this.transactionItems, newItem]; // Add directly
        return;
      }

      if (unitType === "size" || unitType === "weight") {
        const key = `${name}-${process}-${unit}`;
        const existingItemIndex = this.transactionItems.findIndex(
          (tItem) =>
            tItem.name === key &&
            tItem.process === process &&
            tItem.price === price // Check price as part of comparison
        );

        if (existingItemIndex > -1) {
          // Update existing item
          this.transactionItems[existingItemIndex].quantity += quantity;
          this.transactionItems[existingItemIndex].subtotal += subtotal;
        } else {
          // Add new item
          newItem = {
            name,
            process,
            price,
            pieces,
            quantity,
            subtotal,
            unit,
            category,
            tag_category,
            pack_type
          };
          this.transactionItems = [...this.transactionItems, newItem]; // Reactive update
        }
      } else {
        const existingItem = this.transactionItems.find(
          (tItem) =>
            tItem.name === name &&
            tItem.process === process &&
            tItem.price === price // Check price as part of comparison
        );

        if (existingItem) {
          // Update existing item
          existingItem.quantity += quantity;
          existingItem.subtotal += subtotal;
        } else {
          // Add new item
          newItem = {
            name,
            process,
            price,
            pieces,
            quantity,
            subtotal,
            unit,
            category,
            tag_category,
            pack_type
          };
          this.transactionItems = [...this.transactionItems, newItem]; // Reactive update
        }
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

    async generateInvoice() {
      try {
        // Ensure orderNo is set
        if (!this.orderNo) {
          throw new Error("Order number is not set. Cannot generate invoice.");
        }

        // Fetch the order ID using the current orderNo
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("id")
          .eq("order_no", this.orderNo)
          .single();

        if (orderError || !orderData) {
          throw new Error(
            `Failed to retrieve order ID for order_no: ${this.orderNo}`
          );
        }

        const orderId = orderData.id;
        const timestamp = new Date().toISOString();

        // Insert the invoice record
        const { error: invoiceError } = await supabase.from("invoices").insert({
          invoice_date_time: timestamp,
          order_id: orderId,
        });

        if (invoiceError) {
          throw new Error(`Error inserting invoice: ${invoiceError.message}`);
        }

        console.log(
          "Invoice generated successfully for order_no:",
          this.orderNo
        );
        return true; // Return success status
      } catch (error) {
        console.error("Error in generateInvoice:", error.message);
        return false; // Return failure status
      }
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

      const { data: creditData, error: fetchError } = await supabase
        .from("customer_credits")
        .select("*")
        .eq("customer_id", customerId)
        .single();

      if (fetchError) throw fetchError;

      const currentCredit = creditData[column] || 0;
      const newCredit = currentCredit + amount;

      const { error: updateError } = await supabase
        .from("customer_credits")
        .update({ [column]: newCredit })
        .eq("id", creditData.id);

      if (updateError) throw updateError;

      const { error: insertError } = await supabase
        .from("customer_credits_history")
        .insert({
          credit_type: type,
          amount,
          remarks,
          customer_credit_id: creditData.id,
        });

      if (insertError) throw insertError;
    },

    async addPayment({ order_id, amount, type, remarks, reference_no }) {
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
        });

      if (insertError) throw insertError;
    },

    async setSelectedCustomer(customer) {
      this.selectedCustomer = customer;

      // Load addresses and contact persons for the selected customer
      try {
        this.addressOptions = await this.loadAddressOptions(customer.id);
        this.contactPersons = await this.fetchContactPersons(customer.id);
      } catch (error) {
        console.error("Error loading customer details:", error);
        this.addressOptions = [];
        this.contactPersons = [];
      }

      // Reset selected contacts
      this.selectedDeliveryContact = "";
      this.selectedCollectionContact = "";
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
    // updated functions (new)
    // start of fetching
    async fetchAllCollections() {
      try {
        const { data, error } = await supabase
          .from("logistics_collections")
          .select(
            `
        id,
        created_at,
        status,
        remarks,
        contact_person_id,
        address,
        date_collected,
        collection_date,
        collection_time,
        no_bags,
        logistics_id,
        driver_name,
        customer_contact_persons (
          id,
          name,
          contact_no1,
          contact_no2
        ),
        logistics (
          id,
          customer_id,
          job_type,
          logistics_status,
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
              ready_by,
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
          .eq("status", "active")
          .order("logistics_id", { ascending: true })
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formattedData = data.map((collection) => ({
          id: collection.id,
          created_at: collection.created_at,
          logistics_status: collection.logistics?.logistics_status || null,
          remarks: collection.remarks,
          contact_person_id: collection.contact_person_id,
          address: collection.address,
          driver_name: collection.driver_name,
          date_collected: collection.date_collected,
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
                goods_status:
                  collection.logistics?.orders?.order_production[0]
                    .goods_status,
                ready_by:
                  collection.logistics?.orders?.order_production[0].ready_by,
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
            status,
            remarks,
            contact_person_id,
            address,
            date_delivered,
            delivery_date,
            delivery_time,
            no_bags,
            logistics_id,
            driver_name,
            customer_contact_persons (
              id,
              name,
              contact_no1,
              contact_no2
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
          .eq("status", "active") // Fetch only active deliveries
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
          remarks: delivery.remarks,
          contact_person_id: delivery.contact_person_id,
          address: delivery.address,
          driver_name: delivery.driver_name,
          date_delivered: delivery.date_delivered,
          delivery_date: delivery.delivery_date,
          delivery_time: delivery.delivery_time,
          no_bags: delivery.no_bags,
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
                  contact_no2
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
                  name
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
                  name
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
                  }
                : null,
            })) || [], // ✅ Ensure deliveries is always an array
        }));
      } catch (error) {
        console.error("Error fetching all orders:", error);
        return [];
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
            ready_by,
            goods_status,
            no_packets,
            no_hangers,
            no_rolls
          ),
          order_invoices (
            invoice_no,
            created_at
          )
        ),
        customers (
          id,
          name,
          contact_no1,
          contact_no2
        ),
        logistics_collections (
          id,
          logistics_id,
          collection_date,
          collection_time,
          no_bags,
          driver_name,
          status,
          customer_contact_persons (
            id,
            name,
            contact_no1,
            contact_no2
          )
        ),
        logistics_deliveries (
          id,
          logistics_id,
          delivery_date,
          delivery_time,
          driver_name,
          status,
          customer_contact_persons (
            id,
            name,
            contact_no1,
            contact_no2
          )
        )
      `
          )
          .eq("logistics_collections.status", "active")
          .eq("logistics_deliveries.status", "active")
          .order("id", { ascending: true });

        if (error) throw error;

        if (!data?.length) return [];

        return data.map((logistics) => ({
          logistics_id: logistics.id,
          logistics_status: logistics.logistics_status,
          urgency: logistics.urgency,
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
              }
            : null,
          collections:
            logistics.logistics_collections?.map((c) => ({
              id: c.id,
              collection_date: c.collection_date,
              collection_time: c.collection_time,
              no_bags: c.no_bags,
              driver_name: c.driver_name,
              contact_person: c.customer_contact_persons
                ? {
                    id: c.customer_contact_persons.id,
                    name: c.customer_contact_persons.name,
                    contact_no1: c.customer_contact_persons.contact_no1,
                    contact_no2: c.customer_contact_persons.contact_no2,
                  }
                : null,
            })) || [],
          deliveries:
            logistics.logistics_deliveries?.map((d) => ({
              id: d.id,
              delivery_date: d.delivery_date,
              delivery_time: d.delivery_time,
              driver_name: d.driver_name,
              contact_person: d.customer_contact_persons
                ? {
                    id: d.customer_contact_persons.id,
                    name: d.customer_contact_persons.name,
                    contact_no1: d.customer_contact_persons.contact_no1,
                    contact_no2: d.customer_contact_persons.contact_no2,
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
        unit,
        ready_status,
        pack_type
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
        .select("id, order_id, description, category, sub_category, image")
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
          id, logistics_id, collection_date, collection_time, remarks, address, date_collected, status, created_at, created_by, driver_name, no_bags,
          customer_contact_persons ( id, name, contact_no1, contact_no2 ),
          logistics ( logistics_status )
        `
        )
        .eq("logistics_id", logisticsId)
        .eq("status", "active");

      if (error) {
        console.error("Error fetching collections:", error);
        return [];
      }

      return data;
    },

    async fetchCollectionHistoryByLogisticsId(logisticsId) {
      const { data, error } = await supabase
        .from("logistics_collections")
        .select(
          `
          id, logistics_id, collection_date, collection_time, remarks, address, date_collected, status, created_at, created_by, driver_name, no_bags,
          customer_contact_persons ( id, name, contact_no1, contact_no2 ),
          logistics ( logistics_status )
        `
        )
        .eq("logistics_id", logisticsId)
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching collections:", error);
        return [];
      }

      // Fetch profile names for each collection
      const collectionsWithProfiles = await Promise.all(
        data.map(async (collection) => {
          collection.profile_name = collection.created_by
            ? await this.getProfileName(collection.created_by)
            : "[NOT SET]";
          return collection;
        })
      );

      return collectionsWithProfiles;
    },

    // Fetch Deliveries
    async fetchDeliveryByLogisticsId(logisticsId) {
      const { data, error } = await supabase
        .from("logistics_deliveries")
        .select(
          `
          id, logistics_id, delivery_date, delivery_time, remarks, address, date_delivered, status, created_at, created_by, driver_name, no_bags,
          customer_contact_persons ( id, name, contact_no1, contact_no2 ),
          logistics ( logistics_status )
        `
        )
        .eq("logistics_id", logisticsId)
        .eq("status", "active");

      if (error) {
        console.error("Error fetching deliveries:", error);
        return [];
      }

      return data;
    },

    async fetchDeliveryHistoryByLogisticsId(logisticsId) {
      const { data, error } = await supabase
        .from("logistics_deliveries")
        .select(
          `
          id, logistics_id, delivery_date, delivery_time, remarks, address, date_delivered, status, created_at, created_by, driver_name,
          customer_contact_persons ( id, name, contact_no1, contact_no2 ),
          logistics ( logistics_status )
        `
        )
        .eq("logistics_id", logisticsId)
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching deliveries:", error);
        return [];
      }

      // Fetch profile names for each collection
      const deliveriesWithProfiles = await Promise.all(
        data.map(async (delivery) => {
          delivery.profile_name = delivery.created_by
            ? await this.getProfileName(delivery.created_by)
            : "[NOT SET]";
          return delivery;
        })
      );

      return deliveriesWithProfiles;
    },

    // Fetch Whole Order (Main Function)
    async fetchWholeOrderByOrderNo(orderNo) {
      try {
        const { data, error } = await supabase
          .from("logistics")
          .select(
            `
        id,
        job_type,
        urgency,
        logistics_status,
        customer_id,
        orders!inner(order_no, id, created_at, 
          order_payments(id, payment_status, paid_amount, total_amount, deposit),
          order_tags(tag_status, tag_changes),
          order_production(ready_by, goods_status, no_packets, no_hangers, no_rolls),
          order_invoices(invoice_no, created_at)
        ),
        customers(id, name, contact_no1, contact_no2, email, type, sub_type,
          schedule_remarks, price_remarks, accounting_remarks, other_remarks, billing_address,
          customer_credits(online_package, other_credits)
        ),
        logistics_collections:logistics_collections(status, id, logistics_id, collection_date, collection_time, address, driver_name, remarks, no_bags, customer_contact_persons (id, name, contact_no1, contact_no2, email, remarks)),
        logistics_deliveries:logistics_deliveries(status, id, logistics_id, delivery_date, delivery_time, address, driver_name, remarks, customer_contact_persons (id, name, contact_no1, contact_no2, email, remarks))
        `
          )
          .eq("orders.order_no", orderNo)
          .eq("logistics_collections.status", "active")
          .eq("logistics_deliveries.status", "active")
          .single();

        if (error) throw error;

        const order = data.orders;

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
          collection: (data.logistics_collections || [])[0] || null,
          delivery: (data.logistics_deliveries || [])[0] || null,
        };

        return fullData;
      } catch (error) {
        console.error("Error fetching whole order:", error);
        return null;
      }
    },

    async createOrderFromCollection(logisticsId) {
      try {
        const collection = await this.fetchCollectionByLogisticsId(logisticsId);
        this.readyBy = this.computeReadyByDate(collection?.collection_date);

        // Step 1: Create Order and get orderId
        const { orderId } = await this.createOrder(logisticsId);
        if (!orderId) throw new Error("Failed to create order");

        console.log("[createOrderFromCollection] Created orderId:", orderId);

        // Step 2: Update logistics.order_id with new orderId
        const { error: updateError } = await supabase
          .from("logistics")
          .update({ order_id: orderId })
          .eq("id", logisticsId);

        if (updateError) {
          console.error(
            "[createOrderFromCollection] Failed to update logistics.order_id:",
            updateError
          );
          throw updateError;
        }

        console.log(
          "[createOrderFromCollection] Updated logistics.order_id successfully"
        );

        // Step 3: Create transaction-related data
        await this.createTransaction(orderId);
        await this.createInstructions(orderId);
        await this.createErrorReports(orderId);
        await this.createInvoice(orderId);

        this.resetTransactionItems();

        return orderNo;
      } catch (error) {
        console.error("[createOrderFromCollection] Error:", error);
      }
    },

    // start of order creation
    async createWholeTransaction() {
      try {
        // Step 4: Create Order with logisticsId and get orderId
        const { orderId } = await this.createOrder();
        if (!orderId) throw new Error("Failed to create order");

        // Step 1: Create Logistics and get logisticsId
        const logisticsId = await this.createLogistics(orderId);
        if (!logisticsId) throw new Error("Failed to create logistics");

        // Step 2: Create Collections & Delivery with logisticsId
        const collection = await this.createCollection(logisticsId);
        await this.createDelivery(logisticsId);

        // Step 3: Calculate "readyBy" date (collection_date + 7 days)
        this.readyBy = await this.computeReadyByDate(
          collection?.collection_date
        );

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

    async computeReadyByDate(startDate) {
      if (!startDate) {
        console.warn("Invalid startDate provided to computeReadyByDate.");
        return null;
      }

      const readyByDate = new Date(startDate);
      let addedDays = 0;

      while (addedDays < 5) {
        readyByDate.setDate(readyByDate.getDate() + 1);
        const dayOfWeek = readyByDate.getDay(); // 0 = Sunday, 6 = Saturday
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          addedDays++; // Only count Monday-Friday
        }
      }

      return readyByDate.toISOString().split("T")[0]; // Format: "YYYY-MM-DD"
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
              urgency: this.jobUrgency,
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
        // 1. Fetch existing logistics record for archiving
        const { data: logisticsData, error: fetchError } = await supabase
          .from("logistics")
          .select(
            "id, logistics_status, created_at, job_type, urgency, created_by"
          )
          .eq("id", logisticsId)
          .single();

        if (fetchError) throw fetchError;
        if (!logisticsData) throw new Error("Logistics record not found.");

        // 2. Archive to logistics_history
        const { id, ...rest } = logisticsData;
        const { error: insertError } = await supabase
          .from("logistics_history")
          .insert([{ ...rest, logistics_id: id }]);

        if (insertError) throw insertError;

        // 3. Add system-generated values manually
        const session = await supabase.auth.getSession();
        const userId = session?.data?.session?.user?.id;

        const enrichedUpdate = {
          ...updateData,
          created_at: new Date().toISOString(),
          created_by: userId,
        };

        // 4. Update logistics row
        const { error: updateError } = await supabase
          .from("logistics")
          .update(enrichedUpdate)
          .eq("id", logisticsId);

        if (updateError) throw updateError;

        return true;
      } catch (error) {
        console.error("❌ Error updating logistics:", error);
        return false;
      }
    },

    async updateProduction(orderId, updateData) {
      try {
        // 1. Fetch current production row
        const { data: prodData, error: fetchError } = await supabase
          .from("order_production")
          .select(
            "id, ready_by, goods_status, no_packets, no_hangers, no_rolls, created_at, created_by"
          )
          .eq("order_id", orderId)
          .single();

        if (fetchError) throw fetchError;
        if (!prodData) throw new Error("Production record not found.");

        // 2. Archive to order_production_history
        const { id, ...rest } = prodData;
        const { error: insertError } = await supabase
          .from("order_production_history")
          .insert([{ ...rest, order_production_id: id }]);

        if (insertError) throw insertError;

        // 3. Get current user ID
        const session = await supabase.auth.getSession();
        const userId = session?.data?.session?.user?.id;

        // 4. Prepare update payload
        const enrichedUpdate = {
          ...updateData,
          created_at: new Date().toISOString(),
          created_by: userId,
        };

        // 5. Update the production record
        const { error: updateError } = await supabase
          .from("order_production")
          .update(enrichedUpdate)
          .eq("order_id", orderId);

        if (updateError) throw updateError;

        return true;
      } catch (error) {
        console.error("❌ Error updating production:", error);
        return false;
      }
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
              address:
                this.selectedCollectionAddress ?? fallback.address ?? null,
              collection_date:
                this.collectionDate ?? fallback.collection_date ?? null,
              collection_time:
                this.collectionTime ?? fallback.collection_time ?? null,
              remarks: this.collectionRemarks ?? fallback.remarks ?? null,
              driver_name: this.selectedCollectionDriver ?? null,
              no_bags: this.collectionNoBags ?? fallback.no_bags ?? null,
              status: "active",
              logistics_id: logisticsId,
            },
          ]);

        if (collectionError) throw collectionError;

        console.log("Collection successfully created!");
      } catch (error) {
        console.error("Error in create collection:", error);
      }
    },

    async updateCollection(collectionId) {
      try {
        const { data: existingCollection, error: fetchError } = await supabase
          .from("logistics_collections")
          .select("*")
          .eq("id", collectionId)
          .single();

        if (fetchError) throw fetchError;
        if (!existingCollection) throw new Error("Collection not found");

        const { error: updateError } = await supabase
          .from("logistics_collections")
          .update({ status: "inactive" })
          .eq("id", collectionId);

        if (updateError) throw updateError;

        console.log("Existing collection marked as inactive");

        await this.createCollection(
          existingCollection.logistics_id,
          existingCollection
        );

        console.log("New collection created successfully");
      } catch (error) {
        console.error("Error updating collection:", error);
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
              address: this.selectedDeliveryAddress ?? fallback.address ?? null,
              delivery_date:
                this.deliveryDate ?? fallback.delivery_date ?? null,
              delivery_time:
                this.deliveryTime ?? fallback.delivery_time ?? null,
              remarks: this.deliveryRemarks ?? fallback.remarks ?? null,
              driver_name: this.selectedDeliveryDriver ?? mnull,
              status: "active",
              logistics_id: logisticsId,
            },
          ]);

        if (deliveryError) throw deliveryError;

        console.log("Delivery successfully created!");
      } catch (error) {
        console.error("Error in create delivery:", error);
      }
    },

    async updateDelivery(deliveryId) {
      try {
        const { data: existingDelivery, error: fetchError } = await supabase
          .from("logistics_deliveries")
          .select("*")
          .eq("id", deliveryId)
          .single();

        if (fetchError) throw fetchError;
        if (!existingDelivery) throw new Error("Delivery not found");

        const { error: updateError } = await supabase
          .from("logistics_deliveries")
          .update({ status: "inactive" })
          .eq("id", deliveryId);

        if (updateError) throw updateError;

        console.log("Existing delivery marked as inactive");

        await this.createDelivery(
          existingDelivery.logistics_id,
          existingDelivery
        );

        console.log("New delivery created successfully");
      } catch (error) {
        console.error("Error updating delivery:", error);
      }
    },

    async createOrder(logisticsId) {
      try {
        // 1. Insert into orders first
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert([
            {
              order_no: this.orderNo,
            },
          ])
          .select("id, order_no")
          .single();

        if (orderError) throw orderError;
        if (!orderData?.id)
          throw new Error("Order was not created successfully.");

        const orderId = orderData.id;

        // 2. Insert into order_payments with the generated orderId
        const { data: paymentData, error: paymentError } = await supabase
          .from("order_payments")
          .insert([
            {
              order_id: orderId,
              payment_status: "unpaid",
              paid_amount: 0,
              total_amount: this.totalAmount,
            },
          ])
          .select("id")
          .single();

        if (paymentError) throw paymentError;
        if (!paymentData?.id)
          throw new Error("Payment record was not created successfully.");

        // 3. Insert into order_production with the generated orderId
        const { data: productionData, error: productionError } = await supabase
          .from("order_production")
          .insert([
            {
              order_id: orderId,
              ready_by: this.readyBy,
              goods_status: "none",
              no_packets: null,
              no_hangers: null,
              no_rolls: null,
            },
          ])
          .select("id")
          .single();

        if (productionError) throw productionError;
        if (!productionData?.id)
          throw new Error("Production record was not created successfully.");

        // 4. Insert into order_tags with the generated orderId
        const { data: tagsData, error: tagsError } = await supabase
          .from("order_tags")
          .insert([
            {
              order_id: orderId,
              tag_status: "to print",
              tag_changes: "-",
            },
          ])
          .select("id")
          .single();

        if (tagsError) throw tagsError;
        if (!tagsData?.id)
          throw new Error("Tags record was not created successfully.");

        return { orderId, orderNo: orderData.order_no };
      } catch (error) {
        console.error("Error in createOrder:", error);
        return null;
      }
    },

    async createTransaction(orderId) {
      try {
        console.log("[createTransaction] Start for orderId:", orderId);

        if (!orderId) {
          console.error("[createTransaction] Invalid orderId");
          return;
        }

        if (
          !Array.isArray(this.transactionItems) ||
          this.transactionItems.length === 0
        ) {
          console.warn("[createTransaction] No transaction items found.");
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
          console.error(
            "[createTransaction] Failed to insert order_transactions:",
            headerError
          );
          throw headerError;
        }

        const transactionId = transactionHeader.id;
        console.log(
          "[createTransaction] Inserted order_transaction with ID:",
          transactionId
        );

        // Step 2: Insert each item into order_transaction_items
        for (const [index, item] of this.transactionItems.entries()) {
          const itemData = {
            order_transaction_id: transactionId,
            item_name: item.name,
            price: item.price,
            process: item.process,
            pieces: item.pieces,
            quantity: item.quantity,
            subtotal: item.subtotal,
            category: item.category,
            tag_category: item.tag_category,
            unit: item.unit,
            pack_type: item.pack_type
          };

          console.log(
            `[createTransaction] Inserting item #${index + 1}:`,
            itemData
          );

          const { error: itemError } = await supabase
            .from("order_transaction_items")
            .insert(itemData);

          if (itemError) {
            console.error(
              `[createTransaction] Error inserting item #${index + 1}:`,
              itemError
            );
            throw itemError;
          }
        }

        console.log(
          "[createTransaction] All transaction items inserted successfully."
        );
      } catch (error) {
        console.error("[createTransaction] Fatal error:", error);
      }
    },

    async updateTransaction(orderId) {
      try {
        // Fetch existing active transactions for the orderId
        const { data: transactions, error: fetchError } = await supabase
          .from("transactions")
          .select("id, status")
          .eq("order_id", orderId)
          .eq("status", "active");

        if (fetchError) throw fetchError;

        let newStatus = 1; // Default first update status

        if (transactions.length > 0) {
          // Check for the highest existing status and increment
          const existingStatuses = transactions
            .map((t) => parseInt(t.status))
            .filter((s) => !isNaN(s));

          if (existingStatuses.length > 0) {
            newStatus = Math.max(...existingStatuses) + 1;
          }

          // Update the existing transactions with the new status
          const { error: updateError } = await supabase
            .from("transactions")
            .update({ status: newStatus })
            .eq("order_id", orderId)
            .eq("status", "active");

          if (updateError) throw updateError;
        }

        // Insert new transactions using createTransaction
        await this.createTransaction(orderId);
      } catch (error) {
        console.error("Error updating transaction:", error);
      }
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

        // Step 1: Get the latest invoice_no
        const { data: latestInvoice, error: fetchError } = await supabase
          .from("order_invoices")
          .select("invoice_no")
          .order("invoice_no", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fetchError) throw fetchError;

        const lastInvoiceNo = latestInvoice?.invoice_no ?? 0;
        const newInvoiceNo = lastInvoiceNo + 1;

        // Step 2: Insert new invoice
        const { data: insertedInvoice, error: insertError } = await supabase
          .from("order_invoices")
          .insert({ order_id: orderId, invoice_no: newInvoiceNo })
          .select("id, invoice_no")
          .single();

        if (insertError) throw insertError;

        console.log("[createInvoice] Invoice created:", insertedInvoice);
        return insertedInvoice;
      } catch (error) {
        console.error("[createInvoice] Error:", error);
        return null;
      }
    },

    async updateTransactionReady(id, ready_status) {
      const { error } = await supabase
        .from("order_transaction_items")
        .update({ ready_status })
        .eq("id", id);

      if (error) throw error;
    },
    
  },
});
