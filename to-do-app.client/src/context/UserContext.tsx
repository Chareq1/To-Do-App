import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
    userId: string;
    username: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    avatarId: string;
}

interface UserContextType {
   user: User | null;
   loading: boolean;
   login: (email: string, password: string) => Promise<void>;
   logout: () => Promise<void>;
   initialLoading: boolean; // Added missing property
   loggingIn: boolean; // Added missing property
    loggingOut: boolean; // Added missing property
    refreshData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState(false);
   const [initialLoading, setInitialLoading] = useState(true);
   const [loggingIn, setLoggingIn] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const refreshData = async () => {
        try {
            const response = await fetch("/api/auth/me", { credentials: "include" });
            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
           setLoading(false);
           setInitialLoading(false);
        }
    };

    const checkAuth = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/auth/me", { credentials: "include" });
            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setTimeout(() => {
                setLoading(false);
                setInitialLoading(false);
            }, 1500);
        }
    };

   useEffect(() => {
       checkAuth();

       const timer = setTimeout(() => {
           setInitialLoading(false);
       }, 1500);

       return () => clearTimeout(timer);
   }, []);

   const login = async (email: string, password: string) => {
       setLoggingIn(true);
       const response = await fetch("/api/auth/login", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           credentials: "include",
           body: JSON.stringify({ email, password }),
       });
       if (!response.ok) throw new Error("Login failed");
       //const data = await response.json();
       checkAuth();
       setLoggingIn(false);
   };

   const logout = async () => {
       setLoggingOut(true);
       await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
       setTimeout(() => {
           setUser(null);
           setLoggingOut(false);
       }, 1500);
   };

   return (
       <UserContext.Provider value={{ user, loading, login, logout, initialLoading, loggingIn, loggingOut, refreshData }}>
           {children}
       </UserContext.Provider>
   );
};

export const useUser = () => {
   const context = useContext(UserContext);
   if (!context) {
       throw new Error("useUser musi być użyty w UserProvider");
   }
   return context;
};