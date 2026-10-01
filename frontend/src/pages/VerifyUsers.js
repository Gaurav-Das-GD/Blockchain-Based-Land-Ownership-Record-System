import React, { useState, useContext } from "react";
import { WalletContext } from "../context/WalletContext";
import Sidebar from "../components/Sidebar";

const inspectorMenu = [
  { label: "Dashboard", path: "/inspector/dashboard", icon: "🏠" },
  { label: "Verify Users", path: "/inspector/verify-users", icon: "👤" },
  { label: "Verify Lands", path: "/inspector/verify-lands", icon: "🏞️" },
  { label: "Approve Transfers", path: "/inspector/transfers", icon: "🔄" },
];

const VerifyUsers = () => {
  const { contract } = useContext(WalletContext);
  const [loading, setLoading] = useState(false);
  const [searchAddress, setSearchAddress] = useState("");
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

  const searchUser = async () => {
    if (!contract) return alert("Connect wallet first!");
    if (!searchAddress) return alert("Enter an address!");
    setError("");
    setUserData(null);

    try {
      const user = await contract.getUserDetails(searchAddress);
      setUserData({
        address: searchAddress,
        name: user.name,
        age: Number(user.age),
        city: user.city,
        aadhaar: user.aadhaarNumber,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
      });
    } catch (err) {
      setError("User not found or not registered.");
    }
  };

  const verifyUser = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.verifyUser(searchAddress);
      await tx.wait();
      alert("✅ User verified successfully!");
      searchUser(); // Refresh
    } catch (err) {
      alert("❌ Failed: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  const rejectUser = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      const tx = await contract.rejectUser(searchAddress);
      await tx.wait();
      alert("✅ User rejected!");
      searchUser();
    } catch (err) {
      alert("❌ Failed: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar menuItems={inspectorMenu} />
      <div style={styles.main}>
        <h1 style={styles.heading}>👤 Verify Users</h1>
        <p style={styles.subtitle}>Search and verify user registrations</p>

        {/* Search */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🔍 Search User</h2>
          <div style={styles.searchRow}>
            <input
              style={styles.input}
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Enter user wallet address (0x...)"
            />
            <button style={styles.searchBtn} onClick={searchUser}>Search</button>
          </div>
          {error && <p style={styles.error}>{error}</p>}
        </div>

        {/* User Details */}
        {userData && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📋 User Details</h2>
            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Name</span>
                <span style={styles.detailValue}>{userData.name}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Age</span>
                <span style={styles.detailValue}>{userData.age}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>City</span>
                <span style={styles.detailValue}>{userData.city}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Aadhaar</span>
                <span style={styles.detailValue}>{userData.aadhaar}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Email</span>
                <span style={styles.detailValue}>{userData.email}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Phone</span>
                <span style={styles.detailValue}>{userData.phone}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Status</span>
                <span style={styles.detailValue}>
                  {userData.isVerified ? "✅ Verified" : "🟡 Pending"}
                </span>
              </div>
            </div>

            {!userData.isVerified && (
              <div style={styles.btnRow}>
                <button style={styles.approveBtn} onClick={verifyUser} disabled={loading}>
                  {loading ? "Processing..." : "✅ Approve User"}
                </button>
                <button style={styles.rejectBtn} onClick={rejectUser} disabled={loading}>
                  {loading ? "Processing..." : "❌ Reject User"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  layout: { display: "flex", minHeight: "100vh", background: "#0f0f1a", color: "white", fontFamily: "'Segoe UI', sans-serif" },
  main: { marginLeft: "280px", padding: "30px", width: "100%" },
  heading: { fontSize: "1.8rem", marginBottom: "5px" },
  subtitle: { color: "#888", marginBottom: "25px" },
  card: { background: "rgba(255,255,255,0.05)", padding: "25px", borderRadius: "14px", maxWidth: "650px", marginBottom: "20px" },
  cardTitle: { fontSize: "1.2rem", marginBottom: "15px" },
  searchRow: { display: "flex", gap: "10px" },
  input: { flex: 1, padding: "12px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: "0.95rem", outline: "none" },
  searchBtn: { padding: "12px 25px", background: "#2196f3", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" },
  error: { color: "#f44336", marginTop: "10px" },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" },
  detailItem: { background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px" },
  detailLabel: { display: "block", color: "#888", fontSize: "0.8rem", marginBottom: "4px" },
  detailValue: { fontSize: "1rem" },
  btnRow: { display: "flex", gap: "10px" },
  approveBtn: { flex: 1, padding: "12px", background: "#4caf50", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem", fontWeight: "bold" },
  rejectBtn: { flex: 1, padding: "12px", background: "#f44336", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem", fontWeight: "bold" },
};

export default VerifyUsers;