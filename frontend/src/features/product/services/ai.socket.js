import { io } from "socket.io-client";

let socket = null;

// Absolute backend origin in production (Render), same-origin in dev via vite proxy.
// Falls back to VITE_API_URL so only one var is strictly required.
const SOCKET_URL =
  (import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || "").replace(/\/+$/, "") ||
  undefined;

export const getAiSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, { withCredentials: true, reconnection: true, timeout: 10000 });
  }
  if (!socket.connected && !socket.active) socket.connect();
  return socket;
};

export const disconnectAiSocket = () => {
  socket?.disconnect();
};
