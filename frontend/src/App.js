import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* More routes will be added in upcoming days */}
        </Routes>
      </Router>
    </WalletProvider>
  );
}

export default App;