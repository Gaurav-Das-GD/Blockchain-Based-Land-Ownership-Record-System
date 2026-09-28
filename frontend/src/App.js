import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import PendingPage from "./pages/PendingPage";
import UserDashboard from "./pages/UserDashboard";

function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pending" element={<PendingPage />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
        </Routes>
      </Router>
    </WalletProvider>
  );
}

export default App;