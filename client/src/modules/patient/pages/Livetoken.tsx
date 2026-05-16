import { useEffect, useState,useRef } from 'react';
import { ChevronLeft, ChevronRight, Users, Clock } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { patientApi } from '@/constants/backend/patient/patient.api';
import { socket } from "../../../services/socket.services";
import toast from 'react-hot-toast';


interface IAppointmentLite {
    id: string;
    _id: string;
    tokenNumber: number;
    patientName: string;
    patientAge: number;
    patientPhone: string;
    doctorId: {
        _id: string;
    } | string;
    mode: 'online' | 'offline';
    patientDetails: {
        name: string;
        age: number;
        phone: string;
    };
}

const Livetoken = () => {
    const [myAppointments, setMyAppointments] = useState<IAppointmentLite[]>([]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [currentToken, setCurrentToken] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [isCallActive, setIsCallActive] = useState(false);
    const [remoteStreamState, setRemoteStreamState] = useState<MediaStream | null>(null);
    const AVG_TIME_PER_PATIENT = 15;
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStream = useRef<MediaStream | null>(null);
    const pendingOffer = useRef<RTCSessionDescriptionInit | null>(null);

    const selectedAppointment = myAppointments.length > 0 ? myAppointments[activeIdx] : null;
    const tokensAhead = selectedAppointment ? Math.max(0, selectedAppointment.tokenNumber - currentToken) : 0;

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const todayStr = new Date().toISOString().split('T')[0];
                const response = await patientApi.getTodayAppointments(todayStr);
                const appointments = (response.data.data || []).map((app: {
                    id: string;
                    _id?: string;
                    tokenNumber: number;
                    patientName: string;
                    patientAge: number;
                    patientPhone: string;
                    doctorId: { _id: string } | string;
                    mode: 'online' | 'offline';
                }) => ({
                    ...app,
                    _id: app.id || app._id,
                    patientDetails: {
                        name: app.patientName || "Patient",
                        age: app.patientAge || 0,
                        phone: app.patientPhone || "N/A"
                    }
                }));
                setMyAppointments(appointments);

                if (appointments.length > 0) {
                    const firstDoctor = appointments[0].doctorId;
                    const firstDoctorId = typeof firstDoctor === 'object' ? firstDoctor._id : firstDoctor;
                    const tokenRes = await patientApi.getliveToken(firstDoctorId);
                    if (tokenRes.data.success && tokenRes.data.data) {
                        setCurrentToken(tokenRes.data.data.currentLiveToken);
                    }
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedAppointment) {
            const fetchCurrentToken = async () => {
                try {
                    const doctor = selectedAppointment.doctorId;
                    const doctorId = typeof doctor === 'object' ? doctor._id : doctor;
                    const result = await patientApi.getliveToken(doctorId);
                    if (result.data.success && result.data.data) {
                        setCurrentToken(result.data.data.currentLiveToken);
                    } else {
                        setCurrentToken(0);
                    }
                } catch (error) {
                    console.error("Error fetching live token:", error);
                }
            };

            fetchCurrentToken();
            const interval = setInterval(fetchCurrentToken, 30000); // Update every 30 seconds
            return () => clearInterval(interval);
        }
    }, [selectedAppointment]);

    useEffect(() => {
    if (!selectedAppointment) return;

    const roomId = selectedAppointment._id; 


    if (!socket.connected) {
        socket.connect();
    }

 
    socket.emit("join-room", roomId);
    console.log("Joined room:", roomId);

    return () => {
        setIsCallActive(false);
        setRemoteStreamState(null);
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
        }
        if (peerConnection.current) {
            peerConnection.current.close();
        }
    };
}, [selectedAppointment]);

const handleStartCall = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });

        localStream.current = stream;

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }
            ],
        });
        peerConnection.current = pc;

        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
            console.log("Remote track received:", event.streams[0]);
            setRemoteStreamState(event.streams[0]);
        };

        pc.onicecandidate = (event) => {
        if (event.candidate && selectedAppointment && selectedAppointment._id) {
          socket.emit("ice-candidate", {
            roomId: selectedAppointment._id,
            candidate: event.candidate,
          });
        }
      };
        setIsCallActive(true);
        console.log("Peer connection ready");
 if (!selectedAppointment) return;
        if (pendingOffer.current) {
            console.log("Processing pending offer...");
            await pc.setRemoteDescription(pendingOffer.current);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit("answer", {
                roomId: selectedAppointment._id,
                answer,
            });
            pendingOffer.current = null;
            console.log("Answer sent for pending offer");
        }

    } catch {
        toast.error("Error accessing media devices:");
    }
};

