// services/comments.js
import axios from "./axios";

export const commentsService = {
  list: async (contentType, contentId) => {
    const res = await axios.get("/api/comments/list.php", {
      params: { content_type: contentType, content_id: contentId },
    });
    return res.data;
  },

  create: async (contentType, contentId, { name, email, body }) => {
    const res = await axios.post("/api/comments/create.php", {
      content_type: contentType,
      content_id: contentId,
      name,
      email,
      body,
    });
    return res.data;
  },
};

export const approveComment = (commentId) => {
  return axios.post("/api/comments/approve.php", { comment_id: commentId });
};

export const getAdminComments = () => {
  return axios.get("/api/comments/admin-list.php?status=pending");
};
