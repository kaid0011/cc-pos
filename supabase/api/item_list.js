// src/supabase/api/item_list.js
import { supabase } from "../config.js";

export const fetchAllItems = async () => {
  try {
    const { data: items, error } = await supabase
      .from('pricing_items')
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

// ----------------------
// Fetch pricing groups
// ----------------------
export const fetchPricingGroups = async () => {
  try {
    const { data, error } = await supabase
      .from("pricing_groups")
      .select("id, name");

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
      .select(
        `
        id,
        name,
        category,
        sub_category,
        unit,
        pieces,
      tag_category,
      pack_type,
      company,
      turnaround_time,
        pricing_group_rates (
          id,
          pricing_group_id,
          service_type,
          price,
          is_active,
          applicable_days
        )
      `
      )
      .eq("pricing_group_rates.pricing_group_id", groupId) // optional filter
      .order("category", { ascending: true })
      .order("sub_category", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;

    return data.map((item) => ({
      ...item,
      pricing_group_rates: (item.pricing_group_rates || []).map((rate) => ({
        ...rate,
        applicable_days: Array.isArray(rate.applicable_days)
          ? rate.applicable_days
          : (() => {
              try {
                return JSON.parse(rate.applicable_days || "[]");
              } catch {
                return [];
              }
            })(),
      })),
    }));
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
      .insert([
        {
          name: newItem.name,
          category: newItem.category,
          sub_category: newItem.sub_category,
          unit: newItem.unit,
          pieces: newItem.pieces,
      tag_category: newItem.tag_category,
      pack_type: newItem.pack_type,
      company: newItem.company,
      turnaround_time: newItem.turnaround_time,
          is_active: true,
        },
      ])
      .select("id, name, category, sub_category, unit, pieces, tag_category, pack_type, company, turnaround_time")
      .single();
    if (itemError) throw itemError;

    const itemId = itemData.id;

    // Insert service prices
    const serviceRates = (newItem.servicePrices || [])
      .filter(
        (r) => r?.service_type && r.price !== undefined && r.price !== null
      )
      .map((r) => ({
        item_id: itemId,
        pricing_group_id: groupId,
        service_type: r.service_type || "",
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
      .filter(
        (r) => r?.service_type && r.price !== undefined && r.price !== null
      )
      .map((r) => ({
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

  // helpers for days
  const canonDays = (arr) => {
    const a = Array.isArray(arr) ? arr.map((s) => String(s).toLowerCase()) : [];
    if (a.includes("all")) return ["all"];
    const order = ["mon", "tue", "wed", "thu", "fri", "sat", "sun", "holiday"];
    const uniq = [...new Set(a)];
    return uniq.sort((x, y) => order.indexOf(x) - order.indexOf(y));
  };
  const sameDays = (a, b) =>
    JSON.stringify(canonDays(a)) === JSON.stringify(canonDays(b));

  try {
    // fetch group (for logs)
    const { data: group, error: groupError } = await client
      .from("pricing_groups")
      .select("id, name")
      .eq("id", groupId)
      .single();
    if (groupError) throw groupError;

    // current item (for logs)
    const { data: existing, error: fetchError } = await client
      .from("pricing_items")
      .select("*")
      .eq("id", item.id)
      .single();
    if (fetchError) throw fetchError;

    const itemUpdates = {
      name: item.name,
      category: item.category,
      sub_category: item.sub_category,
      unit: item.unit,
      pieces: item.pieces,
      tag_category: item.tag_category,
      pack_type: item.pack_type,
      company: item.company,
      turnaround_time: item.turnaround_time
    };

    const logs = [];

    // audit changes for item fields
    for (const [field, newVal] of Object.entries(itemUpdates)) {
      if (existing[field] !== newVal) {
        logs.push({
          item_name: item.name,
          group_name: group.name,
          field_name: field,
          service_type: null,
          old_value: existing[field] != null ? String(existing[field]) : null,
          new_value: newVal != null ? String(newVal) : null,
          changed_by: changedBy,
        });
      }
    }

    // update item row
    const { error: updateError } = await client
      .from("pricing_items")
      .update(itemUpdates)
      .eq("id", item.id);
    if (updateError) throw updateError;

    // handle service rates (price, is_active, applicable_days)
    for (const rate of item.servicePrices || []) {
      const cleanedDays = canonDays(rate.applicable_days);
      if (rate.id) {
        // existing row — update by id
        const { data: oldRate, error: findError } = await client
          .from("pricing_group_rates")
          .select(
            "id, item_id, pricing_group_id, service_type, price, is_active, applicable_days"
          )
          .eq("id", rate.id)
          .single();
        if (findError) throw findError;

        // 🔧 normalize applicable_days
        let oldDays;
        try {
          oldDays = Array.isArray(oldRate.applicable_days)
            ? oldRate.applicable_days
            : JSON.parse(oldRate.applicable_days || "[]");
        } catch {
          oldDays = [];
        }

        const updates = {};
        let changed = false;

        if (oldRate.price !== rate.price) {
          updates.price = rate.price;
          changed = true;
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

        if (oldRate.is_active !== rate.is_active) {
          updates.is_active = rate.is_active;
          changed = true;
          logs.push({
            item_name: item.name,
            group_name: group.name,
            field_name: "is_active",
            service_type: rate.service_type,
            old_value: String(oldRate.is_active),
            new_value: String(rate.is_active),
            changed_by: changedBy,
          });
        }

        if (!sameDays(oldDays, cleanedDays)) {
          updates.applicable_days = cleanedDays;
          changed = true;
          logs.push({
            item_name: item.name,
            group_name: group.name,
            field_name: "applicable_days",
            service_type: rate.service_type,
            old_value: JSON.stringify(oldDays),
            new_value: JSON.stringify(cleanedDays),
            changed_by: changedBy,
          });
        }

        if (changed) {
          const updatePayload = { ...updates };

          console.log("🔧 pricing_group_rates UPDATE → id:", oldRate.id, {
            before: oldRate,
            updates: updatePayload,
          });

          const { error: rateUpdateErr } = await client
            .from("pricing_group_rates")
            .update(updatePayload)
            .eq("id", oldRate.id);
          if (rateUpdateErr) throw rateUpdateErr;

          const { data: after } = await client
            .from("pricing_group_rates")
            .select(
              "id, item_id, pricing_group_id, service_type, price, is_active, applicable_days"
            )
            .eq("id", oldRate.id)
            .single();

          console.log("✅ pricing_group_rates UPDATED → id:", oldRate.id, {
            after,
          });
        } else {
          console.log("ℹ️ No changes for rate id", oldRate.id);
        }
      } else {
        // new row — insert
        const insertPayload = {
          item_id: item.id,
          pricing_group_id: groupId,
          service_type: rate.service_type,
          price: rate.price,
          is_active: rate.is_active ?? true,
          applicable_days: cleanedDays.length ? cleanedDays : ["all"],
        };

        console.log("➕ pricing_group_rates INSERT", insertPayload);

        const { data: inserted, error: insertError } = await client
          .from("pricing_group_rates")
          .insert(insertPayload)
          .select(
            "id, item_id, pricing_group_id, service_type, price, is_active, applicable_days"
          )
          .single();
        if (insertError) throw insertError;

        console.log("✅ Inserted rate row:", inserted);

        // let caller/UI know the new id
        rate.id = inserted.id;

        // audit
        logs.push(
          {
            item_name: item.name,
            group_name: group.name,
            field_name: "price",
            service_type: rate.service_type,
            old_value: null,
            new_value: String(rate.price),
            changed_by: changedBy,
          },
          {
            item_name: item.name,
            group_name: group.name,
            field_name: "is_active",
            service_type: rate.service_type,
            old_value: null,
            new_value: String(rate.is_active ?? true),
            changed_by: changedBy,
          },
          {
            item_name: item.name,
            group_name: group.name,
            field_name: "applicable_days",
            service_type: rate.service_type,
            old_value: null,
            new_value: JSON.stringify(insertPayload.applicable_days),
            changed_by: changedBy,
          }
        );
      }
    }

    // deleted service types (optional; unchanged from your flow)
  // deleted service rates (by id instead of service_type)
if (item.deletedServiceIds && item.deletedServiceIds.length > 0) {
  for (const rateId of item.deletedServiceIds) {
    const { data: oldRate } = await client
      .from("pricing_group_rates")
      .select("id, price, is_active, applicable_days")
      .eq("id", rateId)
      .maybeSingle();

    if (oldRate) {
      console.log("🗑 pricing_group_rates DELETE → id:", oldRate.id, {
        before: oldRate,
      });

      await client.from("pricing_group_rates").delete().eq("id", oldRate.id);

      logs.push(
        {
          item_name: item.name,
          group_name: group.name,
          field_name: "price",
          service_type: oldRate.service_type,
          old_value: String(oldRate.price),
          new_value: null,
          changed_by: changedBy,
        },
        {
          item_name: item.name,
          group_name: group.name,
          field_name: "is_active",
          service_type: oldRate.service_type,
          old_value: String(oldRate.is_active),
          new_value: null,
          changed_by: changedBy,
        },
        {
          item_name: item.name,
          group_name: group.name,
          field_name: "applicable_days",
          service_type: oldRate.service_type,
          old_value: JSON.stringify(oldRate.applicable_days || []),
          new_value: null,
          changed_by: changedBy,
        }
      );
    }
  }
}


    // audit logs
    if (logs.length > 0) {
      const { error: auditError } = await client
        .from("pricing_audit_log")
        .insert(logs);
      if (auditError) throw auditError;
    }

    return true;
  } catch (err) {
    console.error("❌ Error updating item:", err.message);
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
    await client.from("pricing_audit_log").insert([
      {
        item_id: itemId,
        pricing_group_id: groupId,
        field_name: "is_active",
        service_type: null,
        old_value: String(existing.is_active),
        new_value: "false",
        changed_by: changedBy,
      },
    ]);

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

    await client.from("pricing_audit_log").insert([
      {
        item_id: itemId,
        pricing_group_id: groupId,
        field_name: "is_active",
        service_type: null,
        old_value: String(existing.is_active),
        new_value: "true",
        changed_by: changedBy,
      },
    ]);

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
      tag_category: item.tag_category,
      pack_type: item.pack_type,
      company: item.company,
      turnaround_time: item.turnaround_time,
      servicePrices: item.servicePrices || [],
      is_active: item.is_active,
    };

    // Audit log (no IDs, only names)
    await client.from("pricing_audit_log").insert([
      {
        item_name: item.name,
        group_name: groupName,
        field_name: "delete",
        service_type: null,
        old_value: JSON.stringify(oldValue),
        new_value: null,
        changed_by: changedBy || "system",
      },
    ]);

    return true;
  } catch (err) {
    console.error("Error deleting item:", err.message);
    return false;
  }
};
