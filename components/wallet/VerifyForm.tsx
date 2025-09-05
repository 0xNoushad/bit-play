"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWalletStore } from "@/app/store/walletStore";
import { walletApi } from "@/app/utils/apiClient";
import { useApiLogger } from "@/app/utils/apiLogger";
import { toast } from "sonner";
import { ButtonLoader } from "@/components/ui/loader";

interface VerifyFormProps {
  onVerificationComplete?: (results: TransactionStatus[]) => void;
}

interface TransactionStatus {
  txid: string;
  confirmed?: boolean;
  confirmations?: number;
  block_height?: number;
  error?: string;
}

export function VerifyForm({ onVerificationComplete }: VerifyFormProps) {
  const [txids, setTxids] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResults, setVerificationResults] = useState<
    TransactionStatus[]
  >([]);

  const { setError } = useWalletStore();

  const validateTxids = (txidsStr: string): string[] => {
    const txidList = txidsStr
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    // Basic validation for transaction ID format (64 hex characters)
    const txidRegex = /^[a-fA-F0-9]{64}$/;
    const invalidTxids = txidList.filter((txid) => !txidRegex.test(txid));

    if (invalidTxids.length > 0) {
      toast.error(`Invalid transaction ID format: ${invalidTxids[0]}`);
      return [];
    }

    return txidList;
  };

  const validateForm = (): boolean => {
    if (!txids.trim()) {
      toast.error("Transaction IDs are required");
      return false;
    }

    const txidList = validateTxids(txids);
    if (txidList.length === 0) {
      return false;
    }

    if (txidList.length > 10) {
      toast.error("Maximum 10 transaction IDs allowed at once");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setVerificationResults([]);

    try {
      const txidList = validateTxids(txids);
      const results: TransactionStatus[] =
        await walletApi.verifyTransactions(txidList);

      setVerificationResults(results);

      const confirmedCount = results.filter((r) => r.confirmed).length;
      const errorCount = results.filter((r) => r.error).length;

      if (errorCount > 0) {
        toast.warning(
          `Verified ${results.length} transactions (${errorCount} errors)`,
        );
      } else {
        toast.success(
          `Verified ${results.length} transactions (${confirmedCount} confirmed)`,
        );
      }

      // Call success callback
      onVerificationComplete?.(results);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to verify transactions";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyTxId = (txid: string) => {
    navigator.clipboard.writeText(txid);
    toast.success("Transaction ID copied to clipboard");
  };

  const clearResults = () => {
    setVerificationResults([]);
    setTxids("");
  };

  const getStatusBadge = (result: TransactionStatus) => {
    if (result.error) {
      return <Badge variant="destructive">Error</Badge>;
    }
    if (result.confirmed) {
      return (
        <Badge variant="default" className="bg-green-600">
          Confirmed
        </Badge>
      );
    }
    return <Badge variant="secondary">Unconfirmed</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Verify Transactions</CardTitle>
          <CardDescription>
            Check the confirmation status of Bitcoin transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="txids">Transaction IDs</Label>
              <Textarea
                id="txids"
                value={txids}
                onChange={(e) => setTxids(e.target.value)}
                placeholder="Enter transaction IDs separated by commas&#10;Example:&#10;abc123def456...&#10;789ghi012jkl..."
                disabled={isLoading}
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter one or more transaction IDs separated by commas. Maximum
                10 transactions.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !txids.trim()}
            >
              {isLoading && <ButtonLoader />}
              {isLoading ? "Verifying Transactions..." : "Verify Transactions"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {verificationResults.length > 0 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Verification Results</CardTitle>
            <CardDescription>Transaction confirmation status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {verificationResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(result)}
                    <span className="text-sm font-medium">
                      Transaction {index + 1}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyTxId(result.txid)}
                  >
                    Copy ID
                  </Button>
                </div>

                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">
                      Transaction ID
                    </Label>
                    <code className="block p-2 bg-muted rounded text-xs break-all">
                      {result.txid}
                    </code>
                  </div>

                  {result.error ? (
                    <div>
                      <Label className="text-sm font-medium text-red-600">
                        Error
                      </Label>
                      <p className="text-sm text-red-600">{result.error}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <p className="text-sm text-muted-foreground">
                          {result.confirmed ? "Confirmed" : "Unconfirmed"}
                        </p>
                      </div>
                      {result.confirmed && (
                        <>
                          <div>
                            <Label className="text-sm font-medium">
                              Confirmations
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {result.confirmations}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <Label className="text-sm font-medium">
                              Block Height
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {result.block_height}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full" onClick={clearResults}>
              Verify New Transactions
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
