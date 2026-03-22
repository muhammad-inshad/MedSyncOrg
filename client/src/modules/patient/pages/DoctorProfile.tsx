import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { patientApi } from "@/constants/backend/patient/patient.api";
import { PATIENT_ROUTES } from "@/constants/frontend/patient/patient.routes";
import { toast } from "react-hot-toast";

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
  consultationTime?: { start: string; end: string };
}

// ── Sub-components ─────────────────────────────────────────────────────────

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

// ── Main Component ─────────────────────────────────────────────────────────

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
    navigate(PATIENT_ROUTES.PATIENT_APPOIMENT.replace(":doctorId", id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a8fd1]" />
          <p className="text-sm text-gray-400">Loading doctor profile…</p>
        </div>
      </div>
    );
  }

  if (!doctor) return null;

  const reviews = doctor.reviews || [];
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 2);
  const avgRating =
    reviews.length > 0
      ? Math.round(reviews.reduce((a, r) => a + r.rating, 0) / reviews.length)
      : 5;

  const workingHours = doctor.consultationTime
    ? `${doctor.consultationTime.start} – ${doctor.consultationTime.end}`
    : "Mon–Sat  09:00 – 20:00";

  return (
    <div className="font-sans text-gray-800 bg-[#f5f9fd] min-h-screen">
      <Navbar />

      {/* ── HERO BANNER ── */}
      <section className="relative h-56 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg,#0d2b4e 0%,#1a5a8a 60%,#1a8fd1 100%)" }}
        />
        {/* subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative z-10 h-full flex flex-col justify-end px-[7%] pb-8">
          <p className="text-white/50 text-xs mb-2 tracking-widest uppercase">
            Home &nbsp;/&nbsp; Doctors &nbsp;/&nbsp; Profile
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
            A passion for putting patients first.
          </h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1a8fd1]" />
      </section>

      {/* ── PROFILE IDENTITY STRIP ── */}
      {/* Overlaps the hero slightly on desktop */}
      <div className="px-[7%] -mt-0 pt-8 pb-0 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6">
          {/* Avatar */}
          <div
            className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg shrink-0 border-4 border-white"
            style={{ background: "linear-gradient(180deg,#c8dff0,#a8cce8)" }}
          >
            {doctor.profileImage ? (
              <img
                src={doctor.profileImage}
                alt={doctor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-end justify-center">
                <div
                  className="w-20 h-24 rounded-t-full"
                  style={{ background: "rgba(255,255,255,0.35)" }}
                />
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-extrabold text-[#0d2b4e] leading-tight">
               {doctor.name}
            </h2>
            <p className="text-[#1a8fd1] font-semibold text-sm mt-0.5">
              {doctor.specialization}
            </p>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-[#f0f8ff] px-2.5 py-1 rounded-full">
                🎓 {doctor.qualification}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-[#f0f8ff] px-2.5 py-1 rounded-full">
                🩺 {doctor.experience} experience
              </span>
              {reviews.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-[#f0f8ff] px-2.5 py-1 rounded-full">
                  <StarRating rating={avgRating} />
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#1a8fd1] text-[#1a8fd1] text-sm font-semibold hover:bg-[#f0f8ff] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
              {copied ? "Copied!" : "Share"}
            </button>
            <button
              onClick={() => handleBookAppointment(doctor.id)}
              className="px-5 py-2.5 rounded-lg bg-[#1a8fd1] text-white text-sm font-bold hover:bg-[#1478b3] transition-colors shadow-md"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <section className="px-[7%] py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT / MAIN COLUMN (2/3) ── */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* About Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
              <h3 className="text-[#0d2b4e] font-bold text-base mb-4 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-[#1a8fd1] inline-block" />
                About Dr. {doctor.name.split(" ")[0]}
              </h3>
              <p className="text-gray-600 text-sm leading-7 whitespace-pre-wrap">
                {doctor.about}
              </p>
            </div>

            {/* Contact Info Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
              <h3 className="text-[#0d2b4e] font-bold text-base mb-5 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-[#1a8fd1] inline-block" />
                Contact &amp; Hours
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    ),
                    label: "Emergency",
                    lines: ["(237) 681-812-255", "(237) 666-331-894"],
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    ),
                    label: "Location",
                    lines: ["0123 Some place", "9876 Some country"],
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    ),
                    label: "Email",
                    lines: ["medsync@example.com", "support@medsync.com"],
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    label: "Working Hours",
                    lines: [workingHours, "Sunday: Emergency only"],
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="flex items-start gap-3 p-4 rounded-xl bg-[#f5f9fd] border border-[#e2eff9]"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#dbeeff] flex items-center justify-center text-[#1a8fd1] shrink-0">
                      {card.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        {card.label}
                      </p>
                      {card.lines.map((line) => (
                        <p key={line} className="text-gray-700 text-xs leading-5">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[#0d2b4e] font-bold text-base flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full bg-[#1a8fd1] inline-block" />
                    Patient Reviews
                  </h3>
                  <span className="text-xs text-gray-400">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex flex-col gap-4">
                  {visibleReviews.map((review) => (
                    <div
                      key={review._id}
                      className="flex gap-4 items-start p-4 bg-[#f5f9fd] rounded-xl border border-[#e2eff9]"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#dbeeff] flex items-center justify-center shrink-0 overflow-hidden border-2 border-white shadow-sm">
                        {review.avatar ? (
                          <img src={review.avatar} alt={review.author} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-5 h-5 text-[#1a8fd1]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-[#0d2b4e]">{review.author}</p>
                          <p className="text-[10px] text-gray-400">{review.date}</p>
                        </div>
                        <p className="text-gray-600 text-xs leading-relaxed mb-2">{review.comment}</p>
                        <StarRating rating={review.rating} />
                      </div>
                    </div>
                  ))}
                </div>
                {reviews.length > 2 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="mt-4 flex items-center gap-1.5 text-[#1a8fd1] text-xs font-semibold hover:underline"
                  >
                    {showAllReviews ? "Show less" : `Show all ${reviews.length} reviews`}
                    <svg
                      className={`w-3.5 h-3.5 transition-transform ${showAllReviews ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR (1/3) ── */}
          <div className="flex flex-col gap-6">

            {/* Quick Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-[#0d2b4e] font-bold text-base mb-4 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-[#1a8fd1] inline-block" />
                Quick Details
              </h3>
              <dl className="flex flex-col gap-3">
                {[
                  { label: "Full Name", value: doctor.name },
                  { label: "Specialization", value: doctor.specialization },
                  { label: "Qualification", value: doctor.qualification },
                  { label: "Experience", value: doctor.experience },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col">
                    <dt className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {row.label}
                    </dt>
                    <dd className="text-gray-700 text-sm font-medium mt-0.5">
                      {row.value || "—"}
                    </dd>
                    <div className="h-px bg-gray-100 mt-2" />
                  </div>
                ))}
              </dl>
            </div>

            {/* Book Appointment CTA Card */}
            <div className="bg-[#0d2b4e] rounded-2xl p-6 text-white shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-[#1a8fd1]/30 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[#7dd3fc]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <p className="font-bold text-base mb-1">Ready to consult?</p>
              <p className="text-white/60 text-xs mb-5 leading-relaxed">
                Schedule a session with Dr. {doctor.name.split(" ")[0]} at your convenience.
              </p>
              <button
                onClick={() => handleBookAppointment(doctor.id)}
                className="w-full bg-[#1a8fd1] hover:bg-[#1478b3] text-white font-bold text-sm py-3 rounded-xl transition-colors shadow-md"
              >
                Book Appointment
              </button>
            </div>

            {/* Working Hours Highlight */}
            <div className="bg-[#dbeeff] rounded-2xl p-5 border border-[#b8d9f5]">
              <p className="text-[10px] font-bold text-[#1a8fd1] uppercase tracking-widest mb-2">
                Consultation Hours
              </p>
              <p className="text-[#0d2b4e] font-bold text-sm">{workingHours}</p>
              <p className="text-gray-500 text-xs mt-1">Sunday: Emergency only</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}