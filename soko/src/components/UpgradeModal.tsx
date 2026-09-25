'use client';

import Link from 'next/link';
import { PlanKey, getPlan, formatPlanPrice } from '@/lib/plans';

interface UpgradeModalProps {
  featureName: string;
  featureDescription: string;
  requiredPlan: PlanKey;
  onClose: () => void;
}

export default function UpgradeModal({
  featureName,
  featureDescription,
  requiredPlan,
  onClose,
}: UpgradeModalProps) {
  const plan = getPlan(requiredPlan);

  return (
    <div className="fixed inset-0 z-[60] bg-night/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl overflow-hidden p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-market-500 text-white flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 16.9l-6.2 3.4 1.6-6.8L2.2 8.9l6.9-.6L12 2z" />
            </svg>
          </div>
          <button onClick={onClose} className="text-night/40 hover:text-night/70" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-night/40 uppercase font-semibold mb-1">Feature</p>
        <h2 className="font-display text-lg font-bold text-night mb-3">{featureName}</h2>

        <p className="text-sm text-night/60 mb-4">{featureDescription}</p>

        <div className="bg-market-50 rounded-2xl p-4 mb-5">
          <p className="text-xs text-night/50 font-semibold uppercase">Plan required</p>
          <p className="font-display text-xl font-bold text-night mt-1">{plan.displayName}</p>
          <p className="text-market-600 font-semibold mt-0.5">{formatPlanPrice(plan)}</p>
        </div>

        <Link
          href="/dashboard/business/billing"
          className="btn btn-primary w-full text-center block"
        >
          View plans
        </Link>
        <button onClick={onClose} className="btn btn-outline w-full mt-2">
          Not now
        </button>
      </div>
    </div>
  );
}