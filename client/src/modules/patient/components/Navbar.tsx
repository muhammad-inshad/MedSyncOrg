import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import logo from "../../../assets/images/logo.png";
import { Phone, User, Menu, Bell, Search, X } from "lucide-react";
import { PATIENT_ROUTES } from "@/constants/frontend/patient/patient.routes";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHiddenPath =
    location.pathname.includes("/login") ||
    location.pathname.includes("/register") ||
    location.pathname.includes("/profile");

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-white py-4 px-6 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo + Emergency */}
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src={logo}
              alt="MedSync Logo"
              className="w-12 sm:w-16 h-auto shrink-0"
            />
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              <div className="leading-tight">
                <span className="text-xs sm:text-sm font-semibold text-gray-600 block">
                  EMERGENCY
                </span>
                <div className="text-blue-600 font-bold text-sm sm:text-base">
                  (237) 681-812-255
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Icons + Hamburger */}
          <div className="flex items-center gap-5 sm:gap-6">
            <button aria-label="Search" className="text-gray-600 hover:text-blue-600 transition-colors">
              <Search className="w-6 h-6" />
            </button>

            <button
              aria-label="Profile"
              onClick={() => navigate(PATIENT_ROUTES.PATIENTPROFILE)}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              <User className="w-6 h-6" />
            </button>

            <button aria-label="Notifications" className="text-gray-600 hover:text-blue-600 transition-colors">
              <Bell className="w-6 h-6" />
            </button>

            {/* Hamburger Button - only on mobile */}
            <button
              aria-label="Toggle menu"
              className="text-gray-600 hover:text-blue-600 transition-colors md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation - Desktop */}
      <div className="bg-indigo-900 py-3 px-6 shadow-md hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <nav className="flex items-center gap-8 text-white font-medium">
            <NavLink to="/patient/dashboard" current={location.pathname} onClick={closeMobileMenu}>
              Home
            </NavLink>
            <NavLink to="/about" current={location.pathname} onClick={closeMobileMenu}>
              About us
            </NavLink>
            <NavLink to="/services" current={location.pathname} onClick={closeMobileMenu}>
              Services
            </NavLink>
            <NavLink to="/doctors" current={location.pathname} onClick={closeMobileMenu}>
              Doctors
            </NavLink>
            <NavLink to="/contact" current={location.pathname} onClick={closeMobileMenu}>
              Contact
            </NavLink>
          </nav>

          {!isHiddenPath && (
            <button className="bg-blue-400 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-medium transition-colors">
              Book Appointment
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu - Fullscreen overlay */}
      <div
        className={`fixed inset-0 bg-indigo-950/95 backdrop-blur-sm z-40 transition-all duration-300 md:hidden
          ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
      >
        <div className="flex flex-col h-full">
          {/* Close area / header */}
          <div className="flex justify-end p-6">
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-blue-300 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Menu Links */}
          <nav className="flex-1 flex flex-col items-center justify-center gap-10 text-2xl text-white font-medium">
            <MobileNavLink to="/patient/dashboard" current={location.pathname} onClick={closeMobileMenu}>
              Home
            </MobileNavLink>
            <MobileNavLink to="/about" current={location.pathname} onClick={closeMobileMenu}>
              About us
            </MobileNavLink>
            <MobileNavLink to="/services" current={location.pathname} onClick={closeMobileMenu}>
              Services
            </MobileNavLink>
            <MobileNavLink to="/doctors" current={location.pathname} onClick={closeMobileMenu}>
              Doctors
            </MobileNavLink>
            <MobileNavLink to="/contact" current={location.pathname} onClick={closeMobileMenu}>
              Contact
            </MobileNavLink>

            {!isHiddenPath && (
              <button
                className="mt-8 bg-blue-400 hover:bg-blue-500 text-white px-10 py-4 rounded-full font-medium text-xl transition-colors"
                onClick={closeMobileMenu}
              >
                Book Appointment
              </button>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};

// Desktop NavLink
function NavLink({
  to,
  children,
  current,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  current: string;
  onClick?: () => void;
}) {
  const isActive = current === to || current.startsWith(to + "/");
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`transition-colors ${isActive ? "text-blue-300 font-semibold" : "text-white hover:text-blue-300"
        }`}
    >
      {children}
    </Link>
  );
}

// Mobile bigger NavLink
function MobileNavLink({
  to,
  children,
  current,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  current: string;
  onClick?: () => void;
}) {
  const isActive = current === to || current.startsWith(to + "/");
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`transition-colors ${isActive ? "text-blue-300 scale-110" : "hover:text-blue-300"
        }`}
    >
      {children}
    </Link>
  );
}

export default Navbar;