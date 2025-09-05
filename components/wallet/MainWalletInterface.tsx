"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WalletSelector } from "./WalletSelector";
import { BalanceDisplay } from "./BalanceDisplay";
import { SendForm } from "./SendForm";
import { ReceiveForm } from "./ReceiveForm";
import { VerifyForm } from "./VerifyForm";
import { TimeLockForm } from "./TimeLockForm";
import { TransactionHistory } from "./TransactionHistory";
import { ConsolePanel } from "./ConsolePanel";
import { FeeEstimator } from "./FeeEstimator";
import {
  Bitcoin,
  Send,
  QrCode,
  Shield,
  Clock,
  History,
  Terminal,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function MainWalletInterface() {
  const [activeTab, setActiveTab] = useState("send");
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Bitcoin className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <h1 className="text-lg sm:text-xl font-semibold">
                Bitcoin Wallet
              </h1>
              <Badge
                variant="outline"
                className="text-xs hidden sm:inline-flex"
              >
                {process.env.NODE_ENV === "development" ? "Testnet" : "Mainnet"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                className="flex items-center gap-2 touch-manipulation"
              >
                <Terminal className="h-4 w-4" />
                <span className="hidden sm:inline">Console</span>
                {isConsoleOpen ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Sidebar */}
          <div
            className={`lg:col-span-4 xl:col-span-3 space-y-6 ${isSidebarCollapsed ? "lg:col-span-1" : ""}`}
          >
            {!isSidebarCollapsed && (
              <>
                {/* Wallet Selector */}
                <WalletSelector />

                {/* Balance Display */}
                <BalanceDisplay />

                {/* Fee Estimator */}
                <FeeEstimator />
              </>
            )}

            {/* Collapse Button for Desktop */}
            <div className="hidden lg:block">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="w-full"
              >
                {isSidebarCollapsed ? (
                  <>
                    <ChevronDown className="h-4 w-4 rotate-90" />
                    <span className="sr-only">Expand sidebar</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-4 w-4 rotate-90" />
                    Collapse
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div
            className={`lg:col-span-8 xl:col-span-9 space-y-6 ${isSidebarCollapsed ? "lg:col-span-11" : ""}`}
          >
            {/* Mobile Wallet Info */}
            <div className="lg:hidden space-y-4">
              <WalletSelector />
              <BalanceDisplay />
            </div>

            {/* Transaction Tabs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Transaction Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 h-auto">
                    <TabsTrigger
                      value="send"
                      className="flex items-center gap-2 py-3 touch-manipulation"
                    >
                      <Send className="h-4 w-4" />
                      <span className="hidden sm:inline">Send</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="receive"
                      className="flex items-center gap-2 py-3 touch-manipulation"
                    >
                      <QrCode className="h-4 w-4" />
                      <span className="hidden sm:inline">Receive</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="verify"
                      className="flex items-center gap-2 py-3 touch-manipulation"
                    >
                      <Shield className="h-4 w-4" />
                      <span className="hidden sm:inline">Verify</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="timelock"
                      className="flex items-center gap-2 py-3 touch-manipulation"
                    >
                      <Clock className="h-4 w-4" />
                      <span className="hidden sm:inline">Time Lock</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="send" className="mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Send className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Send Bitcoin</h3>
                      </div>
                      <SendForm />
                    </div>
                  </TabsContent>

                  <TabsContent value="receive" className="mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <QrCode className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">
                          Receive Bitcoin
                        </h3>
                      </div>
                      <ReceiveForm />
                    </div>
                  </TabsContent>

                  <TabsContent value="verify" className="mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Shield className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">
                          Verify Transactions
                        </h3>
                      </div>
                      <VerifyForm />
                    </div>
                  </TabsContent>

                  <TabsContent value="timelock" className="mt-0">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">
                          Time-Locked Transactions
                        </h3>
                      </div>
                      <TimeLockForm />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionHistory />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Console Panel */}
        {isConsoleOpen && (
          <div className="mt-6">
            <ConsolePanel />
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg">
        <div className="grid grid-cols-4 safe-area-inset-bottom">
          <Button
            variant={activeTab === "send" ? "default" : "ghost"}
            size="lg"
            onClick={() => setActiveTab("send")}
            className="rounded-none flex flex-col gap-1.5 h-20 touch-manipulation"
          >
            <Send className="h-5 w-5" />
            <span className="text-xs font-medium">Send</span>
          </Button>
          <Button
            variant={activeTab === "receive" ? "default" : "ghost"}
            size="lg"
            onClick={() => setActiveTab("receive")}
            className="rounded-none flex flex-col gap-1.5 h-20 touch-manipulation"
          >
            <QrCode className="h-5 w-5" />
            <span className="text-xs font-medium">Receive</span>
          </Button>
          <Button
            variant={activeTab === "verify" ? "default" : "ghost"}
            size="lg"
            onClick={() => setActiveTab("verify")}
            className="rounded-none flex flex-col gap-1.5 h-20 touch-manipulation"
          >
            <Shield className="h-5 w-5" />
            <span className="text-xs font-medium">Verify</span>
          </Button>
          <Button
            variant={activeTab === "timelock" ? "default" : "ghost"}
            size="lg"
            onClick={() => setActiveTab("timelock")}
            className="rounded-none flex flex-col gap-1.5 h-20 touch-manipulation"
          >
            <Clock className="h-5 w-5" />
            <span className="text-xs font-medium">Time Lock</span>
          </Button>
        </div>
      </div>

      {/* Mobile Bottom Padding */}
      <div className="lg:hidden h-20 safe-area-inset-bottom"></div>
    </div>
  );
}
