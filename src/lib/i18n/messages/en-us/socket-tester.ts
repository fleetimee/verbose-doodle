export const socketTesterMessages = {
  tour: {
    startButton: "Start tour",
    shared: {
      headerTitle: "Socket test workspace",
      headerDescription:
        "Start here to connect the WebSocket bridge, check bridge status, and choose the socket workflow for this page.",
      metricsTitle: "Bridge metrics",
      metricsDescription:
        "Watch active connections, inbound packets, outbound packets, and bridge errors while you test socket traffic.",
      sendPanelTitle: "Compose payloads",
      sendPanelDescription:
        "Write a payload, choose ASCII, hex, or base64, then send it once the bridge and socket mode are ready.",
      trafficConsoleTitle: "Inspect traffic",
      trafficConsoleDescription:
        "Captured frames appear here with save, clear, and auto-scroll controls. Click a captured frame to inspect text and bytes.",
    },
    tcpClient: {
      statusTitle: "TCP client status",
      statusDescription:
        "This shows whether the TCP client is connected and which host and port are active.",
      connectionTitle: "Connect to a TCP endpoint",
      connectionDescription:
        "Enter the target host and port, connect through the bridge, then use the send panel to transmit payloads.",
    },
    tcpServer: {
      listenerTitle: "Start the TCP server",
      listenerDescription:
        "Choose a listen port and start or stop the TCP server through the backend bridge.",
      statusTitle: "Server status",
      statusDescription:
        "Use this status line to confirm whether the TCP listener is stopped or accepting client connections.",
      clientsTitle: "Target connected clients",
      clientsDescription:
        "Connected clients appear here. Select clients to target specific connections, or leave all unselected to broadcast.",
    },
    udp: {
      targetTitle: "UDP target",
      targetDescription:
        "Set the destination host and port for stateless UDP datagrams before sending payloads.",
      listenerTitle: "Optional UDP listener",
      listenerDescription:
        "Start the listener when you want inbound datagrams captured in the traffic console.",
      statusTitle: "UDP listener status",
      statusDescription:
        "This line confirms whether the UDP listener is currently off or listening on a port.",
    },
  },
} as const;
