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

interface TimeLockFormProps {
  onTimeLockCreated?: (txHex: string, lockTime: number) => void;
}

interface TimeLockResponse {
  txHex: string;
  lockTime: number;
  feeSatoshis: number;
  feerateSatPerVb: number;
}

export function TimeLockForm({ onTimeLockCreated }: TimeLockFormProps) {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [lockDate, setLockDate] = useState("");
  const [lockTime, setLockTime] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [timeLockResult, setTimeLockResult] = useState<TimeLockResponse | null>(
    null,
  );

  const { getActiveWallet, setError } = useWalletStore();
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

  const validateDateTime = (date: string, time: string): boolean => {
    if (!date || !time) return false;

    const dateTime = new Date(`${date}T${time}`);
    const now = new Date();

    return dateTime.getTime() > now.getTime();
  };

  const getTimestamp = (date: string, time: string): number => {
    const dateTime = new Date(`${date}T${time}`);
    return Math.floor(dateTime.getTime() / 1000);
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

    if (!lockDate || !lockTime) {
      toast.error("Lock date and time are required");
      return false;
    }

    if (!validateDateTime(lockDate, lockTime)) {
      toast.error("Lock time must be in the future");
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
    setTimeLockResult(null);

    try {
      const timestamp = getTimestamp(lockDate, lockTime);

      const data: TimeLockResponse = await walletApi.createTimeLock({
        toAddress: recipientAddress.trim(),
        amount: parseFloat(amount),
        timestamp: timestamp,
        password: password,
        fromAddress: activeWallet.address,
        serverId: activeWallet.serverId,
      });

      setTimeLockResult(data);
      toast.success("Time-locked transaction created successfully!");

      // Clear form
      setRecipientAddress("");
      setAmount("");
      setLockDate("");
      setLockTime("");
      setPassword("");

      // Call success callback
      onTimeLockCreated?.(data.txHex, data.lockTime);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create time-locked transaction";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyTxHex = (txHex: string) => {
    navigator.clipboard.writeText(txHex);
    toast.success("Transaction hex copied to clipboard");
  };

  const formatLockTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const clearResult = () => {
    setTimeLockResult(null);
  };

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toTimeString().slice(0, 5);

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
          <CardTitle>Create Time-Locked Transaction</CardTitle>
          <CardDescription>
            Create a Bitcoin transaction that can only be spent after a specific
            time
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lockDate">Lock Date</Label>
                <Input
                  id="lockDate"
                  type="date"
                  value={lockDate}
                  onChange={(e) => setLockDate(e.target.value)}
                  min={today}
                  disabled={isLoading}
                  required
                  className="touch-manipulation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lockTime">Lock Time</Label>
                <Input
                  id="lockTime"
                  type="time"
                  value={lockTime}
                  onChange={(e) => setLockTime(e.target.value)}
                  disabled={isLoading}
                  required
                  className="touch-manipulation"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              The transaction will be locked until the specified date and time.
              It cannot be spent before this time.
            </p>

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
              disabled={
                isLoading ||
                !recipientAddress ||
                !amount ||
                !lockDate ||
                !lockTime ||
                !password
              }
            >
              {isLoading && <ButtonLoader />}
              {isLoading
                ? "Creating Time-Locked Transaction..."
                : "Create Time-Locked Transaction"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {timeLockResult && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-green-600">
              Time-Locked Transaction Created
            </CardTitle>
            <CardDescription>
              Transaction created successfully but not yet broadcast
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Transaction Hex</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-muted rounded text-xs break-all max-h-20 overflow-y-auto">
                  {timeLockResult.txHex}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyTxHex(timeLockResult.txHex)}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This transaction hex can be broadcast after the lock time
                expires.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
              <div className="sm:col-span-2">
                <Label className="text-sm font-medium">Lock Time</Label>
                <p className="text-sm text-muted-foreground break-words">
                  {formatLockTime(timeLockResult.lockTime)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Fee</Label>
                <p className="text-sm text-muted-foreground">
                  {timeLockResult.feeSatoshis} sats (
                  {(timeLockResult.feeSatoshis / 1e8).toFixed(8)} BTC)
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Fee Rate</Label>
                <p className="text-sm text-muted-foreground">
                  {timeLockResult.feerateSatPerVb} sat/vB
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> This transaction is time-locked and
                cannot be broadcast until{" "}
                {formatLockTime(timeLockResult.lockTime)}. Save the transaction
                hex if you need to broadcast it later.
              </p>
            </div>

            <Button variant="outline" className="w-full" onClick={clearResult}>
              Create New Time-Locked Transaction
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
