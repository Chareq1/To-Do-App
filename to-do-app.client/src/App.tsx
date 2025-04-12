import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Login from './pages/Login';
import { useUser } from './context/UserContext';

function App() {
    const { user } = useUser();

    return (
        <Routes>
            <Route path="/">
                <Route path="login" element={<Login />} />
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
                <Route path="home" element={<Home />} />
            </Route>
        </Routes>
    );
}

export default App;