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

// getUser makes a real network call to Supabase, which holds the signing key.
// That is why its answer can be trusted and a locally decoded JWT cannot.
function verifyToken(token) {
  return supabase.auth.getUser(token);
}

// Only the fields that are safe to hand back to the client.
function toSafeUser(user) {
  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
  };
}

module.exports = { hasCredentials, signUp, logIn, verifyToken, toSafeUser };
