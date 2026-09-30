import React, { useState, useContext } from "react";
import { WalletContext } from "../context/WalletContext";
import Sidebar from "../components/Sidebar";
import { ethers } from "ethers";

const adminMenu = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "🏠" },
  { label: "Register Land", path: "/admin/register-land", icon: "🏞️" },
  { label: "Manage Inspectors", path: "/admin/inspectors", icon: "👮" },
  { label: "All Users", path: "/admin/users", icon: "👥" },
  { label: "All Lands", path: "/admin/lands", icon: "📊" },
];

const RegisterLand = () => {
  const { contract } = useContext(WalletContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    owner: "",
    location: "",
    city: "",
    area: "",
    price: "",
    propertyId: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) return alert("Connect wallet first!");

    try {
      setLoading(true);
      const tx = await contract.registerLand(
        formData.owner,
        formData.location,
        formData.city,
        parseInt(formData.area),
        ethers.parseEther(formData.price),
        "docHash",
        formData.propertyId
      );
      await tx.wait();
      alert("✅ Land registered successfully!");
      setFormData({ owner: "", location: "", city: "", area: "", price: "", propertyId: "" });
    } catch (error) {
      console.error(error);
      alert("❌ Failed: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar menuItems={adminMenu} />
      <div style={styles.main}>
        <h1 style={styles.heading}>🏞️ Register New Land</h1>
        <p style={styles.subtitle}>Only admin can register land parcels</p>

        <div style={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Owner Wallet Address</label>
              <input style={styles.input} type="text" name="owner" value={formData.owner} onChange={handleChange} placeholder="0x..." required />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Location / Address</label>
              <input style={styles.input} type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Ward 45, Plot 12A" required />
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>City</label>
                <input style={styles.input} type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Kolkata" required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Area (sq ft)</label>
                <input style={styles.input} type="number" name="area" value={formData.area} onChange={handleChange} placeholder="1200" required />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Price (ETH)</label>
                <input style={styles.input} type="text" name="price" value={formData.price} onChange={handleChange} placeholder="2.5" required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Property ID</label>
                <input style={styles.input} type="text" name="propertyId" value={formData.propertyId} onChange={handleChange} placeholder="PROP-001" required />
              </div>
            </div>

            <button style={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? "Registering..." : "✅ Register Land"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  layout: { display: "flex", minHeight: "100vh", background: "#0f0f1a", color: "white", fontFamily: "'Segoe UI', sans-serif" },
  main: { marginLeft: "280px", padding: "30px", width: "100%" },
  heading: { fontSize: "1.8rem", marginBottom: "5px" },
  subtitle: { color: "#888", marginBottom: "25px" },
  formCard: { background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "14px", maxWidth: "600px" },
  inputGroup: { marginBottom: "15px", flex: 1 },
  label: { display: "block", marginBottom: "5px", color: "#ccc", fontSize: "0.9rem" },
  input: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: "1rem", outline: "none", boxSizing: "border-box" },
  row: { display: "flex", gap: "15px" },
  submitBtn: { width: "100%", padding: "14px", fontSize: "1.1rem", background: "#4caf50", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", marginTop: "10px" },
};

export default RegisterLand;