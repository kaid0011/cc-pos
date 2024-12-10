import { supabase } from '../config.js';

// Fetch all customers
export async function fetchAllCustomers() {
  let { data: customers, error } = await supabase
    .from('customers')
    .select('*');
  if (error) throw new Error(error.message);
  return customers;
}

// Create a new customer and return the inserted data
export async function createCustomer(customer) {
  try {
    // Insert customer and return the inserted data, including the ID
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select(); // Ensure .select() is used to get the inserted row data

    if (error) {
      console.error("Error creating customer:", error.message);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      console.error("Failed to insert customer or retrieve ID.");
      throw new Error("Customer insertion failed.");
    }

    console.log("Customer created successfully:", data[0]);
    return data[0]; // Return the first inserted customer object, which includes the ID
  } catch (err) {
    console.error("Unexpected error during customer creation:", err);
    throw err;
  }
}


// Update an existing customer
export async function updateCustomers(customer) {
  const { data, error } = await supabase
    .from('customers')
    .update(customer)
    .match({ id: customer.id });
  if (error) throw new Error(error.message);
  return data;
}

// Delete a customer
export async function deleteCustomers(customerId) {
  const { data, error } = await supabase
    .from('customers')
    .delete()
    .match({ id: customerId });
  if (error) throw new Error(error.message);
  return data;
}
