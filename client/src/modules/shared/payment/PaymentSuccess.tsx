import React, { useEffect, useCallback } from "react";

interface PaymentDetails {
  amount: string;
  reference: string;
  date: string;
  cardLast4: string;
}

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewReceipt?: () => void;
  onBackToDashboard?: () => void;
  paymentDetails?: PaymentDetails;
}

const defaultDetails: PaymentDetails = {
  amount: "$49.00",
  reference: "pi_3Q4mXK2eZvKYlo2C",
  date: "Mar 15, 2026 · 10:42 AM",
  cardLast4: "4242",
};

const PaymentSuccess: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  onViewReceipt,
  onBackToDashboard,
  paymentDetails = defaultDetails,
}) => {
  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .mono { font-family: 'DM Mono', monospace; }

        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.88) translateY(24px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes scaleIn {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 100; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes pulseRing {
          0%   { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          from { background-position: -200% center; }
          to   { background-position:  200% center; }
        }

        .backdrop-anim  { animation: backdropIn 0.3s ease both; }
        .modal-anim     { animation: modalIn 0.45s cubic-bezier(0.175,0.885,0.32,1.275) both; }
        .check-circle   { animation: scaleIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) 0.3s both; }
        .check-path     { stroke-dasharray: 100; stroke-dashoffset: 100; animation: checkDraw 0.4s ease 0.8s forwards; }
        .pulse-ring     { animation: pulseRing 1.5s ease 0.6s infinite; }
        .f1 { animation: fadeUp 0.45s ease 1.0s  both; }
        .f2 { animation: fadeUp 0.45s ease 1.12s both; }
        .f3 { animation: fadeUp 0.45s ease 1.22s both; }
        .f4 { animation: fadeUp 0.45s ease 1.32s both; }
        .f5 { animation: fadeUp 0.45s ease 1.42s both; }

        .shimmer-btn {
          background: linear-gradient(90deg,#4f46e5 0%,#7c3aed 40%,#a855f7 60%,#4f46e5 100%);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="backdrop-anim fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="modal-anim relative w-full max-w-md rounded-3xl p-9 overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.85),transparent)" }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
          >
            ✕
          </button>

          {/* Check icon */}
          <div className="flex justify-center mb-7">
            <div className="relative">
              <div
                className="pulse-ring absolute inset-0 rounded-full"
                style={{ background: "rgba(99,102,241,0.3)" }}
              />
              <div
                className="check-circle relative w-[72px] h-[72px] rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
              >
                <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
                  <path
                    className="check-path"
                    d="M8 18.5L15 25.5L28 11"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Heading */}
          <p className="f1 mono text-center text-[10px] tracking-[0.15em] mb-1.5"
            style={{ color: "rgba(139,92,246,0.9)" }}>
            PAYMENT CONFIRMED
          </p>
          <h1 className="f2 text-[26px] font-semibold text-white text-center mb-1.5"
            style={{ letterSpacing: "-0.02em" }}>
            You're all set!
          </h1>
          <p className="f3 text-[13px] text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
            Your payment was processed successfully.
          </p>

          {/* Receipt */}
          <div
            className="f4 rounded-2xl p-4 my-6 space-y-3"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {[
              { label: "Amount paid", value: paymentDetails.amount, className: "text-white" },
              { label: "Reference",   value: paymentDetails.reference, className: "mono", style: { color: "rgba(139,92,246,0.9)" } },
              { label: "Date",        value: paymentDetails.date,      className: "mono", style: { color: "rgba(255,255,255,0.55)" } },
            ].map(({ label, value, className, style }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>{label}</span>
                <span className={`text-xs ${className}`} style={style}>{value}</span>
              </div>
            ))}

            <div className="pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded flex items-center justify-center"
                  style={{ background: "rgba(99,102,241,0.2)" }}>
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2"
                      stroke="rgba(139,92,246,0.9)" strokeWidth="2" />
                    <path d="M2 10h20" stroke="rgba(139,92,246,0.9)" strokeWidth="2" />
                  </svg>
                </div>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
                  Visa ending in <span className="text-white">{paymentDetails.cardLast4}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="f5 space-y-2.5">
            <button
              onClick={onViewReceipt}
              className="shimmer-btn w-full py-3 rounded-[14px] text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              View Receipt
            </button>
            <button
              onClick={onBackToDashboard ?? onClose}
              className="w-full py-3 rounded-[14px] text-sm font-medium transition-colors"
              style={{
                color: "rgba(255,255,255,0.45)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              Back to Dashboard
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            </svg>
            <span className="mono text-[11px]" style={{ color: "rgba(255,255,255,0.18)" }}>
              Secured by Stripe
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;