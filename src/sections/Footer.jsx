const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <p>&copy; {year} Squalm. All rights reserved.</p>
      <a href="#home" className="footer-back-to-top">
        Back to top
      </a>
    </footer>
  );
};

export default Footer;
