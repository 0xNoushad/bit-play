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

interface HDWalletCreationFormProps {
  onSuccess?: () => void;
}

interface HDWalletResponse {
  address: string;
  xpub: string;
  id?: string;
  serverId?: string;
}

export function HDWalletCreationForm({ onSuccess }: HDWalletCreationFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [walletResult, setWalletResult] = useState<HDWalletResponse | null>(
    null,
  );

  const { addWallet, setError } = useWalletStore();

  const validateForm = () => {
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
      const data: HDWalletResponse = await walletApi.createHDWallet(password);

      // Store the result to display to user
      setWalletResult(data);

      // Add wallet to store
      addWallet({
        type: "hd",
        address: data.address,
        xpub: data.xpub,
        serverId: data.id || data.serverId,
        label: `HD Wallet ${new Date().toLocaleDateString()}`,
      });

      toast.success("HD wallet created successfully!");

      // Clear form
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create HD wallet";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    setWalletResult(null);
    onSuccess?.();
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  // Show wallet result after successful creation
  if (walletResult) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>HD Wallet Created</CardTitle>
          <CardDescription>
            Your HD wallet has been created successfully. Save this information
            securely.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Address</Label>
            <div className="flex gap-2">
              <Input
                value={walletResult.address}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(walletResult.address, "Address")}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Extended Public Key (xpub)</Label>
            <div className="flex gap-2">
              <Input
                value={walletResult.xpub}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(walletResult.xpub, "xpub")}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Important:</strong> Save your xpub securely. You'll need
              it to restore your wallet or generate additional addresses.
            </p>
          </div>

          <Button onClick={handleContinue} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create HD Wallet</CardTitle>
        <CardDescription>
          Create a new hierarchical deterministic (HD) Bitcoin wallet with
          extended public key
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hd-password">Password</Label>
            <div className="relative">
              <Input
                id="hd-password"
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
            <Label htmlFor="hd-confirmPassword">Confirm Password</Label>
            <Input
              id="hd-confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              disabled={isLoading}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !password || !confirmPassword}
          >
            {isLoading && <ButtonLoader />}
            {isLoading ? "Creating HD Wallet..." : "Create HD Wallet"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
