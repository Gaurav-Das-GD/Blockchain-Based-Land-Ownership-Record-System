import React, { useState, useEffect, useContext } from "react";
import { WalletContext } from "../context/WalletContext";
import Sidebar from "../components/Sidebar";
import { ethers } from "ethers";

const inspectorMenu = [
  { label: "Dashboard", path: "/inspector/dashboard", icon: "🏠" },
  { label: "Verify Users", path: "/inspector/verify-users", icon: "👤" },
  { label: "Verify Lands", path: "/inspector/verify-lands", icon: "🏞️" },
  { label: "Approve Transfers", path: "/inspector/transfers", icon: "🔄" },
];

const VerifyLands = () => {
  const { contract } = useContext(WalletContext);
  const [loading, setLoading] = useState(false);
  const [lands, setLands] = useState([]);
  const [actionLandId, setActionLandId] = useState(null);

  const fetchLands = async () => {
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
        });
      }
      setLands(allLands);
    } catch (err) {
      console.error("Error fetching lands:", err);
    }
  };

  useEffect(() => {
    fetchLands();
  }, [contract]);

  const verifyLand = async (landId) => {
    if (!contract) return;
    try {
      setLoading(true);
      setActionLandId(landId);
      const tx = await contract.verifyLand(landId);
      await tx.wait();
      alert("✅ Land #" + landId + " verified!");
      fetchLands();
    } catch (err) {
      alert("❌ Failed: " + (err.reason || err.message));
    } finally {
      setLoading(false);
      setActionLandId(null);
    }
  };

  const unverifiedLands = lands.filter((l) => !l.isVerified);
  const verifiedLands = lands.filter((l) => l.isVerified);

  return (
    <div style={styles.layout}>
      <Sidebar menuItems={inspectorMenu} />
      <div style={styles.main}>
        <h1 style={styles.heading}>🏞️ Verify Lands</h1>
        <p style={styles.subtitle}>Review and verify land registrations</p>

        {/* Pending Verification */}
        <h2 style={styles.sectionTitle}>🟡 Pending Verification ({unverifiedLands.length})</h2>
        {unverifiedLands.length === 0 ? (
          <p style={styles.noData}>No lands pending verification.</p>
        ) : (
          <div style={styles.cardsGrid}>
            {unverifiedLands.map((land) => (
              <div key={land.id} style={styles.landCard}>
                <div style={styles.cardHeader}>
                  <span style={styles.landId}>Land #{land.id}</span>
                  <span style={styles.pendingBadge}>🟡 Pending</span>
                </div>
                <p style={styles.cardDetail}>📍 {land.location}, {land.city}</p>
                <p style={styles.cardDetail}>📐 {land.area} sq ft</p>
                <p style={styles.cardDetail}>💰 {land.price} ETH</p>
                <p style={styles.cardDetail}>🆔 {land.propertyId}</p>
                <p style={styles.cardDetail}>👤 {land.owner.slice(0, 8)}...{land.owner.slice(-4)}</p>
                <button
                  style={styles.verifyBtn}
                  onClick={() => verifyLand(land.id)}
                  disabled={loading && actionLandId === land.id}
                >
                  {loading && actionLandId === land.id ? "Verifying..." : "✅ Verify Land"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Already Verified */}
        <h2 style={{ ...styles.sectionTitle, marginTop: "40px" }}>
          ✅ Verified Lands ({verifiedLands.length})
        </h2>
        {verifiedLands.length === 0 ? (
          <p style={styles.noData}>No verified lands yet.</p>
        ) : (
          <div style={styles.cardsGrid}>
            {verifiedLands.map((land) => (
              <div key={land.id} style={{ ...styles.landCard, borderLeft: "3px solid #4caf50" }}>
                <div style={styles.cardHeader}>
                  <span style={styles.landId}>Land #{land.id}</span>
                  <span style={styles.verifiedBadge}>✅ Verified</span>
                </div>
                <p style={styles.cardDetail}>📍 {land.location}, {land.city}</p>
                <p style={styles.cardDetail}>📐 {land.area} sq ft</p>
                <p style={styles.cardDetail}>💰 {land.price} ETH</p>
              </div>
            ))}
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
  sectionTitle: { fontSize: "1.3rem", marginBottom: "15px" },
  noData: { color: "#666", padding: "20px" },
  cardsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "15px" },
  landCard: { background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "12px", borderLeft: "3px solid #ff9800" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  landId: { fontSize: "1.1rem", fontWeight: "bold" },
  pendingBadge: { fontSize: "0.85rem", color: "#ff9800" },
  verifiedBadge: { fontSize: "0.85rem", color: "#4caf50" },
  cardDetail: { color: "#ccc", fontSize: "0.9rem", marginBottom: "6px" },
  verifyBtn: { width: "100%", padding: "10px", background: "#4caf50", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.95rem", fontWeight: "bold", marginTop: "10px" },
};

export default VerifyLands;