import React, { useEffect } from "react";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import {Routes , Route, Navigate} from "react-router-dom";
import Navbar from "./components/Navbar";
import { useAuthStore } from "./store/useAuthStore.js";
import {Loader} from "lucide-react";
import {Toaster} from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore.js";

const App = () => {

  const {authUser , checkAuth ,isCheckingAuth,onlineUsers} = useAuthStore()  //using the zustand state for managing data globally
 const {theme} = useThemeStore();

 console.log({onlineUsers});
 

  useEffect (() =>{
    checkAuth();
  },[checkAuth]);

  console.log({authUser});

  // loading state
  if(isCheckingAuth && !authUser) return(
    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin"/>
    </div>
  )
  

  return (
    <>
     <div data-theme={theme}>

      <Navbar/>

      <Routes>
        {/* logic to send the user if he is login or not  */}
        <Route path="/" element={authUser ? <HomePage/> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage/> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ?  <LoginPage/> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage/>} />
        <Route path="/profile" element={authUser ? <ProfilePage/> : <Navigate to="/login" />} />

      </Routes> 

      <Toaster/>

     </div>
    </>
  );
};

export default App;
