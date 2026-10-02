import React, { useState, useContext } from "react";
import { WalletContext } from "../context/WalletContext";
import Sidebar from "../components/Sidebar";
import { ethers } from "ethers";

const userMenu = [
  { label: "Dashboard", path: "/user/dashboard", icon: "🏠" },
  { label: "My Lands", path: "/user/my-lands", icon: "📋" },
  { label: "Search Land", path: "/user/search", icon: "🔍" },
  { label: "Marketplace", path: "/user/marketplace", icon: "🛒" },
  { label: "Transfer Requests", path: "/user/transfers", icon: "🔄" },
  { label: "My Profile", path: "/user/profile", icon: "👤" },
];

const SearchLand = () => {
  const { contract } = useContext(WalletContext);
  const [searchId, setSearchId] = useState("");
  const [landData, setLandData] = useState(null);
  const [error, setError] = useState("");

  const searchLand = async () => {
    if (!contract) return alert("Connect wallet first!");
    if (!searchId) return alert("Enter a Land ID!");
    setError("");
    setLandData(null);

    try {
      const land = await contract.getLandDetails(parseInt(searchId));
      setLandData({
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
    } catch (err) {
      setError("Land not found with ID #" + searchId);
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar menuItems={userMenu} />
      <div style={styles.main}>
        <h1 style={styles.heading}>🔍 Search Land</h1>
        <p style={styles.subtitle}>Verify any land record on the blockchain</p>

        {/* Search */}
        <div style={styles.card}>
          <div style={styles.searchRow}>
            <input
              style={styles.input}
              type="number"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Land ID (e.g. 1, 2, 3...)"
            />
            <button style={styles.searchBtn} onClick={searchLand}>🔍 Search</button>
          </div>
          {error && <p style={styles.error}>{error}</p>}
        </div>

        {/* Result */}
        {landData && (
          <div style={styles.resultCard}>
            <div style={styles.resultHeader}>
              <h2>Land #{landData.id}</h2>
              <div>
                {landData.isVerified && <span style={styles.verifiedBadge}>✅ Verified</span>}
                {landData.isForSale && <span style={styles.saleBadge}>🛒 For Sale</span>}
              </div>
            </div>

            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>📍 Location</span>
                <span style={styles.detailValue}>{landData.location}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>🏙️ City</span>
                <span style={styles.detailValue}>{landData.city}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>📐 Area</span>
                <span style={styles.detailValue}>{landData.area} sq ft</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>💰 Price</span>
                <span style={styles.detailValue}>{landData.price} ETH</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>🆔 Property ID</span>
                <span style={styles.detailValue}>{landData.propertyId}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>📋 Status</span>
                <span style={styles.detailValue}>
                  {landData.isVerified ? "Verified ✅" : "Pending 🟡"}
                </span>
              </div>
            </div>

            <div style={styles.ownerBox}>
              <span style={styles.detailLabel}>👤 Current Owner</span>
              <span style={styles.ownerAddress}>{landData.owner}</span>
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
  subtitle: { color: "#888", marginBottom: "25px" },
  card: { background: "rgba(255,255,255,0.05)", padding: "25px", borderRadius: "14px", maxWidth: "600px", marginBottom: "20px" },
  searchRow: { display: "flex", gap: "10px" },
  input: { flex: 1, padding: "12px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: "1rem", outline: "none" },
  searchBtn: { padding: "12px 25px", background: "#2196f3", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem", fontWeight: "bold" },
  error: { color: "#f44336", marginTop: "10px" },
  resultCard: { background: "rgba(255,255,255,0.05)", padding: "25px", borderRadius: "14px", maxWidth: "600px" },
  resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  verifiedBadge: { color: "#4caf50", marginRight: "10px", fontSize: "0.9rem" },
  saleBadge: { color: "#2196f3", fontSize: "0.9rem" },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" },
  detailItem: { background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: "8px" },
  detailLabel: { display: "block", color: "#888", fontSize: "0.8rem", marginBottom: "5px" },
  detailValue: { fontSize: "1rem" },
  ownerBox: { background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: "8px" },
  ownerAddress: { display: "block", fontSize: "0.9rem", wordBreak: "break-all", marginTop: "5px", color: "#4caf50" },
};

export default SearchLand;