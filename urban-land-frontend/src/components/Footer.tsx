import React from "react";

const Footer: React.FC = () => (
  <footer className="bg-white px-4 py-3 text-sm text-center shadow-inner">
    © {new Date().getFullYear()} Urban Land Management — Built with ❤️
  </footer>
);

export default Footer;
