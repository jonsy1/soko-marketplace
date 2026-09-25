'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PLANS, PlanKey, formatPlanPrice } from '@/lib/plans';

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState<PlanKey>('FREE');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/businesses/me')
      .then((r) => r.json())
      .then((b) => {
        if (b && b.plan) setCurrentPlan(b.plan);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-10 text-night/50">Loading...</div>;
  }

  const currentPlanName = PLANS[currentPlan].displayName;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-2">Plans and billing</h1>
      <p className="text-night/50 text-sm mb-8">
        Choose the plan that fits your business. Current plan: <span className="font-semibold text-night">{currentPlanName}</span>
      </p>

      <div className="grid md:grid-cols-3 gap-5">
        {Object.values(PLANS).map((plan) => {
          const isCurrent = plan.key === currentPlan;
          const waMessage = 'Hi Soko, I would like to upgrade my shop to ' + plan.displayName + ' (' + formatPlanPrice(plan) + ').';
          const waLink = 'https://wa.me/?text=' + encodeURIComponent(waMessage);

          return (
            <div
              key={plan.key}
              className={isCurrent ? 'card p-6 flex flex-col border-2 border-market-500' : 'card p-6 flex flex-col'}
            >
              {isCurrent && (
                <span className="badge bg-market-100 text-market-600 self-start mb-3">Current plan</span>
              )}
              <h2 className="font-display text-xl font-bold text-night">{plan.displayName}</h2>
              <p className="font-display text-2xl font-bold text-market-600 mt-1 mb-4">
                {formatPlanPrice(plan)}
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f.key} className="flex items-start gap-2 text-sm text-night/70">
                    <span className="text-teal-600 shrink-0">check</span>
                    {f.label}
                  </li>
                ))}
              </ul>
              {isCurrent && (
                <button disabled className="btn btn-outline w-full opacity-50 cursor-default">
                  Your current plan
                </button>
              )}
              {!isCurrent && plan.priceTZS === 0 && (
                <button disabled className="btn btn-outline w-full opacity-50 cursor-default">
                  Downgrade not available here
                </button>
              )}
              {!isCurrent && plan.priceTZS > 0 && (
                <Link
                  href={waLink}
                  target="_blank"
                  className="btn btn-primary w-full text-center"
                >
                  Contact us to upgrade
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-night/40 mt-6">
        Online payment for upgrades is coming soon. For now, upgrading is handled manually. Message us on WhatsApp and we will activate your plan.
      </p>
    </div>
  );
}