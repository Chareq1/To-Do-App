import '../App.css';
import { withAuth } from '../services/withAuth';
import { useUser } from '../context/UserContext'
import LoadingScreen from '../components/LoadingScreen';
import { useEffect } from 'react';
import Navigation from '../components/Navigation';
import { Home as HomeIcon, LayoutDashboard, StickyNote, Calendar, Layers, Flag, Settings, LifeBuoy } from 'lucide-react';

function Home() {
    const { user, loggingOut, loading } = useUser();

    const sidebarItems = [
        { icon: <HomeIcon size={20} />, text: "Home", active: true, alert: false },
        { icon: <LayoutDashboard size={20} />, text: "Dashboard", active: false, alert: false },
        { icon: <StickyNote size={20} />, text: "Projects", active: false, alert: true },
        { icon: <Calendar size={20} />, text: "Calendar", active: false, alert: false },
        { icon: <Layers size={20} />, text: "Tasks", active: false, alert: false },
        { icon: <Flag size={20} />, text: "Reporting", active: false, alert: false },
        { icon: <Settings size={20} />, text: "Settings", active: false, alert: false },
        { icon: <LifeBuoy size={20} />, text: "Help", active: false, alert: false },
    ];

   useEffect(() => {
       document.body.classList.add("bg-[#212121]");
       document.body.classList.replace("bg-[#ffffff]", "bg-[#212121]");
   }, []);

   return (
        loggingOut ? (
               <LoadingScreen />
       ) : (
               <div className="flex w-full h-screen flex-row font-[Ubuntu]">
                   <div className="p-5">
                       <Navigation />
                   </div>
                   <div className="flex h-full w-full pb-5 pt-5 pr-5 text-[#E8E8E8]">
                       <div className="flex h-full w-full bg-[#313131] rounded-xl">
                           <div className="p-5 w-full h-full">
                               <h1 className="font-bold text-4xl h-full">Strona główna</h1>
                           </div>
                       </div>
                   </div>
               </div>
       )
   );
};

export default withAuth(Home);
