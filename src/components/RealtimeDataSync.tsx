"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket-client";

export function RealtimeDataSync() {
  const router = useRouter();

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !socket.on) return;

    const handleDataUpdated = () => {
      // Refresh current Next.js route data from server
      router.refresh();
    };

    socket.on("data_updated", handleDataUpdated);

    return () => {
      socket.off("data_updated", handleDataUpdated);
    };
  }, [router]);

  return null;
}
