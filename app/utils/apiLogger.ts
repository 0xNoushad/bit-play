import { useConsoleStore } from "../store/consoleStore";

export interface ApiLoggerOptions {
  endpoint: string;
  method: string;
  requestData?: any;
  skipLogging?: boolean;
}

export class ApiLogger {
  private static instance: ApiLogger;
  private addEntry: (entry: any) => void;

  private constructor() {
    // We'll initialize this in the component that uses it
    this.addEntry = () => {};
  }

  public static getInstance(): ApiLogger {
    if (!ApiLogger.instance) {
      ApiLogger.instance = new ApiLogger();
    }
    return ApiLogger.instance;
  }

  public initialize(addEntry: (entry: any) => void) {
    this.addEntry = addEntry;
  }

  public async loggedFetch(
    url: string,
    options: RequestInit & { skipLogging?: boolean } = {},
    logOptions?: Partial<ApiLoggerOptions>,
  ): Promise<Response> {
    const startTime = Date.now();
    const method = options.method || "GET";
    const endpoint = logOptions?.endpoint || url;

    let requestData: any = undefined;
    if (options.body) {
      try {
        if (typeof options.body === "string") {
          requestData = JSON.parse(options.body);
        } else {
          requestData = options.body;
        }
      } catch {
        requestData = options.body;
      }
    }

    try {
      const response = await fetch(url, options);
      const duration = Date.now() - startTime;

      let responseData: any;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        try {
          responseData = await response.clone().json();
        } catch {
          responseData = await response.clone().text();
        }
      } else {
        responseData = await response.clone().text();
      }

      // Only log if not explicitly skipped
      if (!options.skipLogging && !logOptions?.skipLogging) {
        this.addEntry({
          endpoint,
          method,
          request: requestData,
          response: {
            status: response.status,
            statusText: response.statusText,
            data: responseData,
          },
          error: !response.ok,
          duration,
        });
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Only log if not explicitly skipped
      if (!options.skipLogging && !logOptions?.skipLogging) {
        this.addEntry({
          endpoint,
          method,
          request: requestData,
          response: {
            error: error instanceof Error ? error.message : String(error),
            type: "Network Error",
          },
          error: true,
          duration,
        });
      }

      throw error;
    }
  }
}

// Hook to get the logged fetch function
export const useApiLogger = () => {
  const { addEntry } = useConsoleStore();
  const logger = ApiLogger.getInstance();

  // Initialize the logger with the current store's addEntry function
  logger.initialize(addEntry);

  return {
    loggedFetch: logger.loggedFetch.bind(logger),
    addEntry,
  };
};
