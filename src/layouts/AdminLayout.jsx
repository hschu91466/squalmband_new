import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";
import AdminTopBar from "./AdminTopBar";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="admin-layout-wrapper">
      <AdminTopBar />
      <div className="admin-layout">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle admin menu"
          aria-expanded={sidebarOpen}
        >
          ☰
        </button>
        <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
          <h3>Admin</h3>
          <nav className="admin-nav">
            <ul>
              <li>
                <NavLink
                  to="/admin"
                  end
                  onClick={closeSidebar}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/users"
                  onClick={closeSidebar}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Manage Users
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/messages"
                  onClick={closeSidebar}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Manage Messages
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/comments"
                  onClick={closeSidebar}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Manage Comments
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/media"
                  onClick={closeSidebar}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Manage Media
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/admin/news"
                  onClick={closeSidebar}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Manage News
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/admin/newsletter"
                  onClick={closeSidebar}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Manage Newsletter
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/shows"
                  onClick={closeSidebar}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Manage Shows
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/content"
                  onClick={closeSidebar}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Manage Content
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>
        <div className="admin-main">
          <main className="app-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
