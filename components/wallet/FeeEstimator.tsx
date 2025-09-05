"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Zap,
  Clock,
  AlertCircle,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { walletApi } from "@/app/utils/apiClient";
import { useApiLogger } from "@/app/utils/apiLogger";
import { toast } from "sonner";

interface FeeEstimate {
  feerateSatPerVb: number;
}

interface FeeEstimatorProps {
  className?: string;
  autoRefreshInterval?: number; // in milliseconds, default 5 minutes
  onFeeUpdate?: (feeRate: number) => void; // callback when fee is updated
}

export function FeeEstimator({
  className,
  autoRefreshInterval = 300000, // 5 minutes
  onFeeUpdate,
}: FeeEstimatorProps) {
  const [feeEstimate, setFeeEstimate] = useState<FeeEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchFeeEstimate = useCallback(
    async (showToast = false) => {
      setIsRefreshing(true);
      if (!feeEstimate) {
        setIsLoading(true);
      }

      try {
        const data: FeeEstimate = await walletApi.estimateFees();
        setFeeEstimate(data);
        setLastUpdated(new Date());
        setError(null);

        // Call the callback if provided
        if (onFeeUpdate) {
          onFeeUpdate(data.feerateSatPerVb);
        }

        if (showToast) {
          toast.success("Fee estimate updated");
        }
      } catch (error) {
        console.error("Failed to fetch fee estimate:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch fee estimate";
        setError(errorMessage);

        if (showToast) {
          toast.error("Failed to update fee estimate");
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [feeEstimate, onFeeUpdate],
  );

  // Auto-refresh effect
  useEffect(() => {
    // Initial fetch
    fetchFeeEstimate();

    // Set up auto-refresh interval
    const interval = setInterval(() => {
      fetchFeeEstimate();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshInterval, fetchFeeEstimate]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchFeeEstimate(true);
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

  const getFeeLevel = (
    feeRate: number,
  ): { level: string; color: string; icon: React.ReactNode } => {
    if (feeRate < 5) {
      return {
        level: "Low",
        color: "text-green-600",
        icon: <Clock className="h-4 w-4" />,
      };
    } else if (feeRate < 20) {
      return {
        level: "Medium",
        color: "text-yellow-600",
        icon: <Activity className="h-4 w-4" />,
      };
    } else {
      return {
        level: "High",
        color: "text-red-600",
        icon: <TrendingUp className="h-4 w-4" />,
      };
    }
  };

  const estimateTransactionFee = (
    feeRate: number,
    estimatedSize: number = 250,
  ): number => {
    // Estimate fee for a typical transaction (250 vbytes)
    return Math.ceil(feeRate * estimatedSize);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Network Fees
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

        {isLoading && !feeEstimate ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="space-y-3 pt-2 border-t">
              <Skeleton className="h-4 w-36" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="text-right space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : feeEstimate ? (
          <div className="space-y-4">
            {/* Current Fee Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Current Rate
                </span>
                {(() => {
                  const { level, color, icon } = getFeeLevel(
                    feeEstimate.feerateSatPerVb,
                  );
                  return (
                    <Badge
                      variant="outline"
                      className={`${color} border-current`}
                    >
                      {icon}
                      <span className="ml-1">{level}</span>
                    </Badge>
                  );
                })()}
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono">
                {feeEstimate.feerateSatPerVb.toFixed(1)} sat/vB
              </div>
              <div className="text-sm text-muted-foreground">
                Average network fee rate
              </div>
            </div>

            {/* Fee Estimates for Different Transaction Sizes */}
            <div className="space-y-3 pt-2 border-t">
              <div className="text-sm font-medium text-muted-foreground">
                Estimated Transaction Fees
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* Small Transaction */}
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Small Transaction</div>
                    <div className="text-xs text-muted-foreground">
                      ~150 vBytes
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold">
                      {estimateTransactionFee(feeEstimate.feerateSatPerVb, 150)}{" "}
                      sats
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ₿{" "}
                      {(
                        estimateTransactionFee(
                          feeEstimate.feerateSatPerVb,
                          150,
                        ) / 1e8
                      ).toFixed(8)}
                    </div>
                  </div>
                </div>

                {/* Medium Transaction */}
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">
                      Medium Transaction
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ~250 vBytes
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold">
                      {estimateTransactionFee(feeEstimate.feerateSatPerVb, 250)}{" "}
                      sats
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ₿{" "}
                      {(
                        estimateTransactionFee(
                          feeEstimate.feerateSatPerVb,
                          250,
                        ) / 1e8
                      ).toFixed(8)}
                    </div>
                  </div>
                </div>

                {/* Large Transaction */}
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Large Transaction</div>
                    <div className="text-xs text-muted-foreground">
                      ~400 vBytes
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold">
                      {estimateTransactionFee(feeEstimate.feerateSatPerVb, 400)}{" "}
                      sats
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ₿{" "}
                      {(
                        estimateTransactionFee(
                          feeEstimate.feerateSatPerVb,
                          400,
                        ) / 1e8
                      ).toFixed(8)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Level Explanation */}
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                <div className="font-medium mb-1">Fee Levels:</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-green-600" />
                    <span>Low (&lt;5 sat/vB): Slower confirmation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-yellow-600" />
                    <span>Medium (5-20 sat/vB): Normal confirmation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-red-600" />
                    <span>High (&gt;20 sat/vB): Fast confirmation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
