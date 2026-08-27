import { useEffect, useState, useCallback } from "react";
import { newsService } from "../../services/news";
import NewsForm from "../../components/admin/NewsForm";

const ManageNews = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await newsService.list();
      if (response.success) {
        setPosts(response.data);
      }
    } catch (err) {
      console.error("Failed to load news posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function fetchOnMount() {
      setLoading(true);
      try {
        const response = await newsService.list();
        if (!ignore && response.success) {
          setPosts(response.data);
        }
      } catch (err) {
        console.error("Failed to load news posts:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchOnMount();

    return () => {
      ignore = true;
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;

    try {
      const response = await newsService.delete(id);
      if (response.success) {
        loadPosts();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingPost(null);
    loadPosts();
  };

  if (showForm) {
    return (
      <NewsForm
        post={editingPost}
        onSaved={handleSaved}
        onCancel={() => {
          setShowForm(false);
          setEditingPost(null);
        }}
      />
    );
  }

  return (
    <div>
      <h2>Manage News</h2>

      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingPost(null);
            setShowForm(true);
          }}
        >
          + New Post
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && posts.length === 0 && <p>No news posts yet.</p>}

      {!loading && posts.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Type</th>
                <th>Section</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td data-label="Title">{post.title}</td>
                  <td data-label="Date">{post.news_date}</td>
                  <td data-label="Type">{post.media_type}</td>
                  <td data-label="Section">{post.section}</td>
                  <td data-label="Actions">
                    <button
                      className="btn btn-sm"
                      onClick={() => {
                        setEditingPost(post);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>{" "}
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => handleDelete(post.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageNews;
