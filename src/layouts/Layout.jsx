import { Outlet } from "react-router-dom";
import VideoBackground from "../components/layout/VideoBackground";
import Navigation from "../components/layout/Navigation";

// Shared shell for every route: background video, nav, and a <main>
// landmark that hosts whichever page is active.
const Layout = () => (
  <>
    <VideoBackground />
    <Navigation />
    <main id="main-content">
      <Outlet />
    </main>
  </>
);

export default Layout;
