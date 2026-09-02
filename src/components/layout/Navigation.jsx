import { useState, useRef, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import useActiveSection from "../../hooks/useActiveSection";

const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const { user, logout } = useContext(AuthContext);

  const sections = [
    { id: "home", label: "home" },
    { id: "video", label: "video" },
    { id: "music", label: "music" },
    { id: "news", label: "news" },
    { id: "contact", label: "contact" },
    { id: "tour", label: "shows" },
    { id: "about", label: "about" },
  ];

  const activeSection = useActiveSection(sections.map((s) => s.id));

  const doScroll = (id) => {
    const target = document.getElementById(id);
    const headerHeight = navRef.current?.offsetHeight || 0;

    if (target) {
      const targetOffset =
        target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top: targetOffset, behavior: "smooth" });
    }
  };

  const scrollToSection = (id) => {
    // Close the mobile menu FIRST. On mobile, .nav-list sits in normal
    // document flow (not floating), so having it open adds real height
    // above the page content. If we measure/scroll before the menu
    // closes, the collapse afterward shifts everything up and the
    // target section lands underneath the (now shorter) sticky nav.
    // Waiting a tick lets that reflow finish before we measure anything.
    setMenuOpen(false);

    const runScroll = () => doScroll(id);

    // Section elements (Home, Video, etc.) only exist in the DOM
    // while MainPage is rendered — i.e. on "/". If we're on another
    // route (like /login), navigate home first and wait for MainPage
    // to mount before trying to scroll to the section.
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(runScroll, 100);
    } else {
      setTimeout(runScroll, 50);
    }
  };

  return (
    <nav className="site-nav" aria-label="Main navigation" ref={navRef}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <h1 className="sr-only">Squalm</h1>
      <div className="brand-bar">
        <div className="nav-brand">
          <span className="nav-logo">
            {/* <img src="./images/hs_logo4.png" alt="" /> */}
          </span>
          <div>
            <span className="logo-font">Squalm</span>
          </div>
        </div>
      </div>

      <div className="links-bar">
        <button
          className="nav-toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          aria-controls="nav-list"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <ul className={`nav-list ${menuOpen ? "open" : ""}`} id="nav-list">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={
                  "site-nav-link" +
                  (activeSection === section.id ? " is-active" : "")
                }
                aria-current={
                  activeSection === section.id ? "location" : undefined
                }
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(section.id);
                }}
              >
                {section.label}
              </a>
            </li>
          ))}

          {user?.role === "admin" && (
            <li>
              <Link
                to="/admin"
                className="site-nav-link admin-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </Link>
            </li>
          )}

          {user ? (
            <li
              className="nav-user-dropdown"
              onMouseEnter={() => setUserMenuOpen(true)}
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <button
                className="nav-user-toggle"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                type="button"
              >
                Welcome, {user.name || user.email} ▾
              </button>
              {userMenuOpen && (
                <ul className="nav-user-menu">
                  <li>
                    <Link
                      to="/change-password"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      Change Password
                    </Link>
                  </li>
                  <li>
                    <button
                      className="logout-button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      type="button"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </li>
          ) : (
            <li>
              <a href="/login" className="login-link">
                Login
              </a>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
