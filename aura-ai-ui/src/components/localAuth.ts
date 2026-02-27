export type StoredUser = {
  name: string;
  email: string;
  password: string; // temporary until DB: will later be hashed on server
};

const USER_KEY = "aura_user";
const SESSION_KEY = "aura_session";

export function saveUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setLoggedIn(email: string): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email, at: Date.now() }));
}

export function isLoggedIn(): boolean {
  return Boolean(localStorage.getItem(SESSION_KEY));
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}