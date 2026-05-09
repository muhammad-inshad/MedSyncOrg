import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAppSelector } from '@/hooks/redux';
import { patientApi } from '@/constants/backend/patient/patient.api';
import { PATIENT_ROUTES } from '@/constants/frontend/patient/patient.routes';
import { toast } from 'react-hot-toast';
import { format, addDays, startOfToday, isSameDay, parseISO } from 'date-fns';
import { Calendar, Moon, Sun, Sunset } from 'lucide-react';
import { getHospitalSession } from '@/utils/session';

interface Slot {
  id: string;
  session: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  tokenPerDay: number;
  slotDuration?: number;
}

interface DaySlot {
  day: string;
  date: number;
  fullDate: Date;
  status: "Available" | "Filling Fast" | "Fully Booked";
  bookedTokens: Record<"morning" | "afternoon" | "evening", number>;
  totalTokens: Record<"morning" | "afternoon" | "evening", number>;
  rawSlots: Slot[];
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  consultationTime?: {
    start: string;
    end: string;
  };
  hospital_id?: string;
}

const statusStyle: Record<DaySlot["status"], string> = {
  Available: "text-green-500 bg-green-50 border-green-200",
  "Filling Fast": "text-orange-500 bg-orange-50 border-orange-200",
  "Fully Booked": "text-red-500 bg-red-50 border-red-300",
};

const sessionConfig = {
  morning: {
    label: "Morning",
    Icon: Sun,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    selectedBorder: "border-amber-400",
    selectedBg: "bg-amber-50/60",
  },
  afternoon: {
    label: "Afternoon",
    Icon: Sunset,
    iconColor: "text-sky-500",
    iconBg: "bg-sky-50",
    selectedBorder: "border-sky-400",
    selectedBg: "bg-sky-50/60",
  },
  evening: {
    label: "Evening",
    Icon: Moon,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-50",
    selectedBorder: "border-indigo-400",
    selectedBg: "bg-indigo-50/60",
  },
} as const;

type SessionKey = keyof typeof sessionConfig;

export default function PatientAppointment() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { profileData } = useAppSelector((state) => state.auth);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [hospitalName, setHospitalName] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [pickerBaseDate, setPickerBaseDate] = useState<Date>(startOfToday());
  const [weekDaysAvailability, setWeekDaysAvailability] = useState<DaySlot[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const [selectedSession, setSelectedSession] = useState<SessionKey | null>(null);
  const [availableSessionsForDay, setAvailableSessionsForDay] = useState<SessionKey[]>([]);

  const [serviceType, setServiceType] = useState<"offline" | "online">("offline");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cash">("online");

  const [totalfee, setTotalFee] = useState<number | null>(null);

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
        console.error(error);
        toast.error("Failed to load doctor details");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId, navigate]);
