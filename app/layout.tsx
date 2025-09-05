import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const font = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: {
    icon: "🔒",
  },
  title: "bit-play",
  description:
    "single & HD wallets, AES-256-GCM keystore, send (RBF), timelock, BIP21+QR, fee/verify endpoints, testnet-ready",
  openGraph: {
    title: "bit-play",
    description:
      "single & HD wallets, AES-256-GCM keystore, send (RBF), timelock, BIP21+QR, fee/verify endpoints, testnet-ready",
    images: ["/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "bit-play",
    description:
      "single & HD wallets, AES-256-GCM keystore, send (RBF), timelock, BIP21+QR, fee/verify endpoints, testnet-ready",
    images: ["/opengraph-image.png"],
  },
  keywords: [
    "bitcoin",
    "wallet",
    "cryptocurrency",
    "bitcoin wallet",
    "HD wallet",
    "hierarchical deterministic",
    "testnet",
    "mainnet",
    "send bitcoin",
    "receive bitcoin",
    "transaction",
    "fee estimation",
    "timelock",
    "BIP21",
    "QR code",
    "keystore",
    "AES-256-GCM",
    "RBF",
    "replace by fee",
    "bitcoin testnet",
    "bitcoin mainnet",
    "open source",
    "bitcoin tools",
    "crypto wallet",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} min-h-dvh`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-left" />
        </ThemeProvider>
      </body>
    </html>
  );
}
