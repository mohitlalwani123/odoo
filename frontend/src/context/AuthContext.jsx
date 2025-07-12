import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../utils/api';


const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_FAIL':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token }
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'AUTH_FAIL', payload: null });
        }
      } else {
        dispatch({ type: 'AUTH_FAIL', payload: null });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async ({ email, password }) => {
  try {
    dispatch({ type: 'AUTH_START' });

    const response = await authAPI.login({
      email: email,
      password: password
    });

    const token = response.data.token;

    localStorage.setItem('token', token);
    const user = { email };

    localStorage.setItem('user', JSON.stringify(user));

    dispatch({
      type: 'AUTH_SUCCESS',
      payload: { user, token }
    });

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    const message = error.response?.data?.error || 'Invalid credentials';
    dispatch({ type: 'AUTH_FAIL', payload: message });
    return { success: false, error: message };
  }
};


  // Register function
  const register = async (userData) => {
  try {
    dispatch({ type: 'AUTH_START' });

    const response = await authAPI.register({
      email: userData.email,
      password: userData.password
    });

    const token = response.data.token;

    localStorage.setItem('token', token);
    const user = { email: userData.email };

    localStorage.setItem('user', JSON.stringify(user));

    dispatch({
      type: 'AUTH_SUCCESS',
      payload: { user, token }
    });

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    const message = error.response?.data?.error || 'Registration failed';
    dispatch({ type: 'AUTH_FAIL', payload: message });
    return { success: false, error: message };
  }
};


  // Logout function
  const logout = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Update profile function
  const updateProfile = async (data) => {
    try {
      const updatedUser = { ...state.user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      dispatch({
        type: 'UPDATE_USER',
        payload: data
      });
      return { success: true };
    } catch (error) {
      const message = error.message || 'Update failed';
      return { success: false, error: message };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;