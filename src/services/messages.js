import axios from "./axios";

export const messagesService = {
  list: async () => {
    const res = await axios.get("/api/contact/list.php");
    return res.data;
  },
  markRead: async (messageId) => {
    const res = await axios.post("/api/contact/mark-read.php", {
      message_id: messageId,
    });
    return res.data;
  },
  markSpam: async (messageId) => {
    const res = await axios.post("/api/contact/mark-spam.php", {
      message_id: messageId,
    });
    return res.data;
  },
  delete: async (messageId) => {
    const res = await axios.post("/api/contact/delete.php", {
      message_id: messageId,
    });
    return res.data;
  },
};
