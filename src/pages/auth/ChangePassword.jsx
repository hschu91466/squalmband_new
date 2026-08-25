import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const ChangePassword = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!form.currentPassword) {
      setError("Current password is required");
      return false;
    }
    if (!form.newPassword) {
      setError("New password is required");
      return false;
    }
    if (form.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (!form.confirmNewPassword) {
      setError("Please confirm your new password");
      return false;
    }
    if (form.newPassword !== form.confirmNewPassword) {
      setError("New passwords do not match");
      return false;
    }
    if (form.currentPassword === form.newPassword) {
      setError("New password must be different from current password");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/change-password.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setForm({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        setMessage("Password changed successfully!");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else if (data.errors) {
        setError(data.errors.join(", "));
      } else {
        setError(data.message || "Failed to change password");
      }
    } catch (err) {
      console.error("Change password error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1>Change Password</h1>

        <form
          className="form"
          onSubmit={handleSubmit}
          aria-label="Change password form"
        >
          <label htmlFor="current-password">Current Password</label>
          <div className="password-input-wrapper">
            <input
              id="current-password"
              type={showCurrentPassword ? "text" : "password"}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              required
              aria-required="true"
              autoComplete="current-password"
              aria-describedby={error ? "change-password-error" : undefined}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              aria-label={
                showCurrentPassword ? "Hide password" : "Show password"
              }
              title={showCurrentPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showCurrentPassword ? "👁️" : "🙈"}
            </button>
          </div>

          <label htmlFor="new-password">New Password</label>
          <div className="password-input-wrapper">
            <input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              required
              aria-required="true"
              autoComplete="new-password"
              aria-describedby={error ? "change-password-error" : undefined}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowNewPassword(!showNewPassword)}
              aria-label={showNewPassword ? "Hide password" : "Show password"}
              title={showNewPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showNewPassword ? "👁️" : "🙈"}
            </button>
          </div>

          <label htmlFor="confirm-new-password">Confirm New Password</label>
          <div className="password-input-wrapper">
            <input
              id="confirm-new-password"
              type={showConfirmNewPassword ? "text" : "password"}
              name="confirmNewPassword"
              value={form.confirmNewPassword}
              onChange={handleChange}
              required
              aria-required="true"
              autoComplete="new-password"
              aria-describedby={error ? "change-password-error" : undefined}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              aria-label={
                showConfirmNewPassword ? "Hide password" : "Show password"
              }
              title={showConfirmNewPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showConfirmNewPassword ? "👁️" : "🙈"}
            </button>
          </div>

          <button
            className="message-button"
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </form>

        {message && (
          <p
            className="auth-message auth-message--success"
            role="status"
            aria-live="polite"
          >
            {message}
          </p>
        )}
        {error && (
          <p
            id="change-password-error"
            className="auth-message auth-message--error"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;
