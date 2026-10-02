import React, { useState, useEffect, useContext } from "react";
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

const MyLands = () => {
  const { account, contract } = useContext(WalletContext);
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [salePrice, setSalePrice] = useState("");
  const [showPriceFor, setShowPriceFor] = useState(null);

  const fetchLands = async () => {
    if (!contract || !account) return;
    try {
      setLoading(true);
      const userLands = await contract.getUserLands(account);
      const details = [];
      for (let i = 0; i < userLands.length; i++) {
        const land = await contract.getLandDetails(Number(userLands[i]));
        details.push({
          id: Number(land.id),
          location: land.location,
          city: land.city,
          area: Number(land.area),
          price: ethers.formatEther(land.price),
          propertyId: land.propertyId,
          isVerified: land.isVerified,
          isForSale: land.isForSale,
        });
      }
      setLands(details);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLands();
  }, [contract, account]);

  const putForSale = async (landId) => {
    if (!salePrice) return alert("Enter a price!");
    try {
      setActionId(landId);
      const tx = await contract.putLandForSale(landId, ethers.parseEther(salePrice));
      await tx.wait();
      alert("✅ Land listed for sale!");
      setSalePrice("");
      setShowPriceFor(null);
      fetchLands();
    } catch (err) {
      alert("❌ Failed: " + (err.reason || err.message));
    } finally {
      setActionId(null);
    }
  };

  const removeFromSale = async (landId) => {
    try {
      setActionId(landId);
      const tx = await contract.removeLandFromSale(landId);
      await tx.wait();
      alert("✅ Land removed from sale!");
      fetchLands();
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
        <h1 style={styles.heading}>📋 My Lands</h1>
        <p style={styles.subtitle}>Manage your owned land parcels</p>

        {loading ? (
          <p style={styles.loading}>Loading...</p>
        ) : lands.length === 0 ? (
          <div style={styles.emptyState}>
            <h2>You don't own any lands yet</h2>
            <p style={{ color: "#888" }}>Check the marketplace to buy land!</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {lands.map((land) => (
              <div key={land.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.landId}>Land #{land.id}</span>
                  <span style={land.isVerified ? styles.verifiedBadge : styles.pendingBadge}>
                    {land.isVerified ? "✅ Verified" : "🟡 Pending"}
                  </span>
                </div>

                <div style={styles.cardBody}>
                  <p>📍 {land.location}, {land.city}</p>
                  <p>📐 {land.area} sq ft</p>
                  <p>💰 {land.price} ETH</p>
                  <p>🆔 {land.propertyId}</p>
                  <p style={{ marginTop: "8px" }}>
                    {land.isForSale ? (
                      <span style={styles.saleBadge}>🛒 Listed for Sale</span>
                    ) : (
                      <span style={{ color: "#888" }}>Not for sale</span>
                    )}
                  </p>
                </div>

                <div style={styles.cardActions}>
                  {land.isForSale ? (
                    <button
                      style={styles.removeBtn}
                      onClick={() => removeFromSale(land.id)}
                      disabled={actionId === land.id}
                    >
                      {actionId === land.id ? "Processing..." : "Remove from Sale"}
                    </button>
                  ) : land.isVerified ? (
                    <>
                      {showPriceFor === land.id ? (
                        <div style={styles.priceInput}>
                          <input
                            style={styles.input}
                            type="text"
                            value={salePrice}
                            onChange={(e) => setSalePrice(e.target.value)}
                            placeholder="Price in ETH"
                          />
                          <button
                            style={styles.confirmBtn}
                            onClick={() => putForSale(land.id)}
                            disabled={actionId === land.id}
                          >
                            {actionId === land.id ? "..." : "✅"}
                          </button>
                        </div>
                      ) : (
                        <button
                          style={styles.sellBtn}
                          onClick={() => setShowPriceFor(land.id)}
                        >
                          🛒 Put for Sale
                        </button>
                      )}
                    </>
                  ) : (
                    <p style={styles.waitMsg}>⏳ Waiting for verification</p>
                  )}
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
  subtitle: { color: "#888", marginBottom: "25px" },
  loading: { color: "#888", textAlign: "center", padding: "40px" },
  emptyState: { textAlign: "center", padding: "60px", color: "#aaa" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" },
  card: { background: "rgba(255,255,255,0.05)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)" },
  cardHeader: { display: "flex", justifyContent: "space-between", padding: "15px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  landId: { fontWeight: "bold", fontSize: "1.1rem" },
  verifiedBadge: { color: "#4caf50", fontSize: "0.85rem" },
  pendingBadge: { color: "#ff9800", fontSize: "0.85rem" },
  cardBody: { padding: "15px 20px", color: "#ccc", fontSize: "0.9rem", lineHeight: "1.8" },
  saleBadge: { color: "#2196f3", fontWeight: "bold" },
  cardActions: { padding: "15px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" },
  sellBtn: { width: "100%", padding: "10px", background: "#2196f3", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.95rem", fontWeight: "bold" },
  removeBtn: { width: "100%", padding: "10px", background: "#f44336", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.95rem", fontWeight: "bold" },
  priceInput: { display: "flex", gap: "8px" },
  input: { flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "white", outline: "none" },
  confirmBtn: { padding: "10px 15px", background: "#4caf50", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" },
  waitMsg: { color: "#888", textAlign: "center", fontSize: "0.9rem" },
};

export default MyLands;