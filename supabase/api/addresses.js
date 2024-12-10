import { supabase } from '../config.js';

// Fetch all addresses for a specific customer
export const fetchAddresses = async (customerId) => {
  try {
    const { data: addresses, error } = await supabase
      .from('customer_address')
      .select('*')
      .eq('customer_id', customerId);

    if (error) {
      console.error('Error fetching addresses:', error.message);
      return [];
    }
    return addresses;
  } catch (error) {
    console.error('Unexpected error fetching addresses:', error.message);
    return [];
  }
};

// Fetch addresses by customer ID
export async function fetchAddressesByCustomerId(customerId) {
  try {
    const { data, error } = await supabase
      .from('customer_address')
      .select('*')
      .eq('customer_id', customerId);

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error fetching addresses by customer ID:', error.message);
    return [];
  }
}

// Create a new address
export async function createCustomerAddress(address) {
  try {
    const { data, error } = await supabase
      .from('customer_address')
      .insert([address]);

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error creating address:', error.message);
    throw error;
  }
}

// Update an existing address
export async function updateCustomerAddress(address) {
  try {
    const { data, error } = await supabase
      .from('customer_address')
      .update({ address: address.address })
      .match({ id: address.id });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error updating address:', error.message);
    throw error;
  }
}

// Delete an address
export async function deleteCustomerAddress(addressId) {
  try {
    const { data, error } = await supabase
      .from('customer_address')
      .delete()
      .match({ id: addressId });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error deleting address:', error.message);
    throw error;
  }
}
