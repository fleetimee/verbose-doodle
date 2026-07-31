import { describe, expect, test } from "bun:test";
import {
  MAX_LOG_ENTRIES,
  SocketBridgeEngine,
  toLogEntry,
} from "./socket-bridge-engine";

describe("SocketBridgeEngine state machine", () => {
  test("initializes with default disconnected state and empty logs", () => {
    const engine = new SocketBridgeEngine();
    const state = engine.getState();

    expect(state.bridgeStatus).toBe("disconnected");
    expect(state.logs).toHaveLength(0);
    expect(state.tcpClient.connected).toBeFalse();
    expect(state.tcpServer.listening).toBeFalse();
    expect(state.udpServer.listening).toBeFalse();
    expect(state.metrics.activeConnections).toBe(0);
  });

  test("prepares TCP client connect and update state", () => {
    const engine = new SocketBridgeEngine();
    const command = engine.prepareConnectTcpClient("127.0.0.1", 8080);

    expect(command.type).toBe("tcp_client_connect");
    if (command.type === "tcp_client_connect") {
      expect(command.payload.host).toBe("127.0.0.1");
      expect(command.payload.port).toBe(8080);
    }

    const state = engine.getState();
    expect(state.tcpClient.host).toBe("127.0.0.1");
    expect(state.tcpClient.port).toBe(8080);
    expect(state.logs).toHaveLength(1);
    expect(state.logs[0].scope).toBe("127.0.0.1:8080");
  });

  test("handles protocol state transitions on bridge events", () => {
    const engine = new SocketBridgeEngine();

    // TCP client connected event
    engine.handleBridgeEvent({
      payload: {},
      type: "tcp_client_connected",
    });
    expect(engine.getState().tcpClient.connected).toBeTrue();

    // TCP server started event
    engine.handleBridgeEvent({
      payload: {},
      type: "tcp_server_started",
    });
    expect(engine.getState().tcpServer.listening).toBeTrue();

    // TCP client connected to server
    engine.handleBridgeEvent({
      payload: { address: "192.168.1.50:5000", clientId: "client-100" },
      type: "tcp_server_client_connected",
    });
    expect(engine.getState().tcpServer.clients).toHaveLength(1);
    expect(engine.getState().tcpServer.clients[0].id).toBe("client-100");

    // UDP server started
    engine.handleBridgeEvent({
      payload: {},
      type: "udp_server_started",
    });
    expect(engine.getState().udpServer.listening).toBeTrue();

    // Verify metrics calculation
    const metrics = engine.getMetrics();
    expect(metrics.activeConnections).toBe(3); // 1 TCP client + 1 TCP server client + 1 UDP listener
  });

  test("enforces MAX_LOG_ENTRIES ring-buffer cap (600)", () => {
    const engine = new SocketBridgeEngine();

    for (let index = 0; index < 650; index += 1) {
      engine.appendLog(
        toLogEntry("in", "udp", "listener", `Packet ${index}`, "text")
      );
    }

    const state = engine.getState();
    expect(state.logs).toHaveLength(MAX_LOG_ENTRIES);
    expect(state.logs[0].data).toBe("Packet 50");
    expect(state.logs[MAX_LOG_ENTRIES - 1].data).toBe("Packet 649");
  });

  test("triggers toast listeners on errors and connection events", () => {
    const engine = new SocketBridgeEngine();
    let toastTriggered = false;
    let toastType = "";

    engine.onToast((event) => {
      toastTriggered = true;
      toastType = event.type;
    });

    engine.prepareConnectTcpClient("127.0.0.1", 8080);
    engine.handleBridgeEvent({
      payload: { error: "Connection refused" },
      type: "tcp_client_error",
    });

    expect(toastTriggered).toBeTrue();
    expect(toastType).toBe("error");
  });

  test("resets connection states on bridge close", () => {
    const engine = new SocketBridgeEngine();

    engine.handleBridgeEvent({ payload: {}, type: "tcp_client_connected" });
    engine.handleBridgeEvent({ payload: {}, type: "tcp_server_started" });
    engine.handleBridgeEvent({ payload: {}, type: "udp_server_started" });

    engine.resetOnClose();
    const state = engine.getState();

    expect(state.bridgeStatus).toBe("disconnected");
    expect(state.tcpClient.connected).toBeFalse();
    expect(state.tcpServer.listening).toBeFalse();
    expect(state.udpServer.listening).toBeFalse();
  });
});
