import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Animation variants
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const linkVariants = {
    hover: {
      scale: 1.05,
      color: "#e5e7eb",
      transition: {
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  const mobileMenuVariants = {
    hidden: {
      opacity: 0,
      height: 0,
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const mobileItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

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
            <img
              src="/my-school-logo.jpg"
              alt="School Logo"
              className="h-12 w-12 object-cover rounded-full border-2 border-white/20 shadow-md"
            />
            <span className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
              MySchool-মাইস্কুল
            </span>
          </motion.div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-10">
            {["Home", "Submit Data", "Sign-In", "About", "Contact"].map(
              (item) => (
                <motion.div key={item} variants={linkVariants} whileHover="hover" whileTap="tap">
                  <Link
                    to={item === "Home" ? "/" : item === "Submit Data" ? "/submit-student-data" : item === "Sign-In" ? "/admin" : `#${item.toLowerCase()}`}
                    className="text-white text-lg font-medium relative px-1 py-2 group"
                  >
                    {item}
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-white/0 via-white to-white/0 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center"></span>
                  </Link>
                </motion.div>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.div
            className="md:hidden flex items-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-2 rounded-full hover:bg-white/10 focus:outline-none transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
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
            className="md:hidden bg-gradient-to-b from-white/10 to-transparent backdrop-blur-md border-t border-white/10"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              {["Home", "Submit Data", "Sign-In", "About", "Contact"].map(
                (item) => (
                  <motion.div key={item} variants={mobileItemVariants}>
                    <Link
                      to={item === "Home" ? "/" : item === "Submit Data" ? "/submit-student-data" : item === "Sign-In" ? "/admin" : `#${item.toLowerCase()}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-white text-lg font-medium rounded-lg hover:bg-white/20 hover:shadow-md transition-all duration-200"
                    >
                      {item}
                    </Link>
                  </motion.div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;