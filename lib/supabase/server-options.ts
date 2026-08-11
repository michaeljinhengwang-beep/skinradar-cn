export const SUPABASE_SERVER_CLIENT_OPTIONS = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
} as const;
