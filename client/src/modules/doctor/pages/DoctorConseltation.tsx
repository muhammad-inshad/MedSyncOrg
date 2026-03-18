import { useEffect, useState } from 'react';
import DoctorSidebar from '../components/DoctorSidebar';
import { z } from 'zod';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { doctorApi } from '@/constants/backend/doctor/doctor.api';
import toast from 'react-hot-toast';
import type { IAppointment, IPrescriptionData } from '@/interfaces/IAppointment';
import PrescriptionModal from '../components/PrescriptionModal';

const DoctorConsultation = () => {
  const [currentAppointment, setCurrentAppointment] = useState<IAppointment | null>(null);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [totalTokens, setTotalTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchConsultation = async (page: number) => {
    try {
      setLoading(true);
      const result = await doctorApi.getConsultation({ page, limit: 1 });
      if (result.data && result.data.data) {
        const { appointments, total } = result.data.data;
        setCurrentAppointment(appointments.length > 0 ? appointments[0] : null);
        setTotalTokens(total);
      }
    } catch (error) {
      toast.error("Something went wrong while fetching consultations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultation(currentIndex);
  }, [currentIndex]);

  const handleNext = () => currentIndex < totalTokens && setCurrentIndex(prev => prev + 1);
  const handlePrev = () => currentIndex > 1 && setCurrentIndex(prev => prev - 1);

  const handleMarkAsCompleted = async () => {
    if (!currentAppointment?._id) return;
    try {
      setLoading(true);
      await doctorApi.updateAppointmentStatus(currentAppointment._id);
      toast.success("Appointment marked as completed");
      setCurrentAppointment((prev) => prev ? { ...prev, status: 'completed' } : null);
    } catch (error) {
      toast.error("Failed to mark as completed");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrescription = async (prescriptionData: IPrescriptionData) => {
    if (!currentAppointment?._id) return;
    
    const prescriptionSchema = z.object({
      symptoms: z.string().min(1, "Symptoms are required"),
      diagnosis: z.string().min(1, "Diagnosis is required"),
      medicines: z.array(z.object({
        name: z.string().min(1, "Medicine name is required"),
        dosage: z.string().min(1, "Dosage is required"),
        duration: z.string().min(1, "Duration is required"),
        instruction: z.string().optional()
      })).min(1, "At least one medicine is required")
    });

    const validation = prescriptionSchema.safeParse(prescriptionData);
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);
      await doctorApi.savePrescription(currentAppointment._id, prescriptionData);
      toast.success("Prescription saved successfully");
      setIsModalOpen(false);
      handleMarkAsCompleted(); 
    } catch (error) {
      toast.error("Failed to save prescription");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !currentAppointment) {
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <DoctorSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <DoctorSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Ongoing Consultations</h1>
            <p className="text-slate-500 text-sm">Today: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Queue Status</span>
            <div className="text-2xl font-black text-indigo-600">
              {currentAppointment?.tokenNumber} <span className="text-slate-300">/ {totalTokens}</span>
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <button onClick={handlePrev} disabled={currentIndex === 1} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50 disabled:opacity-30">
                <ChevronLeft size={20} /> Previous
              </button>
              <div className="px-4 py-1 bg-indigo-50 text-indigo-700 rounded-full font-bold text-sm">Token #{currentAppointment?.tokenNumber}</div>
              <button onClick={handleNext} disabled={currentIndex === totalTokens} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50 disabled:opacity-30">
                Next Patient <ChevronRight size={20} />
              </button>
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
              <div className="bg-slate-900 p-8 text-white flex justify-between items-start">
                <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 bg-indigo-500 rounded-2xl flex items-center justify-center text-3xl font-bold">
                    {currentAppointment?.patientDetails.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black">{currentAppointment?.patientDetails.name}</h2>
                    <div className="flex gap-4 mt-2 text-slate-400">
                      <span className="flex items-center gap-1"><User size={16}/> {currentAppointment?.patientDetails.age} Years</span>
                      <span className="font-bold text-indigo-400 uppercase italic">{currentAppointment?.mode}</span>
                    </div>
                  </div>
                </div>
                {currentAppointment?.mode === 'online' && (
                  <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg">
                    <MessageSquare size={20} /> Open Chat
                  </button>
                )}
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-slate-700"><Phone size={18} className="text-slate-400"/><span>{currentAppointment?.patientDetails.phone}</span></div>
                    <div className="flex items-center gap-4 text-slate-700"><Mail size={18} className="text-slate-400"/><span>{currentAppointment?.patientDetails.email || 'N/A'}</span></div>
                    <div className="flex items-center gap-4 text-slate-700"><MapPin size={18} className="text-slate-400"/><span>{currentAppointment?.patientDetails.address || 'No Address'}</span></div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Patient Vitals</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                      <span className="text-xs font-bold text-rose-400 uppercase">BP</span>
                      <p className="text-xl font-black">{currentAppointment?.bloodPressure || '--'}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <span className="text-xs font-bold text-blue-400 uppercase">Heart Rate</span>
                      <p className="text-xl font-black">{currentAppointment?.heartRate || '--'}</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">

<span className="text-xs font-bold text-amber-400 uppercase">Weight</span>

<p className="text-xl font-black text-gray-800">{currentAppointment?.weight || '--'}</p>

</div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition"
                >
                  <FileText size={20}/> Write Prescription
                </button>
                <button 
                  onClick={handleMarkAsCompleted} 
                  disabled={currentAppointment?.status === 'completed'}
                  className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition"
                >
                  <CheckCircle size={20}/> {currentAppointment?.status === "completed" ? "Completed" : "Mark as Completed"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <PrescriptionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          patientName={currentAppointment?.patientDetails.name || ''}
          onSave={handleSavePrescription}
        />
      </main>
    </div>
  );
};

export default DoctorConsultation;