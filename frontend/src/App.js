import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { WalletProvider } from "./context/WalletContext";
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import PendingPage from "./pages/PendingPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import InspectorDashboard from "./pages/InspectorDashboard";
import RegisterLand from "./pages/RegisterLand";
import ManageInspectors from "./pages/ManageInspectors";
import VerifyUsers from "./pages/VerifyUsers";
import VerifyLands from "./pages/VerifyLands";
import Marketplace from "./pages/Marketplace";
import MyLands from "./pages/MyLands";
import TransferRequests from "./pages/TransferRequests";
import SearchLand from "./pages/SearchLand";
import UserProfile from "./pages/UserProfile";
import AdminLands from "./pages/AdminLands";
import AdminUsers from "./pages/AdminUsers";

function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pending" element={<PendingPage />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/my-lands" element={<MyLands />} />
          <Route path="/user/marketplace" element={<Marketplace />} />
          <Route path="/user/transfers" element={<TransferRequests />} />
          <Route path="/user/search" element={<SearchLand />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/register-land" element={<RegisterLand />} />
          <Route path="/admin/inspectors" element={<ManageInspectors />} />
          <Route path="/inspector/dashboard" element={<InspectorDashboard />} />
          <Route path="/inspector/verify-users" element={<VerifyUsers />} />
          <Route path="/inspector/verify-lands" element={<VerifyLands />} />
          <Route path="/user/profile" element={<UserProfile />} />
          <Route path="/admin/lands" element={<AdminLands />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Routes>
      </Router>
      {/* This enables beautiful popup notifications across the whole app */}
      <ToastContainer position="bottom-right" theme="dark" autoClose={4000} />
    </WalletProvider>
  );
}

export default App;