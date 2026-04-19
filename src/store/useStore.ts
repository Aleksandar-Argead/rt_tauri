import { create } from "zustand";

export type CommandType =
  | "client.intro"
  | "hello.client"
  | "log"
  | "warn"
  | "error"
  | "state.action.complete"
  | "state.action.dispatch"
  | "api.response"
  | "bench.report"
  | "display"
  | "image"
  | string; // fallback for custom commands

export interface ReactotronCommand {
  id: string; // unique id (use uuid or Date.now() + random)
  type: CommandType;
  payload: any; // the original payload from RN
  connectionId: string;
  timestamp: number; // Date.now() when received
  raw?: any; // optional: keep the full original message
}

export interface Connection {
  id: string;
  address: string;
  name?: string; // from client.intro
  platform?: string;
  os?: string;
  connectedAt: number;
}

interface ReactotronState {
  // Core data
  connections: Record<string, Connection>; // keyed by connectionId
  timeline: ReactotronCommand[]; // chronological list (newest first or oldest first)

  // UI helpers
  selectedConnectionId: string | null;
  searchTerm: string;
  filters: {
    types: CommandType[];
    minLevel?: "log" | "warn" | "error";
  };

  // Actions
  addCommand: (command: Omit<ReactotronCommand, "id" | "timestamp">) => void;
  addConnection: (conn: Omit<Connection, "connectedAt">) => void;
  removeConnection: (connectionId: string) => void;
  clearTimeline: () => void;
  setSelectedConnection: (id: string | null) => void;
  setSearchTerm: (term: string) => void;
  toggleTypeFilter: (type: CommandType) => void;
  getTimelineForConnection: (
    connectionId: string | null,
  ) => ReactotronCommand[];
  clearConnectionTimeline: (connectionId: string) => void;
}

export const useStore = create<ReactotronState>()((set, get) => ({
  connections: {
    "1": {
      id: "1",
      name: "Lexi",
      connectedAt: Date.now(),
      address: "192.168.0.1",
      platform: "iOS",
      os: "17.5",
    },
    "2": {
      id: "2",
      name: "Angela",
      connectedAt: Date.now(),
      address: "192.168.0.2",
      platform: "Android",
      os: "34",
    },
  },
  timeline: [],

  selectedConnectionId: null,
  searchTerm: "",
  filters: {
    types: [], // empty = show all
  },

  addCommand: (cmd) => {
    const newCommand: ReactotronCommand = {
      ...cmd,
      id:
        crypto.randomUUID?.() ||
        Date.now().toString(36) + Math.random().toString(36),
      timestamp: Date.now(),
    };

    set((state) => ({
      timeline: [newCommand, ...state.timeline], // newest on top (most common)
      // or [...state.timeline, newCommand] if you prefer oldest first
    }));
  },

  addConnection: (conn) => {
    set((state) => ({
      connections: {
        ...state.connections,
        [conn.id]: {
          ...conn,
          connectedAt: Date.now(),
        },
      },
    }));
  },

  getTimelineForConnection: (connectionId: string | null) => {
    const state = get();
    if (!connectionId) return state.timeline;

    return state.timeline.filter((cmd) => cmd.connectionId === connectionId);
  },

  clearConnectionTimeline: (connectionId: string) =>
    set((state) => ({
      timeline: state.timeline.filter((c) => c.connectionId !== connectionId),
    })),

  removeConnection: (connectionId) => {
    set((state) => {
      const { [connectionId]: _, ...rest } = state.connections;
      return {
        connections: rest,
        // optionally auto-clear commands from this connection or keep them
        timeline: state.timeline.filter((c) => c.connectionId !== connectionId),
        selectedConnectionId:
          state.selectedConnectionId === connectionId
            ? null
            : state.selectedConnectionId,
      };
    });
  },

  clearTimeline: () => set({ timeline: [] }),

  setSelectedConnection: (id) => set({ selectedConnectionId: id }),

  setSearchTerm: (term) => set({ searchTerm: term }),

  toggleTypeFilter: (type) =>
    set((state) => {
      const hasType = state.filters.types.includes(type);
      return {
        filters: {
          ...state.filters,
          types: hasType
            ? state.filters.types.filter((t) => t !== type)
            : [...state.filters.types, type],
        },
      };
    }),
}));
