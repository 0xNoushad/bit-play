"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useWalletStore } from "@/app/store/walletStore";
import { Balance } from "@/types/wallet";
import { walletApi } from "@/app/utils/apiClient";
import { useApiLogger } from "@/app/utils/apiLogger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Bitcoin,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface BalanceDisplayProps {
  className?: string;
  autoRefreshInterval?: number; // in milliseconds, default 30 seconds
}

export function BalanceDisplay({
  className,
  autoRefreshInterval = 30000,
}: BalanceDisplayProps) {
  const {
    balance,
    setBalance,
    isLoading,
    setLoading,
    error,
    setError,
    getActiveWallet,
  } = useWalletStore();

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { loggedFetch } = useApiLogger();
  const activeWallet = getActiveWallet();

  const fetchBalance = useCallback(
    async (showToast = false) => {
      if (!activeWallet) {
        setError("No active wallet selected");
        return;
      }

      setIsRefreshing(true);
      if (!balance) {
        setLoading(true);
      }

      try {
        const balanceData: Balance = await walletApi.getBalance(
          activeWallet.address,
        );
        setBalance(balanceData);
        setLastUpdated(new Date());
        setError(null);

        if (showToast) {
          toast.success("Balance updated successfully");
        }
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch balance";
        setError(errorMessage);

        if (showToast) {
          toast.error("Failed to update balance");
        }
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeWallet, balance, setBalance, setLoading, setError],
  );

  // Auto-refresh effect
  useEffect(() => {
    if (!activeWallet) return;

    // Initial fetch
    fetchBalance();

    // Set up auto-refresh interval
    const interval = setInterval(() => {
      fetchBalance();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [activeWallet, autoRefreshInterval, fetchBalance]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchBalance(true);
  };

  const formatBTC = (btc: number) => {
    return btc.toFixed(8);
  };

  const formatSats = (sats: number) => {
    return sats.toLocaleString();
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);

    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else {
      return date.toLocaleTimeString();
    }
  };

  if (!activeWallet) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5" />
            Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">No wallet selected</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5" />
            Balance
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {formatLastUpdated(lastUpdated)}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {isLoading && !balance ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ) : balance ? (
          <div className="space-y-4">
            {/* Confirmed Balance */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-muted-foreground">
                  Confirmed Balance
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-bold font-mono break-all">
                  ₿ {formatBTC(balance.confirmedBTC)}
                </div>
                <div className="text-sm text-muted-foreground font-mono">
                  {formatSats(balance.confirmedSats)} sats
                </div>
              </div>
            </div>

            {/* Pending Balance */}
            {(balance.pendingBTC !== 0 || balance.pendingSats !== 0) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Pending Balance
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-base sm:text-lg font-semibold font-mono text-orange-600 break-all">
                    ₿ {formatBTC(balance.pendingBTC)}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {formatSats(balance.pendingSats)} sats
                  </div>
                </div>
              </div>
            )}

            {/* Total Balance */}
            {balance.pendingBTC !== 0 && (
              <div className="pt-2 border-t">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total (Confirmed + Pending)
                  </span>
                  <div className="space-y-1">
                    <div className="text-lg sm:text-xl font-bold font-mono break-all">
                      ₿ {formatBTC(balance.confirmedBTC + balance.pendingBTC)}
                    </div>
                    <div className="text-sm text-muted-foreground font-mono">
                      {formatSats(balance.confirmedSats + balance.pendingSats)}{" "}
                      sats
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Zero Balance State */}
            {balance.confirmedBTC === 0 && balance.pendingBTC === 0 && (
              <div className="text-center py-4">
                <div className="text-muted-foreground text-sm">
                  This wallet has no Bitcoin balance
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Wallet Address Info */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Address:</span>
            <div className="font-mono mt-1 break-all">
              {activeWallet.address}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
