import { supabase } from "./supabase";

export async function generateNextCode(
  table: "drivers" | "vehicles",
  field: "driver_code" | "vehicle_code",
  prefix: string
) {
  const { data, error } = await supabase
    .from(table)
    .select(field)
    .order(field, { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  const currentCode = (data as Record<string, string | null> | null)?.[field];

  if (!currentCode) {
    return `${prefix}-0001`;
  }

  const number = parseInt(currentCode.split("-").pop() || "0", 10);

  return `${prefix}-${String(number + 1).padStart(4, "0")}`;
}