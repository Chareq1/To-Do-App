import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import LoadingScreen from "../components/LoadingScreen";

// Komponent wyższego rzędu do autoryzacji
export function withAuth<P>(Component: React.ComponentType<P>, allowUnauthenticated: boolean = false) {
    return (props: P) => {
        // Wszystkie potrzebne hooki i stany
        const { user, loading } = useUser();
        const navigate = useNavigate();

        // Efekt do przekierowania użytkownika
        useEffect(() => {
            if (!allowUnauthenticated && !loading && !user) {
                navigate("/login");
            }
        }, [user, loading]);

        if (loading) return <LoadingScreen />;
        return allowUnauthenticated || user ? <Component {...props} /> : null;
    };
}
