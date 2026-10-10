import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReadOnlyContract } from "../utils/contract";
import { ethers } from "ethers";

const LandDetails = () => {
  const { id } = useParams(); // Gets the ID from the URL
  const navigate = useNavigate();
  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLand = async () => {
      const contract = getReadOnlyContract();
      if (!contract) return;
      try {
        const data = await contract.getLandDetails(parseInt(id));
        setLand({
          id: Number(data.id),
          owner: data.owner,
          location: data.location,
          city: data.city,
          area: Number(data.area),
          price: ethers.formatEther(data.price),
          propertyId: data.propertyId,
          isVerified: data.isVerified,
          isForSale: data.isForSale,
        });
      } catch (err) {
        console.error("Error fetching land:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLand();
  }, [id]);

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h2 style={styles.logo} onClick={() => navigate("/")}>🏗️ Land Registry</h2>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Go Back</button>
      </div>

      <div style={styles.content}>
        {loading ? (
          <p style={styles.loading}>Loading property data...</p>
        ) : !land ? (
          <p style={styles.error}>Property #{id} not found.</p>
        ) : (
          <div style={styles.card}>
            <div style={styles.header}>
              <div>
                <h1 style={styles.title}>📍 {land.location}</h1>
                <p style={styles.city}>{land.city}</p>
              </div>
              <div style={styles.badges}>
                {land.isVerified ? (
                  <span style={styles.verified}>✅ Verified Record</span>
                ) : (
                  <span style={styles.pending}>🟡 Pending Verification</span>
                )}
                {land.isForSale && <span style={styles.sale}>🛒 For Sale</span>}
              </div>
            </div>

            <div style={styles.grid}>
              <div style={styles.infoBox}>
                <span style={styles.label}>Property ID</span>
                <span style={styles.value}>{land.propertyId}</span>
              </div>
              <div style={styles.infoBox}>
                <span style={styles.label}>Registry ID</span>
                <span style={styles.value}>#{land.id}</span>
              </div>
              <div style={styles.infoBox}>
                <span style={styles.label}>Total Area</span>
                <span style={styles.value}>{land.area} sq ft</span>
              </div>
              <div style={styles.infoBox}>
                <span style={styles.label}>Current Valuation</span>
                <span style={styles.value}>{land.price} ETH</span>
              </div>
            </div>

            <div style={styles.ownerSection}>
              <span style={styles.label}>Current Registered Owner</span>
              <div style={styles.ownerBox}>
                👤 {land.owner}
              </div>
            </div>
            
            {land.isForSale && (
              <div style={styles.buyBanner}>
                <p>This property is currently listed for sale on the marketplace!</p>
                <button style={styles.buyBtn} onClick={() => navigate("/user/marketplace")}>
                  Go to Marketplace
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
  container: { minHeight: "100vh", background: "#0f0f1a", color: "white", fontFamily: "'Segoe UI', sans-serif" },
  navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", background: "rgba(0,0,0,0.3)" },
  logo: { margin: 0, cursor: "pointer", fontSize: "1.5rem" },
  backBtn: { background: "transparent", color: "#aaa", border: "1px solid #aaa", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" },
  content: { maxWidth: "800px", margin: "40px auto", padding: "0 20px" },
  loading: { textAlign: "center", color: "#888", fontSize: "1.2rem", marginTop: "40px" },
  error: { textAlign: "center", color: "#f44336", fontSize: "1.2rem", marginTop: "40px" },
  card: { background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "40px", border: "1px solid rgba(255,255,255,0.1)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "20px", marginBottom: "30px" },
  title: { fontSize: "2rem", margin: "0 0 10px 0" },
  city: { fontSize: "1.2rem", color: "#aaa", margin: 0 },
  badges: { display: "flex", gap: "10px", flexDirection: "column", alignItems: "flex-end" },
  verified: { background: "rgba(76, 175, 80, 0.1)", color: "#4caf50", padding: "6px 12px", borderRadius: "8px", fontWeight: "bold" },
  pending: { background: "rgba(255, 152, 0, 0.1)", color: "#ff9800", padding: "6px 12px", borderRadius: "8px", fontWeight: "bold" },
  sale: { background: "rgba(33, 150, 243, 0.1)", color: "#2196f3", padding: "6px 12px", borderRadius: "8px", fontWeight: "bold" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" },
  infoBox: { background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "12px" },
  label: { display: "block", color: "#888", fontSize: "0.9rem", marginBottom: "8px" },
  value: { fontSize: "1.2rem", fontWeight: "bold" },
  ownerSection: { marginTop: "20px" },
  ownerBox: { background: "rgba(76, 175, 80, 0.1)", color: "#4caf50", padding: "15px", borderRadius: "12px", marginTop: "10px", fontFamily: "monospace", fontSize: "1.1rem", wordBreak: "break-all" },
  buyBanner: { marginTop: "30px", background: "rgba(33, 150, 243, 0.1)", border: "1px solid rgba(33, 150, 243, 0.3)", padding: "20px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  buyBtn: { background: "#2196f3", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }
};

export default LandDetails;