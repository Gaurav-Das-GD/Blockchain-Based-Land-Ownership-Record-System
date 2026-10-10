import React, { useState, useEffect } from "react";
import { getReadOnlyContract } from "../utils/contract";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

const Explorer = () => {
  const navigate = useNavigate();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchVerifiedLands = async () => {
      const contract = getReadOnlyContract();
      if (!contract) {
        setLoading(false);
        return;
      }
      try {
        const count = Number(await contract.landCount());
        const publicLands = [];
        
        // Fetch all lands and only show verified ones to the public
        for (let i = 1; i <= count; i++) {
          const land = await contract.getLandDetails(i);
          if (land.isVerified) {
            publicLands.push({
              id: Number(land.id),
              city: land.city,
              location: land.location,
              area: Number(land.area),
              price: ethers.formatEther(land.price),
              isForSale: land.isForSale,
              owner: land.owner
            });
          }
        }
        setLands(publicLands);
      } catch (err) {
        console.error("Error fetching lands for explorer:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVerifiedLands();
  }, []);

  const filteredLands = lands.filter(land => 
    land.city.toLowerCase().includes(search.toLowerCase()) || 
    land.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h2 style={styles.logo} onClick={() => navigate("/")}>🏗️ Land Registry</h2>
        <button style={styles.backBtn} onClick={() => navigate("/")}>← Back to Home</button>
      </div>

      <div style={styles.hero}>
        <h1 style={styles.title}>🌍 Public Land Explorer</h1>
        <p style={styles.subtitle}>Browse all verified properties on the blockchain, completely transparently.</p>
        
        <input 
          style={styles.searchBar} 
          type="text" 
          placeholder="🔍 Search by City or Location..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={styles.content}>
        {loading ? (
          <p style={styles.loading}>Loading blockchain data...</p>
        ) : filteredLands.length === 0 ? (
          <p style={styles.noData}>No verified lands found.</p>
        ) : (
          <div style={styles.grid}>
            {filteredLands.map(land => (
              <div 
                key={land.id} 
                style={{...styles.card, cursor: "pointer"}} 
                onClick={() => navigate(`/land/${land.id}`)}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.landId}>Land #{land.id}</span>
                  {land.isForSale && <span style={styles.saleBadge}>🛒 For Sale</span>}
                </div>
                <div style={styles.cardBody}>
                  <p style={styles.location}>📍 {land.location}</p>
                  <p style={styles.detail}>🏙️ {land.city}</p>
                  <p style={styles.detail}>📐 {land.area} sq ft</p>
                  <p style={styles.detail}>👤 Owner: <span style={styles.owner}>{land.owner.slice(0,6)}...{land.owner.slice(-4)}</span></p>
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
  container: { minHeight: "100vh", background: "#0f0f1a", color: "white", fontFamily: "'Segoe UI', sans-serif" },
  navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", background: "rgba(0,0,0,0.3)" },
  logo: { margin: 0, cursor: "pointer", fontSize: "1.5rem" },
  backBtn: { background: "transparent", color: "#aaa", border: "1px solid #aaa", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" },
  hero: { textAlign: "center", padding: "60px 20px 40px 20px" },
  title: { fontSize: "2.5rem", margin: "0 0 10px 0" },
  subtitle: { color: "#888", fontSize: "1.1rem", marginBottom: "30px" },
  searchBar: { width: "100%", maxWidth: "500px", padding: "15px 20px", borderRadius: "30px", border: "none", outline: "none", fontSize: "1rem", background: "rgba(255,255,255,0.1)", color: "white" },
  content: { maxWidth: "1200px", margin: "0 auto", padding: "0 20px 60px 20px" },
  loading: { textAlign: "center", color: "#888", fontSize: "1.2rem", marginTop: "40px" },
  noData: { textAlign: "center", color: "#888", marginTop: "40px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", marginTop: "30px" },
  card: { background: "rgba(255,255,255,0.05)", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", transition: "transform 0.2s", ":hover": { transform: "translateY(-5px)" } },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 20px", background: "rgba(255,255,255,0.02)" },
  landId: { fontWeight: "bold", fontSize: "1.1rem" },
  saleBadge: { background: "rgba(33, 150, 243, 0.1)", color: "#2196f3", padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "bold" },
  cardBody: { padding: "20px" },
  location: { fontSize: "1.1rem", marginBottom: "10px", fontWeight: "bold" },
  detail: { color: "#aaa", fontSize: "0.95rem", marginBottom: "8px" },
  owner: { color: "#4caf50", fontFamily: "monospace" },
};

export default Explorer;