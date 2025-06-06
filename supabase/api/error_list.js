import { supabase } from '../config.js';

// Fetch all items from the database
export const fetchAllErrorItems = async () => {
  try {
    const { data: items, error } = await supabase
      .from('options_error_list')
      .select('*');
    if (error) {
      console.error('Error fetching items:', error.message);
      return [];
    }
    return items;
  } catch (error) {
    console.error('Unexpected error fetching items:', error.message);
    return [];
  }
};

// Create a new item in the database
export const createItem = async (newItem) => {
  try {
    const { data, error } = await supabase
      .from('options_error_list')
      .insert([newItem]);
    if (error) {
      console.error('Error creating item:', error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Unexpected error creating item:', error.message);
    return null;
  }
};

// Update an existing item in the database
export const updateItems = async (item) => {
  try {
    const { data, error } = await supabase
      .from('options_error_list')
      .update({
        category: item.category,
        sub_category: item.sub_category,
        description: item.description
      })
      .eq('id', item.id);
    if (error) {
      console.error('Error updating item:', error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Unexpected error updating item:', error.message);
    return null;
  }
};

// Delete an item from the database
export const deleteItems = async (itemId) => {
  try {
    const { data, error } = await supabase
      .from('options_error_list')
      .delete()
      .eq('id', itemId);
    if (error) {
      console.error('Error deleting item:', error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Unexpected error deleting item:', error.message);
    return null;
  }
};
