import { useEffect, useState } from "react";
import { messagesService } from "../../services/messages";
import { formatDateTime } from "../../utils/formatDate";
import ReplyForm from "../../components/admin/ReplyForm";
import ReplyHistory from "../../components/admin/ReplyHistory";

const ManageMessages = () => {
  const [historyId, setHistoryId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [replyingId, setReplyingId] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function fetchOnMount() {
      setLoading(true);
      setError("");
      try {
        const data = await messagesService.list();
        if (!ignore) {
          if (data.success) {
            setMessages(data.data);
          } else {
            setError(data.message || "Failed to load messages");
          }
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        if (!ignore) setError("Failed to load messages");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchOnMount();

    return () => {
      ignore = true;
    };
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const data = await messagesService.markRead(id);
      if (data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.message_id === id ? { ...msg, is_read: 1 } : msg,
          ),
        );
      }
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleMarkSpam = async (id) => {
    try {
      const data = await messagesService.markSpam(id);
      if (data.success) {
        setMessages((prev) => prev.filter((msg) => msg.message_id !== id));
      }
    } catch (err) {
      console.error("Mark spam error:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      const data = await messagesService.delete(id);
      if (data.success) {
        setMessages((prev) => prev.filter((msg) => msg.message_id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleReplyClick = (id) => {
    setReplyingId(replyingId === id ? null : id);
    setHistoryId(null);
  };

  const handleHistoryClick = (id) => {
    setHistoryId(historyId === id ? null : id);
    setReplyingId(null);
  };

  const handleSendReply = async (id, replyBody) => {
    const data = await messagesService.reply(id, replyBody);

    if (!data.success) {
      throw new Error(data.message || "Failed to send reply");
    }

    setMessages((prev) =>
      prev.map((msg) => (msg.message_id === id ? { ...msg, is_read: 1 } : msg)),
    );
    setReplyingId(null);
  };

  const nonSpamMessages = messages.filter((msg) => Number(msg.is_spam) !== 1);

  const filteredMessages = nonSpamMessages.filter((msg) => {
    if (filter === "all") return true;

    const isRead = Number(msg.is_read) === 1;

    if (filter === "read") return isRead;
    if (filter === "new") return !isRead;

    return true;
  });

  return (
    <div className="messages-page">
      <h2>Contact Messages</h2>

      <div
        className="button-group filter-tabs"
        role="tablist"
        aria-label="Filter messages by status"
      >
        <button
          className={`btn btn-tab ${filter === "all" ? "btn-active" : ""}`}
          onClick={() => setFilter("all")}
          role="tab"
          aria-selected={filter === "all"}
          aria-controls="messages-table"
        >
          All ({nonSpamMessages.length})
        </button>

        <button
          className={`btn btn-tab ${filter === "new" ? "btn-active" : ""}`}
          onClick={() => setFilter("new")}
          role="tab"
          aria-selected={filter === "new"}
          aria-controls="messages-table"
        >
          New ({nonSpamMessages.filter((m) => !Number(m.is_read)).length})
        </button>

        <button
          className={`btn btn-tab ${filter === "read" ? "btn-active" : ""}`}
          onClick={() => setFilter("read")}
          role="tab"
          aria-selected={filter === "read"}
          aria-controls="messages-table"
        >
          Read ({nonSpamMessages.filter((m) => Number(m.is_read)).length})
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

      {loading && (
        <p role="status" aria-live="polite">
          Loading messages...
        </p>
      )}

      {!loading && filteredMessages.length === 0 && (
        <p role="status">No messages found.</p>
      )}

      {!loading && filteredMessages.length > 0 && (
        <div className="table-wrapper">
          <table
            id="messages-table"
            className="table"
            aria-label="Contact form messages"
          >
            <thead>
              <tr>
                <th scope="col">Status</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Subject</th>
                <th scope="col">Message</th>
                <th scope="col">Date</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredMessages.map((msg) => {
                const isRead = Number(msg.is_read) === 1;
                const isReplying = replyingId === msg.message_id;
                const isShowingHistory = historyId === msg.message_id;

                return (
                  <>
                    <tr
                      key={msg.message_id}
                      className={!isRead ? "row-unread" : ""}
                    >
                      <td data-label="Status">
                        <span
                          className={`status-badge ${
                            isRead ? "approved" : "pending"
                          }`}
                        >
                          {isRead ? "Read" : "New"}
                        </span>
                      </td>

                      <td data-label="Name">
                        {msg.first_name} {msg.last_name}
                      </td>
                      <td data-label="Email">{msg.email}</td>
                      <td data-label="Subject">{msg.subject}</td>

                      <td data-label="Message" className="message-cell">
                        {msg.message}
                      </td>

                      <td data-label="Date">
                        {formatDateTime(msg.created_at)}
                      </td>

                      <td data-label="Actions" className="button-group">
                        {!isRead && (
                          <button
                            className="btn btn-approve btn-sm"
                            onClick={() => handleMarkRead(msg.message_id)}
                            aria-label={`Mark message from ${msg.first_name} ${msg.last_name} as read`}
                          >
                            Mark Read
                          </button>
                        )}

                        <button
                          className="btn btn-reply btn-sm"
                          onClick={() => handleReplyClick(msg.message_id)}
                          aria-expanded={isReplying}
                          aria-controls={`reply-form-${msg.message_id}`}
                          aria-label={`Reply to message from ${msg.first_name} ${msg.last_name}`}
                        >
                          {isReplying ? "Cancel" : "Reply"}
                        </button>

                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleHistoryClick(msg.message_id)}
                          aria-expanded={isShowingHistory}
                          aria-controls={`history-${msg.message_id}`}
                          aria-label={`View reply history for message from ${msg.first_name} ${msg.last_name}`}
                        >
                          {isShowingHistory ? "Hide History" : "History"}
                        </button>

                        <button
                          className="btn btn-spam btn-sm"
                          onClick={() => handleMarkSpam(msg.message_id)}
                          aria-label={`Mark message from ${msg.first_name} ${msg.last_name} as spam`}
                        >
                          Spam
                        </button>

                        <button
                          className="btn btn-delete btn-sm"
                          onClick={() => handleDelete(msg.message_id)}
                          aria-label={`Delete message from ${msg.first_name} ${msg.last_name}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>

                    {isReplying && (
                      <tr key={`${msg.message_id}-reply`}>
                        <td colSpan={7} className="reply-row">
                          <ReplyForm
                            message={msg}
                            onSend={handleSendReply}
                            onCancel={() => setReplyingId(null)}
                          />
                        </td>
                      </tr>
                    )}

                    {isShowingHistory && (
                      <tr key={`${msg.message_id}-history`}>
                        <td colSpan={7} className="history-row">
                          <ReplyHistory messageId={msg.message_id} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageMessages;
