import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "@/utils/toastUtils";

/* ---------- SVG countdown ring ---------- */
function CountdownRing({ value, max }: { value: number; max: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const progress = (value / max) * c;

  return (
    <svg
      width="60"
      height="60"
      className="absolute inset-0 m-auto"
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle
        cx="30"
        cy="30"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="3"
      />
      <circle
        cx="30"
        cy="30"
        r={r}
        fill="none"
        stroke="#ef4444"
        strokeWidth="3"
        strokeDasharray={`${progress} ${c}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s linear" }}
      />
    </svg>
  );
}

interface PaymentFailedProps {
  title?: string;
  message?: string;
  redirectPath: string;
  redirectLabel?: string;
}

const PaymentFailed = ({
  title = "Payment Failed",
  message = "Something went wrong with your transaction. Please try again later.",
  redirectPath,
  redirectLabel = "Go Back",
}: PaymentFailedProps) => {
  const navigate = useNavigate();
  const TOTAL = 5;
  const [countdown, setCountdown] = useState(TOTAL);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    showToast.error("Payment failed or cancelled.");

    const iv = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(iv);
          navigate(redirectPath);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(iv);
  }, [navigate, redirectPath]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 40%, #b91c1c 70%, #dc2626 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 28,
          padding: "2.5rem 2rem",
          textAlign: "center",
          boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05) inset",
          transform: visible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.96)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.55s cubic-bezier(0.34,1.56,0.64,1), opacity 0.45s ease",
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#ef4444,#dc2626)",
            boxShadow: "0 0 0 12px rgba(239,68,68,0.2),0 0 48px rgba(239,68,68,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.75rem",
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", marginBottom: "1rem" }}>
          {title}
        </h1>

        <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: "2rem" }}>
          {message}
        </p>

        <button
          onClick={() => navigate(redirectPath)}
          style={{
            width: "100%",
            padding: "1rem",
            background: "linear-gradient(135deg,#ef4444,#dc2626)",
            border: "none",
            borderRadius: 14,
            color: "#fff",
            fontSize: "1rem",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: "1.25rem",
          }}
        >
          {redirectLabel}
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            color: "rgba(255,255,255,0.45)",
            fontSize: "0.82rem",
          }}
        >
          <div style={{ position: "relative", width: 32, height: 32 }}>
            <CountdownRing value={countdown} max={TOTAL} />
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ef4444",
                fontWeight: 700,
                fontSize: "0.75rem",
              }}
            >
              {countdown}
            </span>
          </div>
          Redirecting automatically in {countdown}s…
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
