import { useState } from "react";
import { contactService } from "../../services/contact";

const ContactForm = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    subject: "",
    message: "",
    newsletter_signup: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setSuccess("");
    setLoading(true);

    try {
      const response = await contactService.send(form);

      if (response.success) {
        setSuccess(response.message || "Message sent!");
        setForm({
          first_name: "",
          last_name: "",
          email: "",
          subject: "",
          message: "",
          newsletter_signup: false,
        });
      } else if (response.errors) {
        setError(Object.values(response.errors).join(", "));
      } else {
        setError(response.message || "Failed to send message");
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} aria-label="Contact form">
      <label htmlFor="contact-first-name">First Name</label>
      <input
        id="contact-first-name"
        name="first_name"
        type="text"
        value={form.first_name}
        onChange={handleChange}
        required
        aria-required="true"
      />

      <label htmlFor="contact-last-name">Last Name</label>
      <input
        id="contact-last-name"
        name="last_name"
        type="text"
        value={form.last_name}
        onChange={handleChange}
        required
        aria-required="true"
      />

      <label htmlFor="contact-email">Email</label>
      <input
        id="contact-email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        required
        aria-required="true"
      />

      <label htmlFor="contact-subject">Subject</label>
      <input
        id="contact-subject"
        name="subject"
        type="text"
        value={form.subject}
        onChange={handleChange}
        required
        aria-required="true"
      />

      <label htmlFor="contact-message">Message</label>
      <textarea
        id="contact-message"
        name="message"
        value={form.message}
        onChange={handleChange}
        required
        aria-required="true"
      ></textarea>

      <label className="form-checkbox">
        <input
          type="checkbox"
          name="newsletter_signup"
          checked={form.newsletter_signup}
          onChange={handleChange}
        />
        Sign up for the newsletter
      </label>

      <button
        type="submit"
        className="message-button"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? "Sending..." : "Send Message"}
      </button>

      {success && (
        <p
          className="auth-message auth-message--success"
          role="status"
          aria-live="polite"
        >
          {success}
        </p>
      )}
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

export default ContactForm;
