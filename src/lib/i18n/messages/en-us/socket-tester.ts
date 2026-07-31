export const socketTesterMessages = {
  activeMetric: "Active",
  appendAfterPayloadLabel: "Append after payload",
  autoScrollLabel: "Auto-scroll",
  base64FormatLabel: "Base64",
  bridgeConnectFirstError: "Connect the WebSocket bridge first",
  bridgeConnectionFailed: "Socket bridge connection failed",
  bytesLabel: "Bytes",
  clearButton: "Clear",
  connectButton: "Connect",
  connectedStatus: "Connected",
  copyHexLabel: "Copy hex",
  copyMetadataLabel: "Copy metadata",
  copyPayloadLabel: "Copy payload",
  copyRenderedDataLabel: "Copy rendered data",
  copyRenderedJsonLabel: "Copy rendered JSON",
  dataTitle: "Data",
  disconnectButton: "Disconnect",
  disconnectedStatus: "Disconnected",
  encodeAsLabel: "Encode as",
  errorsMetric: "Errors",
  formatLabel: "Format",
  frameContextDescription:
    "Byte-level inspection and bridge metadata for the selected frame.",
  frameContextTitle: "Frame context",
  frameInspectorDescription:
    "Inspect the selected socket frame as text, bytes, and bridge metadata.",
  frameInspectorTitle: "Frame inspector",
  framesMetric: "Frames",
  hexDumpCopied: "Hex dump copied",
  hexDumpDescription: "Offset, hexadecimal bytes, and ASCII preview.",
  hexDumpTitle: "Hex dump",
  hexFormatLabel: "Hex",
  hostLabel: "Host",
  hostRequiredDescription: "Enter a hostname or IP address.",
  inboundMetric: "Inbound",
  latestMetric: "Latest",
  lineEndingDescription:
    "Appends CRLF, LF, or nothing after the payload. CRLF is common for text protocols; None sends the payload as-is.",
  lineEndingHelpAriaLabel: "What line ending does",
  lineEndingLabel: "Line ending",
  listenPortLabel: "Listen port",
  metadataCopied: "Metadata copied",
  metadataDescription: "Bridge context attached to this log row.",
  metadataEmpty: "No metadata captured for this frame.",
  metadataTitle: "Metadata",
  noActiveConnection: "No active connection",
  noFramesCapturedDescription:
    "Connect the bridge, start a socket, then send traffic.",
  noFramesCapturedTitle: "No frames captured",
  noneDelimiterLabel: "None",
  outboundMetric: "Outbound",
  payloadCopied: "Payload copied",
  payloadFormatLabel: "Payload format",
  payloadPlaceholder: "Type a payload...",
  portLabel: "Port",
  portRangeDescription: "Use port 1-65535.",
  protocolLabel: "Protocol",
  rawPayloadDescription: "Exact text payload captured from the selected frame.",
  rawPayloadTitle: "Raw payload",
  renderedDataCopied: "Rendered data copied",
  renderedDataDescription:
    "Payload is not valid JSON, so this view shows the reply exactly as received.",
  renderedDataTitle: "Rendered data",
  renderedJsonCopied: "Rendered JSON copied",
  renderedJsonDescription: "Parsed JSON view from the frame payload.",
  renderedReplyDescription:
    "Rendered reply first, raw payload underneath for byte-for-byte comparison.",
  saveButton: "Save",
  scopeLabel: "Scope",
  sendButton: "Send",
  sendPanelDescription: "Compose payloads as ASCII, hex, or base64.",
  sendPanelTitle: "Send panel",
  startUdpListenerSrLabel: "Start UDP listener",
  stopUdpListenerSrLabel: "Stop UDP listener",
  targetHostLabel: "Target host",
  targetPortLabel: "Target port",
  tcpClientStatusLabel: "TCP client status",
  tcpConnected: "TCP connected",
  tcpConnectedDescription: "Connected to {host}:{port}",
  tcpConnectionFailed: "TCP connection failed",
  tcpConnectionRefusedDescription:
    "{host}:{port} refused the connection. {message}",
  tcpConnectionUnableDescription: "Could not connect to {host}:{port}",
  timestampLabel: "Timestamp",
  tour: {
    shared: {
      headerDescription:
        "Start here to connect the WebSocket bridge, check bridge status, and choose the socket workflow for this page.",
      headerTitle: "Socket test workspace",
      metricsDescription:
        "Watch active connections, inbound packets, outbound packets, and bridge errors while you test socket traffic.",
      metricsTitle: "Bridge metrics",
      sendPanelDescription:
        "Write a payload, choose ASCII, hex, or base64, then send it once the bridge and socket mode are ready.",
      sendPanelTitle: "Compose payloads",
      trafficConsoleDescription:
        "Captured frames appear here with save, clear, and auto-scroll controls. Click a captured frame to inspect text and bytes.",
      trafficConsoleTitle: "Inspect traffic",
    },
    startButton: "Start tour",
    tcpClient: {
      connectionDescription:
        "Enter the target host and port, connect through the bridge, then use the send panel to transmit payloads.",
      connectionTitle: "Connect to a TCP endpoint",
      statusDescription:
        "This shows whether the TCP client is connected and which host and port are active.",
      statusTitle: "TCP client status",
    },
    tcpServer: {
      clientsDescription:
        "Connected clients appear here. Select clients to target specific connections, or leave all unselected to broadcast.",
      clientsTitle: "Target connected clients",
      listenerDescription:
        "Choose a listen port and start or stop the TCP server through the backend bridge.",
      listenerTitle: "Start the TCP server",
      statusDescription:
        "Use this status line to confirm whether the TCP listener is stopped or accepting client connections.",
      statusTitle: "Server status",
    },
    udp: {
      listenerDescription:
        "Start the listener when you want inbound datagrams captured in the traffic console.",
      listenerTitle: "Optional UDP listener",
      statusDescription:
        "This line confirms whether the UDP listener is currently off or listening on a port.",
      statusTitle: "UDP listener status",
      targetDescription:
        "Set the destination host and port for stateless UDP datagrams before sending payloads.",
      targetTitle: "UDP target",
    },
  },
  trafficConsoleDescription:
    "Inspect socket frames, payloads, and bridge metadata.",
  trafficConsoleTitle: "Traffic console",
  udpListenerOffStatus: "UDP LISTENER OFF",
  udpListeningStatus: "UDP LISTENING :{port}",
  unableToCopy: "Unable to copy",
} as const;
