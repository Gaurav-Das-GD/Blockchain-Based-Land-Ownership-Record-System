import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { WalletContext } from "../context/WalletContext";

const Sidebar = ({ menuItems }) => {
  const { account, disconnectWallet } = useContext(WalletContext);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={styles.sidebar}>
      <div>
        <h2 style={styles.logo}>🏗️ Land Registry</h2>
        <p style={styles.wallet}>
          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ""}
        </p>

        <nav style={styles.nav}>
          {menuItems.map((item, index) => (
            <button
              key={index}
              style={{
                ...styles.navItem,
                ...(location.pathname === item.path ? styles.activeNav : {}),
              }}
              onClick={() => navigate(item.path)}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <button
        style={styles.logoutBtn}
        onClick={() => {
          disconnectWallet();
          navigate("/");
        }}
      >
        🚪 Disconnect
      </button>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "240px",
    minHeight: "100vh",
    background: "#1a1a2e",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "fixed",
    left: 0,
    top: 0,
  },
  logo: {
    color: "#fff",
    fontSize: "1.3rem",
    marginBottom: "5px",
  },
  wallet: {
    color: "#888",
    fontSize: "0.8rem",
    marginBottom: "30px",
    wordBreak: "break-all",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 15px",
    background: "transparent",
    color: "#ccc",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    textAlign: "left",
    width: "100%",
  },
  activeNav: {
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
  },
  navIcon: {
    fontSize: "1.1rem",
  },
  logoutBtn: {
    padding: "12px",
    background: "rgba(255,0,0,0.15)",
    color: "#ff6b6b",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
};

export default Sidebar;