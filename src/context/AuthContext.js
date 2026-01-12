import React, { createContext, useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import apiInstance from '../config/api'; // your axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken') || null);

  const accessTokenRef = useRef(accessToken);
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  // Axios instance with interceptors
  const api = useMemo(() => {
    const instance = apiInstance;

    // Request: attach token
    instance.interceptors.request.use(config => {
      const token = accessTokenRef.current;
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    // Response: handle 401 → refresh
    instance.interceptors.response.use(
      res => res,
      async error => {
        const originalRequest = error.config;
        if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) return Promise.reject(error);

        originalRequest._retry = true;
        try {
          const refreshResp = await axios.post(
            `${process.env.REACT_APP_API_URL || 'https://finance-tracker-api-53xq.onrender.com/api'}/auth/refresh`,
            {},
            { withCredentials: true }
          );

          if (refreshResp.data?.accessToken) {
            const newToken = refreshResp.data.accessToken;
            saveAccessToken(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          } else {
            logout();
            return Promise.reject(error);
          }
        } catch (err) {
          logout();
          return Promise.reject(err);
        }
      }
    );

    return instance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveAccessToken = (token) => {
    setAccessToken(token);
    accessTokenRef.current = token;
    if (token) localStorage.setItem('accessToken', token);
    else localStorage.removeItem('accessToken');
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.get('/auth/logout'); // clear refresh cookie
    } catch (err) {
      console.error('Backend logout failed:', err);
    } finally {
      setUser(null);
      saveAccessToken(null);
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    const token = accessTokenRef.current;
    if (!token) {
      try {
        const refreshResp = await axios.post(
          `${process.env.REACT_APP_API_URL || 'https://finance-tracker-api-53xq.onrender.com/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (refreshResp.data?.accessToken) {
          saveAccessToken(refreshResp.data.accessToken);
        } else {
          logout();
          return;
        }
      } catch (err) {
        logout();
        return;
      }
    }

    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data || null);
    } catch (err) {
      console.error('fetchUser error:', err);
      logout();
    }
  };

  // On mount: fetch user and token
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchUser();
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password }, { withCredentials: true });
      if (res.data?.accessToken) {
        saveAccessToken(res.data.accessToken);
        await fetchUser();
      }
      setLoading(false);
      return res;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { email, password }, { withCredentials: true });
      if (res.data?.accessToken) {
        saveAccessToken(res.data.accessToken);
        await fetchUser();
      }
      setLoading(false);
      return res;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        accessToken,
        api,
        login,
        register,
        logout,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
