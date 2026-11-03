const { createServer } = require("http");
const { parse } = require("url");
const net = require("net");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const defaultPort = parseInt(process.env.PORT || "3000", 10);

process.on("unhandledRejection", (reason, promise) => {
  console.warn("[Server] Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[Server] Uncaught Exception thrown:", err);
});

function isPortTaken(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(400);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      resolve(false);
    });
    socket.connect(port, "127.0.0.1");
  });
}

async function findAvailablePort(desiredPort) {
  let p = desiredPort;
  while (await isPortTaken(p)) {
    console.warn(`[Server] Cổng ${p} đã có dịch vụ khác đang chạy, tự động chuyển sang cổng ${p + 1}...`);
    p++;
  }
  return p;
}

findAvailablePort(defaultPort).then((activePort) => {
  const app = next({ dev, hostname, port: activePort });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error occurred handling", req.url, err);
        res.statusCode = 500;
        res.end("internal server error");
      }
    });

    const io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    });

    // Attach to global so Route Handlers in Next.js can emit events
    global.__io = io;

    io.on("connection", (socket) => {
      console.log(`[Socket.IO] Client connected: ${socket.id}`);

      socket.emit("connected", {
        status: "connected",
        socketId: socket.id,
        timestamp: new Date().toISOString(),
      });

      io.emit("clients_count", io.engine.clientsCount);

      socket.on("disconnect", () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
        io.emit("clients_count", io.engine.clientsCount);
      });

      socket.on("ping_server", (data) => {
        socket.emit("pong_server", {
          time: new Date().toISOString(),
          echo: data,
        });
      });

      socket.on("order_updated", (data) => {
        io.emit("order_updated", data);
      });

      socket.on("broadcast_notification", (data) => {
        io.emit("notification", data);
      });
    });

    httpServer.listen(activePort, hostname, () => {
      console.log(`> [LH Music Studio] Ready on http://localhost:${activePort}`);
      console.log(`> [LH Music Studio] Network: http://192.168.1.48:${activePort}`);
      console.log(`> [Socket.IO] Real-time engine active on ws://0.0.0.0:${activePort}`);
    });
  }).catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
});
