export type PlanKey = 'FREE' | 'PRO' | 'BUSINESS';

export interface PlanFeature {
  key: string;
  label: string;
}

export interface PlanConfig {
  key: PlanKey;
  displayName: string;
  priceTZS: number; // 0 for free
  billingPeriod: 'month';
  features: PlanFeature[];
  aiQuestionsPerMonth: number;
}

// Single source of truth for plan pricing and features.
// Change prices/features here — never hardcode them elsewhere in the app.
export const PLANS: Record<PlanKey, PlanConfig> = {
  FREE: {
    key: 'FREE',
    displayName: 'Soko Free',
    priceTZS: 0,
    billingPeriod: 'month',
    aiQuestionsPerMonth: 5,
    features: [
      { key: 'basicDashboard', label: 'Basic seller dashboard' },
      { key: 'basicAnalytics', label: 'Basic sales analytics' },
      { key: 'lowStockAlerts', label: 'Low-stock alerts' },
      { key: 'reviews', label: 'Customer reviews' },
      { key: 'basicAI', label: `AI business questions (${5}/month)` },
    ],
  },
  PRO: {
    key: 'PRO',
    displayName: 'Soko Pro',
    priceTZS: 15000,
    billingPeriod: 'month',
    aiQuestionsPerMonth: 100,
    features: [
      { key: 'everythingFree', label: 'Everything in Free' },
      { key: 'advancedAnalytics', label: 'Advanced profit & performance analytics' },
      { key: 'customerAnalytics', label: 'Customer insights & repeat-purchase tracking' },
      { key: 'exportReports', label: 'Export reports' },
      { key: 'advancedAI', label: `Advanced AI Business Assistant (${100}/month)` },
    ],
  },
  BUSINESS: {
    key: 'BUSINESS',
    displayName: 'Soko Business',
    priceTZS: 35000,
    billingPeriod: 'month',
    aiQuestionsPerMonth: 500,
    features: [
      { key: 'everythingPro', label: 'Everything in Pro' },
      { key: 'multiStaff', label: 'Multiple staff accounts' },
      { key: 'bulkManagement', label: 'Bulk product & inventory management' },
      { key: 'automatedReports', label: 'Automated reports' },
      { key: 'prioritySupport', label: 'Priority support' },
    ],
  },
};

export function getPlan(planKey: PlanKey): PlanConfig {
  return PLANS[planKey] || PLANS.FREE;
}

export function formatPlanPrice(plan: PlanConfig): string {
  if (plan.priceTZS === 0) return 'Free';
  return `TZS ${plan.priceTZS.toLocaleString('en-US')}/month`;
}