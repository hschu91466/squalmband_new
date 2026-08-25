import { useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/auth/login.php`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.user) {
        setMessage("Login successful");
        setUser(data.data.user);
        navigate(location.state?.from || "/");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1>Login</h1>

        <form className="form" onSubmit={handleSubmit} aria-label="Login form">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            aria-required="true"
            aria-describedby={error ? "login-error" : undefined}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            aria-required="true"
            aria-describedby={error ? "login-error" : undefined}
          />

          <button
            className="message-button"
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <Link to="/register" className="auth-secondary-link">
            Create new account
          </Link>
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
            id="login-error"
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

export default Login;
