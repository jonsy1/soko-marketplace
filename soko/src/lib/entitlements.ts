import { PlanKey } from './plans';

// Centralized feature checks. Never scatter "if (business.plan === 'PRO')"
// checks around random components — always go through these functions,
// so a future pricing/feature change only has to happen in one place.

type PlanLike = { plan: PlanKey } | PlanKey;

function resolvePlan(business: PlanLike): PlanKey {
  return typeof business === 'string' ? business : business.plan;
}

export function canUseAdvancedAnalytics(business: PlanLike): boolean {
  const plan = resolvePlan(business);
  return plan === 'PRO' || plan === 'BUSINESS';
}

export function canUseCustomerAnalytics(business: PlanLike): boolean {
  const plan = resolvePlan(business);
  return plan === 'PRO' || plan === 'BUSINESS';
}

export function canExportReports(business: PlanLike): boolean {
  const plan = resolvePlan(business);
  return plan === 'PRO' || plan === 'BUSINESS';
}

export function canUseMultipleStaff(business: PlanLike): boolean {
  const plan = resolvePlan(business);
  return plan === 'BUSINESS';
}

export function canUseBulkManagement(business: PlanLike): boolean {
  const plan = resolvePlan(business);
  return plan === 'BUSINESS';
}

export function getAIQuestionLimit(business: PlanLike): number {
  const plan = resolvePlan(business);
  if (plan === 'BUSINESS') return 500;
  if (plan === 'PRO') return 100;
  return 5;
}