import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.login(email, password);
            if (res.data.success) {
                const userData = res.data.user;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true };
            }
            return { success: false, error: res.data.error || 'Login failed' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const register = async (email, password, name, role) => {
        try {
            const res = await api.register(email, password, name, role);
            if (res.data.success) {
                const userData = res.data.user;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true };
            }
            return { success: false, error: res.data.error || 'Registration failed' };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
