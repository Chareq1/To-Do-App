import '../App.css';
import { withAuth } from '../services/withAuth';
import { useUser } from '../context/UserContext';
import LoadingScreen from '../components/LoadingScreen';
import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { Notebook, ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle, ClockAlert } from 'lucide-react';
import * as Icons from 'lucide-react';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    addMonths,
    subMonths,
    format,
    isSameMonth,
    isSameDay,
    isToday
} from 'date-fns';
import { pl } from 'date-fns/locale';
import React from 'react';

// Interfejs do reprezentacji wydarzenia
interface Event {
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: any;
}

// Strona kalendarza
function Calendar() {
    // Wszystkie potrzebne hooki i stany
    const { user, loggingOut } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [categories, setCategories] = useState([]);

    // Efekt do ustawienia tła strony i ładowania danych kalendarza
    useEffect(() => {
        document.body.classList.add("bg-[#212121]");
        document.body.classList.replace("bg-[#ffffff]", "bg-[#212121]");

        // Funkcja do pobierania danych kalendarza
        const fetchCalendarData = async () => {
            setIsLoading(true);

            try {
                const taskResponse = await fetch(`/api/Task/user/${user?.userId}`);
                if (!taskResponse.ok) {
                    alert("Nie udało się pobrać zadań!");
                    const errorData = await taskResponse.json();
                    throw new Error(errorData.message);
                }

                const tasks = await taskResponse.json();

                const categoryResponse = await fetch(`/api/Category/user/${user?.userId}`);

                if (!categoryResponse.ok) {
                    alert("Nie udało się pobrać kategorii!");
                    const errorData = await categoryResponse.json();
                    throw new Error(errorData.message);
                }

                const categories = await categoryResponse.json();

                const transformedEvents = tasks.map((task: any) => {
                    const category = categories.find((cat: any) => cat.categoryId === task.categoryId);
                    return {
                        taskId: task.taskId,
                        title: task.name,
                        start: new Date(task.dueDate),
                        end: new Date(task.dueDate),
                        allDay: true,
                        category: category || null,
                        status: task.status,
                        priority: task.priority
                    };
                });

                setEvents(transformedEvents);
                setCategories(categories);
            } catch (error) {
                alert("Nie udało się pobrać danych kalendarza!");
                console.error("Błąd pobierania danych kalendarza: ", error);
            } finally {
                setTimeout(() => {
                    setIsLoading(false);
                }, 1500);
            }
        };

        fetchCalendarData();
    }, [user]);

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

            const taskResponse = await fetch(`/api/Task/user/${user?.userId}`);

            if (!taskResponse.ok) {
                alert("Nie udało się pobrać zadań!");
                const errorData = await taskResponse.json();
                throw new Error(errorData.message);
            }

            const tasks = await taskResponse.json();

            const transformedEvents = tasks.map((task: any) => {
                const category = categories.find((cat: any) => cat.categoryId === task.categoryId);
                return {
                    taskId: task.taskId,
                    title: task.name,
                    start: new Date(task.dueDate),
                    end: new Date(task.dueDate),
                    allDay: true,
                    category: category || null,
                    status: task.status,
                    priority: task.priority
                };
            });

            setEvents(transformedEvents);
        } catch (error) {
            alert("Nie udało się zaktualizować statusu zadania!");
            console.error("Błąd aktualizacji statusu zadania: ", error);
        }
    };

    // Funkcja do renderowania nagłówka kalendarza
    const renderHeader = () => (
        <div className="flex justify-center items-center py-4 px-2 gap-x-10">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="items-center justify-center text-white p-2 bg-[#2775EE] hover:bg-[#0F52BA] md:text-base lg:text-lg shadow-[0px_9px_30px_rgba(0,0,0,0.3)] cursor-pointer rounded-full"><ChevronLeft /></button>
            <h2 className="text-sm text-center md:text-xl font-semibold">{format(currentMonth, 'LLLL yyyy', { locale: pl })}</h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="items-center justify-center text-white p-2 bg-[#2775EE] hover:bg-[#0F52BA] md:text-base lg:text-lg shadow-[0px_9px_30px_rgba(0,0,0,0.3)] cursor-pointer rounded-full"><ChevronRight /></button>
        </div>
    );

    // Funkcja do renderowania dni tygodnia
    const renderDays = () => {
        const dayNames = ['PN', 'WT', 'ŚR', 'CZ', 'PT', 'SB', 'ND'];

        return (
            <div className="grid grid-cols-7 mb-2">
                {dayNames.map((day) => (
                    <div key={day} className={`text-center ${day == 'ND' ? "text-[#D21404]" : "text-[#262626]"} text-base font-bold`}>
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    // Funkcja do obsługi kliknięcia w datę
    const onDateClick = (day) => {
        setSelectedDate(day);

        if (!isSameMonth(day, currentMonth)) {
            setCurrentMonth(startOfMonth(day));
        }
    };

    // Funkcja do renderowania komórek kalendarza
    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;

                const isSelected = isSameDay(day, selectedDate);
                const isCurrentToday = isToday(day);
                const inCurrentMonth = isSameMonth(day, monthStart);

                const hasEvent = events.some(event => isSameDay(new Date(event.start), day));

                days.push(
                    <div
                        key={day}
                        onClick={() => onDateClick(cloneDay)}
                        className={`flex justify-center items-center h-14 w-full cursor-pointer text-sm relative
              ${!inCurrentMonth ? 'text-gray-500' : 'text-[#e8e8e8]'}
              ${isSelected ? 'bg-[#2775EE] text-white rounded-full w-10 h-10 font-bold' : ''}
              ${!isSelected && isCurrentToday ? 'border-2 border-[#2775EE] text-[#2775EE] rounded-full w-10 h-10 hover:bg-[#0F52BA] font-bold' : ''}
              hover:bg-[#515151] hover:rounded-full transition-all duration-200
            `}
                    >
                        {format(day, 'd')}
                        {hasEvent && (
                            <div className={`absolute bottom-1.5 left-1/2 transform -translate-x-1/2 ${isSelected ? "bg-white" : "bg-[#2775EE]"} w-1.5 h-1.5 rounded-full`}></div>
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 h-full" key={day}>
                    {days}
                </div>
            );
            days = [];
        }

        return <div>{rows}</div>;
    };

    // Funkcja do renderowania wydarzeń na wybrany dzień
    const selectedDateEvents = events.filter(
        (event) => isSameDay(new Date(event.start), selectedDate)
    );

    // Funkcja do renderowania karty zadania
    const TaskCard = ({ task }: { task: any }) => {
        const taskTime = task.start ? format(new Date(task.start), 'HH:mm', { locale: pl }) : null;
        const isOutOfDate = task.start && new Date(task.start) < new Date() && task.status !== 2;

        return (
            <div
                key={task.taskId}
                className="flex items-center justify-between bg-[#515151] p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 mb-2 w-full"
            >
                <div className="flex items-center gap-4 w-full">
                    <div
                        className="w-12 h-12 flex items-center justify-center rounded-full font-bold shrink-0"
                        style={{
                            backgroundColor: task.category?.colorHex || 'var(--color-gray-400)',
                        }}
                    >
                        {React.createElement(
                            Icons[task.category?.iconName || 'BadgeAlert'],
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
                                {task.title}
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

                        <div className="flex items-center justify-between">
                            {taskTime && (
                                <p className="text-xs md:text-sm text-gray-400">
                                    {taskTime}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    return loggingOut ? (
        <LoadingScreen />
    ) : (
        <div className="flex w-full min-h-screen max-h-screen flex-row font-[Ubuntu] overflow-y-auto">
            <div className="p-5">
                <Navigation />
            </div>
            <div className="flex flex-col w-full pb-5 pt-5 pr-5 text-[#E8E8E8] max-h-screen min-h-screen">
                <div className="flex flex-col h-full w-full bg-[#313131] rounded-xl overflow-hidden">
                    {/* Nagłówek */}
                    <div className="p-5 w-full">
                        <h1 className="font-bold text-4xl h-full">Kalendarz</h1>
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
                            <>
                                <div className="w-full flex items-center justify-center h-full overflow-x-auto">
                                    <div className="flex flex-col md:flex-row w-full rounded-lg gap-y-5 md:gap-x-5 h-full p-5 min-w-0">
                                        {/* Sekcja kalendarza */}
                                        <div className="md:w-1/2 w-full p-6 flex flex-col space-y-6 h-1/2 md:h-full rounded-2xl bg-[#414141] justify-center overflow-x-auto min-w-0">
                                            {renderHeader()}
                                            {renderDays()}
                                            <div className="overflow-x-auto">{renderCells()}</div>
                                        </div>

                                        {/* Sekcja wydarzeń */}
                                        <div className="md:w-1/2 w-full p-5 flex flex-col space-y-6 rounded-2xl bg-[#414141] h-1/2 md:h-full min-w-0 overflow-y-auto">
                                            <h3 className="text-xl font-bold mb-5">
                                                {format(selectedDate, 'EEEE, PPP', { locale: pl })}
                                            </h3>

                                            {selectedDateEvents.length > 0 ? (
                                                <div className="h-full overflow-y-auto">
                                                    {selectedDateEvents.map((event) => (
                                                        <TaskCard key={event.taskId} task={event} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="flex text-gray-500 mt-2 justify-center items-center h-full w-full">
                                                    Brak wydarzeń na ten dzień.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withAuth(Calendar);
