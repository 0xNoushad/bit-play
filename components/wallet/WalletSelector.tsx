"use client";

import React, { useState } from "react";
import { useWalletStore } from "@/app/store/walletStore";
import { Wallet } from "@/types/wallet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  MoreVertical,
  Trash2,
  Edit3,
  Wallet as WalletIcon,
  Key,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

interface WalletSelectorProps {
  className?: string;
}

export function WalletSelector({ className }: WalletSelectorProps) {
  const {
    wallets,
    activeWalletId,
    setActiveWallet,
    removeWallet,
    updateWalletLabel,
    getActiveWallet,
  } = useWalletStore();

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");

  const activeWallet = getActiveWallet();

  const getWalletTypeIcon = (type: Wallet["type"]) => {
    switch (type) {
      case "single":
        return <Key className="h-4 w-4" />;
      case "hd":
        return <Layers className="h-4 w-4" />;
      case "multisig":
        return <WalletIcon className="h-4 w-4" />;
      default:
        return <WalletIcon className="h-4 w-4" />;
    }
  };

  const getWalletTypeLabel = (type: Wallet["type"]) => {
    switch (type) {
      case "single":
        return "Single";
      case "hd":
        return "HD";
      case "multisig":
        return "MultiSig";
      default:
        return "Unknown";
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy address");
    }
  };

  const handleRenameWallet = (walletId: string, currentLabel?: string) => {
    setSelectedWalletId(walletId);
    setNewLabel(currentLabel || "");
    setIsRenameDialogOpen(true);
  };

  const handleDeleteWallet = (walletId: string) => {
    setSelectedWalletId(walletId);
    setIsDeleteDialogOpen(true);
  };

  const confirmRename = () => {
    if (selectedWalletId) {
      updateWalletLabel(selectedWalletId, newLabel.trim());
      toast.success("Wallet renamed successfully");
    }
    setIsRenameDialogOpen(false);
    setSelectedWalletId(null);
    setNewLabel("");
  };

  const confirmDelete = () => {
    if (selectedWalletId) {
      removeWallet(selectedWalletId);
      toast.success("Wallet deleted successfully");
    }
    setIsDeleteDialogOpen(false);
    setSelectedWalletId(null);
  };

  if (wallets.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>No Wallets Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Create or import a wallet to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WalletIcon className="h-5 w-5" />
            Wallet Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active Wallet Selector */}
          <div className="space-y-2">
            <Label>Active Wallet</Label>
            <Select
              value={activeWalletId || ""}
              onValueChange={setActiveWallet}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    <div className="flex items-center gap-2">
                      {getWalletTypeIcon(wallet.type)}
                      <span className="font-medium">
                        {wallet.label ||
                          `${getWalletTypeLabel(wallet.type)} Wallet`}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {getWalletTypeLabel(wallet.type)}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Wallet Details */}
          {activeWallet && (
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getWalletTypeIcon(activeWallet.type)}
                  <span className="font-medium">
                    {activeWallet.label ||
                      `${getWalletTypeLabel(activeWallet.type)} Wallet`}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {getWalletTypeLabel(activeWallet.type)}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleCopyAddress(activeWallet.address)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Address
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleRenameWallet(activeWallet.id, activeWallet.label)
                      }
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => handleDeleteWallet(activeWallet.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Address:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 font-mono text-xs"
                    onClick={() => handleCopyAddress(activeWallet.address)}
                  >
                    {formatAddress(activeWallet.address)}
                    <Copy className="h-3 w-3 ml-1" />
                  </Button>
                </div>

                {activeWallet.xpub && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">xPub:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 font-mono text-xs"
                      onClick={() => handleCopyAddress(activeWallet.xpub!)}
                    >
                      {formatAddress(activeWallet.xpub)}
                      <Copy className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="text-xs">
                    {formatDate(activeWallet.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* All Wallets List */}
          {wallets.length > 1 && (
            <div className="space-y-2">
              <Label>All Wallets ({wallets.length})</Label>
              <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className={`flex items-center justify-between p-2 rounded-md border ${
                      wallet.id === activeWalletId
                        ? "bg-primary/10 border-primary/20"
                        : "bg-background hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getWalletTypeIcon(wallet.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {wallet.label ||
                              `${getWalletTypeLabel(wallet.type)} Wallet`}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getWalletTypeLabel(wallet.type)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {formatAddress(wallet.address)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {wallet.id !== activeWalletId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveWallet(wallet.id)}
                          className="text-xs"
                        >
                          Select
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleCopyAddress(wallet.address)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Address
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleRenameWallet(wallet.id, wallet.label)
                            }
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDeleteWallet(wallet.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Wallet</DialogTitle>
            <DialogDescription>
              Enter a new label for this wallet. Leave empty to use the default
              name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="wallet-label">Wallet Label</Label>
            <Input
              id="wallet-label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Enter wallet label..."
              maxLength={50}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Wallet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this wallet? This action cannot be
              undone. Make sure you have backed up your wallet before
              proceeding.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Wallet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
