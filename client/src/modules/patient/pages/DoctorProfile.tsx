import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { patientApi } from "@/constants/backend/patient/patient.api";
import { PATIENT_ROUTES } from "@/constants/frontend/patient/patient.routes";
import { toast } from "react-hot-toast";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Review {
  _id: string;
  author: string;
  avatar?: string;
  date: string;
  comment: string;
  rating: number;
}

interface Doctor {
  id: string;
  _id: string;
  name: string;
  profileImage?: string;
  about: string;
  specialization: string;
  qualification: string;
  experience: string;
  reviews?: Review[];
  consultationTime?: {
    start: string;
    end: string;
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        className={`w-3.5 h-3.5 ${s <= rating ? "text-yellow-400" : "text-gray-200"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const PhoneIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
  </svg>
);

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DoctorProfile() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) {
        navigate(PATIENT_ROUTES.HOSPITAL_DEPaRTMENTS);
        return;
      }
      try {
        setLoading(true);
        const res = await patientApi.getDoctorDetails(doctorId);
        if (res.data.success) {
          setDoctor(res.data.data);
        } else {
          toast.error(res.data.message || "Failed to fetch doctor details");
          navigate(-1);
        }
      } catch (error) {
        console.error("Error fetching doctor:", error);
        toast.error("An error occurred while fetching doctor details");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId, navigate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
const handleBookAppointment = (id: string) => {
  navigate(PATIENT_ROUTES.PATIENT_APPOIMENT.replace(":doctorId", id))
}
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a8fd1]"></div>
      </div>
    );
  }

  if (!doctor) return null;

  const reviews = doctor.reviews || [];
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 1);

  const contactCards = [
    { icon: <PhoneIcon />, label: "EMERGENCY", lines: ["(237) 681-812-255", "(237) 666-331-894"], dark: false },
    { icon: <LocationIcon />, label: "LOCATION", lines: ["0123 Some place", "9876 Some country"], dark: true },
    { icon: <EmailIcon />, label: "EMAIL", lines: ["medsync@example.com", "support@medsync.com"], dark: false },
    { icon: <ClockIcon />, label: "WORKING HOURS", lines: [doctor.consultationTime ? `${doctor.consultationTime.start}-${doctor.consultationTime.end}` : "Mon-Sat 09:00-20:00", "Sunday Emergency only"], dark: false },
  ];

  const detailsRows: { label: string; value: string }[] = [
    { label: "Name", value: doctor.name },
    { label: "Specialization", value: doctor.specialization },
    { label: "Qualification", value: doctor.qualification },
    { label: "Experience", value: `${doctor.experience}` },
  ];

  return (
    <div className="font-sans text-gray-800 bg-white">
      <Navbar />

      {/* ── HERO BANNER ── */}
      <section className="relative h-52 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#c8dff0 0%,#9ab8d0 100%)" }} />
        <div className="absolute inset-0 bg-[#0d2b4e]/55" />
        <div className="relative z-10 px-[7%] h-full flex flex-col justify-end pb-7">
          <p className="text-white/60 text-xs mb-2 font-sans">
            Home / Doctors / Profile
          </p>
          <h1 className="text-[clamp(20px,3vw,30px)] font-extrabold text-white leading-tight mb-3">
            A passion for putting patients first.
          </h1>
          <div className="flex items-center gap-5 text-white/75 text-xs font-sans">
            <span className="flex items-center gap-1.5">
              <StarRating rating={5} />
              Expert Care
            </span>
            <span className="flex items-center gap-1.5 capitalize">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              {doctor.specialization}
            </span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1a8fd1]" />
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="px-[7%] py-14 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0">
            {/* Doctor Photo */}
            <div className="mb-8 flex justify-center md:justify-start">
              <div
                className="w-56 h-64 rounded-xl overflow-hidden shadow-md"
                style={{ background: "linear-gradient(180deg,#c8dff0,#a8cce8)" }}
              >
                {doctor.profileImage ? (
                  <img src={doctor.profileImage} alt={doctor.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-end justify-center">
                    <div className="w-36 h-52 rounded-t-[70px]" style={{ background: "rgba(255,255,255,0.3)" }} />
                  </div>
                )}
              </div>
            </div>

            {/* About */}
            <h2 className="text-xl font-bold text-[#0d2b4e] mb-4">About Dr. {doctor.name.split(' ')[0]}</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {doctor.about}
            </p>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="w-full md:w-72 shrink-0 flex flex-col gap-5">

            {/* Details Card */}
            <div className="border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-[#1a8fd1] font-bold text-lg mb-4" style={{ fontFamily: "'Georgia', serif" }}>
                Details
              </h3>
              <div className="flex flex-col gap-3">
                {detailsRows.map((row) => (
                  <div key={row.label}>
                    <p className="text-gray-700 text-sm">
                      <span className="text-gray-500 font-medium">{row.label}:</span>
                      {row.value ? ` ${row.value}` : " -"}
                    </p>
                    <div className="h-px bg-gray-100 mt-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Appointment Button */}
            <button onClick={() => handleBookAppointment(doctor._id)} className="w-full bg-[#dbeeff] text-[#1a8fd1] font-bold text-sm py-3 rounded-lg hover:bg-[#1a8fd1] hover:text-white transition-all cursor-pointer shadow-sm">
              Book Appointment
            </button>

            {/* Copy & Refer Button */}
            <button
              onClick={handleCopy}
              className="w-full bg-[#0d2b4e] text-white font-semibold text-sm py-3 rounded-lg hover:bg-[#163a68] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <CopyIcon />
              {copied ? "Link Copied!" : "Copy Profile Link"}
            </button>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div>
                <p className="text-gray-500 text-xs font-semibold mb-3 tracking-wide uppercase">Patient Reviews</p>
                <div className="flex flex-col gap-4">
                  {visibleReviews.map((review) => (
                    <div key={review._id} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-[#dbeeff] flex items-center justify-center shrink-0 overflow-hidden">
                        {review.avatar ? (
                          <img src={review.avatar} alt={review.author} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-6 h-6 text-[#1a8fd1]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-gray-400 text-[10px] mb-1">{review.date}</p>
                        <p className="text-gray-600 text-xs leading-relaxed mb-1.5">{review.comment}</p>
                        <StarRating rating={review.rating} />
                      </div>
                    </div>
                  ))}
                </div>

                {reviews.length > 1 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="flex items-center gap-1.5 text-[#1a8fd1] text-xs font-semibold mt-3 hover:underline cursor-pointer"
                  >
                    {showAllReviews ? "Show less" : "Show all reviews"}
                    <svg className={`w-3.5 h-3.5 transition-transform ${showAllReviews ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

    

      <Footer />
    </div>
  );
}
