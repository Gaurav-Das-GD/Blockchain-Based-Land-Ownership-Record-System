import React from "react";
import { useNavigate } from "react-router-dom";

const PendingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.icon}>⏳</h1>
        <h2 style={styles.title}>Registration Pending</h2>
        <p style={styles.text}>
          Your registration is under review. A Land Inspector will verify your
          documents and approve your account.
        </p>
        <p style={styles.status}>Status: 🟡 Pending Verification</p>
        <button style={styles.btn} onClick={() => navigate("/")}>
          ← Back to Home
        </button>
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
    fontFamily: "'Segoe UI', sans-serif",
    color: "white",
  },
  card: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: "50px",
    textAlign: "center",
    maxWidth: "450px",
  },
  icon: { fontSize: "4rem", marginBottom: "10px" },
  title: { fontSize: "1.8rem", marginBottom: "15px" },
  text: { color: "#ccc", fontSize: "1rem", marginBottom: "20px" },
  status: { fontSize: "1.1rem", color: "#ffc107", marginBottom: "25px" },
  btn: {
    padding: "12px 30px",
    background: "transparent",
    color: "#aaa",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1rem",
  },
};

export default PendingPage;