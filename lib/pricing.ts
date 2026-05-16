export type PlanTier = "free" | "silver" | "gold" | "platinum";


export interface PlanFeatures {
  tier: PlanTier;
  name: string;
  price: number; // in INR
  duration: number; // days
  features: {
    dailyLikes: number;
    messagesPerDay: number;
    seeWhoLiked: boolean;
    advancedFilters: boolean;
    prioritySupport: boolean;
    profileBoost: number; // 0 = none, 1 = 2x, 2 = 5x, 3 = 10x
    verifiedBadge: boolean;
    videoCall: boolean;
    undoSwipe: boolean;
    hideOnlineStatus: boolean;
    readReceipts: boolean;
    profileHighlight: boolean;
    dedicatedRM: boolean;
    familyMeetingAssist: boolean;
  };
}


export const PLANS: PlanFeatures[] = [
  {
    tier: "free",
    name: "Basic",
    price: 0,
    duration: 0,
    features: {
      dailyLikes: 10,
      messagesPerDay: 5,
      seeWhoLiked: false,
      advancedFilters: false,
      prioritySupport: false,
      profileBoost: 0,
      verifiedBadge: false,
      videoCall: false,
      undoSwipe: false,
      hideOnlineStatus: false,
      readReceipts: false,
      profileHighlight: false,
      dedicatedRM: false,
      familyMeetingAssist: false,
    },
  },
  {
    tier: "silver",
    name: "Silver",
    price: 999,
    duration: 30,
    features: {
      dailyLikes: 30,
      messagesPerDay: 20,
      seeWhoLiked: true,
      advancedFilters: true,
      prioritySupport: false,
      profileBoost: 1,
      verifiedBadge: false,
      videoCall: false,
      undoSwipe: true,
      hideOnlineStatus: false,
      readReceipts: true,
      profileHighlight: false,
      dedicatedRM: false,
      familyMeetingAssist: false,
    },
  },
  {
    tier: "gold",
    name: "Gold",
    price: 2499,
    duration: 90,
    features: {
      dailyLikes: 100,
      messagesPerDay: 50,
      seeWhoLiked: true,
      advancedFilters: true,
      prioritySupport: true,
      profileBoost: 2,
      verifiedBadge: true,
      videoCall: true,
      undoSwipe: true,
      hideOnlineStatus: true,
      readReceipts: true,
      profileHighlight: true,
      dedicatedRM: false,
      familyMeetingAssist: false,
    },
  },
  {
    tier: "platinum",
    name: "Platinum",
    price: 4999,
    duration: 180,
    features: {
      dailyLikes: -1, // unlimited
      messagesPerDay: -1,
      seeWhoLiked: true,
      advancedFilters: true,
      prioritySupport: true,
      profileBoost: 3,
      verifiedBadge: true,
      videoCall: true,
      undoSwipe: true,
      hideOnlineStatus: true,
      readReceipts: true,
      profileHighlight: true,
      dedicatedRM: true,
      familyMeetingAssist: true,
    },
  },
];


export function getPlan(tier: PlanTier): PlanFeatures {
  return PLANS.find((p) => p.tier === tier) || PLANS[0];
}


export function canAccess(userTier: PlanTier, feature: keyof PlanFeatures["features"]): boolean {
  const plan = getPlan(userTier);
  const value = plan.features[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  return false;
}


export function getLocationPrice(state: string): number {
  // Metro cities / tier-1 states get standard pricing
  const tier1 = ["Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "Telangana"];
  // Tier-2 states get 20% discount
  const tier2 = ["Gujarat", "Rajasthan", "Punjab", "Kerala", "West Bengal"];
  // Others get 30% discount


  if (tier1.includes(state)) return 1.0;
  if (tier2.includes(state)) return 0.8;
  return 0.7;
}


export function calculatePrice(plan: PlanFeatures, state: string): number {
  const multiplier = getLocationPrice(state);
  return Math.round(plan.price * multiplier);
}

