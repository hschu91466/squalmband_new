import axios from "./axios";

export const mediaService = {
  list: async (params = {}) => {
    const res = await axios.get("/api/media/list.php", { params });
    return res.data;
  },
  create: async (data) => {
    const res = await axios.post("/api/media/create.php", data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await axios.post("/api/media/update.php", { id, ...data });
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.post("/api/media/delete.php", { id });
    return res.data;
  },
};
