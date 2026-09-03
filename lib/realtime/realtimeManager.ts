import { supabase } from "../supabase";

export function subscribeTable(
  table: string,
  callback: () => void
) {
  const channel = supabase
    .channel(`realtime-${table}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
      },
      () => callback()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}