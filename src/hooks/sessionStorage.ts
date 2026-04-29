const SESSION_KEY = "realestate_verified_email";

export function setSession(email: string, plan: string) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email, plan }));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
