import axios from "./axios";

export const login = async (email, password) => {
  return axios.post("/api/auth/login.php", { email, password });
};

export const logout = async () => {
  return axios.post("/api/auth/logout.php");
};

export const getSession = async () => {
  const res = await axios.get("/api/auth/me.php");
  return res.data;
};
