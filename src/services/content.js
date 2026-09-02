import axios from "./axios";

export const contentService = {
  list: async () => {
    const res = await axios.get("/api/content/list.php");
    return res.data;
  },
  update: async (sectionKey, formData) => {
    // formData is a FormData instance built by the caller (text fields + optional image file)
    formData.append("section_key", sectionKey);
    const res = await axios.post("/api/content/update.php", formData);
    return res.data;
  },
};
