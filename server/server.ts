import express, { type Application } from "express";
import dotenv from "dotenv";

import walletRoutes from "./routes/wallet";
import transactionRoutes from "./routes/transaction";
import paymentRoutes from "./routes/payment";
import sendBtcRouter from "./routes/sendBtc";
import timeLockRouter from "./routes/timeLock";
import verifyTxRouter from "./routes/verifyTx";
import validateAddressRouter from "./routes/validateAddress";
import estimateFeeRouter from "./routes/estimateFee";
import historicalDataRouter from "./routes/historicalData";
import reimburseBtcRouter from "./routes/reimburseBtc";

dotenv.config();

const app: Application = express();

// --- Middleware ---
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use("/wallet", walletRoutes);
app.use("/transactions", transactionRoutes);
app.use("/payment", paymentRoutes);
app.use("/sendbtc", sendBtcRouter);
app.use("/timeLock", timeLockRouter);
app.use("/verifyTx", verifyTxRouter);
app.use("/validateAddress", validateAddressRouter);
app.use("/estimateFee", estimateFeeRouter);
app.use("/historicalData", historicalDataRouter);
app.use("/reimburseBtc", reimburseBtcRouter);

// --- Root: API status ---
app.get(
  "/",
  (
    _req: any,
    res: { json: (arg0: { message: string; status: string }) => any },
  ) => {
    res.json({ message: "Bitcoin Wallet API Server", status: "running" });
  },
);

// --- Health check  ---
app.get(
  "/healthz",
  (_req: any, res: { json: (arg0: { ok: boolean }) => any }) =>
    res.json({ ok: true }),
);

export default app;

// Allow running directly without a separate server.ts
if (require.main === module) {
  const port = Number(process.env.PORT) || 3001;
  app.listen(port, () => {
    console.log(`🚀 Bitcoin Wallet API Server running on port ${port}`);
    console.log(`📡 Health check: http://localhost:${port}/healthz`);
  });
}
