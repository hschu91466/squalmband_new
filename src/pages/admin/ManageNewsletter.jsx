import { useEffect, useState } from "react";
import { newsletterService } from "../../services/newsletter";
import { formatDateTime } from "../../utils/formatDate";

const ManageNewsletter = () => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  const [history, setHistory] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState("compose");

  useEffect(() => {
    let ignore = false;

    async function fetchOnMount() {
      setLoading(true);
      setLoadError("");
      try {
        const [historyRes, subsRes] = await Promise.all([
          newsletterService.history(),
          newsletterService.subscribers(),
        ]);

        if (!ignore) {
          if (historyRes.success) setHistory(historyRes.data);
          if (subsRes.success) setSubscribers(subsRes.data);
          if (!historyRes.success && !subsRes.success) {
            setLoadError("Failed to load send history and subscribers");
          } else if (!historyRes.success) {
            setLoadError("Failed to load send history");
          } else if (!subsRes.success) {
            setLoadError("Failed to load subscribers");
          }
        }
      } catch (err) {
        console.error("Failed to load newsletter data:", err);
        if (!ignore) setLoadError("Failed to load newsletter data");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchOnMount();

    return () => {
      ignore = true;
    };
  }, []);

  const reloadHistory = async () => {
    try {
      const res = await newsletterService.history();
      if (res.success) setHistory(res.data);
    } catch (err) {
      console.error("Failed to reload history:", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSendError("");
    setSendSuccess("");

    if (!subject.trim() || !body.trim()) {
      setSendError("Subject and body are required");
      return;
    }

    if (
      !window.confirm(
        `Send this newsletter to ${subscribers.length} subscriber(s)? This cannot be undone.`,
      )
    ) {
      return;
    }

    setSending(true);
    try {
      const response = await newsletterService.send(subject, body);
      if (response.success) {
        setSendSuccess(response.message || "Newsletter sent");
        setSubject("");
        setBody("");
        reloadHistory();
      } else {
        setSendError(response.message || "Failed to send newsletter");
      }
    } catch (err) {
      console.error("Send error:", err);
      setSendError("Something went wrong");
    } finally {
      setSending(false);
    }
  };

  const handleRemove = async (email) => {
    if (!window.confirm(`Remove ${email} from the subscriber list?`)) return;

    try {
      const response = await newsletterService.removeSubscriber(email);
      if (response.success) {
        setSubscribers((prev) => prev.filter((s) => s.email !== email));
      }
    } catch (err) {
      console.error("Remove subscriber error:", err);
    }
  };

  const subscriberName = (sub) => {
    const first = sub.attributes?.FIRSTNAME || "";
    const last = sub.attributes?.LASTNAME || "";
    const full = `${first} ${last}`.trim();
    return full || "—";
  };

  return (
    <div className="newsletter-page">
      <h2>Newsletter</h2>

      <div
        className="button-group"
        role="tablist"
        aria-label="Newsletter sections"
      >
        <button
          type="button"
          className={activeTab === "compose" ? "btn btn-active" : "btn"}
          aria-pressed={activeTab === "compose"}
          onClick={() => setActiveTab("compose")}
        >
          Compose
        </button>
        <button
          type="button"
          className={activeTab === "history" ? "btn btn-active" : "btn"}
          aria-pressed={activeTab === "history"}
          onClick={() => setActiveTab("history")}
        >
          Send History
        </button>
        <button
          type="button"
          className={activeTab === "subscribers" ? "btn btn-active" : "btn"}
          aria-pressed={activeTab === "subscribers"}
          onClick={() => setActiveTab("subscribers")}
        >
          Subscribers
        </button>
      </div>

      {loadError && (
        <p
          className="auth-message auth-message--error"
          role="alert"
          aria-live="assertive"
        >
          {loadError}
        </p>
      )}

      {loading && <p>Loading...</p>}

      {!loading && activeTab === "compose" && (
        <div>
          <h3>Compose</h3>
          <form
            className="form"
            onSubmit={handleSend}
            aria-label="Compose newsletter"
          >
            <label htmlFor="newsletter-subject">Subject</label>
            <input
              id="newsletter-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />

            <label htmlFor="newsletter-body">Body (HTML)</label>
            <textarea
              id="newsletter-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={8}
            ></textarea>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending}
              aria-busy={sending}
            >
              {sending
                ? "Sending..."
                : `Send to ${subscribers.length} subscriber(s)`}
            </button>

            {sendError && (
              <p
                className="auth-message auth-message--error"
                role="alert"
                aria-live="assertive"
              >
                {sendError}
              </p>
            )}
            {sendSuccess && (
              <p
                className="auth-message auth-message--success"
                role="status"
                aria-live="polite"
              >
                {sendSuccess}
              </p>
            )}
          </form>
        </div>
      )}

      {!loading && activeTab === "history" && (
        <div>
          <h3>Send History</h3>
          {history.length === 0 ? (
            <p>No newsletters sent yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td>{item.subject}</td>
                      <td>{formatDateTime(item.sent_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!loading && activeTab === "subscribers" && (
        <div>
          <h3>Subscribers ({subscribers.length})</h3>
          {subscribers.length === 0 ? (
            <p>No subscribers yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub) => (
                    <tr key={sub.id || sub.email}>
                      <td>{sub.email}</td>
                      <td>{subscriberName(sub)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-delete"
                          onClick={() => handleRemove(sub.email)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageNewsletter;
