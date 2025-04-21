import { useState, useEffect } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { Notebook } from "lucide-react";
import LoadingScreen from "../components/LoadingScreen";
import { useUser } from "../context/UserContext";

const Register = () => {
    //POLA
    const { loading, user, initialLoading } = useUser();
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isDisabled, setIsDisabled] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [button, setButton] = useState(<>Zarejestruj się</>);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    //Sprawdzenie, czy jakiś użytkownik jest zalogowany
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

    //Metoda do walidacji nazwy użytkownika
    const validateUsername = (username: string) => {
        const usernameRegex = /^[a-zA-Z0-9_\-\.ęąóśżźćłĘĄÓŚŻŹĆŁ]{3,40}$/;
        return usernameRegex.test(username);
    };

    //Metoda do walidacji adresu e-mail
    const validateEmail = (email: string) => {
        const emailRegex = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
        return emailRegex.test(email);
    };

    //Metoda do walidacji hasła
    const validatePassword = (password: string) => {
        const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,128}$/;
        return passwordRegex.test(password);
    };

    //Metoda do walidacji imienia
    const validateName = (name: string) => {
        const nameRegex = /^[A-Za-zęąóśżźćłĘĄÓŚŻŹĆŁ]+(?:[-' ][A-Za-zęąóśżźćłĘĄÓŚŻŹĆŁ]+)*$/;
        return nameRegex.test(name);
    };

    //Metoda do walidacji nazwiska
    const validateSurname = (surname: string) => {
        const surnameRegex = /^[A-Za-zęąóśżźćłĘĄÓŚŻŹĆŁ]+(?:[-' ][A-Za-zęąóśżźćłĘĄÓŚŻŹĆŁ]+)*$/;
        return surnameRegex.test(surname);
    };

    //Metoda do obsługi rejestracji użytkownika
    const handleRegister = async () => {
        try {
            setError(null);
            setIsDisabled(true);
            setButton(
                <>
                    <Notebook className="animate-bounce size-6/12 text-white" />
                    <span className="sr-only">Ładowanie..</span>
                </>
            );

            // Sprawdzenie, czy wszystkie pola są wypełnione
            if (!username || !name || !surname || !email || !password || !confirmPassword) {
                setError(<>Wszystkie pola są wymagane!</>);
                setIsDisabled(false);
                setButton(<>Zarejestruj się</>);
                return;
            }

            // Walidacja nazwy użytkownika
            if (!validateUsername(username)) {
                setError(<>Nazwa użytkownika zawiera niedozwolone znaki!</>);
                setIsDisabled(false);
                setButton(<>Zarejestruj się</>);
                return;
            }

            // Walidacja imienia
            if (!validateName(name)) {
                setError(<>Imię zawiera niedozwolone znaki!</>);
                setIsDisabled(false);
                setButton(<>Zarejestruj się</>);
                return;
            }

            // Walidacja nazwiska
            if (!validateSurname(surname)) {
                setError(<>Nazwisko zawiera niedozwolone znaki!</>);
                setIsDisabled(false);
                setButton(<>Zarejestruj się</>);
                return;
            }

            // Walidacja wprowadzonego adresu e-mail
            if (!validateEmail(email)) {
                setError(<>Nieprawidłowy format adresu e-mail!</>);
                setIsDisabled(false);
                setButton(<>Zarejestruj się</>);
                return;
            }

            // Walidacja wprowadzonego hasła
            if (!validatePassword(password)) {
                setError(<>Hasło musi mieć co najmniej 8 znaków, zawierać: jedną dużą i małą literę, jedną cyfrę i jeden znak specjalny!</>);
                setIsDisabled(false);
                setButton(<>Zarejestruj się</>);
                return;
            }

            // Walidacja, czy wprowadzone hasła są takie same
            if (password !== confirmPassword) {
                setError(<>Hasła muszą być takie same!</>);
                setIsDisabled(false);
                setButton(<>Zarejestruj się</>);
                return;
            }

            // Rejestracja użytkownika
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, name, surname, email, password })
            });

            // Sprawdzanie, czy wystąpił błąd
            if (!response.ok) {
                const data = await response.json();
                setError(<>{data.message}</>);
                setIsDisabled(false);
                setButton(<>Zarejestruj się</>);
                return;
            }

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (error) {
            console.error(error);
            setIsDisabled(false);
            setButton(<>Zarejestruj się</>);
            setError(<>Rejestracja nie powiodła się!</>);
        }
    };

    return (
        <div className="w-full flex items-center justify-center md:flex-row flex-col m-0 min-h-screen font-[Ubuntu]">
            { /* Lewa sekcja z obrazem*/ }
            <div className="w-full h-full md:h-screen rounded-xl items-center justify-center p-5 relative sm:flex-1 lg:flex-2 overflow-hidden">
                <img src="/Resources/login1.jpg" className="rounded-xl object-cover h-full w-full" />

                <div className="absolute text-white text-left top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <h1 className="text-5xl font-bold md:text-7xl">Witaj,</h1>
                    <h2 className="text-3xl font-semi md:text-5xl">Czas zacząć planowanie!</h2>
                </div>

                <div className="absolute top-10 left-10">
                    <Notebook size="48" color="white" />
                </div>
            </div>

            { /* Prawa sekcja z formularzem */ }
            <div className="w-full bg-[#212121] rounded-2xl flex flex-col p-5 items-center flex-1 text-left overflow-y-auto max-h-screen">
                <div className="flex flex-col items-center justify-center w-3/4 h-full py-10">
                    <label className="text-4xl text-[#e8e8e8] font-bold text-left w-full pb-10  pl-5">Zarejestruj się</label>
                    <form className="grid grid-cols-2 gap-x-4 w-full items-center px-4">
                        <div className="col-span-2">
                            <label className="pl-5 pb-1 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Nazwa użytkownika</label>
                            <input
                                type="text"
                                name="username"
                                minLength="3"
                                maxLength="40"
                                placeholder="Nazwa użytkownika"
                                className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="col-span-2 pt-5">
                            <label className="pl-5 pb-1 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="E-mail"
                                maxLength="320"
                                className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="col-span-2 md:col-span-1 pt-5">
                            <label className="pl-5 pb-1 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Imię</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Imię"
                                maxLength="255"
                                className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="col-span-2 md:col-span-1 pt-5">
                            <label className="pl-5 pb-1 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Nazwisko</label>
                            <input
                                type="text"
                                name="surname"
                                placeholder="Nazwisko"
                                maxLength="255"
                                className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                            />
                        </div>

                        <div className="col-span-2 md:col-span-1 pt-5">
                            <label className="pl-5 pb-1 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Hasło</label>
                            <input
                                type="password"
                                name="password"
                                minLength="8"
                                maxLength="128"
                                placeholder="Hasło"
                                className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="col-span-2 md:col-span-1 pt-5">
                            <label className="pl-5 pb-1 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Potwierdź</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                minLength="8"
                                maxLength="128"
                                placeholder="Potwierdź hasło"
                                className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <div className="col-span-2 pt-3 mb-10 items-center justify-center text-center">
                            <p className="text-[#FF2400]">{error}</p>
                        </div>

                        <div className="col-span-2">
                            <button
                                type="button"
                                className="flex rounded-full items-center justify-center text-white h-12 bg-[#2775EE] md:text-base lg:text-lg shadow-[0px_9px_30px_rgba(0,0,0,0.3)] w-full"
                                onClick={handleRegister}
                                disabled={isDisabled}
                            >
                                {button}
                            </button>
                        </div>

                        <div className="col-span-2 pt-3 items-center justify-center text-center">
                            <p className="text-[#E8E8E8]">Masz już konto? &nbsp;
                                <Link to="/login" className="text-[#2775EE]">Zaloguj się</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;