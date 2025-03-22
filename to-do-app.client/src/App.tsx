import { useEffect, useState } from 'react';
import './App.css';

interface Avatar {
    avatarId: string;
    fileName: string;
    filePath: string;
}

function App() {
    const [avatars, setAvatars] = useState<Avatar[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        populateAvatarData();
    }, []);

    const contents = loading
        ? <p><em>Loading... Please refresh once the ASP.NET backend has started. See <a href="https://aka.ms/jspsintegrationreact">https://aka.ms/jspsintegrationreact</a> for more details.</em></p>
        : error
            ? <p><em>Error: {error}</em></p>
            : <table className="table table-striped" aria-labelledby="tableLabel">
                <thead>
                    <tr>
                        <th>AvatarId</th>
                        <th>FileName</th>
                        <th>FilePath</th>
                    </tr>
                </thead>
                <tbody>
                    {avatars.map(avatar =>
                        <tr key={avatar.avatarId}>
                            <td>{avatar.avatarId}</td>
                            <td>{avatar.fileName}</td>
                            <td>{avatar.filePath}</td>
                        </tr>
                    )}
                </tbody>
            </table>;

    return (
        <div>
            <h1 id="tableLabel">Avatar List</h1>
            <p>This component demonstrates fetching data from the server.</p>
            <button onClick={populateAvatarData}>Refresh Data</button>
            {contents}
        </div>
    );

    async function populateAvatarData() {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/Avatar");
            if (response.ok) {
                const data = await response.json();
                setAvatars(data);
            } else {
                setError("Failed to fetch data");
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setLoading(false);
        }
    }
}

export default App;