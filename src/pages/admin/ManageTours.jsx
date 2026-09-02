import { useEffect, useState, useCallback } from "react";
import { tourService } from "../../services/tour";
import TourForm from "../../components/admin/TourForm";
import { formatDateTime } from "../../utils/formatDate";

const ManageTours = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await tourService.list();
      if (response.success) {
        setItems(response.data);
      }
    } catch (err) {
      console.error("Failed to load shows:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function fetchOnMount() {
      setLoading(true);
      try {
        const response = await tourService.list();
        if (!ignore && response.success) {
          setItems(response.data);
        }
      } catch (err) {
        console.error("Failed to load show:", err);
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
    if (!window.confirm("Delete this item? This cannot be undone.")) return;

    try {
      const response = await tourService.delete(id);
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
      <TourForm
        post={editingItem}
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
      <h2>Manage Shows</h2>

      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
        >
          + New Show
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {!loading && items.length === 0 && <p>No shows yet.</p>}

      {!loading && items.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Venue</th>
                <th>Date</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td data-label="Venue">{item.venue}</td>
                  <td data-label="Date">{formatDateTime(item.tour_date)}</td>
                  <td data-label="Location">{item.location}</td>
                  <td>
                    <button
                      data-label="Actions"
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

export default ManageTours;
