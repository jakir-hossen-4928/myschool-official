import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase"; // Adjust import based on your firebase config file
import { useToast } from "@/hooks/use-toast";

// Define nav routes without Sign-In initially
const baseNavRoutes = [
  { label: "Home", path: "/" },
  { label: "Submit Data", path: "/submit-student-data" },
  { label: "Assets", path: "/assets" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'staff' | 'student' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Animation variants
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const linkVariants = {
    hover: { scale: 1.05, color: "#e5e7eb" },
    tap: { scale: 0.95 },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
  };

  const mobileItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  // Fetch user auth state and role on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role as 'admin' | 'staff' | 'student';
            setUserRole(role);
          } else {
            console.error('User document not found');
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'User data not found. Contact support.',
            });
            setUserRole(null);
          }
        } catch (error: any) {
          console.error('Error fetching user role:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to fetch user role.',
          });
          setUserRole(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, [toast]);

  // Determine dashboard path based on role
  const getDashboardPath = () => {
    switch (userRole) {
      case 'admin':
        return '/admin';
      case 'staff':
        return '/staff';
      case 'student':
        return '/student';
      default:
        return '/admin'; // Fallback for unauthenticated or unknown role
    }
  };

  // Dynamically set nav routes based on auth state
  const navRoutes = isAuthenticated
    ? [...baseNavRoutes, { label: "Dashboard", path: getDashboardPath() }]
    : [...baseNavRoutes, { label: "Sign-In", path: "/admin" }];

  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 shadow-xl sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo Section */}
          <motion.div
            className="flex-shrink-0 flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/" className="flex items-center space-x-3">
              <img
                src="/my-school-logo.jpg"
                alt="School Logo"
                className="h-12 w-12 object-cover rounded-full border-2 border-white/20 shadow-md"
                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/48')}
              />
              <span className="text-2xl lg:text-3xl font-extrabold text-white">
                MySchool-মাইস্কুল
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navRoutes.map((route) => (
              <motion.div
                key={route.label}
                variants={linkVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Link
                  to={route.path}
                  className="text-white text-lg font-medium px-1 py-2 hover:underline underline-offset-4"
                >
                  {route.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.div
            className="md:hidden flex items-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-2 rounded-full hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="md:hidden bg-white/10 backdrop-blur-md border-t border-white/10"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              {navRoutes.map((route) => (
                <motion.div key={role.label} variants={mobileItemVariants}>
                  <Link
                    to={route.path}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-white text-lg font-medium rounded-lg hover:bg-white/20"
                  >
                    {route.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;