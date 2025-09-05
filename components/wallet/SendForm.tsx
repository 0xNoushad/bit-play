"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWalletStore } from "@/app/store/walletStore";
import { walletApi } from "@/app/utils/apiClient";
import { useApiLogger } from "@/app/utils/apiLogger";
import { toast } from "sonner";
import { ButtonLoader } from "@/components/ui/loader";

interface SendFormProps {
  onTransactionComplete?: (txid: string) => void;
}

interface SendResponse {
  txId: string;
  feeSatoshis: number;
  feerateSatPerVb: number;
}

export function SendForm({ onTransactionComplete }: SendFormProps) {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<SendResponse | null>(
    null,
  );

  const { getActiveWallet, setError } = useWalletStore();
  const { loggedFetch } = useApiLogger();
  const activeWallet = getActiveWallet();

  // Bitcoin address validation regex (supports legacy, segwit, and bech32)
  const validateBitcoinAddress = (address: string): boolean => {
    const bitcoinAddressRegex =
      /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$|^tb1[a-z0-9]{39,59}$/;
    return bitcoinAddressRegex.test(address);
  };

  const validateAmount = (amountStr: string): boolean => {
    const num = parseFloat(amountStr);
    return !isNaN(num) && num > 0 && num <= 21000000; // Max 21M BTC
  };

  const validateForm = (): boolean => {
    if (!activeWallet) {
      toast.error("No active wallet selected");
      return false;
    }

    if (!recipientAddress.trim()) {
      toast.error("Recipient address is required");
      return false;
    }

    if (!validateBitcoinAddress(recipientAddress.trim())) {
      toast.error("Invalid Bitcoin address format");
      return false;
    }

    if (!amount.trim()) {
      toast.error("Amount is required");
      return false;
    }

    if (!validateAmount(amount)) {
      toast.error("Invalid amount. Must be a positive number up to 21M BTC");
      return false;
    }

    const amountSats = Math.round(parseFloat(amount) * 1e8);
    if (amountSats < 546) {
      toast.error("Amount too small. Minimum is 546 satoshis (0.00000546 BTC)");
      return false;
    }

    if (!password) {
      toast.error("Password is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !activeWallet) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastTransaction(null);

    try {
      const data: SendResponse = await walletApi.sendBitcoin({
        fromAddress: activeWallet.address,
        toAddress: recipientAddress.trim(),
        amount: parseFloat(amount),
        password: password,
        serverId: activeWallet.serverId,
      });

      setLastTransaction(data);
      toast.success(
        `Transaction sent successfully! TXID: ${data.txId.substring(0, 16)}...`,
      );

      // Clear form
      setRecipientAddress("");
      setAmount("");
      setPassword("");

      // Call success callback
      onTransactionComplete?.(data.txId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send Bitcoin";
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

  if (!activeWallet) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No active wallet selected. Please select or create a wallet first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Send Bitcoin</CardTitle>
          <CardDescription>
            Send Bitcoin from {activeWallet.label || activeWallet.address}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipientAddress">Recipient Address</Label>
              <Input
                id="recipientAddress"
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Enter Bitcoin address (bc1... or 1... or 3...)"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (BTC)</Label>
              <Input
                id="amount"
                type="number"
                step="0.00000001"
                min="0.00000546"
                max="21000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00000000"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Minimum: 546 satoshis (0.00000546 BTC)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Wallet Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter wallet password"
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !recipientAddress || !amount || !password}
            >
              {isLoading && <ButtonLoader />}
              {isLoading ? "Sending Bitcoin..." : "Send Bitcoin"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {lastTransaction && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-green-600">
              Transaction Sent Successfully
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Transaction ID</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
                  {lastTransaction.txId}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyTxId(lastTransaction.txId)}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Fee</Label>
                <p className="text-sm text-muted-foreground">
                  {lastTransaction.feeSatoshis} sats (
                  {(lastTransaction.feeSatoshis / 1e8).toFixed(8)} BTC)
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Fee Rate</Label>
                <p className="text-sm text-muted-foreground">
                  {lastTransaction.feerateSatPerVb} sat/vB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
