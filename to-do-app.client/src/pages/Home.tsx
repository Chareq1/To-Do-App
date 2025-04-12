import '../App.css';
import Navbar from '../components/Navbar';
import { withAuth } from '../services/withAuth';

function Home() {
    return (
        <div>
            <Navbar />
            <div>
                <h1>Test</h1>
            </div>
        </div>
    );
};

export default withAuth(Home);
