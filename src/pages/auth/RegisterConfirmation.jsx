import { useLocation } from "react-router-dom";

const RegisterConfirmation = () => {
  const location = useLocation();
  const message = location.state?.message || "Registration successful.";

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1 role="status" aria-live="polite">
          {message}
        </h1>
        <p>We will review your registration request.</p>
      </div>
    </div>
  );
};

export default RegisterConfirmation;
