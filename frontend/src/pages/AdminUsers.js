import React, { useState, useEffect, useContext } from "react";
import { WalletContext } from "../context/WalletContext";
import Sidebar from "../components/Sidebar";

const adminMenu = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "🏠" },
  { label: "Register Land", path: "/admin/register-land", icon: "🏞️" },
  { label: "Manage Inspectors", path: "/admin/inspectors", icon: "👮" },
  { label: "All Users", path: "/admin/users", icon: "👥" },
  { label: "All Lands", path: "/admin/lands", icon: "📊" },
];

const AdminUsers = () => {
  const { contract } = useContext(WalletContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!contract) return;
      try {
        // 1. Fetch all UserRegistered events from the blockchain
        const filter = contract.filters.UserRegistered();
        const events = await contract.queryFilter(filter);
        
        // 2. Extract the wallet addresses from those events (and remove duplicates)
        const addresses = [...new Set(events.map(e => e.args[0]))];
        
        // 3. Fetch full details for each address
        const allUsers = [];
        for (let addr of addresses) {
          const user = await contract.getUserDetails(addr);
          if (user.exists) {
            allUsers.push({
              address: addr,
              name: user.name,
              age: Number(user.age),
              city: user.city,
              email: user.email,
              isVerified: user.isVerified,
            });
          }
        }
        
        setUsers(allUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllUsers();
  }, [contract]);

  return (
    <div style={styles.layout}>
      <Sidebar menuItems={adminMenu} />
      <div style={styles.main}>
        <h1 style={styles.heading}>👥 All Registered Users</h1>
        <p style={styles.subtitle}>Master view of all citizens in the blockchain</p>

        {loading ? (
          <p style={styles.loading}>Scanning blockchain events...</p>
        ) : users.length === 0 ? (
          <div style={styles.card}>
            <p>No users have registered yet.</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Wallet Address</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Age</th>
                  <th style={styles.th}>City</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index} style={styles.tr}>
                    <td style={{...styles.td, fontFamily: "monospace", color: "#2196f3"}}>
                      {user.address.slice(0, 8)}...{user.address.slice(-6)}
                    </td>
                    <td style={styles.td}><strong>{user.name}</strong></td>
                    <td style={styles.td}>{user.age}</td>
                    <td style={styles.td}>{user.city}</td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>
                      {user.isVerified ? (
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

export default AdminUsers;