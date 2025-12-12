import { supabase } from '../config.js';

// Fetch all customers
export async function fetchAllCustomers() {
  const { data: customers, error } = await supabase
    .from("customers")
    .select(`
      *,
      customer_credits(*),
      logistics (
        id,
        logistics_status,
        order_id,
        orders (
          id,
          created_at,
          order_no,
          order_payments(total_amount, paid_amount)
        )
      )
    `);

  if (error) throw new Error(error.message);

  return customers.map(c => {
    let totalAmount = 0;
    let totalPaid = 0;
    const orderIds = new Set();
    const activeOrderIds = new Set();
    let lastOrderDate = null;
    let lastOrderNo = null;

    c.logistics?.forEach(l => {
      const order = l.orders;
      if (order?.order_no) {
        orderIds.add(order.order_no);

        if (order.created_at) {
          const orderDate = new Date(order.created_at);
          if (!lastOrderDate || orderDate > new Date(lastOrderDate)) {
            lastOrderDate = orderDate;
            lastOrderNo = order.order_no;
          }
        }

        // check payments
        order.order_payments?.forEach(p => {
          totalAmount += p.total_amount ?? 0;
          totalPaid += p.paid_amount ?? 0;
        });

        // active orders via logistics status
        if (l.logistics_status !== "Delivery Completed") {
          activeOrderIds.add(order.id);
        }
      }
    });

    return {
      ...c,
      total_amount: totalAmount,
      paid_amount: totalPaid,
      orders_count: orderIds.size,
      active_orders_count: activeOrderIds.size,
      last_order_date: lastOrderDate,
      last_order_no: lastOrderNo,
    };
  });
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
