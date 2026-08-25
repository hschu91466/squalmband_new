import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AdminTopBar = () => {
  const { logout } = useContext(AuthContext);

  return (
    <div className="admin-topbar">
      <Link to="/admin" className="admin-topbar-brand">
        <span className="logo-font">Squalm</span>
      </Link>
      <div className="admin-topbar-actions">
        <Link to="/" className="btn btn-sm">
          Home
        </Link>
        <button className="btn btn-sm" onClick={logout} type="button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminTopBar;
