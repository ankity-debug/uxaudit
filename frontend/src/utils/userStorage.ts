// User data storage utility
// TODO: Replace localStorage with API calls to database when ready

export interface UserData {
  name: string;
  email: string;
}

/**
 * Save user data to storage
 * FUTURE: Replace with API call to save to database
 */
export const saveUserData = async (userData: UserData): Promise<void> => {
  try {
    // TODO: Replace with API call
    // await fetch('/api/users', { method: 'POST', body: JSON.stringify(userData) });

    localStorage.setItem('auditUserData', JSON.stringify(userData));
  } catch (error) {
    console.error('Failed to save user data:', error);
    throw error;
  }
};

/**
 * Get user data from storage
 * FUTURE: Replace with API call to fetch from database
 */
export const getUserData = (): UserData | null => {
  try {
    // TODO: Replace with API call
    // const response = await fetch('/api/users/current');
    // return await response.json();

    const data = localStorage.getItem('auditUserData');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get user data:', error);
    return null;
  }
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate name (at least 2 characters)
 */
export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};
