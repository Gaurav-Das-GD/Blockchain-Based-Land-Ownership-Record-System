import React, { useState, useEffect, useContext } from "react";
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

const AdminLands = () => {
  const { contract } = useContext(WalletContext);
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllLands = async () => {
      if (!contract) return;
      try {
        const count = Number(await contract.landCount());
        const allLands = [];
        
        for (let i = 1; i <= count; i++) {
          const land = await contract.getLandDetails(i);
          allLands.push({
            id: Number(land.id),
            owner: land.owner,
            location: land.location,
            city: land.city,
            area: Number(land.area),
            price: ethers.formatEther(land.price),
            propertyId: land.propertyId,
            isVerified: land.isVerified,
            isForSale: land.isForSale,
          });
        }
        setLands(allLands);
      } catch (err) {
        console.error("Error fetching lands:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllLands();
  }, [contract]);

  return (
    <div style={styles.layout}>
      <Sidebar menuItems={adminMenu} />
      <div style={styles.main}>
        <h1 style={styles.heading}>📊 All Registered Lands</h1>
        <p style={styles.subtitle}>Master view of all properties in the blockchain</p>

        {loading ? (
          <p style={styles.loading}>Fetching records from blockchain...</p>
        ) : lands.length === 0 ? (
          <div style={styles.card}>
            <p>No lands have been registered yet.</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Property ID</th>
                  <th style={styles.th}>City</th>
                  <th style={styles.th}>Area (sqft)</th>
                  <th style={styles.th}>Price (ETH)</th>
                  <th style={styles.th}>Owner</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {lands.map((land) => (
                  <tr key={land.id} style={styles.tr}>
                    <td style={styles.td}>#{land.id}</td>
                    <td style={styles.td}>{land.propertyId}</td>
                    <td style={styles.td}>{land.city}</td>
                    <td style={styles.td}>{land.area}</td>
                    <td style={styles.td}>{land.price}</td>
                    <td style={{...styles.td, fontFamily: "monospace", color: "#4caf50"}}>
                      {land.owner.slice(0, 6)}...{land.owner.slice(-4)}
                    </td>
                    <td style={styles.td}>
                      {land.isVerified ? (
                        <span style={styles.verified}>✅ Verified</span>
                      ) : (
                        <span style={styles.pending}>🟡 Pending</span>
                      )}
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
  layout: { display: "flex", minHeight: "100vh", background: "#0f0f1a", color: "white", fontFamily: "'Segoe UI', sans-serif" },
  main: { marginLeft: "280px", padding: "30px", width: "100%" },
  heading: { fontSize: "1.8rem", marginBottom: "5px" },
  subtitle: { color: "#888", marginBottom: "30px" },
  loading: { color: "#888", fontSize: "1.1rem" },
  card: { background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "16px" },
  tableWrapper: { background: "rgba(255,255,255,0.03)", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: "15px", background: "rgba(0,0,0,0.2)", color: "#aaa", fontSize: "0.9rem", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  tr: { transition: "background 0.2s", ":hover": { background: "rgba(255,255,255,0.05)" } },
  td: { padding: "15px", fontSize: "0.95rem", borderBottom: "1px solid rgba(255,255,255,0.03)" },
  verified: { background: "rgba(76, 175, 80, 0.1)", color: "#4caf50", padding: "4px 8px", borderRadius: "6px", fontSize: "0.85rem" },
  pending: { background: "rgba(255, 152, 0, 0.1)", color: "#ff9800", padding: "4px 8px", borderRadius: "6px", fontSize: "0.85rem" }
};

export default AdminLands;