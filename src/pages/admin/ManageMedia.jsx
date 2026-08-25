import { useEffect, useState, useCallback } from "react";
import { mediaService } from "../../services/media";
import MediaForm from "../../components/admin/MediaForm";

const ManageMedia = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [platformFilter, setPlatformFilter] = useState("all");

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params =
        platformFilter === "all" ? {} : { platform: platformFilter };
      const response = await mediaService.list(params);
      if (response.success) {
        setItems(response.data);
      }
    } catch (err) {
      console.error("Failed to load media:", err);
    } finally {
      setLoading(false);
    }
  }, [platformFilter]);

  useEffect(() => {
    let ignore = false;

    async function fetchOnMount() {
      setLoading(true);
      try {
        const params =
          platformFilter === "all" ? {} : { platform: platformFilter };
        const response = await mediaService.list(params);
        if (!ignore && response.success) {
          setItems(response.data);
        }
      } catch (err) {
        console.error("Failed to load media:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchOnMount();

    return () => {
      ignore = true;
    };
  }, [platformFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;

    try {
      const response = await mediaService.delete(id);
      if (response.success) {
        loadItems();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditingItem(null);
    loadItems();
  };

  if (showForm) {
    return (
      <MediaForm
        item={editingItem}
        onSaved={handleSaved}
        onCancel={() => {
          setShowForm(false);
          setEditingItem(null);
        }}
      />
    );
  }

  return (
    <div>
      <h2>Manage Music &amp; Videos</h2>

      <div
        className="button-group filter-tabs"
        role="tablist"
        aria-label="Filter by platform"
      >
        <button
          className={`btn btn-tab ${platformFilter === "all" ? "btn-active" : ""}`}
          onClick={() => setPlatformFilter("all")}
          role="tab"
          aria-selected={platformFilter === "all"}
        >
          All
        </button>
        <button
          className={`btn btn-tab ${platformFilter === "youtube" ? "btn-active" : ""}`}
          onClick={() => setPlatformFilter("youtube")}
          role="tab"
          aria-selected={platformFilter === "youtube"}
        >
          Video
        </button>
        <button
          className={`btn btn-tab ${platformFilter === "spotify" ? "btn-active" : ""}`}
          onClick={() => setPlatformFilter("spotify")}
          role="tab"
          aria-selected={platformFilter === "spotify"}
        >
          Music
        </button>
      </div>

      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
        >
          + New
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {!loading && items.length === 0 && <p>No items yet.</p>}

      {!loading && items.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Platform</th>
                <th>Placement</th>
                <th>Cover</th>
                <th>Sort</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.platform}</td>
                  <td>{item.placement}</td>
                  <td>{item.is_cover ? "Yes" : ""}</td>
                  <td>{item.sort_order}</td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={() => {
                        setEditingItem(item);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>{" "}
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => handleDelete(item.id)}
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

export default ManageMedia;
