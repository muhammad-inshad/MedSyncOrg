import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAppSelector } from "@/hooks/redux";

const HeartIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <path
      d="M18 31s-13-8.35-13-17A8 8 0 0118 9.24 8 8 0 0131 14c0 8.65-13 17-13 17z"
      fill="#1a8fd1"
      opacity="0.15"
      stroke="#1a8fd1"
      strokeWidth="1.5"
    />
    <path
      d="M18 28s-10-6.4-10-13a6 6 0 0110-4.47A6 6 0 0128 15c0 6.6-10 13-10 13z"
      fill="#1a8fd1"
    />
  </svg>
);
const specialties: string[] = [
  "Neurology", "Bones", "Oncology", "Otorhinolaryngology",
  "Ophthalmology", "Cardiovascular", "Pulmonology", "Renal Medicine",
  "Gastroenterology", "Urology", "Dermatology", "Gynaecology",
];

export default function PatientHospitalHome() {
  const hospital = useAppSelector((state) => state.hospital.hospital);

  return (
    <div className="font-serif text-gray-800 bg-white">
<Navbar/>
      {/* ── HERO ── */}
      <section className="relative flex items-center px-[7%] py-16 overflow-hidden min-h-[320px]"
        style={{ background: "linear-gradient(120deg, #e8f4fb 55%, #c9e5f5 100%)" }}>
        {/* Decorative circle */}
        <div className="absolute rounded-full w-56 h-56 -top-14"
          style={{ right: "28%", background: "rgba(26,143,209,0.10)" }} />

        <div className="max-w-lg z-10">
          <h1 className="text-[clamp(28px,4vw,46px)] font-extrabold text-[#549bec] leading-tight mb-5">
           {hospital?.hospitalName}<br/>
          </h1>
          <h1 className="text-[clamp(28px,4vw,46px)] font-extrabold text-[#0d2b4e] leading-tight mb-5">
            Leading the Way<br />in Medical Excellence
          </h1>
          <button className="bg-[#1a8fd1] text-white font-sans text-sm font-semibold tracking-wide px-7 py-3 rounded cursor-pointer hover:bg-[#1478b0] transition-colors">
            Our Services
          </button>
        </div>

        {/* Doctor image placeholder */}
        <div className="absolute right-[6%] bottom-0 w-[280px] h-[300px] rounded-t-[120px] overflow-hidden flex items-end justify-center"
          style={{ background: "linear-gradient(180deg,#d4eaf7,#b0d4ed)" }}>
             <img 
    src={hospital?.logo}
    alt="Hospital background"
    className="w-full h-full object-cover rounded-t-[120px]"
  />
          <div className="w-full h-[90%] rounded-t-[110px]" style={{ background: "rgba(255,255,255,0.2)" }} />
        </div>
      </section>

      {/* ── WELCOME / ABOUT ── */}
      <section className="px-[7%] py-[72px] bg-white">
        <div className="text-center mb-10">
          <p className="text-[#1a8fd1] font-sans text-xs tracking-[0.15em] font-bold">
            WELCOME TO MEDSYNC
          </p>
          <h2 className="text-[clamp(22px,3vw,34px)] font-extrabold text-[#0d2b4e] mt-2 mb-4">
            A Great Place to Receive Care
          </h2>
          <p className="max-w-lg mx-auto text-gray-500 leading-relaxed font-sans text-sm mb-5">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque placerat
            scelerisque tortor ornare ornare. Convallis felis vitae tortor augue. Velit
            nascetur proin massa in. Consequat faucibus porttitor sit.
          </p>
          <a href="#" className="text-[#1a8fd1] font-sans text-sm font-semibold hover:underline">
            Learn More →
          </a>
        </div>
       <div className="grid grid-cols-2 gap-5 max-w-3xl mx-auto">
  {[
    hospital?.images?.medicalTeam[0],
    hospital?.images?.patientCare[0]
  ].map((imgUrl, i) => (
    <div key={i} className="h-48 rounded-lg overflow-hidden">
      {imgUrl ? (
        <img 
          src={imgUrl} 
          alt={`Image ${i + 1}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
          <span className="text-gray-500 text-sm">No image</span>
        </div>
      )}
    </div>
  ))}
</div>

      </section>

      {/* ── SERVICES ── */}
      <section className="px-[7%] py-[72px] bg-[#f4f8fc]">
        <div className="text-center mb-12">
          <p className="text-[#1a8fd1] font-sans text-xs tracking-[0.15em] font-bold">
            CARE YOU CAN BELIEVE IN
          </p>
          <h2 className="text-[clamp(22px,3vw,34px)] font-extrabold text-[#0d2b4e] mt-2">
            Our Services
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-10 items-center max-w-4xl mx-auto">
          <div>
            <h3 className="font-bold text-[#0d2b4e] text-lg mb-5">
              A passion for putting patients first.
            </h3>
           
            <p className="font-sans text-sm text-gray-500 leading-relaxed">
              MedSync is an all-in-one healthcare platform designed to make medical care simple,
              fast, and accessible for everyone. Whether you're a patient, doctor, or hospital
              admin, MedSync brings everything together in one seamless system.
            </p>
          </div>
       <div className="flex flex-col gap-4">
  {hospital?.images?.services?.map((img, i) => (
    <div
      key={i}
      className="h-36 rounded-lg overflow-hidden"
    >
      <img
        src={img}
        alt={`Service ${i + 1}`}
        className="w-full h-full object-cover rounded-lg"
      />
    </div>
  ))}
</div>
        </div>
      </section>

      {/* ── SPECIALTIES ── */}
      <section className="px-[7%] py-[72px] bg-white">
        <div className="text-center mb-12">
          <p className="text-[#1a8fd1] font-sans text-xs tracking-[0.15em] font-bold">
            ALWAYS CARING
          </p>
          <h2 className="text-[clamp(22px,3vw,34px)] font-extrabold text-[#0d2b4e] mt-2">
            Our Specialties
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-y-8 gap-x-4 max-w-3xl mx-auto">
          {specialties.map((sp) => (
            <div key={sp} className="text-center cursor-pointer group">
              <div className="flex justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <HeartIcon />
              </div>
              <p className="font-sans text-sm text-gray-600">{sp}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOOK APPOINTMENT CTA ── */}
      <section
        className="relative flex items-center gap-10 px-[7%] py-[72px] min-h-[260px] overflow-hidden"
        style={{ background: "linear-gradient(135deg,#1a5f8a 0%,#1a8fd1 100%)" }}
      >
        <div className="absolute left-0 top-0 w-[38%] h-full" style={{ background: "rgba(255,255,255,0.07)" }} />

        <div className="flex-1 z-10">
          <div
            className="w-44 h-56 rounded-t-[90px] mx-auto"
            style={{ background: "rgba(255,255,255,0.15)" }}
          />
        </div>

        <div className="flex-[2] z-10">
          <h2 className="text-[clamp(22px,3vw,36px)] font-extrabold text-white mb-4">
            Book an Appointment
          </h2>
          <p className="font-sans text-sm leading-relaxed max-w-md mb-7"
            style={{ color: "rgba(255,255,255,0.85)" }}>
            MedSync is an all-in-one healthcare platform designed to make medical care simple,
            fast, and accessible for everyone. Whether you're a patient, doctor, or hospital
            admin, MedSync brings everything together in one seamless system.
          </p>
          <button className="bg-white text-[#1a8fd1] font-sans text-sm font-bold px-8 py-3.5 rounded hover:bg-gray-100 transition-colors cursor-pointer">
            Book Appointment
          </button>
        </div>
      </section>

  
      <Footer/>
    </div>
  );
}