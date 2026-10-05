const AUTH_KEY = 'moshaga_current_user';

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
};

export const isLoggedIn = () => Boolean(getCurrentUser());

export const setCurrentUser = (user) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};
