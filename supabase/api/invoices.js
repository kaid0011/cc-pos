import { supabase } from '../config.js';

// Function to insert a new invoice
export const insertInvoice = async (order_no, order_date_time, ready_by, status, customer_info) => {
  const { data, error } = await supabase
    .from('invoices')
    .insert([{ order_no, order_date_time, ready_by, status, customer_info }])
    .select();

  if (error) { 
    throw error;
  }

  return data[0];
};

// Function to insert a new customer
export const insertCustomer = async (customerData) => {
  const { data, error } = await supabase
    .from('customers')
    .insert([customerData])
    .select();

  if (error) {
    throw error;
  }

  return data[0];
};


// Function to insert multiple transactions
export const insertTransactions = async (transactionsData) => {
  const { error } = await supabase
    .from('transactions')
    .insert(transactionsData);

  if (error) {
    throw error;
  }
};

// Function to get the maximum tag_no from the transactions table
export const getMaxTagNo = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('tag_no')
      .order('tag_no', { ascending: false })
      .limit(1)
      .single();
  
    if (error && error.code !== 'PGRST116') { // PGRST116 indicates no rows found, which is not an error for our use case
      throw error;
    }
  
    return data ? data.tag_no : 0;
  };

  export async function fetchAllInvoices() {
    try {
      const { data, error } = await supabase.from('invoices').select('*');
      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching invoices:', error.message);
    }
  }

  export async function fetchInvoiceDetails(orderNo) {
    try {
      let { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('order_no', orderNo)
        .single(); // Use single to get a single record
  
      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error(`No invoice found with order_no: ${orderNo}`);
        }
        throw error;
      }
  
      return data;
    } catch (error) {
      console.error('Error fetching invoice details:', error.message);
      throw error;
    }
  }
  
  export async function fetchTransactionsByInvoiceId(invoiceId) {
    try {
      // Fetch transactions based on the invoice_id
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('invoice_id', invoiceId);
  
      if (error) {
        throw error;
      }
  
      return data;
    } catch (error) {
      console.error('Error fetching transactions:', error.message);
      throw error;
    }
  }

  export async function fetchTransactionsByorderNo(orderNo) {
    try {
      // Fetch the invoice details first to get its id
      const { data: invoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('order_no', orderNo)
        .single();
  
      if (!invoice) {
        throw new Error(`Invoice with order_no ${orderNo} not found`);
      }
  
      // Now fetch transactions using the invoice id
      return await fetchTransactionsByInvoiceId(order.id);
    } catch (error) {
      console.error('Error fetching transactions by invoice no:', error);
      throw error;
    }
  }

  export async function updateStatus(invoice) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({ status: order.status })
        .eq('order_no', order.order_no);
  
      if (error) throw error;
  
      return data;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  }

  // Function to update invoice and transactions in the database
export const updateInvoiceAndTransactionsInDatabase = async (invoice, transactions) => {
  const { id, order_no, order_date_time, ready_by, status } = invoice;

  const invoiceUpdate = {
    order_date_time,
    ready_by,
    status
  };

  try {
    // Update the invoice
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .update(invoiceUpdate)
      .eq('order_no', order_no);

    if (invoiceError) {
      console.error('Error updating invoice:', invoiceError);
      throw invoiceError;
    }

    // Update the transactions
    for (const transaction of transactions) {
      const { id: transactionId, price } = transaction;

      const transactionUpdate = {
        price,
      };

      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .update(transactionUpdate)
        .eq('id', transactionId);

      if (transactionError) {
        console.error('Error updating transaction:', transactionError);
        throw transactionError;
      }
    }

    return { invoiceData, transactions };

  } catch (error) {
    console.error('Error updating invoice and transactions:', error);
    throw error;
  }
};

// Upload the photo to Supabase storage
export const uploadPhoto = async (file) => {
  const { data, error } = await supabase
    .storage
    .from('customer_info')
    .upload(`${file.name}`, file);
  if (error) throw error;
  return `https://efvrcniptqvxskubaebr.supabase.co/storage/v1/object/public/customer_info/${file.name}`;
};

// Update the invoice with the customer photo URL
export const updateInvoiceWithPhoto = async (invoiceId, photoUrl) => {
  const { error } = await supabase
    .from('invoices')
    .update({ customer_info: photoUrl })
    .eq('id', invoiceId);
  if (error) throw error;
};