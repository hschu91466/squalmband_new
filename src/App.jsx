import { Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Login from "./pages/auth/Login";
import ChangePassword from "./pages/auth/ChangePassword";
import Register from "./pages/auth/Register";
import RegisterConfirmation from "./pages/auth/RegisterConfirmation";
import Dashboard from "./pages/admin/Dashboard";
import ManageNews from "./pages/admin/ManageNews";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageMedia from "./pages/admin/ManageMedia";
import ManageMessages from "./pages/admin/ManageMessages";
import ManageComments from "./pages/admin/ManageComments";
import ManageNewsletter from "./pages/admin/ManageNewsletter";
import ManageContent from "./pages/admin/ManageContent";

import ManageTours from "./pages/admin/ManageTours";

import MainPage from "./pages/MainPage";

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/register-confirmation"
          element={<RegisterConfirmation />}
        />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="news" element={<ManageNews />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="media" element={<ManageMedia />} />
          <Route path="messages" element={<ManageMessages />} />
          <Route path="comments" element={<ManageComments />} />
          <Route path="newsletter" element={<ManageNewsletter />} />
          <Route path="content" element={<ManageContent />} />
          <Route path="shows" element={<ManageTours />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
