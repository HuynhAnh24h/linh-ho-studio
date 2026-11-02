export function broadcastSocketEvent(event: string, data: any): boolean {
  try {
    // When running with server.js, global.__io is attached to the Node process
    const io = (global as any).__io;
    if (io && typeof io.emit === "function") {
      io.emit(event, data);
      return true;
    }
  } catch (err) {
    console.warn(`[Socket.IO Server] Failed to broadcast event "${event}":`, err);
  }
  return false;
}
