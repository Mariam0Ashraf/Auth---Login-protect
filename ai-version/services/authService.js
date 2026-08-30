const { supabase } = require("../config");

async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

async function getUser(token) {
  const { data } = await supabase.auth.getUser(token);
  return data.user;
}

module.exports = { signUp, signIn, signOut, getUser };
