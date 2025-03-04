import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center space-x-2">
            <img
              src="/my-school-logo.jpg"
              alt="School Logo"
              className="h-10 w-10 object-cover rounded-full transform transition-transform hover:scale-110 hover:shadow-lg"
            />
            <span className="text-2xl font-bold text-white font-sans hover:text-gray-200 transition-colors">
              MySchool-মাইস্কুল
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-white hover:text-gray-200 transition-colors relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full"></span>
            </Link>
            <Link
              to="/submit-student-data"
              className="text-white hover:text-gray-200 transition-colors relative group"
            >
              Submit Data
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full"></span>
            </Link>
            <Link
              to="/admin"
              className="text-white hover:text-gray-200 transition-colors relative group"
            >
             Admin
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full"></span>
            </Link>
            <Link
              to="#about"
              className="text-white hover:text-gray-200 transition-colors relative group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full"></span>
            </Link>
            <Link
              to="#contact"
              className="text-white hover:text-gray-200 transition-colors relative group"
            >
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full"></span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gray-200 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/10 backdrop-blur-sm">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 text-white hover:bg-white/20 rounded-md transition-colors"
            >
              Home
            </Link>
            <Link
              to="/submit-student-data"
              className="block px-3 py-2 text-white hover:bg-white/20 rounded-md transition-colors"
            >
              Submit Data
            </Link>
            <Link
              to="/admin"
              className="text-white hover:text-gray-200 transition-colors relative group"
            >
             Admin
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full"></span>
            </Link>
            <Link
              to="#about"
              className="block px-3 py-2 text-white hover:bg-white/20 rounded-md transition-colors"
            >
              About
            </Link>
            <Link
              to="#contact"
              className="block px-3 py-2 text-white hover:bg-white/20 rounded-md transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;