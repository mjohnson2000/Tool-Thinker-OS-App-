import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface User {
  email: string;
  isVerified: boolean;
  createdAt?: string;
  lastLogin?: string;
  name?: string;
  profilePic?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (data: { name?: string; profilePic?: string }) => Promise<void>;
}

interface ApiResponse {
  data: {
    token: string;
    user: User;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for token and validate it
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      validateToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async () => {
    try {
      const response: any = await axios.get(`${API_URL}/auth/validate`);
      // Accept both { user: ... } and { data: { user: ... } } for compatibility
      const userObj = response.data?.data?.user || response.data?.user;
      if (userObj) {
        setUser(userObj);
      } else {
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setIsLoading(false);
    }
  };

  const setAuthToken = (token: string) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const signup = async (email: string, password: string) => {
    try {
      const response = await axios.post<ApiResponse>(`${API_URL}/auth/signup`, {
        email,
        password
      });
      if (response.data && response.data.data) {
        setAuthToken(response.data.data.token);
        setUser(response.data.data.user);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to sign up');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post<ApiResponse>(`${API_URL}/auth/login`, {
        email,
        password
      });
      if (response.data && response.data.data) {
        setAuthToken(response.data.data.token);
        setUser(response.data.data.user);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to log in');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const verifyEmail = async (token: string) => {
    try {
      await axios.get(`${API_URL}/auth/verify/${token}`);
      if (user) {
        setUser({ ...user, isVerified: true });
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to verify email');
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to request password reset');
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await axios.post(`${API_URL}/auth/reset-password/${token}`, {
        password: newPassword
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const updateProfile = async (data: { name?: string; profilePic?: string }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const response = await axios.patch<{ data: { user: User } }>(`${API_URL}/auth/profile`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.data && response.data.data.user) {
        setUser(response.data.data.user);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signup,
        login,
        logout,
        verifyEmail,
        requestPasswordReset,
        resetPassword,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
