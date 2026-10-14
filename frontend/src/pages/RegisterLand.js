import React, { useState, useContext } from "react";
import { WalletContext } from "../context/WalletContext";
import Sidebar from "../components/Sidebar";
import { ethers } from "ethers";
import { toast } from "react-toastify";

const adminMenu = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "🏠" },
  { label: "Register Land", path: "/admin/register-land", icon: "🏞️" },
  { label: "Manage Inspectors", path: "/admin/inspectors", icon: "👮" },
  { label: "All Users", path: "/admin/users", icon: "👥" },
  { label: "All Lands", path: "/admin/lands", icon: "📊" },
  { label: "Analytics", path: "/admin/stats", icon: "📈" },
];

const RegisterLand = () => {
  const { contract } = useContext(WalletContext);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [formData, setFormData] = useState({
    owner: "",
    location: "",
    city: "",
    area: "",
    price: "",
    propertyId: "",
    documentHash: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Compute SHA-256 hash of uploaded deed file right in the browser
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex =
        "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      setFormData((prev) => ({ ...prev, documentHash: hashHex }));
      toast.info("📄 SHA-256 Document Hash generated!");
    } catch (err) {
      console.error("Error hashing file:", err);
      toast.error("Could not hash file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) return toast.error("Connect wallet first!");

    try {
      setLoading(true);
      toast.info("Submitting land registration to blockchain...");
      const tx = await contract.registerLand(
        formData.owner,
        formData.location,
        formData.city,
        parseInt(formData.area),
        ethers.parseEther(formData.price),
        formData.documentHash || "bafkrei-default-ipfs-hash",
        formData.propertyId
      );
      await tx.wait();
      toast.success("✅ Land registered on blockchain with document hash!");
      setFormData({
        owner: "",
        location: "",
        city: "",
        area: "",
        price: "",
        propertyId: "",
        documentHash: "",
      });
      setFileName("");
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed: " + (error.reason || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar menuItems={adminMenu} />
      <div style={styles.main}>
        <h1 style={styles.heading}>🏞️ Register New Land</h1>
        <p style={styles.subtitle}>
          Mint a new property record with cryptographic document verification
        </p>

        <div style={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Owner Wallet Address</label>
              <input
                style={styles.input}
                type="text"
                name="owner"
                value={formData.owner}
                onChange={handleChange}
                placeholder="0x..."
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Location / Address</label>
              <input
                style={styles.input}
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ward 45, Plot 12A"
                required
              />
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>City</label>
                <input
                  style={styles.input}
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Kolkata"
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Area (sq ft)</label>
                <input
                  style={styles.input}
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="1200"
                  required
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Price (ETH)</label>
                <input
                  style={styles.input}
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="2.5"
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Property ID</label>
                <input
                  style={styles.input}
                  type="text"
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleChange}
                  placeholder="PROP-001"
                  required
                />
              </div>
            </div>

            {/* Document Upload & Hash Section */}
            <div style={styles.docSection}>
              <label style={styles.label}>
                📄 Title Deed Document (Generates SHA-256 Fingerprint)
              </label>
              <input
                style={styles.fileInput}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleFileUpload}
              />
              {fileName && (
                <p style={styles.fileHint}>Selected: {fileName}</p>
              )}

              <label style={{ ...styles.label, marginTop: "12px" }}>
                🔐 Document Hash / IPFS CID (Stored On-Chain)
              </label>
              <input
                style={{ ...styles.input, fontFamily: "monospace", fontSize: "0.85rem" }}
                type="text"
                name="documentHash"
                value={formData.documentHash}
                onChange={handleChange}
                placeholder="Upload a file above or paste an IPFS CID (Qm...)"
                required
              />
            </div>

            <button style={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? "Registering on Blockchain..." : "✅ Register Land"}
            </button>
          </form>
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
  formCard: { background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "14px", maxWidth: "620px" },
  inputGroup: { marginBottom: "15px", flex: 1 },
  label: { display: "block", marginBottom: "6px", color: "#ccc", fontSize: "0.9rem" },
  input: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: "1rem", outline: "none", boxSizing: "border-box" },
  row: { display: "flex", gap: "15px" },
  docSection: { background: "rgba(33, 150, 243, 0.06)", border: "1px dashed rgba(33, 150, 243, 0.3)", padding: "16px", borderRadius: "10px", marginBottom: "15px" },
  fileInput: { color: "#ccc", fontSize: "0.9rem" },
  fileHint: { color: "#4caf50", fontSize: "0.85rem", margin: "6px 0 0 0" },
  submitBtn: { width: "100%", padding: "14px", fontSize: "1.1rem", background: "#4caf50", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", marginTop: "10px" },
};

export default RegisterLand;