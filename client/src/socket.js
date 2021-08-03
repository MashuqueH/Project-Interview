import io from "socket.io-client";
import store from "./store";
import {
  setNewMessage,
  removeOfflineUser,
  addOnlineUser,
  markAsRead,
} from "./store/conversations";

const socket = io(window.location.origin, {
  auth: {
    token: localStorage.getItem("messenger-token"),
  },
});

socket.on("connect_error", async (err) => {
  console.log(err.message === "Auth Error");
  if (err.message === "Auth Error") {
    // Delete messsenger token
    localStorage.removeItem("messenger-token");
  }
  console.log(err.message);
});

socket.on("connect", () => {
  console.log("connected to server");
});

socket.on("add-online-user", (id) => {
  store.dispatch(addOnlineUser(id));
});

socket.on("remove-offline-user", (id) => {
  store.dispatch(removeOfflineUser(id));
});
socket.on("new-message", (data) => {
  store.dispatch(setNewMessage(data.message, data.sender));
});

socket.on("read-messages", (data) => {
  store.dispatch(markAsRead(data.conversationId, data.messageIds));
});

export default socket;
