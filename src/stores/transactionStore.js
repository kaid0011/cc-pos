import { supabase } from "@/../supabase/config.js";
import { defineStore } from "pinia";
import { fetchAllItems } from "@/../supabase/api/item_list.js";
import { getLastOrderIdForDate } from "@/../supabase/api/orders.js";
import { fetchAllCustomers } from "@/../supabase/api/customers.js";
import { fetchContactPersons } from "@/../supabase/api/contacts.js";
import { reactive } from "vue";

export const useTransactionStore = defineStore("transactionStore", {
  state: () => ({
    transactionItems: [],
    instructions: [],
    reports: [],
    items: [],
    customers: [],
    selectedCustomer: "",
    contactPersons: [],
    addressOptions: [], // Address options for dropdowns
    selectedDeliveryContact: "", // Selected delivery contact
    selectedCollectionContact: "", // Selected collection contact
    selectedCollectionAddress: "", // Selected collection address
    selectedDeliveryAddress: "", // Selected delivery address
    orderNo: "",
    readyBy: "",
    addresses: "",
    isOrderNoManuallySet: false,
    collectionDateFrom: null, // Reactive collection date "from"
  collectionDateTo: null,   // Reactive collection date "to"
  deliveryDateFrom: null,   // Reactive delivery date "from"
  deliveryDateTo: null,     // Reactive delivery date "to"
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
              remarks: newCustomer.remarks || null,
              type: newCustomer.customer_type || null,
            },
          ])
          .select();
    
        if (customerError) throw customerError;
    
        const createdCustomer = customerData[0]; // Retrieve the newly created customer
        if (!createdCustomer) throw new Error("Failed to create customer");
    
        // Step 2: Insert the address into the 'customer_address' table
        if (newCustomer.address) {
          const { error: addressError } = await supabase
            .from("customer_address")
            .insert([
              {
                address: newCustomer.address,
                customer_id: createdCustomer.id, // Link the customer ID
              },
            ]);
    
          if (addressError) throw addressError;
        }
    
        // Step 3: Insert a contact person with the same details as the customer
        const contactPerson = {
          name: createdCustomer.name,
          contact_no1: createdCustomer.contact_no1,
          contact_no2: createdCustomer.contact_no2,
          email: createdCustomer.email,
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
        console.error("Error creating customer with contact person and address:", error);
        throw error;
      }
    },
    
    async loadContactPersons(customerId) {
      try {
        this.contactPersons = await fetchContactPersons(customerId);
      } catch (error) {
        console.error("Error loading contact persons:", error);
      }
    },

    setSelectedCustomer(customer) {
      this.selectedCustomer = customer;
      this.loadContactPersons(customer.id);
      this.selectedDeliveryContact = ""; // Reset delivery contact on new selection
      this.selectedCollectionContact = ""; // Reset collection contact on new selection
    },

    resetSelectedCustomer() {
      this.selectedCustomer = "";
      this.contactPersons = [];
      this.selectedDeliveryContact = "";
      this.selectedCollectionContact = "";
    },

    setSelectedDeliveryContact(contact) {
      this.selectedDeliveryContact = contact;
    },

    setSelectedCollectionContact(contact) {
      this.selectedCollectionContact = contact;
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

    setReadyBy(date) {
      this.readyBy = date;
    },

    addItem(item) {
      const { name, unit, process, price, pieces, quantity, subtotal } = item;
    
      const unitType = this.detectUnitType(unit);
      let newItem;
    
      if (price === 'TBA') {
        // Special handling for TBA price type
        newItem = { name, process, price: 'TBA', pieces, quantity, subtotal: 0, unit };
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
          newItem = { name, process, price, pieces, quantity, subtotal, unit };
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
          newItem = { name, process, price, pieces, quantity, subtotal, unit };
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
      this.readyBy = "";
      this.selectedCustomer = "";
      this.selectedDeliveryContact = "";
      this.selectedCollectionContact = "";
    },

    addInstruction(instruction) {
      this.instructions.push(instruction);
    },

    deleteInstruction(id) {
      this.instructions = this.instructions.filter((inst) => inst.id !== id);
    },

    addReport(report) {
      this.reports.push(report);
    },

    deleteReport(id) {
      this.reports = this.reports.filter((rep) => rep.id !== id);
    },

    async saveTransaction(collectionDateFrom, collectionDateTo, deliveryDateFrom, deliveryDateTo) {
      try {
        // Insert Collection Details
        const { data: collectionData, error: collectionError } = await supabase
          .from("collections")
          .insert([
            {
              contact_person_id: this.selectedCollectionContact?.id || null,
              address: this.selectedCollectionAddress?.address || null,
              date_from: this.collectionDateFrom,
              date_to: this.collectionDateTo,
            },
          ])
          .select("id, date_from, date_to")
          .single();
    
        if (collectionError) throw collectionError;
    
        // Insert Delivery Details
        const { data: deliveryData, error: deliveryError } = await supabase
          .from("deliveries")
          .insert([
            {
              contact_person_id: this.selectedDeliveryContact?.id || null,
              address: this.selectedDeliveryAddress?.address || null,
              date_from: this.deliveryDateFrom,
              date_to: this.deliveryDateTo,
            },
          ])
          .select("id, date_from, date_to")
          .single();
    
        if (deliveryError) throw deliveryError;
    
        // Insert Order
        const currentTimestamp = new Date().toISOString();
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert([
            {
              order_no: this.orderNo,
              ready_by: this.readyBy,
              collection_id: collectionData.id,
              delivery_id: deliveryData.id,
              customer_id: this.selectedCustomer?.id || null,
              order_date_time: currentTimestamp,
              goods_status: "-",
              logistic_status: "-",
              payment_status: "-",
            },
          ])
          .select("id, order_no, ready_by, collection_id, delivery_id")
          .single();
    
        if (orderError) throw orderError;
    
        const orderId = orderData.id;
    
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
          };
          const { error: itemError } = await supabase.from("transactions").insert(itemData);
          if (itemError) throw itemError;
        }
    
        // Insert Instructions
        for (const instruction of this.instructions) {
          const instructionData = {
            description: instruction.desc,
            admin: instruction.to.includes("admin"),
            cleaning: instruction.to.includes("cleaning"),
            packing: instruction.to.includes("packing"),
            picking_sending: instruction.to.includes("pickingsending"),
          };
    
          const table = instruction.type === "onetime" ? "instructions_onetime" : "instructions_recurring";
    
          if (instruction.type === "onetime") {
            instructionData.order_id = orderId;
          } else {
            instructionData.customer_id = this.selectedCustomer?.id || null;
          }
    
          const { error: instructionError } = await supabase.from(table).insert(instructionData);
          if (instructionError) throw instructionError;
        }
    
        // Insert Error Reports with File Upload
// Insert Error Reports with File Upload
for (const report of this.reports) {
  let uploadedFileUrl = null;

  if (report.photo) {
      try {
          // Extract MIME type and Base64 data
          const [meta, base64Data] = report.photo.split(",");
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
          const fileName = `error-report-${Date.now()}.${fileExtension}`;

          // Upload the file to Supabase storage
          const { data: uploadData, error: uploadError } = await supabase.storage
              .from("error_report_images") // Replace with your bucket name
              .upload(fileName, blob, {
                  cacheControl: "3600", // Cache for 1 hour
                  upsert: false,        // Avoid overwriting existing files
              });

          if (uploadError) throw new Error(`File upload failed: ${uploadError.message}`);

          // Check if the file was uploaded successfully
          if (!uploadData || !uploadData.path) {
              throw new Error("File upload succeeded but no path was returned.");
          }

          // Get the public URL of the uploaded file
          const { data: publicUrlData, error: urlError } = supabase.storage
              .from("error_report_images")
              .getPublicUrl(uploadData.path);

          if (urlError) throw new Error(`Public URL retrieval failed: ${urlError.message}`);

          // Check if the public URL is valid
          if (!publicUrlData || !publicUrlData.publicUrl) {
              throw new Error("Public URL retrieval succeeded but no URL was returned.");
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
          description: report.desc,
          category: report.category,
          sub_category: report.subCategory,
          order_id: orderId,
          image: uploadedFileUrl, // Insert the uploaded image URL here
      };

      const { error: reportError } = await supabase.from("error_reports").insert(reportData);
      if (reportError) throw new Error(`Failed to insert report into error_reports: ${reportError.message}`);
  } catch (insertError) {
      console.error("Error inserting report into error_reports:", insertError);
  }
}

    
        // Reset transaction data after successful save
        this.resetTransactionItems();
      } catch (error) {
        console.error("Error in saveTransaction:", error);
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

    // Fetch collection details by collection ID
    async fetchCollectionDetailsById(collectionId) {
      try {
        const { data: collection, error } = await supabase
          .from("collections")
          .select("*")
          .eq("id", collectionId)
          .single();

        if (error) {
          console.error("Error fetching collection details:", error);
          return null;
        }

        return collection;
      } catch (error) {
        console.error("Unexpected error fetching collection details:", error);
        return null;
      }
    },

    // Fetch delivery details by delivery ID
    async fetchDeliveriesDetailsById(deliveryId) {
      try {
        const { data: delivery, error } = await supabase
          .from("deliveries")
          .select("*")
          .eq("id", deliveryId)
          .single();

        if (error) {
          console.error("Error fetching delivery details:", error);
          return null;
        }

        return delivery;
      } catch (error) {
        console.error("Unexpected error fetching delivery details:", error);
        return null;
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

    async loadAddressOptions(customerId) {
      try {
        const { data, error } = await supabase
          .from("customer_address")
          .select("id, address")
          .eq("customer_id", customerId);

        if (error) throw error;

        // Map addresses to a suitable format for dropdowns
        return data.map((address) => ({
          id: address.id,
          address: address.address,
        }));
      } catch (error) {
        console.error("Error loading address options:", error);
        return [];
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
        const { data, error } = await supabase
          .from("customer_address")
          .select("id, address")
          .eq("customer_id", customerId);

        if (error) throw error;

        return data || [];
      } catch (error) {
        console.error("Error fetching addresses:", error);
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
          remarks: customer.remarks,
        })
        .eq("id", customer.id);

      if (error) throw error;
    },
    async updateCustomer(customer) {
      console.log("Updating customer:", customer);
      const { error } = await supabase
        .from("customers")
        .update({
          name: customer.name,
          contact_no1: customer.contact_no1,
          contact_no2: customer.contact_no2,
          email: customer.email,
          remarks: customer.remarks,
        })
        .eq("id", customer.id);

      if (error) throw error;
    },
    async updateCustomerAddress(address) {
      try {
        const { error } = await supabase
          .from("customer_address")
          .update({ address: address.address })
          .eq("id", address.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error updating address:", error);
        throw error;
      }
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

        // Insert new address into the `customer_addresses` table
        const { data, error } = await supabase
          .from("customer_address")
          .insert({
            address: newAddress.address,
            customer_id: this.selectedCustomer.id, // Associate with selected customer
          });

        if (error) throw error;

        // Reload address options to include the new address
        this.addressOptions = await this.fetchAddressesForCustomer(this.selectedCustomer.id);
        console.log("Address added successfully:", data);
      } catch (error) {
        console.error("Error adding address:", error);
        throw error; // Re-throw to handle errors in the UI if needed
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
    async deleteCustomerAddress(addressId) {
      try {
        const { error } = await supabase
          .from("customer_address")
          .delete()
          .eq("id", addressId);

        if (error) throw error;
      } catch (error) {
        console.error("Error deleting address:", error);
        throw error;
      }
    },
    resetItems() {
      this.transactionItems = [];
    },

    setReadyBy(date) {
      this.readyBy = date;
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

    async fetchAddressesForCustomer(customerId) {
      try {
        const { data, error } = await supabase
          .from("customer_address")
          .select("id, address")
          .eq("customer_id", customerId);

        if (error) throw error;

        return data || [];
      } catch (error) {
        console.error("Error fetching addresses:", error);
        return [];
      }
    },
    setSelectedCollectionContact(contact) {
      this.selectedCollectionContact = contact;
    },

    setSelectedCollectionAddress(address) {
      this.selectedCollectionAddress = address;
    },

    setSelectedDeliveryContact(contact) {
      this.selectedDeliveryContact = contact;
    },

    setSelectedDeliveryAddress(address) {
      this.selectedDeliveryAddress = address;
    },
 
    async fetchOrderDetailsByOrderNo(orderNo) {
      try {
        // Query orders with related tables
        const { data: orderDetails, error } = await supabase
          .from("orders")
          .select(`
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
          `)
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
            logistic_status: orderDetails.logistic_status,
          },
          transactions: orderDetails.transactions || [],
          errorReports: orderDetails.error_reports || [],
          instructionsOneTime: orderDetails.instructions_onetime || [],
          instructionsRecurring: orderDetails.customers?.instructions_recurring || [],
          customer: {
            id: orderDetails.customers.id,
            name: orderDetails.customers.name,
            type: orderDetails.customers.type,
            contact_no1: orderDetails.customers.contact_no1,
            contact_no2: orderDetails.customers.contact_no2,
            email: orderDetails.customers.email,
            remarks: orderDetails.customers.remarks,
            addresses: orderDetails.customers.customer_address || [],
          },
          collection: {
            id: orderDetails.collections?.id,
            address: orderDetails.collections?.address,
            area: orderDetails.collections?.area,
            status: orderDetails.collections?.status,
            remarks: orderDetails.collections?.remarks,
            date_from: orderDetails.collections?.date_from || null,
        date_to: orderDetails.collections?.date_to || null,
            contactPerson: orderDetails.collections?.contact_persons || null,
          },
          delivery: {
            id: orderDetails.deliveries?.id,
            address: orderDetails.deliveries?.address,
            area: orderDetails.deliveries?.area,
            status: orderDetails.deliveries?.status,
            remarks: orderDetails.deliveries?.remarks,
            date_from: orderDetails.deliveries?.date_from || null,
            date_to: orderDetails.deliveries?.date_to || null,
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
        const { data, error } = await supabase
          .from("contact_persons")
          .insert({
            ...contactPerson,
            customer_id: this.selectedCustomer.id, // Associate with selected customer
          });

        if (error) throw error;

        // Reload contact persons to include the new one
        this.contactPersons = await this.fetchContactPersons(this.selectedCustomer.id);
        console.log("Contact person added successfully:", data);
      } catch (error) {
        console.error("Error adding contact person:", error);
        throw error; // Re-throw to handle errors in the UI if needed
      }
    },
  
  },
});
