import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAppSelector } from "@/hooks/redux";

// ── Types ─────────────────────────────────────────────────────────────────────

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

interface ContactCardItem {
  icon: JSX.Element;
  label: string;
  lines: string[];
  dark?: boolean;
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

const FALLBACK_DEPARTMENTS: Department[] = [
  { _id: "1",  name: "Neurology",          description: "Expert care for brain, spine, and nervous system disorders.",          icon: "🧠" },
  { _id: "2",  name: "Cardiology",         description: "Comprehensive heart and cardiovascular treatment services.",            icon: "❤️" },
  { _id: "3",  name: "Orthopedics",        description: "Specialized care for bones, joints, muscles, and ligaments.",          icon: "🦴" },
  { _id: "4",  name: "Oncology",           description: "Advanced cancer diagnosis, treatment, and supportive care.",           icon: "🔬" },
  { _id: "5",  name: "Ophthalmology",      description: "Complete eye care from routine checks to complex surgeries.",          icon: "👁️" },
  { _id: "6",  name: "Pulmonology",        description: "Diagnosis and treatment of lung and respiratory conditions.",          icon: "🫁" },
  { _id: "7",  name: "Gastroenterology",   description: "Care for digestive system disorders and gastrointestinal health.",     icon: "🏥" },
  { _id: "8",  name: "Dermatology",        description: "Skin, hair, and nail care from cosmetic to clinical treatment.",       icon: "✨" },
  { _id: "9",  name: "Gynaecology",        description: "Women's health services including obstetrics and gynaecological care.",icon: "🌸" },
  { _id: "10", name: "Urology",            description: "Treatment of urinary tract and male reproductive system conditions.",  icon: "💊" },
  { _id: "11", name: "Otorhinolaryngology",description: "Ear, nose, and throat care and surgical treatments.",                 icon: "👂" },
  { _id: "12", name: "Renal Medicine",     description: "Kidney disease management including dialysis and transplant support.", icon: "🫘" },
];

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

const EmailIcon = ({ white = false }: { white?: boolean }) => (
  <svg className="w-6 h-6" fill="none" stroke={white ? "white" : "currentColor"} strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

export default function HospitalDepartments() {
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);

  const hospital = useAppSelector(
    (state) => state.hospital.hospital
  ) as Hospital | null;

  // Derive values
  const hospitalName  = hospital?.hospitalName ?? "MedSync";
  const departments   = hospital?.departments?.length
    ? hospital.departments
    : FALLBACK_DEPARTMENTS;

  const emergencyNums = hospital?.emergencyNumbers?.length
    ? hospital.emergencyNumbers
    : hospital?.phone
    ? [hospital.phone]
    : ["(237) 681-812-255", "(237) 666-231-894"];

  const addressLines = hospital?.address
    ? [hospital.address]
    : ["0123 Some place", "8876 Some country"];

  const emailLines = hospital?.email
    ? [hospital.email]
    : ["fildineesoe@gmil.com", "myebstudios@gmail.com"];

  const workingHoursLines = hospital?.workingHours
    ? [hospital.workingHours]
    : ["Mon-Sat 09:00-20:00", "Sunday Emergency only"];

  const contactCards: ContactCardItem[] = [
    {
      icon: <PhoneIcon />,
      label: "EMERGENCY",
      lines: emergencyNums,
      dark: false,
    },
    {
      icon: <LocationIcon />,
      label: "LOCATION",
      lines: addressLines,
      dark: true,
    },
    {
      icon: <EmailIcon white />,
      label: "EMAIL",
      lines: emailLines,
      dark: false,
    },
    {
      icon: <ClockIcon />,
      label: "WORKING HOURS",
      lines: workingHoursLines,
      dark: false,
    },
  ];

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
        <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto">
          {departments.map((dept) => (
            <div
              key={dept._id}
              onMouseEnter={() => setHoveredDept(dept._id)}
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

        {/* Showing entries */}
        <p className="text-gray-400 text-xs text-center mt-8">
          Showing {departments.length} departments
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
                className={`w-2.5 h-2.5 rounded-full border-0 cursor-pointer transition-colors ${
                  activeTestimonial === i ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
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
              <p
                className={`text-[11px] tracking-widest font-bold mb-2.5 ${
                  card.dark ? "text-white/70" : "text-[#1a8fd1]"
                }`}
              >
                {card.label}
              </p>
              {card.lines.map((line, j) => (
                <p
                  key={j}
                  className={`text-xs leading-5 ${
                    card.dark ? "text-white" : "text-gray-600"
                  }`}
                >
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