"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletCreationForm } from "./WalletCreationForm";
import { HDWalletCreationForm } from "./HDWalletCreationForm";
import { WalletImportForm } from "./WalletImportForm";
import { Key, Layers, Download, Bitcoin, ArrowLeft } from "lucide-react";

export function WalletSetupFlow() {
  const [selectedTab, setSelectedTab] = useState<string>("overview");

  const handleWalletCreated = () => {
    // The wallet has been created and added to the store
    // The BitcoinWalletApp will automatically switch to MainWalletInterface
    // due to the hasWallets check
  };

  const renderOverview = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Bitcoin className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Bitcoin Wallet</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Create a new Bitcoin wallet or import an existing one to get started
          with secure Bitcoin transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Single Wallet Option */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow touch-manipulation"
          onClick={() => setSelectedTab("single")}
        >
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <Key className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-lg">Create Single Wallet</CardTitle>
            <CardDescription className="text-sm">
              Simple single-key wallet for basic Bitcoin storage and
              transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              className="w-full touch-manipulation"
              variant="outline"
              size="lg"
            >
              Create Single Wallet
            </Button>
          </CardContent>
        </Card>

        {/* HD Wallet Option */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow touch-manipulation"
          onClick={() => setSelectedTab("hd")}
        >
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <Layers className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-lg">Create HD Wallet</CardTitle>
            <CardDescription className="text-sm">
              Hierarchical deterministic wallet with extended public key support
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              className="w-full touch-manipulation"
              variant="outline"
              size="lg"
            >
              Create HD Wallet
            </Button>
          </CardContent>
        </Card>

        {/* Import Wallet Option */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow touch-manipulation"
          onClick={() => setSelectedTab("import")}
        >
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <Download className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-lg">Import Wallet</CardTitle>
            <CardDescription className="text-sm">
              Restore an existing wallet using your mnemonic phrase
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              className="w-full touch-manipulation"
              variant="outline"
              size="lg"
            >
              Import Wallet
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="font-semibold mb-2">Security Notice</h3>
          <p className="text-sm text-muted-foreground">
            Your wallet data is stored locally in your browser. Make sure to
            backup your wallet information and keep your passwords secure. We
            recommend using a strong, unique password for your wallet.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh flex flex-col">
      <div className="flex-1 p-6">
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="overview" className="text-xs">
                Overview
              </TabsTrigger>
              <TabsTrigger value="single" className="text-xs">
                Single
              </TabsTrigger>
              <TabsTrigger value="hd" className="text-xs">
                HD
              </TabsTrigger>
              <TabsTrigger value="import" className="text-xs">
                Import
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-0">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="single" className="mt-0">
            <div className="max-w-md mx-auto space-y-4 px-4 sm:px-0">
              <div className="flex items-center gap-2 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTab("overview")}
                  className="p-2 touch-manipulation"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold">Create Single Wallet</h2>
              </div>
              <WalletCreationForm onSuccess={handleWalletCreated} />
            </div>
          </TabsContent>

          <TabsContent value="hd" className="mt-0">
            <div className="max-w-md mx-auto space-y-4 px-4 sm:px-0">
              <div className="flex items-center gap-2 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTab("overview")}
                  className="p-2 touch-manipulation"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold">Create HD Wallet</h2>
              </div>
              <HDWalletCreationForm onSuccess={handleWalletCreated} />
            </div>
          </TabsContent>

          <TabsContent value="import" className="mt-0">
            <div className="max-w-md mx-auto space-y-4 px-4 sm:px-0">
              <div className="flex items-center gap-2 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTab("overview")}
                  className="p-2 touch-manipulation"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold">Import Wallet</h2>
              </div>
              <WalletImportForm onSuccess={handleWalletCreated} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
