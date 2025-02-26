import { supabase } from "@/../supabase/config.js";
import { defineStore } from "pinia";
import { fetchAllItems } from "@/../supabase/api/item_list.js";
import { getLastOrderIdForDate } from "@/../supabase/api/orders.js";
import { fetchAllCustomers } from "@/../supabase/api/customers.js";
import { fetchContactPersons } from "@/../supabase/api/contacts.js";

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
    selectedDeliveryContact: null,
    selectedCollectionContact: null,
    selectedDeliveryAddress: null,
    selectedCollectionAddress: null,
    selectedCollectionDriver: null,
    selectedDeliveryDriver: null,
    orderNo: "",
    addresses: "",
    isOrderNoManuallySet: false,
    collectionDate: null,
    deliveryDate: null,
    collectionTime: null,
    deliveryTime: null,
    collectionRemarks: null,
    deliveryRemarks: null,
    useCcCollection: false, // New: Self-collect checkbox state
    useCcDelivery: false, // New: Self-pickup checkbox state
    transactions: [],
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
          .select("system_access")
          .eq("id", user.id) // Match where profiles.id is the current user's ID
          .single(); // Assumes one result per user

        if (error) throw error;
        return userProfile.system_access;
      } catch (error) {
        console.error("Error fetching user system access:", error);
        return null;
      }
    },

    async SetUserProfile() {
      try {
        // Call getUserProfile to get the system_access value
        const systemAccess = await this.getUserProfile();

        // Set getUserProfile to 'Sfc' if system_access is 'pos'
        if (systemAccess === "pos") {
          return "Sfc";
        } else {
          return systemAccess;
        }
      } catch (error) {
        console.error("Error checking and setting user profile:", error);
        return null;
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
              // remarks: newCustomer.remarks || null,
              type: newCustomer.type || null,
              sub_type: newCustomer.sub_type || null,
              remarks: newCustomer.remarks || null,
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
          remarks: createdCustomer.remarks,
          customer_id: createdCustomer.id, // Link the contact person to the customer
        };

        const { error: contactError } = await supabase
          .from("contact_persons")
          .insert([contactPerson]);

        if (contactError) throw contactError;

        // Step 4: Update the store state
        this.customers.push({
          ...createdCustomer,
          addresses: newCustomer.address
            ? [{ address: newCustomer.address }]
            : [],
        });

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
            .from("contact_persons")
            .select("id, name, contact_no1, contact_no2, email")
            .eq("customer_id", customerId);

          if (error) throw error;
          customerContacts = data || [];
        }

        // Fetch the default contact person (id=1)
        const { data: defaultData, error: defaultError } = await supabase
          .from("contact_persons")
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

        this.addressOptions = addresses.filter(
          (address, index, self) =>
            index === self.findIndex((c) => c.id === address.id)
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
          .from("drivers")
          .select("id, name, contact_no1");

        if (error) {
          throw error;
        }

        // Map drivers into the format required for the dropdowns
        this.driverOptions = data.map((driver) => ({
          id: driver.id,
          name: driver.name,
          label: `${driver.name} - ${driver.contact_no1 || ""}`,
        }));

        console.log("Loaded Drivers:", this.driverOptions);
      } catch (error) {
        console.error("Error loading drivers:", error);
      }
    },

    async loadTimeOptions() {
      try {
        const { data, error } = await supabase
          .from("time_options")
          .select("time");

        if (error) {
          console.error("Error fetching time options:", error);
          return;
        }

        // Map and sort time options alphabetically
        this.timeOptions = data
          .map((option) => ({
            label: option.time,
            value: option.time,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        console.log("Sorted Time Options:", this.timeOptions);
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
          .from("contact_persons")
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

    // Generate order number only if it has not been set manually
    async generateOrderNo() {
      try {
        // If order number was manually set, skip generation
        if (this.isOrderNoManuallySet) {
          console.log("Order number was manually set. Skipping generation.");
          return;
        }

        const date = new Date();
        const formattedDate = `${String(date.getFullYear()).slice(-2)}${String(
          date.getMonth() + 1
        ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;

        const systemAccess = await this.SetUserProfile();
        if (!systemAccess) throw new Error("Unable to retrieve system access");

        const lastOrderForToday = await getLastOrderIdForDate(formattedDate);
        const newOrderId = lastOrderForToday
          ? parseInt(lastOrderForToday.slice(-2)) + 1
          : 1;

        this.orderNo = `CC-${formattedDate}${systemAccess}${String(
          newOrderId
        ).padStart(2, "0")}`;
      } catch (error) {
        console.error("Error generating Order No:", error);
      }
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
      this.selectedCustomer = "";
      this.selectedDeliveryContact = "";
      this.selectedCollectionContact = "";
      this.selectedDeliveryAddress = "";
      this.selectedCollectionAddress = "";
      this.selectedCollectionDriver = "";
      this.selectedDeliveryDriver = "";
      this.collectionTime = "";
      this.deliveryTime = "";
      this.collectionDate = "";
      this.deliveryDate = "";
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
          .from("error_reports")
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
          .from("error_reports")
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

    async saveTransaction(
      collectionDateFrom,
      collectionDateTo,
      deliveryDateFrom,
      deliveryDateTo
    ) {
      try {
        // Insert Delivery Details
        const { data: deliveryData, error: deliveryError } = await supabase
          .from("deliveries")
          .insert([
            {
              contact_person_id: this.selectedDeliveryContact?.id || null,
              address: this.selectedDeliveryAddress?.label || null,
              delivery_date: this.deliveryDate,
              delivery_time: this.deliveryTime?.value || "",
              remarks: this.deliveryRemarks,
              driver_id: this.selectedDeliveryDriver?.id || null,
              status: '-'
            },
          ])
          .select("id, delivery_date, delivery_time, remarks")
          .single();

        if (deliveryError) throw deliveryError;

        // Insert Collection Details
        const { data: collectionData, error: collectionError } = await supabase
          .from("collections")
          .insert([
            {
              customer_id: this.selectedCustomer?.id || null,
              contact_person_id: this.selectedCollectionContact?.id || null,
              address: this.selectedCollectionAddress?.label || null,
              collection_date: this.collectionDate,
              collection_time: this.collectionTime?.value || "",
              remarks: this.collectionRemarks,
              driver_id: this.selectedCollectionDriver?.id || null,
              status: 'collection arranged'
            },
          ])
          .select("id, collection_date, collection_time, remarks")
          .single();

        if (collectionError) throw collectionError;

        // After inserting into the collections table, update the related deliveries row
        // const { error: updateDeliveryError } = await supabase
        //   .from("deliveries")
        //   .update({ collection_id: collectionData.id })
        //   .eq("id", deliveryData.id);

        // if (updateDeliveryError) throw updateDeliveryError;

        // Insert Order
        const currentTimestamp = new Date().toISOString();
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert([
            {
              order_no: this.orderNo,
              collection_id: collectionData.id,
              delivery_id: deliveryData.id,
              customer_id: this.selectedCustomer?.id || null,
              order_date_time: currentTimestamp,
              goods_status: "none",
              logistics_status: "collection arranged",
              payment_status: "unpaid",
              job_type: "-",
              job_subtype: "-",
              no_packets_hangers: "-",
            },
          ])
          .select("id, order_no, ready_by, collection_id, delivery_id")
          .single();

        if (orderError) throw orderError;

        const orderId = orderData.id;
        const orderNo = orderData.order_no;

                // After inserting into the orders table, update the order no in the collections table
        const { error: updateCollectionsError } = await supabase
          .from("collections")
          .update({ order_no: orderData.order_no })
          .eq("id", orderData.collection_id);

        if (updateCollectionsError) throw updateCollectionsError;

        // Insert Transaction Items
        for (const item of this.transactionItems) {
          const itemData = {
            item_name: item.name,
            order_id: orderId,
            price: item.price,
            process: item.process,
            pieces: item.pieces,
            quantity: item.quantity,
            subtotal: item.subtotal,
            category: item.category,
            tag_category: item.tag_category,
          };
          const { error: itemError } = await supabase
            .from("transactions")
            .insert(itemData);
          if (itemError) throw itemError;
        }

        // Insert Instructions
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

        // Insert Error Reports with File Upload
        for (const report of this.reports) {
          let uploadedFileUrl = null;

          if (report.image) {
            try {
              // Extract MIME type and Base64 data
              const [meta, base64Data] = report.image.split(",");
              const mimeType = meta.match(/:(.*?);/)[1]; // Extract MIME type dynamically

              // Validate allowed MIME types
              const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg"];
              if (!allowedMimeTypes.includes(mimeType)) {
                console.error(`Unsupported file type: ${mimeType}`);
                continue;
              }

              // Convert Base64 to Blob
              const byteCharacters = atob(base64Data);
              const byteArray = new Uint8Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteArray[i] = byteCharacters.charCodeAt(i);
              }
              const blob = new Blob([byteArray], { type: mimeType });

              // Generate a unique file name with the correct extension
              const fileExtension = mimeType.split("/")[1]; // e.g., "jpeg" or "png"
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

              // Upload the file to Supabase storage
              const { data: uploadData, error: uploadError } =
                await supabase.storage
                  .from("error_report_images") // Replace with your bucket name
                  .upload(fileName, blob, {
                    cacheControl: "3600", // Cache for 1 hour
                    upsert: false, // Avoid overwriting existing files
                  });

              if (uploadError)
                throw new Error(`File upload failed: ${uploadError.message}`);

              // Check if the file was uploaded successfully
              if (!uploadData || !uploadData.path) {
                throw new Error(
                  "File upload succeeded but no path was returned."
                );
              }

              // Get the public URL of the uploaded file
              const { data: publicUrlData, error: urlError } = supabase.storage
                .from("error_report_images")
                .getPublicUrl(uploadData.path);

              if (urlError)
                throw new Error(
                  `Public URL retrieval failed: ${urlError.message}`
                );

              // Check if the public URL is valid
              if (!publicUrlData || !publicUrlData.publicUrl) {
                throw new Error(
                  "Public URL retrieval succeeded but no URL was returned."
                );
              }

              uploadedFileUrl = publicUrlData.publicUrl;
            } catch (uploadError) {
              console.error("Error during file upload:", uploadError);
              continue; // Skip this report if upload fails
            }
          }

          // Insert the report into the error_reports table
          try {
            const reportData = {
              description: report.description,
              category: report.category,
              sub_category: report.sub_category,
              // order_id: orderId,
              image: uploadedFileUrl, // Insert the uploaded image URL here
            };

            reportData.order_id = orderId;

            const { error: reportError } = await supabase
              .from("error_reports")
              .insert(reportData);
            if (reportError)
              throw new Error(
                `Failed to insert report into error_reports: ${reportError.message}`
              );
          } catch (insertError) {
            console.error(
              "Error inserting report into error_reports:",
              insertError
            );
          }
        }

        // Reset transaction data after successful save
        this.resetTransactionItems();

        return orderNo; // Return the order ID for further use
      } catch (error) {
        console.error("Error in saveTransaction:", error);
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

    // Fetch transaction items by order ID
    async fetchTransactionItemsByOrderId(orderId) {
      try {
        const { data: items, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("order_id", orderId);

        if (error) {
          console.error("Error fetching transaction items:", error);
          return [];
        }

        return items;
      } catch (error) {
        console.error("Unexpected error fetching transaction items:", error);
        return [];
      }
    },

    // Fetch contact person details by contact person ID
    async fetchContactPersonById(contactPersonId) {
      try {
        const { data: contactPerson, error } = await supabase
          .from("contact_persons")
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

    async setSelectedCustomer(customer) {
      this.selectedCustomer = customer;

      // Load addresses and contact persons for the selected customer
      try {
        this.addressOptions = await this.loadAddressOptions(customer.id);
        this.contactPersons = await fetchContactPersons(customer.id);
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
          remarks: customer.remarks,
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
          .from("contact_persons")
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
      try {
        const { data, error } = await supabase
          .from("contact_persons")
          .select("*")
          .eq("customer_id", customerId);

        if (error) throw error;

        return data || [];
      } catch (error) {
        console.error("Error fetching contact persons:", error);
        return [];
      }
    },

    async fetchOrderDetailsByOrderNo(orderNo) {
      try {
        // Query orders with related tables
        const { data: orderDetails, error } = await supabase
          .from("orders")
          .select(
            `
            *,
            transactions (
              *
            ),
            error_reports (
              *
            ),
            instructions_onetime (
              *
            ),
            customers (
              *,
              customer_address (*),
              instructions_recurring (*)
            ),
            collections (
              *,
              contact_persons (*)
            ),
            deliveries (
              *,
              contact_persons (*)
            )
          `
          )
          .eq("order_no", orderNo) // Filter by order_no
          .single(); // Expecting only one result

        // Handle potential errors
        if (error) throw error;

        // Return transformed data
        return {
          order: {
            id: orderDetails.id,
            order_no: orderDetails.order_no,
            ready_by: orderDetails.ready_by,
            order_date_time: orderDetails.order_date_time,
            payment_status: orderDetails.payment_status,
            goods_status: orderDetails.goods_status,
            logistics_status: orderDetails.logistics_status,
            job_type: orderDetails.job_type,
            job_subtype: orderDetails.job_subtype,
            no_packets_hangers: orderDetails.no_packets_hangers,
          },
          transactions: orderDetails.transactions || [],
          errorReports: orderDetails.error_reports || [],
          instructionsOneTime: orderDetails.instructions_onetime || [],
          instructionsRecurring:
            orderDetails.customers?.instructions_recurring || [],
          customer: {
            id: orderDetails.customers.id,
            name: orderDetails.customers.name,
            type: orderDetails.customers.type,
            contact_no1: orderDetails.customers.contact_no1,
            contact_no2: orderDetails.customers.contact_no2,
            email: orderDetails.customers.email,
            remarks: orderDetails.customers.remarks,
            payment_type: orderDetails.customers.payment_type,
            addresses: orderDetails.customers.customer_address || [],
          },
          collection: {
            id: orderDetails.collections?.id,
            address: orderDetails.collections?.address,
            area: orderDetails.collections?.area,
            status: orderDetails.collections?.status,
            remarks: orderDetails.collections?.remarks,
            collection_date: orderDetails.collections?.collection_date || null,
            contactPerson: orderDetails.collections?.contact_persons || null,
          },
          delivery: {
            id: orderDetails.deliveries?.id,
            address: orderDetails.deliveries?.address,
            area: orderDetails.deliveries?.area,
            status: orderDetails.deliveries?.status,
            remarks: orderDetails.deliveries?.remarks,
            delivery_date: orderDetails.deliveries?.delivery_date || null,
            contactPerson: orderDetails.deliveries?.contact_persons || null,
          },
        };
      } catch (error) {
        console.error("Error fetching order details by order_no:", error);
        throw error;
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
        const { data, error } = await supabase.from("contact_persons").insert({
          ...contactPerson,
          customer_id: this.selectedCustomer.id, // Associate with selected customer
        });

        if (error) throw error;

        // Reload contact persons to include the new one
        this.contactPersons = await this.fetchContactPersons(
          this.selectedCustomer.id
        );
        console.log("Contact person added successfully:", data);
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
              } (${defaultAddress?.additional_info || ""})`,
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
              } (${defaultAddress?.additional_info || ""})`,
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
    async updateCollectionAndDelivery(
      orderNo,
      collectionPayload,
      deliveryPayload
    ) {
      try {
        // Fetch the order details to get collection and delivery IDs
        const { data: orderDetails, error: fetchError } = await supabase
          .from("orders")
          .select("id, collection_id, delivery_id")
          .eq("order_no", orderNo)
          .single();

        if (fetchError || !orderDetails) {
          throw new Error("Order not found or failed to fetch order details.");
        }

        const { id: orderId, collection_id, delivery_id } = orderDetails;

        // Update collection details if collection ID exists
        if (collection_id) {
          const { error: collectionError } = await supabase
            .from("collections")
            .update({
              contact_person_id: collectionPayload.contact_person_id,
              address: collectionPayload.address,
              collection_date: collectionPayload.collection_date,
            })
            .eq("id", collection_id);

          if (collectionError) {
            throw new Error("Failed to update collection details.");
          }
        }

        // Update delivery details if delivery ID exists
        if (delivery_id) {
          const { error: deliveryError } = await supabase
            .from("deliveries")
            .update({
              contact_person_id: deliveryPayload.contact_person_id,
              address: deliveryPayload.address,
              delivery_date: deliveryPayload.delivery_date,
            })
            .eq("id", delivery_id);

          if (deliveryError) {
            throw new Error("Failed to update delivery details.");
          }
        }

        console.log("Collection, and Delivery details updated successfully.");
        return true; // Indicate success
      } catch (error) {
        console.error("Error updating details:", error);
        throw error; // Re-throw for higher-level handling
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
          .from("transactions") // Replace with your actual table name
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
    async updateTransaction(transaction) {
      try {
        // Ensure transaction has an ID before updating
        if (!transaction.id) {
          throw new Error("Transaction ID is required for updates.");
        }

        // Prepare the payload with the updated fields
        const payload = {
          item_name: transaction.item_name,
          process: transaction.process,
          price: transaction.price,
          pieces: transaction.pieces,
          quantity: transaction.quantity,
          subtotal: transaction.subtotal,
        };

        // Perform the update in the database
        const { error } = await supabase
          .from("transactions")
          .update(payload)
          .eq("id", transaction.id);

        if (error) {
          throw error;
        }

        console.log(
          `Transaction with ID ${transaction.id} updated successfully.`
        );
      } catch (error) {
        console.error("Error updating transaction:", error);
        throw error; // Rethrow to handle in the caller
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
          .from("customer_types")
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
    async fetchDatesByOrderId(orderId) {
      try {
        const { data, error } = await supabase
          .from("orders") // Start from the 'orders' table
          .select(
            `
            collections(collection_date), 
            deliveries(delivery_date)
          `
          )
          .eq("id", orderId)
          .single();

        if (error) throw error;

        // Extract collection_date and delivery_date safely
        return {
          collectionDate: data.collections?.collection_date || "N/A",
          deliveryDate: data.deliveries?.delivery_date || "N/A",
        };
      } catch (error) {
        console.error("Error fetching dates:", error);
        return { collectionDate: "N/A", deliveryDate: "N/A" };
      }
    },
    async fetchAllCollections() {
      try {
        const { data, error } = await supabase.from("collections").select(`
            id,
            created_at,
            driver_id,
            status,
            area,
            remarks,
            contact_person_id,
            address,
            date_collected,
            collection_date,
            delivery_id,
            customer_id,
            order_no,
            customers (
                id,
                name,
                contact_no1,
                contact_no2,
                email,
                type,
                sub_type
              ),
            contact_persons (
              id,
              name,
              
            ),
            drivers (
              id,
              name,
              contact_no1
            )
          `);

        if (error) {
          throw error;
        }

        // Transform data to include related customer and driver details
        const formattedData = data.map((collection) => ({
          id: collection.id,
          created_at: collection.created_at,
          driver_id: collection.driver_id,
          status: collection.status,
          remarks: collection.remarks,
          contact_person_id: collection.contact_person_id,
          address: collection.address,
          date_collected: collection.date_collected,
          collection_date: collection.collection_date,
          delivery_id: collection.delivery_id,
          customer_id: collection.customer_id,
          order_no: collection.order_no,
          customer: collection.customers
            ? {
                id: collection.customers.id,
                name: collection.customers.name,
                contact_no1: collection.customers.contact_no1,
                contact_no2: collection.customers.contact_no2,
                email: collection.customers.email,
                type: collection.customers.type,
                sub_type: collection.customers.sub_type,
              }
            : null,
          contact_person: collection.contact_persons
            ? {
                id: collection.contact_persons.id,
                name: collection.contact_persons.name,
              }
            : null,
          driver: collection.drivers
            ? {
                id: collection.drivers.id,
                name: collection.drivers.name,
              }
            : null,
        }));

        console.log("Fetched Collections with Drivers:", formattedData);
        return formattedData || [];
      } catch (error) {
        console.error("Error fetching collections:", error);
        return [];
      }
    },
    async fetchAllDeliveries() {
      try {
        const { data, error } = await supabase.from("deliveries").select(`
            id,
            created_at,
            driver_id,
            status,
            area,
            remarks,
            contact_person_id,
            address,
            date_delivered,
            delivery_date,
            contact_persons (
              id,
              name,
              customer_id,
              customers (
                id,
                name,
                contact_no1,
                contact_no2,
                email,
                type,
                sub_type
              )
            ),
            drivers (
              id,
              name,
              contact_no1
            )
          `);

        if (error) {
          throw error;
        }

        // Transform data to include related customer and driver details
        const formattedData = data.map((delivery) => ({
          id: delivery.id,
          created_at: delivery.created_at,
          driver_id: delivery.driver_id,
          status: delivery.status,
          remarks: delivery.remarks,
          contact_person_id: delivery.contact_person_id,
          address: delivery.address,
          date_delivered: delivery.date_delivered,
          delivery_date: delivery.delivery_date,
          contact_person: delivery.contact_persons
            ? {
                id: delivery.contact_persons.id,
                name: delivery.contact_persons.name,
              }
            : null,
          customer: delivery.contact_persons?.customers
            ? {
                id: delivery.contact_persons.customers.id,
                name: delivery.contact_persons.customers.name,
                contact_no1: delivery.contact_persons.customers.contact_no1,
                contact_no2: delivery.contact_persons.customers.contact_no2,
                email: delivery.contact_persons.customers.email,
                type: delivery.contact_persons.customers.type,
                sub_type: delivery.contact_persons.customers.sub_type,
              }
            : null,
          driver: delivery.drivers
            ? {
                id: delivery.drivers.id,
                name: delivery.drivers.name,
              }
            : null,
        }));

        console.log("Fetched Deliveries with Drivers:", formattedData);
        return formattedData || [];
      } catch (error) {
        console.error("Error fetching deliveries:", error);
        return [];
      }
    },
    // Map through all collections and return an array
    async fetchCollectionsDeliveries() {
      try {
        const { data: collections, error } = await supabase
          .from("collections")
          .select(
            `
            id,
            created_at,
            driver_id,
            status,
            area,
            remarks,
            contact_person_id,
            address,
            date_collected,
            collection_date,
            delivery_id,
            customer_id,
            order_no,
            customers (
                id,
                name,
                contact_no1,
                contact_no2,
                email,
                type,
                sub_type
              ),
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
          email,
          remarks
        ),
        deliveries (
          id,
          address,
          area,
          status,
          remarks,
          delivery_date,
          delivery_time,
          driver_id,
          contact_person_id,
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
            email,
            remarks
          )
        )
      `
          );

        if (error) {
          throw new Error(
            `Error fetching collection details: ${error.message}`
          );
        }

        if (!collections) {
          console.warn("No collections found");
          return [];
        }

        // Transform the array of collections
        return collections.map((collection) => ({
          id: collection.id,
          created_at: collection.created_at,
          driver_id: collection.driver_id,
          status: collection.status,
          remarks: collection.remarks,
          contact_person_id: collection.contact_person_id,
          address: collection.address,
          date_collected: collection.date_collected,
          collection_date: collection.collection_date,
          delivery_id: collection.delivery_id,
          customer_id: collection.customer_id,
          order_no: collection.order_no,
          customer: collection.customers
            ? {
                id: collection.customers.id,
                name: collection.customers.name,
                contact_no1: collection.customers.contact_no1,
                contact_no2: collection.customers.contact_no2,
                email: collection.customers.email,
                type: collection.customers.type,
                sub_type: collection.customers.sub_type,
              }
            : null,
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
                remarks: collection.contact_persons.remarks,
              }
            : null,
          delivery: collection.deliveries
            ? {
                id: collection.deliveries.id,
                address: collection.deliveries.address,
                area: collection.deliveries.area,
                status: collection.deliveries.status,
                remarks: collection.deliveries.remarks,
                delivery_date: collection.deliveries.delivery_date,
                delivery_time: collection.deliveries.delivery_time,
                driver: collection.deliveries.drivers
                  ? {
                      id: collection.deliveries.drivers.id,
                      name: collection.deliveries.drivers.name,
                      contact_no1: collection.deliveries.drivers.contact_no1,
                    }
                  : null,
                contact_person: collection.deliveries.contact_persons
                  ? {
                      id: collection.deliveries.contact_persons.id,
                      name: collection.deliveries.contact_persons.name,
                      contact_no1:
                        collection.deliveries.contact_persons.contact_no1,
                      contact_no2:
                        collection.deliveries.contact_persons.contact_no2,
                      email: collection.deliveries.contact_persons.email,
                      remarks: collection.deliveries.contact_persons.remarks,
                    }
                  : null,
              }
            : null,
        }));
      } catch (error) {
        console.error("Unexpected error fetching collections:", error);
        return [];
      }
    },

    async fetchCollectionsDeliveriesById(collectionId) {
      try {
        // Query collections with related tables, including drivers and contact_persons for deliveries
        const { data: collection, error } = await supabase
          .from("collections")
          .select(
            `
            *,
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
              email,
              remarks,
              customer_id,
              customers (
                id,
                name,
                contact_no1,
                contact_no2,
                email,
                remarks,
                payment_type
              )
            ),
            deliveries (
              id,
              address,
              area,
              status,
              remarks,
              delivery_date,
              delivery_time,
              driver_id,
              contact_person_id,
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
                email,
                remarks
              )
            )
          `
          )
          .eq("id", collectionId)
          .single(); // Fetch a single collection

        if (error) {
          throw new Error(
            `Error fetching collection details: ${error.message}`
          );
        }

        if (!collection) {
          console.warn(`No collection found with ID: ${collectionId}`);
          return null;
        }

        // Transform data for easy use in the frontend
        return {
          id: collection.id,
          collection_date: collection.collection_date,
          collection_time: collection.collection_time,
          address: collection.address,
          area: collection.area,
          status: collection.status,
          remarks: collection.remarks,
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
                remarks: collection.contact_persons.remarks,
              }
            : null,
          customer: collection.contact_persons?.customers
            ? {
                id: collection.contact_persons.customers.id,
                name: collection.contact_persons.customers.name,
                contact_no1: collection.contact_persons.customers.contact_no1,
                contact_no2: collection.contact_persons.customers.contact_no2,
                email: collection.contact_persons.customers.email,
                remarks: collection.contact_persons.customers.remarks,
                payment_type: collection.contact_persons.customers.payment_type,
              }
            : null,
          delivery: collection.deliveries
            ? {
                id: collection.deliveries.id,
                address: collection.deliveries.address,
                area: collection.deliveries.area,
                status: collection.deliveries.status,
                remarks: collection.deliveries.remarks,
                delivery_date: collection.deliveries.delivery_date,
                delivery_time: collection.deliveries.delivery_time,
                driver: collection.deliveries.drivers
                  ? {
                      id: collection.deliveries.drivers.id,
                      name: collection.deliveries.drivers.name,
                      contact_no1: collection.deliveries.drivers.contact_no1,
                    }
                  : null,
                contact_person: collection.deliveries.contact_persons
                  ? {
                      id: collection.deliveries.contact_persons.id,
                      name: collection.deliveries.contact_persons.name,
                      contact_no1:
                        collection.deliveries.contact_persons.contact_no1,
                      contact_no2:
                        collection.deliveries.contact_persons.contact_no2,
                      email: collection.deliveries.contact_persons.email,
                      remarks: collection.deliveries.contact_persons.remarks,
                    }
                  : null,
              }
            : null,
        };
      } catch (error) {
        console.error("Unexpected error fetching collection by ID:", error);
        return null;
      }
    },

    async createCollection(
      collectionDateFrom,
      collectionDateTo,
      deliveryDateFrom,
      deliveryDateTo
    ) {
      try {
        // Insert Delivery Details
        const { data: deliveryData, error: deliveryError } = await supabase
          .from("deliveries")
          .insert([
            {
              contact_person_id: this.selectedDeliveryContact?.id || null,
              address: this.selectedDeliveryAddress?.label || null,
              delivery_date: this.deliveryDate,
              delivery_time: this.deliveryTime?.value || null,
              remarks: this.deliveryRemarks,
              driver_id: this.selectedDeliveryDriver?.id || null,
              status: "-",
            },
          ])
          .select("id, delivery_date, delivery_time, remarks")
          .single();

        if (deliveryError) throw deliveryError;

        // Insert Collection Details
        const { data: collectionData, error: collectionError } = await supabase
          .from("collections")
          .insert([
            {
              customer_id: this.selectedCustomer?.id || null,
              contact_person_id: this.selectedCollectionContact?.id || null,
              address: this.selectedCollectionAddress?.label || null,
              collection_date: this.collectionDate,
              collection_time: this.collectionTime?.value || null,
              remarks: this.collectionRemarks,
              driver_id: this.selectedCollectionDriver?.id || null,
              delivery_id: deliveryData.id,
              status: "collection arranged",
            },
          ])
          .select("id, collection_date, collection_time, remarks")
          .single();

        if (collectionError) throw collectionError;

        // After inserting into the collections table, update the related deliveries row
        //    const { error: updateDeliveryError } = await supabase
        //    .from("deliveries")
        //    .update({ collection_id: collectionData.id })
        //    .eq("id", deliveryData.id);

        //  if (updateDeliveryError) throw updateDeliveryError;
      } catch (error) {
        console.error("Error in create collection:", error);
      }
    },
  },
});
