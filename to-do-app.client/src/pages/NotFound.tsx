import '../App.css';
import { withAuth } from '../services/withAuth';
import { useUser } from '../context/UserContext'
import LoadingScreen from '../components/LoadingScreen';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notebook } from 'lucide-react';

// Strona błędu 404
function NotFound() {
    // Wszystkie potrzebne hooki i stany
    const { user, loggingOut, loading } = useUser();
    const [button, setButton] = useState(<>Zaloguj się</>);
    const navigate = useNavigate();

    // Efekt do ustawienia tła strony i tekstu przycisku
    useEffect(() => {
        document.body.classList.add("bg-[#212121]");
        document.body.classList.replace("bg-[#ffffff]", "bg-[#212121]");

        if (user) {
            setButton(<>Wróć do ekranu głównego</>)
        }
        else {
            setButton(<>Wróć do ekranu logowania</>)
        }
    }, []);

    // Funkcja do obsługi przekierowania w zależności od stanu użytkownika
    function handleNotFound() {
        if (user) {
            navigate("/home")
        }
        else {
            navigate("/login")
        }
    }

    return (
        loggingOut ? (
            <LoadingScreen />
        ) : (
            <div className="flex flex-col h-full w-full items-center justify-center text-center font-[Ubuntu] p-5 md:h-screen rounded-xl relative overflow-hidden">
                <img src="/Resources/login1.jpg" className="rounded-xl object-cover h-full w-full" />

                <div className="absolute text-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center justify-center">
                    <p className="text-[#2775EE] font-semibold text-base"><Notebook size="64" color="white" /></p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance text-white md:text-7xl md:mt-5">Strona nie znaleziona</h1>
                    <p className="mt-2 text-base font-medium text-pretty md:text-xl/8 text-white md:mt-5">Coś poszło chyba nie tak?</p>
                    <button
                        type="button"
                        className="mt-5 flex rounded-full items-center justify-center text-white h-12 bg-[#2775EE] md:text-base lg:text-lg shadow-[0px_9px_30px_rgba(0,0,0,0.3)] p-5 md:mt-10"
                        onClick={handleNotFound}
                    >
                        {button}
                    </button>
                </div>
            </div>
        )
    );
};

export default withAuth(NotFound, true);
