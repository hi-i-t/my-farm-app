import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "警告: SUPABASE_URL または SUPABASE_ANON_KEY が設定されていません。",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
