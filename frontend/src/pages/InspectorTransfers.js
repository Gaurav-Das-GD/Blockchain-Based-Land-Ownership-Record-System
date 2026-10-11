import React, { useState, useEffect, useContext } from "react";
import { WalletContext } from "../context/WalletContext";
import Sidebar from "../components/Sidebar";
import { ethers } from "ethers";
import { toast } from "react-toastify";

const inspectorMenu = [
  { label: "Dashboard", path: "/inspector/dashboard", icon: "🏠" },
  { label: "Verify Users", path: "/inspector/verify-users", icon: "👤" },
  { label: "Verify Lands", path: "/inspector/verify-lands", icon: "🏞️" },
  { label: "Approve Transfers", path: "/inspector/transfers", icon: "🔄" },
];

const InspectorTransfers = () => {
  const { contract } = useContext(WalletContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const fetchTransfers = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      const count = Number(await contract.transferCount());
      const allRequests = [];

      for (let i = 1; i <= count; i++) {
        const req = await contract.transferRequests(i);
        if (req.id && Number(req.id) > 0) {
          allRequests.push({
            id: Number(req.id),
            landId: Number(req.landId),
            from: req.fromAddress,
            to: req.toAddress,
            price: ethers.formatEther(req.price),
            sellerApproved: req.sellerApproved,
            buyerApproved: req.buyerApproved,
            inspectorApproved: req.inspectorApproved,
            isCompleted: req.isCompleted,
          });
        }
      }
      setRequests(allRequests);
    } catch (err) {
      console.error("Error fetching transfer requests:", err);
      toast.error("Failed to load transfer requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [contract]);

  const handleApprove = async (requestId) => {
    if (!contract) return;
    try {
      setActionId(requestId);
      toast.info("Approving transfer on blockchain...");
      const tx = await contract.approveTransfer(requestId);
      await tx.wait();
      toast.success(`✅ Transfer #${requestId} approved! Ownership updated.`);
      fetchTransfers();
    } catch (err) {
      console.error(err);
      toast.error("Approval failed: " + (err.reason || err.message));
    } finally {
      setActionId(null);
    }
  };

  const pendingApproval = requests.filter(
    (r) => r.sellerApproved && r.buyerApproved && !r.isCompleted
  );
  const awaitingParties = requests.filter(
    (r) => (!r.sellerApproved || !r.buyerApproved) && !r.isCompleted
  );
  const completedTransfers = requests.filter((r) => r.isCompleted);

  return (
    <div style={styles.layout}>
      <Sidebar menuItems={inspectorMenu} />
      <div style={styles.main}>
        <h1 style={styles.heading}>🔄 Approve Land Transfers</h1>
        <p style={styles.subtitle}>
          Verify both parties' consent and grant official approval to execute the deed transfer
        </p>

        {/* 1. Ready for Inspector Approval */}
        <h2 style={styles.sectionTitle}>
          ⚡ Ready for Approval ({pendingApproval.length})
        </h2>
        {loading ? (
          <p style={styles.loading}>Loading requests...</p>
        ) : pendingApproval.length === 0 ? (
          <p style={styles.noData}>No transfers currently waiting for inspector action.</p>
        ) : (
          <div style={styles.grid}>
            {pendingApproval.map((req) => (
              <div key={req.id} style={styles.cardHighlight}>
                <div style={styles.cardHeader}>
                  <span style={styles.title}>Request #{req.id}</span>
                  <span style={styles.badgeAction}>Awaiting Inspector</span>
                </div>
                <div style={styles.cardBody}>
                  <p>🏞️ <strong>Land ID:</strong> #{req.landId}</p>
                  <p>💰 <strong>Price:</strong> {req.price} ETH</p>
                  <p>👤 <strong>Seller:</strong> {req.from.slice(0, 6)}...{req.from.slice(-4)} ✅ Approved</p>
                  <p>👤 <strong>Buyer:</strong> {req.to.slice(0, 6)}...{req.to.slice(-4)} ✅ Approved</p>
                </div>
                <button
                  style={styles.approveBtn}
                  onClick={() => handleApprove(req.id)}
                  disabled={actionId === req.id}
                >
                  {actionId === req.id ? "Approving..." : "✅ Approve & Transfer Deed"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 2. Waiting on Buyer / Seller */}
        <h2 style={{ ...styles.sectionTitle, marginTop: "40px" }}>
          ⏳ Pending Buyer/Seller Action ({awaitingParties.length})
        </h2>
        {awaitingParties.length === 0 ? (
          <p style={styles.noData}>No pending transfers waiting on parties.</p>
        ) : (
          <div style={styles.grid}>
            {awaitingParties.map((req) => (
              <div key={req.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.title}>Request #{req.id}</span>
                  <span style={styles.badgePending}>Parties Incomplete</span>
                </div>
                <div style={styles.cardBody}>
                  <p>🏞️ <strong>Land ID:</strong> #{req.landId}</p>
                  <p>💰 <strong>Price:</strong> {req.price} ETH</p>
                  <p>
                    Seller: {req.sellerApproved ? "✅ Approved" : "⏳ Pending"} | Buyer:{" "}
                    {req.buyerApproved ? "✅ Approved" : "⏳ Pending"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. Completed Transfers */}
        <h2 style={{ ...styles.sectionTitle, marginTop: "40px" }}>
          📜 Completed / Historical Transfers ({completedTransfers.length})
        </h2>
        {completedTransfers.length === 0 ? (
          <p style={styles.noData}>No transfer history yet.</p>
        ) : (
          <div style={styles.grid}>
            {completedTransfers.map((req) => (
              <div key={req.id} style={{ ...styles.card, borderLeft: "4px solid #4caf50" }}>
                <div style={styles.cardHeader}>
                  <span style={styles.title}>Transfer #{req.id}</span>
                  <span style={styles.badgeCompleted}>
                    {req.inspectorApproved ? "✅ Transferred" : "❌ Cancelled"}
                  </span>
                </div>
                <div style={styles.cardBody}>
                  <p>🏞️ <strong>Land ID:</strong> #{req.landId}</p>
                  <p>💰 <strong>Amount:</strong> {req.price} ETH</p>
                  <p>From: {req.from.slice(0, 6)}...{req.from.slice(-4)} → To: {req.to.slice(0, 6)}...{req.to.slice(-4)}</p>
                </div>
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
  subtitle: { color: "#888", marginBottom: "30px" },
  sectionTitle: { fontSize: "1.25rem", marginBottom: "15px" },
  loading: { color: "#888" },
  noData: { color: "#666", fontSize: "0.95rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" },
  card: { background: "rgba(255,255,255,0.05)", borderRadius: "14px", padding: "20px", border: "1px solid rgba(255,255,255,0.08)" },
  cardHighlight: { background: "rgba(255,255,255,0.06)", borderRadius: "14px", padding: "20px", border: "1px solid #2196f3", borderLeft: "4px solid #2196f3" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
  title: { fontSize: "1.1rem", fontWeight: "bold" },
  badgeAction: { background: "rgba(33, 150, 243, 0.2)", color: "#2196f3", padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "bold" },
  badgePending: { background: "rgba(255, 152, 0, 0.15)", color: "#ff9800", padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem" },
  badgeCompleted: { background: "rgba(76, 175, 80, 0.15)", color: "#4caf50", padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem" },
  cardBody: { color: "#ccc", fontSize: "0.9rem", lineHeight: "1.8", marginBottom: "15px" },
  approveBtn: { width: "100%", padding: "12px", background: "#4caf50", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.95rem", fontWeight: "bold" },
};

export default InspectorTransfers;