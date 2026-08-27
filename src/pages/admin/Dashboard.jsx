import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { usersService } from "../../services/users";
import { messagesService } from "../../services/messages";
import { newsService } from "../../services/news";
import { mediaService } from "../../services/media";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [counts, setCounts] = useState({
    pendingUsers: 0,
    newMessages: 0,
    newsPosts: 0,
    mediaItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadCounts() {
      setLoading(true);
      try {
        const [usersRes, messagesRes, newsRes, mediaRes] = await Promise.all([
          usersService.list("pending"),
          messagesService.list(),
          newsService.list(),
          mediaService.list(),
        ]);

        if (!ignore) {
          const pendingUsers = usersRes.ok ? usersRes.users.length : 0;

          const newMessages = messagesRes.success
            ? messagesRes.data.filter(
                (m) => !Number(m.is_read) && Number(m.is_spam) !== 1,
              ).length
            : 0;

          const newsPosts = newsRes.success ? newsRes.data.length : 0;
          const mediaItems = mediaRes.success ? mediaRes.data.length : 0;

          setCounts({ pendingUsers, newMessages, newsPosts, mediaItems });
        }
      } catch (err) {
        console.error("Error loading dashboard counts", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadCounts();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="admin-dashboard-page">
      <h2>Admin Dashboard</h2>
      <p>Welcome {user?.first_name || user?.name}</p>
      <p className="admin-dashboard-nav-hint">
        Use the navigation on the left to manage your site content.
      </p>

      {loading ? (
        <p role="status" aria-live="polite">
          Loading...
        </p>
      ) : (
        <div className="admin-dashboard-cards">
          <Link to="/admin/users" className="admin-dashboard-card">
            <span className="admin-dashboard-count">{counts.pendingUsers}</span>
            <span className="admin-dashboard-label">Pending Users</span>
          </Link>

          <Link to="/admin/messages" className="admin-dashboard-card">
            <span className="admin-dashboard-count">{counts.newMessages}</span>
            <span className="admin-dashboard-label">New Messages</span>
          </Link>

          <Link to="/admin/news" className="admin-dashboard-card">
            <span className="admin-dashboard-count">{counts.newsPosts}</span>
            <span className="admin-dashboard-label">News Posts</span>
          </Link>

          <Link to="/admin/media" className="admin-dashboard-card">
            <span className="admin-dashboard-count">{counts.mediaItems}</span>
            <span className="admin-dashboard-label">Media Items</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
