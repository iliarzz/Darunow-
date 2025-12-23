import type { EligibilityStatus, InsurancePolicy } from "@prisma/client";

export type EligibilityResult = { status: EligibilityStatus; reason?: string };

export type CoverageEstimateItem = { price: number; quantity?: number };

export type CoverageEstimateResult = {
  patientShare: number;
  insurerShare: number;
  breakdown?: Record<string, number>;
};

export interface InsuranceAdapter {
  checkEligibility(policy: Pick<InsurancePolicy, "memberId" | "planName">): Promise<EligibilityResult>;
  estimateCoverage(items: CoverageEstimateItem[]): Promise<CoverageEstimateResult>;
}

class MockInsuranceAdapter implements InsuranceAdapter {
  async checkEligibility(policy: Pick<InsurancePolicy, "memberId" | "planName">): Promise<EligibilityResult> {
    if (!policy.memberId) return { status: "unknown", reason: "memberId_missing" };
    if (policy.memberId.startsWith("0")) return { status: "ineligible", reason: "invalid_member" };
    if (policy.planName?.toLowerCase().includes("vip")) return { status: "eligible", reason: "vip_plan" };
    return { status: "eligible" };
  }

  async estimateCoverage(items: CoverageEstimateItem[]): Promise<CoverageEstimateResult> {
    const total = items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0);
    const insurerShare = Math.round(total * 0.7);
    const patientShare = Math.max(total - insurerShare, 0);
    return {
      patientShare,
      insurerShare,
      breakdown: { base: total, insurerShare, patientShare },
    };
  }
}

export function getInsuranceAdapter(providerName?: string): InsuranceAdapter {
  const provider = (providerName ?? process.env.INSURANCE_ADAPTER ?? "mock").toLowerCase();
  switch (provider) {
    case "mock":
    default:
      return new MockInsuranceAdapter();
  }
}

export const insuranceAdapter = getInsuranceAdapter();
