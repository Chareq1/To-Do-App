import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import { useUser } from './context/UserContext';
import Register from './pages/Register';

function App() {
    const { user } = useUser();

    return (
        <Routes>
            <Route path="/">
                <Route
                    path="/home"
                    element={user ? <Home /> : <Navigate to="/login" />}
                />
                <Route
                    path="/login"
                    element={!user ? <Login /> : <Navigate to="/home" />}
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
                            <Navigate to="/login" />
                        )
                    }
                />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;