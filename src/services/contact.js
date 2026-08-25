import axios from "./axios";

export const contactService = {
  send: async (data) => {
    const res = await axios.post("/api/contact/send.php", data);
    return res.data;
  },
};
