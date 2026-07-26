function required(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variabel environment ${name} belum diatur.`);
  }

  return value;
}

export function getSupabasePublicEnv() {
  return {
    // The Supabase dashboard's REST endpoint ends in /rest/v1. The client
    // needs the project root URL instead, so accept either format safely.
    url: required("NEXT_PUBLIC_SUPABASE_URL").replace(/\/rest\/v1\/?$/, ""),
    key: required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
}

export function getSupabaseServiceRoleKey() {
  return required("SUPABASE_SERVICE_ROLE_KEY");
}
