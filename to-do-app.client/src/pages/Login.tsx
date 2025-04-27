import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { Notebook, LogIn } from "lucide-react";
import LoadingScreen from "../components/LoadingScreen";

const Login = () => {
    const { user, login, loading, initialLoading } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isDisabled, setIsDisabled] = useState(false);
    const [button, setButton] = useState(<><LogIn className="w-5 h-5 mr-2" /><p className="">Zaloguj się</p></>);
    const [authLoading, setAuthLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add("bg-[#212121]");
        document.body.classList.replace("bg-[#ffffff]", "bg-[#212121]");

        if (!loading && user) {
            setAuthLoading(true);
            setTimeout(() => {
                setAuthLoading(false);
                navigate("/home");
            }, 1500);
        }
    }, [loading, user]);

    if (loading || initialLoading || authLoading) {
        return <LoadingScreen />;
    }

    if (user) {
        return <Navigate to="/" />;
    }

    const handleLogin = async () => {
        try {
            setError(null);
            setIsDisabled(true);
            setButton(
                <>
                    <Notebook className="animate-bounce size-6/12 text-white" />
                    <span className="sr-only">Ładowanie..</span>
                </>
            );

            if (!email) {
                setError(<>Proszę wprowadzić e-mail użytkownika!</>);
                setIsDisabled(false);
                setButton(<><LogIn className="w-5 h-5 mr-2" /><p className="">Zaloguj się</p></>);
            } else if (!password) {
                setError(<>Proszę wprowadzić hasło użytkownika!</>);
                setIsDisabled(false);
                setButton(<><LogIn className="w-5 h-5 mr-2" /><p className="">Zaloguj się</p></>);
            } else {
                await login(email, password);
                setTimeout(() => {
                    navigate("/home");
                }, 1500);
            }
        } catch (error) {
            console.error(error);
            setIsDisabled(false);
            setButton(<><LogIn className="w-5 h-5 mr-2" /><p className="">Zaloguj się</p></>);
            setError(<>Nieporawny e-mail lub hasło użytkownika!</>);
        }
    };

    return (
        <div className="w-full flex items-center justify-center md:flex-row flex-col m-0 min-h-screen font-[Ubuntu]">
            {/* Left Section with Image */}
            <div className="w-full h-full md:h-screen rounded-xl items-center justify-center p-5 relative sm:flex-1 lg:flex-2 overflow-hidden">
                <img src="/Resources/login1.jpg" className="rounded-xl object-cover h-full w-full" />

                <div className="absolute text-white text-left top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <h1 className="text-5xl font-bold md:text-7xl">Hej,</h1>
                    <h2 className="text-3xl font-semi md:text-5xl">Gotowy na planowanie?</h2>
                </div>

                <div className="absolute top-10 left-10">
                    <Notebook size="48" color="white" />
                </div>
            </div>

            {/* Right Section with Form */}
            <div className="w-full bg-[#212121] rounded-2xl flex flex-col items-start justify-start md:items-center md:justify-center flex-1 text-left overflow-y-auto h-full p-5">
                <div className="flex flex-col items-center justify-center w-full max-w-lg">
                    <label className="text-4xl text-[#e8e8e8] font-bold text-left w-3/4 pl-5 pb-10">Zaloguj się</label>
                    <form className="flex flex-col w-full px-4 items-center justify-center">
                        <label className="pl-5 pb-1 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-3/4">E-mail</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="E-mail"
                            maxLength="320"
                            className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-3/4"
                            value={email}
                            onChange={(e) => { setError(null); setEmail(e.target.value); }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter")
                                    document.getElementsByName("password")[0].focus();
                            }}
                        />

                        <label className="pl-5 pb-1 md:text-sm lg:text-base font-bold pt-5 text-[#e8e8e8] w-3/4">Hasło</label>
                        <input
                            type="password"
                            name="password"
                            maxLength="128"
                            placeholder="Hasło"
                            className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-3/4"
                            value={password}
                            onChange={(e) => { setError(null); setPassword(e.target.value); }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleLogin();
                            }}
                        />

                        <div className="pt-3 pb-10">
                            <p className="text-[#FF2400]">{error}</p>
                        </div>

                        <button
                            type="button"
                            className="flex rounded-full items-center justify-center text-white h-12 bg-[#2775EE] md:text-base lg:text-lg shadow-[0px_9px_30px_rgba(0,0,0,0.3)] hover:bg-[#0F52BA] w-3/4 "
                            onClick={handleLogin}
                            disabled={isDisabled}
                        >
                            {button}
                        </button>

                        <div className="pt-3">
                            <p className="text-[#E8E8E8]">Nie masz konta? &nbsp;
                                <Link to="/register" className="text-[#2775EE]">Zarejestruj się</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
