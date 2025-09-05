import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Wallet, Balance, WalletStore } from "../../types/wallet";

// Generate unique ID for wallets
const generateWalletId = (): string => {
  return `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      wallets: [],
      activeWalletId: null,
      balance: null,
      isLoading: false,
      error: null,

      addWallet: (walletData) => {
        const newWallet: Wallet = {
          ...walletData,
          id: generateWalletId(),
          createdAt: Date.now(),
        };

        set((state) => ({
          wallets: [...state.wallets, newWallet],
          activeWalletId: state.activeWalletId || newWallet.id, // Set as active if no active wallet
          error: null,
        }));
      },

      removeWallet: (walletId) => {
        set((state) => {
          const updatedWallets = state.wallets.filter((w) => w.id !== walletId);
          const newActiveWalletId =
            state.activeWalletId === walletId
              ? updatedWallets.length > 0
                ? updatedWallets[0].id
                : null
              : state.activeWalletId;

          return {
            wallets: updatedWallets,
            activeWalletId: newActiveWalletId,
            balance:
              newActiveWalletId !== state.activeWalletId ? null : state.balance,
            error: null,
          };
        });
      },

      setActiveWallet: (walletId) => {
        const wallet = get().wallets.find((w) => w.id === walletId);
        if (wallet) {
          set({
            activeWalletId: walletId,
            balance: null, // Clear balance when switching wallets
            error: null,
          });
        }
      },

      updateWalletLabel: (walletId, label) => {
        set((state) => ({
          wallets: state.wallets.map((wallet) =>
            wallet.id === walletId ? { ...wallet, label } : wallet,
          ),
          error: null,
        }));
      },

      setBalance: (balance) => {
        set({ balance, error: null });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },

      clearWallets: () => {
        set({
          wallets: [],
          activeWalletId: null,
          balance: null,
          error: null,
        });
      },

      getActiveWallet: () => {
        const state = get();
        return state.wallets.find((w) => w.id === state.activeWalletId) || null;
      },

      getWalletById: (walletId) => {
        return get().wallets.find((w) => w.id === walletId) || null;
      },
    }),
    {
      name: "bitcoin-wallet-storage",
      partialize: (state) => ({
        wallets: state.wallets,
        activeWalletId: state.activeWalletId,
      }),
    },
  ),
);
