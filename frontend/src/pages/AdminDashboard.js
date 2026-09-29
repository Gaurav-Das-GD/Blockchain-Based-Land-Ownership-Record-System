import React, { useContext, useEffect, useState } from "react";
import { WalletContext } from "../context/WalletContext";
import Sidebar from "../components/Sidebar";

const adminMenu = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "🏠" },
  { label: "Register Land", path: "/admin/register-land", icon: "🏞️" },
  { label: "Manage Inspectors", path: "/admin/inspectors", icon: "👮" },
  { label: "All Users", path: "/admin/users", icon: "👥" },
  { label: "All Lands", path: "/admin/lands", icon: "📊" },
];

const AdminDashboard = () => {
  const { account, contract } = useContext(WalletContext);
  const [stats, setStats] = useState({
    totalLands: 0,
    totalTransfers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!contract) return;
      try {
        const landCount = await contract.landCount();
        const transferCount = await contract.transferCount();
        setStats({
          totalLands: Number(landCount),
          totalTransfers: Number(transferCount),
        });
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchStats();
  }, [contract]);

  return (
    <div style={styles.layout}>
      <Sidebar menuItems={adminMenu} />
      <div style={styles.main}>
        <h1 style={styles.heading}>⚙️ Admin Dashboard</h1>
        <p style={styles.subtitle}>
          Welcome, Admin ({account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ""})
        </p>

        <div style={styles.statsRow}>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #4caf50" }}>
            <h3 style={styles.statNumber}>{stats.totalLands}</h3>
            <p style={styles.statLabel}>Total Lands Registered</p>
          </div>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #2196f3" }}>
            <h3 style={styles.statNumber}>{stats.totalTransfers}</h3>
            <p style={styles.statLabel}>Total Transfers</p>
          </div>
        </div>

        <div style={styles.quickActions}>
          <h2 style={styles.sectionTitle}>⚡ Quick Actions</h2>
          <div style={styles.actionsGrid}>
            <button style={styles.actionBtn} onClick={() => window.location.href = "/admin/register-land"}>
              🏞️ Register New Land
            </button>
            <button style={styles.actionBtn} onClick={() => window.location.href = "/admin/inspectors"}>
              👮 Manage Inspectors
            </button>
            <button style={styles.actionBtn} onClick={() => window.location.href = "/admin/users"}>
              👥 View All Users
            </button>
            <button style={styles.actionBtn} onClick={() => window.location.href = "/admin/lands"}>
              📊 View All Lands
            </button>
          </div>
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
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "40px" },
  statCard: { background: "rgba(255,255,255,0.05)", padding: "25px", borderRadius: "12px" },
  statNumber: { fontSize: "2.2rem", marginBottom: "5px" },
  statLabel: { color: "#aaa", fontSize: "0.9rem" },
  sectionTitle: { fontSize: "1.3rem", marginBottom: "15px" },
  quickActions: { marginTop: "10px" },
  actionsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" },
  actionBtn: {
    padding: "20px",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "1rem",
    textAlign: "center",
    transition: "background 0.2s",
  },
};

export default AdminDashboard;