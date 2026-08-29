import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { commentsService } from "../../services/comments";

const CommentForm = ({ contentId, onSuccess }) => {
  const { user } = useContext(AuthContext);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const data = await commentsService.create("video", contentId, {
        name: user ? user.name : `${firstName} ${lastName}`.trim(),
        email: user ? user.email : email,
        body: comment,
      });

      if (data.ok) {
        setMessage(
          data.message ||
            (user
              ? "Comment posted successfully."
              : "Comment submitted for approval."),
        );

        if (!user) {
          setFirstName("");
          setLastName("");
          setEmail("");
        }
        setComment("");

        if (onSuccess) {
          onSuccess();
        }
      } else {
        setMessage(
          data.error ||
            (data.errors && data.errors[0]) ||
            "Error submitting comment.",
        );
      }
    } catch (error) {
      console.error("Error submitting comment.", error);
      setMessage("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="video-comment-form"
      onSubmit={handleSubmit}
      aria-label="Add comment"
    >
      <h3>Add Comment</h3>

      {!user && (
        <fieldset>
          <legend>Your Information</legend>
          <div className="form-row form-row--two">
            <div>
              <label htmlFor="video-comment-first-name">First Name</label>
              <input
                className="form-control"
                type="text"
                placeholder="First name"
                id="video-comment-first-name"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="video-comment-last-name">Last Name</label>
              <input
                className="form-control"
                type="text"
                placeholder="Last name"
                id="video-comment-last-name"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="video-comment-email">Email</label>
              <input
                className="form-control"
                type="email"
                placeholder="Email"
                id="video-comment-email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
              />
            </div>
          </div>
        </fieldset>
      )}

      {user && (
        <p role="status">
          Posting as: <strong>{user.name}</strong>
        </p>
      )}

      <div className="form-row">
        <label htmlFor="video-comment-body">Your Comment</label>
        <textarea
          className="form-control"
          placeholder="Your comment..."
          id="video-comment-body"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          aria-required="true"
        />
      </div>

      <button
        className="btn btn-submit"
        type="submit"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>

      {message && (
        <p role="status" aria-live="polite" aria-atomic="true">
          {message}
        </p>
      )}
    </form>
  );
};

export default CommentForm;
