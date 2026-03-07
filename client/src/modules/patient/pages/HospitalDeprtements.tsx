import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { getHospitalSession } from "@/utils/session";
import { loadHospitalData } from "@/store/selectedHospital/authThunk";
import Pagination from "@/components/Pagination";
import { useNavigate } from "react-router-dom";
import { PATIENT_ROUTES } from "@/constants/frontend/patient/patient.routes";

interface Department {
  _id: string;
  name: string;
  description: string;
  image?: string;
  doctorCount?: number;
  icon?: string;
}

interface Testimonial {
  quote: string;
  author: string;
}



interface Hospital {
  _id: string;
  hospitalName: string;
  logo: string;
  departments?: Department[];
  phone?: string;
  address?: string;
  email?: string;
  workingHours?: string;
  emergencyNumbers?: string[];
}

// ── Fallback Data ─────────────────────────────────────────────────────────────



const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    quote: "MedSync is an all-in-one healthcare platform designed to make medical care simple, fast, and accessible for everyone. Whether you're a patient, doctor, or hospital admin, MedSync brings everything together in one seamless system.",
    author: "John Doe",
  },
  {
    quote: "The department specialists here are world-class. From my first consultation to full recovery, every step was handled with professionalism and genuine care.",
    author: "Sarah Williams",
  },
  {
    quote: "I was nervous about my diagnosis, but the oncology team walked me through every step. I felt supported throughout my entire treatment journey.",
    author: "Michael Chen",
  },
];

// ── SVG Icons ─────────────────────────────────────────────────────────────────


const ArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

export default function HospitalDepartments() {
  const dispatch = useAppDispatch();
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 6;
  const navigate = useNavigate()
  const handileDepartment = (id: string) => {
  navigate(PATIENT_ROUTES.HOSPITAL_DOCTOR.replace(":departmentId", id));
};

  const hospital = useAppSelector(
    (state) => state.hospital.hospital
  ) as (Hospital & { totalPages: number; totalDepartments: number }) | null;

  const searchQuery = useAppSelector((state) => state.search.query);

  useEffect(() => {
    const hospitalId = getHospitalSession();
    if (hospitalId) {
      dispatch(loadHospitalData({
        hospitalId,
        page: currentPage,
        limit,
        search: searchQuery
      }));
    }
    
  }, [dispatch, currentPage, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const hospitalName = hospital?.hospitalName ?? "MedSync";
  const departments = hospital?.departments && hospital.departments.length > 0
    ? hospital.departments
    : [];

  const totalPages = hospital?.totalPages ?? 1;
  const totalDepartments = hospital?.totalDepartments ?? 0;

  return (
    <div className="font-sans text-gray-800 bg-white">
      <Navbar />

      {/* ── HERO BANNER ── */}
      <section className="relative h-44 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg,#c8dff0 0%,#a8cce8 100%)" }}
        />
        <div className="absolute inset-0 bg-[#0d2b4e]/50" />
        <div className="relative z-10 px-[7%] h-full flex flex-col justify-end pb-8">
          <p className="text-white/70 text-xs mb-1">Home / Departments</p>
          <h1 className="text-3xl font-extrabold text-white">Our Departments</h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1a8fd1]" />
      </section>

      {/* ── INTRO ── */}
      <section className="px-[7%] py-12 bg-white text-center">
        <p className="text-[#1a8fd1] text-xs tracking-[0.15em] font-bold mb-2">
          SPECIALIZED CARE
        </p>
        <h2 className="text-[clamp(22px,3vw,34px)] font-extrabold text-[#0d2b4e] mb-4">
          World-Class Medical Departments
        </h2>
        <p className="max-w-xl mx-auto text-gray-500 text-sm leading-relaxed">
          {hospitalName} offers a wide range of specialized medical departments, each
          staffed by highly experienced professionals dedicated to delivering the
          best possible patient outcomes.
        </p>
      </section>

      {/* ── DEPARTMENTS GRID ── */}
      <section className="px-[7%] pb-16 bg-white">
        {departments.length > 0 ? (
          <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto">
            {departments.map((dept) => (
              <div
                key={dept._id}
                onMouseEnter={() => setHoveredDept(dept._id)}
                onClick={() => handileDepartment(dept._id)}
                onMouseLeave={() => setHoveredDept(null)}
                className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                {/* Image / Icon area */}
                <div
                  className="h-44 overflow-hidden relative flex items-center justify-center"
                  style={{
                    background: hoveredDept === dept._id
                      ? "linear-gradient(135deg,#1a5f8a,#1a8fd1)"
                      : "linear-gradient(180deg,#dbeeff,#c8dff0)",
                  }}
                >
                  {dept.image ? (
                    <img
                      src={dept.image}
                      alt={dept.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-6xl select-none">{dept.icon ?? "🏥"}</span>
                  )}

                  {/* Doctor count badge */}
                  {dept.doctorCount !== undefined && (
                    <div className="absolute top-3 right-3 bg-white/90 text-[#1a8fd1] text-[11px] font-bold px-2.5 py-1 rounded-full">
                      {dept.doctorCount} Doctors
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="px-5 py-4">
                  <h3 className="font-bold text-[#0d2b4e] text-base mb-1.5">{dept.name}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-4">{dept.description}</p>
                  <button className="flex items-center gap-2 text-[#1a8fd1] text-xs font-semibold hover:gap-3 transition-all">
                    Learn More <ArrowIcon />
                  </button>
                </div>

                {/* Bottom accent */}
                <div
                  className="h-1 transition-all duration-300"
                  style={{
                    background: hoveredDept === dept._id
                      ? "linear-gradient(90deg,#1a8fd1,#0d2b4e)"
                      : "#dbeeff",
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-lg">No departments found matching your search.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 mb-4 max-w-5xl mx-auto">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Showing entries status */}
        <p className="text-gray-400 text-xs text-center mt-6">
          Showing {departments.length} of {totalDepartments} departments
          {searchQuery && ` for "${searchQuery}"`}
        </p>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg,#b8d4e8 0%,#8ab0cc 100%)" }}
        />
        <div className="absolute inset-0 bg-[#0d2b4e]/55" />

        <div className="relative z-10 max-w-xl mx-auto text-center px-6">
          {/* Quote marks */}
          <div className="flex justify-center mb-6">
            <svg className="w-10 h-8 text-white/80" fill="currentColor" viewBox="0 0 40 30">
              <path d="M0 30V18C0 8 6 2 18 0l2 4C12 6 9 10 9 15h7v15H0zm22 0V18C22 8 28 2 40 0l2 4C34 6 31 10 31 15h7v15H22z" />
            </svg>
          </div>

          <p className="text-white text-sm leading-relaxed mb-6 font-serif italic">
            {FALLBACK_TESTIMONIALS[activeTestimonial].quote}
          </p>
          <div className="w-12 h-px bg-white/50 mx-auto mb-4" />
          <p className="text-white font-semibold text-sm tracking-wide">
            {FALLBACK_TESTIMONIALS[activeTestimonial].author}
          </p>

          {/* Dots */}
          <div className="flex justify-center gap-2.5 mt-6">
            {FALLBACK_TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`w-2.5 h-2.5 rounded-full border-0 cursor-pointer transition-colors ${activeTestimonial === i ? "bg-white" : "bg-white/40"
                  }`}
              />
            ))}
          </div>
        </div>
      </section >



      <Footer />
    </div >
  );
}