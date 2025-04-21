import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import LoadingScreen from "../components/LoadingScreen";

export function withAuth<P>(Component: React.ComponentType<P>, allowUnauthenticated: boolean = false) {
    return (props: P) => {
        const { user, loading } = useUser();
        const navigate = useNavigate();

        useEffect(() => {
            if (!allowUnauthenticated && !loading && !user) {
                navigate("/login");
            }
        }, [user, loading]);

        if (loading) return <LoadingScreen />;
        return allowUnauthenticated || user ? <Component {...props} /> : null;
    };
}
