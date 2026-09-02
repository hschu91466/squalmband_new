import { useEffect, useState } from "react";
import { contentService } from "../../services/content";

const emptyForm = {
  title: "",
  body: "",
  image_alt: "",
};

const ContentForm = ({ sectionKey }) => {
  const [form, setForm] = useState(emptyForm);
  const [currentImagePath, setCurrentImagePath] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hasImage = sectionKey === "about";

  useEffect(() => {
    let ignore = false;

    async function loadSection() {
      setLoading(true);
      setError("");
      setSuccess("");
      setFile(null);

      try {
        const response = await contentService.list();
        if (!ignore && response.success) {
          const section = response.data.find(
            (s) => s.section_key === sectionKey,
          );
          setForm({
            title: section?.title || "",
            body: section?.body || "",
            image_alt: section?.image_alt || "",
          });
          setCurrentImagePath(section?.image_path || null);
        }
      } catch (err) {
        console.error("Failed to load section:", err);
        if (!ignore) setError("Failed to load section content");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadSection();

    return () => {
      ignore = true;
    };
  }, [sectionKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("body", form.body);

    if (hasImage) {
      formData.append("image_alt", form.image_alt);
      if (file) {
        formData.append("image", file);
      }
    }

    try {
      const response = await contentService.update(sectionKey, formData);

      if (response.success) {
        setSuccess(response.message || "Section updated");
        setFile(null);
      } else if (response.errors) {
        setError(Object.values(response.errors).join(", "));
      } else {
        setError(response.message || "Failed to save section");
      }
    } catch (err) {
      console.error("Content save error:", err);
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <form
      className="form"
      onSubmit={handleSubmit}
      aria-label={`Edit ${sectionKey} section`}
    >
      <label htmlFor="content-title">Title</label>
      <input
        id="content-title"
        name="title"
        value={form.title}
        onChange={handleChange}
        maxLength={255}
      />

      <label htmlFor="content-body">Text</label>
      <textarea
        id="content-body"
        name="body"
        value={form.body}
        onChange={handleChange}
        maxLength={2000}
        rows={8}
      ></textarea>
      <p className="field-hint">
        Separate paragraphs with a blank line. {form.body.length}/2000
      </p>

      {hasImage && (
        <>
          <label htmlFor="content-image">
            Image {currentImagePath ? "(leave blank to keep current)" : ""}
          </label>
          <input
            id="content-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <label htmlFor="content-image-alt">
            Image description (alt text)
          </label>
          <input
            id="content-image-alt"
            name="image_alt"
            value={form.image_alt}
            onChange={handleChange}
            maxLength={255}
            placeholder="Describe what's in the image, for screen readers"
          />
        </>
      )}

      <div className="button-group">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
          aria-busy={saving}
        >
          {saving ? "Saving..." : "Save Section"}
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

      {success && (
        <p
          className="auth-message auth-message--success"
          role="status"
          aria-live="polite"
        >
          {success}
        </p>
      )}
    </form>
  );
};

export default ContentForm;
