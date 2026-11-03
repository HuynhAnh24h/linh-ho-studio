const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

process.on("unhandledRejection", (reason, promise) => {
  console.warn("[Server] Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[Server] Uncaught Exception thrown:", err);
});

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

    // Send initial status and connection ack
    socket.emit("connected", {
      status: "connected",
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });

    // Broadcast client count
    io.emit("clients_count", io.engine.clientsCount);

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      io.emit("clients_count", io.engine.clientsCount);
    });

    // Test ping from admin or client
    socket.on("ping_server", (data) => {
      socket.emit("pong_server", {
        time: new Date().toISOString(),
        echo: data,
      });
    });

    // Admin updates order status (real-time broadcast to all clients)
    socket.on("order_updated", (data) => {
      io.emit("order_updated", data);
    });

    // Admin or client sends a live notification
    socket.on("broadcast_notification", (data) => {
      io.emit("notification", data);
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> [LH Music Studio] Ready on http://localhost:${port}`);
    console.log(`> [LH Music Studio] Network: http://192.168.1.48:${port}`);
    console.log(`> [Socket.IO] Real-time engine active on ws://0.0.0.0:${port}`);
  });
}).catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
