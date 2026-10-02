import React, { useState, useContext } from "react";
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

const TransferRequests = () => {
  const { account, contract } = useContext(WalletContext);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);

  // Send Transfer
  const [transferForm, setTransferForm] = useState({ landId: "", toAddress: "" });

  // Check Transfer
  const [checkId, setCheckId] = useState("");
  const [transferData, setTransferData] = useState(null);

  const sendTransfer = async (e) => {
    e.preventDefault();
    if (!contract) return alert("Connect wallet first!");
    try {
      setLoading(true);
      const tx = await contract.requestTransfer(
        parseInt(transferForm.landId),
        transferForm.toAddress
      );
      await tx.wait();
      alert("✅ Transfer request sent!");
      setTransferForm({ landId: "", toAddress: "" });
    } catch (err) {
      alert("❌ Failed: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  const checkTransfer = async () => {
    if (!contract || !checkId) return;
    try {
      const req = await contract.transferRequests(parseInt(checkId));
      setTransferData({
        id: Number(req.id),
        landId: Number(req.landId),
        from: req.fromAddress,
        to: req.toAddress,
        sellerApproved: req.sellerApproved,
        buyerApproved: req.buyerApproved,
        inspectorApproved: req.inspectorApproved,
        isCompleted: req.isCompleted,
      });
    } catch (err) {
      alert("Transfer not found");
    }
  };

  const acceptTransfer = async (requestId) => {
    if (!contract) return;
    try {
      setActionId(requestId);
      const tx = await contract.acceptTransfer(requestId);
      await tx.wait();
      alert("✅ Transfer accepted!");
      checkTransfer();
    } catch (err) {
      alert("❌ Failed: " + (err.reason || err.message));
    } finally {
      setActionId(null);
    }
  };

  const rejectTransfer = async (requestId) => {
    if (!contract) return;
    try {
      setActionId(requestId);
      const tx = await contract.rejectTransfer(requestId);
      await tx.wait();
      alert("✅ Transfer rejected!");
      checkTransfer();
    } catch (err) {
      alert("❌ Failed: " + (err.reason || err.message));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar menuItems={userMenu} />
      <div style={styles.main}>
        <h1 style={styles.heading}>🔄 Transfer Requests</h1>
        <p style={styles.subtitle}>Send, check and manage land transfers</p>

        {/* Send Transfer */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📤 Send Transfer Request</h2>
          <form onSubmit={sendTransfer}>
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Land ID</label>
                <input
                  style={styles.input}
                  type="number"
                  value={transferForm.landId}
                  onChange={(e) => setTransferForm({ ...transferForm, landId: e.target.value })}
                  placeholder="e.g. 1"
                  required
                />
              </div>
              <div style={{ ...styles.inputGroup, flex: 2 }}>
                <label style={styles.label}>Recipient Wallet Address</label>
                <input
                  style={styles.input}
                  type="text"
                  value={transferForm.toAddress}
                  onChange={(e) => setTransferForm({ ...transferForm, toAddress: e.target.value })}
                  placeholder="0x..."
                  required
                />
              </div>
            </div>
            <button style={styles.sendBtn} type="submit" disabled={loading}>
              {loading ? "Sending..." : "📤 Send Request"}
            </button>
          </form>
        </div>

        {/* Check Transfer */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🔍 Check Transfer Status</h2>
          <div style={styles.searchRow}>
            <input
              style={styles.input}
              type="number"
              value={checkId}
              onChange={(e) => setCheckId(e.target.value)}
              placeholder="Enter Transfer Request ID (e.g. 1)"
            />
            <button style={styles.checkBtn} onClick={checkTransfer}>Check</button>
          </div>

          {transferData && transferData.id > 0 && (
            <div style={styles.resultCard}>
              <h3 style={styles.resultTitle}>Transfer #{transferData.id}</h3>
              <div style={styles.detailGrid}>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Land ID</span>
                  <span>#{transferData.landId}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>From</span>
                  <span>{transferData.from.slice(0, 8)}...{transferData.from.slice(-4)}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>To</span>
                  <span>{transferData.to.slice(0, 8)}...{transferData.to.slice(-4)}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Status</span>
                  <span>{transferData.isCompleted ? "✅ Completed" : "🟡 Pending"}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Seller</span>
                  <span>{transferData.sellerApproved ? "✅ Approved" : "⏳ Waiting"}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Buyer</span>
                  <span>{transferData.buyerApproved ? "✅ Approved" : "⏳ Waiting"}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Inspector</span>
                  <span>{transferData.inspectorApproved ? "✅ Approved" : "⏳ Waiting"}</span>
                </div>
              </div>

              {!transferData.isCompleted &&
                transferData.to.toLowerCase() === account?.toLowerCase() &&
                !transferData.buyerApproved && (
                  <div style={styles.btnRow}>
                    <button style={styles.acceptBtn} onClick={() => acceptTransfer(transferData.id)} disabled={actionId === transferData.id}>
                      ✅ Accept
                    </button>
                    <button style={styles.rejectBtn} onClick={() => rejectTransfer(transferData.id)} disabled={actionId === transferData.id}>
                      ❌ Reject
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  layout: { display: "flex", minHeight: "100vh", background: "#0f0f1a", color: "white", fontFamily: "'Segoe UI', sans-serif" },
  main: { marginLeft: "280px", padding: "30px", width: "100%" },
  heading: { fontSize: "1.8rem", marginBottom: "5px" },
  subtitle: { color: "#888", marginBottom: "25px" },
  card: { background: "rgba(255,255,255,0.05)", padding: "25px", borderRadius: "14px", maxWidth: "700px", marginBottom: "20px" },
  cardTitle: { fontSize: "1.2rem", marginBottom: "15px" },
  row: { display: "flex", gap: "15px", marginBottom: "15px" },
  inputGroup: { flex: 1 },
  label: { display: "block", marginBottom: "5px", color: "#ccc", fontSize: "0.85rem" },
  input: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" },
  sendBtn: { width: "100%", padding: "12px", background: "#2196f3", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem", fontWeight: "bold" },
  searchRow: { display: "flex", gap: "10px" },
  checkBtn: { padding: "10px 25px", background: "#2196f3", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" },
  resultCard: { marginTop: "20px", background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "10px" },
  resultTitle: { marginBottom: "15px", fontSize: "1.1rem" },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" },
  detailItem: { background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "6px" },
  detailLabel: { display: "block", color: "#888", fontSize: "0.8rem", marginBottom: "3px" },
  btnRow: { display: "flex", gap: "10px" },
  acceptBtn: { flex: 1, padding: "10px", background: "#4caf50", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  rejectBtn: { flex: 1, padding: "10px", background: "#f44336", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
};

export default TransferRequests;