import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_API_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;
