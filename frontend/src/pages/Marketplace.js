import React, { useState, useEffect, useContext } from "react";
import { WalletContext } from "../context/WalletContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { ethers } from "ethers";
import { toast } from "react-toastify";

const userMenu = [
  { label: "Dashboard", path: "/user/dashboard", icon: "🏠" },
  { label: "My Lands", path: "/user/my-lands", icon: "📋" },
  { label: "Search Land", path: "/user/search", icon: "🔍" },
  { label: "Marketplace", path: "/user/marketplace", icon: "🛒" },
  { label: "Transfer Requests", path: "/user/transfers", icon: "🔄" },
  { label: "My Profile", path: "/user/profile", icon: "👤" },
];

const Marketplace = () => {
  const { account, contract } = useContext(WalletContext);
  const navigate = useNavigate();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buyingId, setBuyingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const fetchLands = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      const count = Number(await contract.landCount());
      const forSale = [];
      for (let i = 1; i <= count; i++) {
        const land = await contract.getLandDetails(i);
        if (land.isForSale) {
          forSale.push({
            id: Number(land.id),
            owner: land.owner,
            location: land.location,
            city: land.city,
            area: Number(land.area),
            price: land.price,
            priceEth: parseFloat(ethers.formatEther(land.price)),
            propertyId: land.propertyId,
            isVerified: land.isVerified,
          });
        }
      }
      setLands(forSale);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to load marketplace listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLands();
  }, [contract]);

  const buyLand = async (landId, price) => {
    if (!contract) return toast.error("Connect wallet first!");
    try {
      setBuyingId(landId);
      toast.info("Sending payment on blockchain...");
      const tx = await contract.buyLand(landId, { value: price });
      await tx.wait();
      toast.success("✅ Land purchased! Waiting for inspector approval.");
      fetchLands();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed: " + (err.reason || err.message));
    } finally {
      setBuyingId(null);
    }
  };

  // Filter by search query
  const filteredLands = lands.filter((land) => {
    const query = searchTerm.toLowerCase();
    return (
      land.city.toLowerCase().includes(query) ||
      land.location.toLowerCase().includes(query) ||
      land.propertyId.toLowerCase().includes(query)
    );
  });

  // Sort lands
  const sortedLands = [...filteredLands].sort((a, b) => {
    if (sortBy === "priceAsc") return a.priceEth - b.priceEth;
    if (sortBy === "priceDesc") return b.priceEth - a.priceEth;
    if (sortBy === "areaDesc") return b.area - a.area;
    return 0;
  });

  return (
    <div style={styles.layout}>
      <Sidebar menuItems={userMenu} />
      <div style={styles.main}>
        <h1 style={styles.heading}>🛒 Land Marketplace</h1>
        <p style={styles.subtitle}>Browse, filter, and buy verified land parcels</p>

        {/* Filter and Search Bar */}
        <div style={styles.filterBar}>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="🔍 Search by City, Location, or Property ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            style={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Default Order</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="areaDesc">Largest Area</option>
          </select>
        </div>

        {loading ? (
          <p style={styles.loading}>Scanning blockchain for properties...</p>
        ) : sortedLands.length === 0 ? (
          <div style={styles.emptyState}>
            <h2>No lands match your criteria</h2>
            <p style={{ color: "#888" }}>Try adjusting your search query</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {sortedLands.map((land) => (
              <div key={land.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <span style={styles.landId}>Land #{land.id}</span>
                  {land.isVerified && <span style={styles.verifiedBadge}>✅ Verified</span>}
                </div>
                <div style={styles.cardBody}>
                  <p style={styles.location}>📍 {land.location}</p>
                  <p style={styles.detail}>🏙️ {land.city}</p>
                  <p style={styles.detail}>📐 {land.area.toLocaleString()} sq ft</p>
                  <p style={styles.detail}>🆔 {land.propertyId}</p>
                  <p style={styles.detail}>
                    👤 {land.owner.slice(0, 6)}...{land.owner.slice(-4)}
                  </p>
                </div>
                <div style={styles.cardBottom}>
                  <span style={styles.price}>💰 {land.priceEth} ETH</span>
                  <div style={styles.btnGroup}>
                    <button
                      style={styles.detailsBtn}
                      onClick={() => navigate(`/land/${land.id}`)}
                    >
                      👁️ Details
                    </button>
                    {land.owner.toLowerCase() === account?.toLowerCase() ? (
                      <span style={styles.ownLabel}>Your Land</span>
                    ) : (
                      <button
                        style={styles.buyBtn}
                        onClick={() => buyLand(land.id, land.price)}
                        disabled={buyingId === land.id}
                      >
                        {buyingId === land.id ? "Buying..." : "Buy Now"}
                      </button>
                    )}
                  </div>
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
  filterBar: { display: "flex", gap: "15px", marginBottom: "25px", maxWidth: "800px" },
  searchInput: { flex: 2, padding: "12px 18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: "0.95rem", outline: "none" },
  sortSelect: { flex: 1, padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)", background: "#1c1b29", color: "white", fontSize: "0.95rem", outline: "none" },
  loading: { color: "#888", textAlign: "center", padding: "40px" },
  emptyState: { textAlign: "center", padding: "60px", color: "#aaa" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" },
  card: { background: "rgba(255,255,255,0.05)", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  landId: { fontWeight: "bold", fontSize: "1.1rem" },
  verifiedBadge: { fontSize: "0.8rem", color: "#4caf50" },
  cardBody: { padding: "15px 20px" },
  location: { fontSize: "1.05rem", marginBottom: "8px", fontWeight: "bold" },
  detail: { color: "#aaa", fontSize: "0.9rem", marginBottom: "5px" },
  cardBottom: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" },
  price: { fontSize: "1.1rem", fontWeight: "bold", color: "#4caf50" },
  btnGroup: { display: "flex", gap: "8px", alignItems: "center" },
  detailsBtn: { padding: "8px 12px", background: "rgba(255,255,255,0.1)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem" },
  buyBtn: { padding: "8px 16px", background: "#2196f3", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", fontWeight: "bold" },
  ownLabel: { color: "#888", fontSize: "0.85rem", fontStyle: "italic" },
};

export default Marketplace;