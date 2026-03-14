import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Phone, Calendar, Stethoscope, Hospital, ShieldCheck } from "lucide-react";
import { PATIENT_ROUTES } from "@/constants/frontend/patient/patient.routes";

const HomeLanding = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

const openModal = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  setIsModalOpen(true);
};

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleLogin = () => {
    setIsModalOpen(false);
    navigate("/login/patient");
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Find the Best Hospitals & Experienced Doctors
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                Simple, fast, and reliable healthcare — all in one trusted place.
              </p>
              <p className="text-lg text-blue-50 mb-10 max-w-xl">
                Book appointments, consult online, and manage your health needs easily.
                100% trusted doctors, quality hospitals, and complete safety &
                convenience.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={PATIENT_ROUTES.SELECTHOSPITAL}
                  onClick={openModal}
                  className="bg-blue-400 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-medium text-lg transition-colors shadow-md inline-flex items-center justify-center"
                >
                  Find & Book Now
                </Link>

                <Link
                  to="/about"
                  className="border-2 border-white/40 hover:bg-white/10 text-white px-8 py-4 rounded-full font-medium text-lg transition-colors inline-flex items-center justify-center"
                >
                  Learn More
                </Link>
              </div>
            </div>

            <div className="hidden md:flex justify-center">
              <div className="grid grid-cols-2 gap-8 opacity-90">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-center">
                  <Hospital className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                  <p className="font-semibold text-lg">Top Hospitals</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-center">
                  <Stethoscope className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                  <p className="font-semibold text-lg">Experienced Doctors</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                  <p className="font-semibold text-lg">Easy Booking</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-center">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                  <p className="font-semibold text-lg">100% Trusted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Showcase */}
      <section className="py-16 md:py-20 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Meet Trusted & Experienced Doctors
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with highly qualified specialists who prioritize your
              health and provide compassionate care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="overflow-hidden rounded-2xl shadow-md border border-gray-100">
              <img
                src="https://c8.alamy.com/comp/T4BWXG/portrait-of-smiling-male-doctor-wearing-white-coat-with-stethoscope-in-hospital-office-T4BWXG.jpg"
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="p-4 text-center">
                <p className="font-semibold text-gray-800">Specialist Care</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl shadow-md border border-gray-100">
              <img
                src="https://thumbs.dreamstime.com/b/smiling-female-doctor-using-digital-tablet-modern-clinic-medical-technology-healthcare-innovation-professional-medicine-414911796.jpg"
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="p-4 text-center">
                <p className="font-semibold text-gray-800">Modern & Tech</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl shadow-md border border-gray-100">
              <img
                src="https://thumbs.dreamstime.com/b/diverse-group-medical-professionals-pose-confidently-their-workplace-ready-to-offer-care-healthcare-standing-together-390683584.jpg"
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="p-4 text-center">
                <p className="font-semibold text-gray-800">Expert Team</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl shadow-md border border-gray-100">
              <img
                src="https://thumbs.dreamstime.com/b/confident-group-medical-professionals-healthcare-setting-posing-together-confidence-clinic-exemplifying-team-363415885.jpg"
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="p-4 text-center">
                <p className="font-semibold text-gray-800">Trusted Care</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to={PATIENT_ROUTES.SELECTHOSPITAL || "/doctors"}
              onClick={openModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-medium text-lg transition-colors shadow-md inline-flex items-center"
            >
              Find Your Doctor Now
            </Link>
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="bg-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Need Immediate Help?
          </h2>

          <div className="flex items-center justify-center gap-4 mb-8 text-2xl md:text-3xl font-bold">
            <Phone className="w-10 h-10 text-blue-300" />
            <span>(237) 681-812-255</span>
          </div>

          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Our support team is available 24/7 for emergencies and inquiries.
          </p>

          <Link
            to="/contact"
            onClick={openModal}
            className="bg-blue-400 hover:bg-blue-500 text-white px-10 py-5 rounded-full font-medium text-xl transition-colors inline-block"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* Login Prompt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-[90%] p-8 relative">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Please Login
              </h3>
              <p className="text-gray-600 mb-8">
                You need to be logged in to access this feature. Login now to continue.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition-colors shadow-md"
                >
                  Login Now
                </button>

                <button
                  onClick={closeModal}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-full font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeLanding;