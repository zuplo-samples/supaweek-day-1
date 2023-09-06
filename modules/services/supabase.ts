import { createClient } from "@supabase/supabase-js";
import { environment } from "@zuplo/runtime";

export const supabase = createClient(
  environment.SUPABASE_URL || "",
  environment.SUPABASE_SERVICE_ROLE_KEY || ""
);
