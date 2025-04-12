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

export async function login(email, password) {
  try {
    const response = await simulateApiCall({ email, password });
    
    const { token, user } = response;
    
    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update the store
    authStore.set({
      isLoggedIn: true,
      user,
      token,
      loading: false
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Register function
export async function register(name, email, password) {
  try {
    // In a real app, this would be an API call
    // For this demo, we'll simulate a successful registration
    const response = await simulateApiCall({ name, email, password }, 'register');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Logout function
export function logout() {
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Update store
  authStore.set({
    isLoggedIn: false,
    user: null,
    token: null,
    loading: false
  });
}

// Helper function to simulate API calls
async function simulateApiCall(data, type = 'login') {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate validation
      if (!data.email) {
        reject(new Error('Email is required'));
        return;
      }
      
      if (!data.password) {
        reject(new Error('Password is required'));
        return;
      }
      
      if (type === 'login') {
        // Simulate login response
        resolve({
          token: 'fake-jwt-token-' + Math.random(),
          user: {
            id: '123',
            name: data.email.split('@')[0],
            email: data.email,
            createdAt: new Date().toISOString()
          }
        });
      } else {
        // Simulate registration response
        resolve({
          success: true
        });
      }
    }, 500); // Simulate network delay
  });
}