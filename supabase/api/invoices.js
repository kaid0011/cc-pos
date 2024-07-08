import { supabase } from '../config.js';

// Function to insert a new invoice
export const insertInvoice = async (invoice_no, date_time, ready_by, status) => {
  const { data, error } = await supabase
    .from('invoices')
    .insert([{ invoice_no, date_time, ready_by, status }])
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

  export async function fetchInvoiceDetails(invoiceNo) {
    try {
      let { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('invoice_no', invoiceNo)
        .single(); // Use single to get a single record
  
      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error(`No invoice found with invoice_no: ${invoiceNo}`);
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

  export async function fetchTransactionsByInvoiceNo(invoiceNo) {
    try {
      // Fetch the invoice details first to get its id
      const { data: invoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('invoice_no', invoiceNo)
        .single();
  
      if (!invoice) {
        throw new Error(`Invoice with invoice_no ${invoiceNo} not found`);
      }
  
      // Now fetch transactions using the invoice id
      return await fetchTransactionsByInvoiceId(invoice.id);
    } catch (error) {
      console.error('Error fetching transactions by invoice no:', error);
      throw error;
    }
  }

  export async function updateStatus(invoice) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({ status: invoice.status })
        .eq('invoice_no', invoice.invoice_no);
  
      if (error) throw error;
  
      return data;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  }

  // Function to update invoice and transactions in the database
export const updateInvoiceAndTransactionsInDatabase = async (invoice, transactions) => {
  const { id, invoice_no, date_time, ready_by } = invoice;

  const invoiceUpdate = {
    date_time,
    ready_by,
  };

  try {
    // Update the invoice
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .update(invoiceUpdate)
      .eq('invoice_no', invoice_no);

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