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

interface WalletCreationFormProps {
  onSuccess?: () => void;
}

export function WalletCreationForm({ onSuccess }: WalletCreationFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const data = await walletApi.createWallet(password);

      addWallet({
        type: "single",
        address: data.address,
        serverId: data.id || data.serverId,
        label: `Single Wallet ${new Date().toLocaleDateString()}`,
      });

      toast.success("Single wallet created successfully!");

      // Clear form
      setPassword("");
      setConfirmPassword("");

      // Call success callback
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create wallet";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Single Wallet</CardTitle>
        <CardDescription>
          Create a new single-key Bitcoin wallet with password protection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
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
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
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
            {isLoading ? "Creating Wallet..." : "Create Single Wallet"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
