import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from './context/UserContext.tsx'

const rootElement = document.getElementById('root')!;
rootElement.className = "w-full p-0 m-0 g-full";

createRoot(rootElement).render(
    <StrictMode>
        <UserProvider>
            <BrowserRouter>
                <div className="flex justify-center items-center content-center w-full">
                    <App />
                </div>
            </BrowserRouter>
        </UserProvider>
    </StrictMode>,
)


