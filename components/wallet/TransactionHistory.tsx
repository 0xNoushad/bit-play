"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useWalletStore } from "@/app/store/walletStore";
import { TransactionData, TransactionHistoryResponse } from "@/types/wallet";
import { walletApi } from "@/app/utils/apiClient";
import { useApiLogger } from "@/app/utils/apiLogger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  History,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface TransactionHistoryProps {
  className?: string;
  autoRefreshInterval?: number; // in milliseconds, default 60 seconds
  maxTransactions?: number; // maximum number of transactions to display
}

export function TransactionHistory({
  className,
  autoRefreshInterval = 60000,
  maxTransactions = 20,
}: TransactionHistoryProps) {
  const { isLoading, setLoading, error, setError, getActiveWallet } =
    useWalletStore();

  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeWallet = getActiveWallet();

  const fetchTransactions = useCallback(
    async (showToast = false) => {
      if (!activeWallet) {
        setError("No active wallet selected");
        return;
      }

      setIsRefreshing(true);
      if (transactions.length === 0) {
        setLoading(true);
      }

      try {
        const data: TransactionHistoryResponse =
          await walletApi.getTransactions(activeWallet.address);
        setTransactions(data.transactions.slice(0, maxTransactions));
        setLastUpdated(new Date());
        setError(null);

        if (showToast) {
          toast.success("Transaction history updated");
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch transactions";
        setError(errorMessage);

        if (showToast) {
          toast.error("Failed to update transaction history");
        }
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeWallet, transactions.length, maxTransactions, setLoading, setError],
  );

  // Auto-refresh effect
  useEffect(() => {
    if (!activeWallet) return;

    // Initial fetch
    fetchTransactions();

    // Set up auto-refresh interval
    const interval = setInterval(() => {
      fetchTransactions();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [activeWallet, autoRefreshInterval, fetchTransactions]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchTransactions(true);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatBTC = (sats: number) => {
    return (sats / 1e8).toFixed(8);
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

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const getTransactionType = (
    tx: TransactionData,
  ): "sent" | "received" | "unknown" => {
    if (!activeWallet) return "unknown";

    // Check if any output goes to our address (received)
    const hasOutputToUs = tx.vout?.some(
      (output) => output.scriptpubkey_address === activeWallet.address,
    );

    // Check if any input comes from our address (sent)
    const hasInputFromUs = tx.vin?.some(
      (input) => input.prevout?.scriptpubkey_address === activeWallet.address,
    );

    if (hasInputFromUs && hasOutputToUs) {
      // Self-transaction or change
      return "sent";
    } else if (hasOutputToUs) {
      return "received";
    } else if (hasInputFromUs) {
      return "sent";
    }

    return "unknown";
  };

  const getTransactionValue = (tx: TransactionData): number => {
    if (!activeWallet) return 0;

    const type = getTransactionType(tx);

    if (type === "received") {
      // Sum all outputs to our address
      return (
        tx.vout?.reduce((sum, output) => {
          if (output.scriptpubkey_address === activeWallet.address) {
            return sum + (output.value || 0);
          }
          return sum;
        }, 0) || 0
      );
    } else if (type === "sent") {
      // Sum all inputs from our address minus outputs to our address (change)
      const inputSum =
        tx.vin?.reduce((sum, input) => {
          if (input.prevout?.scriptpubkey_address === activeWallet.address) {
            return sum + (input.prevout.value || 0);
          }
          return sum;
        }, 0) || 0;

      const outputSum =
        tx.vout?.reduce((sum, output) => {
          if (output.scriptpubkey_address === activeWallet.address) {
            return sum + (output.value || 0);
          }
          return sum;
        }, 0) || 0;

      return inputSum - outputSum;
    }

    return 0;
  };

  if (!activeWallet) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
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
            <History className="h-5 w-5" />
            Transaction History
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

        {isLoading && transactions.length === 0 ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-6 w-6" />
                  </div>
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground">
              <div className="font-medium mb-1">No transactions found</div>
              <div className="text-sm">
                This wallet hasn't made any transactions yet
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const type = getTransactionType(tx);
              const value = getTransactionValue(tx);
              const isConfirmed = tx.status.confirmed;

              return (
                <div
                  key={tx.txid}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {type === "received" ? (
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                      ) : type === "sent" ? (
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium capitalize">
                        {type === "unknown" ? "Transaction" : type}
                      </span>
                      <Badge
                        variant={isConfirmed ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {isConfirmed ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Confirmed
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-mono font-semibold ${
                          type === "received"
                            ? "text-green-600"
                            : type === "sent"
                              ? "text-red-600"
                              : "text-muted-foreground"
                        }`}
                      >
                        {type === "received" ? "+" : type === "sent" ? "-" : ""}
                        ₿ {formatBTC(Math.abs(value))}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {formatSats(Math.abs(value))} sats
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">TX ID:</span>
                      <span className="font-mono flex-1 truncate">
                        {tx.txid}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(tx.txid, "Transaction ID")
                        }
                        className="h-8 w-8 p-0 touch-manipulation"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://mempool.space/testnet/tx/${tx.txid}`,
                            "_blank",
                          )
                        }
                        className="h-8 w-8 p-0 touch-manipulation"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>

                    {isConfirmed && tx.status.block_time && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Date:</span>{" "}
                        {formatDate(tx.status.block_time)}
                      </div>
                    )}

                    {isConfirmed && tx.status.block_height && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Block:</span>{" "}
                        {tx.status.block_height.toLocaleString()}
                      </div>
                    )}

                    {tx.fee && (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Fee:</span>{" "}
                        {formatSats(tx.fee)} sats
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {transactions.length === maxTransactions && (
              <div className="text-center py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing latest {maxTransactions} transactions
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
