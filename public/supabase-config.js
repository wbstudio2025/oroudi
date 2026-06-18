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
// Deploy: these public keys are committed and ship as-is. Pushing to GitHub's
// main branch auto-deploys to Cloudflare via the deploy job in
// .github/workflows/ci.yml; `npx wrangler deploy` still works locally too.
window.OROUDI_SUPABASE_CONFIG = {
  SUPABASE_URL: "https://xvmyqlwwqmwwgmsjtylv.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2bXlxbHd3cW13d2dtc2p0eWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTM0NjEsImV4cCI6MjA5NzE4OTQ2MX0.ITTJxqKvOU-EtqMmKnJCWaGZ6l4UCQDWYyXLrLHJf48"
};
