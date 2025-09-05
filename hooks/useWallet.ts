import { useWalletStore } from "../app/store/walletStore";
import { Wallet } from "../types/wallet";

/**
 * Custom hook for wallet operations
 */
export const useWallet = () => {
  const store = useWalletStore();

  return {
    // State
    wallets: store.wallets,
    activeWallet: store.getActiveWallet(),
    balance: store.balance,
    isLoading: store.isLoading,
    error: store.error,
    hasWallets: store.wallets.length > 0,

    // Actions
    addWallet: store.addWallet,
    removeWallet: store.removeWallet,
    setActiveWallet: store.setActiveWallet,
    updateWalletLabel: store.updateWalletLabel,
    setBalance: store.setBalance,
    setLoading: store.setLoading,
    setError: store.setError,
    clearWallets: store.clearWallets,

    // Utilities
    getWalletById: store.getWalletById,
  };
};

/**
 * Hook to get a specific wallet by ID
 */
export const useWalletById = (walletId: string | null): Wallet | null => {
  const getWalletById = useWalletStore((state) => state.getWalletById);
  return walletId ? getWalletById(walletId) : null;
};

/**
 * Hook to check if a wallet exists
 */
export const useHasWallets = (): boolean => {
  const wallets = useWalletStore((state) => state.wallets);
  return wallets.length > 0;
};
