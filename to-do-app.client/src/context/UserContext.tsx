import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
   email: string;
}

interface UserContextType {
   user: User | null;
   loading: boolean;
   login: (email: string, password: string) => Promise<void>;
   logout: () => Promise<void>;
   initialLoading: boolean; // Added missing property
   loggingIn: boolean; // Added missing property
   loggingOut: boolean; // Added missing property
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState(true);
   const [initialLoading, setInitialLoading] = useState(true);
   const [loggingIn, setLoggingIn] = useState(false);
   const [loggingOut, setLoggingOut] = useState(false);

   useEffect(() => {
       const checkAuth = async () => {
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
           }
       };

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
       setUser({ email });
       setLoggingIn(false);
   };

   const logout = async () => {
       setLoggingOut(true);
       await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
       setUser(null);
       setLoggingOut(false);
   };

   return (
       <UserContext.Provider value={{ user, loading, login, logout, initialLoading, loggingIn, loggingOut }}>
           {children}
       </UserContext.Provider>
   );
};

export const useUser = () => {
   const context = useContext(UserContext);
   if (!context) {
       throw new Error("useUser must be used within a UserProvider");
   }
   return context;
};