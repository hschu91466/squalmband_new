import axios from "./axios";

export const approveComment = (commentId) => {
  return axios.post("/api/comments/approve.php", { comment_id: commentId });
};

export const getAdminComments = () => {
  return axios.get("/api/comments/admin-list.php?status=pending");
};
