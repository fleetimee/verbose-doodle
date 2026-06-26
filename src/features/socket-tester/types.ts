export type SocketProtocol = "tcp-client" | "tcp-server" | "udp";

export type PayloadFormat = "ascii" | "hex" | "base64";

export type MessageDelimiter = "" | "\n" | "\r\n";

export type BridgeStatus = "disconnected" | "connecting" | "connected";

export type TrafficDirection = "in" | "out" | "err" | "sys";

export type TrafficLogEntry = {
  readonly id: string;
  readonly timestamp: string;
  readonly direction: TrafficDirection;
  readonly protocol: SocketProtocol;
  readonly scope: string;
  readonly data: string;
  readonly format: PayloadFormat | "text" | "json";
  readonly metadata?: Record<string, unknown>;
};

export type TcpClientState = {
  readonly connectionId: string;
  readonly connected: boolean;
  readonly host: string;
  readonly port: number;
};

export type TcpServerClient = {
  readonly id: string;
  readonly address: string;
  readonly connectedAt: string;
};

export type TcpServerState = {
  readonly serverId: string;
  readonly listening: boolean;
  readonly port: number;
  readonly clients: readonly TcpServerClient[];
};

export type UdpServerState = {
  readonly serverId: string;
  readonly listening: boolean;
  readonly port: number;
};

export type SocketCommand =
  | {
      readonly type: "tcp_client_connect";
      readonly payload: {
        readonly connectionId: string;
        readonly host: string;
        readonly port: number;
      };
    }
  | {
      readonly type: "tcp_client_disconnect";
      readonly payload: {
        readonly connectionId: string;
      };
    }
  | {
      readonly type: "tcp_client_send";
      readonly payload: {
        readonly connectionId: string;
        readonly data: string;
        readonly format: PayloadFormat;
        readonly delimiter: MessageDelimiter;
      };
    }
  | {
      readonly type: "tcp_server_start";
      readonly payload: {
        readonly serverId: string;
        readonly port: number;
      };
    }
  | {
      readonly type: "tcp_server_stop";
      readonly payload: {
        readonly serverId: string;
      };
    }
  | {
      readonly type: "tcp_server_send";
      readonly payload: {
        readonly serverId: string;
        readonly clientId: string;
        readonly data: string;
        readonly format: PayloadFormat;
        readonly delimiter: MessageDelimiter;
      };
    }
  | {
      readonly type: "udp_send";
      readonly payload: {
        readonly host: string;
        readonly port: number;
        readonly data: string;
        readonly format: PayloadFormat;
      };
    }
  | {
      readonly type: "udp_server_start";
      readonly payload: {
        readonly serverId: string;
        readonly port: number;
      };
    }
  | {
      readonly type: "udp_server_stop";
      readonly payload: {
        readonly serverId: string;
      };
    };

export type BridgeEvent = {
  readonly type?: string;
  readonly payload?: Record<string, unknown>;
  readonly [key: string]: unknown;
};

export type SocketMetrics = {
  readonly activeConnections: number;
  readonly packetsIn: number;
  readonly packetsOut: number;
  readonly errors: number;
};
