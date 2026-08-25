import axios from "./axios";

export const tourService = {
  listUpcoming: async () => {
    const res = await axios.get("/api/tour/list.php", {
      params: { upcoming: 1 },
    });
    return res.data;
  },
};
