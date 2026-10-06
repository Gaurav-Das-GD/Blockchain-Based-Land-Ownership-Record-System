import React, { useState, useEffect, useContext } from "react";
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

const UserProfile = () => {
  const { account, contract } = useContext(WalletContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!contract || !account) return;
      try {
        const user = await contract.getUserDetails(account);
        if (user.exists) {
          setProfile({
            name: user.name,
            age: Number(user.age),
            city: user.city,
            aadhaar: user.aadhaarNumber,
            email: user.email,
            phone: user.phone,
            isVerified: user.isVerified,
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [contract, account]);

  return (
    <div style={styles.layout}>
      <Sidebar menuItems={userMenu} />
      <div style={styles.main}>
        <h1 style={styles.heading}>👤 My Profile</h1>
        <p style={styles.subtitle}>View your registered identity details</p>

        {loading ? (
          <p style={styles.loading}>Loading profile...</p>
        ) : !profile ? (
          <div style={styles.card}>
            <p style={{ color: "#f44336" }}>Profile not found. Are you registered?</p>
          </div>
        ) : (
          <div style={styles.card}>
            <div style={styles.headerRow}>
              <div style={styles.avatarCircle}>
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={styles.name}>{profile.name}</h2>
                <span style={profile.isVerified ? styles.badgeVerified : styles.badgePending}>
                  {profile.isVerified ? "✅ Verified Citizen" : "🟡 Pending Verification"}
                </span>
              </div>
            </div>

            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Wallet Address</span>
                <span style={styles.detailValue}>{account}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Email Address</span>
                <span style={styles.detailValue}>{profile.email}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Phone Number</span>
                <span style={styles.detailValue}>{profile.phone}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Aadhaar Number</span>
                <span style={styles.detailValue}>{profile.aadhaar}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>City of Residence</span>
                <span style={styles.detailValue}>{profile.city}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Age</span>
                <span style={styles.detailValue}>{profile.age} years old</span>
              </div>
            </div>
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
  card: { background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "16px", maxWidth: "700px", border: "1px solid rgba(255,255,255,0.05)" },
  headerRow: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  avatarCircle: { width: "70px", height: "70px", borderRadius: "50%", background: "linear-gradient(135deg, #2196f3, #4caf50)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "2rem", fontWeight: "bold" },
  name: { fontSize: "1.5rem", margin: "0 0 5px 0" },
  badgeVerified: { background: "rgba(76, 175, 80, 0.1)", color: "#4caf50", padding: "5px 10px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "bold" },
  badgePending: { background: "rgba(255, 152, 0, 0.1)", color: "#ff9800", padding: "5px 10px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "bold" },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  detailItem: { background: "rgba(255,255,255,0.02)", padding: "15px", borderRadius: "10px" },
  detailLabel: { display: "block", color: "#888", fontSize: "0.85rem", marginBottom: "5px" },
  detailValue: { fontSize: "1.05rem", wordBreak: "break-all" },
};

export default UserProfile;