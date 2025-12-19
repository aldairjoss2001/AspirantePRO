import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import api from './axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    const token = Cookies.get('token');
    
    if (token) {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data);
      } catch (error) {
        console.error('Error al verificar usuario:', error);
        Cookies.remove('token');
      }
    }
    
    setLoading(false);
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      
      Cookies.set('token', data.data.token, { expires: 7 });
      setUser(data.data);
      
      return { success: true, data: data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al registrar'
      };
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      Cookies.set('token', data.data.token, { expires: 7 });
      setUser(data.data);
      
      return { success: true, data: data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión'
      };
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    router.push('/auth/login');
  };

  const updateUser = (userData) => {
    setUser({ ...user, ...userData });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.rol === 'admin',
        hasActiveAccess: user?.status_pago === 'activo' || user?.rol === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;
