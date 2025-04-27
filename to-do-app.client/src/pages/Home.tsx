import '../App.css';
import { withAuth } from '../services/withAuth';
import { useUser } from '../context/UserContext'
import LoadingScreen from '../components/LoadingScreen';
import { useEffect } from 'react';
import Navigation from '../components/Navigation';

function Home() {
    const { user, loggingOut, loading } = useUser();

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
