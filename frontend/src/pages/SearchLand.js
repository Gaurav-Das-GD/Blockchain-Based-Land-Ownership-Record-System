import React, { useState, useContext } from "react";
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

const SearchLand = () => {
  const { contract } = useContext(WalletContext);
  const navigate = useNavigate();
  const [searchMode, setSearchMode] = useState("id"); // "id" | "city" | "owner"
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!contract) return toast.error("Connect wallet first!");
    if (!searchQuery.trim()) return toast.warning("Please enter a search query");

    setLoading(true);
    setSearched(true);
    setResults([]);

    try {
      const count = Number(await contract.landCount());
      const matches = [];

      if (searchMode === "id") {
        const idNum = parseInt(searchQuery);
        if (idNum > 0 && idNum <= count) {
          const land = await contract.getLandDetails(idNum);
          matches.push({
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
        }
      } else {
        // Search through all lands by city or owner
        const queryLower = searchQuery.toLowerCase().trim();
        for (let i = 1; i <= count; i++) {
          const land = await contract.getLandDetails(i);
          const matchCity =
            searchMode === "city" &&
            (land.city.toLowerCase().includes(queryLower) ||
              land.location.toLowerCase().includes(queryLower));
          const matchOwner =
            searchMode === "owner" &&
            land.owner.toLowerCase() === queryLower;

          if (matchCity || matchOwner) {
            matches.push({
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
          }
        }
      }

      setResults(matches);
      if (matches.length > 0) {
        toast.success(`Found ${matches.length} matching parcel(s)!`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Search error: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar menuItems={userMenu} />
      <div style={styles.main}>
        <h1 style={styles.heading}>🔍 Universal Land Registry Search</h1>
        <p style={styles.subtitle}>Verify and inspect any land record on the blockchain</p>

        {/* Search Mode Tabs */}
        <div style={styles.searchBox}>
          <div style={styles.tabs}>
            <button
              style={searchMode === "id" ? styles.activeTab : styles.tab}
              onClick={() => { setSearchMode("id"); setSearchQuery(""); }}
            >
              🆔 By Land ID
            </button>
            <button
              style={searchMode === "city" ? styles.activeTab : styles.tab}
              onClick={() => { setSearchMode("city"); setSearchQuery(""); }}
            >
              🏙️ By City / Location
            </button>
            <button
              style={searchMode === "owner" ? styles.activeTab : styles.tab}
              onClick={() => { setSearchMode("owner"); setSearchQuery(""); }}
            >
              👤 By Owner Wallet
            </button>
          </div>

          <form onSubmit={handleSearch} style={styles.form}>
            <input
              style={styles.input}
              type={searchMode === "id" ? "number" : "text"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchMode === "id"
                  ? "Enter Registry Land ID (e.g. 1, 2)..."
                  : searchMode === "city"
                  ? "Enter City or Location (e.g. Kolkata, Plot 12A)..."
                  : "Enter full wallet address (0x...)..."
              }
            />
            <button style={styles.searchBtn} type="submit" disabled={loading}>
              {loading ? "Searching..." : "🔍 Search"}
            </button>
          </form>
        </div>

        {/* Results */}
        {searched && results.length === 0 && !loading && (
          <p style={styles.noResults}>No properties found matching your search.</p>
        )}

        <div style={styles.grid}>
          {results.map((land) => (
            <div
              key={land.id}
              style={styles.resultCard}
              onClick={() => navigate(`/land/${land.id}`)}
            >
              <div style={styles.resultHeader}>
                <h3 style={styles.landTitle}>Land #{land.id}</h3>
                <div style={styles.badges}>
                  {land.isVerified ? (
                    <span style={styles.verified}>✅ Verified</span>
                  ) : (
                    <span style={styles.pending}>🟡 Pending</span>
                  )}
                  {land.isForSale && <span style={styles.sale}>🛒 For Sale</span>}
                </div>
              </div>

              <p style={styles.location}>📍 {land.location}, {land.city}</p>
              <p style={styles.detail}>📐 Area: {land.area.toLocaleString()} sq ft</p>
              <p style={styles.detail}>💰 Valuation: {land.price} ETH</p>
              <p style={styles.owner}>
                👤 Owner: {land.owner.slice(0, 8)}...{land.owner.slice(-6)}
              </p>

              <span style={styles.viewLink}>View Full Provenance & Deed →</span>
            </div>
          ))}
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
  searchBox: { background: "rgba(255,255,255,0.05)", padding: "25px", borderRadius: "14px", maxWidth: "700px", marginBottom: "30px" },
  tabs: { display: "flex", gap: "10px", marginBottom: "15px" },
  tab: { background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "#aaa", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem" },
  activeTab: { background: "#2196f3", border: "1px solid #2196f3", color: "white", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", fontWeight: "bold" },
  form: { display: "flex", gap: "10px" },
  input: { flex: 1, padding: "12px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: "1rem", outline: "none" },
  searchBtn: { padding: "12px 25px", background: "#2196f3", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem", fontWeight: "bold" },
  noResults: { color: "#888", fontStyle: "italic", marginTop: "20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" },
  resultCard: { background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", transition: "transform 0.2s", ":hover": { transform: "translateY(-4px)" } },
  resultHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  landTitle: { margin: 0, fontSize: "1.2rem" },
  badges: { display: "flex", gap: "6px" },
  verified: { background: "rgba(76, 175, 80, 0.15)", color: "#4caf50", padding: "3px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "bold" },
  pending: { background: "rgba(255, 152, 0, 0.15)", color: "#ff9800", padding: "3px 8px", borderRadius: "6px", fontSize: "0.75rem" },
  sale: { background: "rgba(33, 150, 243, 0.15)", color: "#2196f3", padding: "3px 8px", borderRadius: "6px", fontSize: "0.75rem" },
  location: { fontSize: "1rem", fontWeight: "bold", margin: "8px 0" },
  detail: { color: "#aaa", fontSize: "0.9rem", margin: "4px 0" },
  owner: { color: "#2196f3", fontFamily: "monospace", fontSize: "0.85rem", margin: "6px 0 12px 0" },
  viewLink: { color: "#4caf50", fontSize: "0.85rem", fontWeight: "bold" },
};

export default SearchLand;