const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

const clients = new Set();

function broadcast(data) {
  const msg = JSON.stringify(data);
  clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) {
      c.send(msg);
    }
  });
}

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("player connected");

  ws.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch {
      return;
    }

    // cursor sync
    if (data.type === "cursor") {
      broadcast(data);
    }

    // sandbox actions sync
    if (data.type === "action") {
      broadcast(data);
    }

    // global pause (admin only)
    if (data.type === "pauseRequest") {
      if (data.user !== "admin@squishy.com") return;

      broadcast({
        type: "pause",
        value: data.value
      });
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("player left");
  });
});

console.log("TalkFlow server running");
