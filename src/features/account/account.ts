import { supabase } from '../../lib/supabase';

export type AccountState = {
  userId: string | null;
  email: string | null;
  isAnonymous: boolean;
};

const redirectTo = () => `${window.location.origin}/account`;

export async function getAccountState(): Promise<AccountState> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return {
    userId: user?.id ?? null,
    email: user?.email ?? null,
    isAnonymous: user?.is_anonymous ?? true,
  };
}

// Attach an email to the current anonymous visitor. Supabase sends a confirmation link.
// The visitor keeps the same user id, so the Quick Check and orders stay linked.
export async function startAccount(email: string) {
  const { error } = await supabase.auth.updateUser(
    { email: email.trim().toLowerCase() },
    { emailRedirectTo: redirectTo() },
  );

  if (error) throw new Error(error.message);
}

// For a returning student on a new browser: send a sign-in link to a confirmed email.
export async function sendSignInLink(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: redirectTo(), shouldCreateUser: false },
  });

  if (error) throw new Error(error.message);
}

export async function signOut() {
  await supabase.auth.signOut();
}