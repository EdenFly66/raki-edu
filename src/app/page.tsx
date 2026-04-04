"use client";

import { useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function TestSupabase() {
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    console.log("Supabase client:", supabase);
  }, []);

  return <div>Check console</div>;
}