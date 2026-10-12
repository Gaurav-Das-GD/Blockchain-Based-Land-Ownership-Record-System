import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReadOnlyContract } from "../utils/contract";
import { ethers } from "ethers";

const LandDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [land, setLand] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLandAndHistory = async () => {
      const contract = getReadOnlyContract();
      if (!contract) return;
      try {
        setLoading(true);
        // 1. Fetch Land Information
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

        // 2. Query Blockchain Events for Provenance History
        const timeline = [];

        // Check LandRegistered event
        const regFilter = contract.filters.LandRegistered(parseInt(id));
        const regEvents = await contract.queryFilter(regFilter);
        if (regEvents.length > 0) {
          timeline.push({
            type: "Registration",
            title: "Original Registration & Title Creation",
            owner: regEvents[0].args.owner,
            from: "Government Land Authority",
            txHash: regEvents[0].transactionHash,
            blockNumber: regEvents[0].blockNumber,
          });
        }

        // Check TransferCompleted events
        const transferFilter = contract.filters.TransferCompleted();
        const allTransfers = await contract.queryFilter(transferFilter);
        const landTransfers = allTransfers.filter(
          (e) => Number(e.args.landId) === Number(id)
        );

        for (let t of landTransfers) {
          timeline.push({
            type: "Transfer",
            title: "Ownership Deed Transfer",
            from: t.args.from,
            owner: t.args.to,
            txHash: t.transactionHash,
            blockNumber: t.blockNumber,
          });
        }

        setHistory(timeline);
      } catch (err) {
        console.error("Error fetching land and history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLandAndHistory();
  }, [id]);

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h2 style={styles.logo} onClick={() => navigate("/")}>🏗️ Land Registry</h2>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Go Back</button>
      </div>

      <div style={styles.content}>
        {loading ? (
          <p style={styles.loading}>Auditing blockchain records...</p>
        ) : !land ? (
          <p style={styles.error}>Property #{id} not found.</p>
        ) : (
          <div style={styles.card}>
            {/* Header */}
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

            {/* Property Details Grid */}
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
                <span style={styles.label}>Valuation</span>
                <span style={styles.value}>{land.price} ETH</span>
              </div>
            </div>

            {/* Current Owner */}
            <div style={styles.ownerSection}>
              <span style={styles.label}>Current Title Deed Holder</span>
              <div style={styles.ownerBox}>
                👤 {land.owner}
              </div>
            </div>

            {/* Marketplace Banner */}
            {land.isForSale && (
              <div style={styles.buyBanner}>
                <p>This property is actively listed on the marketplace!</p>
                <button style={styles.buyBtn} onClick={() => navigate("/user/marketplace")}>
                  Go to Marketplace
                </button>
              </div>
            )}

            {/* Immutable Ownership Timeline */}
            <div style={styles.historySection}>
              <h2 style={styles.historyTitle}>📜 Immutable Ownership Provenance</h2>
              <p style={styles.historySubtitle}>
                Verified on-chain audit trail of every title creation and transfer
              </p>

              {history.length === 0 ? (
                <p style={styles.noHistory}>No historical transfer logs recorded yet.</p>
              ) : (
                <div style={styles.timeline}>
                  {history.map((item, idx) => (
                    <div key={idx} style={styles.timelineItem}>
                      <div style={styles.timelineDot}></div>
                      <div style={styles.timelineContent}>
                        <div style={styles.timelineHeader}>
                          <span style={styles.timelineTitle}>
                            {idx + 1}. {item.title}
                          </span>
                          <span style={styles.timelineBlock}>Block #{item.blockNumber}</span>
                        </div>
                        <p style={styles.timelineDetail}>
                          <strong>Transferred From:</strong>{" "}
                          <span style={{ color: "#aaa" }}>
                            {item.from.length > 20
                              ? `${item.from.slice(0, 10)}...${item.from.slice(-6)}`
                              : item.from}
                          </span>
                        </p>
                        <p style={styles.timelineDetail}>
                          <strong>Acquired By:</strong>{" "}
                          <span style={{ color: "#4caf50", fontFamily: "monospace" }}>
                            {item.owner.slice(0, 10)}...{item.owner.slice(-6)}
                          </span>
                        </p>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${item.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.etherscanLink}
                        >
                          🔗 View on Sepolia Etherscan ↗
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
  content: { maxWidth: "850px", margin: "40px auto", padding: "0 20px" },
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
  ownerBox: { background: "rgba(76, 175, 80, 0.1)", color: "#4caf50", padding: "15px", borderRadius: "12px", marginTop: "10px", fontFamily: "monospace", fontSize: "1rem", wordBreak: "break-all" },
  buyBanner: { marginTop: "30px", background: "rgba(33, 150, 243, 0.1)", border: "1px solid rgba(33, 150, 243, 0.3)", padding: "20px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  buyBtn: { background: "#2196f3", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  historySection: { marginTop: "40px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "30px" },
  historyTitle: { fontSize: "1.4rem", marginBottom: "5px" },
  historySubtitle: { color: "#888", fontSize: "0.95rem", marginBottom: "25px" },
  noHistory: { color: "#666", fontStyle: "italic" },
  timeline: { display: "flex", flexDirection: "column", gap: "20px", position: "relative" },
  timelineItem: { display: "flex", gap: "15px", alignItems: "flex-start" },
  timelineDot: { width: "12px", height: "12px", borderRadius: "50%", background: "#2196f3", marginTop: "6px" },
  timelineContent: { flex: 1, background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" },
  timelineHeader: { display: "flex", justifyContent: "space-between", marginBottom: "8px" },
  timelineTitle: { fontWeight: "bold", fontSize: "1rem" },
  timelineBlock: { color: "#888", fontSize: "0.85rem" },
  timelineDetail: { color: "#ccc", fontSize: "0.9rem", margin: "4px 0" },
  etherscanLink: { display: "inline-block", marginTop: "8px", color: "#2196f3", fontSize: "0.85rem", textDecoration: "none" },
};

export default LandDetails;