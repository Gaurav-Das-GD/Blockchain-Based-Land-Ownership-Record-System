import React, { useContext } from "react";
import { WalletContext } from "../context/WalletContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const LandingPage = () => {
  const { account, role, loading, connectWallet } = useContext(WalletContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (account && role) {
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "inspector") navigate("/inspector/dashboard");
      else if (role === "user") navigate("/user/dashboard");
      else if (role === "pending") navigate("/pending");
      else if (role === "unregistered") navigate("/register");
    }
  }, [account, role, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>🏗️ Blockchain Land Registry</h1>
        <p style={styles.subtitle}>
          Transparent, Immutable & Secure Land Records on Blockchain
        </p>

        <div style={styles.features}>
          <div style={styles.featureCard}>
            <h3>🔒 Secure</h3>
            <p>Records stored on blockchain cannot be tampered</p>
          </div>
          <div style={styles.featureCard}>
            <h3>🔍 Transparent</h3>
            <p>Anyone can verify land ownership instantly</p>
          </div>
          <div style={styles.featureCard}>
            <h3>⚡ Fast</h3>
            <p>No middlemen, instant transfers</p>
          </div>
          <div style={styles.featureCard}>
            <h3>📜 Immutable</h3>
            <p>Ownership history can never be altered</p>
          </div>
        </div>

        <button
          style={styles.connectBtn}
          onClick={connectWallet}
          disabled={loading}
        >
          {loading ? "Connecting..." : "🦊 Connect MetaMask Wallet"}
        </button>

        {account && (
          <p style={styles.connected}>
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontFamily: "'Segoe UI', sans-serif",
  },
  hero: {
    textAlign: "center",
    padding: "40px",
    maxWidth: "900px",
  },
  title: {
    fontSize: "3rem",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "1.3rem",
    color: "#ccc",
    marginBottom: "40px",
  },
  features: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  featureCard: {
    background: "rgba(255,255,255,0.1)",
    padding: "20px",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
  },
  connectBtn: {
    padding: "15px 40px",
    fontSize: "1.2rem",
    background: "#f6851b",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  connected: {
    marginTop: "20px",
    color: "#4caf50",
    fontSize: "1rem",
  },
};

export default LandingPage;