import { useState, useEffect } from "react";  
import { useUser } from "../context/UserContext";  
import { useNavigate, Navigate, Link, replace } from "react-router-dom";  
import { Notebook } from "lucide-react";  
import LoadingScreen from "../components/LoadingScreen";  

const Login = () => {  
   const { user, login, loading, initialLoading } = useUser();  
   //const [loggingIn, setLoggingIn] = useState(false);
   const [email, setEmail] = useState("");  
   const [password, setPassword] = useState("");  
   const [isDisabled, setIsDisabled] = useState(false);  
    const [button, setButton] = useState(<>Zaloguj się</>);  
    const [authLoading, setAuthLoading] = useState(false);
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
       //setLoggingIn(true);  

       try {  
           setIsDisabled(true);  
           setButton(  
               <>  
                   <Notebook className="animate-bounce size-6/12 text-white" />
                   <span className="sr-only">Loading...</span>
               </>  
           );  

           if (!email) {  
               alert("Proszę wprowadzić e-mail użytkownika!");  
               setIsDisabled(false);  
               setButton(<>Zaloguj się</>);  
           } else if (!password) {  
               alert("Proszę wprowadzić hasło użytkownika!");  
               setIsDisabled(false);  
               setButton(<>Zaloguj się</>);  
           } else {  
               await login(email, password);  
               setTimeout(() => {
                   navigate("/home");
               }, 1500);
           }  
       } catch (error) {  
           console.error(error);  
           setIsDisabled(false);  
           setButton(<>Zaloguj się</>);  
           alert("Logowanie nieudane. Sprawdź dane do logowania!");  
       } finally {  
           //setLoggingIn(false);  
       }  
   };  

   return (  
       <div className="w-full flex items-center justify-center md:flex-row m-0 h-screen font-[Ubuntu] flex-col">  
           <div className="w-full  h-full rounded-xl items-center justify-center p-5 relative sm:flex-1 lg:flex-2">
               <img src="/Resources/login1.jpg" className="rounded-xl object-cover h-full" />

               <div className="absolute text-white text-left top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                   <h1 className="text-5xl font-bold md:text-7xl">Hej,</h1>
                   <h2 className="text-3xl font-semi md:text-5xl">Gotowy na planowanie?</h2>
               </div>

               <div className="absolute top-10 left-10">
                   <Notebook size="48" color="white"/>
               </div>
           </div>

           <div className="w-full bg-[#212121] rounded-2xl flex flex-col p-5 items-center flex-1 text-left">  
               <label className="text-4xl text-[#e8e8e8] mb-10 font-bold text-left w-3/4 pl-5">Zaloguj się</label>  
               <form className="flex flex-col w-full px-4 items-center">  
                   <label className="ml-5 mb-1 md:text-sm lg:text-base font-bold text-[#e8e8e8] w-3/4">  
                       E-mail  
                   </label>  
                   <input  
                       type="email"  
                       name="email"  
                       placeholder="E-mail"  
                       className="border-[#2775EE] border-2 pl-5 h-14 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-3/4"  
                       value={email}  
                       onChange={(e) => setEmail(e.target.value)}  
                       onKeyDown={(e) => {  
                           if (e.key === "Enter")  
                               document.getElementsByName("password")[0].focus();  
                       }}  
                   />  

                   <label className="ml-5 mb-1 md:text-sm lg:text-base font-bold mt-5 text-[#e8e8e8] w-3/4">  
                       Hasło  
                   </label>  
                   <input  
                       type="password"  
                       name="password"  
                       placeholder="Hasło"  
                       className="border-[#2775EE] border-2 mb-15 md:p-4 pl-5 h-14 md:text-sm lg:text-base rounded-full bg-[#4a4a4a] text-[#e8e8e8] w-3/4"  
                       value={password}  
                       onChange={(e) => setPassword(e.target.value)}  
                       onKeyDown={(e) => {  
                           if (e.key === "Enter") handleLogin();  
                       }}  
                   />  

                   <button  
                       type="button"  
                       className="flex rounded-full items-center justify-center text-white h-16 bg-[#2775EE] md:text-base lg:text-lg shadow-[0px_9px_30px_rgba(0,0,0,0.3)] w-3/4"  
                       onClick={() => handleLogin()}  
                       disabled={isDisabled}  
                   >  
                       {button}  
                   </button>

                   <div className="mt-3">
                       <p className="text-[#E8E8E8]">Nie masz konta? &nbsp; <Link to="/register" className="text-[#2775EE]">Zarejestruj się</Link></p>
                   </div>
               </form>  
           </div> 
       </div>  
   );  
};  

export default Login;