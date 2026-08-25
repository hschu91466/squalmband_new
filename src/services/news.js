import axios from "./axios";

export const newsService = {
  list: async () => {
    const res = await axios.get("/api/news/list.php");
    return res.data;
  },
  create: async (formData) => {
    const res = await axios.post("/api/news/create.php", formData);
    return res.data;
  },
  update: async (formData) => {
    const res = await axios.post("/api/news/update.php", formData);
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.post("/api/news/delete.php", { id });
    return res.data;
  },
};
