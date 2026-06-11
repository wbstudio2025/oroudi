// عروضي (Oroudy) — public Supabase configuration for the hosted frontend.
//
// Leave these empty to run fully local-only (data stays in the browser).
// Fill them in to enable shared online office projects (auth + cloud sync).
//
// Both values are PUBLIC and safe to ship to the browser / commit:
//   SUPABASE_URL      → Supabase ▸ Project Settings ▸ API ▸ Project URL
//   SUPABASE_ANON_KEY → Supabase ▸ Project Settings ▸ API ▸ anon / public key
// Row-Level Security (see supabase/schema.sql) is what actually protects data.
//
// Cloudflare Pages: edit these values and push, OR generate this file at build
// time from environment variables — see DEPLOYMENT.md.
window.OROUDY_SUPABASE_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: ""
};
