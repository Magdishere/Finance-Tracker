// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken') || null);

  // Keep a ref for accessToken so interceptors always read the latest value
  const accessTokenRef = useRef(accessToken);
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  // Memoize axios instance so it is stable between renders
  const api = useMemo(() => {
    return axios.create({
      baseURL: 'http://localhost:5000/api',
      withCredentials: true, // important to send HttpOnly refresh cookie
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }, []);

  // Helper: set tokens in state + localStorage
  const saveAccessToken = (token) => {
    setAccessToken(token);
    accessTokenRef.current = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  };

  // Logout function (defined before interceptor so it can be used when refresh fails)
  const logout = async () => {
    setLoading(true);
    try {
      // call backend to clear refresh cookie (doesn't need Authorization header)
      await api.get('/auth/logout');
    } catch (err) {
      // ignore backend logout errors but log for debugging
      console.error('Backend logout failed:', err);
    } finally {
      setUser(null);
      saveAccessToken(null);
      setLoading(false);
    }
  };

  // Fetch user (exposed / used internally)
  const fetchUser = async () => {
    const token = accessTokenRef.current;
    if (!token) {
      // try to refresh once automatically if no access token
      try {
        const refreshResp = await axios.post('http://localhost:5000/api/auth/refresh', {}, { withCredentials: true });
        if (refreshResp.data?.accessToken) {
          saveAccessToken(refreshResp.data.accessToken);
        } else {
          // no token returned -> ensure logged out
          logout();
          return;
        }
      } catch (err) {
        logout();
        return;
      }
    }

    try {
      // use api instance which will attach Authorization via request interceptor (see below)
      const res = await api.get('/auth/me');
      setUser(res.data.data || null);
    } catch (err) {
      // If 401, the response interceptor will attempt refresh; here just logout as fallback
      console.error('fetchUser error:', err);
      logout();
    }
  };

  // Attach interceptors once (and clean up on unmount)
  useEffect(() => {
    // Request interceptor - attach the latest access token on every request
    const reqInterceptor = api.interceptors.request.use(
      (config) => {
        const token = accessTokenRef.current;
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - attempt refresh on 401 and retry original request
    const resInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If no response or config, just reject
        if (!error.response || !originalRequest) return Promise.reject(error);

        // Only handle 401 once per request
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            // Attempt refresh using cookie (axios.post uses full URL because api is same-origin to backend but refresh uses axios to include cookie)
            const refreshResp = await axios.post('http://localhost:5000/api/auth/refresh', {}, { withCredentials: true });

            if (refreshResp?.data?.accessToken) {
              const newToken = refreshResp.data.accessToken;
              saveAccessToken(newToken);

              // Update headers and retry original request
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;

              // also update api defaults so subsequent requests have token
              api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

              return api(originalRequest);
            } else {
              // Refresh endpoint did not return a token -> force logout
              logout();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            // Refresh failed (invalid/expired) -> logout user
            console.error('Refresh token failed:', refreshError);
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      // eject interceptors on cleanup
      api.interceptors.request.eject(reqInterceptor);
      api.interceptors.response.eject(resInterceptor);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]); // api is stable due to useMemo

  // On mount: try to populate user (will attempt refresh if needed)
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchUser();
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password }, { withCredentials: true });

      if (res.data?.accessToken) {
        saveAccessToken(res.data.accessToken);  // ✅ token saved synchronously
        await fetchUser();                     // ✅ fetch user after token is saved
      }

      setLoading(false);
      return res;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };


  // Register
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

  // Expose context
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        accessToken,
        api, // axios instance (use for non-auth requests)
        login,
        register,
        logout,
        fetchUser, // optional: useful for manual refresh
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
