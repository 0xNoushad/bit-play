"use client";

import React, { useEffect, useState } from "react";
import { useWalletStore } from "@/app/store/walletStore";
import { WalletSetupFlow } from "./WalletSetupFlow";
import { MainWalletInterface } from "./MainWalletInterface";
import { LoaderOverlay } from "@/components/ui/loader";

export function BitcoinWalletApp() {
  const { wallets, isLoading, setLoading } = useWalletStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize the app and check for existing wallets
    const initializeApp = async () => {
      setLoading(true);

      try {
        // Small delay to ensure store is hydrated from localStorage
        await new Promise((resolve) => setTimeout(resolve, 100));
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [setLoading]);

  // Show loading while initializing or during wallet operations
  if (!isInitialized || isLoading) {
    return <LoaderOverlay text="Initializing Bitcoin Wallet..." />;
  }

  // Conditional rendering based on wallet existence
  const hasWallets = wallets && wallets.length > 0;

  return (
    <div className="min-h-dvh bg-background">
      {hasWallets ? <MainWalletInterface /> : <WalletSetupFlow />}
    </div>
  );
}
