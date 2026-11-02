"use client";

import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (typeof window === "undefined") {
    // Return a dummy object during SSR
    return {} as Socket;
  }

  if (!socketInstance) {
    const origin = window.location.origin;

    socketInstance = io(origin, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketInstance.on("connect", () => {
      console.log(`[Socket.IO Client] Connected to server: ${socketInstance?.id}`);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log(`[Socket.IO Client] Disconnected: ${reason}`);
    });

    socketInstance.on("connect_error", (error) => {
      console.warn(`[Socket.IO Client] Connection error:`, error.message);
    });
  }

  return socketInstance;
}
