import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAppSelector } from '@/hooks/redux';
import { patientApi } from '@/constants/backend/patient/patient.api';
import { PATIENT_ROUTES } from '@/constants/frontend/patient/patient.routes';
import { toast } from 'react-hot-toast';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';

interface DaySlot {
  day: string;
  date: number;
  fullDate: Date;
  status: "Available" | "Filling Fast" | "Fully Booked";
  bookedTokens: number;
  maxTokens: number;
}

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  consultationTime?: {
    start: string;
    end: string;
  };
  hospital_id?: string;
  payment?: {
    patientsPerDayLimit: number;
  };
}

const statusStyle: Record<DaySlot["status"], string> = {
  Available: "text-green-500 bg-green-50 border-green-200",
  "Filling Fast": "text-orange-500 bg-orange-50 border-orange-200",
  "Fully Booked": "text-red-500 bg-red-50 border-red-300",
};

export default function PatientAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { profileData } = useAppSelector((state) => state.auth);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [hospitalName, setHospitalName] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [weekDaysAvailability, setWeekDaysAvailability] = useState<DaySlot[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const [serviceType, setServiceType] = useState<"offline" | "online">("offline");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cash">("online");

  const [form, setForm] = useState({
    fullName: "",
    age: "",
    phone: "",
    email: "",
    address: "",
    bloodPressure: "",
    heartRate: "",
    weight: "",
  });

  // Pre-fill form from Redux
  useEffect(() => {
    if (profileData) {
      setForm({
        fullName: profileData.name || "",
        age: String(profileData.age || ""),
        phone: String(profileData.phone || ""),
        email: profileData.email || "",
        address: profileData.address || "",
        bloodPressure: "",
        heartRate: "",
        weight: "",
      });
    }
  }, [profileData]);

  // Fetch Doctor Details
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
          if (res.data.data.hospital_id) {
            const hospitalRes = await patientApi.get_hospital(res.data.data.hospital_id);
            if (hospitalRes.data.success) {
              setHospitalName(hospitalRes.data.data.hospitalName);
            }
          }
        } else {
          toast.error("Doctor details not found");
          navigate(-1);
        }
      } catch (error) {
        console.error("Error fetching doctor:", error);
        toast.error("Failed to load doctor details");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId, navigate]);

  // Fetch Availability for the whole week
  useEffect(() => {
    const fetchWeekAvailability = async () => {
      if (!doctorId) return;
      try {
        setAvailabilityLoading(true);
        const dates = Array.from({ length: 7 }).map((_, i) => addDays(startOfToday(), i));

        const availabilityPromises = dates.map(date =>
          patientApi.getAvailableSlots(doctorId, format(date, 'yyyy-MM-dd'))
        );

        const results = await Promise.all(availabilityPromises);

        const availabilityData: DaySlot[] = results.map((res, i) => {
          const { tokenInfo } = res.data.data;
          return {
            day: format(dates[i], 'EEE'),
            date: dates[i].getDate(),
            fullDate: dates[i],
            status: tokenInfo.status,
            bookedTokens: tokenInfo.bookedTokens,
            maxTokens: tokenInfo.maxTokens
          };
        });

        setWeekDaysAvailability(availabilityData);
      } catch (error) {
        console.error("Error fetching week availability:", error);
        toast.error("Failed to fetch doctor availability");
      } finally {
        setAvailabilityLoading(false);
      }
    };
    fetchWeekAvailability();
  }, [doctorId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBooking = async () => {
    const currentAvailability = weekDaysAvailability.find(d => isSameDay(d.fullDate, selectedDate));

    if (currentAvailability?.status === "Fully Booked") {
      toast.error("Doctor is fully booked for this date");
      return;
    }

    if (!form.fullName || !form.phone || !form.email) {
      toast.error("Please fill in required patient information");
      return;
    }

    try {
      const bookingData = {
        doctorId,
        hospitalId: doctor?.hospital_id,
        appointmentDate: selectedDate.toISOString(),
        mode: serviceType,
        patientDetails: {
          ...form,
          age: Number(form.age)
        }
      };

      const res = await patientApi.bookAppointment(bookingData);
      if (res.data.success) {
        toast.success("Appointment booked successfully!");
        navigate(PATIENT_ROUTES.PATIENTPROFILE);
      } else {
        toast.error(res.data.message || "Booking failed");
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.response?.data?.message || "An error occurred while booking");
    }
  };

  const selectedAvailability = weekDaysAvailability.find(d => isSameDay(d.fullDate, selectedDate));

  const inputCls =
    "w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1a8fd1] bg-white";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a8fd1]"></div>
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-800 bg-white">
      <Navbar />
      {/* ── HERO BANNER ── */}
      <section className="relative h-44 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#c8dff0 0%,#a8cce8 100%)" }} />
        <div className="absolute inset-0 bg-[#0d2b4e]/45" />
        <div className="relative z-10 px-[7%] h-full flex flex-col justify-end pb-8">
          <p className="text-white/70 text-xs mb-1">Home / Appointment</p>
          <h1 className="text-3xl font-extrabold text-white">Book an Appointment</h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1a8fd1]" />
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="px-[5%] py-12 bg-[#f4f8fc]">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT: Patient Information ── */}
          <div className="w-full lg:w-[420px] shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-[#1a8fd1]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              <h2 className="font-bold text-[#0d2b4e] text-sm">Patient Information</h2>
            </div>
            <p className="text-gray-400 text-xs mb-5">Enter your personal details</p>

            <div className="flex flex-col gap-3">
              {[
                { label: "Full Name", name: "fullName", type: "text" },
                { label: "Age", name: "age", type: "number" },
                { label: "Phone Number", name: "phone", type: "tel" },
                { label: "Email Address", name: "email", type: "email" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    name={f.name}
                    value={form[f.name as keyof typeof form]}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs text-gray-500 mb-1">Address</label>
                <textarea
                  name="address"
                  rows={2}
                  value={form.address}
                  onChange={handleChange}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Blood Pressure", name: "bloodPressure" },
                  { label: "Heart Rate", name: "heartRate" },
                  { label: "Weight", name: "weight" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">{f.label}</label>
                    <input
                      type="text"
                      name={f.name}
                      value={form[f.name as keyof typeof form]}
                      onChange={handleChange}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>

              {/* Doctor and Hospital */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-[10px] uppercase font-bold text-blue-400 mb-2">Doctor & Hospital</p>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-bold text-[#0d2b4e]">{doctor?.name}</p>
                  <p className="text-xs text-[#0d2b4e]/70">{doctor?.specialization}</p>
                  <p className="text-xs text-blue-600 mt-1">{hospitalName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Calendar + Appointment Details ── */}
          <div className="flex-1 flex flex-col gap-5 w-full">

            {/* Week Calendar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-x-auto">
              {availabilityLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1a8fd1]"></div>
                </div>
              ) : (
                <div className="flex gap-2 justify-between min-w-[500px]">
                  {weekDaysAvailability.map((d) => {
                    const isSelected = isSameDay(selectedDate, d.fullDate);
                    return (
                      <button
                        key={d.fullDate.toISOString()}
                        onClick={() => setSelectedDate(d.fullDate)}
                        className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg border transition-all cursor-pointer flex-1 ${isSelected
                          ? "border-[#1a8fd1] bg-[#1a8fd1] text-white shadow-md font-bold"
                          : "border-gray-100 bg-white hover:border-[#1a8fd1]/40"
                          }`}
                      >
                        <span className={`text-[11px] font-medium ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                          {d.day}
                        </span>
                        <span className={`text-xl font-extrabold leading-none ${isSelected ? "text-white" : "text-[#0d2b4e]"}`}>
                          {d.date}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${isSelected
                          ? "bg-white/20 border-white/30 text-white"
                          : statusStyle[d.status]
                          }`}>
                          {d.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Appointment Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#1a8fd1]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <h3 className="font-bold text-[#0d2b4e] text-sm">Appointment Details</h3>
                </div>
                {doctor?.consultationTime && (
                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                    Consultation: {doctor.consultationTime.start} - {doctor.consultationTime.end}
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-5">Token-based booking for {format(selectedDate, 'MMMM d, yyyy')}</p>

              {/* Token Info */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Next Token</p>
                  <p className="text-3xl font-black text-[#0d2b4e]">
                    {selectedAvailability ? selectedAvailability.bookedTokens + 1 : '--'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Daily Limit</p>
                  <p className="text-3xl font-black text-[#0d2b4e]">
                    {selectedAvailability ? selectedAvailability.maxTokens : '--'}
                  </p>
                </div>
              </div>

              {/* Service Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-3 uppercase">Service Type</label>
                  <div className="flex flex-col gap-2">
                    {(["offline", "online"] as const).map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer group">
                        <div
                          onClick={() => setServiceType(type)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${serviceType === type ? "border-[#1a8fd1]" : "border-gray-300 group-hover:border-gray-400"
                            }`}
                        >
                          {serviceType === type && <div className="w-2.5 h-2.5 rounded-full bg-[#1a8fd1]" />}
                        </div>
                        <span className="text-sm text-gray-700 capitalize">{type} Consultation</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-3 uppercase">Payment Method</label>
                  <div className="flex flex-col gap-2">
                    {(["online", "cash"] as const).map((method) => (
                      <label key={method} className="flex items-center gap-2 cursor-pointer group">
                        <div
                          onClick={() => setPaymentMethod(method)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${paymentMethod === method ? "border-[#1a8fd1]" : "border-gray-300 group-hover:border-gray-400"
                            }`}
                        >
                          {paymentMethod === method && <div className="w-2.5 h-2.5 rounded-full bg-[#1a8fd1]" />}
                        </div>
                        <span className="text-sm text-gray-700 capitalize">Pay {method === 'online' ? 'Online' : 'with Cash'}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-1.5 px-5 py-2.5 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  ← Cancel
                </button>
                <button
                  onClick={handleBooking}
                  className="flex items-center gap-2 px-8 py-2.5 bg-[#1a8fd1] text-white rounded text-sm font-bold hover:bg-[#1478b0] transition-all cursor-pointer shadow-md disabled:opacity-50"
                  disabled={availabilityLoading || selectedAvailability?.status === "Fully Booked"}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {selectedAvailability?.status === "Fully Booked" ? 'Fully Booked' : 'Confirm Appointment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
