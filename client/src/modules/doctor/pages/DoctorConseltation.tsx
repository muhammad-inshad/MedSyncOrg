import { useEffect, useState, useRef, useCallback } from 'react';
import DoctorSidebar from '../components/DoctorSidebar';

import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  FileText,
  Video
} from 'lucide-react';
import { doctorApi } from '@/constants/backend/doctor/doctor.api';
import { socket } from "../../../services/socket.services";
import toast from 'react-hot-toast';
import type { IAppointment } from '@/interfaces/IAppointment';
import PrescriptionModal from '../components/PrescriptionModal';
import axios from 'axios';

const DoctorConsultation = () => {
  const [currentAppointment, setCurrentAppointment] = useState<IAppointment | null>(null);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [totalTokens, setTotalTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [remoteStreamState, setRemoteStreamState] = useState<MediaStream | null>(null);
  const [shift, setShift] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
const fetchConsultation = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const result = await doctorApi.getConsultation({ page, limit: 1, shift });
      if (result.data && result.data.data) {
        const { appointments, total } = result.data.data;
        const mappedAppointments: IAppointment[] = appointments.map((app: {
          id?: string;
          _id: string;
          patientName?: string;
          patientAge?: number;
          patientPhone?: string;
          patientEmail?: string;
          patientAddress?: string;
          tokenNumber: number;
          mode: string;
          bloodPressure?: string;
          heartRate?: string;
          weight?: string;
          status?: string;
        }) => ({
          ...app,
          _id: app.id || app._id,
          patientDetails: {
            name: app.patientName || "Unknown",
            age: app.patientAge || 0,
            phone: app.patientPhone || "N/A",
            email: app.patientEmail || "",
            address: app.patientAddress || "No Address"
          }
        }));
        setCurrentAppointment(mappedAppointments.length > 0 ? mappedAppointments[0] : null);
        setTotalTokens(total);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to fetch consultation data");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }, [shift]); 
  useEffect(() => {
    setCurrentIndex(1);
  }, [shift]);

  useEffect(() => {
    fetchConsultation(currentIndex);
  }, [currentIndex,shift,fetchConsultation]);

  useEffect(() => {
    if (!currentAppointment) return;
    const roomId = currentAppointment._id;
    if (!socket.connected) socket.connect();
    socket.emit("join-room", roomId);
    return () => {
      setIsCallActive(false);
      setRemoteStreamState(null);
      if (localStream.current) localStream.current.getTracks().forEach(track => track.stop());
      if (peerConnection.current) peerConnection.current.close();
    };
  }, [currentAppointment]);

  const handleStartCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      peerConnection.current = pc;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => setRemoteStreamState(event.streams[0]);
      pc.onicecandidate = (event) => {
        if (event.candidate && currentAppointment?._id) {
          socket.emit("ice-candidate", { roomId: currentAppointment._id, candidate: event.candidate });
        }
      };

      setIsCallActive(true);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (currentAppointment?._id) {
        socket.emit("offer", { roomId: currentAppointment._id, offer });
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast.error("Could not access camera/microphone");
    }
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setRemoteStreamState(null);
    if (localStream.current) localStream.current.getTracks().forEach(track => track.stop());
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
  };

  const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);

  useEffect(() => {
    if (!currentAppointment) return;

    const handleOffer = async (offer: RTCSessionDescriptionInit) => {
      try {
        if (!peerConnection.current) return;
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("answer", { roomId: currentAppointment._id, answer });

        while (iceCandidateQueue.current.length > 0) {
          const candidate = iceCandidateQueue.current.shift();
          if (candidate) await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    };

    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
          while (iceCandidateQueue.current.length > 0) {
            const candidate = iceCandidateQueue.current.shift();
            if (candidate) await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        } catch (err) {
          console.error("Error handling answer:", err);
        }
      }
    };

    const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
      if (peerConnection.current && peerConnection.current.remoteDescription) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("ICE error:", err);
        }
      } else {
        iceCandidateQueue.current.push(candidate);
      }
    };

    const handleUserJoined = (socketId: string) => {
      console.log("User joined:", socketId);
      // If we are already in a call, we could re-initiate if needed, 
      // but usually the doctor starts the call manually.
      toast.success("Patient has joined the room");
    };

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-joined", handleUserJoined);

    return () => {
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("user-joined", handleUserJoined);
    };
  }, [currentAppointment]);

  const handleNext = () => currentIndex < totalTokens && setCurrentIndex(prev => prev + 1);
  const handlePrev = () => currentIndex > 1 && setCurrentIndex(prev => prev - 1);

  const handleMarkAsCompleted = async () => {
    if (!currentAppointment?._id) return;
    try {
      setLoading(true);
      await doctorApi.updateAppointmentStatus(currentAppointment._id);
      toast.success("Appointment marked as completed");
      setCurrentAppointment(prev => prev ? { ...prev, status: 'completed' } : null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to mark as completed");
      } else {
        toast.error("Something went wrong");
      }
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
              {currentIndex} <span className="text-slate-300">/ {totalTokens}</span>
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Shift Tabs */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
              {(['morning', 'afternoon', 'evening'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setShift(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
                    shift === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {totalTokens <= 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <User size={28} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">No Patients</h3>
                <p className="text-slate-400 text-sm mt-1">No appointments for the {shift} session</p>
              </div>
            ) : (
              <>
                {/* Navigation */}
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <button onClick={handlePrev} disabled={currentIndex === 1} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50 disabled:opacity-30">
                    <ChevronLeft size={20} /> Previous
                  </button>
                  <div className="px-4 py-1 bg-indigo-50 text-indigo-700 rounded-full font-bold text-sm">
                    Token #{currentAppointment?.tokenNumber}
                  </div>
                  <button onClick={handleNext} disabled={currentIndex === totalTokens} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50 disabled:opacity-30">
                    Next Patient <ChevronRight size={20} />
                  </button>
                </div>

                {/* Patient Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                  <div className="bg-slate-900 p-8 text-white flex justify-between items-start">
                    <div className="flex gap-6 items-center">
                      <div className="w-20 h-20 bg-indigo-500 rounded-2xl flex items-center justify-center text-3xl font-bold">
                        {currentAppointment?.patientDetails.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-3xl font-black">{currentAppointment?.patientDetails.name}</h2>
                        <div className="flex gap-4 mt-2 text-slate-400">
                          <span className="flex items-center gap-1"><User size={16} /> {currentAppointment?.patientDetails.age} Years</span>
                          <span className="font-bold text-indigo-400 uppercase italic">{currentAppointment?.mode}</span>
                        </div>
                      </div>
                    </div>
                    {currentAppointment?.mode === 'online' && !isCallActive && (
                      <button onClick={handleStartCall} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg transition-transform active:scale-95">
                        <Video size={20} /> Start Video Call
                      </button>
                    )}
                    {isCallActive && (
                      <button onClick={handleEndCall} className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg transition-transform active:scale-95">
                        <Video size={20} /> End Call
                      </button>
                    )}
                  </div>

                  {isCallActive && (
                    <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative bg-slate-800 rounded-3xl overflow-hidden aspect-video shadow-2xl">
                        <video
                          ref={(el) => { localVideoRef.current = el; if (el && localStream.current) el.srcObject = localStream.current; }}
                          autoPlay playsInline muted className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4 bg-indigo-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          You (Doctor)
                        </div>
                      </div>
                      <div className="relative bg-slate-800 rounded-3xl overflow-hidden aspect-video shadow-2xl">
                        <video
                          ref={(el) => { remoteVideoRef.current = el; if (el && remoteStreamState) el.srcObject = remoteStreamState; }}
                          autoPlay playsInline className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4 bg-emerald-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          Patient
                        </div>
                        {!remoteStreamState && (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">
                            Waiting for patient to join...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Contact Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-slate-700"><Phone size={18} className="text-slate-400" /><span>{currentAppointment?.patientDetails.phone}</span></div>
                        <div className="flex items-center gap-4 text-slate-700"><Mail size={18} className="text-slate-400" /><span>{currentAppointment?.patientDetails.email || 'N/A'}</span></div>
                        <div className="flex items-center gap-4 text-slate-700"><MapPin size={18} className="text-slate-400" /><span>{currentAppointment?.patientDetails.address || 'No Address'}</span></div>
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
                    <button onClick={() => setIsModalOpen(true)} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition">
                      <FileText size={20} /> Write Prescription
                    </button>
                    <button
                      onClick={handleMarkAsCompleted}
                      disabled={currentAppointment?.status === 'completed'}
                      className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition"
                    >
                      <CheckCircle size={20} /> {currentAppointment?.status === "completed" ? "Completed" : "Mark as Completed"}
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

        <PrescriptionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          patientName={currentAppointment?.patientDetails.name || ''}
          appointmentId={currentAppointment?._id || null}
        />
      </main>
    </div>
  );
};

export default DoctorConsultation;