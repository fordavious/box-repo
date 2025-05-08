import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the Box Auth Context
const BoxAuthContext = createContext();

// Custom hook to use the Box Auth Context
const useBoxAuth = () => useContext(BoxAuthContext);

// Box Auth Provider Component
const BoxAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if already authenticated
        const token = localStorage.getItem('boxAccessToken');
        const expiry = localStorage.getItem('boxTokenExpiry');
        
        if (token && expiry && new Date(expiry) > new Date()) {
          setIsAuthenticated(true);
          // In a real app, you would get user info from Box API here
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        // Clear any invalid auth data
        logout();
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login function - in a real app, this would redirect to Box OAuth
  const login = () => {
    // This is a mock implementation for demonstration
    setLoading(true);
    setError(null);
    
    // Simulate successful login
    setTimeout(() => {
      // Set token expiry to 1 hour from now
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + 1);
      
      // Store mock tokens
      localStorage.setItem('boxAccessToken', 'mock_access_token');
      localStorage.setItem('boxTokenExpiry', expiryTime.toISOString());
      
      setIsAuthenticated(true);
      setUser({ name: 'Demo User' });
      setLoading(false);
    }, 1500);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('boxAccessToken');
    localStorage.removeItem('boxTokenExpiry');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Context value
  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout
  };

  return (
    <BoxAuthContext.Provider value={value}>
      {children}
    </BoxAuthContext.Provider>
  );
};

// Export both named exports and BoxAuthProvider as default export
export { BoxAuthContext, useBoxAuth, BoxAuthProvider };
export default BoxAuthProvider;