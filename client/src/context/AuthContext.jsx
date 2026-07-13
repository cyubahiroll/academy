import { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getUser();
    const token = authService.getToken();
    if (storedUser && token) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    setUser(data.user);
    toast.success('Login successful!');
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    toast.success('Registration successful!');
    return data;
  };

  const googleLogin = async (accessToken) => {
    const data = await authService.googleLogin(accessToken);
    setUser(data.user);
    toast.success(data.is_new ? 'Account created successfully!' : 'Login successful!');
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Logged out');
  };

  const updateProfile = async (data) => {
    const result = await authService.updateProfile(data);
    setUser(result.user);
    toast.success('Profile updated!');
    return result;
  };

  const updateEmail = async (data) => {
    const result = await authService.updateEmail(data);
    setUser(result.user);
    return result;
  };

  const changePassword = async (data) => {
    const result = await authService.changePassword(data);
    return result;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      googleLogin,
      logout,
      updateProfile,
      updateEmail,
      changePassword,
      isAdmin: user?.role === 'admin',
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
