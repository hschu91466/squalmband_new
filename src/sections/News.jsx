import { useEffect, useState } from "react";
import { newsService } from "../services/news";
import NewsItem from "../components/features/NewsItem";

const News = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const response = await newsService.list();

        if (response.success) {
          setPosts(response.data);
        }
      } catch (err) {
        console.error("Failed to load news:", err);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  return (
    <section id="news">
      <h2 className="section-heading">News</h2>

      {loading && <p>Loading...</p>}
      {!loading && posts.length === 0 && (
        <p>No news yet — check back soon.</p>
      )}

      {!loading && posts.length > 0 && (
        <div className="news-feed">
          {posts.map((post) => (
            <NewsItem key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
};

export default News;
