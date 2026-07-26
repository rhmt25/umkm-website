import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // NEXT_PUBLIC variables must be accessed directly so Next.js can include
  // them in the browser bundle.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/rest\/v1\/?$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Konfigurasi Supabase untuk browser belum lengkap.");
  }

  return createBrowserClient(url, key);
}
