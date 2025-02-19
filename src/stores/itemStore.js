import { defineStore } from "pinia";
import { supabase } from "@/../supabase/config.js";

export const useTransactionStore = defineStore("transactionStore", {
  state: () => ({
    items: [],
  }),
  actions: {
    // Fetch all items directly inside the store
    async loadItems() {
      if (this.items.length === 0) {
        try {
          const { data: items, error } = await supabase
            .from("item_list")
            .select("*");

          if (error) {
            console.error("Error fetching items:", error.message);
            return;
          }

          this.items = items;
        } catch (error) {
          console.error("Unexpected error fetching items:", error.message);
        }
      }
    },

    // Create a new item
    async createItem(newItem) {
      try {
        const { data, error } = await supabase
          .from("item_list")
          .insert([newItem]);

        if (error) {
          console.error("Error creating item:", error.message);
          return null;
        }

        // Update state after successful insert
        this.items.push(data[0]);
        return data;
      } catch (error) {
        console.error("Unexpected error creating item:", error.message);
        return null;
      }
    },

    // Update an existing item
    async updateItem(updatedItem) {
      try {
        const { data, error } = await supabase
          .from("item_list")
          .update({
            name: updatedItem.name,
            category: updatedItem.category,
            sub_category: updatedItem.sub_category,
            laundry_price: updatedItem.laundry_price,
            dryclean_price: updatedItem.dryclean_price,
            pressing_price: updatedItem.pressing_price,
            others_price: updatedItem.others_price,
          })
          .eq("id", updatedItem.id);

        if (error) {
          console.error("Error updating item:", error.message);
          return null;
        }

        // Update state after successful update
        const index = this.items.findIndex((item) => item.id === updatedItem.id);
        if (index !== -1) {
          this.items[index] = { ...this.items[index], ...updatedItem };
        }

        return data;
      } catch (error) {
        console.error("Unexpected error updating item:", error.message);
        return null;
      }
    },

    // Delete an item
    async deleteItem(itemId) {
      try {
        const { error } = await supabase
          .from("item_list")
          .delete()
          .eq("id", itemId);

        if (error) {
          console.error("Error deleting item:", error.message);
          return null;
        }

        // Update state after successful deletion
        this.items = this.items.filter((item) => item.id !== itemId);
        return true;
      } catch (error) {
        console.error("Unexpected error deleting item:", error.message);
        return null;
      }
    },
  },
});
