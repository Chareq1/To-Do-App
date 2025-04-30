import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar'
import { useUser } from './context/UserContext';
import Register from './pages/Register';
import User from './pages/User';
import LoadingScreen from './components/LoadingScreen';

function App() {
    const { user, initialLoading } = useUser(); // Use initialLoading to wait for auth state
    const location = useLocation(); // Get the current location

    // Show a loading screen while the authentication state is being determined
    if (initialLoading) {
        return <LoadingScreen />;
    }

    return (
        <Routes>
            <Route path="/">
                <Route
                    path="/home"
                    element={user ? <Home /> : <Navigate to="/login" state={{ from: location }} />}
                />

                <Route
                    path="/user"
                    element={user ? <User /> : <Navigate to="/login" state={{ from: location }} />}
                />

                <Route
                    path="/tasks"
                    element={user ? <Tasks /> : <Navigate to="/login" state={{ from: location }} />}
                />

                <Route
                    path="/calendar"
                    element={user ? <Calendar /> : <Navigate to="/login" state={{ from: location }} />}
                />

                <Route
                    path="/login"
                    element={
                        !user ? (
                            <Login />
                        ) : (
                            <Navigate to={location.state?.from?.pathname || "/home"} />
                        )
                    }
                />

                <Route
                    path="/register"
                    element={!user ? <Register /> : <Navigate to="/home" />}
                />

                <Route
                    index
                    element={
                        user ? (
                            <Navigate to="/home" />
                        ) : (
                            <Navigate to="/login" state={{ from: location }} />
                        )
                    }
                />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
