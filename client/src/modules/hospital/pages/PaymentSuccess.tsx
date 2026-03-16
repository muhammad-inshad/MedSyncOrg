import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HOSPITAL_ROUTES } from '@/constants/frontend/hospital/hospital.routes';
import { showToast } from '@/utils/toastUtils';

/* ---------- Confetti particle ---------- */
const COLORS = ['#10b981', '#34d399', '#fbbf24', '#f59e0b', '#6ee7b7', '#fff', '#a7f3d0'];
type Particle = {
    id: number; x: number; y: number;
    vx: number; vy: number; rot: number; vrot: number;
    color: string; w: number; h: number; opacity: number;
};
function makeParticle(id: number): Particle {
    return {
        id, x: 50, y: 40,
        vx: (Math.random() - 0.5) * 6,
        vy: -(Math.random() * 6 + 3),
        rot: Math.random() * 360,
        vrot: (Math.random() - 0.5) * 12,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        w: Math.random() * 8 + 4,
        h: Math.random() * 4 + 3,
        opacity: 1,
    };
}

/* ---------- SVG countdown ring ---------- */
function CountdownRing({ value, max }: { value: number; max: number }) {
    const r = 22, c = 2 * Math.PI * r;
    const progress = (value / max) * c;
    return (
        <svg width="60" height="60" className="absolute inset-0 m-auto" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
            <circle
                cx="30" cy="30" r={r} fill="none"
                stroke="#fbbf24" strokeWidth="3"
                strokeDasharray={`${progress} ${c}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s linear' }}
            />
        </svg>
    );
}

/* ========== Main Component ========== */
const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');

    const TOTAL = 5;
    const [countdown, setCountdown] = useState(TOTAL);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [visible, setVisible] = useState(false);
    const animRef = useRef<number | null>(null);
    const partRef = useRef<Particle[]>([]);
    const lastRef = useRef<number>(0);

    /* entrance animation */
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 50);
        return () => clearTimeout(t);
    }, []);

    /* confetti loop */
    useEffect(() => {
        let id = 0;
        const burst = () => {
            const newOnes = Array.from({ length: 18 }, () => makeParticle(id++));
            partRef.current = [...partRef.current, ...newOnes];
        };
        burst();

        const tick = (ts: number) => {
            if (ts - lastRef.current > 16) {
                lastRef.current = ts;
                partRef.current = partRef.current
                    .map(p => ({
                        ...p,
                        x: p.x + p.vx,
                        y: p.y + p.vy,
                        vy: p.vy + 0.18,
                        rot: p.rot + p.vrot,
                        opacity: p.y > 110 ? Math.max(0, p.opacity - 0.06) : p.opacity,
                    }))
                    .filter(p => p.opacity > 0);
                setParticles([...partRef.current]);
            }
            animRef.current = requestAnimationFrame(tick);
        };
        animRef.current = requestAnimationFrame(tick);

        const burstTimer = setInterval(burst, 800);
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
            clearInterval(burstTimer);
        };
    }, []);

    /* countdown + redirect */
    useEffect(() => {
        const isFreePlan = searchParams.get('plan') === 'free';
        if (!sessionId && !isFreePlan) { navigate(HOSPITAL_ROUTES.HOSPITAL_SUBSCRIPTION); return; }
        showToast.success("Payment successful! Your subscription has been updated.");

        const iv = setInterval(() => {
            setCountdown(c => {
                if (c <= 1) { clearInterval(iv); navigate(HOSPITAL_ROUTES.HOSPITALDASHBOARD); return 0; }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(iv);
    }, [sessionId, navigate]);

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 70%, #0d9488 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Decorative blobs */}
            <div style={{
                position: 'absolute', top: '-10%', left: '-5%',
                width: '420px', height: '420px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-8%', right: '-4%',
                width: '380px', height: '380px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            {/* Confetti canvas */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                {particles.map(p => (
                    <div key={p.id} style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.w,
                        height: p.h,
                        background: p.color,
                        borderRadius: 1,
                        transform: `rotate(${p.rot}deg)`,
                        opacity: p.opacity,
                    }} />
                ))}
            </div>

            {/* Card */}
            <div style={{
                maxWidth: 420,
                width: '100%',
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 28,
                padding: '2.5rem 2rem',
                textAlign: 'center',
                boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05) inset',
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.96)',
                opacity: visible ? 1 : 0,
                transition: 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1), opacity 0.45s ease',
            }}>

                {/* Icon */}
                <div style={{
                    width: 100, height: 100, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                    boxShadow: '0 0 0 12px rgba(16,185,129,0.2), 0 0 48px rgba(16,185,129,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.75rem',
                    animation: 'popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both',
                }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M5 13l4 4L19 7"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                strokeDasharray: 30,
                                strokeDashoffset: 0,
                                animation: 'drawCheck 0.5s ease 0.5s both',
                            }}
                        />
                    </svg>
                </div>

                {/* Headline */}
                <div style={{
                    display: 'inline-block',
                    background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                    color: 'transparent',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                }}>
                    Transaction Complete
                </div>

                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: '#fff',
                    margin: '0 0 0.75rem',
                    lineHeight: 1.1,
                    letterSpacing: '-0.03em',
                }}>
                    Payment Successful!
                </h1>

                <p style={{
                    color: 'rgba(255,255,255,0.65)',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    margin: '0 0 2rem',
                }}>
                    Your subscription is now active and all limits have been updated. Welcome aboard!
                </p>

                {/* Divider badge */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    marginBottom: '1.75rem',
                }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
                    <span style={{
                        fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)',
                        fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>All set</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
                </div>

                {/* CTA button */}
                <button
                    onClick={() => navigate(HOSPITAL_ROUTES.HOSPITALDASHBOARD)}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        borderRadius: 14,
                        color: '#fff',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        letterSpacing: '-0.01em',
                        boxShadow: '0 8px 24px rgba(16,185,129,0.4), 0 1px 0 rgba(255,255,255,0.15) inset',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        marginBottom: '1.25rem',
                    }}
                    onMouseEnter={e => {
                        (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                        (e.target as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(16,185,129,0.5), 0 1px 0 rgba(255,255,255,0.15) inset';
                    }}
                    onMouseLeave={e => {
                        (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                        (e.target as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(16,185,129,0.4), 0 1px 0 rgba(255,255,255,0.15) inset';
                    }}
                >
                    Go to Dashboard →
                </button>

                {/* Countdown */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                    color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem',
                }}>
                    <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
                        <CountdownRing value={countdown} max={TOTAL} />
                        <span style={{
                            position: 'absolute', inset: 0, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            color: '#fbbf24', fontWeight: 700, fontSize: '0.75rem',
                        }}>{countdown}</span>
                    </div>
                    Redirecting automatically in {countdown}s…
                </div>
            </div>

            <style>{`
                @keyframes popIn {
                    from { transform: scale(0.4); opacity: 0; }
                    to   { transform: scale(1);   opacity: 1; }
                }
                @keyframes drawCheck {
                    from { stroke-dashoffset: 30; }
                    to   { stroke-dashoffset: 0;  }
                }
            `}</style>
        </div>
    );
};

export default PaymentSuccess;