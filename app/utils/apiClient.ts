import { ApiLogger } from "./apiLogger";

// API client that uses logged fetch for all requests
export class ApiClient {
  private logger: ApiLogger;
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.logger = ApiLogger.getInstance();
    this.baseUrl = baseUrl;
  }

  private getFullUrl(endpoint: string): string {
    if (endpoint.startsWith("http")) {
      return endpoint;
    }
    return `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  }

  async get(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = this.getFullUrl(endpoint);
    return this.logger.loggedFetch(
      url,
      {
        ...options,
        method: "GET",
      },
      {
        endpoint,
        method: "GET",
      },
    );
  }

  async post(
    endpoint: string,
    data?: any,
    options: RequestInit = {},
  ): Promise<Response> {
    const url = this.getFullUrl(endpoint);
    const body = data ? JSON.stringify(data) : undefined;

    return this.logger.loggedFetch(
      url,
      {
        ...options,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body,
      },
      {
        endpoint,
        method: "POST",
        requestData: data,
      },
    );
  }

  async put(
    endpoint: string,
    data?: any,
    options: RequestInit = {},
  ): Promise<Response> {
    const url = this.getFullUrl(endpoint);
    const body = data ? JSON.stringify(data) : undefined;

    return this.logger.loggedFetch(
      url,
      {
        ...options,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body,
      },
      {
        endpoint,
        method: "PUT",
        requestData: data,
      },
    );
  }

  async delete(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = this.getFullUrl(endpoint);
    return this.logger.loggedFetch(
      url,
      {
        ...options,
        method: "DELETE",
      },
      {
        endpoint,
        method: "DELETE",
      },
    );
  }
}

// Create a default instance for Next.js routes (if any)
export const apiClient = new ApiClient();

// Create a server API client that calls the Express server directly
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";
export const serverApiClient = new ApiClient(serverUrl);

// Wallet API functions - now calling Express server directly
export const walletApi = {
  // Create single wallet
  createWallet: async (password: string) => {
    const response = await serverApiClient.post("/wallet", { password });
    if (!response.ok) {
      throw new Error(`Failed to create wallet: ${response.statusText}`);
    }
    return response.json();
  },

  // Create HD wallet
  createHDWallet: async (password: string) => {
    const response = await serverApiClient.post("/wallet/hd", { password });
    if (!response.ok) {
      throw new Error(`Failed to create HD wallet: ${response.statusText}`);
    }
    return response.json();
  },

  // Import wallet from mnemonic
  importWallet: async (mnemonic: string, password: string) => {
    const response = await serverApiClient.post("/wallet/retrieve", {
      mnemonic,
      password,
    });
    if (!response.ok) {
      throw new Error(`Failed to import wallet: ${response.statusText}`);
    }
    return response.json();
  },

  // Get wallet balance
  getBalance: async (address: string) => {
    const response = await serverApiClient.get(
      `/transactions/balance/${address}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to get balance: ${response.statusText}`);
    }
    return response.json();
  },

  // Get transaction history
  getTransactions: async (address: string) => {
    const response = await serverApiClient.get(`/transactions/${address}`);
    if (!response.ok) {
      throw new Error(`Failed to get transactions: ${response.statusText}`);
    }
    return response.json();
  },

  // Send Bitcoin
  sendBitcoin: async (data: {
    fromAddress: string;
    toAddress: string;
    amount: number;
    password: string;
    serverId?: string;
  }) => {
    const response = await serverApiClient.post("/sendbtc", data);
    if (!response.ok) {
      throw new Error(`Failed to send Bitcoin: ${response.statusText}`);
    }
    return response.json();
  },

  // Create payment request
  createPaymentRequest: async (
    address: string,
    amount: number,
    message?: string,
  ) => {
    const params = new URLSearchParams({
      address,
      amount: amount.toString(),
      ...(message && { message }),
    });

    const response = await serverApiClient.get(
      `/payment/payment-request-qr?${params}`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to create payment request: ${response.statusText}`,
      );
    }
    return response.json();
  },

  // Verify transactions
  verifyTransactions: async (txids: string[]) => {
    const response = await serverApiClient.post("/verifyTx", { txids });
    if (!response.ok) {
      throw new Error(`Failed to verify transactions: ${response.statusText}`);
    }
    return response.json();
  },

  // Create time-locked transaction
  createTimeLock: async (data: {
    toAddress: string;
    amount: number;
    timestamp: number;
    password: string;
    fromAddress: string;
    serverId?: string;
  }) => {
    const response = await serverApiClient.post("/timeLock", data);
    if (!response.ok) {
      throw new Error(`Failed to create time-lock: ${response.statusText}`);
    }
    return response.json();
  },

  // Estimate fees
  estimateFees: async () => {
    const response = await serverApiClient.get("/estimateFee");
    if (!response.ok) {
      throw new Error(`Failed to estimate fees: ${response.statusText}`);
    }
    return response.json();
  },
};
