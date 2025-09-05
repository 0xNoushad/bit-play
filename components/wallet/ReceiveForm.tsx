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

interface ReceiveFormProps {
  onPaymentRequestGenerated?: (bip21: string) => void;
}

interface PaymentRequestResponse {
  success: boolean;
  id: string;
  bip21: string;
  dataUrl: string;
  error?: string;
}

export function ReceiveForm({ onPaymentRequestGenerated }: ReceiveFormProps) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentRequest, setPaymentRequest] =
    useState<PaymentRequestResponse | null>(null);

  const { getActiveWallet, setError } = useWalletStore();
  const { loggedFetch } = useApiLogger();
  const activeWallet = getActiveWallet();

  const validateAmount = (amountStr: string): boolean => {
    if (!amountStr.trim()) return false;
    const num = parseFloat(amountStr);
    return !isNaN(num) && num > 0 && num <= 21000000; // Max 21M BTC
  };

  const validateForm = (): boolean => {
    if (!activeWallet) {
      toast.error("No active wallet selected");
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

    return true;
  };

  const handleGenerateQR = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !activeWallet) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setPaymentRequest(null);

    try {
      const data: PaymentRequestResponse = await walletApi.createPaymentRequest(
        activeWallet.address,
        parseFloat(amount),
        message.trim() || undefined,
      );

      if (!data.success) {
        throw new Error(data.error || "Failed to generate payment request");
      }

      setPaymentRequest(data);
      toast.success("Payment request generated successfully!");

      // Call success callback
      onPaymentRequestGenerated?.(data.bip21);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate payment request";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const clearRequest = () => {
    setPaymentRequest(null);
    setAmount("");
    setMessage("");
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
          <CardTitle>Receive Bitcoin</CardTitle>
          <CardDescription>
            Generate a payment request for{" "}
            {activeWallet.label || activeWallet.address}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Wallet Address Display */}
            <div className="space-y-2">
              <Label>Your Bitcoin Address</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
                  {activeWallet.address}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(activeWallet.address, "Address")
                  }
                >
                  Copy
                </Button>
              </div>
            </div>

            {/* Payment Request Form */}
            <form onSubmit={handleGenerateQR} className="space-y-4">
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
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Payment description or note"
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !amount}
              >
                {isLoading && <ButtonLoader />}
                {isLoading
                  ? "Generating QR Code..."
                  : "Generate Payment Request"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {paymentRequest && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-green-600">
              Payment Request Generated
            </CardTitle>
            <CardDescription>
              Share this QR code or BIP21 URI to receive payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* QR Code Display */}
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg border">
                <img
                  src={paymentRequest.dataUrl}
                  alt="Payment Request QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>

            {/* BIP21 URI */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">BIP21 Payment URI</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
                  {paymentRequest.bip21}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(paymentRequest.bip21, "Payment URI")
                  }
                >
                  Copy
                </Button>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <Label className="text-sm font-medium">Amount</Label>
                <p className="text-sm text-muted-foreground">
                  {amount} BTC ({Math.round(parseFloat(amount) * 1e8)} sats)
                </p>
              </div>
              {message && (
                <div className={message ? "sm:col-span-1" : ""}>
                  <Label className="text-sm font-medium">Message</Label>
                  <p className="text-sm text-muted-foreground break-words">
                    {message}
                  </p>
                </div>
              )}
            </div>

            <Button variant="outline" className="w-full" onClick={clearRequest}>
              Generate New Request
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
