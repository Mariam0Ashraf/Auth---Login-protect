const { supabase } = require("../supabase");

// The server never stores or hashes a password. It forwards credentials to
// Supabase and hands back whatever Supabase decides.
function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function hasCredentials(email, password) {
  return isNonEmptyString(email) && isNonEmptyString(password);
}

function signUp(email, password) {
  return supabase.auth.signUp({ email, password });
}

function logIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

module.exports = { hasCredentials, signUp, logIn };
