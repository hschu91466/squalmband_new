import { useState } from "react";

const ReplyForm = ({ message, onSend, onCancel }) => {
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!replyBody.trim()) {
      setError("Reply message required");
      return;
    }

    setError("");
    setSending(true);

    try {
      await onSend(message.message_id, replyBody);
      setReplyBody("");
    } catch (err) {
      console.error("Reply send error:", err);
      setError(err.message || "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      className="form"
      id={`reply-form-${message.message_id}`}
      onSubmit={handleSubmit}
      aria-label={`Reply to ${message.first_name} ${message.last_name}`}
    >
      <label htmlFor={`reply-body-${message.message_id}`}>
        Reply to {message.first_name} {message.last_name}:
      </label>
      <textarea
        id={`reply-body-${message.message_id}`}
        value={replyBody}
        onChange={(e) => setReplyBody(e.target.value)}
        rows={4}
        aria-describedby={
          error ? `reply-error-${message.message_id}` : undefined
        }
      />

      {error && (
        <span
          id={`reply-error-${message.message_id}`}
          className="error"
          role="alert"
        >
          {error}
        </span>
      )}

      <div className="button-group">
        <button
          type="submit"
          className="btn btn-approve btn-sm"
          disabled={sending}
          aria-busy={sending}
        >
          {sending ? "Sending..." : "Send Reply"}
        </button>
        <button
          type="button"
          className="btn btn-sm"
          onClick={onCancel}
          disabled={sending}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ReplyForm;
