import { ethers } from "ethers";
import LandRegistryJSON from "./LandRegistry.json";

// Replace this with your deployed contract address later
const CONTRACT_ADDRESS = "0xEb287783e716FD62Fd6fc44929107f469Df1B636";

export const getProvider = () => {
  if (!window.ethereum) {
    alert("Please install MetaMask!");
    return null;
  }
  return new ethers.BrowserProvider(window.ethereum);
};

export const getSigner = async () => {
  const provider = getProvider();
  if (!provider) return null;
  return await provider.getSigner();
};

export const getContract = async () => {
  const signer = await getSigner();
  if (!signer) return null;
  return new ethers.Contract(CONTRACT_ADDRESS, LandRegistryJSON.abi, signer);
};

export const getReadOnlyContract = () => {
  const provider = getProvider();
  if (!provider) return null;
  return new ethers.Contract(CONTRACT_ADDRESS, LandRegistryJSON.abi, provider);
};