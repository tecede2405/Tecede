import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_API_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

export default socket;
