import '../App.css';
import Navbar from '../components/Navbar';
import { withAuth } from '../services/withAuth';
import { useUser } from '../context/UserContext'
import LoadingScreen from '../components/LoadingScreen';
import { clear } from 'console';

function Home() {
    const { user, loggingOut, loading } = useUser();

    return (
         loggingOut ? (
            <LoadingScreen />
        ) : (
        <div>
            <Navbar />
            <div>
                <h1>Użytkownik</h1>
                <div>{user?.userId}</div>
                <div>{user?.username}</div>
                <div>{user?.email}</div>
                <div>{user?.name}</div>
                <div>{user?.surname}</div>
                <div>{user?.phone}</div>
                <div>{user?.avatarId}</div>
            </div>
                </div>
        )
    );
};

export default withAuth(Home);
