import { useState } from "react";
import { mediaService } from "../../services/media";

const emptyForm = {
  title: "",
  description: "",
  platform: "youtube",
  placement: "list",
  embed_code: "",
  is_cover: false,
  sort_order: 0,
};

const MediaForm = ({ item, onSaved, onCancel }) => {
  const [form, setForm] = useState(
    item
      ? {
          title: item.title,
          description: item.description || "",
          platform: item.platform,
          placement: item.placement,
          embed_code: item.embed_code,
          is_cover: !!item.is_cover,
          sort_order: item.sort_order ?? 0,
        }
      : emptyForm,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      ...form,
      is_cover: form.is_cover ? 1 : 0,
      sort_order: Number(form.sort_order) || 0,
    };

    try {
      const response = item
        ? await mediaService.update(item.id, payload)
        : await mediaService.create(payload);

      if (response.success) {
        onSaved();
      } else if (response.errors) {
        setError(Object.values(response.errors).join(", "));
      } else {
        setError(response.message || "Failed to save");
      }
    } catch (err) {
      console.error("Media save error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="form"
      onSubmit={handleSubmit}
      aria-label={item ? "Edit media item" : "Create media item"}
    >
      <label htmlFor="media-title">Title</label>
      <input
        id="media-title"
        name="title"
        value={form.title}
        onChange={handleChange}
        required
      />

      <label htmlFor="media-description">Description</label>
      <textarea
        id="media-description"
        name="description"
        value={form.description}
        onChange={handleChange}
      ></textarea>

      <label htmlFor="media-platform">Platform</label>
      <select
        id="media-platform"
        name="platform"
        value={form.platform}
        onChange={handleChange}
      >
        <option value="youtube">YouTube</option>
        <option value="spotify">Spotify</option>
      </select>

      <label htmlFor="media-placement">Placement</label>
      <select
        id="media-placement"
        name="placement"
        value={form.placement}
        onChange={handleChange}
      >
        <option value="featured">Featured (Home)</option>
        <option value="stream">Stream</option>
        <option value="list">List</option>
      </select>

      <label htmlFor="media-embed">
        {form.platform === "spotify"
          ? "Spotify Path (e.g. artist/xxxx)"
          : "YouTube Video ID"}
      </label>
      <input
        id="media-embed"
        name="embed_code"
        value={form.embed_code}
        onChange={handleChange}
        required
      />

      <label htmlFor="media-sort">Sort Order</label>
      <input
        id="media-sort"
        name="sort_order"
        type="number"
        value={form.sort_order}
        onChange={handleChange}
      />

      <label className="form-checkbox">
        <input
          type="checkbox"
          name="is_cover"
          checked={form.is_cover}
          onChange={handleChange}
        />
        Cover / Highlight
      </label>

      <div className="button-group">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Saving..." : item ? "Update" : "Create"}
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

export default MediaForm;
