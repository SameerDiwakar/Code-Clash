import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: (clearProfileCallback?: () => void) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data } = await axios.get('http://localhost:4000/api/profile', {
        withCredentials: true,
      });
      if (data) {
        setUser({
          id: data._id,
          email: data.email,
          username: data.username,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        'http://localhost:4000/api/google',
        { idToken },
        { withCredentials: true }
      );
      setUser({
        id: data._id,
        email: data.email,
        username: data.username,
      });
      return true;
    } catch (error: any) {
      if (error.response) {
        console.error('Google login failed:', error.response.data.message || error.response.statusText);
      } else {
        console.error('Google login error:', error.message);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        'http://localhost:4000/api/login',
        { email, password },
        { withCredentials: true }
      );
      setUser({
        id: data._id,
        email: data.email,
        username: data.username,
      });
      return true;
    } catch (error: any) {
      if (error.response) {
        console.error('Login failed:', error.response.data.message || error.response.statusText);
      } else {
        console.error('Login error:', error.message);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        'http://localhost:4000/api/register',
        { email, username, password },
        { withCredentials: true }
      );
      setUser({
        id: data._id,
        email: data.email,
        username: data.username,
      });
      return true;
    } catch (error: any) {
      if (error.response) {
        console.error('Registration failed:', error.response.data.message || error.response.statusText);
      } else {
        console.error('Registration error:', error.message);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (clearProfileCallback?: () => void): Promise<void> => {
    try {
      await axios.post('http://localhost:4000/api/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Clear profile data if callback provided
      if (clearProfileCallback) {
        clearProfileCallback();
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loginWithGoogle, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
