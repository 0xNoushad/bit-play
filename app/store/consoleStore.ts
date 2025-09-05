import { create } from "zustand";

export interface ConsoleEntry {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  request?: any;
  response: any;
  error?: boolean;
  duration?: number;
}

interface ConsoleStore {
  entries: ConsoleEntry[];
  isVisible: boolean;
  maxEntries: number;

  // Actions
  addEntry: (entry: Omit<ConsoleEntry, "id" | "timestamp">) => void;
  clearEntries: () => void;
  toggleVisibility: () => void;
  setVisible: (visible: boolean) => void;
}

const generateEntryId = (): string => {
  return `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const formatTimestamp = (): string => {
  return new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
};

export const useConsoleStore = create<ConsoleStore>((set, get) => ({
  entries: [],
  isVisible: false,
  maxEntries: 100,

  addEntry: (entryData) => {
    const newEntry: ConsoleEntry = {
      ...entryData,
      id: generateEntryId(),
      timestamp: formatTimestamp(),
    };

    set((state) => {
      const updatedEntries = [newEntry, ...state.entries];
      // Keep only the most recent entries
      if (updatedEntries.length > state.maxEntries) {
        updatedEntries.splice(state.maxEntries);
      }
      return { entries: updatedEntries };
    });
  },

  clearEntries: () => {
    set({ entries: [] });
  },

  toggleVisibility: () => {
    set((state) => ({ isVisible: !state.isVisible }));
  },

  setVisible: (visible) => {
    set({ isVisible: visible });
  },
}));
