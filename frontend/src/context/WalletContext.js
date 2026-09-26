import React, { createContext, useState, useEffect } from "react";
import { getContract } from "../utils/contract";

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState(null); // "admin", "inspector", "user", "unregistered"
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }
      setLoading(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const addr = accounts[0];
      setAccount(addr);

      const contractInstance = await getContract();
      setContract(contractInstance);

      // Check role
      const isAdmin = await contractInstance.isAdmin(addr);
      if (isAdmin) {
        setRole("admin");
      } else {
        const isInspector = await contractInstance.isLandInspector(addr);
        if (isInspector) {
          setRole("inspector");
        } else {
          const isVerified = await contractInstance.isUserVerified(addr);
          if (isVerified) {
            setRole("user");
          } else {
            try {
              const user = await contractInstance.getUserDetails(addr);
              if (user.exists) {
                setRole("pending");
              } else {
                setRole("unregistered");
              }
            } catch {
              setRole("unregistered");
            }
          }
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Connection failed:", error);
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setRole(null);
    setContract(null);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          connectWallet();
        } else {
          disconnectWallet();
        }
      });
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{ account, role, contract, loading, connectWallet, disconnectWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
};