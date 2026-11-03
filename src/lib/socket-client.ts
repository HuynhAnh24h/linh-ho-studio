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
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || origin;
    const isVercelDomain = origin.includes("vercel.app");

    socketInstance = io(socketUrl, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnectionAttempts: isVercelDomain && !process.env.NEXT_PUBLIC_SOCKET_URL ? 1 : 5,
      reconnectionDelay: 2000,
      timeout: 4000,
    });

    socketInstance.on("connect", () => {
      console.log(`[Socket.IO Client] Connected to server: ${socketInstance?.id}`);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log(`[Socket.IO Client] Disconnected: ${reason}`);
    });

    socketInstance.on("connect_error", (error) => {
      // In serverless environments like Vercel without standalone socket server, stop polling to avoid 404 console spam
      if (isVercelDomain && !process.env.NEXT_PUBLIC_SOCKET_URL) {
        socketInstance?.disconnect();
      } else {
        console.warn(`[Socket.IO Client] Connection notice:`, error.message);
      }
    });
  }

  return socketInstance;
}
