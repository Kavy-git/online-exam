import React, { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Footer from './components/Footer/Footer';
import LoginPopup from './components/LoginPopup/LoginPopup';
import CreateTest from './pages/CreateTest/CreateTest';
import AttemptTest from './pages/AttemptTest/AttemptTest';
import Test from './pages/Test/Test';
import TestDetails from "./pages/TestDetails/TestDetails";
import AttemptInfo from './pages/AttemptInfo/AttemptInfo';
import AttemptTestPage from './pages/AttemptTestPage/AttemptTestPage';
import SubmissionSuccess from "./pages/SubmissionSuccess/SubmissionSuccess";
import AttemptDetails from "./pages/AttemptDetails/AttemptDetails";

import { AnimatePresence } from "framer-motion";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navigate } from 'react-router-dom';
import AccountPage from "./pages/AccountPage/AccountPage";
import StudentAttemptList from './pages/StudentAttemptList/StudentAttemptList';


const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  const token = localStorage.getItem("token");
  React.useEffect(() => {
  const params = new URLSearchParams(location.search);
  if (params.get("login") === "true") {
    setShowLogin(true);
  }
}, [location]);



  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <>
      <ToastContainer position="top-center" />
      

      
        {showLogin && <LoginPopup setShowLogin={setShowLogin} />}

        <div className='App'>
          <Navbar setShowLogin={setShowLogin} />

          {/* ⭐ Page Animations + Google Provider both working */}
          <AnimatePresence mode="wait">
           <Routes location={location} key={location.pathname}>

  {/* PUBLIC PAGES */}
  <Route path='/' element={<Home setShowLogin={setShowLogin} />} />
  <Route path='Test' element={token ? <Test /> : <Navigate to="/" />} />
  <Route path="/testdetails/:id" element={token ? <TestDetails /> : <Navigate to="/" />} />

  {/* PROTECTED PAGES (login required) */}
  <Route path='/CreateTest' element={token ? <CreateTest /> : <Navigate to="/" />} />
  <Route path='/AttemptTest' element={token ? <AttemptTest /> : <Navigate to="/" />} />
  <Route path="/attempt-info/:id" element={token ? <AttemptInfo /> : <Navigate to="/" />} />
  <Route path="/attempt-test/:id" element={token ? <AttemptTestPage /> : <Navigate to="/" />} />
  <Route path="/attemptdetails/:id" element={token ? <AttemptDetails /> : <Navigate to="/" />} />

  {/* SUBMISSION PAGE - allow everyone */}
  <Route path="/submitted" element={<SubmissionSuccess />} />
  <Route path="/account" element={<AccountPage />} />
  <Route path="/attemptsby/:regNo" element={<StudentAttemptList />} />


</Routes>

          </AnimatePresence>
        </div>

        <Footer />
      </>
    </GoogleOAuthProvider>
  );
};

export default App;
