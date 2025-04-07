import { createClient } from '@supabase/supabase-js';
import * as schema from "@shared/schema";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_ANON_KEY must be set. Did you forget to configure Supabase?",
  );
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// For backward compatibility with existing code
export const db = {
  select: (table: string) => supabase.from(table).select(),
  insert: (table: string) => ({
    values: (data: any) => supabase.from(table).insert(data).select(),
  }),
  update: (table: string) => ({
    set: (data: any) => ({
      where: (condition: any) => supabase.from(table).update(data).match(condition),
    }),
  }),
};
