const { createClient } = require("@supabase/supabase-js");

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_KEY are not set. Copy .env.example to .env first."
  );
}

// The anon (public) key is the only key this server uses. The service_role key
// bypasses every security rule, so it never belongs in this project.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// createClient never touches the network, so it cannot tell us whether the
// project is actually reachable. Asking Supabase Auth for its health does.
async function checkConnection() {
  const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/health`, {
    headers: { apikey: process.env.SUPABASE_KEY },
  });

  if (!response.ok) {
    throw new Error(`Supabase Auth answered ${response.status}`);
  }
}

module.exports = { supabase, checkConnection };
