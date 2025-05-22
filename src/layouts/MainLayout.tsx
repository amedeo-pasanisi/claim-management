
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, FolderKanban, Users, FileText } from "lucide-react";

const MainLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { name: "Dashboard", path: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Projects", path: "/projects", icon: <FolderKanban className="w-5 h-5" /> },
    { name: "Contractors", path: "/contractors", icon: <Users className="w-5 h-5" /> },
    { name: "Claims", path: "/claims", icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? "w-64" : "w-16"
        } bg-white shadow-md transition-all duration-300 flex flex-col fixed h-full z-10`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          {isSidebarOpen && <h1 className="font-semibold text-lg">Project Manager</h1>}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            {isSidebarOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            )}
          </button>
        </div>
        <div className="py-4 flex flex-col flex-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-3 flex items-center ${
                location.pathname === item.path
                ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600"
                : "text-gray-700 hover:bg-gray-100"
              } ${isSidebarOpen ? "" : "justify-center"}`}
            >
              <span className="mr-3">{item.icon}</span>
              {isSidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 ${isSidebarOpen ? "ml-64" : "ml-16"} transition-all duration-300`}>
        <header className="bg-white shadow-sm h-16 flex items-center px-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            {menuItems.find((item) => item.path === location.pathname)?.name || "Dashboard"}
          </h1>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
