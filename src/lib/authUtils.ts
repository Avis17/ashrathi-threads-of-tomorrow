/**
 * Auth utility functions for managing authentication state
 */

/**
 * Clears all authentication tokens from localStorage
 * Useful for debugging authentication issues or clearing corrupted tokens
 */
export const clearAuthTokens = () => {
  console.log('[Auth Utils] Clearing all auth tokens...');
  
  // Clear Supabase auth token
  const supabaseKey = 'sb-fjvvnnvvgaszjdcstcaj-auth-token';
  localStorage.removeItem(supabaseKey);
  
  // Clear any other auth-related items
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth')) {
      localStorage.removeItem(key);
      console.log('[Auth Utils] Removed:', key);
    }
  });
  
  console.log('[Auth Utils] Tokens cleared. Reloading page...');
  window.location.href = '/';
};

/**
 * Enables debug mode for authentication logging
 */
export const enableAuthDebug = () => {
  localStorage.setItem('DEBUG_AUTH', 'true');
  console.log('[Auth Utils] Debug mode enabled');
};

/**
 * Disables debug mode for authentication logging
 */
export const disableAuthDebug = () => {
  localStorage.removeItem('DEBUG_AUTH');
  console.log('[Auth Utils] Debug mode disabled');
};

/**
 * Checks if auth debug mode is enabled
 */
export const isAuthDebugEnabled = (): boolean => {
  return localStorage.getItem('DEBUG_AUTH') === 'true';
};
