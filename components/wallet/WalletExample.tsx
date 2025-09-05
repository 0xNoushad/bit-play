"use client";

import { useWallet } from "../../hooks/useWallet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Example component demonstrating wallet store usage
 * This is for testing purposes and will be replaced by actual wallet components
 */
export function WalletExample() {
  const {
    wallets,
    activeWallet,
    balance,
    hasWallets,
    addWallet,
    setActiveWallet,
    removeWallet,
  } = useWallet();

  const handleAddExampleWallet = () => {
    addWallet({
      type: "single",
      address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      label: `Test Wallet ${wallets.length + 1}`,
    });
  };

  const handleAddHDWallet = () => {
    addWallet({
      type: "hd",
      address: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
      xpub: "xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8",
      label: `HD Wallet ${wallets.length + 1}`,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Store Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleAddExampleWallet}>Add Single Wallet</Button>
            <Button onClick={handleAddHDWallet} variant="outline">
              Add HD Wallet
            </Button>
          </div>

          {hasWallets && (
            <div>
              <h3 className="font-semibold mb-2">Wallets ({wallets.length})</h3>
              <div className="space-y-2">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className={`p-2 border rounded ${
                      activeWallet?.id === wallet.id
                        ? "bg-blue-50 border-blue-200"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {wallet.label || "Unnamed Wallet"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {wallet.type.toUpperCase()} -{" "}
                          {wallet.address.slice(0, 10)}...
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveWallet(wallet.id)}
                          disabled={activeWallet?.id === wallet.id}
                        >
                          {activeWallet?.id === wallet.id ? "Active" : "Select"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeWallet(wallet.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeWallet && (
            <div>
              <h3 className="font-semibold mb-2">Active Wallet</h3>
              <div className="p-2 bg-green-50 border border-green-200 rounded">
                <div className="font-medium">{activeWallet.label}</div>
                <div className="text-sm text-gray-600">
                  {activeWallet.address}
                </div>
                <div className="text-sm text-gray-500">
                  Type: {activeWallet.type}
                </div>
              </div>
            </div>
          )}

          {balance && (
            <div>
              <h3 className="font-semibold mb-2">Balance</h3>
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                <div>
                  Confirmed: {balance.confirmedBTC} BTC ({balance.confirmedSats}{" "}
                  sats)
                </div>
                <div>
                  Pending: {balance.pendingBTC} BTC ({balance.pendingSats} sats)
                </div>
              </div>
            </div>
          )}

          {!hasWallets && (
            <div className="text-center text-gray-500 py-4">
              No wallets created yet. Add a wallet to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
