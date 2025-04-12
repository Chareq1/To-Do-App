import { LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
    const { logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <button
            type="button"
            className="flex justify-center items-center w-3/4 text-[#319C0C] py-4 bg-white rounded-xl shadow-[0px_9px_30px_rgba(0,0,0,0.3)]"
            onClick={() => handleLogout()}
        >
            <LogOut size={48} fill="red" />
            <span className="ml-[-1rem] flex-[9]">Wyloguj się</span>
        </button>
    );
}

export default LogoutButton;