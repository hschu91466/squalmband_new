import NewsImageMedia from "./NewsImageMedia";
import NewsVideoEmbed from "./NewsVideoEmbed";

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const NewsItem = ({ post }) => {
  const isVideo = post.media_type === "video";
  const layoutClass =
    post.section === "right" ? "news-item--right" : "news-item--left";

  return (
    <article className={`news-item card ${layoutClass}`}>
      <div className="news-item-media">
        {isVideo ? (
          <NewsVideoEmbed embedCode={post.embed_code} title={post.title} />
        ) : (
          <NewsImageMedia src={post.image_path} alt={post.title} />
        )}
      </div>
      <div className="news-item-content">
        <h3 className="news-item-title">{post.title}</h3>
        <p className="news-item-date">{formatDate(post.news_date)}</p>
        {post.article && <p className="news-item-article">{post.article}</p>}
      </div>
    </article>
  );
};

export default NewsItem;
