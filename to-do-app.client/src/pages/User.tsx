import '../App.css';
import { withAuth } from '../services/withAuth';
import { useUser } from '../context/UserContext';
import LoadingScreen from '../components/LoadingScreen';
import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { useNavigate } from 'react-router-dom';
import { Notebook, Settings, Trash2, Save } from 'lucide-react';

// Interfejs do reprezentacji avatara
interface Avatar {
    avatarId: string;
    fileName: string;
    filePath: string;
}

// Strona użytkownika
function User() {
    // Wszystkie potrzebne hooki i stany
    const { user, loggingOut, refreshData } = useUser();
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [avatar, setAvatar] = useState<Avatar | null>(null);
    const [isEditable, setIsEditable] = useState(true);
    const [isChecked, setIsChecked] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isDisabled, setIsDisabled] = useState(true);
    const [button, setButton] = useState(<><Save className="w-5 h-5 lg:mr-2" /><p className="hidden lg:block">Zapisz</p></>);
    const [isLoading, setIsLoading] = useState(false);


    // Efekt do ładowania danych użytkownika
    useEffect(() => {
        setIsLoading(true);
        document.body.classList.add("bg-[#212121]");
        document.body.classList.replace("bg-[#ffffff]", "bg-[#212121]");

        const fetchAvatar = async () => {
            if (user?.avatarId) {
                const response = await fetch(`/api/Avatar/${user.avatarId}`);
                if (response.ok) {
                    const avatar = await response.json();
                    setAvatar(avatar);
                }
            }
        };

        fetchAvatar();

        setUsername(user?.username || "");
        setName(user?.name || "");
        setSurname(user?.surname || "");
        setEmail(user?.email || "");
        setPhone(user?.phone || "");

        setTimeout(() => {
            setIsLoading(false);
        }, 1500);
    }, [user]);

    const navigate = useNavigate();

    // Funkcja do walidacji numeru telefonu
    const validatePhone = (phone: string) => {
        const phoneRegex = /^[0-9]{9}$/;
        return phoneRegex.test(phone);
    };

    // Funkcja do walidacji adresu e-mail
    const validateEmail = (email: string) => {
        const emailRegex = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
        return emailRegex.test(email);
    };

    // Funkcja do walidacji hasła
    const validatePassword = (password: string) => {
        const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,128}$/;
        return passwordRegex.test(password);
    };

    // Funkcja do walidacji imienia
    const validateName = (name: string) => {
        const nameRegex = /^[A-Za-zęąóśżźćłĘĄÓŚŻŹĆŁ]+(?:[-' ][A-Za-zęąóśżźćłĘĄÓŚŻŹĆŁ]+)*$/;
        return nameRegex.test(name);
    };

    // Funkcja do walidacji nazwiska
    const validateSurname = (surname: string) => {
        const surnameRegex = /^[A-Za-zęąóśżźćłĘĄÓŚŻŹĆŁ]+(?:[-' ][A-Za-zęąóśżźćłĘĄÓŚŻŹĆŁ]+)*$/;
        return surnameRegex.test(surname);
    };

    // Funkcja do obsługi usuwania konta
    const handleDelete = async () => {
        try {
            const confirmDelete = window.confirm("Czy na pewno chcesz usunąć swoje konto? Tej operacji nie można cofnąć.");

            if (!confirmDelete) {
                return;
            }

            const response = await fetch(`/api/User/${user?.userId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(<>errorData.message</>);
                return;
            }

            setSuccess("Twoje konto zostało pomyślnie usunięte.");
            setTimeout(() => {
                refreshData();
            }, 2000);
        }
        catch (error) {
            console.error(error);
            setError("Wystąpił błąd przy usuwaniu użytkownika!");
            refreshData();
        }
        finally {
            setButton(<><Save className="w-5 h-5 lg:mr-2" /><p className="hidden lg:block">Zapisz</p></>);
        }
    }

    // Funkcja do obsługi aktualizacji danych
    const handleUpdate = async () => {
        try {
            let patchDoc = [
            ];

            setError(null);
            setSuccess(null);
            setIsDisabled(true);
            setButton(
                <>
                    <Notebook className="animate-bounce size-6/12 text-white" />
                    <span className="sr-only">Ładowanie..</span>
                </>
            );

            // Sprawdzenie, czy wszystkie wymagane pola są uzupełnione
            if (!username || !name || !surname || !email) {
                setError(<>Wszystkie pola są wymagane!</>);
                setIsDisabled(false);
                setButton(<><Save className="w-5 h-5 lg:mr-2" /><p className="hidden lg:block">Zapisz</p></>);
                return;
            }

            // Walidacja numeru telefonu
            if (phone != user?.phone && !validatePhone(phone)) {
                setError(<>Numer telefonu zawiera niedozwolone znaki!</>);
                setIsDisabled(false);
                setButton(<><Save className="w-5 h-5 lg:mr-2" /><p className="hidden lg:block">Zapisz</p></>);
                return;
            }

            // Walidacja imienia
            if (name != user?.name && !validateName(name)) {
                setError(<>Imię zawiera niedozwolone znaki!</>);
                setIsDisabled(false);
                setButton(<><Save className="w-5 h-5 lg:mr-2" /><p className="hidden lg:block">Zapisz</p></>);
                return;
            }

            // Walidacja nazwiska
            if (surname != user?.surname && !validateSurname(surname)) {
                setError(<>Nazwisko zawiera niedozwolone znaki!</>);
                setIsDisabled(false);
                setButton(<><Save className="w-5 h-5 lg:mr-2" /><p className="hidden lg:block">Zapisz</p></>);
                return;
            }

            // Walidacja wprowadzonego adresu e-mail
            if (email != user?.email && !validateEmail(email)) {
                setError(<>Nieprawidłowy format adresu e-mail!</>);
                setIsDisabled(false);
                setButton(<><Save className="w-5 h-5 lg:mr-2" /><p className="hidden lg:block">Zapisz</p></>);
                return;
            }

            // Walidacja wprowadzonego hasła
            if (password && !validatePassword(password)) {
                setError(<>Hasło musi mieć co najmniej 8 znaków, zawierać: jedną dużą i małą literę, jedną cyfrę i jeden znak specjalny!</>);
                setIsDisabled(false);
                setButton(<><Save className="w-5 h-5 lg:mr-2" /><p className="hidden lg:block">Zapisz</p></>);
                return;
            }

            // Walidacja, czy wprowadzone hasła są takie same
            if (password != confirmPassword) {
                setError(<>Hasła muszą być takie same!</>);
                setIsDisabled(false);
                setButton(<><Save className="w-5 h-5 lg:mr-2" /><p className="hidden lg:block">Zapisz</p></>);
                return;
            }

            if (name != user?.name) {
                patchDoc.push({ op: "replace", path: "/name", value: name });
            }

            if (surname != user?.surname) {
                patchDoc.push({ op: "replace", path: "/surname", value: surname });
            }

            if (email != user?.email) {
                patchDoc.push({ op: "replace", path: "/email", value: email });
            }

            if (phone != user?.phone) {
                patchDoc.push({ op: "replace", path: "/phone", value: phone });
            }

            if (password && confirmPassword && password == confirmPassword) {
                patchDoc.push({ op: "replace", path: "/password", value: password });
            }

            const response = await fetch(`/api/User/${user?.userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json-patch+json",
                },
                body: JSON.stringify(patchDoc),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(<>{data.message}</>);
                setIsDisabled(false);
                setButton(<><Save className="w-5 h-5 lg:mr-2" /><p className="hidden lg:block">Zapisz</p></>);
                return;
            }

            setSuccess("Dane użytkownika zostały zmienione pomyślnie!");
            handleEditorial();
            refreshData();
        } catch (error) {
            console.error(error);
            setError("Wystąpił błąd przy aktualizacji danych użytkownika!");
            handleEditorial();
            refreshData();
        } finally {
            setButton(<><Save className="w-5 h-5 lg:mr-2" /><p className="hidden lg:block">Zapisz</p></>);
        }
    };

    // Funkcja do wysyłania avatara na serwer
    const handleUploadAvatar = async () => {
        if (!isEditable) {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";

            input.onchange = async (event: Event) => {
                const target = event.target as HTMLInputElement;
                if (target.files && target.files[0]) {
                    const file = target.files[0];

                    const formData = new FormData();
                    formData.append("file", file);

                    try {
                        setError(null);
                        setSuccess(null);
                        setIsDisabled(true);
                        setButton(
                            <>
                                <Notebook className="animate-bounce size-6/12 text-white" />
                                <span className="sr-only">Ładowanie..</span>
                            </>
                        );

                        const avatarResponse = await fetch(`/api/Avatar?userId=${user?.userId}`, {
                            method: "POST",
                            body: formData,
                        });

                        if (!avatarResponse.ok) {
                            const avatarError = await avatarResponse.json();
                            setError(avatarError.message);
                            setIsDisabled(false);
                            setButton(<><Save className="w-5 h-5 lg:mr-2" /><p className="hidden lg:block">Zapisz</p></>);
                            return;
                        }

                        const avatarData = await avatarResponse.json();

                        const patchDoc = [
                            { op: "replace", path: "/avatarId", value: avatarData.avatarId },
                        ];

                        const userResponse = await fetch(`/api/User/${user?.userId}`, {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json-patch+json",
                            },
                            body: JSON.stringify(patchDoc),
                        });

                        if (!userResponse.ok) {
                            const userError = await userResponse.json();
                            setError(userError.message);
                            setIsDisabled(false);
                            setButton(<><Save className="w-5 h-5 lg:mr-2" /><p className="hidden lg:block">Zapisz</p></>);
                            return;
                        }

                        setSuccess("Avatar został dodany pomyślnie!");
                        handleEditorial();
                        refreshData();
                    } catch (error) {
                        console.error(error);
                        setError("Wystąpił błąd podczas dodawania avataru!");
                    } finally {
                        setButton(<><Save className="w-5 h-5 lg:mr-2" /><p className="hidden lg:block">Zapisz</p></>);
                    }
                }
            };

            input.click();
        }
    };

    // Funkcja do obsługi trybu edycji
    const handleEditorial = () => {
        setIsEditable(!isEditable)
        setIsChecked(!isChecked);
        setIsDisabled(!isDisabled);

        setTimeout(() => {
            setError(null);
            setSuccess(null);
        }, 10000);
    };

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
                            <h1 className="font-bold text-4xl h-full">Użytkownik</h1>
                        </div>
                        <div className="w-full h-full flex flex-col justify-start items-center md:justify-center overflow-y-auto p-5">
                            {isLoading ? (
                                // Sprawdzenie stanu ładowania
                                <div
                                    role="status"
                                    className="flex items-center justify-center w-full h-full"
                                >
                                    <Notebook className="animate-bounce size-1/4 text-[#E8E8E8]" />
                                    <span className="sr-only">Ładowanie...</span>
                                </div>
                            ) : (
                                <><div
                                    className={`relative w-40 h-40 border-solid border-[#2775EE] border-5 rounded-full mb-5 md:mb-10 ${!isEditable ? "cursor-pointer group" : ""
                                        }`}
                                    onClick={handleUploadAvatar}
                                >
                                    {avatar ? (
                                        <img
                                            src={`${avatar.filePath}${avatar.fileName}`}
                                            alt="User Avatar"
                                            style={{ aspectRatio: "1 / 1" }}
                                            className={`w-full h-full rounded-full object-cover transition-opacity ${!isEditable ? "group-hover:opacity-20" : ""
                                                }`}
                                        />
                                    ) : (
                                        <p>Ładowanie awatara...</p>
                                    )}

                                    {!isEditable && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Settings className=" w-10 h-10 font-bold text-white" />
                                        </div>
                                    )}
                                </div>

                                    <form className="grid grid-cols-2 w-full items-center md:w-1/2 gap-x-4 px-4 overflow-y-auto">
                                        <div className="flex flex-col col-span-2 xl:col-span-1 pl-5">
                                            <label className="pb-1 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Nazwa użytkownika</label>
                                            <p className="">{username}</p>
                                        </div>

                                        <div className="col-span-2 pt-5 xl:col-span-1 xl:pt-0">
                                            <label className="pl-5 pb-1 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">E-mail</label>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="E-mail"
                                                maxLength={320}
                                                className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                                value={email}
                                                readOnly={isEditable}
                                                onChange={(e) => { setError(null); setEmail(e.target.value) }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter")
                                                        document.getElementsByName("name")[0].focus();
                                                }} />

                                        </div>

                                        <div className="col-span-2 md:col-span-1 pt-5">
                                            <label className="pl-5 pb-1 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Imię</label>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Imię"
                                                maxLength={255}
                                                className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                                value={name}
                                                readOnly={isEditable}
                                                onChange={(e) => { setError(null); setName(e.target.value) }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter")
                                                        document.getElementsByName("surname")[0].focus();
                                                }} />
                                        </div>

                                        <div className="col-span-2 md:col-span-1 pt-5">
                                            <label className="pl-5 pb-1 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Nazwisko</label>
                                            <input
                                                type="text"
                                                name="surname"
                                                placeholder="Nazwisko"
                                                maxLength={255}
                                                readOnly={isEditable}
                                                className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                                value={surname}
                                                onChange={(e) => { setError(null); setSurname(e.target.value) }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter")
                                                        document.getElementsByName("phone")[0].focus();
                                                }} />
                                        </div>

                                        <div className="col-span-2 pt-5">
                                            <label className="pl-5 pb-1 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Telefon</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                placeholder="Telefon"
                                                maxLength={9}
                                                className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                                value={phone}
                                                readOnly={isEditable}
                                                onChange={(e) => { setError(null); setPhone(e.target.value) }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter")
                                                        document.getElementsByName("password")[0].focus();
                                                }} />
                                        </div>

                                        <div className={`col-span-2 pt-5 md:col-span-1 ${isEditable ? "hidden" : ""}`}>
                                            <label className="pl-5 pb-1 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Hasło</label>
                                            <input
                                                type="password"
                                                name="password"
                                                minLength={8}
                                                maxLength={128}
                                                placeholder="Hasło"
                                                className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                                value={password}
                                                onChange={(e) => { setError(null); setPassword(e.target.value) }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter")
                                                        document.getElementsByName("confirmPassword")[0].focus();
                                                }} />
                                        </div>

                                        <div className={`col-span-2 pt-5 md:col-span-1 ${isEditable ? "hidden" : ""}`}>
                                            <label className="pl-5 pb-1 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Potwierdź</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                minLength={8}
                                                maxLength={128}
                                                placeholder="Potwierdź hasło"
                                                className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                                value={confirmPassword}
                                                onChange={(e) => { setError(null); setConfirmPassword(e.target.value) }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleUpdate();
                                                }} />
                                        </div>

                                        <div className="col-span-2 pt-3 mb-5 md:mb-10 items-center justify-center text-center pt-5">
                                            <p className="text-[#FF2400]">{error}</p>
                                            <p className="text-[#3CB043]">{success}</p>
                                        </div>

                                        <div className="col-span-1 flex items-center justify-center">
                                            <button
                                                type="button"
                                                className="flex rounded-full items-center justify-center text-white h-12 bg-[#2775EE]  hover:bg-[#0F52BA] md:text-base lg:text-lg shadow-[0px_9px_30px_rgba(0,0,0,0.3)] w-3/4"
                                                onClick={handleUpdate}
                                                disabled={isDisabled}
                                            >
                                                {button}
                                            </button>
                                        </div>

                                        <div className="flex flex-col col-span-1 flex items-center justify-center">
                                            <label className="pl-2 text-xs md:text-base pb-1 font-bold">Edycja danych</label>
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded-full accent-[#2775EE]"
                                                id="editorialCheckboxs"
                                                onChange={handleEditorial}
                                                checked={isChecked} />
                                        </div>

                                        <div className="col-span-2 flex items-center justify-center">
                                            <button
                                                type="button"
                                                className="flex rounded-full mt-5 md:mt-10 items-center justify-center text-white h-12 bg-[#D0312D] text-white hover:bg-[#B90E0A] md:text-base lg:text-lg shadow-[0px_9px_30px_rgba(0,0,0,0.3)] w-1/2 md: 1/4"
                                                onClick={handleDelete}
                                            >
                                                <Trash2 className="w-5 h-5 lg:mr-2" /><p className="hidden lg:block">Usuń konto</p>
                                            </button>
                                        </div>
                                    </form></>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    );
}

export default withAuth(User);
