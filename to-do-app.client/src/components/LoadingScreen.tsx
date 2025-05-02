import { Notebook } from "lucide-react";
import { useEffect } from 'react';

// Komponent ekranu ładowania
function LoadingScreen() {
    useEffect(() => {
        document.body.classList.replace("bg-[#ffffff]", "bg-[#63c5da]");
    });
    return (
        <div className="w-screen h-screen flex items-center justify-center bg-[#0F52BA]">
            <Notebook className="animate-bounce size-3/12 white text-white" />
        </div>
    );
}

export default LoadingScreen;