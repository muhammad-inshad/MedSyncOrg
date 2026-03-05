import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useState } from "react";

interface DaySlot {
  day: string;
  date: number;
  status: "Available" | "Filling Fast" | "Fully Booked";
}

const weekDays: DaySlot[] = [
  { day: "Mon", date: 25, status: "Available" },
  { day: "Tue", date: 26, status: "Available" },
  { day: "Wed", date: 27, status: "Filling Fast" },
  { day: "Thu", date: 28, status: "Fully Booked" },
  { day: "Fri", date: 29, status: "Available" },
  { day: "Sat", date: 30, status: "Filling Fast" },
  { day: "Sun", date: 1,  status: "Available" },
];

const statusStyle: Record<DaySlot["status"], string> = {
  Available:    "text-green-500 bg-green-50 border-green-200",
  "Filling Fast": "text-orange-500 bg-orange-50 border-orange-200",
  "Fully Booked": "text-red-500 bg-red-50 border-red-300",
};


export default function PatientAppointment() {
  const [selectedDay, setSelectedDay]         = useState<number>(28);
  const [serviceType, setServiceType]         = useState<"Offline Visit" | "Online Consultation">("Offline Visit");
  const [paymentMethod, setPaymentMethod]     = useState<"Pay Online" | "Pay with Cash">("Pay Online");
  const [form, setForm] = useState({
    fullName: "John Doe",
    age: "25",
    phone: "+1 (555) 000-0000",
    email: "john@example.com",
    address: "123 Main Street, City,\nState, ZIP",
    bloodPressure: "99",
    heartRate: "25",
    weight: "66",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputCls =
    "w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#1a8fd1] bg-white";

  return (
    <div className="font-sans text-gray-800 bg-white">
<Navbar/>
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
        <div className="max-w-6xl mx-auto flex gap-6 items-start">

          {/* ── LEFT: Patient Information ── */}
          <div className="w-[420px] shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-[#1a8fd1]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              <h2 className="font-bold text-[#0d2b4e] text-sm">Patient Information</h2>
            </div>
            <p className="text-gray-400 text-xs mb-5">Enter your personal details</p>

            <div className="flex flex-col gap-3">
              {[
                { label: "Full Name",     name: "fullName",      type: "text" },
                { label: "Age",           name: "age",           type: "number" },
                { label: "Phone Number",  name: "phone",         type: "tel" },
                { label: "Email Address", name: "email",         type: "email" },
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

              {[
                { label: "blood pressure", name: "bloodPressure" },
                { label: "hart rate",      name: "heartRate" },
                { label: "weight",         name: "weight" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                  <input
                    type="text"
                    name={f.name}
                    value={form[f.name as keyof typeof form]}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
              ))}

              {/* Add New File */}
              <button className="w-full bg-[#1a8fd1] text-white text-sm font-semibold py-2.5 rounded flex items-center justify-center gap-2 hover:bg-[#1478b0] transition-colors cursor-pointer mt-1">
                <span className="text-lg leading-none">+</span> Add New File
              </button>

              {/* Doctor and Hospital */}
              <div className="mt-1">
                <p className="text-xs text-gray-400 mb-2">doctor and hospital</p>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-gray-700">dr mufeed mbbs md ortho</p>
                  <p className="text-sm text-gray-700">royal hospital kunnamkulam</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Calendar + Appointment Details ── */}
          <div className="flex-1 flex flex-col gap-5">

            {/* Week Calendar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <button className="text-gray-400 hover:text-[#1a8fd1] text-lg font-bold px-1">‹</button>
                <div className="flex gap-2 flex-1 justify-between">
                  {weekDays.map((d) => {
                    const isSelected = selectedDay === d.date;
                    return (
                      <button
                        key={d.date}
                        onClick={() => setSelectedDay(d.date)}
                        className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg border transition-all cursor-pointer flex-1 ${
                          isSelected
                            ? "border-[#1a8fd1] bg-[#1a8fd1] text-white shadow-md"
                            : "border-gray-100 bg-white hover:border-[#1a8fd1]/40"
                        }`}
                      >
                        <span className={`text-[11px] font-medium ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                          {d.day}
                        </span>
                        <span className={`text-xl font-extrabold leading-none ${isSelected ? "text-white" : "text-[#0d2b4e]"}`}>
                          {d.date}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                          isSelected
                            ? "bg-white/20 border-white/30 text-white"
                            : statusStyle[d.status]
                        }`}>
                          {d.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button className="text-gray-400 hover:text-[#1a8fd1] text-lg font-bold px-1">›</button>
              </div>
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
                <p className="text-xs text-gray-400">doctor working time 8:00am to 9:00pm</p>
              </div>
              <p className="text-xs text-gray-400 mb-5">Choose your preferred appointment options</p>

              {/* Booking Date & Time */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Booking Date</label>
                  <div className="flex items-center border border-gray-200 rounded px-3 py-2 gap-2">
                    <span className="text-sm text-gray-700 flex-1">12/4/2044</span>
                    <span className="text-xs text-orange-400 font-semibold">token full</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-medium">Booking Time</label>
                  <div className="flex items-center border border-gray-200 rounded px-3 py-2 gap-2">
                    <span className="text-sm text-gray-700 flex-1">5:00 pm</span>
                    <span className="text-xs text-orange-400 font-semibold">token full</span>
                  </div>
                </div>
              </div>

              {/* Service Type */}
              <div className="mb-5">
                <label className="block text-xs text-gray-500 mb-2 font-medium">Service Type</label>
                <div className="flex flex-col gap-1.5">
                  {(["Offline Visit", "Online Consultation"] as const).map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => setServiceType(type)}
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                          serviceType === type ? "border-[#1a8fd1]" : "border-gray-300"
                        }`}
                      >
                        {serviceType === type && <div className="w-2 h-2 rounded-full bg-[#1a8fd1]" />}
                      </div>
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Token */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                {[{ label: "token", value: "50" }, { label: "total token", value: "70" }].map((t) => (
                  <div key={t.label}>
                    <label className="block text-xs text-gray-500 mb-1.5">{t.label}</label>
                    <input
                      type="text"
                      defaultValue={t.value}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-xs text-gray-500 mb-2 font-medium">Payment Method</label>
                <div className="flex flex-col gap-1.5">
                  {(["Pay Online", "Pay with Cash"] as const).map((method) => (
                    <label key={method} className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => setPaymentMethod(method)}
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                          paymentMethod === method ? "border-[#1a8fd1]" : "border-gray-300"
                        }`}
                      >
                        {paymentMethod === method && <div className="w-2 h-2 rounded-full bg-[#1a8fd1]" />}
                      </div>
                      <span className="text-sm text-gray-700">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button className="flex items-center gap-1.5 px-5 py-2.5 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
                  ← Cancel
                </button>
                <button className="flex items-center gap-1.5 px-6 py-2.5 bg-[#1a8fd1] text-white rounded text-sm font-semibold hover:bg-[#1478b0] transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Confirm Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SIDE INFO CARDS (floating right) ── */}
      <section className="px-[5%] pb-12 bg-[#f4f8fc]">
        <div className="max-w-6xl mx-auto flex justify-end">
          <div className="flex flex-col gap-3 w-64">
            {[
              {
                icon: (
                  <svg className="w-5 h-5 text-[#1a8fd1]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                ),
                title: "Call Us",
                value: "+1 (555) 123-4567",
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                ),
                title: "Email Us",
                value: "info@clinic.com",
                dark: true,
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Working Hours",
                value: "Mon-Fri: 9AM-6PM",
                dark: true,
              },
            ].map((card, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-lg shadow-sm ${
                  card.dark ? "bg-[#1a8fd1]" : "bg-white border border-gray-100"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  card.dark ? "bg-white/20" : "bg-[#dbeeff]"
                }`}>
                  {card.icon}
                </div>
                <div>
                  <p className={`text-xs font-semibold ${card.dark ? "text-white" : "text-[#0d2b4e]"}`}>
                    {card.title}
                  </p>
                  <p className={`text-xs ${card.dark ? "text-white/80" : "text-gray-500"}`}>
                    {card.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
}