import { UserProfile } from "./firestore";


/** Weights for each scoring dimension (must sum to 100) */
export const SCORING_WEIGHTS = {
  age: 20,
  religion: 15,
  casteGotra: 10,
  location: 15,
  education: 10,
  income: 5,
  diet: 5,
  lifestyle: 5,
  familyType: 5,
  hobbies: 5,
  motherTongue: 5,
} as const;


export interface ScoreBreakdown {
  age: number;
  religion: number;
  casteGotra: number;
  location: number;
  education: number;
  income: number;
  diet: number;
  lifestyle: number;
  familyType: number;
  hobbies: number;
  motherTongue: number;
}


export interface CompatibilityResult {
  score: number;
  breakdown: ScoreBreakdown;
}


const EDUCATION_LEVELS: Record<string, number> = {
  "high school": 1,
  "bachelor's": 2,
  "bachelors": 2,
  "master's": 3,
  "masters": 3,
  "phd": 4,
  "professional": 5,
};


const INCOME_BRACKETS: Record<string, number> = {
  "0-3 lpa": 1,
  "3-5 lpa": 2,
  "5-10 lpa": 3,
  "10-20 lpa": 4,
  "20-50 lpa": 5,
  "50+ lpa": 6,
};


const LIFESTYLE_LEVELS: Record<string, number> = {
  traditional: 1,
  moderate: 2,
  liberal: 3,
};


const DIET_COMPAT: Record<string, Record<string, number>> = {
  vegetarian: { vegetarian: 100, eggetarian: 50, vegan: 75, "non-vegetarian": 0 },
  eggetarian: { vegetarian: 50, eggetarian: 100, vegan: 50, "non-vegetarian": 50 },
  vegan: { vegetarian: 75, eggetarian: 50, vegan: 100, "non-vegetarian": 0 },
  "non-vegetarian": { vegetarian: 0, eggetarian: 50, vegan: 0, "non-vegetarian": 100 },
};


const LANGUAGE_FAMILIES: Record<string, string> = {
  hindi: "indo-aryan",
  marathi: "indo-aryan",
  gujarati: "indo-aryan",
  punjabi: "indo-aryan",
  bengali: "indo-aryan",
  odia: "indo-aryan",
  tamil: "dravidian",
  telugu: "dravidian",
  kannada: "dravidian",
  malayalam: "dravidian",
};


function scoreAge(seeker: UserProfile, candidate: UserProfile): number {
  const candidateAge = candidate.age || 25;
  const minAge = seeker.preferences?.minAge || 18;
  const maxAge = seeker.preferences?.maxAge || 60;
  if (candidateAge >= minAge && candidateAge <= maxAge) return 100;
  const distance = candidateAge < minAge ? minAge - candidateAge : candidateAge - maxAge;
  return Math.max(0, 100 - distance * 10);
}


function scoreReligion(seeker: UserProfile, candidate: UserProfile): number {
  const pref = seeker.preferences?.religion?.toLowerCase() || "any";
  if (pref === "any" || pref === "") return 100;
  const candidateReligion = candidate.religion?.toLowerCase() || "";
  return pref === candidateReligion ? 100 : 0;
}


function scoreCasteGotra(seeker: UserProfile, candidate: UserProfile): number {
  if (seeker.gotra && candidate.gotra && seeker.gotra.toLowerCase() === candidate.gotra.toLowerCase()) {
    return 0;
  }
  const seekerCaste = seeker.caste?.toLowerCase() || "";
  const candidateCaste = candidate.caste?.toLowerCase() || "";
  if (!seekerCaste || !candidateCaste) return 50;
  if (seekerCaste === candidateCaste) return 100;
  return 50;
}


function scoreLocation(seeker: UserProfile, candidate: UserProfile): number {
  const seekerLoc = seeker.location?.toLowerCase() || "";
  const candidateLoc = candidate.location?.toLowerCase() || "";
  if (!seekerLoc || !candidateLoc) return 50;
  if (seekerLoc === candidateLoc) return 100;
  const seekerParts = seekerLoc.split(",").map((s) => s.trim());
  const candidateParts = candidateLoc.split(",").map((s) => s.trim());
  if (seekerParts.length > 1 && candidateParts.length > 1) {
    if (seekerParts[1] === candidateParts[1]) return 75;
  }
  const seekerPref = seeker.preferences?.location?.toLowerCase() || "any";
  if (seekerPref === "any" || seekerPref === "") return 50;
  if (candidateLoc.includes(seekerPref) || seekerPref.includes(candidateLoc)) return 75;
  return 25;
}


