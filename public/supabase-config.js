// عروضي (Oroudi) — public Supabase configuration for the hosted frontend.
//
// Leave these empty to run fully local-only (data stays in the browser).
// Fill them in to enable shared online office projects (auth + cloud sync).
//
// Both values are PUBLIC and safe to ship to the browser / commit:
//   SUPABASE_URL      → Supabase ▸ Project Settings ▸ API ▸ Project URL
//   SUPABASE_ANON_KEY → Supabase ▸ Project Settings ▸ API ▸ anon / public key
// Row-Level Security (see supabase/schema.sql) is what actually protects data.
//
// Deploy: the local copy holds the real keys and is uploaded as-is by
// `npx wrangler deploy`. The committed copy stays empty — see DEPLOYMENT.md.
window.OROUDI_SUPABASE_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: ""
};
