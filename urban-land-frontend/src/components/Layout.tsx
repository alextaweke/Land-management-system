import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Layout: React.FC<any> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