function scoreEducation(seeker: UserProfile, candidate: UserProfile): number {
  const seekerLevel = EDUCATION_LEVELS[seeker.education?.toLowerCase() || ""] || 0;
  const candidateLevel = EDUCATION_LEVELS[candidate.education?.toLowerCase() || ""] || 0;
  if (seekerLevel === 0 || candidateLevel === 0) return 50;
  const gap = Math.abs(seekerLevel - candidateLevel);
  if (gap === 0) return 100;
  if (gap === 1) return 75;
  if (gap === 2) return 50;
  return 25;
}


function scoreIncome(seeker: UserProfile, candidate: UserProfile): number {
  const seekerBracket = INCOME_BRACKETS[seeker.annualIncome?.toLowerCase() || ""] || 0;
  const candidateBracket = INCOME_BRACKETS[candidate.annualIncome?.toLowerCase() || ""] || 0;
  if (seekerBracket === 0 || candidateBracket === 0) return 50;
  const gap = Math.abs(seekerBracket - candidateBracket);
  if (gap === 0) return 100;
  if (gap === 1) return 75;
  if (gap === 2) return 50;
  return 25;
}


function scoreDiet(seeker: UserProfile, candidate: UserProfile): number {
  const seekerDiet = seeker.diet?.toLowerCase() || "";
  const candidateDiet = candidate.diet?.toLowerCase() || "";
  if (!seekerDiet || !candidateDiet) return 50;
  return DIET_COMPAT[seekerDiet]?.[candidateDiet] ?? 50;
}


function scoreLifestyle(seeker: UserProfile, candidate: UserProfile): number {
  const seekerLevel = LIFESTYLE_LEVELS[seeker.lifestyle?.toLowerCase() || ""] || 0;
  const candidateLevel = LIFESTYLE_LEVELS[candidate.lifestyle?.toLowerCase() || ""] || 0;
  if (seekerLevel === 0 || candidateLevel === 0) return 50;
  const gap = Math.abs(seekerLevel - candidateLevel);
  if (gap === 0) return 100;
  if (gap === 1) return 50;
  return 0;
}


function scoreFamilyType(seeker: UserProfile, candidate: UserProfile): number {
  const a = seeker.familyType?.toLowerCase() || "";
  const b = candidate.familyType?.toLowerCase() || "";
  if (!a || !b) return 50;
  return a === b ? 100 : 50;
}


function scoreHobbies(seeker: UserProfile, candidate: UserProfile): number {
  const seekerHobbies = seeker.hobbies || [];
  const candidateHobbies = candidate.hobbies || [];
  if (seekerHobbies.length === 0 || candidateHobbies.length === 0) return 50;
  const seekerSet = new Set(seekerHobbies.map((h) => h.toLowerCase()));
  const common = candidateHobbies.filter((h) => seekerSet.has(h.toLowerCase())).length;
  const maxLen = Math.max(seekerHobbies.length, candidateHobbies.length);
  return Math.round((common / maxLen) * 100);
}


function scoreMotherTongue(seeker: UserProfile, candidate: UserProfile): number {
  const a = seeker.motherTongue?.toLowerCase() || "";
  const b = candidate.motherTongue?.toLowerCase() || "";
  if (!a || !b) return 50;
  if (a === b) return 100;
  const familyA = LANGUAGE_FAMILIES[a] || a;
  const familyB = LANGUAGE_FAMILIES[b] || b;
  if (familyA === familyB) return 50;
  return 25;
}


export function calculateCompatibility(seeker: UserProfile, candidate: UserProfile): CompatibilityResult {
  const breakdown: ScoreBreakdown = {
    age: scoreAge(seeker, candidate),
    religion: scoreReligion(seeker, candidate),
    casteGotra: scoreCasteGotra(seeker, candidate),
    location: scoreLocation(seeker, candidate),
    education: scoreEducation(seeker, candidate),
    income: scoreIncome(seeker, candidate),
    diet: scoreDiet(seeker, candidate),
    lifestyle: scoreLifestyle(seeker, candidate),
    familyType: scoreFamilyType(seeker, candidate),
    hobbies: scoreHobbies(seeker, candidate),
    motherTongue: scoreMotherTongue(seeker, candidate),
  };


  const score = Math.round(
    Object.entries(SCORING_WEIGHTS).reduce((total, [key, weight]) => {
      return total + (breakdown[key as keyof ScoreBreakdown] * weight) / 100;
    }, 0)
  );


  return { score, breakdown };
}