useEffect(() => {
  const fetchDoctorFee = async () => {
    if (!doctorId || !doctor) return;

    try {
      const res = await patientApi.getDoctorfee(doctorId);

      if (res.data.success) {

        const doctorfee = res.data.data.fee.doctorFee || 0;
        const hospitalCommission = res.data.data.fee.hospitalCommission || 0;

        const commissionAmount = (doctorfee * hospitalCommission) / 100;
        const totalAmount = doctorfee + commissionAmount;

        setTotalFee(totalAmount);
      }
    } catch (error) {
      console.error("Error fetching doctor fee:", error);
      toast.error("Failed to fetch doctor fee");
    }
  };

  fetchDoctorFee();
}, [doctor,doctorId]);

  useEffect(() => {
    const fetchWeekAvailability = async () => {
      if (!doctorId) return;
      setWeekDaysAvailability([]);
      setSelectedSession(null);
      setAvailableSessionsForDay([]);

      try {
        setAvailabilityLoading(true);
        const dates = Array.from({ length: 7 }).map((_, i) => addDays(pickerBaseDate, i));
        const results = await Promise.all(
          dates.map((date) => patientApi.getAvailableSlots(doctorId, format(date, 'yyyy-MM-dd')))
        );

        const processedDays: DaySlot[] = results.map((res, i) => {
          const dayData = res.data.data || {};
          const slots: Slot[] = dayData.slots || [];
          const appointments = dayData.appointments || [];

          const bookedTokens: Record<SessionKey, number> = {
            morning: 0,
            afternoon: 0,
            evening: 0,
          };

          const totalTokens: Record<SessionKey, number> = {
            morning: 0,
            afternoon: 0,
            evening: 0,
          };

          slots.forEach((slot) => {
            const sessionKey = slot.session as SessionKey;
            totalTokens[sessionKey] = slot.tokenPerDay;
            bookedTokens[sessionKey] = appointments.filter(
              (apt: { session: SessionKey }) => apt.session === sessionKey
            ).length;
          });

          const totalCapacity = Object.values(totalTokens).reduce((a, b) => a + b, 0);
          const totalBooked = Object.values(bookedTokens).reduce((a, b) => a + b, 0);

          const status =
            slots.length === 0
              ? "Fully Booked"
              : totalBooked >= totalCapacity
              ? "Fully Booked"
              : totalBooked >= totalCapacity * 0.8
              ? "Filling Fast"
              : "Available";

          return {
            day: format(dates[i], 'EEE'),
            date: dates[i].getDate(),
            fullDate: dates[i],
            status,
            bookedTokens,
            totalTokens,
            rawSlots: slots,
          };
        });

        setWeekDaysAvailability(processedDays);
      } catch (error) {
        console.error("Error fetching availability:", error);
        toast.error("Failed to fetch doctor availability");
      } finally {
        setAvailabilityLoading(false);
      }
    };

    fetchWeekAvailability();
  }, [doctorId, pickerBaseDate]);

  useEffect(() => {
    setSelectedSession(null);
    setAvailableSessionsForDay([]);
  }, [selectedDate]);

  useEffect(() => {
    const currentDay = weekDaysAvailability.find((d) => isSameDay(d.fullDate, selectedDate));

    if (!currentDay || currentDay.rawSlots.length === 0) {
      setAvailableSessionsForDay([]);
      setSelectedSession(null);
      return;
    }

    const availableSessions = currentDay.rawSlots
      .map((slot) => slot.session as SessionKey)
      .filter((session, index, self) => self.indexOf(session) === index);

    setAvailableSessionsForDay(availableSessions);

    if (availableSessions.length > 0 && !selectedSession) {
      setSelectedSession(availableSessions[0]);
    }
  }, [selectedDate, selectedSession, weekDaysAvailability]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const selectedAvailability = weekDaysAvailability.find((d) => isSameDay(d.fullDate, selectedDate));

  const getSelectedSlot = () => {
    if (!selectedAvailability || !selectedSession) return null;
    return selectedAvailability.rawSlots.find((s) => s.session === selectedSession) || null;
  };

  const isBookingAllowed = () => {
    const slot = getSelectedSlot();
    if (!slot?.startTime) return true;

    if (!isSameDay(selectedDate, startOfToday())) return true;

    
    const today = startOfToday();
    const [hours, minutes] = slot.startTime.split(":").map(Number);

    const slotStart = new Date(today);
    slotStart.setHours(hours, minutes || 0, 0, 0);

  
    return true
  };

  const isTodayBookingClosed = !isBookingAllowed() && isSameDay(selectedDate, startOfToday());
  const isNoSlotDay = selectedAvailability?.rawSlots.length === 0;

  const currentSessionBooked = selectedSession
    ? selectedAvailability?.bookedTokens[selectedSession] || 0
    : 0;

  const currentSessionLimit = selectedSession
    ? selectedAvailability?.totalTokens[selectedSession] || 0
    : 0;

  const nextToken = currentSessionBooked + 1;

  const handleBooking = async () => {
    if (isNoSlotDay) {
      toast.error("No slots available on this day");
      return;
    }

    if (isTodayBookingClosed) {
      toast.error("Booking is closed for this session");
      return;
    }

    if (selectedAvailability?.status === "Fully Booked") {
      toast.error("Doctor is fully booked for this date");
      return;
    }

    if (!selectedSession) {
      toast.error("Please select a session");
      return;
    }

    if (nextToken > currentSessionLimit) {
      toast.error(`Session is fully booked (${currentSessionBooked}/${currentSessionLimit})`);
      return;
    }

    if (!form.fullName || !form.phone || !form.email) {
      toast.error("Please fill in required patient information");
      return;
    }

    try {
      const checkData = {
        doctorId: doctorId!,
        date: selectedDate.toISOString(),
        patient: { name: form.fullName, age: Number(form.age), email: form.email },
        hospitalId: getHospitalSession(),
      };

      const dupRes = await patientApi.checkDuplicateAppointment(checkData);

      if (dupRes.data.success && dupRes.data.data) {
        toast.error("Patient already booked this slot");
        return;
      }

      if (!doctor?.id || !doctor?.hospital_id) {
        toast.error("Doctor or hospital not found");
        return;
      }
      const selectedSlot = getSelectedSlot();

      const bookingData = {
        doctorId: doctor.id,
        hospitalId: doctor.hospital_id,
        appointmentDate: selectedDate.toISOString(),
        mode: serviceType,
        session: selectedSession,
         slotStartTime: selectedSlot?.startTime || '',     
  slotEndTime: selectedSlot?.endTime || '',   
 tokenNumber: nextToken,      
  doctorName: doctor.name,   
        patientDetails: {
          name: form.fullName,
          age: Number(form.age),
          phone: form.phone,
          email: form.email,
          address: form.address,
        },
        bloodPressure: form.bloodPressure,
        heartRate: form.heartRate,
        weight: form.weight,
       
      };

      if (paymentMethod === "cash") {
        const res = await patientApi.bookAppointment(bookingData);
        if (res.data.success) {
          toast.success("Appointment booked successfully!");
          navigate(PATIENT_ROUTES.PATIENTPROFILE);
        } else {
          toast.error(res.data.message);
        }
      } else {

        const res = await patientApi.createAppointmentPaymentSession({
          bookingData: { ...bookingData, totalAmount: totalfee, doctorName: doctor.name },
        });
   
        if (res.data.success) {
          console.log("Payment session created successfully:", res.data.url);
          window.location.href = res.data.url;
        } else {
          toast.error("Payment failed");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const inputCls = "w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1a8fd1] bg-white";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a8fd1]" />
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-800 bg-white">
      <Navbar />

      <section className="relative h-44 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#c8dff0 0%,#a8cce8 100%)" }} />
        <div className="absolute inset-0 bg-[#0d2b4e]/45" />
        <div className="relative z-10 px-[7%] h-full flex flex-col justify-end pb-8">
          <p className="text-white/70 text-xs mb-1">Home / Appointment</p>
          <h1 className="text-3xl font-extrabold text-white">Book an Appointment</h1>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1a8fd1]" />
      </section>

      <section className="px-[5%] py-12 bg-[#f4f8fc]">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
          <div className="w-full lg:w-105 shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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

          <div className="flex-1 flex flex-col gap-5 w-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-x-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#0d2b4e] text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1a8fd1]" />
                  Available Dates
                </h3>
                <div className="relative">
                  <button
                    onClick={() => (document.getElementById('hidden-date-picker') as HTMLInputElement)?.showPicker()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-[#1a8fd1] rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Select Date
                  </button>
                  <input
                    id="hidden-date-picker"
                    type="date"
                    min={format(startOfToday(), 'yyyy-MM-dd')}
                    className="absolute opacity-0 pointer-events-none inset-0"
                    onChange={(e) => {
                      if (e.target.value) {
                        const newDate = parseISO(e.target.value);
                        setSelectedDate(newDate);
                        setPickerBaseDate(newDate);
                      }
                    }}
                  />
                </div>
              </div>

              {availabilityLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1a8fd1]" />
                </div>
              ) : (
                <div className="flex gap-2 justify-between min-w-125">
                  {weekDaysAvailability.map((d) => {
                    const isSelected = isSameDay(selectedDate, d.fullDate);
                    const isNoSlot = d.rawSlots.length === 0;
                    const totalCapacity = Object.values(d.totalTokens).reduce((a, b) => a + b, 0);
                    const totalBooked = Object.values(d.bookedTokens).reduce((a, b) => a + b, 0);
                    const dayStatus = isNoSlot
                      ? "Fully Booked"
                      : totalBooked >= totalCapacity
                      ? "Fully Booked"
                      : totalBooked >= totalCapacity * 0.8
                      ? "Filling Fast"
                      : "Available";

                    return (
                      <button
                        key={d.fullDate.toISOString()}
                        onClick={() => setSelectedDate(d.fullDate)}
                        className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg border transition-all cursor-pointer flex-1 ${
                          isSelected
                            ? "border-[#1a8fd1] bg-[#1a8fd1] text-white shadow-md font-bold"
                            : "border-gray-100 bg-white hover:border-[#1a8fd1]/40"
                        }`}
                      >
                        <span className={`text-[11px] font-medium ${isSelected ? "text-white/80" : "text-gray-400"}`}>{d.day}</span>
                        <span className={`text-xl font-extrabold leading-none ${isSelected ? "text-white" : "text-[#0d2b4e]"}`}>{d.date}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                          isNoSlot
                            ? "bg-red-100 text-red-600 border-red-300"
                            : isSelected
                              ? "bg-white/20 border-white/30 text-white"
                              : statusStyle[dayStatus]
                        }`}>
                          {isNoSlot ? "No Slots" : dayStatus}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-1">
                <Sun className="w-4 h-4 text-[#1a8fd1]" />
                <h3 className="font-bold text-[#0d2b4e] text-sm">Select Session</h3>
              </div>
              <p className="text-gray-400 text-xs mb-4">
                Choose your preferred session on {format(selectedDate, 'MMMM d, yyyy')}
              </p>

              {isTodayBookingClosed && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <p className="font-semibold text-base">Booking Closed</p>
                  <p className="text-sm mt-1">
                    Booking is allowed only until 1 hour before the session start time.
                  </p>
                </div>
              )}

              {isNoSlotDay ? (
                <div className="text-center py-12 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-red-600 font-semibold text-lg">No slots available</p>
                  <p className="text-red-500 text-sm mt-2">Doctor has not set any schedule for this day</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {(Object.entries(sessionConfig) as [SessionKey, typeof sessionConfig[SessionKey]][]).map(([key, cfg]) => {
                    const isAvailable = availableSessionsForDay.includes(key);
                    const isSelected = selectedSession === key;
                    const slotInfo = selectedAvailability?.rawSlots.find((s) => s.session === key);
                    const bookedCount = selectedAvailability?.bookedTokens[key] || 0;
                    const totalCount = selectedAvailability?.totalTokens[key] || 0;

                    const now = new Date();
                    const today = startOfToday();
                    const isExpiredToday =
                      isSameDay(selectedDate, today) &&
                      slotInfo?.startTime
                        ? (() => {
                            const [hours, minutes] = slotInfo.startTime.split(":").map(Number);
                            const slotStart = new Date(today);
                            slotStart.setHours(hours, minutes || 0, 0, 0);
                            const oneHourBefore = new Date(slotStart.getTime() - 60 * 60 * 1000);
                            return now >= oneHourBefore;
                          })()
                        : false;

                    const disabled =  isExpiredToday;

                    return (
                      <button
                        key={key}
                        onClick={() => isAvailable && !isExpiredToday && setSelectedSession(isSelected ? null : key)}
                        disabled={disabled}
                        className={`flex flex-col gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? `${cfg.selectedBorder} ${cfg.selectedBg}`
                            : !isAvailable || isExpiredToday
                              ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                              : "border-gray-100 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cfg.iconBg} ${cfg.iconColor}`}>
                            <cfg.Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-bold text-[#0d2b4e] block">{cfg.label}</span>
                            {slotInfo && (
                              <span className="text-xs text-gray-500">
                                {slotInfo.startTime} – {slotInfo.endTime}
                              </span>
                            )}
                            {isExpiredToday && (
                              <span className="text-[10px] text-red-500 font-semibold">
                                Booking closed
                              </span>
                            )}
                          </div>
                          {isSelected && !isExpiredToday && (
                            <svg className={`w-4 h-4 ${cfg.iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>

                        <div className="border-t border-gray-100 pt-2">
                          <div className="text-xs">
                            <span className="font-medium text-gray-700">Tokens: </span>
                            <span className="font-bold text-[#0d2b4e]">{bookedCount}/{totalCount}</span>
                            {bookedCount >= totalCount * 0.8 && bookedCount < totalCount && (
                              <span className="ml-1 text-orange-500 text-[10px] font-bold">Filling Fast</span>
                            )}
                            {bookedCount >= totalCount && (
                              <span className="ml-1 text-red-500 text-[10px] font-bold">Full</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-[#1a8fd1]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <h3 className="font-bold text-[#0d2b4e] text-sm">Appointment Details</h3>
              </div>

              <p className="text-xs text-gray-400 mb-5">
                Token-based booking for {format(selectedDate, 'MMMM d, yyyy')}
                {selectedSession && ` · ${sessionConfig[selectedSession].label} session`}
              </p>

              {isTodayBookingClosed && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <p className="font-semibold text-base">Today's Booking is Closed</p>
                  <p className="text-sm mt-1">Booking closes 1 hour before the selected session start time.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 text-center">
                  <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">
                    Next Token ({selectedSession && sessionConfig[selectedSession]?.label})
                  </p>
                  <p className="text-3xl font-black text-[#0d2b4e] mb-1">
                    {selectedSession ? nextToken : "--"}
                  </p>
                  {selectedSession && currentSessionLimit > 0 && (
                    <p className="text-xs text-gray-600 font-medium">
                      {currentSessionBooked}/{currentSessionLimit}
                    </p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    {selectedSession ? "Session Limit" : "Daily Limit"}
                  </p>
                  <p className="text-3xl font-black text-[#0d2b4e]">
                    {currentSessionLimit || "--"}
                  </p>
                </div>
              </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-3 uppercase">Total Fee</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 font-medium">₹</span>
                    <span className="text-xl font-bold text-[#0d2b4e]">{totalfee !== null ? totalfee : "--"}</span>
                  </div>
                </div>       

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-3 uppercase">Service Type</label>
                  <div className="flex flex-col gap-2">
                    {(["offline", "online"] as const).map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer group">
                        <div
                          onClick={() => setServiceType(type)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                            serviceType === type ? "border-[#1a8fd1]" : "border-gray-300 group-hover:border-gray-400"
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
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                            paymentMethod === method ? "border-[#1a8fd1]" : "border-gray-300 group-hover:border-gray-400"
                          }`}
                        >
                          {paymentMethod === method && <div className="w-2.5 h-2.5 rounded-full bg-[#1a8fd1]" />}
                        </div>
                        <span className="text-sm text-gray-700 capitalize">
                          Pay {method === 'online' ? 'Online' : 'with Cash'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-1.5 px-5 py-2.5 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  ← Cancel
                </button>
                <button
                  onClick={handleBooking}
                  disabled={availabilityLoading || isNoSlotDay || isTodayBookingClosed || !selectedSession || nextToken > currentSessionLimit}
                  className="flex items-center gap-2 px-8 py-2.5 bg-[#1a8fd1] text-white rounded text-sm font-bold hover:bg-[#1478b0] transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {isNoSlotDay ? "No Slots Available" : nextToken > currentSessionLimit ? "Session Full" : isTodayBookingClosed ? "Booking Closed" : "Confirm Appointment"}
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