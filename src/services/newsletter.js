import axios from "./axios";

export const newsletterService = {
  send: async (subject, body) => {
    const res = await axios.post("/api/newsletter/send.php", {
      subject,
      body,
    });
    return res.data;
  },
  history: async () => {
    const res = await axios.get("/api/newsletter/history.php");
    return res.data;
  },
  subscribers: async () => {
    const res = await axios.get("/api/newsletter/subscribers.php");
    return res.data;
  },
  removeSubscriber: async (email) => {
    const res = await axios.post("/api/newsletter/remove-subscriber.php", {
      email,
    });
    return res.data;
  },
};
