import { useState } from "react";
import { tourService } from "../../services/tour";

const emptyForm = {
  venue: "",
  location: "",
  tour_date: "",
};

const TourForm = ({ post, onSaved, onCancel }) => {
  const [form, setForm] = useState(
    post
      ? {
          venue: post.venue,
          location: post.location || "",
          tour_date: post.tour_date ? post.tour_date.slice(0, 10) : "",
        }
      : emptyForm,
  );

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

    const payload = {
      venue: form.venue,
      location: form.location,
      tour_date: form.tour_date,
    };

    try {
      const response = post
        ? await tourService.update(post.id, payload)
        : await tourService.create(payload);

      if (response.success) {
        onSaved();
      } else if (response.errors) {
        setError(Object.values(response.errors).join(", "));
      } else {
        setError(response.message || "Failed to save post");
      }
    } catch (err) {
      console.error("Tour save error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="form"
      onSubmit={handleSubmit}
      aria-label={post ? "Edit tour post" : "Create tour post"}
    >
      <label htmlFor="venue">Venue</label>
      <input
        id="venue"
        name="venue"
        value={form.venue}
        onChange={handleChange}
        required
      />

      <label htmlFor="tour-date">Show Date</label>
      <input
        id="tour-date"
        name="tour_date"
        type="date"
        value={form.tour_date}
        onChange={handleChange}
        required
      />

      <label htmlFor="location">Location</label>
      <textarea
        id="location"
        name="location"
        value={form.location}
        onChange={handleChange}
      ></textarea>

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

export default TourForm;
