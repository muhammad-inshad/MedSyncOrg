import React, { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { PatientService } from "../services/patient.service";
import Pagination from "@/components/Pagination";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { loadHospitalData } from "@/store/selectedHospital/authThunk";
import { useNavigate } from "react-router-dom";
import { PATIENT_ROUTES } from "@/constants/frontend/patient/patient.routes";
import type { HospitalResponseDTO } from "@/dto/hospital/HospitalResponseDTO";



const SelectHospital: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState<HospitalResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 6;

  const searchQuery = useAppSelector((state) => state.search.query);

  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);

      try {
        const response = await PatientService.getHospitals(
          currentPage,
          itemsPerPage,
          searchQuery
        );

        if (response.success) {
          setHospitals(response.data.hospitals ?? []);
          setTotalPages(response.data.totalPages ?? 1);
        }
      } catch (error) {
        console.error("Failed to fetch hospitals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [currentPage, searchQuery]);

  const handleSelectHospital = async (hospitalId: string) => {
    if (selecting) return;
console.log(hospitalId,"hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
    setSelecting(true);

    try {
      // store hospital id in session
      sessionStorage.setItem("hospitalId", hospitalId);

      // load hospital data
      await dispatch(loadHospitalData(hospitalId));

      // navigate to hospital homepage
      navigate(PATIENT_ROUTES.HOSPITAL_HOMEPAGE);
    } catch (error) {
      console.error("Failed to load hospital:", error);
    } finally {
      setSelecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 w-full">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
          </div>
        ) : (
          <>
            {/* Hospitals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {hospitals.map((hospital) => (
                <div
                  key={hospital._id}
                  onClick={() =>
                    !selecting && handleSelectHospital(hospital._id)
                  }
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col h-full"
                >
                  <div className="h-48 sm:h-52 overflow-hidden bg-gray-200">
                    <img
                      src={
                        hospital.logo ||
                        "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&h=250&fit=crop"
                      }
                      alt={hospital.hospitalName}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-5 sm:p-6 flex flex-col flex-grow">
                    <h3 className="text-lg sm:text-xl font-semibold text-indigo-900 mb-3 capitalize">
                      {hospital.hospitalName}
                    </h3>

                    <p className="text-gray-600 text-sm sm:text-base mb-4 leading-relaxed line-clamp-3 flex-grow">
                      {hospital.about || "No description available."}
                    </p>

                    <div className="flex items-start gap-2 text-gray-500 text-sm sm:text-base mt-auto">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0" />
                      <span className="capitalize">
                        {hospital.address || "Location not provided"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {hospitals.length > 0 ? (
              <div className="mt-10 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500 text-lg">
                {searchQuery
                  ? `No hospitals found for "${searchQuery}"`
                  : "No hospitals available at the moment"}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SelectHospital;