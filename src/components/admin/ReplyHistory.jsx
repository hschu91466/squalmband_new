import { useEffect, useState } from "react";
import { messagesService } from "../../services/messages";
import { formatDateTime } from "../../utils/formatDate";

const ReplyHistory = ({ messageId }) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchReplies() {
      setLoading(true);
      setError("");
      try {
        const data = await messagesService.getReplies(messageId);
        if (!ignore) {
          if (data.success) {
            setReplies(data.data);
          } else {
            setError(data.message || "Failed to load reply history");
          }
        }
      } catch (err) {
        console.error("Reply history error:", err);
        if (!ignore) setError("Failed to load reply history");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchReplies();

    return () => {
      ignore = true;
    };
  }, [messageId]);

  return (
    <div className="reply-history">
      <h4>Reply History</h4>

      {loading && <p role="status">Loading history...</p>}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && replies.length === 0 && (
        <p role="status">No replies sent yet.</p>
      )}

      {!loading && replies.length > 0 && (
        <ul className="reply-history-list">
          {replies.map((reply) => (
            <li key={reply.id}>
              <p>{reply.reply_body}</p>
              <span className="reply-meta">
                {formatDateTime(reply.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReplyHistory;
