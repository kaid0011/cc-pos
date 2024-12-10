import { supabase } from '../config.js';

// Fetch all orders from the database
export const fetchAllOrders = async () => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*');
    if (error) {
      console.error('Error fetching orders:', error.message);
      return [];
    }
    return orders;
  } catch (error) {
    console.error('Unexpected error fetching orders:', error.message);
    return [];
  }
};

// Fetch the latest order ID for a specific date
export async function getLastOrderIdForDate(formattedDate) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('order_no')
      .like('order_no', `CC-${formattedDate}%`) // Matches today’s date prefix
      .order('order_no', { ascending: false })
      .limit(1);

    if (error) throw error;

    // If there is an order today, return the last order_no
    return data.length ? data[0].order_no : null;
  } catch (error) {
    console.error('Error fetching last order for today:', error.message);
    return null;
  }
}
