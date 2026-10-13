import React, { useState, useEffect, useContext } from "react";
import { WalletContext } from "../context/WalletContext";
import Sidebar from "../components/Sidebar";
import { ethers } from "ethers";

const adminMenu = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "🏠" },
  { label: "Register Land", path: "/admin/register-land", icon: "🏞️" },
  { label: "Manage Inspectors", path: "/admin/inspectors", icon: "👮" },
  { label: "All Users", path: "/admin/users", icon: "👥" },
  { label: "All Lands", path: "/admin/lands", icon: "📊" },
  { label: "Analytics", path: "/admin/stats", icon: "📈" },
];

const AdminStats = () => {
  const { contract } = useContext(WalletContext);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalLands: 0,
    verifiedLands: 0,
    forSaleLands: 0,
    totalValueEth: 0,
    avgPriceEth: 0,
    totalArea: 0,
    cityDistribution: {},
  });
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!contract) return;
      try {
        setLoading(true);
        const count = Number(await contract.landCount());
        let verified = 0;
        let forSale = 0;
        let totalEth = 0;
        let areaSum = 0;
        const cities = {};

        for (let i = 1; i <= count; i++) {
          const land = await contract.getLandDetails(i);
          const priceEth = parseFloat(ethers.formatEther(land.price));
          totalEth += priceEth;
          areaSum += Number(land.area);

          if (land.isVerified) verified++;
          if (land.isForSale) forSale++;

          const cityName = land.city.trim() || "Other";
          cities[cityName] = (cities[cityName] || 0) + 1;
        }

        setMetrics({
          totalLands: count,
          verifiedLands: verified,
          forSaleLands: forSale,
          totalValueEth: totalEth.toFixed(2),
          avgPriceEth: count > 0 ? (totalEth / count).toFixed(2) : 0,
          totalArea: areaSum,
          cityDistribution: cities,
        });

        // Fetch Recent Blockchain Events
        const regEvents = await contract.queryFilter(contract.filters.LandRegistered());
        const verEvents = await contract.queryFilter(contract.filters.LandVerified());
        const txEvents = await contract.queryFilter(contract.filters.TransferCompleted());

        const combined = [
          ...regEvents.map((e) => ({
            type: "🏞️ Land Registered",
            detail: `Land #${e.args.landId} in ${e.args.location}`,
            block: e.blockNumber,
            hash: e.transactionHash,
          })),
          ...verEvents.map((e) => ({
            type: "✅ Land Verified",
            detail: `Land #${e.args.landId} approved by Inspector`,
            block: e.blockNumber,
            hash: e.transactionHash,
          })),
          ...txEvents.map((e) => ({
            type: "🔄 Deed Transferred",
            detail: `Land #${e.args.landId} transferred to ${e.args.to.slice(0, 6)}...`,
            block: e.blockNumber,
            hash: e.transactionHash,
          })),
        ];

        // Sort newest block first
        combined.sort((a, b) => b.block - a.block);
        setRecentEvents(combined.slice(0, 8));
      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [contract]);

  const verifiedPercent =
    metrics.totalLands > 0
      ? Math.round((metrics.verifiedLands / metrics.totalLands) * 100)
      : 0;

  return (
    <div style={styles.layout}>
      <Sidebar menuItems={adminMenu} />
      <div style={styles.main}>
        <h1 style={styles.heading}>📈 Registry Analytics & Insights</h1>
        <p style={styles.subtitle}>Real-time on-chain statistics and activity feed</p>

        {loading ? (
          <p style={styles.loading}>Calculating on-chain metrics...</p>
        ) : (
          <>
            {/* Top Summary Cards */}
            <div style={styles.statsGrid}>
              <div style={{ ...styles.statCard, borderTop: "4px solid #4caf50" }}>
                <span style={styles.statLabel}>Total Registry Value</span>
                <h2 style={styles.statValue}>💰 {metrics.totalValueEth} ETH</h2>
                <span style={styles.statSub}>Avg: {metrics.avgPriceEth} ETH / land</span>
              </div>

              <div style={{ ...styles.statCard, borderTop: "4px solid #2196f3" }}>
                <span style={styles.statLabel}>Total Area Recorded</span>
                <h2 style={styles.statValue}>📐 {metrics.totalArea.toLocaleString()} sq ft</h2>
                <span style={styles.statSub}>Across {metrics.totalLands} properties</span>
              </div>

              <div style={{ ...styles.statCard, borderTop: "4px solid #ff9800" }}>
                <span style={styles.statLabel}>Verification Rate</span>
                <h2 style={styles.statValue}>✅ {verifiedPercent}%</h2>
                <span style={styles.statSub}>
                  {metrics.verifiedLands} of {metrics.totalLands} verified
                </span>
              </div>

              <div style={{ ...styles.statCard, borderTop: "4px solid #ab47bc" }}>
                <span style={styles.statLabel}>Active Marketplace</span>
                <h2 style={styles.statValue}>🛒 {metrics.forSaleLands}</h2>
                <span style={styles.statSub}>Properties listed for sale</span>
              </div>
            </div>

            <div style={styles.twoCol}>
              {/* City Distribution Chart */}
              <div style={styles.panel}>
                <h3 style={styles.panelTitle}>🏙️ Lands by City</h3>
                {Object.keys(metrics.cityDistribution).length === 0 ? (
                  <p style={styles.empty}>No city data yet.</p>
                ) : (
                  Object.entries(metrics.cityDistribution).map(([city, count]) => {
                    const pct = Math.round((count / metrics.totalLands) * 100);
                    return (
                      <div key={city} style={styles.barGroup}>
                        <div style={styles.barHeader}>
                          <span>{city}</span>
                          <span style={{ color: "#aaa" }}>
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div style={styles.barTrack}>
                          <div style={{ ...styles.barFill, width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Recent Blockchain Activity */}
              <div style={styles.panel}>
                <h3 style={styles.panelTitle}>📡 Live Blockchain Activity</h3>
                {recentEvents.length === 0 ? (
                  <p style={styles.empty}>No blockchain events recorded yet.</p>
                ) : (
                  <div style={styles.feedList}>
                    {recentEvents.map((ev, i) => (
                      <div key={i} style={styles.feedItem}>
                        <div>
                          <div style={styles.feedType}>{ev.type}</div>
                          <div style={styles.feedDetail}>{ev.detail}</div>
                        </div>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${ev.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.blockBadge}
                        >
                          Block #{ev.block} ↗
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
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
  loading: { color: "#888", fontSize: "1.1rem" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "20px", marginBottom: "30px" },
  statCard: { background: "rgba(255,255,255,0.05)", padding: "22px", borderRadius: "12px" },
  statLabel: { color: "#aaa", fontSize: "0.85rem" },
  statValue: { fontSize: "1.8rem", margin: "10px 0 5px 0" },
  statSub: { color: "#666", fontSize: "0.8rem" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" },
  panel: { background: "rgba(255,255,255,0.05)", padding: "25px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)" },
  panelTitle: { fontSize: "1.2rem", marginBottom: "20px", marginTop: 0 },
  empty: { color: "#666", fontStyle: "italic" },
  barGroup: { marginBottom: "16px" },
  barHeader: { display: "flex", justifyContent: "space-between", fontSize: "0.95rem", marginBottom: "6px" },
  barTrack: { width: "100%", height: "10px", background: "rgba(255,255,255,0.08)", borderRadius: "6px", overflow: "hidden" },
  barFill: { height: "100%", background: "linear-gradient(90deg, #2196f3, #4caf50)", borderRadius: "6px" },
  feedList: { display: "flex", flexDirection: "column", gap: "12px" },
  feedItem: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "12px 15px", borderRadius: "10px" },
  feedType: { fontWeight: "bold", fontSize: "0.95rem", marginBottom: "3px" },
  feedDetail: { color: "#aaa", fontSize: "0.85rem" },
  blockBadge: { background: "rgba(33, 150, 243, 0.15)", color: "#2196f3", padding: "5px 10px", borderRadius: "6px", fontSize: "0.8rem", textDecoration: "none", whiteSpace: "nowrap" },
};

export default AdminStats;