useEffect(() => {
    if (!selectedAppointment) return;

    const handleOffer = async (offer: RTCSessionDescriptionInit) => {
        if (!peerConnection.current) {
            console.log("Offer received but no peer connection yet. Storing as pending.");
            pendingOffer.current = offer;
            return;
        }

        await peerConnection.current.setRemoteDescription(offer);
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        socket.emit("answer", {
            roomId: selectedAppointment._id,
            answer,
        });
        console.log("Answer sent");
    };

    const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
        if (peerConnection.current) {
            try {
                await peerConnection.current.addIceCandidate(candidate);
            } catch (err) {
                console.error("ICE error:", err);
            }
        }
    };

    socket.on("offer", handleOffer);
    socket.on("ice-candidate", handleIceCandidate);

    return () => {
        socket.off("offer", handleOffer);
        socket.off("ice-candidate", handleIceCandidate);
    };
}, [selectedAppointment]);

useEffect(() => {
    socket.on("answer", async (answer) => {
        if (peerConnection.current) {
            await peerConnection.current.setRemoteDescription(answer);
            console.log("Call connected ");
        }
    });

    return () => {
        socket.off("answer");
    };
}, []);
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
                </main>
                <Footer />
            </div>
        );
    }

    if (myAppointments.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <main className="flex-1 w-full max-w-md mx-auto px-4 py-20 text-center">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Users className="text-indigo-600" size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">No Appointments Today</h2>
                        <p className="text-slate-500 mb-6 text-sm">You don't have any appointments scheduled for today.</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="flex-1 w-full max-w-md mx-auto px-4 pb-10">

                {/* ── HERO ─────────────────────────────────────────────────── */}
                <div className="mt-6 mb-4 rounded-[20px] overflow-hidden" style={{ background: '#312e81' }}>
                    <div
                        className="px-6 py-8 text-center relative"
                        style={{
                            backgroundImage:
                                'repeating-linear-gradient(45deg,rgba(255,255,255,0.015) 0px,rgba(255,255,255,0.015) 1px,transparent 1px,transparent 14px)',
                        }}
                    >
                        {isCallActive && (
                            <div className="space-y-4 mb-4">
                                <div className="bg-black rounded-xl overflow-hidden mt-4 relative">
                                    <video
                                        ref={(el) => {
                                            localVideoRef.current = el;
                                            if (el && localStream.current) {
                                                el.srcObject = localStream.current;
                                            }
                                        }}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-48 object-cover shadow-inner bg-slate-900"
                                    />
                                    <div className="absolute bottom-2 left-2 bg-indigo-600 text-[10px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                        You
                                    </div>
                                </div>
                                <div className="bg-black rounded-xl overflow-hidden mt-4 relative">
                                    <video
                                        ref={(el) => {
                                            remoteVideoRef.current = el;
                                            if (el && remoteStreamState) {
                                                el.srcObject = remoteStreamState;
                                            }
                                        }}
                                        autoPlay
                                        playsInline
                                        className="w-full h-64 object-cover shadow-inner bg-slate-900"
                                    />
                                    <div className="absolute bottom-2 left-2 bg-emerald-600 text-[10px] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                        Doctor
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsCallActive(false);
                                        setRemoteStreamState(null);
                                        if (localStream.current) {
                                            localStream.current.getTracks().forEach(track => track.stop());
                                        }
                                        if (peerConnection.current) {
                                            peerConnection.current.close();
                                        }
                                    }}
                                    className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm transition-colors  shadow-rose-200"
                                >
                                    End Call
                                </button>
                            </div>
                        )}

                        {!isCallActive && selectedAppointment?.mode === 'online' && (
                            <div className="mb-6 px-4">
                                <p className="text-indigo-200 text-xs mb-4 opacity-80">
                                    Your consultation is scheduled via video call.
                                </p>
                                <button
                                    onClick={handleStartCall}
                                    className="w-full py-4 bg-white text-indigo-900 rounded-2xl font-bold text-base transition-transform active:scale-[0.98] shadow-xl hover:bg-indigo-50 flex items-center justify-center gap-2"
                                >
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Join Video Consultation
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-2 mb-1">
                            <span
                                className="inline-block w-2 h-2 rounded-full"
                                style={{
                                    background: '#a5f3b2',
                                    animation: 'livePulse 1.8s ease-in-out infinite',
                                }}
                            />
                            <span
                                className="text-[10px] font-bold uppercase tracking-[0.22em]"
                                style={{ color: 'rgba(165,180,252,0.75)' }}
                            >
                                Now Serving
                            </span>
                        </div>

                        <div
                            className="font-mono font-medium leading-none"
                            style={{ fontSize: 100, letterSpacing: -2, color: '#fff' }}
                        >
                            <span style={{ color: 'rgba(165,180,252,0.55)', fontSize: 60, verticalAlign: 'super' }}>#</span>
                            {currentToken}
                        </div>

                        <p className="mt-2 text-xs" style={{ color: 'rgba(165,180,252,0.65)' }}>
                            ~{AVG_TIME_PER_PATIENT} min per patient
                        </p>
                    </div>
                </div>

                {myAppointments.length > 1 && (
                    
                    <div className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl px-3 py-2.5 mb-4 gap-2">
                        <button
                            onClick={() => setActiveIdx(prev => Math.max(0, prev - 1))}
                            disabled={activeIdx === 0}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-indigo-700 text-lg disabled:opacity-25 hover:bg-indigo-50 transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex-1 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-400">
                                Booking for
                            </p>
                            <p className="text-base font-bold text-slate-900 mt-0.5">
                                {selectedAppointment?.patientDetails?.name || "Patient"}{' '}
                                <span className="text-indigo-600 text-sm opacity-70">
                                    (#{selectedAppointment?.tokenNumber})
                                </span>
                            </p>
                            <div className="flex gap-1.5 justify-center mt-1.5">
                                {myAppointments.map((_, i) => (
                                    <span
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full transition-colors"
                                        style={{ background: i === activeIdx ? '#4338ca' : '#cbd5e1' }}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setActiveIdx(prev => Math.min(myAppointments.length - 1, prev + 1))}
                            disabled={activeIdx === myAppointments.length - 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-indigo-700 text-lg disabled:opacity-25 hover:bg-indigo-50 transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {/* ── TOKEN CARD ───────────────────────────────────────────── */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 mb-4">
                    <div className="grid grid-cols-2 text-center">
                        <div className="pr-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1">
                                Your Token
                            </p>
                            <p className="font-mono font-medium text-slate-900 leading-none" style={{ fontSize: 48, letterSpacing: -1 }}>
                                #{selectedAppointment?.tokenNumber}
                            </p>
                        </div>

                        <div className="pl-4 border-l border-slate-100">
                            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1">
                                Ahead
                            </p>
                            <p className="font-mono font-medium text-slate-900 leading-none" style={{ fontSize: 48, letterSpacing: -1 }}>
                                {tokensAhead}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">people</p>
                        </div>
                    </div>

                    <div className="mt-3 text-center text-sm text-slate-500">
                        {tokensAhead === 0 ? (
                            <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-medium px-4 py-1 rounded-full">
                                You are next!
                            </span>
                        ) : (
                            <>
                                <span className="font-bold text-slate-900">{tokensAhead}</span>{' '}
                                {tokensAhead === 1 ? 'person' : 'people'} ahead of you
                            </>
                        )}
                    </div>
                </div>

        

                {/* ── STATS ────────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center mx-auto mb-2">
                            <Users size={14} className="text-indigo-700" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            My Bookings
                        </p>
                        <p className="text-xl font-bold text-slate-900 mt-0.5">{myAppointments.length}</p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                            <Clock size={14} className="text-emerald-700" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Avg. Time
                        </p>
                        <p className="text-xl font-bold text-slate-900 mt-0.5">15 min</p>
                    </div>
                </div>

            </main>
            

            <style>{`
                @keyframes livePulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.7); }
                }
            `}</style>
            

            <Footer />
        </div>
    );
};

export default Livetoken;