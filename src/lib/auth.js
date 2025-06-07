const listeners = [];
let authState = {
  isLoggedIn: false,
  user: null,
  token: null,
  loading: true
};

export const authStore = {
  subscribe(listener) {
    listeners.push(listener);
    listener(authState);
    return () => {
      const index = listeners.indexOf(listener);
      if (index !== -1) listeners.splice(index, 1);
    };
  },
  set(newState) {
    authState = { ...authState, ...newState };
    listeners.forEach(listener => listener(authState));
  },
  get() {
    return authState;
  }
};

export function initAuth() {
  if (typeof window === 'undefined') return;
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      const user = JSON.parse(userStr);
      authStore.set({
        isLoggedIn: true,
        user,
        token,
        loading: false
      });
    } else {
      authStore.set({
        isLoggedIn: false,
        user: null,
        token: null,
        loading: false
      });
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
    authStore.set({
      isLoggedIn: false,
      user: null,
      token: null,
      loading: false
    });
  }
}

/**
 * Login a user (role can be 'user' or 'admin')
 */
export async function login(email, password, role = 'user') {
  try {
    // Only allow 'user' or 'admin'
    const safeRole = role === 'admin' ? 'admin' : 'user';
    const response = await simulateApiCall({ email, password, role: safeRole }, 'login');
    const { token, user } = response;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    authStore.set({
      isLoggedIn: true,
      user,
      token,
      loading: false
    });
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Register a user (role can be 'user' or 'admin')
 */
export async function register(name, email, password, role = 'user') {
  try {
    // Only allow 'user' or 'admin'
    const safeRole = role === 'admin' ? 'admin' : 'user';
    const response = await simulateApiCall({ name, email, password, role: safeRole }, 'register');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  authStore.set({
    isLoggedIn: false,
    user: null,
    token: null,
    loading: false
  });
}

// Helper: get current role
export function getRole() {
  const user = authStore.get().user;
  return user?.role || 'user';
}

// Helper: check if current user is admin
export function isAdmin() {
  return getRole() === 'admin';
}

// Simulated API call for demo/dev
async function simulateApiCall(data, type = 'login') {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Validation
      if (!data.email) {
        reject(new Error('Email is required'));
        return;
      }
      if (!data.password) {
        reject(new Error('Password is required'));
        return;
      }

      // Validate and set role
      const allowedRoles = ['user', 'admin'];
      let userRole = allowedRoles.includes(data.role) ? data.role : 'user';

      if (type === 'login') {
        // Simulate login response
        resolve({
          token: 'fake-jwt-token-' + Math.random(),
          user: {
            id: '123',
            name: data.email.split('@')[0],
            email: data.email,
            role: userRole,
            createdAt: new Date().toISOString()
          }
        });
      } else {
        // Simulate registration response
        resolve({
          success: true
        });
      }
    }, 500);
  });
}