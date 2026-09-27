import { io } from "socket.io-client";

let socket = null;

export const getAiSocket = () => {
  if (!socket) {
    socket = io({ withCredentials: true, reconnection: true, timeout: 10000 });
  }
  if (!socket.connected && !socket.active) socket.connect();
  return socket;
};

export const disconnectAiSocket = () => {
  socket?.disconnect();
};
