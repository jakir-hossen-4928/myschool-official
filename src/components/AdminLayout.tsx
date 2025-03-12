import { Outlet } from "react-router-dom";
import { Button } from "./ui/button";
import { logout } from "../lib/appwrite";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, User, School, BarChart, BookAIcon } from "lucide-react";
import { FaSms } from "react-icons/fa";
import { RiRobot2Line } from 'react-icons/ri';


export const AdminLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleLogout = async () => {
    await logout();
    navigate("/admin-login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleAdminHome = () => {
    navigate("/admin");
    setIsSidebarOpen(false);
  };

  // Handle scroll behavior for mobile
  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      // Scrolling down & past threshold (50px)
      setIsHeaderVisible(false);
    } else if (currentScrollY < lastScrollY) {
      // Scrolling up
      setIsHeaderVisible(true);
    }

    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    // Only apply scroll listener on mobile (md breakpoint and below)
    if (window.innerWidth < 768) {
      window.addEventListener("scroll", handleScroll);
    }

    // Cleanup listener on unmount or screen resize
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white shadow-lg transform transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:w-64 md:translate-x-0`}
      >
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleAdminHome}
                className="flex items-center gap-2 focus:outline-none"
              >
                <h2 className="text-xl font-semibold tracking-tight">
                  MySchool Admin
                </h2>
              </button>
            </div>
            <button onClick={toggleSidebar} className="md:hidden text-white">
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-1">
            <a
              href="/admin/student-menagement"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-700/80 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <User size={18} />
              <span className="text-sm font-medium">Student Management</span>
            </a>
            <a
              href="/admin/accounts&fund"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-700/80 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <BarChart size={18} />
              <span className="text-sm font-medium">Accounts Management</span>
            </a>
            <a
              href="/admin/academic"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-700/80 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <BookAIcon size={18} />
              <span className="text-sm font-medium">Academic Management</span>
            </a>
            <a
              href="/admin/staff"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-700/80 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <User size={18} />
              <span className="text-sm font-medium">Staff Panel</span>
            </a>
            <a
              href="/admin/sms-service"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-700/80 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <FaSms size={18} />
              <span className="text-sm font-medium">SMS Service</span>
            </a>
            <a
              href="/admin/myschool-ai"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-700/80 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <RiRobot2Line size={18} />
              <span className="text-sm font-medium">MySchool-AI</span>
            </a>
            </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full md:w-auto">
        <header
          className={`bg-white p-4 shadow-md flex items-center justify-between sticky top-0 z-30 transition-transform duration-300 ease-in-out ${
            isHeaderVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-white p-1 md:hidden">
                <img
                  src="/my-school-logo.jpg"
                  alt="MySchool Logo"
                  className="h-8 w-8 object-contain rounded-full"
                />
              </div>
              <h1 className="text-lg md:text-xl font-semibold text-gray-800">
                <button
                  onClick={handleAdminHome}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <h2 className="text-xl font-semibold tracking-tight">
                    MySchool-মাইস্কুল
                  </h2>
                </button>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleLogout}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 text-sm transition-colors"
            >
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

        <footer className="bg-white p-3 md:p-4 text-center text-xs md:text-sm text-gray-500 border-t">
          © {new Date().getFullYear()} MySchool. All rights reserved.
        </footer>
      </div>
    </div>
  );
};