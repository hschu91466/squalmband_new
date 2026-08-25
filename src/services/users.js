import axios from "./axios";

export const usersService = {
  list: async (status) => {
    const res = await axios.get("/api/users/admin-list.php", {
      params: { status },
    });
    return res.data;
  },
  approve: async (userId) => {
    const res = await axios.post("/api/users/approve.php", {
      user_id: userId,
    });
    return res.data;
  },
  delete: async (userId) => {
    const res = await axios.post("/api/users/delete.php", {
      user_id: userId,
    });
    return res.data;
  },
};
