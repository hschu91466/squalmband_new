import axios from "./axios";

export const tourService = {
  list: async (params = {}) => {
    const res = await axios.get("/api/tour/list.php", { params });
    return res.data;
  },
  create: async (data) => {
    const res = await axios.post("/api/tour/create.php", data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await axios.post("/api/tour/update.php", { id, ...data });
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.post("/api/tour/delete.php", { id });
    return res.data;
  },
};
