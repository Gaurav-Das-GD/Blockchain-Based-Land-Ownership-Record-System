import React, { useContext, useEffect, useState } from "react";
import { WalletContext } from "../context/WalletContext";
import Sidebar from "../components/Sidebar";

const userMenu = [
  { label: "Dashboard", path: "/user/dashboard", icon: "🏠" },
  { label: "My Lands", path: "/user/my-lands", icon: "📋" },
  { label: "Search Land", path: "/user/search", icon: "🔍" },
  { label: "Marketplace", path: "/user/marketplace", icon: "🛒" },
  { label: "Transfer Requests", path: "/user/transfers", icon: "🔄" },
  { label: "My Profile", path: "/user/profile", icon: "👤" },
];

const UserDashboard = () => {
  const { account, contract } = useContext(WalletContext);
  const [stats, setStats] = useState({
    totalLands: 0,
    totalTransfers: 0,
  });
  const [lands, setLands] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!contract || !account) return;
      try {
        const userLands = await contract.getUserLands(account);
        setStats({
          totalLands: userLands.length,
          totalTransfers: Number(await contract.transferCount()),
        });

        // Fetch land details
        const landDetails = [];
        for (let i = 0; i < userLands.length; i++) {
          const land = await contract.getLandDetails(Number(userLands[i]));
          landDetails.push(land);
        }
        setLands(landDetails);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [contract, account]);

  return (
    <div style={styles.layout}>
      <Sidebar menuItems={userMenu} />
      <div style={styles.main}>
        <h1 style={styles.heading}>👤 User Dashboard</h1>
        <p style={styles.welcome}>
          Welcome, {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "User"}
        </p>

        {/* Stats Cards */}
        <div style={styles.statsRow}>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #4caf50" }}>
            <h3 style={styles.statNumber}>{stats.totalLands}</h3>
            <p style={styles.statLabel}>Lands Owned</p>
          </div>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #2196f3" }}>
            <h3 style={styles.statNumber}>{stats.totalTransfers}</h3>
            <p style={styles.statLabel}>Total Transfers</p>
          </div>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #ff9800" }}>
            <h3 style={styles.statNumber}>
              {lands.filter((l) => l.isForSale).length}
            </h3>
            <p style={styles.statLabel}>Listed for Sale</p>
          </div>
          <div style={{ ...styles.statCard, borderLeft: "4px solid #9c27b0" }}>
            <h3 style={styles.statNumber}>
              {lands.filter((l) => l.isVerified).length}
            </h3>
            <p style={styles.statLabel}>Verified Lands</p>
          </div>
        </div>

        {/* My Lands Table */}
        <h2 style={styles.sectionTitle}>📋 My Lands</h2>
        {lands.length === 0 ? (
          <p style={styles.noData}>You don't own any lands yet.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>City</th>
                  <th style={styles.th}>Area (sqft)</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>For Sale</th>
                </tr>
              </thead>
              <tbody>
                {lands.map((land, i) => (
                  <tr key={i}>
                    <td style={styles.td}>#{Number(land.id)}</td>
                    <td style={styles.td}>{land.location}</td>
                    <td style={styles.td}>{land.city}</td>
                    <td style={styles.td}>{Number(land.area)}</td>
                    <td style={styles.td}>
                      {land.isVerified ? "✅ Verified" : "🟡 Pending"}
                    </td>
                    <td style={styles.td}>
                      {land.isForSale ? "🛒 Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    background: "#0f0f1a",
    color: "white",
    fontFamily: "'Segoe UI', sans-serif",
  },
  main: {
    marginLeft: "280px",
    padding: "30px",
    width: "100%",
  },
  heading: {
    fontSize: "1.8rem",
    marginBottom: "5px",
  },
  welcome: {
    color: "#888",
    marginBottom: "30px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  statCard: {
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "12px",
  },
  statNumber: {
    fontSize: "2rem",
    marginBottom: "5px",
  },
  statLabel: {
    color: "#aaa",
    fontSize: "0.9rem",
  },
  sectionTitle: {
    fontSize: "1.3rem",
    marginBottom: "15px",
  },
  noData: {
    color: "#666",
    textAlign: "center",
    padding: "40px",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px 15px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    color: "#aaa",
    fontSize: "0.85rem",
  },
  td: {
    padding: "12px 15px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    fontSize: "0.95rem",
  },
};

export default UserDashboard;