import { useState } from "react";
import { newsService } from "../../services/news";

const emptyForm = {
  title: "",
  article: "",
  news_date: "",
  media_type: "image",
  embed_code: "",
  section: "left",
};

const NewsForm = ({ post, onSaved, onCancel }) => {
  const [form, setForm] = useState(
    post
      ? {
          title: post.title,
          article: post.article || "",
          news_date: post.news_date,
          media_type: post.media_type,
          embed_code: post.embed_code || "",
          section: post.section,
        }
      : emptyForm,
  );
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("article", form.article);
    formData.append("news_date", form.news_date);
    formData.append("media_type", form.media_type);
    formData.append("section", form.section);

    if (form.media_type === "video") {
      formData.append("embed_code", form.embed_code);
    }

    if (file) {
      formData.append("image", file);
    }

    if (post) {
      formData.append("id", post.id);
    }

    try {
      const response = post
        ? await newsService.update(formData)
        : await newsService.create(formData);

      if (response.success) {
        onSaved();
      } else if (response.errors) {
        setError(Object.values(response.errors).join(", "));
      } else {
        setError(response.message || "Failed to save post");
      }
    } catch (err) {
      console.error("News save error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="form"
      onSubmit={handleSubmit}
      aria-label={post ? "Edit news post" : "Create news post"}
    >
      <label htmlFor="news-title">Title</label>
      <input
        id="news-title"
        name="title"
        value={form.title}
        onChange={handleChange}
        required
      />

      <label htmlFor="news-date">Date</label>
      <input
        id="news-date"
        name="news_date"
        type="date"
        value={form.news_date}
        onChange={handleChange}
        required
      />

      <label htmlFor="news-article">Article</label>
      <textarea
        id="news-article"
        name="article"
        value={form.article}
        onChange={handleChange}
      ></textarea>

      <label htmlFor="news-media-type">Media Type</label>
      <select
        id="news-media-type"
        name="media_type"
        value={form.media_type}
        onChange={handleChange}
      >
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>

      {form.media_type === "image" ? (
        <>
          <label htmlFor="news-image">
            Image {post ? "(leave blank to keep current)" : ""}
          </label>
          <input
            id="news-image"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </>
      ) : (
        <>
          <label htmlFor="news-embed">YouTube Video ID</label>
          <input
            id="news-embed"
            name="embed_code"
            value={form.embed_code}
            onChange={handleChange}
            placeholder="e.g. dQw4w9WgXcQ"
          />
        </>
      )}

      <label htmlFor="news-section">Layout</label>
      <select
        id="news-section"
        name="section"
        value={form.section}
        onChange={handleChange}
      >
        <option value="left">Left</option>
        <option value="right">Right</option>
      </select>

      <div className="button-group">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Saving..." : post ? "Update Post" : "Create Post"}
        </button>
        <button
          type="button"
          className="btn"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>

      {error && (
        <p
          className="auth-message auth-message--error"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      )}
    </form>
  );
};

export default NewsForm;
