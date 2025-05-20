import '../App.css';
import { withAuth } from '../services/withAuth';
import { useUser } from '../context/UserContext';
import LoadingScreen from '../components/LoadingScreen';
import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { Notebook, Plus, Edit, Trash2, Eye, ChevronDown, ChevronRight, Download, ClockAlert } from 'lucide-react';
import SlidingPane from 'react-sliding-pane';
import 'react-sliding-pane/dist/react-sliding-pane.css';
import React from 'react';
import * as Icons from 'lucide-react';
import IconSelect from '../components/IconSelect';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

// Interfejs do reprezentacji zasobów
interface Resource {
    resourceId: string;
    resourceType: string;
    fileName: string;
    filePath: string;
    taskId: string;
    uploadDate: Date;
}

// Interfejs do reprezentacji kategorii
interface Category {
    categoryId: string;
    colorHex: string;
    iconName: string;
    userId: string;
    name: string;
}

// Interfejs do reprezentacji zadań
interface Task {
    taskId: string;
    name: string;
    description: string;
    status: string;
    priority: string;
    categoryId: string;
    createdAt: Date;
    dueDate: Date;
    doneDate: Date;
    userId: string;
    resources: Resource[];
}

// Strona do zarządzania zadaniami
function Tasks() {
    // Wszystkie potrzebne hooki i stany
    const { user, loggingOut } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [panelContent, setPanelContent] = useState<string | null>(null);
    const [panelData, setPanelData] = useState<any>(null);
    const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);
    const [selectedIcon, setSelectedIcon] = useState("Notebook");
    const [isDisabled, setIsDisabled] = useState(false);
    const [button, setButton] = useState(<><Plus className="w-5 h-5 lg:mr-2" /><p className="block">Dodaj</p></>);
    const [error, setError] = useState<string | null>(null);

    // Efekt do ładowania danych
    useEffect(() => {
        setIsLoading(true);
        document.body.classList.add("bg-[#212121]");
        document.body.classList.replace("bg-[#ffffff]", "bg-[#212121]");

        Promise.all([fetchCategories(), fetchTasks()])
            .then(([categories, tasks]) => {
                setCategories(categories);
                setTasks(tasks);

                const categoryIds = categories.map((category) => category.categoryId);
                setCollapsedCategories([...categoryIds, "no-category"]);

                setTimeout(() => {
                    setIsLoading(false);
                }, 1500);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setTimeout(() => {
                    setIsLoading(false);
                }, 1500);
            });
    }, [user]);

    // Funkcja do pobierania kategorii
    const fetchCategories = async () => {
        const response = await fetch(`/api/Category/user/${user?.userId}`);

        if (!response.ok) {
            alert("Nie udało się pobrać kategorii!");
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
        return response.json();
    };

    // Funkcja do pobierania zadań
    const fetchTasks = async () => {
        const response = await fetch(`/api/Task/user/${user?.userId}`);

        if (!response.ok) {
            alert("Nie udało się pobrać zadań!");
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
        const tasks = await response.json();

        const tasksWithDetails = await Promise.all(
            tasks.map(async (task: Task) => {
                const [resourcesResponse] = await Promise.all([
                    fetch(`/api/Resource/task/${task.taskId}`)
                ]);

                if (!resourcesResponse.ok) {
                    alert("Nie udało się pobrać plików!");
                    const errorData = await resourcesResponse.json();
                    throw new Error(errorData.message);
                }

                const resources = await resourcesResponse.json();

                return { ...task, resources };
            })
        );

        return tasksWithDetails;
    };

    // Funkcja do otwierania panelu
    const openPanel = (content: string, data: any = null) => {
        setPanelContent(content);
        setPanelData(data);
        setIsPanelOpen(true);
    };

    // Funkcja do zamykania panelu
    const closePanel = () => {
        setIsPanelOpen(false);
        setPanelContent(null);
        setPanelData(null);
        setError(null);
    };

    // Funkcja do obsługi przesyłania pliku
    const handleUploadFile = async (file: File, taskId: string) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("taskId", taskId);

        try {
            const response = await fetch(`/api/Resource?taskId=${taskId}`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                alert("Nie udało się przesłać pliku!");
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            const updatedResourcesResponse = await fetch(`/api/Resource/task/${taskId}`);
            if (!updatedResourcesResponse.ok) {
                alert("Nie udało się pobrać zaktualizowanych plików!");
                const errorData = await updatedResourcesResponse.json();
                throw new Error(errorData.message);
            }
            const updatedResources = await updatedResourcesResponse.json();

            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.taskId === taskId ? { ...task, resources: updatedResources } : task
                )
            );

            if (panelData?.taskId === taskId) {
                setPanelData((prevPanelData) => ({
                    ...prevPanelData,
                    resources: updatedResources,
                }));
            }
        } catch (error) {
            alert("Nie udało się przesłać pliku!");
            console.error("Błąd podczas przesyłania pliku:", error);
        }
    };

    // Funkcja do obsługi pobierania pliku
    const handleDownloadFileFromURL = (filePath: string, fileName: string) => {
        try {
            const a = document.createElement("a");
            a.href = filePath + fileName;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
        } catch (error) {
            alert("Nie udało się pobrać pliku!");
            console.error("Błąd podczas pobierania pliku:", error);
        }
    };

    // Funkcja do obsługi usuwania kategorii
    const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
        const confirmDelete = window.confirm(`Czy na pewno chcesz usunąć kategorię: "${categoryName}"?`);

        if (!confirmDelete) {
            return;
        }

        const response = await fetch(`/api/Category/${categoryId}`, {
            method: "DELETE",
        });

        const updatedCategories = await fetchCategories();
        setCategories(updatedCategories);
    };

    // Funkcja do obsługi usuwania zadania
    const handleDeleteTask = async (taskId: string, taskName: string) => {
        const confirmDelete = window.confirm(`Czy na pewno chcesz usunąć zadanie: "${taskName}"?`);

        if (!confirmDelete) {
            return;
        }

        const response = await fetch(`/api/Task/${taskId}`, {
            method: "DELETE",
        });

        const updatedTasks = await fetchTasks();
        setTasks(updatedTasks);
    };

    // Funkcja do obsługi usuwania zasobu
    const handleDeleteResource = async (resourceId: string, resourceName: string, taskId: string) => {
        const confirmDelete = window.confirm(`Czy na pewno chcesz usunąć plik: "${resourceName}"?`);

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await fetch(`/api/Resource/${resourceId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                alert("Nie udało się usunąć pliku!");
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            const updatedResourcesResponse = await fetch(`/api/Resource/task/${taskId}`);
            if (!updatedResourcesResponse.ok) {
                alert("Nie udało się pobrać zaktualizowanych plików!");
                const errorData = await updatedResourcesResponse.json();
                throw new Error(errorData.message);
            }
            const updatedResources = await updatedResourcesResponse.json();

            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task.taskId === taskId ? { ...task, resources: updatedResources } : task
                )
            );

            if (panelData?.taskId === taskId) {
                setPanelData((prevPanelData) => ({
                    ...prevPanelData,
                    resources: updatedResources,
                }));
            }
        } catch (error) {
            alert("Nie udało się usunąć pliku!");
            console.error("Błąd podczas usuwania pliku:", error);
        }
    };

    // Funkcja do aktualizacji statusu zadania
    const updateTaskStatus = async (taskId: string, newStatus) => {
        try {
            const patchDoc = [
                { op: "replace", path: "/status", value: newStatus },
                { op: "replace", path: "/doneDate", value: newStatus === 2 ? new Date().toISOString() : null },
            ];

            const response = await fetch(`/api/Task/${taskId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json-patch+json",
                },
                body: JSON.stringify(patchDoc),
            });

            if (!response.ok) {
                alert("Nie udało się zaktualizować statusu zadania!");
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            const updatedTasks = await fetchTasks();
            setTasks(updatedTasks);
        } catch (error) {
            alert("Nie udało się zaktualizować statusu zadania!");
            console.error("Błąd podczas aktualizacji statusu zadania:", error);
        }
    };

    // Funkcja do przełączania stanu rozwinięcia kategorii
    const toggleCategoryCollapse = (categoryId: string) => {
        setCollapsedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    // Funkcja do renderowania karty zadania
    const TaskCard = ({ task }: { task: any }) => {
        const isOutOfDate = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 2;

        return (
            <div
                key={task.taskId}
                className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-between bg-[#515151] p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 mb-2 w-full"
            >
                <div className="flex flex-col md:flex-row items-center sm:items-center gap-4 w-full">
                    <div className="flex items-center gap-2 flex-col md:flex-row">
                        <button
                            className="mr-0 md:mr-2  cursor-pointer w-5 h-5"
                            onClick={() =>
                                updateTaskStatus(
                                    task.taskId,
                                    task.status === 2 ? 0 : 2
                                )
                            }
                            title={
                                task.status === 2
                                    ? 'Oznacz jako niezrobione'
                                    : 'Oznacz jako zrobione'
                            }
                        >
                            <CheckCircle
                                className={`w-5 h-5 ${task.status === 2
                                    ? 'text-green-500'
                                    : 'text-gray-500'
                                    }`}
                            />
                        </button>

                        <h4
                            className={`text-sm md:text-lg text-[#E8E8E8]  ${task.status === 2 ? 'line-through' : ''
                                }`}
                        >
                            {task.name}
                        </h4>
                    </div>

                    <div className="flex items-center gap-2 flex-row">
                        {task.status === 1 && (
                            <Clock
                                className="text-yellow-500 w-4 h-4"
                            />
                        )}

                        <AlertCircle
                            className={`w-4 h-4 ${task.priority === 2
                                ? 'text-red-500'
                                : task.priority === 1
                                    ? 'text-yellow-500'
                                    : 'text-green-500'
                                }`}
                        />

                        {isOutOfDate && (
                            <ClockAlert
                                className="text-red-500 w-4 h-4"
                            />
                        )}
                    </div>
                </div>

                <div className="flex gap-2 ml-0 md:ml-5 justify-center md:justify-end w-full md:w-auto mt-3 md:mt-0">
                    <button
                        className="text-blue-500 cursor-pointer hover:text-blue-600"
                        onClick={() => openPanel('viewTask', task)}
                        title="Zobacz szczegóły"
                    >
                        <Eye className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <button
                        className="text-blue-500 cursor-pointer hover:text-blue-600"
                        onClick={() => openPanel('editTask', task)}
                        title="Edytuj zadanie"
                    >
                        <Edit className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <button
                        className="text-red-500 cursor-pointer hover:text-red-600"
                        onClick={() => handleDeleteTask(task.taskId, task.name)}
                        title="Usuń zadanie"
                    >
                        <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>
            </div>
        );
    };

    return loggingOut ? (
        <LoadingScreen />
    ) : (
        <div className="flex w-full min-h-screen flex-row font-[Ubuntu] overflow-y-auto max-h-screen overflow-x-auto">
            <div className="p-5">
                <Navigation />
            </div>

            <div className="flex flex-col w-full pb-5 pt-5 pr-5 text-[#E8E8E8] max-h-screen min-h-screen">
                <div className="flex flex-col h-full w-full bg-[#313131] rounded-xl overflow-hidden">
                    {/* Nagłówek */}
                    <div className="p-5 w-full flex justify-between items-center">
                        <h1 className="font-bold text-4xl">Zadania</h1>

                        <div className="flex gap-2 ml-5 md:ml-0">
                            <button
                                className="bg-[#2775EE] hover:bg-[#0F52BA] text-white px-4 py-2 rounded-full text-xs md:text-base flex justify-center items-center font-bold cursor-pointer"
                                onClick={() => { setSelectedIcon("Notebook"); openPanel('addCategory') }}
                            >
                                <Plus className="inline-block mr-2 font-bold" /> Dodaj kategorię
                            </button>
                        </div>
                    </div>

                    <div className="w-full h-full flex flex-col overflow-y-auto p-5">
                        {isLoading ? (
                            <div
                                role="status"
                                className="flex items-center justify-center w-full h-full"
                            >
                                <Notebook className="animate-bounce size-1/4 text-[#E8E8E8]" />
                                <span className="sr-only">Ładowanie...</span>
                            </div>
                        ) : categories.length === 0 && tasks.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-center text-gray-400 text-lg">
                                Brak danych
                            </div>
                        ) : (
                            <>
                                {/* Renderowanie kategorii i zadań */}
                                {categories.map((category) => (
                                    <div key={category.categoryId} className="mb-5 bg-[#414141] rounded-2xl p-5">
                                        <div className="flex items-center justify-between">
                                            <div
                                                className="flex items-center gap-2 cursor-pointer"
                                                onClick={() => toggleCategoryCollapse(category.categoryId)}
                                            >
                                                {collapsedCategories.includes(category.categoryId) ? (
                                                    <div className="p-1 rounded-full bg-[#2775EE] mr-2 hover:bg-[#0F52BA]">
                                                        <ChevronRight className="text-[#E8E8E8]" />
                                                    </div>
                                                ) : (
                                                    <div className="p-1 rounded-full bg-[#2775EE] mr-2 hover:bg-[#0F52BA]">
                                                        <ChevronDown className="text-[#E8E8E8]" />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <div className="text-lg md:text-xl ">
                                                        {React.createElement(Icons[category.iconName] || Icons.Notebook, {
                                                            style: { color: category.colorHex },
                                                        })}
                                                    </div>
                                                    <h2
                                                        className="text-lg md:text-xl font-bold"
                                                        style={{ color: category.colorHex }}
                                                    >
                                                        {category.name}
                                                    </h2>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 ml-5 md:ml-0">
                                                <button
                                                    className="text-blue-500 cursor-pointer hover:text-blue-600"
                                                    onClick={() => { setSelectedIcon(category.iconName); openPanel('editCategory', category) }}
                                                    title="Edytuj kategorię"
                                                >
                                                    <Edit />
                                                </button>
                                                <button
                                                    className="text-red-500 cursor-pointer hover:text-red-600"
                                                    onClick={() => handleDeleteCategory(category.categoryId, category.name)}
                                                    title="Usuń kategorię"
                                                >
                                                    <Trash2 />
                                                </button>
                                                <button
                                                    className="text-green-500 cursor-pointer hover:text-green-600"
                                                    onClick={() =>
                                                        openPanel('addTask', { categoryId: category.categoryId })
                                                    }
                                                    title="Dodaj zadanie"
                                                >
                                                    <Plus />
                                                </button>
                                            </div>
                                        </div>

                                        {!collapsedCategories.includes(category.categoryId) && (
                                            <div className="overflow-y-auto max-h-75 md:h-full mt-2">
                                                <ul className="mt-2">
                                                    {tasks
                                                        .filter((task) => task.categoryId === category.categoryId)
                                                        .map((task) => (
                                                            <TaskCard key={task.taskId} task={task} />
                                                        ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Renderowanie zadań bez kategorii */}
                                <div className="bg-[#414141] rounded-2xl p-5 w-full">
                                    <div className="flex items-center justify-between">
                                        <div
                                            className="flex items-center gap-2 cursor-pointer"
                                            onClick={() => toggleCategoryCollapse('no-category')}
                                        >
                                            {collapsedCategories.includes('no-category') ? (
                                                <div className="p-1 rounded-full bg-[#2775EE] mr-2 hover:bg-[#0F52BA]">
                                                    <ChevronRight className="text-[#E8E8E8]" />
                                                </div>
                                            ) : (
                                                <div className="p-1 rounded-full bg-[#2775EE] mr-2 hover:bg-[#0F52BA]">
                                                    <ChevronDown className="text-[#E8E8E8]" />
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <Icons.BadgeAlert className="text-gray-400 text-lg md:text-xl" />
                                                <h2 className="text-lg md:text-xl font-bold text-gray-400">
                                                    Zadania bez kategorii
                                                </h2>
                                            </div>
                                        </div>

                                        <button
                                            className="text-green-500 cursor-pointer hover:text-green-600"
                                            onClick={() => { setSelectedIcon("Notebook"); openPanel('addTask', { categoryId: null }) }}
                                            title="Dodaj zadanie bez kategorii"
                                        >
                                            <Plus />
                                        </button>
                                    </div>

                                    {!collapsedCategories.includes('no-category') && (
                                        <div className="overflow-y-auto max-h-75  md:h-full mt-2">
                                            <ul className="mt-2">
                                                {tasks
                                                    .filter((task) => !task.categoryId)
                                                    .map((task) => (
                                                        <TaskCard key={task.taskId} task={task} />
                                                    ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/* Panel boczny do dodawania/edycji zadań i kategorii */}
            <SlidingPane
                isOpen={isPanelOpen}
                title={
                    panelContent === 'addTask'
                        ? 'Dodaj zadanie'
                        : panelContent === 'editTask'
                            ? 'Edytuj zadanie'
                            : panelContent === 'addCategory'
                                ? 'Dodaj kategorię'
                                : panelContent === 'editCategory'
                                    ? 'Edytuj kategorię'
                                    : panelContent === 'viewTask'
                                        ? 'Wyświetl zadanie'
                                        : ''
                }
                onRequestClose={closePanel}
                from="right"
                width="425px"
            >
                {panelContent === 'addTask' && (
                    <div>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();

                                setIsDisabled(true);
                                setButton(
                                    <>
                                        <Notebook className="animate-bounce size-6/12 text-white" />
                                        <span className="sr-only">Ładowanie..</span>
                                    </>
                                );

                                const formData = new FormData(e.currentTarget);
                                const newName = formData.get("name") as string;
                                const newDescription = formData.get("description") as string;
                                const newStatus = formData.get("status") as string;
                                const newPriority = formData.get("priority") as string;
                                const newDueDate = formData.get("dueDate") as string;
                                const newDueTime = formData.get("dueTime") as string;
                                const newCategoryId = panelData?.categoryId || null;
                                const newUserId = user?.userId;

                                if (!newName || newName.trim() === "" || !newStatus || newStatus.trim() === "" || !newPriority || newPriority.trim() === "") {
                                    setError("Wszystkie pola są wymagane!");
                                    setIsDisabled(false);
                                    setButton(<><Plus className="w-5 h-5 lg:mr-2" /><p className="block">Dodaj</p></>);
                                    return;
                                }

                                const combinedDueDate = newDueDate && newDueTime
                                    ? new Date(`${newDueDate}T${newDueTime}`)
                                    : null;

                                const newTask = {
                                    name: newName,
                                    description: newDescription,
                                    status: newStatus,
                                    priority: newPriority,
                                    categoryId: newCategoryId,
                                    userId: newUserId,
                                    dueDate: combinedDueDate,
                                    doneDate: newStatus === "done" ? new Date() : null,
                                };

                                try {
                                    const response = await fetch("/api/Task", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(newTask),
                                    });

                                    if (!response.ok) {
                                        const data = await response.json();
                                        setError(<>{data.message}</>);
                                        setIsDisabled(false);
                                        setButton(<><Plus className="w-5 h-5 lg:mr-2" /><p className="hidden lg:block">Dodaj</p></>);
                                        return;
                                    }

                                    const updatedTasks = await fetchTasks();
                                    setTasks(updatedTasks);

                                    const updatedCategories = await fetchCategories();
                                    setCategories(updatedCategories);

                                    setCollapsedCategories(() => {
                                        const categoryIds = updatedCategories.map((category) => category.categoryId);
                                        const newCollapsed = categoryIds.filter((id) => id !== newCategoryId);

                                        if (newCategoryId) {
                                            return [...newCollapsed, "no-category"];
                                        }
                                        else if (newCategoryId == null || newCategoryId == "") {
                                            const categoryIds = updatedCategories.map((category: Category) => category.categoryId);
                                            return [...categoryIds];
                                        }
                                        else {
                                            return [...newCollapsed, "no-category"];
                                        }
                                    });


                                    closePanel();
                                } catch (error) {
                                    setError("Wystąpił błąd przy dodawaniu zadania!");
                                } finally {
                                    setIsDisabled(false);
                                    setButton(<><Plus className="w-5 h-5 lg:mr-2" /><p className="block">Dodaj</p></>);
                                }
                            }}
                        >
                            <div>
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Nazwa zadania</label>
                                <input
                                    type="text"
                                    name="name"
                                    minLength="1"
                                    maxLength="255"
                                    className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                    onChange={() => setError(null)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                            document.getElementsByName("description")[0].focus();
                                    }}
                                />
                            </div>

                            <div className="mt-5">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Opis</label>
                                <textarea
                                    name="description"
                                    className="border-[#2775EE] border-2 pl-5 pr-5 pt-2 pb-2 h-12 md:text-sm lg:text-base rounded-2xl bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                    onChange={() => setError(null)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                            document.getElementsByName("status")[0].focus();
                                    }}
                                ></textarea>
                            </div>

                            <div className="mt-5">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Status</label>
                                <select
                                    name="status"
                                    className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                    defaultValue="todo"
                                    onChange={() => setError(null)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                            document.getElementsByName("priority")[0].focus();
                                    }}
                                >
                                    <option value="todo">Do zrobienia</option>
                                    <option value="inprogress">W trakcie</option>
                                    <option value="done">Zrobione</option>
                                </select>
                            </div>

                            <div className="mt-5">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Priorytet</label>
                                <select
                                    name="priority"
                                    className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                    defaultValue="medium"
                                    onChange={() => setError(null)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                            document.getElementsByName("dueDate")[0].focus();
                                    }}
                                >
                                    <option value="low">Niski</option>
                                    <option value="medium">Średni</option>
                                    <option value="high">Wysoki</option>
                                </select>
                            </div>

                            <div className="mt-5">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Termin</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        name="dueDate"
                                        onChange={() => setError(null)}
                                        className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-1/2"
                                    />
                                    <input
                                        type="time"
                                        name="dueTime"
                                        onChange={() => setError(null)}
                                        className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-1/2"
                                    />
                                </div>
                            </div>

                            <div className="pt-3 items-center justify-center text-center">
                                <p className="text-[#FF2400]">{error}</p>
                            </div>

                            <div className="w-full flex mt-10 justify-center items-center">
                                <button
                                    type="submit"
                                    disabled={isDisabled}
                                    className="flex rounded-full items-center justify-center text-white h-12 bg-[#2775EE] hover:cursor-pointer hover:bg-[#0F52BA] md:text-base lg:text-lg shadow-[0px_9px_30px_rgba(0,0,0,0.3)] w-1/2"
                                >
                                    {button}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                {panelContent === 'viewTask' && (
                    <div>
                        <form>
                            <div className="">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Nazwa zadania</label>
                                <input
                                    type="text"
                                    name="name"
                                    defaultValue={panelData?.name}
                                    readOnly="true"
                                    className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                />
                            </div>

                            <div className="mt-5">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Opis</label>
                                <textarea
                                    name="description"
                                    defaultValue={panelData?.description}
                                    readOnly="true"
                                    className="border-[#2775EE] border-2 pl-5 pr-5 pt-2 pb-2 h-12 md:text-sm lg:text-base rounded-2xl bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                ></textarea>
                            </div>

                            <div className="mt-5">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Status</label>
                                <input
                                    type="text"
                                    name="status"
                                    defaultValue={
                                        panelData?.status === 0
                                            ? "Do zrobienia"
                                            : panelData?.status === 1
                                                ? "W trakcie"
                                                : panelData?.status === 2
                                                    ? "Zrobione"
                                                    : ""
                                    }
                                    className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                    readOnly="true"
                                />
                            </div>

                            <div className="mt-5">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Priorytet</label>
                                <input
                                    type="text"
                                    name="priority"
                                    readOnly="true"
                                    defaultValue={
                                        panelData?.priority === 0
                                            ? "Niski"
                                            : panelData?.priority === 1
                                                ? "Średni"
                                                : panelData?.priority === 2
                                                    ? "Wysoki"
                                                    : ""
                                    }
                                    className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                />
                            </div>

                            <div className="mt-5">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Termin</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        readOnly={true}
                                        name="dueDate"
                                        defaultValue={new Date(panelData?.dueDate).toISOString().split('T')[0]}
                                        className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-1/2"
                                    />
                                    <input
                                        type="time"
                                        readOnly={true}
                                        name="dueTime"
                                        defaultValue={new Date(panelData?.dueDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                        className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-1/2"
                                    />
                                </div>
                            </div>
                        </form>

                        <div className="mt-10 rounded-2xl bg-[#414141] p-5 overflow-y-auto overflow-x-hidden">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg md:text-2xl font-bold text-[#e8e8e8]">Pliki</h2>
                                </div>
                                <label
                                    className="text-green-500 cursor-pointer hover:text-green-600"
                                    title="Dodaj plik"
                                >
                                    <Plus />
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file && panelData?.taskId) {
                                                handleUploadFile(file, panelData.taskId);
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            <div>
                                {panelData.resources.map((resource) => (
                                    <div
                                        key={resource.resourceId}
                                        className="flex justify-between items-center rounded-2xl bg-[#515151] p-5 mt-2"
                                    >
                                        {/* Left Section: File Name and Type */}
                                        <div className="flex flex-col w-2/3">
                                            <span
                                                className="text-[#E8E8E8] font-bold text-sm truncate"
                                                title={resource.fileName} // Tooltip to show full file name on hover
                                            >
                                                {resource.fileName}
                                            </span>
                                            <span className="text-gray-400 text-xs">{resource.resourceType}</span>
                                        </div>

                                        {/* Right Section: Buttons */}
                                        <div className="flex gap-3">
                                            <a
                                                href={`${resource.filePath}/${resource.fileName}`}
                                                download
                                                className="text-[#2775EE] cursor-pointer hover:text-[#0F52BA]"
                                                title="Pobierz plik"
                                            >
                                                <Download />
                                            </a>
                                            <button
                                                className="text-red-500 cursor-pointer hover:text-red-600"
                                                onClick={() =>
                                                    handleDeleteResource(resource.resourceId, resource.fileName, panelData.taskId)
                                                }
                                                title="Usuń plik"
                                            >
                                                <Trash2 />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {panelContent === 'editTask' && (
                    <div>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();

                                console.log(panelData?.priority);

                                setIsDisabled(true);
                                setButton(
                                    <>
                                        <Notebook className="animate-bounce size-6/12 text-white" />
                                        <span className="sr-only">Ładowanie..</span>
                                    </>
                                );

                                const formData = new FormData(e.currentTarget);
                                const updatedName = formData.get("name") as string;
                                const updatedDescription = formData.get("description") as string;
                                const updatedStatus = formData.get("status") as string;
                                const updatedPriority = formData.get("priority") as string;
                                const updatedDueDate = formData.get("dueDate") as string;
                                const updatedDueTime = formData.get("dueTime") as string;
                                const updatedCategoryId = formData.get("categoryId")

                                if (!updatedName || updatedName.trim() === "" || !updatedStatus || updatedStatus.trim() === "" || !updatedPriority || updatedPriority.trim() === "") {
                                    setError("Wszystkie pola są wymagane!");
                                    setIsDisabled(false);
                                    setButton(<><Plus className="w-5 h-5 lg:mr-2" /><p className="block">Dodaj</p></>);
                                    return;
                                }

                                const originalDueDate = new Date(panelData?.dueDate);
                                const combinedDueDate = updatedDueDate && updatedDueTime
                                    ? new Date(`${updatedDueDate}T${updatedDueTime}`)
                                    : null;


                                const patchDoc = [];

                                if (updatedName !== panelData.name) {
                                    patchDoc.push({ op: "replace", path: "/name", value: updatedName });
                                }

                                if (updatedDescription !== panelData.description) {
                                    patchDoc.push({ op: "replace", path: "/description", value: updatedDescription });
                                }

                                if (updatedStatus !== panelData.status) {
                                    patchDoc.push({ op: "replace", path: "/status", value: updatedStatus });
                                    if (updatedStatus == 2) {
                                        patchDoc.push({ op: "replace", path: "/doneDate", value: new Date() });
                                    }
                                    else {
                                        patchDoc.push({ op: "replace", path: "/doneDate", value: null });
                                    }
                                }

                                if (updatedPriority !== panelData.priority) {
                                    patchDoc.push({ op: "replace", path: "/priority", value: updatedPriority });
                                }

                                if (combinedDueDate !== originalDueDate) {
                                    patchDoc.push({ op: "replace", path: "/dueDate", value: combinedDueDate });
                                }

                                if (updatedCategoryId !== panelData.categoryId) {s
                                    if (updatedCategoryId == "" || updatedCategoryId.trim() === "") {
                                        patchDoc.push({ op: "replace", path: "/categoryId", value: null });
                                    }
                                    else {
                                        patchDoc.push({ op: "replace", path: "/categoryId", value: updatedCategoryId });
                                    }
                                }

                                try {
                                    const response = await fetch(`/api/Task/${panelData.taskId}`, {
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
                                        setButton(<><Plus className="w-5 h-5 lg:mr-2" /><p className="block">Zapisz</p></>);
                                        return;
                                    }

                                    const updatedTasks = await fetchTasks();
                                    setTasks(updatedTasks);

                                    const updatedCategories = await fetchCategories();
                                    setCategories(updatedCategories);

                                    setCollapsedCategories(() => {
                                        const categoryIds = updatedCategories.map((category) => category.categoryId);
                                        const newCollapsed = categoryIds.filter((id) => id !== updatedCategoryId);

                                        if (updatedCategoryId) {
                                            return [...newCollapsed, "no-category"];
                                        }
                                        else if (updatedCategoryId == null || updatedCategoryId == "") {
                                            const categoryIds = updatedCategories.map((category: Category) => category.categoryId);
                                            return [...categoryIds];
                                        }
                                        else {
                                            return [...newCollapsed, "no-category"];
                                        }
                                    });

                                    setSelectedIcon("Notebook");

                                    closePanel();
                                } catch (error) {
                                    set
                                    setError("Wystąpił błąd przy aktualizacji zadania!");
                                } finally {
                                    setIsDisabled(false);
                                    setButton(<><Plus className="w-5 h-5 lg:mr-2" /><p className="block">Zapisz</p></>);
                                }

                                closePanel();
                            }}
                        >
                            <div className="">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Nazwa zadania</label>
                                <input
                                    type="text"
                                    name="name"
                                    defaultValue={panelData?.name}
                                    minLength="1"
                                    maxLength="255"
                                    className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                    onChange={() => setError(null)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                            document.getElementsByName("description")[0].focus();
                                    }}
                                />
                            </div>

                            <div className="mt-5">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Opis</label>
                                <textarea
                                    name="description"
                                    defaultValue={panelData?.description}
                                    className="border-[#2775EE] border-2 pl-5 pr-5 pt-2 pb-2 h-12 md:text-sm lg:text-base rounded-2xl bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                    onChange={() => setError(null)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                            document.getElementsByName("status")[0].focus();
                                    }}
                                ></textarea>
                            </div>

                            <div className="mt-5">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Status</label>
                                <select
                                    name="status"
                                    defaultValue={
                                        panelData?.status === 0
                                            ? "todo"
                                            : panelData?.status === 1
                                                ? "inprogress"
                                                : panelData?.status === 2
                                                    ? "done"
                                                    : ""
                                    }
                                    className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                    onChange={() => setError(null)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                            document.getElementsByName("priority")[0].focus();
                                    }}
                                >
                                    <option value="todo">Do zrobienia</option>
                                    <option value="inprogress">W trakcie</option>
                                    <option value="done">Zrobione</option>
                                </select>
                            </div>

                            <div className="mt-5">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Priorytet</label>
                                <select
                                    name="priority"
                                    defaultValue={
                                        panelData?.priority === 0
                                            ? "low"
                                            : panelData?.priority === 1
                                                ? "medium"
                                                : panelData?.priority === 2
                                                    ? "high"
                                                    : ""
                                    }
                                    className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                    onChange={() => setError(null)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                            document.getElementsByName("categoryId")[0].focus();
                                    }}
                                >
                                    <option value="low">Niski</option>
                                    <option value="medium">Średni</option>
                                    <option value="high">Wysoki</option>
                                </select>
                            </div>

                            <div className="mt-5">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Kategoria</label>
                                <select
                                    name="categoryId"
                                    onChange={() => setError(null)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                            document.getElementsByName("dueDate")[0].focus();
                                    }}
                                    defaultValue={panelData?.categoryId || ""}
                                    className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                >
                                    <option value="">Brak kategorii</option>
                                    {categories.map((category) => (
                                        <option key={category.categoryId} value={category.categoryId}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mt-5">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Termin</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        name="dueDate"
                                        defaultValue={new Date(panelData?.dueDate).toISOString().split('T')[0]}
                                        onChange={() => setError(null)}
                                        className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-1/2"
                                    />
                                    <input
                                        type="time"
                                        name="dueTime"
                                        defaultValue={new Date(panelData?.dueDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                                        onChange={() => setError(null)}
                                        className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-1/2"
                                    />
                                </div>
                            </div>


                            <div className="pt-3 items-center justify-center text-center">
                                <p className="text-[#FF2400]">{error}</p>
                            </div>

                            <div className="w-full flex mt-10 justify-center items-center">
                                <button
                                    type="submit"
                                    disabled={isDisabled}
                                    className="flex rounded-full items-center justify-center text-white h-12 bg-[#2775EE] hover:cursor-pointer hover:bg-[#0F52BA] md:text-base lg:text-lg shadow-[0px_9px_30px_rgba(0,0,0,0.3)] w-1/2"
                                >
                                    {button}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                {panelContent === 'addCategory' && (
                    <div className="">
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();

                                setIsDisabled(true);
                                setButton(
                                    <>
                                        <Notebook className="animate-bounce size-6/12 text-white" />
                                        <span className="sr-only">Ładowanie..</span>
                                    </>
                                );

                                const formData = new FormData(e.currentTarget);
                                const newName = formData.get("name") as string;
                                const newColorHex = formData.get("colorHex") as string;

                                if (!newName || newName.trim() === "" || !newColorHex || newColorHex.trim() === "" || !selectedIcon) {
                                    setError("Wszystkie pola są wymagane!");
                                    setIsDisabled(false);
                                    setButton(<><Plus className="w-5 h-5 lg:mr-2" /><p className="block">Zapisz</p></>);
                                    return;
                                }

                                const newCategory = {
                                    name: newName,
                                    colorHex: newColorHex,
                                    iconName: selectedIcon,
                                    userId: user?.userId,
                                };

                                try {
                                    const response = await fetch("/api/Category", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(newCategory),
                                    });

                                    if (!response.ok) {
                                        const data = await response.json();
                                        setError(<>{data.message}</>);
                                        setIsDisabled(false);
                                        setButton(<><Plus className="w-5 h-5 lg:mr-2" /><p className="hidden lg:block">Zapisz</p></>);
                                        return;
                                    }

                                    setSelectedIcon("Notebook");

                                    const updatedCategories = await fetchCategories();
                                    setCategories(updatedCategories);

                                    const categoryIds = updatedCategories.map((category) => category.categoryId);
                                    setCollapsedCategories([...categoryIds, "no-category"]);

                                    closePanel();
                                } catch (error) {
                                    setError("Wystąpił błąd przy dodawaniu kategorii!");
                                } finally {
                                    setIsDisabled(false);
                                    setButton(<><Plus className="w-5 h-5 lg:mr-2" /><p className="block">Dodaj</p></>);
                                }
                            }}
                        >
                            <div className="">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Nazwa kategorii</label>
                                <input
                                    type="text"
                                    name="name"
                                    minLength="1"
                                    maxLength="255"
                                    onChange={() => setError(null)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                            document.getElementsByName("colorHex")[0].focus();
                                    }}
                                    className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                />
                            </div>

                            <div className="mt-5">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Kolor</label>
                                <input
                                    type="color"
                                    name="colorHex"
                                    onChange={() => setError(null)}
                                    className="w-full h-12  border-2 border-[#2775EE] cursor-pointer p-3"
                                />
                            </div>

                            <div className="mt-5">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">Ikona</label>
                                <IconSelect value={selectedIcon} onChange={setSelectedIcon} />
                            </div>

                            <div className="pt-3 items-center justify-center text-center">
                                <p className="text-[#FF2400]">{error}</p>
                            </div>

                            <div className="w-full flex mt-10 justify-center items-center">
                                <button
                                    type="submit"
                                    disabled={isDisabled}
                                    className="flex rounded-full items-center justify-center text-white h-12 bg-[#2775EE] hover:cursor-pointer hover:bg-[#0F52BA] md:text-base lg:text-lg shadow-[0px_9px_30px_rgba(0,0,0,0.3)] w-1/2"
                                >
                                    {button}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                {panelContent === 'editCategory' && (
                    <div className="">
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();

                                setIsDisabled(true);
                                setButton(
                                    <>
                                        <Notebook className="animate-bounce size-6/12 text-white" />
                                        <span className="sr-only">Ładowanie..</span>
                                    </>
                                );

                                const formData = new FormData(e.currentTarget);
                                const updatedName = formData.get("name") as string;
                                const updatedColorHex = formData.get("colorHex") as string;

                                if (!updatedName || updatedName.trim() === "" || !updatedColorHex || updatedColorHex.trim() === "" || !selectedIcon) {
                                    setError("Wszystkie pola są wymagane!");
                                    setIsDisabled(false);
                                    setButton(<><Plus className="w-5 h-5 lg:mr-2" /><p className="block">Zapisz</p></>);
                                    return;
                                }

                                const patchDoc = [];
                                if (updatedName !== panelData.name) {
                                    patchDoc.push({ op: "replace", path: "/name", value: updatedName });
                                }
                                if (updatedColorHex !== panelData.colorHex) {
                                    patchDoc.push({ op: "replace", path: "/colorHex", value: updatedColorHex });
                                }
                                if (selectedIcon !== panelData.iconName) {
                                    patchDoc.push({ op: "replace", path: "/iconName", value: selectedIcon });
                                }

                                try {
                                    const response = await fetch(`/api/Category/${panelData.categoryId}`, {
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
                                        setButton(<><Plus className="w-5 h-5 lg:mr-2" /><p className="block">Zapisz</p></>);
                                        return;
                                    }

                                    const updatedCategories = await fetchCategories();
                                    setCategories(updatedCategories);

                                    const categoryIds = updatedCategories.map((category) => category.categoryId);
                                    setCollapsedCategories([...categoryIds, "no-category"]);

                                    setSelectedIcon("Notebook");
                                    closePanel();
                                } catch (error) {
                                    setError("Wystąpił błąd przy aktualizacji kategorii!");
                                } finally {
                                    setIsDisabled(false);
                                    setButton(<><Plus className="w-5 h-5 lg:mr-2" /><p className="block">Zapisz</p></>);
                                }
                            }}
                        >
                            <div className="mb-4">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">
                                    Nazwa kategorii
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    onChange={() => setError(null)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                            document.getElementsByName("colorHex")[0].focus();
                                    }}
                                    defaultValue={panelData?.name}
                                    className="border-[#2775EE] border-2 pl-5 h-12 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-full"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">
                                    Kolor
                                </label>
                                <input
                                    type="color"
                                    name="colorHex"
                                    onChange={() => setError(null)}
                                    defaultValue={panelData?.colorHex}
                                    className="w-full h-12 border-2 border-[#2775EE] cursor-pointer p-3"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="pl-5 pb-2 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-full">
                                    Ikona
                                </label>
                                <IconSelect value={selectedIcon} onChange={setSelectedIcon} />
                            </div>

                            <div className="pt-3 items-center justify-center text-center">
                                <p className="text-[#FF2400]">{error}</p>
                            </div>

                            <div className="w-full flex mt-10 justify-center items-center">
                                <button
                                    type="submit"
                                    disabled={isDisabled}
                                    className="flex rounded-full items-center justify-center text-white h-12 bg-[#2775EE] hover:cursor-pointer hover:bg-[#0F52BA] md:text-base lg:text-lg shadow-[0px_9px_30px_rgba(0,0,0,0.3)] w-1/2"
                                >
                                    {button}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

            </SlidingPane>
        </div>
    );
}

export default withAuth(Tasks);