export interface Wallet {
  id: string;
  type: "single" | "hd" | "multisig";
  address: string;
  xpub?: string;
  label?: string;
  createdAt: number;
  serverId?: string; // Server-side wallet ID for signing operations
}

export interface Balance {
  confirmedBTC: number;
  pendingBTC: number;
  confirmedSats: number;
  pendingSats: number;
}

export interface TransactionData {
  txid: string;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_time?: number;
  };
  value?: number;
  timestamp?: number;
  fee?: number;
  vin?: Array<{
    txid: string;
    vout: number;
    prevout?: {
      scriptpubkey_address?: string;
      value?: number;
    };
  }>;
  vout?: Array<{
    scriptpubkey_address?: string;
    value?: number;
  }>;
}

export interface TransactionHistoryResponse {
  transactions: TransactionData[];
}

export interface WalletStore {
  wallets: Wallet[];
  activeWalletId: string | null;
  balance: Balance | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  addWallet: (wallet: Omit<Wallet, "id" | "createdAt">) => void;
  removeWallet: (walletId: string) => void;
  setActiveWallet: (walletId: string) => void;
  updateWalletLabel: (walletId: string, label: string) => void;
  setBalance: (balance: Balance) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearWallets: () => void;

  // Getters
  getActiveWallet: () => Wallet | null;
  getWalletById: (walletId: string) => Wallet | null;
}
