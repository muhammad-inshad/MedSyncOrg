import { useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

interface Doctor {
  name: string;
  specialty: string;
}

const doctors: Doctor[] = [
  { name: "Doctor's Name", specialty: "NEUROLOGY" },
  { name: "Doctor's Name", specialty: "NEUROLOGY" },
  { name: "Doctor's Name", specialty: "NEUROLOGY" },
  { name: "Doctor's Name", specialty: "NEUROLOGY" },
  { name: "Doctor's Name", specialty: "NEUROLOGY" },
  { name: "Doctor's Name", specialty: "NEUROLOGY" },
];

const testimonials = [
  {
    quote:
      "MedSync is an all-in-one healthcare platform designed to make medical care simple, fast, and accessible for everyone. Whether you're a patient, doctor, or hospital admin, MedSync brings everything together in one seamless system..",
    author: "John Doe",
  },
  {
    quote:
      "The platform has transformed how we manage patient care. Scheduling, records, and communication are all in one place — it's a game changer for our clinic.",
    author: "Jane Smith",
  },
  {
    quote:
      "I love how easy it is to book appointments and communicate with my doctor. MedSync made healthcare accessible for my entire family.",
    author: "Mark Johnson",
  },
];

const contactCards = [
  {
    icon: (
      <svg className="w-7 h-7 text-[#1a8fd1]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    label: "EMERGENCY",
    lines: ["(237) 681-812-255", "(237) 666-231-894"],
    dark: false,
  },
  {
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    label: "LOCATION",
    lines: ["0123 Some place", "8876 Some country"],
    dark: true,
  },
  {
    icon: (
      <svg className="w-7 h-7 text-[#1a8fd1]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    label: "EMAIL",
    lines: ["fildineesoe@gmil.com", "myebstudios@gmail.com"],
    dark: false,
  },
  {
    icon: (
      <svg className="w-7 h-7 text-[#1a8fd1]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: "WORKING HOURS",
    lines: ["Mon-Sat 09:00-20:00", "Sunday Emergency only"],
    dark: false,
  },
];

const LinkedInIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
);

export default function PatientDoctor() {
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);

  return (
    <div className="font-sans text-gray-800 bg-white">
 <Navbar/>
      {/* ── HERO BANNER ── */}
      <section className="relative h-44 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d2b4e]/80 to-[#1a8fd1]/60" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg,#c8dff0 0%,#a8cce8 100%)" }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-[#0d2b4e]/50" />
        <div className="relative z-10 px-[7%] h-full flex flex-col justify-end pb-8">
          <p className="text-white/70 text-xs mb-1">Home / Doctors</p>
          <h1 className="text-3xl font-extrabold text-white">Our Doctors</h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1a8fd1]" />
      </section>

      {/* ── DOCTOR GRID ── */}
      <section className="px-[7%] py-16 bg-white">
        <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto mb-6">
          {doctors.map((doc, i) => (
            <div
              key={i}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              {/* Photo */}
              <div
                className="h-52 flex items-end justify-center"
                style={{ background: "linear-gradient(180deg,#c8dff0,#a8cce8)" }}
              >
                <div
                  className="w-28 h-44 rounded-t-[56px]"
                  style={{ background: "rgba(255,255,255,0.3)" }}
                />
              </div>

              {/* Info */}
              <div className="bg-[#dbeeff] px-4 py-3 text-center">
                <p className="text-[#0d2b4e] font-semibold text-sm mb-0.5">{doc.name}</p>
                <p className="text-[#1a8fd1] text-[11px] tracking-widest font-bold mb-2.5">
                  {doc.specialty}
                </p>
                <div className="flex justify-center gap-2.5">
                  {[<LinkedInIcon />, <FacebookIcon />, <InstagramIcon />].map((icon, j) => (
                    <div
                      key={j}
                      className="w-7 h-7 rounded-full bg-[#1a8fd1] flex items-center justify-center text-white cursor-pointer hover:bg-[#0d2b4e] transition-colors"
                    >
                      {icon}
                    </div>
                  ))}
                </div>
              </div>

              {/* Button */}
              <div className="bg-white px-4 py-2.5 text-center">
                <button className="w-full bg-[#0d2b4e] text-white text-sm font-semibold py-2 rounded hover:bg-[#163a68] transition-colors cursor-pointer">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Showing entries info */}
        <p className="text-gray-400 text-xs text-center">Showing 1 to 6 of 32 entries</p>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="relative py-20 overflow-hidden">
        {/* Background */}
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
            {testimonials[activeTestimonial].quote}
          </p>
          <div className="w-12 h-px bg-white/50 mx-auto mb-4" />
          <p className="text-white font-semibold text-sm tracking-wide">
            {testimonials[activeTestimonial].author}
          </p>

          {/* Dots */}
          <div className="flex justify-center gap-2.5 mt-6">
            {testimonials.map((_, i) => (
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
              <div className="flex justify-center mb-3">{card.icon}</div>
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
      <Footer/>
    </div>
  );
}