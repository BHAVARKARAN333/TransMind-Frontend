import { auth } from '../firebase';

/**
 * A wrapper for the native fetch API that automatically injects
 * the Firebase Authentication ID token if a user is logged in.
 */
export async function apiFetch(url, options = {}) {
  await auth.authStateReady();
  const user = auth.currentUser;
  let token = null;

  if (user) {
    try {
      token = await user.getIdToken();
    } catch (e) {
      console.warn("Could not retrieve Firebase ID token", e);
    }
  }

  // Preserve existing headers if present
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers
  });
}
