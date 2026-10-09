import Guacamole from "guacamole-common-js";

export function createDesktopClipboard(
  client: Guacamole.Client,
  input: HTMLTextAreaElement,
  onText: (text: string) => void
) {
  let active = true;
  client.onclipboard = (stream, mimetype) => {
    if (mimetype !== "text/plain") {
      stream.sendAck(
        "Only text is supported",
        Guacamole.Status.Code.UNSUPPORTED
      );
      return;
    }
    const reader = new Guacamole.StringReader(stream);
    let text = "";
    reader.ontext = (chunk) => {
      text += chunk;
      stream.sendAck("OK", Guacamole.Status.Code.SUCCESS);
    };
    reader.onend = () => {
      if (active) {
        onText(text);
      }
    };
  };
  const allowPaste = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v") {
      event.stopImmediatePropagation();
    }
  };
  const paste = (event: ClipboardEvent) => {
    const text = event.clipboardData?.getData("text/plain");
    if (!active || text === undefined) {
      return;
    }
    event.preventDefault();
    const writer = new Guacamole.StringWriter(
      client.createClipboardStream("text/plain")
    );
    writer.sendText(text);
    writer.sendEnd();
    client.sendKeyEvent(1, 0xff_e3);
    client.sendKeyEvent(1, 0x76);
    client.sendKeyEvent(0, 0x76);
    client.sendKeyEvent(0, 0xff_e3);
  };
  input.addEventListener("keydown", allowPaste, true);
  input.addEventListener("paste", paste);
  return {
    dispose: () => {
      active = false;
      client.onclipboard = null;
      input.removeEventListener("keydown", allowPaste, true);
      input.removeEventListener("paste", paste);
    },
  };
}
