import { useEffect, useState } from "react";
import { usersService } from "../../services/users";
import { formatDateTime } from "../../utils/formatDate";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("pending");
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await usersService.list(status);
        if (data.ok) {
          setUsers(data.users ?? []);
        } else {
          setError(data.error || "Failed to load users");
          setUsers([]);
        }
      } catch (err) {
        console.error("Error loading users", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [status]);

  const approve = async (userId) => {
    setBusyId(userId);
    setError("");
    try {
      const data = await usersService.approve(userId);
      if (data.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        setError(data.error || "Failed to approve user");
      }
    } catch (err) {
      console.error("Error approving user", err);
      setError("Failed to approve user");
    } finally {
      setBusyId(null);
    }
  };

  const deleteUser = async (userId) => {
    setBusyId(userId);
    setError("");
    try {
      const data = await usersService.delete(userId);
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        setError(data.message || "Failed to remove user");
      }
    } catch (err) {
      console.error("Error deleting user", err);
      setError("Failed to remove user");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = () => {
    return window.confirm("Are you sure you want to delete this user?");
  };

  return (
    <div className="admin-users-page">
      <h2>Manage Users</h2>

      <div
        className="button-group filter-tabs"
        role="tablist"
        aria-label="Filter users by approval status"
      >
        <button
          className={`btn btn-tab ${status === "pending" ? "btn-active" : ""}`}
          onClick={() => setStatus("pending")}
          role="tab"
          aria-selected={status === "pending"}
          aria-controls="users-table"
        >
          Pending
        </button>
        <button
          className={`btn btn-tab ${status === "approved" ? "btn-active" : ""}`}
          onClick={() => setStatus("approved")}
          role="tab"
          aria-selected={status === "approved"}
          aria-controls="users-table"
        >
          Approved
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
          Loading users...
        </p>
      )}

      {!loading && users.length === 0 && <p role="status">No users found</p>}

      {!loading && users.length > 0 && (
        <div className="table-wrapper">
          <table
            id="users-table"
            className="table"
            aria-label="Users awaiting approval"
          >
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Status</th>
                <th scope="col">Created</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td data-label="Name">
                    {user.first_name} {user.last_name}
                  </td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Status">
                    <span
                      className={`status-badge ${
                        user.is_approved ? "approved" : "pending"
                      }`}
                    >
                      {user.is_approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td data-label="Created">
                    {formatDateTime(user.created_at)}
                  </td>
                  <td data-label="Actions" className="button-group">
                    {!user.is_approved && (
                      <button
                        className="btn btn-approve btn-sm"
                        disabled={busyId === user.id}
                        onClick={() => approve(user.id)}
                        aria-label={`Approve ${user.first_name} ${user.last_name}`}
                        aria-busy={busyId === user.id}
                      >
                        {busyId === user.id ? "Approving..." : "Approve"}
                      </button>
                    )}
                    <button
                      className="btn btn-delete btn-sm"
                      disabled={busyId === user.id}
                      onClick={() => {
                        if (!confirmDelete()) return;
                        deleteUser(user.id);
                      }}
                      aria-label={`${user.is_approved ? "Remove" : "Deny"} ${user.first_name} ${user.last_name}`}
                      aria-busy={busyId === user.id}
                    >
                      {busyId === user.id
                        ? "Removing..."
                        : user.is_approved
                          ? "Remove"
                          : "Deny"}
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

export default ManageUsers;
