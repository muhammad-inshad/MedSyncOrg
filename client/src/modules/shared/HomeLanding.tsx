import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Phone, Calendar, Stethoscope, Hospital, ShieldCheck } from "lucide-react";
import { PATIENT_ROUTES } from "@/constants/frontend/patient/patient.routes";

const HomeLanding = () => {
  const navigate = useNavigate();

  // 👉 Example auth check (replace with real logic)
  const isLoggedIn = false;

  const handleBooking = () => {
    if (isLoggedIn) {
      navigate(PATIENT_ROUTES.SELECTHOSPITAL);
    } else {
      navigate("/login/patient");
    }
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
                100% trusted doctors, quality hospitals, and complete safety & convenience.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                
                {/* ✅ Fixed Button */}
                <button
                  onClick={handleBooking}
                  className="bg-blue-400 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-medium text-lg transition-colors shadow-md"
                >
                  Find & Book Now
                </button>

                <Link
                  to="/about"
                  className="border-2 border-white/40 hover:bg-white/10 text-white px-8 py-4 rounded-full font-medium text-lg transition-colors inline-flex items-center justify-center"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Cards */}
            <div className="hidden md:flex justify-center">
              <div className="grid grid-cols-2 gap-8 opacity-90">
                
                <div className="bg-white/10 p-6 rounded-2xl text-center">
                  <Hospital className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                  <p className="font-semibold text-lg">Top Hospitals</p>
                </div>

                <div className="bg-white/10 p-6 rounded-2xl text-center">
                  <Stethoscope className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                  <p className="font-semibold text-lg">Experienced Doctors</p>
                </div>

                <div className="bg-white/10 p-6 rounded-2xl text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                  <p className="font-semibold text-lg">Easy Booking</p>
                </div>

                <div className="bg-white/10 p-6 rounded-2xl text-center">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                  <p className="font-semibold text-lg">100% Trusted</p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Meet Trusted & Experienced Doctors
            </h2>
          </div>

          <div className="text-center mt-12">
            
            {/* ✅ Fixed Button */}
            <button
              onClick={handleBooking}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-medium text-lg shadow-md"
            >
              Find Your Doctor Now
            </button>

          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="bg-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          
          <h2 className="text-3xl font-bold mb-6">
            Need Immediate Help?
          </h2>

          <div className="flex items-center justify-center gap-4 mb-8 text-2xl font-bold">
            <Phone className="w-10 h-10 text-blue-300" />
            <span>(237) 681-812-255</span>
          </div>

          <Link
            to="/contact"
            className="bg-blue-400 hover:bg-blue-500 text-white px-10 py-5 rounded-full font-medium text-xl"
          >
            Contact Us
          </Link>

        </div>
      </section>

    </div>
  );
};

export default HomeLanding;