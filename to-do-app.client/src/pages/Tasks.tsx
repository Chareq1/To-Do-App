import '../App.css';
import { withAuth } from '../services/withAuth';
import { useUser } from '../context/UserContext';
import LoadingScreen from '../components/LoadingScreen';
import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { useNavigate } from 'react-router-dom';
import { Notebook, Settings, Trash2, Save } from 'lucide-react';

function Tasks() {
    // POLA
    const { user, loggingOut, refreshData } = useUser();
    const [isLoading, setIsLoading] = useState(false);


    // Metoda do ładowania danych za każdym razem, gdy jakieś zmiany zajdą z użytkownikiem
    useEffect(() => {
        setIsLoading(true);
        document.body.classList.add("bg-[#212121]");
        document.body.classList.replace("bg-[#ffffff]", "bg-[#212121]");

        setTimeout(() => {
            setIsLoading(false);
        }, 1500);
    }, [user]);


    return (
        loggingOut ? (
            <LoadingScreen />
        ) : (
            <div className="flex w-full min-h-screen flex-row font-[Ubuntu] overflow-y-auto max-h-screen overflow-x-hidden">
                <div className="p-5">
                    <Navigation />
                </div>
                <div className="flex flex-col w-full pb-5 pt-5 pr-5 text-[#E8E8E8] max-h-screen min-h-screen">
                    <div className="flex flex-col h-full w-full bg-[#313131] rounded-xl overflow-hidden">
                        <div className="p-5 w-full">
                            <h1 className="font-bold text-4xl h-full">Zadania</h1>
                        </div>
                        <div className="w-full h-full flex flex-col justify-start items-center md:justify-center overflow-y-auto p-5">
                            {isLoading ? (
                                <div
                                    role="status"
                                    className="flex items-center justify-center w-full h-full"
                                >
                                    <Notebook className="animate-bounce size-1/4 text-[#E8E8E8]" />
                                    <span className="sr-only">Ładowanie...</span>
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    );
}

export default withAuth(Tasks);
