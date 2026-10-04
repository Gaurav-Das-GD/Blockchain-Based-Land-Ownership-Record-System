import React, { useState, useContext } from "react";
import { WalletContext } from "../context/WalletContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const RegisterPage = () => {
  const { account, contract } = useContext(WalletContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", age: "", city: "", aadhaar: "", email: "", phone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) {
      toast.error("Please connect your wallet first!");
      return;
    }

    try {
      setLoading(true);
      const tx = await contract.registerUser(
        formData.name,
        parseInt(formData.age),
        formData.city,
        formData.aadhaar,
        formData.email,
        formData.phone,
        "profileHash",
        "docHash"
      );
      
      toast.info("Transaction submitted! Waiting for confirmation...");
      await tx.wait();
      
      toast.success("Registration successful! Wait for inspector verification.");
      navigate("/pending");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h2 style={styles.title}>📋 User Registration</h2>
        <p style={styles.wallet}>
          Wallet: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input style={styles.input} type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Age</label>
              <input style={styles.input} type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>City</label>
              <input style={styles.input} type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" required />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Aadhaar Number</label>
            <input style={styles.input} type="text" name="aadhaar" value={formData.aadhaar} onChange={handleChange} placeholder="1234-5678-9012" required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number</label>
            <input style={styles.input} type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" required />
          </div>

          <button style={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <button style={styles.backBtn} onClick={() => navigate("/")}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", fontFamily: "'Segoe UI', sans-serif" },
  formCard: { background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)", borderRadius: "16px", padding: "40px", width: "100%", maxWidth: "500px", color: "white" },
  title: { textAlign: "center", fontSize: "1.8rem", marginBottom: "5px" },
  wallet: { textAlign: "center", color: "#aaa", fontSize: "0.85rem", marginBottom: "25px" },
  inputGroup: { marginBottom: "15px", flex: 1 },
  label: { display: "block", marginBottom: "5px", color: "#ccc", fontSize: "0.9rem" },
  input: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: "1rem", outline: "none", boxSizing: "border-box" },
  row: { display: "flex", gap: "15px" },
  submitBtn: { width: "100%", padding: "12px", fontSize: "1.1rem", background: "#4caf50", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", marginTop: "10px" },
  backBtn: { width: "100%", padding: "10px", fontSize: "0.95rem", background: "transparent", color: "#aaa", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", cursor: "pointer", marginTop: "10px" },
};

export default RegisterPage;