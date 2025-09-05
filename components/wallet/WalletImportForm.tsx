"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface WalletImportFormProps {
  onSuccess?: () => void;
}

interface ImportWalletResponse {
  address: string;
  xpub?: string;
  id?: string;
  serverId?: string;
}

export function WalletImportForm({ onSuccess }: WalletImportFormProps) {
  const [mnemonic, setMnemonic] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { addWallet, setError } = useWalletStore();

  const validateMnemonic = (mnemonic: string): boolean => {
    const words = mnemonic.trim().split(/\s+/);

    // Check word count (typically 12, 15, 18, 21, or 24 words)
    const validWordCounts = [12, 15, 18, 21, 24];
    if (!validWordCounts.includes(words.length)) {
      toast.error(
        `Invalid mnemonic: expected 12, 15, 18, 21, or 24 words, got ${words.length}`,
      );
      return false;
    }

    // Check for empty words
    if (words.some((word) => !word.trim())) {
      toast.error("Mnemonic contains empty words");
      return false;
    }

    // Basic character validation (only letters and spaces)
    if (!/^[a-zA-Z\s]+$/.test(mnemonic)) {
      toast.error("Mnemonic should only contain letters and spaces");
      return false;
    }

    return true;
  };

  const validateForm = () => {
    if (!mnemonic.trim()) {
      toast.error("Mnemonic phrase is required");
      return false;
    }

    if (!validateMnemonic(mnemonic)) {
      return false;
    }

    if (!password) {
      toast.error("Password is required");
      return false;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
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

    try {
      const data: ImportWalletResponse = await walletApi.importWallet(
        mnemonic.trim(),
        password,
      );

      // Add wallet to store
      addWallet({
        type: "hd", // Imported wallets are typically HD wallets
        address: data.address,
        xpub: data.xpub,
        serverId: data.id || data.serverId,
        label: `Imported Wallet ${new Date().toLocaleDateString()}`,
      });

      toast.success("Wallet imported successfully!");

      // Clear form
      setMnemonic("");
      setPassword("");
      setConfirmPassword("");

      // Call success callback
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to import wallet";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMnemonicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Clean up the input: normalize whitespace and convert to lowercase
    const cleaned = e.target.value.toLowerCase().replace(/\s+/g, " ");
    setMnemonic(cleaned);
  };

  const getWordCount = () => {
    const words = mnemonic
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    return words.length;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Import Wallet</CardTitle>
        <CardDescription>
          Import an existing HD wallet using your mnemonic phrase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mnemonic">Mnemonic Phrase</Label>
            <Textarea
              id="mnemonic"
              value={mnemonic}
              onChange={handleMnemonicChange}
              placeholder="Enter your 12, 15, 18, 21, or 24 word mnemonic phrase..."
              disabled={isLoading}
              required
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Words: {getWordCount()}</span>
              <span>Expected: 12, 15, 18, 21, or 24 words</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-password">Password</Label>
            <div className="relative">
              <Input
                id="import-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a secure password"
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

          <div className="space-y-2">
            <Label htmlFor="import-confirmPassword">Confirm Password</Label>
            <Input
              id="import-confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              disabled={isLoading}
              required
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Security Note:</strong> Make sure you're in a secure
              environment. Your mnemonic phrase will be used to restore your
              wallet.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading || !mnemonic.trim() || !password || !confirmPassword
            }
          >
            {isLoading && <ButtonLoader />}
            {isLoading ? "Importing Wallet..." : "Import Wallet"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
