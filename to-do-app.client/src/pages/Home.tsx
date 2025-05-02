import '../App.css';
import { withAuth } from '../services/withAuth';
import { useUser } from '../context/UserContext';
import LoadingScreen from '../components/LoadingScreen';
import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { CheckCircle, AlertCircle, Plus, Notebook, Clock, ClockAlert } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import 'react-calendar/dist/Calendar.css';
import * as Icons from 'lucide-react';
import SlidingPane from 'react-sliding-pane';
import 'react-sliding-pane/dist/react-sliding-pane.css';
import { pl } from 'date-fns/locale';
import { DateTime } from 'luxon';

// Import and register Chart.js components
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import React from 'react';
import { parse, format } from 'date-fns';

ChartJS.register(ArcElement, Tooltip, Legend);

// Add a plugin to display percentage in the center of the doughnut chart
const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: (chart) => {
        const { width } = chart;
        const { height } = chart;
        const ctx = chart.ctx;
        const dataset = chart.data.datasets[0];
        const total = dataset.data.reduce((acc, value) => acc + value, 0);
        const value = dataset.data[0];
        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

        ctx.save();
        const fontSize = Math.min(width, height) * 0.2; // Responsive font size  
        ctx.font = `bold ${fontSize}px Ubuntu`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${percentage}%`, width / 2, height / 2);
        ctx.restore();
    },
};

ChartJS.register(centerTextPlugin);

function Home() {
    const { user, loggingOut } = useUser();
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [statistics, setStatistics] = useState({
        done: 0,
        inProgress: 0,
        toDo: 0,
        completedToday: 0,
        completedThisWeek: 0,
        completedThisYear: 0,
    });
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [panelContent, setPanelContent] = useState<string | null>(null);
    const [panelData, setPanelData] = useState<any>(null);
    const [isDisabled, setIsDisabled] = useState(false);
    const [button, setButton] = useState(<><Plus className="w-5 h-5 lg:mr-2" /><p className="block">Dodaj</p></>);
    const [error, setError] = useState<string | null>(null);
    const [quote, setQuote] = useState<string | null>(null);
    const [author, setAuthor] = useState<string | null>(null);

    const toUTC = (date: string | Date | null) => {
        if (!date) return null;
        return DateTime.fromISO(date.toString(), { zone: 'local' }).toUTC().toISO();
    };

    useEffect(() => {
        document.body.classList.add("bg-[#212121]");
        document.body.classList.replace("bg-[#ffffff]", "bg-[#212121]");

        fetchTasks();
    }, []);

    const openPanel = (content: string, data: any = null) => {
        setPanelContent(content);
        setPanelData(data);
        setIsPanelOpen(true);
    };

    const closePanel = () => {
        setIsPanelOpen(false);
        setPanelContent(null);
        setPanelData(null);
        setError(null);
    };

    const randomQuote = async () => {
        try {
            const response = await fetch('/Resources/Quotes.txt'); // Fetch the Quotes.txt file

            if (!response.ok) {
                throw new Error('Failed to fetch quotes');
            }

            const text = await response.text();
            const quotes = text.split('\n').filter(line => line.trim() !== ''); // Split into lines and filter empty lines

            if (quotes.length === 0) {
                throw new Error('No quotes available');
            }

            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            const [quoteText, quoteAuthor] = randomQuote.split(' - ');

            setQuote(quoteText.trim());
            setAuthor(quoteAuthor?.trim() || 'Nieznany autor');
        } catch (error) {
            console.error('Error fetching quote:', error);
            setQuote('Nie udało się załadować cytatu.');
            setAuthor(null);
        }
    }

    const updateTaskStatus = async (taskId: string, newStatus) => {
        try {
            const patchDoc = [
                { op: "replace", path: "/status", value: newStatus },
                { op: "replace", path: "/doneDate", value: newStatus === 2 ? new Date() : null },
            ];

            const response = await fetch(`/api/Task/${taskId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json-patch+json",
                },
                body: JSON.stringify(patchDoc),
            });

            if (!response.ok) {
                throw new Error('Failed to update task status');
            }

            fetchTasksWL();

        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/Task/user/${user?.userId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }

            const tasks = await response.json();

            const categoryResponse = await fetch(`/api/Category/user/${user?.userId}`);

            if (!categoryResponse.ok) {
                throw new Error('Failed to fetch categories');
            }

            const categories = await categoryResponse.json();

            const todayDate = new Date();

            const tasksForToday = tasks.filter(task => {
                const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                return (
                    (dueDate && dueDate.toDateString() === todayDate.toDateString()) ||
                    !dueDate
                );
            });

            const outOfDateTasks = tasks.filter(task => {
                const dueDate = task.dueDate ? DateTime.fromISO(task.dueDate).startOf('day') : null;
                return dueDate && dueDate < todayDate && task.status !== 2;
            });

            const combinedTasksForToday = [...tasksForToday, ...outOfDateTasks].filter(
                (task, index, self) =>
                    index === self.findIndex(t => t.taskId === task.taskId)
            );

            const done = tasks.filter(task => task.status === 2).length;
            const inProgress = tasks.filter(task => task.status === 1).length;
            const toDo = tasks.filter(task => task.status === 0).length;

            const today = new Date();

            const completedToday = tasks.filter(task => {
                const doneDate = task.doneDate ? new Date(task.doneDate) : null;
                return doneDate && doneDate.toDateString() === today.toDateString();
            }).length;

            const completedThisWeek = tasks.filter(task => {
                const doneDate = task.doneDate ? new Date(task.doneDate) : null;
                const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
                return doneDate && doneDate >= startOfWeek;
            }).length;

            const completedThisYear = tasks.filter(task => {
                const doneDate = task.doneDate ? new Date(task.doneDate) : null;
                return doneDate && doneDate.getFullYear() === today.getFullYear();
            }).length;

            setTasks(combinedTasksForToday);
            setCategories(categories);
            setStatistics({
                done,
                inProgress,
                toDo,
                completedToday,
                completedThisWeek,
                completedThisYear,
            });
            randomQuote();
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
        finally {
            setTimeout(() => {
                setIsLoading(false);
            }, 1500);
        }
    };

    const fetchTasksWL = async () => {
        try {
            const response = await fetch(`/api/Task/user/${user?.userId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }

            const tasks = await response.json();

            const categoryResponse = await fetch(`/api/Category/user/${user?.userId}`);

            if (!categoryResponse.ok) {
                throw new Error('Failed to fetch categories');
            }

            const categories = await categoryResponse.json();

            const todayDate = new Date();

            const tasksForToday = tasks.filter(task => {
                const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                return (
                    (dueDate && dueDate.toDateString() === todayDate.toDateString()) ||
                    !dueDate
                );
            });

            const outOfDateTasks = tasks.filter(task => {
                const dueDate = task.dueDate ? DateTime.fromISO(task.dueDate).startOf('day') : null;
                return dueDate && dueDate < todayDate && task.status !== 2;
            });

            const combinedTasksForToday = [...tasksForToday, ...outOfDateTasks].filter(
                (task, index, self) =>
                    index === self.findIndex(t => t.taskId === task.taskId)
            );

            const done = tasks.filter(task => task.status === 2).length;
            const inProgress = tasks.filter(task => task.status === 1).length;
            const toDo = tasks.filter(task => task.status === 0).length;

            const today = new Date();
            const completedToday = tasks.filter(task => {
                const doneDate = task.doneDate ? new Date(task.doneDate) : null;
                return doneDate && doneDate.toDateString() === today.toDateString();
            }).length;

            const completedThisWeek = tasks.filter(task => {
                const doneDate = task.doneDate ? new Date(task.doneDate) : null;
                const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
                return doneDate && doneDate >= startOfWeek;
            }).length;

            const completedThisYear = tasks.filter(task => {
                const doneDate = task.doneDate ? new Date(task.doneDate) : null;
                return doneDate && doneDate.getFullYear() === today.getFullYear();
            }).length;

            setTasks(combinedTasksForToday);
            setCategories(categories);
            setStatistics({
                done,
                inProgress,
                toDo,
                completedToday,
                completedThisWeek,
                completedThisYear,
            });
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const createDoughnutData = (value, total, color) => ({
        datasets: [
            {
                data: [value, total - value],
                backgroundColor: [color, '#717171'],
                borderWidth: 0,
            },
        ],
    });

    const doughnutOptions = {
        responsive: true,
        aspectRatio: 2,
        cutout: '80%',
        maintainAspectRatio: false,
        events: [],
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    const TaskCard = ({ task }: { task: any }) => {
        const isOutOfDate = task.dueDate && (() => {
            const dueDate = DateTime.fromISO(task.dueDate).startOf('day'); // Normalize to the start of the day
            const today = DateTime.now().startOf('day'); // Normalize current date to the start of the day
            return dueDate < today && task.status !== 2; // Compare only the day
        })();
        const categoryOfTask = categories.find(category => category.categoryId === task.categoryId);

        return (
            <div
                key={task.taskId}
                className="flex items-center justify-between bg-[#515151] p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 mb-2 w-full"
            >
                <div className="flex items-center gap-4 w-full">
                    <div
                        className="w-12 h-12 flex items-center justify-center rounded-full font-bold shrink-0"
                        style={{
                            backgroundColor: categoryOfTask?.colorHex || 'var(--color-gray-400)',
                        }}
                    >
                        {React.createElement(
                            Icons[categoryOfTask?.iconName as keyof typeof Icons || 'BadgeAlert'], // Use category icon or fallback to BadgeAlert
                            { className: 'text-white w-6 h-6' }
                        )}
                    </div>

                    <div className="flex flex-col w-full">
                        <div className="flex items-center gap-2 w-full">
                            <button
                                className="mr-2 cursor-pointer w-5 h-5"
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
                                className={`text-sm md:text-lg text-[#E8E8E8] break-all ${task.status === 2 ? 'line-through' : ''
                                    }`}
                            >
                                {task.name}
                            </h4>

                            <div className="flex items-center gap-2 flex-col md:flex-row">
                                {task.status === 1 && (
                                    <Clock
                                        className="text-yellow-500 w-4 h-4"
                                        title="W trakcie"
                                    />
                                )}

                                <AlertCircle
                                    className={`w-4 h-4 ${task.priority === 2
                                        ? 'text-red-500'
                                        : task.priority === 1
                                            ? 'text-yellow-500'
                                            : 'text-green-500'
                                        }`}
                                    title="Ważność"
                                />

                                {isOutOfDate && (
                                    <ClockAlert
                                        className="text-red-500 w-4 h-4"
                                        title="Przeterminowane"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const totalTasks = statistics.done + statistics.inProgress + statistics.toDo;

    return loggingOut ? (
        <LoadingScreen />
    ) : (
        <div className="flex w-full min-h-screen flex-row font-[Ubuntu] overflow-y-auto">
            {/* Navigation */}
            <div className="p-5">
                <Navigation />
            </div>
            <div className="flex flex-col w-full pb-5 pt-5 pr-5 text-[#E8E8E8] max-h-screen min-h-screen">
                <div className="flex flex-col h-full w-full bg-[#313131] rounded-xl overflow-x-auto">
                    {/* Welcome Section */}
                    <div className="p-5 w-full">
                        <h1 className="text-2xl md:text-4xl font-bold">
                            Witaj, {user?.name || 'Użytkowniku'}!
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Miło Cię widzieć! Sprawdź swoje zadania na dziś, statystyki i kalendarz.
                        </p>
                    </div>
                    {isLoading ? (
                        <div
                            role="status"
                            className="flex items-center justify-center w-full h-full"
                        >
                            <Notebook className="animate-bounce size-1/4 text-[#E8E8E8]" />
                            <span className="sr-only">Ładowanie...</span>
                        </div>
                    ) : (
                        <>
                            <div className="w-full flex items-center justify-center h-full overflow-x-auto">
                                <div className="flex flex-col md:flex-row w-full rounded-lg gap-y-5 md:gap-x-5 h-full p-5 min-w-0">
                                    <div className="w-full h-full bg-[#313131] p-5 flex flex-col rounded-2xl bg-[#414141]">
                                        <div className="mb-5 w-full flex-none flex justify-between items-center">
                                            <h1 className="text-xl font-bold text-white">Zadania do wykonania</h1>
                                            <div className="flex">
                                                <button
                                                    className="text-green-500 cursor-pointer hover:text-green-600"
                                                    onClick={() => openPanel('addTask', { categoryId: null })}
                                                    title="Dodaj zadanie"
                                                >
                                                    <Plus />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="overflow-y-auto">
                                            {tasks.length > 0 ? (
                                                <div className="">
                                                    {tasks.map((task: any) => (
                                                        <TaskCard key={task.taskId} task={task} />
                                                    ))}
                                                </div>
                                            ) : (
                                                 <div className="flex items-center justify-center h-full">
                                                                <p className="text-gray-400 text-center mt-10">Brak zadań na dziś!</p>
                                                            </div>

                                            )}
                                        </div>
                                    </div>

                                    <div className="w-full flex flex-col h-full">
                                        <div className="w-full bg-[#414141] rounded-xl p-5 mb-5 overflow-hidden flex-5 md:flex-2">
                                            <h2 className="text-xl font-bold text-white mb-3 md:mb-0">Statystyki zadań</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center justify-center h-full overflow-y-auto flex">
                                                <div className="flex flex-col items-center justify-center w-full h-full">
                                                    <div className="w-5/6 md:w-full md:h-2/3">
                                                        <Doughnut
                                                            data={createDoughnutData(statistics.toDo, totalTasks, '#EF4444')}
                                                            options={doughnutOptions}
                                                        />
                                                    </div>
                                                    <p className="mt-2 text-white text-center text-xs lg:text-base">Do zrobienia</p>
                                                </div>
                                                <div className="flex flex-col items-center justify-center w-full h-full">
                                                    <div className="w-5/6 md:w-full md:h-2/3">
                                                        <Doughnut
                                                            data={createDoughnutData(statistics.inProgress, totalTasks, '#FACC15')}
                                                            options={doughnutOptions}
                                                        />
                                                    </div>
                                                    <p className="mt-2 text-white text-center text-xs lg:text-base" >W trakcie</p>
                                                </div>
                                                <div className="flex flex-col items-center justify-center w-full h-full mb-10 md:mb-0">
                                                    <div className="w-5/6 md:w-full md:h-2/3">
                                                        <Doughnut
                                                            data={createDoughnutData(statistics.done, totalTasks, '#22C55E')}
                                                            options={doughnutOptions}
                                                        />
                                                    </div>
                                                    <p className="mt-2 text-white text-center text-xs lg:text-base">Zrobione</p>
                                                </div>
                                            </div>
                                        </div>


                                        <div className="bg-[#414141] rounded-xl p-5 mb-5 flex-col flex-1">
                                            <h2 className="text-xl font-bold mb-3 text-white h-1/3">Statystyki liczbowe</h2>
                                            <div className="flex justify-center items-center w-full h-2/3">
                                                <div className="h-full w-full">
                                                    <p className="text-center text-2xl font-bold te-white">{statistics.completedToday}</p>
                                                    <p className="text-center text-gray-400">Dzisiaj</p>
                                                </div>
                                                <div className="h-full w-full">
                                                    <p className="text-center text-2xl font-bold text-white">{statistics.completedThisWeek}</p>
                                                    <p className="text-center text-gray-400">W tym tygodniu</p>
                                                </div>
                                                <div className="h-full w-full">
                                                    <p className="text-center text-2xl font-bold text-white">{statistics.completedThisYear}</p>
                                                    <p className="text-center text-gray-400">W tym roku</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-[#414141] rounded-xl p-5 row-3 flex-1 flex flex-col mb-5 md:mb-0">
                                            <h2 className="text-xl font-bold mb-3 text-white">Losowy cytat</h2>
                                            <div className="flex justify-center items-center w-full flex-col h-full">
                                                <p className="text-gray-400 italic flex items-center justify-center">
                                                    {quote ? `${quote}` : 'Ładowanie cytatu...'}
                                                </p>
                                                {author && (
                                                    <p className="text-gray-500 text-sm text-center mt-2">
                                                        {author}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                </div>
                <SlidingPane
                    isOpen={isPanelOpen}
                    title={
                        panelContent === 'addTask'
                            ? 'Dodaj zadanie'
                            : panelContent === 'editTask'
                                ? 'Edytuj zadanie'
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
                                    var newCategoryId = formData.get("categoryId") as string;
                                    const newUserId = user?.userId;

                                    if (newCategoryId == "" || newCategoryId.trim() === "") {
                                        newCategoryId = null;
                                    }

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

                                        fetchTasksWL();
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
                </SlidingPane>
        </div>
    );
}

export default withAuth(Home);
