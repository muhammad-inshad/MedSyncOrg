import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAppSelector } from "@/hooks/redux";

export default function HospitalAbout() {
  const hospital = useAppSelector((state) => state.hospital.hospital);
  const hospitalName = hospital?.hospitalName ?? "MedSync";

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
          <p className="text-white/70 text-xs mb-1">Home / About Us</p>
          <h1 className="text-3xl font-extrabold text-white">About Us</h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1a8fd1]" />
      </section>

      {/* ── INTRO ── */}
      <section className="px-[7%] py-16 bg-white text-center">
        <p className="text-[#1a8fd1] text-xs tracking-[0.15em] font-bold mb-2">
          LEARN MORE ABOUT US
        </p>
        <h2 className="text-[clamp(22px,3vw,34px)] font-extrabold text-[#0d2b4e] mb-6">
          Welcome to {hospitalName}
        </h2>
        <p className="max-w-3xl mx-auto text-gray-500 text-sm leading-relaxed mb-6">
          At {hospitalName}, we believe in providing exceptional, compassionate care that puts patients first. 
          Our facility is equipped with state-of-the-art technology and staffed by highly trained medical professionals 
          dedicated to ensuring your health and well-being.
        </p>
        <p className="max-w-3xl mx-auto text-gray-500 text-sm leading-relaxed">
          Through the MedSync platform, we aim to make healthcare seamless and accessible. 
          Whether you need an urgent consultation, a routine check-up, or specialized care, 
          we are here for you every step of the way.
        </p>
      </section>

      {/* ── STATS / INFO ── */}
      <section className="px-[7%] py-16 bg-[#f4f8fc]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-4xl font-extrabold text-[#1a8fd1] mb-2">15+</h3>
            <p className="font-bold text-[#0d2b4e] mb-2">Years of Experience</p>
            <p className="text-gray-500 text-xs">Providing quality healthcare to our community.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-4xl font-extrabold text-[#1a8fd1] mb-2">24/7</h3>
            <p className="font-bold text-[#0d2b4e] mb-2">Emergency Care</p>
            <p className="text-gray-500 text-xs">Always ready to serve you in times of need.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-4xl font-extrabold text-[#1a8fd1] mb-2">50k+</h3>
            <p className="font-bold text-[#0d2b4e] mb-2">Happy Patients</p>
            <p className="text-gray-500 text-xs">Trusted by thousands for their medical needs.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
