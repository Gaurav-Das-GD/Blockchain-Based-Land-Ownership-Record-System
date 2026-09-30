import React, { useState, useContext } from "react";
import { WalletContext } from "../context/WalletContext";
import Sidebar from "../components/Sidebar";

const adminMenu = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "🏠" },
  { label: "Register Land", path: "/admin/register-land", icon: "🏞️" },
  { label: "Manage Inspectors", path: "/admin/inspectors", icon: "👮" },
  { label: "All Users", path: "/admin/users", icon: "👥" },
  { label: "All Lands", path: "/admin/lands", icon: "📊" },
];

const ManageInspectors = () => {
  const { contract } = useContext(WalletContext);
  const [loading, setLoading] = useState(false);
  const [inspectorAddress, setInspectorAddress] = useState("");
  const [checkAddress, setCheckAddress] = useState("");
  const [checkResult, setCheckResult] = useState(null);

  const addInspector = async () => {
    if (!contract) return alert("Connect wallet first!");
    if (!inspectorAddress) return alert("Enter an address!");

    try {
      setLoading(true);
      const tx = await contract.addLandInspector(inspectorAddress);
      await tx.wait();
      alert("✅ Inspector added successfully!");
      setInspectorAddress("");
    } catch (error) {
      console.error(error);
      alert("❌ Failed: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  const removeInspector = async () => {
    if (!contract) return alert("Connect wallet first!");
    if (!inspectorAddress) return alert("Enter an address!");

    try {
      setLoading(true);
      const tx = await contract.removeLandInspector(inspectorAddress);
      await tx.wait();
      alert("✅ Inspector removed successfully!");
      setInspectorAddress("");
    } catch (error) {
      console.error(error);
      alert("❌ Failed: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  const checkInspector = async () => {
    if (!contract) return alert("Connect wallet first!");
    if (!checkAddress) return alert("Enter an address!");

    try {
      const result = await contract.isLandInspector(checkAddress);
      setCheckResult(result);
    } catch (error) {
      console.error(error);
      alert("❌ Error: " + error.message);
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar menuItems={adminMenu} />
      <div style={styles.main}>
        <h1 style={styles.heading}>👮 Manage Inspectors</h1>
        <p style={styles.subtitle}>Add or remove land inspectors</p>

        {/* Add / Remove Inspector */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Add / Remove Inspector</h2>
          <div style={styles.inputRow}>
            <input
              style={styles.input}
              type="text"
              value={inspectorAddress}
              onChange={(e) => setInspectorAddress(e.target.value)}
              placeholder="Enter inspector wallet address (0x...)"
            />
          </div>
          <div style={styles.btnRow}>
            <button style={styles.addBtn} onClick={addInspector} disabled={loading}>
              {loading ? "Processing..." : "✅ Add Inspector"}
            </button>
            <button style={styles.removeBtn} onClick={removeInspector} disabled={loading}>
              {loading ? "Processing..." : "❌ Remove Inspector"}
            </button>
          </div>
        </div>

        {/* Check Inspector */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🔍 Check Inspector Status</h2>
          <div style={styles.inputRow}>
            <input
              style={styles.input}
              type="text"
              value={checkAddress}
              onChange={(e) => setCheckAddress(e.target.value)}
              placeholder="Enter wallet address to check (0x...)"
            />
            <button style={styles.checkBtn} onClick={checkInspector}>
              Check
            </button>
          </div>
          {checkResult !== null && (
            <p style={styles.result}>
              {checkResult
                ? "✅ This address IS a Land Inspector"
                : "❌ This address is NOT a Land Inspector"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  layout: { display: "flex", minHeight: "100vh", background: "#0f0f1a", color: "white", fontFamily: "'Segoe UI', sans-serif" },
  main: { marginLeft: "280px", padding: "30px", width: "100%" },
  heading: { fontSize: "1.8rem", marginBottom: "5px" },
  subtitle: { color: "#888", marginBottom: "30px" },
  card: { background: "rgba(255,255,255,0.05)", padding: "25px", borderRadius: "14px", maxWidth: "600px", marginBottom: "25px" },
  cardTitle: { fontSize: "1.2rem", marginBottom: "15px" },
  inputRow: { display: "flex", gap: "10px", marginBottom: "15px" },
  input: { flex: 1, padding: "12px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: "0.95rem", outline: "none" },
  btnRow: { display: "flex", gap: "10px" },
  addBtn: { flex: 1, padding: "12px", background: "#4caf50", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem", fontWeight: "bold" },
  removeBtn: { flex: 1, padding: "12px", background: "#f44336", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem", fontWeight: "bold" },
  checkBtn: { padding: "12px 25px", background: "#2196f3", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" },
  result: { marginTop: "10px", fontSize: "1rem", padding: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "8px" },
};

export default ManageInspectors;