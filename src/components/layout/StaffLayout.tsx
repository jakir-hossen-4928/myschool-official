
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Menu, X, User, BookOpen, Calendar, Bell, MessageSquare, FileText } from 'lucide-react';

export const StaffLayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
      });
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
      });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDashboard = () => {
    navigate('/staff');
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
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-green-800 to-green-700 text-white shadow-lg transform transition-all duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:w-64 md:translate-x-0`}
      >
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleDashboard}
                className="flex items-center gap-2 focus:outline-none"
              >
                <h2 className="text-xl font-semibold tracking-tight">
                  Staff Portal
                </h2>
              </button>
            </div>
            <button onClick={toggleSidebar} className="md:hidden text-white">
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-1">
            <a
              href="/staff/students"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-700/80 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <User size={18} />
              <span className="text-sm font-medium">Students</span>
            </a>
            <a
              href="/staff/classes"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-700/80 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <BookOpen size={18} />
              <span className="text-sm font-medium">Classes</span>
            </a>
            <a
              href="/staff/schedules"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-700/80 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Calendar size={18} />
              <span className="text-sm font-medium">Schedules</span>
            </a>
            <a
              href="/staff/attendance"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-700/80 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <FileText size={18} />
              <span className="text-sm font-medium">Attendance</span>
            </a>
            <a
              href="/staff/messages"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-700/80 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <MessageSquare size={18} />
              <span className="text-sm font-medium">Messages</span>
            </a>
            <a
              href="/staff/notifications"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-700/80 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Bell size={18} />
              <span className="text-sm font-medium">Notifications</span>
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
          className={`bg-white p-4 shadow-md flex items-center justify-between sticky top-0 z-30 transition-transform duration-300 ease-in-out ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"
            }`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-600 hover:text-green-600 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-semibold text-gray-800">
                <button
                  onClick={handleDashboard}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  Staff Dashboard
                </button>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleLogout}
              className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2 text-sm transition-colors"
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

export default StaffLayout;
