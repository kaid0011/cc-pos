// src/supabase/api/item_list.js
import { supabase } from "../config.js";

// ----------------------
// Fetch pricing groups
// ----------------------
export const fetchPricingGroups = async () => {
  try {
    const { data, error } = await supabase
      .from("pricing_groups")
      .select("id, name")

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching pricing groups:", err.message);
    return [];
  }
};

// ----------------------
// Fetch items by group
// ----------------------
export const fetchItemsByGroup = async (groupId) => {
  try {
    const { data, error } = await supabase
      .from("pricing_items")
      .select(`
        id,
        name,
        category,
        sub_category,
        unit,
        pieces,
        is_active,
        pricing_group_rates (
          id,
          service_type,
          price,
          group_id
        )
      `)
      .order("category", { ascending: true })
      .order("sub_category", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;

    return data.map((item) => {
      const groupPrices = {};
      (item.pricing_group_rates || []).forEach((rate) => {
        if (!groupPrices[rate.group_id]) groupPrices[rate.group_id] = {};
        groupPrices[rate.group_id][rate.service_type] = rate.price || 0;
      });

      return {
        ...item,
        groupPrices,
      };
    });
  } catch (err) {
    console.error("Error fetching items:", err.message);
    return [];
  }
};


// ----------------------
// Create new item
// ----------------------
export const createItem = async (newItem, groupId, changedBy) => {
  const client = supabase;
  try {
    // Get group name for audit
    const { data: group, error: groupError } = await client
      .from("pricing_groups")
      .select("name")
      .eq("id", groupId)
      .single();
    if (groupError) throw groupError;

    // Insert the item
    const { data: itemData, error: itemError } = await client
      .from("pricing_items")
      .insert([{
        name: newItem.name,
        category: newItem.category,
        sub_category: newItem.sub_category,
        unit: newItem.unit,
        pieces: newItem.pieces,
        is_active: true,
      }])
      .select("id, name, category, sub_category, unit, pieces")
      .single();
    if (itemError) throw itemError;

    const itemId = itemData.id;

    // Insert service prices
    const serviceRates = (newItem.servicePrices || [])
      .filter(r => r?.service_type && r.price !== undefined && r.price !== null)
      .map(r => ({
        item_id: itemId,
        group_id: groupId,
        service_type: r.service_type || '',
        price: r.price,
      }));

    if (serviceRates.length) {
      const { error: ratesError } = await client
        .from("pricing_group_rates")
        .insert(serviceRates);
      if (ratesError) throw ratesError;
    }

    // ---- AUDIT (names only, include price) ----
    const auditRows = (newItem.servicePrices || [])
      .filter(r => r?.service_type && r.price !== undefined && r.price !== null)
      .map(r => ({
        item_name: itemData.name,
        group_name: group.name,
        field_name: "create",
        service_type: r.service_type,
        old_value: null,
        new_value: JSON.stringify({
          name: itemData.name,
          category: itemData.category,
          sub_category: itemData.sub_category,
          unit: itemData.unit,
          pieces: itemData.pieces,
          service_type: r.service_type,
          price: r.price,
        }),
        changed_by: changedBy,
      }));

    const { error: auditError } = await client
      .from("pricing_audit_log")
      .insert(auditRows);
    if (auditError) throw auditError;

    return itemData;
  } catch (err) {
    console.error("Error creating item:", err.message);
    throw err;
  }
};

// ----------------------
// Update item (manual check for rates + audit logging)
// ----------------------
export const updateItems = async (item, groupId, changedBy) => {
  const client = supabase;
  try {
    // Fetch group with name
    const { data: group, error: groupError } = await client
      .from("pricing_groups")
      .select("id, name")
      .eq("id", groupId)
      .single();
    if (groupError) throw groupError;

    // Get existing item before update
    const { data: existing, error: fetchError } = await client
      .from("pricing_items")
      .select("*")
      .eq("id", item.id)
      .single();
    if (fetchError) throw fetchError;

    const updates = {
      name: item.name,
      category: item.category,
      sub_category: item.sub_category,
      unit: item.unit,
      pieces: item.pieces,
    };

    const logs = [];

    // Non-price fields → no service_type
    for (const [field, newVal] of Object.entries(updates)) {
      if (existing[field] !== newVal) {
        logs.push({
          item_name: item.name,          // ✅ always use NEW name for clarity
          group_name: group.name,
          field_name: field,
          service_type: null,
          old_value: existing[field] !== null ? String(existing[field]) : null,
          new_value: newVal !== null ? String(newVal) : null,
          changed_by: changedBy,
        });
      }
    }

    // Update item record
    const { error: updateError } = await client
      .from("pricing_items")
      .update(updates)
      .eq("id", item.id);
    if (updateError) throw updateError;

    // Service rates
    const serviceRates = [
      { service_type: "laundry", price: item.laundry_price },
      { service_type: "dry clean", price: item.dryclean_price },
      { service_type: "pressing", price: item.pressing_price },
      { service_type: "others", price: item.others_price },
    ];

// Service rates from payload
for (const rate of item.servicePrices) {
  if (rate.price !== null && rate.price !== undefined) {
    const { data: oldRate, error: findError } = await client
      .from("pricing_group_rates")
      .select("id, price")
      .eq("item_id", item.id)
      .eq("group_id", groupId)
      .eq("service_type", rate.service_type)
      .maybeSingle();
    if (findError) throw findError;

    if (oldRate) {
      if (oldRate.price !== rate.price) {
        await client
          .from("pricing_group_rates")
          .update({ price: rate.price })
          .eq("id", oldRate.id);

        logs.push({
          item_name: item.name,
          group_name: group.name,
          field_name: "price",
          service_type: rate.service_type,
          old_value: String(oldRate.price),
          new_value: String(rate.price),
          changed_by: changedBy,
        });
      }
    } else {
      await client.from("pricing_group_rates").insert({
        item_id: item.id,
        group_id: groupId,
        service_type: rate.service_type,
        price: rate.price,
      });

      logs.push({
        item_name: item.name,
        group_name: group.name,
        field_name: "price",
        service_type: rate.service_type,
        old_value: null,
        new_value: String(rate.price),
        changed_by: changedBy,
      });
    }
  }
}


    // inside updateItems, after serviceRates handling:
if (item.deletedServiceTypes && item.deletedServiceTypes.length > 0) {
  for (const serviceType of item.deletedServiceTypes) {
    // fetch old value before delete
    const { data: oldRate } = await client
      .from("pricing_group_rates")
      .select("id, price")
      .eq("item_id", item.id)
      .eq("group_id", groupId)
      .eq("service_type", serviceType)
      .maybeSingle();

    if (oldRate) {
      // delete from DB
      await client
        .from("pricing_group_rates")
        .delete()
        .eq("id", oldRate.id);

      // log deletion
      logs.push({
        item_name: item.name,
        group_name: group.name,
        field_name: "price",
        service_type: serviceType,
        old_value: String(oldRate.price),
        new_value: null,
        changed_by: changedBy,
      });
    }
  }
}


    // Insert audit logs if any
    if (logs.length > 0) {
      const { error: auditError } = await client
        .from("pricing_audit_log")
        .insert(logs);
      if (auditError) throw auditError;
    }

    return true;
  } catch (err) {
    console.error("Error updating item:", err.message);
    throw err;
  }
};

// ----------------------
// Deactivate item
// ----------------------
export const deactivateItem = async (itemId, groupId, changedBy) => {
  const client = supabase;
  try {
    // Get existing
    const { data: existing, error: fetchError } = await client
      .from("pricing_items")
      .select("is_active")
      .eq("id", itemId)
      .single();

    if (fetchError) throw fetchError;

    // Update
    const { error: updateError } = await client
      .from("pricing_items")
      .update({ is_active: false })
      .eq("id", itemId);

    if (updateError) throw updateError;

    // Log
    await client.from("pricing_audit_log").insert([{
      item_id: itemId,
      group_id: groupId,
      field_name: "is_active",
      service_type: null,
      old_value: String(existing.is_active),
      new_value: "false",
      changed_by: changedBy,
    }]);

    return true;
  } catch (err) {
    console.error("Error deactivating item:", err.message);
    return false;
  }
};

// Reactivate item
export const reactivateItem = async (itemId, groupId, changedBy) => {
  const client = supabase;
  try {
    const { data: existing, error: fetchError } = await client
      .from("pricing_items")
      .select("is_active")
      .eq("id", itemId)
      .single();

    if (fetchError) throw fetchError;

    const { error: updateError } = await client
      .from("pricing_items")
      .update({ is_active: true })
      .eq("id", itemId);

    if (updateError) throw updateError;

    await client.from("pricing_audit_log").insert([{
      item_id: itemId,
      group_id: groupId,
      field_name: "is_active",
      service_type: null,
      old_value: String(existing.is_active),
      new_value: "true",
      changed_by: changedBy,
    }]);

    return true;
  } catch (err) {
    console.error("Error reactivating item:", err.message);
    return false;
  }
};

// ----------------------
// Delete item (with service rates + audit)
// ----------------------
export const deleteItem = async (item, groupName, changedBy) => {
  const client = supabase;
  try {
    if (!item?.id) {
      throw new Error("Invalid item passed to deleteItem");
    }

    // Delete service rates first
    const { error: ratesError } = await client
      .from("pricing_group_rates")
      .delete()
      .eq("item_id", item.id);
    if (ratesError) throw ratesError;

    // Delete the item
    const { error: itemError } = await client
      .from("pricing_items")
      .delete()
      .eq("id", item.id);
    if (itemError) throw itemError;

    // Prepare clean JSON for old_value
    const oldValue = {
      name: item.name,
      category: item.category,
      sub_category: item.sub_category,
      unit: item.unit,
      pieces: item.pieces,
      servicePrices: item.servicePrices || [],
      is_active: item.is_active,
    };

    // Audit log (no IDs, only names)
    await client.from("pricing_audit_log").insert([{
      item_name: item.name,
      group_name: groupName,
      field_name: "delete",
      service_type: null,
      old_value: JSON.stringify(oldValue),
      new_value: null,
      changed_by: changedBy || "system",
    }]);

    return true;
  } catch (err) {
    console.error("Error deleting item:", err.message);
    return false;
  }
};
