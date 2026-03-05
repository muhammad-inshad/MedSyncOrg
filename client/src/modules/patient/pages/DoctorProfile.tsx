import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Review {
  _id: string;
  author: string;
  avatar?: string;
  date: string;
  comment: string;
  rating: number;
}

interface DoctorQualification {
  name: string;
  age?: number;
  degree: string;
  specialist: string;
  graduatedFrom: string;
  experience: string;
}

interface Doctor {
  _id: string;
  name: string;
  image?: string;
  bio: string;
  qualification: DoctorQualification;
  reviews?: Review[];
}

// ── Fallback Data ─────────────────────────────────────────────────────────────

const FALLBACK_DOCTOR: Doctor = {
  _id: "1",
  name: "Dr. Arun Dev",
  bio: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque placerat scelerisque tortor ornare ornare. Quisque placerat scelerisque tortor ornare ornare Convallis felis vitae tortor augue. Velit nascetur proin massa in. Consequat faucibus porttitor enim Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque placerat scelerisque tortor ornare ornare. Quisque placerat scelerisque tortor ornare ornare Convallis felis vitae tortor augue. Velit nascetur proin massa in. Consequat faucibus porttitor enim Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque placerat scelerisque tortor ornare ornare. Quisque placerat scelerisque tortor ornare ornare Convallis felis vitae tortor augue. Velit nascetur proin massa in. Consequat faucibus porttitor enim Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque placerat scelerisque tortor ornare ornare. Quisque placerat scelerisque tortor ornare ornare Convallis felis vitae tortor augue. Velit nascetur proin massa in. Consequat faucibus porttitor enim Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque placerat scelerisque tortor ornare ornare. Quisque placerat scelerisque tortor ornare ornare Convallis felis vitae tortor augue. Velit nascetur proin massa in. Consequat faucibus porttitor enim et.`,
  qualification: {
    name: "arun dev",
    age: 32,
    degree: "MBBS MD",
    specialist: "Psychiatrists",
    graduatedFrom: "indernational university",
    experience: "22 year",
  },
  reviews: [
    {
      _id: "r1",
      author: "Patient",
      date: "22/2/2202",
      comment: "this hospital is very good and service is also good over all is good",
      rating: 4,
    },
    {
      _id: "r2",
      author: "Patient",
      date: "15/3/2024",
      comment: "Excellent doctor, very professional and caring. Highly recommended.",
      rating: 5,
    },
  ],
};

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
  const [copied, setCopied] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // In real usage: const doctor = useAppSelector(...) or receive as prop
  const doctor: Doctor = FALLBACK_DOCTOR;
  const { qualification, reviews = [] } = doctor;

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 1);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const contactCards = [
    { icon: <PhoneIcon />,   label: "EMERGENCY",     lines: ["(237) 681-812-255", "(237) 666-331-894"], dark: false },
    { icon: <LocationIcon />,label: "LOCATION",      lines: ["0123 Some place", "9876 Some country"],   dark: true  },
    { icon: <EmailIcon />,   label: "EMAIL",         lines: ["fildineeeoe@gmil.com", "myebstudios@gmail.com"], dark: false },
    { icon: <ClockIcon />,   label: "WORKING HOURS", lines: ["Mon-Sat 09:00-20:00", "Sunday Emergency only"],  dark: false },
  ];

  const qualRows: { label: string; value: string }[] = [
    { label: "name",             value: qualification.name },
    { label: "age",              value: String(qualification.age ?? "") },
    { label: "degree",           value: qualification.degree },
    { label: "specialist",       value: `- ${qualification.specialist}` },
    { label: "graduated from",   value: `- ${qualification.graduatedFrom}` },
    { label: "experience",       value: `${qualification.experience}` },
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
            Home / News / Health Care
          </p>
          <h1 className="text-[clamp(20px,3vw,30px)] font-extrabold text-white leading-tight mb-3">
            A passion for putting patients first.
          </h1>
          <div className="flex items-center gap-5 text-white/75 text-xs font-sans">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Monday 05, September 2021
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              By Author
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              68
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              86
            </span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1a8fd1]" />
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="px-[7%] py-14 bg-white">
        <div className="max-w-5xl mx-auto flex gap-10 items-start">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0">
            {/* Doctor Photo */}
            <div className="mb-8 flex justify-center">
              <div
                className="w-56 h-64 rounded-xl overflow-hidden shadow-md"
                style={{ background: "linear-gradient(180deg,#c8dff0,#a8cce8)" }}
              >
                {doctor.image ? (
                  <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-end justify-center">
                    <div className="w-36 h-52 rounded-t-[70px]" style={{ background: "rgba(255,255,255,0.3)" }} />
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            <p className="text-gray-600 text-sm leading-relaxed">
              {doctor.bio}
            </p>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="w-72 shrink-0 flex flex-col gap-5">

            {/* Qualification Card */}
            <div className="border border-gray-200 rounded-xl p-5">
              <h3 className="text-[#1a8fd1] font-bold text-lg mb-4" style={{ fontFamily: "'Georgia', serif" }}>
                qulification
              </h3>
              <div className="flex flex-col gap-3">
                {qualRows.map((row) => (
                  <div key={row.label}>
                    <p className="text-gray-700 text-sm">
                      <span className="text-gray-500">{row.label}:</span>
                      {row.value ? ` ${row.value}` : ""}
                    </p>
                    <div className="h-px bg-gray-100 mt-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Appointment Button */}
            <button className="w-full bg-[#dbeeff] text-[#1a8fd1] font-semibold text-sm py-3 rounded-lg hover:bg-[#1a8fd1] hover:text-white transition-colors cursor-pointer">
              Appointment
            </button>

            {/* Copy & Refer Button */}
            <button
              onClick={handleCopy}
              className="w-full bg-[#0d2b4e] text-white font-semibold text-sm py-3 rounded-lg hover:bg-[#163a68] transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <CopyIcon />
              {copied ? "Link Copied!" : "copy and reffer"}
            </button>

            {/* Reviews */}
            <div>
              <p className="text-gray-500 text-xs font-semibold mb-3 tracking-wide">reviews</p>
              <div className="flex flex-col gap-4">
                {visibleReviews.map((review) => (
                  <div key={review._id} className="flex gap-3 items-start">
                    {/* Avatar */}
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
                      <p className="text-gray-400 text-[11px] mb-1">{review.date}</p>
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
                  {showAllReviews ? "show less" : "show more"}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={showAllReviews ? "M4.5 15.75l7.5-7.5 7.5 7.5" : "M8.25 4.5l7.5 7.5-7.5 7.5"} />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="px-[7%] py-16 bg-white">
        <div className="text-center mb-12">
          <p className="text-[#1a8fd1] text-xs tracking-[0.15em] font-bold">GET IN TOUCH</p>
          <h2 className="text-[clamp(22px,3vw,34px)] font-extrabold text-[#0d2b4e] mt-2">
            Contact
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
          {contactCards.map((card, i) => (
            <div
              key={i}
              className={`rounded-lg px-5 py-7 text-center ${
                card.dark ? "bg-[#0d2b4e]" : "bg-[#dbeeff]"
              }`}
            >
              <div className={`flex justify-center mb-3 ${card.dark ? "text-white" : "text-[#1a8fd1]"}`}>
                {card.icon}
              </div>
              <p className={`text-[11px] tracking-widest font-bold mb-2.5 ${card.dark ? "text-white/70" : "text-[#1a8fd1]"}`}>
                {card.label}
              </p>
              {card.lines.map((line, j) => (
                <p key={j} className={`text-xs leading-5 ${card.dark ? "text-white" : "text-gray-600"}`}>
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}