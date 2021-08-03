import axios from "axios";
import socket from "../../socket";
import {
  gotConversations,
  addConversation,
  setNewMessage,
  setSearchedUsers,
  markAsRead,
} from "../conversations";
import { gotUser, setFetchingStatus } from "../user";

axios.interceptors.request.use(async function (config) {
  const token = await localStorage.getItem("messenger-token");
  config.headers["x-access-token"] = token;

  return config;
});

// USER THUNK CREATORS

export const fetchUser = () => async (dispatch) => {
  dispatch(setFetchingStatus(true));
  try {
    const { data } = await axios.get("/auth/user");
    dispatch(gotUser(data));
    if (data.id) {
      socket.emit("go-online", data.id);
    }
  } catch (error) {
    console.error(error);
  } finally {
    dispatch(setFetchingStatus(false));
  }
};

export const register = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/register", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/login", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const logout = (id) => async (dispatch) => {
  try {
    await axios.delete("/auth/logout");
    await localStorage.removeItem("messenger-token");
    dispatch(gotUser({}));
    socket.emit("logout", id);
  } catch (error) {
    console.error(error);
  }
};

// CONVERSATIONS THUNK CREATORS

// Joins a room for each conversation
const joinConversationRooms = (conversationIds) => {
  socket.emit("join-conversation-rooms", {
    conversationIds,
  });
};

export const fetchConversations = () => async (dispatch) => {
  try {
    const { data } = await axios.get("/api/conversations");
    dispatch(gotConversations(data));
    joinConversationRooms(data.map((convo) => convo.id.toString()));
  } catch (error) {
    console.error(error);
  }
};

const saveMessage = async (body) => {
  const { data } = await axios.post("/api/messages", body);
  return data;
};

const sendMessage = (data, body) => {
  socket.emit("new-message", {
    conversationId: body.conversationId?.toString(),
    message: data.message,
    recipientId: body.recipientId,
    sender: data.sender,
  });
};

// message format to send: {recipientId, text, conversationId}
// conversationId will be set to null if its a brand new conversation
export const postMessage = (body) => async (dispatch) => {
  try {
    const data = await saveMessage(body);
    if (!body.conversationId) {
      dispatch(addConversation(body.recipientId, data.message));
      // Join new conversation room
      console.log(data.message.conversationId);
      joinConversationRooms([data.message.conversationId.toString()]);
    } else {
      dispatch(setNewMessage(data.message));
    }
    sendMessage(data, body);
  } catch (error) {
    console.error(error);
  }
};

const markConversationAsRead = async (recipientId, messageIds) => {
  await axios.patch("/api/messages/read", {
    recipientId,
    messageIds,
  });
};

const sendReadMessages = (conversationId, messageIds) => {
  socket.emit("read-messages", {
    conversationId,
    messageIds,
  });
};

// Read messages in a given conversation
export const readMessages = (conversation) => async (dispatch, getState) => {
  try {
    let userId = getState().user.id;
    let recipientId = conversation.otherUser.id;

    let messageIds = [];
    for (let i = conversation.messages.length - 1; i >= 0; i--) {
      let message = conversation.messages[i];
      if (
        (message.read && message.senderId !== userId) ||
        message.senderId === userId
      ) {
        break;
      }
      if (!message.read && message.senderId !== userId) {
        messageIds.unshift(message.id);
      }
    }

    if (messageIds.length > 0) {
      await markConversationAsRead(recipientId, messageIds);
      dispatch(markAsRead(conversation.id, messageIds));
      sendReadMessages(conversation.id, messageIds);
    }
  } catch (error) {
    console.error(error);
  }
};

export const searchUsers = (searchTerm) => async (dispatch) => {
  try {
    const { data } = await axios.get(`/api/users/${searchTerm}`);
    dispatch(setSearchedUsers(data));
  } catch (error) {
    console.error(error);
  }
};
