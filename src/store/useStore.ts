import { create } from 'zustand';

export type CommandType = 'client.intro' | 'hello.client' | 'log' | 'warn' | 'error' | 'state.action.complete' | 'state.action.dispatch' | 'api.response' | 'bench.report' | 'display' | 'image' | string;

export interface ReactotronCommand {
  id: string;
  type: CommandType;
  payload: any;
  connectionId: string;
  timestamp: number;
  raw?: any;
}

export interface Connection {
  id: string;
  address: string;
  name?: string;
  platform?: string;
  os?: string;
  connectedAt: number;
}

interface ReactotronState {
  connections: Record<string, Connection>;
  timeline: Record<string, ReactotronCommand[]>; // connectionId → array of commands
  selectedConnectionId: string | null;

  addCommand: (command: Omit<ReactotronCommand, 'id' | 'timestamp'>) => void;
  addConnection: (conn: Omit<Connection, 'connectedAt'>) => void;
  removeConnection: (connectionId: string) => void;
  clearTimeline: () => void;
  clearConnectionTimeline: (connectionId: string) => void;
  setSelectedConnection: (id: string | null) => void;
}

export const useStore = create<ReactotronState>()((set, get) => ({
  connections: {
    '1': {
      id: '1',
      name: 'Lexi',
      address: '192.168.0.1',
      platform: 'iOS',
      os: '17.5',
      connectedAt: Date.now() - 1000 * 60 * 45,
    },
    '2': {
      id: '2',
      name: 'Angela',
      address: '192.168.0.2',
      platform: 'Android',
      os: '14',
      connectedAt: Date.now() - 1000 * 60 * 12,
    },
  },

  // Timeline grouped by connectionId
  timeline: {
    '1': [
      {
        id: 'cmd-1',
        type: 'client.intro',
        payload: { name: 'Lexi', platform: 'iOS', version: '1.2.3' },
        connectionId: '1',
        timestamp: Date.now() - 1000 * 60 * 44,
      },
      {
        id: 'cmd-2',
        type: 'log',
        payload: 'App initialized successfully',
        connectionId: '1',
        timestamp: Date.now() - 1000 * 60 * 43,
      },
      {
        id: 'cmd-3',
        type: 'state.action.dispatch',
        payload: { action: { type: 'FETCH_USERS_REQUEST' } },
        connectionId: '1',
        timestamp: Date.now() - 1000 * 60 * 40,
      },
      {
        id: 'cmd-4',
        type: 'state.action.complete',
        payload: { action: { type: 'FETCH_USERS_SUCCESS' } },
        connectionId: '1',
        timestamp: Date.now() - 1000 * 60 * 39,
      },
      {
        id: 'cmd-5',
        type: 'api.response',
        payload: { url: '/api/users', status: 200 },
        connectionId: '1',
        timestamp: Date.now() - 1000 * 60 * 38,
      },
      {
        id: 'cmd-6',
        type: 'warn',
        payload: 'Deprecated API usage detected',
        connectionId: '1',
        timestamp: Date.now() - 1000 * 60 * 30,
      },
      {
        id: 'cmd-7',
        type: 'error',
        payload: { message: 'Failed to load image' },
        connectionId: '1',
        timestamp: Date.now() - 1000 * 60 * 25,
      },
      {
        id: 'cmd-8',
        type: 'display',
        payload: { name: 'User Profile', value: { id: 42 } },
        connectionId: '1',
        timestamp: Date.now() - 1000 * 60 * 20,
      },
    ],
    '2': [
      {
        id: 'cmd-9',
        type: 'client.intro',
        payload: { name: 'Angela', platform: 'Android' },
        connectionId: '2',
        timestamp: Date.now() - 1000 * 60 * 11,
      },
      {
        id: 'cmd-10',
        type: 'log',
        payload: 'App started on Android device',
        connectionId: '2',
        timestamp: Date.now() - 1000 * 60 * 10,
      },
      {
        id: 'cmd-11',
        type: 'image',
        payload: { uri: 'https://picsum.photos/400/300', caption: 'Device screenshot' },
        connectionId: '2',
        timestamp: Date.now() - 1000 * 60 * 8,
      },
      {
        id: 'cmd-12',
        type: 'bench.report',
        payload: { name: 'Heavy Render', duration: 245, unit: 'ms' },
        connectionId: '2',
        timestamp: Date.now() - 1000 * 60 * 5,
      },
      {
        id: 'cmd-13',
        type: 'error',
        payload: 'Network timeout after 15000ms',
        connectionId: '2',
        timestamp: Date.now() - 1000 * 60 * 3,
      },
    ],
  },

  selectedConnectionId: null,

  addCommand: (cmd) =>
    set((state) => {
      const newCommand: ReactotronCommand = {
        ...cmd,
        id: crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2),
        timestamp: Date.now(),
      };

      const connId = newCommand.connectionId;
      const currentTimeline = state.timeline[connId] || [];

      return {
        timeline: {
          ...state.timeline,
          [connId]: [newCommand, ...currentTimeline], // newest first
        },
      };
    }),

  addConnection: (conn) =>
    set((state) => ({
      connections: {
        ...state.connections,
        [conn.id]: { ...conn, connectedAt: Date.now() },
      },
      // Initialize empty timeline for new connection
      timeline: {
        ...state.timeline,
        [conn.id]: [],
      },
    })),

  removeConnection: (connectionId) =>
    set((state) => {
      const { [connectionId]: _, ...remainingConnections } = state.connections;
      const { [connectionId]: __, ...remainingTimeline } = state.timeline;

      return {
        connections: remainingConnections,
        timeline: remainingTimeline,
        selectedConnectionId: state.selectedConnectionId === connectionId ? null : state.selectedConnectionId,
      };
    }),

  clearTimeline: () =>
    set((state) => ({
      timeline: Object.keys(state.connections).reduce((acc, id) => ({ ...acc, [id]: [] }), {} as Record<string, ReactotronCommand[]>),
    })),

  clearConnectionTimeline: (connectionId) =>
    set((state) => ({
      timeline: {
        ...state.timeline,
        [connectionId]: [],
      },
    })),

  setSelectedConnection: (id) => set({ selectedConnectionId: id }),
}));
