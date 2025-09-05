import { Wallet } from "../../types/wallet";

/**
 * Validates Bitcoin address format
 */
export const isValidBitcoinAddress = (address: string): boolean => {
  // Basic Bitcoin address validation (supports legacy, segwit, and bech32)
  const bitcoinAddressRegex =
    /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
  return bitcoinAddressRegex.test(address);
};

/**
 * Formats wallet display name
 */
export const getWalletDisplayName = (wallet: Wallet): string => {
  if (wallet.label) {
    return wallet.label;
  }

  const typeLabel =
    wallet.type === "hd"
      ? "HD"
      : wallet.type === "multisig"
        ? "MultiSig"
        : "Single";
  const shortAddress = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
  return `${typeLabel} - ${shortAddress}`;
};

/**
 * Formats wallet type for display
 */
export const getWalletTypeLabel = (type: Wallet["type"]): string => {
  switch (type) {
    case "hd":
      return "HD Wallet";
    case "multisig":
      return "MultiSig Wallet";
    case "single":
      return "Single Wallet";
    default:
      return "Unknown";
  }
};

/**
 * Converts BTC to satoshis
 */
export const btcToSatoshis = (btc: number): number => {
  return Math.round(btc * 100000000);
};

/**
 * Converts satoshis to BTC
 */
export const satoshisToBtc = (satoshis: number): number => {
  return satoshis / 100000000;
};

/**
 * Formats BTC amount for display
 */
export const formatBtcAmount = (btc: number, decimals: number = 8): string => {
  return btc.toFixed(decimals).replace(/\.?0+$/, "");
};

/**
 * Formats satoshi amount for display
 */
export const formatSatoshiAmount = (satoshis: number): string => {
  return satoshis.toLocaleString();
};

/**
 * Validates wallet creation data
 */
export const validateWalletData = (data: Partial<Wallet>): string[] => {
  const errors: string[] = [];

  if (!data.address) {
    errors.push("Address is required");
  } else if (!isValidBitcoinAddress(data.address)) {
    errors.push("Invalid Bitcoin address format");
  }

  if (!data.type) {
    errors.push("Wallet type is required");
  } else if (!["single", "hd", "multisig"].includes(data.type)) {
    errors.push("Invalid wallet type");
  }

  if (data.type === "hd" && !data.xpub) {
    errors.push("HD wallets require an xpub");
  }

  return errors;
};

/**
 * Copies text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand("copy");
      document.body.removeChild(textArea);
      return result;
    } catch (fallbackError) {
      console.error("Failed to copy to clipboard:", fallbackError);
      return false;
    }
  }
};

/**
 * Generates a short wallet identifier for display
 */
export const getWalletShortId = (wallet: Wallet): string => {
  return wallet.id.split("_").pop()?.slice(0, 6) || wallet.id.slice(0, 6);
};

/**
 * Sorts wallets by creation date (newest first)
 */
export const sortWalletsByDate = (wallets: Wallet[]): Wallet[] => {
  return [...wallets].sort((a, b) => b.createdAt - a.createdAt);
};

/**
 * Filters wallets by type
 */
export const filterWalletsByType = (
  wallets: Wallet[],
  type: Wallet["type"],
): Wallet[] => {
  return wallets.filter((wallet) => wallet.type === type);
};
