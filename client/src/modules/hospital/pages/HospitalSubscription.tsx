import { hospitalApi } from '@/constants/backend/hospital/hospital.api';
import React, { useEffect, useState, useCallback } from 'react';
import { showToast } from '@/utils/toastUtils';
import type { ISubscription, RawSubscription } from '@/interfaces/ISubscription';
import { useAppSelector } from '@/hooks/redux';
import type { HospitalProfile } from '@/store/auth/auth.type';



const colorMap: Record<string, string> = {
  "Basic": "border-t-blue-500",
  "Standard": "border-t-green-500",
  "Premium": "border-t-indigo-500",
  "Enterprise": "border-t-slate-800"
};

const getDurationDisplay = (plan: ISubscription) => {
  if (plan.duration && plan.durationUnit) {
    const unit = plan.duration === 1 ? plan.durationUnit.replace(/s$/, '') : plan.durationUnit;
    return `${plan.duration} ${unit}`;
  }

  if (plan.startDate && plan.endDate) {
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 360) return 'year';
    if (diffDays >= 28 && diffDays <= 31) return 'month';
    return `${diffDays} days`;
  }

  if (plan.durationUnit) {
    return plan.durationUnit.replace(/s$/, '');
  }

  return 'year';
};

const BillingModal = ({ plan, currentSub, isActivateDowngrade, onClose }: { plan: ISubscription; currentSub: any; isActivateDowngrade?: boolean; onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  let baseAmount = plan.amount;
  let upgradeType = isActivateDowngrade ? "activate_downgrade" : "new";
  let credit = 0;

  if (currentSub?.status === "active" && currentSub.amount >= 0) {
    if (plan.amount > currentSub.amount) {
      upgradeType = "upgrade";
      const start = new Date(currentSub.startDate).getTime();
      const end = new Date(currentSub.endDate).getTime();
      const now = new Date().getTime();
      if (end > start && end > now) {
        const totalDays = (end - start) / (1000 * 60 * 60 * 24);
        const remainingDays = (end - now) / (1000 * 60 * 60 * 24);
        credit = (currentSub.amount / totalDays) * remainingDays;
        baseAmount = Math.max(0, baseAmount - credit);
      }
    } else if (plan.amount < currentSub.amount) {
      upgradeType = "downgrade";
      baseAmount = 0; // Downgrade doesn't cost anything right now
    }
  }

  const taxRate = 0.1;
  const taxAmount = baseAmount * taxRate;
  const totalAmount = baseAmount + taxAmount;

  const handlePayment = async () => {
    try {
      setLoading(true);
      if (upgradeType === "downgrade") {
        await hospitalApi.downgradeSubscription(plan.id);
        showToast.success(`Downgrade to ${plan.plan} scheduled successfully!`);
        onClose();
        // optionally trigger a reload of profile
      } else if (upgradeType === "upgrade") {
        const res = await hospitalApi.upgradeSubscription(plan.id);
        if (res.data?.url) {
          window.location.href = res.data.url;
        } else {
          showToast.error("Payment session failed");
        }
      } else if (upgradeType === "activate_downgrade") {
        const res = await hospitalApi.activatePendingDowngrade(plan.id);
        if (res.data?.url) {
          window.location.href = res.data.url;
        } else {
          showToast.error("Payment session failed");
        }
      } else {
        const res = await hospitalApi.createPaymentSession({ planId: plan.id });
        if (res.data?.url) {
          window.location.href = res.data.url;
        } else {
          showToast.error("Payment session failed");
        }
      }
    } catch (error) {
      console.error(error);
      showToast.error("Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">
            {upgradeType === 'upgrade' ? 'Upgrade Plan' : upgradeType === 'downgrade' ? 'Downgrade Plan' : upgradeType === 'activate_downgrade' ? 'Activate Downgrade' : 'Order Summary'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 bg-amber-50 space-y-4">
          <div className="flex justify-between items-center text-slate-600">
            <span>Selected Plan</span>
            <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-sm">{plan.plan}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Duration</span>
            <span className="capitalize">{getDurationDisplay(plan)}</span>
          </div>
          <div className="my-6 border-t border-dashed border-slate-200" />
          
          {upgradeType === 'downgrade' ? (
            <div className="text-slate-600 text-sm text-center">
              Downgrade will take effect automatically when your current plan expires. No payment is required today.
            </div>
          ) : (
            <>
              <div className="flex justify-between text-slate-600">
                <span>Plan Price</span>
                <span>₹{plan.amount.toLocaleString()}</span>
              </div>
              {upgradeType === 'upgrade' && credit > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Current Plan Credit</span>
                  <span>-₹{credit.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Base Amount</span>
                <span>₹{baseAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-sm">
                <span>GST (18%)</span>
                <span>₹{taxAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="mt-6 bg-slate-900 rounded-2xl p-5 flex justify-between items-center shadow-lg shadow-slate-200">
                <span className="text-white font-medium">Total Payable</span>
                <span className="text-white text-2xl font-black">₹{totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </>
          )}
        </div>

        <div className="p-8 pt-0 bg-white space-y-3 mt-4">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : upgradeType === 'downgrade' ? 'Confirm Downgrade' : upgradeType === 'activate_downgrade' ? 'Pay & Activate' : 'Pay Securely'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full text-slate-400 py-2 text-sm font-medium hover:text-slate-600 transition"
          >
            Cancel and Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

const HospitalSubscription = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [subscriptionPlans, setSubscriptionPlans] = useState<ISubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<ISubscription | null>(null);
  const [isActivateDowngradeMode, setIsActivateDowngradeMode] = useState(false);
  const hospital = useAppSelector((state) => state.auth.profileData);
  const subscription = (hospital as HospitalProfile)?.subscription ?? null;

const fetchSubscriptions = useCallback(async () => {
  try {
    setLoading(true);
    const response = await hospitalApi.getsubscription();

    if (response.data?.success && response.data?.data?.data) {
      const plans: ISubscription[] = response.data.data.data.map((item: RawSubscription) => ({
        ...item,
        plan: item.plan || item.planName || ''
      }));

      setSubscriptionPlans(plans);
    }
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    showToast.error("Failed to load subscription plans");
  } finally {
    setLoading(false);
  }
}, []); 
  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const filteredPlans = subscriptionPlans.filter(plan =>
    plan.plan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSubscriptionActive = () => {
  if (!subscription) {
    return false;
  }

  const { status, endDate } = subscription;

  if (status !== "active") {
    console.log("Status not active");
    return false;
  }

  if (!endDate) {
    return false;
  }

  const today = new Date();
  const expiry = new Date(endDate);

  if (isNaN(expiry.getTime())) {
    console.log("Invalid date");
    return false;
  }

  return today <= expiry;
};

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {!isSubscriptionActive() && subscription?.pendingPlanId && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Action Required: Plan Expired
              </h3>
              <p className="text-amber-700 mt-1">
                Your previous plan has expired. You requested a downgrade to <strong>{subscription.pendingPlanName}</strong>. Please activate it now to continue using MedSync.
              </p>
            </div>
            <button
              onClick={() => {
                const pendingPlan = subscriptionPlans.find(p => p.id === subscription.pendingPlanId);
                if (pendingPlan) {
                  setIsActivateDowngradeMode(true);
                  setSelectedPlan(pendingPlan);
                }
              }}
              className="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition whitespace-nowrap"
            >
              Activate Downgrade
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            MedSync Service Plans
          </h1>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Choose the perfect management scale for your hospital's needs.
          </p>

          {/* Search + Add button row */}
          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by plan name..."
                className="w-full px-5 py-3 pl-12 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

  
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlans.length > 0 ? (
              filteredPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-white border-t-4 ${colorMap[plan.plan] || 'border-t-indigo-500'} rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col p-8`}
                >
              
                  {plan.plan === "Premium" && (
                    <span className="absolute top-0 right-8 transform -translate-y-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                      Most Popular
                    </span>
                  )}

                  <h3 className="text-2xl font-bold text-slate-800">{plan.plan}</h3>

                  <div className="mt-6 flex items-baseline">
                    <span className="text-5xl font-black text-slate-900">₹{plan.amount}</span>
                    <span className="ml-2 text-slate-500 font-medium">/{getDurationDisplay(plan)}</span>
                  </div>

                  <hr className="my-8 border-slate-100" />

                 <div className="space-y-4 mb-8 grow">
  {/* Display the Description */}
  <div className="text-slate-600 italic">
    {plan.description || "No description provided."}
  </div>

 
  <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg w-fit">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span>Plan Validity: {getDurationDisplay(plan)}</span>
  </div>
</div>

               <button
  onClick={() => {
    if (isSubscriptionActive() && subscription?.plan === plan.plan) {
      showToast.error("You are already on this plan");
      return;
    }
    
    // We allow clicking if it's an active subscription but a different plan (upgrade/downgrade)
    // or if subscription is expired/not active (new plan)
    setSelectedPlan(plan);
  }}
  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-indigo-600 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-slate-200"
>
  {subscription?.plan === plan.plan && isSubscriptionActive() ? 'Current Plan' : (isSubscriptionActive() ? (plan.amount > (subscription?.amount || 0) ? 'Upgrade' : 'Downgrade') : 'Get Started')}
</button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-slate-400 text-lg">No plans found matching your search.</p>
              </div>
            )}
          </div>
        )}

        {/* Billing Modal */}
        {selectedPlan && (
          <BillingModal
            plan={selectedPlan}
            currentSub={subscription}
            isActivateDowngrade={isActivateDowngradeMode}
            onClose={() => {
              setSelectedPlan(null);
              setIsActivateDowngradeMode(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default HospitalSubscription;