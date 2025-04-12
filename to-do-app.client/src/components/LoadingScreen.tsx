import { Notebook } from "lucide-react";
import { useEffect } from 'react';

function LoadingScreen() {
    useEffect(() => {
        document.body.classList.replace("bg-[#ffffff]", "bg-[#63c5da]");
    });
    return (
        <div className="w-screen h-screen flex items-center justify-center bg-[#63c5da]">
            <Notebook className="animate-bounce size-3/12 white text-white" />
        </div>
    );
}

export default LoadingScreen;