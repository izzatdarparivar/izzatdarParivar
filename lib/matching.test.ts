import { describe, it, expect } from "vitest";
import { calculateCompatibility } from "./matching";
import { UserProfile } from "./firestore";


function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    uid: "test-uid",
    name: "Test User",
    gender: "male",
    dob: null,
    age: 28,
    height: "5'8\"",
    location: "Mumbai",
    religion: "Hindu",
    caste: "Brahmin",
    motherTongue: "Hindi",
    education: "Bachelor's",
    occupation: "Engineer",
    annualIncome: "5-10 LPA",
    bio: "Hello",
    photoURL: "",
    phone: "",
    email: "test@test.com",
    preferences: { minAge: 24, maxAge: 32, religion: "Hindu", location: "Mumbai" },
    status: "approved",
    is_premium: false,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}


describe("calculateCompatibility", () => {
  it("returns high score for a perfect match", () => {
    const seeker = makeProfile({
      uid: "seeker", gender: "male", age: 28, location: "Mumbai",
      religion: "Hindu", caste: "Brahmin", motherTongue: "Hindi",
      education: "Bachelor's", annualIncome: "5-10 LPA", diet: "Vegetarian",
      lifestyle: "Moderate", familyType: "Nuclear", hobbies: ["reading", "cooking", "travel"],
      gotra: "Bharadwaj", preferences: { minAge: 24, maxAge: 32, religion: "Hindu", location: "Mumbai" },
    });
    const candidate = makeProfile({
      uid: "candidate", gender: "female", age: 26, location: "Mumbai",
      religion: "Hindu", caste: "Brahmin", motherTongue: "Hindi",
      education: "Bachelor's", annualIncome: "5-10 LPA", diet: "Vegetarian",
      lifestyle: "Moderate", familyType: "Nuclear", hobbies: ["reading", "cooking", "travel"],
      gotra: "Kashyap", preferences: { minAge: 26, maxAge: 34, religion: "Hindu", location: "Mumbai" },
    });
    const result = calculateCompatibility(seeker, candidate);
    expect(result.score).toBe(100);
  });


  it("returns 0 for caste/gotra when same gotra", () => {
    const seeker = makeProfile({ uid: "seeker", gotra: "Bharadwaj" });
    const candidate = makeProfile({ uid: "candidate", gotra: "Bharadwaj" });
    const result = calculateCompatibility(seeker, candidate);
    expect(result.breakdown.casteGotra).toBe(0);
  });


  it("penalizes age outside preference range", () => {
    const seeker = makeProfile({ uid: "seeker", preferences: { minAge: 24, maxAge: 28, religion: "Any", location: "Any" } });
    const candidate = makeProfile({ uid: "candidate", age: 35 });
    const result = calculateCompatibility(seeker, candidate);
    expect(result.breakdown.age).toBeLessThan(50);
  });


  it("gives full score for religion when preference is Any", () => {
    const seeker = makeProfile({ uid: "seeker", religion: "Hindu", preferences: { minAge: 20, maxAge: 40, religion: "Any", location: "Any" } });
    const candidate = makeProfile({ uid: "candidate", religion: "Muslim" });
    const result = calculateCompatibility(seeker, candidate);
    expect(result.breakdown.religion).toBe(100);
  });


  it("gives 0 for religion mismatch", () => {
    const seeker = makeProfile({ uid: "seeker", preferences: { minAge: 20, maxAge: 40, religion: "Hindu", location: "Any" } });
    const candidate = makeProfile({ uid: "candidate", religion: "Muslim" });
    const result = calculateCompatibility(seeker, candidate);
    expect(result.breakdown.religion).toBe(0);
  });


  it("calculates hobby overlap correctly", () => {
    const seeker = makeProfile({ uid: "seeker", hobbies: ["reading", "cooking", "travel", "music"], preferences: { minAge: 20, maxAge: 40, religion: "Any", location: "Any" } });
    const candidate = makeProfile({ uid: "candidate", hobbies: ["reading", "cooking", "gym"] });
    const result = calculateCompatibility(seeker, candidate);
    expect(result.breakdown.hobbies).toBe(50);
  });


  it("gives partial location score for same state", () => {
    const seeker = makeProfile({ uid: "seeker", location: "Pune, Maharashtra", preferences: { minAge: 20, maxAge: 40, religion: "Any", location: "Maharashtra" } });
    const candidate = makeProfile({ uid: "candidate", location: "Mumbai, Maharashtra" });
    const result = calculateCompatibility(seeker, candidate);
    expect(result.breakdown.location).toBe(75);
  });
});

