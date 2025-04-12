import { useState, useEffect } from "react";  
import { useUser } from "../context/UserContext";  
import { useNavigate, Navigate } from "react-router-dom";  
import { Citrus } from "lucide-react";  
import LoadingScreen from "../components/LoadingScreen";  

const Login = () => {  
   const { user, login, loading, initialLoading } = useUser();  
   //const [loggingIn, setLoggingIn] = useState(false);
   const [email, setEmail] = useState("");  
   const [password, setPassword] = useState("");  
   const [isDisabled, setIsDisabled] = useState(false);  
   const [button, setButton] = useState(<>Zaloguj się</>);  
   const navigate = useNavigate();  

   useEffect(() => {  
       document.body.classList.add("bg-[#212121]");
       document.body.classList.replace("bg-[#ffffff]", "bg-[#212121]");

       if (!loading && user) {  
           document.body.classList.replace("bg-[#212121]", "bg-[#ffffff]");  
           navigate("/home");  
       }  
   }, [loading, user]);  

   if (loading || initialLoading) {  
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
                   <Citrus className="animate-bounce size-6/12 text-white" />  
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
               navigate("/home");  
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
       <div className="w-screen h-screen flex items-center justify-center">  
           <div className="bg-[#212121] md:text-sm md:rounded-xl lg:text-base lg:rounded-2xl flex flex-col items-center shadow-[0px_9px_30px_rgba(0,0,0,0.3)] p-8">  
               <h2 className="md:text-lg lg:text-xl text-[#8696BB]">Hej,</h2>  
               <h2 className="font-bold md:text-xl lg:text-2xl">  
                   Gotowy na administrację?  
               </h2>  
               <Citrus color="#63c5da" size="135" strokeWidth={0.35} />  
               <form className="flex flex-col w-full px-4">  
                   <label className="ml-3 md:text-sm lg:text-base font-bold">  
                       E-mail  
                   </label>  
                   <input  
                       type="email"  
                       name="email"  
                       placeholder="E-mail"  
                       className="border-[#63c5da] border-2 pl-5 h-14 bg-white rounded-lg md:text-sm lg:text-base"  
                       value={email}  
                       onChange={(e) => setEmail(e.target.value)}  
                       onKeyDown={(e) => {  
                           if (e.key === "Enter")  
                               document.getElementsByName("password")[0].focus();  
                       }}  
                   />  
                   <label className="ml-3 md:text-sm lg:text-base font-bold mt-5">  
                       Hasło  
                   </label>  
                   <input  
                       type="password"  
                       name="password"  
                       placeholder="Hasło"  
                       className="border-[#63c5da] border-2 md:p-4 lg:pl-5 h-14 bg-white rounded-lg md:text-sm lg:text-base"  
                       value={password}  
                       onChange={(e) => setPassword(e.target.value)}  
                       onKeyDown={(e) => {  
                           if (e.key === "Enter") handleLogin();  
                       }}  
                   />  
                   <button  
                       type="button"  
                       className="flex items-center justify-center text-white mt-5 h-16 bg-[#63c5da] md:rounded-lg lg:rounded-xl md:text-base lg:text-lg shadow-[0px_9px_30px_rgba(0,0,0,0.3)]"  
                       onClick={() => handleLogin()}  
                       disabled={isDisabled}  
                   >  
                       {button}  
                   </button>  
               </form>  
           </div>  
       </div>  
   );  
};  

export default Login;