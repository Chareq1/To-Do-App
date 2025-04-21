import { useEffect, useState } from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { Layers, Home as HomeIcon, Calendar, ChevronFirst, ChevronLast, LogOut } from "lucide-react";
import { useUser } from "../context/UserContext";

interface Avatar {
   avatarId: string;
   fileName: string;
   filePath: string;
}

const Navigation = () => {
   const location = useLocation();
   const pathname = location.pathname;
   const [expanded, setExpanded] = useState(false);
   const { user, logout } = useUser();
   const [avatar, setAvatar] = useState<Avatar>(null);

   const navigate = useNavigate();

   useEffect(() => {
       const fetchAvatar = async () => {
           const response = await fetch(`/api/Avatar/${user?.avatarId}`);
           if (response.ok) {
               const avatar = await response.json();
               setAvatar(avatar);
           }
       };

       fetchAvatar();
   }, [user?.avatarId]);

   function handleLogout() {
       logout();
       navigate("/login");
   }

   return (
       <div
           className={`h-full ${expanded ? "w-64" : "w-20"} flex flex-col shadow-lg rounded-xl bg-[#0F52BA] transition-all duration-300 relative`}
       >
           {/* Expand/Collapse Button */}
           <div className="flex-none flex items-center justify-center py-4 sm:flex hidden">
               <button
                   onClick={() => setExpanded((prev) => !prev)}
                   className="p-2 rounded-full bg-white text-[#0F52BA] hover:bg-gray-200 transition-all"
               >
                   {expanded ? <ChevronFirst size={25} /> : <ChevronLast size={25} />}
               </button>
           </div>

           {/* Navigation Items */}
           <ul className="flex flex-col gap-y-2 text-white px-2 mt-4">
               <NavLink
                   to="/home"
                   className={({ isActive }) =>
                       `flex items-center gap-x-3 py-2 px-3 rounded-full cursor-pointer transition-colors ${isActive
                           ? "bg-white text-black shadow-md"
                           : "hover:bg-[#1368EC]"
                       }`
                   }
               >
                   <div className="flex items-center justify-center w-10 h-10">
                       <HomeIcon className="w-6 h-6" />
                   </div>
                   {expanded && <p>Strona główna</p>}
               </NavLink>

               <NavLink
                   to="/tasks"
                   className={({ isActive }) =>
                       `flex items-center gap-x-3 py-2 px-3 rounded-full cursor-pointer transition-colors ${isActive
                           ? "bg-white text-black shadow-md"
                           : "hover:bg-[#1368EC]"
                       }`
                   }
               >
                   <div className="flex items-center justify-center w-10 h-10">
                       <Layers className="w-6 h-6" />
                   </div>
                   {expanded && <p>Zadania</p>}
               </NavLink>

               <NavLink
                   to="/calendar"
                   className={({ isActive }) =>
                       `flex items-center gap-x-3 py-2 px-3 rounded-full cursor-pointer transition-colors ${isActive
                           ? "bg-white text-black shadow-md"
                           : "hover:bg-[#1368EC]"
                       }`
                   }
               >
                   <div className="flex items-center justify-center w-10 h-10">
                       <Calendar className="w-6 h-6" />
                   </div>
                   {expanded && <p>Kalendarz</p>}
               </NavLink>
           </ul>

           <div className="absolute left-0 bottom-0 w-full">
               <div className={`p-4 flex items-center justify-between ${expanded ? "flex-row" : "flex-col"}`}>
                   <div className="flex items-center">
                       <NavLink
                           to="/user"
                            className="flex flex-row gap-3">
                            <div className="w-10 h-10">
                                {avatar ? (
                                    <img
                                        src={`${avatar.filePath}${avatar.fileName}`}
                                        alt="User Avatar"
                                        className="w-full h-full rounded-full object-cover border-white"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gray-300"></div>
                                )}
                           </div>

                           {expanded && (
                                <div>
                                    <p className="text-white font-semibold text-sm">{user?.name} {user?.surname}</p>
                                    <p className="text-gray-300 text-xs">{user?.username}</p>
                                </div>
                           )}
                       </NavLink>
                   </div>

                   <button
                       onClick={handleLogout}
                       className={`p-2 rounded-full bg-[#D0312D] text-white hover:bg-[#B90E0A] flex-shrink-0 ${!expanded ? "mt-2": ""}`}
                   >
                       <LogOut size={20} />
                   </button>
               </div>
           </div>
       </div>
   );
};

export default Navigation;
